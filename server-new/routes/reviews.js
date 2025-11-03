import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { prisma } from '../server.js'

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
router.get('/', async (req, res) => {
    try {
        const { type, search, sortBy = 'createdAt', order = 'desc' } = req.query

        const where = {
            OR: [
                { isPublic: true },
                ...(req.isAuthenticated() ? [{ authorId: req.user.id }] : [])
            ],
            ...(type && type !== 'all' ? { type } : {}),
            ...(search ? {
                OR: [
                    { holderName: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            } : {})
        }

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
                }
            },
            orderBy: { [sortBy]: order }
        })

        // Parser les champs JSON et formater les données
        const formattedReviews = reviews.map(review => ({
            ...review,
            terpenes: review.terpenes ? JSON.parse(review.terpenes) : [],
            tastes: review.tastes ? JSON.parse(review.tastes) : [],
            aromas: review.aromas ? JSON.parse(review.aromas) : [],
            effects: review.effects ? JSON.parse(review.effects) : [],
            images: review.images ? JSON.parse(review.images) : [],
            ratings: review.ratings ? JSON.parse(review.ratings) : null,
            mainImageUrl: review.mainImage ? `/images/${review.mainImage}` : null,
            author: {
                ...review.author,
                avatar: review.author.avatar
                    ? `https://cdn.discordapp.com/avatars/${review.author.discordId}/${review.author.avatar}.png`
                    : null
            }
        }))

        res.json(formattedReviews)
    } catch (error) {
        console.error('Error fetching reviews:', error)
        res.status(500).json({ error: 'Failed to fetch reviews' })
    }
})

// GET /api/reviews/:id - Récupérer une review spécifique
router.get('/:id', async (req, res) => {
    try {
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
            return res.status(404).json({ error: 'Review not found' })
        }

        // Vérifier les permissions
        if (!review.isPublic && (!req.isAuthenticated() || review.authorId !== req.user.id)) {
            return res.status(403).json({ error: 'Access denied' })
        }

        // Parser les champs JSON
        const formattedReview = {
            ...review,
            terpenes: review.terpenes ? JSON.parse(review.terpenes) : [],
            tastes: review.tastes ? JSON.parse(review.tastes) : [],
            aromas: review.aromas ? JSON.parse(review.aromas) : [],
            effects: review.effects ? JSON.parse(review.effects) : [],
            images: review.images ? JSON.parse(review.images) : [],
            ratings: review.ratings ? JSON.parse(review.ratings) : null,
            mainImageUrl: review.mainImage ? `/images/${review.mainImage}` : null,
            author: {
                ...review.author,
                avatar: review.author.avatar
                    ? `https://cdn.discordapp.com/avatars/${review.author.discordId}/${review.author.avatar}.png`
                    : null
            }
        }

        res.json(formattedReview)
    } catch (error) {
        console.error('Error fetching review:', error)
        res.status(500).json({ error: 'Failed to fetch review' })
    }
})

