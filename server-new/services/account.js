/**
 * Service de gestion des types de comptes utilisateurs
 * Gère les transitions entre consumer et producer
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Types de comptes disponibles
 */
export const ACCOUNT_TYPES = {
    CONSUMER: 'consumer',
    INFLUENCER_BASIC: 'influencer_basic',
    INFLUENCER_PRO: 'influencer_pro',
    PRODUCER: 'producer',
    MERCHANT: 'merchant',
};

/**
 * Parse les rôles depuis le champ JSON
 * @param {string} rolesJson - Champ User.roles
 * @returns {Array<string>}
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
    const roles = parseRoles(user.roles);

    // Ordre de priorité décroissant
    if (roles.includes('merchant')) return ACCOUNT_TYPES.MERCHANT;
    if (roles.includes('producer')) return ACCOUNT_TYPES.PRODUCER;
    if (roles.includes('influencer_pro')) return ACCOUNT_TYPES.INFLUENCER_PRO;
    if (roles.includes('influencer_basic')) return ACCOUNT_TYPES.INFLUENCER_BASIC;

    return ACCOUNT_TYPES.CONSUMER;
}

/**
 * Vérifie si un utilisateur peut upgrader vers un type de compte
 * @param {Object} user - Utilisateur Prisma
 * @param {string} targetType - Type cible
 * @returns {Object} { allowed: boolean, reason?: string }
 */
export function canUpgradeAccountType(user, targetType) {
    const currentType = getUserAccountType(user);
    const roles = parseRoles(user.roles);

    // Consumer peut tout devenir
    if (currentType === ACCOUNT_TYPES.CONSUMER) {
        return { allowed: true };
    }

    // Influencer basic peut devenir pro
    if (currentType === ACCOUNT_TYPES.INFLUENCER_BASIC && targetType === ACCOUNT_TYPES.INFLUENCER_PRO) {
        return { allowed: true };
    }

    // Producer/Merchant ne peuvent pas downgrade
    if ([ACCOUNT_TYPES.PRODUCER, ACCOUNT_TYPES.MERCHANT].includes(currentType)) {
        return {
            allowed: false,
            reason: 'Les comptes professionnels ne peuvent pas changer de type. Contactez le support.'
        };
    }

    // On ne peut pas avoir influencer + producer en même temps (conflit)
    if (roles.includes('influencer_basic') || roles.includes('influencer_pro')) {
        if (targetType === ACCOUNT_TYPES.PRODUCER || targetType === ACCOUNT_TYPES.MERCHANT) {
            return {
                allowed: false,
                reason: 'Vous devez d\'abord annuler votre abonnement influenceur pour devenir producteur'
            };
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

    if ([ACCOUNT_TYPES.INFLUENCER_BASIC, ACCOUNT_TYPES.INFLUENCER_PRO].includes(newType) && !user.influencerProfile) {
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
