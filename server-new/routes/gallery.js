/**
 * Routes pour la galerie publique
 * - Liste des reviews publiques
 * - Filtres avancés (type, cultivar, breeder, farm, effets, terpènes, etc.)
 * - Recherche intelligente
 * - Likes et commentaires
 * - Vues (analytics)
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware optionnel (authentification non requise pour lecture)
const optionalAuth = (req, res, next) => {
    // L'authentification peut être faite via passport, on passe juste au suivant
    next();
};

/**
 * GET /api/gallery
 * Liste des reviews publiques avec filtres avancés
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        type,           // "Fleur", "Hash", "Concentré", "Comestible"
        search,         // Recherche texte
        cultivar,       // Filtrer par cultivar
        breeder,        // Filtrer par breeder
        farm,           // Filtrer par farm
        effects,        // JSON: ["relaxant", "euphorique"]
        terpenes,       // JSON: ["myrcène", "limonène"]
        minRating,      // Note minimale
        sortBy = 'createdAt',
        order = 'desc',
        // Filtres avancés
        strainType,     // "indica", "sativa", "hybride"
        indicaMin,      // Ratio indica minimum (0-100)
        indicaMax,      // Ratio indica maximum (0-100)
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construction des filtres
    const where = {
        isPublic: true,
        ...(type && { type }),
    };

    // Recherche texte (holderName, description, cultivar)
    if (search) {
        where.OR = [
            { holderName: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { cultivars: { contains: search, mode: 'insensitive' } },
            { breeder: { contains: search, mode: 'insensitive' } },
            { farm: { contains: search, mode: 'insensitive' } },
        ];
    }

    // Filtres spécifiques
    if (cultivar) {
        where.cultivars = { contains: cultivar, mode: 'insensitive' };
    }
    if (breeder) {
        where.breeder = { contains: breeder, mode: 'insensitive' };
    }
    if (farm) {
        where.farm = { contains: farm, mode: 'insensitive' };
    }
    if (strainType) {
        where.strainType = { contains: strainType, mode: 'insensitive' };
    }
    if (minRating) {
        where.note = { gte: parseFloat(minRating) };
    }

    // Filtres sur ratio indica/sativa (pour Fleurs)
    if (indicaMin !== undefined || indicaMax !== undefined) {
        where.indicaRatio = {};
        if (indicaMin) where.indicaRatio.gte = parseInt(indicaMin);
        if (indicaMax) where.indicaRatio.lte = parseInt(indicaMax);
    }

    // TODO: Filtres avancés sur effects et terpenes (nécessite parsing JSON)
    // Pour l'instant, on peut faire une recherche texte dans les champs JSON

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { [sortBy]: order },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
                likes: {
                    select: {
                        isLike: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        views: true,
                    },
                },
            },
        }),
        prisma.review.count({ where }),
    ]);

    // Calculer les stats pour chaque review
    const reviewsWithStats = reviews.map(review => {
        const likesCount = review.likes.filter(l => l.isLike).length;
        const dislikesCount = review.likes.filter(l => !l.isLike).length;

        return {
            ...review,
            likes: undefined, // Retirer le détail des likes
            stats: {
                likes: likesCount,
                dislikes: dislikesCount,
                comments: review._count.comments,
                views: review._count.views,
            },
            _count: undefined,
        };
    });

    res.json({
        reviews: reviewsWithStats,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
    });
}));

/**
 * GET /api/gallery/:id
 * Détails d'une review publique (avec incrémentation des vues)
 */
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
    const review = await prisma.review.findFirst({
        where: {
            id: req.params.id,
            isPublic: true,
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                },
            },
            likes: {
                select: {
                    userId: true,
                    isLike: true,
                },
            },
            comments: {
                where: {
                    isDeleted: false,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                },
            },
            flowerData: true,
            hashData: true,
            concentrateData: true,
            edibleData: true,
            _count: {
                select: {
                    views: true,
                },
            },
        },
    });

    if (!review) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Review non trouvée',
        });
    }

    // Enregistrer une vue (anonyme ou authentifié)
    await prisma.reviewView.create({
        data: {
            reviewId: review.id,
            userId: req.user?.id || null,
            ipAddress: req.ip ? req.ip.split(':').pop() : null, // Hash de l'IP en production
            userAgent: req.get('user-agent'),
            referer: req.get('referer'),
        },
    }).catch(() => {
        // Ignorer les erreurs de duplication si on veut limiter les vues par user
    });

    // Calculer les stats
    const likesCount = review.likes.filter(l => l.isLike).length;
    const dislikesCount = review.likes.filter(l => !l.isLike).length;
    const userLike = req.user ? review.likes.find(l => l.userId === req.user.id) : null;

    res.json({
        ...review,
        likes: undefined, // Retirer le détail
        stats: {
            likes: likesCount,
            dislikes: dislikesCount,
            comments: review.comments.length,
            views: review._count.views + 1, // +1 pour la vue actuelle
        },
        userLike: userLike ? (userLike.isLike ? 'like' : 'dislike') : null,
        _count: undefined,
    });
}));

