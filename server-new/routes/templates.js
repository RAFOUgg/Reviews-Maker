import express from 'express'
import { prisma } from '../server.js'
import { asyncHandler, Errors, requireAuthOrThrow } from '../utils/errorHandler.js'

const router = express.Router()

// GET /api/templates - list templates (public + current user's private ones)
router.get('/', asyncHandler(async (req, res) => {
    const currentUser = (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) ? req.user : null
    const publicOnly = req.query.publicOnly === 'true' || req.query.publicOnly === true

    const where = publicOnly ? { isPublic: true } : {
        OR: [
            { isPublic: true },
            ...(currentUser ? [{ ownerId: currentUser.id }] : [])
        ]
    }

    const templates = await prisma.template.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json(templates)
}))

// GET /api/templates/:id - get template if public or owner
router.get('/:id', asyncHandler(async (req, res) => {
    const tpl = await prisma.template.findUnique({ where: { id: req.params.id } })
    if (!tpl) throw Errors.NOT_FOUND('Template')

    const isAuthenticated = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false
    const currentUser = isAuthenticated ? req.user : null

    if (!tpl.isPublic && (!currentUser || tpl.ownerId !== currentUser.id)) {
        throw Errors.FORBIDDEN()
    }

    res.json(tpl)
}))

// POST /api/templates - create template (auth required)
router.post('/', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)
    const { name, description, isPublic, config } = req.body

    if (!name || !config) {
        throw Errors.VALIDATION_ERROR([{ field: 'name|config', message: 'name and config are required' }])
    }

    const tpl = await prisma.template.create({
        data: {
            name,
            description: description || null,
            ownerId: req.user.id,
            isPublic: !!isPublic,
            config
        }
    })

    res.status(201).json(tpl)
}))

// PUT /api/templates/:id - update (owner only)
router.put('/:id', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)
    const tpl = await prisma.template.findUnique({ where: { id: req.params.id } })
    if (!tpl) throw Errors.NOT_FOUND('Template')
    if (tpl.ownerId !== req.user.id) throw Errors.NOT_OWNER('template')

    const { name, description, isPublic, config } = req.body

    const updated = await prisma.template.update({
        where: { id: req.params.id },
        data: {
            name: name || tpl.name,
            description: typeof description !== 'undefined' ? description : tpl.description,
            isPublic: typeof isPublic !== 'undefined' ? !!isPublic : tpl.isPublic,
            config: config || tpl.config
        }
    })

    res.json(updated)
}))

// DELETE /api/templates/:id - delete (owner only)
router.delete('/:id', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)
    const tpl = await prisma.template.findUnique({ where: { id: req.params.id } })
    if (!tpl) throw Errors.NOT_FOUND('Template')
    if (tpl.ownerId !== req.user.id) throw Errors.NOT_OWNER('template')

    await prisma.template.delete({ where: { id: req.params.id } })
    res.json({ message: 'Template deleted' })
}))

// POST /api/templates/:id/copy - copy a public template into current user's templates
router.post('/:id/copy', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)
    const tpl = await prisma.template.findUnique({ where: { id: req.params.id } })
    if (!tpl) throw Errors.NOT_FOUND('Template')
    if (!tpl.isPublic && tpl.ownerId !== req.user.id) throw Errors.FORBIDDEN()

    const copy = await prisma.template.create({
        data: {
            name: `${tpl.name} (copied)`,
            description: tpl.description,
            ownerId: req.user.id,
            isPublic: false,
            config: tpl.config
        }
    })

    res.status(201).json(copy)
}))

export default router
