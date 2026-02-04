import express from 'express'
import passport from 'passport'
import { asyncHandler, Errors } from '../utils/errorHandler.js'
import { prisma } from '../server.js'
import { ACCOUNT_TYPES, getUserAccountType } from '../services/account.js'
import { hashPassword, verifyPassword } from '../services/password.js'
import { getUserLimits } from '../middleware/permissions.js'

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
    if (!user) return null

    // If avatar is already a full URL, return as-is (Google, Apple, Facebook, Amazon, etc.)
    if (user.avatar && (user.avatar.startsWith('http://') || user.avatar.startsWith('https://'))) {
        return user.avatar
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
        })(),
        // Champs légaux pour ne pas redemander à chaque connexion
        legalAge: user.legalAge || false,
        consentRDR: user.consentRDR || false,
        birthdate: user.birthdate || null,
        country: user.country || null,
        region: user.region || null
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
    const { email, password, username, pseudo, accountType } = req.body || {}
    const finalUsername = username || pseudo // Accepter les deux noms de champ

    if (!email || !password) {
        return res.status(400).json({ error: 'missing_fields', message: 'Email et mot de passe requis' })
    }

    if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'weak_password', message: 'Mot de passe trop court (8 caractères min.)' })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const chosenType = Object.values(ACCOUNT_TYPES).includes(accountType) ? accountType : ACCOUNT_TYPES.AMATEUR

    const existing = await prisma.user.findFirst({ where: { email: normalizedEmail } })
    if (existing) {
        if (existing.passwordHash) {
            return res.status(409).json({ error: 'email_taken', message: 'Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe.' })
        }
        // Si l'utilisateur existe via OAuth, informer l'utilisateur
        const provider = existing.googleId ? 'Google' : existing.discordId ? 'Discord' : existing.appleId ? 'Apple' : null
        if (provider) {
            return res.status(409).json({
                error: 'oauth_account_exists',
                message: `Un compte existe déjà avec cet email (via ${provider}). Connectez-vous avec ${provider} ou utilisez un autre email.`,
                provider
            })
        }
    }

    const passwordHash = await hashPassword(password)

    let user
    if (existing) {
        user = await prisma.user.update({
            where: { id: existing.id },
            data: {
                passwordHash,
                username: existing.username || finalUsername || normalizedEmail.split('@')[0],
                roles: existing.roles || JSON.stringify({ roles: [chosenType] })
            }
        })
    } else {
        user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                username: finalUsername || normalizedEmail.split('@')[0],
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

    if (!user) {
        return res.status(404).json({ error: 'user_not_found', message: 'Aucun compte trouvé avec cet email. Voulez-vous créer un compte ?' })
    }

    if (!user.passwordHash) {
        // L'utilisateur existe mais s'est inscrit via OAuth (Google, Discord, etc.)
        const provider = user.googleId ? 'Google' : user.discordId ? 'Discord' : user.appleId ? 'Apple' : 'un autre service'
        return res.status(401).json({ error: 'oauth_account', message: `Ce compte a été créé via ${provider}. Utilisez ce service pour vous connecter.` })
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

// 🔧 DEV ONLY: Quick login for local testing - no DB needed
// POST /api/auth/dev/quick-login - Connexion rapide en développement
if (process.env.NODE_ENV === 'development') {
    router.post('/dev/quick-login', (req, res) => {
        // In dev mode, just return success - middleware handles auth
        res.json({
            success: true,
            message: 'Dev mode: no login needed, all routes are accessible',
            user: {
                id: 'dev-test-user-id',
                email: 'test@example.com',
                username: 'DevTestUser',
                tier: 'PRODUCTEUR',
                emailVerified: true,
                legalAge: true,
                consentRDR: true
            }
        })
    })
}

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
    // ✅ DEV MODE: Return mock user data without DB access
    if (process.env.NODE_ENV === 'development') {
        const mockUser = {
            id: 'dev-test-user-id',
            email: 'test@example.com',
            username: 'DevTestUser',
            tier: 'PRODUCTEUR',
            emailVerified: true,
            legalAge: true,
            consentRDR: true
        }

        const limits = getUserLimits(mockUser)
        return res.json({
            ...mockUser,
            limits: {
                accountType: limits.accountType,
                daily: limits.limits.daily,
                templates: limits.limits.templates,
                watermarks: limits.limits.watermarks,
                reviews: limits.limits.reviews,
                savedData: limits.limits.savedData,
                dpi: limits.dpi,
                formats: limits.formats,
                features: limits.features
            }
        })
    }

    // PRODUCTION: Require real authentication
    if (typeof req.isAuthenticated !== 'function' || !req.isAuthenticated()) {
        throw Errors.UNAUTHORIZED()
    }

    const sanitized = sanitizeUser(req.user)

    // Ajouter limites & features selon type de compte
    const limits = getUserLimits(req.user)

    res.json({
        ...sanitized,
        limits: {
            accountType: limits.accountType,
            daily: limits.limits.daily,
            templates: limits.limits.templates,
            watermarks: limits.limits.watermarks,
            reviews: limits.limits.reviews,
            savedData: limits.limits.savedData,
            dpi: limits.dpi,
            formats: limits.formats,
            features: limits.features
        }
    })
}))

