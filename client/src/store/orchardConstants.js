// Constantes pour Orchard Studio
// Séparées du store pour éviter les problèmes de références circulaires

// Palettes de couleurs harmonieuses prédéfinies
export const COLOR_PALETTES = {
    modern: {
        name: 'Terpologie',
        background: 'linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #16213E 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#94A3B8',
        accent: '#A78BFA',
        title: '#ffffff'
    },
    nature: {
        name: 'Nature',
        background: 'linear-gradient(135deg, #0A1A0E 0%, #132A17 50%, #1A3620 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#A7C4B2',
        accent: '#22C55E',
        title: '#ffffff'
    },
    ocean: {
        name: 'Océan',
        background: 'linear-gradient(135deg, #0A1628 0%, #0F2847 50%, #153660 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#93B5D4',
        accent: '#38BDF8',
        title: '#ffffff'
    },
    sunset: {
        name: 'Crépuscule',
        background: 'linear-gradient(135deg, #1A0A0A 0%, #2D1212 50%, #3D1515 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#D4A093',
        accent: '#F97316',
        title: '#ffffff'
    },
    elegant: {
        name: 'Élégant',
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #3D3D3D 100%)',
        textPrimary: '#F0F0F0',
        textSecondary: '#999999',
        accent: '#CFB991',
        title: '#ffffff'
    },
    minimal: {
        name: 'Minimaliste',
        background: '#F8FAFC',
        textPrimary: '#1E293B',
        textSecondary: '#64748B',
        accent: '#8B5CF6',
        title: '#0F172A'
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE PRESETS PAR TEMPLATE — modules auto-activés/désactivés à la sélection
// ═══════════════════════════════════════════════════════════════════════════════
export const TEMPLATE_MODULE_PRESETS = {
    modernCompact: {
        // Essentiel seulement — aperçu compact
        enable: [
            'nomCommercial', 'mainImage', 'images', 'cultivar', 'cultivarsList',
            'farm', 'hashmaker', 'type',
            'analytics.thcLevel', 'analytics.cbdLevel',
            'visual.colorRating', 'visual.density', 'visual.trichomes', 'visual.mold', 'visual.seeds',
            'odeurs.intensity', 'odeurs.dominantNotes',
            'texture.hardness', 'texture.density', 'texture.elasticity', 'texture.stickiness',
            'gouts.intensity', 'gouts.aggressiveness',
            'effets.onset', 'effets.intensity', 'effets.effects',
            'curing',
        ],
        disable: [
            'breeder', 'strainType', 'genetics',
            'cultureTimelineData', 'cultureTimelineConfig',
            'pipelineSeparation', 'pipelinePurification', 'pipelineExtraction',
            'fertilizationPipeline', 'substratMix', 'processing',
            'recipe', 'ingredients',
            'odeurs.complexity', 'odeurs.fidelity', 'odeurs.secondaryNotes',
            'gouts.dryPuffNotes', 'gouts.inhalationNotes', 'gouts.exhalationNotes',
            'effets.duration',
            'analytics.terpeneProfile',
        ],
    },
    detailedCard: {
        // Tout activé — fiche technique complète
        enable: [
            'nomCommercial', 'mainImage', 'images', 'cultivar', 'cultivarsList',
            'farm', 'hashmaker', 'type', 'breeder', 'strainType', 'genetics',
            'analytics.thcLevel', 'analytics.cbdLevel', 'analytics.terpeneProfile',
            'visual.colorRating', 'visual.density', 'visual.trichomes', 'visual.mold', 'visual.seeds',
            'visual.transparency', 'visual.viscosity',
            'odeurs.intensity', 'odeurs.complexity', 'odeurs.fidelity', 'odeurs.dominantNotes', 'odeurs.secondaryNotes',
            'texture.hardness', 'texture.density', 'texture.elasticity', 'texture.stickiness',
            'texture.malleability', 'texture.friability', 'texture.melting', 'texture.residue', 'texture.viscosity',
            'gouts.intensity', 'gouts.aggressiveness', 'gouts.dryPuffNotes', 'gouts.inhalationNotes', 'gouts.exhalationNotes',
            'effets.onset', 'effets.intensity', 'effets.effects', 'effets.duration',
            'curing',
            'pipelineSeparation', 'pipelinePurification', 'pipelineExtraction',
            'fertilizationPipeline', 'substratMix', 'processing',
            'cultureTimelineData', 'cultureTimelineConfig',
            'recipe', 'ingredients',
        ],
        disable: [],
    },
    blogArticle: {
        // Tout activé comme detailedCard
        enable: [
            'nomCommercial', 'mainImage', 'images', 'cultivar', 'cultivarsList',
            'farm', 'hashmaker', 'type', 'breeder', 'strainType', 'genetics',
            'analytics.thcLevel', 'analytics.cbdLevel', 'analytics.terpeneProfile',
            'visual.colorRating', 'visual.density', 'visual.trichomes', 'visual.mold', 'visual.seeds',
            'odeurs.intensity', 'odeurs.complexity', 'odeurs.fidelity', 'odeurs.dominantNotes', 'odeurs.secondaryNotes',
            'texture.hardness', 'texture.density', 'texture.elasticity', 'texture.stickiness',
            'gouts.intensity', 'gouts.aggressiveness', 'gouts.dryPuffNotes', 'gouts.inhalationNotes', 'gouts.exhalationNotes',
            'effets.onset', 'effets.intensity', 'effets.effects', 'effets.duration',
            'curing',
            'pipelineSeparation', 'pipelinePurification', 'pipelineExtraction',
            'cultureTimelineData', 'cultureTimelineConfig',
        ],
        disable: [],
    },
    socialStory: {
        // Visuels + impactant — format story
        enable: [
            'nomCommercial', 'mainImage', 'images', 'cultivar', 'farm', 'hashmaker', 'type',
            'analytics.thcLevel', 'analytics.cbdLevel',
            'visual.colorRating', 'visual.density', 'visual.trichomes',
            'odeurs.intensity', 'odeurs.dominantNotes',
            'gouts.intensity',
            'effets.onset', 'effets.intensity', 'effets.effects',
            'curing',
        ],
        disable: [
            'breeder', 'strainType', 'genetics',
            'cultureTimelineData', 'cultureTimelineConfig',
            'pipelineSeparation', 'pipelinePurification', 'pipelineExtraction',
            'fertilizationPipeline', 'substratMix', 'processing',
            'recipe', 'ingredients',
            'odeurs.complexity', 'odeurs.fidelity', 'odeurs.secondaryNotes',
            'texture.hardness', 'texture.density', 'texture.elasticity', 'texture.stickiness',
            'texture.malleability', 'texture.friability', 'texture.melting', 'texture.residue',
            'gouts.aggressiveness', 'gouts.dryPuffNotes', 'gouts.inhalationNotes', 'gouts.exhalationNotes',
            'effets.duration',
            'analytics.terpeneProfile',
        ],
    },
};

// Templates de base avec leurs configurations
export const DEFAULT_TEMPLATES = {
    modernCompact: {
        id: 'modernCompact',
        name: 'Moderne Compact',
        description: 'Design épuré et moderne, idéal pour les réseaux sociaux',
        layout: 'compact',
        defaultRatio: '1:1',
        supportedRatios: ['1:1', '16:9', '9:16', '4:3', 'A4'],
        // Zones par défaut (x,y in %, width/height in % relative to canvas)
        defaultZones: [
            { id: 'zone-title', label: 'Titre', type: 'zone', position: { x: 50, y: 8 }, width: 80, height: 12, placeholder: 'title' },
            { id: 'zone-image', label: 'Image', type: 'zone', position: { x: 10, y: 20 }, width: 40, height: 45, placeholder: 'image' },
            { id: 'zone-rating', label: 'Note', type: 'zone', position: { x: 62, y: 22 }, width: 28, height: 12, placeholder: 'rating' },
            { id: 'zone-description', label: 'Description', type: 'zone', position: { x: 10, y: 68 }, width: 84, height: 22, placeholder: 'description' }
        ]
    },
    detailedCard: {
        id: 'detailedCard',
        name: 'Fiche Technique Détaillée',
        description: 'Présentation complète avec tous les détails de la review',
        layout: 'detailed',
        defaultRatio: '16:9',
        supportedRatios: ['1:1', '16:9', '9:16', '4:3', 'A4']
    },
    blogArticle: {
        id: 'blogArticle',
        name: 'Article de Blog',
        description: 'Format long adapté aux blogs et documentation',
        layout: 'article',
        defaultRatio: 'A4',
        supportedRatios: ['1:1', '16:9', '9:16', '4:3', 'A4']
    },
    socialStory: {
        id: 'socialStory',
        name: 'Story Social Media',
        description: 'Format vertical pour Instagram et TikTok',
        layout: 'story',
        defaultRatio: '9:16',
        supportedRatios: ['1:1', '16:9', '9:16', '4:3', 'A4']
    }
};
