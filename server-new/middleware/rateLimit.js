import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

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

/**
 * Écritures hors routes d'authentification (lot L22) : commentaires, likes, uploads, code de lot.
 * Ces routes n'avaient aucun plafond — un compte (ou un script anonyme, sur les routes qui ne
 * répondent 401 qu'après coup) pouvait inonder la base ou le disque.
 *
 * Clé : l'utilisateur quand il est connu (un même compte derrière plusieurs IP reste plafonné, et
 * plusieurs comptes derrière une même IP — NAT, bureau — ne se gênent pas), sinon l'IP via
 * `ipKeyGenerator` (regroupe un /56 IPv6, sans quoi chaque adresse d'un même hôte aurait son compteur).
 * `trust proxy` = 1 (server.js) : derrière nginx, `req.ip` est l'IP du client.
 *
 * À monter APRÈS `requireAuth` (qui pose `req.user`) et AVANT multer (un envoi refusé ne doit pas
 * avoir déjà écrit sur le disque).
 */
const userOrIpKey = (req) => (req.user?.id ? `u:${req.user.id}` : `ip:${ipKeyGenerator(req.ip || '')}`)

function writeLimiter({ windowMs, max, message }) {
    return rateLimit({
        windowMs,
        max,
        keyGenerator: userOrIpKey,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'too_many_requests', message },
    })
}

// Commentaires (création, modification, suppression) : 20 en 10 minutes.
export const commentLimiter = writeLimiter({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: 'Trop de commentaires en peu de temps, réessayez dans quelques minutes',
})

// Likes / dislikes : bascules rapides tolérées (30 par minute), pas un script qui martèle.
export const likeLimiter = writeLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: 'Trop de réactions en peu de temps, réessayez dans une minute',
})

// Envois de fichiers hors création de review (médias de pipeline, avatar, bannière, KYC, filigranes,
// exports de bibliothèque) : 60 en 15 minutes — un pipeline photographié étape par étape y tient.
export const uploadLimiter = writeLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: 'Trop d’envois de fichiers en peu de temps, réessayez dans quelques minutes',
})

// Code de lot (POST /api/reviews/:id/share-code) : idempotent, donc un usage légitime ne l'appelle
// qu'une fois par review ; 20 en 15 minutes suffit largement.
export const shareCodeLimiter = writeLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Trop de demandes de code de lot, réessayez dans quelques minutes',
})
