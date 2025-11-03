/*
  Warnings:

  - You are about to drop the column `indicaPercent` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `mainImageUrl` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `sativaPercent` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `roles` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "holderName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "note" REAL,
    "ratings" TEXT,
    "terpenes" TEXT,
    "tastes" TEXT,
    "aromas" TEXT,
    "effects" TEXT,
    "strainType" TEXT,
    "indicaRatio" INTEGER,
    "images" TEXT,
    "mainImage" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reviews" ("aromas", "authorId", "createdAt", "description", "effects", "holderName", "id", "images", "isPublic", "note", "tastes", "terpenes", "type", "updatedAt") SELECT "aromas", "authorId", "createdAt", "description", "effects", "holderName", "id", "images", "isPublic", "note", "tastes", "terpenes", "type", "updatedAt" FROM "reviews";
DROP TABLE "reviews";
ALTER TABLE "new_reviews" RENAME TO "reviews";
CREATE INDEX "reviews_authorId_idx" ON "reviews"("authorId");
CREATE INDEX "reviews_type_idx" ON "reviews"("type");
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");
CREATE TABLE "new_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_sessions" ("createdAt", "expiresAt", "id", "sid", "userId") SELECT "createdAt", "expiresAt", "id", "sid", "userId" FROM "sessions";
DROP TABLE "sessions";
ALTER TABLE "new_sessions" RENAME TO "sessions";
CREATE UNIQUE INDEX "sessions_sid_key" ON "sessions"("sid");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "discriminator" TEXT,
    "avatar" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("avatar", "createdAt", "discordId", "discriminator", "email", "id", "updatedAt", "username") SELECT "avatar", "createdAt", "discordId", "discriminator", "email", "id", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_discordId_key" ON "users"("discordId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
