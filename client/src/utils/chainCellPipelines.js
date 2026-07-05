/**
 * Cellules de pipeline (culture/curing/séparation/extraction) exploitables depuis la chaîne
 * de production — permet d'importer un snapshot d'une cellule d'une fiche technique (ex: "Jour 5
 * du curing") vers un nœud (bulle) ou une liaison du canvas Chaîne de production.
 *
 * Mapping des pipelines disponibles par type de review, vérifié directement dans les routes
 * backend (server-new/routes/{flower,hash,concentrate}-reviews.js) : chaque type persiste son
 * pipeline "de fabrication" (culture/séparation/extraction) + un pipeline curing commun.
 * L'edible n'a pas de pipeline à cellules (recette = ingredients/etapesPreparation, pas de
 * timeline), donc pas d'entrée ici.
 */

import { getCultureFieldById, CULTURE_SIDEBAR_CONTENT } from '../config/cultureSidebarContent'
import { getCuringFieldById, CURING_SIDEBAR_CONTENT } from '../config/curingSidebarContent'
import { getSeparationFieldById, SEPARATION_SIDEBAR_CONTENT } from '../config/separationSidebarContent'
import { getExtractionFieldById, EXTRACTION_SIDEBAR_CONTENT } from '../config/extractionSidebarContent'
import { CURING_PHASES, SEPARATION_PHASES, EXTRACTION_PHASES } from '../config/pipelinePhases'
import { resolveIntervalKey } from '../config/intervalTypes'

export const REVIEW_TYPE_PIPELINES = {
    flower: [
        { key: 'culture', label: 'Culture', dataKey: 'cultureTimelineData', configKey: 'cultureTimelineConfig' },
        { key: 'curing', label: 'Curing / Maturation', dataKey: 'curingTimelineData', configKey: 'curingTimelineConfig' }
    ],
    hash: [
        { key: 'separation', label: 'Séparation', dataKey: 'separationTimelineData', configKey: 'separationTimelineConfig' },
        { key: 'curing', label: 'Curing / Maturation', dataKey: 'curingTimelineData', configKey: 'curingTimelineConfig' }
    ],
    concentrate: [
        { key: 'extraction', label: 'Extraction', dataKey: 'extractionTimelineData', configKey: 'extractionTimelineConfig' },
        { key: 'curing', label: 'Curing / Maturation', dataKey: 'curingTimelineData', configKey: 'curingTimelineConfig' }
    ],
    edible: []
}

const FIELD_LOOKUPS = {
    culture: getCultureFieldById,
    curing: getCuringFieldById,
    separation: getSeparationFieldById,
    extraction: getExtractionFieldById
}

const SIDEBAR_CONTENT_BY_PIPELINE = {
    culture: CULTURE_SIDEBAR_CONTENT,
    curing: CURING_SIDEBAR_CONTENT,
    separation: SEPARATION_SIDEBAR_CONTENT,
    extraction: EXTRACTION_SIDEBAR_CONTENT
}

// Repli identique à PipelineDragDropView.generateCells() quand timelineConfig.phases n'est pas
// renseigné — la culture a son propre jeu d'ids historique ('phase-0'..'phase-12'), les autres
// pipelines retombent sur pipelinePhases.js (mêmes objets que le formulaire de création).
const DEFAULT_PHASES_BY_PIPELINE = {
    culture: Array.from({ length: 13 }, (_, i) => ({ id: `phase-${i}`, label: `Phase ${i + 1}` })),
    curing: CURING_PHASES.phases,
    separation: SEPARATION_PHASES.phases,
    extraction: EXTRACTION_PHASES.phases
}

// Clés techniques posées par PipelineDragDropView sur chaque entrée de timeline, à ignorer
// quand on résume le contenu d'une cellule (cf. PipelineDragDropView.jsx, ex. ligne 1359).
const META_KEYS = new Set(['timestamp', 'label', 'date', 'phase', '_meta'])

export function getPipelineDefsForReviewType(reviewType) {
    return REVIEW_TYPE_PIPELINES[reviewType] || []
}

// Métadonnée d'un champ (label/type/unit/options) pour construire un input d'édition — même
// source que le formulaire de création (config *SidebarContent.js), pas de schéma dupliqué.
export function getFieldMeta(pipelineType, key) {
    return FIELD_LOOKUPS[pipelineType]?.(key) || null
}

