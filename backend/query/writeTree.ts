import { Poseidon, Tree } from "@personaelabs/spartan-ecdsa";
import { PrismaClient } from "@prisma/client";
import { QueryResultRecord } from "@flipsidecrypto/sdk";

const poseidon = new Poseidon();
const prisma = new PrismaClient();

export async function buildTree(data: QueryResultRecord[]): Promise<{kvData:{ address: any; balance: any; }[], kvHashes: bigint[], tree: Tree}>  {
  const kvData = data.map((i: { [x: string]: any; }) => ({address: i["user_address"], balance: i["usd_value_now"]}));

  // Init the Poseidon hash
  const poseidon = new Poseidon();
  await poseidon.initWasm();
  const treeDepth = 20; // Provided circuits have tree depth = 20
  const tree = new Tree(treeDepth, poseidon);

  // Hash tree + Insert into tree
  const kvHashes: bigint[] = [];
  for (let i = 0; i < kvData.length; i++) {
    const hashedKV = poseidon.hash([
      BigInt(kvData[i].address), 
      BigInt(Math.floor(kvData[i].balance))
    ]);
    tree.insert(hashedKV);
    kvHashes.push(hashedKV);
  }
  return {kvData, kvHashes, tree}
}

// todo: setup chron job
// todo: how do we include multiple trees for blockheight + asset types + benchmark?
export async function writeTree(kvData: {address: string, balance: number}[], kvHashes: bigint[], tree: Tree) {
  await prisma.tree.upsert({
    where: {
      root: `0x${tree.root().toString(16)}`
    },
    update: {},
    create: {
      root: `0x${tree.root().toString(16)}`
    }
  });

  await prisma.treeNode.createMany({
    data: kvData.map((account: { address: any; balance: number; }, i: number ) => {
      const index = tree.indexOf(kvHashes[i]);
      const merkleProof = tree.createProof(index);
      return {
        address: account.address,
        balance: Math.floor(account.balance),
        path: merkleProof.siblings.map(s => BigInt(s[0]).toString(16)),
        indices: merkleProof.pathIndices.map(i => i.toString()),
        root: `0x${tree.root().toString(16)}`
      };
    }),
    skipDuplicates: true
  });
  console.log(await prisma.treeNode.findFirst())
}