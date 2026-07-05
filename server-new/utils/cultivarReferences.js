/**
 * Calcule, à la LECTURE uniquement (jamais stocké), les valeurs déjà connues pour un Cultivar
 * depuis ses sources liées :
 * - FlowerReview.cultivarId (FK, cf. cultivarSync.js resolveCultivarLink)
 * - GenNode.cultivarId (FK déjà existante, posée par UnifiedGeneticsCanvas.jsx quand un cultivar
 *   de la bibliothèque est glissé sur un canvas PhenoHunt — outil autonome ou mini-canvas intégré
 *   à une review Fleur)
 *
 * Les colonnes du Cultivar restent la valeur MANUELLE/déclarée par l'utilisateur (fallback
 * "catalogue avant toute review"). `buildLinkedReferences` liste ce qui est connu ailleurs (avec
 * sa provenance) et `computeEffective` calcule la valeur à afficher (manuelle si renseignée,
 * sinon dérivée des sources liées) sans jamais réécrire les colonnes.
 *
 * Le Cultivar passé en argument doit être chargé avec :
 *   include: {
 *     flowerReviews: { select: { ...CULTIVAR_FLOWER_REVIEW_SELECT... , review: { select: { holderName: true, createdAt: true } } } },
 *     genNodes: { select: { id: true, genetics: true, updatedAt: true, tree: { select: { name: true } } } }
 *   }
 */
import { mapGeneticType } from './cultivarSync.js'

export const CULTIVAR_FLOWER_REVIEW_SELECT = {
    reviewId: true,
    breeder: true,
    geneticType: true,
    varietyType: true,
    indicaPercent: true,
    thcPercent: true,
    cbdPercent: true,
    labReportUrl: true,
    phenotypeCode: true,
    updatedAt: true
}

export const CULTIVAR_GEN_NODE_SELECT = {
    id: true,
    genetics: true,
    updatedAt: true,
    tree: { select: { name: true } }
}

function safeParseGenetics(raw) {
    if (!raw) return {}
    if (typeof raw !== 'string') return raw
    try { return JSON.parse(raw) || {} } catch { return {} }
}

// Convertit une paire {value, unit} (phenoNodeFields.js number-unit) en semaines.
function toWeeks({ value, unit } = {}) {
    const n = Number(value)
    if (!Number.isFinite(n)) return null
    if (unit === 'j') return n / 7
    return n // déjà en semaines ('sem') ou unité inconnue laissée telle quelle
}

function reviewOrigin(fr) {
    return {
        kind: 'review',
        id: fr.reviewId,
        label: fr.review?.holderName || 'Review Fleur',
        date: fr.review?.createdAt || fr.updatedAt
    }
}

function nodeOrigin(node) {
    return {
        kind: 'phenohunt',
        id: node.id,
        label: node.tree?.name ? `Arbre "${node.tree.name}"` : 'Nœud PhenoHunt',
        date: node.updatedAt
    }
}

/**
 * @param {object} cultivar Cultivar chargé avec flowerReviews + genNodes (cf. selects ci-dessus)
 * @returns {object} références par champ, chacune `{ ...donnée, origin: {kind,id,label,date} }`
 */
