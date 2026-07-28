// Centralized module mappings per product type
// Used by ContentModuleControls, ExportMaker, TemplateRenderer
// Fields use the actual formData key paths:
//   - Top-level string fields: 'hashmaker', 'cultivars', etc.
//   - Nested section objects: 'visual.density', 'odeurs.intensity', etc.
//     (dot-notation allows ContentModuleControls to display sub-items per category)

// ── FLOWER SECTIONS ──────────────────────────────────────────────────────────
const FLOWER_SECTIONS = [
    {
        id: 'infos_generales',
        label: 'Infos générales',
        access: 'all',
        fields: ['nomCommercial', 'cultivar', 'farm', 'images']
    },
    {
        id: 'genetique',
        label: 'Génétique',
        access: 'producteur',
        fields: ['breeder', 'strainType', 'genetics']
    },
    {
        id: 'culture',
        label: 'Culture',
        access: 'producteur',
        fields: ['cultureTimelineData', 'cultureTimelineConfig']
    },
    {
        id: 'analytiques',
        label: 'Analytiques',
        access: 'all',
        fields: ['analytics.thcLevel', 'analytics.cbdLevel', 'analytics.terpeneProfile']
    },
    {
        id: 'visuel',
        label: 'Visuel',
        access: 'all',
        // visual object from VisualSection: { colors, colorRating, density, trichomes, mold, seeds }
        fields: ['visual.colorRating', 'visual.density', 'visual.trichomes', 'visual.mold', 'visual.seeds']
    },
    {
        id: 'odeurs',
        label: 'Odeurs',
        access: 'all',
        // odeurs object from OdorSection: { dominantNotes, secondaryNotes, intensity, complexity, fidelity }
        fields: ['odeurs.intensity', 'odeurs.complexity', 'odeurs.fidelity', 'odeurs.dominantNotes', 'odeurs.secondaryNotes']
    },
    {
        id: 'texture',
        label: 'Texture',
        access: 'all',
        // texture object from TextureSection (flower): { hardness, density, elasticity, stickiness }
        fields: ['texture.hardness', 'texture.density', 'texture.elasticity', 'texture.stickiness']
    },
    {
        id: 'effets',
        label: 'Effets',
        access: 'all',
        // effets object from EffectsSection: { onset, intensity, effects, duration }
        fields: ['effets.onset', 'effets.intensity', 'effets.effects']
    },
    {
        id: 'gout',
        label: 'Goût',
        access: 'all',
        // gouts object from TasteSection: { intensity, aggressiveness, dryPuffNotes, inhalationNotes, exhalationNotes }
        fields: ['gouts.intensity', 'gouts.aggressiveness', 'gouts.dryPuffNotes', 'gouts.inhalationNotes', 'gouts.exhalationNotes']
    },
    {
        id: 'maturation',
        label: 'Maturation',
        access: 'influenceur',
        fields: ['curing']
    }
];

// ── HASH SECTIONS ────────────────────────────────────────────────────────────
const HASH_SECTIONS = [
    {
        id: 'infos_generales',
        label: 'Infos générales',
        access: 'all',
        fields: ['nomCommercial', 'hashmaker', 'laboratoire', 'cultivars', 'images']
    },
    {
        id: 'production',
        label: 'Production',
        access: 'producteur',
        // top-level form keys from CreateHashReview
        fields: ['cultivarsList', 'pipelineSeparation', 'pipelinePurification', 'processing']
    },
    {
        id: 'analytiques',
        label: 'Analytiques',
        access: 'all',
        fields: ['analytics.thcLevel', 'analytics.cbdLevel', 'analytics.terpeneProfile']
    },
    {
        id: 'visuel',
        label: 'Visuel',
        access: 'all',
        // visual object from VisualSection (hash): { colors, colorRating, density, transparency, mold, seeds }
        fields: ['visual.colorRating', 'visual.transparency', 'visual.density', 'visual.mold', 'visual.seeds']
    },
    {
        id: 'odeurs',
        label: 'Odeurs',
        access: 'all',
        // odeurs object: { intensity, fidelity, dominantNotes, secondaryNotes }
        fields: ['odeurs.intensity', 'odeurs.fidelity', 'odeurs.dominantNotes', 'odeurs.secondaryNotes']
    },
    {
        id: 'texture',
        label: 'Texture',
        access: 'all',
        // texture object (hash): { hardness, density, malleability, melting, residue, friability, stickiness }
        fields: ['texture.hardness', 'texture.density', 'texture.melting', 'texture.residue']
    },
    {
        id: 'effets',
        label: 'Effets',
        access: 'all',
        fields: ['effets.onset', 'effets.intensity', 'effets.effects']
    },
    {
        id: 'gout',
        label: 'Goût',
        access: 'all',
        // gouts object from TasteSection: { intensity, aggressiveness, dryPuffNotes, inhalationNotes, exhalationNotes }
        fields: ['gouts.intensity', 'gouts.aggressiveness', 'gouts.dryPuffNotes', 'gouts.inhalationNotes', 'gouts.exhalationNotes']
    },
    {
        id: 'maturation',
        label: 'Maturation',
        access: 'influenceur',
        fields: ['curing']
    }
];

