/**
 * Routes pour la bibliothèque personnelle de l'utilisateur
 * - Templates sauvegardés
 * - Filigranes (watermarks)
 * - Données réutilisables (cultivars, pipelines, recettes, etc.)
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, requireAuthOrThrow } from '../utils/errorHandler.js';
import { canAccessFeature } from '../middleware/permissions.js';
import { requireAuth } from '../middleware/auth.js';
import { resolveAccess, companyScopeFilter, canModifyResource, owningCompanyId } from '../services/access.js';
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

const router = express.Router();
const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Multer storage for export uploads
const exportStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const exportDir = path.join(__dirname, '../../db/review_images')
        await fs.mkdir(exportDir, { recursive: true })
        cb(null, exportDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `export-${uniqueSuffix}${path.extname(file.originalname)}`)
    }
})

const uploadExport = multer({
    storage: exportStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|pdf/
        const ext = allowed.test(path.extname(file.originalname).toLowerCase())
        const mime = allowed.test(file.mimetype)
        if (ext && mime) cb(null, true)
        else cb(new Error('Invalid export file type'))
    }
})


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

    // Vérifier quota templates selon le type de compte
    const currentCount = await prisma.savedTemplate.count({ where: { userId: req.user.id } });
    const quotaCheck = canAccessFeature(req.user, 'library_templates', { currentCount });
    if (!quotaCheck.allowed) {
        return res.status(403).json({
            error: 'quota_exceeded',
            message: quotaCheck.reason,
            limit: quotaCheck.limit,
            current: currentCount,
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
 * POST /api/library/watermarks/upload
 * Upload une image de filigrane (logo) — route manquante, le frontend l'appelait déjà
 * (WatermarksTab.jsx) mais sans endpoint backend correspondant, donc l'upload échouait toujours
 */
router.post('/watermarks/upload', requireAuth, uploadExport.single('watermark'), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'missing_file', message: 'Fichier watermark requis (champ: watermark)' })
    }
    res.json({ url: `/images/${req.file.filename}` })
}))

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
    const access = await resolveAccess(req.user);

    // Ses propres données + celles de son entreprise (référentiel partagé : substrats, engrais,
    // matériel… doivent être identiques pour toute l'équipe).
    const where = {
        AND: [
            companyScopeFilter(access),
            {
                ...(dataType && { dataType }),
                ...(category && { category }),
            },
        ],
    };

    const data = await prisma.savedData.findMany({
        where,
        orderBy: [
            { useCount: 'desc' },
            { createdAt: 'desc' },
        ],
    });

    // La recherche est filtrée en JS : `mode: 'insensitive'` n'est pas supporté par le connecteur
    // SQLite de Prisma et fait planter la requête.
    const needle = search ? String(search).toLowerCase() : null;
    const filtered = needle
        ? data.filter(d =>
            d.name?.toLowerCase().includes(needle) ||
            d.description?.toLowerCase().includes(needle))
        : data;

    const parsed = filtered.map(d => ({
        ...d,
        data: d.data ? JSON.parse(d.data) : null,
        // Permet à l'UI de distinguer une donnée d'entreprise d'une donnée personnelle.
        isCompanyOwned: Boolean(d.producerProfileId),
    }));
    res.json(parsed);
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

    const access = await resolveAccess(req.user);
    if (access.company && !access.company.canWrite) {
        return res.status(403).json({ error: 'read_only_member', message: 'Votre rôle est en lecture seule' });
    }

    const savedData = await prisma.savedData.create({
        data: {
            userId: req.user.id, // créateur conservé pour la traçabilité
            producerProfileId: owningCompanyId(access), // la donnée appartient à l'entreprise
            dataType,
            name,
            description: description || null,
            data: JSON.stringify(typeof data === 'string' ? JSON.parse(data) : data),
            category: category || null,
            tags: tags ? JSON.stringify(tags) : null,
        },
    });

    res.status(201).json({ ...savedData, data: typeof data === 'string' ? JSON.parse(data) : data });
}));

/**
 * PUT /api/library/data/:id
 * Met à jour une donnée sauvegardée existante
 */
router.put('/data/:id', requireAuth, asyncHandler(async (req, res) => {
    const access = await resolveAccess(req.user);
    const existing = await prisma.savedData.findFirst({
        where: { AND: [{ id: req.params.id }, companyScopeFilter(access)] },
    });
    if (!existing) {
        return res.status(404).json({ error: 'not_found', message: 'Donnée non trouvée' });
    }
    // Visible ne veut pas dire modifiable : un lecteur consulte le référentiel sans y toucher.
    if (!canModifyResource(access, existing)) {
        return res.status(403).json({ error: 'read_only_member', message: 'Votre rôle ne permet pas de modifier cette donnée' });
    }

    const { dataType, name, description, data, category, tags } = req.body;

    if (!name || !data) {
        return res.status(400).json({
            error: 'missing_fields',
            message: 'Champs requis: name, data',
        });
    }

    const updated = await prisma.savedData.update({
        where: { id: req.params.id },
        data: {
            ...(dataType && { dataType }),
            name,
            description: description ?? existing.description,
            data: JSON.stringify(typeof data === 'string' ? JSON.parse(data) : data),
            category: category ?? existing.category,
            ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
        },
    });

    res.json({ ...updated, data: typeof data === 'string' ? JSON.parse(data) : data });
}));

