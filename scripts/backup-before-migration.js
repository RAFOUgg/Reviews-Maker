#!/usr/bin/env node

/**
 * Script de sauvegarde complète de la base de données Reviews-Maker
 * À exécuter AVANT toute migration ou modification importante
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '..', 'db');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

// Créer le dossier de backups
fs.mkdirSync(BACKUP_DIR, { recursive: true });

console.log('🔐 BACKUP REVIEWS-MAKER - Avant migration autonome');
console.log('═'.repeat(60));

try {
    // 1. Backup SQLite
    const dbFile = path.join(DB_DIR, 'reviews.sqlite');
    const dbBackup = path.join(BACKUP_DIR, `reviews-${TIMESTAMP}.sqlite`);

    if (fs.existsSync(dbFile)) {
        fs.copyFileSync(dbFile, dbBackup);
        const dbSize = (fs.statSync(dbBackup).size / 1024).toFixed(2);
        console.log(`✅ Base de données sauvegardée: ${dbSize} KB`);
        console.log(`   → ${dbBackup}`);
    } else {
        console.warn('⚠️  Fichier reviews.sqlite introuvable');
    }

    // 2. Backup Images
    const imagesDir = path.join(DB_DIR, 'review_images');
    const imagesBackup = path.join(BACKUP_DIR, `images-${TIMESTAMP}`);

    if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        if (files.length > 0) {
            // Copier le dossier entier
            fs.mkdirSync(imagesBackup, { recursive: true });
            files.forEach(file => {
                fs.copyFileSync(
                    path.join(imagesDir, file),
                    path.join(imagesBackup, file)
                );
            });
            console.log(`✅ Images sauvegardées: ${files.length} fichiers`);
            console.log(`   → ${imagesBackup}`);
        } else {
            console.log('ℹ️  Aucune image à sauvegarder');
        }
    }

    // 3. Analyse rapide des données
    if (fs.existsSync(dbFile)) {
        const sqlite3 = await import('sqlite3');
        const db = new sqlite3.default.Database(dbFile, sqlite3.default.OPEN_READONLY);

        db.serialize(() => {
            db.get('SELECT COUNT(*) as count FROM reviews', (err, row) => {
                if (!err) {
                    console.log(`📊 Total reviews: ${row.count}`);
                }
            });

            db.get('SELECT COUNT(DISTINCT ownerId) as count FROM reviews', (err, row) => {
                if (!err) {
                    console.log(`👥 Utilisateurs uniques: ${row.count}`);
                }
            });

            db.all(`
        SELECT productType, COUNT(*) as count 
        FROM reviews 
        GROUP BY productType
      `, (err, rows) => {
                if (!err && rows) {
                    console.log('📦 Répartition par type:');
                    rows.forEach(r => {
                        console.log(`   - ${r.productType}: ${r.count}`);
                    });
                }
            });

            db.close();
        });
    }

    console.log('═'.repeat(60));
    console.log('✅ BACKUP TERMINÉ');
    console.log(`📁 Dossier: ${BACKUP_DIR}`);

    // 4. Créer archive tar.gz (si disponible)
    try {
        const archiveName = `backup-reviews-${TIMESTAMP}.tar.gz`;
        const archivePath = path.join(BACKUP_DIR, archiveName);

        console.log('\n📦 Création archive compressée...');
        execSync(`tar czf "${archivePath}" -C "${DB_DIR}" reviews.sqlite review_images`, {
            stdio: 'inherit'
        });

        const archiveSize = (fs.statSync(archivePath).size / (1024 * 1024)).toFixed(2);
        console.log(`✅ Archive créée: ${archiveSize} MB`);
        console.log(`   → ${archivePath}`);
    } catch (tarError) {
        console.warn('⚠️  tar non disponible, backup manuel uniquement');
    }

} catch (error) {
    console.error('❌ Erreur lors du backup:', error);
    process.exit(1);
}
