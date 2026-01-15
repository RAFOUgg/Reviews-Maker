-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT,
    "googleId" TEXT,
    "appleId" TEXT,
    "amazonId" TEXT,
    "facebookId" TEXT,
    "username" TEXT NOT NULL,
    "discriminator" TEXT,
    "avatar" TEXT,
    "email" TEXT,
    "passwordHash" TEXT,
    "emailBackup" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "birthdate" DATETIME,
    "country" TEXT,
    "region" TEXT,
    "legalAge" BOOLEAN NOT NULL DEFAULT false,
    "consentRDR" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" DATETIME,
    "roles" TEXT NOT NULL DEFAULT '{"roles":["consumer"]}',
    "accountType" TEXT NOT NULL DEFAULT 'consumer',
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" DATETIME,
    "banReason" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "theme" TEXT NOT NULL DEFAULT 'violet-lean',
    "defaultExportTemplate" TEXT,
    "subscriptionType" TEXT,
    "subscriptionStart" DATETIME,
    "subscriptionEnd" DATETIME,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'inactive',
    "dailyExportsUsed" INTEGER NOT NULL DEFAULT 0,
    "dailyExportsReset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kycStatus" TEXT,
    "kycDocuments" TEXT,
    "kycVerifiedAt" DATETIME,
    "kycRejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reviews" (
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
    CONSTRAINT "reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "review_likes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isLike" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "review_likes_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "review_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL DEFAULT 'custom',
    "templateType" TEXT NOT NULL DEFAULT 'standard',
    "format" TEXT NOT NULL DEFAULT '1:1',
    "maxPages" INTEGER NOT NULL DEFAULT 1,
    "config" TEXT NOT NULL,
    "thumbnail" TEXT,
    "allowedAccountTypes" TEXT NOT NULL DEFAULT '{"consumer":true,"influencer_basic":true,"influencer_pro":true,"producer":true}',
    "exportOptions" TEXT NOT NULL DEFAULT '{"png":true,"jpeg":true,"pdf":false,"svg":false,"maxQuality":150}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "template_shares" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "shareCode" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "maxUses" INTEGER,
    "expiresAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" DATETIME,
    "currentPeriodEnd" DATETIME,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "influencer_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "brandName" TEXT,
    "brandLogo" TEXT,
    "brandColors" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "followerCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "influencer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "producer_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "siret" TEXT,
    "ein" TEXT,
    "country" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "verificationDoc" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "producer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT,
    "userId" TEXT,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "moderatedBy" TEXT,
    "moderatedAt" DATETIME,
    "moderationNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reports_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "cultivars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breeder" TEXT,
    "type" TEXT,
    "indicaRatio" INTEGER,
    "parentage" TEXT,
    "phenotype" TEXT,
    "notes" TEXT,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cultivars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pipeline_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipelineId" TEXT NOT NULL,
    "pipelineType" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "stepName" TEXT NOT NULL,
    "intervalType" TEXT NOT NULL,
    "intervalValue" REAL,
    "data" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pipeline_github" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "pipelineType" TEXT NOT NULL,
    "intervalType" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "curingType" TEXT,
    "curingDuration" INTEGER,
    "cells" TEXT NOT NULL,
    "totalCells" INTEGER NOT NULL DEFAULT 0,
    "filledCells" INTEGER NOT NULL DEFAULT 0,
    "completionRate" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "flower_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "nomCommercial" TEXT NOT NULL,
    "farm" TEXT,
    "varietyType" TEXT,
    "breeder" TEXT,
    "variety" TEXT,
    "geneticType" TEXT,
    "indicaPercent" INTEGER,
    "sativaPercent" INTEGER,
    "parentage" TEXT,
    "phenotypeCode" TEXT,
    "culturePipelineId" TEXT,
    "culturePipelineGithubId" TEXT,
    "cultureStartDate" DATETIME,
    "cultureEndDate" DATETIME,
    "cultureDuration" INTEGER,
    "cultureSeason" TEXT,
    "thcPercent" REAL,
    "cbdPercent" REAL,
    "otherCannabinoids" TEXT,
    "terpeneProfile" TEXT,
    "labReportUrl" TEXT,
    "consumptionMethod" TEXT,
    "dosage" REAL,
    "effectDuration" TEXT,
    "effectProfiles" TEXT,
    "sideEffects" TEXT,
    "effectOnset" TEXT,
    "effectLength" TEXT,
    "preferredUse" TEXT,
    "couleurScore" REAL,
    "couleurNuancier" TEXT,
    "densiteVisuelle" REAL,
    "trichomesScore" REAL,
    "pistilsScore" REAL,
    "manucureScore" REAL,
    "moisissureScore" REAL,
    "grainesScore" REAL,
    "notesOdeursDominantes" TEXT,
    "notesOdeursSecondaires" TEXT,
    "aromesInhalation" TEXT,
    "saveurBouche" TEXT,
    "intensiteAromeScore" REAL,
    "dureteScore" REAL,
    "densiteTactileScore" REAL,
    "elasticiteScore" REAL,
    "collantScore" REAL,
    "intensiteGoutScore" REAL,
    "agressiviteScore" REAL,
    "dryPuffNotes" TEXT,
    "inhalationNotes" TEXT,
    "expirationNotes" TEXT,
    "monteeScore" REAL,
    "intensiteEffetScore" REAL,
    "effetsChoisis" TEXT,
    "effetsFiltre" TEXT,
    "curingPipelineId" TEXT,
    "curingPipelineGithubId" TEXT,
    "curingDuration" INTEGER,
    "curingType" TEXT,
    "curingInterval" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "flower_reviews_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hash_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "nomCommercial" TEXT NOT NULL,
    "hashmaker" TEXT,
    "laboratoire" TEXT,
    "cultivarsUtilises" TEXT,
    "photos" TEXT,
    "separationPipelineId" TEXT,
    "separationPipelineGithubId" TEXT,
    "methodeSeparation" TEXT,
    "nombrePasses" INTEGER,
    "temperatureEau" REAL,
    "tailleMailles" TEXT,
    "typeMatierePremiere" TEXT,
    "qualiteMatierePremiere" REAL,
    "rendementEstime" REAL,
    "tempsTotalSeparation" INTEGER,
    "purificationPipelineId" TEXT,
    "purificationPipelineGithubId" TEXT,
    "couleurTransparence" REAL,
    "pureteVisuelle" REAL,
    "densiteVisuelle" REAL,
    "pistils" REAL,
    "moisissure" REAL,
    "graines" REAL,
    "fideliteCultivars" REAL,
    "intensiteAromatique" REAL,
    "notesDominantes" TEXT,
    "notesSecondaires" TEXT,
    "durete" REAL,
    "densiteTactile" REAL,
    "friabiliteViscositeMelting" REAL,
    "meltingResidus" REAL,
    "intensite" REAL,
    "agressivitePiquant" REAL,
    "dryPuff" TEXT,
    "inhalation" TEXT,
    "expiration" TEXT,
    "monteeRapidite" REAL,
    "intensiteEffets" REAL,
    "effetsChoisis" TEXT,
    "effetsFiltre" TEXT,
    "methodeConsommation" TEXT,
    "dosageUtilise" TEXT,
    "dureeEffets" TEXT,
    "curingPipelineId" TEXT,
    "curingPipelineGithubId" TEXT,
    "curingDuration" INTEGER,
    "curingType" TEXT,
    "curingInterval" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hash_reviews_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "concentrate_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "nomCommercial" TEXT NOT NULL,
    "hashmaker" TEXT,
    "laboratoire" TEXT,
    "cultivarsUtilises" TEXT,
    "photos" TEXT,
    "extractionPipelineId" TEXT,
    "extractionPipelineGithubId" TEXT,
    "methodeExtraction" TEXT,
    "purificationPipelineId" TEXT,
    "purificationPipelineGithubId" TEXT,
    "couleurTransparence" REAL,
    "viscosite" REAL,
    "pureteVisuelle" REAL,
    "melting" REAL,
    "residus" REAL,
    "pistils" REAL,
    "moisissure" REAL,
    "fideliteCultivars" REAL,
    "intensiteAromatique" REAL,
    "notesDominantes" TEXT,
    "notesSecondaires" TEXT,
    "durete" REAL,
    "densiteTactile" REAL,
    "friabiliteViscositeMelting" REAL,
    "meltingResidus" REAL,
    "intensite" REAL,
    "agressivitePiquant" REAL,
    "dryPuff" TEXT,
    "inhalation" TEXT,
    "expiration" TEXT,
    "monteeRapidite" REAL,
    "intensiteEffets" REAL,
    "effetsChoisis" TEXT,
    "effetsFiltre" TEXT,
    "methodeConsommation" TEXT,
    "dosageUtilise" TEXT,
    "dureeEffets" TEXT,
    "curingPipelineId" TEXT,
    "curingPipelineGithubIdConcentrate" TEXT,
    "curingDuration" INTEGER,
    "curingType" TEXT,
    "curingInterval" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "concentrate_reviews_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "edible_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "nomProduit" TEXT NOT NULL,
    "typeComestible" TEXT,
    "fabricant" TEXT,
    "typeGenetiques" TEXT,
    "recipePipelineGithubId" TEXT,
    "photos" TEXT,
    "recipePipelineId" TEXT,
    "ingredients" TEXT,
    "etapesPreparation" TEXT,
    "intensite" REAL,
    "agressivitePiquant" REAL,
    "saveursDominantes" TEXT,
    "monteeRapidite" REAL,
    "intensiteEffets" REAL,
    "effetsChoisis" TEXT,
    "effetsFiltre" TEXT,
    "dureeEffets" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "edible_reviews_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "saved_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateType" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "thumbnail" TEXT,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "saved_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "watermarks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "style" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "watermarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "saved_data" (
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
    CONSTRAINT "saved_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "publicReviews" INTEGER NOT NULL DEFAULT 0,
    "privateReviews" INTEGER NOT NULL DEFAULT 0,
    "flowerReviews" INTEGER NOT NULL DEFAULT 0,
    "hashReviews" INTEGER NOT NULL DEFAULT 0,
    "concentrateReviews" INTEGER NOT NULL DEFAULT 0,
    "edibleReviews" INTEGER NOT NULL DEFAULT 0,
    "totalExports" INTEGER NOT NULL DEFAULT 0,
    "exportsPNG" INTEGER NOT NULL DEFAULT 0,
    "exportsJPEG" INTEGER NOT NULL DEFAULT 0,
    "exportsPDF" INTEGER NOT NULL DEFAULT 0,
    "exportsSVG" INTEGER NOT NULL DEFAULT 0,
    "exportsCSV" INTEGER NOT NULL DEFAULT 0,
    "exportsJSON" INTEGER NOT NULL DEFAULT 0,
    "exportsHTML" INTEGER NOT NULL DEFAULT 0,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalShares" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "lastReviewDate" DATETIME,
    "lastExportDate" DATETIME,
    "totalCultures" INTEGER DEFAULT 0,
    "totalYield" REAL,
    "avgYield" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "review_views" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "country" TEXT,
    "region" TEXT,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "review_views_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "review_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "deleteReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "review_comments_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "review_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "exports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reviewId" TEXT,
    "format" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "export_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "config" TEXT NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "export_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_presets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "pipelineType" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_presets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "genetic_trees" (
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
    CONSTRAINT "genetic_trees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "gen_nodes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treeId" TEXT NOT NULL,
    "cultivarId" TEXT,
    "cultivarName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#FF6B9D',
    "image" TEXT,
    "genetics" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "gen_nodes_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "genetic_trees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "gen_nodes_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "cultivars" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "gen_edges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treeId" TEXT NOT NULL,
    "parentNodeId" TEXT NOT NULL,
    "childNodeId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL DEFAULT 'parent',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "gen_edges_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "genetic_trees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "gen_edges_parentNodeId_fkey" FOREIGN KEY ("parentNodeId") REFERENCES "gen_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "gen_edges_childNodeId_fkey" FOREIGN KEY ("childNodeId") REFERENCES "gen_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_discordId_key" ON "users"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_appleId_key" ON "users"("appleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_amazonId_key" ON "users"("amazonId");

-- CreateIndex
CREATE UNIQUE INDEX "users_facebookId_key" ON "users"("facebookId");

-- CreateIndex
CREATE UNIQUE INDEX "users_emailBackup_key" ON "users"("emailBackup");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_discordId_idx" ON "users"("discordId");

-- CreateIndex
CREATE INDEX "users_googleId_idx" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_appleId_idx" ON "users"("appleId");

-- CreateIndex
CREATE INDEX "users_emailBackup_idx" ON "users"("emailBackup");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sid_key" ON "sessions"("sid");

-- CreateIndex
CREATE INDEX "reviews_authorId_idx" ON "reviews"("authorId");

-- CreateIndex
CREATE INDEX "reviews_type_idx" ON "reviews"("type");

-- CreateIndex
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");

-- CreateIndex
CREATE INDEX "reviews_isPublic_idx" ON "reviews"("isPublic");

-- CreateIndex
CREATE INDEX "review_likes_reviewId_idx" ON "review_likes"("reviewId");

-- CreateIndex
CREATE INDEX "review_likes_userId_idx" ON "review_likes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "review_likes_reviewId_userId_key" ON "review_likes"("reviewId", "userId");

-- CreateIndex
CREATE INDEX "templates_ownerId_idx" ON "templates"("ownerId");

-- CreateIndex
CREATE INDEX "templates_category_idx" ON "templates"("category");

-- CreateIndex
CREATE INDEX "templates_isPublic_idx" ON "templates"("isPublic");

-- CreateIndex
CREATE INDEX "templates_isPremium_idx" ON "templates"("isPremium");

-- CreateIndex
CREATE UNIQUE INDEX "template_shares_shareCode_key" ON "template_shares"("shareCode");

-- CreateIndex
CREATE INDEX "template_shares_shareCode_idx" ON "template_shares"("shareCode");

-- CreateIndex
CREATE INDEX "template_shares_templateId_idx" ON "template_shares"("templateId");

-- CreateIndex
CREATE INDEX "template_shares_createdBy_idx" ON "template_shares"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeCustomerId_key" ON "subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_stripeCustomerId_idx" ON "subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "influencer_profiles_userId_key" ON "influencer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "producer_profiles_userId_key" ON "producer_profiles"("userId");

-- CreateIndex
CREATE INDEX "reports_reviewId_idx" ON "reports"("reviewId");

-- CreateIndex
CREATE INDEX "reports_userId_idx" ON "reports"("userId");

-- CreateIndex
CREATE INDEX "reports_reporterId_idx" ON "reports"("reporterId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_idx" ON "audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "cultivars_userId_idx" ON "cultivars"("userId");

-- CreateIndex
CREATE INDEX "cultivars_name_idx" ON "cultivars"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cultivars_userId_name_key" ON "cultivars"("userId", "name");

-- CreateIndex
CREATE INDEX "pipeline_steps_pipelineId_stepIndex_idx" ON "pipeline_steps"("pipelineId", "stepIndex");

-- CreateIndex
CREATE INDEX "pipeline_github_reviewId_pipelineType_idx" ON "pipeline_github"("reviewId", "pipelineType");

-- CreateIndex
CREATE INDEX "pipeline_github_reviewType_idx" ON "pipeline_github"("reviewType");

-- CreateIndex
CREATE UNIQUE INDEX "flower_reviews_reviewId_key" ON "flower_reviews"("reviewId");

-- CreateIndex
CREATE INDEX "flower_reviews_reviewId_idx" ON "flower_reviews"("reviewId");

-- CreateIndex
CREATE INDEX "flower_reviews_nomCommercial_idx" ON "flower_reviews"("nomCommercial");

-- CreateIndex
CREATE INDEX "flower_reviews_variety_idx" ON "flower_reviews"("variety");

-- CreateIndex
CREATE UNIQUE INDEX "hash_reviews_reviewId_key" ON "hash_reviews"("reviewId");

-- CreateIndex
CREATE INDEX "hash_reviews_reviewId_idx" ON "hash_reviews"("reviewId");

-- CreateIndex
CREATE INDEX "hash_reviews_nomCommercial_idx" ON "hash_reviews"("nomCommercial");

-- CreateIndex
CREATE UNIQUE INDEX "concentrate_reviews_reviewId_key" ON "concentrate_reviews"("reviewId");

-- CreateIndex
CREATE INDEX "concentrate_reviews_reviewId_idx" ON "concentrate_reviews"("reviewId");

-- CreateIndex
CREATE INDEX "concentrate_reviews_nomCommercial_idx" ON "concentrate_reviews"("nomCommercial");

-- CreateIndex
CREATE UNIQUE INDEX "edible_reviews_reviewId_key" ON "edible_reviews"("reviewId");

-- CreateIndex
CREATE INDEX "edible_reviews_reviewId_idx" ON "edible_reviews"("reviewId");

-- CreateIndex
CREATE INDEX "edible_reviews_nomProduit_idx" ON "edible_reviews"("nomProduit");

-- CreateIndex
CREATE INDEX "saved_templates_userId_idx" ON "saved_templates"("userId");

-- CreateIndex
CREATE INDEX "saved_templates_templateType_idx" ON "saved_templates"("templateType");

-- CreateIndex
CREATE INDEX "saved_templates_format_idx" ON "saved_templates"("format");

-- CreateIndex
CREATE INDEX "saved_templates_useCount_idx" ON "saved_templates"("useCount");

-- CreateIndex
CREATE INDEX "watermarks_userId_idx" ON "watermarks"("userId");

-- CreateIndex
CREATE INDEX "watermarks_type_idx" ON "watermarks"("type");

-- CreateIndex
CREATE INDEX "watermarks_isDefault_idx" ON "watermarks"("isDefault");

-- CreateIndex
CREATE INDEX "saved_data_userId_idx" ON "saved_data"("userId");

-- CreateIndex
CREATE INDEX "saved_data_dataType_idx" ON "saved_data"("dataType");

-- CreateIndex
CREATE INDEX "saved_data_category_idx" ON "saved_data"("category");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_userId_key" ON "user_stats"("userId");

-- CreateIndex
CREATE INDEX "review_views_reviewId_idx" ON "review_views"("reviewId");

-- CreateIndex
CREATE INDEX "review_views_userId_idx" ON "review_views"("userId");

-- CreateIndex
CREATE INDEX "review_views_viewedAt_idx" ON "review_views"("viewedAt");

-- CreateIndex
CREATE INDEX "review_comments_reviewId_idx" ON "review_comments"("reviewId");

-- CreateIndex
CREATE INDEX "review_comments_userId_idx" ON "review_comments"("userId");

-- CreateIndex
CREATE INDEX "review_comments_createdAt_idx" ON "review_comments"("createdAt");

-- CreateIndex
CREATE INDEX "verification_codes_email_type_idx" ON "verification_codes"("email", "type");

-- CreateIndex
CREATE INDEX "verification_codes_code_idx" ON "verification_codes"("code");

-- CreateIndex
CREATE INDEX "verification_codes_expiresAt_idx" ON "verification_codes"("expiresAt");

-- CreateIndex
CREATE INDEX "exports_userId_idx" ON "exports"("userId");

-- CreateIndex
CREATE INDEX "exports_createdAt_idx" ON "exports"("createdAt");

-- CreateIndex
CREATE INDEX "exports_userId_createdAt_idx" ON "exports"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "export_templates_userId_idx" ON "export_templates"("userId");

-- CreateIndex
CREATE INDEX "export_templates_isCustom_idx" ON "export_templates"("isCustom");

-- CreateIndex
CREATE INDEX "export_templates_isDefault_idx" ON "export_templates"("isDefault");

-- CreateIndex
CREATE INDEX "user_presets_userId_idx" ON "user_presets"("userId");

-- CreateIndex
CREATE INDEX "user_presets_userId_type_idx" ON "user_presets"("userId", "type");

-- CreateIndex
CREATE INDEX "user_presets_userId_pipelineType_idx" ON "user_presets"("userId", "pipelineType");

-- CreateIndex
CREATE UNIQUE INDEX "genetic_trees_shareCode_key" ON "genetic_trees"("shareCode");

-- CreateIndex
CREATE INDEX "genetic_trees_userId_idx" ON "genetic_trees"("userId");

-- CreateIndex
CREATE INDEX "genetic_trees_projectType_idx" ON "genetic_trees"("projectType");

-- CreateIndex
CREATE INDEX "genetic_trees_isPublic_idx" ON "genetic_trees"("isPublic");

-- CreateIndex
CREATE INDEX "gen_nodes_treeId_idx" ON "gen_nodes"("treeId");

-- CreateIndex
CREATE INDEX "gen_nodes_cultivarId_idx" ON "gen_nodes"("cultivarId");

-- CreateIndex
CREATE INDEX "gen_edges_treeId_idx" ON "gen_edges"("treeId");

-- CreateIndex
CREATE INDEX "gen_edges_parentNodeId_idx" ON "gen_edges"("parentNodeId");

-- CreateIndex
CREATE INDEX "gen_edges_childNodeId_idx" ON "gen_edges"("childNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "gen_edges_parentNodeId_childNodeId_relationshipType_key" ON "gen_edges"("parentNodeId", "childNodeId", "relationshipType");
