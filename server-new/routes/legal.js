/**
 * Routes légales pour la conformité RDR
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import {
    calculateLegalAge,
    getMinimumAge,
    isCountryAllowed,
    LEGAL_COUNTRIES,
    US_LEGAL_STATES_21,
    CA_PROVINCES_19,
} from '../config/legal.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/legal/verify-age
 * Vérifie et enregistre la date de naissance + pays
 */
router.post('/verify-age', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'unauthorized',
                message: 'Authentification requise',
            });
        }

        const { birthdate, country, region } = req.body;

        if (!birthdate || !country) {
            return res.status(400).json({
                error: 'missing_fields',
                message: 'Date de naissance et pays requis',
            });
        }

        // Vérifier que le pays est autorisé
        if (!isCountryAllowed(country)) {
            return res.status(403).json({
                error: 'country_not_allowed',
                message: 'Ce pays ne permet pas l\'accès à la plateforme',
            });
        }

        // Normaliser la date de naissance (accepte ISO ou timestamp) et éviter les dates invalides
        const parsedBirthdate = (() => {
            const candidate = typeof birthdate === 'number' ? new Date(birthdate) : new Date(birthdate);
            if (Number.isNaN(candidate.getTime())) return null;
            // Forcer à minuit UTC pour éviter les décalages de fuseau lors du stockage
            return new Date(Date.UTC(candidate.getUTCFullYear(), candidate.getUTCMonth(), candidate.getUTCDate()));
        })();

        if (!parsedBirthdate) {
            return res.status(400).json({
                error: 'invalid_birthdate',
                message: 'Date de naissance invalide',
            });
        }

        // Calculer si l'utilisateur a l'âge légal
        const hasLegalAge = calculateLegalAge(parsedBirthdate, country, region);
        const minimumAge = getMinimumAge(country, region);

        if (!hasLegalAge) {
            return res.status(403).json({
                error: 'underage',
                message: `Vous devez avoir au moins ${minimumAge} ans pour accéder à cette plateforme`,
                minimumAge,
            });
        }

        // Mettre à jour l'utilisateur
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                birthdate: parsedBirthdate,
                country,
                region: region || null,
                legalAge: true,
            },
        });

        // Mettre à jour la session Passport pour que req.user reflète le changement
        if (typeof req.logIn === 'function') {
            req.logIn(updatedUser, (err) => {
                if (err) {
                    return res.status(500).json({
                        error: 'session_update_failed',
                        message: 'Impossible de mettre à jour la session',
                    });
                }

                return res.json({
                    success: true,
                    legalAge: true,
                    minimumAge,
                    user: {
                        id: updatedUser.id,
                        birthdate: updatedUser.birthdate,
                        country: updatedUser.country,
                        region: updatedUser.region,
                        legalAge: updatedUser.legalAge,
                    },
                });
            });
        } else {
            res.json({
                success: true,
                legalAge: true,
                minimumAge,
                user: {
                    id: updatedUser.id,
                    birthdate: updatedUser.birthdate,
                    country: updatedUser.country,
                    region: updatedUser.region,
                    legalAge: updatedUser.legalAge,
                },
            });
        }
    } catch (error) {
        res.status(500).json({
            error: 'internal_error',
            message: 'Erreur lors de la vérification de l\'âge',
        });
    }
});

/**
 * POST /api/legal/accept-consent
 * Enregistre le consentement RDR
 */
router.post('/accept-consent', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'unauthorized',
                message: 'Authentification requise',
            });
        }

        const { consent } = req.body;

        if (!consent) {
            return res.status(400).json({
                error: 'consent_required',
                message: 'Vous devez accepter les conditions de réduction des risques',
            });
        }

        // Vérifier que l'utilisateur a l'âge légal avant d'accepter le consentement
        if (!req.user.legalAge) {
            return res.status(403).json({
                error: 'age_verification_required',
                message: 'Veuillez d\'abord vérifier votre âge',
            });
        }

        // Mettre à jour le consentement
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                consentRDR: true,
                consentDate: new Date(),
            },
        });

        if (typeof req.logIn === 'function') {
            req.logIn(updatedUser, (err) => {
                if (err) {
                    return res.status(500).json({
                        error: 'session_update_failed',
                        message: 'Impossible de mettre à jour la session',
                    });
                }

                return res.json({
                    success: true,
                    consentRDR: true,
                    consentDate: updatedUser.consentDate,
                });
            });
        } else {
            res.json({
                success: true,
                consentRDR: true,
                consentDate: updatedUser.consentDate,
            });
        }
    } catch (error) {
        res.status(500).json({
            error: 'internal_error',
            message: 'Erreur lors de l\'enregistrement du consentement',
        });
    }
});

