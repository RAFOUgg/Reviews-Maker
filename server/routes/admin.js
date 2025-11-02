/**
 * Routes d'administration
 * Endpoints réservés au staff pour les statistiques et la gestion
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from '../utils/database.js';
import { requireStaff } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * GET /api/admin/stats
 * Statistiques globales du système
 */
router.get('/stats', requireStaff, (req, res) => {
    try {
        const db = getDatabase();

        // Statistiques reviews
        db.get(
            `SELECT 
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN is_private = 0 THEN 1 END) as public_reviews,
        COUNT(CASE WHEN is_private = 1 THEN 1 END) as private_reviews,
        COUNT(DISTINCT owner_id) as unique_users,
        AVG(overall_rating) as avg_rating
       FROM reviews`,
            (err, reviewStats) => {
                if (err) {
                    console.error('Erreur stats reviews:', err);
                    return res.status(500).json({
                        error: 'db_error',
                        message: 'Erreur lors de la récupération des statistiques'
                    });
                }

                // Statistiques votes
                db.get(
                    `SELECT 
            COUNT(*) as total_votes,
            SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END) as total_upvotes,
            SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END) as total_downvotes,
            COUNT(DISTINCT user_id) as unique_voters
           FROM review_likes`,
                    (err, voteStats) => {
                        if (err) {
                            console.error('Erreur stats votes:', err);
                            return res.status(500).json({
                                error: 'db_error',
                                message: 'Erreur lors de la récupération des statistiques de votes'
                            });
                        }

                        // Statistiques par type de produit
                        db.all(
                            `SELECT 
                product_type,
                COUNT(*) as count,
                AVG(overall_rating) as avg_rating
               FROM reviews
               GROUP BY product_type
               ORDER BY count DESC`,
                            (err, typeStats) => {
                                if (err) {
                                    console.error('Erreur stats types:', err);
                                    return res.status(500).json({
                                        error: 'db_error',
                                        message: 'Erreur lors de la récupération des statistiques par type'
                                    });
                                }

                                // Activité récente (7 derniers jours)
                                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                                db.get(
                                    `SELECT 
                    COUNT(*) as reviews_last_7_days,
                    COUNT(DISTINCT owner_id) as active_users_last_7_days
                   FROM reviews
                   WHERE created_at >= ?`,
                                    [sevenDaysAgo],
                                    (err, activityStats) => {
                                        if (err) {
                                            console.error('Erreur stats activité:', err);
                                            return res.status(500).json({
                                                error: 'db_error',
                                                message: 'Erreur lors de la récupération des statistiques d\'activité'
                                            });
                                        }

                                        res.json({
                                            reviews: {
                                                total: reviewStats.total_reviews || 0,
                                                public: reviewStats.public_reviews || 0,
                                                private: reviewStats.private_reviews || 0,
                                                uniqueUsers: reviewStats.unique_users || 0,
                                                avgRating: reviewStats.avg_rating ? parseFloat(reviewStats.avg_rating.toFixed(2)) : 0,
                                                last7Days: activityStats.reviews_last_7_days || 0
                                            },
                                            votes: {
                                                total: voteStats.total_votes || 0,
                                                upvotes: voteStats.total_upvotes || 0,
                                                downvotes: voteStats.total_downvotes || 0,
                                                uniqueVoters: voteStats.unique_voters || 0
                                            },
                                            byType: typeStats.map(t => ({
                                                type: t.product_type,
                                                count: t.count,
                                                avgRating: parseFloat(t.avg_rating.toFixed(2))
                                            })),
                                            activity: {
                                                activeUsers7Days: activityStats.active_users_last_7_days || 0
                                            },
                                            generatedAt: new Date().toISOString()
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );

    } catch (error) {
        console.error('Erreur GET stats:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

/**
 * GET /api/admin/leaderboard
 * Classement des utilisateurs les plus actifs
 */
router.get('/leaderboard', requireStaff, (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const db = getDatabase();

        db.all(
            `SELECT 
        owner_id,
        COUNT(*) as review_count,
        AVG(overall_rating) as avg_rating,
        MAX(created_at) as last_review,
        SUM(CASE WHEN is_private = 0 THEN 1 ELSE 0 END) as public_count
       FROM reviews
       GROUP BY owner_id
       ORDER BY review_count DESC
       LIMIT ?`,
            [limit],
            (err, rows) => {
                if (err) {
                    console.error('Erreur leaderboard:', err);
                    return res.status(500).json({
                        error: 'db_error',
                        message: 'Erreur lors de la récupération du classement'
                    });
                }

                const leaderboard = rows.map((row, index) => ({
                    rank: index + 1,
                    userId: row.owner_id,
                    reviewCount: row.review_count,
                    publicCount: row.public_count,
                    avgRating: parseFloat(row.avg_rating.toFixed(2)),
                    lastReview: row.last_review
                }));

                res.json({
                    leaderboard,
                    total: rows.length,
                    generatedAt: new Date().toISOString()
                });
            }
        );

    } catch (error) {
        console.error('Erreur GET leaderboard:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de la récupération du classement'
        });
    }
});

/**
 * GET /api/admin/tokens
 * Liste tous les tokens actifs
 */
router.get('/tokens', requireStaff, (req, res) => {
    try {
        const tokensDir = path.join(__dirname, '..', 'tokens');

        if (!fs.existsSync(tokensDir)) {
            return res.json({ tokens: [], total: 0 });
        }

        const files = fs.readdirSync(tokensDir);
        const tokens = [];

        for (const file of files) {
            try {
                const tokenPath = path.join(tokensDir, file);
                const content = fs.readFileSync(tokenPath, 'utf8');
                const stats = fs.statSync(tokenPath);

                let tokenData;
                try {
                    tokenData = JSON.parse(content);
                } catch {
                    // Token au format texte simple (ancien format)
                    tokenData = { ownerId: content.trim() };
                }

                tokens.push({
                    token: file.substring(0, 8) + '...',
                    ownerId: tokenData.ownerId,
                    discordId: tokenData.discordId || null,
                    discordUsername: tokenData.discordUsername || null,
                    roles: tokenData.roles || [],
                    createdAt: tokenData.createdAt || stats.birthtime.toISOString(),
                    lastAccess: stats.atime.toISOString()
                });
            } catch (error) {
                console.error(`Erreur lecture token ${file}:`, error);
            }
        }

        // Trier par date de création (plus récent en premier)
        tokens.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            tokens,
            total: tokens.length,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erreur GET tokens:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de la récupération des tokens'
        });
    }
});

/**
 * DELETE /api/admin/tokens/:tokenPrefix
 * Supprime un token (pour invalider une session)
 */
router.delete('/tokens/:tokenPrefix', requireStaff, (req, res) => {
    try {
        const { tokenPrefix } = req.params;

        if (!tokenPrefix || tokenPrefix.length < 8) {
            return res.status(400).json({
                error: 'invalid_prefix',
                message: 'Préfixe de token invalide (minimum 8 caractères)'
            });
        }

        const tokensDir = path.join(__dirname, '..', 'tokens');
        const files = fs.readdirSync(tokensDir);

        const matchingFile = files.find(f => f.startsWith(tokenPrefix));

        if (!matchingFile) {
            return res.status(404).json({
                error: 'token_not_found',
                message: 'Token introuvable'
            });
        }

        const tokenPath = path.join(tokensDir, matchingFile);
        fs.unlinkSync(tokenPath);

        console.log(`Token supprimé par admin: ${matchingFile}`);

        res.json({
            success: true,
            message: 'Token supprimé',
            token: matchingFile.substring(0, 8) + '...'
        });

    } catch (error) {
        console.error('Erreur DELETE token:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de la suppression du token'
        });
    }
});

/**
 * GET /api/admin/reviews/flagged
 * Liste les reviews signalées ou suspectes
 */
router.get('/reviews/flagged', requireStaff, (req, res) => {
    try {
        const db = getDatabase();

        // Critères de signalement:
        // - Note globale extrême (0 ou 10)
        // - Texte très court ou très long
        // - Beaucoup de downvotes
        db.all(
            `SELECT 
        r.*,
        (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id AND vote = -1) as downvotes,
        (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id AND vote = 1) as upvotes
       FROM reviews r
       WHERE 
         overall_rating IN (0, 10) OR
         LENGTH(review_text) < 10 OR
         LENGTH(review_text) > 5000 OR
         (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id AND vote = -1) > 5
       ORDER BY created_at DESC
       LIMIT 50`,
            (err, rows) => {
                if (err) {
                    console.error('Erreur reviews flagged:', err);
                    return res.status(500).json({
                        error: 'db_error',
                        message: 'Erreur lors de la récupération des reviews signalées'
                    });
                }

                const flagged = rows.map(row => ({
                    id: row.id,
                    holderName: row.holder_name,
                    productType: row.product_type,
                    overallRating: row.overall_rating,
                    reviewText: row.review_text.substring(0, 200) + (row.review_text.length > 200 ? '...' : ''),
                    textLength: row.review_text.length,
                    upvotes: row.upvotes,
                    downvotes: row.downvotes,
                    ownerId: row.owner_id,
                    createdAt: row.created_at,
                    flags: [
                        row.overall_rating === 0 && 'Note minimale',
                        row.overall_rating === 10 && 'Note maximale',
                        row.review_text.length < 10 && 'Texte trop court',
                        row.review_text.length > 5000 && 'Texte trop long',
                        row.downvotes > 5 && 'Beaucoup de downvotes'
                    ].filter(Boolean)
                }));

                res.json({
                    flagged,
                    total: flagged.length,
                    generatedAt: new Date().toISOString()
                });
            }
        );

    } catch (error) {
        console.error('Erreur GET flagged reviews:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de la récupération des reviews signalées'
        });
    }
});

/**
 * GET /api/admin/health
 * Health check du système
 */
router.get('/health', requireStaff, (req, res) => {
    try {
        const db = getDatabase();

        // Vérifier la connexion DB
        db.get('SELECT 1', (err) => {
            if (err) {
                return res.status(503).json({
                    status: 'unhealthy',
                    database: 'error',
                    error: err.message
                });
            }

            // Vérifier l'espace disque (simplifié)
            const dbPath = path.join(__dirname, '..', '..', 'db', 'reviews.sqlite');
            const imagesDir = path.join(__dirname, '..', '..', 'db', 'review_images');

            let dbSize = 0;
            let imagesCount = 0;
            let imagesSize = 0;

            try {
                dbSize = fs.statSync(dbPath).size;
            } catch (e) {
                console.error('Erreur lecture taille DB:', e);
            }

            try {
                const files = fs.readdirSync(imagesDir);
                imagesCount = files.length;
                imagesSize = files.reduce((total, file) => {
                    try {
                        return total + fs.statSync(path.join(imagesDir, file)).size;
                    } catch {
                        return total;
                    }
                }, 0);
            } catch (e) {
                console.error('Erreur lecture images:', e);
            }

            res.json({
                status: 'healthy',
                database: 'ok',
                storage: {
                    dbSize: Math.round(dbSize / 1024 / 1024 * 100) / 100 + ' MB',
                    imagesCount,
                    imagesSize: Math.round(imagesSize / 1024 / 1024 * 100) / 100 + ' MB',
                    totalSize: Math.round((dbSize + imagesSize) / 1024 / 1024 * 100) / 100 + ' MB'
                },
                uptime: process.uptime(),
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100 + ' MB',
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100 + ' MB'
                },
                timestamp: new Date().toISOString()
            });
        });

    } catch (error) {
        console.error('Erreur health check:', error);
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
