import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { prisma } from '../server.js'
import { asyncHandler, Errors, requireAuthOrThrow, requireOwnershipOrThrow } from '../utils/errorHandler.js'
import { formatReview, liftOrchardFromExtra } from '../utils/reviewFormatter.js'
import { validateReviewId } from '../utils/validation.js'
import { requireAuth } from '../middleware/auth.js'
import { requirePublishingAllowed, resolveAccess, owningCompanyId, companyScopeFilter, canModifyFor, canReadFor, resolveIdentityLink } from '../services/access.js'

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
    limits: {
        fileSize: 200 * 1024 * 1024,   // 200 Mo par fichier (photo ou vidéo)
        fieldSize: 50 * 1024 * 1024,
        fields: 500,
        files: 10
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mov|m4v/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('video/')
        if (extname && mimetype) {
            cb(null, true)
        } else {
            cb(new Error('Only image files (jpg, png, gif, webp) and video files (mp4, webm, mov) are allowed'))
        }
    }
})


/**
 * Validation des données EdibleReview
 */
function validateEdibleReviewData(data, options = {}) {
    const { isDraft = false, isUpdate = false } = options
    const errors = []
    const cleaned = {}

    // ===== SECTION 1: Infos Générales =====
    // isUpdate : les autosaves envoient désormais un diff (seuls les champs modifiés depuis le
    // dernier save) — l'absence de nomProduit dans une requête PUT signifie très souvent
    // "inchangé", pas "vide". Sans ce garde, chaque autosave où le nom n'était pas retouché
    // écrasait silencieusement le vrai nom par le placeholder 'Brouillon'.
    if (!isDraft && (!data.nomProduit || typeof data.nomProduit !== 'string' || data.nomProduit.trim().length === 0)) {
        errors.push('nomProduit is required')
    } else if (data.nomProduit && typeof data.nomProduit === 'string') {
        cleaned.nomProduit = data.nomProduit.trim()
    } else if (isDraft && !isUpdate) {
        cleaned.nomProduit = 'Brouillon'
    }

    if (data.typeComestible && typeof data.typeComestible === 'string') {
        cleaned.typeComestible = data.typeComestible.trim()
    }

    if (data.fabricant && typeof data.fabricant === 'string') {
        cleaned.fabricant = data.fabricant.trim()
    }
    // Lien de compte optionnel derrière `fabricant` (cf. FlowerReview.farmLinkedUserId pour le
    // commentaire complet) — stash brut, résolu/validé dans le route handler via resolveIdentityLink.
    if (data.fabricantLinkedUserId !== undefined) {
        cleaned._rawFabricantLinkedUserId = (data.fabricantLinkedUserId && typeof data.fabricantLinkedUserId === 'string')
            ? data.fabricantLinkedUserId.trim() || null
            : null
    }
    if (data.fabricantLinkedProducerProfileId !== undefined) {
        cleaned._rawFabricantLinkedProducerProfileId = (data.fabricantLinkedProducerProfileId && typeof data.fabricantLinkedProducerProfileId === 'string')
            ? data.fabricantLinkedProducerProfileId.trim() || null
            : null
    }

    if (data.typeGenetiques && typeof data.typeGenetiques === 'string') {
        cleaned.typeGenetiques = data.typeGenetiques.trim()
    }

    // Traçabilité multi-source (fleur/hash/concentré utilisés comme matière première)
    if (data.sourceLineage !== undefined) {
        if (typeof data.sourceLineage === 'string') {
            try { cleaned.sourceLineage = JSON.stringify(JSON.parse(data.sourceLineage)) } catch { cleaned.sourceLineage = null }
        } else if (Array.isArray(data.sourceLineage)) {
            cleaned.sourceLineage = JSON.stringify(data.sourceLineage)
        }
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

    // ===== SECTION 3: Analytics =====
    // Le modèle Prisma EdibleReview n'a AUCUNE colonne cannabinoïdes/terpènes/labReport
    // (contrairement à Flower/Hash/Concentrate) : un prisma.edibleReview.create/update
    // avec l'une de ces clés throw "Unknown argument" (500). Ne rien écrire ici tant que
    // le schéma n'a pas ces colonnes.

    // ===== SECTION 4: Goûts =====
    // Frontend sends intensiteGoutScore, agressiviteScore; schema: intensite, agressivitePiquant
    const tasteSingleMap = {
        intensite: ['intensiteGoutScore', 'intensite'],
        agressivitePiquant: ['agressiviteScore', 'agressivitePiquant']
    }
    Object.entries(tasteSingleMap).forEach(([schemaField, candidates]) => {
        const rawVal = candidates.map(k => data[k]).find(v => v !== undefined && v !== null && v !== '')
        if (rawVal !== undefined) {
            const val = parseFloat(rawVal)
            if (!isNaN(val) && val >= 0 && val <= 10) cleaned[schemaField] = val
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

    // ===== SECTION 5: Effets =====
    // Frontend sends monteeScore, intensiteEffetScore; schema: monteeRapidite, intensiteEffets
    const effectSingleMap = {
        monteeRapidite: ['monteeScore', 'monteeRapidite'],
        intensiteEffets: ['intensiteEffetScore', 'intensiteEffets']
    }
    Object.entries(effectSingleMap).forEach(([schemaField, candidates]) => {
        const rawVal = candidates.map(k => data[k]).find(v => v !== undefined && v !== null && v !== '')
        if (rawVal !== undefined) {
            const val = parseFloat(rawVal)
            if (!isNaN(val) && val >= 0 && val <= 10) cleaned[schemaField] = val
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

    // Expérience d'utilisation — colonnes ajoutées (mêmes noms que FlowerReview, flattenCommonFormData
    // produit déjà ces clés aplaties telles quelles, pas besoin d'alias comme pour Hash/Concentré qui
    // ont leurs propres noms de colonnes legacy). Sans ces colonnes, méthode de consommation, dosage,
    // durée précise, début des effets et usages préférés étaient silencieusement perdus pour Comestible.
    if (data.consumptionMethod && typeof data.consumptionMethod === 'string') {
        cleaned.consumptionMethod = data.consumptionMethod.trim()
    }
    if (data.dosage !== undefined && data.dosage !== null && data.dosage !== '') {
        const val = parseFloat(data.dosage)
        if (!isNaN(val) && val >= 0) cleaned.dosage = val
    }
    if (data.dosageUnit && typeof data.dosageUnit === 'string') {
        cleaned.dosageUnit = data.dosageUnit.trim()
    }
    if (data.effectDurationMinutes !== undefined && data.effectDurationMinutes !== null) {
        const val = parseInt(data.effectDurationMinutes)
        if (!isNaN(val) && val >= 0) {
            const hours = Math.floor(val / 60)
            const mins = val % 60
            cleaned.effectDuration = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
        }
    }
    if (data.effectOnset && typeof data.effectOnset === 'string') {
        cleaned.effectOnset = data.effectOnset.trim()
    }
    if (data.foodIntakeStatus && ['unknown', 'fasted', 'fed'].includes(data.foodIntakeStatus)) {
        cleaned.foodIntakeStatus = data.foodIntakeStatus
    }
    if (data.preferredUse) {
        if (typeof data.preferredUse === 'string') {
            try {
                const arr = JSON.parse(data.preferredUse)
                if (Array.isArray(arr)) cleaned.preferredUse = JSON.stringify(arr.slice(0, 10))
            } catch {
                cleaned.preferredUse = data.preferredUse
            }
        } else if (Array.isArray(data.preferredUse)) {
            cleaned.preferredUse = JSON.stringify(data.preferredUse.slice(0, 10))
        }
    }

    return { valid: errors.length === 0, errors, cleaned }
}

/**
 * POST /api/edible-reviews
 * Créer une nouvelle EdibleReview
 */
router.post('/', requireAuth, upload.array('images', 4), requirePublishingAllowed, asyncHandler(async (req, res) => {
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
    const validation = validateEdibleReviewData(bodyData, { isDraft })
    if (!validation.valid) {
        return res.status(400).json({ error: 'validation_error', message: 'Validation failed', details: validation.errors })
    }

    const cleanedData = validation.cleaned
    const access = await resolveAccess(req.user)

    // Résoudre le lien de compte optionnel derrière `fabricant` (cf. resolveIdentityLink) — un
    // utilisateur ne peut lier que son propre id ou celui de son entreprise, jamais un id tiers.
    if (cleanedData._rawFabricantLinkedUserId !== undefined || cleanedData._rawFabricantLinkedProducerProfileId !== undefined) {
        const { userId: linkedUserId, producerProfileId } = resolveIdentityLink(
            access,
            cleanedData._rawFabricantLinkedUserId,
            cleanedData._rawFabricantLinkedProducerProfileId
        )
        cleanedData.fabricantLinkedUserId = linkedUserId
        cleanedData.fabricantLinkedProducerProfileId = producerProfileId
    }
    delete cleanedData._rawFabricantLinkedUserId
    delete cleanedData._rawFabricantLinkedProducerProfileId

    const review = await prisma.review.create({
        data: {
            authorId: userId,
            // Rattachement entreprise : la review appartient à la société, pas au seul
            // rédacteur — elle reste accessible à l'équipe même s'il la quitte.
            producerProfileId: owningCompanyId(access),
            type: 'edible',
            holderName: cleanedData.nomProduit,
            isPublic: bodyData.isPublic === true || bodyData.isPublic === 'true',
            extraData: JSON.stringify({
                ...(bodyData.orchardPreset ? { orchardPreset: bodyData.orchardPreset } : {}),
                ...(bodyData.orchardConfig ? { orchardConfig: bodyData.orchardConfig } : {}),
                ...(bodyData.orchardCustomLayout ? { orchardCustomLayout: bodyData.orchardCustomLayout } : {}),
                ...(bodyData.orchardLayoutMode ? { orchardLayoutMode: bodyData.orchardLayoutMode } : {}),
                ...(bodyData.recipeFinalWeight ? { recipeFinalWeight: bodyData.recipeFinalWeight } : {}),
                ...(bodyData.recipeServings ? { recipeServings: bodyData.recipeServings } : {}),
            })
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
        include: { author: { select: { id: true, username: true, avatar: true, producerProfile: { select: { isVerified: true, businessType: true } } } } }
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
router.put('/:id', requireAuth, upload.array('images', 4), requirePublishingAllowed, asyncHandler(async (req, res) => {
    const reviewId = req.params.id
    const userId = req.user.id

    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!review) {
        return res.status(404).json({ error: 'Review not found' })
    }
    if (!(await canModifyFor(req, review, 'authorId'))) {
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
    const validation = validateEdibleReviewData(bodyData, { isDraft, isUpdate: true })
    if (!validation.valid) {
        return res.status(400).json({ error: 'validation_error', message: 'Validation failed', details: validation.errors })
    }

    const cleanedData = validation.cleaned

    // Résoudre le lien de compte optionnel derrière `fabricant`, cf. commentaire équivalent sur POST.
    if (cleanedData._rawFabricantLinkedUserId !== undefined || cleanedData._rawFabricantLinkedProducerProfileId !== undefined) {
        const access = await resolveAccess(req.user)
        const { userId: linkedUserId, producerProfileId } = resolveIdentityLink(
            access,
            cleanedData._rawFabricantLinkedUserId,
            cleanedData._rawFabricantLinkedProducerProfileId
        )
        cleanedData.fabricantLinkedUserId = linkedUserId
        cleanedData.fabricantLinkedProducerProfileId = producerProfileId
    }
    delete cleanedData._rawFabricantLinkedUserId
    delete cleanedData._rawFabricantLinkedProducerProfileId

    await prisma.review.update({
        where: { id: reviewId },
        data: {
            holderName: cleanedData.nomProduit,
            isPublic: bodyData.isPublic === true || bodyData.isPublic === 'true',
            // Merge orchard/aperçu data into extraData (sinon orchardPreset/orchardConfig
            // appliqués dans Export Maker ne sont jamais persistés pour ce type de review)
            extraData: (() => {
                let existing = {}
                try { existing = JSON.parse(review.extraData || '{}') } catch (e) { }
                const updated = { ...existing }
                if (bodyData.orchardPreset) updated.orchardPreset = bodyData.orchardPreset
                if (bodyData.orchardConfig) updated.orchardConfig = bodyData.orchardConfig
                if (bodyData.orchardCustomLayout) updated.orchardCustomLayout = bodyData.orchardCustomLayout
                if (bodyData.orchardLayoutMode) updated.orchardLayoutMode = bodyData.orchardLayoutMode
                if (bodyData.recipeFinalWeight) updated.recipeFinalWeight = bodyData.recipeFinalWeight
                if (bodyData.recipeServings) updated.recipeServings = bodyData.recipeServings
                return JSON.stringify(updated)
            })()
        }
    })

    let existingImagesToKeep = []
    if (bodyData.existingImages) {
        try {
            existingImagesToKeep = typeof bodyData.existingImages === 'string'
                ? JSON.parse(bodyData.existingImages) : bodyData.existingImages
        } catch {}
    }
    const newPhotoPaths = (req.files || []).map(f => `/images/${f.filename}`)
    let photos = [...existingImagesToKeep, ...newPhotoPaths]
    if (photos.length === 0) {
        const existing = await prisma.edibleReview.findUnique({ where: { reviewId } })
        if (existing?.photos) {
            try { photos = JSON.parse(existing.photos) } catch {}
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
    if (!(await canModifyFor(req, review, 'authorId'))) {
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
