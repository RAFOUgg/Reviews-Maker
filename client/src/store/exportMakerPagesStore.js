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
// 7e occurrence de ce même piège (2026-08-02), trouvée par vérification Playwright réelle : `phenoHuntView`
// et `productionChainView` (généalogie/chaîne de production, rendues par `ReadOnlyGenealogyCanvas`/
// `ReadOnlyProductionChainCanvas` dans ModernCompactTemplate/BlogArticleTemplate/SocialStoryTemplate)
// n'apparaissaient dans AUCUNE page d'AUCUN type/ratio — disparaissaient donc silencieusement de tout
// export réellement paginé (le cas courant), alors que l'aperçu live non paginé les montrait très bien.
// Ajoutées à la dernière page de chaque ratio/type (jamais une page dédiée : ces canevas se masquent
// eux-mêmes si la review n'a pas de généalogie/chaîne liée, et une page dédiée uniquement à ça
// produirait une page blanche pour la majorité des reviews qui n'en ont pas — la dernière page a
// toujours au moins `description`/`author`/`date`, jamais vide).
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
                modules: ['substratMix', 'fertilizationPipeline', 'trichomesTranslucides', 'trichomesLaiteux', 'trichomesAmbres', 'modeRecolte', 'poidsBrut', 'poidsNet']
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
                modules: ['description', 'terpenes', 'dureeEffet', 'author', 'date', 'thcLevel', 'cbdLevel', 'thcaLevel', 'cbdaLevel', 'cbgLevel', 'cbcLevel', 'cbnLevel', 'thcvLevel', 'phenoHuntView', 'productionChainView']
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
                modules: ['categoryRatings', 'description', 'thcLevel', 'cbdLevel', 'thcaLevel', 'cbdaLevel', 'cbgLevel', 'cbcLevel', 'cbnLevel', 'thcvLevel', 'dureeEffet']
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
                modules: ['substratMix', 'fertilizationPipeline', 'extraData', 'trichomesTranslucides', 'trichomesLaiteux', 'trichomesAmbres', 'modeRecolte', 'poidsBrut', 'poidsNet']
            },
            {
                id: 'curing',
                label: 'Curing & Maturation',
                icon: '🔥',
                modules: ['curing', 'author', 'date', 'phenoHuntView', 'productionChainView']
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
                modules: ['substratMix', 'fertilizationPipeline', 'curing', 'trichomesTranslucides', 'trichomesLaiteux', 'trichomesAmbres', 'modeRecolte', 'poidsBrut', 'poidsNet']
            },
            {
                id: 'details',
                label: 'Détails',
                icon: '📝',
                modules: ['description', 'tastes', 'terpenes', 'author', 'date', 'thcLevel', 'cbdLevel', 'thcaLevel', 'cbdaLevel', 'cbgLevel', 'cbcLevel', 'cbnLevel', 'thcvLevel', 'phenoHuntView', 'productionChainView']
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
                modules: ['substratMix', 'fertilizationPipeline', 'description', 'trichomesTranslucides', 'trichomesLaiteux', 'trichomesAmbres', 'modeRecolte', 'poidsBrut', 'poidsNet']
            },
            {
                id: 'curing',
                label: 'Curing & Maturation',
                icon: '🔥',
                modules: ['curing', 'author', 'date', 'thcLevel', 'cbdLevel', 'thcaLevel', 'cbdaLevel', 'cbgLevel', 'cbcLevel', 'cbnLevel', 'thcvLevel', 'phenoHuntView', 'productionChainView']
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
                modules: ['substratMix', 'fertilizationPipeline', 'extraData', 'trichomesTranslucides', 'trichomesLaiteux', 'trichomesAmbres', 'modeRecolte', 'poidsBrut', 'poidsNet']
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
                modules: ['description', 'dureeEffet', 'thcLevel', 'cbdLevel', 'thcaLevel', 'cbdaLevel', 'cbgLevel', 'cbcLevel', 'cbnLevel', 'thcvLevel', 'author', 'date', 'phenoHuntView', 'productionChainView']
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
                modules: ['pipelineSeparation', 'methodeSeparation', 'nombrePasses', 'temperatureEau', 'tailleMailles', 'typeMatierePremiere', 'rendementEstime']
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
                modules: ['description', 'author', 'date', 'thcLevel', 'cbdLevel', 'thcaLevel', 'cbdaLevel', 'cbgLevel', 'cbcLevel', 'cbnLevel', 'thcvLevel', 'phenoHuntView', 'productionChainView']
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
                modules: ['pipelineSeparation', 'methodeSeparation', 'nombrePasses', 'temperatureEau', 'tailleMailles', 'typeMatierePremiere', 'rendementEstime']
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
                modules: ['curing', 'author', 'date', 'thcLevel', 'cbdLevel', 'thcaLevel', 'cbdaLevel', 'cbgLevel', 'cbcLevel', 'cbnLevel', 'thcvLevel', 'phenoHuntView', 'productionChainView']
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
                modules: ['pipelineSeparation', 'pipelinePurification', 'curing', 'methodeSeparation', 'nombrePasses', 'temperatureEau', 'tailleMailles', 'typeMatierePremiere', 'rendementEstime']
            },
            {
                id: 'details',
                label: 'Détails',
                icon: '📝',
                modules: ['tastes', 'texture', 'description', 'author', 'date', 'thcLevel', 'cbdLevel', 'thcaLevel', 'cbdaLevel', 'cbgLevel', 'cbcLevel', 'cbnLevel', 'thcvLevel', 'phenoHuntView', 'productionChainView']
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
                modules: ['pipelineSeparation', 'methodeSeparation', 'nombrePasses', 'temperatureEau', 'tailleMailles', 'typeMatierePremiere', 'rendementEstime']
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
                modules: ['description', 'author', 'date', 'thcLevel', 'cbdLevel', 'thcaLevel', 'cbdaLevel', 'cbgLevel', 'cbcLevel', 'cbnLevel', 'thcvLevel', 'phenoHuntView', 'productionChainView']
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
                modules: ['pipelineExtraction', 'methodeExtraction']
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
                modules: ['description', 'terpenes', 'author', 'date', 'thcLevel', 'cbdLevel', 'thcaLevel', 'cbdaLevel', 'cbgLevel', 'cbcLevel', 'cbnLevel', 'thcvLevel', 'phenoHuntView', 'productionChainView']
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
                modules: ['pipelineExtraction', 'methodeExtraction']
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
                modules: ['curing', 'author', 'date', 'thcLevel', 'cbdLevel', 'thcaLevel', 'cbdaLevel', 'cbgLevel', 'cbcLevel', 'cbnLevel', 'thcvLevel', 'phenoHuntView', 'productionChainView']
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
                modules: ['pipelineExtraction', 'pipelinePurification', 'purgevide', 'curing', 'methodeExtraction']
            },
            {
                id: 'details',
                label: 'Détails',
                icon: '📝',
                modules: ['tastes', 'texture', 'description', 'author', 'date', 'thcLevel', 'cbdLevel', 'thcaLevel', 'cbdaLevel', 'cbgLevel', 'cbcLevel', 'cbnLevel', 'thcvLevel', 'phenoHuntView', 'productionChainView']
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
                modules: ['pipelineExtraction', 'methodeExtraction']
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
                modules: ['description', 'terpenes', 'author', 'date', 'thcLevel', 'cbdLevel', 'thcaLevel', 'cbdaLevel', 'cbgLevel', 'cbcLevel', 'cbnLevel', 'thcvLevel', 'phenoHuntView', 'productionChainView']
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
                modules: ['description', 'author', 'date', 'phenoHuntView', 'productionChainView']
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
                modules: ['effects', 'saveursProduit', 'saveursCannabis', 'dureeEffet', 'description', 'author', 'date', 'phenoHuntView', 'productionChainView']
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
                modules: ['saveursCannabis', 'description', 'author', 'date', 'phenoHuntView', 'productionChainView']
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
                modules: ['saveursCannabis', 'description', 'author', 'date', 'phenoHuntView', 'productionChainView']
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

// Normalise n'importe quelle forme de `type` vers une clé valide de `PAGE_TEMPLATES` — trouvé
// 2026-07-29 (6e occurrence du bug de vocabulaire deviné déjà documenté 5 fois dans CLAUDE.md) :
// le `reviewData.type` interne aux hooks de formulaire (`useHashForm.js`/`useConcentrateForm.js`/
// `useEdibleForm.js`) est en minuscules anglais ('hash'/'concentrate'/'edible'), alors que
// `PAGE_TEMPLATES` est indexé en français capitalisé ('Hash'/'Concentré'/'Comestible'/'Fleur',
// SINGULIER). La vraie review sauvegardée en API utilise elle un 3e format encore différent pour
// les fleurs ('Fleurs', PLURIEL) — sans cette normalisation, `PAGE_TEMPLATES[type]` ne matche
// JAMAIS pour Hash/Concentré/Comestible dans Export Maker Studio (repli silencieux sur le
// gabarit Fleur), ce qui empêchait tout champ spécifique à ces types (méthode de séparation,
// etc.) d'avoir une page où s'afficher.
const TYPE_KEY_ALIASES = {
    flower: 'Fleur', fleur: 'Fleur', fleurs: 'Fleur',
    hash: 'Hash',
    concentrate: 'Concentré', concentré: 'Concentré', concentre: 'Concentré', concentres: 'Concentré',
    edible: 'Comestible', comestible: 'Comestible', comestibles: 'Comestible',
};

export function normalizePageTemplateType(reviewType) {
    if (reviewType && PAGE_TEMPLATES[reviewType]) return reviewType;
    const lower = String(reviewType || '').toLowerCase();
    return TYPE_KEY_ALIASES[lower] || 'Fleur';
}

/**
 * Récupère les pages par défaut selon le type de review et le ratio
 */
export function getDefaultPages(reviewType, ratio = '1:1') {
    const type = normalizePageTemplateType(reviewType);
    const templates = PAGE_TEMPLATES[type];
    const pagesForRatio = templates[ratio] || templates['1:1'];

    return pagesForRatio.map(page => ({
        ...page,
        id: `${page.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
}

export default useExportMakerPagesStore;
