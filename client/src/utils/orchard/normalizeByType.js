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
    const sectionKeys = ['gouts', 'odeurs', 'texture', 'effets', 'visual', 'visuel', 'analytics', 'culture', 'genetique', 'genetics', 'recipe', 'curing', 'pipeline', 'pipelineCuring', 'flowerData'];
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

  // Reverse mappings: API / backend field names → OrchardPanel expected names
  // When loading from API, flatterned field names differ from form field names
  try {
    const reverseVisualMap = {
      // flattenFlowerFormData stores form.densite → densiteVisuelle
      // OrchardPanel categoryRatings looks for 'densite'
      densiteVisuelle: 'densite',
      trichomesScore: 'trichome',
      pistilsScore: 'pistil',
      manucureScore: 'manucure',
      moisissureScore: 'moisissure',
      grainesScore: 'graines',
      // Hash/Concentré specific
      couleurTransparence: 'couleur',
      viscositeVisuelle: 'viscosite',
      meltingScore: 'melting',
      residuScore: 'residus',
      // Taste fields
      intensiteGoutScore: 'intensiteFumee',
      agressiviteScore: 'agressivite',
      // Effect fields
      monteeScore: 'montee',
      intensiteEffetScore: 'intensiteEffet',
      // Odeur fields
      intensiteAromeScore: 'aromasIntensity',
      complexiteAromeScore: 'complexiteAromas',
      fideliteAromeScore: 'fideliteCultivars',
      // Flat taste notes arrays
      dryPuffNotes: 'dryPuffNotes',
      inhalationNotes: 'inhalationNotes',
      expirationNotes: 'exhalationNotes',
      // Flat effects arrays
      effetsChoisis: 'effects',
      // Flat odeur note arrays
      notesOdeursDominantes: 'aromas',
      notesOdeursSecondaires: 'secondaryAromas',
    };
    for (const [apiKey, orchardKey] of Object.entries(reverseVisualMap)) {
      if (normalized[apiKey] !== undefined && normalized[orchardKey] === undefined) {
        normalized[orchardKey] = normalized[apiKey];
      }
    }
  } catch (e) {
    console.warn('Orchard: reverse field name mappings failed', e);
  }

  // Helper to resolve raw filenames to proper URLs (adds /images/ prefix if needed)
  const resolveImgUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'object') return img.preview || img.url || img.src || null;
    const s = String(img);
    if (s.startsWith('http') || s.startsWith('/') || s.startsWith('blob:') || s.startsWith('data:')) return s;
    return `/images/${s}`;
  };

  // Map common French form keys to Orchard expected keys
  try {
    // Photos from the form use `photos` (with {file, preview}) — map to `images` and `mainImage` for preview
    if (Array.isArray(normalized.photos) && normalized.photos.length > 0) {
      // Convert objects with preview to simple URL strings for the preview
      const photoUrls = normalized.photos.map(resolveImgUrl).filter(Boolean);
      if (!normalized.images || normalized.images.length === 0) {
        normalized.images = photoUrls;
      }
      // If images has only raw filenames but photos has proper URLs, prefer photos
      else if (photoUrls.length > 0 && normalized.images.every(img => typeof img === 'string' && !img.startsWith('/') && !img.startsWith('http') && !img.startsWith('blob:'))) {
        normalized.images = photoUrls;
      }
      if (!normalized.mainImage && normalized.images.length > 0) normalized.mainImage = normalized.images[0];
      if (!normalized.mainImageUrl && normalized.images.length > 0) normalized.mainImageUrl = normalized.images[0];
    }

    // Resolve all image entries to proper URLs (raw filenames → /images/filename)
    if (Array.isArray(normalized.images)) {
      normalized.images = normalized.images.map(resolveImgUrl).filter(Boolean);
    }

    // nomCommercial used in forms -> map to title/holderName/productName
    if (!normalized.title && normalized.nomCommercial) {
      normalized.title = normalized.nomCommercial;
    }
    if (!normalized.holderName && normalized.nomCommercial) {
      normalized.holderName = normalized.nomCommercial;
    }

    // Odeurs (odeurs.*) -> aromas / aroma-related scores
    if (normalized.odeurs && typeof normalized.odeurs === 'object') {
      const o = normalized.odeurs;
      if (Array.isArray(o.dominantNotes) && (!normalized.aromas || normalized.aromas.length === 0)) normalized.aromas = o.dominantNotes;
      // Secondary aroma notes → secondaryAromas (rendered separately in templates)
      if (Array.isArray(o.secondaryNotes) && !normalized.secondaryAromas) normalized.secondaryAromas = o.secondaryNotes;
      if (o.intensity !== undefined && normalized.aromasIntensity === undefined) normalized.aromasIntensity = o.intensity;
      if (o.complexity !== undefined && normalized.complexiteAromas === undefined) normalized.complexiteAromas = o.complexity;
      if (o.fidelity !== undefined && normalized.fideliteCultivars === undefined) normalized.fideliteCultivars = o.fidelity;
    }

    // Goûts (gouts) -> taste fields
    if (normalized.gouts && typeof normalized.gouts === 'object') {
      const g = normalized.gouts;
      if (g.intensity !== undefined && normalized.intensiteFumee === undefined) normalized.intensiteFumee = g.intensity;
      if (g.aggressiveness !== undefined && normalized.agressivite === undefined) normalized.agressivite = g.aggressiveness;
      // Map dry puff / inhalation / exhalation notes to dedicated keys
      if (Array.isArray(g.dryPuffNotes) && !normalized.dryPuffNotes) normalized.dryPuffNotes = g.dryPuffNotes;
      if (Array.isArray(g.inhalationNotes) && !normalized.inhalationNotes) normalized.inhalationNotes = g.inhalationNotes;
      if (Array.isArray(g.exhalationNotes) && !normalized.exhalationNotes) normalized.exhalationNotes = g.exhalationNotes;
      // tastes: prefer dryPuffNotes as primary taste tag list, fall back to inhalation
      if (!normalized.tastes || normalized.tastes.length === 0) {
        if (Array.isArray(g.dryPuffNotes) && g.dryPuffNotes.length > 0) normalized.tastes = g.dryPuffNotes;
        else if (Array.isArray(g.inhalationNotes) && g.inhalationNotes.length > 0) normalized.tastes = g.inhalationNotes;
      }
    }

    // Effets -> map to effects keys
    if (normalized.effets && typeof normalized.effets === 'object') {
      const ef = normalized.effets;
      if (ef.onset !== undefined && normalized.montee === undefined) normalized.montee = ef.onset;
      if (ef.intensity !== undefined && normalized.intensiteEffet === undefined) normalized.intensiteEffet = ef.intensity;
      if (ef.duration !== undefined && normalized.dureeEffet === undefined) normalized.dureeEffet = ef.duration;
      if (Array.isArray(ef.effects) && (!normalized.effects || normalized.effects.length === 0)) normalized.effects = ef.effects;
    }

    // Visual section (English keys from form -> French keys for extractExtraData)
    // The sectionKeys merge copies visual.* to top level as English keys (mold, trichomes, etc.)
    // We map them to the French keys that extractExtraData expects
    const visualFieldMap = {
      mold: 'moisissure',
      trichomes: 'trichome',
      pistils: 'pistil',       // flower form uses plural 'pistils'
      seeds: 'graines',
      densite: 'densiteVisuelle', // flower form uses French 'densite' (not English 'density')
      density: 'densiteVisuelle', // fallback for English key
      colorRating: 'couleur',
      transparency: 'couleurTransparence',
      viscosity: 'viscosite',
      purity: 'pureteVisuelle',
    };
    const textureFieldMap = {
      hardness: 'durete',
      elasticity: 'elasticite',
      stickiness: 'collant',
      friability: 'friabilite',
      melting: 'melting',
      residue: 'residus',
      density: 'densiteTactile',
    };
    for (const [engKey, frKey] of Object.entries(visualFieldMap)) {
      if (normalized[engKey] !== undefined && normalized[frKey] === undefined) {
        normalized[frKey] = normalized[engKey];
      }
    }
    for (const [engKey, frKey] of Object.entries(textureFieldMap)) {
      if (normalized[engKey] !== undefined && normalized[frKey] === undefined) {
        normalized[frKey] = normalized[engKey];
      }
    }

    // Genetics field mappings: Prisma/form keys → template keys
    // geneticType (Prisma/form) → strainType (template)
    if (!normalized.strainType && normalized.geneticType) normalized.strainType = normalized.geneticType;
    // indicaPercent (Prisma/form) → indicaRatio (template)
    if (normalized.indicaRatio === undefined && normalized.indicaPercent !== undefined) normalized.indicaRatio = normalized.indicaPercent;
    // variety (Prisma/form) → cultivar (template)
    if (!normalized.cultivar && normalized.variety) normalized.cultivar = normalized.variety;
    // nomCommercial (Prisma/form) → cultivar fallback if still empty
    if (!normalized.cultivar && normalized.nomCommercial) normalized.cultivar = normalized.nomCommercial;
  } catch (e) {
    // non-fatal mapping errors
    console.warn('Orchard: french-key mappings failed', e);
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
  if (normalized.rating == null || normalized.rating === '') {
    if (normalized.overallRating != null) {
      normalized.rating = normalized.overallRating;
    } else if (normalized.note != null) {
      normalized.rating = normalized.note;
    } else if (normalized.score != null) {
      normalized.rating = normalized.score;
    } else if (normalized.categoryRatings?.overall != null) {
      normalized.rating = normalized.categoryRatings.overall;
    }
  }

  // If rating is still absent or NaN, compute it as the mean of category averages
  if (normalized.rating == null || isNaN(parseFloat(normalized.rating))) {
    const cats = normalized.categoryRatings ? Object.values(normalized.categoryRatings) : [];
    const avgs = cats.map(c => {
      if (typeof c === 'number' && !isNaN(c) && c > 0) return c;
      if (typeof c === 'string' && !isNaN(parseFloat(c)) && parseFloat(c) > 0) return parseFloat(c);
      if (typeof c === 'object' && c !== null) {
        const vals = Object.values(c).map(v => parseFloat(v)).filter(v => !isNaN(v) && v > 0);
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      }
      return null;
    }).filter(v => v !== null);
    if (avgs.length > 0) {
      normalized.rating = Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length * 10) / 10;
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

  // Normalize main image — resolve raw filenames to proper /images/ URLs
  if (!normalized.mainImageUrl) {
    if (normalized.imageUrl) {
      normalized.mainImageUrl = resolveImgUrl(normalized.imageUrl) || normalized.imageUrl;
    } else if (Array.isArray(normalized.images) && normalized.images.length > 0) {
      normalized.mainImageUrl = resolveImgUrl(normalized.images[0]);
    }
  } else {
    // Ensure existing mainImageUrl is also resolved
    normalized.mainImageUrl = resolveImgUrl(normalized.mainImageUrl) || normalized.mainImageUrl;
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
    'aromas', 'secondaryAromas', 'tastes', 'dryPuffNotes', 'inhalationNotes', 'exhalationNotes',
    'effects', 'terpenes', 'cultivarsList', 'parentage',
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
