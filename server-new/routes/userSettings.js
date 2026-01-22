/**
 * User Settings Routes - Account Page Backend
 * Handles password changes, 2FA, preferences, notification settings
 */

import express from 'express'
import bcrypt from 'bcryptjs'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { prisma } from '../server.js'
import { randomUUID } from 'crypto'

const router = express.Router()

// Middleware: Authentication check
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// ==================== GET SETTINGS ====================
// GET /api/user/settings
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        theme: true,
        language: true,
        notificationEmail: true,
        marketingEmails: true,
        twoFactorEnabled: true,
        twoFactorMethod: true
      }
    });

    const notificationPrefs = await prisma.notificationPreferences.findUnique({
      where: { userId: req.user.id }
    });

    res.json({
      theme: user?.theme || 'system',
      language: user?.language || 'en',
      notificationEmail: user?.notificationEmail ?? true,
      marketingEmails: user?.marketingEmails ?? false,
      twoFactorEnabled: user?.twoFactorEnabled ?? false,
      twoFactorMethod: user?.twoFactorMethod,
      notifications: notificationPrefs || {}
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
    const { theme, language, notificationEmail, marketingEmails } = req.body;

    // Validation
    const errors = {};
    if (theme && !['light', 'dark', 'system'].includes(theme)) errors.theme = 'Invalid theme';
    if (language && !/^[a-z]{2}(-[A-Z]{2})?$/.test(language)) errors.language = 'Invalid language';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        theme,
        language,
        notificationEmail,
        marketingEmails,
        updatedAt: new Date()
      },
      select: {
        id: true,
        theme: true,
        language: true,
        notificationEmail: true,
        marketingEmails: true
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('PUT /settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ==================== CHANGE PASSWORD ====================
// POST /api/user/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check current password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || !user.password) {
      return res.status(400).json({ error: 'Password login not available for this account' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and log activity
    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          password: hashedPassword,
          lastPasswordChange: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.sessionActivity.create({
        data: {
          id: randomUUID(),
          userId: req.user.id,
          sessionId: req.sessionID,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          actionType: 'password_change',
          actionStatus: 'success',
          createdAt: new Date()
        }
      })
    ]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('POST /change-password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ==================== SETUP 2FA (TOTP) ====================
// POST /api/user/2fa/setup
router.post('/2fa/setup', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true, twoFactorEnabled: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Reviews-Maker (${user.email})`,
      issuer: 'Reviews-Maker',
      length: 32
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode,
      backupCodes: generateBackupCodes(10) // Generate 10 backup codes
    });
  } catch (error) {
    console.error('POST /2fa/setup error:', error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
});

// ==================== VERIFY & ENABLE 2FA ====================
// POST /api/user/2fa/verify
router.post('/2fa/verify', requireAuth, async (req, res) => {
  try {
    const { secret, token, backupCodes } = req.body;

    if (!secret || !token) {
      return res.status(400).json({ error: 'Secret and token required' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Save 2FA settings
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorMethod: 'authenticator',
        totpSecret: secret,
        updatedAt: new Date()
      }
    });

    // Save backup codes (hashed)
    // In production, save hashed versions with ability to use each only once
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

    res.json({
      message: '2FA enabled successfully',
      backupCodes // Return original codes only once for user to save
    });
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

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || !user.password) {
      return res.status(400).json({ error: 'Cannot disable 2FA' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorMethod: null,
        totpSecret: null,
        updatedAt: new Date()
      }
    });

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('POST /2fa/disable error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

// ==================== GET NOTIFICATION PREFERENCES ====================
// GET /api/user/notifications
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    let prefs = await prisma.notificationPreferences.findUnique({
      where: { userId: req.user.id }
    });

    if (!prefs) {
      // Create default preferences
      prefs = await prisma.notificationPreferences.create({
        data: {
          id: require('crypto').randomUUID(),
          userId: req.user.id,
          emailOnNewComment: true,
          emailOnNewLike: true,
          emailOnMention: true,
          emailOnFollowedUserReview: false,
          emailOnNewsletterWeekly: false,
          emailOnPromoAndUpdates: false,
          pushOnNewComment: true,
          pushOnNewLike: false,
          pushOnMention: true,
          notificationFrequency: 'immediate',
          digestTime: '09:00:00',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    res.json(prefs);
  } catch (error) {
    console.error('GET /notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// ==================== UPDATE NOTIFICATION PREFERENCES ====================
// PUT /api/user/notifications
router.put('/notifications', requireAuth, async (req, res) => {
  try {
    const {
      emailOnNewComment,
      emailOnNewLike,
      emailOnMention,
      emailOnFollowedUserReview,
      emailOnNewsletterWeekly,
      emailOnPromoAndUpdates,
      pushOnNewComment,
      pushOnNewLike,
      pushOnMention,
      notificationFrequency,
      digestTime
    } = req.body;

    // Validation
    const validFrequencies = ['immediate', 'daily', 'weekly', 'never'];
    if (notificationFrequency && !validFrequencies.includes(notificationFrequency)) {
      return res.status(400).json({ error: 'Invalid notification frequency' });
    }

    let prefs = await prisma.notificationPreferences.findUnique({
      where: { userId: req.user.id }
    });

    if (!prefs) {
      prefs = await prisma.notificationPreferences.create({
        data: {
          id: require('crypto').randomUUID(),
          userId: req.user.id,
          emailOnNewComment,
          emailOnNewLike,
          emailOnMention,
          emailOnFollowedUserReview,
          emailOnNewsletterWeekly,
          emailOnPromoAndUpdates,
          pushOnNewComment,
          pushOnNewLike,
          pushOnMention,
          notificationFrequency,
          digestTime,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    } else {
      prefs = await prisma.notificationPreferences.update({
        where: { userId: req.user.id },
        data: {
          emailOnNewComment,
          emailOnNewLike,
          emailOnMention,
          emailOnFollowedUserReview,
          emailOnNewsletterWeekly,
          emailOnPromoAndUpdates,
          pushOnNewComment,
          pushOnNewLike,
          pushOnMention,
          notificationFrequency,
          digestTime,
          updatedAt: new Date()
        }
      });
    }

    res.json(prefs);
  } catch (error) {
    console.error('PUT /notifications error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// ==================== GET SECURITY LOG ====================
// GET /api/user/security/activity
router.get('/security/activity', requireAuth, async (req, res) => {
  try {
    const activity = await prisma.sessionActivity.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json(activity);
  } catch (error) {
    console.error('GET /security/activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// Helper function to generate backup codes
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

module.exports = router;