/**
 * POST /api/library/exports
 * Upload an exported file (png/jpg/pdf) and save it into the user's library.
 * Accepts multipart/form-data with 'file' or JSON body with 'fileUrl'.
 * Fields: reviewId (optional), name, description, templateName, format, isPublic (true/false), tags
 */
router.post('/exports', requireAuth, uploadExport.single('file'), asyncHandler(async (req, res) => {
    const { reviewId, name, description, templateName, format, isPublic: isPublicRaw, tags } = req.body
    const isPublic = isPublicRaw === 'true' || isPublicRaw === true || isPublicRaw === '1'

    if (!req.file && !req.body.fileUrl) {
        return res.status(400).json({ error: 'missing_file', message: 'File upload or fileUrl required (field: file or fileUrl)' })
    }

    // Resolve file url (serve under /images/ for compatibility)
    const fileUrl = req.file ? `/images/${req.file.filename}` : req.body.fileUrl

    // If a reviewId is provided, validate it and permissions
    let review = null
    if (reviewId) {
        review = await prisma.review.findUnique({ where: { id: reviewId } })
        if (!review) return res.status(404).json({ error: 'review_not_found', message: 'Review not found' })
        if (review.authorId !== req.user.id && !review.isPublic) {
            return res.status(403).json({ error: 'forbidden', message: 'Cannot save export for a private review you do not own' })
        }
    }

    // If attempting to publish to public gallery, ensure the requester owns the review
    if (isPublic && review && review.authorId !== req.user.id) {
        return res.status(403).json({ error: 'forbidden', message: 'Only the review owner can publish to public gallery' })
    }

    // Create saved data entry (dataType: 'export')
    const payload = {
        fileUrl,
        reviewId: reviewId || null,
        templateName: templateName || null,
        format: format || null,
        name: name || null,
        description: description || null,
        tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
        isPublic
    }

    const saved = await prisma.savedData.create({
        data: {
            userId: req.user.id,
            dataType: 'export',
            name: name || `Export ${new Date().toISOString()}`,
            description: description || null,
            data: JSON.stringify(payload),
        }
    })

    // Create an export tracking record
    const exportRec = await prisma.export.create({
        data: {
            userId: req.user.id,
            reviewId: reviewId || null,
            format: format || 'png',
            quality: isPublic ? 'high' : 'standard'
        }
    })

    // If publishing and the review belongs to the user, mark the review as public
    if (isPublic && review && review.authorId === req.user.id && !review.isPublic) {
        await prisma.review.update({ where: { id: review.id }, data: { isPublic: true } })
    }

    res.status(201).json({ saved, export: exportRec })
}))

/**
 * GET /api/library/exports
 * Liste les exports sauvegardés de l'utilisateur
 */
router.get('/exports', requireAuth, asyncHandler(async (req, res) => {
    const exports = await prisma.savedData.findMany({
        where: { userId: req.user.id, dataType: 'export' },
        orderBy: { createdAt: 'desc' }
    })

    const parsed = exports.map(e => ({ ...e, data: e.data ? JSON.parse(e.data) : null }))
    res.json(parsed)
}))

/**
 * DELETE /api/library/exports/:id
 * Supprime un export sauvegardé
 */
router.delete('/exports/:id', requireAuth, asyncHandler(async (req, res) => {
    const existing = await prisma.savedData.findFirst({ where: { id: req.params.id, userId: req.user.id } })
    if (!existing) return res.status(404).json({ error: 'not_found' })
    await prisma.savedData.delete({ where: { id: req.params.id } })
    res.json({ message: 'Export supprimé', id: req.params.id })
}))


/**
 * DELETE /api/library/data/:id
 * Supprime une donnée sauvegardée
 */
router.delete('/data/:id', requireAuth, asyncHandler(async (req, res) => {
    const access = await resolveAccess(req.user);
    const existing = await prisma.savedData.findFirst({
        where: { AND: [{ id: req.params.id }, companyScopeFilter(access)] },
    });
    if (!existing) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Donnée non trouvée',
        });
    }
    if (!canModifyResource(access, existing)) {
        return res.status(403).json({ error: 'read_only_member', message: 'Votre rôle ne permet pas de supprimer cette donnée' });
    }

    await prisma.savedData.delete({
        where: { id: req.params.id },
    });

    res.json({ message: 'Donnée supprimée', id: req.params.id });
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
        where: { authorId: req.user.id }
    });

    const reviewsThisMonth = await prisma.review.count({
        where: {
            authorId: req.user.id,
            createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        }
    });

    // Reviews by type
    const reviewsByType = await prisma.review.groupBy({
        by: ['type'],
        where: { authorId: req.user.id },
        _count: true
    });

    // Public vs Private
    const publicReviews = await prisma.review.count({
        where: { authorId: req.user.id, isPublic: true }
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
        where: { authorId: req.user.id, isPublic: true },
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