/**
 * GET /api/legal/status
 * Récupère le statut légal de l'utilisateur connecté
 */
router.get('/status', async (req, res) => {
    try {
        // ✅ DEV MODE: Return mock legal status without DB
        if (process.env.NODE_ENV === 'development') {
            return res.json({
                birthdate: null,
                country: null,
                region: null,
                legalAge: true,
                consentRDR: true,
                consentDate: new Date().toISOString(),
                minimumAge: null,
                isCompliant: true,
            })
        }

        if (!req.user) {
            return res.status(401).json({
                error: 'unauthorized',
                message: 'Authentification requise',
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                birthdate: true,
                country: true,
                region: true,
                legalAge: true,
                consentRDR: true,
                consentDate: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                error: 'user_not_found',
                message: 'Utilisateur non trouvé',
            });
        }

        // Calculer l'âge minimum requis si pays défini
        let minimumAge = null;
        if (user.country) {
            minimumAge = getMinimumAge(user.country, user.region);
        }

        res.json({
            birthdate: user.birthdate,
            country: user.country,
            region: user.region,
            legalAge: user.legalAge,
            consentRDR: user.consentRDR,
            consentDate: user.consentDate,
            minimumAge,
            isCompliant: user.legalAge && user.consentRDR,
        });
    } catch (error) {
        res.status(500).json({
            error: 'internal_error',
            message: 'Erreur lors de la récupération du statut',
        });
    }
});

/**
 * GET /api/legal/countries
 * Liste des pays autorisés avec âge minimum
 */
router.get('/countries', (req, res) => {
    const countries = LEGAL_COUNTRIES.map((code) => {
        const base = {
            code,
            minimumAge: getMinimumAge(code),
        };

        if (code === 'US') {
            base.regions = US_LEGAL_STATES_21.map((stateCode) => ({
                code: stateCode,
                minimumAge: getMinimumAge('US', stateCode),
            }));
        }

        if (code === 'CA') {
            base.regions = CA_PROVINCES_19.map((provinceCode) => ({
                code: provinceCode,
                minimumAge: getMinimumAge('CA', provinceCode),
            }));
        }

        return base;
    });

    res.json({
        countries,
        total: countries.length,
    });
});

/**
 * GET /api/legal/terms
 * Récupère les Conditions Générales d'Utilisation
 */
router.get('/terms', (req, res) => {
    const terms = {
        title: 'Conditions Générales d\'Utilisation',
        language: req.query.lang || 'fr',
        lastUpdated: new Date('2025-12-01'),
        sections: [
            {
                id: 'introduction',
                title: 'Introduction',
                content: 'Bienvenue sur Orchard Studio. Ces Conditions Générales d\'Utilisation (« CGU ») régissent votre accès et votre utilisation de notre plateforme en ligne.'
            },
            {
                id: 'age_restrictions',
                title: 'Exigences d\'Âge et Restrictions Légales',
                content: 'Vous confirmez que vous avez au moins l\'âge légal minimum requis pour consommer du cannabis dans votre juridiction.'
            },
            {
                id: 'authorized_use',
                title: 'Utilisation Autorisée',
                content: 'Vous acceptez d\'utiliser cette plateforme uniquement à des fins légales et de manière responsable.'
            },
            {
                id: 'user_content',
                title: 'Contenu Utilisateur',
                content: 'Tout contenu que vous créez reste votre propriété. En le publiant sur notre plateforme, vous nous accordez une licence pour l\'afficher.'
            },
            {
                id: 'liability',
                title: 'Responsabilité et Exonération',
                content: 'Orchard Studio est fourni « tel quel » sans garantie.'
            }
        ]
    };

    res.json(terms);
});

/**
 * GET /api/legal/privacy
 * Récupère la Politique de Confidentialité
 */
router.get('/privacy', (req, res) => {
    const privacy = {
        title: 'Politique de Confidentialité',
        language: req.query.lang || 'fr',
        lastUpdated: new Date('2025-12-01'),
        sections: [
            {
                id: 'intro',
                title: 'Introduction',
                content: 'Orchard Studio respecte votre vie privée et s\'engage à protéger vos données personnelles.'
            },
            {
                id: 'data_collection',
                title: 'Collecte de Données',
                content: 'Nous collectons uniquement les données nécessaires pour fournir nos services.'
            },
            {
                id: 'data_usage',
                title: 'Utilisation des Données',
                content: 'Vos données ne sont jamais vendues à des tiers et sont utilisées uniquement pour améliorer nos services.'
            },
            {
                id: 'age_verification',
                title: 'Vérification d\'Âge',
                content: 'Les données de vérification d\'âge sont stockées de manière sécurisée et conforme aux réglementations.'
            },
            {
                id: 'rights',
                title: 'Vos Droits',
                content: 'Vous avez le droit d\'accès, de modification et de suppression de vos données personnelles.'
            }
        ]
    };

    res.json(privacy);
});

