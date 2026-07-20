-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_genetic_trees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectType" TEXT NOT NULL DEFAULT 'phenohunt',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareCode" TEXT,
    "sharedWith" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "producerProfileId" TEXT,
    CONSTRAINT "genetic_trees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "genetic_trees_producerProfileId_fkey" FOREIGN KEY ("producerProfileId") REFERENCES "producer_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_genetic_trees" ("createdAt", "description", "id", "isPublic", "name", "projectType", "shareCode", "sharedWith", "updatedAt", "userId") SELECT "createdAt", "description", "id", "isPublic", "name", "projectType", "shareCode", "sharedWith", "updatedAt", "userId" FROM "genetic_trees";
DROP TABLE "genetic_trees";
ALTER TABLE "new_genetic_trees" RENAME TO "genetic_trees";
CREATE UNIQUE INDEX "genetic_trees_shareCode_key" ON "genetic_trees"("shareCode");
CREATE INDEX "genetic_trees_userId_idx" ON "genetic_trees"("userId");
CREATE INDEX "genetic_trees_projectType_idx" ON "genetic_trees"("projectType");
CREATE INDEX "genetic_trees_isPublic_idx" ON "genetic_trees"("isPublic");
CREATE INDEX "genetic_trees_producerProfileId_idx" ON "genetic_trees"("producerProfileId");
CREATE TABLE "new_production_chains" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "producerProfileId" TEXT,
    CONSTRAINT "production_chains_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "production_chains_producerProfileId_fkey" FOREIGN KEY ("producerProfileId") REFERENCES "producer_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_production_chains" ("createdAt", "description", "id", "isPublic", "name", "shareCode", "updatedAt", "userId") SELECT "createdAt", "description", "id", "isPublic", "name", "shareCode", "updatedAt", "userId" FROM "production_chains";
