-- AlterTable
ALTER TABLE "flower_reviews" ADD COLUMN "complexiteAromeScore" REAL;
ALTER TABLE "flower_reviews" ADD COLUMN "cultureMode" TEXT;
ALTER TABLE "flower_reviews" ADD COLUMN "cultureSpaceType" TEXT;
ALTER TABLE "flower_reviews" ADD COLUMN "cultureSubstrat" TEXT;
ALTER TABLE "flower_reviews" ADD COLUMN "cultureTimelineConfig" TEXT;
ALTER TABLE "flower_reviews" ADD COLUMN "cultureTimelineData" TEXT;
ALTER TABLE "flower_reviews" ADD COLUMN "curingHumidity" REAL;
ALTER TABLE "flower_reviews" ADD COLUMN "curingTemperature" REAL;
ALTER TABLE "flower_reviews" ADD COLUMN "curingTimelineConfig" TEXT;
ALTER TABLE "flower_reviews" ADD COLUMN "curingTimelineData" TEXT;
ALTER TABLE "flower_reviews" ADD COLUMN "fideliteAromeScore" REAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT,
    "googleId" TEXT,
    "appleId" TEXT,
    "amazonId" TEXT,
    "facebookId" TEXT,
    "username" TEXT NOT NULL,
    "discriminator" TEXT,
    "avatar" TEXT,
    "email" TEXT,
    "passwordHash" TEXT,
    "emailBackup" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT,
    "lastName" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "publicProfile" BOOLEAN NOT NULL DEFAULT true,
    "birthdate" DATETIME,
    "country" TEXT,
    "region" TEXT,
    "legalAge" BOOLEAN NOT NULL DEFAULT false,
    "consentRDR" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" DATETIME,
    "roles" TEXT NOT NULL DEFAULT '{"roles":["consumer"]}',
    "accountType" TEXT NOT NULL DEFAULT 'consumer',
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" DATETIME,
    "banReason" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "theme" TEXT NOT NULL DEFAULT 'violet-lean',
    "defaultExportTemplate" TEXT,
    "subscriptionType" TEXT,
    "subscriptionStart" DATETIME,
    "subscriptionEnd" DATETIME,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'inactive',
    "dailyExportsUsed" INTEGER NOT NULL DEFAULT 0,
    "dailyExportsReset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kycStatus" TEXT,
    "kycDocuments" TEXT,
    "kycVerifiedAt" DATETIME,
    "kycRejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("accountType", "amazonId", "appleId", "avatar", "banReason", "bannedAt", "birthdate", "consentDate", "consentRDR", "country", "createdAt", "dailyExportsReset", "dailyExportsUsed", "defaultExportTemplate", "discordId", "discriminator", "email", "emailBackup", "emailVerified", "facebookId", "googleId", "id", "isBanned", "kycDocuments", "kycRejectionReason", "kycStatus", "kycVerifiedAt", "legalAge", "locale", "passwordHash", "region", "roles", "subscriptionEnd", "subscriptionStart", "subscriptionStatus", "subscriptionType", "theme", "totpEnabled", "totpSecret", "updatedAt", "username") SELECT "accountType", "amazonId", "appleId", "avatar", "banReason", "bannedAt", "birthdate", "consentDate", "consentRDR", "country", "createdAt", "dailyExportsReset", "dailyExportsUsed", "defaultExportTemplate", "discordId", "discriminator", "email", "emailBackup", "emailVerified", "facebookId", "googleId", "id", "isBanned", "kycDocuments", "kycRejectionReason", "kycStatus", "kycVerifiedAt", "legalAge", "locale", "passwordHash", "region", "roles", "subscriptionEnd", "subscriptionStart", "subscriptionStatus", "subscriptionType", "theme", "totpEnabled", "totpSecret", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_discordId_key" ON "users"("discordId");
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
CREATE UNIQUE INDEX "users_appleId_key" ON "users"("appleId");
CREATE UNIQUE INDEX "users_amazonId_key" ON "users"("amazonId");
CREATE UNIQUE INDEX "users_facebookId_key" ON "users"("facebookId");
CREATE UNIQUE INDEX "users_emailBackup_key" ON "users"("emailBackup");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_discordId_idx" ON "users"("discordId");
CREATE INDEX "users_googleId_idx" ON "users"("googleId");
CREATE INDEX "users_appleId_idx" ON "users"("appleId");
CREATE INDEX "users_emailBackup_idx" ON "users"("emailBackup");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
