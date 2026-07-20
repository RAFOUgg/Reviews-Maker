-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "lastSyncedAt" DATETIME;
ALTER TABLE "subscriptions" ADD COLUMN "paypalPayerEmail" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN "paypalPlanId" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN "paypalStatus" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN "paypalSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_paypalSubscriptionId_key" ON "subscriptions"("paypalSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_paypalSubscriptionId_idx" ON "subscriptions"("paypalSubscriptionId");
