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
    "media" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "chain_edges_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "production_chains" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chain_edges_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "chain_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chain_edges_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "chain_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_chain_edges" ("cellData", "chainId", "createdAt", "date", "id", "notes", "sourceHandle", "sourceNodeId", "targetHandle", "targetNodeId", "technique", "updatedAt", "waypointX", "waypointY") SELECT "cellData", "chainId", "createdAt", "date", "id", "notes", "sourceHandle", "sourceNodeId", "targetHandle", "targetNodeId", "technique", "updatedAt", "waypointX", "waypointY" FROM "chain_edges";
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
    "media" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "chain_nodes_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "production_chains" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_chain_nodes" ("cellData", "chainId", "color", "createdAt", "id", "image", "label", "position", "reviewId", "reviewType", "updatedAt") SELECT "cellData", "chainId", "color", "createdAt", "id", "image", "label", "position", "reviewId", "reviewType", "updatedAt" FROM "chain_nodes";
DROP TABLE "chain_nodes";
ALTER TABLE "new_chain_nodes" RENAME TO "chain_nodes";
CREATE INDEX "chain_nodes_chainId_idx" ON "chain_nodes"("chainId");
CREATE INDEX "chain_nodes_reviewType_reviewId_idx" ON "chain_nodes"("reviewType", "reviewId");
CREATE UNIQUE INDEX "chain_nodes_chainId_reviewType_reviewId_key" ON "chain_nodes"("chainId", "reviewType", "reviewId");
CREATE TABLE "new_gen_edges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treeId" TEXT NOT NULL,
    "parentNodeId" TEXT NOT NULL,
    "childNodeId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL DEFAULT 'parent',
    "pollinationMethod" TEXT,
    "notes" TEXT,
    "waypointX" REAL,
    "waypointY" REAL,
    "sourceHandle" TEXT,
    "targetHandle" TEXT,
    "media" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "gen_edges_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "genetic_trees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "gen_edges_parentNodeId_fkey" FOREIGN KEY ("parentNodeId") REFERENCES "gen_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "gen_edges_childNodeId_fkey" FOREIGN KEY ("childNodeId") REFERENCES "gen_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_gen_edges" ("childNodeId", "createdAt", "id", "notes", "parentNodeId", "pollinationMethod", "relationshipType", "sourceHandle", "targetHandle", "treeId", "updatedAt", "waypointX", "waypointY") SELECT "childNodeId", "createdAt", "id", "notes", "parentNodeId", "pollinationMethod", "relationshipType", "sourceHandle", "targetHandle", "treeId", "updatedAt", "waypointX", "waypointY" FROM "gen_edges";
DROP TABLE "gen_edges";
ALTER TABLE "new_gen_edges" RENAME TO "gen_edges";
CREATE INDEX "gen_edges_treeId_idx" ON "gen_edges"("treeId");
CREATE INDEX "gen_edges_parentNodeId_idx" ON "gen_edges"("parentNodeId");
CREATE INDEX "gen_edges_childNodeId_idx" ON "gen_edges"("childNodeId");
CREATE UNIQUE INDEX "gen_edges_parentNodeId_childNodeId_relationshipType_key" ON "gen_edges"("parentNodeId", "childNodeId", "relationshipType");
CREATE TABLE "new_gen_nodes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treeId" TEXT NOT NULL,
    "cultivarId" TEXT,
    "cultivarName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#FF6B9D',
    "image" TEXT,
    "genetics" TEXT,
    "notes" TEXT,
    "sourceReviewId" TEXT,
    "media" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "gen_nodes_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "genetic_trees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "gen_nodes_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "cultivars" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_gen_nodes" ("color", "createdAt", "cultivarId", "cultivarName", "genetics", "id", "image", "notes", "position", "sourceReviewId", "treeId", "updatedAt") SELECT "color", "createdAt", "cultivarId", "cultivarName", "genetics", "id", "image", "notes", "position", "sourceReviewId", "treeId", "updatedAt" FROM "gen_nodes";
DROP TABLE "gen_nodes";
ALTER TABLE "new_gen_nodes" RENAME TO "gen_nodes";
CREATE INDEX "gen_nodes_treeId_idx" ON "gen_nodes"("treeId");
CREATE INDEX "gen_nodes_cultivarId_idx" ON "gen_nodes"("cultivarId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
