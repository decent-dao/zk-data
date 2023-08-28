import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";

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

async function createLeaf() {
  const newLeafData = {
    address: randomString(),
    usdValue: 0,
    merkleProof: [],
    merkleRoot: "",
    createdAt: new Date(),
  };

  const leaf = await prisma.leaf.create({
    data: newLeafData,
  });

  console.log("Created leaf:");
  console.log({ leaf });
  console.log("");
}

async function createGroup() {
  const newGroupData = {
    merkleRoot: randomString(),
    name: "test",
    threshold: 0,
    erc20Addresses: [],
    createdAt: new Date(),
  };

  const group = await prisma.group.create({
    data: newGroupData,
  });

  console.log("Created group:");
  console.log({ group });
  console.log("");
}

createLeaf();
createGroup();
