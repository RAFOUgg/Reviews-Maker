-- AlterTable
ALTER TABLE "chain_annotations" ADD COLUMN "mediaType" TEXT;
ALTER TABLE "chain_annotations" ADD COLUMN "mediaUrl" TEXT;

-- CreateTable
CREATE TABLE "gen_annotations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treeId" TEXT NOT NULL,
    "nodeId" TEXT,
    "edgeId" TEXT,
    "position" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '[]',
    "sourceLabel" TEXT,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "gen_annotations_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "genetic_trees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "gen_annotations_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "gen_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "gen_annotations_edgeId_fkey" FOREIGN KEY ("edgeId") REFERENCES "gen_edges" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "gen_annotations_treeId_idx" ON "gen_annotations"("treeId");

-- CreateIndex
CREATE INDEX "gen_annotations_nodeId_idx" ON "gen_annotations"("nodeId");

-- CreateIndex
CREATE INDEX "gen_annotations_edgeId_idx" ON "gen_annotations"("edgeId");
