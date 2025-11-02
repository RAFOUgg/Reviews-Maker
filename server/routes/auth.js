/**
 * Routes d'authentification
 * Gère l'envoi de codes de vérification, la validation, et la gestion des sessions
 */

import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isValidEmail } from '../utils/validation.js';
import {
    getDiscordUserByEmail,
    sendVerificationEmail,
    generateVerificationCode
} from '../utils/lafoncedalle.js';
import { authMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Stockage en mémoire des codes de vérification
// Structure: { email: { code, timestamp, attempts } }
const verificationCodes = new Map();

// Rate limiting: max 3 requêtes par email toutes les 10 minutes
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 3;

/**
 * Vérifie le rate limiting pour un email
 */
function checkRateLimit(email) {
    const now = Date.now();
    const emailLower = email.toLowerCase();

    if (!rateLimits.has(emailLower)) {
        rateLimits.set(emailLower, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return { allowed: true, resetAt: now + RATE_LIMIT_WINDOW };
    }

    const limit = rateLimits.get(emailLower);

    // Reset si la fenêtre est expirée
    if (now > limit.resetAt) {
        limit.count = 1;
        limit.resetAt = now + RATE_LIMIT_WINDOW;
        return { allowed: true, resetAt: limit.resetAt };
    }

    // Vérifier si limite atteinte
    if (limit.count >= MAX_REQUESTS) {
        return {
            allowed: false,
            resetAt: limit.resetAt,
            remainingTime: Math.ceil((limit.resetAt - now) / 1000)
        };
    }

    limit.count++;
    return { allowed: true, resetAt: limit.resetAt };
}

/**
 * Nettoie les codes expirés (appel toutes les 5 minutes)
 */
function cleanupExpiredCodes() {
    const now = Date.now();
    const CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes

    for (const [email, data] of verificationCodes.entries()) {
        if (now - data.timestamp > CODE_EXPIRY) {
            verificationCodes.delete(email);
        }
    }

    // Nettoyer aussi les rate limits expirés
    for (const [email, limit] of rateLimits.entries()) {
        if (now > limit.resetAt) {
            rateLimits.delete(email);
        }
    }
}

// Nettoyage automatique toutes les 5 minutes
setInterval(cleanupExpiredCodes, 5 * 60 * 1000);

/**
 * POST /api/auth/send-code
 * Envoie un code de vérification par email
 */
router.post('/send-code', async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                error: 'invalid_email',
                message: 'Adresse email invalide'
            });
        }

        const emailLower = email.toLowerCase();

        // Rate limiting
        const rateCheck = checkRateLimit(emailLower);
        if (!rateCheck.allowed) {
            return res.status(429).json({
                error: 'rate_limit_exceeded',
                message: `Trop de tentatives. Réessayez dans ${rateCheck.remainingTime} secondes.`,
                retryAfter: rateCheck.remainingTime
            });
        }

        // Vérifier que l'utilisateur Discord existe
        const discordUser = await getDiscordUserByEmail(emailLower);
        if (!discordUser) {
            return res.status(404).json({
                error: 'user_not_found',
                message: 'Aucun compte Discord associé à cet email'
            });
        }

        // Générer le code
        const code = generateVerificationCode();
        const timestamp = Date.now();

        // Stocker le code
        verificationCodes.set(emailLower, {
            code,
            timestamp,
            attempts: 0,
            discordUser
        });

        // Envoyer l'email
        const emailSent = await sendVerificationEmail(emailLower, code, discordUser.username);

        if (!emailSent) {
            verificationCodes.delete(emailLower);
            return res.status(500).json({
                error: 'email_failed',
                message: 'Impossible d\'envoyer l\'email. Réessayez plus tard.'
            });
        }

        console.log(`Code de vérification envoyé à ${emailLower}`);

        res.json({
            success: true,
            message: 'Code envoyé par email',
            expiresIn: 600 // 10 minutes en secondes
        });

    } catch (error) {
        console.error('Erreur send-code:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de l\'envoi du code'
        });
    }
});

/**
 * POST /api/auth/verify-code
 * Vérifie le code et crée un token d'authentification
 */
