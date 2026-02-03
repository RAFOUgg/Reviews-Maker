/**
 * Routes pour la bibliothèque personnelle de l'utilisateur
 * - Templates sauvegardés
 * - Filigranes (watermarks)
 * - Données réutilisables (cultivars, pipelines, recettes, etc.)
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, requireAuthOrThrow } from '../utils/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware d'authentification requis pour toutes les routes
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }
    next();
};

// ===========================
// TEMPLATES SAUVEGARDÉS
// ===========================

/**
 * GET /api/library/templates
 * Liste tous les templates sauvegardés de l'utilisateur
 */
router.get('/templates', requireAuth, asyncHandler(async (req, res) => {
    const { templateType, format, sortBy = 'useCount', order = 'desc' } = req.query;

    const where = {
        userId: req.user.id,
        ...(templateType && { templateType }),
        ...(format && { format }),
    };

    const templates = await prisma.savedTemplate.findMany({
        where,
        orderBy: { [sortBy]: order },
    });

    res.json(templates);
}));

/**
 * GET /api/library/templates/:id
 * Récupère un template sauvegardé
 */
router.get('/templates/:id', requireAuth, asyncHandler(async (req, res) => {
    const template = await prisma.savedTemplate.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id,
        },
    });

    if (!template) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Template non trouvé',
        });
    }

    res.json(template);
}));

/**
 * POST /api/library/templates
 * Sauvegarde un nouveau template
 */
router.post('/templates', requireAuth, asyncHandler(async (req, res) => {
    const { name, description, templateType, format, config, thumbnail, tags } = req.body;

    // Validation
    if (!name || !templateType || !format || !config) {
        return res.status(400).json({
            error: 'missing_fields',
            message: 'Champs requis: name, templateType, format, config',
        });
    }

    // Vérifier que config est un objet valide
    let configParsed;
    try {
        configParsed = typeof config === 'string' ? JSON.parse(config) : config;
    } catch (e) {
        return res.status(400).json({
            error: 'invalid_config',
            message: 'Configuration invalide',
        });
    }

    const template = await prisma.savedTemplate.create({
        data: {
            userId: req.user.id,
            name,
            description: description || null,
            templateType,
            format,
            config: JSON.stringify(configParsed),
            thumbnail: thumbnail || null,
            tags: tags ? JSON.stringify(tags) : null,
        },
    });

    res.status(201).json(template);
}));

/**
 * PUT /api/library/templates/:id
 * Met à jour un template sauvegardé
 */
router.put('/templates/:id', requireAuth, asyncHandler(async (req, res) => {
    const { name, description, config, thumbnail, tags } = req.body;

    const existing = await prisma.savedTemplate.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id,
        },
    });

    if (!existing) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Template non trouvé',
        });
    }

    const template = await prisma.savedTemplate.update({
        where: { id: req.params.id },
        data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(config && { config: JSON.stringify(typeof config === 'string' ? JSON.parse(config) : config) }),
            ...(thumbnail !== undefined && { thumbnail }),
            ...(tags && { tags: JSON.stringify(tags) }),
            updatedAt: new Date(),
        },
    });

    res.json(template);
}));

/**
 * DELETE /api/library/templates/:id
 * Supprime un template sauvegardé
 */
router.delete('/templates/:id', requireAuth, asyncHandler(async (req, res) => {
    const existing = await prisma.savedTemplate.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id,
        },
    });

    if (!existing) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Template non trouvé',
        });
    }

    await prisma.savedTemplate.delete({
        where: { id: req.params.id },
    });

    res.json({ message: 'Template supprimé', id: req.params.id });
}));

/**
 * POST /api/library/templates/:id/use
 * Incrémente le compteur d'utilisation d'un template
 */
router.post('/templates/:id/use', requireAuth, asyncHandler(async (req, res) => {
    const template = await prisma.savedTemplate.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id,
        },
    });

    if (!template) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Template non trouvé',
        });
    }

    const updated = await prisma.savedTemplate.update({
        where: { id: req.params.id },
        data: {
            useCount: template.useCount + 1,
            lastUsedAt: new Date(),
        },
    });

    res.json(updated);
}));

