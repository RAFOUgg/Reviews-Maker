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
    // DEV MODE BYPASS: Return mock data to skip database access
    if (process.env.NODE_ENV === 'development') {
        return res.json([])
    }

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
    console.log(`🔍 GET /api/reviews/${req.params.id}`)
    console.log('👤 Authenticated:', typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false)
    console.log('👤 User:', req.user ? { id: req.user.id, username: req.user.username } : null)

    // Valider l'ID
    if (!validateReviewId(req.params.id)) {
        console.error('❌ Invalid review ID format:', req.params.id)
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }

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
            }
        }
    })

    if (!review) {
        console.error('❌ Review not found:', req.params.id)
        throw Errors.REVIEW_NOT_FOUND()
    }

    console.log('📄 Review found:', { id: review.id, authorId: review.authorId, isPublic: review.isPublic })

    // Vérifier les permissions pour les reviews privées
    const isAuthenticated = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false
    const currentUser = isAuthenticated ? req.user : null

    if (!review.isPublic && (!isAuthenticated || !currentUser || review.authorId !== currentUser.id)) {
        console.error('🚫 Access forbidden:', {
            isPublic: review.isPublic,
            isAuthenticated,
            reviewAuthorId: review.authorId,
            currentUserId: currentUser?.id
        })
        throw Errors.FORBIDDEN()
    }

    // Formater la review
    let formattedReview = formatReview(review, currentUser)

    formattedReview = liftOrchardFromExtra(formattedReview)

    // ✅ S'assurer que authorId est toujours présent
    if (!formattedReview.authorId) {
        formattedReview.authorId = review.authorId
    }

    console.log('✅ Sending review:', { id: formattedReview.id, authorId: formattedReview.authorId })

    res.json(formattedReview)
}))

