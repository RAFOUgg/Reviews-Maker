-- CreateTable
CREATE TABLE "projects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_presets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "pipelineType" TEXT,
    "emoji" TEXT,
    "tags" TEXT,
    "projectId" INTEGER,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "data" TEXT NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_presets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_presets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_user_presets" ("createdAt", "data", "description", "id", "name", "pipelineType", "type", "updatedAt", "useCount", "userId") SELECT "createdAt", "data", "description", "id", "name", "pipelineType", "type", "updatedAt", "useCount", "userId" FROM "user_presets";
DROP TABLE "user_presets";
ALTER TABLE "new_user_presets" RENAME TO "user_presets";
CREATE INDEX "user_presets_userId_idx" ON "user_presets"("userId");
CREATE INDEX "user_presets_userId_type_pipelineType_idx" ON "user_presets"("userId", "type", "pipelineType");
CREATE INDEX "user_presets_userId_projectId_idx" ON "user_presets"("userId", "projectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");
