-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chain_edges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chainId" TEXT NOT NULL,
    "sourceNodeId" TEXT,
    "sourceAnnotationId" TEXT,
    "targetNodeId" TEXT,
    "targetAnnotationId" TEXT,
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
    CONSTRAINT "chain_edges_sourceAnnotationId_fkey" FOREIGN KEY ("sourceAnnotationId") REFERENCES "chain_annotations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chain_edges_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "chain_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chain_edges_targetAnnotationId_fkey" FOREIGN KEY ("targetAnnotationId") REFERENCES "chain_annotations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_chain_edges" ("cellData", "chainId", "createdAt", "date", "id", "media", "notes", "sourceHandle", "sourceNodeId", "targetHandle", "targetNodeId", "technique", "updatedAt", "waypointX", "waypointY") SELECT "cellData", "chainId", "createdAt", "date", "id", "media", "notes", "sourceHandle", "sourceNodeId", "targetHandle", "targetNodeId", "technique", "updatedAt", "waypointX", "waypointY" FROM "chain_edges";
DROP TABLE "chain_edges";
ALTER TABLE "new_chain_edges" RENAME TO "chain_edges";
CREATE INDEX "chain_edges_chainId_idx" ON "chain_edges"("chainId");
CREATE INDEX "chain_edges_sourceNodeId_idx" ON "chain_edges"("sourceNodeId");
CREATE INDEX "chain_edges_targetNodeId_idx" ON "chain_edges"("targetNodeId");
CREATE INDEX "chain_edges_sourceAnnotationId_idx" ON "chain_edges"("sourceAnnotationId");
CREATE INDEX "chain_edges_targetAnnotationId_idx" ON "chain_edges"("targetAnnotationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
