import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import 'dotenv/config';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, '..', 'db', 'reviews.sqlite');
const IMAGE_DIR = path.join(__dirname, '..', 'db', 'review_images');
fs.mkdirSync(IMAGE_DIR, { recursive: true });
// Tokens directory: drop files named <token> with content as ownerId (e.g., Discord user or LaFoncedalle account ID)
const TOKENS_DIR = path.join(__dirname, '..', 'server', 'tokens');
fs.mkdirSync(TOKENS_DIR, { recursive: true });

// LaFoncedalle API Configuration
const LAFONCEDALLE_API_URL = process.env.LAFONCEDALLE_API_URL || 'http://localhost:5000'; // URL de l'API LaFoncedalle
const LAFONCEDALLE_API_KEY = process.env.LAFONCEDALLE_API_KEY || 'your-api-key'; // Clé API pour authentifier les requêtes
// Log explicit de la configuration pour faciliter le debug (PM2 / docker / .env)
console.log(`[CONFIG] LAFONCEDALLE_API_URL=${LAFONCEDALLE_API_URL}`);

// LaFoncedalleBot Database Configuration (nouvelle architecture)
// IMPORTANT: Sur le VPS, définir LAFONCEDALLE_DB_FILE avec le chemin absolu vers la DB du bot
// Exemple: /home/user/lafoncedallebot/db/data.db
const LAFONCEDALLE_DB_FILE = process.env.LAFONCEDALLE_DB_FILE;

if (!LAFONCEDALLE_DB_FILE) {
  console.warn('[CONFIG] LAFONCEDALLE_DB_FILE non défini - utilisation de la DB directe désactivée');
}
else {
  // explicit startup log to help debugging env issues under PM2
  console.log(`[CONFIG] LAFONCEDALLE_DB_FILE configuré: ${LAFONCEDALLE_DB_FILE}`);
}

// Email auth: store verification codes temporarily (in production, use Redis)
const verificationCodes = new Map(); // email -> {code, expires, attempts, discordUser}
const CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

// Storage config for images
// ...existing code...

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGE_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '.png');
    cb(null, unique + ext);
  }
});
const upload = multer({ storage });

// DB init
sqlite3.verbose();
const db = new sqlite3.Database(DB_FILE);

// Create table if not exists
const INIT_SQL = `CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productType TEXT,
  name TEXT,
  data JSON NOT NULL,
  imagePath TEXT,
  ownerId TEXT,
  isDraft INTEGER DEFAULT 1,
  isPrivate INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);`;

db.serialize(() => {
  db.run(INIT_SQL);
  // Idempotent migration for existing databases missing new columns
  db.all("PRAGMA table_info('reviews')", [], (err, rows) => {
    if (err) { console.warn('[db] PRAGMA table_info error', err); return; }
    const cols = new Set((rows || []).map(r => r.name));
    const addCol = (name, defSql, after = null) => new Promise(res => {
      if (cols.has(name)) return res(true);
      const sql = `ALTER TABLE reviews ADD COLUMN ${defSql}`;
      db.run(sql, [], (e) => {
        if (e) { console.warn(`[db] ALTER TABLE add ${name} failed`, e.message); }
        else { console.log(`[db] Added column ${name}`); cols.add(name); }
        res(!e);
      });
    });
    (async () => {
      // Ensure columns exist
      await addCol('ownerId', "ownerId TEXT");
      await addCol('isDraft', "isDraft INTEGER DEFAULT 0");
      await addCol('isPrivate', "isPrivate INTEGER DEFAULT 0");
      await addCol('createdAt', "createdAt TEXT");
      await addCol('updatedAt', "updatedAt TEXT");
      // Ensure review_likes table exists (idempotent)
      try {
        db.run(`CREATE TABLE IF NOT EXISTS review_likes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reviewId INTEGER NOT NULL,
          ownerId TEXT NOT NULL,
          vote INTEGER NOT NULL,
          createdAt TEXT DEFAULT (datetime('now')),
          updatedAt TEXT DEFAULT (datetime('now'))
        );`, [], (e) => {
          if (e) console.warn('[db] create review_likes failed', e.message);
          else console.log('[db] ensured review_likes table');
        });
        db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_review_owner ON review_likes(reviewId, ownerId)', [], () => {});
      } catch (e) { console.warn('[db] review_likes migration error', e && e.message ? e.message : e); }
      // Backfill sensible defaults for existing rows (NULLs only)
      db.run("UPDATE reviews SET isDraft=0 WHERE isDraft IS NULL", () => {});
      db.run("UPDATE reviews SET isPrivate=0 WHERE isPrivate IS NULL", () => {});
      db.run("UPDATE reviews SET createdAt=datetime('now') WHERE createdAt IS NULL", () => {});
      db.run("UPDATE reviews SET updatedAt=datetime('now') WHERE updatedAt IS NULL", () => {});
    })();
  });
});


const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
// Expose images for front-end compatibility (corrigé)
app.use('/reviews/images', express.static(IMAGE_DIR));

