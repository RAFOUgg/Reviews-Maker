import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { prisma } from '../server.js'
import { asyncHandler, Errors, requireAuthOrThrow, requireOwnershipOrThrow } from '../utils/errorHandler.js'
import { formatReview, liftOrchardFromExtra } from '../utils/reviewFormatter.js'
import { validateReviewId } from '../utils/validation.js'

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Configuration Multer pour upload d'images
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../db/review_images')
        await fs.mkdir(uploadDir, { recursive: true })
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        cb(null, `edible-${uniqueSuffix}${ext}`)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype)
        if (extname && mimetype) {
            cb(null, true)
        } else {
            cb(new Error('Only image files (jpg, png, gif, webp) are allowed'))
        }
    }
})

// Middleware auth
const requireAuth = (req, res, next) => {
    const _isAuthFunc = typeof req.isAuthenticated === 'function'
    if (!_isAuthFunc || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' })
    }
    next()
}

/**
 * Validation des données EdibleReview
 */
function validateEdibleReviewData(data) {
    const errors = []
    const cleaned = {}

    // ===== SECTION 1: Infos Générales =====
    if (!data.nomProduit || typeof data.nomProduit !== 'string' || data.nomProduit.trim().length === 0) {
        errors.push('nomProduit is required')
    } else {
        cleaned.nomProduit = data.nomProduit.trim()
    }

    if (data.typeComestible && typeof data.typeComestible === 'string') {
        cleaned.typeComestible = data.typeComestible.trim()
    }

    if (data.fabricant && typeof data.fabricant === 'string') {
        cleaned.fabricant = data.fabricant.trim()
    }

    if (data.typeGenetiques && typeof data.typeGenetiques === 'string') {
        cleaned.typeGenetiques = data.typeGenetiques.trim()
    }

    // ===== SECTION 2: Pipeline Recette =====
    if (data.recipePipelineId && typeof data.recipePipelineId === 'string') {
        cleaned.recipePipelineId = data.recipePipelineId
    }

    // Ingrédients (tableau d'objets)
    if (data.ingredients) {
        if (typeof data.ingredients === 'string') {
            // Déjà en JSON
            cleaned.ingredients = data.ingredients
        } else if (Array.isArray(data.ingredients)) {
            // Structure attendue: [{ type: 'standard'|'cannabinique', nom: string, quantite: number, unite: string }]
            cleaned.ingredients = JSON.stringify(data.ingredients)
        }
    }

    // Étapes de préparation (tableau d'objets)
    if (data.etapesPreparation) {
        if (typeof data.etapesPreparation === 'string') {
            cleaned.etapesPreparation = data.etapesPreparation
        } else if (Array.isArray(data.etapesPreparation)) {
            // Structure: [{ action: string, ingredientIds: [], duree: string, temperature: string }]
            cleaned.etapesPreparation = JSON.stringify(data.etapesPreparation)
        }
    }

    // ===== SECTION 3: Goûts =====
    const tasteFields = ['intensite', 'agressivitePiquant']

    tasteFields.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (!isNaN(val) && val >= 0 && val <= 10) {
                cleaned[field] = val
            }
        }
    })

    // Saveurs dominantes (max 7)
    if (data.saveursDominantes) {
        if (Array.isArray(data.saveursDominantes)) {
            cleaned.saveursDominantes = JSON.stringify(data.saveursDominantes.slice(0, 7))
        } else if (typeof data.saveursDominantes === 'string') {
            cleaned.saveursDominantes = data.saveursDominantes
        }
    }

    // ===== SECTION 4: Effets =====
    const effectFields = ['monteeRapidite', 'intensiteEffets']

    effectFields.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (!isNaN(val) && val >= 0 && val <= 10) {
                cleaned[field] = val
            }
        }
    })

    // Effets choisis (max 8)
    if (data.effetsChoisis) {
        if (Array.isArray(data.effetsChoisis)) {
            cleaned.effetsChoisis = JSON.stringify(data.effetsChoisis.slice(0, 8))
        } else if (typeof data.effetsChoisis === 'string') {
            cleaned.effetsChoisis = data.effetsChoisis
        }
    }

    // Filtre effets
    if (data.effetsFiltre && ['tous', 'neutre', 'positif', 'negatif'].includes(data.effetsFiltre)) {
        cleaned.effetsFiltre = data.effetsFiltre
    }

    // Durée des effets
    if (data.dureeEffets && typeof data.dureeEffets === 'string') {
        cleaned.dureeEffets = data.dureeEffets
    }

    return { valid: errors.length === 0, errors, cleaned }
}

