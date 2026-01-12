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
router.post('/', requireAuth, upload.fields([
    { name: 'images', maxCount: 4 }, // Photos produit (max 4)
    { name: 'analyticsPdf', maxCount: 1 } // PDF analytics (optionnel)
]), asyncHandler(async (req, res) => {
export default router
