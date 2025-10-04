import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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

// Storage config for images
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
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/images', express.static(IMAGE_DIR));
app.use(express.static(path.join(__dirname, '..'))); // servir les fichiers front
// Auth middleware (optional): accepts X-Auth-Token header; matches file in tokens dir
function resolveOwnerIdFromToken(token) {
  if (!token) return null;
  try {
    const file = path.join(TOKENS_DIR, token);
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8').trim();
      // support JSON { ownerId: "..", roles: ["staff"] }
      try {
        const js = JSON.parse(content);
        if (js && (js.ownerId || js.roles)) return js;
      } catch {}
      return { ownerId: content || token, roles: [] };
    }
  } catch {}
  return null;
}

app.use((req, _res, next) => {
  const token = req.header('X-Auth-Token') || req.query.token;
  const info = resolveOwnerIdFromToken(token);
  let ownerId = null; let roles = [];
  if (info && typeof info === 'object') { ownerId = info.ownerId || null; roles = Array.isArray(info.roles) ? info.roles : []; }
  else if (typeof info === 'string') { ownerId = info; }
  req.auth = { token: token || null, ownerId, roles };
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
  if (row.isDraft != null) payload.isDraft = !!row.isDraft;
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
    sql = 'SELECT * FROM reviews WHERE (isDraft=0 AND isPrivate=0) OR (ownerId=?) ORDER BY updatedAt DESC LIMIT 500';
    params = [me];
  } else {
    sql = 'SELECT * FROM reviews WHERE isDraft=0 AND isPrivate=0 ORDER BY updatedAt DESC LIMIT 500';
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
    // Enforce draft visibility: only owner may view drafts
    const isStaff = req.auth?.roles?.includes('staff');
    if (!isStaff && row.isDraft && req.auth?.ownerId && row.ownerId && row.ownerId !== req.auth.ownerId) {
      return res.status(403).json({ error: 'forbidden' });
    }
    if (!isStaff && row.isDraft && !req.auth?.ownerId) {
      return res.status(403).json({ error: 'forbidden' });
    }
    // Private visibility
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
  const isDraft = incoming.isDraft ? 1 : 0;
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
  const nextIsDraft = incoming.isDraft != null ? (incoming.isDraft ? 1 : 0) : row.isDraft;
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
      if (row.imagePath) fs.unlink(row.imagePath, () => {});
      res.json({ ok: true });
    });
  });
});

// Public gallery (explicit) — identical to GET /api/reviews without token
app.get('/api/public/reviews', (req, res) => {
  db.all('SELECT * FROM reviews WHERE isDraft=0 AND isPrivate=0 ORDER BY updatedAt DESC LIMIT 500', [], (err, rows) => {
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
    db.get('SELECT COUNT(*) as drafts FROM reviews WHERE isDraft=1', [], (e2, r2) => {
      db.get('SELECT COUNT(*) as privates FROM reviews WHERE isPrivate=1', [], (e3, r3) => {
        res.json({ total: r1?.total || 0, drafts: r2?.drafts || 0, privates: r3?.privates || 0 });
      });
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

app.listen(PORT, () => {
  console.log('Reviews Maker API running on port ' + PORT);
});
