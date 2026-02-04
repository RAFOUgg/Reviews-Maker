/**
 * Service de gestion des types de comptes utilisateurs
 * Gère les transitions entre consumer et producer
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Types de comptes disponibles - Conforme CDC
 * Amateur: gratuit, fonctionnalités limitées
 * Producteur: 29.99€/mois, accès complet pipelines et exports pros
 * Influenceur: 15.99€/mois, exports haute qualité et statistiques
 */
export const ACCOUNT_TYPES = {
    AMATEUR: 'amateur',           // Gratuit (ancien consumer)
    PRODUCTEUR: 'producteur',     // 29.99€/mois (ancien producer)
    INFLUENCEUR: 'influenceur',   // 15.99€/mois (anciens influencer_basic/pro)
    ADMIN: 'admin',               // Administrateur
};

/**
 * Prix des abonnements
 */
export const SUBSCRIPTION_PRICES = {
    amateur: 0,
    producteur: 29.99,
    influenceur: 15.99
};

/**
 * Parse les rôles depuis le champ JSON
 * @param {string} rolesJson - Champ User.roles
 * @returns {Array<string>}
 */
function parseRoles(rolesJson) {
    try {
        // Handle undefined, null, or empty string
        if (!rolesJson || rolesJson === '') {
            return ['consumer'];
        }

        const parsed = JSON.parse(rolesJson);

        // Ensure parsed.roles is an array
        if (parsed && Array.isArray(parsed.roles) && parsed.roles.length > 0) {
            return parsed.roles;
        }

        return ['consumer'];
    } catch (error) {
        return ['consumer'];
    }
}

/**
 * Stringify les rôles vers JSON
 * @param {Array<string>} roles
 * @returns {string}
 */
function stringifyRoles(roles) {
    return JSON.stringify({ roles });
}

/**
 * Récupère le type de compte principal d'un utilisateur
 * @param {Object} user - Utilisateur Prisma
 * @returns {string} Type de compte
 */
export function getUserAccountType(user) {
    if (!user) {
        return ACCOUNT_TYPES.AMATEUR;
    }

    const roles = parseRoles(user.roles);

    // Ensure roles is an array before using includes
    if (!Array.isArray(roles) || roles.length === 0) {
        return ACCOUNT_TYPES.AMATEUR;
    }

    // Ordre de priorité: Admin > Producteur > Influenceur > Amateur
    if (roles.includes('admin')) return ACCOUNT_TYPES.ADMIN;
    if (roles.includes('producteur')) return ACCOUNT_TYPES.PRODUCTEUR;
    if (roles.includes('influenceur')) return ACCOUNT_TYPES.INFLUENCEUR;

    // Rétrocompatibilité avec anciens types
    if (roles.includes('producer')) return ACCOUNT_TYPES.PRODUCTEUR;
    if (roles.includes('influencer_pro') || roles.includes('influencer_basic')) {
        return ACCOUNT_TYPES.INFLUENCEUR;
    }
    if (roles.includes('consumer')) return ACCOUNT_TYPES.AMATEUR;

    return ACCOUNT_TYPES.AMATEUR;
}

/**
 * Vérifie si un utilisateur peut upgrader vers un type de compte
 * @param {Object} user - Utilisateur Prisma
 * @param {string} targetType - Type cible
 * @returns {Object} { allowed: boolean, reason?: string }
 */
export function canUpgradeAccountType(user, targetType) {
    if (!user) {
        return { allowed: false, reason: 'Utilisateur non défini' };
    }

    const currentType = getUserAccountType(user);
    const roles = parseRoles(user.roles);

    // Ensure roles is an array
    if (!Array.isArray(roles)) {
        return { allowed: false, reason: 'Rôles invalides' };
    }

    // Admin peut tout faire
    if (targetType === ACCOUNT_TYPES.ADMIN || currentType === ACCOUNT_TYPES.ADMIN) {
        return { allowed: true };
    }

    // Amateur peut upgrader vers Producteur ou Influenceur
    if (currentType === ACCOUNT_TYPES.AMATEUR) {
        if ([ACCOUNT_TYPES.PRODUCTEUR, ACCOUNT_TYPES.INFLUENCEUR].includes(targetType)) {
            return { allowed: true };
        }
    }

    // Influenceur peut downgrade vers Amateur ou upgrade vers Producteur
    if (currentType === ACCOUNT_TYPES.INFLUENCEUR) {
        if (targetType === ACCOUNT_TYPES.AMATEUR) {
            return { allowed: true, needsCancellation: true };
        }
        if (targetType === ACCOUNT_TYPES.PRODUCTEUR) {
            return { allowed: true, needsUpgrade: true };
        }
    }

    // Producteur peut downgrade vers Amateur uniquement
    if (currentType === ACCOUNT_TYPES.PRODUCTEUR) {
        if (targetType === ACCOUNT_TYPES.AMATEUR) {
            return { allowed: true, needsCancellation: true };
        }
        if (targetType === ACCOUNT_TYPES.INFLUENCEUR) {
            return { allowed: false, reason: 'Impossible de rétrograder de Producteur vers Influenceur' };
        }
    }

    return { allowed: false, reason: 'Transition non autorisée' };
}

