-- AlterTable
ALTER TABLE "chain_edges" ADD COLUMN "sourceHandle" TEXT;
ALTER TABLE "chain_edges" ADD COLUMN "targetHandle" TEXT;
ALTER TABLE "chain_edges" ADD COLUMN "waypointX" REAL;
ALTER TABLE "chain_edges" ADD COLUMN "waypointY" REAL;