app.use('/images', express.static(IMAGE_DIR));
app.use(express.static(path.join(__dirname, '..'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
})); // servir les fichiers front
// Support hosting the frontend under a base path like /reviews by
// transparently rewriting requests sent to /reviews/api/* -> /api/*
// This keeps the frontend code unchanged (it detects basePath=/reviews)
// while the server continues to register routes at /api/*.
app.use((req, _res, next) => {
  try {
    if (req.path && req.path.startsWith('/reviews/api/')) {
      // remove the leading /reviews prefix so routes match /api/...
      req.url = req.url.replace(/^\/reviews/, '');
      // optionally log for debugging (kept minimal)
      console.debug('[path-rewrite] Rewrote request to', req.url);
    }
  } catch (e) {}
  next();
});
// Auth middleware (optional): accepts X-Auth-Token header; matches file in tokens dir
function resolveOwnerIdFromToken(token) {
  if (!token) return null;
  try {
    const file = path.join(TOKENS_DIR, token);
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8').trim();
      // support JSON { ownerId: "..", roles: ["staff"], discordId: "...", discordUsername: "..." }
      try {
        const js = JSON.parse(content);
        if (js && (js.ownerId || js.roles)) {
          return {
            ownerId: js.ownerId,
            roles: Array.isArray(js.roles) ? js.roles : [],
            discordId: js.discordId || null,
            discordUsername: js.discordUsername || null
          };
        }
      } catch {}
      return { ownerId: content || token, roles: [], discordId: null, discordUsername: null };
    }
  } catch {}
  return null;
}

app.use((req, _res, next) => {
  const token = req.header('X-Auth-Token') || req.query.token;
  const info = resolveOwnerIdFromToken(token);
  let ownerId = null; 
  let roles = [];
  let discordId = null;
  let discordUsername = null;
  
  if (info && typeof info === 'object') { 
    ownerId = info.ownerId || null; 
    roles = Array.isArray(info.roles) ? info.roles : [];
    discordId = info.discordId || null;
    discordUsername = info.discordUsername || null;
  }
  else if (typeof info === 'string') { 
    ownerId = info; 
  }
  
  req.auth = { token: token || null, ownerId, roles, discordId, discordUsername };
  next();
});

// Helpers
function rowToReview(row) {
  if (!row) return null;
  let payload = {};
  try { payload = JSON.parse(row.data); } catch {}
  if (row.imagePath && !payload.image) {
    payload.image = '/images/' + path.basename(row.imagePath);
  }
  payload.id = row.id;
  payload.createdAt = row.createdAt;
  payload.updatedAt = row.updatedAt;
  if (row.ownerId) payload.ownerId = row.ownerId;
  if (row.isPrivate != null) payload.isPrivate = !!row.isPrivate;
  return payload;
}

// Routes
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

app.get('/api/reviews', (req, res) => {
  const me = req.auth?.ownerId || null;
  // Public: everyone can see non-drafts; drafts are only visible to their owner
  // public (no token): only published and not private
  // with token (non-staff): published and not private, plus own (draft or private)
  // staff: everything
  let sql, params;
  const isStaff = req.auth?.roles?.includes('staff');
  if (isStaff) {
    sql = 'SELECT * FROM reviews ORDER BY updatedAt DESC LIMIT 500';
    params = [];
  } else if (me) {
    // Visibility no longer depends on a draft flag; owners always see their records, others see non-private
    sql = 'SELECT * FROM reviews WHERE (isPrivate=0) OR (ownerId=?) ORDER BY updatedAt DESC LIMIT 500';
    params = [me];
  } else {
    sql = 'SELECT * FROM reviews WHERE isPrivate=0 ORDER BY updatedAt DESC LIMIT 500';
    params = [];
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows.map(rowToReview));
  });
});

app.get('/api/reviews/:id', (req, res) => {
  db.get('SELECT * FROM reviews WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (!row) return res.status(404).json({ error: 'not_found' });
    // Private visibility: non-staff must be owner to view private reviews
    const isStaff = req.auth?.roles?.includes('staff');
    if (!isStaff && row.isPrivate && (!req.auth?.ownerId || row.ownerId !== req.auth.ownerId)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    res.json(rowToReview(row));
  });
});

// Create
app.post('/api/reviews', upload.single('image'), (req, res) => {
  let incoming = {};
  if (req.body.data) {
    try { incoming = JSON.parse(req.body.data); } catch {}
  } else {
    incoming = req.body;
  }
  // Validation serveur: holderName requis
  if (!incoming.holderName || String(incoming.holderName).trim().length === 0) {
    return res.status(400).json({ error: 'validation_error', field: 'holderName', message: 'Titulaire requis' });
  }
  // Owner scoping
  const ownerId = req.auth?.ownerId || null;
  // Draft flag is deprecated on the server; force saved records to non-draft
  const isDraft = 0;
  const isPrivate = incoming.isPrivate ? 1 : 0;
  if (req.file) {
    incoming.image = '/images/' + req.file.filename;
  }
  const productType = incoming.productType || null;
  const name = incoming.name || incoming.cultivars || incoming.productName || null;
  const json = JSON.stringify(incoming);
  db.run('INSERT INTO reviews (productType, name, data, imagePath, ownerId, isDraft, isPrivate) VALUES (?,?,?,?,?,?,?)',
    [productType, name, json, req.file ? req.file.path : null, ownerId, isDraft, isPrivate],
    function(err) {
      if (err) return res.status(500).json({ error: 'db_error' });
      db.get('SELECT * FROM reviews WHERE id=?', [this.lastID], (e2, row) => {
        if (e2) return res.status(500).json({ error: 'db_error' });
        res.json({ review: rowToReview(row) });
      });
    });
});

