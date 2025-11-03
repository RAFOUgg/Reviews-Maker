import express from 'express'
import passport from 'passport'

const router = express.Router()

// Initier l'authentification Discord
router.get('/discord', passport.authenticate('discord'))

// Callback après authentification Discord
router.get('/discord/callback',
    passport.authenticate('discord', { failureRedirect: 'http://localhost:5173' }),
    (req, res) => {
        // Rediriger vers le frontend callback
        res.redirect('http://localhost:5173/auth/callback')
    }
)

// Récupérer l'utilisateur actuel
router.get('/me', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'not_authenticated' })
    }

    // Envoyer les infos user avec avatar URL Discord complet
    const avatarUrl = req.user.avatar
        ? `https://cdn.discordapp.com/avatars/${req.user.discordId}/${req.user.avatar}.png?size=128`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(req.user.discriminator || '0') % 5}.png`

    res.json({
        id: req.user.id,
        username: req.user.username,
        discriminator: req.user.discriminator,
        avatar: avatarUrl,
        email: req.user.email,
        roles: JSON.parse(req.user.roles || '[]')
    })
})

// Déconnexion
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'logout_failed' })
        }
        req.session.destroy(() => {
            res.clearCookie('connect.sid')
            res.json({ success: true })
        })
    })
})

export default router
