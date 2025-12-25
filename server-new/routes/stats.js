/**
 * Routes pour les statistiques utilisateur
 * - Statistiques globales (reviews, exports, engagements)
 * - Statistiques détaillées par type de compte
 * - Producteurs: statistiques cultures et rendements
 * - Influenceurs: statistiques d'engagement
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/errorHandler.js';
import { getUserAccountType } from '../services/account.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware d'authentification
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }
    next();
};

/**
 * GET /api/stats
 * Récupère les statistiques globales de l'utilisateur
 */
router.get('/', requireAuth, asyncHandler(async (req, res) => {
    // Récupérer ou créer les stats de l'utilisateur
    let stats = await prisma.userStats.findUnique({
        where: { userId: req.user.id },
    });

    if (!stats) {
        // Créer les stats initiales
        stats = await prisma.userStats.create({
            data: {
                userId: req.user.id,
            },
        });
    }

    // Récupérer les reviews pour calculer les stats en temps réel
    const [
        totalReviews,
        publicReviews,
        flowerReviews,
        hashReviews,
        concentrateReviews,
        edibleReviews,
        totalLikes,
        totalComments,
        totalViews,
    ] = await Promise.all([
        prisma.review.count({ where: { authorId: req.user.id } }),
        prisma.review.count({ where: { authorId: req.user.id, isPublic: true } }),
        prisma.review.count({ where: { authorId: req.user.id, type: 'Fleur' } }),
        prisma.review.count({ where: { authorId: req.user.id, type: 'Hash' } }),
        prisma.review.count({ where: { authorId: req.user.id, type: 'Concentré' } }),
        prisma.review.count({ where: { authorId: req.user.id, type: 'Comestible' } }),
        prisma.reviewLike.count({
            where: {
                review: {
                    authorId: req.user.id,
                },
                isLike: true,
            },
        }),
        prisma.reviewComment.count({
            where: {
                review: {
                    authorId: req.user.id,
                },
                isDeleted: false,
            },
        }),
        prisma.reviewView.count({
            where: {
                review: {
                    authorId: req.user.id,
                },
            },
        }),
    ]);

    // Mettre à jour les stats
    const updatedStats = await prisma.userStats.update({
        where: { userId: req.user.id },
        data: {
            totalReviews,
            publicReviews,
            privateReviews: totalReviews - publicReviews,
            flowerReviews,
            hashReviews,
            concentrateReviews,
            edibleReviews,
            totalLikes,
            totalComments,
            totalViews,
            updatedAt: new Date(),
        },
    });

    res.json(updatedStats);
}));

/**
 * GET /api/stats/reviews
 * Statistiques détaillées des reviews
 */
router.get('/reviews', requireAuth, asyncHandler(async (req, res) => {
    const { period = '30d' } = req.query;

    // Calculer la date de début
    let startDate = new Date();
    switch (period) {
        case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(startDate.getDate() - 90);
            break;
        case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        case 'all':
            startDate = new Date(0);
            break;
    }

    // Reviews par type
    const reviewsByType = await prisma.review.groupBy({
        by: ['type'],
        where: {
            authorId: req.user.id,
            createdAt: {
                gte: startDate,
            },
        },
        _count: {
            id: true,
        },
    });

    // Reviews par mois (derniers 12 mois)
    const reviewsByMonth = await prisma.$queryRaw`
        SELECT 
            strftime('%Y-%m', createdAt) as month,
            COUNT(*) as count
        FROM reviews
        WHERE authorId = ${req.user.id}
        AND createdAt >= datetime('now', '-12 months')
        GROUP BY month
        ORDER BY month ASC
    `;

    // Top cultivars
    const topCultivars = await prisma.review.groupBy({
        by: ['cultivars'],
        where: {
            authorId: req.user.id,
            cultivars: {
                not: null,
            },
        },
        _count: {
            id: true,
        },
        orderBy: {
            _count: {
                id: 'desc',
            },
        },
        take: 10,
    });

    // Moyenne des notes
    const avgRating = await prisma.review.aggregate({
        where: {
            authorId: req.user.id,
            note: {
                not: null,
            },
        },
        _avg: {
            note: true,
        },
    });

    res.json({
        period,
        byType: reviewsByType,
        byMonth: reviewsByMonth,
        topCultivars,
        averageRating: avgRating._avg.note,
    });
}));

