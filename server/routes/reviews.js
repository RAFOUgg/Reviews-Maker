/**
 * Reviews Routes
 * Handles CRUD operations for reviews
 */
import express from 'express';
import path from 'path';
import fs from 'fs';
import { getDatabase, rowToReview } from '../utils/database.js';
import { requireAuth } from '../middleware/auth.js';
import { validateReviewData, isValidId } from '../utils/validation.js';

const router = express.Router();
const IMAGE_DIR = path.join(process.cwd(), 'db', 'review_images');

/**
 * GET /api/reviews - List reviews (with privacy filtering)
 */
router.get('/', (req, res) => {
    const db = getDatabase();
    const me = req.auth?.ownerId || null;
    const isStaff = req.auth?.isStaff || false;

    let sql, params;

    if (isStaff) {
        // Staff sees everything
        sql = 'SELECT * FROM reviews ORDER BY updatedAt DESC LIMIT 500';
        params = [];
    } else if (me) {
        // Authenticated: see public reviews + own reviews
        sql = 'SELECT * FROM reviews WHERE (isPrivate=0) OR (ownerId=?) ORDER BY updatedAt DESC LIMIT 500';
        params = [me];
    } else {
        // Public: only non-private reviews
        sql = 'SELECT * FROM reviews WHERE isPrivate=0 ORDER BY updatedAt DESC LIMIT 500';
        params = [];
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('[Reviews] List error:', err);
            return res.status(500).json({ error: 'db_error', message: 'Database error' });
        }
        res.json(rows.map(rowToReview));
    });
});

/**
 * GET /api/reviews/:id - Get single review
 */
router.get('/:id', (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: 'invalid_id', message: 'Invalid review ID' });
    }

    const db = getDatabase();

    db.get('SELECT * FROM reviews WHERE id=?', [req.params.id], (err, row) => {
        if (err) {
            console.error('[Reviews] Get error:', err);
            return res.status(500).json({ error: 'db_error', message: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'not_found', message: 'Review not found' });
        }

        // Privacy check
        const isStaff = req.auth?.isStaff || false;
        if (!isStaff && row.isPrivate && (!req.auth?.ownerId || row.ownerId !== req.auth.ownerId)) {
            return res.status(403).json({ error: 'forbidden', message: 'Private review' });
        }

        res.json(rowToReview(row));
    });
});

/**
 * POST /api/reviews - Create review
 */
router.post('/', requireAuth, (req, res) => {
    let incoming = {};

    if (req.body.data) {
        try {
            incoming = JSON.parse(req.body.data);
        } catch {
            incoming = {};
        }
    } else {
        incoming = req.body;
    }

    // Validate
    const validation = validateReviewData(incoming);
    if (!validation.isValid) {
        const firstError = validation.errors[0];
        return res.status(400).json({
            error: 'validation_error',
            field: firstError.field,
            message: firstError.message
        });
    }

    const ownerId = req.auth.ownerId;
    const isDraft = 0; // Always save as non-draft
    const isPrivate = incoming.isPrivate ? 1 : 0;

    if (req.file) {
        incoming.image = '/images/' + req.file.filename;
    }

    const productType = incoming.productType || null;
    const name = incoming.name || incoming.cultivars || incoming.productName || null;
    const json = JSON.stringify(incoming);

    const db = getDatabase();

    db.run(
        'INSERT INTO reviews (productType, name, data, imagePath, ownerId, isDraft, isPrivate) VALUES (?,?,?,?,?,?,?)',
        [productType, name, json, req.file ? req.file.path : null, ownerId, isDraft, isPrivate],
        function (err) {
            if (err) {
                console.error('[Reviews] Create error:', err);
                return res.status(500).json({ error: 'db_error', message: 'Database error' });
            }

            db.get('SELECT * FROM reviews WHERE id=?', [this.lastID], (e2, row) => {
                if (e2 || !row) {
                    console.error('[Reviews] Fetch after create error:', e2);
                    return res.status(500).json({ error: 'db_error', message: 'Database error' });
                }
                res.json({ review: rowToReview(row) });
            });
        }
    );
});

/**
 * PUT /api/reviews/:id - Update review
 */
router.put('/:id', requireAuth, (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: 'invalid_id', message: 'Invalid review ID' });
    }

    const id = req.params.id;
    const db = getDatabase();

    db.get('SELECT * FROM reviews WHERE id=?', [id], (err, row) => {
        if (err) {
            console.error('[Reviews] Update get error:', err);
            return res.status(500).json({ error: 'db_error', message: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'not_found', message: 'Review not found' });
        }

        // Ownership check
        const ownerId = req.auth.ownerId;
        if (row.ownerId && ownerId && row.ownerId !== ownerId) {
            return res.status(403).json({ error: 'forbidden', message: 'Not your review' });
        }

        let incoming = {};
        if (req.body.data) {
            try {
                incoming = JSON.parse(req.body.data);
            } catch {
                incoming = {};
            }
        } else {
            incoming = req.body;
        }

        // Validate
        const existing = JSON.parse(row.data || '{}');
        const merged = { ...existing, ...incoming };

        const validation = validateReviewData(merged);
        if (!validation.isValid) {
            const firstError = validation.errors[0];
            return res.status(400).json({
                error: 'validation_error',
                field: firstError.field,
                message: firstError.message
            });
        }

        if (req.file) {
            merged.image = '/images/' + req.file.filename;
        }

        const nextIsDraft = 0;
        const nextIsPrivate = incoming.isPrivate != null ? (incoming.isPrivate ? 1 : 0) : row.isPrivate;
        const nextOwnerId = row.ownerId || ownerId || null;
        const json = JSON.stringify(merged);
        const newImagePath = req.file ? req.file.path : row.imagePath;

        db.run(
            'UPDATE reviews SET productType=?, name=?, data=?, imagePath=?, ownerId=?, isDraft=?, isPrivate=?, updatedAt=datetime(\'now\') WHERE id=?',
            [merged.productType || null, merged.name || merged.cultivars || merged.productName || null, json, newImagePath, nextOwnerId, nextIsDraft, nextIsPrivate, id],
            (e2) => {
                if (e2) {
                    console.error('[Reviews] Update error:', e2);
                    return res.status(500).json({ error: 'db_error', message: 'Database error' });
                }

                db.get('SELECT * FROM reviews WHERE id=?', [id], (e3, row2) => {
                    if (e3 || !row2) {
                        console.error('[Reviews] Fetch after update error:', e3);
                        return res.status(500).json({ error: 'db_error', message: 'Database error' });
                    }
                    res.json({ review: rowToReview(row2) });
                });
            }
        );
    });
});

