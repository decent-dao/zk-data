// import dotenv from "dotenv";
// dotenv.config();
import fileSystem from 'fs'
import JSONStream from "JSONStream"
import { PrismaClient } from "@prisma/client";
import { buildTree, writeTree } from "../query/writeTree";
import zlib from 'zlib'

const prisma = new PrismaClient();

// Just used to quickly generate a random address-like string for testing
function randomString() {
  const hex = "0123456789abcdef";
  let address = "0x";
  for (let i = 0; i < 40; i++) {
    address += hex[Math.floor(Math.random() * 16)];
  }
  return address;
}

const treeDataSize = async () => {
    let data: {
    address: string;
    balance: number;
    path: string[];
    indices: string[]
    }[] = [];
    for (let i = 0; i<1000000; i++) {
        data.push({
            address: randomString(),
            balance: Math.floor(Math.random() * 10000000),
            path: [
                '838ca1bc1d26f4aa58dc8aa826e0dbb87b71e61ef5d5465e6bdeb3c06daf77fa',
                'c1f7a0d3e6ca4067f32675bb1f6cb478799cac38c56bc1700add3255135477f',
                '9321447b149965ec645e2b14de380e39190a737cb4a775ac1959c33cd6dfde0e',
                'f817c5460ce820f2057779c26d9febab959b9b5418f502794618f68d00c7cfb6',
                '6120d56d7ed839791ea49da539dfbe1bf817e5428cc73a6dfed02ed333e81d78',
                '9f53e51f789816a3d4bbb6155eb20c0b31a293c3a7270fa069433b68229e0379',
                'ee8f027fa218cea3efbec50540608088c3b598382449d85b324519405bef3bda',
                '7107c84987656833c9bbfd77f50282010c5b9a520505260cb87f308323effe7b',
                'b5e160b0f33f6cc9ade6e7f1b1542364e0c3aa75d7363c8dd14404358e96f11e',
                'e27032ee6f314ccbeaebe9a01c0fff70fc14c8f65ccb2b5ececfea4f1b5e8e43',
                '842132ea0ee012c3415e38cadf1154955bd0e291a650cca0b33b332f1d75edf0',
                '1a0371530e9725b7de7ccb834d034630b851c1122766634c2d7a3daa7a40d5dc',
                '828767c25068af5a5947c18015f52080f9bbec0180b96f300f92854c3dc85de8',
                '5076c02c1f27d19b4413e39cd7414e88ea69d11aac0302d49986a5be2ea524ad',
                'a95dde192c22060ad5bbe12c70da154cb66511e61a7b5e0cd24c5b853e99562c',
                'b904b869f27acfe9c52878b7918d890e2c8f4f2aaea48754a7e12cc2627130b3',
                '6bac9cd3dada66e2d6dd202650813bdd960fe829d62850560d036334822f98b5',
                '3bf0ae00b711562c9d3f02042bb6ccd8c23e2b96fe949b866af99818330549bc',
                'e41425186f981d2c7ad14764f85ac7dee7c96fa8383331fc166a6e9e9972fcdd',
                '29bffd738afbd6fb5cc63471d9950e8790e64351b9e62fdcc7ae82aed49d960c'
                ],
                indices: [
                '0', '0', '1', '0', '0',
                '0', '0', '0', '0', '0',
                '0', '0', '0', '0', '0',
                '0', '0', '0', '0', '0'
                ]
        })
    }
    
    let transformStream = JSONStream.stringify();
    let outputStream = fileSystem.createWriteStream( __dirname + "/data.gz" );
    transformStream.pipe(zlib.createGzip()).pipe( outputStream );    
    // @ts-ignore
    data.forEach( transformStream.write );
    transformStream.end();
    
    outputStream.on(
        "finish",
        function handleFinish() {
            fileSystem.createReadStream(__dirname + "/data.gz")
            .pipe(zlib.createGunzip())
            .pipe(fileSystem.createWriteStream(__dirname + "/data.json"))
            .on('finish', () => console.log('wooh!'));
        }
    );
}

const createLeaf = async () => {
  let dataRecords: {
    user_address: string;
    usd_value_now: number;
    __row_index: number;
    }[] = [];
    for (let i = 0; i<100; i++) {
        dataRecords.push({
            user_address: randomString(),
            usd_value_now: Math.floor(Math.random() * 10000000),
            __row_index: i
        })
    }
    const {kvData, kvHashes, tree} = await buildTree(dataRecords)
    await writeTree(kvData, kvHashes, tree)

  console.log("Created tree nodes:");
}

// async function createGroup() {
//   const newGroupData = {
//     merkleRoot: randomString(),
//     name: "test",
//     threshold: 0,
//     erc20Addresses: [],
//     createdAt: new Date(),
//   };

//   const group = await prisma.group.create({
//     data: newGroupData,
//   });

//   console.log("Created group:");
//   console.log({ group });
//   console.log("");
// }

treeDataSize();
// createGroup();