import express from 'express'
import { prisma } from '../server.js'
import { formatReview, liftOrchardFromExtra } from '../utils/reviewFormatter.js'
import { asyncHandler, Errors, requireAuthOrThrow } from '../utils/errorHandler.js'
import fs from 'fs/promises'
import path from 'path'

const router = express.Router()

const DB_FILE = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'db', 'templates.json')

// Helper pour déterminer le type de compte utilisateur
function getUserAccountType(user) {
    if (!user) return 'consumer'

    // Parse roles from JSON string
    let roles = []
    try {
        const rolesObj = JSON.parse(user.roles || '{"roles":[]}')
        roles = rolesObj.roles || []
    } catch (e) {
        roles = []
    }

    // Determine account type based on roles and subscription
    if (roles.includes('producer')) return 'producer'
    if (roles.includes('influencer_pro')) return 'influencer_pro'
    if (roles.includes('influencer_basic')) return 'influencer_basic'
    return 'consumer'
}

// Helper pour vérifier si un template est accessible à un type de compte
function canAccessTemplate(template, accountType) {
    if (!template.allowedAccountTypes) return true // Backward compatibility

    try {
        const allowed = JSON.parse(template.allowedAccountTypes)
        return allowed[accountType] === true
    } catch (e) {
        return true // En cas d'erreur de parsing, on autorise l'accès
    }
}

// Helper pour obtenir les options d'export selon le type de compte
function getExportOptions(template, accountType) {
    const defaultOptions = {
        png: true,
        jpeg: true,
        pdf: false,
        svg: false,
        csv: false,
        json: false,
        html: false,
        maxQuality: 150 // DPI max pour consumer
    }

    // Override selon le compte
    const accountExportLimits = {
        consumer: { png: true, jpeg: true, pdf: true, maxQuality: 150 },
        influencer_basic: { png: true, jpeg: true, svg: true, pdf: true, maxQuality: 300 },
        influencer_pro: { png: true, jpeg: true, svg: true, pdf: true, maxQuality: 300 },
        producer: { png: true, jpeg: true, svg: true, pdf: true, csv: true, json: true, html: true, maxQuality: 300 }
    }

    const accountLimits = accountExportLimits[accountType] || accountExportLimits.consumer

    // Merge template options with account limits
    try {
        const templateOptions = JSON.parse(template.exportOptions || '{}')
        return { ...defaultOptions, ...accountLimits, ...templateOptions }
    } catch (e) {
        return { ...defaultOptions, ...accountLimits }
    }
}

async function ensureFileStore() {
    try {
        await fs.access(DB_FILE)
    } catch (err) {
        // create parent dir and file
        await fs.mkdir(path.dirname(DB_FILE), { recursive: true })
        await fs.writeFile(DB_FILE, JSON.stringify({ templates: [] }, null, 2))
    }
}

async function readFileStore() {
    await ensureFileStore()
    const raw = await fs.readFile(DB_FILE, 'utf8')
    try { return JSON.parse(raw) } catch (e) { return { templates: [] } }
}

async function writeFileStore(obj) {
    await ensureFileStore()
    await fs.writeFile(DB_FILE, JSON.stringify(obj, null, 2), 'utf8')
}

function hasPrismaTemplate() {
    try {
        return !!prisma && typeof prisma.template !== 'undefined'
    } catch (e) {
        return false
    }
}

// Helper wrappers that use Prisma if available, otherwise file store
async function listTemplates(currentUser, publicOnly = false) {
    const accountType = getUserAccountType(currentUser)

    // If a file-store has templates seeded, prefer those (fast path)
    const store = await readFileStore()
    if (store && Array.isArray(store.templates) && store.templates.length > 0) {
        return store.templates.filter(t => {
            // Check public/owner access
            const hasAccess = publicOnly ? t.isPublic : (t.isPublic || (currentUser && t.ownerId === currentUser.id))
            if (!hasAccess) return false

            // Check account type permissions
            return canAccessTemplate(t, accountType)
        })
    }

    if (hasPrismaTemplate()) {
        try {
            const where = publicOnly ? { isPublic: true } : {
                OR: [{ isPublic: true }, ...(currentUser ? [{ ownerId: currentUser.id }] : [])]
            }
            const templates = await prisma.template.findMany({ where, orderBy: { createdAt: 'desc' } })

            // Filter by account type
            return templates.filter(t => canAccessTemplate(t, accountType))
        } catch (e) {
            console.warn('Prisma templates read failed, falling back to file store', e && e.message)
        }
    }

    return []
}