export function buildLinkedReferences(cultivar) {
    const refs = {
        breeder: [], type: [], indicaRatio: [],
        thc: [], cbd: [], labReportUrl: [], phenotype: [],
        floweringWeeks: [], yield: []
    }

    for (const fr of cultivar.flowerReviews || []) {
        const origin = reviewOrigin(fr)
        if (fr.breeder) refs.breeder.push({ value: fr.breeder, origin })
        const type = mapGeneticType(fr.geneticType, fr.varietyType)
        if (type) refs.type.push({ value: type, origin })
        if (typeof fr.indicaPercent === 'number') refs.indicaRatio.push({ value: fr.indicaPercent, origin })
        if (typeof fr.thcPercent === 'number') {
            refs.thc.push({ min: fr.thcPercent, max: fr.thcPercent, source: fr.labReportUrl ? 'lab_tested' : 'breeder_claim', origin })
        }
        if (typeof fr.cbdPercent === 'number') {
            refs.cbd.push({ min: fr.cbdPercent, max: fr.cbdPercent, source: fr.labReportUrl ? 'lab_tested' : 'breeder_claim', origin })
        }
        if (fr.labReportUrl) refs.labReportUrl.push({ value: fr.labReportUrl, origin })
        if (fr.phenotypeCode) refs.phenotype.push({ value: fr.phenotypeCode, origin })
    }

    for (const node of cultivar.genNodes || []) {
        const genetics = safeParseGenetics(node.genetics)
        const origin = nodeOrigin(node)
        if (genetics.breeder) refs.breeder.push({ value: genetics.breeder, origin })
        const type = mapGeneticType(genetics.type)
        if (type) refs.type.push({ value: type, origin })
        if (genetics.ratio !== undefined && genetics.ratio !== '' && genetics.ratio !== null) {
            const n = Number(genetics.ratio)
            if (Number.isFinite(n)) refs.indicaRatio.push({ value: n, origin })
        }
        if (typeof genetics.thcMin === 'number' || typeof genetics.thcMax === 'number') {
            refs.thc.push({ min: genetics.thcMin ?? null, max: genetics.thcMax ?? null, source: genetics.thcSource || null, origin })
        }
        if (typeof genetics.cbdMin === 'number' || typeof genetics.cbdMax === 'number') {
            refs.cbd.push({ min: genetics.cbdMin ?? null, max: genetics.cbdMax ?? null, source: genetics.cbdSource || null, origin })
        }
        const weeks = toWeeks(genetics.floweringTime)
        if (weeks !== null) refs.floweringWeeks.push({ value: weeks, origin })
        if (genetics.yieldEstimate?.value !== undefined && genetics.yieldEstimate.value !== '') {
            const n = Number(genetics.yieldEstimate.value)
            if (Number.isFinite(n)) refs.yield.push({ value: n, unit: genetics.yieldEstimate.unit || null, origin })
        }
    }

    return refs
}

function numericRange(entries) {
    const mins = entries.map(e => e.min ?? e.value).filter(v => typeof v === 'number')
    const maxs = entries.map(e => e.max ?? e.value).filter(v => typeof v === 'number')
    if (mins.length === 0 && maxs.length === 0) return null
    return {
        min: mins.length ? Math.min(...mins) : null,
        max: maxs.length ? Math.max(...maxs) : null,
        source: entries.some(e => e.source === 'lab_tested') ? 'lab_tested' : (entries[0]?.source || null)
    }
}

/**
 * Valeur à afficher pour chaque champ : manuelle si renseignée sur le Cultivar, sinon dérivée
 * des références liées. Ne modifie jamais `cultivar` ni la base — purement calculé pour la réponse API.
 */
export function computeEffective(cultivar, refs) {
    const thcRange = numericRange(refs.thc)
    const cbdRange = numericRange(refs.cbd)
    const floweringValues = refs.floweringWeeks.map(e => e.value)

    return {
        effectiveBreeder: cultivar.breeder || refs.breeder[0]?.value || null,
        effectiveType: cultivar.type || refs.type[0]?.value || null,
        effectiveIndicaRatio: cultivar.indicaRatio ?? refs.indicaRatio[0]?.value ?? null,
        effectiveThcMin: cultivar.thcMin ?? thcRange?.min ?? null,
        effectiveThcMax: cultivar.thcMax ?? thcRange?.max ?? null,
        effectiveThcSource: cultivar.thcSource || thcRange?.source || null,
        effectiveCbdMin: cultivar.cbdMin ?? cbdRange?.min ?? null,
        effectiveCbdMax: cultivar.cbdMax ?? cbdRange?.max ?? null,
        effectiveCbdSource: cultivar.cbdSource || cbdRange?.source || null,
        effectiveLabReportUrl: cultivar.labReportUrl || refs.labReportUrl[0]?.value || null,
        effectivePhenotype: cultivar.phenotype || refs.phenotype[0]?.value || null,
        effectiveFloweringMinWeeks: cultivar.floweringMinWeeks ?? (floweringValues.length ? Math.round(Math.min(...floweringValues)) : null),
        effectiveFloweringMaxWeeks: cultivar.floweringMaxWeeks ?? (floweringValues.length ? Math.round(Math.max(...floweringValues)) : null),
        effectiveYieldValue: cultivar.yieldValue ?? refs.yield[0]?.value ?? null,
        effectiveYieldUnit: cultivar.yieldUnit || refs.yield[0]?.unit || null
    }
}

export default { buildLinkedReferences, computeEffective, CULTIVAR_FLOWER_REVIEW_SELECT, CULTIVAR_GEN_NODE_SELECT }
