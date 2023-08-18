import request, { Response } from 'supertest';
import treeHandler from '../api/latest';
import {buildTree} from '../../backend/query/writeTree'
import { apiResolver } from 'next/dist/server/api-utils/node';
import { NextApiHandler } from 'next';
import { createServer, RequestListener } from 'http';
import { prismaMock } from '../prisma.mock';
import { ecsign, privateToAddress, toCompactSig, pubToAddress } from '@ethereumjs/util';
import { MerkleProof, Tree } from "@personaelabs/spartan-ecdsa";
import { getPubKeyFromEIP712Sig, PrefixedHex, toTypedContent, eip712MsgHash } from '../client-utils';
export const INVALID_MERKLE_ROOT = 'Invalid merkle root!';
import prisma from '../prisma-client'
import { Content } from '../types';
import { _TypedDataEncoder } from "ethers/lib/utils";

// Create a supertest client from the Next.js API route handler
const createTestClient = (handler: NextApiHandler, query: { [key: string]: string | number }) => {
  const listener: RequestListener = (req, res) => {
    return apiResolver(
      req,
      res,
      query,
      handler,
      {
        previewModeEncryptionKey: '',
        previewModeId: '',
        previewModeSigningKey: '',
      },
      false,
    );
  };

  return request(createServer(listener));
};

const expectStatusWithObject = (
  res: Response,
  status: number,
  returnObject?: { [key: string]: string | number },
) => {
  if (res.status !== status) {
    console.log(res.body);
  }
  expect(res.status).toBe(status);
  if (returnObject) {
    expect(res.body).toMatchObject(returnObject);
  }
};

const mockCreateTree= (treeRoot: string) => {
  prismaMock.tree.create.mockResolvedValue({root: treeRoot});
};

const mockCreateTreeNode= (kvData: { address: any; balance: any }[], kvHashes: bigint[], tree: Tree) => {
    prismaMock.treeNode.createMany.mockResolvedValue({
        userData: kvData.map((account: { address: any; balance: number; }, i: number ) => {
            const index = tree.indexOf(kvHashes[i]);
            const merkleProof = tree.createProof(index);
            return {
                address: account.address,
                balance: Math.floor(account.balance),
                path: merkleProof.siblings.map(s => BigInt(s[0]).toString(16)),
                indices: merkleProof.pathIndices.map(i => i.toString()),
                root: `0x${tree.root().toString(16)}`
            };
        })
    });
};

const mockFindTreeOnce = (_treeRoot: string) => {
  prismaMock.tree.findFirst.mockResolvedValue({
    root: _treeRoot
  });
};

const mockFindTreeNodeOnce = (address: string, balance: number, merkleProof: MerkleProof, _treeRoot: string) => {
    prismaMock.treeNode.findMany.mockResolvedValue([{
            address: address,
            balance: balance,
            path: merkleProof.siblings.map(s => BigInt(s[0]).toString(16)),
            indices: merkleProof.pathIndices.map(i => i.toString()),
            root: _treeRoot,
            createdAt: new Date()
    }]);
};

describe('Get /api/v1/latest', () => {
    // User Vars
    const privKey = Buffer.from(''.padStart(64, '1'), 'hex');
    let address: string;
    let balance: number;

    // Tree Vars
    let dataRecords: {
        contract_address: string;
        user_address: string;
        usd_value_now: number;
        __row_index: number;
    }[];
    let kvData: {
        address: any;
        balance: any;
    }[]
    let kvHashes: bigint[];
    let treeClient: any;
    let tree: Tree;
    let treeRoot: PrefixedHex;

    // User TreeNode
    let merkleProof: MerkleProof;
    let index: number;

    beforeEach(async () => {
    // Init Variables
        address = `0x${privateToAddress(privKey).toString('hex')}`;;
        balance = 100;
        dataRecords = [{
            contract_address: address,
            user_address: address,
            usd_value_now: balance,
            __row_index: 0
        }]
        const treeData = await buildTree(dataRecords)
        kvData = treeData.kvData;
        kvHashes = treeData.kvHashes;
        tree = treeData.tree;
        treeRoot = `0x${tree.root().toString(16)}`;
        index = tree.indexOf(kvHashes[0]);
        merkleProof = tree.createProof(index);

    // Init API
        prismaMock.tree.findFirst.mockImplementation();
        treeClient = createTestClient(treeHandler, {});
    });

    test('should create new Tree + Tree Node ', async () => {
        mockCreateTree(treeRoot);
        await expect(prisma.tree.create({data: {root: treeRoot}})).resolves.toEqual({
            root: treeRoot
        })
    })

    test('should create Tree Node ', async () => {
        mockCreateTreeNode(kvData, kvHashes, tree)

        await expect(prisma.treeNode.createMany({data: {
                address: address,
                balance: balance,
                path: merkleProof.siblings.map(s => BigInt(s[0]).toString(16)),
                indices: merkleProof.pathIndices.map(i => i.toString()),
                root: `0x${tree.root().toString(16)}`
        }})).resolves.toEqual({
            userData: [{
                address: address,
                balance: balance,
                path: merkleProof.siblings.map(s => BigInt(s[0]).toString(16)),
                indices: merkleProof.pathIndices.map(i => i.toString()),
                root: `0x${tree.root().toString(16)}`
            }]
        })
    })

    it('should return 200 if valid', async () => {
        mockFindTreeOnce(treeRoot)
        mockFindTreeNodeOnce(address, balance, merkleProof, treeRoot)

        const response = await treeClient.get('/latest').send();
        expectStatusWithObject(response, 200);
    });

    it('should verify merkle Proof', async () => {
        mockFindTreeOnce(treeRoot)
        mockFindTreeNodeOnce(address, balance, merkleProof, treeRoot)

        // todo: This is a random msg that should be changed
        // Please do not forget to update content type
        const content: Content = {
            title: "test",
            body: "like",
            timestamp: Math.round(Date.now() / 1000),
            parentId: ('0x0') as PrefixedHex,
            venue: 'nouns',
            groupRoot: `0x${treeRoot}`,
        };

        // Sign Content
        const typedContent = toTypedContent(content);
        const typedContentHash: Buffer = eip712MsgHash(typedContent.domain, typedContent.types, typedContent.value);
        const contentSig = ecsign(typedContentHash, privKey);
        const contentSigStr = toCompactSig(contentSig.v, contentSig.r, contentSig.s);
        
        // Derive Address from signed content
        const userPubKey = getPubKeyFromEIP712Sig(typedContent, contentSigStr);
        const userAddress = `0x${pubToAddress(Buffer.from(userPubKey, 'hex')).toString('hex')}`
        const response = await treeClient.get('/latest').send();

        // Lookup user proof from entire tree
        // todo: Will have to hash 0x+address to submit proof
        const userMerkleProof = response.body.members.find((member: { address: string; }) => member.address === userAddress);
        const proof: MerkleProof = {
        pathIndices: userMerkleProof?.indices,
            // TODO: Figure out why 0x is needed here.
            siblings: userMerkleProof?.path.map((sibling: string) => {
            return [BigInt('0x' + sibling)];
            }),
            root: BigInt(userMerkleProof.root),
        };
        expect(tree.verifyProof(proof, kvHashes[0])).toBe(true);
    });
});
