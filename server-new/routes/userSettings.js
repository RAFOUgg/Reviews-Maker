/**
 * User Settings Routes - Account Page Backend
 * Handles password changes and 2FA (TOTP)
 */

import express from 'express'
import { prisma } from '../server.js'
import { requireAuth } from '../middleware/auth.js'
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

export default router;
