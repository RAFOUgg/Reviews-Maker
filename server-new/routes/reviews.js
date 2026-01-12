import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { prisma } from '../server.js'
import { asyncHandler, Errors, requireAuthOrThrow, requireOwnershipOrThrow } from '../utils/errorHandler.js'
import { formatReview, formatReviews, prepareReviewData, buildReviewFilters, extractImageFilenames, liftOrchardFromExtra } from '../utils/reviewFormatter.js'
import { validateReviewData, validateReviewId } from '../utils/validation.js'
import { getUserAccountType, ACCOUNT_TYPES } from '../services/account.js'
import { EXPORT_LIMITS } from '../middleware/permissions.js'

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
        cb(null, `review-${uniqueSuffix}${path.extname(file.originalname)}`)
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
            cb(new Error('Only image files are allowed'))
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

// GET /api/reviews - Liste toutes les reviews (publiques + privées de l'user)
router.get('/', asyncHandler(async (req, res) => {
    const { type, search, sortBy = 'createdAt', order = 'desc', publicOnly, hasOrchard, userId } = req.query

    // Valider les paramètres de tri
    const validSortFields = ['createdAt', 'updatedAt', 'note', 'holderName']
    const validOrders = ['asc', 'desc']

    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const safeOrder = validOrders.includes(order) ? order : 'desc'

    // Construire les filtres de recherche
    const currentUser = (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) ? req.user : null
    const where = buildReviewFilters(
        { type, search, publicOnly, hasOrchard, userId },
        currentUser
    )

    const reviews = await prisma.review.findMany({
        where,
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    discordId: true
                }
            },
            likes: true // Inclure tous les likes pour calculer les stats
        },
        orderBy: { [safeSortBy]: safeOrder }
    })

    // Formater les reviews avec le helper centralisé
    let formattedReviews = formatReviews(reviews, currentUser)
    // Exposer orchardConfig/preset si présents
    formattedReviews = formattedReviews.map(r => liftOrchardFromExtra(r))

    res.json(formattedReviews)
}))

// GET /api/reviews/my - Récupérer les reviews de l'utilisateur connecté
router.get('/my', requireAuth, asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
        where: { authorId: req.user.id },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    discordId: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    const formattedReviews = formatReviews(reviews, req.user)

    // Ajouter les métadonnées spécifiques pour "mes reviews"
    const reviewsWithMeta = formattedReviews.map(review => ({
        ...review,
        ownerName: review.author.username,
        ownerId: review.author.id
    }))

    res.json(reviewsWithMeta)
}))

// GET /api/reviews/:id - Récupérer une review spécifique
router.get('/:id', asyncHandler(async (req, res) => {
    const limits = EXPORT_LIMITS[accountType] || EXPORT_LIMITS[ACCOUNT_TYPES.CONSUMER];
    const visibility = req.body.visibility || 'private';

    // Vérifier limite reviews privées
    if (visibility === 'private' && limits.reviews !== -1) {
        const privateCount = await prisma.review.count({
            where: {
                authorId: req.user.id,
                visibility: 'private'
            }
        });

        if (privateCount >= limits.reviews) {
            return res.status(403).json({
                error: 'review_limit_reached',
                message: `Vous avez atteint la limite de ${limits.reviews} reviews privées.`,
                limit: limits.reviews,
                current: privateCount,
                upgradeRequired: true,
                upgradeType: 'influencer'
            });
        }
    }

    // Vérifier limite reviews publiques
    if (visibility === 'public' && limits.publicReviews !== -1) {
        const publicCount = await prisma.review.count({
            where: {
                authorId: req.user.id,
                visibility: 'public'
            }
        });

        if (publicCount >= limits.publicReviews) {
            return res.status(403).json({
                error: 'public_review_limit_reached',
                message: `Vous avez atteint la limite de ${limits.publicReviews} reviews publiques.`,
                limit: limits.publicReviews,
                current: publicCount,
                upgradeRequired: true,
                upgradeType: 'influencer'
            });
        }
    }

    // Valider les données de la review
    const validation = validateReviewData(req.body)

    if (!validation.valid) {
        throw Errors.VALIDATION_ERROR(validation.errors)
    }

    // Traiter les images uploadées
    const imageFilenames = req.files?.map(file => file.filename) || []

    // Au moins une image est requise (selon les specs métier)
    if (imageFilenames.length === 0) {
        throw Errors.MISSING_FIELD('images')
    }

    const mainImage = imageFilenames[0]

    // Collecter les champs supplémentaires (extraData) pour persister orchardConfig/orchardPreset etc.
    const extraData = {}
    for (const [key, value] of Object.entries(req.body)) {
        // Ne pas recopier les champs déjà nettoyés par la validation
        if (Object.prototype.hasOwnProperty.call(validation.cleaned, key)) continue
        if (key === 'images' || key === 'existingImages') continue
        if (value !== undefined && value !== null && value !== '') {
            extraData[key] = value
        }
    }

    // Préparer les données pour Prisma en incluant les champs validés + images + extraData
    const reviewDataRaw = {
        ...validation.cleaned,
        images: imageFilenames,
        mainImage,
        authorId: req.user.id
    }

    if (Object.keys(extraData).length > 0) {
        reviewDataRaw.extraData = JSON.stringify(extraData)
    }

    const reviewData = prepareReviewData(reviewDataRaw)
    const preferredMain = req.body.preferredMain;
    let allImages = [];
    if (preferredMain) {
        try {
            if (String(preferredMain).startsWith('new:')) {
                const idx = parseInt(String(preferredMain).split(':')[1], 10);
                if (!Number.isNaN(idx) && idx >= 0 && idx < newImages.length) {
                    const selectedNew = newImages.splice(idx, 1)[0];
                    // Place selected new as absolute first so it becomes mainImage even if keepImages exist
                    if (keepImages.length > 0) {
                        allImages = [selectedNew, ...keepImages, ...newImages];
                    } else {
                        allImages = [selectedNew, ...newImages];
                    }
                } else {
                    allImages = [...keepImages, ...newImages];
                }
            } else {
                // preferredMain may reference an existing image (filename or /images/filename)
                const pref = String(preferredMain).replace(/^\/images\//, '');
                if (keepImages.length > 0) {
                    const idx = keepImages.findIndex(k => k.endsWith(pref) || k === (`/images/${pref}`) || k === pref);
                    if (idx > -1) {
                        const clone = [...keepImages];
                        const [item] = clone.splice(idx, 1);
                        clone.unshift(item);
                        allImages = [...clone, ...newImages];
                    } else {
                        allImages = [...keepImages, ...newImages];
                    }
                } else {
                    allImages = [...keepImages, ...newImages];
                }
            }
        } catch (err) {
            allImages = [...keepImages, ...newImages];
        }
    } else {
        allImages = [...keepImages, ...newImages]
    }

    // Supprimer les images qui ne sont plus dans la liste
    let oldImages = []
    try {
        oldImages = typeof review.images === 'string' ? JSON.parse(review.images) : (Array.isArray(review.images) ? review.images : [])
    } catch (err) {
        console.warn('Failed to parse review.images for deletion logic; falling back to empty array', err)
        oldImages = []
    }
    const imagesToDelete = oldImages.filter(img => !keepImages.includes(`/images/${img}`) && !keepImages.includes(img))

    for (const image of imagesToDelete) {
        try {
            const filename = image.replace('/images/', '')
            await fs.unlink(path.join(__dirname, '../../db/review_images', filename))
        } catch (err) {
export default router
