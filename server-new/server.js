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
import pipelinesRoutes from './routes/pipelines.js'
import flowerReviewsRoutes from './routes/flower-reviews.js'
import hashReviewsRoutes from './routes/hash-reviews.js'
import concentrateReviewsRoutes from './routes/concentrate-reviews.js'
import edibleReviewsRoutes from './routes/edible-reviews.js'
import libraryRoutes from './routes/library.js'
import galleryRoutes from './routes/gallery.js'
import statsRoutes from './routes/stats.js'
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
            console.warn('[DB] Unable to ensure DB directory exists:', err.message)
        }

        // Set an absolute DATABASE_URL so Prisma always opens the expected file
        process.env.DATABASE_URL = `file:${resolved}`
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DB] Normalized DATABASE_URL -> ${process.env.DATABASE_URL}`)
        }
    }
}

normalizeDatabaseUrl()

const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
    // Allow the explicit FRONTEND_URL if provided. If running in development, allow any origin
    // to make it easier to test via network IPs. In production, validate origin strictly.
    origin: (origin, callback) => {
        // If no Origin header (eg. server-to-server/cli/file://), allow
        if (!origin) return callback(null, true)
        // In development, allow any origin (dev convenience)
        if (process.env.NODE_ENV !== 'production') return callback(null, true)
        // Allow file:// protocol for local HTML testing
        if (origin === 'null') return callback(null, true)

        // Liste des origines autorisées (frontend principal + localhost pour dev/tests)
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            'https://terpologie.eu',
            'https://www.terpologie.eu'
        ].filter(Boolean)

        if (allowedOrigins.includes(origin)) return callback(null, true)

        // Log des tentatives non autorisées pour debug
        console.warn(`[CORS] Origin non autorisée: ${origin}`)
        callback(new Error('Not allowed by CORS'))
    },
    credentials: true, // ✅ Essencial pour les cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24h preflight cache
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Optional base path support (eg. /reviews). If the app is served under a
// path prefix by a reverse proxy, incoming requests may include that prefix
// (eg. `/reviews/api/*`) but the server only mounts routes under `/api/*`.
// To handle this transparently, we rewrite requests that start with
// `${BASE_PATH}/api/` into `/api/` so the router matching still works.
// Configure a BASE_PATH env var when serving the app under a path prefix.
const BASE_PATH = process.env.BASE_PATH || ''
if (BASE_PATH) {
    app.use((req, res, next) => {
        if (req.path.startsWith(`${BASE_PATH}/api/`)) {
            // Rewrite URL so express sees the expected path
            const newUrl = req.originalUrl.replace(`${BASE_PATH}/api/`, '/api/')
            // Debug log to help troubleshooting on the server
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[BASE_PATH_REWRITE] ${req.method} ${req.originalUrl} -> ${newUrl}`)
            }
            req.url = newUrl
        }
        next()
    })
}

// Simple HTTP request logger to assist debugging in dev
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[HTTP] ${req.method} ${req.path} -- from ${req.ip}`)
        next()
    })
}

// Session configuration with persistent store (SQLite)
const sessionOptions = {
    store: new Store({
        dir: path.join(__dirname, '../db'),
        db: 'sessions.db',
        concurrentDb: true
    }),
    // Session secret used to sign cookies - require a strong secret in production
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        // In production, set secure to true and use HTTPS
        secure: typeof process.env.SESSION_SECURE !== 'undefined'
            ? process.env.SESSION_SECURE === 'true'
            : process.env.NODE_ENV === 'production',
        sameSite: typeof process.env.SESSION_SAME_SITE !== 'undefined'
            ? process.env.SESSION_SAME_SITE
            : (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
        path: '/'
    },
    name: 'sessionId'
}

// If SESSION_DOMAIN is provided, attach the domain to cookie options
if (process.env.SESSION_DOMAIN) {
    sessionOptions.cookie.domain = process.env.SESSION_DOMAIN
}

app.use(session(buildSessionOptions(session)))

// Optional: allow specifying a cookie domain via env var for cases where frontend
// is served from a specific subdomain and you need the cookie to be shared.
if (process.env.SESSION_DOMAIN) {
    console.log(`[SESSION] Cookie domain set to: ${process.env.SESSION_DOMAIN}`)
}

// Validate startup config (helpful for production debugging)
const frontendUrl = process.env.FRONTEND_URL || ''
const discordRedirect = process.env.DISCORD_REDIRECT_URI || ''
try {
    if (frontendUrl && discordRedirect) {
        const frontendHost = new URL(frontendUrl).host
        const redirectHost = new URL(discordRedirect).host
        if (frontendHost !== redirectHost) {
            console.warn(`[CONFIG] FRONTEND_URL host (${frontendHost}) does not match DISCORD_REDIRECT_URI host (${redirectHost}). This often causes OAuth issues (callback cookies mismatch).`)
        }
        if (!discordRedirect.endsWith('/api/auth/discord/callback')) {
            console.warn('[CONFIG] DISCORD_REDIRECT_URI should end with /api/auth/discord/callback; please verify the URL configured in the Discord Developer Portal')
        }
    }
} catch (err) {
    // Avoid throwing for invalid URLs — just log
    console.warn('[CONFIG] Unable to validate FRONTEND_URL / DISCORD_REDIRECT_URI:', err.message)
}

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Log auth requests
app.use(logAuthRequest)

// Static files (images)
app.use('/images', express.static(path.join(__dirname, '../db/review_images')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/reviews/flower', flowerReviewsRoutes) // IMPORTANT: Spécifique avant générique
app.use('/api/reviews/hash', hashReviewsRoutes)
app.use('/api/reviews/concentrate', concentrateReviewsRoutes)
app.use('/api/reviews/edible', edibleReviewsRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/users', userRoutes)
app.use('/api/templates', templatesRoutes)
app.use('/api/legal', legalRoutes)
app.use('/api/kyc', kycRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/cultivars', cultivarsRoutes)
app.use('/api/pipelines', pipelinesRoutes)
app.use('/api/library', libraryRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/stats', statsRoutes)

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist', 'index.html'))
    })
}
// Error handling middleware - must be last
app.use((err, req, res, next) => {
    // Log error for debugging
    console.error('Error occurred:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method
    })

    // Determine status code
    const statusCode = err.statusCode || err.status || 500

    // Send error response
    res.status(statusCode).json({
        error: err.code || 'internal_error',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
})

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...')
    await prisma.$disconnect()
    process.exit(0)
})

// Start server
// Bind to 0.0.0.0 so the server is reachable from other machines on the LAN.
app.listen(PORT, '0.0.0.0', () => {
    const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'http://localhost:5173' : 'dev:any-origin')
    console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🎯 Frontend URL: ${frontendUrl}`)
    console.log(`\n✅ Ready to accept requests!\n`)
})

export { prisma }
