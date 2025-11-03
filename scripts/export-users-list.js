#!/usr/bin/env node

/**
 * Export de la liste des utilisateurs avant migration
 * Crée un fichier JSON avec tous les Discord IDs et statistiques
 */

import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, '..', 'db', 'reviews.sqlite');
const OUTPUT_FILE = path.join(__dirname, '..', 'backups', 'users-export.json');

console.log('📊 Export des utilisateurs Reviews-Maker');
console.log('═'.repeat(60));

if (!fs.existsSync(DB_FILE)) {
    console.error('❌ Fichier reviews.sqlite introuvable');
    process.exit(1);
}

const db = new sqlite3.Database(DB_FILE, sqlite3.OPEN_READONLY);

db.all(`
  SELECT 
    ownerId as discordId,
    COUNT(*) as totalReviews,
    SUM(CASE WHEN isDraft = 1 THEN 1 ELSE 0 END) as drafts,
    SUM(CASE WHEN isPrivate = 1 THEN 1 ELSE 0 END) as privateReviews,
    SUM(CASE WHEN isDraft = 0 THEN 1 ELSE 0 END) as publishedReviews,
    MIN(createdAt) as firstReview,
    MAX(createdAt) as lastReview
  FROM reviews
  GROUP BY ownerId
  ORDER BY totalReviews DESC
`, [], (err, rows) => {
    if (err) {
        console.error('❌ Erreur requête:', err);
        db.close();
        process.exit(1);
    }

    const exportData = {
        exportDate: new Date().toISOString(),
        totalUsers: rows.length,
        totalReviews: rows.reduce((sum, r) => sum + r.totalReviews, 0),
        users: rows.map(row => ({
            discordId: row.discordId,
            stats: {
                total: row.totalReviews,
                published: row.publishedReviews,
                drafts: row.drafts,
                private: row.privateReviews,
            },
            dates: {
                firstReview: row.firstReview,
                lastReview: row.lastReview,
            },
        })),
    };

    // Sauvegarder JSON
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(exportData, null, 2));

    console.log(`✅ Export terminé: ${rows.length} utilisateurs`);
    console.log(`📁 Fichier: ${OUTPUT_FILE}`);
    console.log('\n📊 Statistiques:');
    console.log(`   - Utilisateurs uniques: ${exportData.totalUsers}`);
    console.log(`   - Total reviews: ${exportData.totalReviews}`);
    console.log(`   - Moyenne par user: ${(exportData.totalReviews / exportData.totalUsers).toFixed(1)}`);

    // Top 5 utilisateurs
    console.log('\n🏆 Top 5 utilisateurs:');
    rows.slice(0, 5).forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.discordId.slice(0, 12)}... (${row.totalReviews} reviews)`);
    });

    db.close();
});
