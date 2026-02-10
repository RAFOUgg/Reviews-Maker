import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { prisma } from '../server.js'
import { asyncHandler, Errors, requireAuthOrThrow, requireOwnershipOrThrow } from '../utils/errorHandler.js'
import { formatReview, liftOrchardFromExtra } from '../utils/reviewFormatter.js'
import { validateReviewId } from '../utils/validation.js'
import {
    requireSectionAccess,
    requirePhenoHunt,
    canAccessSection
} from '../middleware/permissions.js'
import { getUserAccountType, ACCOUNT_TYPES } from '../services/account.js'

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Configuration Multer pour upload d'images (photos produit + PDF analytics)
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../db/review_images')
        await fs.mkdir(uploadDir, { recursive: true })
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        cb(null, `flower-${uniqueSuffix}${ext}`)
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

// Middleware pour vérifier l'authentification
const requireAuth = (req, res, next) => {
    const _isAuthFunc = typeof req.isAuthenticated === 'function'
    if (!_isAuthFunc || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' })
    }
    next()
}

/**
 * Validation des données FlowerReview
 * Accepte les champs aplatis envoyés par le frontend
 * @param {Object} data - Données à valider
 * @returns {Object} { valid: boolean, errors: string[], cleaned: Object }
 */
function validateFlowerReviewData(data) {
    const errors = []
    const cleaned = {}

    // ===== SECTION 1: Infos Générales =====
    // nomCommercial* (obligatoire)
    if (!data.nomCommercial || typeof data.nomCommercial !== 'string' || data.nomCommercial.trim().length === 0) {
        errors.push('nomCommercial is required')
    } else {
        cleaned.nomCommercial = data.nomCommercial.trim()
    }

    // cultivars (optionnel - peut être string ou JSON array)
    if (data.cultivars) {
        if (typeof data.cultivars === 'string') {
            try {
                cleaned.cultivars = JSON.parse(data.cultivars)
            } catch {
                cleaned.cultivars = data.cultivars.trim()
            }
        } else if (Array.isArray(data.cultivars)) {
            cleaned.cultivars = data.cultivars
        }
    }

    // farm (optionnel)
    if (data.farm && typeof data.farm === 'string') {
        cleaned.farm = data.farm.trim()
    }

    // varietyType (optionnel - valeurs CDC: indica, sativa, hybride indica-dominant, etc.)
    const validVarietyTypes = ['indica', 'sativa', 'hybride', 'hybride indica-dominant', 'sativa-dominant', 'CBD-dominant', 'souche']
    if (data.varietyType) {
        const vt = data.varietyType.toLowerCase()
        if (validVarietyTypes.includes(vt)) {
            cleaned.varietyType = data.varietyType
        }
        // Ne pas bloquer si invalide, juste ignorer
    }

    // ===== SECTION 2: Génétiques =====
    if (data.breeder && typeof data.breeder === 'string') {
        cleaned.breeder = data.breeder.trim()
    }
    if (data.variety && typeof data.variety === 'string') {
        cleaned.variety = data.variety.trim()
    }
    if (data.geneticType && typeof data.geneticType === 'string') {
        cleaned.geneticType = data.geneticType.trim()
    }
    if (data.indicaPercent !== undefined && data.indicaPercent !== null && data.indicaPercent !== '') {
        const val = parseInt(data.indicaPercent)
        if (!isNaN(val) && val >= 0 && val <= 100) {
            cleaned.indicaPercent = val
        }
    }
    if (data.sativaPercent !== undefined && data.sativaPercent !== null && data.sativaPercent !== '') {
        const val = parseInt(data.sativaPercent)
        if (!isNaN(val) && val >= 0 && val <= 100) {
            cleaned.sativaPercent = val
        }
    }
    if (data.parentage) {
        if (typeof data.parentage === 'string') {
            try {
                cleaned.parentage = JSON.parse(data.parentage)
            } catch {
                cleaned.parentage = data.parentage
            }
        } else {
            cleaned.parentage = JSON.stringify(data.parentage)
        }
    }
    if (data.phenotypeCode && typeof data.phenotypeCode === 'string') {
        cleaned.phenotypeCode = data.phenotypeCode.trim()
    }
    if (data.geneticTreeId && typeof data.geneticTreeId === 'string') {
        cleaned.geneticTreeId = data.geneticTreeId.trim()
    }

    // ===== SECTION 3: Pipeline Culture =====
    if (data.cultureTimelineConfig) {
        if (typeof data.cultureTimelineConfig === 'string') {
            try {
                const config = JSON.parse(data.cultureTimelineConfig)
                cleaned.cultureTimelineConfig = config
            } catch {
                // Ignorer si invalide
            }
        } else {
            cleaned.cultureTimelineConfig = data.cultureTimelineConfig
        }
    }
    if (data.cultureTimelineData) {
        if (typeof data.cultureTimelineData === 'string') {
            try {
                const timeline = JSON.parse(data.cultureTimelineData)
                cleaned.cultureTimelineData = timeline
            } catch {
                // Ignorer si invalide
            }
        } else {
            cleaned.cultureTimelineData = data.cultureTimelineData
        }
    }
    if (data.cultureMode && typeof data.cultureMode === 'string') {
        cleaned.cultureMode = data.cultureMode.trim()
    }
    if (data.cultureSpaceType && typeof data.cultureSpaceType === 'string') {
        cleaned.cultureSpaceType = data.cultureSpaceType.trim()
    }
    if (data.cultureSubstrat) {
        if (typeof data.cultureSubstrat === 'string') {
            try {
                cleaned.cultureSubstrat = JSON.parse(data.cultureSubstrat)
            } catch {
                cleaned.cultureSubstrat = data.cultureSubstrat
            }
        } else {
            cleaned.cultureSubstrat = data.cultureSubstrat
        }
    }

    // ===== SECTION 3.5: Récolte (Harvest) =====
    if (data.trichomesTranslucides !== undefined) {
        const val = parseFloat(data.trichomesTranslucides)
        if (!isNaN(val) && val >= 0 && val <= 100) {
            cleaned.trichomesTranslucides = val
        }
    }
    if (data.trichomesLaiteux !== undefined) {
        const val = parseFloat(data.trichomesLaiteux)
        if (!isNaN(val) && val >= 0 && val <= 100) {
            cleaned.trichomesLaiteux = val
        }
    }
    if (data.trichomesAmbres !== undefined) {
        const val = parseFloat(data.trichomesAmbres)
        if (!isNaN(val) && val >= 0 && val <= 100) {
            cleaned.trichomesAmbres = val
        }
    }
    if (data.modeRecolte && typeof data.modeRecolte === 'string') {
        cleaned.modeRecolte = data.modeRecolte.trim()
    }
    if (data.poidsBrut !== undefined && data.poidsBrut !== null && data.poidsBrut !== '') {
        const val = parseFloat(data.poidsBrut)
        if (!isNaN(val) && val >= 0) cleaned.poidsBrut = val
    }
    if (data.poidsNet !== undefined && data.poidsNet !== null && data.poidsNet !== '') {
        const val = parseFloat(data.poidsNet)
        if (!isNaN(val) && val >= 0) cleaned.poidsNet = val
    }

    // Dates de culture
    if (data.cultureStartDate) {
        const date = new Date(data.cultureStartDate)
        if (!isNaN(date.getTime())) {
            cleaned.cultureStartDate = date
        }
    }
    if (data.cultureEndDate) {
        const date = new Date(data.cultureEndDate)
        if (!isNaN(date.getTime())) {
            cleaned.cultureEndDate = date
        }
    }

    // ===== SECTION 4: Analytics =====
    const cannabinoids = ['thcPercent', 'cbdPercent', 'cbgPercent', 'cbcPercent', 'cbnPercent', 'thcvPercent']
    cannabinoids.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (!isNaN(val) && val >= 0 && val <= 100) {
                cleaned[field] = val
            }
        }
    })
    if (data.terpeneProfile) {
        if (typeof data.terpeneProfile === 'string') {
            try {
                cleaned.terpeneProfile = JSON.parse(data.terpeneProfile)
            } catch {
                cleaned.terpeneProfile = data.terpeneProfile
            }
        } else {
            cleaned.terpeneProfile = JSON.stringify(data.terpeneProfile)
        }
    }

    // ===== SECTION 5: Visuel & Technique =====
    // Couleur nuancier (JSON array)
    // Format attendu (nouveau): [{ colorId, percentage, parts: [{ partId, percent }] }, ...]
    // Exemple: [{ colorId: 'green', percentage: 60, parts: [{ partId: 'bracts', percent: 70 }, { partId: 'pistils', percent: 30 }] }]
    if (data.couleurNuancier) {
        if (typeof data.couleurNuancier === 'string') {
            try {
                cleaned.couleurNuancier = JSON.parse(data.couleurNuancier)
            } catch {
                cleaned.couleurNuancier = data.couleurNuancier
            }
        } else {
            cleaned.couleurNuancier = JSON.stringify(data.couleurNuancier)
        }
    }

    // Scores visuels (Float 0-10)
    const visualScoreFields = {
        densiteVisuelle: 'densiteVisuelle',
        trichomesScore: 'trichomesScore',
        pistilsScore: 'pistilsScore',
        manucureScore: 'manucureScore',
        moisissureScore: 'moisissureScore',
        grainesScore: 'grainesScore'
    }
    Object.keys(visualScoreFields).forEach(frontendField => {
        const prismaField = visualScoreFields[frontendField]
        if (data[frontendField] !== undefined && data[frontendField] !== null && data[frontendField] !== '') {
            const val = parseFloat(data[frontendField])
            if (!isNaN(val) && val >= 0 && val <= 10) {
                cleaned[prismaField] = val
            }
        }
    })

    // ===== SECTION 6: Odeurs =====
    // Notes dominantes et secondaires (JSON arrays max 7)
    if (data.notesOdeursDominantes) {
        if (typeof data.notesOdeursDominantes === 'string') {
            try {
                const arr = JSON.parse(data.notesOdeursDominantes)
                if (Array.isArray(arr) && arr.length <= 7) {
                    cleaned.notesOdeursDominantes = JSON.stringify(arr)
                }
            } catch {
                // Ignorer
            }
        } else if (Array.isArray(data.notesOdeursDominantes)) {
            if (data.notesOdeursDominantes.length <= 7) {
                cleaned.notesOdeursDominantes = JSON.stringify(data.notesOdeursDominantes)
            }
        }
    }
    if (data.notesOdeursSecondaires) {
        if (typeof data.notesOdeursSecondaires === 'string') {
            try {
                const arr = JSON.parse(data.notesOdeursSecondaires)
                if (Array.isArray(arr) && arr.length <= 7) {
                    cleaned.notesOdeursSecondaires = JSON.stringify(arr)
                }
            } catch {
                // Ignorer
            }
        } else if (Array.isArray(data.notesOdeursSecondaires)) {
            if (data.notesOdeursSecondaires.length <= 7) {
                cleaned.notesOdeursSecondaires = JSON.stringify(data.notesOdeursSecondaires)
            }
        }
    }

    // Scores odeurs (Float 0-10)
    const odeurScoreFields = ['intensiteAromeScore', 'complexiteAromeScore', 'fideliteAromeScore']
    odeurScoreFields.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (!isNaN(val) && val >= 0 && val <= 10) {
                cleaned[field] = val
            }
        }
    })

    // ===== SECTION 7: Texture =====
    const textureScoreFields = {
        dureteScore: 'dureteScore',
        densiteTactileScore: 'densiteTactileScore',
        elasticiteScore: 'elasticiteScore',
        collantScore: 'collantScore'
    }
    Object.keys(textureScoreFields).forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (!isNaN(val) && val >= 0 && val <= 10) {
                cleaned[field] = val
            }
        }
    })

    // ===== SECTION 8: Goûts =====
    // Scores goûts (Float 0-10)
    if (data.intensiteGoutScore !== undefined && data.intensiteGoutScore !== null && data.intensiteGoutScore !== '') {
        const val = parseFloat(data.intensiteGoutScore)
        if (!isNaN(val) && val >= 0 && val <= 10) {
            cleaned.intensiteGoutScore = val
        }
    }
    if (data.agressiviteScore !== undefined && data.agressiviteScore !== null && data.agressiviteScore !== '') {
        const val = parseFloat(data.agressiviteScore)
        if (!isNaN(val) && val >= 0 && val <= 10) {
            cleaned.agressiviteScore = val
        }
    }

    // Notes goûts (JSON arrays max 7)
    const tasteArrayFields = ['dryPuffNotes', 'inhalationNotes', 'expirationNotes']
    tasteArrayFields.forEach(field => {
        if (data[field]) {
            if (typeof data[field] === 'string') {
                try {
                    const arr = JSON.parse(data[field])
                    if (Array.isArray(arr) && arr.length <= 7) {
                        cleaned[field] = JSON.stringify(arr)
                    }
                } catch {
                    // Ignorer
                }
            } else if (Array.isArray(data[field])) {
                if (data[field].length <= 7) {
                    cleaned[field] = JSON.stringify(data[field])
                }
            }
        }
    })

    // ===== SECTION 9: Effets & Expérience =====
    // Scores effets (Float 0-10)
    if (data.monteeScore !== undefined && data.monteeScore !== null && data.monteeScore !== '') {
        const val = parseFloat(data.monteeScore)
        if (!isNaN(val) && val >= 0 && val <= 10) {
            cleaned.monteeScore = val
        }
    }
    if (data.intensiteEffetScore !== undefined && data.intensiteEffetScore !== null && data.intensiteEffetScore !== '') {
        const val = parseFloat(data.intensiteEffetScore)
        if (!isNaN(val) && val >= 0 && val <= 10) {
            cleaned.intensiteEffetScore = val
        }
    }

    // Effets choisis (JSON array max 8)
    if (data.effetsChoisis) {
        if (typeof data.effetsChoisis === 'string') {
            try {
                const arr = JSON.parse(data.effetsChoisis)
                if (Array.isArray(arr) && arr.length <= 8) {
                    cleaned.effetsChoisis = JSON.stringify(arr)
                }
            } catch {
                // Ignorer
            }
        } else if (Array.isArray(data.effetsChoisis)) {
            if (data.effetsChoisis.length <= 8) {
                cleaned.effetsChoisis = JSON.stringify(data.effetsChoisis)
            }
        }
    }

    // Durée effets
    if (data.effectDuration && typeof data.effectDuration === 'string') {
        cleaned.effectDuration = data.effectDuration.trim()
    }
    if (data.effectDurationMinutes !== undefined && data.effectDurationMinutes !== null) {
        const val = parseInt(data.effectDurationMinutes)
        if (!isNaN(val) && val >= 0) {
            // Convertir en HH:MM format
            const hours = Math.floor(val / 60)
            const mins = val % 60
            cleaned.effectDuration = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
        }
    }

    // Champs expérience
    if (data.consumptionMethod && typeof data.consumptionMethod === 'string') {
        cleaned.consumptionMethod = data.consumptionMethod.trim()
    }
    if (data.dosage !== undefined && data.dosage !== null && data.dosage !== '') {
        const val = parseFloat(data.dosage)
        if (!isNaN(val) && val >= 0) {
            cleaned.dosage = val
        }
    }
    if (data.dosageUnit && typeof data.dosageUnit === 'string') {
        cleaned.dosageUnit = data.dosageUnit.trim()
    }
    if (data.effectOnset && typeof data.effectOnset === 'string') {
        cleaned.effectOnset = data.effectOnset.trim()
    }
    if (data.effectLength && typeof data.effectLength === 'string') {
        cleaned.effectLength = data.effectLength.trim()
    }

    // JSON arrays pour expérience
    const experienceArrayFields = ['effectProfiles', 'sideEffects', 'preferredUse']
    experienceArrayFields.forEach(field => {
        if (data[field]) {
            if (typeof data[field] === 'string') {
                try {
                    const arr = JSON.parse(data[field])
                    if (Array.isArray(arr)) {
                        cleaned[field] = JSON.stringify(arr)
                    }
                } catch {
                    cleaned[field] = data[field]
                }
            } else if (Array.isArray(data[field])) {
                cleaned[field] = JSON.stringify(data[field])
            }
        }
    })

    // ===== SECTION 10: Pipeline Curing =====
    if (data.curingTimelineConfig) {
        if (typeof data.curingTimelineConfig === 'string') {
            try {
                const config = JSON.parse(data.curingTimelineConfig)
                cleaned.curingTimelineConfig = config
            } catch {
                // Ignorer
            }
        } else {
            cleaned.curingTimelineConfig = data.curingTimelineConfig
        }
    }
    if (data.curingTimelineData) {
        if (typeof data.curingTimelineData === 'string') {
            try {
                const timeline = JSON.parse(data.curingTimelineData)
                cleaned.curingTimelineData = timeline
            } catch {
                // Ignorer
            }
        } else {
            cleaned.curingTimelineData = data.curingTimelineData
        }
    }
    if (data.curingType && typeof data.curingType === 'string') {
        cleaned.curingType = data.curingType.trim()
    }
    if (data.curingTemperature !== undefined && data.curingTemperature !== null && data.curingTemperature !== '') {
        const val = parseFloat(data.curingTemperature)
        if (!isNaN(val)) {
            cleaned.curingTemperature = val
        }
    }
    if (data.curingHumidity !== undefined && data.curingHumidity !== null && data.curingHumidity !== '') {
        const val = parseFloat(data.curingHumidity)
        if (!isNaN(val) && val >= 0 && val <= 100) {
            cleaned.curingHumidity = val
        }
    }

    // Status
    if (data.status && ['draft', 'published', 'archived'].includes(data.status)) {
        cleaned.status = data.status
    }

    return {
        valid: errors.length === 0,
        errors,
        cleaned
    }
}

