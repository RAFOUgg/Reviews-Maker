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
// Champs de la section MATIERE_PREMIERE (separationSidebarContent.js) : décrivent la matière
// utilisée pour SÉPARER le hash, pas la review source — mais dans PipelineDragDropView (CDC),
// ces "items de configuration" sont déposés sur UNE cellule de la timeline (comme n'importe quel
// autre champ), jamais stockés en colonne dédiée. D'où findFieldInTimeline plus bas.
const MATERIAL_TYPE_OPTIONS = getSeparationFieldById('materialType')?.options || []
const MATERIAL_STATE_OPTIONS = getSeparationFieldById('materialState')?.options || []

const toLabelMap = (options) => options.reduce((acc, o) => { acc[o.value] = o.label; return acc }, {})

const SEPARATION_TYPE_LABELS = toLabelMap(SEPARATION_TYPE_OPTIONS)
const EXTRACTION_METHOD_LABELS = toLabelMap(EXTRACTION_METHOD_OPTIONS)
const CURING_TYPE_LABELS = toLabelMap(CURING_TYPE_OPTIONS)
const MATERIAL_TYPE_LABELS = toLabelMap(MATERIAL_TYPE_OPTIONS)
const MATERIAL_STATE_LABELS = toLabelMap(MATERIAL_STATE_OPTIONS)

// Les champs de configuration (type de matière, état, maillage...) sont déposés par
// drag&drop sur N'IMPORTE QUELLE cellule de la timeline (pas une colonne dédiée) — on scanne
// donc toutes les entrées pour trouver la première valeur renseignée pour cette clé.
function findFieldInTimeline(entries, key) {
    if (!Array.isArray(entries)) return null
    for (const entry of entries) {
        const value = entry?.[key]
        if (value === null || value === undefined || value === '') continue
        if (Array.isArray(value) && value.length === 0) continue
        return value
    }
    return null
}

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

        // separationType peut être posé au niveau config OU déposé sur une cellule (les deux
        // chemins coexistent selon la version du formulaire utilisée pour créer la fiche).
        const separationTypeValue = config?.separationType || findFieldInTimeline(data, 'separationType')
        const materialType = findFieldInTimeline(data, 'materialType')
        const materialState = findFieldInTimeline(data, 'materialState')
        const bagMicrons = findFieldInTimeline(data, 'bagMicrons')
        const screenMicrons = findFieldInTimeline(data, 'screenMicrons')
        const mesh = (Array.isArray(bagMicrons) && bagMicrons.length) ? bagMicrons
            : (Array.isArray(screenMicrons) && screenMicrons.length) ? screenMicrons
                : null

        return {
            kind: 'separation',
            label: 'Séparation',
            technique: SEPARATION_TYPE_LABELS[separationTypeValue] || separationTypeValue || null,
            stepCount: data.length,
            detail: config?.batchSize ? `Batch : ${config.batchSize}g` : null,
            materialType: materialType ? (MATERIAL_TYPE_LABELS[materialType] || materialType) : null,
            materialState: materialState ? (MATERIAL_STATE_LABELS[materialState] || materialState) : null,
            mesh: mesh ? mesh.map(m => `${m}µm`).join(', ') : null,
            // Déjà saisie sur la cellule "Date de séparation" (separationSidebarContent.js,
            // id 'processingDate') — pré-remplit la date de la liaison plutôt que de la redemander.
            date: findFieldInTimeline(data, 'processingDate')
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
            detail: config?.batchSize ? `Batch : ${config.batchSize}g` : null,
            // Déjà saisie sur la cellule "Date d'extraction" (extractionSidebarContent.js, id
            // 'processingDate') — pré-remplit la date de la liaison plutôt que de la redemander.
            date: findFieldInTimeline(data, 'processingDate')
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
        const typeComestible = targetReview.typeComestible || null
        if (ingredients.length === 0 && steps.length === 0 && !typeComestible) return null
        return {
            kind: 'recipe',
            label: 'Recette',
            // Sans type de comestible renseigné, repli générique — avec, on propose directement
            // la préparation correspondante (ex: "Préparation Cookies").
            technique: typeComestible ? `Préparation ${typeComestible}` : 'Préparation culinaire',
            stepCount: steps.length,
            detail: `${ingredients.length} ingrédient${ingredients.length > 1 ? 's' : ''}`,
            typeComestible,
            dosage: targetReview.dosage || null,
            dosageUnit: targetReview.dosageUnit || null
        }
    }

    return null
}
