import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { configurePassport } from './config/passport.js'
import authRoutes from './routes/auth.js'
import reviewsRoutes from './routes/reviews.js'
import usersRoutes from './routes/users.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Configuration CORS
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    }
}))

// Passport
configurePassport()
app.use(passport.initialize())
app.use(passport.session())

// Routes statiques pour les uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes API
app.use('/api/auth', authRoutes)
app.use('/api/reviews', reviewsRoutes)
app.use('/api/users', usersRoutes)

// Route de santé
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    })
})

// Gestion erreurs
app.use((err, req, res, next) => {
    console.error('Error:', err)
    res.status(err.status || 500).json({
        error: err.message || 'internal_server_error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
})

// Démarrage serveur
app.listen(PORT, () => {
    console.log(`\n🚀 Backend Reviews Maker démarré !`)
    console.log(`📡 API: http://localhost:${PORT}/api`)
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/discord`)
    console.log(`📸 Uploads: http://localhost:${PORT}/uploads`)
    console.log(`⚡ Env: ${process.env.NODE_ENV || 'development'}\n`)
})
