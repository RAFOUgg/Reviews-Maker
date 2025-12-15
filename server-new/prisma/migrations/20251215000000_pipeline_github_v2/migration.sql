-- CreateTable
CREATE TABLE IF NOT EXISTS "pipeline_github" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "pipelineType" TEXT NOT NULL,
    "intervalType" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "curingType" TEXT,
    "curingDuration" INTEGER,
    "cells" TEXT NOT NULL,
    "totalCells" INTEGER NOT NULL DEFAULT 0,
    "filledCells" INTEGER NOT NULL DEFAULT 0,
    "completionRate" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "pipeline_github_reviewId_pipelineType_idx" ON "pipeline_github"("reviewId", "pipelineType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "pipeline_github_reviewType_idx" ON "pipeline_github"("reviewType");

-- AlterTable FlowerReview - Add pipeline GitHub fields
ALTER TABLE "flower_reviews" ADD COLUMN "culturePipelineGithubId" TEXT;
ALTER TABLE "flower_reviews" ADD COLUMN "curingPipelineGithubId" TEXT;

-- AlterTable HashReview - Add pipeline GitHub fields  
ALTER TABLE "hash_reviews" ADD COLUMN "separationPipelineGithubId" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "purificationPipelineGithubId" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "curingPipelineGithubId" TEXT;

-- AlterTable ConcentrateReview - Add pipeline GitHub fields
ALTER TABLE "concentrate_reviews" ADD COLUMN "extractionPipelineGithubId" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "purificationPipelineGithubIdConcentrate" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "curingPipelineGithubIdConcentrate" TEXT;

-- AlterTable EdibleReview - Add pipeline GitHub field
ALTER TABLE "edible_reviews" ADD COLUMN "recipePipelineGithubId" TEXT;
