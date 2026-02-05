// Centralized module mappings per product type
// Used by ContentModuleControls, ExportMaker, TemplateRenderer

import { FLOWER_CATEGORY_FIELDS, HASH_CATEGORY_FIELDS, CONCENTRATE_CATEGORY_FIELDS, EDIBLE_CATEGORY_FIELDS } from './productTypeMappings';

const FLOWER_MODULES = [
    // Essentials
    'holderName', 'title', 'rating', 'image', 'images', 'mainImage', 'imageUrl', 'description', 'type', 'category',
    // Identity
    'author', 'ownerName', 'date', 'createdAt', 'tags',
    // Provenance
    'cultivar', 'cultivarsList', 'breeder', 'farm', 'hashmaker', 'origin', 'country', 'region',
    // Ratings/global
    'overallRating', 'note', 'qualityScore', 'ratings', 'categoryRatings', 'categoryRatings.visual', 'categoryRatings.smell', 'categoryRatings.texture', 'categoryRatings.taste', 'categoryRatings.effects',
    // Visual details
    ...FLOWER_CATEGORY_FIELDS.visual,
    // Smell
    ...FLOWER_CATEGORY_FIELDS.smell,
    // Texture
    ...FLOWER_CATEGORY_FIELDS.texture,
    // Taste
    ...FLOWER_CATEGORY_FIELDS.taste,
    // Effects
    ...FLOWER_CATEGORY_FIELDS.effects,
    // Terpenes/technical
    'terpenes', 'thcLevel', 'cbdLevel', 'strainType', 'indicaRatio', 'sativaRatio', 'strainRatio',
    // Pipelines
    'pipelineExtraction', 'pipelineSeparation', 'pipelinePurification', 'fertilizationPipeline', 'substratMix', 'purgevide', 'curing', 'drying', 'processing', 'yield', 'floweringTime', 'harvestDate',
    // Text & extra
    'conclusion', 'notes', 'comments', 'recommendations', 'warnings', 'extraData', 'certifications', 'awards', 'labResults'
];

const HASH_MODULES = [
    'holderName', 'title', 'rating', 'image', 'images', 'description', 'type',
    // provenance/extract
    'hashmaker', 'cultivarsList', 'origin', 'country', 'region',
    // visual/textures specific to hash
    ...HASH_CATEGORY_FIELDS.visual,
    ...HASH_CATEGORY_FIELDS.smell,
    ...HASH_CATEGORY_FIELDS.texture,
    ...HASH_CATEGORY_FIELDS.taste,
    ...HASH_CATEGORY_FIELDS.effects,
    'terpenes', 'thcLevel', 'cbdLevel', 'pipelineSeparation', 'pipelinePurification', 'purgevide', 'yield', 'processing',
    'notes', 'extraData'
];

const CONCENTRATE_MODULES = [
    'holderName', 'title', 'rating', 'image', 'images', 'description', 'type',
    ...CONCENTRATE_CATEGORY_FIELDS.visual,
    ...CONCENTRATE_CATEGORY_FIELDS.smell,
    ...CONCENTRATE_CATEGORY_FIELDS.texture,
    ...CONCENTRATE_CATEGORY_FIELDS.taste,
    ...CONCENTRATE_CATEGORY_FIELDS.effects,
    'pipelineExtraction', 'pipelinePurification', 'purgevide', 'yield', 'processing', 'thcLevel', 'cbdLevel', 'terpenes', 'notes', 'extraData'
];

const EDIBLE_MODULES = [
    'holderName', 'title', 'rating', 'image', 'images', 'description', 'type',
    // Edibles focus on taste and effects
    ...EDIBLE_CATEGORY_FIELDS.taste,
    ...EDIBLE_CATEGORY_FIELDS.effects,
    'tastes', 'tastesIntensity', 'conclusion', 'notes', 'extraData'
];

export function getModulesByProductType(productType = 'flower') {
    const t = (productType || '').toLowerCase();
    if (t.includes('hash')) return Array.from(new Set(HASH_MODULES));
    if (t.includes('concentrat') || t.includes('concentré') || t.includes('concentrate')) return Array.from(new Set(CONCENTRATE_MODULES));
    if (t.includes('edible') || t.includes('comestible')) return Array.from(new Set(EDIBLE_MODULES));
    return Array.from(new Set(FLOWER_MODULES));
}

export default {
    getModulesByProductType
};
