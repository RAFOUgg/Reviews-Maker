import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Palettes de couleurs harmonieuses prédéfinies
const COLOR_PALETTES = {
    modern: {
        name: 'Moderne',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#e0e0e0',
        accent: '#ffd700',
        title: '#ffffff'
    },
    nature: {
        name: 'Nature',
        background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#ecf0f1',
        accent: '#f39c12',
        title: '#ffffff'
    },
    ocean: {
        name: 'Océan',
        background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#ecf0f1',
        accent: '#e74c3c',
        title: '#ffffff'
    },
    sunset: {
        name: 'Coucher de Soleil',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#ffe0e0',
        accent: '#ffd93d',
        title: '#ffffff'
    },
    elegant: {
        name: 'Élégant',
        background: 'linear-gradient(135deg, #1e1e1e 0%, #2c2c2c 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#b0b0b0',
        accent: '#d4af37',
        title: '#f0f0f0'
    },
    minimal: {
        name: 'Minimaliste',
        background: '#ffffff',
        textPrimary: '#333333',
        textSecondary: '#666666',
        accent: '#007aff',
        title: '#000000'
    }
};

// Templates de base avec leurs configurations
const DEFAULT_TEMPLATES = {
    modernCompact: {
        id: 'modernCompact',
        name: 'Moderne Compact',
        description: 'Design épuré et moderne, idéal pour les réseaux sociaux',
        layout: 'compact',
        defaultRatio: '1:1',
        supportedRatios: ['1:1', '16:9', '9:16']
    },
    detailedCard: {
        id: 'detailedCard',
        name: 'Fiche Technique Détaillée',
        description: 'Présentation complète avec tous les détails',
        layout: 'detailed',
        defaultRatio: '16:9',
        supportedRatios: ['16:9', '4:3', 'A4']
    },
    blogArticle: {
        id: 'blogArticle',
        name: 'Article de Blog',
        description: 'Format long adapté aux blogs',
        layout: 'article',
        defaultRatio: 'A4',
        supportedRatios: ['A4', '16:9']
    },
    socialStory: {
        id: 'socialStory',
        name: 'Story Social Media',
        description: 'Format vertical pour Instagram et TikTok',
        layout: 'story',
        defaultRatio: '9:16',
        supportedRatios: ['9:16']
    }
};

// Exporter les constantes pour utilisation directe dans les composants
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

    // Modules de contenu visibles
    contentModules: {
        title: true,
        rating: true,
        author: true,
        image: true,
        tags: true,
        description: true,
        date: true,
        category: true,
        thcLevel: true,
        cbdLevel: true,
        effects: true,
        aromas: true,
        cultivar: true
    },

    // Ordre des modules (pour le drag-and-drop)
    moduleOrder: [
        'image',
        'title',
        'rating',
        'category',
        'author',
        'date',
        'thcLevel',
        'cbdLevel',
        'cultivar',
        'description',
        'effects',
        'aromas',
        'tags'
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

            // Données de la review en cours de rendu
            reviewData: null,

            // Actions pour modifier la configuration
            setTemplate: (templateId) => set((state) => ({
                config: {
                    ...state.config,
                    template: templateId,
                    ratio: DEFAULT_TEMPLATES[templateId].defaultRatio
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
            getTemplates: () => DEFAULT_TEMPLATES,
            getColorPalettes: () => COLOR_PALETTES
        }),
        {
            name: 'orchard-storage',
            // Ne persister que les préréglages et la dernière config
            partialize: (state) => ({
                presets: state.presets,
                config: state.config
            })
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
