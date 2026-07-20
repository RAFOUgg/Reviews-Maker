/**
 * User Settings Routes - Account Page Backend
 * Handles password changes and 2FA (TOTP)
 */

import express from 'express'
import { prisma, sessionStore } from '../server.js'
import { requireAuth } from '../middleware/auth.js'
import { forgetTrackedSession } from '../middleware/sessionTracking.js'
import { hashPassword, verifyPassword } from '../services/password.js'
import { setupTOTP, verifyTOTPToken } from '../services/totp.js'

const router = express.Router()

// ==================== GET SETTINGS ====================
// GET /api/user/settings
router.get('/settings', requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                theme: true,
                locale: true,
                totpEnabled: true
            }
        });

        res.json({
            theme: user?.theme || 'violet-lean',
            locale: user?.locale || 'fr',
            totpEnabled: user?.totpEnabled ?? false
        });
    } catch (error) {
        console.error('GET /settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// ==================== UPDATE SETTINGS ====================
// PUT /api/user/settings
router.put('/settings', requireAuth, async (req, res) => {
    try {
        const { theme, locale } = req.body;

        const errors = {};
        const validThemes = ['violet-lean', 'emerald', 'tahiti', 'sakura', 'dark'];
        if (theme && !validThemes.includes(theme)) errors.theme = 'Invalid theme';
        const validLocales = ['fr', 'en', 'es', 'de'];
        if (locale && !validLocales.includes(locale)) errors.locale = 'Invalid locale';

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                theme: theme || undefined,
                locale: locale || undefined
            },
            select: { theme: true, locale: true }
        });

        res.json(updated);
    } catch (error) {
        console.error('PUT /settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// ==================== CHANGE PASSWORD ====================
// POST /api/user/settings/change-password
router.post('/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'All fields required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user || !user.passwordHash) {
            return res.status(400).json({ error: 'Password login not available for this account' });
        }

        const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const passwordHash = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash }
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('POST /change-password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// ==================== SETUP 2FA (TOTP) ====================
// POST /api/user/2fa/setup
// Génère un secret + QR code, ne persiste rien tant que /2fa/verify n'a pas confirmé un code valide
router.post('/2fa/setup', requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { username: true, totpEnabled: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.totpEnabled) {
            return res.status(400).json({ error: '2FA already enabled' });
        }

        const { secret, qrCodeDataUrl } = await setupTOTP(user.username);

        res.json({ secret, qrCodeDataUrl });
    } catch (error) {
        console.error('POST /2fa/setup error:', error);
        res.status(500).json({ error: 'Failed to setup 2FA' });
    }
});

// ==================== VERIFY & ENABLE 2FA ====================
// POST /api/user/2fa/verify
router.post('/2fa/verify', requireAuth, async (req, res) => {
    try {
        const { secret, token } = req.body;

        if (!secret || !token) {
            return res.status(400).json({ error: 'Secret and token required' });
        }

        const verified = verifyTOTPToken(secret, token);
        if (!verified) {
            return res.status(401).json({ error: 'Invalid verification code' });
        }

        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                totpEnabled: true,
                totpSecret: secret
            }
        });

        res.json({ message: '2FA enabled successfully' });
    } catch (error) {
        console.error('POST /2fa/verify error:', error);
        res.status(500).json({ error: 'Failed to enable 2FA' });
    }
});

// ==================== DISABLE 2FA ====================
// POST /api/user/2fa/disable
router.post('/2fa/disable', requireAuth, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user || !user.passwordHash) {
            return res.status(400).json({ error: 'Cannot disable 2FA' });
        }

        const isPasswordValid = await verifyPassword(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                totpEnabled: false,
                totpSecret: null
            }
        });

        res.json({ message: '2FA disabled successfully' });
    } catch (error) {
        console.error('POST /2fa/disable error:', error);
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
});

// ==================== PRÉFÉRENCES ====================

// Seules ces clés sont acceptées : une préférence inconnue envoyée par un client modifié ne doit
// pas se retrouver stockée. `defaultVisibility` est la valeur initiale du champ de visibilité dans
// les formulaires de review — pas une contrainte serveur (publier reste soumis à requirePublishingAllowed).
const ALLOWED_PREFERENCES = {
    showNotifications: 'boolean',
    autoSaveDrafts: 'boolean',
    allowSocialSharing: 'boolean',
    showDetailedStats: 'boolean',
    defaultVisibility: 'visibility',
};

const DEFAULT_PREFERENCES = {
    showNotifications: true,
    autoSaveDrafts: true,
    allowSocialSharing: false,
    showDetailedStats: true,
    defaultVisibility: 'private',
};

function parsePreferences(raw) {
    if (!raw) return { ...DEFAULT_PREFERENCES };
    try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    } catch {
        return { ...DEFAULT_PREFERENCES };
    }
}

