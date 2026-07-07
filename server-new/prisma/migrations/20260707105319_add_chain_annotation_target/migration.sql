-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chain_annotations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chainId" TEXT NOT NULL,
    "nodeId" TEXT,
    "edgeId" TEXT,
    "position" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '[]',
    "sourceLabel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "chain_annotations_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "production_chains" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chain_annotations_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "chain_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chain_annotations_edgeId_fkey" FOREIGN KEY ("edgeId") REFERENCES "chain_edges" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_chain_annotations" ("body", "chainId", "createdAt", "id", "position", "sourceLabel", "title", "updatedAt") SELECT "body", "chainId", "createdAt", "id", "position", "sourceLabel", "title", "updatedAt" FROM "chain_annotations";
DROP TABLE "chain_annotations";
ALTER TABLE "new_chain_annotations" RENAME TO "chain_annotations";
CREATE INDEX "chain_annotations_chainId_idx" ON "chain_annotations"("chainId");
CREATE INDEX "chain_annotations_nodeId_idx" ON "chain_annotations"("nodeId");
CREATE INDEX "chain_annotations_edgeId_idx" ON "chain_annotations"("edgeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
