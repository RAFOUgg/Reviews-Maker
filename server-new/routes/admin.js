import express from 'express'
import { prisma } from '../server.js'

const router = express.Router()

/**
 * Middleware: Check if user is admin
 * For testing: allows access if environment variable ADMIN_MODE=true
 */
const requireAdmin = (req, res, next) => {
    // Development mode: check environment
    if (process.env.ADMIN_MODE === 'true') {
        return next()
    }

    // Production: check user roles
    const _isAuthFunc = typeof req.isAuthenticated === 'function'
    if (!_isAuthFunc || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' })
    }

    // Check if user is admin
    let roles = []
    try {
        const rolesObj = JSON.parse(req.user.roles || '{"roles":[]}')
        roles = rolesObj.roles || []
    } catch (e) {
        console.warn('Failed to parse roles:', e)
    }

    if (!roles.includes('admin')) {
        return res.status(403).json({ error: 'Admin access required' })
    }

    next()
}

/**
 * GET /api/admin/users
 * List all users with their account types
 */
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
                kycStatus: true,
                isBanned: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        })

        res.json({ users })
    } catch (error) {
        console.error('Error fetching users:', error)
        res.status(500).json({ error: 'Failed to fetch users' })
    }
})

/**
 * GET /api/admin/users/:id
 * Get user details
 */
router.get('/users/:id', requireAdmin, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                subscription: true,
                stats: true
            }
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json({ user })
    } catch (error) {
        console.error('Error fetching user:', error)
        res.status(500).json({ error: 'Failed to fetch user' })
    }
})

/**
 * PATCH /api/admin/users/:id/account-type
 * Change user's account type
 * Body: { accountType: "consumer" | "influencer" | "producer" }
 */
router.patch('/users/:id/account-type', requireAdmin, async (req, res) => {
    try {
        const { accountType } = req.body

        // Validate account type
        if (!['consumer', 'influencer', 'producer'].includes(accountType)) {
            return res.status(400).json({
                error: 'Invalid account type. Must be: consumer, influencer, or producer'
            })
        }

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                accountType,
                subscriptionType: accountType === 'consumer' ? null : accountType,
                subscriptionStatus: accountType === 'consumer' ? 'inactive' : 'active'
            },
            select: {
                id: true,
                username: true,
                accountType: true,
                subscriptionType: true,
                subscriptionStatus: true
            }
        })

        res.json({ user, message: `Account type changed to ${accountType}` })
    } catch (error) {
        console.error('Error updating account type:', error)
        res.status(500).json({ error: 'Failed to update account type' })
    }
})

/**
 * PATCH /api/admin/users/:id/subscription
 * Change user's subscription status
 * Body: { subscriptionStatus: "active" | "inactive" | "cancelled" | "expired" }
 */
router.patch('/users/:id/subscription', requireAdmin, async (req, res) => {
    try {
        const { subscriptionStatus } = req.body

        const validStatuses = ['active', 'inactive', 'cancelled', 'expired']
        if (!validStatuses.includes(subscriptionStatus)) {
            return res.status(400).json({
                error: `Invalid subscription status. Must be: ${validStatuses.join(', ')}`
            })
        }

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                subscriptionStatus,
                subscriptionStart: subscriptionStatus === 'active' ? new Date() : undefined,
                subscriptionEnd: subscriptionStatus === 'active' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined
            },
            select: {
                id: true,
                username: true,
                subscriptionStatus: true,
                subscriptionStart: true,
                subscriptionEnd: true
            }
        })

        res.json({ user, message: `Subscription status changed to ${subscriptionStatus}` })
    } catch (error) {
        console.error('Error updating subscription:', error)
        res.status(500).json({ error: 'Failed to update subscription' })
    }
})

/**
 * PATCH /api/admin/users/:id/ban
 * Ban/unban a user
 * Body: { banned: true | false, reason?: string }
 */
router.patch('/users/:id/ban', requireAdmin, async (req, res) => {
    try {
        const { banned, reason } = req.body

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                isBanned: banned,
                bannedAt: banned ? new Date() : null,
                banReason: banned ? reason : null
            },
            select: {
                id: true,
                username: true,
                isBanned: true,
                bannedAt: true,
                banReason: true
            }
        })

        res.json({ user, message: `User ${banned ? 'banned' : 'unbanned'}` })
    } catch (error) {
        console.error('Error updating ban status:', error)
        res.status(500).json({ error: 'Failed to update ban status' })
    }
})

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const totalUsers = await prisma.user.count()
        const amateurs = await prisma.user.count({
            where: { accountType: 'consumer' }
        })
        const influencers = await prisma.user.count({
            where: { accountType: 'influencer' }
        })
        const producers = await prisma.user.count({
            where: { accountType: 'producer' }
        })
        const bannedUsers = await prisma.user.count({
            where: { isBanned: true }
        })
        const totalReviews = await prisma.review.count()

        res.json({
            totalUsers,
            amateurs,
            influencers,
            producers,
            bannedUsers,
            totalReviews,
            accountBreakdown: {
                consumer: amateurs,
                influencer: influencers,
                producer: producers
            }
        })
    } catch (error) {
        console.error('Error fetching stats:', error)
        res.status(500).json({ error: 'Failed to fetch stats' })
    }
})

/**
 * GET /api/admin/check-auth
 * Check if user has admin access
 */
router.get('/check-auth', (req, res) => {
    // Allow if ADMIN_MODE is enabled
    if (process.env.ADMIN_MODE === 'true') {
        return res.json({ isAdmin: true, mode: 'development' })
    }

    // Check authentication
    const _isAuthFunc = typeof req.isAuthenticated === 'function'
    if (!_isAuthFunc || !req.isAuthenticated()) {
        return res.json({ isAdmin: false, authenticated: false })
    }

    // Check roles
    let roles = []
    try {
        const rolesObj = JSON.parse(req.user.roles || '{"roles":[]}')
        roles = rolesObj.roles || []
    } catch (e) {
        console.warn('Failed to parse roles:', e)
    }

    const isAdmin = roles.includes('admin')
    res.json({ isAdmin, authenticated: true, roles })
})

export default router
