/**
 * Generic Normalizer for OrchardPanel
 * Works with any product type by using the product type mappings
 */

import { getCategoryFieldsByType } from './productTypeMappings';

/**
 * Normalize review data for any product type
 * @param {Object} reviewData - The raw review data
 * @param {String} productType - The product type (flower, hash, concentrate, edible)
 * @returns {Object} Normalized review data
 */
export function normalizeReviewDataByType(reviewData, productType = 'flower') {
  if (!reviewData) return null;

  let normalized = { ...reviewData };

  // --- Merge known nested section objects from forms into top-level fields ---
  // Many review forms use nested sections like `gouts`, `odeurs`, `texture`,
  // `effets`, `analytics`, `culture`, `recipe`, etc. Merge those keys into
  // the top-level normalized object so downstream templates and the Orchard
  // UI read the actual form values instead of empty flattened fields.
  try {
    const sectionKeys = ['gouts', 'odeurs', 'texture', 'effets', 'visual', 'visuel', 'analytics', 'culture', 'genetique', 'genetics', 'recipe', 'curing', 'pipeline', 'pipelineCuring'];
    sectionKeys.forEach(sk => {
      const section = reviewData[sk] || reviewData[sk === 'visuel' ? 'visual' : sk];
      if (section && typeof section === 'object' && !Array.isArray(section)) {
        Object.keys(section).forEach(k => {
          // If top-level doesn't have the specific field, copy it.
          if (normalized[k] === undefined || normalized[k] === null || normalized[k] === '') {
            normalized[k] = section[k];
          }
        });
      }
    });
  } catch (e) {
    // non-fatal, we'll continue with existing normalization
    console.warn('Orchard: merging nested sections failed', e);
  }

  // Parse extraData if it's a JSON string
  let parsedExtra = {};
  try {
    if (reviewData?.extraData && typeof reviewData.extraData === 'string') {
      parsedExtra = JSON.parse(reviewData.extraData);
    } else if (reviewData?.extraData && typeof reviewData.extraData === 'object') {
      parsedExtra = reviewData.extraData;
    }

    if (parsedExtra && typeof parsedExtra === 'object') {
      Object.keys(parsedExtra).forEach(k => {
        if (normalized[k] === undefined) normalized[k] = parsedExtra[k];
      });
      normalized.extraData = parsedExtra;
    }
  } catch (err) {
    console.warn('Failed to normalize extraData for OrchardPanel', err);
  }

  const dataSource = { ...parsedExtra, ...normalized };

  // Get product-type-specific category fields
  const categoryFieldsMap = getCategoryFieldsByType(productType);

  // Parse existing categoryRatings if it's a JSON string
  let existingCategoryRatings = normalized.categoryRatings;
  if (typeof existingCategoryRatings === 'string') {
    try {
      existingCategoryRatings = JSON.parse(existingCategoryRatings);
    } catch (e) {
      existingCategoryRatings = {};
    }
  }

  // Reconstruct categoryRatings with subfields from flat fields
  const reconstructed = {};
  let foundAnyField = false;

  for (const [category, fields] of Object.entries(categoryFieldsMap)) {
    const catValues = {};
    for (const field of fields) {
      const value = dataSource[field];
      if (value !== undefined && value !== null && value !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0) {
          catValues[field] = numValue;
          foundAnyField = true;
        }
      }
    }
    if (Object.keys(catValues).length > 0) {
      reconstructed[category] = catValues;
    }
  }

  if (foundAnyField) {
    normalized.categoryRatings = reconstructed;
  } else if (existingCategoryRatings && typeof existingCategoryRatings === 'object') {
    normalized.categoryRatings = existingCategoryRatings;
  }

  // Normalize rating field
  if (normalized.rating === undefined) {
    if (normalized.overallRating !== undefined) {
      normalized.rating = normalized.overallRating;
    } else if (normalized.note !== undefined) {
      normalized.rating = normalized.note;
    } else if (normalized.score !== undefined) {
      normalized.rating = normalized.score;
    } else if (normalized.categoryRatings?.overall !== undefined) {
      normalized.rating = normalized.categoryRatings.overall;
    }
  }

  // Normalize title
  if (!normalized.title) {
    normalized.title = normalized.holderName || normalized.productName || normalized.name || 'Sans titre';
  }
  if (!normalized.holderName) {
    normalized.holderName = normalized.title || normalized.productName || normalized.name || 'Sans nom';
  }

  // Normalize product type
  if (!normalized.type) {
    normalized.type = productType;
  }

  // Normalize main image
  if (!normalized.mainImageUrl) {
    if (normalized.imageUrl) {
      normalized.mainImageUrl = normalized.imageUrl;
    } else if (Array.isArray(normalized.images) && normalized.images.length > 0) {
      const firstImg = normalized.images[0];
      normalized.mainImageUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url || firstImg?.src;
    }
  }
  if (!normalized.imageUrl && normalized.mainImageUrl) {
    normalized.imageUrl = normalized.mainImageUrl;
  }

  // Fallback categoryRatings from ratings
  if (!normalized.categoryRatings || Object.keys(normalized.categoryRatings).length === 0) {
    if (normalized.ratings && typeof normalized.ratings === 'object') {
      normalized.categoryRatings = normalized.ratings;
    }
  }

  // Parse JSON string fields
  const jsonFields = [
    'aromas', 'tastes', 'effects', 'terpenes', 'cultivarsList',
    'pipelineExtraction', 'pipelineSeparation', 'pipelinePurification',
    'pipelineCulture', 'pipelineCuring', 'pipelineRecipe',
    'fertilizationPipeline', 'substratMix', 'categoryRatings', 'tags'
  ];

  jsonFields.forEach(field => {
    if (typeof normalized[field] === 'string') {
      try {
        const parsed = JSON.parse(normalized[field]);
        normalized[field] = parsed;
      } catch {
        // If it's a comma-separated list, split it
        if (field === 'tags' || field === 'cultivarsList') {
          normalized[field] = normalized[field].split(',').map(s => s.trim());
        }
      }
    }
  });

  // Product type specific normalization
  switch (productType?.toLowerCase()) {
    case 'hash':
    case 'concentrate':
      // Hash and concentrates don't need genealogy
      if (normalized.cultivars) {
        normalized.cultivarsList = Array.isArray(normalized.cultivars)
          ? normalized.cultivars
          : [normalized.cultivars];
      }
      break;
    case 'edible':
      // Edibles have recipe instead of pipelines
      if (normalized.recipe && typeof normalized.recipe === 'string') {
        try {
          normalized.pipelineRecipe = JSON.parse(normalized.recipe);
        } catch {
          normalized.pipelineRecipe = { steps: [] };
        }
      }
      break;
    case 'flower':
    default:
      // Flowers have full genealogy support
      if (!normalized.cultivars && normalized.cultivarsList) {
        normalized.cultivars = normalized.cultivarsList;
      }
      break;
  }

  return normalized;
}

/**
 * Extract categories that have data from a normalized review
 * @param {Object} normalizedData - The normalized review data
 * @returns {Array} Array of category keys that have data
 */
export function getAvailableCategories(normalizedData) {
  if (!normalizedData || !normalizedData.categoryRatings) {
    return [];
  }

  return Object.keys(normalizedData.categoryRatings).filter(
    cat => Object.keys(normalizedData.categoryRatings[cat] || {}).length > 0
  );
}

/**
 * Calculate average rating for a category
 * @param {Object} categoryValues - The category values object with field ratings
 * @returns {Number} Average rating for the category
 */
export function calculateCategoryAverage(categoryValues) {
  if (!categoryValues || Object.keys(categoryValues).length === 0) {
    return 0;
  }

  const values = Object.values(categoryValues).filter(v => typeof v === 'number');
  if (values.length === 0) return 0;

  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}