// ── CONCENTRATE SECTIONS ─────────────────────────────────────────────────────
const CONCENTRATE_SECTIONS = [
    {
        id: 'infos_generales',
        label: 'Infos générales',
        access: 'all',
        fields: ['nomCommercial', 'hashmaker', 'laboratoire', 'cultivars', 'images']
    },
    {
        id: 'extraction',
        label: 'Extraction',
        access: 'producteur',
        fields: ['cultivarsList', 'pipelineExtraction', 'pipelinePurification', 'processing']
    },
    {
        id: 'analytiques',
        label: 'Analytiques',
        access: 'all',
        fields: ['analytics.thcLevel', 'analytics.cbdLevel', 'analytics.terpeneProfile']
    },
    {
        id: 'visuel',
        label: 'Visuel',
        access: 'all',
        // visual object (concentrate): { colors, colorRating, density (purity), transparency, mold, seeds }
        fields: ['visual.colorRating', 'visual.transparency', 'visual.density', 'visual.mold', 'visual.seeds']
    },
    {
        id: 'odeurs',
        label: 'Odeurs',
        access: 'all',
        fields: ['odeurs.intensity', 'odeurs.fidelity', 'odeurs.dominantNotes', 'odeurs.secondaryNotes']
    },
    {
        id: 'texture',
        label: 'Texture',
        access: 'all',
        // texture object (concentrate): { hardness, density, viscosity, melting, residue, stickiness }
        fields: ['texture.hardness', 'texture.density', 'texture.viscosity', 'texture.melting', 'texture.residue']
    },
    {
        id: 'effets',
        label: 'Effets',
        access: 'all',
        fields: ['effets.onset', 'effets.intensity', 'effets.effects']
    },
    {
        id: 'gout',
        label: 'Goût',
        access: 'all',
        fields: ['gouts.intensity', 'gouts.aggressiveness', 'gouts.dryPuffNotes', 'gouts.inhalationNotes', 'gouts.exhalationNotes']
    },
    {
        id: 'maturation',
        label: 'Maturation',
        access: 'influenceur',
        fields: ['curing']
    }
];

