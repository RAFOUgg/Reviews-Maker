-- AlterTable
ALTER TABLE "cultivars" ADD COLUMN "cbdMax" REAL;
ALTER TABLE "cultivars" ADD COLUMN "cbdMin" REAL;
ALTER TABLE "cultivars" ADD COLUMN "cbdSource" TEXT;
ALTER TABLE "cultivars" ADD COLUMN "floweringMaxWeeks" INTEGER;
ALTER TABLE "cultivars" ADD COLUMN "floweringMinWeeks" INTEGER;
ALTER TABLE "cultivars" ADD COLUMN "labReportUrl" TEXT;
ALTER TABLE "cultivars" ADD COLUMN "tags" TEXT;
ALTER TABLE "cultivars" ADD COLUMN "thcMax" REAL;
ALTER TABLE "cultivars" ADD COLUMN "thcMin" REAL;
ALTER TABLE "cultivars" ADD COLUMN "thcSource" TEXT;
ALTER TABLE "cultivars" ADD COLUMN "yieldUnit" TEXT;
ALTER TABLE "cultivars" ADD COLUMN "yieldValue" REAL;
