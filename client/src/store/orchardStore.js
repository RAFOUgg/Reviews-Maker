import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COLOR_PALETTES, DEFAULT_TEMPLATES } from './orchardConstants';

// Note: COLOR_PALETTES et DEFAULT_TEMPLATES sont maintenant importés depuis orchardConstants.js
// pour éviter les problèmes de références circulaires et les re-renders infinis

// Les constantes sont maintenant réexportées pour maintenir la compatibilité
export { COLOR_PALETTES, DEFAULT_TEMPLATES };

// ═══════════════════════════════════════════════════════════════════════════════
// FORCE RESET: Supprimer localStorage obsolète AVANT que zustand ne charge
// ═══════════════════════════════════════════════════════════════════════════════
const CURRENT_STORAGE_VERSION = 7; // Incrémenté pour forcer reset - BUILD DEC 2 2025
const STORAGE_KEY = 'orchard-storage';

// FORCE IMMEDIATE RESET - Dec 2 2025
console.log('🚀 Orchard Store Loading - Version 7 - Forcing localStorage check...');

try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        const parsed = JSON.parse(stored);
        // zustand persist peut stocker: { state: {...}, version: X } ou { version: X, state: {...} }
        const storedVersion = parsed?.version ?? 0;
        // Les modules peuvent être dans state.config.contentModules ou config.contentModules
        const stateConfig = parsed?.state?.config || parsed?.config || {};
        const modulesCount = Object.keys(stateConfig?.contentModules || {}).length;

        console.log('🔍 Orchard Storage Check:', {
            storedVersion,
            currentVersion: CURRENT_STORAGE_VERSION,
            modulesCount,
            needsReset: storedVersion < CURRENT_STORAGE_VERSION || modulesCount < 50
        });

        // TOUJOURS reset si version < 7 OU moins de 70 modules
        if (storedVersion < CURRENT_STORAGE_VERSION || modulesCount < 70) {
            console.warn('🗑️ FORCING localStorage reset - old version or incomplete modules');
            console.warn('   Stored version:', storedVersion, '| Current:', CURRENT_STORAGE_VERSION);
            console.warn('   Modules count:', modulesCount, '(need 70+)');
            localStorage.removeItem(STORAGE_KEY);
            console.warn('✅ localStorage DELETED - will recreate with 80+ modules');
        }
    }
} catch (e) {
    console.warn('Orchard storage check failed, forcing removal:', e);
    try { localStorage.removeItem(STORAGE_KEY); } catch { }
}

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
            // Version du storage - doit correspondre à CURRENT_STORAGE_VERSION
            // v7: Force reset automatique au chargement si version < 7 ou < 70 modules - Dec 2 2025
            version: CURRENT_STORAGE_VERSION,
            // Migration pour les changements de version
            migrate: (persistedState, version) => {
                console.warn('🔄 Orchard Storage Migration:', { from: version, to: CURRENT_STORAGE_VERSION, hasState: !!persistedState });

                // Si version < 7, reset COMPLET des contentModules et moduleOrder
                if (version < CURRENT_STORAGE_VERSION) {
                    console.warn('📦 v7 Migration: Forcing COMPLETE contentModules reset to 80+ modules');
                    const modulesCount = Object.keys(DEFAULT_CONFIG.contentModules).length;
                    console.warn('   Will create', modulesCount, 'modules');
                    return {
                        ...persistedState,
                        config: {
                            ...DEFAULT_CONFIG,
                            ...(persistedState?.config || {}),
                            // FORCER ABSOLUMENT les modules par défaut
                            contentModules: { ...DEFAULT_CONFIG.contentModules },
                            moduleOrder: [...DEFAULT_CONFIG.moduleOrder]
                        }
                    };
                }
                return persistedState;
            },
            // Fusionner la config - TOUJOURS utiliser les modules par défaut
            merge: (persistedState, currentState) => {
                if (!persistedState) return currentState;

                // Compter les modules
                const savedModulesCount = Object.keys(persistedState.config?.contentModules || {}).length;
                const defaultModulesCount = Object.keys(DEFAULT_CONFIG.contentModules).length;

                console.log('🔄 Orchard Storage Merge:', {
                    savedModulesCount,
                    defaultModulesCount,
                    forceDefault: savedModulesCount < 50 // Moins de 50 = vieux format
                });

                // TOUJOURS utiliser les modules par défaut si moins de 70 modules
                // Car l'ancien format avait seulement 13 modules
                const contentModules = savedModulesCount < 70
                    ? { ...DEFAULT_CONFIG.contentModules }
                    : { ...DEFAULT_CONFIG.contentModules, ...persistedState.config.contentModules };

                const moduleOrder = (persistedState.config?.moduleOrder?.length || 0) < 70
                    ? [...DEFAULT_CONFIG.moduleOrder]
                    : persistedState.config.moduleOrder;

                console.warn('   Using contentModules:', Object.keys(contentModules).length, 'modules');
                console.warn('   Using moduleOrder:', moduleOrder.length, 'items');

                return {
                    ...currentState,
                    ...persistedState,
                    config: {
                        ...DEFAULT_CONFIG,
                        ...(persistedState.config || {}),
                        contentModules,
                        moduleOrder
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
