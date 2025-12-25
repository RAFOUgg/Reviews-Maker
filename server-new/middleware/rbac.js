/**
 * Middleware RBAC (Role-Based Access Control)
 */

/**
 * Parse les rôles depuis le champ JSON string
 * @param {string} rolesJson - Champ User.roles (JSON string)
 * @returns {Array<string>} Liste des rôles
 */
function parseRoles(rolesJson) {
    try {
        const parsed = JSON.parse(rolesJson || '{"roles":["consumer"]}');
        return parsed.roles || ['consumer'];
    } catch (error) {
        return ['consumer'];
    }
}

/**
 * Vérifie si l'utilisateur possède au moins un des rôles requis
 * @param {Array<string>} requiredRoles - Rôles autorisés
 * @returns {Function} Middleware Express
 */
function requireRole(...requiredRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'unauthorized',
                message: 'Authentification requise',
            });
        }

        const userRoles = parseRoles(req.user.roles);

        // Super admin a tous les droits
        if (userRoles.includes('admin')) {
            return next();
        }

        // Vérifier si l'utilisateur a au moins un des rôles requis
        const hasRole = requiredRoles.some(role => userRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({
                error: 'forbidden',
                message: 'Vous n\'avez pas les permissions nécessaires',
                requiredRoles,
                userRoles,
            });
        }

        next();
    };
}

/**
 * Vérifie si l'utilisateur est admin ou staff
 */
function requireStaff(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const userRoles = parseRoles(req.user.roles);

    if (!userRoles.includes('admin') && !userRoles.includes('staff')) {
        return res.status(403).json({
            error: 'forbidden',
            message: 'Accès réservé au staff',
        });
    }

    next();
}

/**
 * Vérifie si l'utilisateur est admin
 */
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const userRoles = parseRoles(req.user.roles);

    if (!userRoles.includes('admin')) {
        return res.status(403).json({
            error: 'forbidden',
            message: 'Accès réservé aux administrateurs',
        });
    }

    next();
}

/**
 * Vérifie si l'utilisateur a un abonnement actif
 * @param {Array<string>} allowedPlans - Plans autorisés (optional, sinon tous les plans payants)
 */
function requireSubscription(allowedPlans = []) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'unauthorized',
                message: 'Authentification requise',
            });
        }

        // Charger la subscription depuis Prisma
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        try {
            const subscription = await prisma.subscription.findUnique({
                where: { userId: req.user.id },
            });

            if (!subscription || subscription.plan === 'free') {
                return res.status(403).json({
                    error: 'subscription_required',
                    message: 'Cette fonctionnalité nécessite un abonnement payant',
                    requiredAction: 'upgrade_plan',
                });
            }

            if (subscription.status !== 'active') {
                return res.status(403).json({
                    error: 'subscription_inactive',
                    message: 'Votre abonnement n\'est pas actif',
                    status: subscription.status,
                    requiredAction: 'reactivate_subscription',
                });
            }

            if (allowedPlans.length > 0 && !allowedPlans.includes(subscription.plan)) {
                return res.status(403).json({
                    error: 'insufficient_plan',
                    message: 'Votre plan d\'abonnement ne permet pas d\'accéder à cette fonctionnalité',
                    currentPlan: subscription.plan,
                    requiredPlans: allowedPlans,
                    requiredAction: 'upgrade_plan',
                });
            }

            // Attacher la subscription à req pour usage ultérieur
            req.subscription = subscription;

            next();
        } catch (error) {
            console.error('Erreur vérification subscription:', error);
            return res.status(500).json({
                error: 'internal_error',
                message: 'Erreur lors de la vérification de l\'abonnement',
            });
        } finally {
            await prisma.$disconnect();
        }
    };
}

/**
 * Ajoute les rôles et subscription à req.user pour faciliter l'accès
 */
async function attachUserMetadata(req, res, next) {
    if (!req.user) {
        return next();
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
        // Parser les rôles
        req.user.parsedRoles = parseRoles(req.user.roles);

        // Charger la subscription si elle existe
        const subscription = await prisma.subscription.findUnique({
            where: { userId: req.user.id },
        });

        req.user.subscription = subscription;

        next();
    } catch (error) {
        console.error('Erreur chargement metadata user:', error);
        next(); // Continue même en cas d'erreur
    } finally {
        await prisma.$disconnect();
    }
}

module.exports = {
    parseRoles,
    requireRole,
    requireStaff,
    requireAdmin,
    requireSubscription,
    attachUserMetadata,
};