// GET /api/user/settings/preferences
router.get('/preferences', requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { preferences: true }
        });
        res.json(parsePreferences(user?.preferences));
    } catch (error) {
        console.error('GET /preferences error:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

// PUT /api/user/settings/preferences
router.put('/preferences', requireAuth, async (req, res) => {
    try {
        const current = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { preferences: true }
        });

        const merged = parsePreferences(current?.preferences);

        for (const [key, kind] of Object.entries(ALLOWED_PREFERENCES)) {
            if (!(key in req.body)) continue;
            const value = req.body[key];

            if (kind === 'boolean' && typeof value === 'boolean') {
                merged[key] = value;
            } else if (kind === 'visibility' && ['private', 'public'].includes(value)) {
                merged[key] = value;
            } else {
                return res.status(400).json({ error: `Valeur invalide pour ${key}` });
            }
        }

        await prisma.user.update({
            where: { id: req.user.id },
            data: { preferences: JSON.stringify(merged) }
        });

        res.json(merged);
    } catch (error) {
        console.error('PUT /preferences error:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// ==================== SESSIONS ====================

/** Rend un user-agent lisible : « Chrome sur Windows ». Volontairement grossier — il ne s'agit que
 *  d'aider l'utilisateur à reconnaître ses propres appareils, pas de faire du profilage exact. */
function describeDevice(userAgent) {
    if (!userAgent) return 'Appareil inconnu';

    const browser = /Edg\//.test(userAgent) ? 'Edge'
        : /OPR\//.test(userAgent) ? 'Opera'
            : /Chrome\//.test(userAgent) ? 'Chrome'
                : /Safari\//.test(userAgent) ? 'Safari'
                    : /Firefox\//.test(userAgent) ? 'Firefox'
                        : 'Navigateur inconnu';

    const os = /Windows/.test(userAgent) ? 'Windows'
        : /Android/.test(userAgent) ? 'Android'
            : /iPhone|iPad|iOS/.test(userAgent) ? 'iOS'
                : /Mac OS X|Macintosh/.test(userAgent) ? 'macOS'
                    : /Linux/.test(userAgent) ? 'Linux'
                        : null;

    return os ? `${browser} sur ${os}` : browser;
}

/** Détruit une session dans le magasin (source d'autorité). Résout même en cas d'échec : la ligne
 *  miroir doit être retirée dans tous les cas, sinon l'UI afficherait une session fantôme. */
function destroyStoredSession(sid) {
    return new Promise((resolve) => {
        if (!sessionStore?.destroy) return resolve();
        sessionStore.destroy(sid, (err) => {
            if (err) console.error('[sessions] destruction impossible:', sid, err.message);
            resolve();
        });
    });
}

// GET /api/user/settings/sessions
router.get('/sessions', requireAuth, async (req, res) => {
    try {
        const sessions = await prisma.session.findMany({
            where: { userId: req.user.id, expiresAt: { gt: new Date() } },
            orderBy: { lastSeenAt: 'desc' }
        });

        res.json(sessions.map(s => ({
            id: s.id,
            device: describeDevice(s.userAgent),
            ipAddress: s.ipAddress,
            lastSeenAt: s.lastSeenAt,
            createdAt: s.createdAt,
            current: s.sid === req.sessionID
        })));
    } catch (error) {
        console.error('GET /sessions error:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// DELETE /api/user/settings/sessions/:id — révoque une session précise
router.delete('/sessions/:id', requireAuth, async (req, res) => {
    try {
        // Filtré sur userId : on ne peut révoquer que ses propres sessions.
        const target = await prisma.session.findFirst({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!target) {
            return res.status(404).json({ error: 'Session introuvable' });
        }
        if (target.sid === req.sessionID) {
            return res.status(400).json({
                error: 'current_session',
                message: 'Utilisez la déconnexion pour fermer la session courante.'
            });
        }

        await destroyStoredSession(target.sid);
        forgetTrackedSession(target.sid);
        await prisma.session.delete({ where: { id: target.id } });

        res.json({ success: true });
    } catch (error) {
        console.error('DELETE /sessions/:id error:', error);
        res.status(500).json({ error: 'Failed to revoke session' });
    }
});

// POST /api/user/settings/sessions/revoke-others — déconnecte tous les autres appareils
router.post('/sessions/revoke-others', requireAuth, async (req, res) => {
    try {
        const others = await prisma.session.findMany({
            where: { userId: req.user.id, sid: { not: req.sessionID } }
        });

        for (const session of others) {
            await destroyStoredSession(session.sid);
            forgetTrackedSession(session.sid);
        }

        await prisma.session.deleteMany({
            where: { userId: req.user.id, sid: { not: req.sessionID } }
        });

        res.json({ success: true, revoked: others.length });
    } catch (error) {
        console.error('POST /sessions/revoke-others error:', error);
        res.status(500).json({ error: 'Failed to revoke sessions' });
    }
});

export default router;
