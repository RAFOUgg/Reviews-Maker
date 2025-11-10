import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { prisma } from '../server.js'
import { asyncHandler, Errors, requireAuthOrThrow, requireOwnershipOrThrow } from '../utils/errorHandler.js'
import { formatReview, formatReviews, prepareReviewData, buildReviewFilters, extractImageFilenames } from '../utils/reviewFormatter.js'
import { validateReviewData, validateReviewId } from '../utils/validation.js'

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
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' })
    }
    next()
}

// GET /api/reviews - Liste toutes les reviews (publiques + privées de l'user)
router.get('/', asyncHandler(async (req, res) => {
    const { type, search, sortBy = 'createdAt', order = 'desc' } = req.query

    // Valider les paramètres de tri
    const validSortFields = ['createdAt', 'updatedAt', 'note', 'holderName']
    const validOrders = ['asc', 'desc']

    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const safeOrder = validOrders.includes(order) ? order : 'desc'

    // Construire les filtres de recherche
    const where = buildReviewFilters(
        { type, search },
        req.isAuthenticated() ? req.user : null
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
    const formattedReviews = formatReviews(reviews, req.isAuthenticated() ? req.user : null)

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
    // Valider l'ID
    if (!validateReviewId(req.params.id)) {
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
        throw Errors.REVIEW_NOT_FOUND()
    }

    // Vérifier les permissions pour les reviews privées
    const isAuthenticated = req.isAuthenticated()
    const currentUser = isAuthenticated ? req.user : null

    if (!review.isPublic && (!isAuthenticated || !currentUser || review.authorId !== currentUser.id)) {
        throw Errors.FORBIDDEN()
    }

    // Formater la review
    const formattedReview = formatReview(review, currentUser)

    res.json(formattedReview)
}))

// POST /api/reviews - Créer une nouvelle review
router.post('/', requireAuth, upload.array('images', 10), asyncHandler(async (req, res) => {
    console.log('📝 Creating review with data:', JSON.stringify(req.body, null, 2))
    console.log('📎 Files uploaded:', req.files?.length || 0)

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

    // Préparer les données pour Prisma
    const reviewData = prepareReviewData({
        ...validation.cleaned,
        images: imageFilenames,
        mainImage,
        authorId: req.user.id
    })

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
    const formattedReview = formatReview(review, req.user)

    res.status(201).json(formattedReview)
}))

// PUT /api/reviews/:id - Mettre à jour une review
router.put('/:id', requireAuth, upload.array('images', 10), asyncHandler(async (req, res) => {
    // Valider l'ID
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }

    // Vérifier ownership
    await requireOwnershipOrThrow(prisma, req.params.id, req.user.id, 'review')

    // Récupérer la review existante
    const review = await prisma.review.findUnique({
        where: { id: req.params.id }
    })

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
    const keepImages = existingImages ? JSON.parse(existingImages) : []
    const allImages = [...keepImages, ...newImages]

    // Supprimer les images qui ne sont plus dans la liste
    const oldImages = review.images ? JSON.parse(review.images) : []
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
    const updateData = {
        ...(holderName && { holderName }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(overallRating && { note: parseFloat(overallRating) }),
        ...(note && { note: parseFloat(note) }),
        ...(categoryRatings && { categoryRatings: typeof categoryRatings === 'string' ? categoryRatings : JSON.stringify(categoryRatings) }),
        ...(ratings && { ratings: typeof ratings === 'string' ? ratings : JSON.stringify(ratings) }),
        ...(terpenes && { terpenes: typeof terpenes === 'string' ? terpenes : JSON.stringify(terpenes) }),
        ...(tastes && { tastes: typeof tastes === 'string' ? tastes : JSON.stringify(tastes) }),
        ...(aromas && { aromas: typeof aromas === 'string' ? aromas : JSON.stringify(aromas) }),
        ...(effects && { effects: typeof effects === 'string' ? effects : JSON.stringify(effects) }),
        ...(strainType && { strainType }),
        ...(indicaRatio !== undefined && { indicaRatio: parseInt(indicaRatio) }),
        ...(allImages.length > 0 && {
            images: JSON.stringify(allImages.map(img => img.replace('/images/', ''))),
            mainImage: allImages[0].replace('/images/', '')
        }),
        ...(isPublic !== undefined && { isPublic: isPublic === 'true' || isPublic === true }),
        ...(isPrivate !== undefined && { isPrivate: isPrivate === 'true' || isPrivate === true }),
        ...(cultivarsList && { cultivarsList: typeof cultivarsList === 'string' ? cultivarsList : JSON.stringify(cultivarsList) }),
        ...(pipelineExtraction && { pipelineExtraction: typeof pipelineExtraction === 'string' ? pipelineExtraction : JSON.stringify(pipelineExtraction) }),
        ...(pipelineSeparation && { pipelineSeparation: typeof pipelineSeparation === 'string' ? pipelineSeparation : JSON.stringify(pipelineSeparation) }),
        ...(purgevide !== undefined && { purgevide: purgevide === 'true' || purgevide === true }),
        ...(hashmaker && { hashmaker }),
        ...(breeder && { breeder }),
        ...(farm && { farm }),
        ...(cultivars && { cultivars }),
        ...(dureeEffet && { dureeEffet })
    }

    // Stocker autres champs dans extraData
    const extraData = {}
    for (const [key, value] of Object.entries(otherFields)) {
        if (value !== undefined && value !== null && value !== '') {
            extraData[key] = value
        }
    }
    if (Object.keys(extraData).length > 0) {
        updateData.extraData = JSON.stringify(extraData)
    }

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
    const formattedReview = formatReview(updated, req.user)
    res.json(formattedReview)
}))

// DELETE /api/reviews/:id - Supprimer une review
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    // Valider l'ID
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }

    // Vérifier ownership
    await requireOwnershipOrThrow(prisma, req.params.id, req.user.id, 'review')

    const review = await prisma.review.findUnique({
        where: { id: req.params.id }
    })

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

    // Vérifier ownership
    await requireOwnershipOrThrow(prisma, id, req.user.id, 'review')

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
    const formattedReview = formatReview(updatedReview, req.user)
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
        if (req.isAuthenticated()) {
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
