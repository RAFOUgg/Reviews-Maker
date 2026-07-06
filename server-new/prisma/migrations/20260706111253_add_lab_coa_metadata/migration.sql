-- AlterTable
ALTER TABLE "concentrate_reviews" ADD COLUMN "labAccreditationStandard" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "labAccredited" BOOLEAN;
ALTER TABLE "concentrate_reviews" ADD COLUMN "labAnalysisDate" DATETIME;
ALTER TABLE "concentrate_reviews" ADD COLUMN "labMethod" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "labName" TEXT;

-- AlterTable
ALTER TABLE "cultivars" ADD COLUMN "labAccreditationStandard" TEXT;
ALTER TABLE "cultivars" ADD COLUMN "labAccredited" BOOLEAN;
ALTER TABLE "cultivars" ADD COLUMN "labAnalysisDate" DATETIME;
ALTER TABLE "cultivars" ADD COLUMN "labMethod" TEXT;
ALTER TABLE "cultivars" ADD COLUMN "labName" TEXT;

-- AlterTable
ALTER TABLE "flower_reviews" ADD COLUMN "labAccreditationStandard" TEXT;
ALTER TABLE "flower_reviews" ADD COLUMN "labAccredited" BOOLEAN;
ALTER TABLE "flower_reviews" ADD COLUMN "labAnalysisDate" DATETIME;
ALTER TABLE "flower_reviews" ADD COLUMN "labMethod" TEXT;
ALTER TABLE "flower_reviews" ADD COLUMN "labName" TEXT;

-- AlterTable
ALTER TABLE "hash_reviews" ADD COLUMN "labAccreditationStandard" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "labAccredited" BOOLEAN;
ALTER TABLE "hash_reviews" ADD COLUMN "labAnalysisDate" DATETIME;
ALTER TABLE "hash_reviews" ADD COLUMN "labMethod" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "labName" TEXT;
