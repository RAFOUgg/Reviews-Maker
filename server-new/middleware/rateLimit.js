import rateLimit from 'express-rate-limit'

/**
 * Limiteurs pour les routes sensibles aux attaques par force brute (login, TOTP, codes de
 * vérification, réinitialisation de mot de passe) — express-rate-limit était installé comme
 * dépendance mais jamais monté sur aucune route.
 */

// Connexion / inscription : peu de tentatives légitimes par IP en 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'too_many_requests', message: 'Trop de tentatives, réessayez dans quelques minutes' },
})

// Codes à 6 chiffres (email verification, TOTP) : fenêtre plus courte mais plafond bas,
// l'espace de recherche est petit donc le débit doit rester limité
export const codeVerifyLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'too_many_requests', message: 'Trop de tentatives, réessayez dans quelques minutes' },
})

// Mot de passe oublié / réinitialisation : abusable pour spammer des emails ou bruteforcer un token
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'too_many_requests', message: 'Trop de tentatives, réessayez plus tard' },
})