// POST /api/reviews - Créer une nouvelle review
router.post('/', requireAuth, upload.array('images', 10), asyncHandler(async (req, res) => {
    console.log('📝 Creating review with data:', JSON.stringify(req.body, null, 2))
    console.log('📎 Files uploaded:', req.files?.length || 0)

    // Vérifier les limites de reviews pour les comptes consumer
    const accountType = getUserAccountType(req.user);
    const limits = EXPORT_LIMITS[accountType] || EXPORT_LIMITS[ACCOUNT_TYPES.CONSUMER];

    // Determine visibility: frontend sends `isPublic` (boolean) or `visibility` (string)
    const visibility = (req.body.isPublic === 'true' || req.body.isPublic === true || req.body.visibility === 'public') ? 'public' : 'private';

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

    console.log('💾 Data to save:', JSON.stringify(reviewData, null, 2))

    // Créer la review en base
    const review = await prisma.review.create({
        data: reviewData,
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

    // Formater et retourner
    let formattedReview = formatReview(review, req.user)
    formattedReview = liftOrchardFromExtra(formattedReview)

    res.status(201).json(formattedReview)
}))

// PUT /api/reviews/:id - Mettre à jour une review
router.put('/:id', requireAuth, upload.array('images', 10), asyncHandler(async (req, res) => {
    console.log(`🔁 PUT /api/reviews/${req.params.id} by user: ${req.user?.id || 'unknown'}`, 'body keys:', Object.keys(req.body))
    // Valider l'ID
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }

    // Récupérer la review existante
    const review = await prisma.review.findUnique({
        where: { id: req.params.id }
    })

    if (!review) {
        throw Errors.REVIEW_NOT_FOUND()
    }

    // Vérifier ownership du review (utilisateur courant doit être l'auteur)
    await requireOwnershipOrThrow(review.authorId, req, 'review')

    const {
        holderName,
        type,
        description,
        note,
        overallRating,
        categoryRatings,
        ratings,
        terpenes,
        tastes,
        aromas,
        effects,
        strainType,
        indicaRatio,
        isPublic,
        isPrivate,
        cultivarsList,
        pipelineExtraction,
        pipelineSeparation,
        purgevide,
        hashmaker,
        breeder,
        farm,
        cultivars,
        dureeEffet,
        existingImages,
        ...otherFields
    } = req.body

    // Gérer les images: nouvelles + conserver les existantes sélectionnées
    const newImages = req.files?.map(file => file.filename) || []
    // existingImages peut être un JSON stringifié ou déjà un tableau.
    let keepImages = []
    try {
        if (existingImages) {
            if (typeof existingImages === 'string') {
                keepImages = JSON.parse(existingImages)
            } else if (Array.isArray(existingImages)) {
                keepImages = existingImages
            } else {
                // fallback: coerce to array if possible
                keepImages = Array.isArray(JSON.parse(JSON.stringify(existingImages))) ? JSON.parse(JSON.stringify(existingImages)) : []
            }
        }
    } catch (err) {
        console.warn('Failed to parse existingImages from request, falling back to empty array', err)
        keepImages = []
    }

    // Respect preferredMain if provided (client can specify a promoted new image or existing image)
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
            console.warn('Failed to apply preferredMain ordering', err)
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
            console.error(`Failed to delete image ${image}:`, err)
        }
    }

    // Préparer les données de mise à jour
    // IMPORTANT: utiliser hasOwnProperty pour inclure les valeurs falsy (0, false, "", [])
    const updateData = {}

    const setIfPresent = (key, value) => {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            updateData[key] = value
        }
    }

    // Champs simples
    setIfPresent('holderName', holderName)
    setIfPresent('type', type)
    // description peut être vide string => accepter explicitement
    if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
        updateData.description = description
    }

    // Note globale : overallRating a priorité si présent
    if (Object.prototype.hasOwnProperty.call(req.body, 'overallRating') || Object.prototype.hasOwnProperty.call(req.body, 'note')) {
        const rawNote = Object.prototype.hasOwnProperty.call(req.body, 'overallRating') ? overallRating : note
        if (rawNote !== undefined && rawNote !== null && rawNote !== '') {
            updateData.note = parseFloat(rawNote)
        } else {
            // si la valeur est fournie mais vide, définir à null pour effacer si besoin
            updateData.note = null
        }
    }

    // Champs JSON / tableaux : conserver même si tableau vide
    const jsonFields = ['categoryRatings', 'ratings', 'terpenes', 'tastes', 'aromas', 'effects', 'cultivarsList', 'pipelineExtraction', 'pipelineSeparation', 'substratMix']
    for (const fieldName of jsonFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, fieldName)) {
            const raw = req.body[fieldName]
            if (typeof raw === 'string') {
                updateData[fieldName] = raw
            } else {
                try {
                    updateData[fieldName] = JSON.stringify(raw)
                } catch (err) {
                    updateData[fieldName] = JSON.stringify(String(raw))
                }
            }
        }
    }

    // Champs textes simples
    setIfPresent('strainType', strainType)
    setIfPresent('hashmaker', hashmaker)
    setIfPresent('breeder', breeder)
    setIfPresent('farm', farm)
    setIfPresent('cultivars', cultivars)
    setIfPresent('dureeEffet', dureeEffet)

    // Indica ratio: accepter 0
    if (Object.prototype.hasOwnProperty.call(req.body, 'indicaRatio')) {
        updateData.indicaRatio = indicaRatio === '' || indicaRatio === null ? null : parseInt(indicaRatio)
    }

    // Images
    if (allImages.length > 0) {
        updateData.images = JSON.stringify(allImages.map(img => img.replace('/images/', '')))
        updateData.mainImage = allImages[0].replace('/images/', '')
    }

    // Booléens
    if (Object.prototype.hasOwnProperty.call(req.body, 'isPublic')) {
        updateData.isPublic = (isPublic === 'true' || isPublic === true)
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'isPrivate')) {
        updateData.isPrivate = (isPrivate === 'true' || isPrivate === true)
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'purgevide')) {
        updateData.purgevide = (purgevide === 'true' || purgevide === true)
    }

    // Stocker autres champs dans extraData
    const extraData = {}
    for (const [key, value] of Object.entries(otherFields)) {
        if (value !== undefined && value !== null && value !== '') {
            extraData[key] = value
        }
    }
    if (Object.keys(extraData).length > 0) {
        // Merge with existing extraData on the review to avoid wiping unrelated values
        let parsedExisting = {}
        try {
            parsedExisting = review.extraData ? JSON.parse(review.extraData) : {}
        } catch (err) {
            parsedExisting = {}
        }

        const merged = { ...parsedExisting, ...extraData }
        updateData.extraData = JSON.stringify(merged)
    }

    console.log('💾 Update payload:', JSON.stringify(updateData, null, 2))

    const updated = await prisma.review.update({
        where: { id: req.params.id },
        data: updateData,
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

    // Formater et retourner
    let formattedReview = formatReview(updated, req.user)
    formattedReview = liftOrchardFromExtra(formattedReview)
    res.json(formattedReview)
}))

// DELETE /api/reviews/:id - Supprimer une review
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    // Valider l'ID
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }

    // Récupérer la review existante
    const review = await prisma.review.findUnique({ where: { id: req.params.id } })

    if (!review) {
        throw Errors.REVIEW_NOT_FOUND()
    }

    // Vérifier ownership du review
    await requireOwnershipOrThrow(review.authorId, req, 'review')

    // Supprimer les images associées
    const imageFilenames = extractImageFilenames(review)
    for (const filename of imageFilenames) {
        try {
            await fs.unlink(path.join(__dirname, '../../db/review_images', filename))
        } catch (err) {
            console.error(`Failed to delete image ${filename}:`, err)
        }
    }

    await prisma.review.delete({
        where: { id: req.params.id }
    })

    res.json({ message: 'Review deleted successfully' })
}))

