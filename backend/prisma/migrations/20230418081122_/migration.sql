-- CreateTable
CREATE TABLE "TreeNode" (
    "address" TEXT NOT NULL,
    "balance" BIGINT,
    "path" TEXT[],
    "indices" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Tree" (
    "root" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tree_pkey" PRIMARY KEY ("root")
);

-- CreateIndex
CREATE UNIQUE INDEX "TreeNode_type_address_key" ON "TreeNode"("address");