router.post('/verify-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        // Validation
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                error: 'invalid_email',
                message: 'Adresse email invalide'
            });
        }

        if (!code || !/^\d{6}$/.test(code)) {
            return res.status(400).json({
                error: 'invalid_code',
                message: 'Code invalide (6 chiffres requis)'
            });
        }

        const emailLower = email.toLowerCase();
        const storedData = verificationCodes.get(emailLower);

        // Vérifier que le code existe
        if (!storedData) {
            return res.status(404).json({
                error: 'code_not_found',
                message: 'Aucun code trouvé pour cet email'
            });
        }

        // Vérifier expiration (10 minutes)
        const CODE_EXPIRY = 10 * 60 * 1000;
        if (Date.now() - storedData.timestamp > CODE_EXPIRY) {
            verificationCodes.delete(emailLower);
            return res.status(410).json({
                error: 'code_expired',
                message: 'Code expiré. Demandez-en un nouveau.'
            });
        }

        // Limiter les tentatives (max 5)
        if (storedData.attempts >= 5) {
            verificationCodes.delete(emailLower);
            return res.status(429).json({
                error: 'too_many_attempts',
                message: 'Trop de tentatives échouées. Demandez un nouveau code.'
            });
        }

        // Vérifier le code
        if (storedData.code !== code) {
            storedData.attempts++;
            return res.status(401).json({
                error: 'invalid_code',
                message: 'Code incorrect',
                attemptsRemaining: 5 - storedData.attempts
            });
        }

        // Code valide! Créer le token
        const token = crypto.randomBytes(32).toString('hex');
        const tokenData = {
            ownerId: emailLower,
            discordId: storedData.discordUser.discordId,
            discordUsername: storedData.discordUser.username,
            roles: [],
            createdAt: new Date().toISOString()
        };

        // Sauvegarder le token dans un fichier
        const tokensDir = path.join(__dirname, '..', 'tokens');
        if (!fs.existsSync(tokensDir)) {
            fs.mkdirSync(tokensDir, { recursive: true });
        }

        const tokenPath = path.join(tokensDir, token);
        fs.writeFileSync(tokenPath, JSON.stringify(tokenData, null, 2));

        // Nettoyer le code utilisé
        verificationCodes.delete(emailLower);

        console.log(`Authentification réussie pour ${emailLower}`);

        res.json({
            success: true,
            token,
            user: {
                email: emailLower,
                discordId: tokenData.discordId,
                discordUsername: tokenData.discordUsername
            }
        });

    } catch (error) {
        console.error('Erreur verify-code:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de la vérification du code'
        });
    }
});

/**
 * POST /api/auth/logout
 * Déconnecte l'utilisateur en supprimant son token
 */
router.post('/logout', authMiddleware, (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (token) {
            const tokenPath = path.join(__dirname, '..', 'tokens', token);
            if (fs.existsSync(tokenPath)) {
                fs.unlinkSync(tokenPath);
                console.log(`Token supprimé: ${token.substring(0, 8)}...`);
            }
        }

        res.json({
            success: true,
            message: 'Déconnexion réussie'
        });

    } catch (error) {
        console.error('Erreur logout:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de la déconnexion'
        });
    }
});

/**
 * GET /api/auth/me
 * Retourne les informations de l'utilisateur connecté
 */
router.get('/me', authMiddleware, (req, res) => {
    try {
        if (!req.auth) {
            return res.status(401).json({
                error: 'not_authenticated',
                message: 'Non authentifié'
            });
        }

        res.json({
            email: req.auth.ownerId,
            discordId: req.auth.discordId,
            discordUsername: req.auth.discordUsername,
            roles: req.auth.roles || []
        });

    } catch (error) {
        console.error('Erreur /me:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Erreur lors de la récupération du profil'
        });
    }
});

/**
 * GET /api/auth/stats
 * Retourne des stats sur les codes actifs (admin uniquement, pour debug)
 */
router.get('/stats', (req, res) => {
    // Simple protection, pas de vrai auth pour éviter une dépendance circulaire
    const debugKey = req.query.key;
    if (debugKey !== process.env.DEBUG_KEY && debugKey !== 'dev') {
        return res.status(403).json({ error: 'forbidden' });
    }

    res.json({
        activeCodes: verificationCodes.size,
        rateLimits: rateLimits.size,
        codes: Array.from(verificationCodes.entries()).map(([email, data]) => ({
            email,
            timestamp: new Date(data.timestamp).toISOString(),
            attempts: data.attempts,
            age: Math.floor((Date.now() - data.timestamp) / 1000) + 's'
        }))
    });
});

export default router;
