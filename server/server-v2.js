/**
 * Reviews-Maker Server v2.0
 * Architecture modulaire consolidée
 * 
 * Charge les modules séparés pour les routes, middleware et utilitaires
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { fileURLToPath } from 'url';

// Utilitaires
import { initDatabase, getDatabase, closeDatabase } from './utils/database.js';

// Middleware
import { authMiddleware } from './middleware/auth.js';

// Routes
import reviewsRouter from './routes/reviews.js';
import authRouter from './routes/auth.js';
import votesRouter from './routes/votes.js';
import adminRouter from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// CONFIGURATION
// ========================================

const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const IMAGE_DIR = path.join(__dirname, '..', 'db', 'review_images');

// Créer les répertoires nécessaires
fs.mkdirSync(IMAGE_DIR, { recursive: true });

// Logs conditionnels
const infoLog = (...args) => { if (!IS_PROD) console.log(...args); };
const debugLog = (...args) => { if (process.env.DEBUG) console.log(...args); };

// ========================================
// MULTER CONFIG (UPLOAD)
// ========================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, IMAGE_DIR),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname || '.png');
        cb(null, unique + ext);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.'));
        }
    }
});

// ========================================
// DATABASE INITIALIZATION
// ========================================

try {
    await initDatabase();
    infoLog('[DB] Base de données initialisée avec succès');
} catch (error) {
    console.error('[DB] Erreur lors de l\'initialisation:', error);
    process.exit(1);
}

// ========================================
// EXPRESS APP
// ========================================

const app = express();

// Middleware de base
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Logging des requêtes (dev only)
if (!IS_PROD) {
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
        });
        next();
    });
}

// ========================================
// STATIC FILES & PATH REWRITING
// ========================================

// Servir les images (support multi-paths)
app.use('/reviews/images', express.static(IMAGE_DIR));
app.use('/images', express.static(IMAGE_DIR));

// Servir le frontend
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
}));

// Support base path /reviews (pour nginx reverse proxy)
app.use((req, res, next) => {
    try {
        if (req.path && req.path.startsWith('/reviews/api/')) {
            req.url = req.url.replace(/^\/reviews/, '');
            debugLog('[path-rewrite] Rewrote request to', req.url);
        }
    } catch (error) {
        console.error('[path-rewrite] Error:', error);
    }
    next();
});

// ========================================
// AUTH MIDDLEWARE GLOBAL
// ========================================

// Appliquer authMiddleware sur toutes les routes
// Il attache req.auth si un token valide est présent
app.use(authMiddleware);

// ========================================
// ROUTES
// ========================================

// Upload d'images (endpoint séparé)
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'no_file',
                message: 'Aucun fichier fourni'
            });
        }

        const imagePath = req.file.filename;
        infoLog(`[UPLOAD] Image uploadée: ${imagePath}`);

        res.json({
            success: true,
            imagePath,
            url: `/images/${imagePath}`
        });
    } catch (error) {
        console.error('[UPLOAD] Error:', error);
        res.status(500).json({
            error: 'upload_error',
            message: error.message || 'Erreur lors de l\'upload'
        });
    }
});

// Monter les routes modulaires
app.use('/api/reviews', reviewsRouter);
app.use('/api/auth', authRouter);
app.use('/api/votes', votesRouter);
app.use('/api/admin', adminRouter);

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'not_found',
        message: `Endpoint non trouvé: ${req.method} ${req.path}`,
        path: req.path
    });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error('[ERROR] Unhandled error:', err);

    // Erreur Multer
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'file_too_large',
                message: 'Fichier trop volumineux (max 5 MB)'
            });
        }
        return res.status(400).json({
            error: 'upload_error',
            message: err.message
        });
    }

    // Erreur générique
    res.status(500).json({
        error: 'server_error',
        message: IS_PROD ? 'Erreur interne du serveur' : err.message
    });
});

// ========================================
// SERVER STARTUP
// ========================================

const server = app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Reviews-Maker Server v2.0');
    console.log('='.repeat(50));
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${IS_PROD ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`📁 Image directory: ${IMAGE_DIR}`);
    console.log(`🔍 Debug mode: ${process.env.DEBUG ? 'ON' : 'OFF'}`);
    console.log('='.repeat(50));
    console.log('📋 Available endpoints:');
    console.log('   POST   /api/upload');
    console.log('   GET    /api/reviews');
    console.log('   POST   /api/reviews');
    console.log('   GET    /api/reviews/:id');
    console.log('   PUT    /api/reviews/:id');
    console.log('   DELETE /api/reviews/:id');
    console.log('   POST   /api/auth/send-code');
    console.log('   POST   /api/auth/verify-code');
    console.log('   POST   /api/auth/logout');
    console.log('   GET    /api/auth/me');
    console.log('   GET    /api/votes/:reviewId');
    console.log('   POST   /api/votes/:reviewId');
    console.log('   DELETE /api/votes/:reviewId');
    console.log('   GET    /api/admin/stats');
    console.log('   GET    /api/admin/leaderboard');
    console.log('   GET    /api/admin/tokens');
    console.log('   GET    /api/admin/health');
    console.log('='.repeat(50));
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

const shutdown = (signal) => {
    console.log(`\n[${signal}] Arrêt du serveur...`);

    server.close(() => {
        console.log('✅ Serveur HTTP fermé');

        closeDatabase();
        console.log('✅ Connexion DB fermée');

        console.log('👋 Au revoir!');
        process.exit(0);
    });

    // Force shutdown après 10 secondes
    setTimeout(() => {
        console.error('⚠️  Arrêt forcé après timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
    shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('UNHANDLED_REJECTION');
});

export default app;
