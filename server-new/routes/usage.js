import express from 'express';
import { prisma } from '../server.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/usage/stats - Récupère les statistiques d'utilisation de l'utilisateur
router.get('/stats', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Récupérer le nombre de reviews privées
    const privateReviews = await prisma.review.count({
        where: {
            authorId: userId,
            isPrivate: true
        }
    });

    // Récupérer le nombre de reviews publiques
    const publicReviews = await prisma.review.count({
        where: {
            authorId: userId,
            isPrivate: false
        }
    });

    // Récupérer le nombre de templates personnalisés
    const customTemplates = await prisma.exportTemplate.count({
        where: {
            userId,
            isCustom: true
        }
    });

    // Récupérer le nombre de filigranes personnalisés
    const customWatermarks = await prisma.watermark.count({
        where: {
            userId
        }
    });

    // Récupérer les exports du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayExports = await prisma.export.count({
        where: {
            userId,
            createdAt: {
                gte: today
            }
        }
    });

    // Récupérer les reviews totales
    const totalReviews = await prisma.review.count({
        where: {
            authorId: userId
        }
    });

    // Récupérer les exports totaux
    const totalExports = await prisma.export.count({
        where: {
            userId
        }
    });

    res.json({
        privateReviews,
        publicReviews,
        customTemplates,
        customWatermarks,
        todayExports,
        totalReviews,
        totalExports
    });
}));

// GET /api/usage/exports/today - Récupère le nombre d'exports aujourd'hui
router.get('/exports/today', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await prisma.export.count({
        where: {
            userId,
            createdAt: {
                gte: today
            }
        }
    });

    res.json({ count });
}));

// POST /api/usage/exports/increment - Incrémente le compteur d'exports
router.post('/exports/increment', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { format, quality } = req.body;

    // Créer un enregistrement d'export
    await prisma.export.create({
        data: {
            userId,
            format: format || 'png',
            quality: quality || 'standard',
            createdAt: new Date()
        }
    });

    // Retourner le nouveau compte
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await prisma.export.count({
        where: {
            userId,
            createdAt: {
                gte: today
            }
        }
    });

    res.json({ count });
}));

export default router;
