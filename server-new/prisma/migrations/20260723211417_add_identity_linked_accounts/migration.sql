-- AlterTable
ALTER TABLE "concentrate_reviews" ADD COLUMN "hashmakerLinkedProducerProfileId" TEXT;
ALTER TABLE "concentrate_reviews" ADD COLUMN "hashmakerLinkedUserId" TEXT;

-- AlterTable
ALTER TABLE "edible_reviews" ADD COLUMN "fabricantLinkedProducerProfileId" TEXT;
ALTER TABLE "edible_reviews" ADD COLUMN "fabricantLinkedUserId" TEXT;

-- AlterTable
ALTER TABLE "flower_reviews" ADD COLUMN "farmLinkedProducerProfileId" TEXT;
ALTER TABLE "flower_reviews" ADD COLUMN "farmLinkedUserId" TEXT;

-- AlterTable
ALTER TABLE "hash_reviews" ADD COLUMN "hashmakerLinkedProducerProfileId" TEXT;
ALTER TABLE "hash_reviews" ADD COLUMN "hashmakerLinkedUserId" TEXT;
