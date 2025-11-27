import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import sqliteStore from 'connect-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

// Import routes
import authRoutes from './routes/auth.js'
import reviewRoutes from './routes/reviews.js'
import userRoutes from './routes/users.js'
import { requireAuth, optionalAuth, logAuthRequest } from './middleware/auth.js'

// Import config
import './config/passport.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const Store = sqliteStore(session)

const app = express()
// If running behind a reverse proxy (Nginx), trust X-Forwarded-* headers so passport/session
// and secure cookies behave correctly. `1` is the number of proxies in front of the app.
app.set('trust proxy', 1)
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
    // Allow the explicit FRONTEND_URL if provided. If running in development, allow any origin
    // to make it easier to test via network IPs. In production, validate origin strictly.
    origin: (origin, callback) => {
        // If no Origin header (eg. server-to-server/cli), allow
        if (!origin) return callback(null, true)
        // In development, allow any origin (dev convenience)
        if (process.env.NODE_ENV !== 'production') return callback(null, true)
        // Otherwise, only allow the configured front-end URL
        const allowed = process.env.FRONTEND_URL || 'http://localhost:5173'
        if (origin === allowed) return callback(null, true)
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

// Session configuration avec persistance SQLite
app.use(session({
    store: new Store({
        dir: path.join(__dirname, '../db'),
        db: 'sessions.db',
        concurrentDb: true
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        httpOnly: true,
        // En production, il est recommandé d'utiliser HTTPS; secure doit être true.
        // Optionally allow override using SESSION_SECURE=true|false
        secure: typeof process.env.SESSION_SECURE !== 'undefined'
            ? process.env.SESSION_SECURE === 'true'
            : process.env.NODE_ENV === 'production',
        // Autoriser override via env var en cas de besoins particuliers
        sameSite: process.env.SESSION_SAME_SITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
        path: '/'
    },
    name: 'sessionId' // Nom du cookie pour éviter les conflits
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Log auth requests
app.use(logAuthRequest)

// Static files (images)
app.use('/images', express.static(path.join(__dirname, '../db/review_images')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/users', userRoutes)

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist', 'index.html'))
    })
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    })
})

// 404 handler - must be after all routes
app.use((req, res) => {
    res.status(404).json({
        error: 'not_found',
        message: `Route ${req.method} ${req.path} not found`
    })
})

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
