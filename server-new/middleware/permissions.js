/**
 * Middleware de gestion des permissions par type de compte
 * Reviews-Maker 2025-12-12
 * 
 * Implémente les restrictions d'accès selon la matrice de permissions :
 * - Amateur (gratuit) : restrictions templates, exports, bibliothèque
 * - Influencer (15.99€) : accès avancé export & stats
 * - Producer (29.99€) : accès complet + pipelines + génétique
 */

import { getUserAccountType, ACCOUNT_TYPES } from '../services/account.js';

/**
 * Limites par type de compte
 */
export const EXPORT_LIMITS = {
    [ACCOUNT_TYPES.AMATEUR]: {
        daily: 3,
        templates: 3,
        watermarks: 0,
        reviews: 20,
        publicReviews: 5,
        savedData: 10
    },
    [ACCOUNT_TYPES.INFLUENCEUR]: {
        daily: 50,
        templates: 20,
        watermarks: 10,
        reviews: -1,
        publicReviews: -1,
        savedData: 100
    },
    [ACCOUNT_TYPES.PRODUCTEUR]: {
        daily: -1,
        templates: -1,
        watermarks: -1,
        reviews: -1,
        savedData: -1,
        cultivars: -1,
        phenoProjects: -1
    },
    [ACCOUNT_TYPES.ADMIN]: {
        daily: -1,
        templates: -1,
        watermarks: -1,
        reviews: -1,
        savedData: -1
    },
};

/**
 * Formats d'export autorisés par type de compte
 */
export const EXPORT_FORMATS = {
    [ACCOUNT_TYPES.AMATEUR]: ['png', 'jpeg', 'pdf'],
    [ACCOUNT_TYPES.INFLUENCEUR]: ['png', 'jpeg', 'pdf', 'svg', 'gif'],
    [ACCOUNT_TYPES.PRODUCTEUR]: ['png', 'jpeg', 'pdf', 'svg', 'csv', 'json', 'html', 'gif'],
    [ACCOUNT_TYPES.ADMIN]: ['png', 'jpeg', 'pdf', 'svg', 'csv', 'json', 'html', 'gif'],
};

/**
 * Qualité export (DPI) selon type de compte
 */
export const EXPORT_DPI = {
    [ACCOUNT_TYPES.AMATEUR]: 150,
    [ACCOUNT_TYPES.INFLUENCEUR]: 300,
    [ACCOUNT_TYPES.PRODUCTEUR]: 300,
    [ACCOUNT_TYPES.ADMIN]: 300,
};

/**
 * Vérifie si utilisateur peut accéder à une fonctionnalité
 * @param {Object} user - User Prisma avec champ roles
 * @param {string} feature - Nom de la feature à vérifier
 * @param {Object} options - Options supplémentaires (format, count, etc.)
 * @returns {Object} { allowed: boolean, reason?: string, limit?: number, data?: any }
 */