/**
 * GET /api/legal/notice
 * Récupère les Mentions Légales
 */
router.get('/notice', (req, res) => {
    const notice = {
        title: 'Mentions Légales',
        language: req.query.lang || 'fr',
        lastUpdated: new Date('2025-12-01'),
        company: {
            name: 'Orchard Studio',
            type: 'SARL',
            status: 'En développement',
            email: 'legal@orchardstudio.app'
        },
        sections: [
            {
                id: 'legal_info',
                title: 'Informations Légales',
                content: 'Orchard Studio opère dans le respect des lois applicables.'
            },
            {
                id: 'compliance',
                title: 'Conformité et Responsabilité',
                content: 'Cette plateforme ne facilite pas la vente, l\'achat ou la distribution de cannabis.'
            },
            {
                id: 'data_protection',
                title: 'Protection des Données',
                content: 'En conformité avec le RGPD et les lois sur la protection des données.'
            },
            {
                id: 'user_content_rights',
                title: 'Droits sur le Contenu Utilisateur',
                content: 'Les reviews et contenus générés par les utilisateurs restent leur propriété.'
            }
        ]
    };

    res.json(notice);
});

/**
 * POST /api/legal/consent
 * Enregistre le consentement de l\'utilisateur
 */
router.post('/consent', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'unauthorized',
                message: 'Authentification requise',
            });
        }

        const { terms, privacy, rdr } = req.body;

        // Tous les consentements sont requis
        if (!terms || !privacy || !rdr) {
            return res.status(400).json({
                error: 'incomplete_consent',
                message: 'Vous devez accepter tous les documents légaux',
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                consentRDR: true,
                consentDate: new Date(),
            },
        });

        if (typeof req.logIn === 'function') {
            req.logIn(updatedUser, (err) => {
                if (err) {
                    return res.status(500).json({
                        error: 'session_update_failed',
                        message: 'Impossible de mettre à jour la session',
                    });
                }

                return res.json({
                    success: true,
                    message: 'Consentement enregistré',
                    user: {
                        id: updatedUser.id,
                        consentRDR: updatedUser.consentRDR,
                        consentDate: updatedUser.consentDate,
                    },
                });
            });
        } else {
            res.json({
                success: true,
                message: 'Consentement enregistré',
                user: {
                    id: updatedUser.id,
                    consentRDR: updatedUser.consentRDR,
                    consentDate: updatedUser.consentDate,
                },
            });
        }
    } catch (error) {
        res.status(500).json({
            error: 'internal_error',
            message: 'Erreur lors de l\'enregistrement du consentement',
        });
    }
});

/**
 * GET /api/legal/user-preferences
 * Récupère les préférences pays/langue de l'utilisateur
 */
router.get('/user-preferences', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'unauthorized',
                message: 'Authentification requise',
            });
        }

        res.json({
            country: req.user.country || null,
            language: req.user.preferredLanguage || 'fr',
            legalAge: req.user.legalAge || false,
            consentRDR: req.user.consentRDR || false
        });
    } catch (error) {
        res.status(500).json({
            error: 'internal_error',
            message: 'Erreur lors de la récupération des préférences',
        });
    }
});

/**
 * POST /api/legal/update-preferences
 * Met à jour les préférences pays/langue de l'utilisateur
 */
router.post('/update-preferences', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'unauthorized',
                message: 'Authentification requise',
            });
        }

        const { country, language } = req.body;

        if (!country || !language) {
            return res.status(400).json({
                error: 'missing_fields',
                message: 'Pays et langue requis',
            });
        }

        // Vérifier que le pays est autorisé
        if (!isCountryAllowed(country)) {
            return res.status(403).json({
                error: 'country_not_allowed',
                message: 'Ce pays ne permet pas l\'accès à la plateforme',
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                country,
                preferredLanguage: language
            },
        });

        res.json({
            success: true,
            country: updatedUser.country,
            language: updatedUser.preferredLanguage
        });
    } catch (error) {
        res.status(500).json({
            error: 'internal_error',
            message: 'Erreur lors de la mise à jour des préférences',
        });
    }
});

export default router;