// POST /api/reviews - Créer une nouvelle review
router.post('/', requireAuth, upload.array('images', 10), async (req, res) => {
    try {
        const {
            holderName,
            type,
            description,
            note,
            ratings,
            terpenes,
            tastes,
            aromas,
            effects,
            strainType,
            indicaRatio,
            isPublic = true,
            isPrivate = false
        } = req.body

        if (!holderName || !type) {
            return res.status(400).json({ error: 'holderName and type are required' })
        }

        // Traiter les images uploadées
        const imageFilenames = req.files?.map(file => file.filename) || []
        const mainImage = imageFilenames[0] || null

        const review = await prisma.review.create({
            data: {
                holderName,
                type,
                description,
                note: note ? parseFloat(note) : null,
                ratings: ratings ? JSON.stringify(JSON.parse(ratings)) : null,
                terpenes: terpenes ? JSON.stringify(JSON.parse(terpenes)) : null,
                tastes: tastes ? JSON.stringify(JSON.parse(tastes)) : null,
                aromas: aromas ? JSON.stringify(JSON.parse(aromas)) : null,
                effects: effects ? JSON.stringify(JSON.parse(effects)) : null,
                strainType,
                indicaRatio: indicaRatio ? parseInt(indicaRatio) : null,
                images: JSON.stringify(imageFilenames),
                mainImage,
                isPublic: isPublic === 'true' || isPublic === true,
                isPrivate: isPrivate === 'true' || isPrivate === true,
                authorId: req.user.id
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

        res.status(201).json({
            ...review,
            terpenes: review.terpenes ? JSON.parse(review.terpenes) : [],
            tastes: review.tastes ? JSON.parse(review.tastes) : [],
            aromas: review.aromas ? JSON.parse(review.aromas) : [],
            effects: review.effects ? JSON.parse(review.effects) : [],
            images: review.images ? JSON.parse(review.images) : [],
            ratings: review.ratings ? JSON.parse(review.ratings) : null,
            mainImageUrl: review.mainImage ? `/images/${review.mainImage}` : null
        })
    } catch (error) {
        console.error('Error creating review:', error)
        res.status(500).json({ error: 'Failed to create review' })
    }
})

// PUT /api/reviews/:id - Mettre à jour une review
router.put('/:id', requireAuth, upload.array('images', 10), async (req, res) => {
    try {
        const review = await prisma.review.findUnique({
            where: { id: req.params.id }
        })

        if (!review) {
            return res.status(404).json({ error: 'Review not found' })
        }

        if (review.authorId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' })
        }

        const {
            holderName,
            type,
            description,
            note,
            ratings,
            terpenes,
            tastes,
            aromas,
            effects,
            strainType,
            indicaRatio,
            isPublic,
            isPrivate
        } = req.body

        // Traiter nouvelles images
        const newImages = req.files?.map(file => file.filename) || []
        const existingImages = review.images ? JSON.parse(review.images) : []
        const allImages = [...existingImages, ...newImages]

        const updated = await prisma.review.update({
            where: { id: req.params.id },
            data: {
                ...(holderName && { holderName }),
                ...(type && { type }),
                ...(description !== undefined && { description }),
                ...(note && { note: parseFloat(note) }),
                ...(ratings && { ratings: JSON.stringify(JSON.parse(ratings)) }),
                ...(terpenes && { terpenes: JSON.stringify(JSON.parse(terpenes)) }),
                ...(tastes && { tastes: JSON.stringify(JSON.parse(tastes)) }),
                ...(aromas && { aromas: JSON.stringify(JSON.parse(aromas)) }),
                ...(effects && { effects: JSON.stringify(JSON.parse(effects)) }),
                ...(strainType && { strainType }),
                ...(indicaRatio && { indicaRatio: parseInt(indicaRatio) }),
                ...(allImages.length > 0 && {
                    images: JSON.stringify(allImages),
                    mainImage: allImages[0]
                }),
                ...(isPublic !== undefined && { isPublic: isPublic === 'true' || isPublic === true }),
                ...(isPrivate !== undefined && { isPrivate: isPrivate === 'true' || isPrivate === true })
            },
            include: {
                author: true
            }
        })

        res.json({
            ...updated,
            terpenes: updated.terpenes ? JSON.parse(updated.terpenes) : [],
            tastes: updated.tastes ? JSON.parse(updated.tastes) : [],
            aromas: updated.aromas ? JSON.parse(updated.aromas) : [],
            effects: updated.effects ? JSON.parse(updated.effects) : [],
            images: updated.images ? JSON.parse(updated.images) : [],
            ratings: updated.ratings ? JSON.parse(updated.ratings) : null
        })
    } catch (error) {
        console.error('Error updating review:', error)
        res.status(500).json({ error: 'Failed to update review' })
    }
})

// DELETE /api/reviews/:id - Supprimer une review
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const review = await prisma.review.findUnique({
            where: { id: req.params.id }
        })

        if (!review) {
            return res.status(404).json({ error: 'Review not found' })
        }

        if (review.authorId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' })
        }

        // Supprimer les images associées
        if (review.images) {
            const images = JSON.parse(review.images)
            for (const image of images) {
                try {
                    await fs.unlink(path.join(__dirname, '../../db/review_images', image))
                } catch (err) {
                    console.error(`Failed to delete image ${image}:`, err)
                }
            }
        }

        await prisma.review.delete({
            where: { id: req.params.id }
        })

        res.json({ message: 'Review deleted successfully' })
    } catch (error) {
        console.error('Error deleting review:', error)
        res.status(500).json({ error: 'Failed to delete review' })
    }
})

export default router
