import { getUserBalances } from "./flipside";
import { buildTree, writeTree } from "./writeTree"

const run = async () => {
  const timerStart = Date.now();
  console.time("Create Merkle tree");
  const [data, error] = await getUserBalances();
  console.timeEnd("Create Merkle tree");
  if(!data) return;
  console.time("Insert Merkle tree");
  const {kvData, kvHashes, tree} = await buildTree(data);
  console.time("Insert Merkle tree");
  await writeTree(kvData, kvHashes, tree);
  const timerEnd = Date.now();

  const took = (timerEnd - timerStart) / 1000;
  console.log(`Done in ${took} seconds`);
};

run();
