-- CreateTable
CREATE TABLE "company_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "producerProfileId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "status" TEXT NOT NULL DEFAULT 'invited',
    "invitedByUserId" TEXT NOT NULL,
    "inviteToken" TEXT,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" DATETIME,
    "revokedAt" DATETIME,
    CONSTRAINT "company_members_producerProfileId_fkey" FOREIGN KEY ("producerProfileId") REFERENCES "producer_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "company_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "company_members_inviteToken_key" ON "company_members"("inviteToken");

-- CreateIndex
CREATE INDEX "company_members_producerProfileId_idx" ON "company_members"("producerProfileId");

-- CreateIndex
CREATE INDEX "company_members_userId_idx" ON "company_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "company_members_producerProfileId_email_key" ON "company_members"("producerProfileId", "email");
