-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chain_edges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chainId" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "technique" TEXT,
    "date" DATETIME,
    "notes" TEXT,
    "waypointX" REAL,
    "waypointY" REAL,
    "sourceHandle" TEXT,
    "targetHandle" TEXT,
    "cellData" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "chain_edges_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "production_chains" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chain_edges_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "chain_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chain_edges_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "chain_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_chain_edges" ("chainId", "createdAt", "date", "id", "notes", "sourceHandle", "sourceNodeId", "targetHandle", "targetNodeId", "technique", "updatedAt", "waypointX", "waypointY") SELECT "chainId", "createdAt", "date", "id", "notes", "sourceHandle", "sourceNodeId", "targetHandle", "targetNodeId", "technique", "updatedAt", "waypointX", "waypointY" FROM "chain_edges";
DROP TABLE "chain_edges";
ALTER TABLE "new_chain_edges" RENAME TO "chain_edges";
CREATE INDEX "chain_edges_chainId_idx" ON "chain_edges"("chainId");
CREATE INDEX "chain_edges_sourceNodeId_idx" ON "chain_edges"("sourceNodeId");
CREATE INDEX "chain_edges_targetNodeId_idx" ON "chain_edges"("targetNodeId");
CREATE UNIQUE INDEX "chain_edges_sourceNodeId_targetNodeId_key" ON "chain_edges"("sourceNodeId", "targetNodeId");
CREATE TABLE "new_chain_nodes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chainId" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "reviewId" TEXT,
    "label" TEXT NOT NULL,
    "image" TEXT,
    "position" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#10b981',
    "cellData" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "chain_nodes_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "production_chains" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_chain_nodes" ("chainId", "color", "createdAt", "id", "image", "label", "position", "reviewId", "reviewType", "updatedAt") SELECT "chainId", "color", "createdAt", "id", "image", "label", "position", "reviewId", "reviewType", "updatedAt" FROM "chain_nodes";
DROP TABLE "chain_nodes";
ALTER TABLE "new_chain_nodes" RENAME TO "chain_nodes";
CREATE INDEX "chain_nodes_chainId_idx" ON "chain_nodes"("chainId");
CREATE INDEX "chain_nodes_reviewType_reviewId_idx" ON "chain_nodes"("reviewType", "reviewId");
CREATE UNIQUE INDEX "chain_nodes_chainId_reviewType_reviewId_key" ON "chain_nodes"("chainId", "reviewType", "reviewId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
