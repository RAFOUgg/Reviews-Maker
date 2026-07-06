/*
  Warnings:

  - You are about to drop the `culture_setups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pipeline_stages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pipelines` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "culture_setups";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "pipeline_stages";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "pipelines";
PRAGMA foreign_keys=on;
