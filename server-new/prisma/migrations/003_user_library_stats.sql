-- Migration: Bibliothèque Personnelle et Statistiques
-- Date: 2025-12-12
-- Description: Tables pour templates sauvegardés, filigranes, données réutilisables, statistiques et commentaires

-- ===========================
-- BIBLIOTHÈQUE PERSONNELLE
-- ===========================

-- Templates sauvegardés par l'utilisateur
CREATE TABLE IF NOT EXISTS saved_templates (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    templateType TEXT NOT NULL,
    format TEXT NOT NULL,
    config TEXT NOT NULL,
    thumbnail TEXT,
    useCount INTEGER NOT NULL DEFAULT 0,
    lastUsedAt DATETIME,
    tags TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_templates_userId ON saved_templates(userId);
CREATE INDEX IF NOT EXISTS idx_saved_templates_templateType ON saved_templates(templateType);
CREATE INDEX IF NOT EXISTS idx_saved_templates_format ON saved_templates(format);
CREATE INDEX IF NOT EXISTS idx_saved_templates_useCount ON saved_templates(useCount);

-- Filigranes (watermarks) personnalisés
CREATE TABLE IF NOT EXISTS watermarks (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    content TEXT,
    imageUrl TEXT,
    style TEXT NOT NULL,
    isDefault INTEGER NOT NULL DEFAULT 0,
    useCount INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_watermarks_userId ON watermarks(userId);
CREATE INDEX IF NOT EXISTS idx_watermarks_type ON watermarks(type);
CREATE INDEX IF NOT EXISTS idx_watermarks_isDefault ON watermarks(isDefault);

-- Données sauvegardées pour réutilisation rapide
CREATE TABLE IF NOT EXISTS saved_data (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    dataType TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    data TEXT NOT NULL,
    category TEXT,
    tags TEXT,
    useCount INTEGER NOT NULL DEFAULT 0,
    lastUsedAt DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_data_userId ON saved_data(userId);
CREATE INDEX IF NOT EXISTS idx_saved_data_dataType ON saved_data(dataType);
CREATE INDEX IF NOT EXISTS idx_saved_data_category ON saved_data(category);

-- ===========================
-- STATISTIQUES
-- ===========================

-- Statistiques globales utilisateur
CREATE TABLE IF NOT EXISTS user_stats (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE,
    totalReviews INTEGER NOT NULL DEFAULT 0,
    publicReviews INTEGER NOT NULL DEFAULT 0,
    privateReviews INTEGER NOT NULL DEFAULT 0,
    flowerReviews INTEGER NOT NULL DEFAULT 0,
    hashReviews INTEGER NOT NULL DEFAULT 0,
    concentrateReviews INTEGER NOT NULL DEFAULT 0,
    edibleReviews INTEGER NOT NULL DEFAULT 0,
    totalExports INTEGER NOT NULL DEFAULT 0,
    exportsPNG INTEGER NOT NULL DEFAULT 0,
    exportsJPEG INTEGER NOT NULL DEFAULT 0,
    exportsPDF INTEGER NOT NULL DEFAULT 0,
    exportsSVG INTEGER NOT NULL DEFAULT 0,
    exportsCSV INTEGER NOT NULL DEFAULT 0,
    exportsJSON INTEGER NOT NULL DEFAULT 0,
    exportsHTML INTEGER NOT NULL DEFAULT 0,
    totalLikes INTEGER NOT NULL DEFAULT 0,
    totalViews INTEGER NOT NULL DEFAULT 0,
    totalShares INTEGER NOT NULL DEFAULT 0,
    totalComments INTEGER NOT NULL DEFAULT 0,
    lastReviewDate DATETIME,
    lastExportDate DATETIME,
    totalCultures INTEGER DEFAULT 0,
    totalYield REAL,
    avgYield REAL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_stats_userId ON user_stats(userId);

-- Vues des reviews (tracking)
CREATE TABLE IF NOT EXISTS review_views (
    id TEXT PRIMARY KEY,
    reviewId TEXT NOT NULL,
    userId TEXT,
    ipAddress TEXT,
    userAgent TEXT,
    referer TEXT,
    country TEXT,
    region TEXT,
    viewedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewId) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_review_views_reviewId ON review_views(reviewId);
CREATE INDEX IF NOT EXISTS idx_review_views_userId ON review_views(userId);
CREATE INDEX IF NOT EXISTS idx_review_views_viewedAt ON review_views(viewedAt);

-- Commentaires sur les reviews publiques
CREATE TABLE IF NOT EXISTS review_comments (
    id TEXT PRIMARY KEY,
    reviewId TEXT NOT NULL,
    userId TEXT NOT NULL,
    content TEXT NOT NULL,
    isEdited INTEGER NOT NULL DEFAULT 0,
    editedAt DATETIME,
    isDeleted INTEGER NOT NULL DEFAULT 0,
    deletedAt DATETIME,
    deleteReason TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewId) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_comments_reviewId ON review_comments(reviewId);
CREATE INDEX IF NOT EXISTS idx_review_comments_userId ON review_comments(userId);
CREATE INDEX IF NOT EXISTS idx_review_comments_createdAt ON review_comments(createdAt);
