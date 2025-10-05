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

// LaFoncedalle API Configuration
const LAFONCEDALLE_API_URL = process.env.LAFONCEDALLE_API_URL || 'http://localhost:3001'; // URL de l'API LaFoncedalle
const LAFONCEDALLE_API_KEY = process.env.LAFONCEDALLE_API_KEY || 'your-api-key'; // Clé API pour authentifier les requêtes

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

// Helper: Verify email against Discord bot database and get Discord user info
async function getDiscordUserByEmail(email) {
  try {
    const response = await fetch(`${LAFONCEDALLE_API_URL}/api/discord/user-by-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LAFONCEDALLE_API_KEY}`
      },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Email not found in Discord database
      }
      throw new Error(`LaFoncedalle API error: ${response.status}`);
    }
    
    const data = await response.json();
    // Expected format: { discordId: "123456", username: "User#1234", email: "..." }
    return data;
  } catch (error) {
    console.error('[Discord] Error verifying email:', error);
    throw error;
  }
}

// Helper: Send verification email via LaFoncedalle mailing service
async function sendVerificationEmail(email, code) {
  try {
    const response = await fetch(`${LAFONCEDALLE_API_URL}/api/mail/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LAFONCEDALLE_API_KEY}`
      },
      body: JSON.stringify({
        to: email,
        code: code,
        subject: 'Code de vérification Reviews Maker',
        // Optional: custom template parameters
        appName: 'Reviews Maker',
        expiryMinutes: 10
      })
    });
    
    if (!response.ok) {
      throw new Error(`LaFoncedalle mailing API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`[EMAIL] Verification code sent to ${email} via LaFoncedalle`);
    return result;
  } catch (error) {
    console.error('[EMAIL] Error sending verification code:', error);
    throw error;
  }
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
    const discordUser = await getDiscordUserByEmail(email);
    if (discordUser && discordUser.user_name) {
      discordUsername = discordUser.user_name;
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
