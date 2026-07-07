-- AlterTable
ALTER TABLE "chain_annotations" ADD COLUMN "cellTimestamp" TEXT;
ALTER TABLE "chain_annotations" ADD COLUMN "pipelineType" TEXT;
ALTER TABLE "chain_annotations" ADD COLUMN "sourceReviewId" TEXT;
ALTER TABLE "chain_annotations" ADD COLUMN "sourceReviewType" TEXT;