async function getTemplateById(id) {
    if (hasPrismaTemplate()) {
        try { return await prisma.template.findUnique({ where: { id } }) } catch (e) {
            console.warn('Prisma getTemplateById failed, fallback to file store', e && e.message)
        }
    }
    const store = await readFileStore()
    return store.templates.find(t => t.id === id)
}

async function createTemplate(data) {
    if (hasPrismaTemplate()) {
        try { return await prisma.template.create({ data }) } catch (e) {
            console.warn('Prisma createTemplate failed, fallback to file store', e && e.message)
        }
    }
    const store = await readFileStore()
    // generate simple uuid
    const id = (Date.now().toString(36) + Math.random().toString(36).slice(2, 8))
    const tpl = { id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    store.templates.unshift(tpl)
    await writeFileStore(store)
    return tpl
}

async function updateTemplate(id, data) {
    if (hasPrismaTemplate()) {
        try { return await prisma.template.update({ where: { id }, data }) } catch (e) {
            console.warn('Prisma updateTemplate failed, fallback to file store', e && e.message)
        }
    }
    const store = await readFileStore()
    const idx = store.templates.findIndex(t => t.id === id)
    if (idx === -1) return null
    store.templates[idx] = { ...store.templates[idx], ...data, updatedAt: new Date().toISOString() }
    await writeFileStore(store)
    return store.templates[idx]
}

async function deleteTemplateById(id) {
    if (hasPrismaTemplate()) {
        try { return await prisma.template.delete({ where: { id } }) } catch (e) {
            console.warn('Prisma deleteTemplateById failed, fallback to file store', e && e.message)
        }
    }
    const store = await readFileStore()
    store.templates = store.templates.filter(t => t.id !== id)
    await writeFileStore(store)
    return true
}

// Routes
router.get('/', asyncHandler(async (req, res) => {
    const currentUser = (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) ? req.user : null
    const publicOnly = req.query.publicOnly === 'true' || req.query.publicOnly === true
    const templates = await listTemplates(currentUser, publicOnly)
    res.json(templates)
}))

router.get('/:id', asyncHandler(async (req, res) => {
    const tpl = await getTemplateById(req.params.id)
    if (!tpl) throw Errors.NOT_FOUND('Template')

    const isAuthenticated = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false
    const currentUser = isAuthenticated ? req.user : null

    // Check basic access (public or owner)
    if (!tpl.isPublic && (!currentUser || tpl.ownerId !== currentUser.id)) throw Errors.FORBIDDEN()

    // Check account type permissions
    const accountType = getUserAccountType(currentUser)
    if (!canAccessTemplate(tpl, accountType)) {
        return res.status(403).json({
            error: 'template_restricted',
            message: 'Ce template nécessite un compte premium (Influenceur ou Producteur)',
            requiredAccountType: tpl.isPremium ? 'influencer_basic' : 'consumer'
        })
    }

    // Add export options based on account type
    const exportOptions = getExportOptions(tpl, accountType)

    res.json({
        ...tpl,
        exportOptions,
        userAccountType: accountType
    })
}))

router.post('/', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)
    const { name, description, isPublic, config } = req.body
    if (!name || !config) throw Errors.VALIDATION_ERROR([{ field: 'name|config', message: 'name and config are required' }])
    const data = { name, description: description || null, ownerId: req.user.id, isPublic: !!isPublic, config }
    const tpl = await createTemplate(data)
    res.status(201).json(tpl)
}))

