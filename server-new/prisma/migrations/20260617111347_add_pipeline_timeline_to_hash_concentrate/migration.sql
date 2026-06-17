-- AlterTable
ALTER TABLE "concentrate_reviews" ADD COLUMN "extractionTimelineConfig" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "extractionTimelineData" TEXT;

-- AlterTable
ALTER TABLE "hash_reviews" ADD COLUMN "separationTimelineConfig" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "separationTimelineData" TEXT;
