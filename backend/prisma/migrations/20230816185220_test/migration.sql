/*
  Warnings:

  - You are about to drop the column `blance` on the `TreeNode` table. All the data in the column will be lost.
  - Added the required column `balance` to the `TreeNode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TreeNode" DROP COLUMN "blance",
ADD COLUMN     "balance" INTEGER NOT NULL;
