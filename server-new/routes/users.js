import express from 'express'
import { prisma } from '../server.js'
import { asyncHandler, Errors, requireAuthOrThrow } from '../utils/errorHandler.js'
import { formatReviews } from '../utils/reviewFormatter.js'

const router = express.Router()

// GET /api/users/me/reviews - Reviews de l'utilisateur connecté
router.get('/me/reviews', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)

    const reviews = await prisma.review.findMany({
        where: { authorId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    discordId: true
                }
            },
            likes: true
        }
    })

    const formattedReviews = formatReviews(reviews, req.user)
    res.json(formattedReviews)
}))

// GET /api/users/me/stats - Statistiques de l'utilisateur
router.get('/me/stats', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)

    const totalReviews = await prisma.review.count({
        where: { authorId: req.user.id }
    })

    const reviews = await prisma.review.findMany({
        where: {
            authorId: req.user.id,
            note: { not: null }
        },
        select: { note: true, type: true }
    })

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.note || 0), 0) / reviews.length
        : 0

    const typeBreakdown = reviews.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1
        return acc
    }, {})

    res.json({
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        typeBreakdown,
        memberSince: req.user.createdAt
    })
}))

// GET /api/users/:id/profile - Profil public d'un utilisateur
router.get('/:id/profile', asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
            id: true,
            username: true,
            avatar: true,
            discordId: true,
            createdAt: true,
            _count: {
                select: { reviews: true }
            }
        }
    })

    if (!user) {
        throw Errors.USER_NOT_FOUND()
    }

    const publicReviews = await prisma.review.count({
        where: {
            authorId: req.params.id,
            isPublic: true
        }
    })

    res.json({
        id: user.id,
        username: user.username,
        avatar: user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}.png`,
        memberSince: user.createdAt,
        totalReviews: publicReviews
    })
}))

// GET /api/users/:id/reviews - Reviews publiques d'un utilisateur
router.get('/:id/reviews', asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
        where: {
            authorId: req.params.id,
            isPublic: true
        },
        orderBy: { createdAt: 'desc' },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    discordId: true
                }
            },
            likes: true
        }
    })

    const currentUser = (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) ? req.user : null
    const formattedReviews = formatReviews(reviews, currentUser)
    res.json(formattedReviews)
}))

// POST /api/users/update-legal-info - Mettre à jour les infos légales (âge, pays)
router.post('/update-legal-info', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)

    const { birthdate, country, region, legalAge } = req.body

    if (!birthdate || !country) {
        throw Errors.VALIDATION_ERROR('Date de naissance et pays requis')
    }

    // Vérifier que l'utilisateur a l'âge légal
    const birth = new Date(birthdate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }

    // Âge minimum selon pays
    const minAge = (country === 'US' || country === 'CA') ? 21 : 18

    if (age < minAge) {
        return res.status(403).json({
            error: 'age_insufficient',
            message: `Vous devez avoir ${minAge} ans minimum`,
            requiredAge: minAge,
            yourAge: age
        })
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
            birthdate: new Date(birthdate),
            country,
            region: region || null,
            legalAge: true
        }
    })

    res.json({
        success: true,
        message: 'Informations légales mises à jour',
        legalAge: true
    })
}))

// POST /api/users/accept-rdr - Accepter le disclaimer RDR
router.post('/accept-rdr', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)

    const { consentRDR } = req.body

    if (!consentRDR) {
        throw Errors.VALIDATION_ERROR('Le consentement est requis')
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
            consentRDR: true,
            consentDate: new Date()
        }
    })

    res.json({
        success: true,
        message: 'Consentement RDR enregistré',
        consentRDR: true
    })
}))

export default router
