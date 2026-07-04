-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chain_nodes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chainId" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "reviewId" TEXT,
    "label" TEXT NOT NULL,
    "image" TEXT,
    "position" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#10b981',
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
