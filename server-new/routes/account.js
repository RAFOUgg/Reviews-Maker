/**
 * Routes pour la gestion des comptes utilisateurs
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/errorHandler.js';
import {
    getUserAccountType,
    changeAccountType,
    getAccountInfo,
    requestProducerVerification,
    ACCOUNT_TYPES,
} from '../services/account.js';
import { isValidSiretFormat, checkSiretExists, computeVatNumber } from '../services/sirene.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const verificationDocDir = join(__dirname, '../../db/producer_verification_docs');
await fs.mkdir(verificationDocDir, { recursive: true });

const verificationDocUpload = multer({
    storage: multer.diskStorage({
        destination: async (req, file, cb) => {
            const userDir = join(verificationDocDir, req.user.id.toString());
            await fs.mkdir(userDir, { recursive: true });
            cb(null, userDir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `verification_${Date.now()}${ext}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|pdf/;
        const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
        cb(ok ? null : new Error('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, PDF'), ok);
    },
});

/**
 * GET /api/account/info
 * Récupère les informations complètes du compte utilisateur
 */
router.get('/info', requireAuth, asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    // ✅ DEV MODE: Return mock account info without DB access
    if (process.env.NODE_ENV === 'development') {
        return res.json({
            id: 'dev-test-user-id',
            email: 'test@example.com',
            username: 'DevTestUser',
            tier: 'PRODUCTEUR',
            accountType: 'producer',
            roles: '{"roles":["producteur"]}',
            emailVerified: true,
            legalAge: true,
            birthdate: new Date('1995-01-01'),
            country: 'FR',
            consentRDR: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            accountLimits: {
                reviewsPerMonth: 100,
                exportsPerMonth: 500,
                templateStorage: 50,
            }
        })
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
            type: ACCOUNT_TYPES.INFLUENCER,
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
router.post('/change-type', requireAuth, asyncHandler(async (req, res) => {
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
 * POST /api/account/verify-siret
 * Vérifie le format (Luhn) et l'existence légale d'un SIRET, sans rien persister
 */
router.post('/verify-siret', requireAuth, asyncHandler(async (req, res) => {
    const { siret } = req.body;

    if (!siret) {
        return res.status(400).json({
            error: 'missing_siret',
            message: 'Le SIRET est requis',
        });
    }

    if (!isValidSiretFormat(siret)) {
        return res.json({
            validFormat: false,
            found: null,
            active: null,
            officialName: null,
        });
    }

    const result = await checkSiretExists(siret);

    res.json({
        validFormat: true,
        ...result,
    });
}));

/**
 * POST /api/account/verification-document
 * Upload du document justificatif pour la vérification producteur
 */
router.post('/verification-document', requireAuth, verificationDocUpload.single('document'), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'no_file',
            message: 'Aucun fichier fourni',
        });
    }

    const documentUrl = `/api/account/verification-document/${req.user.id}/${req.file.filename}`;

    const producerProfile = await prisma.producerProfile.findUnique({
        where: { userId: req.user.id },
    });

    if (!producerProfile) {
        await fs.unlink(req.file.path);
        return res.status(400).json({
            error: 'not_producer',
            message: 'Vous devez d\'abord créer un compte producteur',
        });
    }

    await prisma.producerProfile.update({
        where: { userId: req.user.id },
        data: { verificationDoc: documentUrl },
    });

    res.json({ success: true, documentUrl });
}));

/**
 * GET /api/account/verification-document/:userId/:filename
 * Sert le document justificatif uploadé (propriétaire uniquement)
 */
router.get('/verification-document/:userId/:filename', requireAuth, asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.userId) {
        return res.status(403).json({ error: 'forbidden', message: 'Accès refusé' });
    }

    const filePath = join(verificationDocDir, req.params.userId, req.params.filename);

    try {
        await fs.access(filePath);
    } catch {
        return res.status(404).json({ error: 'file_not_found', message: 'Fichier introuvable' });
    }

    res.sendFile(filePath);
}));