// Convertit une config *SidebarContent.js (sections → items) au format attendu par
// PipelineCellEditor.jsx (sections → fields, field.key au lieu de item.id) — même transformation
// que CuringMaturationSection.jsx fait pour PipelineDragDropView, réutilisée ici pour piloter le
// même composant d'édition générique depuis la chaîne de production.
export function getFieldSchemaForPipeline(pipelineKey) {
    const content = SIDEBAR_CONTENT_BY_PIPELINE[pipelineKey]
    if (!content) return { sections: [] }
    return {
        sections: Object.entries(content).map(([sectionId, section]) => ({
            id: sectionId,
            label: section.label || sectionId,
            icon: section.icon,
            collapsed: section.collapsed ?? true,
            fields: (section.items || []).map(item => ({ ...item, key: item.id }))
        })).filter(section => section.fields.length > 0)
    }
}

// Reconstruction fidèle de PipelineDragDropView.generateCells() (mêmes préfixes de timestamp,
// mêmes libellés, même repli phases par défaut) — nécessaire pour que les cellules VIDES créées
// ici tombent exactement sur les mêmes ids que celles que la fiche technique génèrerait elle-même,
// sinon un ajout depuis la chaîne créerait une cellule fantôme invisible dans le formulaire.
export function generateTimelineCells(pipelineKey, config = {}) {
    const intervalType = resolveIntervalKey(config.type) || config.type
    const { start, end, totalSeconds, totalHours, totalDays, totalWeeks } = config

    if (intervalType === 'seconde' && totalSeconds) {
        const count = Math.min(totalSeconds, 900)
        return Array.from({ length: count }, (_, i) => ({ timestamp: `sec-${i}`, cellLabel: `${i}s` }))
    }
    if (intervalType === 'heure' && totalHours) {
        const count = Math.min(totalHours, 336)
        return Array.from({ length: count }, (_, i) => ({ timestamp: `hour-${i}`, cellLabel: `${i}h` }))
    }
    if (intervalType === 'jour' && totalDays) {
        const count = Math.min(totalDays, 365)
        return Array.from({ length: count }, (_, i) => ({ timestamp: `day-${i + 1}`, cellLabel: `J${i + 1}` }))
    }
    if (intervalType === 'date' && start && end) {
        const startDate = new Date(start)
        const endDate = new Date(end)
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return []
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
        const count = Math.min(days, 365)
        return Array.from({ length: count }, (_, i) => {
            const date = new Date(startDate)
            date.setDate(date.getDate() + i)
            const dateStr = date.toISOString().split('T')[0]
            return { timestamp: `date-${dateStr}`, cellLabel: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) }
        })
    }
    if (intervalType === 'semaine' && totalWeeks) {
        return Array.from({ length: totalWeeks }, (_, i) => ({ timestamp: `week-${i + 1}`, cellLabel: `S${i + 1}` }))
    }
    if ((intervalType === 'mois' || intervalType === 'months') && config.totalMonths) {
        const count = Math.min(config.totalMonths || 0, 120)
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
        const startIdx = (Number(config.startMonth) && config.startMonth >= 1 && config.startMonth <= 12) ? (Number(config.startMonth) - 1) : 0
        return Array.from({ length: count }, (_, i) => ({ timestamp: `month-${i + 1}`, cellLabel: months[(startIdx + i) % 12] || `M${i + 1}` }))
    }
    if ((intervalType === 'annee' || intervalType === 'years') && config.totalYears) {
        const count = Math.min(config.totalYears || 0, 100)
        return Array.from({ length: count }, (_, i) => ({ timestamp: `year-${i + 1}`, cellLabel: `A${i + 1}` }))
    }
    if (intervalType === 'phases') {
        const phases = (config.phases && config.phases.length) ? config.phases : (DEFAULT_PHASES_BY_PIPELINE[pipelineKey] || [])
        return phases.map((phase, i) => ({
            timestamp: phase.id || `phase-${i}`,
            cellLabel: phase.label || phase.name || `Phase ${i + 1}`
        }))
    }
    return []
}

/**
 * Grille complète (cellules vides incluses) fusionnée avec les entrées déjà enregistrées — permet
 * d'afficher ET de compléter la trame depuis la chaîne de production, pas seulement les cellules
 * déjà remplies.
 */