// Update
app.put('/api/reviews/:id', upload.single('image'), (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM reviews WHERE id=?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (!row) return res.status(404).json({ error: 'not_found' });
    // Ownership enforcement: only owner can update
    const ownerId = req.auth?.ownerId || null;
    if (row.ownerId && ownerId && row.ownerId !== ownerId) {
      return res.status(403).json({ error: 'forbidden' });
    }
    if (row.ownerId && !ownerId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    let incoming = {};
    if (req.body.data) {
      try { incoming = JSON.parse(req.body.data); } catch {}
    } else { incoming = req.body; }
    // Validation serveur: si holderName fourni ou déjà existant, s'assurer qu'il est non vide
    const existing = JSON.parse(row.data || '{}');
    const holderName = (incoming.holderName ?? existing.holderName);
    if (!holderName || String(holderName).trim().length === 0) {
      return res.status(400).json({ error: 'validation_error', field: 'holderName', message: 'Titulaire requis' });
    }
    if (req.file) incoming.image = '/images/' + req.file.filename;

    // Preserve/override draft status
  // Draft flag is deprecated: always store as non-draft on update as well
  const nextIsDraft = 0;
  const nextIsPrivate = incoming.isPrivate != null ? (incoming.isPrivate ? 1 : 0) : row.isPrivate;
    const nextOwnerId = row.ownerId || ownerId || null;

    const merged = { ...JSON.parse(row.data), ...incoming };
    const json = JSON.stringify(merged);
    const newImagePath = req.file ? req.file.path : row.imagePath;

    db.run('UPDATE reviews SET productType=?, name=?, data=?, imagePath=?, ownerId=?, isDraft=?, isPrivate=?, updatedAt=datetime(\'now\') WHERE id=?',
      [merged.productType || null, merged.name || merged.cultivars || merged.productName || null, json, newImagePath, nextOwnerId, nextIsDraft, nextIsPrivate, id],
      function(e2) {
        if (e2) return res.status(500).json({ error: 'db_error' });
        db.get('SELECT * FROM reviews WHERE id=?', [id], (e3, row2) => {
          if (e3) return res.status(500).json({ error: 'db_error' });
          res.json({ review: rowToReview(row2) });
        });
      });
  });
});

// Delete
app.delete('/api/reviews/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT imagePath, ownerId FROM reviews WHERE id=?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (!row) return res.status(404).json({ error: 'not_found' });
    const ownerId = req.auth?.ownerId || null;
    const isStaff = req.auth?.roles?.includes('staff');
    if (!isStaff && row.ownerId && ownerId && row.ownerId !== ownerId) {
      return res.status(403).json({ error: 'forbidden' });
    }
    if (!isStaff && row.ownerId && !ownerId) {
      return res.status(403).json({ error: 'forbidden' });
    }
    db.run('DELETE FROM reviews WHERE id=?', [id], (e2) => {
      if (e2) return res.status(500).json({ error: 'db_error' });
      // Supprimer le fichier image référencé par imagePath
      try {
        if (row.imagePath) {
          const imgFile = path.isAbsolute(row.imagePath)
            ? row.imagePath
            : path.join(IMAGE_DIR, path.basename(row.imagePath));
          try {
            if (fs.existsSync(imgFile)) {
              // use synchronous unlink and log any error so ops can diagnose
              fs.unlinkSync(imgFile);
              console.log('[DELETE] Removed image:', imgFile);
            } else {
              console.debug('[DELETE] Image file not found (already removed?):', imgFile);
            }
          } catch (e) {
            console.warn('[DELETE] Failed to remove image', imgFile, e && e.message ? e.message : e);
          }
        }
      } catch (e) {
        console.warn('[DELETE] Unexpected error while removing image:', e && e.message ? e.message : e);
      }
      res.json({ ok: true });
    });
  });
});

// Public gallery (explicit) — identical to GET /api/reviews without token
app.get('/api/public/reviews', (req, res) => {
  // Serve non-private reviews; draft concept deprecated
  db.all('SELECT * FROM reviews WHERE isPrivate=0 ORDER BY updatedAt DESC LIMIT 500', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows.map(rowToReview));
  });
});

// My reviews — requires token; returns all mine (draft/private included)
app.get('/api/my/reviews', (req, res) => {
  const me = req.auth?.ownerId;
  if (!me) return res.status(401).json({ error: 'unauthorized' });
  db.all('SELECT * FROM reviews WHERE ownerId=? ORDER BY updatedAt DESC LIMIT 500', [me], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows.map(rowToReview));
  });
});

// Admin stats — staff only
app.get('/api/admin/stats', (req, res) => {
  const isStaff = req.auth?.roles?.includes('staff');
  if (!isStaff) return res.status(403).json({ error: 'forbidden' });
  db.get('SELECT COUNT(*) as total FROM reviews', [], (e1, r1) => {
    // Drafts no longer tracked separately in stats (frontend saves non-draft)
    db.get('SELECT COUNT(*) as privates FROM reviews WHERE isPrivate=1', [], (e3, r3) => {
      res.json({ total: r1?.total || 0, privates: r3?.privates || 0 });
    });
  });
});

// Admin tokens list — staff only (read-only list of token filenames)
app.get('/api/admin/tokens', (req, res) => {
  const isStaff = req.auth?.roles?.includes('staff');
  if (!isStaff) return res.status(403).json({ error: 'forbidden' });
  try {
    const files = fs.readdirSync(TOKENS_DIR).filter(f => !f.startsWith('.'));
    res.json({ tokens: files });
  } catch (e) {
    res.status(500).json({ error: 'fs_error' });
  }
});

// Update privacy — owner or staff
app.put('/api/reviews/:id/privacy', (req, res) => {
  const id = req.params.id;
  const isStaff = req.auth?.roles?.includes('staff');
  const me = req.auth?.ownerId || null;
  db.get('SELECT ownerId FROM reviews WHERE id=?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (!row) return res.status(404).json({ error: 'not_found' });
    if (!isStaff && (!me || row.ownerId !== me)) return res.status(403).json({ error: 'forbidden' });
    const value = req.body && typeof req.body.isPrivate !== 'undefined' ? (req.body.isPrivate ? 1 : 0) : 0;
    db.run('UPDATE reviews SET isPrivate=?, updatedAt=datetime(\'now\') WHERE id=?', [value, id], (e2) => {
      if (e2) return res.status(500).json({ error: 'db_error' });
      db.get('SELECT * FROM reviews WHERE id=?', [id], (e3, row2) => {
        if (e3 || !row2) return res.status(500).json({ error: 'db_error' });
        res.json({ review: rowToReview(row2) });
      });
    });
  });
});