/**
 * GET /api/stats/engagement
 * Statistiques d'engagement (likes, vues, commentaires)
 */
router.get('/engagement', requireAuth, asyncHandler(async (req, res) => {
    const { period = '30d' } = req.query;

    // Calculer la date de début
    let startDate = new Date();
    switch (period) {
        case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(startDate.getDate() - 90);
            break;
        case 'all':
            startDate = new Date(0);
            break;
    }

    // Reviews les plus likées
    const topLikedReviews = await prisma.review.findMany({
        where: {
            authorId: req.user.id,
            isPublic: true,
        },
        include: {
            _count: {
                select: {
                    likes: true,
                    views: true,
                    comments: true,
                },
            },
        },
        orderBy: {
            likes: {
                _count: 'desc',
            },
        },
        take: 5,
    });

    // Vues par jour (30 derniers jours)
    const viewsByDay = await prisma.$queryRaw`
        SELECT 
            DATE(rv.viewedAt) as date,
            COUNT(*) as views
        FROM review_views rv
        INNER JOIN reviews r ON rv.reviewId = r.id
        WHERE r.authorId = ${req.user.id}
        AND rv.viewedAt >= datetime('now', '-30 days')
        GROUP BY date
        ORDER BY date ASC
    `;

    // Taux d'engagement (likes / vues)
    const [totalLikes, totalViews] = await Promise.all([
        prisma.reviewLike.count({
            where: {
                review: {
                    authorId: req.user.id,
                },
                isLike: true,
            },
        }),
        prisma.reviewView.count({
            where: {
                review: {
                    authorId: req.user.id,
                },
            },
        }),
    ]);

    const engagementRate = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;

    res.json({
        period,
        topLikedReviews,
        viewsByDay,
        totalLikes,
        totalViews,
        engagementRate: engagementRate.toFixed(2),
    });
}));

/**
 * GET /api/stats/producer
 * Statistiques spécifiques aux producteurs (cultures, rendements)
 * Accessible uniquement aux comptes Producteur
 */
router.get('/producer', requireAuth, asyncHandler(async (req, res) => {
    const accountType = getUserAccountType(req.user);

    if (accountType !== 'producer' && accountType !== 'beta_tester') {
        return res.status(403).json({
            error: 'forbidden',
            message: 'Accessible uniquement aux producteurs',
        });
    }

    // Récupérer toutes les reviews de type Fleur avec pipeline culture
    const flowerReviews = await prisma.review.findMany({
        where: {
            authorId: req.user.id,
            type: 'Fleur',
        },
        include: {
            flowerData: true,
        },
    });

    // Calculer les statistiques de culture
    let totalCultures = 0;
    let totalYield = 0;
    let totalDuration = 0;
    let cultureTypes = {};

    flowerReviews.forEach(review => {
        if (review.flowerData?.culturePipelineId) {
            totalCultures++;

            // TODO: Récupérer les données de rendement depuis le pipeline
            // Pour l'instant, on peut utiliser des champs custom si disponibles

            if (review.flowerData.cultureDuration) {
                totalDuration += review.flowerData.cultureDuration;
            }
        }
    });

    const avgDuration = totalCultures > 0 ? totalDuration / totalCultures : 0;
    const avgYield = totalCultures > 0 ? totalYield / totalCultures : 0;

    // Répartition par type de culture (indoor, outdoor, greenhouse)
    // TODO: Extraire depuis les pipelines

    // Mettre à jour UserStats pour les producteurs
    await prisma.userStats.update({
        where: { userId: req.user.id },
        data: {
            totalCultures,
            totalYield: totalYield || null,
            avgYield: avgYield || null,
        },
    }).catch(() => {
        // Ignorer si UserStats n'existe pas encore
    });

    res.json({
        totalCultures,
        totalYield,
        avgYield,
        avgDuration,
        cultureTypes,
    });
}));

