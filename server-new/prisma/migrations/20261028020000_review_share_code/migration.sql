-- AlterTable
ALTER TABLE "reviews" ADD COLUMN "shareCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_shareCode_key" ON "reviews"("shareCode");

