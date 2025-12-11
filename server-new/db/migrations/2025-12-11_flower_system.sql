-- Migration: Ajout système Reviews Fleurs complet
-- Date: 2025-12-11
-- Description: Tables Cultivar, PipelineStep, FlowerReview

-- Table bibliothèque cultivars utilisateur
CREATE TABLE IF NOT EXISTS cultivars (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    breeder TEXT,
    type TEXT,
    indicaRatio INTEGER,
    parentage TEXT,
    phenotype TEXT,
    notes TEXT,
    useCount INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, name),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cultivars_userId ON cultivars(userId);
CREATE INDEX IF NOT EXISTS idx_cultivars_name ON cultivars(name);

-- Table étapes de pipelines (culture, curing, extraction, etc.)
CREATE TABLE IF NOT EXISTS pipeline_steps (
    id TEXT PRIMARY KEY,
    pipelineId TEXT NOT NULL,
    pipelineType TEXT NOT NULL,
    stepIndex INTEGER NOT NULL,
    stepName TEXT NOT NULL,
    intervalType TEXT NOT NULL,
    intervalValue REAL,
    data TEXT NOT NULL,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pipeline_steps_pipelineId_stepIndex ON pipeline_steps(pipelineId, stepIndex);

-- Table données spécifiques Fleurs
CREATE TABLE IF NOT EXISTS flower_reviews (
    id TEXT PRIMARY KEY,
    reviewId TEXT NOT NULL UNIQUE,
    
    -- Informations générales
    nomCommercial TEXT NOT NULL,
    farm TEXT,
    varietyType TEXT,
    
    -- Génétiques
    breeder TEXT,
    variety TEXT,
    geneticType TEXT,
    indicaPercent INTEGER,
    sativaPercent INTEGER,
    parentage TEXT,
    phenotypeCode TEXT,
    
    -- Pipeline culture
    culturePipelineId TEXT,
    cultureStartDate DATETIME,
    cultureEndDate DATETIME,
    cultureDuration INTEGER,
    cultureSeason TEXT,
    
    -- Données analytiques
    thcPercent REAL,
    cbdPercent REAL,
    otherCannabinoids TEXT,
    terpeneProfile TEXT,
    labReportUrl TEXT,
    
    -- Expérience utilisation
    consumptionMethod TEXT,
    dosage REAL,
    effectDuration TEXT,
    effectProfiles TEXT,
    sideEffects TEXT,
    effectOnset TEXT,
    effectLength TEXT,
    preferredUse TEXT,
    
    -- Visuel & Technique
    couleurScore REAL,
    couleurNuancier TEXT,
    densiteVisuelle REAL,
    trichomesScore REAL,
    pistilsScore REAL,
    manucureScore REAL,
    moisissureScore REAL,
    grainesScore REAL,
    
    -- Odeurs
    notesOdeursDominantes TEXT,
    notesOdeursSecondaires TEXT,
    aromesInhalation TEXT,
    saveurBouche TEXT,
    intensiteAromeScore REAL,
    
    -- Texture
    dureteScore REAL,
    densiteTactileScore REAL,
    elasticiteScore REAL,
    collantScore REAL,
    
    -- Goûts
    intensiteGoutScore REAL,
    agressiviteScore REAL,
    dryPuffNotes TEXT,
    inhalationNotes TEXT,
    expirationNotes TEXT,
    
    -- Effets
    monteeScore REAL,
    intensiteEffetScore REAL,
    effetsChoisis TEXT,
    effetsFiltre TEXT,
    
    -- Pipeline curing
    curingPipelineId TEXT,
    curingDuration INTEGER,
    curingType TEXT,
    curingInterval TEXT,
    
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reviewId) REFERENCES reviews(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_flower_reviews_reviewId ON flower_reviews(reviewId);
CREATE INDEX IF NOT EXISTS idx_flower_reviews_nomCommercial ON flower_reviews(nomCommercial);
CREATE INDEX IF NOT EXISTS idx_flower_reviews_variety ON flower_reviews(variety);