// ===========================
// FILIGRANES (WATERMARKS)
// ===========================

/**
 * GET /api/library/watermarks
 * Liste tous les filigranes de l'utilisateur
 */
router.get('/watermarks', requireAuth, asyncHandler(async (req, res) => {
    const { type } = req.query;

    const where = {
        userId: req.user.id,
        ...(type && { type }),
    };

    const watermarks = await prisma.watermark.findMany({
        where,
        orderBy: [
            { isDefault: 'desc' },
            { useCount: 'desc' },
        ],
    });

    res.json(watermarks);
}));

/**
 * GET /api/library/watermarks/default
 * Récupère le filigrane par défaut
 */
router.get('/watermarks/default', requireAuth, asyncHandler(async (req, res) => {
    const watermark = await prisma.watermark.findFirst({
        where: {
            userId: req.user.id,
            isDefault: true,
        },
    });

    if (!watermark) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Aucun filigrane par défaut',
        });
    }

    res.json(watermark);
}));

/**
 * POST /api/library/watermarks
 * Crée un nouveau filigrane
 */
router.post('/watermarks', requireAuth, asyncHandler(async (req, res) => {
    const { name, description, type, content, imageUrl, style, isDefault } = req.body;

    // Validation
    if (!name || !type || !style) {
        return res.status(400).json({
            error: 'missing_fields',
            message: 'Champs requis: name, type, style',
        });
    }

    if (!['text', 'image', 'logo'].includes(type)) {
        return res.status(400).json({
            error: 'invalid_type',
            message: 'Type invalide. Valeurs: text, image, logo',
        });
    }

    // Si isDefault = true, retirer le flag default des autres
    if (isDefault) {
        await prisma.watermark.updateMany({
            where: {
                userId: req.user.id,
                isDefault: true,
            },
            data: {
                isDefault: false,
            },
        });
    }

    const watermark = await prisma.watermark.create({
        data: {
            userId: req.user.id,
            name,
            description: description || null,
            type,
            content: content || null,
            imageUrl: imageUrl || null,
            style: JSON.stringify(typeof style === 'string' ? JSON.parse(style) : style),
            isDefault: isDefault || false,
        },
    });

    res.status(201).json(watermark);
}));

/**
 * PUT /api/library/watermarks/:id
 * Met à jour un filigrane
 */
router.put('/watermarks/:id', requireAuth, asyncHandler(async (req, res) => {
    const { name, description, content, imageUrl, style, isDefault } = req.body;

    const existing = await prisma.watermark.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id,
        },
    });

    if (!existing) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Filigrane non trouvé',
        });
    }

    // Si isDefault = true, retirer le flag default des autres
    if (isDefault && !existing.isDefault) {
        await prisma.watermark.updateMany({
            where: {
                userId: req.user.id,
                isDefault: true,
            },
            data: {
                isDefault: false,
            },
        });
    }

    const watermark = await prisma.watermark.update({
        where: { id: req.params.id },
        data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(content !== undefined && { content }),
            ...(imageUrl !== undefined && { imageUrl }),
            ...(style && { style: JSON.stringify(typeof style === 'string' ? JSON.parse(style) : style) }),
            ...(isDefault !== undefined && { isDefault }),
            updatedAt: new Date(),
        },
    });

    res.json(watermark);
}));

/**
 * DELETE /api/library/watermarks/:id
 * Supprime un filigrane
 */
router.delete('/watermarks/:id', requireAuth, asyncHandler(async (req, res) => {
    const existing = await prisma.watermark.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id,
        },
    });

    if (!existing) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Filigrane non trouvé',
        });
    }

    await prisma.watermark.delete({
        where: { id: req.params.id },
    });

    res.json({ message: 'Filigrane supprimé', id: req.params.id });
}));

// ===========================
// DONNÉES SAUVEGARDÉES
// ===========================

/**
 * GET /api/library/data
 * Liste toutes les données sauvegardées
 */