// Votes: get totals and my vote
app.get('/api/reviews/:id/votes', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid_id' });
  const tokenOwner = req.auth?.ownerId || null;
  db.get('SELECT SUM(CASE WHEN vote=1 THEN 1 ELSE 0 END) as likes, SUM(CASE WHEN vote=-1 THEN 1 ELSE 0 END) as dislikes FROM review_likes WHERE reviewId=?', [id], (err, agg) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    const likes = (agg && agg.likes) ? agg.likes : 0;
    const dislikes = (agg && agg.dislikes) ? agg.dislikes : 0;
    if (!tokenOwner) {
      return res.json({ likes, dislikes, score: (likes - dislikes), myVote: 0 });
    }
    db.get('SELECT vote FROM review_likes WHERE reviewId=? AND ownerId=?', [id, tokenOwner], (e2, row) => {
      if (e2) return res.status(500).json({ error: 'db_error' });
      const myVote = row && typeof row.vote === 'number' ? row.vote : 0;
      res.json({ likes, dislikes, score: (likes - dislikes), myVote });
    });
  });
});

// Cast or change vote (auth required)
app.post('/api/reviews/:id/vote', (req, res) => {
  const id = Number(req.params.id);
  const me = req.auth?.ownerId || null;
  if (!me) return res.status(401).json({ error: 'unauthorized' });
  if (!id) return res.status(400).json({ error: 'invalid_id' });
  let vote = Number(req.body && req.body.vote);
  if (![1, -1].includes(vote)) return res.status(400).json({ error: 'invalid_vote' });
  // Can't vote own review
  db.get('SELECT ownerId FROM reviews WHERE id=?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (!row) return res.status(404).json({ error: 'not_found' });
    if (row.ownerId && row.ownerId === me) return res.status(403).json({ error: 'forbidden', message: 'Cannot vote own review' });
    // Upsert logic: try update, else insert
    db.run('INSERT INTO review_likes (reviewId, ownerId, vote, createdAt, updatedAt) VALUES (?,?,?,?,datetime(\'now\')) ON CONFLICT(reviewId, ownerId) DO UPDATE SET vote=excluded.vote, updatedAt=datetime(\'now\')', [id, me, vote, new Date().toISOString()], function(e) {
      // Fallback for SQLite versions without INSERT ... ON CONFLICT DO UPDATE use manual upsert
      if (e) {
        // manual upsert
        db.get('SELECT id FROM review_likes WHERE reviewId=? AND ownerId=?', [id, me], (e2, r2) => {
          if (e2) return res.status(500).json({ error: 'db_error' });
          if (r2) {
            db.run('UPDATE review_likes SET vote=?, updatedAt=datetime(\'now\') WHERE id=?', [vote, r2.id], (eu) => {
              if (eu) return res.status(500).json({ error: 'db_error' });
              // return totals
              db.get('SELECT SUM(CASE WHEN vote=1 THEN 1 ELSE 0 END) as likes, SUM(CASE WHEN vote=-1 THEN 1 ELSE 0 END) as dislikes FROM review_likes WHERE reviewId=?', [id], (er, agg) => {
                if (er) return res.status(500).json({ error: 'db_error' });
                res.json({ ok: true, myVote: vote, likes: agg.likes || 0, dislikes: agg.dislikes || 0 });
              });
            });
          } else {
            db.run('INSERT INTO review_likes (reviewId, ownerId, vote) VALUES (?,?,?)', [id, me, vote], (ei) => {
              if (ei) return res.status(500).json({ error: 'db_error' });
              db.get('SELECT SUM(CASE WHEN vote=1 THEN 1 ELSE 0 END) as likes, SUM(CASE WHEN vote=-1 THEN 1 ELSE 0 END) as dislikes FROM review_likes WHERE reviewId=?', [id], (er, agg) => {
                if (er) return res.status(500).json({ error: 'db_error' });
                res.json({ ok: true, myVote: vote, likes: agg.likes || 0, dislikes: agg.dislikes || 0 });
              });
            });
          }
        });
        return;
      }
      // If we reach here, INSERT ... ON CONFLICT succeeded
      db.get('SELECT SUM(CASE WHEN vote=1 THEN 1 ELSE 0 END) as likes, SUM(CASE WHEN vote=-1 THEN 1 ELSE 0 END) as dislikes FROM review_likes WHERE reviewId=?', [id], (er, agg) => {
        if (er) return res.status(500).json({ error: 'db_error' });
        res.json({ ok: true, myVote: vote, likes: agg.likes || 0, dislikes: agg.dislikes || 0 });
      });
    });
  });
});

// Remove vote (auth required)
app.delete('/api/reviews/:id/vote', (req, res) => {
  const id = Number(req.params.id);
  const me = req.auth?.ownerId || null;
  if (!me) return res.status(401).json({ error: 'unauthorized' });
  if (!id) return res.status(400).json({ error: 'invalid_id' });
  db.run('DELETE FROM review_likes WHERE reviewId=? AND ownerId=?', [id, me], function(err) {
    if (err) return res.status(500).json({ error: 'db_error' });
    db.get('SELECT SUM(CASE WHEN vote=1 THEN 1 ELSE 0 END) as likes, SUM(CASE WHEN vote=-1 THEN 1 ELSE 0 END) as dislikes FROM review_likes WHERE reviewId=?', [id], (er, agg) => {
      if (er) return res.status(500).json({ error: 'db_error' });
      res.json({ ok: true, myVote: 0, likes: agg.likes || 0, dislikes: agg.dislikes || 0 });
    });
  });
});

