/**
 * OrchardMaker Product Type Mappings
 * Defines which fields belong to which category for each product type
 * Allows OrchardPanel to work generically with all product types
 */

// ============================================================================
// FLOWER (FLEUR) MAPPINGS
// ============================================================================
export const FLOWER_CATEGORY_FIELDS = {
  visual: ['densite', 'trichome', 'pistil', 'manucure', 'moisissure', 'graines', 'couleur', 'pureteVisuelle'],
  smell: ['aromasIntensity', 'fideliteCultivars', 'complexiteAromas', 'intensiteAromatique'],
  texture: ['durete', 'densiteTexture', 'elasticite', 'collant'],
  taste: ['intensiteFumee', 'agressivite', 'cendre', 'douceur', 'persistanceGout'],
  effects: ['montee', 'intensiteEffet', 'dureeEffet'],
};

// ============================================================================
// HASH (HASH, KIEF, ICE-O-LATOR, DRY-SIFT) MAPPINGS
// ============================================================================
export const HASH_CATEGORY_FIELDS = {
  visual: ['couleur', 'pureteVisuelle', 'densite', 'pistil', 'moisissure', 'graines', 'viscosite', 'melting', 'residus'],
  smell: ['fideliteCultivars', 'intensiteAromatique'],
  texture: ['durete', 'densiteTexture', 'friabilite', 'melting'],
  taste: ['intensiteFumee', 'agressivite', 'cendre'],
  effects: ['montee', 'intensiteEffet', 'dureeEffet'],
};

// ============================================================================
// CONCENTRATE (ROSIN, BHO, etc.) MAPPINGS
// ============================================================================
export const CONCENTRATE_CATEGORY_FIELDS = {
  visual: ['couleur', 'viscosite', 'pureteVisuelle', 'melting', 'residus', 'pistil', 'moisissure'],
  smell: ['fideliteCultivars', 'intensiteAromatique'],
  texture: ['durete', 'densiteTexture', 'friabilite', 'melting'],
  taste: ['intensiteFumee', 'agressivite', 'cendre'],
  effects: ['montee', 'intensiteEffet', 'dureeEffet'],
};

// ============================================================================
// EDIBLE (COMESTIBLE) MAPPINGS
// ============================================================================
export const EDIBLE_CATEGORY_FIELDS = {
  visual: [], // Edibles don't have visual ratings
  smell: [],  // Edibles don't have smell ratings typically
  texture: [], // Edibles don't have texture ratings typically
  taste: ['intensiteFumee', 'agressivite', 'douceur'],
  effects: ['montee', 'intensiteEffet', 'dureeEffet'],
};

// ============================================================================
// EXPORT FUNCTION TO GET MAPPINGS BY TYPE
// ============================================================================
export function getCategoryFieldsByType(productType = 'flower') {
  const typeNormalized = productType?.toLowerCase() || 'flower';
  
  switch (typeNormalized) {
    case 'hash':
    case 'hash, kief, ice-o-lator, dry-sift':
      return HASH_CATEGORY_FIELDS;
    case 'concentrate':
    case 'concentré':
    case 'concentrés':
    case 'rosin':
    case 'bho':
      return CONCENTRATE_CATEGORY_FIELDS;
    case 'edible':
    case 'comestible':
    case 'comestibles':
      return EDIBLE_CATEGORY_FIELDS;
    case 'flower':
    case 'fleur':
    case 'fleurs':
    default:
      return FLOWER_CATEGORY_FIELDS;
  }
}

// ============================================================================
// PIPELINE SUPPORT BY PRODUCT TYPE
// ============================================================================
export const PIPELINE_TYPES_BY_PRODUCT = {
  flower: ['culture', 'curing'],
  hash: ['separation', 'curing'],
  concentrate: ['extraction', 'purification', 'curing'],
  edible: ['recipe'],
};

export function getPipelineTypesByProductType(productType = 'flower') {
  const typeNormalized = productType?.toLowerCase() || 'flower';
  return PIPELINE_TYPES_BY_PRODUCT[typeNormalized] || PIPELINE_TYPES_BY_PRODUCT.flower;
}