router.get('/data', requireAuth, asyncHandler(async (req, res) => {
    const { dataType, category, search } = req.query;

    const where = {
        userId: req.user.id,
        ...(dataType && { dataType }),
        ...(category && { category }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    const data = await prisma.savedData.findMany({
        where,
        orderBy: [
            { useCount: 'desc' },
            { createdAt: 'desc' },
        ],
    });

    res.json(data);
}));

/**
 * POST /api/library/data
 * Sauvegarde une nouvelle donnée
 */
router.post('/data', requireAuth, asyncHandler(async (req, res) => {
    const { dataType, name, description, data, category, tags } = req.body;

    if (!dataType || !name || !data) {
        return res.status(400).json({
            error: 'missing_fields',
            message: 'Champs requis: dataType, name, data',
        });
    }

    const savedData = await prisma.savedData.create({
        data: {
            userId: req.user.id,
            dataType,
            name,
            description: description || null,
            data: JSON.stringify(typeof data === 'string' ? JSON.parse(data) : data),
            category: category || null,
            tags: tags ? JSON.stringify(tags) : null,
        },
    });

    res.status(201).json(savedData);
}));

/**
 * DELETE /api/library/data/:id
 * Supprime une donnée sauvegardée
 */
router.delete('/data/:id', requireAuth, asyncHandler(async (req, res) => {
    const existing = await prisma.savedData.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id,
        },
    });

    if (!existing) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Donnée non trouvée',
        });
    }

    await prisma.savedData.delete({
        where: { id: req.params.id },
    });

    res.json({ message: 'Donnée supprimée', id: req.params.id });
}));

// ===========================
// CULTIVARS (Producteur)
// ===========================

/**
 * GET /api/library/cultivars
 * Liste les cultivars de l'utilisateur
 */
router.get('/cultivars', requireAuth, asyncHandler(async (req, res) => {
    const { type, search } = req.query;

    const where = {
        userId: req.user.id,
        ...(type && type !== 'all' && { type }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { breeder: { contains: search, mode: 'insensitive' } },
                { parentage: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    const rawCultivars = await prisma.cultivar.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });

    // Mapper les champs du modèle vers les champs attendus par le frontend
    const cultivars = rawCultivars.map(c => {
        const notesData = c.notes ? JSON.parse(c.notes) : {};
        return {
            ...c,
            genetics: c.parentage,
            description: notesData.description || null,
            thcRange: notesData.thcRange || null,
            cbdRange: notesData.cbdRange || null,
            floweringTime: notesData.floweringTime || null,
            yield: notesData.yield || null,
            tags: notesData.tags || []
        };
    });

    res.json({ cultivars });
}));

/**
 * POST /api/library/cultivars
 * Crée un nouveau cultivar
 */
router.post('/cultivars', requireAuth, asyncHandler(async (req, res) => {
    const { name, breeder, type, genetics, phenotype, thcRange, cbdRange, floweringTime, yield: yieldValue, description, tags } = req.body;

    if (!name) {
        return res.status(400).json({
            error: 'missing_fields',
            message: 'Le nom est requis',
        });
    }

    // Mapper les champs frontend vers les champs du modèle Prisma existant
    // genetics -> parentage, description -> notes
    // Les champs thcRange, cbdRange, floweringTime, yield, tags n'existent pas encore dans le modèle
    // Ils seront stockés dans notes comme JSON temporairement
    const extraData = {};
    if (thcRange) extraData.thcRange = thcRange;
    if (cbdRange) extraData.cbdRange = cbdRange;
    if (floweringTime) extraData.floweringTime = floweringTime;
    if (yieldValue) extraData.yield = yieldValue;
    if (tags) extraData.tags = tags;

    const cultivar = await prisma.cultivar.create({
        data: {
            userId: req.user.id,
            name,
            breeder: breeder || null,
            type: type || 'Hybride',
            parentage: genetics || null, // genetics -> parentage
            phenotype: phenotype || null,
            notes: description ? JSON.stringify({ description, ...extraData }) : (Object.keys(extraData).length ? JSON.stringify(extraData) : null),
        },
    });

    // Retourner avec les noms de champs attendus par le frontend
    res.status(201).json({
        ...cultivar,
        genetics: cultivar.parentage,
        description: description || null,
        thcRange,
        cbdRange,
        floweringTime,
        yield: yieldValue,
        tags
    });
}));

/**
 * PUT /api/library/cultivars/:id
 * Met à jour un cultivar
 */
router.put('/cultivars/:id', requireAuth, asyncHandler(async (req, res) => {
    const existing = await prisma.cultivar.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id,
        },
    });

    if (!existing) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Cultivar non trouvé',
        });
    }

    const { name, breeder, type, genetics, phenotype, thcRange, cbdRange, floweringTime, yield: yieldValue, description, tags } = req.body;

    // Mapper les champs et stocker les extras dans notes
    const extraData = {};
    if (thcRange !== undefined) extraData.thcRange = thcRange;
    if (cbdRange !== undefined) extraData.cbdRange = cbdRange;
    if (floweringTime !== undefined) extraData.floweringTime = floweringTime;
    if (yieldValue !== undefined) extraData.yield = yieldValue;
    if (tags !== undefined) extraData.tags = tags;
    if (description !== undefined) extraData.description = description;

    const cultivar = await prisma.cultivar.update({
        where: { id: req.params.id },
        data: {
            ...(name && { name }),
            ...(breeder !== undefined && { breeder }),
            ...(type && { type }),
            ...(genetics !== undefined && { parentage: genetics }),
            ...(phenotype !== undefined && { phenotype }),
            ...(Object.keys(extraData).length && { notes: JSON.stringify(extraData) }),
            updatedAt: new Date(),
        },
    });

    // Retourner avec les noms de champs attendus par le frontend
    const notesData = cultivar.notes ? JSON.parse(cultivar.notes) : {};
    res.json({
        ...cultivar,
        genetics: cultivar.parentage,
        description: notesData.description || null,
        thcRange: notesData.thcRange || null,
        cbdRange: notesData.cbdRange || null,
        floweringTime: notesData.floweringTime || null,
        yield: notesData.yield || null,
        tags: notesData.tags || []
    });
}));

