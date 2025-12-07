import express from 'express'
import passport from 'passport'
import { asyncHandler, Errors } from '../utils/errorHandler.js'

const router = express.Router()

// GET /api/auth/discord - Initier l'authentification Discord
router.get('/discord', (req, res, next) => {
    console.log(`[AUTH-DBG] Start discord route - method: ${req.method} originalUrl: ${req.originalUrl} path: ${req.path} ip: ${req.ip}`)
    // Also log any X-Forwarded headers to inspect proxy behavior
    console.log(`[AUTH-DBG] Headers: Host=${req.headers.host} X-Forwarded-For=${req.headers['x-forwarded-for']} X-Forwarded-Proto=${req.headers['x-forwarded-proto']}`)
    return passport.authenticate('discord')(req, res, next)
})

// GET /api/auth/ping - Debug route to validate proxy path and headers
router.get('/ping', (req, res) => {
    const headers = {
        'host': req.headers.host,
        'x-forwarded-for': req.headers['x-forwarded-for'] || null,
        'x-forwarded-proto': req.headers['x-forwarded-proto'] || null,
        'x-original-uri': req.headers['x-original-uri'] || null
    }

    res.json({
        ok: true,
        method: req.method,
        originalUrl: req.originalUrl,
        path: req.path,
        headers
    })
})

// GET /api/auth/debug-session - Debug helper to inspect session and authentication info
// Only enabled in non-production to avoid exposing session internals
router.get('/debug-session', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'not_found' })
    }
    res.json({
        sessionId: req.sessionID || null,
        isAuthenticated: typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false,
        user: req.user ? { id: req.user.id, username: req.user.username, discordId: req.user.discordId } : null,
        headers: {
            host: req.headers.host,
            xForwardedProto: req.headers['x-forwarded-proto'] || null,
            xForwardedFor: req.headers['x-forwarded-for'] || null,
            xOriginalUri: req.headers['x-original-uri'] || null
        }
    })
})

// GET /api/auth/discord/callback - Callback après autorisation Discord
router.get('/discord/callback', (req, res, next) => {
    console.log(`[AUTH-DBG] Discord callback received - method: ${req.method} originalUrl: ${req.originalUrl} path: ${req.path} ip: ${req.ip} X-Original-Uri: ${req.headers['x-original-uri']}`)
    console.log(`[AUTH-DBG] Headers: Host=${req.headers.host} X-Forwarded-For=${req.headers['x-forwarded-for']} X-Forwarded-Proto=${req.headers['x-forwarded-proto']}`)
    console.log(`[AUTH-DBG] Headers: Host=${req.headers.host} X-Forwarded-For=${req.headers['x-forwarded-for']} X-Forwarded-Proto=${req.headers['x-forwarded-proto']}`)
    return passport.authenticate('discord', {
        failureRedirect: process.env.FRONTEND_URL
    })(req, res, (err) => {
        if (err) {
            console.error('[AUTH] Error during Discord callback:', err)
            return next(err)
        }
        // Succès : rediriger vers le frontend
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`)
    })
})

// GET /api/auth/me - Récupérer l'utilisateur actuel
router.get('/me', asyncHandler(async (req, res) => {
    if (typeof req.isAuthenticated !== 'function' || !req.isAuthenticated()) {
        throw Errors.UNAUTHORIZED()
    }

    // Formater les données utilisateur
    const user = {
        id: req.user.id,
        discordId: req.user.discordId,
        username: req.user.username,
        discriminator: req.user.discriminator,
        avatar: req.user.avatar
            ? `https://cdn.discordapp.com/avatars/${req.user.discordId}/${req.user.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(req.user.discriminator || '0') % 5}.png`,
        email: req.user.email
    }

    res.json(user)
}))

// POST /api/auth/logout - Déconnexion
router.post('/logout', asyncHandler(async (req, res) => {
    if (typeof req.isAuthenticated !== 'function' || !req.isAuthenticated()) {
        throw Errors.UNAUTHORIZED()
    }

    // Promisify logout and session destroy
    await new Promise((resolve, reject) => {
        req.logout((err) => {
            if (err) return reject(err)
            resolve()
        })
    })

    await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
            if (err) return reject(err)
            resolve()
        })
    })

    res.clearCookie('sessionId')
    res.json({ message: 'Logged out successfully' })
}))

// =============================================================================
// Google OAuth Routes
// =============================================================================

// GET /api/auth/google - Initier l'authentification Google
router.get('/google', (req, res, next) => {
    console.log(`[AUTH-DBG] Start google route - method: ${req.method} originalUrl: ${req.originalUrl}`)
    return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next)
})

// GET /api/auth/google/callback - Callback après autorisation Google
router.get('/google/callback', (req, res, next) => {
    console.log(`[AUTH-DBG] Google callback received - method: ${req.method} originalUrl: ${req.originalUrl}`)
    return passport.authenticate('google', {
        failureRedirect: process.env.FRONTEND_URL
    })(req, res, (err) => {
        if (err) {
            console.error('[AUTH] Error during Google callback:', err)
            return next(err)
        }
        // Succès : rediriger vers le frontend
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`)
    })
})

// =============================================================================
// Apple OAuth Routes (commented until Apple strategy configured)
// =============================================================================
/*
router.get('/apple', (req, res, next) => {
    console.log(`[AUTH-DBG] Start apple route - method: ${req.method} originalUrl: ${req.originalUrl}`)
    return passport.authenticate('apple')(req, res, next)
})

router.post('/apple/callback', (req, res, next) => {
    console.log(`[AUTH-DBG] Apple callback received - method: ${req.method} originalUrl: ${req.originalUrl}`)
    return passport.authenticate('apple', {
        failureRedirect: process.env.FRONTEND_URL
    })(req, res, (err) => {
        if (err) {
            console.error('[AUTH] Error during Apple callback:', err)
            return next(err)
        }
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`)
    })
})
*/

// =============================================================================
// Amazon OAuth Routes (commented until Amazon strategy configured)
// =============================================================================
/*
router.get('/amazon', (req, res, next) => {
    console.log(`[AUTH-DBG] Start amazon route - method: ${req.method} originalUrl: ${req.originalUrl}`)
    return passport.authenticate('amazon')(req, res, next)
})

router.get('/amazon/callback', (req, res, next) => {
    console.log(`[AUTH-DBG] Amazon callback received - method: ${req.method} originalUrl: ${req.originalUrl}`)
    return passport.authenticate('amazon', {
        failureRedirect: process.env.FRONTEND_URL
    })(req, res, (err) => {
        if (err) {
            console.error('[AUTH] Error during Amazon callback:', err)
            return next(err)
        }
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`)
    })
})
*/

// =============================================================================
// Facebook OAuth Routes (commented until Facebook strategy configured)
// =============================================================================
/*
router.get('/facebook', (req, res, next) => {
    console.log(`[AUTH-DBG] Start facebook route - method: ${req.method} originalUrl: ${req.originalUrl}`)
    return passport.authenticate('facebook', { scope: ['email'] })(req, res, next)
})

router.get('/facebook/callback', (req, res, next) => {
    console.log(`[AUTH-DBG] Facebook callback received - method: ${req.method} originalUrl: ${req.originalUrl}`)
    return passport.authenticate('facebook', {
        failureRedirect: process.env.FRONTEND_URL
    })(req, res, (err) => {
        if (err) {
            console.error('[AUTH] Error during Facebook callback:', err)
            return next(err)
        }
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`)
    })
})
*/

export default router