export function canAccessFeature(user, feature, options = {}) {
    if (!user) {
        return { allowed: false, reason: 'Utilisateur non authentifié' };
    }

    const accountType = getUserAccountType(user);

    // Admin : accès complet à tout
    if (accountType === ACCOUNT_TYPES.ADMIN) {
        return { allowed: true, accountType };
    }

    switch (feature) {
        // Templates personnalisés (drag & drop)
        case 'template_custom':
        case 'template_drag_drop':
            if (accountType === ACCOUNT_TYPES.PRODUCTEUR) {
                return { allowed: true, accountType };
            }
            return {
                allowed: false,
                reason: 'Templates personnalisés réservés aux Producteurs',
                upgradeRequired: 'producteur'
            };

        // Export haute qualité (300dpi)
        case 'export_high_quality':
            const allowedAccounts = [
                ACCOUNT_TYPES.INFLUENCEUR,
                ACCOUNT_TYPES.PRODUCTEUR
            ];

            if (allowedAccounts.includes(accountType)) {
                return {
                    allowed: true,
                    accountType,
                    dpi: EXPORT_DPI[accountType]
                };
            }

            return {
                allowed: false,
                reason: 'Export haute qualité réservé aux abonnés Influenceur/Producteur',
                currentDpi: EXPORT_DPI[accountType],
                upgradeRequired: 'influenceur'
            };

        // Vérification format export
        case 'export_format':
            const allowedFormats = EXPORT_FORMATS[accountType] || EXPORT_FORMATS[ACCOUNT_TYPES.AMATEUR];
            const requestedFormat = options.format?.toLowerCase();

            if (!requestedFormat) {
                return {
                    allowed: true,
                    accountType,
                    allowedFormats
                };
            }

            if (!allowedFormats.includes(requestedFormat)) {
                return {
                    allowed: false,
                    reason: `Format ${requestedFormat.toUpperCase()} non disponible pour votre type de compte`,
                    allowedFormats,
                    upgradeRequired: requestedFormat === 'svg' ? 'influenceur' : 'producteur'
                };
            }

            return {
                allowed: true,
                accountType,
                format: requestedFormat,
                allowedFormats
            };

        // Pipeline culture (phases configurables)
        case 'pipeline_culture':
        case 'pipeline_extraction':
        case 'pipeline_advanced':
            if (accountType === ACCOUNT_TYPES.PRODUCTEUR) {
                return { allowed: true, accountType };
            }
            return {
                allowed: false,
                reason: 'Pipelines configurables réservés aux Producteurs',
                upgradeRequired: 'producteur'
            };

        // Génétique canvas (arbre généalogique)
        case 'genetics_canvas':
        case 'genetics_library':
        case 'pheno_hunt':
            if (accountType === ACCOUNT_TYPES.PRODUCTEUR) {
                return { allowed: true, accountType };
            }
            return {
                allowed: false,
                reason: 'Gestion génétique réservée aux Producteurs',
                upgradeRequired: 'producteur'
            };

        // Bibliothèque templates
        case 'library_templates':
            const templateLimits = EXPORT_LIMITS[accountType] || EXPORT_LIMITS[ACCOUNT_TYPES.AMATEUR];
            const currentTemplateCount = options.currentCount || 0;

            if (templateLimits.templates === -1) {
                return {
                    allowed: true,
                    accountType,
                    limit: -1,
                    unlimited: true
                };
            }

            if (currentTemplateCount >= templateLimits.templates) {
                return {
                    allowed: false,
                    reason: `Limite de ${templateLimits.templates} templates atteinte`,
                    limit: templateLimits.templates,
                    current: currentTemplateCount,
                    upgradeRequired: accountType === ACCOUNT_TYPES.CONSUMER ? 'influencer' : 'producer'
                };
            }

            return {
                allowed: true,
                accountType,
                limit: templateLimits.templates,
                remaining: templateLimits.templates - currentTemplateCount,
                current: currentTemplateCount
            };

        // Bibliothèque watermarks (filigranes)
        case 'library_watermarks':
            const watermarkLimits = EXPORT_LIMITS[accountType] || EXPORT_LIMITS[ACCOUNT_TYPES.AMATEUR];
            const currentWatermarkCount = options.currentCount || 0;

            if (watermarkLimits.watermarks === -1) {
                return {
                    allowed: true,
                    accountType,
                    limit: -1,
                    unlimited: true
                };
            }

            if (currentWatermarkCount >= watermarkLimits.watermarks) {
                return {
                    allowed: false,
                    reason: `Limite de ${watermarkLimits.watermarks} filigranes atteinte`,
                    limit: watermarkLimits.watermarks,
                    current: currentWatermarkCount,
                    upgradeRequired: 'influencer'
                };
            }

            return {
                allowed: true,
                accountType,
                limit: watermarkLimits.watermarks,
                remaining: watermarkLimits.watermarks - currentWatermarkCount,
                current: currentWatermarkCount
            };

        // Bibliothèque saved data (substrats, engrais, etc.)
        case 'library_saved_data':
            const dataLimits = EXPORT_LIMITS[accountType] || EXPORT_LIMITS[ACCOUNT_TYPES.AMATEUR];
            const currentDataCount = options.currentCount || 0;

            if (dataLimits.savedData === -1) {
                return {
                    allowed: true,
                    accountType,
                    limit: -1,
                    unlimited: true
                };
            }

            if (currentDataCount >= dataLimits.savedData) {
                return {
                    allowed: false,
                    reason: `Limite de ${dataLimits.savedData} données sauvegardées atteinte`,
                    limit: dataLimits.savedData,
                    current: currentDataCount,
                    upgradeRequired: accountType === ACCOUNT_TYPES.CONSUMER ? 'influencer' : 'producer'
                };
            }

            return {
                allowed: true,
                accountType,
                limit: dataLimits.savedData,
                remaining: dataLimits.savedData - currentDataCount,
                current: currentDataCount
            };

        // Limite quotidienne exports
        case 'daily_exports':
            const exportLimits = EXPORT_LIMITS[accountType] || EXPORT_LIMITS[ACCOUNT_TYPES.AMATEUR];
            const todayExports = options.todayCount || 0;

            if (exportLimits.daily === -1) {
                return {
                    allowed: true,
                    accountType,
                    limit: -1,
                    unlimited: true
                };
            }

            if (todayExports >= exportLimits.daily) {
                return {
                    allowed: false,
                    reason: `Limite quotidienne de ${exportLimits.daily} exports atteinte`,
                    limit: exportLimits.daily,
                    current: todayExports,
                    resetTime: options.resetTime || null,
                    upgradeRequired: accountType === ACCOUNT_TYPES.CONSUMER ? 'influencer' : 'producer'
                };
            }

            return {
                allowed: true,
                accountType,
                limit: exportLimits.daily,
                remaining: exportLimits.daily - todayExports,
                current: todayExports
            };

        // Filigrane personnalisé (Influenceur+)
        case 'watermark_custom':
            const influencerAccounts = [
                ACCOUNT_TYPES.INFLUENCEUR,
                ACCOUNT_TYPES.PRODUCTEUR
            ];

            if (influencerAccounts.includes(accountType)) {
                return { allowed: true, accountType };
            }

            return {
                allowed: false,
                reason: 'Filigranes personnalisés réservés aux Influenceurs et Producteurs',
                forceSystemWatermark: true,
                upgradeRequired: 'influenceur'
            };

        // Statistiques avancées
        case 'stats_advanced':
        case 'stats_engagement':
        case 'stats_exports':
            const statsAccounts = [
                ACCOUNT_TYPES.INFLUENCEUR,
                ACCOUNT_TYPES.PRODUCTEUR
            ];

            if (statsAccounts.includes(accountType)) {
                return { allowed: true, accountType };
            }

            return {
                allowed: false,
                reason: 'Statistiques avancées réservées aux abonnés',
                upgradeRequired: 'influenceur'
            };

        // Statistiques producteur (cultures, rendements)
        case 'stats_producer':
        case 'stats_cultures':
        case 'stats_yields':
            if (accountType === ACCOUNT_TYPES.PRODUCTEUR) {
                return { allowed: true, accountType };
            }
            return {
                allowed: false,
                reason: 'Statistiques producteur réservées aux comptes Producteur',
                upgradeRequired: 'producteur'
            };

        // Branding entreprise (logo, etc.)
        case 'branding':
        case 'company_logo':
            if (accountType === ACCOUNT_TYPES.PRODUCTEUR) {
                return { allowed: true, accountType };
            }
            return {
                allowed: false,
                reason: 'Branding entreprise réservé aux Producteurs',
                upgradeRequired: 'producteur'
            };

        // Partage réseaux sociaux (API)
        case 'social_sharing':
            const socialAccounts = [
                ACCOUNT_TYPES.INFLUENCEUR,
                ACCOUNT_TYPES.PRODUCTEUR
            ];

            if (socialAccounts.includes(accountType)) {
                return { allowed: true, accountType };
            }

            return {
                allowed: false,
                reason: 'Partage automatique réservé aux abonnés',
                upgradeRequired: 'influenceur'
            };

        default:
            return {
                allowed: false,
                reason: `Feature "${feature}" inconnue`,
                accountType
            };
    }
}

