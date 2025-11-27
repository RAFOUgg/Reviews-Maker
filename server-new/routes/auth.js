import express from 'express'
import passport from 'passport'
import { asyncHandler, Errors } from '../utils/errorHandler.js'

const router = express.Router()

// GET /api/auth/discord - Initier l'authentification Discord
router.get('/discord', (req, res, next) => {
    console.log(`[AUTH] Starting Discord OAuth for ${req.ip}`)
    return passport.authenticate('discord')(req, res, next)
})

// GET /api/auth/discord/callback - Callback après autorisation Discord
router.get('/discord/callback', (req, res, next) => {
    console.log('[AUTH] Discord callback received', { query: req.query })
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

export default router
