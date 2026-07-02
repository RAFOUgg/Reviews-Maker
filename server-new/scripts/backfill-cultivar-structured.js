/**
 * backfill-cultivar-structured.js
 *
 * Migration ponctuelle et idempotente : parse les données historiques stockées en JSON dans
 * `Cultivar.notes` (thcRange/cbdRange/floweringTime/yield/tags) et remplit les nouvelles colonnes
 * structurées (thcMin/thcMax/cbdMin/cbdMax/floweringMinWeeks/floweringMaxWeeks/yieldValue/yieldUnit/tags)
 * quand elles sont vides. Ne touche JAMAIS à `notes` — aucune perte possible même en cas d'échec
 * de parsing. Règles de parsing volontairement strictes : en cas d'ambiguïté, la colonne reste
 * null plutôt que de deviner une valeur.
 *
 * Usage :
 *   node server-new/scripts/backfill-cultivar-structured.js --dry-run   (inspection, aucune écriture)
 *   node server-new/scripts/backfill-cultivar-structured.js             (application réelle)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const dryRun = process.argv.includes('--dry-run')

function normalize(str) {
    return String(str).trim().replace(/[–—]/g, '-').replace(/%/g, '')
}

/** "18-24" -> {min:18,max:24} | "22" -> {min:22,max:22} | "<1" -> {min:null,max:1} | ">30" -> {min:30,max:null} */
function parsePercentRange(raw) {
    if (!raw || typeof raw !== 'string') return null
    const s = normalize(raw)
    let m = s.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/)
    if (m) return boundPct({ min: parseFloat(m[1]), max: parseFloat(m[2]) })
    m = s.match(/^<\s*(\d+(?:\.\d+)?)$/)
    if (m) return boundPct({ min: null, max: parseFloat(m[1]) })
    m = s.match(/^>\s*(\d+(?:\.\d+)?)$/)
    if (m) return boundPct({ min: parseFloat(m[1]), max: null })
    m = s.match(/^(\d+(?:\.\d+)?)$/)
    if (m) return boundPct({ min: parseFloat(m[1]), max: parseFloat(m[1]) })
    return null
}

function boundPct({ min, max }) {
    const ok = v => v === null || (v >= 0 && v <= 100)
    if (!ok(min) || !ok(max)) return null
    return { min, max }
}

/** "8-9 semaines" -> {min:8,max:9} | "8 semaines" -> {min:8,max:8}. Rejette explicitement les jours. */
function parseFloweringWeeks(raw) {
    if (!raw || typeof raw !== 'string') return null
    const s = normalize(raw).toLowerCase()
    if (/jour|day/.test(s)) return null // unité différente, ne pas deviner une conversion
    let m = s.match(/(\d+)\s*-\s*(\d+)/)
    if (m) return { min: parseInt(m[1], 10), max: parseInt(m[2], 10) }
    m = s.match(/(\d+)/)
    if (m) return { min: parseInt(m[1], 10), max: parseInt(m[1], 10) }
    return null
}

/** Ne parse que les formes non ambiguës "Ng/m²" / "Ng/plant" — tout le reste reste null. */
function parseYield(raw) {
    if (!raw || typeof raw !== 'string') return null
    const s = normalize(raw)
    let m = s.match(/(\d+(?:\.\d+)?)\s*g\s*\/\s*m[²2]/i)
    if (m) return { value: parseFloat(m[1]), unit: 'g_m2' }
    m = s.match(/(\d+(?:\.\d+)?)\s*g\s*\/\s*plant/i)
    if (m) return { value: parseFloat(m[1]), unit: 'g_plant' }
    return null
}

async function main() {
    const cultivars = await prisma.cultivar.findMany()
    let parsedCount = 0
    let skippedCount = 0
    let untouchedCount = 0

    for (const c of cultivars) {
        if (!c.notes || !c.notes.trim().startsWith('{')) { untouchedCount++; continue }

        let legacy
        try { legacy = JSON.parse(c.notes) } catch { skippedCount++; continue }
        if (!legacy || typeof legacy !== 'object') { skippedCount++; continue }

        const data = {}
        let touched = false

        if (c.thcMin === null && c.thcMax === null && legacy.thcRange) {
            const r = parsePercentRange(legacy.thcRange)
            if (r) { data.thcMin = r.min; data.thcMax = r.max; data.thcSource = 'breeder_claim'; touched = true }
        }
        if (c.cbdMin === null && c.cbdMax === null && legacy.cbdRange) {
            const r = parsePercentRange(legacy.cbdRange)
            if (r) { data.cbdMin = r.min; data.cbdMax = r.max; data.cbdSource = 'breeder_claim'; touched = true }
        }
        if (c.floweringMinWeeks === null && c.floweringMaxWeeks === null && legacy.floweringTime) {
            const r = parseFloweringWeeks(legacy.floweringTime)
            if (r) { data.floweringMinWeeks = r.min; data.floweringMaxWeeks = r.max; touched = true }
        }
        if (c.yieldValue === null && legacy.yield) {
            const r = parseYield(legacy.yield)
            if (r) { data.yieldValue = r.value; data.yieldUnit = r.unit; touched = true }
        }
        if (!c.tags && Array.isArray(legacy.tags) && legacy.tags.length) {
            data.tags = JSON.stringify(legacy.tags)
            touched = true
        }

        if (!touched) { skippedCount++; continue }

        parsedCount++
        console.log(`[${dryRun ? 'DRY-RUN' : 'APPLY'}] ${c.id} (${c.name}):`, data)
        if (!dryRun) {
            await prisma.cultivar.update({ where: { id: c.id }, data })
        }
    }

    console.log(`\nRésumé : ${parsedCount} cultivar(s) enrichis, ${skippedCount} ignorés (notes non parseable ou aucune valeur reconnue), ${untouchedCount} sans notes JSON.`)
    if (dryRun) console.log('Mode --dry-run : aucune écriture effectuée.')
}

main()
    .catch(err => { console.error(err); process.exitCode = 1 })
    .finally(() => prisma.$disconnect())
