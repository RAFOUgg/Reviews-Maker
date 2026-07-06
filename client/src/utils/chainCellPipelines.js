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
        { key: 'curing', label: 'Curing / Maturation', dataKey: 'curingTimelineData', configKey: 'curingTimelineConfig' },
        { key: 'general', label: 'Autres données' }
    ],
    hash: [
        { key: 'separation', label: 'Séparation', dataKey: 'separationTimelineData', configKey: 'separationTimelineConfig' },
        { key: 'curing', label: 'Curing / Maturation', dataKey: 'curingTimelineData', configKey: 'curingTimelineConfig' },
        { key: 'general', label: 'Autres données' }
    ],
    concentrate: [
        { key: 'extraction', label: 'Extraction', dataKey: 'extractionTimelineData', configKey: 'extractionTimelineConfig' },
        { key: 'curing', label: 'Curing / Maturation', dataKey: 'curingTimelineData', configKey: 'curingTimelineConfig' },
        { key: 'general', label: 'Autres données' }
    ],
    // L'edible n'a pas de timeline (pas de "cellule" à proprement parler) mais a une recette
    // (ingredients/etapesPreparation) — traitée comme catégorie à part (getRecipeCells), pas comme
    // un pipeline temporel. 'general' n'a pas d'équivalent utile ici (peu de champs scores communs).
    edible: [
        { key: 'recipe', label: 'Recette' }
    ]
}

// Catégories qui ne sont PAS des timelines de pipeline ET n'ont pas d'upsert dédié depuis la
// chaîne (pas de "cellule vide" à remplir) — juste un instantané en lecture, sélectionnable pour
// comparaison visuelle. 'general' EST éditable (cf. getGeneralFieldSchema + /api/review-general-
// fields) ; seule 'recipe' (ingrédients/étapes, structure différente) reste en lecture seule.
export const READONLY_CELL_CATEGORIES = new Set(['recipe'])

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

