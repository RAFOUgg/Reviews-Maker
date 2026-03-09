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
        cb(null, `concentrate-${uniqueSuffix}${ext}`)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf'
        if (extname && mimetype) {
            cb(null, true)
        } else {
            cb(new Error('Only image files (jpg, png, gif, webp) and PDF files are allowed'))
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
 * Validation des données ConcentrateReview
 */
function validateConcentrateReviewData(data, options = {}) {
    const { isDraft = false } = options
    const errors = []
    const cleaned = {}

    // ===== SECTION 1: Infos Générales =====
    if (!isDraft && (!data.nomCommercial || typeof data.nomCommercial !== 'string' || data.nomCommercial.trim().length === 0)) {
        errors.push('nomCommercial is required')
    } else if (data.nomCommercial && typeof data.nomCommercial === 'string') {
        cleaned.nomCommercial = data.nomCommercial.trim()
    } else if (isDraft) {
        cleaned.nomCommercial = 'Brouillon'
    }

    if (data.hashmaker && typeof data.hashmaker === 'string') {
        cleaned.hashmaker = data.hashmaker.trim()
    }

    if (data.laboratoire && typeof data.laboratoire === 'string') {
        cleaned.laboratoire = data.laboratoire.trim()
    }

    if (data.cultivarsUtilises) {
        if (typeof data.cultivarsUtilises === 'string') {
            cleaned.cultivarsUtilises = data.cultivarsUtilises.trim()
        } else if (Array.isArray(data.cultivarsUtilises)) {
            cleaned.cultivarsUtilises = JSON.stringify(data.cultivarsUtilises)
        }
    }

    // ===== SECTION 2: Pipeline Extraction =====
    if (data.extractionPipelineId && typeof data.extractionPipelineId === 'string') {
        cleaned.extractionPipelineId = data.extractionPipelineId
    }

    if (data.methodeExtraction && typeof data.methodeExtraction === 'string') {
        cleaned.methodeExtraction = data.methodeExtraction
    }

    // ===== SECTION 3: Pipeline Purification =====
    if (data.purificationPipelineId && typeof data.purificationPipelineId === 'string') {
        cleaned.purificationPipelineId = data.purificationPipelineId
    }

    // ===== SECTION 4: Visuel & Technique =====
    // Direct fields
    ;['couleurTransparence', 'pureteVisuelle'].forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field]); if (!isNaN(val) && val >= 0 && val <= 10) cleaned[field] = val
        }
    })

    // Aliased visual fields: schema ← [frontend candidates]
    const visualAliasMap = {
        viscosite: ['viscositeVisuelle', 'viscosite'],
        melting: ['meltingScore', 'melting'],
        residus: ['residuScore', 'residus'],
        pistils: ['pistilsScore', 'pistils'],
        moisissure: ['moisissureScore', 'moisissure']
    }
    Object.entries(visualAliasMap).forEach(([schemaField, candidates]) => {
        const rawVal = candidates.map(k => data[k]).find(v => v !== undefined && v !== null && v !== '')
        if (rawVal !== undefined) {
            const val = parseFloat(rawVal); if (!isNaN(val) && val >= 0 && val <= 10) cleaned[schemaField] = val
        }
    })

    // ===== SECTION 5: Odeurs =====
    if (data.fideliteCultivars !== undefined && data.fideliteCultivars !== null && data.fideliteCultivars !== '') {
        const val = parseFloat(data.fideliteCultivars); if (!isNaN(val) && val >= 0 && val <= 10) cleaned.fideliteCultivars = val
    }

    // intensiteAromatique — frontend sends intensiteAromeScore or intensiteAromatique
    const intensiteArome = data.intensiteAromeScore ?? data.intensiteAromatique
    if (intensiteArome !== undefined && intensiteArome !== null && intensiteArome !== '') {
        const val = parseFloat(intensiteArome); if (!isNaN(val) && val >= 0 && val <= 10) cleaned.intensiteAromatique = val
    }

    // Notes dominantes — frontend sends notesOdeursDominantes or notesDominantes
    const notesDomRaw = data.notesOdeursDominantes || data.notesDominantes
    if (notesDomRaw) {
        if (typeof notesDomRaw === 'string') {
            try { cleaned.notesDominantes = JSON.stringify(JSON.parse(notesDomRaw).slice(0, 7)) } catch { cleaned.notesDominantes = notesDomRaw }
        } else if (Array.isArray(notesDomRaw)) { cleaned.notesDominantes = JSON.stringify(notesDomRaw.slice(0, 7)) }
    }

    // Notes secondaires — frontend sends notesOdeursSecondaires or notesSecondaires
    const notesSec = data.notesOdeursSecondaires || data.notesSecondaires
    if (notesSec) {
        if (typeof notesSec === 'string') {
            try { cleaned.notesSecondaires = JSON.stringify(JSON.parse(notesSec).slice(0, 7)) } catch { cleaned.notesSecondaires = notesSec }
        } else if (Array.isArray(notesSec)) { cleaned.notesSecondaires = JSON.stringify(notesSec.slice(0, 7)) }
    }

    // ===== SECTION 6: Texture =====
    // Frontend sends dureteScore, densiteTactileScore, friabiliteScore; schema: durete, densiteTactile, friabiliteViscositeMelting, meltingResidus
    const textureAliasMap = {
        durete: ['dureteScore', 'durete'],
        densiteTactile: ['densiteTactileScore', 'densiteTactile'],
        friabiliteViscositeMelting: ['friabiliteScore', 'viscositeScore', 'friabiliteViscositeMelting'],
        meltingResidus: ['meltingResidus']
    }
    Object.entries(textureAliasMap).forEach(([schemaField, candidates]) => {
        const rawVal = candidates.map(k => data[k]).find(v => v !== undefined && v !== null && v !== '')
        if (rawVal !== undefined) {
            const val = parseFloat(rawVal); if (!isNaN(val) && val >= 0 && val <= 10) cleaned[schemaField] = val
        }
    })

    // ===== SECTION 7: Goûts =====
    // Frontend sends intensiteGoutScore, agressiviteScore; schema: intensite, agressivitePiquant
    const tasteSingleMap = {
        intensite: ['intensiteGoutScore', 'intensite'],
        agressivitePiquant: ['agressiviteScore', 'agressivitePiquant']
    }
    Object.entries(tasteSingleMap).forEach(([schemaField, candidates]) => {
        const rawVal = candidates.map(k => data[k]).find(v => v !== undefined && v !== null && v !== '')
        if (rawVal !== undefined) {
            const val = parseFloat(rawVal); if (!isNaN(val) && val >= 0 && val <= 10) cleaned[schemaField] = val
        }
    })

    const parseListField = (raw, limit) => {
        if (!raw) return null
        if (Array.isArray(raw)) return JSON.stringify(raw.slice(0, limit))
        if (typeof raw === 'string') { try { return JSON.stringify(JSON.parse(raw).slice(0, limit)) } catch { return raw } }
        return null
    }

    const dp = parseListField(data.dryPuffNotes || data.dryPuff, 7); if (dp) cleaned.dryPuff = dp
    const inh = parseListField(data.inhalationNotes || data.inhalation, 7); if (inh) cleaned.inhalation = inh
    const exp = parseListField(data.expirationNotes || data.expiration, 7); if (exp) cleaned.expiration = exp

    // ===== SECTION 8: Effets =====
    // Frontend sends monteeScore, intensiteEffetScore; schema: monteeRapidite, intensiteEffets
    const effectSingleMap = {
        monteeRapidite: ['monteeScore', 'monteeRapidite'],
        intensiteEffets: ['intensiteEffetScore', 'intensiteEffets']
    }
    Object.entries(effectSingleMap).forEach(([schemaField, candidates]) => {
        const rawVal = candidates.map(k => data[k]).find(v => v !== undefined && v !== null && v !== '')
        if (rawVal !== undefined) {
            const val = parseFloat(rawVal); if (!isNaN(val) && val >= 0 && val <= 10) cleaned[schemaField] = val
        }
    })

    if (data.effetsChoisis) {
        if (Array.isArray(data.effetsChoisis)) {
            cleaned.effetsChoisis = JSON.stringify(data.effetsChoisis.slice(0, 8))
        } else if (typeof data.effetsChoisis === 'string') {
            cleaned.effetsChoisis = data.effetsChoisis
        }
    }

    if (data.effetsFiltre && ['tous', 'neutre', 'positif', 'negatif'].includes(data.effetsFiltre)) {
        cleaned.effetsFiltre = data.effetsFiltre
    }

    if (data.methodeConsommation && typeof data.methodeConsommation === 'string') {
        cleaned.methodeConsommation = data.methodeConsommation
    }

    if (data.dosageUtilise && typeof data.dosageUtilise === 'string') {
        cleaned.dosageUtilise = data.dosageUtilise
    }

    if (data.dureeEffets && typeof data.dureeEffets === 'string') {
        cleaned.dureeEffets = data.dureeEffets
    }

    // ===== SECTION 9: Pipeline Curing =====
    if (data.curingPipelineId && typeof data.curingPipelineId === 'string') {
        cleaned.curingPipelineId = data.curingPipelineId
    }

    if (data.curingDuration !== undefined && data.curingDuration !== null && data.curingDuration !== '') {
        const dur = parseInt(data.curingDuration, 10)
        if (!isNaN(dur) && dur >= 0) {
            cleaned.curingDuration = dur
        }
    }

    if (data.curingType && ['froid', 'chaud'].includes(data.curingType)) {
        cleaned.curingType = data.curingType
    }

    if (data.curingInterval && typeof data.curingInterval === 'string') {
        cleaned.curingInterval = data.curingInterval
    }

    return { valid: errors.length === 0, errors, cleaned }
}

