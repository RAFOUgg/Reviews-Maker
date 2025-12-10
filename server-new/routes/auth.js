import express from 'express'
import passport from 'passport'
import { asyncHandler, Errors } from '../utils/errorHandler.js'
import { prisma } from '../server.js'
import { ACCOUNT_TYPES, getUserAccountType } from '../services/account.js'
import { hashPassword, verifyPassword } from '../services/password.js'

const router = express.Router()

// =============================================================================
// OAuth Providers Configuration Endpoint
// =============================================================================
// GET /api/auth/providers - Returns list of configured OAuth providers
router.get('/providers', (req, res) => {
    const providers = []

    // Helper to check if env var is properly set (not empty, not placeholder)
    const isConfigured = (value) => {
        if (!value) return false
        // Reject common placeholder patterns
        if (value.includes('(') || value.includes('your_') || value.includes('xxxxx') || value === '...') return false
        return value.trim().length > 0
    }

    // Check which providers are configured
    if (isConfigured(process.env.DISCORD_CLIENT_ID) && isConfigured(process.env.DISCORD_CLIENT_SECRET)) {
        providers.push('discord')
    }
    if (isConfigured(process.env.GOOGLE_CLIENT_ID) && isConfigured(process.env.GOOGLE_CLIENT_SECRET)) {
        providers.push('google')
    }
    if (isConfigured(process.env.APPLE_CLIENT_ID) && isConfigured(process.env.APPLE_TEAM_ID) &&
        isConfigured(process.env.APPLE_KEY_ID) && isConfigured(process.env.APPLE_PRIVATE_KEY)) {
        providers.push('apple')
    }
    if (isConfigured(process.env.AMAZON_CLIENT_ID) && isConfigured(process.env.AMAZON_CLIENT_SECRET)) {
        providers.push('amazon')
    }
    if (isConfigured(process.env.FACEBOOK_CLIENT_ID) && isConfigured(process.env.FACEBOOK_CLIENT_SECRET)) {
        providers.push('facebook')
    }

    res.json({ providers })
})

function buildAvatar(user) {
    // Google/Apple/Facebook/Amazon avatars (stored as full URL)
    if (user.avatar && (user.googleId || user.appleId || user.facebookId || user.amazonId)) {
        // If avatar is already a full URL, return it as-is
        if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
            return user.avatar
        }
    }
    
    // Discord avatar (stored as hash, needs CDN construction)
    if (user.avatar && user.discordId) {
        return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
    }
    
    // Discord default avatar (based on discriminator)
    if (user.discriminator) {
        return `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || '0') % 5}.png`
    }
    
    return null
}

function sanitizeUser(user) {
    if (!user) return null
    const accountType = getUserAccountType(user)
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: buildAvatar(user),
        accountType,
        roles: (() => {
            try {
                const parsed = JSON.parse(user.roles || '{"roles":["consumer"]}')
                return parsed.roles || ['consumer']
            } catch (err) {
                return ['consumer']
            }
        })()
    }
}

// GET /api/auth/discord - Initier l'authentification Discord
router.get('/discord', (req, res, next) => {
    console.log(`[AUTH-DBG] Start discord route - method: ${req.method} originalUrl: ${req.originalUrl} path: ${req.path} ip: ${req.ip}`)
    // Also log any X-Forwarded headers to inspect proxy behavior
    console.log(`[AUTH-DBG] Headers: Host=${req.headers.host} X-Forwarded-For=${req.headers['x-forwarded-for']} X-Forwarded-Proto=${req.headers['x-forwarded-proto']}`)
    return passport.authenticate('discord')(req, res, next)
})

