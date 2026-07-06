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
    limits: {
        fileSize: 10 * 1024 * 1024,    // 10 MB par fichier
        fieldSize: 50 * 1024 * 1024,   // 50 MB par champ texte (orchardConfig JSON)
        fields: 500,
        files: 10
    },
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


/**
 * Validation des données ConcentrateReview
 */
async function validateConcentrateReviewData(data, options = {}) {
    const { isDraft = false, isUpdate = false } = options
    const errors = []
    const cleaned = {}

    // ===== SECTION 1: Infos Générales =====
    // isUpdate : les autosaves envoient désormais un diff (seuls les champs modifiés depuis le
    // dernier save) — l'absence de nomCommercial dans une requête PUT signifie très souvent
    // "inchangé", pas "vide". Sans ce garde, chaque autosave où le nom n'était pas retouché
    // écrasait silencieusement le vrai nom par le placeholder 'Brouillon'.
    if (!isDraft && (!data.nomCommercial || typeof data.nomCommercial !== 'string' || data.nomCommercial.trim().length === 0)) {
        errors.push('nomCommercial is required')
    } else if (data.nomCommercial && typeof data.nomCommercial === 'string') {
        cleaned.nomCommercial = data.nomCommercial.trim()
    } else if (isDraft && !isUpdate) {
        cleaned.nomCommercial = 'Brouillon'
    }

    if (data.concentrateType && typeof data.concentrateType === 'string') {
        cleaned.concentrateType = data.concentrateType.trim()
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

    // Lien review fleur parente via relation Prisma (scalaire FK non supporté en update direct)
    // On vérifie l'existence avant le connect : sinon Prisma throw P2025 (500) si la review
    // fleur référencée a été supprimée ou si l'id est obsolète/invalide.
    if (data.parentFlowerReviewId && typeof data.parentFlowerReviewId === 'string') {
        const flowerExists = await prisma.review.findUnique({ where: { id: data.parentFlowerReviewId }, select: { id: true } })
        if (flowerExists) {
            cleaned.parentFlowerReview = { connect: { id: data.parentFlowerReviewId } }
        }
    }

    // Traçabilité multi-source (fleur et/ou hash utilisés comme matière première)
    if (data.sourceLineage !== undefined) {
        if (typeof data.sourceLineage === 'string') {
            try { cleaned.sourceLineage = JSON.stringify(JSON.parse(data.sourceLineage)) } catch { cleaned.sourceLineage = null }
        } else if (Array.isArray(data.sourceLineage)) {
            cleaned.sourceLineage = JSON.stringify(data.sourceLineage)
        }
    }

    // ===== SECTION 2: Pipeline Extraction =====
    if (data.extractionPipelineId && typeof data.extractionPipelineId === 'string') {
        cleaned.extractionPipelineId = data.extractionPipelineId
    }

    // Inline timeline data (from ExtractionPipelineSection / ExtractionPipelineAdapter)
    let extractionPipeline = null
    if (data.extractionPipeline) {
        if (typeof data.extractionPipeline === 'string') {
            try { extractionPipeline = JSON.parse(data.extractionPipeline) } catch { extractionPipeline = null }
        } else {
            extractionPipeline = data.extractionPipeline
        }
    }
    if (extractionPipeline) {
        if (extractionPipeline.extractionTimelineConfig !== undefined) {
            cleaned.extractionTimelineConfig = typeof extractionPipeline.extractionTimelineConfig === 'string'
                ? extractionPipeline.extractionTimelineConfig
                : JSON.stringify(extractionPipeline.extractionTimelineConfig)
        }
        if (extractionPipeline.extractionTimelineData !== undefined) {
            cleaned.extractionTimelineData = typeof extractionPipeline.extractionTimelineData === 'string'
                ? extractionPipeline.extractionTimelineData
                : JSON.stringify(extractionPipeline.extractionTimelineData)
        }
    }
    // Also accept flat keys
    if (data.extractionTimelineConfig !== undefined) {
        cleaned.extractionTimelineConfig = typeof data.extractionTimelineConfig === 'string'
            ? data.extractionTimelineConfig : JSON.stringify(data.extractionTimelineConfig)
    }
    if (data.extractionTimelineData !== undefined) {
        cleaned.extractionTimelineData = typeof data.extractionTimelineData === 'string'
            ? data.extractionTimelineData : JSON.stringify(data.extractionTimelineData)
    }

    if (data.methodeExtraction && typeof data.methodeExtraction === 'string') {
        cleaned.methodeExtraction = data.methodeExtraction
    }

    // ===== SECTION 3: Pipeline Purification =====
    if (data.purificationPipelineId && typeof data.purificationPipelineId === 'string') {
        cleaned.purificationPipelineId = data.purificationPipelineId
    }

    // ===== SECTION 4: Analytics =====
    const cannabinoids = ['thcPercent', 'thcaPercent', 'cbdPercent', 'cbdaPercent', 'cbgPercent', 'cbcPercent', 'cbnPercent', 'thcvPercent']
    cannabinoids.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (!isNaN(val) && val >= 0 && val <= 100) {
                cleaned[field] = val
            }
        }
    })
    if (data.terpeneProfile) {
        // Schema column is String? — must always store a JSON string, sinon Prisma throw
        // (invalid value for String column) dès qu'un terpeneProfile structuré est envoyé.
        cleaned.terpeneProfile = typeof data.terpeneProfile === 'string'
            ? data.terpeneProfile
            : JSON.stringify(data.terpeneProfile)
    }
    if (data.labReportUrl && typeof data.labReportUrl === 'string') {
        cleaned.labReportUrl = data.labReportUrl.trim()
    }
    if (data.otherCannabinoids) {
        // Schema column is String? — must always store a JSON string (même bug que terpeneProfile)
        if (typeof data.otherCannabinoids === 'string') {
            cleaned.otherCannabinoids = data.otherCannabinoids
        } else {
            cleaned.otherCannabinoids = JSON.stringify(data.otherCannabinoids)
        }
    }

    // ===== SECTION 5: Visuel & Technique =====
    // Direct fields
    ;['couleurTransparence', 'pureteVisuelle'].forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field]); if (!isNaN(val) && val >= 0 && val <= 10) cleaned[field] = val
        }
    })

    // Aliased visual fields: schema ← [frontend candidates]
    // melting/residus lisent visualMeltingScore/visualResiduScore (clés dédiées à VisualSection) —
    // meltingScore/residuScore sont réservés aux scores de "fonte"/"résidu" de TextureSection
    // (concepts distincts) pour éviter toute collision (même pattern pour les deux paires).
    const visualAliasMap = {
        viscosite: ['viscositeVisuelle', 'viscosite'],
        melting: ['visualMeltingScore', 'melting'],
        residus: ['visualResiduScore', 'residus'],
        pistils: ['pistilsScore', 'pistils'],
        moisissure: ['moisissureScore', 'moisissure']
    }
    Object.entries(visualAliasMap).forEach(([schemaField, candidates]) => {
        const rawVal = candidates.map(k => data[k]).find(v => v !== undefined && v !== null && v !== '')
        if (rawVal !== undefined) {
            const val = parseFloat(rawVal); if (!isNaN(val) && val >= 0 && val <= 10) cleaned[schemaField] = val
        }
    })

    // ===== SECTION 6: Odeurs =====
    // fideliteCultivars — OdorSection's "Fidélité aux cultivars" slider (Hash/Concentré branch)
    // emits generic `fidelity`, which flattenCommonFormData maps to `fideliteAromeScore` (a key
    // that only exists as a FlowerReview column). Sans cet alias, la valeur du slider était
    // toujours silencieusement ignorée pour Concentré malgré la présence de la colonne dédiée.
    const fideliteCultivarsRaw = data.fideliteCultivars ?? data.fideliteAromeScore
    if (fideliteCultivarsRaw !== undefined && fideliteCultivarsRaw !== null && fideliteCultivarsRaw !== '') {
        const val = parseFloat(fideliteCultivarsRaw); if (!isNaN(val) && val >= 0 && val <= 10) cleaned.fideliteCultivars = val
    }

    // intensiteAromatique — frontend sends intensiteAromeScore or intensiteAromatique
    const intensiteArome = data.intensiteAromeScore ?? data.intensiteAromatique
    if (intensiteArome !== undefined && intensiteArome !== null && intensiteArome !== '') {
        const val = parseFloat(intensiteArome); if (!isNaN(val) && val >= 0 && val <= 10) cleaned.intensiteAromatique = val
    }

    // Complexité aromatique — OdorSection emits generic `complexity`, flattenCommonFormData maps it
    // to `complexiteAromeScore`. Colonne ajoutée (n'existait qu'sur FlowerReview avant) : c'est le
    // bug explicitement rapporté par l'utilisateur ("intensité et complexité non save").
    if (data.complexiteAromeScore !== undefined && data.complexiteAromeScore !== null && data.complexiteAromeScore !== '') {
        const val = parseFloat(data.complexiteAromeScore); if (!isNaN(val) && val >= 0 && val <= 10) cleaned.complexiteAromeScore = val
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

    // ===== SECTION 7: Texture =====
    // Frontend sends dureteScore, densiteTactileScore, friabiliteScore; schema: durete, densiteTactile, friabiliteViscositeMelting, meltingResidus, collantScore
    // meltingResidus manquait les alias meltingScore/residuScore envoyés par TextureSection
    // (seul le nom de colonne brut était accepté) — la fonte/résidus de Texture (distincts du
    // Melting de VisualSection, voir visualMeltingScore) n'étaient donc jamais sauvés.
    // textureMeltingScore/textureResiduScore : colonnes dédiées ajoutées car meltingResidus (legacy)
    // ne peut stocker qu'UNE valeur pour deux sliders distincts — le résidu de Texture était donc
    // systématiquement écrasé par le melting (candidat trouvé en premier). meltingResidus reste
    // alimenté (meltingScore prioritaire) pour compat avec l'ancien affichage/export.
    const textureAliasMap = {
        durete: ['dureteScore', 'durete'],
        densiteTactile: ['densiteTactileScore', 'densiteTactile'],
        friabiliteViscositeMelting: ['friabiliteScore', 'viscositeScore', 'friabiliteViscositeMelting'],
        meltingResidus: ['meltingScore', 'residuScore', 'meltingResidus'],
        textureMeltingScore: ['meltingScore'],
        textureResiduScore: ['residuScore'],
        collantScore: ['collantScore']
    }
    Object.entries(textureAliasMap).forEach(([schemaField, candidates]) => {
        const rawVal = candidates.map(k => data[k]).find(v => v !== undefined && v !== null && v !== '')
        if (rawVal !== undefined) {
            const val = parseFloat(rawVal); if (!isNaN(val) && val >= 0 && val <= 10) cleaned[schemaField] = val
        }
    })

    // ===== SECTION 8: Goûts =====
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

    // ===== SECTION 9: Effets =====
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

    if (data.dosageUnit && typeof data.dosageUnit === 'string') {
        cleaned.dosageUnit = data.dosageUnit
    }

    if (data.dureeEffets && typeof data.dureeEffets === 'string') {
        cleaned.dureeEffets = data.dureeEffets
    }

    // Durée précise des effets — flattener commun envoie un nombre de minutes, converti en HH:MM
    // pour stockage (même pattern que flower-reviews.js). Colonne inexistante avant migration.
    if (data.effectDurationMinutes !== undefined && data.effectDurationMinutes !== null) {
        const val = parseInt(data.effectDurationMinutes)
        if (!isNaN(val) && val >= 0) {
            const hours = Math.floor(val / 60)
            const mins = val % 60
            cleaned.effectDuration = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
        }
    }

    if (data.effectOnset && typeof data.effectOnset === 'string') {
        cleaned.effectOnset = data.effectOnset
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

    // ===== SECTION 10: Pipeline Curing =====
    if (data.curingPipelineId && typeof data.curingPipelineId === 'string') {
        cleaned.curingPipelineId = data.curingPipelineId
    }

    if (data.curingDuration !== undefined && data.curingDuration !== null && data.curingDuration !== '') {
        const dur = parseInt(data.curingDuration, 10)
        if (!isNaN(dur) && dur >= 0) {
            cleaned.curingDuration = dur
        }
    }

    // Whitelist ['froid', 'chaud'] retirée : le select réel du pipeline Curing envoie
    // 'cold'/'warm'/'room'/'controlled' (anglais) — même bug que hash-reviews.js, corrigé ici aussi.
    if (data.curingType && typeof data.curingType === 'string') {
        cleaned.curingType = data.curingType.trim()
    }

    if (data.curingInterval && typeof data.curingInterval === 'string') {
        cleaned.curingInterval = data.curingInterval
    }

    if (data.curingTimelineConfig !== undefined) {
        cleaned.curingTimelineConfig = typeof data.curingTimelineConfig === 'string'
            ? data.curingTimelineConfig : JSON.stringify(data.curingTimelineConfig)
    }

    if (data.curingTimelineData !== undefined) {
        cleaned.curingTimelineData = typeof data.curingTimelineData === 'string'
            ? data.curingTimelineData : JSON.stringify(data.curingTimelineData)
    }

    if (data.curingTemperature !== undefined && data.curingTemperature !== null && data.curingTemperature !== '') {
        const temp = parseFloat(data.curingTemperature)
        if (!isNaN(temp)) cleaned.curingTemperature = temp
    }

    if (data.curingHumidity !== undefined && data.curingHumidity !== null && data.curingHumidity !== '') {
        const hum = parseFloat(data.curingHumidity)
        if (!isNaN(hum)) cleaned.curingHumidity = hum
    }

    // ===== VISUEL: Couleur nuancier (palette) =====
    if (data.couleurNuancier !== undefined) {
        cleaned.couleurNuancier = typeof data.couleurNuancier === 'string'
            ? data.couleurNuancier : JSON.stringify(data.couleurNuancier)
    }

    return { valid: errors.length === 0, errors, cleaned }
}

/**
 * POST /api/concentrate-reviews
 * Créer une nouvelle ConcentrateReview
 */
router.post('/', requireAuth, upload.fields([
    { name: 'images', maxCount: 4 },
    { name: 'certificateFile', maxCount: 1 },
    { name: 'terpeneFile', maxCount: 1 }
]), asyncHandler(async (req, res) => {
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

    // Merge analytics nested object into top-level for validation
    if (bodyData.analytics) {
        try {
            const analyticsObj = typeof bodyData.analytics === 'string'
                ? JSON.parse(bodyData.analytics)
                : bodyData.analytics
            Object.assign(bodyData, analyticsObj)
        } catch {}
    }

    const isDraft = bodyData.status === 'draft' || bodyData.isDraft === true || bodyData.isDraft === 'true'
    const validation = await validateConcentrateReviewData(bodyData, { isDraft })
    if (!validation.valid) {
        return res.status(400).json({ error: 'validation_error', message: 'Validation failed', details: validation.errors })
    }

    const cleanedData = validation.cleaned

    const review = await prisma.review.create({
        data: {
            authorId: userId,
            type: 'concentrate',
            holderName: cleanedData.nomCommercial,
            isPublic: bodyData.isPublic === true || bodyData.isPublic === 'true',
            extraData: JSON.stringify({
                ...(bodyData.orchardPreset ? { orchardPreset: bodyData.orchardPreset } : {}),
                ...(bodyData.orchardConfig ? { orchardConfig: bodyData.orchardConfig } : {}),
                ...(bodyData.orchardCustomLayout ? { orchardCustomLayout: bodyData.orchardCustomLayout } : {}),
                ...(bodyData.orchardLayoutMode ? { orchardLayoutMode: bodyData.orchardLayoutMode } : {}),
            })
        }
    })

    const photos = req.files?.images?.map(f => `/images/${f.filename}`) || []
    const certificateFileUrl = req.files?.certificateFile?.[0]
        ? `/images/${req.files.certificateFile[0].filename}`
        : null
    const terpeneFileUrl = req.files?.terpeneFile?.[0]
        ? `/images/${req.files.terpeneFile[0].filename}`
        : null

    const concentrateReview = await prisma.concentrateReview.create({
        data: {
            reviewId: review.id,
            ...cleanedData,
            photos: photos.length > 0 ? JSON.stringify(photos) : null,
            ...(certificateFileUrl && { labReportUrl: certificateFileUrl }),
            ...(terpeneFileUrl && { terpeneFileUrl })
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
router.put('/:id', requireAuth, upload.fields([
    { name: 'images', maxCount: 4 },
    { name: 'certificateFile', maxCount: 1 },
    { name: 'terpeneFile', maxCount: 1 }
]), asyncHandler(async (req, res) => {
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

    // Merge analytics nested object into top-level for validation
    if (bodyData.analytics) {
        try {
            const analyticsObj = typeof bodyData.analytics === 'string'
                ? JSON.parse(bodyData.analytics)
                : bodyData.analytics
            Object.assign(bodyData, analyticsObj)
        } catch {}
    }

    const isDraft = bodyData.status === 'draft' || bodyData.isDraft === true || bodyData.isDraft === 'true'
    const validation = await validateConcentrateReviewData(bodyData, { isDraft, isUpdate: true })
    if (!validation.valid) {
        return res.status(400).json({ error: 'validation_error', message: 'Validation failed', details: validation.errors })
    }

    const cleanedData = validation.cleaned

    await prisma.review.update({
        where: { id: reviewId },
        data: {
            holderName: cleanedData.nomCommercial,
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
    const newPhotoFiles = req.files?.images || []
    const newPhotoPaths = newPhotoFiles.map(f => `/images/${f.filename}`)
    let photos = [...existingImagesToKeep, ...newPhotoPaths]
    if (photos.length === 0) {
        const existing = await prisma.concentrateReview.findUnique({ where: { reviewId } })
        if (existing?.photos) {
            try { photos = JSON.parse(existing.photos) } catch {}
        }
    }

    const certificateFileUrl = req.files?.certificateFile?.[0]
        ? `/images/${req.files.certificateFile[0].filename}`
        : undefined
    const terpeneFileUrl = req.files?.terpeneFile?.[0]
        ? `/images/${req.files.terpeneFile[0].filename}`
        : undefined

    const concentrateReview = await prisma.concentrateReview.update({
        where: { reviewId },
        data: {
            ...cleanedData,
            photos: photos.length > 0 ? JSON.stringify(photos) : null,
            ...(certificateFileUrl !== undefined && { labReportUrl: certificateFileUrl }),
            ...(terpeneFileUrl !== undefined && { terpeneFileUrl })
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
