/**
 * Routes API pour la gestion de la bibliothèque de cultivars
 * GET    /api/cultivars         - Liste des cultivars de l'utilisateur
 * GET    /api/cultivars/:id     - Détails d'un cultivar
 * POST   /api/cultivars         - Créer un cultivar
 * PUT    /api/cultivars/:id     - Modifier un cultivar
 * DELETE /api/cultivars/:id     - Supprimer un cultivar
 * GET    /api/cultivars/search  - Recherche/auto-complete
 */

import express from 'express'
import { prisma } from '../server.js'
import { asyncHandler, requireAuthOrThrow } from '../utils/errorHandler.js'

const router = express.Router()

// Middleware auth
const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' })
    }
    next()
}

/**
 * GET /api/cultivars
 * Liste tous les cultivars de l'utilisateur
 */
router.get('/', requireAuth, asyncHandler(async (req, res) => {
    const { search, sortBy = 'name', order = 'asc' } = req.query

    const where = {
        userId: req.user.id,
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { breeder: { contains: search, mode: 'insensitive' } },
            ]
        })
    }

    const cultivars = await prisma.cultivar.findMany({
        where,
        orderBy: { [sortBy]: order }
    })

    res.json(cultivars)
}))

/**
 * GET /api/cultivars/search?q=
 * Auto-complete pour recherche rapide
 */
router.get('/search', requireAuth, asyncHandler(async (req, res) => {
    const { q } = req.query

    if (!q || q.length < 2) {
        return res.json([])
    }

    const cultivars = await prisma.cultivar.findMany({
        where: {
            userId: req.user.id,
            name: { contains: q, mode: 'insensitive' }
        },
        select: {
            id: true,
            name: true,
            breeder: true,
            type: true
        },
        take: 10,
        orderBy: { useCount: 'desc' } // Les plus utilisés en premier
    })

    res.json(cultivars)
}))

/**
 * GET /api/cultivars/:id
 * Détails d'un cultivar
 */
router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
    const cultivar = await prisma.cultivar.findUnique({
        where: { id: req.params.id }
    })

    if (!cultivar) {
        return res.status(404).json({ error: 'Cultivar not found' })
    }

    if (cultivar.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' })
    }

    res.json(cultivar)
}))

/**
 * POST /api/cultivars
 * Créer un nouveau cultivar
 */
router.post('/', requireAuth, asyncHandler(async (req, res) => {
    const {
        name,
        breeder,
        type,
        indicaRatio,
        parentage,
        phenotype,
        notes
    } = req.body

    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required' })
    }

    // Vérifier si un cultivar avec ce nom existe déjà pour cet utilisateur
    const existing = await prisma.cultivar.findFirst({
        where: {
            userId: req.user.id,
            name: name.trim()
        }
    })

    if (existing) {
        return res.status(409).json({
            error: 'Cultivar already exists',
            message: 'Un cultivar avec ce nom existe déjà dans votre bibliothèque'
        })
    }

    const cultivar = await prisma.cultivar.create({
        data: {
            userId: req.user.id,
            name: name.trim(),
            breeder: breeder?.trim() || null,
            type: type || null,
            indicaRatio: indicaRatio ? parseInt(indicaRatio) : null,
            parentage: parentage ? JSON.stringify(parentage) : null,
            phenotype: phenotype?.trim() || null,
            notes: notes?.trim() || null,
        }
    })

    res.status(201).json(cultivar)
}))

/**
 * PUT /api/cultivars/:id
 * Modifier un cultivar
 */
router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
    const cultivar = await prisma.cultivar.findUnique({
        where: { id: req.params.id }
    })

    if (!cultivar) {
        return res.status(404).json({ error: 'Cultivar not found' })
    }

    if (cultivar.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' })
    }

    const {
        name,
        breeder,
        type,
        indicaRatio,
        parentage,
        phenotype,
        notes
    } = req.body

    const updated = await prisma.cultivar.update({
        where: { id: req.params.id },
        data: {
            ...(name && { name: name.trim() }),
            ...(breeder !== undefined && { breeder: breeder?.trim() || null }),
            ...(type !== undefined && { type: type || null }),
            ...(indicaRatio !== undefined && { indicaRatio: indicaRatio ? parseInt(indicaRatio) : null }),
            ...(parentage !== undefined && { parentage: parentage ? JSON.stringify(parentage) : null }),
            ...(phenotype !== undefined && { phenotype: phenotype?.trim() || null }),
            ...(notes !== undefined && { notes: notes?.trim() || null }),
            updatedAt: new Date()
        }
    })

    res.json(updated)
}))

/**
 * DELETE /api/cultivars/:id
 * Supprimer un cultivar
 */
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    const cultivar = await prisma.cultivar.findUnique({
        where: { id: req.params.id }
    })

    if (!cultivar) {
        return res.status(404).json({ error: 'Cultivar not found' })
    }

    if (cultivar.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' })
    }

    await prisma.cultivar.delete({
        where: { id: req.params.id }
    })

    res.json({ success: true, message: 'Cultivar deleted' })
}))

export default router
