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
 */

const SEPARATION_TYPE_LABELS = {
    'ice-water': 'Ice-Water / Bubble Hash',
    'dry-sift': 'Dry-Sift / Tamisage à sec',
    'ice-o-lator': 'Ice-O-Lator',
    'rosin-press': 'Pré-pressage (Rosin)',
    manual: 'Manuel / Artisanal',
    other: 'Autre méthode'
}

const EXTRACTION_METHOD_LABELS = {
    'rosin-press': 'Rosin Press (sans solvant)',
    'live-rosin': 'Live Rosin (fresh frozen)',
    'cold-cure-rosin': 'Cold Cure Rosin',
    bho: 'BHO (Butane Hash Oil)',
    pho: 'PHO (Propane Hash Oil)',
    co2: 'CO2 (supercritique)',
    'live-resin': 'Live Resin (BHO fresh frozen)',
    ethanol: 'Extraction à l\'éthanol',
    'dry-ice-rosin': 'Dry Ice Rosin',
    other: 'Autre méthode'
}

const CURING_TYPE_LABELS = {
    cold: 'Froid (<5°C)',
    warm: 'Chaud (>5°C)',
    room: 'Température ambiante',
    controlled: 'Contrôlée (cave)'
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
