/**
 * User Profile Routes - Account Page Backend
 * Handles user profile, company info, and avatar management
 */

import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { prisma } from '../server.js'
import { fileURLToPath } from 'url'
import { requireAuth } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = express.Router()

// Multer config for avatar uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../db/avatars');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.user.id;
        const ext = path.extname(file.originalname);
        cb(null, `${userId}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP allowed.'));
        }
    }
});

// ==================== GET PROFILE ====================
// GET /api/user/profile
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                website: true,
                bio: true,
                avatar: true,
                bannerImage: true,
                theme: true,
                language: true,
                accountType: true,
                subscriptionType: true,
                kycStatus: true,
                createdAt: true,
                profileCompleteness: true,
                stats: {
                    select: {
                        totalReviews: true,
                        publicReviews: true,
                        totalExports: true,
                        totalLikes: true,
                        totalViews: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('GET /profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// ==================== UPDATE PROFILE ====================
// PUT /api/user/profile
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, website, bio, theme, language } = req.body;

        // Validation
        const errors = {};
        if (firstName && firstName.length > 100) errors.firstName = 'Max 100 characters';
        if (lastName && lastName.length > 100) errors.lastName = 'Max 100 characters';
        if (phoneNumber && phoneNumber.length > 20) errors.phoneNumber = 'Invalid phone number';
        if (website && website.length > 255) errors.website = 'Invalid URL';
        if (bio && bio.length > 2000) errors.bio = 'Max 2000 characters';
        if (theme && !['light', 'dark', 'system'].includes(theme)) errors.theme = 'Invalid theme';
        if (language && !/^[a-z]{2}(-[A-Z]{2})?$/.test(language)) errors.language = 'Invalid language code';

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        // Calculate profile completeness
        const updateData = {
            firstName,
            lastName,
            phoneNumber,
            website,
            bio,
            theme,
            language,
            updatedAt: new Date()
        };

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                website: true,
                bio: true,
                theme: true,
                language: true,
                updatedAt: true
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('PUT /profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// ==================== UPLOAD AVATAR ====================
// POST /api/user/avatar
router.post('/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const avatarUrl = `/db/avatars/${req.file.filename}`;

        // Delete old avatar if exists
        const oldUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { avatar: true }
        });

        if (oldUser?.avatar) {
            const oldPath = path.join(__dirname, `../../${oldUser.avatar}`);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Update user with new avatar
        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: { avatar: avatarUrl },
            select: { id: true, avatar: true }
        });

        res.json(updated);
    } catch (error) {
        console.error('POST /avatar error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

// ==================== UPLOAD BANNER ====================
// POST /api/user/banner
router.post('/banner', requireAuth, upload.single('banner'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const bannerUrl = `/db/avatars/${req.file.filename}`;

        // Delete old banner if exists
        const oldUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { bannerImage: true }
        });

        if (oldUser?.bannerImage) {
            const oldPath = path.join(__dirname, `../../${oldUser.bannerImage}`);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Update user with new banner
        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: { bannerImage: bannerUrl },
            select: { id: true, bannerImage: true }
        });

        res.json(updated);
    } catch (error) {
        console.error('POST /banner error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to upload banner' });
    }
});

export default router