// GET /api/auth/limits - Récupérer limites utilisateur
router.get('/limits', asyncHandler(async (req, res) => {
    if (typeof req.isAuthenticated !== 'function' || !req.isAuthenticated()) {
        throw Errors.UNAUTHORIZED()
    }

    const limits = getUserLimits(req.user)

    // Récupérer compteurs actuels depuis DB
    const [templateCount, watermarkCount, reviewCount, dataCount] = await Promise.all([
        prisma.savedTemplate.count({ where: { userId: req.user.id } }),
        prisma.watermark.count({ where: { userId: req.user.id } }),
        prisma.review.count({ where: { authorId: req.user.id } }),
        prisma.savedData.count({ where: { userId: req.user.id } })
    ])

    res.json({
        accountType: limits.accountType,
        limits: {
            dailyExports: {
                limit: limits.limits.daily,
                used: req.user.dailyExportsUsed || 0,
                remaining: limits.limits.daily === -1 ? -1 : Math.max(0, limits.limits.daily - (req.user.dailyExportsUsed || 0)),
                resetTime: req.user.dailyExportsReset
            },
            templates: {
                limit: limits.limits.templates,
                used: templateCount,
                remaining: limits.limits.templates === -1 ? -1 : Math.max(0, limits.limits.templates - templateCount)
            },
            watermarks: {
                limit: limits.limits.watermarks,
                used: watermarkCount,
                remaining: limits.limits.watermarks === -1 ? -1 : Math.max(0, limits.limits.watermarks - watermarkCount)
            },
            reviews: {
                limit: limits.limits.reviews,
                used: reviewCount,
                remaining: limits.limits.reviews === -1 ? -1 : Math.max(0, limits.limits.reviews - reviewCount)
            },
            savedData: {
                limit: limits.limits.savedData,
                used: dataCount,
                remaining: limits.limits.savedData === -1 ? -1 : Math.max(0, limits.limits.savedData - dataCount)
            }
        },
        export: {
            dpi: limits.dpi,
            formats: limits.formats
        },
        features: limits.features,
        subscription: {
            type: req.user.subscriptionType,
            status: req.user.subscriptionStatus,
            start: req.user.subscriptionStart,
            end: req.user.subscriptionEnd
        }
    })
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

// =============================================================================
// Email Verification Code System (CDC Requirement)
// =============================================================================

/**
 * POST /api/auth/send-verification-code
 * Envoie un code 6 chiffres par email
 * CDC: "code de vérification 6 chiffres obligatoire à chaque connexion"
 */
router.post('/send-verification-code', asyncHandler(async (req, res) => {
    const { email, type = 'login' } = req.body

    if (!email) {
        return res.status(400).json({ error: 'missing_email', message: 'Email requis' })
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findFirst({ where: { email: normalizedEmail } })
    if (!user && type === 'login') {
        // Ne pas révéler si l'email existe ou pas (sécurité)
        return res.status(200).json({ message: 'Si cet email existe, un code a été envoyé' })
    }

    // Générer code 6 caractères alphanumériques
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Supprimer les anciens codes non vérifiés pour cet email
    await prisma.verificationCode.deleteMany({
        where: {
            email: normalizedEmail,
            type,
            verified: false
        }
    })

    // Créer nouveau code
    await prisma.verificationCode.create({
        data: {
            email: normalizedEmail,
            code,
            type,
            expiresAt
        }
    })

    // Envoyer email
    const emailService = await import('../services/email.js')
    await emailService.sendVerificationCode(normalizedEmail, code, user?.locale || 'fr')

    res.json({ message: 'Code envoyé par email', expiresIn: 600 })
}))

/**
 * POST /api/auth/verify-code
 * Vérifie un code 6 chiffres
 */
router.post('/verify-code', asyncHandler(async (req, res) => {
    const { email, code, type = 'login' } = req.body

    if (!email || !code) {
        return res.status(400).json({ error: 'missing_fields', message: 'Email et code requis' })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const normalizedCode = String(code).trim().toUpperCase()

    // Trouver le code
    const verificationRecord = await prisma.verificationCode.findFirst({
        where: {
            email: normalizedEmail,
            type,
            verified: false
        },
        orderBy: { createdAt: 'desc' }
    })

    if (!verificationRecord) {
        return res.status(404).json({ error: 'code_not_found', message: 'Aucun code trouvé ou code déjà utilisé' })
    }

    // Vérifier expiration
    if (new Date() > verificationRecord.expiresAt) {
        await prisma.verificationCode.delete({ where: { id: verificationRecord.id } })
        return res.status(410).json({ error: 'code_expired', message: 'Code expiré (10 minutes)' })
    }

    // Vérifier limite tentatives (5 max)
    if (verificationRecord.attempts >= 5) {
        await prisma.verificationCode.delete({ where: { id: verificationRecord.id } })
        return res.status(429).json({ error: 'too_many_attempts', message: 'Trop de tentatives. Demandez un nouveau code.' })
    }

    // Incrémenter tentatives
    await prisma.verificationCode.update({
        where: { id: verificationRecord.id },
        data: { attempts: verificationRecord.attempts + 1 }
    })

    // Vérifier code
    if (normalizedCode !== verificationRecord.code) {
        return res.status(401).json({
            error: 'invalid_code',
            message: 'Code invalide',
            attemptsLeft: 5 - (verificationRecord.attempts + 1)
        })
    }

    // Code valide ! Marquer comme vérifié
    await prisma.verificationCode.update({
        where: { id: verificationRecord.id },
        data: { verified: true }
    })

    // Si type login, connecter l'utilisateur
    if (type === 'login') {
        const user = await prisma.user.findFirst({ where: { email: normalizedEmail } })
        if (user) {
            await new Promise((resolve, reject) => {
                req.login(user, (err) => {
                    if (err) return reject(err)
                    resolve()
                })
            })
            return res.json({ message: 'Code vérifié', user: sanitizeUser(user) })
        }
    }

    res.json({ message: 'Code vérifié', verified: true })
}))

// =============================================================================
// Password Reset System
// =============================================================================

/**
 * POST /api/auth/forgot-password
 * Envoie un email avec lien de réinitialisation (token 1h)
 */
router.post('/forgot-password', asyncHandler(async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ error: 'missing_email', message: 'Email requis' })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const user = await prisma.user.findFirst({ where: { email: normalizedEmail } })

    // Ne pas révéler si l'email existe (sécurité)
    if (!user) {
        return res.status(200).json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé' })
    }

    // Générer token sécurisé
    const crypto = await import('crypto')
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    // Créer code de type reset_password
    await prisma.verificationCode.deleteMany({
        where: { email: normalizedEmail, type: 'reset_password' }
    })

    await prisma.verificationCode.create({
        data: {
            email: normalizedEmail,
            code: token,
            type: 'reset_password',
            expiresAt
        }
    })

    // Envoyer email avec lien
    const emailService = await import('../services/email.js')
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`
    await emailService.sendPasswordResetEmail(normalizedEmail, resetLink, user.locale || 'fr')

    res.json({ message: 'Email de réinitialisation envoyé', expiresIn: 3600 })
}))

/**
 * POST /api/auth/reset-password
 * Réinitialise le mot de passe avec token
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
    const { email, token, newPassword } = req.body

    if (!email || !token || !newPassword) {
        return res.status(400).json({ error: 'missing_fields', message: 'Email, token et nouveau mot de passe requis' })
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return res.status(400).json({ error: 'weak_password', message: 'Mot de passe trop court (8 caractères min.)' })
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    // Trouver le token
    const verificationRecord = await prisma.verificationCode.findFirst({
        where: {
            email: normalizedEmail,
            code: token,
            type: 'reset_password',
            verified: false
        }
    })

    if (!verificationRecord) {
        return res.status(404).json({ error: 'invalid_token', message: 'Token invalide ou déjà utilisé' })
    }

    // Vérifier expiration
    if (new Date() > verificationRecord.expiresAt) {
        await prisma.verificationCode.delete({ where: { id: verificationRecord.id } })
        return res.status(410).json({ error: 'token_expired', message: 'Token expiré (1 heure)' })
    }

    // Mettre à jour le mot de passe
    const user = await prisma.user.findFirst({ where: { email: normalizedEmail } })
    if (!user) {
        return res.status(404).json({ error: 'user_not_found', message: 'Utilisateur introuvable' })
    }

    const passwordHash = await hashPassword(newPassword)
    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
    })

    // Marquer token comme utilisé
    await prisma.verificationCode.update({
        where: { id: verificationRecord.id },
        data: { verified: true }
    })

    res.json({ message: 'Mot de passe réinitialisé avec succès' })
}))

export default router