/**
 * DELETE /api/reviews/:id - Delete review
 */
router.delete('/:id', requireAuth, (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: 'invalid_id', message: 'Invalid review ID' });
    }

    const id = req.params.id;
    const db = getDatabase();

    db.get('SELECT imagePath, ownerId FROM reviews WHERE id=?', [id], (err, row) => {
        if (err) {
            console.error('[Reviews] Delete get error:', err);
            return res.status(500).json({ error: 'db_error', message: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'not_found', message: 'Review not found' });
        }

        // Ownership check (or staff)
        const ownerId = req.auth.ownerId;
        const isStaff = req.auth.isStaff;

        if (!isStaff && row.ownerId && ownerId && row.ownerId !== ownerId) {
            return res.status(403).json({ error: 'forbidden', message: 'Not your review' });
        }

        if (!isStaff && row.ownerId && !ownerId) {
            return res.status(403).json({ error: 'forbidden', message: 'Authentication required' });
        }

        db.run('DELETE FROM reviews WHERE id=?', [id], (e2) => {
            if (e2) {
                console.error('[Reviews] Delete error:', e2);
                return res.status(500).json({ error: 'db_error', message: 'Database error' });
            }

            // Delete associated image file
            try {
                if (row.imagePath) {
                    const imgFile = path.isAbsolute(row.imagePath)
                        ? row.imagePath
                        : path.join(IMAGE_DIR, path.basename(row.imagePath));

                    if (fs.existsSync(imgFile)) {
                        fs.unlinkSync(imgFile);
                        console.log('[Reviews] Removed image:', imgFile);
                    }
                }
            } catch (e) {
                console.warn('[Reviews] Failed to remove image:', e.message);
            }

            res.json({ ok: true });
        });
    });
});

/**
 * GET /api/public/reviews - Public gallery (explicit)
 */
router.get('/public/reviews', (req, res) => {
    const db = getDatabase();

    db.all('SELECT * FROM reviews WHERE isPrivate=0 ORDER BY updatedAt DESC LIMIT 500', [], (err, rows) => {
        if (err) {
            console.error('[Reviews] Public list error:', err);
            return res.status(500).json({ error: 'db_error', message: 'Database error' });
        }
        res.json(rows.map(rowToReview));
    });
});

/**
 * GET /api/my/reviews - My reviews (requires auth)
 */
router.get('/my/reviews', requireAuth, (req, res) => {
    const me = req.auth.ownerId;
    const db = getDatabase();

    db.all('SELECT * FROM reviews WHERE ownerId=? ORDER BY updatedAt DESC LIMIT 500', [me], (err, rows) => {
        if (err) {
            console.error('[Reviews] My reviews error:', err);
            return res.status(500).json({ error: 'db_error', message: 'Database error' });
        }
        res.json(rows.map(rowToReview));
    });
});

/**
 * PUT /api/reviews/:id/privacy - Update privacy setting
 */
router.put('/:id/privacy', requireAuth, (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: 'invalid_id', message: 'Invalid review ID' });
    }

    const id = req.params.id;
    const isStaff = req.auth.isStaff;
    const me = req.auth.ownerId;
    const db = getDatabase();

    db.get('SELECT ownerId FROM reviews WHERE id=?', [id], (err, row) => {
        if (err) {
            console.error('[Reviews] Privacy get error:', err);
            return res.status(500).json({ error: 'db_error', message: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'not_found', message: 'Review not found' });
        }

        if (!isStaff && (!me || row.ownerId !== me)) {
            return res.status(403).json({ error: 'forbidden', message: 'Not your review' });
        }

        const value = req.body && typeof req.body.isPrivate !== 'undefined' ? (req.body.isPrivate ? 1 : 0) : 0;

        db.run('UPDATE reviews SET isPrivate=?, updatedAt=datetime(\'now\') WHERE id=?', [value, id], (e2) => {
            if (e2) {
                console.error('[Reviews] Privacy update error:', e2);
                return res.status(500).json({ error: 'db_error', message: 'Database error' });
            }

            db.get('SELECT * FROM reviews WHERE id=?', [id], (e3, row2) => {
                if (e3 || !row2) {
                    console.error('[Reviews] Fetch after privacy update error:', e3);
                    return res.status(500).json({ error: 'db_error', message: 'Database error' });
                }
                res.json({ review: rowToReview(row2) });
            });
        });
    });
});

export default router;
