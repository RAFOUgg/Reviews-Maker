-- AlterTable
ALTER TABLE "concentrate_reviews" ADD COLUMN "collantScore" REAL;
ALTER TABLE "concentrate_reviews" ADD COLUMN "concentrateType" TEXT;

-- AlterTable
ALTER TABLE "hash_reviews" ADD COLUMN "collantScore" REAL;
ALTER TABLE "hash_reviews" ADD COLUMN "malleabiliteScore" REAL;
