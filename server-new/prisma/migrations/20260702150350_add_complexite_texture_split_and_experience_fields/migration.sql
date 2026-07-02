-- AlterTable
ALTER TABLE "concentrate_reviews" ADD COLUMN "complexiteAromeScore" REAL;
ALTER TABLE "concentrate_reviews" ADD COLUMN "dosageUnit" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "effectDuration" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "effectOnset" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "preferredUse" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "textureMeltingScore" REAL;
ALTER TABLE "concentrate_reviews" ADD COLUMN "textureResiduScore" REAL;

-- AlterTable
ALTER TABLE "edible_reviews" ADD COLUMN "consumptionMethod" TEXT;
ALTER TABLE "edible_reviews" ADD COLUMN "dosage" REAL;
ALTER TABLE "edible_reviews" ADD COLUMN "dosageUnit" TEXT;
ALTER TABLE "edible_reviews" ADD COLUMN "effectDuration" TEXT;
ALTER TABLE "edible_reviews" ADD COLUMN "effectOnset" TEXT;
ALTER TABLE "edible_reviews" ADD COLUMN "preferredUse" TEXT;

-- AlterTable
ALTER TABLE "hash_reviews" ADD COLUMN "complexiteAromeScore" REAL;
ALTER TABLE "hash_reviews" ADD COLUMN "dosageUnit" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "effectDuration" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "effectOnset" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "preferredUse" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "textureMeltingScore" REAL;
ALTER TABLE "hash_reviews" ADD COLUMN "textureResiduScore" REAL;
