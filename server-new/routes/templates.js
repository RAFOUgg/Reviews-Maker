import express from 'express'
import { prisma } from '../server.js'
import { asyncHandler, Errors, requireAuthOrThrow } from '../utils/errorHandler.js'
import fs from 'fs/promises'
import path from 'path'

const router = express.Router()

const DB_FILE = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'db', 'templates.json')

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
    if (hasPrismaTemplate()) {
        const where = publicOnly ? { isPublic: true } : {
            OR: [ { isPublic: true }, ...(currentUser ? [{ ownerId: currentUser.id }] : []) ]
        }
        return await prisma.template.findMany({ where, orderBy: { createdAt: 'desc' } })
    }

    const store = await readFileStore()
    return store.templates.filter(t => publicOnly ? t.isPublic : (t.isPublic || (currentUser && t.ownerId === currentUser.id)))
}

async function getTemplateById(id) {
    if (hasPrismaTemplate()) return await prisma.template.findUnique({ where: { id } })
    const store = await readFileStore()
    return store.templates.find(t => t.id === id)
}

async function createTemplate(data) {
    if (hasPrismaTemplate()) return await prisma.template.create({ data })
    const store = await readFileStore()
    // generate simple uuid
    const id = (Date.now().toString(36) + Math.random().toString(36).slice(2,8))
    const tpl = { id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    store.templates.unshift(tpl)
    await writeFileStore(store)
    return tpl
}

async function updateTemplate(id, data) {
    if (hasPrismaTemplate()) return await prisma.template.update({ where: { id }, data })
    const store = await readFileStore()
    const idx = store.templates.findIndex(t => t.id === id)
    if (idx === -1) return null
    store.templates[idx] = { ...store.templates[idx], ...data, updatedAt: new Date().toISOString() }
    await writeFileStore(store)
    return store.templates[idx]
}

async function deleteTemplateById(id) {
    if (hasPrismaTemplate()) return await prisma.template.delete({ where: { id } })
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
    if (!tpl.isPublic && (!currentUser || tpl.ownerId !== currentUser.id)) throw Errors.FORBIDDEN()
    res.json(tpl)
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

export default router