router.put('/:id', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)
    const tpl = await getTemplateById(req.params.id)
    if (!tpl) throw Errors.NOT_FOUND('Template')
    if (tpl.ownerId !== req.user.id) throw Errors.NOT_OWNER('template')
    const { name, description, isPublic, config } = req.body
    const updated = await updateTemplate(req.params.id, { name: name || tpl.name, description: typeof description !== 'undefined' ? description : tpl.description, isPublic: typeof isPublic !== 'undefined' ? !!isPublic : tpl.isPublic, config: config || tpl.config })
    res.json(updated)
}))

router.delete('/:id', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)
    const tpl = await getTemplateById(req.params.id)
    if (!tpl) throw Errors.NOT_FOUND('Template')
    if (tpl.ownerId !== req.user.id) throw Errors.NOT_OWNER('template')
    await deleteTemplateById(req.params.id)
    res.json({ message: 'Template deleted' })
}))

router.post('/:id/copy', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)
    const tpl = await getTemplateById(req.params.id)
    if (!tpl) throw Errors.NOT_FOUND('Template')
    if (!tpl.isPublic && tpl.ownerId !== req.user.id) throw Errors.FORBIDDEN()
    const copyData = { name: `${tpl.name} (copied)`, description: tpl.description, ownerId: req.user.id, isPublic: false, config: tpl.config }
    const copy = await createTemplate(copyData)
    res.status(201).json(copy)
}))

// POST /api/templates/:id/export - generate a simple HTML render of the template bound to review data
router.post('/:id/export', asyncHandler(async (req, res) => {
    // Accept either reviewData in body or reviewId to fetch
    const tpl = await getTemplateById(req.params.id)
    if (!tpl) throw Errors.NOT_FOUND('Template')

    const { reviewId, reviewData } = req.body || {}
    let bound = reviewData || null
    if (reviewId) {
        try {
            const review = await prisma.review.findUnique({ where: { id: reviewId }, include: { author: { select: { id: true, username: true, avatar: true, discordId: true } }, likes: true } })
            bound = review ? liftOrchardFromExtra(formatReview(review, null)) : null
        } catch (e) {
            // prisma may not be available or table missing
            bound = null
        }
    }

    // Build a very small HTML based on template config
    const config = typeof tpl.config === 'string' ? JSON.parse(tpl.config || '{}') : tpl.config
    const page = (config.pages && config.pages[0]) || { zones: [] }

    function renderZone(zone) {
        let content = ''
        if (bound) {
            if (zone.source === 'holderName') content = bound.holderName || ''
            if (zone.source === 'images[0]') {
                const img = bound.mainImageUrl || bound.thumbnailUrl || (bound.images && Array.isArray(bound.images) && bound.images[0] ? (bound.images[0].startsWith('/images/') ? bound.images[0] : `/images/${bound.images[0]}`) : null)
                content = img ? `<img src="${img}" style="max-width:100%"/>` : ''
            }
        }
        const style = `position:absolute; left:${zone.x || 0}px; top:${zone.y || 0}px; width:${zone.w || 200}px; height:${zone.h || 50}px; overflow:hidden; padding:6px;`;
        return `<div style="${style}">${content}</div>`
    }

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${tpl.name}</title></head><body><div style="position:relative;width:800px;height:1100px;">${page.zones.map(renderZone).join('')}</div></body></html>`

    res.setHeader('Content-Type', 'text/html')
    res.send(html)
}))

function formatBoundReview(review) {
    if (!review) return null
    // normalize review fields we use
    return {
        holderName: review.holderName || review.holder_name || '',
        mainImageUrl: review.mainImageUrl || (review.mainImage ? `/images/${review.mainImage}` : null),
        // keep raw for frontend
        ...review
    }
}

// ===========================
// Routes de partage templates
// ===========================

// POST /api/templates/:id/share - Créer un code de partage
router.post('/:id/share', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)
    const tpl = await getTemplateById(req.params.id)
    if (!tpl) throw Errors.NOT_FOUND('Template')
    if (tpl.ownerId !== req.user.id) throw Errors.NOT_OWNER('template')

    const { maxUses, expiresInDays } = req.body

    // Générer un code unique
    const shareCode = generateShareCode()

    const shareData = {
        templateId: tpl.id,
        shareCode,
        createdBy: req.user.id,
        maxUses: maxUses || null,
        expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null
    }

    // Save to DB if available
    if (hasPrismaTemplate()) {
        try {
            const share = await prisma.templateShare.create({ data: shareData })
            return res.status(201).json({
                shareCode: share.shareCode,
                shareUrl: `${req.protocol}://${req.get('host')}/templates/import/${share.shareCode}`,
                expiresAt: share.expiresAt,
                maxUses: share.maxUses
            })
        } catch (e) {
            console.warn('Failed to save share to DB:', e.message)
        }
    }

    // Fallback: store in file
    const store = await readFileStore()
    if (!store.shares) store.shares = []
    store.shares.push({ ...shareData, id: shareCode, createdAt: new Date().toISOString() })
    await writeFileStore(store)

    res.status(201).json({
        shareCode,
        shareUrl: `${req.protocol}://${req.get('host')}/templates/import/${shareCode}`,
        expiresAt: shareData.expiresAt,
        maxUses: shareData.maxUses
    })
}))

