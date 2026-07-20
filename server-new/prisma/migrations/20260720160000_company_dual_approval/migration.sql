-- AlterTable
ALTER TABLE "company_members" ADD COLUMN "inviteeDecidedAt" DATETIME;
ALTER TABLE "company_members" ADD COLUMN "inviteeDecision" TEXT;
ALTER TABLE "company_members" ADD COLUMN "ownerDecidedAt" DATETIME;
ALTER TABLE "company_members" ADD COLUMN "ownerDecision" TEXT;
ALTER TABLE "company_members" ADD COLUMN "ownerToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "company_members_ownerToken_key" ON "company_members"("ownerToken");

