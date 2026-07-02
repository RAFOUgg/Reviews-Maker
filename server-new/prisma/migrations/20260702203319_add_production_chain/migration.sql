-- CreateTable
CREATE TABLE "production_chains" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "production_chains_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chain_nodes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chainId" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#10b981',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "chain_nodes_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "production_chains" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chain_edges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chainId" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "technique" TEXT,
    "date" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "chain_edges_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "production_chains" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chain_edges_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "chain_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chain_edges_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "chain_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "production_chains_shareCode_key" ON "production_chains"("shareCode");

-- CreateIndex
CREATE INDEX "production_chains_userId_idx" ON "production_chains"("userId");

-- CreateIndex
CREATE INDEX "production_chains_isPublic_idx" ON "production_chains"("isPublic");

-- CreateIndex
CREATE INDEX "chain_nodes_chainId_idx" ON "chain_nodes"("chainId");

-- CreateIndex
CREATE INDEX "chain_nodes_reviewType_reviewId_idx" ON "chain_nodes"("reviewType", "reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "chain_nodes_chainId_reviewType_reviewId_key" ON "chain_nodes"("chainId", "reviewType", "reviewId");

-- CreateIndex
CREATE INDEX "chain_edges_chainId_idx" ON "chain_edges"("chainId");

-- CreateIndex
CREATE INDEX "chain_edges_sourceNodeId_idx" ON "chain_edges"("sourceNodeId");

-- CreateIndex
CREATE INDEX "chain_edges_targetNodeId_idx" ON "chain_edges"("targetNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "chain_edges_sourceNodeId_targetNodeId_key" ON "chain_edges"("sourceNodeId", "targetNodeId");
