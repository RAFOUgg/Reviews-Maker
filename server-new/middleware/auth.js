import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Middleware pour vérifier l'authentification
 * Utilise passport et express-session pour les sessions persistantes
 */
export const requireAuth = (req, res, next) => {
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
}

export default {
    requireAuth,
    optionalAuth,
    checkOwnershipOrAdmin,
    logAuthRequest,
    handleAuthError
}
