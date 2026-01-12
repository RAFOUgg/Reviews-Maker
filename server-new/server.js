import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import { buildSessionOptions } from './session-options.js'
import passport from 'passport'
import cors from 'cors'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
import sqliteStore from 'connect-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

// Import routes
import authRoutes from './routes/auth.js'
import reviewRoutes from './routes/reviews.js'
import userRoutes from './routes/users.js'
import templatesRoutes from './routes/templates.js'
import legalRoutes from './routes/legal.js'
import kycRoutes from './routes/kyc.js'
import paymentRoutes from './routes/payment.js'
import accountRoutes from './routes/account.js'
import cultivarsRoutes from './routes/cultivars.js'
import geneticsRoutes from './routes/genetics.js'
import pipelinesRoutes from './routes/pipelines.js'
import flowerReviewsRoutes from './routes/flower-reviews.js'
import hashReviewsRoutes from './routes/hash-reviews.js'
import concentrateReviewsRoutes from './routes/concentrate-reviews.js'
import edibleReviewsRoutes from './routes/edible-reviews.js'
import libraryRoutes from './routes/library.js'
import galleryRoutes from './routes/gallery.js'
import statsRoutes from './routes/stats.js'
import pipelineGithubRoutes from './routes/pipeline-github.js'
import usageRoutes from './routes/usage.js'
import presetsRoutes from './routes/presets.js'
import { requireAuth, optionalAuth, logAuthRequest } from './middleware/auth.js'

// Import config
import './config/passport.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const Store = sqliteStore(session)

const app = express()
// If running behind a reverse proxy (Nginx), trust X-Forwarded-* headers so passport/session
// and secure cookies behave correctly. `1` is the number of proxies in front of the app.
app.set('trust proxy', 1)
// Normalize DATABASE_URL for sqlite file paths so Prisma always gets an absolute path.
// This avoids issues when the process cwd differs (pm2/systemd) and relative paths break.
const normalizeDatabaseUrl = () => {
    const raw = process.env.DATABASE_URL || ''
    if (!raw) return
    if (raw.startsWith('file:')) {
        const filePath = raw.slice(5)
        // If path is already absolute, keep it; otherwise resolve relative to project root
        const resolved = path.isAbsolute(filePath)
            ? filePath
            : path.resolve(__dirname, '..', filePath)

        // Ensure parent directory exists so Sqlite can create the DB file
        try {
            fs.mkdirSync(path.dirname(resolved), { recursive: true })
        } catch (err) {
        }
        if (!discordRedirect.endsWith('/api/auth/discord/callback')) {
            console.warn('[CONFIG] DISCORD_REDIRECT_URI should end with /api/auth/discord/callback; please verify the URL configured in the Discord Developer Portal')
        }
    }
} catch (err) {
    // Avoid throwing for invalid URLs — just log
export { prisma }
