/**
 * Résumé lisible du pipeline pertinent pour une liaison de chaîne de production,
 * dérivé des données déjà capturées sur la fiche technique CIBLE (le produit destination
 * documente lui-même comment il a été fabriqué à partir de sa/ses source(s)).
 *
 * Mapping (déterminé par le type de la review cible) :
 * - flower  -> pipeline curing/maturation (curingTimelineConfig/Data)
 * - hash    -> pipeline séparation (separationTimelineConfig/Data)
 * - concentrate -> pipeline extraction (extractionTimelineConfig/Data)
 * - edible  -> recette (ingredients/etapesPreparation)
 *
 * Noms de champs vérifiés directement dans le code de construction (pas supposés) :
 * client/src/components/pipelines/sections/{Separation,Extraction}PipelineSection.jsx,
 * client/src/components/sections/CuringMaturationSection.jsx,
 * client/src/pages/review/CreateEdibleReview/sections/RecipePipelineSection.jsx.
 *
 * Les options (value/label) sont importées depuis les configs *SidebarContent.js — ce sont
 * les mêmes qui alimentent les formulaires de création de review, pour ne jamais dériver
 * (ex: ChainEdgeFormModal propose ces mêmes libellés dans son menu déroulant "Technique").
 */

import { getSeparationFieldById } from '../config/separationSidebarContent'
import { getExtractionFieldById } from '../config/extractionSidebarContent'
import { getCuringFieldById } from '../config/curingSidebarContent'

const SEPARATION_TYPE_OPTIONS = getSeparationFieldById('separationType')?.options || []
const EXTRACTION_METHOD_OPTIONS = getExtractionFieldById('extractionMethod')?.options || []
const CURING_TYPE_OPTIONS = getCuringFieldById('curingType')?.options || []

const toLabelMap = (options) => options.reduce((acc, o) => { acc[o.value] = o.label; return acc }, {})

const SEPARATION_TYPE_LABELS = toLabelMap(SEPARATION_TYPE_OPTIONS)
const EXTRACTION_METHOD_LABELS = toLabelMap(EXTRACTION_METHOD_OPTIONS)
const CURING_TYPE_LABELS = toLabelMap(CURING_TYPE_OPTIONS)

/**
 * Options canoniques pour le champ "Technique" d'une liaison de chaîne, selon le type de la
 * review DESTINATION — les mêmes value/label que le formulaire de création utilise pour cette
 * étape de pipeline. Retourne [] quand le type n'a pas de vocabulaire de technique fixe (edible).
 */
export function getTechniqueOptionsForReviewType(reviewType) {
    if (reviewType === 'hash') return SEPARATION_TYPE_OPTIONS
    if (reviewType === 'concentrate') return EXTRACTION_METHOD_OPTIONS
    if (reviewType === 'flower') return CURING_TYPE_OPTIONS
    return []
}

function safeParse(value) {
    if (!value) return null
    if (typeof value !== 'string') return value
    try { return JSON.parse(value) } catch { return null }
}

/**
 * @param {string} targetReviewType clé interne ('flower'|'hash'|'concentrate'|'edible')
 * @param {object} targetReview review complète (réponse de GET /api/reviews/:id, flattened flowerData/hashData/etc.)
 * @returns {null|{kind, label, technique, stepCount, detail}}
 */
export function getPipelineSummaryForEdge(targetReviewType, targetReview) {
    if (!targetReview) return null

    if (targetReviewType === 'hash') {
        const config = safeParse(targetReview.separationTimelineConfig)
        const data = safeParse(targetReview.separationTimelineData) || []
        if (!config && data.length === 0) return null
        return {
            kind: 'separation',
            label: 'Séparation',
            technique: SEPARATION_TYPE_LABELS[config?.separationType] || config?.separationType || null,
            stepCount: data.length,
            detail: config?.batchSize ? `Batch : ${config.batchSize}g` : null
        }
    }

    if (targetReviewType === 'concentrate') {
        const config = safeParse(targetReview.extractionTimelineConfig)
        const data = safeParse(targetReview.extractionTimelineData) || []
        if (!config && data.length === 0) return null
        return {
            kind: 'extraction',
            label: 'Extraction',
            technique: EXTRACTION_METHOD_LABELS[config?.extractionMethod] || config?.extractionMethod || null,
            stepCount: data.length,
            detail: config?.batchSize ? `Batch : ${config.batchSize}g` : null
        }
    }

    if (targetReviewType === 'flower') {
        const config = safeParse(targetReview.curingTimelineConfig)
        const data = safeParse(targetReview.curingTimelineData) || []
        if (!config && data.length === 0) return null
        return {
            kind: 'curing',
            label: 'Curing / Maturation',
            technique: CURING_TYPE_LABELS[config?.curingType] || config?.curingType || null,
            stepCount: data.length,
            detail: config?.curingDuration ? `Durée prévue : ${config.curingDuration}j` : null
        }
    }

    if (targetReviewType === 'edible') {
        const ingredients = safeParse(targetReview.ingredients) || []
        const steps = safeParse(targetReview.etapesPreparation) || []
        if (ingredients.length === 0 && steps.length === 0) return null
        return {
            kind: 'recipe',
            label: 'Recette',
            technique: null,
            stepCount: steps.length,
            detail: `${ingredients.length} ingrédient${ingredients.length > 1 ? 's' : ''}`
        }
    }

    return null
}