/**
 * Middleware Express pour vérifier permissions
 * Usage: router.post('/custom', requireAuth, requireFeature('template_custom'), handler)
 * 
 * @param {string} feature - Feature à vérifier
 * @param {Function|null} optionsGetter - Fonction async pour récupérer options (req) => {...}
 * @returns {Function} Middleware Express
 */
export function requireFeature(feature, optionsGetter = null) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'authentication_required',
                message: 'Authentification requise'
            });
        }

        // Récupérer options si fonction fournie
        const options = typeof optionsGetter === 'function'
            ? await optionsGetter(req)
            : {};

        // Vérifier permission
        const check = canAccessFeature(req.user, feature, options);

        if (!check.allowed) {
            return res.status(403).json({
                error: 'feature_restricted',
                message: check.reason,
                accountType: check.accountType || getUserAccountType(req.user),
                upgradeRequired: check.upgradeRequired || null,
                limit: check.limit,
                current: check.current,
                remaining: check.remaining
            });
        }

        // Attacher résultat au req pour usage dans handler
        req.featureCheck = check;
        next();
    };
}

/**
 * Obtient les limites pour un utilisateur
 * @param {Object} user - User Prisma
 * @returns {Object} Limites complètes
 */
export function getUserLimits(user) {
    const accountType = getUserAccountType(user);
    const limits = EXPORT_LIMITS[accountType] || EXPORT_LIMITS[ACCOUNT_TYPES.CONSUMER];
    const formats = EXPORT_FORMATS[accountType] || EXPORT_FORMATS[ACCOUNT_TYPES.CONSUMER];
    const dpi = EXPORT_DPI[accountType] || EXPORT_DPI[ACCOUNT_TYPES.CONSUMER];

    return {
        accountType,
        limits,
        formats,
        dpi,
        features: {
            customTemplates: [ACCOUNT_TYPES.PRODUCER, ACCOUNT_TYPES.MERCHANT].includes(accountType),
            highQualityExport: [
                ACCOUNT_TYPES.INFLUENCER,
                ACCOUNT_TYPES.PRODUCER,
                ACCOUNT_TYPES.MERCHANT
            ].includes(accountType),
            advancedStats: [
                ACCOUNT_TYPES.INFLUENCER,
                ACCOUNT_TYPES.PRODUCER,
                ACCOUNT_TYPES.MERCHANT
            ].includes(accountType),
            pipelines: [ACCOUNT_TYPES.PRODUCER, ACCOUNT_TYPES.MERCHANT].includes(accountType),
            genetics: [ACCOUNT_TYPES.PRODUCER, ACCOUNT_TYPES.MERCHANT].includes(accountType),
            branding: [ACCOUNT_TYPES.PRODUCER, ACCOUNT_TYPES.MERCHANT].includes(accountType),
        }
    };
}