// POST /api/auth/email/signup - Création de compte email/password
router.post('/email/signup', asyncHandler(async (req, res) => {
    const { email, password, username, accountType } = req.body || {}

    if (!email || !password) {
        return res.status(400).json({ error: 'missing_fields', message: 'Email et mot de passe requis' })
    }

    if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'weak_password', message: 'Mot de passe trop court (8 caractères min.)' })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const chosenType = Object.values(ACCOUNT_TYPES).includes(accountType) ? accountType : ACCOUNT_TYPES.CONSUMER

    const existing = await prisma.user.findFirst({ where: { email: normalizedEmail } })
    if (existing && existing.passwordHash) {
        return res.status(409).json({ error: 'email_taken', message: 'Un compte existe déjà avec cet email' })
    }

    const passwordHash = await hashPassword(password)

    let user
    if (existing) {
        user = await prisma.user.update({
            where: { id: existing.id },
            data: {
                passwordHash,
                username: existing.username || username || normalizedEmail.split('@')[0],
                roles: existing.roles || JSON.stringify({ roles: [chosenType] })
            }
        })
    } else {
        user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                username: username || normalizedEmail.split('@')[0],
                passwordHash,
                roles: JSON.stringify({ roles: [chosenType] })
            }
        })
    }

    await new Promise((resolve, reject) => {
        req.login(user, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })

    res.json(sanitizeUser(user))
}))

// POST /api/auth/email/login - Connexion email/password
router.post('/email/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body || {}

    if (!email || !password) {
        return res.status(400).json({ error: 'missing_fields', message: 'Email et mot de passe requis' })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const user = await prisma.user.findFirst({ where: { email: normalizedEmail } })

    if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'invalid_credentials', message: 'Identifiants invalides' })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
        return res.status(401).json({ error: 'invalid_credentials', message: 'Identifiants invalides' })
    }

    await new Promise((resolve, reject) => {
        req.login(user, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })

    res.json(sanitizeUser(user))
}))

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
    console.log(`[AUTH-DBG] Discord callback received - method: ${req.method} originalUrl: ${req.originalUrl} path: ${req.path} ip: ${req.ip}`)
    console.log(`[AUTH-DBG] Query params:`, req.query)
    console.log(`[AUTH-DBG] Session ID:`, req.sessionID)
    console.log(`[AUTH-DBG] Headers: Host=${req.headers.host} X-Forwarded-For=${req.headers['x-forwarded-for']} X-Forwarded-Proto=${req.headers['x-forwarded-proto']}`)

    return passport.authenticate('discord', {
        failureRedirect: process.env.FRONTEND_URL
    })(req, res, (err) => {
        if (err) {
            console.error('[AUTH] Error during Discord callback:', err)
            return next(err)
        }
        // Succès : rediriger vers le frontend
        console.log('[AUTH-DBG] Discord auth success! User:', req.user?.username, 'ID:', req.user?.id)
        console.log('[AUTH-DBG] Session after auth:', req.sessionID, 'isAuthenticated:', req.isAuthenticated?.())
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`)
    })
})

// GET /api/auth/me - Récupérer l'utilisateur actuel
router.get('/me', asyncHandler(async (req, res) => {
    if (typeof req.isAuthenticated !== 'function' || !req.isAuthenticated()) {
        throw Errors.UNAUTHORIZED()
    }

    res.json(sanitizeUser(req.user))
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
    console.log(`[AUTH-DBG] Query params:`, req.query)
    console.log(`[AUTH-DBG] Session ID:`, req.sessionID)

    return passport.authenticate('google', {
        failureRedirect: process.env.FRONTEND_URL
    })(req, res, (err) => {
        if (err) {
            console.error('[AUTH] Error during Google callback:', err)
            return next(err)
        }
        // Succès : rediriger vers le frontend
        console.log('[AUTH-DBG] Google auth success! User:', req.user?.username, 'ID:', req.user?.id)
        console.log('[AUTH-DBG] Session after auth:', req.sessionID, 'isAuthenticated:', req.isAuthenticated?.())
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`)
    })
})

// =============================================================================
// Apple OAuth Routes
// =============================================================================
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

// =============================================================================
// Amazon OAuth Routes
// =============================================================================
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

// =============================================================================
// Facebook OAuth Routes
// =============================================================================
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

export default router