/**
 * POST /api/edible-reviews
 * Créer une nouvelle EdibleReview
 */
router.post('/', requireAuth, upload.array('photos', 4), asyncHandler(async (req, res) => {
    const userId = req.user.id

    let bodyData = {}
    if (req.body.data) {
        try {
            bodyData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data
        } catch (e) {
            return res.status(400).json({ error: 'Invalid JSON in data field' })
        }
    } else {
        bodyData = req.body
    }

    const validation = validateEdibleReviewData(bodyData)
    if (!validation.valid) {
        return res.status(400).json({ error: 'Validation failed', details: validation.errors })
    }

    const cleanedData = validation.cleaned

    const review = await prisma.review.create({
        data: {
            authorId: userId,
            type: 'edible',
            holderName: cleanedData.nomProduit,
            isPublic: bodyData.isPublic === true || bodyData.isPublic === 'true'
        }
    })

    const photos = req.files?.map(f => `/images/${f.filename}`) || []

    const edibleReview = await prisma.edibleReview.create({
        data: {
            reviewId: review.id,
            ...cleanedData,
            photos: photos.length > 0 ? JSON.stringify(photos) : null
        }
    })

    res.status(201).json({
        success: true,
        review,
        edibleReview
    })
}))

/**
 * GET /api/edible-reviews/:id
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const reviewId = req.params.id

    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { author: { select: { id: true, username: true, avatar: true } } }
    })

    if (!review) {
        return res.status(404).json({ error: 'Review not found' })
    }

    const edibleReview = await prisma.edibleReview.findUnique({
        where: { reviewId }
    })

    if (!edibleReview) {
        return res.status(404).json({ error: 'EdibleReview data not found' })
    }

    res.json({
        review,
        edibleReview
    })
}))

/**
 * PUT /api/edible-reviews/:id
 */
router.put('/:id', requireAuth, upload.array('photos', 4), asyncHandler(async (req, res) => {
    const reviewId = req.params.id
    const userId = req.user.id

    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!review) {
        return res.status(404).json({ error: 'Review not found' })
    }
    if (review.authorId !== userId) {
        return res.status(403).json({ error: 'Forbidden' })
    }

    let bodyData = {}
    if (req.body.data) {
        try {
            bodyData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data
        } catch (e) {
            return res.status(400).json({ error: 'Invalid JSON in data field' })
        }
    } else {
        bodyData = req.body
    }

    const validation = validateEdibleReviewData(bodyData)
    if (!validation.valid) {
        return res.status(400).json({ error: 'Validation failed', details: validation.errors })
    }

    const cleanedData = validation.cleaned

    await prisma.review.update({
        where: { id: reviewId },
        data: {
            holderName: cleanedData.nomProduit,
            isPublic: bodyData.isPublic === true || bodyData.isPublic === 'true'
        }
    })

    let photos = []
    if (req.files && req.files.length > 0) {
        photos = req.files.map(f => `/images/${f.filename}`)
    } else {
        const existing = await prisma.edibleReview.findUnique({ where: { reviewId } })
        if (existing && existing.photos) {
            try {
                photos = JSON.parse(existing.photos)
            } catch (e) {
                photos = []
            }
        }
    }

    const edibleReview = await prisma.edibleReview.update({
        where: { reviewId },
        data: {
            ...cleanedData,
            photos: photos.length > 0 ? JSON.stringify(photos) : null
        }
    })

    res.json({
        success: true,
        review: await prisma.review.findUnique({ where: { id: reviewId } }),
        edibleReview
    })
}))

/**
 * DELETE /api/edible-reviews/:id
 */
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    const reviewId = req.params.id
    const userId = req.user.id

    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!review) {
        return res.status(404).json({ error: 'Review not found' })
    }
    if (review.authorId !== userId) {
        return res.status(403).json({ error: 'Forbidden' })
    }

    await prisma.edibleReview.delete({ where: { reviewId } })
    await prisma.review.delete({ where: { id: reviewId } })

    res.json({ success: true, message: 'EdibleReview deleted' })
}))

/**
 * GET /api/edible-reviews
 */
router.get('/', asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { page = 1, limit = 20 } = req.query

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    const where = userId
        ? { OR: [{ isPublic: true }, { authorId: userId }] }
        : { isPublic: true }

    const reviews = await prisma.review.findMany({
        where: { ...where, type: 'edible' },
        include: {
            author: { select: { id: true, username: true, avatar: true } }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
    })

    const total = await prisma.review.count({ where: { ...where, type: 'edible' } })

    res.json({
        reviews,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / take)
        }
    })
}))

export default router
