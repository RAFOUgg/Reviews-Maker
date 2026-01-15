import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Middleware pour vérifier l'authentification
 * Utilise passport et express-session pour les sessions persistantes
 * En développement, bypass l'auth pour tester facilement
 */
export const requireAuth = (req, res, next) => {
    // ✅ DEV MODE: Bypass auth check - always provide a dev user
    if (process.env.NODE_ENV === 'development') {
        req.user = {
            id: 'dev-test-user-id',
            email: 'test@example.com',
            username: 'DevTestUser',
            tier: 'PRODUCTEUR',  // Donner accès à toutes les features en dev
            emailVerified: true,
            legalAge: true,
            consentRDR: true
        }
        req.isAuthenticated = () => true
        return next()
    }

    // PRODUCTION: Check real authentication
    if (typeof req.isAuthenticated !== 'function' || !req.isAuthenticated()) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentication required'
        })
    }
    next()
}

/**
 * Middleware optionnel : vérifie l'auth mais continue si non-authentifié
 * En DEV, injecte toujours un utilisateur mock
 */
export const optionalAuth = (req, res, next) => {
    // In dev mode, always provide a user
    if (process.env.NODE_ENV === 'development' && !req.user) {
        req.user = {
            id: 'dev-test-user-id',
            email: 'test@example.com',
            username: 'DevTestUser',
            tier: 'PRODUCTEUR',
            emailVerified: true,
            legalAge: true,
            consentRDR: true
        }
        req.isAuthenticated = () => true
    }
    // Passport attache automatiquement req.user et req.isAuthenticated()
    next()
}

/**
 * Middleware pour vérifier si l'utilisateur a les permissions pour modifier une ressource
 */
export const checkOwnershipOrAdmin = async (req, res, next) => {
    try {
        // Ensure req.isAuthenticated exists and can be called
        if (typeof req.isAuthenticated !== 'function' || !req.isAuthenticated()) {
            return res.status(401).json({
                error: 'unauthorized',
                message: 'Authentication required'
            })
        }
        const { id } = req.params // ID de la ressource (review, etc.)
        const { resourceType = 'review' } = req.body // Type de ressource

        if (resourceType === 'review') {
            const review = await prisma.review.findUnique({
                where: { id },
                select: { authorId: true }
            })

            if (!review) {
                return res.status(404).json({
                    error: 'not_found',
                    message: 'Review not found'
                })
            }

            // Vérifier ownership ou admin
            if (review.authorId !== req.user.id) {
                return res.status(403).json({
                    error: 'forbidden',
                    message: 'You do not have permission to modify this review'
                })
            }
        }

        next()
    } catch (error) {
        console.error('Ownership check error:', error)
        res.status(500).json({
            error: 'internal_error',
            message: 'Error checking permissions'
        })
    }
}

/**
 * Middleware pour logger les requêtes authentifiées
 */
export const logAuthRequest = (req, res, next) => {
    try {
        // Guard in case Passport hasn't been applied yet
        const isAuth = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false
        if (isAuth && req.user) {
            console.log(`[AUTH] ${req.method} ${req.path} - User: ${req.user.username} (${req.user.discordId})`)
        }
    } catch (err) {
        // Do not let logging break requests
        console.warn('logAuthRequest: unable to read auth state', err.message)
    }
    next()
}

/**
 * Middleware pour gérer les erreurs d'authentification
 */
export const handleAuthError = (err, req, res, next) => {
    if (err.message === 'Unauthorized') {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'You must be logged in'
        })
    }

    if (err.message === 'Forbidden') {
        return res.status(403).json({
            error: 'forbidden',
            message: 'You do not have permission to access this resource'
        })
    }

    next(err)
}

export default {
    requireAuth,
    optionalAuth,
    checkOwnershipOrAdmin,
    logAuthRequest,
    handleAuthError
}
