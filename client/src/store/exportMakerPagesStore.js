/**
 * Export Maker Pages Store - Gestion du système multi-pages
 * Permet de créer des reviews sur plusieurs pages avec disposition personnalisable
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Templates de pages prédéfinis par type de review et format
 */
// NB (2026-07-27) : les listes `modules` ci-dessous DOIVENT utiliser les clés réellement lues par
// `TemplateRenderer`'s `filteredConfig` (= les clés de `DEFAULT_CONFIG.contentModules`,
// `exportMakerStore.js` — les mêmes que celles pilotées par `fieldRegistry.js`/`ContentModuleControls`).
// Piège déjà rencontré deux fois ailleurs dans Export Maker (overflow, StepCard) : une clé qui
// N'EXISTE PAS dans `contentModules` (`typeCulture`, `pipelineCuring`…) ne fait RIEN — elle n'est
// simplement jamais lue, et pire, toute clé RÉELLE absente de la liste d'une page est mise à
// `false` explicitement par le filtrage, masquant la section correspondante sur cette page. Trouvé
// ici : aucune page Fleur ne listait la vraie clé `curing`, donc le pipeline Curing & Maturation
// disparaissait silencieusement de TOUTE pagination automatique (jamais coupé — jamais rendu du
// tout). Culture et curing ont chacun leur propre page dédiée ci-dessous (plutôt que partagés avec
// d'autres sections) pour laisser à un pipeline à beaucoup d'étapes toute la hauteur disponible.
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
                id: 'info',
                label: 'Infos',
                icon: 'ℹ️',
                modules: ['cultivar', 'breeder', 'farm', 'strainType']
            },
            {
                id: 'culture',
                label: 'Culture',
                icon: '🌱',
                modules: ['substratMix', 'fertilizationPipeline']
            },
            {
                id: 'curing',
                label: 'Curing & Maturation',
                icon: '🔥',
                modules: ['curing']
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
                modules: ['image', 'title', 'rating', 'type', 'cultivar', 'breeder', 'farm', 'strainType']
            },
            {
                id: 'evaluation',
                label: 'Évaluations',
                icon: '⭐',
                modules: ['categoryRatings', 'description', 'thcLevel', 'cbdLevel', 'dureeEffet']
            },
            {
                id: 'sensory',
                label: 'Profil Sensoriel',
                icon: '🌸',
                modules: ['aromas', 'tastes', 'effects', 'terpenes', 'dryPuffNotes', 'inhalationNotes', 'exhalationNotes']
            },
            {
                id: 'culture',
                label: 'Culture',
                icon: '🌱',
                modules: ['substratMix', 'fertilizationPipeline', 'extraData']
            },
            {
                id: 'curing',
                label: 'Curing & Maturation',
                icon: '🔥',
                modules: ['curing', 'author', 'date']
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
                id: 'culture-curing',
                label: 'Culture & Curing',
                icon: '🌱',
                modules: ['substratMix', 'fertilizationPipeline', 'curing']
            },
            {
                id: 'details',
                label: 'Détails',
                icon: '📝',
                modules: ['description', 'tastes', 'terpenes', 'author', 'date']
            }
        ],
        '4:3': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type', 'cultivar', 'breeder', 'farm']
            },
            {
                id: 'evaluation',
                label: 'Évaluations',
                icon: '⭐',
                modules: ['categoryRatings', 'aromas', 'tastes', 'effects']
            },
            {
                id: 'culture',
                label: 'Culture',
                icon: '🌱',
                modules: ['substratMix', 'fertilizationPipeline', 'description']
            },
            {
                id: 'curing',
                label: 'Curing & Maturation',
                icon: '🔥',
                modules: ['curing', 'author', 'date']
            }
        ],
        'A4': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type', 'cultivar', 'breeder', 'farm', 'strainType']
            },
            {
                id: 'culture',
                label: 'Culture',
                icon: '🌱',
                modules: ['substratMix', 'fertilizationPipeline', 'extraData']
            },
            {
                id: 'curing',
                label: 'Curing & Maturation',
                icon: '🔥',
                modules: ['curing']
            },
            {
                id: 'evaluation',
                label: 'Évaluations',
                icon: '⭐',
                modules: ['categoryRatings', 'aromas', 'tastes', 'effects', 'terpenes']
            },
            {
                id: 'details',
                label: 'Détails complets',
                icon: '📝',
                modules: ['description', 'dureeEffet', 'thcLevel', 'cbdLevel', 'author', 'date']
            }
        ]
    },
    'Hash': {
        // NB (2026-07-28) : séparation/purification/curing ont chacun leur propre page (même
        // principe que Fleur ci-dessus) — avant ce correctif, `curing` était absent de TOUTES les
        // pages 1:1 et 9:16 (bug identique à celui documenté plus haut pour Fleur : le pipeline
        // Curing & Maturation d'une review Hash disparaissait silencieusement de l'export en 1:1/9:16).
        '1:1': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type']
            },
            {
                id: 'info',
                label: 'Infos',
                icon: 'ℹ️',
                modules: ['hashmaker', 'cultivarsList', 'texture']
            },
            {
                id: 'separation',
                label: 'Séparation',
                icon: '🔬',
                modules: ['pipelineSeparation']
            },
            {
                id: 'purification',
                label: 'Purification',
                icon: '✨',
                modules: ['pipelinePurification']
            },
            {
                id: 'curing',
                label: 'Curing & Maturation',
                icon: '🔥',
                modules: ['curing']
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
                modules: ['description', 'author', 'date']
            }
        ],
        '16:9': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type', 'hashmaker', 'cultivarsList']
            },
            {
                id: 'evaluation',
                label: 'Évaluation',
                icon: '⭐',
                modules: ['categoryRatings', 'description', 'texture', 'dureeEffet']
            },
            {
                id: 'sensory',
                label: 'Profil Sensoriel',
                icon: '🌸',
                modules: ['aromas', 'tastes', 'effects']
            },
            {
                id: 'separation',
                label: 'Séparation',
                icon: '🔬',
                modules: ['pipelineSeparation']
            },
            {
                id: 'purification',
                label: 'Purification',
                icon: '✨',
                modules: ['pipelinePurification']
            },
            {
                id: 'curing',
                label: 'Curing & Maturation',
                icon: '🔥',
                modules: ['curing', 'author', 'date']
            }
        ],
        '9:16': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type']
            },
            {
                id: 'info',
                label: 'Infos',
                icon: 'ℹ️',
                modules: ['hashmaker', 'cultivarsList']
            },
            {
                id: 'evaluation',
                label: 'Évaluation',
                icon: '⭐',
                modules: ['categoryRatings', 'aromas', 'effects']
            },
            {
                id: 'production',
                label: 'Production',
                icon: '⚗️',
                modules: ['pipelineSeparation', 'pipelinePurification', 'curing']
            },
            {
                id: 'details',
                label: 'Détails',
                icon: '📝',
                modules: ['tastes', 'texture', 'description', 'author', 'date']
            }
        ],
        '4:3': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type', 'hashmaker', 'cultivarsList']
            },
            {
                id: 'evaluation',
                label: 'Évaluation',
                icon: '⭐',
                modules: ['categoryRatings', 'aromas', 'tastes', 'effects', 'texture']
            },
            {
                id: 'separation',
                label: 'Séparation',
                icon: '🔬',
                modules: ['pipelineSeparation']
            },
            {
                id: 'purification',
                label: 'Purification',
                icon: '✨',
                modules: ['pipelinePurification']
            },
            {
                id: 'curing',
                label: 'Curing & Maturation',
                icon: '🔥',
                modules: ['curing']
            },
            {
                id: 'details',
                label: 'Détails',
                icon: '📝',
                modules: ['description', 'author', 'date']
            }
        ]
    },
    'Concentré': {
        // Même principe que Hash ci-dessus : extraction/purification/curing isolés sur leur propre
        // page ; `curing` était absent de TOUTES les pages 1:1, 9:16 et 4:3 avant ce correctif.
        '1:1': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type']
            },
            {
                id: 'info',
                label: 'Infos',
                icon: 'ℹ️',
                modules: ['breeder', 'cultivarsList', 'texture']
            },
            {
                id: 'extraction',
                label: 'Extraction',
                icon: '🔬',
                modules: ['pipelineExtraction']
            },
            {
                id: 'purification',
                label: 'Purification',
                icon: '✨',
                modules: ['pipelinePurification', 'purgevide']
            },
            {
                id: 'curing',
                label: 'Curing & Maturation',
                icon: '🔥',
                modules: ['curing']
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
                modules: ['description', 'terpenes', 'author', 'date']
            }
        ],
        '16:9': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type', 'breeder', 'cultivarsList']
            },
            {
                id: 'evaluation',
                label: 'Évaluation',
                icon: '⭐',
                modules: ['categoryRatings', 'description', 'texture', 'terpenes']
            },
            {
                id: 'sensory',
                label: 'Profil Sensoriel',
                icon: '🌸',
                modules: ['aromas', 'tastes', 'effects']
            },
            {
                id: 'extraction',
                label: 'Extraction',
                icon: '🔬',
                modules: ['pipelineExtraction']
            },
            {
                id: 'purification',
                label: 'Purification',
                icon: '✨',
                modules: ['pipelinePurification', 'purgevide']
            },
            {
                id: 'curing',
                label: 'Curing & Maturation',
                icon: '🔥',
                modules: ['curing', 'author', 'date']
            }
        ],
        '9:16': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type']
            },
            {
                id: 'info',
                label: 'Infos',
                icon: 'ℹ️',
                modules: ['breeder', 'cultivarsList']
            },
            {
                id: 'evaluation',
                label: 'Évaluation',
                icon: '⭐',
                modules: ['categoryRatings', 'aromas', 'effects']
            },
            {
                id: 'production',
                label: 'Production',
                icon: '⚗️',
                modules: ['pipelineExtraction', 'pipelinePurification', 'purgevide', 'curing']
            },
            {
                id: 'details',
                label: 'Détails',
                icon: '📝',
                modules: ['tastes', 'texture', 'description', 'author', 'date']
            }
        ],
        '4:3': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type', 'breeder', 'cultivarsList']
            },
            {
                id: 'evaluation',
                label: 'Évaluation',
                icon: '⭐',
                modules: ['categoryRatings', 'aromas', 'tastes', 'effects', 'texture']
            },
            {
                id: 'extraction',
                label: 'Extraction',
                icon: '🔬',
                modules: ['pipelineExtraction']
            },
            {
                id: 'purification',
                label: 'Purification',
                icon: '✨',
                modules: ['pipelinePurification', 'purgevide']
            },
            {
                id: 'curing',
                label: 'Curing & Maturation',
                icon: '🔥',
                modules: ['curing']
            },
            {
                id: 'details',
                label: 'Détails',
                icon: '📝',
                modules: ['description', 'terpenes', 'author', 'date']
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
        ],
        '16:9': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type', 'breeder']
            },
            {
                id: 'recipe',
                label: 'Recette',
                icon: '📖',
                modules: ['typeProduit', 'recipe', 'goutIntensity']
            },
            {
                id: 'effects',
                label: 'Effets & Expérience',
                icon: '💥',
                modules: ['effects', 'saveursProduit', 'saveursCannabis', 'dureeEffet', 'description', 'author', 'date']
            }
        ],
        '9:16': [
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
                modules: ['goutIntensity', 'saveursProduit', 'effects', 'dureeEffet']
            },
            {
                id: 'experience',
                label: 'Expérience',
                icon: '✨',
                modules: ['saveursCannabis', 'description', 'author', 'date']
            }
        ],
        '4:3': [
            {
                id: 'cover',
                label: 'Couverture',
                icon: '📸',
                modules: ['image', 'title', 'rating', 'type', 'breeder']
            },
            {
                id: 'recipe-effects',
                label: 'Recette & Effets',
                icon: '📖',
                modules: ['typeProduit', 'recipe', 'goutIntensity', 'saveursProduit', 'effects', 'dureeEffet']
            },
            {
                id: 'experience',
                label: 'Expérience',
                icon: '✨',
                modules: ['saveursCannabis', 'description', 'author', 'date']
            }
        ]
    }
};

