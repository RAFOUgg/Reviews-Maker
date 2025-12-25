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
        cb(null, `hash-${uniqueSuffix}${ext}`)
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
 * Validation des données HashReview
 */
function validateHashReviewData(data) {
    const errors = []
    const cleaned = {}

    // ===== SECTION 1: Infos Générales =====
    // nomCommercial* (obligatoire)
    if (!data.nomCommercial || typeof data.nomCommercial !== 'string' || data.nomCommercial.trim().length === 0) {
        errors.push('nomCommercial is required')
    } else {
        cleaned.nomCommercial = data.nomCommercial.trim()
    }

    // hashmaker (optionnel)
    if (data.hashmaker && typeof data.hashmaker === 'string') {
        cleaned.hashmaker = data.hashmaker.trim()
    }

    // laboratoire (optionnel)
    if (data.laboratoire && typeof data.laboratoire === 'string') {
        cleaned.laboratoire = data.laboratoire.trim()
    }

    // cultivars utilisés (optionnel - array ou string)
    if (data.cultivarsUtilises) {
        if (typeof data.cultivarsUtilises === 'string') {
            cleaned.cultivarsUtilises = data.cultivarsUtilises.trim()
        } else if (Array.isArray(data.cultivarsUtilises)) {
            cleaned.cultivarsUtilises = JSON.stringify(data.cultivarsUtilises)
        }
    }

    // ===== SECTION 2: Pipeline Séparation =====
    // separationPipelineId (optionnel)
    if (data.separationPipelineId && typeof data.separationPipelineId === 'string') {
        cleaned.separationPipelineId = data.separationPipelineId
    }

    // Méthode de séparation
    if (data.methodeSeparation && typeof data.methodeSeparation === 'string') {
        cleaned.methodeSeparation = data.methodeSeparation
    }

    // Nombre de passes (si eau/glace)
    if (data.nombrePasses !== undefined && data.nombrePasses !== null && data.nombrePasses !== '') {
        const passes = parseInt(data.nombrePasses, 10)
        if (!isNaN(passes) && passes >= 0) {
            cleaned.nombrePasses = passes
        }
    }

    // Température de l'eau (si eau/glace)
    if (data.temperatureEau !== undefined && data.temperatureEau !== null && data.temperatureEau !== '') {
        const temp = parseFloat(data.temperatureEau)
        if (!isNaN(temp)) {
            cleaned.temperatureEau = temp
        }
    }

    // Taille des mailles (si tamisage à sec)
    if (data.tailleMailles && typeof data.tailleMailles === 'string') {
        cleaned.tailleMailles = data.tailleMailles.trim()
    }

    // Type matière première
    if (data.typeMatierePremiere && typeof data.typeMatierePremiere === 'string') {
        cleaned.typeMatierePremiere = data.typeMatierePremiere
    }

    // Qualité matière première (échelle 1-10)
    if (data.qualiteMatierePremiere !== undefined && data.qualiteMatierePremiere !== null && data.qualiteMatierePremiere !== '') {
        const qual = parseFloat(data.qualiteMatierePremiere)
        if (!isNaN(qual) && qual >= 0 && qual <= 10) {
            cleaned.qualiteMatierePremiere = qual
        }
    }

    // Rendement estimé (%)
    if (data.rendementEstime !== undefined && data.rendementEstime !== null && data.rendementEstime !== '') {
        const rend = parseFloat(data.rendementEstime)
        if (!isNaN(rend) && rend >= 0 && rend <= 100) {
            cleaned.rendementEstime = rend
        }
    }

    // Temps total séparation (minutes)
    if (data.tempsTotalSeparation !== undefined && data.tempsTotalSeparation !== null && data.tempsTotalSeparation !== '') {
        const temps = parseInt(data.tempsTotalSeparation, 10)
        if (!isNaN(temps) && temps >= 0) {
            cleaned.tempsTotalSeparation = temps
        }
    }

    // ===== SECTION 3: Pipeline Purification =====
    if (data.purificationPipelineId && typeof data.purificationPipelineId === 'string') {
        cleaned.purificationPipelineId = data.purificationPipelineId
    }

    // ===== SECTION 4: Visuel & Technique =====
    // Tous les champs /10
    const visualFields = [
        'couleurTransparence',
        'pureteVisuelle',
        'densiteVisuelle',
        'pistils',
        'moisissure',
        'graines'
    ]

    visualFields.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (!isNaN(val) && val >= 0 && val <= 10) {
                cleaned[field] = val
            }
        }
    })

    // ===== SECTION 5: Odeurs =====
    // Fidélité aux cultivars /10
    if (data.fideliteCultivars !== undefined && data.fideliteCultivars !== null && data.fideliteCultivars !== '') {
        const val = parseFloat(data.fideliteCultivars)
        if (!isNaN(val) && val >= 0 && val <= 10) {
            cleaned.fideliteCultivars = val
        }
    }

    // Intensité aromatique /10
    if (data.intensiteAromatique !== undefined && data.intensiteAromatique !== null && data.intensiteAromatique !== '') {
        const val = parseFloat(data.intensiteAromatique)
        if (!isNaN(val) && val >= 0 && val <= 10) {
            cleaned.intensiteAromatique = val
        }
    }

    // Notes dominantes (max 7)
    if (data.notesDominantes) {
        if (Array.isArray(data.notesDominantes)) {
            cleaned.notesDominantes = JSON.stringify(data.notesDominantes.slice(0, 7))
        } else if (typeof data.notesDominantes === 'string') {
            cleaned.notesDominantes = data.notesDominantes
        }
    }

    // Notes secondaires (max 7)
    if (data.notesSecondaires) {
        if (Array.isArray(data.notesSecondaires)) {
            cleaned.notesSecondaires = JSON.stringify(data.notesSecondaires.slice(0, 7))
        } else if (typeof data.notesSecondaires === 'string') {
            cleaned.notesSecondaires = data.notesSecondaires
        }
    }

    // ===== SECTION 6: Texture =====
    const textureFields = ['durete', 'densiteTactile', 'friabiliteVisco site', 'meltingResidus']

    textureFields.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (!isNaN(val) && val >= 0 && val <= 10) {
                cleaned[field] = val
            }
        }
    })

    // ===== SECTION 7: Goûts =====
    const tasteFields = ['intensite', 'agressivitePiquant']

    tasteFields.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (!isNaN(val) && val >= 0 && val <= 10) {
                cleaned[field] = val
            }
        }
    })

    // Dry puff (max 7)
    if (data.dryPuff) {
        if (Array.isArray(data.dryPuff)) {
            cleaned.dryPuff = JSON.stringify(data.dryPuff.slice(0, 7))
        } else if (typeof data.dryPuff === 'string') {
            cleaned.dryPuff = data.dryPuff
        }
    }

    // Inhalation (max 7)
    if (data.inhalation) {
        if (Array.isArray(data.inhalation)) {
            cleaned.inhalation = JSON.stringify(data.inhalation.slice(0, 7))
        } else if (typeof data.inhalation === 'string') {
            cleaned.inhalation = data.inhalation
        }
    }

    // Expiration (max 7)
    if (data.expiration) {
        if (Array.isArray(data.expiration)) {
            cleaned.expiration = JSON.stringify(data.expiration.slice(0, 7))
        } else if (typeof data.expiration === 'string') {
            cleaned.expiration = data.expiration
        }
    }

    // ===== SECTION 8: Effets =====
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

    // Expérience d'utilisation
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
 * POST /api/hash-reviews
 * Créer une nouvelle HashReview
 */