/**
 * POST /api/concentrate-reviews
 * Créer une nouvelle ConcentrateReview
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

    const isDraft = bodyData.status === 'draft' || bodyData.isDraft === true || bodyData.isDraft === 'true'
    const validation = validateConcentrateReviewData(bodyData, { isDraft })
    if (!validation.valid) {
        return res.status(400).json({ error: 'validation_error', message: 'Validation failed', details: validation.errors })
    }

    const cleanedData = validation.cleaned

    const review = await prisma.review.create({
        data: {
            authorId: userId,
            type: 'concentrate',
            holderName: cleanedData.nomCommercial,
            isPublic: bodyData.isPublic === true || bodyData.isPublic === 'true'
        }
    })

    const photos = req.files?.map(f => `/images/${f.filename}`) || []

    const concentrateReview = await prisma.concentrateReview.create({
        data: {
            reviewId: review.id,
            ...cleanedData,
            photos: photos.length > 0 ? JSON.stringify(photos) : null
        }
    })

    res.status(201).json({
        success: true,
        review,
        concentrateReview
    })
}))

/**
 * GET /api/concentrate-reviews/:id
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

    const concentrateReview = await prisma.concentrateReview.findUnique({
        where: { reviewId }
    })

    if (!concentrateReview) {
        return res.status(404).json({ error: 'ConcentrateReview data not found' })
    }

    res.json({
        review,
        concentrateReview
    })
}))

/**
 * PUT /api/concentrate-reviews/:id
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

    const isDraft = bodyData.status === 'draft' || bodyData.isDraft === true || bodyData.isDraft === 'true'
    const validation = validateConcentrateReviewData(bodyData, { isDraft })
    if (!validation.valid) {
        return res.status(400).json({ error: 'validation_error', message: 'Validation failed', details: validation.errors })
    }

    const cleanedData = validation.cleaned

    await prisma.review.update({
        where: { id: reviewId },
        data: {
            holderName: cleanedData.nomCommercial,
            isPublic: bodyData.isPublic === true || bodyData.isPublic === 'true'
        }
    })

    let photos = []
    if (req.files && req.files.length > 0) {
        photos = req.files.map(f => `/images/${f.filename}`)
    } else {
        const existing = await prisma.concentrateReview.findUnique({ where: { reviewId } })
        if (existing && existing.photos) {
            try {
                photos = JSON.parse(existing.photos)
            } catch (e) {
                photos = []
            }
        }
    }

    const concentrateReview = await prisma.concentrateReview.update({
        where: { reviewId },
        data: {
            ...cleanedData,
            photos: photos.length > 0 ? JSON.stringify(photos) : null
        }
    })

    res.json({
        success: true,
        review: await prisma.review.findUnique({ where: { id: reviewId } }),
        concentrateReview
    })
}))

/**
 * DELETE /api/concentrate-reviews/:id
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

    await prisma.concentrateReview.delete({ where: { reviewId } })
    await prisma.review.delete({ where: { id: reviewId } })

    res.json({ success: true, message: 'ConcentrateReview deleted' })
}))

/**
 * GET /api/concentrate-reviews
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
        where: { ...where, type: 'concentrate' },
        include: {
            author: { select: { id: true, username: true, avatar: true } }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
    })

    const total = await prisma.review.count({ where: { ...where, type: 'concentrate' } })

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
