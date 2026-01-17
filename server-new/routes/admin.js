import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Middleware to check admin access
const requireAdmin = (req, res, next) => {
    // Development mode: check ADMIN_MODE env variable
    if (process.env.ADMIN_MODE === 'true') {
        return next()
    }

    // Production: check authentication and admin role
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
    }

    // Check if user has admin role
    let userRoles = []
    if (typeof req.user.roles === 'string') {
        try {
            userRoles = JSON.parse(req.user.roles)
        } catch (e) {
            userRoles = []
        }
    } else if (Array.isArray(req.user.roles)) {
        userRoles = req.user.roles
    }

    if (!userRoles.includes('admin')) {
        return res.status(403).json({ error: 'Access Denied - Admin role required' })
    }

    next()
}

// Check admin auth
router.get('/check-auth', async (req, res) => {
    try {
        const isAdmin = process.env.ADMIN_MODE === 'true' || 
                       (req.user && req.user.roles && 
                        (typeof req.user.roles === 'string' ? JSON.parse(req.user.roles) : req.user.roles)
                        .includes('admin'))
        
        res.json({
            isAdmin: isAdmin,
            authenticated: !!req.user,
            roles: req.user?.roles
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to check auth' })
    }
})

// Get all users
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                accountType: true,
                subscriptionType: true,
                subscriptionStatus: true,
                isBanned: true,
                bannedAt: true,
                kycStatus: true,
                createdAt: true,
                updatedAt: true
            },
            take: 100,
            orderBy: { createdAt: 'desc' }
        })

        res.json({ users })
    } catch (error) {
        console.error('Error fetching users:', error)
        res.status(500).json({ error: 'Failed to fetch users' })
    }
})

// Get specific user
router.get('/users/:id', requireAdmin, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                username: true,
                email: true,
                accountType: true,
                subscriptionType: true,
                subscriptionStatus: true,
                isBanned: true,
                bannedAt: true,
                banReason: true,
                kycStatus: true,
                createdAt: true,
                updatedAt: true
            }
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json(user)
    } catch (error) {
        console.error('Error fetching user:', error)
        res.status(500).json({ error: 'Failed to fetch user' })
    }
})

// Change account type
router.patch('/users/:id/account-type', requireAdmin, async (req, res) => {
    try {
        const { accountType } = req.body

        // Validate account type
        if (!['consumer', 'influencer', 'producer'].includes(accountType)) {
            return res.status(400).json({ error: 'Invalid account type' })
        }

        // Update user
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                accountType: accountType,
                subscriptionType: accountType === 'consumer' ? null : accountType,
                subscriptionStatus: accountType === 'consumer' ? 'inactive' : 'active'
            },
            select: {
                id: true,
                username: true,
                email: true,
                accountType: true,
                subscriptionType: true,
                subscriptionStatus: true,
                updatedAt: true
            }
        })

        res.json(user)
    } catch (error) {
        console.error('Error updating account type:', error)
        res.status(500).json({ error: 'Failed to update account type' })
    }
})

// Update subscription
router.patch('/users/:id/subscription', requireAdmin, async (req, res) => {
    try {
        const { subscriptionStatus } = req.body

        // Validate status
        if (!['active', 'inactive', 'cancelled', 'expired'].includes(subscriptionStatus)) {
            return res.status(400).json({ error: 'Invalid subscription status' })
        }

        // Update user
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                subscriptionStatus: subscriptionStatus,
                subscriptionStartDate: subscriptionStatus === 'active' ? new Date() : undefined,
                subscriptionEndDate: subscriptionStatus === 'expired' ? new Date() : undefined
            },
            select: {
                id: true,
                username: true,
                subscriptionStatus: true,
                updatedAt: true
            }
        })

        res.json(user)
    } catch (error) {
        console.error('Error updating subscription:', error)
        res.status(500).json({ error: 'Failed to update subscription' })
    }
})

// Ban/Unban user
router.patch('/users/:id/ban', requireAdmin, async (req, res) => {
    try {
        const { banned, reason } = req.body

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                isBanned: banned,
                bannedAt: banned ? new Date() : null,
                banReason: reason || null
            },
            select: {
                id: true,
                username: true,
                isBanned: true,
                bannedAt: true,
                banReason: true,
                updatedAt: true
            }
        })

        res.json(user)
    } catch (error) {
        console.error('Error banning user:', error)
        res.status(500).json({ error: 'Failed to ban user' })
    }
})

// Get statistics
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const [totalUsers, amateurs, influencers, producers, bannedUsers, totalReviews] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { accountType: 'consumer' } }),
            prisma.user.count({ where: { accountType: 'influencer' } }),
            prisma.user.count({ where: { accountType: 'producer' } }),
            prisma.user.count({ where: { isBanned: true } }),
            prisma.review.count()
        ])

        res.json({
            totalUsers,
            amateurs,
            influencers,
            producers,
            bannedUsers,
            totalReviews
        })
    } catch (error) {
        console.error('Error fetching stats:', error)
        res.status(500).json({ error: 'Failed to fetch statistics' })
    }
})

export default router
