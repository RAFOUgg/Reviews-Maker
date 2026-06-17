-- AlterTable
ALTER TABLE "concentrate_reviews" ADD COLUMN "cbcPercent" REAL;
ALTER TABLE "concentrate_reviews" ADD COLUMN "cbdPercent" REAL;
ALTER TABLE "concentrate_reviews" ADD COLUMN "cbgPercent" REAL;
ALTER TABLE "concentrate_reviews" ADD COLUMN "cbnPercent" REAL;
ALTER TABLE "concentrate_reviews" ADD COLUMN "labReportUrl" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "otherCannabinoids" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "terpeneFileUrl" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "terpeneProfile" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "thcPercent" REAL;
ALTER TABLE "concentrate_reviews" ADD COLUMN "thcvPercent" REAL;

-- AlterTable
ALTER TABLE "hash_reviews" ADD COLUMN "cbcPercent" REAL;
ALTER TABLE "hash_reviews" ADD COLUMN "cbdPercent" REAL;
ALTER TABLE "hash_reviews" ADD COLUMN "cbgPercent" REAL;
ALTER TABLE "hash_reviews" ADD COLUMN "cbnPercent" REAL;
ALTER TABLE "hash_reviews" ADD COLUMN "labReportUrl" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "otherCannabinoids" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "terpeneFileUrl" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "terpeneProfile" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "thcPercent" REAL;
ALTER TABLE "hash_reviews" ADD COLUMN "thcvPercent" REAL;
