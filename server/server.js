import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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
const LAFONCEDALLE_API_URL = process.env.LAFONCEDALLE_API_URL || 'http://localhost:3001'; // URL de l'API LaFoncedalle
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
  const candidates = [
    { method: 'POST', path: '/api/mail/send-verification', body: { to: email, code, subject: 'Code de vérification Reviews Maker', appName: 'Reviews Maker', expiryMinutes: 10 } },
    { method: 'POST', path: '/api/email/send', body: { to: email, code, subject: 'Code de vérification Reviews Maker' } },
    { method: 'POST', path: '/api/notify/send-verification', body: { to: email, code } }
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

// POST /api/auth/send-code - Request verification code
app.post('/api/auth/send-code', async (req, res) => {
  const email = req.body?.email?.trim()?.toLowerCase();
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid_email', message: 'Adresse email invalide' });
  }
  
  try {
    // Step 1: Verify email exists in Discord bot database
    const discordUser = await getDiscordUserByEmail(email);
    
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
    
    // Step 4: Send verification email via LaFoncedalle
    await sendVerificationEmail(email, code);
    
    res.json({ ok: true, message: 'Code envoyé par email' });
  } catch (err) {
    console.error('[AUTH] Error in send-code:', err);
    res.status(500).json({ 
      error: 'server_error', 
      message: 'Erreur lors de la vérification de l\'email ou de l\'envoi du code' 
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
  
  // Success! Generate session token
  const token = Buffer.from(`${email}:${Date.now()}:${Math.random()}`).toString('base64');
  
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
