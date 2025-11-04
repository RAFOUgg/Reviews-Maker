import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Middleware pour vérifier l'authentification
 * Utilise passport et express-session pour les sessions persistantes
 */
export const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentication required'
        })
    }
    next()
}

/**
 * Middleware optionnel : vérifie l'auth mais continue si non-authentifié
 */
export const optionalAuth = (req, res, next) => {
    // Passport attache automatiquement req.user et req.isAuthenticated()
    next()
}

/**
 * Middleware pour vérifier si l'utilisateur a les permissions pour modifier une ressource
 */
export const checkOwnershipOrAdmin = async (req, res, next) => {
    try {
        if (!req.isAuthenticated()) {
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
    if (req.isAuthenticated()) {
        console.log(`[AUTH] ${req.method} ${req.path} - User: ${req.user.username} (${req.user.discordId})`)
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