// ===== POST /api/reviews/flower - Créer une review Fleur complète =====
router.post('/',
    requireAuth,
    requireSectionAccess('info'),  // Check: can access basic sections
    upload.fields([
        { name: 'images', maxCount: 4 }, // Photos produit (max 4)
        { name: 'analyticsPdf', maxCount: 1 } // PDF analytics (optionnel)
    ]), asyncHandler(async (req, res) => {
        console.log('🌿 Creating FlowerReview with data:', JSON.stringify(req.body, null, 2))
        console.log('📎 Files uploaded:', req.files)

        // Allow saving drafts for all users. Only require an active paid account when publishing.
        // status can be 'draft' or 'published' (form uses 'published' for publication)
        const accountType = getUserAccountType(req.user)
        const isPaid = [ACCOUNT_TYPES.INFLUENCER, ACCOUNT_TYPES.PRODUCER, ACCOUNT_TYPES.MERCHANT].includes(accountType)
        if ((req.body.status === 'published' || req.body.status === 'true') && !isPaid) {
            throw Errors.FORBIDDEN('Publishing a review requires an active subscription')
        }

        // Valider les données FlowerReview
        const validation = validateFlowerReviewData(req.body)

        if (!validation.valid) {
            throw Errors.VALIDATION_ERROR(validation.errors)
        }

        // Traiter les images uploadées
        const imageFiles = req.files?.images || []
        const imageFilenames = imageFiles.map(file => file.filename)

        // Au moins une image requise
        if (imageFilenames.length === 0) {
            throw Errors.MISSING_FIELD('images')
        }

        // Photos produit (max 4)
        const photo1 = imageFilenames[0] || null
        const photo2 = imageFilenames[1] || null
        const photo3 = imageFilenames[2] || null
        const photo4 = imageFilenames[3] || null

        // PDF analytics (optionnel)
        const pdfFile = req.files?.analyticsPdf?.[0]
        const analyticsPdfUrl = pdfFile ? pdfFile.filename : null

        // Créer la Review de base (compatible avec système existant)
        const baseReviewData = {
            holderName: validation.cleaned.nomCommercial, // Map nomCommercial vers holderName
            type: 'Fleurs', // Type de produit
            description: req.body.description || '', // Description générale (optionnel)
            images: imageFilenames,
            mainImage: imageFilenames[0],
            authorId: req.user.id,
            isPublic: req.body.isPublic !== undefined ? (req.body.isPublic === 'true' || req.body.isPublic === true) : true,
            extraData: JSON.stringify({}) // Peut contenir orchardConfig/orchardPreset si besoin
        }

        // Créer la Review + FlowerReview dans une transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Créer la Review de base
            const review = await tx.review.create({
                data: baseReviewData,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            discordId: true
                        }
                    }
                }
            })

            // 2. Créer la FlowerReview liée
            const flowerReviewData = {
                reviewId: review.id,
                ...validation.cleaned,
                analyticsPdfUrl
            }

            // Convertir les champs JSON en strings pour Prisma
            if (flowerReviewData.terpeneProfile && typeof flowerReviewData.terpeneProfile === 'object') {
                flowerReviewData.terpeneProfile = JSON.stringify(flowerReviewData.terpeneProfile)
            }
            if (flowerReviewData.couleurNuancier && typeof flowerReviewData.couleurNuancier === 'object') {
                flowerReviewData.couleurNuancier = JSON.stringify(flowerReviewData.couleurNuancier)
            }
            if (flowerReviewData.cultureTimelineConfig && typeof flowerReviewData.cultureTimelineConfig === 'object') {
                flowerReviewData.cultureTimelineConfig = JSON.stringify(flowerReviewData.cultureTimelineConfig)
            }
            if (flowerReviewData.cultureTimelineData && typeof flowerReviewData.cultureTimelineData === 'object') {
                flowerReviewData.cultureTimelineData = JSON.stringify(flowerReviewData.cultureTimelineData)
            }
            if (flowerReviewData.cultureSubstrat && typeof flowerReviewData.cultureSubstrat === 'object') {
                flowerReviewData.cultureSubstrat = JSON.stringify(flowerReviewData.cultureSubstrat)
            }
            if (flowerReviewData.curingTimelineConfig && typeof flowerReviewData.curingTimelineConfig === 'object') {
                flowerReviewData.curingTimelineConfig = JSON.stringify(flowerReviewData.curingTimelineConfig)
            }
            if (flowerReviewData.curingTimelineData && typeof flowerReviewData.curingTimelineData === 'object') {
                flowerReviewData.curingTimelineData = JSON.stringify(flowerReviewData.curingTimelineData)
            }
            if (flowerReviewData.parentage && typeof flowerReviewData.parentage === 'object') {
                flowerReviewData.parentage = JSON.stringify(flowerReviewData.parentage)
            }

            // Supprimer les champs qui ne sont pas dans le schéma Prisma
            delete flowerReviewData.cultivars // stocké dans Review.holderName ou ailleurs
            delete flowerReviewData.status    // stocké dans Review

            const flowerReview = await tx.flowerReview.create({
                data: flowerReviewData
            })

            return { review, flowerReview }
        })

        // Formater et retourner
        let formattedReview = formatReview(result.review, req.user)
        formattedReview = liftOrchardFromExtra(formattedReview)

        // Ajouter les données flowerData dans la réponse
        formattedReview.flowerData = {
            ...result.flowerReview,
            // Parser les JSON strings pour le frontend
            terpeneProfile: result.flowerReview.terpeneProfile ? JSON.parse(result.flowerReview.terpeneProfile) : null,
            couleurNuancier: result.flowerReview.couleurNuancier ? JSON.parse(result.flowerReview.couleurNuancier) : null,
            notesOdeursDominantes: result.flowerReview.notesOdeursDominantes ? JSON.parse(result.flowerReview.notesOdeursDominantes) : null,
            notesOdeursSecondaires: result.flowerReview.notesOdeursSecondaires ? JSON.parse(result.flowerReview.notesOdeursSecondaires) : null,
            dryPuffNotes: result.flowerReview.dryPuffNotes ? JSON.parse(result.flowerReview.dryPuffNotes) : null,
            inhalationNotes: result.flowerReview.inhalationNotes ? JSON.parse(result.flowerReview.inhalationNotes) : null,
            expirationNotes: result.flowerReview.expirationNotes ? JSON.parse(result.flowerReview.expirationNotes) : null,
            effetsChoisis: result.flowerReview.effetsChoisis ? JSON.parse(result.flowerReview.effetsChoisis) : null,
            effectProfiles: result.flowerReview.effectProfiles ? JSON.parse(result.flowerReview.effectProfiles) : null,
            sideEffects: result.flowerReview.sideEffects ? JSON.parse(result.flowerReview.sideEffects) : null,
            preferredUse: result.flowerReview.preferredUse ? JSON.parse(result.flowerReview.preferredUse) : null,
            cultureTimelineConfig: result.flowerReview.cultureTimelineConfig ? JSON.parse(result.flowerReview.cultureTimelineConfig) : null,
            cultureTimelineData: result.flowerReview.cultureTimelineData ? JSON.parse(result.flowerReview.cultureTimelineData) : null,
            cultureSubstrat: result.flowerReview.cultureSubstrat ? JSON.parse(result.flowerReview.cultureSubstrat) : null,
            curingTimelineConfig: result.flowerReview.curingTimelineConfig ? JSON.parse(result.flowerReview.curingTimelineConfig) : null,
            curingTimelineData: result.flowerReview.curingTimelineData ? JSON.parse(result.flowerReview.curingTimelineData) : null,
            parentage: result.flowerReview.parentage ? JSON.parse(result.flowerReview.parentage) : null
        }

        console.log('✅ FlowerReview created successfully:', formattedReview.id)
        res.status(201).json(formattedReview)
    }))

