-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cultivars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breeder" TEXT,
    "type" TEXT,
    "indicaRatio" INTEGER,
    "parentage" TEXT,
    "phenotype" TEXT,
    "generationStatus" TEXT,
    "chemotype" TEXT,
    "phenotypeStability" TEXT,
    "breedingGoal" TEXT,
    "thcMin" REAL,
    "thcMax" REAL,
    "thcSource" TEXT,
    "cbdMin" REAL,
    "cbdMax" REAL,
    "cbdSource" TEXT,
    "labReportUrl" TEXT,
    "labName" TEXT,
    "labMethod" TEXT,
    "labAccredited" BOOLEAN,
    "labAccreditationStandard" TEXT,
    "labAnalysisDate" DATETIME,
    "floweringMinWeeks" INTEGER,
    "floweringMaxWeeks" INTEGER,
    "yieldValue" REAL,
    "yieldUnit" TEXT,
    "tags" TEXT,
    "image" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cultivars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_cultivars" ("breeder", "breedingGoal", "cbdMax", "cbdMin", "cbdSource", "chemotype", "createdAt", "floweringMaxWeeks", "floweringMinWeeks", "generationStatus", "id", "image", "indicaRatio", "labAccreditationStandard", "labAccredited", "labAnalysisDate", "labMethod", "labName", "labReportUrl", "name", "notes", "parentage", "phenotype", "phenotypeStability", "tags", "thcMax", "thcMin", "thcSource", "type", "updatedAt", "userId", "yieldUnit", "yieldValue") SELECT "breeder", "breedingGoal", "cbdMax", "cbdMin", "cbdSource", "chemotype", "createdAt", "floweringMaxWeeks", "floweringMinWeeks", "generationStatus", "id", "image", "indicaRatio", "labAccreditationStandard", "labAccredited", "labAnalysisDate", "labMethod", "labName", "labReportUrl", "name", "notes", "parentage", "phenotype", "phenotypeStability", "tags", "thcMax", "thcMin", "thcSource", "type", "updatedAt", "userId", "yieldUnit", "yieldValue" FROM "cultivars";
DROP TABLE "cultivars";
ALTER TABLE "new_cultivars" RENAME TO "cultivars";
CREATE INDEX "cultivars_userId_idx" ON "cultivars"("userId");
CREATE INDEX "cultivars_name_idx" ON "cultivars"("name");
CREATE UNIQUE INDEX "cultivars_userId_name_key" ON "cultivars"("userId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