/**
 * Vérifie et incrémente compteur daily exports
 * @param {PrismaClient} prisma - Client Prisma
 * @param {string} userId - ID utilisateur
 * @returns {Promise<Object>} { allowed: boolean, count: number, limit: number }
 */
export async function checkAndIncrementDailyExports(prisma, userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error('Utilisateur non trouvé');
    }

    const accountType = getUserAccountType(user);
    const limits = EXPORT_LIMITS[accountType] || EXPORT_LIMITS[ACCOUNT_TYPES.CONSUMER];

    // Pas de limite pour certains comptes
    if (limits.daily === -1) {
        return {
            allowed: true,
            count: -1,
            limit: -1,
            unlimited: true
        };
    }

    // Vérifier si reset nécessaire (nouveau jour)
    const now = new Date();
    const lastReset = user.dailyExportsReset ? new Date(user.dailyExportsReset) : new Date(0);
    const isSameDay = now.toDateString() === lastReset.toDateString();

    let currentCount = isSameDay ? (user.dailyExportsUsed || 0) : 0;

    // Vérifier limite
    if (currentCount >= limits.daily) {
        return {
            allowed: false,
            count: currentCount,
            limit: limits.daily,
            resetTime: new Date(now.setHours(24, 0, 0, 0))
        };
    }

    // Incrémenter
    const newCount = currentCount + 1;
    await prisma.user.update({
        where: { id: userId },
        data: {
            dailyExportsUsed: newCount,
            dailyExportsReset: isSameDay ? user.dailyExportsReset : now
        }
    });

    return {
        allowed: true,
        count: newCount,
        limit: limits.daily,
        remaining: limits.daily - newCount
    };
}

export default {
    canAccessFeature,
    requireFeature,
    getUserLimits,
    checkAndIncrementDailyExports,
    EXPORT_LIMITS,
    EXPORT_FORMATS,
    EXPORT_DPI
};