// Leaderboard (owners ranked by score on public reviews)
app.get('/api/users/leaderboard', (req, res) => {
  const limit = Number(req.query.limit) || 50;
  // Sum votes on reviews joined with reviews table to limit to public reviews
  const sql = `SELECT r.ownerId as ownerId, SUM(rl.vote) as score, COUNT(DISTINCT r.id) as reviewCount,
    SUM(CASE WHEN rl.vote=1 THEN 1 ELSE 0 END) as likesReceived,
    SUM(CASE WHEN rl.vote=-1 THEN 1 ELSE 0 END) as dislikesReceived
    FROM review_likes rl
    JOIN reviews r ON r.id = rl.reviewId
    WHERE r.isPrivate=0 AND r.ownerId IS NOT NULL
    GROUP BY r.ownerId
    ORDER BY score DESC
    LIMIT ?`;
  db.all(sql, [limit], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows || []);
  });
});

// User stats by email/ownerId
app.get('/api/users/stats', async (req, res) => {
  const email = req.query.email || req.query.ownerId || null;
  const tokenOwner = req.auth?.ownerId || null;
  if (!email) return res.status(400).json({ error: 'missing_param', message: 'email or ownerId required' });
  const owner = String(email).toLowerCase();
  try {
    // Basic review counts
    db.get('SELECT COUNT(*) as total, SUM(CASE WHEN isPrivate=0 THEN 1 ELSE 0 END) as pub, SUM(CASE WHEN isPrivate=1 THEN 1 ELSE 0 END) as priv FROM reviews WHERE LOWER(ownerId)=?', [owner], (err, agg) => {
      if (err) return res.status(500).json({ error: 'db_error' });
      const total = agg?.total || 0;
      const pub = agg?.pub || 0;
      const priv = agg?.priv || 0;
      // by_type
      db.all('SELECT COALESCE(r.productType, "Autre") as type, COUNT(*) as cnt FROM reviews r WHERE LOWER(r.ownerId)=? GROUP BY type', [owner], (e2, rows) => {
        if (e2) return res.status(500).json({ error: 'db_error' });
        const by_type = {};
        (rows || []).forEach(r => by_type[r.type || 'Autre'] = r.cnt || 0);
        // likes/dislikes RECEIVED on their reviews (only public reviews counted)
        const sqlReceived = `SELECT SUM(CASE WHEN rl.vote=1 THEN 1 ELSE 0 END) as likes, SUM(CASE WHEN rl.vote=-1 THEN 1 ELSE 0 END) as dislikes FROM review_likes rl JOIN reviews r ON r.id=rl.reviewId WHERE LOWER(r.ownerId)=? AND r.isPrivate=0`;
        db.get(sqlReceived, [owner], (e3, agg2) => {
          if (e3) return res.status(500).json({ error: 'db_error' });
          const likesReceived = agg2?.likes || 0;
          const dislikesReceived = agg2?.dislikes || 0;
          // votes given by this owner
          db.get('SELECT SUM(CASE WHEN vote=1 THEN 1 ELSE 0 END) as givenLikes, SUM(CASE WHEN vote=-1 THEN 1 ELSE 0 END) as givenDislikes FROM review_likes WHERE LOWER(ownerId)=?', [owner], (e4, agg3) => {
            if (e4) return res.status(500).json({ error: 'db_error' });
            const votesGivenLikes = agg3?.givenLikes || 0;
            const votesGivenDislikes = agg3?.givenDislikes || 0;
            // Try to resolve displayName via LaFoncedalle (best-effort)
            (async () => {
              let displayName = null;
              try {
                const discord = await getDiscordUserByEmail(owner).catch(() => null);
                if (discord) displayName = discord.username || null;
              } catch (e) {}
              return res.json({ total, public: pub, private: priv, by_type, displayName, email: owner, likesReceived, dislikesReceived, votesGivenLikes, votesGivenDislikes });
            })();
          });
        });
      });
    });
  } catch (e) {
    console.warn('users/stats error', e && e.message ? e.message : e);
    res.status(500).json({ error: 'server_error' });
  }
});

// ============================================================================
// EMAIL AUTHENTICATION ROUTES
// ============================================================================

// Helper: Generate 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: Query LaFoncedalleBot database directly (nouvelle architecture)
async function getDiscordUserFromDB(email) {
  // Vérifier si la DB est configurée
  if (!LAFONCEDALLE_DB_FILE) {
    console.log('[LaFoncedalle][DB] DB path not configured, skipping direct DB query');
    return null;
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(LAFONCEDALLE_DB_FILE, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.warn('[LaFoncedalle][DB] Could not open LaFoncedalleBot database:', err.message);
        return resolve(null);
      }
      
      db.get(
        "SELECT discord_id, user_email, user_name FROM user_links WHERE LOWER(user_email) = ? AND active = 1",
        [email.toLowerCase()],
        (err, row) => {
          db.close();
          
          if (err) {
            console.warn('[LaFoncedalle][DB] Query error:', err.message);
            return resolve(null);
          }
          
          if (!row) {
            console.log(`[LaFoncedalle][DB] Email ${email} not found in database`);
            return resolve(null);
          }
          
          const username = row.user_name || `User#${row.discord_id.slice(-4)}`;
          
          console.log(`[LaFoncedalle][DB] Found user: ${username} (${row.discord_id})`);
          
          resolve({
            discordId: row.discord_id,
            username: username,
            email: row.user_email
          });
        }
      );
    });
  });
}

