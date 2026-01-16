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
    requireActiveSubscription,
    canAccessSection
} from '../middleware/permissions.js'

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
 * Middleware pour valider les permissions de section (V1 MVP)
 * Vérifie que l'utilisateur peut créer/mettre à jour les sections demandées
 * selon son type de compte
 */
const validateSectionPermissions = (req, res, next) => {
    const { accountType } = req.user || {}
    const body = req.body || {}

    if (!accountType) {
        return res.status(401).json({ error: 'Account type not determined' })
    }

    // Sections interdites par type de compte (V1 MVP)
    const forbiddenSections = {
        'amateur': [
            'breeder', 'variety', 'genetics', 'phenoType', // Section 2: Génétiques
            'pipelineData', 'culture', // Section 3: Culture & Pipeline
            'pipelineCuring' // Section 10: Curing/Maturation
        ],
        'influenceur': [
            'pipelineData', 'culture', // Section 3: Culture Pipeline
            'phenoHuntTreeId', 'phenoHuntData' // PhenoHunt spécifiquement
        ]
        // 'producteur': aucune restriction
    };

    const notAllowed = forbiddenSections[accountType] || [];

    // Vérifier si une section interdite est présente
    for (const section of notAllowed) {
        if (body[section] !== undefined && body[section] !== null) {
            const sectionLabel = {
                'breeder': 'Genetics',
                'variety': 'Genetics',
                'genetics': 'Genetics',
                'phenoType': 'Genetics',
                'pipelineData': 'Culture Pipeline',
                'culture': 'Culture Pipeline',
                'pipelineCuring': 'Curing/Maturation Pipeline',
                'phenoHuntTreeId': 'PhenoHunt',
                'phenoHuntData': 'PhenoHunt'
            }[section] || section;

            return res.status(403).json({
                error: `Section "${sectionLabel}" is not available for ${accountType} accounts`,
                requiredPlan: 'producteur',
                section: section,
                accountType: accountType
            });
        }
    }

    next()
};