/**
 * POST /api/gallery/:id/like
 * Like ou dislike une review publique
 */
router.post('/:id/like', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const { isLike } = req.body; // true = like, false = dislike

    if (typeof isLike !== 'boolean') {
        return res.status(400).json({
            error: 'missing_field',
            message: 'Champ isLike requis (boolean)',
        });
    }

    // Vérifier que la review existe et est publique
    const review = await prisma.review.findFirst({
        where: {
            id: req.params.id,
            isPublic: true,
        },
    });

    if (!review) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Review non trouvée',
        });
    }

    // Vérifier si l'utilisateur a déjà liké/disliké
    const existing = await prisma.reviewLike.findUnique({
        where: {
            reviewId_userId: {
                reviewId: review.id,
                userId: req.user.id,
            },
        },
    });

    let result;

    if (existing) {
        if (existing.isLike === isLike) {
            // Retirer le like/dislike
            await prisma.reviewLike.delete({
                where: {
                    id: existing.id,
                },
            });
            result = { action: 'removed', isLike: null };
        } else {
            // Changer de like à dislike ou inverse
            result = await prisma.reviewLike.update({
                where: {
                    id: existing.id,
                },
                data: {
                    isLike,
                },
            });
            result = { action: 'updated', isLike };
        }
    } else {
        // Créer un nouveau like/dislike
        await prisma.reviewLike.create({
            data: {
                reviewId: review.id,
                userId: req.user.id,
                isLike,
            },
        });
        result = { action: 'created', isLike };
    }

    // Récupérer les stats mises à jour
    const likes = await prisma.reviewLike.findMany({
        where: { reviewId: review.id },
    });

    const likesCount = likes.filter(l => l.isLike).length;
    const dislikesCount = likes.filter(l => !l.isLike).length;

    res.json({
        ...result,
        stats: {
            likes: likesCount,
            dislikes: dislikesCount,
        },
    });
}));

/**
 * POST /api/gallery/:id/comment
 * Ajouter un commentaire sur une review publique
 */
router.post('/:id/comment', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const { content } = req.body;

    if (!content || content.trim().length === 0) {
        return res.status(400).json({
            error: 'missing_content',
            message: 'Le commentaire ne peut pas être vide',
        });
    }

    if (content.length > 1000) {
        return res.status(400).json({
            error: 'content_too_long',
            message: 'Le commentaire ne peut pas dépasser 1000 caractères',
        });
    }

    // Vérifier que la review existe et est publique
    const review = await prisma.review.findFirst({
        where: {
            id: req.params.id,
            isPublic: true,
        },
    });

    if (!review) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Review non trouvée',
        });
    }

    const comment = await prisma.reviewComment.create({
        data: {
            reviewId: review.id,
            userId: req.user.id,
            content: content.trim(),
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                },
            },
        },
    });

    res.status(201).json(comment);
}));

/**
 * PUT /api/gallery/comments/:commentId
 * Modifier son propre commentaire
 */
router.put('/comments/:commentId', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const { content } = req.body;

    if (!content || content.trim().length === 0) {
        return res.status(400).json({
            error: 'missing_content',
            message: 'Le commentaire ne peut pas être vide',
        });
    }

    const comment = await prisma.reviewComment.findFirst({
        where: {
            id: req.params.commentId,
            userId: req.user.id,
            isDeleted: false,
        },
    });

    if (!comment) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Commentaire non trouvé',
        });
    }

    const updated = await prisma.reviewComment.update({
        where: { id: req.params.commentId },
        data: {
            content: content.trim(),
            isEdited: true,
            editedAt: new Date(),
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                },
            },
        },
    });

    res.json(updated);
}));

/**
 * DELETE /api/gallery/comments/:commentId
 * Supprimer son propre commentaire
 */
router.delete('/comments/:commentId', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const comment = await prisma.reviewComment.findFirst({
        where: {
            id: req.params.commentId,
            userId: req.user.id,
        },
    });

    if (!comment) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Commentaire non trouvé',
        });
    }

    // Soft delete
    await prisma.reviewComment.update({
        where: { id: req.params.commentId },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
            deleteReason: 'Supprimé par l\'auteur',
        },
    });

    res.json({ message: 'Commentaire supprimé', id: req.params.commentId });
}));

/**
 * GET /api/gallery/stats/popular
 * Reviews les plus populaires (par likes, vues, etc.)
 */
router.get('/stats/popular', asyncHandler(async (req, res) => {
    const { period = '30d', limit = 10 } = req.query;

    // Calculer la date de début selon la période
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

    const reviews = await prisma.review.findMany({
        where: {
            isPublic: true,
            createdAt: {
                gte: startDate,
            },
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                },
            },
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
        take: parseInt(limit),
    });

    res.json(reviews);
}));

export default router;
