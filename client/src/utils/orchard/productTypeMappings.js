/**
 * OrchardMaker Product Type Mappings
 * Defines which fields belong to which category for each product type
 * Allows OrchardPanel to work generically with all product types
 */

// ============================================================================
// FLOWER (FLEUR) MAPPINGS
// ============================================================================
export const FLOWER_CATEGORY_FIELDS = {
  // Field names matching the flat output of normalizeReviewDataByType
  // visual.* merged to top-level, explicit mappings in normalizeByType.js
  visual: ['colorRating', 'density', 'trichomes', 'pistils', 'manucure', 'mold', 'seeds'],
  smell: ['aromasIntensity', 'complexiteAromas', 'fideliteCultivars'],
  texture: ['hardness', 'elasticity', 'stickiness', 'density'],
  taste: ['intensiteFumee', 'agressivite'],
  effects: ['montee', 'intensiteEffet', 'dureeEffet']
};

// ============================================================================
// HASH (HASH, KIEF, ICE-O-LATOR, DRY-SIFT) MAPPINGS
// ============================================================================
export const HASH_CATEGORY_FIELDS = {
  visual: ['colorRating', 'transparency', 'density', 'mold', 'seeds'],
  smell: ['aromasIntensity', 'complexiteAromas', 'fideliteCultivars'],
  texture: ['hardness', 'melting', 'residue', 'friability'],
  taste: ['intensiteFumee', 'agressivite'],
  effects: ['montee', 'intensiteEffet', 'dureeEffet']
};

// ============================================================================
// CONCENTRATE (ROSIN, BHO, etc.) MAPPINGS
// ============================================================================
export const CONCENTRATE_CATEGORY_FIELDS = {
  visual: ['colorRating', 'transparency', 'density', 'melting', 'residue', 'mold'],
  smell: ['aromasIntensity', 'complexiteAromas', 'fideliteCultivars'],
  texture: ['hardness', 'friability', 'viscosity', 'melting'],
  taste: ['intensiteFumee', 'agressivite'],
  effects: ['montee', 'intensiteEffet', 'dureeEffet']
};

// ============================================================================
// EDIBLE (COMESTIBLE) MAPPINGS
// ============================================================================
export const EDIBLE_CATEGORY_FIELDS = {
  visual: [],
  smell: [],
  texture: [],
  taste: ['intensiteFumee', 'agressivite'],
  effects: ['montee', 'intensiteEffet', 'dureeEffet']
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
  flower: {
    amateur: [
      // profile
      'nomCommercial', 'holderName', 'title', 'mainImage', 'images', 'description', 'type', 'varietyType', 'farm',
      // analytics
      'thcPercent', 'cbdPercent', 'cbgPercent', 'terpeneProfile', 'analyticsPdfUrl',
      // visual
      'couleurNuancier', 'densiteVisuelle', 'trichomesScore', 'pistilsScore', 'manucureScore', 'moisissureScore', 'grainesScore',
      // odors
      'intensiteAromeScore', 'notesOdeursDominantes', 'notesOdeursSecondaires',
      // taste
      'intensiteGoutScore', 'agressiviteScore', 'dryPuffNotes', 'inhalationNotes', 'expirationNotes',
      // effects
      'monteeScore', 'intensiteEffetScore', 'effectDuration', 'effetsChoisis',
      // misc
      'geneticTreeId', 'breeder', 'variety'
    ],
    influencer: [
      // add curing/pipeline preview
      'coupling', // placeholder: handled by pipeline modules
    ],
    producteur: [
      // include pipelines and genetics
      'cultureTimelineData', 'cultureTimelineConfig', 'curingTimelineData', 'curingTimelineConfig', 'parentage'
    ]
  },
  hash: {
    amateur: [
      'nomCommercial', 'hashmaker', 'laboratoire', 'images', 'description', 'type', 'purity', 'methodeSeparation', 'tailleMailles', 'qualiteMatierePremiere',
      'couleurTransparence', 'pureteVisuelle', 'densiteVisuelle', 'pistils', 'moisissure', 'graines', 'viscosite', 'meltingScore', 'residuScore',
      'intensiteAromatique', 'dryPuffNotes', 'intensiteGoutScore', 'monteeScore'
    ],
    influencer: [],
    producteur: ['pipelineSeparation', 'pipelinePurification']
  },
  concentrate: {
    amateur: [
      'nomCommercial', 'hashmaker', 'laboratoire', 'images', 'type', 'purity', 'extractionMethod', 'viscositeVisuelle', 'pureteVisuelle'
    ],
    producteur: ['pipelineExtraction', 'pipelinePurification']
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
