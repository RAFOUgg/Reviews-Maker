/**
 * Routes pour la gestion des comptes utilisateurs
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/errorHandler.js';
import {
    getUserAccountType,
    changeAccountType,
    getAccountInfo,
    requestProducerVerification,
    ACCOUNT_TYPES,
} from '../services/account.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/account/info
 * Récupère les informations complètes du compte utilisateur
 */
router.get('/info', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const accountInfo = await getAccountInfo(req.user.id);

    res.json(accountInfo);
}));

/**
 * GET /api/account/types
 * Liste tous les types de comptes disponibles avec descriptions
 */
router.get('/types', (req, res) => {
    const types = [
        {
            type: ACCOUNT_TYPES.BETA_TESTER,
            name: 'Beta testeur',
            description: 'Accès complet à toutes les fonctionnalités pendant la bêta',
            price: 0,
            features: [
                'Toutes les fonctionnalités activées',
                'Exports HD et 4K',
                'Galeries publiques et privées',
                'Support prioritaire pendant la bêta',
            ],
            requiresSubscription: false,
            disabled: false,
        },
        {
            type: ACCOUNT_TYPES.CONSUMER,
            name: 'Consommateur',
            description: 'Créez et gérez vos reviews personnelles (bientôt disponible)',
            price: 0,
            features: [
                'Sections essentielles',
                'Templates prédéfinis',
                'Export PNG/JPEG/PDF 150dpi',
                '20 reviews privées max',
                '5 reviews publiques max',
                '3 exports/jour',
            ],
            requiresSubscription: false,
            disabled: true,
        },
        {
            type: ACCOUNT_TYPES.INFLUENCEUR,
            name: 'Influenceur',
            description: 'Exports haute qualité et branding personnel',
            price: 15.99,
            features: [
                'Toutes sections de base',
                'Export GIF pour PipeLines',
                'Export HD 300dpi (PNG/JPEG/SVG/PDF)',
                'Drag & drop configuration',
                'Filigrane personnalisé',
                'Templates avancés (20 max)',
                'Statistiques avancées',
                'Bibliothèque illimitée',
            ],
            requiresSubscription: true,
            disabled: false,
        },
        {
            type: ACCOUNT_TYPES.PRODUCER,
            name: 'Producteur',
            description: 'Pour les producteurs de cannabis (bientôt disponible)',
            price: null,
            features: [
                'Profil entreprise vérifié',
                'Dashboard analytics avancé',
                'Gestion équipe (5 membres)',
                'White-label exports',
                'Support dédié',
            ],
            requiresSubscription: false,
            requiresVerification: true,
            disabled: true,
        },
    ];

    res.json({ types });
});

/**
 * POST /api/account/change-type
 * Change le type de compte de l'utilisateur
 */
router.post('/change-type', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const { newType, options } = req.body;

    if (!newType) {
        return res.status(400).json({
            error: 'missing_type',
            message: 'Le type de compte est requis',
        });
    }

    if (!Object.values(ACCOUNT_TYPES).includes(newType)) {
        return res.status(400).json({
            error: 'invalid_type',
            message: 'Type de compte invalide',
            validTypes: Object.values(ACCOUNT_TYPES),
        });
    }

    // Producteur désactivé en MVP (paiement/verification non disponibles)
    if (newType === ACCOUNT_TYPES.PRODUCER) {
        return res.status(403).json({
            error: 'type_not_available',
            message: 'Le compte producteur sera disponible plus tard. Choisissez un autre type.',
        });
    }

    // Vérifier que l'utilisateur a complété sa vérification légale
    if (!req.user.legalAge || !req.user.consentRDR) {
        return res.status(403).json({
            error: 'legal_verification_required',
            message: 'Vous devez d\'abord compléter la vérification d\'âge et le consentement RDR',
        });
    }

    try {
        const updatedUser = await changeAccountType(req.user.id, newType, options || {});

        res.json({
            success: true,
            message: 'Type de compte mis à jour avec succès',
            accountType: getUserAccountType(updatedUser),
        });
    } catch (error) {
        if (error.message.includes('Transition non autorisée') || error.message.includes('annuler votre abonnement')) {
            return res.status(403).json({
                error: 'upgrade_not_allowed',
                message: error.message,
            });
        }

        throw error;
    }
}));