/**
 * Change le type de compte d'un utilisateur
 * @param {string} userId - ID utilisateur
 * @param {string} newType - Nouveau type de compte
 * @param {Object} options - Options supplémentaires (verification, etc.)
 * @returns {Promise<Object>} Utilisateur mis à jour
 */
export async function changeAccountType(userId, newType, options = {}) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            subscription: true,
            producerProfile: true,
            influencerProfile: true,
        },
    });

    if (!user) {
        throw new Error('Utilisateur non trouvé');
    }

    // Vérifier si la transition est autorisée
    const canUpgrade = canUpgradeAccountType(user, newType);
    if (!canUpgrade.allowed) {
        throw new Error(canUpgrade.reason);
    }

    const currentRoles = parseRoles(user.roles);
    let newRoles = [...currentRoles];

    // Retirer ancien rôle de compte si upgrade
    const accountRoles = Object.values(ACCOUNT_TYPES);
    newRoles = newRoles.filter(role => !accountRoles.includes(role));

    // Ajouter nouveau rôle
    if (!newRoles.includes(newType)) {
        newRoles.push(newType);
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            roles: stringifyRoles(newRoles),
        },
    });

    // Créer le profil associé si nécessaire
    if (newType === ACCOUNT_TYPES.PRODUCER && !user.producerProfile) {
        await prisma.producerProfile.create({
            data: {
                userId: userId,
                companyName: options.companyName || null,
                country: user.country || null,
                isVerified: false,
            },
        });
    }

    if (ACCOUNT_TYPES.INFLUENCEUR === newType && !user.influencerProfile) {
        await prisma.influencerProfile.create({
            data: {
                userId: userId,
                brandName: options.brandName || user.username,
                isVerified: false,
            },
        });
    }

    // Logger l'action
    await prisma.auditLog.create({
        data: {
            userId: userId,
            action: 'account.type.change',
            entityType: 'user',
            entityId: userId,
            metadata: JSON.stringify({
                from: getUserAccountType(user),
                to: newType,
                options,
            }),
        },
    });

    return updatedUser;
}

/**
 * Récupère les informations complètes du compte
 * @param {string} userId - ID utilisateur
 * @returns {Promise<Object>}
 */
export async function getAccountInfo(userId) {
    // Fetch user with try/catch for relations that might not exist
    let user;
    try {
        user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: true,
                producerProfile: true,
                influencerProfile: true,
            },
        });
    } catch (error) {
        // Fallback to basic query without includes if relations fail
        user = await prisma.user.findUnique({
            where: { id: userId },
        });
    }

    if (!user) {
        throw new Error('Utilisateur non trouvé');
    }

    const accountType = getUserAccountType(user);
    const roles = parseRoles(user.roles);

    return {
        userId: user.id,
        username: user.username,
        email: user.email,
        accountType,
        roles,
        subscription: user.subscription ? {
            plan: user.subscription.plan,
            status: user.subscription.status,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
        } : null,
        producerProfile: user.producerProfile ? {
            companyName: user.producerProfile.companyName,
            isVerified: user.producerProfile.isVerified,
            verifiedAt: user.producerProfile.verifiedAt,
        } : null,
        influencerProfile: user.influencerProfile ? {
            brandName: user.influencerProfile.brandName,
            isVerified: user.influencerProfile.isVerified,
            followerCount: user.influencerProfile.followerCount,
        } : null,
        legalStatus: {
            legalAge: user.legalAge,
            consentRDR: user.consentRDR,
            country: user.country,
        },
    };
}

/**
 * Initie le processus de vérification pour un producteur
 * @param {string} userId - ID utilisateur
 * @param {Object} verificationData - Documents et infos de vérification
 * @returns {Promise<Object>}
 */
export async function requestProducerVerification(userId, verificationData) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { producerProfile: true },
    });

    if (!user) {
        throw new Error('Utilisateur non trouvé');
    }

    if (!user.producerProfile) {
        throw new Error('Profil producteur non trouvé. Créez d\'abord un compte producteur.');
    }

    if (user.producerProfile.isVerified) {
        throw new Error('Votre compte est déjà vérifié');
    }

    // Mettre à jour le profil avec les infos de vérification
    const updatedProfile = await prisma.producerProfile.update({
        where: { id: user.producerProfile.id },
        data: {
            companyName: verificationData.companyName,
            siret: verificationData.siret || null,
            ein: verificationData.ein || null,
            country: verificationData.country,
            verificationDoc: verificationData.documentUrl || null,
        },
    });

    // Logger la demande
    await prisma.auditLog.create({
        data: {
            userId: userId,
            action: 'producer.verification.requested',
            entityType: 'producerProfile',
            entityId: user.producerProfile.id,
            metadata: JSON.stringify({
                companyName: verificationData.companyName,
                country: verificationData.country,
            }),
        },
    });

    return updatedProfile;
}

export default {
    ACCOUNT_TYPES,
    getUserAccountType,
    canUpgradeAccountType,
    changeAccountType,
    getAccountInfo,
    requestProducerVerification,
};
