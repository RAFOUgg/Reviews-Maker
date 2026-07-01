-- AlterTable
ALTER TABLE "concentrate_reviews" ADD COLUMN "couleurNuancier" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "curingHumidity" REAL;
ALTER TABLE "concentrate_reviews" ADD COLUMN "curingTemperature" REAL;
ALTER TABLE "concentrate_reviews" ADD COLUMN "curingTimelineConfig" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "curingTimelineData" TEXT;

-- AlterTable
ALTER TABLE "hash_reviews" ADD COLUMN "couleurNuancier" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "curingHumidity" REAL;
ALTER TABLE "hash_reviews" ADD COLUMN "curingTemperature" REAL;
ALTER TABLE "hash_reviews" ADD COLUMN "curingTimelineConfig" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "curingTimelineData" TEXT;
