/**
 * INDEX DES DONNÉES ET CONFIGURATIONS
 * Point d'entrée central pour toutes les données statiques du projet
 */

// ============================================================================
// DONNÉES STATIQUES
// ============================================================================

// Roue aromatique CATA (Check-All-That-Apply)
export {
    AROMAS,
    AROMA_CATEGORIES,
    getAromasByCategory,
    getSubcategories,
    getCategoryForAroma
} from './data/aromasWheel'

// Cannabinoïdes
export {
    CANNABINOIDS,
    CANNABINOID_CATEGORIES,
    getCannabinoidsByCategory,
    getCannabinoidById,
    calculateTotalCannabinoids,
    validateCannabinoidValues
} from './data/cannabinoids'

// Terpènes
export {
    TERPENES,
    TERPENE_CATEGORIES,
    getTerpeneById,
    searchTerpenesByAroma,
    searchTerpenesByEffect,
    calculateAromaProfile,
    calculateEffectProfile
} from './data/terpenes'

// Effets ressentis
export {
    EFFECTS,
    EFFECT_CATEGORIES,
    EFFECT_TAGS,
    getEffectsByCategory,
    getEffectsByTag,
    getEffectsByCategoryAndTag,
    getEffectById,
    getCategoryForEffect,
    getTagForEffect,
    countEffectsByCategory,
    countEffectsByTag,
    validateEffectsSelection
} from './data/effects'

// ============================================================================
// CONFIGURATIONS FORMULAIRES
// ============================================================================

// Configuration Fleurs (10 sections)
export {
    INFOS_GENERALES_CONFIG,
    GENETIQUES_CONFIG,
    ANALYTIQUES_CONFIG,
    VISUAL_CONFIG,
    ODEURS_CONFIG,
    GOUTS_CONFIG,
    TEXTURE_CONFIG,
    EFFETS_CONFIG,
    EXPERIENCE_CONFIG,
    SECONDAIRES_CONFIG,
    FLOWER_REVIEW_SECTIONS,
    getSectionById,
    getRequiredSections,
    getTotalFieldsCount
} from './config/flowerReviewConfig'

// Configuration Pipelines (Culture + Curing)
export {
    CULTURE_PIPELINE_CONFIG,
    CURING_PIPELINE_CONFIG
} from './config/pipelineConfigs'

// ============================================================================
// EXPORTS PAR DÉFAUT (tous regroupés)
// ============================================================================
export default {
    aromas: {
        items: require('./data/aromasWheel').AROMAS,
        categories: require('./data/aromasWheel').AROMA_CATEGORIES
    },
    cannabinoids: {
        items: require('./data/cannabinoids').CANNABINOIDS,
        categories: require('./data/cannabinoids').CANNABINOID_CATEGORIES
    },
    terpenes: {
        items: require('./data/terpenes').TERPENES,
        categories: require('./data/terpenes').TERPENE_CATEGORIES
    },
    effects: {
        items: require('./data/effects').EFFECTS,
        categories: require('./data/effects').EFFECT_CATEGORIES,
        tags: require('./data/effects').EFFECT_TAGS
    },
    sections: {
        flower: require('./config/flowerReviewConfig').FLOWER_REVIEW_SECTIONS,
        pipelines: {
            culture: require('./config/pipelineConfigs').CULTURE_PIPELINE_CONFIG,
            curing: require('./config/pipelineConfigs').CURING_PIPELINE_CONFIG
        }
    }
}