// GET /api/templates/import/:code - Importer un template via code
router.get('/import/:code', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)
    const { code } = req.params

    let share = null

    // Try DB first
    if (hasPrismaTemplate()) {
        try {
            share = await prisma.templateShare.findUnique({
                where: { shareCode: code }
            })
        } catch (e) {
            console.warn('Failed to fetch share from DB:', e.message)
        }
    }

    // Fallback: file store
    if (!share) {
        const store = await readFileStore()
        share = store.shares?.find(s => s.shareCode === code)
    }

    if (!share) {
        return res.status(404).json({
            error: 'share_not_found',
            message: 'Code de partage invalide ou expiré'
        })
    }

    // Check validity
    if (!share.isActive) {
        return res.status(403).json({
            error: 'share_inactive',
            message: 'Ce lien de partage a été désactivé'
        })
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
        return res.status(403).json({
            error: 'share_expired',
            message: 'Ce lien de partage a expiré'
        })
    }

    if (share.maxUses && share.usedCount >= share.maxUses) {
        return res.status(403).json({
            error: 'share_limit_reached',
            message: 'Ce lien de partage a atteint sa limite d\'utilisations'
        })
    }

    // Get original template
    const originalTemplate = await getTemplateById(share.templateId)
    if (!originalTemplate) {
        return res.status(404).json({
            error: 'template_not_found',
            message: 'Le template partagé n\'existe plus'
        })
    }

    // Create a copy for the user
    const copyData = {
        name: `${originalTemplate.name} (importé)`,
        description: originalTemplate.description,
        ownerId: req.user.id,
        isPublic: false,
        isPremium: originalTemplate.isPremium,
        category: 'shared',
        templateType: originalTemplate.templateType,
        format: originalTemplate.format,
        maxPages: originalTemplate.maxPages,
        config: originalTemplate.config,
        allowedAccountTypes: originalTemplate.allowedAccountTypes,
        exportOptions: originalTemplate.exportOptions
    }

    const importedTemplate = await createTemplate(copyData)

    // Increment usage counter
    if (hasPrismaTemplate()) {
        try {
            await prisma.templateShare.update({
                where: { id: share.id },
                data: { usedCount: { increment: 1 } }
            })
        } catch (e) {
            console.warn('Failed to increment share usage:', e.message)
        }
    } else {
        const store = await readFileStore()
        const idx = store.shares?.findIndex(s => s.shareCode === code)
        if (idx !== -1) {
            store.shares[idx].usedCount = (store.shares[idx].usedCount || 0) + 1
            await writeFileStore(store)
        }
    }

    res.status(201).json({
        message: 'Template importé avec succès',
        template: importedTemplate
    })
}))

// Helper pour générer un code de partage unique
function generateShareCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sans caractères ambigus
    let code = ''
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

export default router