export function getAllCellsForPipeline(reviewFlat, pipelineDef) {
    if (!reviewFlat || !pipelineDef) return []
    const rawData = safeParse(reviewFlat[pipelineDef.dataKey])
    const entries = Array.isArray(rawData) ? rawData : []
    const config = safeParse(reviewFlat[pipelineDef.configKey]) || {}
    const entryByTimestamp = new Map(entries.map(e => [String(e?.timestamp), e]))

    const grid = generateTimelineCells(pipelineDef.key, config)
    // Une entrée déjà enregistrée mais dont le timestamp ne correspond à aucune cellule de la
    // grille recalculée (config changée depuis, ancien id...) reste affichable/éditable plutôt
    // que silencieusement invisible.
    const gridTimestamps = new Set(grid.map(c => String(c.timestamp)))
    const orphanEntries = entries.filter(e => e && e.timestamp !== undefined && !gridTimestamps.has(String(e.timestamp)))

    return [...grid, ...orphanEntries.map(e => ({ timestamp: e.timestamp, cellLabel: formatCellTimestamp(e.timestamp, config) }))]
        .map(cell => {
            const entry = entryByTimestamp.get(String(cell.timestamp))
            const fields = entry ? summarizeCellFields(pipelineDef.key, entry) : []
            return {
                timestamp: cell.timestamp,
                cellLabel: cell.cellLabel,
                hasData: fields.length > 0,
                fields,
                data: entry || { timestamp: cell.timestamp }
            }
        })
}

function safeParse(value) {
    if (!value) return null
    if (typeof value !== 'string') return value
    try { return JSON.parse(value) } catch { return null }
}

// Reconstruit un libellé lisible pour un timestamp de cellule sans réimplémenter tout
// generateCells() (PipelineDragDropView.jsx) — on se contente de décoder le préfixe stable
// (day-/week-/month-/year-/hour-/sec-/date-) ou de chercher la phase correspondante dans la
// config (les ids de phase sont arbitraires : 'seed', 'drying', 'sep-1'...).
export function formatCellTimestamp(timestamp, config) {
    const ts = String(timestamp ?? '')
    if (ts.startsWith('day-')) return `J${ts.slice(4)}`
    if (ts.startsWith('week-')) return `S${ts.slice(5)}`
    if (ts.startsWith('month-')) return `M${ts.slice(6)}`
    if (ts.startsWith('year-')) return `A${ts.slice(5)}`
    if (ts.startsWith('hour-')) return `${ts.slice(5)}h`
    if (ts.startsWith('sec-')) return `${ts.slice(4)}s`
    if (ts.startsWith('date-')) {
        const d = new Date(ts.slice(5))
        return isNaN(d.getTime()) ? ts : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    }
    const phase = config?.phases?.find(p => p.id === ts)
    if (phase) return phase.label || phase.name || ts
    // Repli sur l'ancien fallback culture de PipelineDragDropView.generateCells() ('phase-0'..
    // 'phase-12', utilisé quand timelineConfig.phases n'était pas encore renseigné) — vu en
    // production sur des reviews existantes.
    if (ts.startsWith('phase-')) return `Phase ${Number(ts.slice(6)) + 1}`
    return ts
}

// Résumé lisible des champs remplis d'une cellule (ex: "Température: 22°C") — utilise les
// mêmes libellés/unités que le formulaire de création (config *SidebarContent.js).
export function summarizeCellFields(pipelineType, entry) {
    const lookup = FIELD_LOOKUPS[pipelineType]
    return Object.keys(entry || {})
        .filter(k => !META_KEYS.has(k) && entry[k] !== null && entry[k] !== undefined && entry[k] !== '')
        .map(k => {
            const field = lookup?.(k)
            const label = field?.label || k
            const unit = field?.unit ? ` ${field.unit}` : ''
            let value = entry[k]
            if (Array.isArray(value)) value = value.join(', ')
            return { key: k, label, value: `${value}${unit}` }
        })
}

/**
 * @param {object} reviewFlat review aplatie (flowerData/hashData/concentrateData fusionné à plat)
 * @param {object} pipelineDef un élément de REVIEW_TYPE_PIPELINES
 * @returns {Array<{timestamp, cellLabel, fields, data}>} cellules non vides, prêtes à être
 *          affichées/sélectionnées dans le picker d'import
 */
export function getFilledCellsForPipeline(reviewFlat, pipelineDef) {
    if (!reviewFlat || !pipelineDef) return []
    const rawData = safeParse(reviewFlat[pipelineDef.dataKey])
    const data = Array.isArray(rawData) ? rawData : []
    const config = safeParse(reviewFlat[pipelineDef.configKey]) || {}

    return data
        .filter(entry => entry && entry.timestamp !== undefined && entry.timestamp !== null)
        .map(entry => ({
            timestamp: entry.timestamp,
            cellLabel: formatCellTimestamp(entry.timestamp, config),
            fields: summarizeCellFields(pipelineDef.key, entry),
            data: entry
        }))
        .filter(cell => cell.fields.length > 0)
}