DROP TABLE "production_chains";
ALTER TABLE "new_production_chains" RENAME TO "production_chains";
CREATE UNIQUE INDEX "production_chains_shareCode_key" ON "production_chains"("shareCode");
CREATE INDEX "production_chains_userId_idx" ON "production_chains"("userId");
CREATE INDEX "production_chains_isPublic_idx" ON "production_chains"("isPublic");
CREATE INDEX "production_chains_producerProfileId_idx" ON "production_chains"("producerProfileId");
CREATE TABLE "new_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "holderName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "note" REAL,
    "ratings" TEXT,
    "categoryRatings" TEXT,
    "terpenes" TEXT,
    "tastes" TEXT,
    "aromas" TEXT,
    "effects" TEXT,
    "strainType" TEXT,
    "indicaRatio" INTEGER,
    "cultivarsList" TEXT,
    "pipelineExtraction" TEXT,
    "pipelineSeparation" TEXT,
    "purgevide" BOOLEAN,
    "hashmaker" TEXT,
    "breeder" TEXT,
    "farm" TEXT,
    "cultivars" TEXT,
    "extraData" TEXT,
    "toucheDensite" REAL,
    "toucheFriabilite" REAL,
    "toucheElasticite" REAL,
    "toucheHumidite" REAL,
    "toucheTexture" TEXT,
    "toucheMalleabilite" REAL,
    "toucheCollant" REAL,
    "toucheFragilite" REAL,
    "toucheViscosite" REAL,
    "toucheStabilite" REAL,
    "aromasPiquant" REAL,
    "aromasIntensity" REAL,
    "tastesIntensity" REAL,
    "goutIntensity" REAL,
    "effectsIntensity" REAL,
    "typeCulture" TEXT,
    "spectre" TEXT,
    "substratSysteme" TEXT,
    "techniquesPropagation" TEXT,
    "engraisOrganiques" TEXT,
    "engraisMineraux" TEXT,
    "additifsStimulants" TEXT,
    "densite" REAL,
    "trichome" REAL,
    "pistil" REAL,
    "manucure" REAL,
    "moisissure" REAL,
    "graines" REAL,
    "couleurTransparence" REAL,
    "pureteVisuelle" REAL,
    "couleur" REAL,
    "viscosite" REAL,
    "melting" REAL,
    "residus" REAL,
    "intensiteAromatique" REAL,
    "notesDominantesOdeur" TEXT,
    "notesSecondairesOdeur" TEXT,
    "fideliteCultivars" REAL,
    "durete" REAL,
    "densiteTexture" REAL,
    "elasticite" REAL,
    "collant" REAL,
    "friabiliteViscosite" REAL,
    "meltingResidus" REAL,
    "aspectCollantGras" REAL,
    "viscositeTexture" REAL,
    "dryPuff" TEXT,
    "inhalation" TEXT,
    "expiration" TEXT,
    "intensiteFumee" REAL,
    "agressivite" REAL,
    "cendre" REAL,
    "textureBouche" REAL,
    "douceur" REAL,
    "intensite" REAL,
    "montee" REAL,
    "intensiteEffet" REAL,
    "intensiteEffets" REAL,
    "typeEffet" TEXT,
    "dureeEffet" TEXT,
    "purificationPipeline" TEXT,
    "fertilizationPipeline" TEXT,
    "substratMix" TEXT,
    "recipe" TEXT,
    "images" TEXT,
    "mainImage" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    "producerProfileId" TEXT,
    CONSTRAINT "reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_producerProfileId_fkey" FOREIGN KEY ("producerProfileId") REFERENCES "producer_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_reviews" ("additifsStimulants", "agressivite", "aromas", "aromasIntensity", "aromasPiquant", "aspectCollantGras", "authorId", "breeder", "categoryRatings", "cendre", "collant", "couleur", "couleurTransparence", "createdAt", "cultivars", "cultivarsList", "densite", "densiteTexture", "description", "douceur", "dryPuff", "dureeEffet", "durete", "effects", "effectsIntensity", "elasticite", "engraisMineraux", "engraisOrganiques", "expiration", "extraData", "farm", "fertilizationPipeline", "fideliteCultivars", "friabiliteViscosite", "goutIntensity", "graines", "hashmaker", "holderName", "id", "images", "indicaRatio", "inhalation", "intensite", "intensiteAromatique", "intensiteEffet", "intensiteEffets", "intensiteFumee", "isPrivate", "isPublic", "mainImage", "manucure", "melting", "meltingResidus", "moisissure", "montee", "note", "notesDominantesOdeur", "notesSecondairesOdeur", "pipelineExtraction", "pipelineSeparation", "pistil", "pureteVisuelle", "purgevide", "purificationPipeline", "ratings", "recipe", "residus", "spectre", "strainType", "substratMix", "substratSysteme", "tastes", "tastesIntensity", "techniquesPropagation", "terpenes", "textureBouche", "toucheCollant", "toucheDensite", "toucheElasticite", "toucheFragilite", "toucheFriabilite", "toucheHumidite", "toucheMalleabilite", "toucheStabilite", "toucheTexture", "toucheViscosite", "trichome", "type", "typeCulture", "typeEffet", "updatedAt", "viscosite", "viscositeTexture") SELECT "additifsStimulants", "agressivite", "aromas", "aromasIntensity", "aromasPiquant", "aspectCollantGras", "authorId", "breeder", "categoryRatings", "cendre", "collant", "couleur", "couleurTransparence", "createdAt", "cultivars", "cultivarsList", "densite", "densiteTexture", "description", "douceur", "dryPuff", "dureeEffet", "durete", "effects", "effectsIntensity", "elasticite", "engraisMineraux", "engraisOrganiques", "expiration", "extraData", "farm", "fertilizationPipeline", "fideliteCultivars", "friabiliteViscosite", "goutIntensity", "graines", "hashmaker", "holderName", "id", "images", "indicaRatio", "inhalation", "intensite", "intensiteAromatique", "intensiteEffet", "intensiteEffets", "intensiteFumee", "isPrivate", "isPublic", "mainImage", "manucure", "melting", "meltingResidus", "moisissure", "montee", "note", "notesDominantesOdeur", "notesSecondairesOdeur", "pipelineExtraction", "pipelineSeparation", "pistil", "pureteVisuelle", "purgevide", "purificationPipeline", "ratings", "recipe", "residus", "spectre", "strainType", "substratMix", "substratSysteme", "tastes", "tastesIntensity", "techniquesPropagation", "terpenes", "textureBouche", "toucheCollant", "toucheDensite", "toucheElasticite", "toucheFragilite", "toucheFriabilite", "toucheHumidite", "toucheMalleabilite", "toucheStabilite", "toucheTexture", "toucheViscosite", "trichome", "type", "typeCulture", "typeEffet", "updatedAt", "viscosite", "viscositeTexture" FROM "reviews";
DROP TABLE "reviews";
ALTER TABLE "new_reviews" RENAME TO "reviews";
CREATE INDEX "reviews_authorId_idx" ON "reviews"("authorId");
CREATE INDEX "reviews_type_idx" ON "reviews"("type");
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");
CREATE INDEX "reviews_isPublic_idx" ON "reviews"("isPublic");
CREATE INDEX "reviews_producerProfileId_idx" ON "reviews"("producerProfileId");
CREATE TABLE "new_saved_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "data" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "producerProfileId" TEXT,
    CONSTRAINT "saved_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "saved_data_producerProfileId_fkey" FOREIGN KEY ("producerProfileId") REFERENCES "producer_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_saved_data" ("category", "createdAt", "data", "dataType", "description", "id", "lastUsedAt", "name", "tags", "updatedAt", "useCount", "userId") SELECT "category", "createdAt", "data", "dataType", "description", "id", "lastUsedAt", "name", "tags", "updatedAt", "useCount", "userId" FROM "saved_data";
DROP TABLE "saved_data";
ALTER TABLE "new_saved_data" RENAME TO "saved_data";
CREATE INDEX "saved_data_userId_idx" ON "saved_data"("userId");
CREATE INDEX "saved_data_dataType_idx" ON "saved_data"("dataType");
CREATE INDEX "saved_data_category_idx" ON "saved_data"("category");
CREATE INDEX "saved_data_producerProfileId_idx" ON "saved_data"("producerProfileId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

