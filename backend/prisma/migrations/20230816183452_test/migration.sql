/*
  Warnings:

  - Added the required column `blance` to the `TreeNode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TreeNode" ADD COLUMN     "blance" INTEGER NOT NULL;
