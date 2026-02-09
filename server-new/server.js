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
import userProfileRoutes from './routes/userProfile.js'
import userSettingsRoutes from './routes/userSettings.js'
import userKYCRoutes from './routes/userKYC.js'
import templatesRoutes from './routes/templates.js'
import legalRoutes from './routes/legal.js'
import kycRoutes from './routes/kyc.js'
import paymentRoutes from './routes/payment.js'
import accountRoutes from './routes/account.js'
import cultivarsRoutes from './routes/cultivars.js'
import geneticsRoutes from './routes/genetics.js'
import pipelinesRoutes from './routes/pipelines.js'
import pipelineCultureRoutes from './routes/pipeline-culture.js'
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
import exportRoutes from './routes/export.js'
import adminRoutes from './routes/admin.js'
import debugRoutes from './routes/debug.js'
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
            // Silently fail if directory already exists
        }
    }
}

// Initialize database connection and normalize path if needed
normalizeDatabaseUrl()
const prisma = new PrismaClient()

// Build session options
const sessionOptions = buildSessionOptions(session)

// Set up middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))
app.use(session(sessionOptions))
app.use(passport.initialize())
app.use(passport.session())
app.use(logAuthRequest)

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/users', userRoutes)
app.use('/api/user/profile', userProfileRoutes)
app.use('/api/user/settings', userSettingsRoutes)
app.use('/api/user/kyc', userKYCRoutes)
app.use('/api/templates', templatesRoutes)
app.use('/api/legal', legalRoutes)
app.use('/api/kyc', kycRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/cultivars', cultivarsRoutes)
app.use('/api/genetics', geneticsRoutes)
app.use('/api/pipelines', pipelinesRoutes)
app.use(pipelineCultureRoutes)
app.use('/api/flower-reviews', flowerReviewsRoutes)
app.use('/api/hash-reviews', hashReviewsRoutes)
app.use('/api/concentrate-reviews', concentrateReviewsRoutes)
app.use('/api/edible-reviews', edibleReviewsRoutes)
app.use('/api/library', libraryRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/pipeline-github', pipelineGithubRoutes)
app.use('/api/usage', usageRoutes)
app.use('/api/presets', presetsRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/debug', debugRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⛔ Shutting down gracefully...')
    await prisma.$disconnect()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    console.log('\n⛔ Received SIGTERM, shutting down...')
    await prisma.$disconnect()
    process.exit(0)
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`🚀 Express server running on port ${PORT}`)
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
    console.log(`\n✅ Ready to accept requests!\n`)
})

export { prisma }
