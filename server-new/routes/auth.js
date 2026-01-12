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
export default router
