-- Migration: Ajout des champs templates et partage
-- Date: 2025-01-11
-- Description: Mise à jour du schéma templates pour gérer les permissions par compte

-- Mise à jour de la table templates
ALTER TABLE templates ADD COLUMN isPremium INTEGER DEFAULT 0;
ALTER TABLE templates ADD COLUMN category TEXT DEFAULT 'custom';
ALTER TABLE templates ADD COLUMN templateType TEXT DEFAULT 'standard';
ALTER TABLE templates ADD COLUMN format TEXT DEFAULT '1:1';
ALTER TABLE templates ADD COLUMN maxPages INTEGER DEFAULT 1;
ALTER TABLE templates ADD COLUMN allowedAccountTypes TEXT DEFAULT '{"consumer":true,"influencer_basic":true,"influencer_pro":true,"producer":true}';
ALTER TABLE templates ADD COLUMN exportOptions TEXT DEFAULT '{"png":true,"jpeg":true,"pdf":false,"svg":false,"maxQuality":150}';

-- Créer index pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_isPremium ON templates(isPremium);

-- Créer la table template_shares
CREATE TABLE IF NOT EXISTS template_shares (
    id TEXT PRIMARY KEY,
    templateId TEXT NOT NULL,
    shareCode TEXT UNIQUE NOT NULL,
    createdBy TEXT NOT NULL,
    usedCount INTEGER DEFAULT 0,
    maxUses INTEGER,
    expiresAt TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (templateId) REFERENCES templates(id) ON DELETE CASCADE
);

-- Index pour template_shares
CREATE INDEX IF NOT EXISTS idx_template_shares_code ON template_shares(shareCode);
CREATE INDEX IF NOT EXISTS idx_template_shares_template ON template_shares(templateId);
CREATE INDEX IF NOT EXISTS idx_template_shares_creator ON template_shares(createdBy);

-- Mise à jour du champ defaultExportTemplate dans users si pas présent
-- (Ce champ existe déjà dans le schema Prisma)

-- Créer des templates prédéfinis pour chaque format
INSERT OR IGNORE INTO templates (id, name, description, ownerId, isPublic, isPremium, category, templateType, format, maxPages, config, allowedAccountTypes, exportOptions, createdAt, updatedAt)
VALUES 
-- Template Compact 1:1 (Gratuit)
('tpl-compact-1x1', 'Compact (1:1)', 'Template compact pour réseaux sociaux - Format carré', 'system', 1, 0, 'predefined', 'compact', '1:1', 1, 
'{"pages":[{"zones":[{"source":"holderName","x":20,"y":20,"w":360,"h":40,"style":"font-size:24px;font-weight:bold"},{"source":"images[0]","x":20,"y":80,"w":360,"h":360}]}],"theme":"violet-lean"}',
'{"consumer":true,"influencer_basic":true,"influencer_pro":true,"producer":true}',
'{"png":true,"jpeg":true,"pdf":true,"svg":false,"maxQuality":150}',
datetime('now'), datetime('now')),

-- Template Détaillé 16:9 (Gratuit)
('tpl-detailed-16x9', 'Détaillé (16:9)', 'Template détaillé paysage pour présentations', 'system', 1, 0, 'predefined', 'detailed', '16:9', 1,
'{"pages":[{"zones":[{"source":"holderName","x":40,"y":40,"w":600,"h":60,"style":"font-size:32px;font-weight:bold"},{"source":"images[0]","x":40,"y":120,"w":500,"h":500},{"source":"description","x":560,"y":120,"w":400,"h":500}]}],"theme":"violet-lean"}',
'{"consumer":true,"influencer_basic":true,"influencer_pro":true,"producer":true}',
'{"png":true,"jpeg":true,"pdf":true,"svg":false,"maxQuality":150}',
datetime('now'), datetime('now')),

-- Template Complet A4 (Gratuit)
('tpl-complete-a4', 'Complet (A4)', 'Template complet pour impression', 'system', 1, 0, 'predefined', 'complete', 'A4', 1,
'{"pages":[{"zones":[{"source":"holderName","x":100,"y":100,"w":800,"h":80,"style":"font-size:40px;font-weight:bold"},{"source":"images[0]","x":100,"y":200,"w":800,"h":800},{"source":"description","x":100,"y":1020,"w":800,"h":400}]}],"theme":"violet-lean"}',
'{"consumer":true,"influencer_basic":true,"influencer_pro":true,"producer":true}',
'{"png":true,"jpeg":true,"pdf":true,"svg":false,"maxQuality":150}',
datetime('now'), datetime('now')),

-- Template Premium 9:16 (Stories) - Réservé Influenceurs
('tpl-premium-9x16', 'Stories (9:16)', 'Template vertical pour Instagram/TikTok Stories', 'system', 1, 1, 'predefined', 'custom', '9:16', 1,
'{"pages":[{"zones":[{"source":"holderName","x":40,"y":100,"w":540,"h":60,"style":"font-size:28px;font-weight:bold"},{"source":"images[0]","x":40,"y":180,"w":540,"h":540}]}],"theme":"violet-lean"}',
'{"consumer":false,"influencer_basic":true,"influencer_pro":true,"producer":true}',
'{"png":true,"jpeg":true,"pdf":true,"svg":true,"maxQuality":300}',
datetime('now'), datetime('now'));

-- Log de migration
CREATE TABLE IF NOT EXISTS migration_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration_name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO migration_log (migration_name) VALUES ('2025-01-11_templates_permissions');
