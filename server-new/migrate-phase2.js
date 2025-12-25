/**
 * Migration Phase 2 - Ajouter les colonnes OAuth et Account System
 * À exécuter une seule fois sur la base de production
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../db/reviews.sqlite');

console.log('📊 Migration Phase 2 - Base de données:', dbPath);

const db = new Database(dbPath);

// Fonction helper pour ajouter une colonne si elle n'existe pas
function addColumnIfNotExists(table, column, type, defaultValue = '') {
    try {
        const columns = db.prepare(`PRAGMA table_info(${table})`).all();
        const exists = columns.some(c => c.name === column);

        if (!exists) {
            const sql = `ALTER TABLE ${table} ADD COLUMN ${column} ${type}${defaultValue ? ' DEFAULT ' + defaultValue : ''}`;
            db.prepare(sql).run();
            console.log(`✅ Colonne ajoutée: ${table}.${column}`);
        } else {
            console.log(`⏭️  Colonne existe déjà: ${table}.${column}`);
        }
    } catch (error) {
        console.error(`❌ Erreur ajout ${table}.${column}:`, error.message);
    }
}

// Fonction helper pour créer un index si il n'existe pas
function createIndexIfNotExists(indexName, table, column, unique = false) {
    try {
        const uniqueStr = unique ? 'UNIQUE ' : '';
        const sql = `CREATE ${uniqueStr}INDEX IF NOT EXISTS ${indexName} ON ${table}(${column})`;
        db.prepare(sql).run();
        console.log(`✅ Index créé: ${indexName}`);
    } catch (error) {
        console.error(`❌ Erreur création index ${indexName}:`, error.message);
    }
}

console.log('\n🔄 Ajout des colonnes OAuth providers...');
addColumnIfNotExists('users', 'googleId', 'TEXT');
addColumnIfNotExists('users', 'appleId', 'TEXT');
addColumnIfNotExists('users', 'amazonId', 'TEXT');
addColumnIfNotExists('users', 'facebookId', 'TEXT');

console.log('\n🔄 Ajout des colonnes conformité légale...');
addColumnIfNotExists('users', 'birthdate', 'TEXT');
addColumnIfNotExists('users', 'country', 'TEXT');
addColumnIfNotExists('users', 'region', 'TEXT');
addColumnIfNotExists('users', 'legalAge', 'INTEGER', '0');
addColumnIfNotExists('users', 'consentRDR', 'INTEGER', '0');
addColumnIfNotExists('users', 'consentDate', 'TEXT');

console.log('\n🔄 Ajout des colonnes email backup...');
addColumnIfNotExists('users', 'emailBackup', 'TEXT');
addColumnIfNotExists('users', 'emailVerified', 'INTEGER', '0');

console.log('\n🔄 Ajout des colonnes TOTP 2FA...');
addColumnIfNotExists('users', 'totpSecret', 'TEXT');
addColumnIfNotExists('users', 'totpEnabled', 'INTEGER', '0');

console.log('\n🔄 Ajout des colonnes ban...');
addColumnIfNotExists('users', 'isBanned', 'INTEGER', '0');
addColumnIfNotExists('users', 'bannedAt', 'TEXT');
addColumnIfNotExists('users', 'banReason', 'TEXT');

console.log('\n🔄 Ajout des colonnes préférences...');
addColumnIfNotExists('users', 'locale', 'TEXT', "'fr'");
addColumnIfNotExists('users', 'theme', 'TEXT', "'violet-lean'");
addColumnIfNotExists('users', 'defaultExportTemplate', 'TEXT');

console.log('\n🔄 Création des index...');
createIndexIfNotExists('users_googleId_unique', 'users', 'googleId', true);
createIndexIfNotExists('users_appleId_unique', 'users', 'appleId', true);
createIndexIfNotExists('users_emailBackup_unique', 'users', 'emailBackup', true);
createIndexIfNotExists('users_googleId_idx', 'users', 'googleId');
createIndexIfNotExists('users_appleId_idx', 'users', 'appleId');
createIndexIfNotExists('users_emailBackup_idx', 'users', 'emailBackup');

// Créer la table Subscription si elle n'existe pas
console.log('\n🔄 Création de la table Subscription...');
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS subscriptions (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL UNIQUE,
            accountType TEXT NOT NULL DEFAULT 'consumer',
            status TEXT NOT NULL DEFAULT 'active',
            plan TEXT,
            stripeCustomerId TEXT,
            stripeSubscriptionId TEXT,
            currentPeriodStart TEXT,
            currentPeriodEnd TEXT,
            cancelAtPeriodEnd INTEGER DEFAULT 0,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
    `).run();
    console.log('✅ Table subscriptions créée ou existe déjà');
} catch (error) {
    console.error('❌ Erreur création table subscriptions:', error.message);
}

// Créer la table InfluencerProfile si elle n'existe pas
console.log('\n🔄 Création de la table InfluencerProfile...');
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS influencer_profiles (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL UNIQUE,
            brandName TEXT,
            brandLogo TEXT,
            brandColors TEXT,
            verified INTEGER DEFAULT 0,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
    `).run();
    console.log('✅ Table influencer_profiles créée ou existe déjà');
} catch (error) {
    console.error('❌ Erreur création table influencer_profiles:', error.message);
}

// Créer la table ProducerProfile si elle n'existe pas
console.log('\n🔄 Création de la table ProducerProfile...');
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS producer_profiles (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL UNIQUE,
            companyName TEXT NOT NULL,
            license TEXT,
            verified INTEGER DEFAULT 0,
            address TEXT,
            city TEXT,
            postalCode TEXT,
            country TEXT,
            phone TEXT,
            website TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
    `).run();
    console.log('✅ Table producer_profiles créée ou existe déjà');
} catch (error) {
    console.error('❌ Erreur création table producer_profiles:', error.message);
}

// Créer la table Report si elle n'existe pas
console.log('\n🔄 Création de la table Report...');
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            reporterId TEXT NOT NULL,
            reportedUserId TEXT,
            reportedReviewId TEXT,
            reason TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            resolution TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            FOREIGN KEY (reporterId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (reportedUserId) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (reportedReviewId) REFERENCES reviews(id) ON DELETE SET NULL
        )
    `).run();
    console.log('✅ Table reports créée ou existe déjà');
} catch (error) {
    console.error('❌ Erreur création table reports:', error.message);
}

// Créer la table AuditLog si elle n'existe pas
console.log('\n🔄 Création de la table AuditLog...');
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            userId TEXT,
            action TEXT NOT NULL,
            details TEXT,
            ipAddress TEXT,
            userAgent TEXT,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
        )
    `).run();
    console.log('✅ Table audit_logs créée ou existe déjà');
} catch (error) {
    console.error('❌ Erreur création table audit_logs:', error.message);
}

// Mettre à jour tous les utilisateurs existants pour avoir accountType = consumer par défaut
console.log('\n🔄 Mise à jour des rôles utilisateurs existants...');
try {
    const usersWithoutRoles = db.prepare(`
        SELECT id, roles FROM users WHERE roles IS NULL OR roles = ''
    `).all();

    for (const user of usersWithoutRoles) {
        db.prepare(`
            UPDATE users 
            SET roles = '{"roles":["consumer"]}'
            WHERE id = ?
        `).run(user.id);
    }
    console.log(`✅ ${usersWithoutRoles.length} utilisateurs mis à jour avec roles par défaut`);
} catch (error) {
    console.error('❌ Erreur mise à jour roles:', error.message);
}

db.close();
console.log('\n✅ Migration Phase 2 terminée avec succès!');
console.log('🔄 Redémarrez le serveur pour appliquer les changements.\n');
