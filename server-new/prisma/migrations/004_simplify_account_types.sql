-- Migration 004: Simplification système de comptes
-- Reviews-Maker 2025-12-12
-- Ajoute colonnes abonnement & limites quotidiennes

-- Étape 1: Ajouter colonnes abonnement
ALTER TABLE users ADD COLUMN subscriptionType TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscriptionStart TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscriptionEnd TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscriptionStatus TEXT DEFAULT 'inactive' NOT NULL;

-- Étape 2: Ajouter colonnes limites quotidiennes
ALTER TABLE users ADD COLUMN dailyExportsUsed INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN dailyExportsReset TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Étape 3: Créer index pour performances
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscriptionType, subscriptionStatus);
CREATE INDEX IF NOT EXISTS idx_users_daily_exports ON users(dailyExportsReset);

-- Étape 4: Mise à jour timestamp
UPDATE users SET updatedAt = CURRENT_TIMESTAMP WHERE id IS NOT NULL;

-- Note: Migration données (roles JSON) nécessite script Node.js
-- Voir server-new/scripts/migrate-account-types.js
