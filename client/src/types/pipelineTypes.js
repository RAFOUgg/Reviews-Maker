/**
 * PIPELINE SYSTEM - Types & Constants
 * Reviews-Maker MVP - Refonte CDC-compliant
 * 
 * Constantes et types pour tous les types de pipelines
 */

// ============================================================================
// TYPES DE BASE
// ============================================================================

export const INTERVAL_TYPES = {
    SECONDS: 'seconds',
    MINUTES: 'minutes',
    HOURS: 'hours',
    DAYS: 'days',
    WEEKS: 'weeks',
    MONTHS: 'months',
    PHASES: 'phases'
};

export const PIPELINE_TYPES = {
    CULTURE: 'culture',           // Fleurs uniquement
    CURING: 'curing',             // Tous sauf comestibles
    SEPARATION: 'separation',     // Hash uniquement
    EXTRACTION: 'extraction',     // Concentrés uniquement
    PURIFICATION: 'purification', // Hash + Concentrés
    RECIPE: 'recipe'              // Comestibles uniquement
};

export const PRODUCT_TYPES = {
    FLOWER: 'flower',
    HASH: 'hash',
    CONCENTRATE: 'concentrate',
    EDIBLE: 'edible'
};

// ============================================================================
// EXPORTS DEFAULT
// ============================================================================

export default {
    INTERVAL_TYPES,
    PIPELINE_TYPES,
    PRODUCT_TYPES
};
