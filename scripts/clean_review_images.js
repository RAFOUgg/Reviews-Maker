#!/usr/bin/env node
// Detect and optionally delete orphaned images in db/review_images
// Usage:
//   node scripts/clean_review_images.js --db db/reviews.sqlite --images db/review_images --dry-run

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { db: path.join('db', 'reviews.sqlite'), images: path.join('db', 'review_images'), dryRun: true };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--db' && args[i+1]) { out.db = args[i+1]; i++; }
    else if (a === '--images' && args[i+1]) { out.images = args[i+1]; i++; }
    else if (a === '--dry-run') { out.dryRun = true; }
    else if (a === '--delete') { out.dryRun = false; }
    else if (a === '--help' || a === '-h') { out.help = true; }
  }
  return out;
}

function usage() {
  console.log('clean_review_images.js - detect/delete orphaned files in db/review_images');
  console.log('Options:');
  console.log('  --db <path>       path to sqlite DB (default: db/reviews.sqlite)');
  console.log('  --images <path>   images directory (default: db/review_images)');
  console.log('  --dry-run         only list files (default)');
  console.log('  --delete          actually delete orphan files');
  console.log('  -h, --help        show this help');
}

async function main() {
  const opts = parseArgs();
  if (opts.help) { usage(); process.exit(0); }

  const dbPath = path.resolve(opts.db);
  const imagesDir = path.resolve(opts.images);

  if (!fs.existsSync(dbPath)) {
    console.error('DB not found at', dbPath);
    process.exit(2);
  }
  if (!fs.existsSync(imagesDir)) {
    console.error('Images dir not found at', imagesDir);
    process.exit(2);
  }

  console.log('DB:', dbPath);
  console.log('Images dir:', imagesDir);
  console.log('Mode:', opts.dryRun ? 'dry-run (no delete)' : 'delete');

  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Failed to open DB:', err.message);
      process.exit(3);
    }
  });

  const referenced = new Set();

  function collectFromRow(row) {
    try {
      if (row.imagePath) {
        referenced.add(path.basename(row.imagePath));
      }
      if (row.data) {
        let d = null;
        try { d = JSON.parse(row.data); } catch {}
        if (d) {
          const candidates = [];
          if (d.image) candidates.push(d.image);
          if (d.imagePath) candidates.push(d.imagePath);
          // sometimes image stored under different key names
          for (const val of candidates) {
            if (!val) continue;
            try {
              const bn = path.basename(String(val));
              if (bn) referenced.add(bn);
            } catch {}
          }
        }
      }
    } catch (e) {}
  }

  db.serialize(() => {
    db.each('SELECT imagePath, data FROM reviews', [], (err, row) => {
      if (err) return; collectFromRow(row);
    }, async (err, count) => {
      // after collecting, scan images dir
      try {
        const files = await fs.promises.readdir(imagesDir);
        const orphans = [];
        for (const f of files) {
          const full = path.join(imagesDir, f);
          const stat = await fs.promises.stat(full);
          if (!stat.isFile()) continue;
          if (!referenced.has(f)) orphans.push(f);
        }

        console.log('\nFound', orphans.length, 'orphaned images:');
        for (const o of orphans) console.log('  ', o);

        if (orphans.length === 0) {
          console.log('Nothing to do.');
          db.close();
          return;
        }

        if (!opts.dryRun) {
          for (const o of orphans) {
            const p = path.join(imagesDir, o);
            try {
              await fs.promises.unlink(p);
              console.log('Deleted', o);
            } catch (e) {
              console.error('Failed to delete', o, e && e.message);
            }
          }
        } else {
          console.log('\nDry-run mode: no files were deleted. To remove them, run with --delete');
        }
      } catch (e) {
        console.error('Error scanning images dir:', e && e.message);
      } finally {
        db.close();
      }
    });
  });
}

main().catch((e) => { console.error(e && e.stack || e); process.exit(1); });
