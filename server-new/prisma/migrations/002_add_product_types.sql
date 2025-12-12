-- Migration: Ajout des tables pour Hash, Concentré et Comestible
-- Date: 2025-12-12

-- Table HashReview
CREATE TABLE IF NOT EXISTS hash_reviews (
    id TEXT PRIMARY KEY,
    reviewId TEXT UNIQUE NOT NULL,
    
    -- Infos générales
    nomCommercial TEXT NOT NULL,
    hashmaker TEXT,
    laboratoire TEXT,
    cultivarsUtilises TEXT,
    photos TEXT,
    
    -- Pipeline Séparation
    separationPipelineId TEXT,
    methodeSeparation TEXT,
    nombrePasses INTEGER,
    temperatureEau REAL,
    tailleMailles TEXT,
    typeMatierePremiere TEXT,
    qualiteMatierePremiere REAL,
    rendementEstime REAL,
    tempsTotalSeparation INTEGER,
    
    -- Pipeline Purification
    purificationPipelineId TEXT,
    
    -- Visuel & Technique
    couleurTransparence REAL,
    pureteVisuelle REAL,
    densiteVisuelle REAL,
    pistils REAL,
    moisissure REAL,
    graines REAL,
    
    -- Odeurs
    fideliteCultivars REAL,
    intensiteAromatique REAL,
    notesDominantes TEXT,
    notesSecondaires TEXT,
    
    -- Texture
    durete REAL,
    densiteTactile REAL,
    friabiliteViscositeMelting REAL,
    meltingResidus REAL,
    
    -- Goûts
    intensite REAL,
    agressivitePiquant REAL,
    dryPuff TEXT,
    inhalation TEXT,
    expiration TEXT,
    
    -- Effets
    monteeRapidite REAL,
    intensiteEffets REAL,
    effetsChoisis TEXT,
    effetsFiltre TEXT,
    methodeConsommation TEXT,
    dosageUtilise TEXT,
    dureeEffets TEXT,
    
    -- Curing
    curingPipelineId TEXT,
    curingDuration INTEGER,
    curingType TEXT,
    curingInterval TEXT,
    
    -- Timestamps
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reviewId) REFERENCES reviews(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_hash_reviews_reviewId ON hash_reviews(reviewId);
CREATE INDEX IF NOT EXISTS idx_hash_reviews_nomCommercial ON hash_reviews(nomCommercial);

-- Table ConcentrateReview
CREATE TABLE IF NOT EXISTS concentrate_reviews (
    id TEXT PRIMARY KEY,
    reviewId TEXT UNIQUE NOT NULL,
    
    -- Infos générales
    nomCommercial TEXT NOT NULL,
    hashmaker TEXT,
    laboratoire TEXT,
    cultivarsUtilises TEXT,
    photos TEXT,
    
    -- Pipelines
    extractionPipelineId TEXT,
    methodeExtraction TEXT,
    purificationPipelineId TEXT,
    
    -- Visuel & Technique
    couleurTransparence REAL,
    viscosite REAL,
    pureteVisuelle REAL,
    melting REAL,
    residus REAL,
    pistils REAL,
    moisissure REAL,
    
    -- Odeurs
    fideliteCultivars REAL,
    intensiteAromatique REAL,
    notesDominantes TEXT,
    notesSecondaires TEXT,
    
    -- Texture
    durete REAL,
    densiteTactile REAL,
    friabiliteViscositeMelting REAL,
    meltingResidus REAL,
    
    -- Goûts
    intensite REAL,
    agressivitePiquant REAL,
    dryPuff TEXT,
    inhalation TEXT,
    expiration TEXT,
    
    -- Effets
    monteeRapidite REAL,
    intensiteEffets REAL,
    effetsChoisis TEXT,
    effetsFiltre TEXT,
    methodeConsommation TEXT,
    dosageUtilise TEXT,
    dureeEffets TEXT,
    
    -- Curing
    curingPipelineId TEXT,
    curingDuration INTEGER,
    curingType TEXT,
    curingInterval TEXT,
    
    -- Timestamps
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reviewId) REFERENCES reviews(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_concentrate_reviews_reviewId ON concentrate_reviews(reviewId);
CREATE INDEX IF NOT EXISTS idx_concentrate_reviews_nomCommercial ON concentrate_reviews(nomCommercial);

-- Table EdibleReview
CREATE TABLE IF NOT EXISTS edible_reviews (
    id TEXT PRIMARY KEY,
    reviewId TEXT UNIQUE NOT NULL,
    
    -- Infos générales
    nomProduit TEXT NOT NULL,
    typeComestible TEXT,
    fabricant TEXT,
    typeGenetiques TEXT,
    photos TEXT,
    
    -- Pipeline Recette
    recipePipelineId TEXT,
    ingredients TEXT,
    etapesPreparation TEXT,
    
    -- Goûts
    intensite REAL,
    agressivitePiquant REAL,
    saveursDominantes TEXT,
    
    -- Effets
    monteeRapidite REAL,
    intensiteEffets REAL,
    effetsChoisis TEXT,
    effetsFiltre TEXT,
    dureeEffets TEXT,
    
    -- Timestamps
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reviewId) REFERENCES reviews(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_edible_reviews_reviewId ON edible_reviews(reviewId);
CREATE INDEX IF NOT EXISTS idx_edible_reviews_nomProduit ON edible_reviews(nomProduit);
