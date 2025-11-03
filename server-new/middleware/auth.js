export function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.status(401).json({ error: 'unauthorized', message: 'Authentification requise' })
}

export function optionalAuth(req, res, next) {
    // Passe toujours, mais req.user sera undefined si non connecté
    next()
}
