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

import { getCultureFieldById } from '../config/cultureSidebarContent'
import { getCuringFieldById } from '../config/curingSidebarContent'
import { getSeparationFieldById } from '../config/separationSidebarContent'
import { getExtractionFieldById } from '../config/extractionSidebarContent'

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