// ===== GET /api/reviews/flower/:id - Récupérer une review Fleur =====
router.get('/:id', asyncHandler(async (req, res) => {
    console.log(`🔍 GET /api/reviews/flower/${req.params.id}`)

    // Valider l'ID
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }

    // Récupérer la Review avec FlowerReview
    const review = await prisma.review.findUnique({
        where: { id: req.params.id },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    discordId: true
                }
            },
            flowerData: true // Include FlowerReview
        }
    })

    if (!review) {
        throw Errors.REVIEW_NOT_FOUND()
    }

    // Vérifier que c'est bien une review de type Fleurs
    if (review.type !== 'Fleurs') {
        throw Errors.INVALID_FIELD('type', 'This review is not a Flower review')
    }

    // Vérifier les permissions pour les reviews privées
    const isAuthenticated = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false
    const currentUser = isAuthenticated ? req.user : null

    if (!review.isPublic && (!isAuthenticated || !currentUser || review.authorId !== currentUser.id)) {
        throw Errors.FORBIDDEN()
    }

    // Formater la review
    let formattedReview = formatReview(review, currentUser)
    formattedReview = liftOrchardFromExtra(formattedReview)

    // Parser les JSON strings pour le frontend
    if (review.flowerData) {
        formattedReview.flowerData = {
            ...review.flowerData,
            terpeneProfile: review.flowerData.terpeneProfile ? JSON.parse(review.flowerData.terpeneProfile) : null,
            couleurNuancier: review.flowerData.couleurNuancier ? JSON.parse(review.flowerData.couleurNuancier) : null,
            notesOdeursDominantes: review.flowerData.notesOdeursDominantes ? JSON.parse(review.flowerData.notesOdeursDominantes) : null,
            notesOdeursSecondaires: review.flowerData.notesOdeursSecondaires ? JSON.parse(review.flowerData.notesOdeursSecondaires) : null,
            dryPuffNotes: review.flowerData.dryPuffNotes ? JSON.parse(review.flowerData.dryPuffNotes) : null,
            inhalationNotes: review.flowerData.inhalationNotes ? JSON.parse(review.flowerData.inhalationNotes) : null,
            expirationNotes: review.flowerData.expirationNotes ? JSON.parse(review.flowerData.expirationNotes) : null,
            effetsChoisis: review.flowerData.effetsChoisis ? JSON.parse(review.flowerData.effetsChoisis) : null,
            effectProfiles: review.flowerData.effectProfiles ? JSON.parse(review.flowerData.effectProfiles) : null,
            sideEffects: review.flowerData.sideEffects ? JSON.parse(review.flowerData.sideEffects) : null,
            preferredUse: review.flowerData.preferredUse ? JSON.parse(review.flowerData.preferredUse) : null,
            cultureTimelineConfig: review.flowerData.cultureTimelineConfig ? JSON.parse(review.flowerData.cultureTimelineConfig) : null,
            cultureTimelineData: review.flowerData.cultureTimelineData ? JSON.parse(review.flowerData.cultureTimelineData) : null,
            cultureSubstrat: review.flowerData.cultureSubstrat ? JSON.parse(review.flowerData.cultureSubstrat) : null,
            curingTimelineConfig: review.flowerData.curingTimelineConfig ? JSON.parse(review.flowerData.curingTimelineConfig) : null,
            curingTimelineData: review.flowerData.curingTimelineData ? JSON.parse(review.flowerData.curingTimelineData) : null,
            parentage: review.flowerData.parentage ? JSON.parse(review.flowerData.parentage) : null
        }
    }

    res.json(formattedReview)
}))