// Helper: Verify email against Discord bot database and get Discord user info
// The LaFoncedalleBot API has evolved over time; to be resilient we try several
// candidate endpoints/methods and normalize the returned user object.
// Nouvelle architecture: Try database first, then API as fallback
async function getDiscordUserByEmail(email) {
  // 1. Try database first (nouvelle architecture)
  try {
    const dbUser = await getDiscordUserFromDB(email);
    if (dbUser) {
      return dbUser;
    }
  } catch (err) {
    console.warn('[LaFoncedalle] Database query failed, trying API:', err.message);
  }
  
  // 2. Fallback to API calls (legacy)
  const candidates = [
    { method: 'POST', path: '/api/discord/user-by-email', body: { email } },
    { method: 'POST', path: '/api/users/find-by-email', body: { email } },
    { method: 'GET', path: `/api/users?email=${encodeURIComponent(email)}` },
    { method: 'POST', path: '/api/user/by-email', body: { email } },
    // legacy / alternate
    { method: 'POST', path: '/api/discord/find_user', body: { email } }
  ];

  let lastError = null;
  for (const cand of candidates) {
    try {
      const url = LAFONCEDALLE_API_URL.replace(/\/$/, '') + cand.path;
      const opts = { method: cand.method, headers: { 'Authorization': `Bearer ${LAFONCEDALLE_API_KEY}` } };
      if (cand.method === 'POST') {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(cand.body || {});
      }

      const response = await fetch(url, opts);

      // If 404 => not found for this endpoint / email
      if (response.status === 404) {
        // try next candidate
        lastError = new Error('not_found');
        continue;
      }

      // Some deployments may return HTML error pages (502/404) — handle gracefully
      const ct = response.headers.get('content-type') || '';
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.warn(`[LaFoncedalle] ${cand.method} ${cand.path} returned ${response.status}: ${String(text).slice(0,200)}`);
        lastError = new Error(`status_${response.status}`);
        continue;
      }

      // Try parse JSON, but accept text and attempt to extract JSON-looking content
      let data = null;
      if (ct.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try { data = JSON.parse(text); } catch (e) { data = null; }
      }

      if (!data) {
        // If endpoint returns a wrapped object like { user: { ... } }
        // attempt to detect JSON-like string in text body
        lastError = new Error('invalid_json');
        continue;
      }

      // Normalize various possible field names to a common shape
      const user = data.user || data.data || data;
      const normalized = {
        discordId: user.discordId || user.discord_id || user.id || user.user_id || user.discord || null,
        username: user.username || user.user_name || user.displayName || user.name || user.discord_username || null,
        email: user.email || user.mail || email
      };

      // If there's no discord id, treat as not found
      if (!normalized.discordId && !normalized.username) {
        lastError = new Error('not_found');
        continue;
      }

      return normalized;
    } catch (err) {
      console.warn('[LaFoncedalle] candidate lookup failed', cand.path, err && err.message ? err.message : err);
      lastError = err;
      continue;
    }
  }

  // If all candidates failed and lastError indicates not_found -> return null
  if (lastError && lastError.message === 'not_found') return null;
  // otherwise propagate a generic error
  if (lastError) {
    console.error('[Discord] All lookup attempts failed:', lastError.message || lastError);
    throw lastError;
  }
  return null;
}

