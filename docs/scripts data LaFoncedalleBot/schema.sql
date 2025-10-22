-- ============================================================================
-- Schema de la base de données LaFoncedalleBot
-- Version: 2.0
-- Date: 2025-10-10
-- ============================================================================

-- ============================================================================
-- Table: user_links
-- Description: Liaison entre comptes Discord et emails Shopify
-- Note: La colonne 'active' permet de délier sans perdre les métadonnées
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_links (
    discord_id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    user_name TEXT,
    verified BOOLEAN DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_email ON user_links(user_email);
CREATE INDEX IF NOT EXISTS idx_user_links_active ON user_links(active);
CREATE INDEX IF NOT EXISTS idx_user_links_verified ON user_links(verified);

-- ============================================================================
-- Table: user_email_history
-- Description: Historique complet de tous les emails utilisés par chaque utilisateur
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_email_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    used_from DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_until DATETIME DEFAULT NULL,
    reason TEXT,  -- 'initial', 'changed', 'reactivated', 'migrated'
    FOREIGN KEY (discord_id) REFERENCES user_links(discord_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_history_discord ON user_email_history(discord_id);
CREATE INDEX IF NOT EXISTS idx_email_history_email ON user_email_history(user_email);
CREATE INDEX IF NOT EXISTS idx_email_history_current ON user_email_history(discord_id, used_until);

-- ============================================================================
-- Table: reminder_blacklist
-- Description: Liste des utilisateurs qui ne veulent pas de rappels
-- ============================================================================
CREATE TABLE IF NOT EXISTS reminder_blacklist (
    discord_id TEXT PRIMARY KEY,
    blacklisted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discord_id) REFERENCES user_links(discord_id) ON DELETE CASCADE
);

-- ============================================================================
-- Table: reminders
-- Description: Rappels envoyés aux utilisateurs pour noter leurs produits
-- ============================================================================
CREATE TABLE IF NOT EXISTS reminders (
    discord_id TEXT NOT NULL,
    order_id INTEGER NOT NULL,
    notified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (discord_id, order_id),
    FOREIGN KEY (discord_id) REFERENCES user_links(discord_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reminders_order ON reminders(order_id);

-- ============================================================================
-- Table: user_actions
-- Description: Log des actions utilisateurs pour analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_actions_user ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_timestamp ON user_actions(timestamp);

-- ============================================================================
-- Table: review_votes
-- Description: Votes sur les avis Judge.me (up/down)
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_votes (
    review_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    vote_type TEXT NOT NULL CHECK(vote_type IN ('up', 'down')),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);

-- ============================================================================
-- Table: sqlite_sequence
-- Description: Séquences SQLite (auto-créée par SQLite)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sqlite_sequence (
    name TEXT,
    seq INTEGER
);

-- ============================================================================
-- Table: product_tracking
-- Description: Suivi des produits pour détecter les nouveaux produits
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_tracking (
    product_handle TEXT PRIMARY KEY,
    product_title TEXT NOT NULL,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    announced BOOLEAN DEFAULT FALSE,
    announced_at DATETIME,
    available BOOLEAN DEFAULT TRUE,
    last_checked DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_tracking_announced ON product_tracking(announced);
CREATE INDEX IF NOT EXISTS idx_product_tracking_available ON product_tracking(available);

-- ============================================================================
-- Triggers pour maintenir last_updated
-- ============================================================================
CREATE TRIGGER IF NOT EXISTS update_user_links_timestamp 
AFTER UPDATE ON user_links
BEGIN
    UPDATE user_links SET last_updated = CURRENT_TIMESTAMP WHERE discord_id = NEW.discord_id;
END;

CREATE TRIGGER IF NOT EXISTS update_product_tracking_timestamp 
AFTER UPDATE ON product_tracking
BEGIN
    UPDATE product_tracking SET last_checked = CURRENT_TIMESTAMP WHERE product_handle = NEW.product_handle;
END;

-- ============================================================================
-- Vues utiles
-- ============================================================================

-- Vue des utilisateurs avec rappels
CREATE VIEW IF NOT EXISTS users_with_reminders AS
SELECT 
    ul.discord_id,
    ul.user_email,
    ul.user_name,
    COUNT(r.order_id) as reminder_count,
    MAX(r.notified_at) as last_reminder
FROM user_links ul
LEFT JOIN reminders r ON ul.discord_id = r.discord_id
GROUP BY ul.discord_id;

-- Vue des nouveaux produits non annoncés
CREATE VIEW IF NOT EXISTS new_products_to_announce AS
SELECT 
    product_handle,
    product_title,
    first_seen,
    available
FROM product_tracking
WHERE announced = FALSE 
  AND available = TRUE
ORDER BY first_seen DESC;

-- ============================================================================
-- Vues pour l'historique des emails
-- ============================================================================

-- Email actuel de chaque utilisateur
CREATE VIEW IF NOT EXISTS user_current_email_history AS
SELECT 
    h.discord_id,
    h.user_email as current_email,
    h.used_from as email_since,
    ul.user_name,
    ul.verified,
    ul.active
FROM user_email_history h
INNER JOIN user_links ul ON h.discord_id = ul.discord_id
WHERE h.used_until IS NULL
ORDER BY h.used_from DESC;

-- Résumé des changements d'email par utilisateur
CREATE VIEW IF NOT EXISTS user_email_changes_summary AS
SELECT 
    discord_id,
    COUNT(*) as total_emails_used,
    COUNT(CASE WHEN used_until IS NULL THEN 1 END) as current_emails,
    COUNT(CASE WHEN reason = 'changed' THEN 1 END) as times_changed,
    MIN(used_from) as first_email_date,
    MAX(used_from) as latest_change_date
FROM user_email_history
GROUP BY discord_id;

-- ============================================================================
-- Triggers pour l'historique des emails
-- ============================================================================

-- Archiver l'ancien email lors d'un changement
CREATE TRIGGER IF NOT EXISTS archive_old_email_on_update
AFTER UPDATE OF user_email ON user_links
FOR EACH ROW
WHEN OLD.user_email != NEW.user_email
BEGIN
    -- Fermer l'ancien email dans l'historique
    UPDATE user_email_history 
    SET used_until = CURRENT_TIMESTAMP
    WHERE discord_id = OLD.discord_id 
      AND user_email = OLD.user_email 
      AND used_until IS NULL;
    
    -- Ajouter le nouveau email
    INSERT INTO user_email_history (discord_id, user_email, used_from, reason)
    VALUES (NEW.discord_id, NEW.user_email, CURRENT_TIMESTAMP, 'changed');
END;

-- Enregistrer le premier email lors de l'insertion
CREATE TRIGGER IF NOT EXISTS record_initial_email
AFTER INSERT ON user_links
FOR EACH ROW
BEGIN
    INSERT INTO user_email_history (discord_id, user_email, used_from, reason)
    VALUES (NEW.discord_id, NEW.user_email, NEW.linked_at, 'initial');
END;

-- ============================================================================
-- MIGRATION: Suppression de l'ancienne table ratings (obsolète)
-- ============================================================================
-- Cette table n'est plus utilisée car les notations se font via Judge.me
DROP TABLE IF EXISTS ratings;
DROP INDEX IF EXISTS idx_product_name;
DROP INDEX IF EXISTS idx_user_email;
DROP INDEX IF EXISTS idx_rating_timestamp;

-- ============================================================================
-- Fin du schéma
-- ============================================================================