// ===== PUT /api/reviews/flower/:id - Mettre à jour une review Fleur =====
router.put('/:id',
    requireAuth,
    upload.fields([
        { name: 'images', maxCount: 4 },
        { name: 'analyticsPdf', maxCount: 1 }
    ]), asyncHandler(async (req, res) => {
        console.log(`🔁 PUT /api/reviews/flower/${req.params.id}`)

        // If attempting to publish via update, ensure user has active paid account
        const accountType = getUserAccountType(req.user)
        const isPaid = [ACCOUNT_TYPES.INFLUENCER, ACCOUNT_TYPES.PRODUCER, ACCOUNT_TYPES.MERCHANT].includes(accountType)
        if ((req.body.status === 'published' || req.body.status === 'true') && !isPaid) {
            throw Errors.FORBIDDEN('Publishing a review requires an active subscription')
        }

        // Valider l'ID
        if (!validateReviewId(req.params.id)) {
            throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
        }

        // Récupérer la review existante
        const review = await prisma.review.findUnique({
            where: { id: req.params.id },
            include: { flowerData: true }
        })

        if (!review) {
            throw Errors.REVIEW_NOT_FOUND()
        }

        // Vérifier ownership
        await requireOwnershipOrThrow(review.authorId, req, 'review')

        // Vérifier que c'est bien une review Fleurs
        if (review.type !== 'Fleurs') {
            throw Errors.INVALID_FIELD('type', 'This review is not a Flower review')
        }

        // Valider les données FlowerReview
        const validation = validateFlowerReviewData(req.body)

        if (!validation.valid) {
            throw Errors.VALIDATION_ERROR(validation.errors)
        }

        // SPRINT 1: Check section-level permissions
        // If user is trying to update genetics section, verify access
        if (req.body.breeder || req.body.variety || req.body.genetics) {
            if (!canAccessSection(req.user.accountType || 'consumer', 'genetic')) {
                throw Errors.FORBIDDEN(
                    'Genetics section not available for your account type. Upgrade to Producer to access.'
                )
            }
        }

        // If user is trying to update culture pipeline, verify access
        if (req.body.pipelineData?.culture) {
            if (!canAccessSection(req.user.accountType || 'consumer', 'pipeline_culture')) {
                throw Errors.FORBIDDEN(
                    'Culture Pipeline not available for your account type. Upgrade to Producer to access.'
                )
            }
        }

        // Gérer les images: nouvelles + conserver les existantes
        const newImageFiles = req.files?.images || []
        const newImages = newImageFiles.map(file => file.filename)

        // Récupérer les images existantes à conserver
        let existingImages = []
        if (req.body.existingImages) {
            try {
                existingImages = typeof req.body.existingImages === 'string'
                    ? JSON.parse(req.body.existingImages)
                    : req.body.existingImages
            } catch (e) {
                console.warn('Failed to parse existingImages:', e)
            }
        }

        // Mapper les photos existantes depuis flowerData
        const existingPhotos = {
            photo1: review.flowerData?.photo1 || null,
            photo2: review.flowerData?.photo2 || null,
            photo3: review.flowerData?.photo3 || null,
            photo4: review.flowerData?.photo4 || null
        }

        // Combiner images existantes + nouvelles
        const allImages = [...existingImages, ...newImages]
        const photo1 = allImages[0] || existingPhotos.photo1
        const photo2 = allImages[1] || existingPhotos.photo2
        const photo3 = allImages[2] || existingPhotos.photo3
        const photo4 = allImages[3] || existingPhotos.photo4

        // Gérer le PDF analytics
        const pdfFile = req.files?.analyticsPdf?.[0]
        const analyticsPdfUrl = pdfFile ? pdfFile.filename : (review.flowerData?.analyticsPdfUrl || null)

        // Mettre à jour dans une transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Mettre à jour la Review de base
            const updatedReview = await tx.review.update({
                where: { id: req.params.id },
                data: {
                    holderName: validation.cleaned.nomCommercial,
                    description: req.body.description || review.description,
                    images: allImages,
                    mainImage: allImages[0] || review.mainImage,
                    isPublic: req.body.isPublic !== undefined ? (req.body.isPublic === 'true' || req.body.isPublic === true) : review.isPublic
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            discordId: true
                        }
                    }
                }
            })

            // 2. Mettre à jour la FlowerReview
            const flowerReviewData = {
                ...validation.cleaned,
                analyticsPdfUrl
            }

            // Convertir les champs JSON en strings
            if (flowerReviewData.terpeneProfile && typeof flowerReviewData.terpeneProfile === 'object') {
                flowerReviewData.terpeneProfile = JSON.stringify(flowerReviewData.terpeneProfile)
            }
            if (flowerReviewData.couleurNuancier && typeof flowerReviewData.couleurNuancier === 'object') {
                flowerReviewData.couleurNuancier = JSON.stringify(flowerReviewData.couleurNuancier)
            }
            if (flowerReviewData.cultureTimelineConfig && typeof flowerReviewData.cultureTimelineConfig === 'object') {
                flowerReviewData.cultureTimelineConfig = JSON.stringify(flowerReviewData.cultureTimelineConfig)
            }
            if (flowerReviewData.cultureTimelineData && typeof flowerReviewData.cultureTimelineData === 'object') {
                flowerReviewData.cultureTimelineData = JSON.stringify(flowerReviewData.cultureTimelineData)
            }
            if (flowerReviewData.cultureSubstrat && typeof flowerReviewData.cultureSubstrat === 'object') {
                flowerReviewData.cultureSubstrat = JSON.stringify(flowerReviewData.cultureSubstrat)
            }
            if (flowerReviewData.curingTimelineConfig && typeof flowerReviewData.curingTimelineConfig === 'object') {
                flowerReviewData.curingTimelineConfig = JSON.stringify(flowerReviewData.curingTimelineConfig)
            }
            if (flowerReviewData.curingTimelineData && typeof flowerReviewData.curingTimelineData === 'object') {
                flowerReviewData.curingTimelineData = JSON.stringify(flowerReviewData.curingTimelineData)
            }
            if (flowerReviewData.parentage && typeof flowerReviewData.parentage === 'object') {
                flowerReviewData.parentage = JSON.stringify(flowerReviewData.parentage)
            }

            // Supprimer les champs qui ne sont pas dans le schéma Prisma
            delete flowerReviewData.cultivars
            delete flowerReviewData.status

            const updatedFlowerReview = await tx.flowerReview.update({
                where: { reviewId: req.params.id },
                data: flowerReviewData
            })

            return { review: updatedReview, flowerReview: updatedFlowerReview }
        })

        // Formater et retourner
        let formattedReview = formatReview(result.review, req.user)
        formattedReview = liftOrchardFromExtra(formattedReview)

        // Ajouter les données flowerData
        formattedReview.flowerData = {
            ...result.flowerReview,
            terpeneProfile: result.flowerReview.terpeneProfile ? JSON.parse(result.flowerReview.terpeneProfile) : null,
            couleurNuancier: result.flowerReview.couleurNuancier ? JSON.parse(result.flowerReview.couleurNuancier) : null,
            notesOdeursDominantes: result.flowerReview.notesOdeursDominantes ? JSON.parse(result.flowerReview.notesOdeursDominantes) : null,
            notesOdeursSecondaires: result.flowerReview.notesOdeursSecondaires ? JSON.parse(result.flowerReview.notesOdeursSecondaires) : null,
            dryPuffNotes: result.flowerReview.dryPuffNotes ? JSON.parse(result.flowerReview.dryPuffNotes) : null,
            inhalationNotes: result.flowerReview.inhalationNotes ? JSON.parse(result.flowerReview.inhalationNotes) : null,
            expirationNotes: result.flowerReview.expirationNotes ? JSON.parse(result.flowerReview.expirationNotes) : null,
            effetsChoisis: result.flowerReview.effetsChoisis ? JSON.parse(result.flowerReview.effetsChoisis) : null,
            effectProfiles: result.flowerReview.effectProfiles ? JSON.parse(result.flowerReview.effectProfiles) : null,
            sideEffects: result.flowerReview.sideEffects ? JSON.parse(result.flowerReview.sideEffects) : null,
            preferredUse: result.flowerReview.preferredUse ? JSON.parse(result.flowerReview.preferredUse) : null,
            cultureTimelineConfig: result.flowerReview.cultureTimelineConfig ? JSON.parse(result.flowerReview.cultureTimelineConfig) : null,
            cultureTimelineData: result.flowerReview.cultureTimelineData ? JSON.parse(result.flowerReview.cultureTimelineData) : null,
            cultureSubstrat: result.flowerReview.cultureSubstrat ? JSON.parse(result.flowerReview.cultureSubstrat) : null,
            curingTimelineConfig: result.flowerReview.curingTimelineConfig ? JSON.parse(result.flowerReview.curingTimelineConfig) : null,
            curingTimelineData: result.flowerReview.curingTimelineData ? JSON.parse(result.flowerReview.curingTimelineData) : null,
            parentage: result.flowerReview.parentage ? JSON.parse(result.flowerReview.parentage) : null
        }

        console.log('✅ FlowerReview updated successfully:', formattedReview.id)
        res.json(formattedReview)
    }))