const PAGES_STORAGE_KEY = 'export-maker-pages-storage';
const LEGACY_PAGES_STORAGE_KEY = 'orchard-pages-storage'; // ancien nom de code (renommage 2026-07-28)

// Migration ponctuelle, même logique que exportMakerStore.js : amorce la nouvelle clé depuis
// l'ancienne si elle n'existe pas encore, pour ne pas perdre la trame de pages en cours des
// utilisateurs déjà ouverts sur l'app au moment du renommage.
try {
    if (!localStorage.getItem(PAGES_STORAGE_KEY) && localStorage.getItem(LEGACY_PAGES_STORAGE_KEY)) {
        localStorage.setItem(PAGES_STORAGE_KEY, localStorage.getItem(LEGACY_PAGES_STORAGE_KEY));
    }
} catch { /* localStorage indisponible (SSR, mode privé strict...) — pas bloquant */ }

/**
 * Store Zustand pour la gestion des pages
 */
export const useExportMakerPagesStore = create(
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
                console.log('📄 togglePagesMode:', { enabled, currentPagesCount: state.pages.length });
                return { pagesEnabled: enabled };
            }),

            /**
             * Définit la liste des pages
             */
            setPages: (pages) => set({ pages }),

            /**
             * Ajoute une nouvelle page
             */
            addPage: (page) => set((state) => {
                if (state.pages.length >= 9) return state;
                return {
                    pages: [...state.pages, {
                        id: page.id || `page-${Date.now()}`,
                        label: page.label || `Page ${state.pages.length + 1}`,
                        icon: page.icon || '📄',
                        modules: page.modules || [],
                        customLayout: page.customLayout || null
                    }]
                };
            }),

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
            name: PAGES_STORAGE_KEY,
            partialize: (state) => ({
                pagesEnabled: state.pagesEnabled,
                pages: state.pages
            }),
            // Validation et correction des données lors de la restauration
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.error('[ExportMakerPages] Error rehydrating storage:', error)
                    return
                }

                // Valider et corriger les données restaurées
                if (state) {
                    // S'assurer que pages est toujours un tableau
                    if (!Array.isArray(state.pages)) {
                        console.warn('[ExportMakerPages] Invalid pages data, resetting to empty array')
                        state.pages = []
                    }

                    // S'assurer que currentPageIndex est valide
                    if (typeof state.currentPageIndex !== 'number' || state.currentPageIndex < 0) {
                        state.currentPageIndex = 0
                    }

                    // S'assurer que currentPageIndex ne dépasse pas la longueur du tableau
                    if (state.currentPageIndex >= state.pages.length && state.pages.length > 0) {
                        state.currentPageIndex = 0
                    }
                }
            }
        }
    )
);

/**
 * Récupère les pages par défaut selon le type de review et le ratio
 */
export function getDefaultPages(reviewType, ratio = '1:1') {
    const type = reviewType || 'Fleur';
    const templates = PAGE_TEMPLATES[type] || PAGE_TEMPLATES['Fleur'];
    const pagesForRatio = templates[ratio] || templates['1:1'];

    return pagesForRatio.map(page => ({
        ...page,
        id: `${page.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
}

export default useExportMakerPagesStore;
