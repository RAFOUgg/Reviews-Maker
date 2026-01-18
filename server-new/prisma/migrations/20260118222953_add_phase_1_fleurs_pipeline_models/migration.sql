-- CreateTable
CREATE TABLE "culture_setups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "group" TEXT NOT NULL,
    "productType" TEXT NOT NULL DEFAULT 'fleurs',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "usedInReviews" TEXT NOT NULL DEFAULT '[]',
    "personalRating" INTEGER,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "culture_setups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pipelines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "phases" TEXT NOT NULL DEFAULT '[]',
    "activeSetups" TEXT NOT NULL DEFAULT '[]',
    "notesGenerales" TEXT,
    "durationDays" INTEGER,
    "totalEvents" INTEGER NOT NULL DEFAULT 0,
    "completionPercent" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pipelines_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pipeline_stages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipelineId" TEXT NOT NULL,
    "intervalLabel" TEXT NOT NULL,
    "scheduledDate" DATETIME,
    "dayNumber" INTEGER,
    "weekNumber" INTEGER,
    "phaseNumber" INTEGER,
    "cultureSetupId" TEXT,
    "eventType" TEXT,
    "eventData" TEXT,
    "observations" TEXT,
    "photoUrl" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "completedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pipeline_stages_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "pipelines" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pipeline_stages_cultureSetupId_fkey" FOREIGN KEY ("cultureSetupId") REFERENCES "culture_setups" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "culture_setups_userId_idx" ON "culture_setups"("userId");

-- CreateIndex
CREATE INDEX "culture_setups_group_idx" ON "culture_setups"("group");

-- CreateIndex
CREATE UNIQUE INDEX "culture_setups_userId_group_name_key" ON "culture_setups"("userId", "group", "name");

-- CreateIndex
CREATE UNIQUE INDEX "pipelines_reviewId_key" ON "pipelines"("reviewId");

-- CreateIndex
CREATE INDEX "pipelines_reviewId_idx" ON "pipelines"("reviewId");

-- CreateIndex
CREATE INDEX "pipeline_stages_pipelineId_idx" ON "pipeline_stages"("pipelineId");

-- CreateIndex
CREATE INDEX "pipeline_stages_cultureSetupId_idx" ON "pipeline_stages"("cultureSetupId");

-- CreateIndex
CREATE INDEX "pipeline_stages_scheduledDate_idx" ON "pipeline_stages"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "pipeline_stages_pipelineId_intervalLabel_key" ON "pipeline_stages"("pipelineId", "intervalLabel");
