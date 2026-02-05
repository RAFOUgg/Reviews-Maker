// Centralized module mappings per product type
// Used by ContentModuleControls, ExportMaker, TemplateRenderer

import { FLOWER_CATEGORY_FIELDS, HASH_CATEGORY_FIELDS, CONCENTRATE_CATEGORY_FIELDS, EDIBLE_CATEGORY_FIELDS } from './productTypeMappings';

// New structured sections per product type
// Each section has: id, label, access ('all'|'influenceur'|'producteur'), fields[]
const FLOWER_SECTIONS = [
    {
        id: 'infos_generales',
        label: 'Infos générales',
        access: 'all',
        fields: ['holderName', 'title', 'mainImage', 'images', 'description', 'type', 'date', 'author']
    },
    {
        id: 'genetique',
        label: 'Génétique',
        access: 'producteur',
        fields: ['cultivar', 'cultivarsList', 'breeder', 'strainType']
    },
    {
        id: 'culture',
        label: 'Culture',
        access: 'producteur',
        fields: ['typeCulture', 'substratMix', 'fertilizationPipeline', 'floweringTime', 'harvestDate', 'yield']
    },
    {
        id: 'analytiques',
        label: 'Analytiques',
        access: 'all',
        fields: ['thcLevel', 'cbdLevel', 'labResults']
    },
    {
        id: 'visuel',
        label: 'Visuel',
        access: 'all',
        fields: [...FLOWER_CATEGORY_FIELDS.visual]
    },
    {
        id: 'odeurs',
        label: 'Odeurs',
        access: 'all',
        fields: [...FLOWER_CATEGORY_FIELDS.smell]
    },
    {
        id: 'texture',
        label: 'Texture',
        access: 'all',
        fields: [...FLOWER_CATEGORY_FIELDS.texture]
    },
    {
        id: 'effets',
        label: 'Effets',
        access: 'all',
        fields: [...FLOWER_CATEGORY_FIELDS.effects]
    },
    {
        id: 'gout',
        label: 'Goût',
        access: 'all',
        fields: [...FLOWER_CATEGORY_FIELDS.taste]
    },
    {
        id: 'maturation',
        label: 'Maturation',
        access: 'influenceur',
        fields: ['curing', 'pipelineCuring']
    }
];

const HASH_SECTIONS = [
    { id: 'infos_generales', label: 'Infos générales', access: 'all', fields: ['holderName', 'title', 'mainImage', 'images', 'description', 'type', 'date', 'author'] },
    { id: 'production', label: 'Production', access: 'producteur', fields: ['hashmaker', 'cultivarsList', 'pipelineSeparation', 'pipelinePurification', 'processing'] },
    { id: 'analytiques', label: 'Analytiques', access: 'all', fields: ['thcLevel', 'cbdLevel', 'labResults'] },
    { id: 'visuel', label: 'Visuel', access: 'all', fields: [...HASH_CATEGORY_FIELDS.visual] },
    { id: 'odeurs', label: 'Odeurs', access: 'all', fields: [...HASH_CATEGORY_FIELDS.smell] },
    { id: 'texture', label: 'Texture', access: 'all', fields: [...HASH_CATEGORY_FIELDS.texture] },
    { id: 'effets', label: 'Effets', access: 'all', fields: [...HASH_CATEGORY_FIELDS.effects] },
    { id: 'gout', label: 'Goût', access: 'all', fields: [...HASH_CATEGORY_FIELDS.taste] },
    { id: 'maturation', label: 'Maturation', access: 'influenceur', fields: ['curing'] }
];

const CONCENTRATE_SECTIONS = [
    { id: 'infos_generales', label: 'Infos générales', access: 'all', fields: ['holderName', 'title', 'mainImage', 'images', 'description', 'type'] },
    { id: 'extraction', label: 'Extraction', access: 'producteur', fields: ['pipelineExtraction', 'pipelinePurification', 'purgevide', 'processing'] },
    { id: 'analytiques', label: 'Analytiques', access: 'all', fields: ['thcLevel', 'cbdLevel', 'labResults'] },
    { id: 'visuel', label: 'Visuel', access: 'all', fields: [...CONCENTRATE_CATEGORY_FIELDS.visual] },
    { id: 'odeurs', label: 'Odeurs', access: 'all', fields: [...CONCENTRATE_CATEGORY_FIELDS.smell] },
    { id: 'texture', label: 'Texture', access: 'all', fields: [...CONCENTRATE_CATEGORY_FIELDS.texture] },
    { id: 'effets', label: 'Effets', access: 'all', fields: [...CONCENTRATE_CATEGORY_FIELDS.effects] }
];

const EDIBLE_SECTIONS = [
    { id: 'infos_generales', label: 'Infos générales', access: 'all', fields: ['holderName', 'title', 'mainImage', 'images', 'description', 'type'] },
    { id: 'recette', label: 'Recette', access: 'producteur', fields: ['recipe', 'ingredients'] },
    { id: 'gout_effets', label: 'Goûts & Effets', access: 'all', fields: [...EDIBLE_CATEGORY_FIELDS.taste, ...EDIBLE_CATEGORY_FIELDS.effects] }
];

export function getModuleSectionsByProductType(productType = 'flower') {
    const t = (productType || '').toLowerCase();
    if (t.includes('hash')) return HASH_SECTIONS;
    if (t.includes('concentrat') || t.includes('concentré') || t.includes('concentrate')) return CONCENTRATE_SECTIONS;
    if (t.includes('edible') || t.includes('comestible')) return EDIBLE_SECTIONS;
    return FLOWER_SECTIONS;
}

// Backwards-compatible helper: flatten sections into module list
export function getModulesByProductType(productType = 'flower') {
    const sections = getModuleSectionsByProductType(productType);
    const modules = sections.flatMap(s => s.fields || []);
    return Array.from(new Set(modules));
}

export default {
    getModulesByProductType,
    getModuleSectionsByProductType
};
