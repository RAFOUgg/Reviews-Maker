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
    } catch (error) {
        console.error('Erreur vérification âge:', error);
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

        res.json({
            success: true,
            consentRDR: true,
            consentDate: updatedUser.consentDate,
        });
    } catch (error) {
        console.error('Erreur enregistrement consentement:', error);
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
        console.error('Erreur récupération statut légal:', error);
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

export default router;
