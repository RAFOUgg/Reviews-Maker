-- AlterTable
ALTER TABLE "producer_profiles" ADD COLUMN "addressLine" TEXT;
ALTER TABLE "producer_profiles" ADD COLUMN "city" TEXT;
ALTER TABLE "producer_profiles" ADD COLUMN "legalForm" TEXT;
ALTER TABLE "producer_profiles" ADD COLUMN "legalFormCode" TEXT;
ALTER TABLE "producer_profiles" ADD COLUMN "legalRepresentative" TEXT;
ALTER TABLE "producer_profiles" ADD COLUMN "licenseNumber" TEXT;
ALTER TABLE "producer_profiles" ADD COLUMN "nafCode" TEXT;
ALTER TABLE "producer_profiles" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "producer_profiles" ADD COLUMN "rcsCity" TEXT;
ALTER TABLE "producer_profiles" ADD COLUMN "registeredAt" DATETIME;
ALTER TABLE "producer_profiles" ADD COLUMN "shareCapital" TEXT;
ALTER TABLE "producer_profiles" ADD COLUMN "siren" TEXT;
ALTER TABLE "producer_profiles" ADD COLUMN "vatNumber" TEXT;

