import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

// Import routes
import authRoutes from './routes/auth.js'
import reviewRoutes from './routes/reviews.js'
import userRoutes from './routes/users.js'

// Import config
import './config/passport.js'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Static files (images)
app.use('/images', express.static('../db/review_images'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/users', userRoutes)

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    })
})

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err)
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    })
})

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...')
    await prisma.$disconnect()
    process.exit(0)
})

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
    console.log(`\n✅ Ready to accept requests!\n`)
})

export { prisma }
