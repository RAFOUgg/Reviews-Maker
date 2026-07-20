/**
 * Miroir consultable des sessions de connexion.
 *
 * Le magasin réel (connect-sqlite3, db/sessions.db) sait retrouver une session par son identifiant,
 * mais pas répondre à « quelles sont les sessions de cet utilisateur ? ». On tient donc une table
 * Session côté Prisma, mise à jour à chaque requête authentifiée, qui sert uniquement à l'affichage
 * et à la révocation. Le magasin reste l'autorité : une session absente du magasin est morte, même
 * si sa ligne subsiste ici.
 */
import { prisma } from '../server.js'

// Une écriture par requête serait inutilement coûteuse : on ne rafraîchit `lastSeenAt` que
// périodiquement. La granularité d'affichage attendue est la minute, pas la seconde.
const TOUCH_INTERVAL_MS = 5 * 60 * 1000

// Dernière écriture par identifiant de session, pour éviter de relire la base juste pour décider
// s'il faut écrire. Perdu au redémarrage, sans conséquence (une écriture de plus).
const lastTouch = new Map()

/** Adresse réelle du client, en tenant compte du reverse proxy Nginx (`trust proxy` est activé). */
function clientIp(req) {
    return req.ip || req.connection?.remoteAddress || null
}

export async function trackSession(req, res, next) {
    // Pas de session authentifiée : rien à suivre. En dev l'utilisateur est un mock sans ligne en
    // base, une écriture violerait la clé étrangère.
    if (!req.user?.id || !req.sessionID) return next()
    if (process.env.NODE_ENV === 'development' && req.user.id === 'dev-test-user-id') return next()

    const now = Date.now()
    const previous = lastTouch.get(req.sessionID)
    if (previous && now - previous < TOUCH_INTERVAL_MS) return next()
    lastTouch.set(req.sessionID, now)

    const expiresAt = req.session?.cookie?.expires
        ? new Date(req.session.cookie.expires)
        : new Date(now + 7 * 24 * 60 * 60 * 1000)

    try {
        await prisma.session.upsert({
            where: { sid: req.sessionID },
            create: {
                sid: req.sessionID,
                userId: req.user.id,
                expiresAt,
                userAgent: req.get('user-agent')?.slice(0, 500) || null,
                ipAddress: clientIp(req),
                lastSeenAt: new Date(now),
            },
            update: {
                expiresAt,
                lastSeenAt: new Date(now),
                ipAddress: clientIp(req),
            },
        })
    } catch (error) {
        // Le suivi des sessions est du confort : il ne doit jamais faire échouer une requête
        // applicative légitime.
        console.error('[sessionTracking] écriture impossible:', error.message)
    }

    next()
}

/** Oublie la trace mémoire d'une session révoquée, pour qu'une réutilisation soit ré-enregistrée. */
export function forgetTrackedSession(sid) {
    lastTouch.delete(sid)
}
