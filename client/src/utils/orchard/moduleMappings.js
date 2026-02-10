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
        id: 'recolte',
        label: 'Récolte',
        access: 'all',
        fields: ['trichomesTranslucides','trichomesLaiteux','trichomesAmbres','modeRecolte','poidsBrut','poidsNet']
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

// Sections mapping (for DragDrop & UI)
const SECTIONS_BY_TYPE = {
    flower: [
        { id: 'general', name: 'Informations générales', modules: ['holderName', 'title', 'image', 'images', 'mainImage', 'imageUrl', 'description', 'type', 'category', 'author', 'date'] },
        { id: 'genetics', name: 'Génétiques', modules: ['cultivar', 'cultivarsList', 'breeder', 'farm'] },
        { id: 'culture', name: 'Pipeline Culture', modules: ['fertilizationPipeline', 'substratMix', 'yield', 'floweringTime', 'harvestDate'] },
        { id: 'analytics', name: 'Analytiques', modules: ['thcLevel', 'cbdLevel', 'labResults'] },
        { id: 'visual', name: 'Visuel & Technique', modules: FLOWER_CATEGORY_FIELDS.visual },
        { id: 'odors', name: 'Odeurs', modules: FLOWER_CATEGORY_FIELDS.smell },
        { id: 'texture', name: 'Texture', modules: FLOWER_CATEGORY_FIELDS.texture },
        { id: 'tastes', name: 'Goûts', modules: FLOWER_CATEGORY_FIELDS.taste },
        { id: 'effects', name: 'Effets', modules: FLOWER_CATEGORY_FIELDS.effects },
        { id: 'recolte', name: 'Récolte & Post-Récolte', modules: ['trichomesTranslucides','trichomesLaiteux','trichomesAmbres','modeRecolte','poidsBrut','poidsNet'] },
        { id: 'curing', name: 'Curing & Maturation', modules: ['curing', 'drying', 'processing', 'purgevide'] }
    ],
    hash: [
        { id: 'general', name: 'Informations générales', modules: ['holderName', 'title', 'image', 'images', 'description', 'type'] },
        { id: 'separation', name: 'Pipeline Séparation', modules: ['pipelineSeparation'] },
        { id: 'purification', name: 'Purification', modules: ['pipelinePurification'] },
        { id: 'visual', name: 'Visuel & Technique', modules: HASH_CATEGORY_FIELDS.visual },
        { id: 'odors', name: 'Odeurs', modules: HASH_CATEGORY_FIELDS.smell },
        { id: 'texture', name: 'Texture', modules: HASH_CATEGORY_FIELDS.texture },
        { id: 'tastes', name: 'Goûts', modules: HASH_CATEGORY_FIELDS.taste },
        { id: 'effects', name: 'Effets', modules: HASH_CATEGORY_FIELDS.effects },
        { id: 'curing', name: 'Curing', modules: ['curing'] }
    ],
    concentrate: [
        { id: 'general', name: 'Informations générales', modules: ['holderName', 'title', 'image', 'images', 'description', 'type'] },
        { id: 'extraction', name: 'Pipeline Extraction', modules: ['pipelineExtraction'] },
        { id: 'purification', name: 'Purification', modules: ['pipelinePurification'] },
        { id: 'visual', name: 'Visuel & Technique', modules: CONCENTRATE_CATEGORY_FIELDS.visual },
        { id: 'odors', name: 'Odeurs', modules: CONCENTRATE_CATEGORY_FIELDS.smell },
        { id: 'texture', name: 'Texture', modules: CONCENTRATE_CATEGORY_FIELDS.texture },
        { id: 'tastes', name: 'Goûts', modules: CONCENTRATE_CATEGORY_FIELDS.taste },
        { id: 'effects', name: 'Effets', modules: CONCENTRATE_CATEGORY_FIELDS.effects }
    ],
    edible: [
        { id: 'general', name: 'Informations générales', modules: ['holderName', 'title', 'image', 'images', 'description', 'type'] },
        { id: 'recipe', name: 'Recette', modules: ['tastes', 'tastesIntensity'] },
        { id: 'tastes', name: 'Goûts', modules: EDIBLE_CATEGORY_FIELDS.taste },
        { id: 'effects', name: 'Effets', modules: EDIBLE_CATEGORY_FIELDS.effects }
    ]
};

export function getSectionsByProductType(productType = 'flower') {
    const t = (productType || '').toLowerCase();
    if (t.includes('hash')) return SECTIONS_BY_TYPE.hash;
    if (t.includes('concentrat') || t.includes('concentré') || t.includes('concentrate')) return SECTIONS_BY_TYPE.concentrate;
    if (t.includes('edible') || t.includes('comestible')) return SECTIONS_BY_TYPE.edible;
    return SECTIONS_BY_TYPE.flower;
}
