#!/usr/bin/env node
// analyze_db.js
// Quick analysis tool for Reviews-Maker SQLite DB (server/db/reviews.sqlite)
// Usage: node analyze_db.js [path-to-db]

import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.argv[2] || path.join(process.cwd(), 'db', 'reviews.sqlite');
if (!fs.existsSync(dbPath)) {
  console.error('DB file not found:', dbPath);
  process.exit(2);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) { console.error('Failed to open DB:', err.message); process.exit(3); }
});

function runSql(sql, params=[]) {
  return new Promise((res, rej) => db.get(sql, params, (err, row) => err ? rej(err) : res(row)));
}

(async () => {
  try {
    const total = await runSql('SELECT COUNT(*) as c FROM reviews');
    const nullOwner = await runSql("SELECT COUNT(*) as c FROM reviews WHERE ownerId IS NULL OR ownerId='' ");
    const privateCount = await runSql('SELECT COUNT(*) as c FROM reviews WHERE isPrivate=1');
    const noImage = await runSql("SELECT COUNT(*) as c FROM reviews WHERE imagePath IS NULL OR imagePath='' ");
    const createdNoOwner = await runSql("SELECT id, name, createdAt FROM reviews WHERE ownerId IS NULL OR ownerId='' ORDER BY createdAt DESC LIMIT 20");

    console.log('DB Path:', dbPath);
    console.log('Total reviews:', total?.c || 0);
    console.log('Reviews without ownerId:', nullOwner?.c || 0);
    console.log('Private reviews:', privateCount?.c || 0);
    console.log('Reviews without image:', noImage?.c || 0);
    console.log('\nSample recent reviews without ownerId (id | name | createdAt):');

    db.all("SELECT id, name, createdAt FROM reviews WHERE ownerId IS NULL OR ownerId='' ORDER BY createdAt DESC LIMIT 20", [], (err, rows) => {
      if (err) {
        console.error('Error fetching sample rows:', err.message);
        db.close();
        process.exit(1);
      }
      (rows||[]).forEach(r => console.log(`${r.id} | ${r.name || ''} | ${r.createdAt || ''}`));
      db.close();
    });
  } catch (e) {
    console.error('Analysis failed:', e && e.message ? e.message : e);
    db.close();
    process.exit(1);
  }
})();
