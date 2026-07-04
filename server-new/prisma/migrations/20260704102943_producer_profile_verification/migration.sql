-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_producer_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL DEFAULT 'farm',
    "siret" TEXT,
    "ein" TEXT,
    "country" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "verificationDoc" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'none',
    "verificationRejectionReason" TEXT,
    "sireneSnapshot" TEXT,
    "sireneCheckedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "producer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_producer_profiles" ("companyName", "country", "createdAt", "ein", "id", "isVerified", "siret", "updatedAt", "userId", "verificationDoc", "verifiedAt") SELECT "companyName", "country", "createdAt", "ein", "id", "isVerified", "siret", "updatedAt", "userId", "verificationDoc", "verifiedAt" FROM "producer_profiles";
DROP TABLE "producer_profiles";
ALTER TABLE "new_producer_profiles" RENAME TO "producer_profiles";
CREATE UNIQUE INDEX "producer_profiles_userId_key" ON "producer_profiles"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