// PATCH /api/reviews/:id/visibility - Changer la visibilité d'une review
router.patch('/:id/visibility', requireAuth, asyncHandler(async (req, res) => {
    const { id } = req.params
    const { isPublic } = req.body

    // Valider l'ID
    if (!validateReviewId(id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }

    // Récupérer la review existante
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
        throw Errors.REVIEW_NOT_FOUND()
    }

    // Vérifier ownership du review
    await requireOwnershipOrThrow(review.authorId, req, 'review')

    // Mettre à jour la visibilité
    const updatedReview = await prisma.review.update({
        where: { id },
        data: { isPublic: Boolean(isPublic) },
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

    // Formater et retourner
    let formattedReview = formatReview(updatedReview, req.user)
    formattedReview = liftOrchardFromExtra(formattedReview)
    res.json(formattedReview)
}))

// POST /api/reviews/:id/like - Ajouter un like à une review
router.post('/:id/like', requireAuth, asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    // Valider l'ID
    if (!validateReviewId(id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }

    // Vérifier si la review existe
    const review = await prisma.review.findUnique({
        where: { id }
    })

    if (!review) {
        throw Errors.REVIEW_NOT_FOUND()
    }

    // Vérifier si l'utilisateur a déjà liké/disliké cette review
    const existingLike = await prisma.reviewLike.findUnique({
        where: {
            reviewId_userId: {
                reviewId: id,
                userId: userId
            }
        }
    })

    if (existingLike) {
        if (existingLike.isLike) {
            // L'utilisateur avait déjà liké, on retire le like
            await prisma.reviewLike.delete({
                where: {
                    reviewId_userId: {
                        reviewId: id,
                        userId: userId
                    }
                }
            })
            return res.json({ action: 'removed', type: 'like' })
        } else {
            // L'utilisateur avait disliké, on change en like
            await prisma.reviewLike.update({
                where: {
                    reviewId_userId: {
                        reviewId: id,
                        userId: userId
                    }
                },
                data: { isLike: true }
            })
            return res.json({ action: 'updated', type: 'like' })
        }
    } else {
        // Nouveau like
        await prisma.reviewLike.create({
            data: {
                reviewId: id,
                userId: userId,
                isLike: true
            }
        })
        return res.json({ action: 'added', type: 'like' })
    }
}))

// POST /api/reviews/:id/dislike - Ajouter un dislike à une review
router.post('/:id/dislike', requireAuth, asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    // Valider l'ID
    if (!validateReviewId(id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }

    // Vérifier si la review existe
    const review = await prisma.review.findUnique({
        where: { id }
    })

    if (!review) {
        throw Errors.REVIEW_NOT_FOUND()
    }

    // Vérifier si l'utilisateur a déjà liké/disliké cette review
    const existingLike = await prisma.reviewLike.findUnique({
        where: {
            reviewId_userId: {
                reviewId: id,
                userId: userId
            }
        }
    })

    if (existingLike) {
        if (!existingLike.isLike) {
            // L'utilisateur avait déjà disliké, on retire le dislike
            await prisma.reviewLike.delete({
                where: {
                    reviewId_userId: {
                        reviewId: id,
                        userId: userId
                    }
                }
            })
            return res.json({ action: 'removed', type: 'dislike' })
        } else {
            // L'utilisateur avait liké, on change en dislike
            await prisma.reviewLike.update({
                where: {
                    reviewId_userId: {
                        reviewId: id,
                        userId: userId
                    }
                },
                data: { isLike: false }
            })
            return res.json({ action: 'updated', type: 'dislike' })
        }
    } else {
        // Nouveau dislike
        await prisma.reviewLike.create({
            data: {
                reviewId: id,
                userId: userId,
                isLike: false
            }
        })
        return res.json({ action: 'added', type: 'dislike' })
    }
}))

// GET /api/reviews/:id/likes - Obtenir les stats de likes/dislikes d'une review
router.get('/:id/likes', async (req, res) => {
    try {
        const { id } = req.params

        const likes = await prisma.reviewLike.count({
            where: { reviewId: id, isLike: true }
        })

        const dislikes = await prisma.reviewLike.count({
            where: { reviewId: id, isLike: false }
        })

        // Si l'utilisateur est authentifié, vérifier son état de like/dislike
        let userLikeState = null
        if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
            const userLike = await prisma.reviewLike.findUnique({
                where: {
                    reviewId_userId: {
                        reviewId: id,
                        userId: req.user.id
                    }
                }
            })
            userLikeState = userLike ? (userLike.isLike ? 'like' : 'dislike') : null
        }

        res.json({ likes, dislikes, userLikeState })
    } catch (error) {
        console.error('Error fetching likes:', error)
        res.status(500).json({ error: 'Failed to fetch likes' })
    }
})

export default router
