-- CreateTable
CREATE TABLE "export_configurations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reviewId" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Ma Configuration',
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "templateName" TEXT NOT NULL DEFAULT 'modernCompact',
    "format" TEXT NOT NULL DEFAULT '1:1',
    "ratio" TEXT NOT NULL DEFAULT '1:1',
    "colors" TEXT NOT NULL,
    "typography" TEXT NOT NULL,
    "contentModules" TEXT NOT NULL,
    "watermark" TEXT,
    "branding" TEXT,
    "imageSettings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastUsedAt" DATETIME,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "export_configurations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "export_configurations_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "export_configurations_userId_idx" ON "export_configurations"("userId");

-- CreateIndex
CREATE INDEX "export_configurations_reviewId_idx" ON "export_configurations"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "export_configurations_userId_name_key" ON "export_configurations"("userId", "name");