// ============================================================================
// FEATURE AVAILABILITY BY PRODUCT TYPE
// ============================================================================
export const FEATURES_BY_PRODUCT_TYPE = {
  flower: {
    hasGenealogy: true,
    hasCulturePipeline: true,
    hasCuringPipeline: true,
    hasEnvironmentData: true,
    hasFertilizationData: true,
    hasLightingData: true,
    supportsPipelineCustomization: true,
  },
  hash: {
    hasGenealogy: false,
    hasCulturePipeline: false,
    hasSeparationPipeline: true,
    hasCuringPipeline: true,
    supportsPipelineCustomization: true,
  },
  concentrate: {
    hasGenealogy: false,
    hasCulturePipeline: false,
    hasExtractionPipeline: true,
    hasPurificationPipeline: true,
    hasCuringPipeline: true,
    supportsPipelineCustomization: true,
  },
  edible: {
    hasGenealogy: false,
    hasRecipePipeline: true,
    supportsPipelineCustomization: false,
  },
};

export function getFeaturesByProductType(productType = 'flower') {
  const typeNormalized = productType?.toLowerCase() || 'flower';
  return FEATURES_BY_PRODUCT_TYPE[typeNormalized] || FEATURES_BY_PRODUCT_TYPE.flower;
}

// ============================================================================
// EXPORT DATA STRUCTURE BY PRODUCT TYPE
// ============================================================================
export const EXPORT_SECTIONS_BY_TYPE = {
  flower: ['profile', 'genetics', 'culture', 'visual', 'smell', 'texture', 'taste', 'effects', 'curing'],
  hash: ['profile', 'visual', 'smell', 'texture', 'taste', 'effects', 'curing'],
  concentrate: ['profile', 'visual', 'smell', 'texture', 'taste', 'effects', 'extraction', 'curing'],
  edible: ['profile', 'taste', 'effects', 'recipe'],
};

export function getExportSectionsByType(productType = 'flower') {
  const typeNormalized = productType?.toLowerCase() || 'flower';
  return EXPORT_SECTIONS_BY_TYPE[typeNormalized] || EXPORT_SECTIONS_BY_TYPE.flower;
}

// ============================================================================
// TEMPLATES AVAILABLE BY PRODUCT TYPE
// ============================================================================
export const AVAILABLE_TEMPLATES_BY_TYPE = {
  flower: ['compact', 'detailed', 'complete', 'influencer'],
  hash: ['compact', 'detailed', 'complete'],
  concentrate: ['compact', 'detailed', 'complete'],
  edible: ['compact', 'detailed'],
};

export function getAvailableTemplatesByType(productType = 'flower', accountType = 'Amateur') {
  const typeNormalized = productType?.toLowerCase() || 'flower';
  const templates = AVAILABLE_TEMPLATES_BY_TYPE[typeNormalized] || AVAILABLE_TEMPLATES_BY_TYPE.flower;
  
  // Filter based on account type (e.g., only Producteur can use advanced templates)
  if (accountType === 'Amateur') {
    return templates.filter(t => ['compact', 'detailed'].includes(t));
  }
  
  return templates;
}

// ============================================================================
// ALLOWED FIELDS PER PRODUCT TYPE AND ACCOUNT TIER
// ============================================================================
// These lists define which draggable fields should be available in Export Maker
// for each combination of product type and account tier. Keep lists minimal
// for 'amateur' tiers to match available input fields in the review form.
export const ALLOWED_FIELDS_BY_TYPE_AND_TIER = {
  hash: {
    amateur: [
      // basic / profile
      'holderName','title','mainImage','images','description','type',
      // provenance
      'breeder','farm','hashmaker','cultivarsList',
      // visual (hash-specific)
      'couleur','pureteVisuelle','densite','viscosite','melting','residus','pistils',
      // smell
      'aromasIntensity','fideliteCultivars',
      // texture
      'durete','densiteTexture','friabilite','viscositeTexture',
      // taste
      'intensiteFumee','agressivite','cendre',
      // effects
      'montee','intensiteEffet','dureeEffet',
      // extras commonly useful
      'terpenes','thcLevel'
    ],
    influencer: [
      // include amateur fields + sensorial tags
      /* reuse amateur then add */
    ],
    producteur: [
      // include influencer fields + pipelines & levels
      /* reuse influencer then add */
    ]
  }
};

// Helper to get allowed fields for a productType/accountTier
export function getAllowedFields(productType = 'flower', accountTier = 'amateur') {
  const type = (productType || 'flower').toLowerCase();
  const tierKey = (accountTier || 'amateur').toLowerCase();
  const entry = ALLOWED_FIELDS_BY_TYPE_AND_TIER[type];
  if (!entry) return null;

  // Try exact tier, fallback to 'amateur'
  return entry[tierKey] || entry['amateur'] || null;
}
