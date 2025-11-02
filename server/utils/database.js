/**
 * Database Utilities
 * Handles SQLite operations and migrations
 */
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, '..', '..', 'db', 'reviews.sqlite');
const IS_PROD = process.env.NODE_ENV === 'production';

// Logging helpers
const infoLog = (...args) => { if (!IS_PROD) console.log(...args); };
const debugLog = (...args) => { if (process.env.DEBUG) console.log(...args); };

sqlite3.verbose();
const db = new sqlite3.Database(DB_FILE);

/**
 * Initialize database schema and migrations
 */
export async function initDatabase() {
    return new Promise((resolve, reject) => {
        const INIT_SQL = `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productType TEXT,
      name TEXT,
      data JSON NOT NULL,
      imagePath TEXT,
      ownerId TEXT,
      isDraft INTEGER DEFAULT 0,
      isPrivate INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );`;

        db.serialize(() => {
            db.run(INIT_SQL, (err) => {
                if (err) {
                    console.error('[DB] Table creation failed:', err);
                    return reject(err);
                }

                // Run migrations
                runMigrations()
                    .then(() => {
                        infoLog('[DB] Database initialized successfully');
                        resolve();
                    })
                    .catch(reject);
            });
        });
    });
}

/**
 * Run database migrations
 */
async function runMigrations() {
    return new Promise((resolve, reject) => {
        db.all("PRAGMA table_info('reviews')", [], async (err, rows) => {
            if (err) {
                console.warn('[DB] PRAGMA table_info error:', err);
                return resolve(); // Non-fatal
            }

            const cols = new Set((rows || []).map(r => r.name));

            const addColumn = (name, definition) => new Promise(res => {
                if (cols.has(name)) return res(true);

                const sql = `ALTER TABLE reviews ADD COLUMN ${definition}`;
                db.run(sql, [], (e) => {
                    if (e) {
                        console.warn(`[DB] ALTER TABLE add ${name} failed:`, e.message);
                    } else {
                        infoLog(`[DB] Added column ${name}`);
                        cols.add(name);
                    }
                    res(!e);
                });
            });

            try {
                // Add missing columns
                await addColumn('ownerId', "ownerId TEXT");
                await addColumn('isDraft', "isDraft INTEGER DEFAULT 0");
                await addColumn('isPrivate', "isPrivate INTEGER DEFAULT 0");
                await addColumn('createdAt', "createdAt TEXT");
                await addColumn('updatedAt', "updatedAt TEXT");

                // Create review_likes table
                await createLikesTable();

                // Backfill defaults
                await backfillDefaults();

                resolve();
            } catch (error) {
                console.error('[DB] Migration error:', error);
                resolve(); // Non-fatal
            }
        });
    });
}

/**
 * Create review_likes table
 */
function createLikesTable() {
    return new Promise(resolve => {
        db.run(`CREATE TABLE IF NOT EXISTS review_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reviewId INTEGER NOT NULL,
      ownerId TEXT NOT NULL,
      vote INTEGER NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );`, [], (err) => {
            if (err) {
                console.warn('[DB] create review_likes failed:', err.message);
            } else {
                infoLog('[DB] ensured review_likes table');
            }

            // Create index
            db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_review_owner ON review_likes(reviewId, ownerId)', [], () => {
                resolve();
            });
        });
    });
}

/**
 * Backfill default values for existing rows
 */
function backfillDefaults() {
    return new Promise(resolve => {
        db.run("UPDATE reviews SET isDraft=0 WHERE isDraft IS NULL", () => { });
        db.run("UPDATE reviews SET isPrivate=0 WHERE isPrivate IS NULL", () => { });
        db.run("UPDATE reviews SET createdAt=datetime('now') WHERE createdAt IS NULL", () => { });
        db.run("UPDATE reviews SET updatedAt=datetime('now') WHERE updatedAt IS NULL", () => {
            resolve();
        });
    });
}

/**
 * Convert database row to review object
 */
export function rowToReview(row) {
    if (!row) return null;

    let payload = {};
    try {
        payload = JSON.parse(row.data);
    } catch (error) {
        console.warn('[DB] JSON parse error for review:', row.id);
    }

    // Add image path if missing in payload
    if (row.imagePath && !payload.image) {
        payload.image = '/images/' + path.basename(row.imagePath);
    }

    // Add metadata
    payload.id = row.id;
    payload.createdAt = row.createdAt;
    payload.updatedAt = row.updatedAt;

    if (row.ownerId) payload.ownerId = row.ownerId;
    if (row.isPrivate != null) payload.isPrivate = !!row.isPrivate;

    return payload;
}

/**
 * Get database instance
 */
export function getDatabase() {
    return db;
}

/**
 * Close database connection
 */
export function closeDatabase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}