/**
 * GET /api/stats/exports
 * Statistiques d'exports
 */
router.get('/exports', requireAuth, asyncHandler(async (req, res) => {
    // Récupérer les stats d'exports depuis UserStats
    const stats = await prisma.userStats.findUnique({
        where: { userId: req.user.id },
    });

    if (!stats) {
        return res.json({
            totalExports: 0,
            byFormat: {},
        });
    }

    const byFormat = {
        PNG: stats.exportsPNG || 0,
        JPEG: stats.exportsJPEG || 0,
        PDF: stats.exportsPDF || 0,
        SVG: stats.exportsSVG || 0,
        CSV: stats.exportsCSV || 0,
        JSON: stats.exportsJSON || 0,
        HTML: stats.exportsHTML || 0,
    };

    res.json({
        totalExports: stats.totalExports || 0,
        byFormat,
        lastExportDate: stats.lastExportDate,
    });
}));

/**
 * POST /api/stats/exports/track
 * Enregistrer un export (incrémenter les compteurs)
 */
router.post('/exports/track', requireAuth, asyncHandler(async (req, res) => {
    const { format } = req.body;

    if (!format) {
        return res.status(400).json({
            error: 'missing_format',
            message: 'Format requis (PNG, JPEG, PDF, SVG, CSV, JSON, HTML)',
        });
    }

    const validFormats = ['PNG', 'JPEG', 'PDF', 'SVG', 'CSV', 'JSON', 'HTML'];
    if (!validFormats.includes(format.toUpperCase())) {
        return res.status(400).json({
            error: 'invalid_format',
            message: 'Format invalide',
        });
    }

    // Récupérer ou créer les stats
    let stats = await prisma.userStats.findUnique({
        where: { userId: req.user.id },
    });

    if (!stats) {
        stats = await prisma.userStats.create({
            data: {
                userId: req.user.id,
            },
        });
    }

    // Incrémenter les compteurs
    const formatField = `exports${format.toUpperCase()}`;
    const updateData = {
        totalExports: stats.totalExports + 1,
        lastExportDate: new Date(),
    };

    // Incrémenter le compteur spécifique au format
    updateData[formatField] = (stats[formatField] || 0) + 1;

    const updated = await prisma.userStats.update({
        where: { userId: req.user.id },
        data: updateData,
    });

    res.json(updated);
}));

/**
 * GET /api/stats/quick/:userId
 * Statistiques rapides pour HomePage CDC : total reviews, exports, type favori, likes
 */
router.get('/quick/:userId', requireAuth, asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Vérifier que l'utilisateur demande ses propres stats
    if (req.user.id !== userId) {
        return res.status(403).json({ error: 'Accès refusé' });
    }

    // 1. Total reviews créées
    const totalReviews = await prisma.review.count({
        where: { authorId: userId }
    });

    // 2. Total exports réalisés via UserStats
    const userStats = await prisma.userStats.findUnique({
        where: { userId }
    });
    const totalExports = userStats?.totalExports || 0;

    // 3. Type de produit favori (le plus créé)
    const reviewsByType = await prisma.review.groupBy({
        by: ['type'],
        where: { authorId: userId },
        _count: { id: true }
    });

    let favoriteType = 'Aucun';
    let maxCount = 0;

    reviewsByType.forEach(group => {
        if (group._count.id > maxCount) {
            maxCount = group._count.id;
            favoriteType = group.type;
        }
    });

    // 4. Total likes reçus sur toutes les reviews
    const totalLikes = await prisma.reviewLike.count({
        where: {
            review: {
                authorId: userId
            },
            isLike: true
        }
    });

    res.json({
        stats: {
            totalReviews,
            totalExports,
            favoriteType,
            totalLikes
        }
    });
}));

export default router;
