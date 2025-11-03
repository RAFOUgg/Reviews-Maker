import express from 'express'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { requireAuth, optionalAuth } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration upload images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'))
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
        cb(null, uniqueName)
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
            return cb(null, true)
        }
        cb(new Error('Seules les images sont autorisées'))
    }
})

// GET /api/reviews - Liste toutes les reviews (publiques)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { type, search, sortBy = 'date' } = req.query

        const where = {
            isPublic: true,
            ...(type && type !== 'all' ? { type } : {}),
            ...(search ? {
                OR: [
                    { holderName: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            } : {})
        }

        const orderBy = sortBy === 'rating'
            ? { note: 'desc' }
            : sortBy === 'name'
                ? { holderName: 'asc' }
                : { createdAt: 'desc' }

        const reviews = await prisma.review.findMany({
            where,
            orderBy,
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

        // Parser les champs JSON et formatter
        const formattedReviews = reviews.map(review => ({
            ...review,
            terpenes: review.terpenes ? JSON.parse(review.terpenes) : [],
            tastes: review.tastes ? JSON.parse(review.tastes) : [],
            aromas: review.aromas ? JSON.parse(review.aromas) : [],
            effects: review.effects ? JSON.parse(review.effects) : [],
            images: review.images ? JSON.parse(review.images) : [],
            author: review.author.username
        }))

        res.json(formattedReviews)
    } catch (error) {
        console.error('Error fetching reviews:', error)
        res.status(500).json({ error: 'fetch_failed', message: error.message })
    }
})

// GET /api/reviews/:id - Récupérer une review
router.get('/:id', optionalAuth, async (req, res) => {
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
            return res.status(404).json({ error: 'not_found' })
        }

        // Incrémenter le compteur de vues
        await prisma.review.update({
            where: { id: req.params.id },
            data: { viewCount: { increment: 1 } }
        })

        // Formatter les champs JSON
        const formatted = {
            ...review,
            terpenes: review.terpenes ? JSON.parse(review.terpenes) : [],
            tastes: review.tastes ? JSON.parse(review.tastes) : [],
            aromas: review.aromas ? JSON.parse(review.aromas) : [],
            effects: review.effects ? JSON.parse(review.effects) : [],
            images: review.images ? JSON.parse(review.images) : []
        }

        res.json(formatted)
    } catch (error) {
        console.error('Error fetching review:', error)
        res.status(500).json({ error: 'fetch_failed', message: error.message })
    }
})

// POST /api/reviews - Créer une nouvelle review
router.post('/', requireAuth, upload.array('images', 5), async (req, res) => {
    try {
        const {
            holderName,
            type,
            description,
            note,
            terpenes,
            tastes,
            aromas,
            effects,
            indicaPercent,
            sativaPercent,
            isPublic = true
        } = req.body

        if (!holderName || !type) {
            return res.status(400).json({ error: 'missing_fields', message: 'holderName et type requis' })
        }

        // Images uploadées
        const uploadedImages = req.files ? req.files.map(f => `/uploads/${f.filename}`) : []
        const mainImage = uploadedImages[0] || null

        const review = await prisma.review.create({
            data: {
                holderName,
                type,
                description,
                note: note ? parseFloat(note) : null,
                terpenes: terpenes ? JSON.stringify(JSON.parse(terpenes)) : null,
                tastes: tastes ? JSON.stringify(JSON.parse(tastes)) : null,
                aromas: aromas ? JSON.stringify(JSON.parse(aromas)) : null,
                effects: effects ? JSON.stringify(JSON.parse(effects)) : null,
                indicaPercent: indicaPercent ? parseInt(indicaPercent) : null,
                sativaPercent: sativaPercent ? parseInt(sativaPercent) : null,
                mainImageUrl: mainImage,
                images: JSON.stringify(uploadedImages),
                authorId: req.user.id,
                isPublic: isPublic === 'true' || isPublic === true
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
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
            images: JSON.parse(review.images)
        })
    } catch (error) {
        console.error('Error creating review:', error)
        res.status(500).json({ error: 'creation_failed', message: error.message })
    }
})

// PUT /api/reviews/:id - Modifier une review
router.put('/:id', requireAuth, upload.array('images', 5), async (req, res) => {
    try {
        const existing = await prisma.review.findUnique({
            where: { id: req.params.id }
        })

        if (!existing) {
            return res.status(404).json({ error: 'not_found' })
        }

        if (existing.authorId !== req.user.id) {
            return res.status(403).json({ error: 'forbidden' })
        }

        const {
            holderName,
            type,
            description,
            note,
            terpenes,
            tastes,
            aromas,
            effects,
            indicaPercent,
            sativaPercent,
            isPublic
        } = req.body

        const uploadedImages = req.files ? req.files.map(f => `/uploads/${f.filename}`) : []
        const existingImages = existing.images ? JSON.parse(existing.images) : []
        const allImages = [...existingImages, ...uploadedImages]

        const updated = await prisma.review.update({
            where: { id: req.params.id },
            data: {
                ...(holderName && { holderName }),
                ...(type && { type }),
                ...(description !== undefined && { description }),
                ...(note && { note: parseFloat(note) }),
                ...(terpenes && { terpenes: JSON.stringify(JSON.parse(terpenes)) }),
                ...(tastes && { tastes: JSON.stringify(JSON.parse(tastes)) }),
                ...(aromas && { aromas: JSON.stringify(JSON.parse(aromas)) }),
                ...(effects && { effects: JSON.stringify(JSON.parse(effects)) }),
                ...(indicaPercent && { indicaPercent: parseInt(indicaPercent) }),
                ...(sativaPercent && { sativaPercent: parseInt(sativaPercent) }),
                ...(uploadedImages.length && { mainImageUrl: allImages[0] }),
                images: JSON.stringify(allImages),
                ...(isPublic !== undefined && { isPublic: isPublic === 'true' || isPublic === true })
            }
        })

        res.json({
            ...updated,
            terpenes: updated.terpenes ? JSON.parse(updated.terpenes) : [],
            tastes: updated.tastes ? JSON.parse(updated.tastes) : [],
            aromas: updated.aromas ? JSON.parse(updated.aromas) : [],
            effects: updated.effects ? JSON.parse(updated.effects) : [],
            images: JSON.parse(updated.images)
        })
    } catch (error) {
        console.error('Error updating review:', error)
        res.status(500).json({ error: 'update_failed', message: error.message })
    }
})

// DELETE /api/reviews/:id - Supprimer une review
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const review = await prisma.review.findUnique({
            where: { id: req.params.id }
        })

        if (!review) {
            return res.status(404).json({ error: 'not_found' })
        }

        if (review.authorId !== req.user.id) {
            return res.status(403).json({ error: 'forbidden' })
        }

        await prisma.review.delete({
            where: { id: req.params.id }
        })

        res.json({ success: true })
    } catch (error) {
        console.error('Error deleting review:', error)
        res.status(500).json({ error: 'deletion_failed', message: error.message })
    }
})

export default router
