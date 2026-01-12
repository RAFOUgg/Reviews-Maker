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
    // Beta tester = accès complet (équivalent producer)
    if (roles.includes('beta_tester')) return 'producer'
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
