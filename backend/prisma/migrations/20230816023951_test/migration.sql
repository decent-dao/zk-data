/*
  Warnings:

  - The primary key for the `Tree` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `balance` on the `TreeNode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[root]` on the table `Tree` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[address,root]` on the table `TreeNode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `root` to the `TreeNode` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HashScheme" AS ENUM ('Keccak256');

-- DropIndex
DROP INDEX "TreeNode_type_address_key";

-- AlterTable
ALTER TABLE "Tree" DROP CONSTRAINT "Tree_pkey";

-- AlterTable
ALTER TABLE "TreeNode" DROP COLUMN "balance",
ADD COLUMN     "root" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tree_root_key" ON "Tree"("root");

-- CreateIndex
CREATE UNIQUE INDEX "TreeNode_address_root_key" ON "TreeNode"("address", "root");