// ===== DELETE /api/reviews/flower/:id - Supprimer une review Fleur =====
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    console.log(`🗑️ DELETE /api/reviews/flower/${req.params.id}`)

    // Valider l'ID
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }

    // Récupérer la review
    const review = await prisma.review.findUnique({
        where: { id: req.params.id },
        include: { flowerData: true }
    })

    if (!review) {
        throw Errors.REVIEW_NOT_FOUND()
    }

    // Vérifier ownership
    await requireOwnershipOrThrow(review.authorId, req, 'review')

    // Supprimer dans une transaction (cascade: FlowerReview sera supprimé automatiquement via onDelete: Cascade)
    await prisma.$transaction(async (tx) => {
        // Supprimer la Review (FlowerReview sera supprimé en cascade)
        await tx.review.delete({
            where: { id: req.params.id }
        })

        // Supprimer les fichiers images
        const imagesToDelete = [
            review.flowerData?.photo1,
            review.flowerData?.photo2,
            review.flowerData?.photo3,
            review.flowerData?.photo4,
            review.flowerData?.analyticsPdfUrl
        ].filter(Boolean)

        for (const filename of imagesToDelete) {
            try {
                const filePath = path.join(__dirname, '../../db/review_images', filename)
                await fs.unlink(filePath)
                console.log(`🗑️ Deleted file: ${filename}`)
            } catch (err) {
                console.warn(`⚠️ Failed to delete file ${filename}:`, err.message)
            }
        }
    })

    console.log('✅ FlowerReview deleted successfully:', req.params.id)
    res.json({ success: true, message: 'FlowerReview deleted successfully' })
}))

export default router