// ── EDIBLE SECTIONS ──────────────────────────────────────────────────────────
const EDIBLE_SECTIONS = [
    {
        id: 'infos_generales',
        label: 'Infos générales',
        access: 'all',
        fields: ['nomCommercial', 'images', 'type']
    },
    {
        id: 'recette',
        label: 'Recette',
        access: 'producteur',
        fields: ['recipe', 'ingredients']
    },
    {
        id: 'gout',
        label: 'Goût',
        access: 'all',
        fields: ['gouts.intensity', 'gouts.aggressiveness', 'gouts.dryPuffNotes']
    },
    {
        id: 'effets',
        label: 'Effets',
        access: 'all',
        fields: ['effets.onset', 'effets.intensity', 'effets.effects']
    }
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
        { id: 'culture', name: 'Pipeline Culture', modules: ['culture'] },
        { id: 'analytics', name: 'Analytiques', modules: ['thcLevel', 'cbdLevel', 'labResults'] },
        { id: 'visual', name: 'Visuel & Technique', modules: ['colorRating', 'density', 'trichomes', 'mold', 'seeds'] },
        { id: 'odors', name: 'Odeurs', modules: ['aromasIntensity', 'complexiteAromas', 'fideliteCultivars'] },
        { id: 'texture', name: 'Texture', modules: ['hardness', 'elasticity', 'stickiness'] },
        { id: 'tastes', name: 'Goûts', modules: ['intensiteFumee', 'agressivite'] },
        { id: 'effects', name: 'Effets', modules: ['montee', 'intensiteEffet', 'dureeEffet'] },
        { id: 'recolte', name: 'Récolte & Post-Récolte', modules: ['trichomesTranslucides', 'trichomesLaiteux', 'trichomesAmbres', 'modeRecolte', 'poidsBrut', 'poidsNet'] },
        { id: 'curing', name: 'Curing & Maturation', modules: ['curing'] }
    ],
    hash: [
        { id: 'general', name: 'Informations générales', modules: ['holderName', 'title', 'image', 'images', 'description', 'type'] },
        { id: 'separation', name: 'Pipeline Séparation', modules: ['pipelineSeparation'] },
        { id: 'purification', name: 'Purification', modules: ['pipelinePurification'] },
        { id: 'visual', name: 'Visuel & Technique', modules: ['colorRating', 'transparency', 'density', 'mold', 'seeds'] },
        { id: 'odors', name: 'Odeurs', modules: ['aromasIntensity', 'complexiteAromas', 'fideliteCultivars'] },
        { id: 'texture', name: 'Texture', modules: ['hardness', 'melting', 'residue', 'friability'] },
        { id: 'tastes', name: 'Goûts', modules: ['intensiteFumee', 'agressivite'] },
        { id: 'effects', name: 'Effets', modules: ['montee', 'intensiteEffet', 'dureeEffet'] },
        { id: 'curing', name: 'Curing', modules: ['curing'] }
    ],
    concentrate: [
        { id: 'general', name: 'Informations générales', modules: ['holderName', 'title', 'image', 'images', 'description', 'type'] },
        { id: 'extraction', name: 'Pipeline Extraction', modules: ['pipelineExtraction'] },
        { id: 'purification', name: 'Purification', modules: ['pipelinePurification'] },
        { id: 'visual', name: 'Visuel & Technique', modules: ['colorRating', 'transparency', 'density', 'melting', 'residue', 'mold'] },
        { id: 'odors', name: 'Odeurs', modules: ['aromasIntensity', 'complexiteAromas', 'fideliteCultivars'] },
        { id: 'texture', name: 'Texture', modules: ['hardness', 'friability', 'viscosity', 'melting'] },
        { id: 'tastes', name: 'Goûts', modules: ['intensiteFumee', 'agressivite'] },
        { id: 'effects', name: 'Effets', modules: ['montee', 'intensiteEffet', 'dureeEffet'] }
    ],
    edible: [
        { id: 'general', name: 'Informations générales', modules: ['holderName', 'title', 'image', 'images', 'description', 'type'] },
        { id: 'recipe', name: 'Recette', modules: ['tastes', 'tastesIntensity'] },
        { id: 'tastes', name: 'Goûts', modules: ['intensiteFumee', 'agressivite'] },
        { id: 'effects', name: 'Effets', modules: ['montee', 'intensiteEffet', 'dureeEffet'] }
    ]
};

export function getSectionsByProductType(productType = 'flower') {
    const t = (productType || '').toLowerCase();
    if (t.includes('hash')) return SECTIONS_BY_TYPE.hash;
    if (t.includes('concentrat') || t.includes('concentré') || t.includes('concentrate')) return SECTIONS_BY_TYPE.concentrate;
    if (t.includes('edible') || t.includes('comestible')) return SECTIONS_BY_TYPE.edible;
    return SECTIONS_BY_TYPE.flower;
}
