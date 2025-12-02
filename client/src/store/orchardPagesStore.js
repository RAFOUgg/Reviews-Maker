/**
 * Orchard Pages Store - Gestion du système multi-pages
 * Permet de créer des reviews sur plusieurs pages avec disposition personnalisable
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Templates de pages prédéfinis par type de review et format
 */
export const PAGE_TEMPLATES = {
    'Fleur': {
        '1:1': [
            {
                id: 'cover',
                label: 'Page de couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type']
            },
            {
                id: 'info-culture',
                label: 'Infos & Culture',
                icon: '🌱',
                modules: ['cultivar', 'breeder', 'farm', 'strainType', 'typeCulture', 'substratMix', 'fertilizationPipeline']
            },
            {
                id: 'notes-detail',
                label: 'Notes détaillées',
                icon: '⭐',
                modules: ['categoryRatings', 'aromas', 'tastes', 'effects']
            },
            {
                id: 'experience',
                label: 'Expérience',
                icon: '✨',
                modules: ['description', 'terpenes', 'dureeEffet', 'author', 'date']
            }
        ],
        '16:9': [
            {
                id: 'cover',
                label: 'Page de couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type', 'cultivar', 'breeder']
            },
            {
                id: 'details',
                label: 'Détails complets',
                icon: '📊',
                modules: ['categoryRatings', 'typeCulture', 'substratMix', 'aromas', 'tastes', 'effects', 'description']
            }
        ],
        '9:16': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating']
            },
            {
                id: 'info',
                label: 'Informations',
                icon: 'ℹ️',
                modules: ['type', 'cultivar', 'breeder', 'farm', 'strainType']
            },
            {
                id: 'ratings',
                label: 'Évaluations',
                icon: '⭐',
                modules: ['categoryRatings', 'aromas', 'effects']
            },
            {
                id: 'details',
                label: 'Détails',
                icon: '📝',
                modules: ['description', 'tastes', 'terpenes', 'author', 'date']
            }
        ]
    },
    'Hash': {
        '1:1': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type']
            },
            {
                id: 'production',
                label: 'Production',
                icon: '⚗️',
                modules: ['hashmaker', 'cultivarsList', 'pipelineSeparation', 'pipelinePurification']
            },
            {
                id: 'evaluation',
                label: 'Évaluation',
                icon: '⭐',
                modules: ['categoryRatings', 'aromas', 'tastes', 'effects']
            },
            {
                id: 'experience',
                label: 'Expérience',
                icon: '✨',
                modules: ['description', 'texture', 'author', 'date']
            }
        ]
    },
    'Concentré': {
        '1:1': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type']
            },
            {
                id: 'extraction',
                label: 'Extraction',
                icon: '🔬',
                modules: ['breeder', 'cultivarsList', 'pipelineExtraction', 'pipelinePurification', 'purgevide']
            },
            {
                id: 'evaluation',
                label: 'Évaluation',
                icon: '⭐',
                modules: ['categoryRatings', 'aromas', 'tastes', 'effects']
            },
            {
                id: 'technique',
                label: 'Technique',
                icon: '💎',
                modules: ['description', 'texture', 'terpenes', 'author', 'date']
            }
        ]
    },
    'Comestible': {
        '1:1': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type']
            },
            {
                id: 'recipe',
                label: 'Recette',
                icon: '📖',
                modules: ['typeProduit', 'breeder', 'recipe']
            },
            {
                id: 'taste-effects',
                label: 'Goûts & Effets',
                icon: '😋',
                modules: ['goutIntensity', 'saveursProduit', 'saveursCannabis', 'effects', 'dureeEffet']
            },
            {
                id: 'experience',
                label: 'Expérience',
                icon: '✨',
                modules: ['description', 'author', 'date']
            }
        ]
    }
};

/**
 * Store Zustand pour la gestion des pages
 */
export const useOrchardPagesStore = create(
    persist(
        (set, get) => ({
            // État
            pagesEnabled: false, // Mode pages activé/désactivé
            currentPageIndex: 0, // Page actuellement affichée
            pages: [], // Liste des pages de la review actuelle

            // Actions

            /**
             * Active ou désactive le mode multi-pages
             */
            togglePagesMode: () => set((state) => {
                const enabled = !state.pagesEnabled;

                // Si on active le mode pages, initialiser avec un template par défaut
                if (enabled && state.pages.length === 0) {
                    const reviewData = get().reviewData;
                    const config = get().config;
                    const defaultPages = getDefaultPages(reviewData?.type, config?.ratio);
                    return { pagesEnabled: enabled, pages: defaultPages, currentPageIndex: 0 };
                }

                return { pagesEnabled: enabled };
            }),

            /**
             * Définit la liste des pages
             */
            setPages: (pages) => set({ pages }),

            /**
             * Ajoute une nouvelle page
             */
            addPage: (page) => set((state) => ({
                pages: [...state.pages, {
                    id: page.id || `page-${Date.now()}`,
                    label: page.label || `Page ${state.pages.length + 1}`,
                    icon: page.icon || '📄',
                    modules: page.modules || [],
                    customLayout: page.customLayout || null
                }]
            })),

            /**
             * Supprime une page
             */
            removePage: (pageId) => set((state) => {
                const newPages = state.pages.filter(p => p.id !== pageId);
                const newIndex = Math.min(state.currentPageIndex, Math.max(0, newPages.length - 1));
                return { pages: newPages, currentPageIndex: newIndex };
            }),

            /**
             * Met à jour une page
             */
            updatePage: (pageId, updates) => set((state) => ({
                pages: state.pages.map(p =>
                    p.id === pageId ? { ...p, ...updates } : p
                )
            })),

            /**
             * Réordonne les pages
             */
            reorderPages: (startIndex, endIndex) => set((state) => {
                const result = Array.from(state.pages);
                const [removed] = result.splice(startIndex, 1);
                result.splice(endIndex, 0, removed);
                return { pages: result };
            }),

            /**
             * Change la page courante
             */
            setCurrentPage: (index) => set({ currentPageIndex: index }),

            /**
             * Page suivante
             */
            nextPage: () => set((state) => ({
                currentPageIndex: Math.min(state.currentPageIndex + 1, state.pages.length - 1)
            })),

            /**
             * Page précédente
             */
            previousPage: () => set((state) => ({
                currentPageIndex: Math.max(state.currentPageIndex - 1, 0)
            })),

            /**
             * Charge un template de pages par défaut
             */
            loadDefaultPages: (reviewType, ratio) => set(() => ({
                pages: getDefaultPages(reviewType, ratio),
                currentPageIndex: 0
            })),

            /**
             * Réinitialise le store
             */
            reset: () => set({
                pagesEnabled: false,
                currentPageIndex: 0,
                pages: []
            })
        }),
        {
            name: 'orchard-pages-storage',
            partialize: (state) => ({
                pagesEnabled: state.pagesEnabled,
                pages: state.pages
            })
        }
    )
);

/**
 * Récupère les pages par défaut selon le type de review et le ratio
 */
function getDefaultPages(reviewType, ratio = '1:1') {
    const type = reviewType || 'Fleur';
    const templates = PAGE_TEMPLATES[type] || PAGE_TEMPLATES['Fleur'];
    const pagesForRatio = templates[ratio] || templates['1:1'];

    return pagesForRatio.map(page => ({
        ...page,
        id: `${page.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
}

export default useOrchardPagesStore;
