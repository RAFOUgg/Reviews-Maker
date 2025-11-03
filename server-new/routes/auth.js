import express from 'express'
import passport from 'passport'

const router = express.Router()

// GET /api/auth/discord - Initier l'authentification Discord
router.get('/discord', passport.authenticate('discord'))

// GET /api/auth/discord/callback - Callback après autorisation Discord
router.get('/discord/callback',
    passport.authenticate('discord', {
        failureRedirect: process.env.FRONTEND_URL
    }),
    (req, res) => {
        // Succès : rediriger vers le frontend
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`)
    }
)

// GET /api/auth/me - Récupérer l'utilisateur actuel
router.get('/me', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' })
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
})

// POST /api/auth/logout - Déconnexion
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' })
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Session destroy failed' })
            }
            res.clearCookie('connect.sid')
            res.json({ message: 'Logged out successfully' })
        })
    })
})

export default router
