import express from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/users/:id - Profil public utilisateur
router.get('/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                username: true,
                avatar: true,
                discordId: true,
                createdAt: true,
                reviews: {
                    where: { isPublic: true },
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        })

        if (!user) {
            return res.status(404).json({ error: 'not_found' })
        }

        // Avatar URL Discord
        const avatarUrl = user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=256`
            : `https://cdn.discordapp.com/embed/avatars/0.png`

        // Stats
        const totalReviews = await prisma.review.count({
            where: { authorId: user.id, isPublic: true }
        })

        const avgRating = await prisma.review.aggregate({
            where: { authorId: user.id, isPublic: true, note: { not: null } },
            _avg: { note: true }
        })

        res.json({
            id: user.id,
            username: user.username,
            avatar: avatarUrl,
            createdAt: user.createdAt,
            stats: {
                totalReviews,
                avgRating: avgRating._avg.note || 0
            },
            recentReviews: user.reviews.map(r => ({
                ...r,
                terpenes: r.terpenes ? JSON.parse(r.terpenes) : [],
                tastes: r.tastes ? JSON.parse(r.tastes) : [],
                aromas: r.aromas ? JSON.parse(r.aromas) : [],
                effects: r.effects ? JSON.parse(r.effects) : [],
                images: r.images ? JSON.parse(r.images) : []
            }))
        })
    } catch (error) {
        console.error('Error fetching user:', error)
        res.status(500).json({ error: 'fetch_failed', message: error.message })
    }
})

// GET /api/users/me/reviews - Mes reviews (privées incluses)
router.get('/me/reviews', requireAuth, async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { authorId: req.user.id },
            orderBy: { createdAt: 'desc' }
        })

        const formatted = reviews.map(r => ({
            ...r,
            terpenes: r.terpenes ? JSON.parse(r.terpenes) : [],
            tastes: r.tastes ? JSON.parse(r.tastes) : [],
            aromas: r.aromas ? JSON.parse(r.aromas) : [],
            effects: r.effects ? JSON.parse(r.effects) : [],
            images: r.images ? JSON.parse(r.images) : []
        }))

        res.json(formatted)
    } catch (error) {
        console.error('Error fetching user reviews:', error)
        res.status(500).json({ error: 'fetch_failed', message: error.message })
    }
})

export default router