/**
 * Validation des données FlowerReview
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

    // farm (optionnel)
    if (data.farm && typeof data.farm === 'string') {
        cleaned.farm = data.farm.trim()
    }

    // varietyType (obligatoire: "souche" ou "hybride")
    if (!data.varietyType || !['souche', 'hybride'].includes(data.varietyType)) {
        errors.push('varietyType must be "souche" or "hybride"')
    } else {
        cleaned.varietyType = data.varietyType
    }

    // ===== SECTION 2: Génétiques =====
    // breeder (optionnel)
    if (data.breeder && typeof data.breeder === 'string') {
        cleaned.breeder = data.breeder.trim()
    }

    // variety (optionnel - autocomplete depuis cultivars)
    if (data.variety && typeof data.variety === 'string') {
        cleaned.variety = data.variety.trim()
    }

    // genetics (optionnel - texte libre)
    if (data.genetics && typeof data.genetics === 'string') {
        cleaned.genetics = data.genetics.trim()
    }

    // indicaRatio (optionnel, 0-100)
    if (data.indicaRatio !== undefined && data.indicaRatio !== null && data.indicaRatio !== '') {
        const ratio = parseFloat(data.indicaRatio)
        if (isNaN(ratio) || ratio < 0 || ratio > 100) {
            errors.push('indicaRatio must be a number between 0 and 100')
        } else {
            cleaned.indicaRatio = ratio
        }
    }

    // phenotype (optionnel)
    if (data.phenotype && typeof data.phenotype === 'string') {
        cleaned.phenotype = data.phenotype.trim()
    }

    // ===== SECTION 3: Pipeline Culture =====
    // culturePipelineId (optionnel - UUID si pipeline créé)
    if (data.culturePipelineId && typeof data.culturePipelineId === 'string') {
        cleaned.culturePipelineId = data.culturePipelineId.trim()
    }

    // cultureStartDate, cultureEndDate (optionnel - ISO dates)
    if (data.cultureStartDate && typeof data.cultureStartDate === 'string') {
        const date = new Date(data.cultureStartDate)
        if (!isNaN(date.getTime())) {
            cleaned.cultureStartDate = date
        }
    }
    if (data.cultureEndDate && typeof data.cultureEndDate === 'string') {
        const date = new Date(data.cultureEndDate)
        if (!isNaN(date.getTime())) {
            cleaned.cultureEndDate = date
        }
    }

    // ===== SECTION 4: Analytics (PDF + cannabinoids) =====
    // analyticsPdfUrl (géré par upload, pas validé ici)

    // THC, CBD, autres cannabinoids (optionnel, float)
    const cannabinoids = ['thcPercent', 'cbdPercent', 'cbgPercent', 'cbcPercent', 'cbnPercent', 'thcvPercent']
    cannabinoids.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (isNaN(val) || val < 0 || val > 100) {
                errors.push(`${field} must be a number between 0 and 100`)
            } else {
                cleaned[field] = val
            }
        }
    })

    // terpeneProfile (JSON object optionnel)
    if (data.terpeneProfile && typeof data.terpeneProfile === 'string') {
        try {
            cleaned.terpeneProfile = JSON.parse(data.terpeneProfile)
        } catch (e) {
            errors.push('terpeneProfile must be valid JSON')
        }
    } else if (data.terpeneProfile && typeof data.terpeneProfile === 'object') {
        cleaned.terpeneProfile = data.terpeneProfile
    }

    // ===== SECTION 5: Consommation =====
    // consumptionMethod (optionnel)
    if (data.consumptionMethod && typeof data.consumptionMethod === 'string') {
        cleaned.consumptionMethod = data.consumptionMethod.trim()
    }

    // ===== SECTION 6: Visuel Technique (7 scores /10) =====
    const visualScores = ['couleurScore', 'densiteScore', 'trichomesScore', 'pistilsScore', 'manucureScore', 'moisissureScore', 'grainesScore']
    visualScores.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (isNaN(val) || val < 0 || val > 10) {
                errors.push(`${field} must be a number between 0 and 10`)
            } else {
                cleaned[field] = val
            }
        }
    })

    // nuancierColors (JSON array optionnel - tableau de hex codes)
    if (data.nuancierColors && typeof data.nuancierColors === 'string') {
        try {
            cleaned.nuancierColors = JSON.parse(data.nuancierColors)
        } catch (e) {
            errors.push('nuancierColors must be valid JSON array')
        }
    } else if (data.nuancierColors && Array.isArray(data.nuancierColors)) {
        cleaned.nuancierColors = data.nuancierColors
    }

    // ===== SECTION 7: Odeurs =====
    // odeursDominantes, odeursSecondaires (JSON arrays max 7 each)
    if (data.odeursDominantes && typeof data.odeursDominantes === 'string') {
        try {
            const arr = JSON.parse(data.odeursDominantes)
            if (Array.isArray(arr) && arr.length <= 7) {
                cleaned.odeursDominantes = arr
            } else {
                errors.push('odeursDominantes must be an array with max 7 items')
            }
        } catch (e) {
            errors.push('odeursDominantes must be valid JSON array')
        }
    } else if (data.odeursDominantes && Array.isArray(data.odeursDominantes)) {
        if (data.odeursDominantes.length <= 7) {
            cleaned.odeursDominantes = data.odeursDominantes
        } else {
            errors.push('odeursDominantes must have max 7 items')
        }
    }

    if (data.odeursSecondaires && typeof data.odeursSecondaires === 'string') {
        try {
            const arr = JSON.parse(data.odeursSecondaires)
            if (Array.isArray(arr) && arr.length <= 7) {
                cleaned.odeursSecondaires = arr
            } else {
                errors.push('odeursSecondaires must be an array with max 7 items')
            }
        } catch (e) {
            errors.push('odeursSecondaires must be valid JSON array')
        }
    } else if (data.odeursSecondaires && Array.isArray(data.odeursSecondaires)) {
        if (data.odeursSecondaires.length <= 7) {
            cleaned.odeursSecondaires = data.odeursSecondaires
        } else {
            errors.push('odeursSecondaires must have max 7 items')
        }
    }

    // odeursIntensiteScore (0-10)
    if (data.odeursIntensiteScore !== undefined && data.odeursIntensiteScore !== null && data.odeursIntensiteScore !== '') {
        const val = parseFloat(data.odeursIntensiteScore)
        if (isNaN(val) || val < 0 || val > 10) {
            errors.push('odeursIntensiteScore must be a number between 0 and 10')
        } else {
            cleaned.odeursIntensiteScore = val
        }
    }

    // ===== SECTION 8: Texture (4 scores /10) =====
    const textureScores = ['textureHardness', 'textureDensity', 'textureElasticity', 'textureStickiness']
    textureScores.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (isNaN(val) || val < 0 || val > 10) {
                errors.push(`${field} must be a number between 0 and 10`)
            } else {
                cleaned[field] = val
            }
        }
    })

    // ===== SECTION 9: Goûts =====
    // goutsIntensiteScore, goutsAgressiviteScore (0-10)
    const tastingScores = ['goutsIntensiteScore', 'goutsAgressiviteScore']
    tastingScores.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (isNaN(val) || val < 0 || val > 10) {
                errors.push(`${field} must be a number between 0 and 10`)
            } else {
                cleaned[field] = val
            }
        }
    })

    // goutsDryPuff, goutsInhalation, goutsExpiration (JSON arrays max 7 each)
    const tasteArrays = ['goutsDryPuff', 'goutsInhalation', 'goutsExpiration']
    tasteArrays.forEach(field => {
        if (data[field] && typeof data[field] === 'string') {
            try {
                const arr = JSON.parse(data[field])
                if (Array.isArray(arr) && arr.length <= 7) {
                    cleaned[field] = arr
                } else {
                    errors.push(`${field} must be an array with max 7 items`)
                }
            } catch (e) {
                errors.push(`${field} must be valid JSON array`)
            }
        } else if (data[field] && Array.isArray(data[field])) {
            if (data[field].length <= 7) {
                cleaned[field] = data[field]
            } else {
                errors.push(`${field} must have max 7 items`)
            }
        }
    })

    // ===== SECTION 10: Effets =====
    // effetsMonteeScore, effetsIntensiteScore (0-10)
    const effectScores = ['effetsMonteeScore', 'effetsIntensiteScore']
    effectScores.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            const val = parseFloat(data[field])
            if (isNaN(val) || val < 0 || val > 10) {
                errors.push(`${field} must be a number between 0 and 10`)
            } else {
                cleaned[field] = val
            }
        }
    })

    // effetsSelectionnes (JSON array max 8)
    if (data.effetsSelectionnes && typeof data.effetsSelectionnes === 'string') {
        try {
            const arr = JSON.parse(data.effetsSelectionnes)
            if (Array.isArray(arr) && arr.length <= 8) {
                cleaned.effetsSelectionnes = arr
            } else {
                errors.push('effetsSelectionnes must be an array with max 8 items')
            }
        } catch (e) {
            errors.push('effetsSelectionnes must be valid JSON array')
        }
    } else if (data.effetsSelectionnes && Array.isArray(data.effetsSelectionnes)) {
        if (data.effetsSelectionnes.length <= 8) {
            cleaned.effetsSelectionnes = data.effetsSelectionnes
        } else {
            errors.push('effetsSelectionnes must have max 8 items')
        }
    }

    // ===== SECTION 11: Pipeline Curing =====
    // curingPipelineId (optionnel - UUID si pipeline créé)
    if (data.curingPipelineId && typeof data.curingPipelineId === 'string') {
        cleaned.curingPipelineId = data.curingPipelineId.trim()
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
    validateSectionPermissions,  // V1 MVP: Check section-level permissions
    requireSectionAccess('info'),  // Check: can access basic sections
    requireActiveSubscription,     // Check: subscription active for paid tiers
    upload.fields([
        { name: 'images', maxCount: 4 }, // Photos produit (max 4)
        { name: 'analyticsPdf', maxCount: 1 } // PDF analytics (optionnel)
    ]), asyncHandler(async (req, res) => {
        console.log('🌿 Creating FlowerReview with data:', JSON.stringify(req.body, null, 2))
        console.log('📎 Files uploaded:', req.files)

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
                photo1,
                photo2,
                photo3,
                photo4,
                analyticsPdfUrl
            }

            // Convertir les champs JSON en strings pour Prisma
            if (flowerReviewData.terpeneProfile && typeof flowerReviewData.terpeneProfile === 'object') {
                flowerReviewData.terpeneProfile = JSON.stringify(flowerReviewData.terpeneProfile)
            }
            if (flowerReviewData.nuancierColors && Array.isArray(flowerReviewData.nuancierColors)) {
                flowerReviewData.nuancierColors = JSON.stringify(flowerReviewData.nuancierColors)
            }
            if (flowerReviewData.odeursDominantes && Array.isArray(flowerReviewData.odeursDominantes)) {
                flowerReviewData.odeursDominantes = JSON.stringify(flowerReviewData.odeursDominantes)
            }
            if (flowerReviewData.odeursSecondaires && Array.isArray(flowerReviewData.odeursSecondaires)) {
                flowerReviewData.odeursSecondaires = JSON.stringify(flowerReviewData.odeursSecondaires)
            }
            if (flowerReviewData.goutsDryPuff && Array.isArray(flowerReviewData.goutsDryPuff)) {
                flowerReviewData.goutsDryPuff = JSON.stringify(flowerReviewData.goutsDryPuff)
            }
            if (flowerReviewData.goutsInhalation && Array.isArray(flowerReviewData.goutsInhalation)) {
                flowerReviewData.goutsInhalation = JSON.stringify(flowerReviewData.goutsInhalation)
            }
            if (flowerReviewData.goutsExpiration && Array.isArray(flowerReviewData.goutsExpiration)) {
                flowerReviewData.goutsExpiration = JSON.stringify(flowerReviewData.goutsExpiration)
            }
            if (flowerReviewData.effetsSelectionnes && Array.isArray(flowerReviewData.effetsSelectionnes)) {
                flowerReviewData.effetsSelectionnes = JSON.stringify(flowerReviewData.effetsSelectionnes)
            }

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
            nuancierColors: result.flowerReview.nuancierColors ? JSON.parse(result.flowerReview.nuancierColors) : null,
            odeursDominantes: result.flowerReview.odeursDominantes ? JSON.parse(result.flowerReview.odeursDominantes) : null,
            odeursSecondaires: result.flowerReview.odeursSecondaires ? JSON.parse(result.flowerReview.odeursSecondaires) : null,
            goutsDryPuff: result.flowerReview.goutsDryPuff ? JSON.parse(result.flowerReview.goutsDryPuff) : null,
            goutsInhalation: result.flowerReview.goutsInhalation ? JSON.parse(result.flowerReview.goutsInhalation) : null,
            goutsExpiration: result.flowerReview.goutsExpiration ? JSON.parse(result.flowerReview.goutsExpiration) : null,
            effetsSelectionnes: result.flowerReview.effetsSelectionnes ? JSON.parse(result.flowerReview.effetsSelectionnes) : null
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

    // V1 MVP: Filtrer les sections selon le type de compte du viewer
    const viewerAccountType = currentUser?.accountType || 'amateur';
    
    if (review.flowerData) {
        // Parser les JSON strings pour le frontend
        let flowerData = {
            ...review.flowerData,
            terpeneProfile: review.flowerData.terpeneProfile ? JSON.parse(review.flowerData.terpeneProfile) : null,
            nuancierColors: review.flowerData.nuancierColors ? JSON.parse(review.flowerData.nuancierColors) : null,
            odeursDominantes: review.flowerData.odeursDominantes ? JSON.parse(review.flowerData.odeursDominantes) : null,
            odeursSecondaires: review.flowerData.odeursSecondaires ? JSON.parse(review.flowerData.odeursSecondaires) : null,
            goutsDryPuff: review.flowerData.goutsDryPuff ? JSON.parse(review.flowerData.goutsDryPuff) : null,
            goutsInhalation: review.flowerData.goutsInhalation ? JSON.parse(review.flowerData.goutsInhalation) : null,
            goutsExpiration: review.flowerData.goutsExpiration ? JSON.parse(review.flowerData.goutsExpiration) : null,
            effetsSelectionnes: review.flowerData.effetsSelectionnes ? JSON.parse(review.flowerData.effetsSelectionnes) : null
        };

        // Amateur: Masquer Génétiques, Culture Pipeline, Curing
        if (viewerAccountType === 'amateur') {
            flowerData.breeder = null;
            flowerData.variety = null;
            flowerData.genetics = null;
            flowerData.phenoType = null;
            flowerData.pipelineData = null;
            flowerData.culture = null;
            flowerData.pipelineCuring = null;
            flowerData.phenoHuntTreeId = null;
            flowerData.phenoHuntData = null;
        } 
        // Influenceur: Masquer Culture Pipeline et PhenoHunt
        else if (viewerAccountType === 'influenceur') {
            flowerData.pipelineData = null;
            flowerData.culture = null;
            flowerData.phenoHuntTreeId = null;
            flowerData.phenoHuntData = null;
        }
        // Producteur: Aucun masquage

        formattedReview.flowerData = flowerData;
    }

    res.json(formattedReview)
}))

// ===== PUT /api/reviews/flower/:id - Mettre à jour une review Fleur =====
router.put('/:id',
    requireAuth,
    validateSectionPermissions,  // V1 MVP: Check section-level permissions
    requireActiveSubscription,
    upload.fields([
        { name: 'images', maxCount: 4 },
        { name: 'analyticsPdf', maxCount: 1 }
    ]), asyncHandler(async (req, res) => {
        console.log(`🔁 PUT /api/reviews/flower/${req.params.id}`)

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
                photo1,
                photo2,
                photo3,
                photo4,
                analyticsPdfUrl
            }

            // Convertir les champs JSON en strings
            if (flowerReviewData.terpeneProfile && typeof flowerReviewData.terpeneProfile === 'object') {
                flowerReviewData.terpeneProfile = JSON.stringify(flowerReviewData.terpeneProfile)
            }
            if (flowerReviewData.nuancierColors && Array.isArray(flowerReviewData.nuancierColors)) {
                flowerReviewData.nuancierColors = JSON.stringify(flowerReviewData.nuancierColors)
            }
            if (flowerReviewData.odeursDominantes && Array.isArray(flowerReviewData.odeursDominantes)) {
                flowerReviewData.odeursDominantes = JSON.stringify(flowerReviewData.odeursDominantes)
            }
            if (flowerReviewData.odeursSecondaires && Array.isArray(flowerReviewData.odeursSecondaires)) {
                flowerReviewData.odeursSecondaires = JSON.stringify(flowerReviewData.odeursSecondaires)
            }
            if (flowerReviewData.goutsDryPuff && Array.isArray(flowerReviewData.goutsDryPuff)) {
                flowerReviewData.goutsDryPuff = JSON.stringify(flowerReviewData.goutsDryPuff)
            }
            if (flowerReviewData.goutsInhalation && Array.isArray(flowerReviewData.goutsInhalation)) {
                flowerReviewData.goutsInhalation = JSON.stringify(flowerReviewData.goutsInhalation)
            }
            if (flowerReviewData.goutsExpiration && Array.isArray(flowerReviewData.goutsExpiration)) {
                flowerReviewData.goutsExpiration = JSON.stringify(flowerReviewData.goutsExpiration)
            }
            if (flowerReviewData.effetsSelectionnes && Array.isArray(flowerReviewData.effetsSelectionnes)) {
                flowerReviewData.effetsSelectionnes = JSON.stringify(flowerReviewData.effetsSelectionnes)
            }

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
            nuancierColors: result.flowerReview.nuancierColors ? JSON.parse(result.flowerReview.nuancierColors) : null,
            odeursDominantes: result.flowerReview.odeursDominantes ? JSON.parse(result.flowerReview.odeursDominantes) : null,
            odeursSecondaires: result.flowerReview.odeursSecondaires ? JSON.parse(result.flowerReview.odeursSecondaires) : null,
            goutsDryPuff: result.flowerReview.goutsDryPuff ? JSON.parse(result.flowerReview.goutsDryPuff) : null,
            goutsInhalation: result.flowerReview.goutsInhalation ? JSON.parse(result.flowerReview.goutsInhalation) : null,
            goutsExpiration: result.flowerReview.goutsExpiration ? JSON.parse(result.flowerReview.goutsExpiration) : null,
            effetsSelectionnes: result.flowerReview.effetsSelectionnes ? JSON.parse(result.flowerReview.effetsSelectionnes) : null
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