/**
 * DELETE /api/library/cultivars/:id
 * Supprime un cultivar
 */
router.delete('/cultivars/:id', requireAuth, asyncHandler(async (req, res) => {
    const existing = await prisma.cultivar.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id,
        },
    });

    if (!existing) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Cultivar non trouvé',
        });
    }

    await prisma.cultivar.delete({
        where: { id: req.params.id },
    });

    res.json({ message: 'Cultivar supprimé', id: req.params.id });
}));

// ===========================
// PHENOHUNT PROJECTS
// ===========================

/**
 * GET /api/library/phenohunt
 * Liste les projets PhenoHunt
 * NOTE: PhenoHuntProject model à créer dans schema.prisma
 */
router.get('/phenohunt', requireAuth, asyncHandler(async (req, res) => {
    // TODO: Implémenter quand le modèle PhenoHuntProject sera créé
    // Pour l'instant, retourner un tableau vide
    res.json({ projects: [] });
}));

// ===========================
// STATISTIQUES
// ===========================

/**
 * GET /api/library/stats
 * Récupère les statistiques de la bibliothèque
 */
router.get('/stats', requireAuth, asyncHandler(async (req, res) => {
    const { range = 'all' } = req.query;

    // Calculer la date de début selon la range
    let dateFilter = {};
    const now = new Date();
    if (range === 'week') {
        dateFilter = { gte: new Date(now.setDate(now.getDate() - 7)) };
    } else if (range === 'month') {
        dateFilter = { gte: new Date(now.setMonth(now.getMonth() - 1)) };
    } else if (range === 'year') {
        dateFilter = { gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
    }

    // Reviews count
    const totalReviews = await prisma.review.count({
        where: { userId: req.user.id }
    });

    const reviewsThisMonth = await prisma.review.count({
        where: {
            userId: req.user.id,
            createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        }
    });

    // Reviews by type
    const reviewsByType = await prisma.review.groupBy({
        by: ['type'],
        where: { userId: req.user.id },
        _count: true
    });

    // Public vs Private
    const publicReviews = await prisma.review.count({
        where: { userId: req.user.id, isPublic: true }
    });

    // Engagement (placeholder - will be replaced with real metrics)
    const engagement = {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0
    };

    // Top reviews by views/likes (placeholder)
    const topReviews = await prisma.review.findMany({
        where: { userId: req.user.id, isPublic: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            holderName: true,
            type: true,
            createdAt: true
        }
    });

    res.json({
        reviews: {
            total: totalReviews,
            thisMonth: reviewsThisMonth,
            byType: Object.fromEntries(
                reviewsByType.map(r => [r.type || 'Unknown', r._count])
            ),
            public: publicReviews,
            private: totalReviews - publicReviews
        },
        exports: {
            total: 0,
            thisMonth: 0,
            byFormat: {}
        },
        engagement,
        ratings: {
            given: { average: 0, total: 0 },
            received: { average: 0, total: 0 }
        },
        topReviews: topReviews.map(r => ({
            ...r,
            views: 0,
            likes: 0
        })),
        activity: []
    });
}));

// ===========================
// TEMPLATE SHARING
// ===========================

/**
 * POST /api/library/templates/:id/share
 * Génère un code de partage pour un template
 */
router.post('/templates/:id/share', requireAuth, asyncHandler(async (req, res) => {
    const template = await prisma.savedTemplate.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id,
        },
    });

    if (!template) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Template non trouvé',
        });
    }

    // Générer un code unique (base64 de l'ID + timestamp)
    const shareCode = Buffer.from(`${template.id}-${Date.now()}`).toString('base64').slice(0, 12).toUpperCase();

    // TODO: Ajouter shareCode et shareCodeExpiry au modèle SavedTemplate dans schema.prisma
    // Pour l'instant, stocker dans les tags comme solution temporaire
    const existingTags = template.tags ? JSON.parse(template.tags) : [];
    const newTags = [...existingTags.filter(t => !t.startsWith('share:')), `share:${shareCode}`];
    
    await prisma.savedTemplate.update({
        where: { id: template.id },
        data: {
            tags: JSON.stringify(newTags)
        }
    });

    res.json({ code: shareCode });
}));

