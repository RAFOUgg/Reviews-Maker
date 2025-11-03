import express from 'express'
import { prisma } from '../server.js'

const router = express.Router()

// GET /api/users/me/reviews - Reviews de l'utilisateur connecté
router.get('/me/reviews', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' })
    }

    try {
        const reviews = await prisma.review.findMany({
            where: { authorId: req.user.id },
            orderBy: { createdAt: 'desc' },
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

        const formattedReviews = reviews.map(review => ({
            ...review,
            terpenes: review.terpenes ? JSON.parse(review.terpenes) : [],
            tastes: review.tastes ? JSON.parse(review.tastes) : [],
            aromas: review.aromas ? JSON.parse(review.aromas) : [],
            effects: review.effects ? JSON.parse(review.effects) : [],
            images: review.images ? JSON.parse(review.images) : [],
            ratings: review.ratings ? JSON.parse(review.ratings) : null,
            mainImageUrl: review.mainImage ? `/images/${review.mainImage}` : null
        }))

        res.json(formattedReviews)
    } catch (error) {
        console.error('Error fetching user reviews:', error)
        res.status(500).json({ error: 'Failed to fetch reviews' })
    }
})

// GET /api/users/me/stats - Statistiques de l'utilisateur
router.get('/me/stats', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' })
    }

    try {
        const totalReviews = await prisma.review.count({
            where: { authorId: req.user.id }
        })

        const reviews = await prisma.review.findMany({
            where: {
                authorId: req.user.id,
                note: { not: null }
            },
            select: { note: true, type: true }
        })

        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (r.note || 0), 0) / reviews.length
            : 0

        const typeBreakdown = reviews.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1
            return acc
        }, {})

        res.json({
            totalReviews,
            avgRating: Math.round(avgRating * 10) / 10,
            typeBreakdown,
            memberSince: req.user.createdAt
        })
    } catch (error) {
        console.error('Error fetching user stats:', error)
        res.status(500).json({ error: 'Failed to fetch stats' })
    }
})

// GET /api/users/:id/profile - Profil public d'un utilisateur
router.get('/:id/profile', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                username: true,
                avatar: true,
                discordId: true,
                createdAt: true,
                _count: {
                    select: { reviews: true }
                }
            }
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const publicReviews = await prisma.review.count({
            where: {
                authorId: req.params.id,
                isPublic: true
            }
        })

        res.json({
            id: user.id,
            username: user.username,
            avatar: user.avatar
                ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}.png`,
            memberSince: user.createdAt,
            totalReviews: publicReviews
        })
    } catch (error) {
        console.error('Error fetching user profile:', error)
        res.status(500).json({ error: 'Failed to fetch profile' })
    }
})

// GET /api/users/:id/reviews - Reviews publiques d'un utilisateur
router.get('/:id/reviews', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                authorId: req.params.id,
                isPublic: true
            },
            orderBy: { createdAt: 'desc' },
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

        const formattedReviews = reviews.map(review => ({
            ...review,
            terpenes: review.terpenes ? JSON.parse(review.terpenes) : [],
            tastes: review.tastes ? JSON.parse(review.tastes) : [],
            aromas: review.aromas ? JSON.parse(review.aromas) : [],
            effects: review.effects ? JSON.parse(review.effects) : [],
            images: review.images ? JSON.parse(review.images) : [],
            ratings: review.ratings ? JSON.parse(review.ratings) : null,
            mainImageUrl: review.mainImage ? `/images/${review.mainImage}` : null
        }))

        res.json(formattedReviews)
    } catch (error) {
        console.error('Error fetching user reviews:', error)
        res.status(500).json({ error: 'Failed to fetch reviews' })
    }
})

export default router
