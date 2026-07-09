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
// Figement (Chantier 6 traçabilité) : si reviewId + snapshotData sont fournis (rapport de
// traçabilité), on stocke une copie des données réellement rendues + leur hash, pour pouvoir
// attester plus tard que cet export correspondait à la review telle qu'elle était à cette date.
// Un export image classique (png/jpeg sans snapshot) reste un simple compteur comme avant —
// aucune contrainte, snapshotData/contentHash restent optionnels sur le modèle.
router.post('/exports/increment', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { format, quality, reviewId, snapshotData, contentHash } = req.body;

    const created = await prisma.export.create({
        data: {
            userId,
            format: format || 'png',
            quality: quality || 'standard',
            reviewId: reviewId || null,
            snapshotData: snapshotData ? JSON.stringify(snapshotData) : null,
            contentHash: contentHash || null,
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

    res.json({ count, exportId: created.id });
}));

// GET /api/usage/exports/:id - Récupère un export figé (Chantier 6) pour vérification :
// le client recalcule le hash des données actuelles de la review et le compare à contentHash
// pour savoir si l'export "a dérivé" depuis la review source. Accessible au propriétaire
// uniquement (un export figé est un document privé, pas une review publique).
router.get('/exports/:id', requireAuth, asyncHandler(async (req, res) => {
    const record = await prisma.export.findUnique({ where: { id: req.params.id } });

    if (!record || record.userId !== req.user.id) {
        return res.status(404).json({ error: 'Export not found' });
    }

    res.json({
        id: record.id,
        reviewId: record.reviewId,
        format: record.format,
        contentHash: record.contentHash,
        snapshotData: record.snapshotData ? JSON.parse(record.snapshotData) : null,
        createdAt: record.createdAt
    });
}));

export default router;