/**
 * POST /api/account/request-verification
 * Demande de vérification pour compte producteur
 */
router.post('/request-verification', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const { companyName, siret, ein, country, documentUrl } = req.body;

    if (!companyName || !country) {
        return res.status(400).json({
            error: 'missing_fields',
            message: 'Nom de l\'entreprise et pays sont requis',
        });
    }

    try {
        const updatedProfile = await requestProducerVerification(req.user.id, {
            companyName,
            siret,
            ein,
            country,
            documentUrl,
        });

        res.json({
            success: true,
            message: 'Demande de vérification envoyée. Nous vous contacterons sous 3-5 jours ouvrés.',
            profile: {
                companyName: updatedProfile.companyName,
                country: updatedProfile.country,
                isVerified: updatedProfile.isVerified,
            },
        });
    } catch (error) {
        if (error.message.includes('Profil producteur non trouvé')) {
            return res.status(400).json({
                error: 'not_producer',
                message: 'Vous devez d\'abord créer un compte producteur',
            });
        }

        if (error.message.includes('déjà vérifié')) {
            return res.status(400).json({
                error: 'already_verified',
                message: 'Votre compte est déjà vérifié',
            });
        }

        throw error;
    }
}));

/**
 * GET /api/account/producer-profile
 * Récupère le profil producteur
 */
router.get('/producer-profile', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const producerProfile = await prisma.producerProfile.findUnique({
        where: { userId: req.user.id },
    });

    if (!producerProfile) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Profil producteur non trouvé',
        });
    }

    res.json({
        companyName: producerProfile.companyName,
        siret: producerProfile.siret,
        ein: producerProfile.ein,
        country: producerProfile.country,
        isVerified: producerProfile.isVerified,
        verifiedAt: producerProfile.verifiedAt,
    });
}));

/**
 * GET /api/account/influencer-profile
 * Récupère le profil influenceur
 */
router.get('/influencer-profile', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const influencerProfile = await prisma.influencerProfile.findUnique({
        where: { userId: req.user.id },
    });

    if (!influencerProfile) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Profil influenceur non trouvé',
        });
    }

    res.json({
        brandName: influencerProfile.brandName,
        brandLogo: influencerProfile.brandLogo,
        brandColors: influencerProfile.brandColors,
        isVerified: influencerProfile.isVerified,
        verifiedAt: influencerProfile.verifiedAt,
        followerCount: influencerProfile.followerCount,
    });
}));

/**
 * PATCH /api/account/influencer-profile
 * Met à jour le profil influenceur (branding Orchard)
 */
router.patch('/influencer-profile', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const { brandName, brandLogo, brandColors } = req.body;

    const influencerProfile = await prisma.influencerProfile.findUnique({
        where: { userId: req.user.id },
    });

    if (!influencerProfile) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Profil influenceur non trouvé. Créez d\'abord un compte influenceur.',
        });
    }

    const updatedProfile = await prisma.influencerProfile.update({
        where: { id: influencerProfile.id },
        data: {
            brandName: brandName || influencerProfile.brandName,
            brandLogo: brandLogo !== undefined ? brandLogo : influencerProfile.brandLogo,
            brandColors: brandColors !== undefined ? brandColors : influencerProfile.brandColors,
        },
    });

    res.json({
        success: true,
        message: 'Profil influenceur mis à jour',
        profile: {
            brandName: updatedProfile.brandName,
            brandLogo: updatedProfile.brandLogo,
            brandColors: updatedProfile.brandColors,
        },
    });
}));

/**
 * PUT /api/account/update
 * Met à jour les informations de profil de l'utilisateur
 */
