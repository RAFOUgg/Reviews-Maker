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

export default router;