// Sections de données déjà renseignées sur la fiche (pas des pipelines) — noms de colonnes
// vérifiés directement dans schema.prisma pour chaque modèle (Flower/Hash/Concentrate n'ont
// PAS de convention de nommage uniforme pour les mêmes concepts : ex. "dureteScore" côté Fleur
// vs "durete" côté Hash/Concentré). Chaque triplet est [clé de colonne, libellé, unité?].
const GENERAL_SECTIONS_BY_TYPE = {
    flower: [
        { key: 'analytics', label: 'Analytique', fields: [
            ['thcPercent', 'THC', '%'], ['thcaPercent', 'THCA', '%'], ['cbdPercent', 'CBD', '%'], ['cbdaPercent', 'CBDA', '%'], ['cbgPercent', 'CBG', '%'],
            ['cbcPercent', 'CBC', '%'], ['cbnPercent', 'CBN', '%'], ['thcvPercent', 'THCV', '%']
        ] },
        { key: 'visual', label: 'Visuel', fields: [
            ['couleurScore', 'Couleur'], ['densiteVisuelle', 'Densité'], ['trichomesScore', 'Trichomes'],
            ['pistilsScore', 'Pistils'], ['manucureScore', 'Manucure'], ['moisissureScore', 'Moisissure'], ['grainesScore', 'Graines']
        ] },
        { key: 'aromas', label: 'Arômes', fields: [
            ['notesOdeursDominantes', 'Notes dominantes'], ['notesOdeursSecondaires', 'Notes secondaires'],
            ['intensiteAromeScore', 'Intensité'], ['complexiteAromeScore', 'Complexité'], ['fideliteAromeScore', 'Fidélité']
        ] },
        { key: 'texture', label: 'Texture', fields: [
            ['dureteScore', 'Dureté'], ['densiteTactileScore', 'Densité tactile'], ['elasticiteScore', 'Élasticité'],
            ['collantScore', 'Collant'], ['malleabiliteScore', 'Malléabilité'], ['friabiliteScore', 'Friabilité'],
            ['viscositeScore', 'Viscosité'], ['meltingScore', 'Melting'], ['residuScore', 'Résidus']
        ] },
        { key: 'effects', label: 'Effets & goût', fields: [
            ['effetsChoisis', 'Effets'], ['monteeScore', 'Montée'], ['intensiteEffetScore', 'Intensité effet'],
            ['intensiteGoutScore', 'Intensité goût'], ['agressiviteScore', 'Agressivité']
        ] }
    ],
    hash: [
        { key: 'analytics', label: 'Analytique', fields: [
            ['thcPercent', 'THC', '%'], ['thcaPercent', 'THCA', '%'], ['cbdPercent', 'CBD', '%'], ['cbdaPercent', 'CBDA', '%'], ['cbgPercent', 'CBG', '%'],
            ['cbcPercent', 'CBC', '%'], ['cbnPercent', 'CBN', '%'], ['thcvPercent', 'THCV', '%']
        ] },
        { key: 'visual', label: 'Visuel', fields: [
            ['couleurTransparence', 'Couleur/Transparence'], ['pureteVisuelle', 'Pureté'], ['densiteVisuelle', 'Densité'],
            ['pistils', 'Pistils'], ['moisissure', 'Moisissure'], ['graines', 'Graines']
        ] },
        { key: 'aromas', label: 'Arômes', fields: [
            ['notesDominantes', 'Notes dominantes'], ['notesSecondaires', 'Notes secondaires'],
            ['intensiteAromatique', 'Intensité'], ['complexiteAromeScore', 'Complexité'], ['fideliteCultivars', 'Fidélité']
        ] },
        { key: 'texture', label: 'Texture', fields: [
            ['durete', 'Dureté'], ['densiteTactile', 'Densité tactile'], ['collantScore', 'Collant'],
            ['malleabiliteScore', 'Malléabilité'], ['textureMeltingScore', 'Melting'], ['textureResiduScore', 'Résidus']
        ] },
        { key: 'effects', label: 'Effets & goût', fields: [
            ['effetsChoisis', 'Effets'], ['monteeRapidite', 'Montée'], ['intensiteEffets', 'Intensité effet'],
            ['intensite', 'Intensité goût'], ['agressivitePiquant', 'Agressivité']
        ] }
    ],
    concentrate: [
        { key: 'analytics', label: 'Analytique', fields: [
            ['thcPercent', 'THC', '%'], ['thcaPercent', 'THCA', '%'], ['cbdPercent', 'CBD', '%'], ['cbdaPercent', 'CBDA', '%'], ['cbgPercent', 'CBG', '%'],
            ['cbcPercent', 'CBC', '%'], ['cbnPercent', 'CBN', '%'], ['thcvPercent', 'THCV', '%']
        ] },
        { key: 'visual', label: 'Visuel', fields: [
            ['couleurTransparence', 'Couleur/Transparence'], ['viscosite', 'Viscosité'], ['pureteVisuelle', 'Pureté'],
            ['melting', 'Melting'], ['residus', 'Résidus'], ['pistils', 'Pistils'], ['moisissure', 'Moisissure']
        ] },
        { key: 'aromas', label: 'Arômes', fields: [
            ['notesDominantes', 'Notes dominantes'], ['notesSecondaires', 'Notes secondaires'],
            ['intensiteAromatique', 'Intensité'], ['complexiteAromeScore', 'Complexité'], ['fideliteCultivars', 'Fidélité']
        ] },
        { key: 'texture', label: 'Texture', fields: [
            ['durete', 'Dureté'], ['densiteTactile', 'Densité tactile'], ['collantScore', 'Collant'],
            ['textureMeltingScore', 'Melting'], ['textureResiduScore', 'Résidus']
        ] },
        { key: 'effects', label: 'Effets & goût', fields: [
            ['effetsChoisis', 'Effets'], ['monteeRapidite', 'Montée'], ['intensiteEffets', 'Intensité effet'],
            ['intensite', 'Intensité goût'], ['agressivitePiquant', 'Agressivité']
        ] }
    ]
}

function resolveGeneralFieldValue(reviewFlat, key) {
    let value = reviewFlat[key]
    if (value === null || value === undefined || value === '') return null
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        const parsed = safeParse(value)
        if (parsed !== null) value = parsed
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return null
        value = value.join(', ')
    }
    return value
}

// Champs stockés en JSON (tableau de chaînes) plutôt qu'en score numérique — reflet exact de la
// whitelist 'tags' côté server-new/routes/review-general-fields.js, pour rendre le bon type
// d'input (texte séparé par virgules) dans l'éditeur plutôt qu'un champ numérique.
const GENERAL_ARRAY_FIELD_KEYS = new Set([
    'notesOdeursDominantes', 'notesOdeursSecondaires', 'notesDominantes', 'notesSecondaires', 'effetsChoisis'
])

