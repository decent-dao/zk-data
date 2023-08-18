import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../prisma-client'

// Return all members of a group
const handleGetLatestGroup = async (req: NextApiRequest, res: NextApiResponse) => {
  const latestTree = await prisma.tree.findFirst({
    select: {
      root: true,
    },
  });

  if (!latestTree) {
    res.status(404).send('No tree found');
    return;
  }

  const treeNodes = await prisma.treeNode.findMany({
    select: {
      address: true,
      balance: true,
      path: true,
      indices: true,
    },
    where: {
      root: latestTree.root,
    }
  });

  res.send({
    root: latestTree.root,
    members: treeNodes,
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetLatestGroup(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}