// Helper: Send verification email via LaFoncedalle mailing service
async function sendVerificationEmail(email, code) {
  // Try several possible mail endpoints (APIs vary across deployments)
  // Build an email-safe HTML body (table-based, inline styles) to improve rendering
  const safeHtml = `<!doctype html>
  <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding:20px 0;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;">
        <tr><td style="padding:18px 22px 8px 22px;color:#111;">
          <h2 style="margin:0;font-size:18px;color:#0f1724;">🔒 Code de vérification Reviews Maker</h2>
          <p style="margin:8px 0 0 0;color:#4b5563;font-size:14px;">Bonjour, voici votre code de vérification. Il expire dans 10 minutes.</p>
        </td></tr>
        <tr><td align="center" style="padding:18px 22px 22px 22px;background:#0f1628;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="background:#0f1628;border-radius:8px;padding:18px 24px;">
            <tr><td style="color:#fff;font-size:28px;letter-spacing:4px;text-align:center;font-weight:700;">${code}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:14px 22px 20px 22px;color:#555;font-size:13px;line-height:1.4;">Si vous n'avez pas demandé ce code, ignorez ce message.</td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;

  const plainText = `Code de vérification Reviews Maker\n\nVotre code : ${code}\n\nCe code expire dans 10 minutes. Si vous n'avez pas demandé ce code, ignorez ce message.`;

  const candidates = [
    { method: 'POST', path: '/api/mail/send-verification', body: { to: email, code, subject: 'Code de vérification Reviews Maker', appName: 'Reviews Maker', expiryMinutes: 10, html: safeHtml, text: plainText } },
    { method: 'POST', path: '/api/email/send', body: { to: email, code, subject: 'Code de vérification Reviews Maker', html: safeHtml, text: plainText } },
    { method: 'POST', path: '/api/notify/send-verification', body: { to: email, code, html: safeHtml, text: plainText } }
  ];

  let lastErr = null;
  for (const cand of candidates) {
    try {
      const url = LAFONCEDALLE_API_URL.replace(/\/$/, '') + cand.path;
      const opts = { method: cand.method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LAFONCEDALLE_API_KEY}` }, body: JSON.stringify(cand.body || {}) };
      const response = await fetch(url, opts);
      if (!response.ok) {
        const txt = await response.text().catch(() => '');
        console.warn(`[LaFoncedalle][mail] ${cand.path} returned ${response.status}: ${String(txt).slice(0,200)}`);
        lastErr = new Error(`status_${response.status}`);
        continue;
      }
      const ct = response.headers.get('content-type') || '';
      let result = null;
      if (ct.includes('application/json')) result = await response.json();
      else {
        const t = await response.text();
        try { result = JSON.parse(t); } catch { result = { ok: true }; }
      }
      console.log(`[EMAIL] Verification code sent to ${email} via LaFoncedalle (${cand.path})`);
      return result;
    } catch (err) {
      console.warn('[EMAIL] candidate failed', cand.path, err && err.message ? err.message : err);
      lastErr = err;
      continue;
    }
  }

  console.error('[EMAIL] All mail endpoints failed:', lastErr && (lastErr.message || lastErr));
  throw lastErr || new Error('mail_failed');
}

// Backwards-compatible mail endpoints
// Some deployments or older frontends call /api/mail/send-verification or /api/email/send
// We'll accept these requests and either call sendVerificationEmail (when code provided)
// or forward the payload to the configured LaFoncedalle API so nginx proxies to Node don't 404/502.
app.post('/api/mail/send-verification', async (req, res) => {
  const email = (req.body && (req.body.to || req.body.email || req.body.recipient)) || null;
  const code = req.body && (req.body.code || req.body.verificationCode || req.body.token) || null;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return res.status(400).json({ error: 'invalid_email', message: 'Adresse email invalide' });
  }
  if (!code) {
    return res.status(400).json({ error: 'missing_code', message: 'Code manquant' });
  }
  try {
    await sendVerificationEmail(String(email), String(code));
    return res.json({ ok: true, message: 'Code envoyé par email' });
  } catch (err) {
    console.error('[MAIL] send-verification failed:', err && (err.message || err));
    return res.status(502).json({ error: 'mail_failed', message: 'Échec lors de l\'envoi du mail' });
  }
});

// Generic forwarding endpoints (accept common mail API shapes and forward to LaFoncedalle API)
async function forwardToLaFoncedalle(path, body, res) {
  try {
    const url = LAFONCEDALLE_API_URL.replace(/\/$/, '') + path;
    const opts = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LAFONCEDALLE_API_KEY}` }, body: JSON.stringify(body || {}) };
    const r = await fetch(url, opts);
    const ct = r.headers.get('content-type') || '';
    let payload = null;
    if (ct.includes('application/json')) payload = await r.json();
    else payload = await r.text().catch(() => null);
    return res.status(r.status).send(payload);
  } catch (err) {
    console.error('[MAIL] forwardToLaFoncedalle error', err && (err.message || err));
    return res.status(502).json({ error: 'upstream_error', message: 'Erreur vers le service mail' });
  }
}

app.post('/api/email/send', async (req, res) => {
  // forward body to LaFoncedalle /api/email/send if available
  return forwardToLaFoncedalle('/api/email/send', req.body, res);
});

app.post('/api/notify/send-verification', async (req, res) => {
  // forward to notify/send-verification (some deployments use this path)
  return forwardToLaFoncedalle('/api/notify/send-verification', req.body, res);
});

// POST /api/auth/send-code - Request verification code
app.post('/api/auth/send-code', async (req, res) => {
  const email = req.body?.email?.trim()?.toLowerCase();
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid_email', message: 'Adresse email invalide' });
  }
  
  try {
    // Step 1: Verify email exists in Discord bot database
    let discordUser = null;
    try {
      discordUser = await getDiscordUserByEmail(email);
    } catch (err) {
      console.warn('[AUTH] LaFoncedalle lookup failed (will return service_unavailable):', err && err.message ? err.message : err);
      // Return 503 so client knows the external service is unavailable
      return res.status(503).json({ error: 'service_unavailable', message: 'Service de vérification externe indisponible. Réessayez plus tard.' });
    }

    if (!discordUser) {
      return res.status(404).json({ 
        error: 'email_not_found', 
        message: 'Cette adresse email n\'est pas liée à un compte Discord. Veuillez d\'abord lier votre email sur le serveur Discord LaFoncedalle.' 
      });
    }

    console.log(`[AUTH] Discord user found for ${email}:`, discordUser.username);

    // Step 2: Generate verification code
    const code = generateCode();
    const expires = Date.now() + CODE_EXPIRY;

    // Step 3: Store code with Discord user info
    verificationCodes.set(email, { 
      code, 
      expires, 
      attempts: 0,
      discordUser: {
        discordId: discordUser.discordId,
        username: discordUser.username
      }
    });

    // Step 4: Try to send email, but if mail service fails, return a recoverable response
    try {
      await sendVerificationEmail(email, code);
      return res.json({ ok: true, message: 'Code envoyé par email' });
    } catch (mailErr) {
      console.error('[AUTH] Mail send failed but code stored:', mailErr && (mailErr.message || mailErr));
      // Keep the code stored so user can still attempt verification if email later arrives
      // Respond with 202 Accepted and a warning so client shows a retry option
      return res.status(202).json({ ok: true, warning: 'mail_failed', message: 'Le code a été généré mais l\'envoi d\'email a échoué. Réessayez l\'envoi.' });
    }
  } catch (err) {
    console.error('[AUTH] Unexpected error in send-code:', err && (err.message || err));
    res.status(500).json({ 
      error: 'server_error', 
      message: 'Erreur serveur inattendue' 
    });
  }
  
  // Clean up expired codes periodically
  setTimeout(() => {
    for (const [email, data] of verificationCodes.entries()) {
      if (Date.now() > data.expires) {
        verificationCodes.delete(email);
      }
    }
  }, CODE_EXPIRY);
});