/**
 * "Autres données" — les scores/valeurs de la fiche (analytique, visuel, arômes, texture,
 * effets), regroupés par section comme une cellule de pipeline. Affiche TOUTES les sections
 * (y compris vides) pour pouvoir aussi bien sélectionner ce qui existe déjà que compléter une
 * section non renseignée — édité via /api/review-general-fields, pas une simple lecture.
 */
export function getGeneralDataCells(reviewFlat, reviewType) {
    if (!reviewFlat) return []
    const sections = GENERAL_SECTIONS_BY_TYPE[reviewType] || []
    return sections.map(section => {
        const fields = section.fields
            .map(([key, label, unit]) => {
                const value = resolveGeneralFieldValue(reviewFlat, key)
                if (value === null) return null
                return { key, label, value: `${value}${unit || ''}` }
            })
            .filter(Boolean)
        return {
            timestamp: section.key,
            cellLabel: section.label,
            hasData: fields.length > 0,
            fields,
            data: Object.fromEntries(section.fields.map(([key]) => {
                if (GENERAL_ARRAY_FIELD_KEYS.has(key)) {
                    const parsed = safeParse(reviewFlat[key])
                    return [key, Array.isArray(parsed) ? parsed.join(', ') : '']
                }
                return [key, reviewFlat[key] ?? '']
            }))
        }
    })
}

/**
 * Schéma de champs (au format PipelineCellEditor) pour éditer une section "Autres données" —
 * un input par champ de la section, texte pour les champs "tags" (séparés par virgules),
 * numérique pour les scores.
 */
export function getGeneralFieldSchema(reviewType, sectionKey) {
    const section = (GENERAL_SECTIONS_BY_TYPE[reviewType] || []).find(s => s.key === sectionKey)
    if (!section) return { sections: [] }
    return {
        sections: [{
            id: sectionKey,
            label: section.label,
            collapsed: false,
            fields: section.fields.map(([key, label, unit]) => ({
                key,
                label,
                unit,
                type: GENERAL_ARRAY_FIELD_KEYS.has(key) ? 'text' : 'number',
                step: 0.1
            }))
        }]
    }
}

/**
 * "Recette" (edible) — chaque ingrédient et chaque étape de préparation devient une cellule
 * sélectionnable, sur le même modèle que les cellules de pipeline (label + champs résumés).
 */
export function getRecipeCells(reviewFlat) {
    if (!reviewFlat) return []
    const ingredients = safeParse(reviewFlat.ingredients) || []
    const steps = safeParse(reviewFlat.etapesPreparation) || []
    const cells = []

    ;(Array.isArray(ingredients) ? ingredients : []).forEach((ing, i) => {
        const fields = []
        const qty = ing.quantite ?? ing.quantity
        if (qty) fields.push({ key: 'quantite', label: 'Quantité', value: `${qty}${ing.unite || ing.unit || ''}` })
        if (ing.type) fields.push({ key: 'type', label: 'Type', value: ing.type })
        cells.push({
            timestamp: `ingredient-${i}`,
            cellLabel: ing.nom || ing.name || `Ingrédient ${i + 1}`,
            hasData: true,
            fields,
            data: ing
        })
    })

    ;(Array.isArray(steps) ? steps : []).forEach((step, i) => {
        const fields = []
        const duree = step.duree ?? step.duration
        if (duree) fields.push({ key: 'duree', label: 'Durée', value: `${duree} min` })
        if (step.temperature) fields.push({ key: 'temperature', label: 'Température', value: `${step.temperature}°C` })
        cells.push({
            timestamp: `step-${i}`,
            cellLabel: step.action || `Étape ${i + 1}`,
            hasData: true,
            fields,
            data: step
        })
    })

    return cells
}

/**
 * Point d'entrée unique du picker : dispatch selon la catégorie (timeline de pipeline vs
 * "Autres données" vs "Recette") — évite à ChainCellPickerModal de connaître ces distinctions.
 */
export function getCellsForPipelineDef(reviewFlat, pipelineDef, reviewType) {
    if (!pipelineDef) return []
    if (pipelineDef.key === 'general') return getGeneralDataCells(reviewFlat, reviewType)
    if (pipelineDef.key === 'recipe') return getRecipeCells(reviewFlat)
    return getAllCellsForPipeline(reviewFlat, pipelineDef)
}
