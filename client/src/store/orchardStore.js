import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COLOR_PALETTES, DEFAULT_TEMPLATES } from './orchardConstants';

// Note: COLOR_PALETTES et DEFAULT_TEMPLATES sont maintenant importés depuis orchardConstants.js
// pour éviter les problèmes de références circulaires et les re-renders infinis

// Les constantes sont maintenant réexportées pour maintenir la compatibilité
export { COLOR_PALETTES, DEFAULT_TEMPLATES };

// Configuration par défaut
const DEFAULT_CONFIG = {
    // Template sélectionné
    template: 'modernCompact',
    ratio: '1:1',

    // Typographie
    typography: {
        fontFamily: 'Inter',
        titleSize: 32,
        textSize: 16,
        titleWeight: '700',
        textWeight: '400',
        titleColor: '#ffffff',
        textColor: '#e0e0e0'
    },

    // Couleurs
    colors: {
        palette: 'modern',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#e0e0e0',
        accent: '#ffd700',
        title: '#ffffff'
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MODULES DE CONTENU VISIBLES - LISTE EXHAUSTIVE
    // ═══════════════════════════════════════════════════════════════════════
    contentModules: {
        // === INFORMATIONS DE BASE ===
        title: true,
        holderName: true,
        author: true,
        ownerName: true,
        image: true,
        images: true,
        mainImage: true,
        imageUrl: true,
        description: true,
        date: true,
        createdAt: true,
        category: true,
        type: true,

        // === PROVENANCE & CULTIVAR ===
        cultivar: true,
        cultivarsList: true,
        breeder: true,
        farm: true,
        hashmaker: true,
        origin: true,
        country: true,
        region: true,

        // === NOTES GLOBALES ===
        rating: true,
        overallRating: true,
        note: true,
        qualityScore: true,
        ratings: true,

        // === NOTES PAR CATÉGORIE (bloc) ===
        categoryRatings: true,
        'categoryRatings.visual': true,
        'categoryRatings.smell': true,
        'categoryRatings.texture': true,
        'categoryRatings.taste': true,
        'categoryRatings.effects': true,

        // === NOTES VISUELLES DÉTAILLÉES ===
        densite: true,
        trichome: true,
        pistil: true,
        manucure: true,
        moisissure: true,
        graines: true,
        couleur: true,
        couleurTransparence: true,
        pureteVisuelle: true,
        viscosite: true,
        melting: true,
        residus: true,
        pistils: true,

        // === NOTES ODEUR DÉTAILLÉES ===
        aromasIntensity: true,
        intensiteAromatique: true,
        fideliteCultivars: true,

        // === NOTES TEXTURE DÉTAILLÉES ===
        durete: true,
        densiteTexture: true,
        elasticite: true,
        collant: true,
        friabiliteViscosite: true,
        meltingResidus: true,
        aspectCollantGras: true,
        viscositeTexture: true,

        // === NOTES GOÛT DÉTAILLÉES ===
        intensiteFumee: true,
        agressivite: true,
        cendre: true,
        intensiteGout: true,
        textureBouche: true,
        douceur: true,
        intensite: true,
        goutIntensity: true,

        // === NOTES EFFETS DÉTAILLÉES ===
        montee: true,
        intensiteEffet: true,
        intensiteEffets: true,
        effectsIntensity: true,
        dureeEffet: true,

        // === DONNÉES SENSORIELLES ===
        terpenes: true,
        aromas: true,
        tastes: true,
        effects: true,
        tastesIntensity: true,
        effectsIntensity: true,

        // === NIVEAUX THC/CBD ===
        thcLevel: true,
        cbdLevel: true,
        strainType: true,
        indicaRatio: true,
        sativaRatio: true,
        strainRatio: true,

        // === PIPELINES & CULTURE ===
        pipelineExtraction: true,
        pipelineSeparation: true,
        pipelinePurification: true,
        fertilizationPipeline: true,
        substratMix: true,
        purgevide: true,
        curing: true,
        drying: true,
        processing: true,
        yield: true,
        floweringTime: true,
        harvestDate: true,

        // === CONTENU TEXTE ===
        conclusion: true,
        notes: true,
        comments: true,
        recommendations: true,
        warnings: true,

        // === EXTRA ===
        extraData: true,
        tags: true,
        certifications: true,
        awards: true,
        labResults: true
    },

    // Ordre des modules (pour le drag-and-drop) - TOUS les champs
    moduleOrder: [
        // === ESSENTIEL ===
        'image', 'title', 'holderName', 'rating', 'category', 'type',

        // === NOTES GLOBALES ===
        'categoryRatings',
        'categoryRatings.visual', 'categoryRatings.smell',
        'categoryRatings.taste', 'categoryRatings.effects',

        // === DÉTAILS VISUELS ===
        'densite', 'taille', 'texture', 'couleur', 'trichome',
        'pistil', 'collant', 'manucure', 'uniformite', 'maturite',
        'humidite', 'conservation', 'presentation', 'bubblingLevel',

        // === DÉTAILS OLFACTIFS ===
        'aromas', 'aromasIntensity', 'complexiteAromas', 'fideliteCultivars',

        // === DÉTAILS TEXTURE ===
        'durete', 'elasticite', 'friabilite', 'collantTexture', 'granularite',
        'homogeneite', 'residus', 'stabilitePression', 'reactiviteChaleur',

        // === DÉTAILS GOÛT ===
        'tastes', 'tastesIntensity', 'intensiteFumee', 'agressivite',
        'cendre', 'persistanceGout', 'evolutionGout', 'retroGout',
        'complexiteGustative',

        // === DÉTAILS EFFETS ===
        'effects', 'effectsIntensity', 'montee', 'intensiteEffet',
        'dureeEffet', 'dureeEffetDetail', 'typeEffet',

        // === IDENTITÉ ===
        'author', 'ownerName', 'date',

        // === PROVENANCE ===
        'cultivar', 'cultivarsList', 'breeder', 'farm', 'hashmaker',

        // === NIVEAUX ===
        'thcLevel', 'cbdLevel', 'strainType', 'indicaRatio',

        // === PIPELINES ===
        'pipelineExtraction', 'pipelineSeparation', 'pipelinePurification',
        'fertilizationPipeline', 'substratMix', 'purgevide', 'sechage',

        // === TERPÈNES ===
        'terpenes',

        // === DESCRIPTION ===
        'description',

        // === STICKERS ===
        'stickerAvis', 'stickerNote', 'stickerRank', 'stickerBadge',

        // === EXTRA ===
        'extraData', 'tags', 'certifications', 'awards', 'labResults'
    ],

    // Image et branding
    image: {
        aspectRatio: '1:1',
        borderRadius: 12,
        filter: 'none',
        opacity: 1
    },

    // Logo/Filigrane
    branding: {
        enabled: false,
        logoUrl: '',
        position: 'bottom-right',
        opacity: 0.7,
        size: 'medium'
    }
};

export const useOrchardStore = create(
    persist(
        (set, get) => ({
            // État de l'interface
            activePanel: 'template', // 'template' | 'typography' | 'colors' | 'content' | 'image'
            isPreviewFullscreen: false,

            // Configuration actuelle
            config: { ...DEFAULT_CONFIG },

            // Préréglages sauvegardés
            presets: [],
            activePreset: null,

            // Templates dynamiques (permet d'enregistrer et personnaliser de nouveaux templates)
            templates: { ...DEFAULT_TEMPLATES },

            // Données de la review en cours de rendu
            reviewData: null,

            // Actions pour modifier la configuration
            setTemplate: (templateId) => set((state) => ({
                config: {
                    ...state.config,
                    template: templateId,
                    ratio: (get().templates[templateId]?.defaultRatio || DEFAULT_TEMPLATES[templateId]?.defaultRatio || '1:1')
                }
            })),

            setRatio: (ratio) => set((state) => ({
                config: { ...state.config, ratio }
            })),

            updateTypography: (updates) => set((state) => ({
                config: {
                    ...state.config,
                    typography: { ...state.config.typography, ...updates }
                }
            })),

            updateColors: (updates) => set((state) => ({
                config: {
                    ...state.config,
                    colors: { ...state.config.colors, ...updates }
                }
            })),

            applyColorPalette: (paletteName) => {
                const palette = COLOR_PALETTES[paletteName];
                if (!palette) return;

                set((state) => ({
                    config: {
                        ...state.config,
                        colors: {
                            ...state.config.colors,
                            palette: paletteName,
                            ...palette
                        }
                    }
                }));
            },

            toggleContentModule: (moduleName) => set((state) => ({
                config: {
                    ...state.config,
                    contentModules: {
                        ...state.config.contentModules,
                        [moduleName]: !state.config.contentModules[moduleName]
                    }
                }
            })),

            // Set all content modules at once (for presets)
            setContentModules: (modules) => set((state) => ({
                config: {
                    ...state.config,
                    contentModules: { ...state.config.contentModules, ...modules }
                }
            })),

            reorderModules: (newOrder) => set((state) => ({
                config: { ...state.config, moduleOrder: newOrder }
            })),

            updateImage: (updates) => set((state) => ({
                config: {
                    ...state.config,
                    image: { ...state.config.image, ...updates }
                }
            })),

            updateBranding: (updates) => set((state) => ({
                config: {
                    ...state.config,
                    branding: { ...state.config.branding, ...updates }
                }
            })),

            // Gestion des préréglages
            savePreset: (name, description = '') => {
                const preset = {
                    id: Date.now().toString(),
                    name,
                    description,
                    config: { ...get().config },
                    createdAt: new Date().toISOString()
                };

                set((state) => ({
                    presets: [...state.presets, preset],
                    activePreset: preset.id
                }));

                return preset;
            },

            loadPreset: (presetId) => {
                const preset = get().presets.find(p => p.id === presetId);
                if (!preset) return;

                set({
                    config: { ...preset.config },
                    activePreset: presetId
                });
            },

            deletePreset: (presetId) => set((state) => ({
                presets: state.presets.filter(p => p.id !== presetId),
                activePreset: state.activePreset === presetId ? null : state.activePreset
            })),

            updatePreset: (presetId, updates) => set((state) => ({
                presets: state.presets.map(p =>
                    p.id === presetId ? { ...p, ...updates } : p
                )
            })),

            // Actions de l'interface
            setActivePanel: (panel) => set({ activePanel: panel }),

            togglePreviewFullscreen: () => set((state) => ({
                isPreviewFullscreen: !state.isPreviewFullscreen
            })),

            setReviewData: (data) => set({ reviewData: data }),

            // Réinitialiser à la configuration par défaut
            resetConfig: () => set({
                config: { ...DEFAULT_CONFIG },
                activePreset: null
            }),

            // Obtenir les templates et palettes disponibles
            getTemplates: () => get().templates,
            registerTemplate: (id, data) => set((state) => ({
                templates: { ...state.templates, [id]: { id, ...data } }
            })),
            unregisterTemplate: (id) => set((state) => ({
                templates: Object.keys(state.templates).reduce((acc, k) => {
                    if (k === id) return acc;
                    acc[k] = state.templates[k];
                    return acc;
                }, {})
            })),
            getColorPalettes: () => COLOR_PALETTES
        }),
        {
            name: 'orchard-storage',
            // Ne persister que les préréglages et la dernière config
            partialize: (state) => ({
                presets: state.presets,
                config: state.config
            }),
            // Version du storage - incrementer pour forcer une migration
            version: 2,
            // Migration pour les changements de version
            migrate: (persistedState, version) => {
                console.log('🔄 Orchard Storage Migration:', { from: version, to: 2, hasState: !!persistedState });

                // Si version < 2, reset les contentModules aux valeurs par défaut
                if (version < 2) {
                    console.log('📦 Resetting contentModules to default (80+ modules)');
                    return {
                        ...persistedState,
                        config: {
                            ...(persistedState?.config || {}),
                            contentModules: DEFAULT_CONFIG.contentModules,
                            moduleOrder: DEFAULT_CONFIG.moduleOrder
                        }
                    };
                }
                return persistedState;
            },
            // Fusionner la config par défaut avec celle sauvegardée
            // pour s'assurer que les nouveaux champs sont toujours présents
            merge: (persistedState, currentState) => {
                if (!persistedState) return currentState;

                // Fusionner contentModules: garder les valeurs sauvegardées mais ajouter les nouveaux champs
                const mergedContentModules = {
                    ...DEFAULT_CONFIG.contentModules, // Tous les nouveaux champs par défaut
                    ...(persistedState.config?.contentModules || {}) // Valeurs sauvegardées
                };

                // Fusionner moduleOrder: utiliser la nouvelle liste par défaut si elle a plus d'éléments
                const savedModuleOrder = persistedState.config?.moduleOrder || [];
                const defaultModuleOrder = DEFAULT_CONFIG.moduleOrder;
                const mergedModuleOrder = defaultModuleOrder.length > savedModuleOrder.length
                    ? defaultModuleOrder
                    : savedModuleOrder;

                console.log('🔄 Orchard Storage Merge:', {
                    savedModulesCount: Object.keys(persistedState.config?.contentModules || {}).length,
                    defaultModulesCount: Object.keys(DEFAULT_CONFIG.contentModules).length,
                    mergedModulesCount: Object.keys(mergedContentModules).length
                });

                return {
                    ...currentState,
                    ...persistedState,
                    config: {
                        ...DEFAULT_CONFIG, // Toutes les valeurs par défaut
                        ...(persistedState.config || {}), // Config sauvegardée
                        contentModules: mergedContentModules,
                        moduleOrder: mergedModuleOrder
                    }
                };
            }
        }
    )
);

// Hooks utilitaires
export const useOrchardConfig = () => useOrchardStore((state) => state.config);
export const useOrchardPresets = () => useOrchardStore((state) => state.presets);
export const useOrchardActions = () => useOrchardStore((state) => ({
    setTemplate: state.setTemplate,
    setRatio: state.setRatio,
    updateTypography: state.updateTypography,
    updateColors: state.updateColors,
    applyColorPalette: state.applyColorPalette,
    toggleContentModule: state.toggleContentModule,
    setContentModules: state.setContentModules,
    reorderModules: state.reorderModules,
    updateImage: state.updateImage,
    updateBranding: state.updateBranding,
    savePreset: state.savePreset,
    loadPreset: state.loadPreset,
    deletePreset: state.deletePreset,
    updatePreset: state.updatePreset,
    setActivePanel: state.setActivePanel,
    togglePreviewFullscreen: state.togglePreviewFullscreen,
    setReviewData: state.setReviewData,
    resetConfig: state.resetConfig,
    getTemplates: state.getTemplates,
    getColorPalettes: state.getColorPalettes
}));