// POST /api/auth/resend-code - Resend verification code for an existing pending request
app.post('/api/auth/resend-code', async (req, res) => {
  const email = req.body?.email?.trim()?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid_email', message: 'Adresse email invalide' });
  }

  const stored = verificationCodes.get(email);
  if (!stored) {
    return res.status(404).json({ error: 'no_pending_code', message: 'Aucun code en attente pour cet email' });
  }

  if (stored.attempts >= MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'too_many_attempts', message: 'Trop de tentatives' });
  }

  try {
    const code = generateCode();
    stored.code = code;
    stored.expires = Date.now() + CODE_EXPIRY;
    stored.attempts = 0;
    verificationCodes.set(email, stored);
    await sendVerificationEmail(email, code);
    res.json({ ok: true, message: 'Code renvoyé par email' });
  } catch (err) {
    console.error('[AUTH] Error in resend-code:', err);
    res.status(500).json({ error: 'server_error', message: 'Erreur lors de l\'envoi du code' });
  }
});

// POST /api/auth/user-by-email - Lookup discord user by email via server
app.post('/api/auth/user-by-email', async (req, res) => {
  const email = req.body?.email?.trim()?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid_email', message: 'Adresse email invalide' });
  }

  try {
    const discordUser = await getDiscordUserByEmail(email);
    if (!discordUser) return res.status(404).json({ error: 'not_found', message: 'Utilisateur introuvable' });
    res.json(discordUser);
  } catch (err) {
    console.error('[AUTH] Error in user-by-email:', err);
    res.status(500).json({ error: 'server_error', message: 'Erreur lors de la recherche de l\'utilisateur' });
  }
});

// POST /api/auth/verify-code - Verify code and create session
app.post('/api/auth/verify-code', (req, res) => {
  const email = req.body?.email?.trim()?.toLowerCase();
  const code = req.body?.code?.trim();
  
  if (!email || !code) {
    return res.status(400).json({ error: 'missing_fields', message: 'Email et code requis' });
  }
  
  const stored = verificationCodes.get(email);
  
  if (!stored) {
    return res.status(404).json({ error: 'code_not_found', message: 'Code expiré ou introuvable' });
  }
  
  // Check expiry
  if (Date.now() > stored.expires) {
    verificationCodes.delete(email);
    return res.status(410).json({ error: 'code_expired', message: 'Code expiré' });
  }
  
  // Check attempts
  if (stored.attempts >= MAX_ATTEMPTS) {
    verificationCodes.delete(email);
    return res.status(429).json({ error: 'too_many_attempts', message: 'Trop de tentatives' });
  }
  
  // Verify code
  if (stored.code !== code) {
    stored.attempts++;
    return res.status(401).json({ 
      error: 'invalid_code', 
      message: 'Code invalide', 
      attemptsLeft: MAX_ATTEMPTS - stored.attempts 
    });
  }
  
  // Success! Generate filesystem-safe session token
  const token = crypto.randomBytes(24).toString('hex');
  
  // Store token with Discord user information
  const tokenFile = path.join(TOKENS_DIR, token);
  const tokenData = {
    ownerId: email,
    discordId: stored.discordUser?.discordId || null,
    discordUsername: stored.discordUser?.username || null,
    roles: [],
    createdAt: new Date().toISOString()
  };
  
  try {
    fs.writeFileSync(tokenFile, JSON.stringify(tokenData, null, 2));
    console.log(`[AUTH] Token created for Discord user: ${tokenData.discordUsername}`);
  } catch (err) {
    console.error('[AUTH] Error storing token:', err);
    return res.status(500).json({ error: 'token_error', message: 'Erreur lors de la création de la session' });
  }
  
  // Clean up code
  verificationCodes.delete(email);
  
  res.json({ ok: true, token, email });
});

// POST /api/auth/logout - Logout (delete token)
app.post('/api/auth/logout', (req, res) => {
  const token = req.header('X-Auth-Token') || req.body?.token;
  
  if (!token) {
    return res.status(400).json({ error: 'no_token' });
  }
  
  // Delete token file
  const tokenFile = path.join(TOKENS_DIR, token);
  try {
    if (fs.existsSync(tokenFile)) {
      fs.unlinkSync(tokenFile);
    }
  } catch (err) {
    console.error('[AUTH] Error deleting token:', err);
  }
  
  res.json({ ok: true });
});

// GET /api/auth/me - Get current user info
app.get('/api/auth/me', async (req, res) => {
  const email = req.auth?.ownerId;
  const isStaff = req.auth?.roles?.includes('staff');
  const discordId = req.auth?.discordId;
  let discordUsername = req.auth?.discordUsername;
  
  if (!email) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  
  // Fetch real username from LaFoncedalle database
  try {
    const discordUser = await getDiscordUserByEmail(email).catch(e => null);
    if (discordUser) {
      // accept multiple possible username fields
      discordUsername = discordUser.username || discordUser.user_name || discordUser.displayName || discordUser.name || discordUsername;
    }
  } catch (error) {
    console.error('[AUTH] Failed to fetch Discord username:', error);
    // Continue with JWT username as fallback
  }
  
  res.json({ 
    email, 
    isStaff,
    discordId,
    discordUsername,
    user_name: discordUsername // Ajouter aussi le champ user_name pour compatibilité
  });
});

app.listen(PORT, () => {
  console.log('Reviews Maker API running on port ' + PORT);
});