router.post('/', requireAuth, upload.array('photos', 4), asyncHandler(async (req, res) => {
    const userId = req.user.id

    // Parse body data
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

    // Validation
    const validation = validateHashReviewData(bodyData)
    if (!validation.valid) {
        return res.status(400).json({ error: 'Validation failed', details: validation.errors })
    }

    const cleanedData = validation.cleaned

    // Créer la Review parente
    const review = await prisma.review.create({
        data: {
            authorId: userId,
            type: 'hash',
            holderName: cleanedData.nomCommercial,
            isPublic: bodyData.isPublic === true || bodyData.isPublic === 'true'
        }
    })

    // Gérer les photos
    const photos = req.files?.map(f => `/images/${f.filename}`) || []

    // Créer la HashReview
    const hashReview = await prisma.hashReview.create({
        data: {
            reviewId: review.id,
            ...cleanedData,
            photos: photos.length > 0 ? JSON.stringify(photos) : null
        }
    })

    res.status(201).json({
        success: true,
        review,
        hashReview
    })
}))

/**
 * GET /api/hash-reviews/:id
 * Récupérer une HashReview
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

    const hashReview = await prisma.hashReview.findUnique({
        where: { reviewId }
    })

    if (!hashReview) {
        return res.status(404).json({ error: 'HashReview data not found' })
    }

    res.json({
        review,
        hashReview
    })
}))

/**
 * PUT /api/hash-reviews/:id
 * Mettre à jour une HashReview
 */
router.put('/:id', requireAuth, upload.array('photos', 4), asyncHandler(async (req, res) => {
    const reviewId = req.params.id
    const userId = req.user.id

    // Vérifier que la review existe et appartient à l'utilisateur
    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!review) {
        return res.status(404).json({ error: 'Review not found' })
    }
    if (review.authorId !== userId) {
        return res.status(403).json({ error: 'Forbidden' })
    }

    // Parse body data
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

    // Validation
    const validation = validateHashReviewData(bodyData)
    if (!validation.valid) {
        return res.status(400).json({ error: 'Validation failed', details: validation.errors })
    }

    const cleanedData = validation.cleaned

    // Mettre à jour la Review parente
    await prisma.review.update({
        where: { id: reviewId },
        data: {
            holderName: cleanedData.nomCommercial,
            isPublic: bodyData.isPublic === true || bodyData.isPublic === 'true'
        }
    })

    // Gérer les photos (merge avec les anciennes si pas de nouvelles)
    let photos = []
    if (req.files && req.files.length > 0) {
        photos = req.files.map(f => `/images/${f.filename}`)
    } else {
        const existing = await prisma.hashReview.findUnique({ where: { reviewId } })
        if (existing && existing.photos) {
            try {
                photos = JSON.parse(existing.photos)
            } catch (e) {
                photos = []
            }
        }
    }

    // Mettre à jour la HashReview
    const hashReview = await prisma.hashReview.update({
        where: { reviewId },
        data: {
            ...cleanedData,
            photos: photos.length > 0 ? JSON.stringify(photos) : null
        }
    })

    res.json({
        success: true,
        review: await prisma.review.findUnique({ where: { id: reviewId } }),
        hashReview
    })
}))

/**
 * DELETE /api/hash-reviews/:id
 * Supprimer une HashReview
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

    // Supprimer la HashReview et la Review parente (cascade)
    await prisma.hashReview.delete({ where: { reviewId } })
    await prisma.review.delete({ where: { id: reviewId } })

    res.json({ success: true, message: 'HashReview deleted' })
}))

/**
 * GET /api/hash-reviews
 * Lister les HashReviews (publiques ou de l'utilisateur)
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
        where: { ...where, type: 'hash' },
        include: {
            author: { select: { id: true, username: true, avatar: true } }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
    })

    const total = await prisma.review.count({ where: { ...where, type: 'hash' } })

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