router.put('/update', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const { username, email, theme, locale } = req.body;

    // Validation basique
    const updates = {};

    if (username && username.trim().length > 0) {
        // Vérifier que le username n'existe pas déjà (sauf l'utilisateur actuel)
        const existing = await prisma.user.findFirst({
            where: {
                username: username.trim(),
                id: { not: req.user.id }
            }
        });

        if (existing) {
            return res.status(400).json({
                error: 'username_taken',
                message: 'Ce nom d\'utilisateur est déjà utilisé',
            });
        }
        updates.username = username.trim();
    }

    if (email && email.trim().length > 0) {
        // Vérifier que l'email n'existe pas déjà
        const existing = await prisma.user.findFirst({
            where: {
                email: email.trim(),
                id: { not: req.user.id }
            }
        });

        if (existing) {
            return res.status(400).json({
                error: 'email_taken',
                message: 'Cet email est déjà utilisé',
            });
        }
        updates.email = email.trim();
        updates.emailVerified = false; // Nécessite re-vérification
    }

    if (email && email.trim().length > 0) {
        // Vérifier que l'email n'existe pas déjà
        const existing = await prisma.user.findFirst({
            where: {
                email: email.trim(),
                id: { not: req.user.id }
            }
        });

        if (existing) {
            return res.status(400).json({
                error: 'email_taken',
                message: 'Cet email est déjà utilisé',
            });
        }
        updates.email = email.trim();
        updates.emailVerified = false; // Nécessite re-vérification
    }

    // === FIX: Handle Account Type Update ===
    const { accountType } = req.body;
    if (accountType) {
        // Map frontend accountType to backend roles/subscription
        if (accountType === 'producer') {
            updates.subscriptionType = 'producer';
            updates.roles = JSON.stringify({ roles: ['producer', 'consumer'] });
        } else if (accountType === 'influencer') {
            updates.subscriptionType = 'influencer';
            updates.roles = JSON.stringify({ roles: ['influencer', 'consumer'] });
        } else if (accountType === 'consumer') {
             updates.subscriptionType = null;
             updates.roles = JSON.stringify({ roles: ['consumer'] });
        }
    }

    if (theme) {

        const validThemes = ['violet-lean', 'emerald', 'tahiti', 'sakura', 'dark'];
        if (validThemes.includes(theme)) {
            updates.theme = theme;
        }
    }

    if (locale) {
        const validLocales = ['fr', 'en', 'es', 'de'];
        if (validLocales.includes(locale)) {
            updates.locale = locale;
        }
    }

    const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updates,
    });

    res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        theme: updatedUser.theme,
        locale: updatedUser.locale,
        accountType: getUserAccountType(updatedUser),
        legalAge: updatedUser.legalAge,
        consentRDR: updatedUser.consentRDR,
        createdAt: updatedUser.createdAt,
    });
}));

/**
 * GET /api/account/profile
 * Récupère le profil complet de l'utilisateur (alias pour /info)
 */
router.get('/profile', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const accountInfo = await getAccountInfo(req.user.id);
    res.json(accountInfo);
}));

/**
 * GET /api/account/multiple
 * Récupère la liste des comptes multicompte de l'utilisateur (future feature)
 */
router.get('/multiple', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    // Pour maintenant, retourner le compte actuel
    // À l'avenir, on pourra supporter plusieurs comptes
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            roles: true,
            createdAt: true,
        }
    });

    res.json({
        accounts: [user],
        current: user.id,
    });
}));

/**
 * PATCH /api/account/language
 * Met à jour la langue préférée de l'utilisateur
 */
router.patch('/language', asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const { locale } = req.body;

    // Validate locale
    const validLocales = ['fr', 'en', 'de', 'es'];
    if (!locale || !validLocales.includes(locale)) {
        return res.status(400).json({
            error: 'invalid_locale',
            message: 'Langue invalide. Langues supportées : fr, en, de, es',
            validLocales,
        });
    }

    // Update user locale
    const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { locale },
        select: {
            id: true,
            username: true,
            locale: true,
        },
    });

    res.json({
        success: true,
        message: 'Langue mise à jour avec succès',
        locale: updatedUser.locale,
    });
}));

export default router;