/**
 * POST /api/library/templates/import
 * Importe un template via code de partage
 */
router.post('/templates/import', requireAuth, asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            error: 'missing_code',
            message: 'Code de partage requis',
        });
    }

    // Rechercher le template avec le code dans les tags
    const templates = await prisma.savedTemplate.findMany({
        where: {
            tags: { contains: `share:${code.toUpperCase()}` }
        },
    });

    const sourceTemplate = templates[0];

    if (!sourceTemplate) {
        return res.status(404).json({
            error: 'invalid_code',
            message: 'Code invalide ou expiré',
        });
    }

    // Créer une copie pour l'utilisateur
    const newTemplate = await prisma.savedTemplate.create({
        data: {
            userId: req.user.id,
            name: `${sourceTemplate.name} (importé)`,
            description: sourceTemplate.description,
            templateType: sourceTemplate.templateType,
            format: sourceTemplate.format,
            config: sourceTemplate.config,
            thumbnail: sourceTemplate.thumbnail,
            tags: null, // Ne pas copier les tags de partage
        },
    });

    res.status(201).json(newTemplate);
}));

/**
 * POST /api/library/templates/default
 * Définit le template par défaut
 */
router.post('/templates/default', requireAuth, asyncHandler(async (req, res) => {
    const { templateId, isPredefined } = req.body;

    // Stocker la préférence utilisateur (on pourrait utiliser une table User preferences)
    // Pour l'instant, on va simplement renvoyer une confirmation
    res.json({ 
        success: true, 
        defaultId: isPredefined ? `predefined:${templateId}` : templateId 
    });
}));

/**
 * POST /api/library/watermarks/default
 * Définit le filigrane par défaut
 */
router.post('/watermarks/default', requireAuth, asyncHandler(async (req, res) => {
    const { watermarkId } = req.body;

    // Retirer le flag default de tous les watermarks
    await prisma.watermark.updateMany({
        where: {
            userId: req.user.id,
            isDefault: true,
        },
        data: {
            isDefault: false,
        },
    });

    // Définir le nouveau default
    if (watermarkId) {
        await prisma.watermark.update({
            where: { id: watermarkId },
            data: { isDefault: true },
        });
    }

    res.json({ success: true, defaultId: watermarkId });
}));

export default router;
