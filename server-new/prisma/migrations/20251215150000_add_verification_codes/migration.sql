-- CreateTable
CREATE TABLE IF NOT EXISTS "verification_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "verification_codes_email_type_idx" ON "verification_codes"("email", "type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "verification_codes_code_idx" ON "verification_codes"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "verification_codes_expiresAt_idx" ON "verification_codes"("expiresAt");