/**
 * POST /api/account/request-verification
 * Demande de vérification pour compte producteur
 */
router.post('/request-verification', requireAuth, asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const { companyName, businessType, siret, ein, country, documentUrl } = req.body;

    if (!companyName || !country) {
        return res.status(400).json({
            error: 'missing_fields',
            message: 'Nom de l\'entreprise et pays sont requis',
        });
    }

    try {
        const updatedProfile = await requestProducerVerification(req.user.id, {
            companyName,
            businessType,
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
                businessType: updatedProfile.businessType,
                country: updatedProfile.country,
                verificationStatus: updatedProfile.verificationStatus,
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
router.get('/producer-profile', requireAuth, asyncHandler(async (req, res) => {
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
        businessType: producerProfile.businessType,
        siret: producerProfile.siret,
        ein: producerProfile.ein,
        country: producerProfile.country,
        isVerified: producerProfile.isVerified,
        verifiedAt: producerProfile.verifiedAt,
        verificationStatus: producerProfile.verificationStatus,
        verificationRejectionReason: producerProfile.verificationRejectionReason,
        verificationDoc: producerProfile.verificationDoc,
        sireneSnapshot: producerProfile.sireneSnapshot ? JSON.parse(producerProfile.sireneSnapshot) : null,

        // Mentions légales
        legalForm: producerProfile.legalForm,
        legalFormCode: producerProfile.legalFormCode,
        siren: producerProfile.siren,
        vatNumber: producerProfile.vatNumber,
        nafCode: producerProfile.nafCode,
        shareCapital: producerProfile.shareCapital,
        registeredAt: producerProfile.registeredAt,
        addressLine: producerProfile.addressLine,
        postalCode: producerProfile.postalCode,
        city: producerProfile.city,
        rcsCity: producerProfile.rcsCity,
        legalRepresentative: producerProfile.legalRepresentative,
        licenseNumber: producerProfile.licenseNumber,
    });
}));

// Champs du dossier légal modifiables par le titulaire. Liste blanche explicite : ni les statuts
// de vérification ni le SIRET ne s'éditent ici (le SIRET passe par /verify-siret, qui contrôle sa
// validité et interroge l'INSEE ; les statuts sont décidés par l'administration).
const EDITABLE_LEGAL_FIELDS = [
    'companyName', 'businessType', 'legalForm', 'legalFormCode', 'siren', 'vatNumber',
    'nafCode', 'shareCapital', 'addressLine', 'postalCode', 'city', 'country',
    'rcsCity', 'legalRepresentative', 'licenseNumber',
];

/**
 * PUT /api/account/producer-profile/legal
 * Enregistre les mentions légales de l'entreprise.
 *
 * Réservé au titulaire du ProducerProfile : un employé, même administrateur, n'engage pas
 * juridiquement la société.
 */
router.put('/producer-profile/legal', requireAuth, asyncHandler(async (req, res) => {
    const profile = await prisma.producerProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
        return res.status(404).json({
            error: 'not_found',
            message: 'Aucune entreprise associée à votre compte',
        });
    }

    const data = {};
    for (const field of EDITABLE_LEGAL_FIELDS) {
        if (!(field in req.body)) continue;
        const value = req.body[field];
        // Une chaîne vide vaut « non renseigné » : on stocke null plutôt que du vide, sauf pour
        // les deux champs obligatoires du modèle.
        if (typeof value === 'string') {
            const trimmed = value.trim();
            data[field] = trimmed === '' ? (['companyName', 'country'].includes(field) ? profile[field] : null) : trimmed;
        } else if (value === null) {
            data[field] = null;
        }
    }

    // Le SIRET est accepté ici pour que l'onglet Entreprise se suffise à lui-même, mais son format
    // est contrôlé (14 chiffres + Luhn) — un SIRET fantaisiste ne doit pas entrer en base. SIREN et
    // TVA en sont déduits : les laisser saisir à la main serait une source d'incohérence.
    if (req.body.siret !== undefined) {
        const raw = String(req.body.siret || '').replace(/\s/g, '');
        if (raw === '') {
            data.siret = null;
        } else if (!isValidSiretFormat(raw)) {
            return res.status(400).json({
                error: 'invalid_siret',
                message: 'SIRET invalide : 14 chiffres attendus, et la clé de contrôle ne correspond pas.',
            });
        } else {
            data.siret = raw;
            data.siren = raw.slice(0, 9);
            data.vatNumber = computeVatNumber(raw.slice(0, 9));
        }
    }

    if (req.body.registeredAt !== undefined) {
        const parsed = req.body.registeredAt ? new Date(req.body.registeredAt) : null;
        data.registeredAt = parsed && !isNaN(parsed.getTime()) ? parsed : null;
    }

    const updated = await prisma.producerProfile.update({ where: { id: profile.id }, data });

    res.json({ success: true, profile: updated });
}));

/**
 * GET /api/account/influencer-profile
 * Récupère le profil influenceur
 */
router.get('/influencer-profile', requireAuth, asyncHandler(async (req, res) => {
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
router.patch('/influencer-profile', requireAuth, asyncHandler(async (req, res) => {
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
router.put('/update', requireAuth, asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentification requise',
        });
    }

    const {
        username, email, theme, locale,
        // Champs profil personnel
        firstName, lastName, country, bio, website, publicProfile,
        // Champs entreprise (Producteur/Influenceur)
        companyName, businessType, siret, billingAddress, vatNumber
    } = req.body;

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

    // Champs profil personnel (nouveaux champs)
    if (firstName !== undefined) updates.firstName = firstName?.trim() || null;
    if (lastName !== undefined) updates.lastName = lastName?.trim() || null;
    if (country !== undefined) updates.country = country?.trim() || null;
    if (bio !== undefined) updates.bio = bio?.trim()?.substring(0, 500) || null; // Max 500 chars
    if (website !== undefined) updates.website = website?.trim() || null;
    if (publicProfile !== undefined) updates.publicProfile = Boolean(publicProfile);

    const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updates,
    });

    // === Gestion des données entreprise (ProducerProfile) ===
    let producerProfile = null;
    const userAccountType = getUserAccountType(updatedUser);

    if ((companyName || businessType || siret || billingAddress || vatNumber) &&
        (userAccountType === 'producer' || userAccountType === 'influencer')) {
        // Rechercher ou créer le ProducerProfile
        producerProfile = await prisma.producerProfile.upsert({
            where: { userId: req.user.id },
            create: {
                userId: req.user.id,
                companyName: companyName?.trim() || '',
                businessType: businessType || 'farm',
                siret: siret?.trim() || null,
                country: country?.trim() || 'FR',
            },
            update: {
                companyName: companyName?.trim() || undefined,
                businessType: businessType || undefined,
                siret: siret?.trim() || undefined,
            }
        });
    }

    res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        theme: updatedUser.theme,
        locale: updatedUser.locale,
        accountType: userAccountType,
        legalAge: updatedUser.legalAge,
        consentRDR: updatedUser.consentRDR,
        createdAt: updatedUser.createdAt,
        // Nouveaux champs
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        country: updatedUser.country,
        bio: updatedUser.bio,
        website: updatedUser.website,
        publicProfile: updatedUser.publicProfile,
        // Données entreprise
        companyName: producerProfile?.companyName || null,
        businessType: producerProfile?.businessType || null,
        siret: producerProfile?.siret || null,
        billingAddress: billingAddress || null, // Stocké côté client pour l'instant
        vatNumber: vatNumber || null, // Stocké côté client pour l'instant
    });
}));

/**
 * GET /api/account/profile
 * Récupère le profil complet de l'utilisateur (alias pour /info)
 */
router.get('/profile', requireAuth, asyncHandler(async (req, res) => {
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
router.get('/multiple', requireAuth, asyncHandler(async (req, res) => {
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
router.patch('/language', requireAuth, asyncHandler(async (req, res) => {
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


