import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COLOR_PALETTES, DEFAULT_TEMPLATES, TEMPLATE_MODULE_PRESETS, TEMPLATE_DEFAULT_IDENTITY } from './exportMakerConstants';

// Note: COLOR_PALETTES et DEFAULT_TEMPLATES sont maintenant importés depuis exportMakerConstants.js
// pour éviter les problèmes de références circulaires et les re-renders infinis

// Les constantes sont maintenant réexportées pour maintenir la compatibilité
export { COLOR_PALETTES, DEFAULT_TEMPLATES, TEMPLATE_MODULE_PRESETS, TEMPLATE_DEFAULT_IDENTITY };
export { DEFAULT_CONFIG };

// ═══════════════════════════════════════════════════════════════════════════════
// FORCE RESET: Supprimer localStorage obsolète AVANT que zustand ne charge
// ═══════════════════════════════════════════════════════════════════════════════
const CURRENT_STORAGE_VERSION = 8; // v8: dark default background - BUILD MAR 2026
const STORAGE_KEY = 'export-maker-storage';
const LEGACY_STORAGE_KEY = 'orchard-storage'; // ancien nom de code "Orchard" (renommage 2026-07-28)

// Migration ponctuelle : amorce la nouvelle clé depuis l'ancienne si elle n'existe pas encore,
// pour ne pas jeter la config en cours des utilisateurs déjà ouverts sur l'app au moment du
// renommage. Sans risque de conflit avec le FORCE RESET ci-dessous, qui s'applique après.
try {
    if (!localStorage.getItem(STORAGE_KEY) && localStorage.getItem(LEGACY_STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, localStorage.getItem(LEGACY_STORAGE_KEY));
    }
} catch { /* localStorage indisponible (SSR, mode privé strict...) — pas bloquant */ }

// FORCE IMMEDIATE RESET - Dec 2 2025
console.log('🚀 Export Maker Store Loading - Version 7 - Forcing localStorage check...');

try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        const parsed = JSON.parse(stored);
        // zustand persist peut stocker: { state: {...}, version: X } ou { version: X, state: {...} }
        const storedVersion = parsed?.version ?? 0;
        // Les modules peuvent être dans state.config.contentModules ou config.contentModules
        const stateConfig = parsed?.state?.config || parsed?.config || {};
        const modulesCount = Object.keys(stateConfig?.contentModules || {}).length;

        console.log('🔍 Export Maker Storage Check:', {
            storedVersion,
            currentVersion: CURRENT_STORAGE_VERSION,
            modulesCount,
            needsReset: storedVersion < CURRENT_STORAGE_VERSION || modulesCount < 50
        });

        // TOUJOURS reset si version < 8 OU moins de 70 modules
        if (storedVersion < CURRENT_STORAGE_VERSION || modulesCount < 70) {
            console.warn('🗑️ FORCING localStorage reset - old version or incomplete modules');
            console.warn('   Stored version:', storedVersion, '| Current:', CURRENT_STORAGE_VERSION);
            console.warn('   Modules count:', modulesCount, '(need 70+)');
            localStorage.removeItem(STORAGE_KEY);
            console.warn('✅ localStorage DELETED - will recreate with 80+ modules');
        }
    }
} catch (e) {
    console.warn('Export Maker storage check failed, forcing removal:', e);
    try { localStorage.removeItem(STORAGE_KEY); } catch { }
}

// Configuration par défaut
const DEFAULT_CONFIG = {
    // Template sélectionné
    template: 'modernCompact',
    ratio: '1:1',

    // Verrouillage de config par template (2026-07-30) : tant que `templateLocked` est vrai,
    // Typographie/Couleurs/Contenu/Image&Logo restent en lecture seule dans l'UI (ConfigPane) —
    // choisir un template applique VRAIMENT son identité visuelle par défaut au lieu de laisser
    // les réglages précédents "survivre" silencieusement. `unlockTemplateConfig()` (action
    // ci-dessous) est le seul moyen de repasser à `false`. `loadPreset()`/`applyConfig()` posent
    // toujours `false` : un préréglage chargé ou une review déjà configurée est par nature déjà
    // personnalisé(e), jamais reverrouillé(e) automatiquement.
    templateLocked: true,

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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
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
        // Cannabinoïdes secondaires (CannabinoidGrid, RegistrySections.jsx) — ajoutés 2026-08-02 en
        // même temps que thcLevel/cbdLevel dans PAGE_TEMPLATES (exportMakerPagesStore.js), mais
        // oubliés ici dans un premier temps : `TemplateRenderer`'s filtre par page ne force à `false`
        // QUE les clés déjà présentes dans `contentModules` — une clé absente d'ici passe outre le
        // filtrage et reste visible sur TOUTES les pages d'un export paginé au lieu d'une seule.
        thcaLevel: true,
        cbdaLevel: true,
        cbgLevel: true,
        cbcLevel: true,
        cbnLevel: true,
        thcvLevel: true,
        strainType: true,
        indicaRatio: true,
        sativaRatio: true,
        strainRatio: true,
        parentage: true,
        phenotypeCode: true,
        geneticTreeId: true,

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

        // === MÉTADONNÉES RÉCOLTE/SÉPARATION/EXTRACTION (hors tableau d'étapes pipeline) ===
        // Ajoutées 2026-07-29 : ces clés n'existaient nulle part dans `contentModules` alors que
        // `fieldRegistry.js` les référence déjà (groupes harvest/separation/extraction) et que
        // `isModuleOn()` traite toute clé absente comme active sur CHAQUE page — sans entrée ici,
        // le filtre par page de `TemplateRenderer` ne peut jamais les désactiver nulle part, donc
        // elles se répétaient sur toutes les pages une fois la pagination active (ex. "Méthode
        // d'extraction"/"Méthode de séparation" sur DetailedCardTemplate).
        trichomesTranslucides: true,
        trichomesLaiteux: true,
        trichomesAmbres: true,
        modeRecolte: true,
        poidsBrut: true,
        poidsNet: true,
        methodeSeparation: true,
        nombrePasses: true,
        temperatureEau: true,
        tailleMailles: true,
        typeMatierePremiere: true,
        rendementEstime: true,
        methodeExtraction: true,

        // === VUES INTERACTIVES (Fiche Détaillée uniquement) ===
        phenoHuntView: true,
        productionChainView: true,
        pipelineInteractiveView: true,

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
        'thcLevel', 'cbdLevel', 'strainType', 'indicaRatio', 'parentage', 'phenotypeCode',

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
        opacity: 1,
        selectedIndex: 0,
        showGallery: false
    },

    // Logo/Filigrane
    branding: {
        enabled: false,
        logoUrl: '',
        position: 'bottom-right',
        opacity: 0.7,
        size: 'medium'
    },

    // Pagination
    pagination: {
        enabled: true,       // auto-paginate when content overflows
        maxPages: 9,         // max pages allowed (1-9)
        showPageNumbers: true,
        pageBreakMode: 'auto', // 'auto' | 'manual' — auto distributes, manual uses explicit breaks
    },

    // Per-section style overrides (keyed by section key e.g. "header", "aromas", etc.)
    // Each entry: { fontSize, fontWeight, accentColor, displayStyle, borderRadius, padding, layout, columns, visible, opacity, background }
    sectionStyles: {},
};

// ═══════════════════════════════════════════════════════════════════════════════
// Résolution de contentModules périmés (schéma qui a évolué depuis l'enregistrement)
// ═══════════════════════════════════════════════════════════════════════════════
// Un `exportMakerConfig` sauvegardé sur une Review (via ExportMakerPanel) est écrit une fois puis
// relu tel quel par ExportModal/PublicRenderPage — contrairement à la session d'édition en
// localStorage, qui bénéficie déjà du garde-fou `merge()` du middleware `persist` ci-dessous.
// Une review configurée avant l'ajout de nouvelles clés à DEFAULT_CONFIG.contentModules
// (nouveau champ de formulaire, nouveau module) se retrouve donc avec des sections qui
// exigent une clé explicitement `true` (style "opt-in", ex. DetailedCardTemplate.jsx)
// silencieusement vides, alors que les sections "opt-out" (`!== false`) survivent — c'est
// exactement le symptôme "review pleine, export presque vide" sur une review déjà éditée.
// Cette fonction applique la même règle que `merge()` (moins de 70 clés = préréglage/format
// périmé, on force les défauts ; sinon on fusionne pour combler les clés manquantes) à
// n'importe quel `contentModules` sauvegardé, y compris en base de données.
export function resolveContentModules(savedContentModules) {
    const savedCount = Object.keys(savedContentModules || {}).length;
    if (savedCount < 70) return { ...DEFAULT_CONFIG.contentModules };
    return { ...DEFAULT_CONFIG.contentModules, ...savedContentModules };
}

// Résout une config de review potentiellement périmée/partielle en repartant toujours de
// DEFAULT_CONFIG (nouvelles clés de premier niveau incluses) puis en fusionnant contentModules
// via `resolveContentModules` (les modules exigent une règle de fusion spécifique, cf. ci-dessus).
export function resolveExportMakerConfig(savedConfig) {
    return {
        ...DEFAULT_CONFIG,
        ...(savedConfig || {}),
        contentModules: resolveContentModules(savedConfig?.contentModules),
        // `templateLocked` (2026-07-30) ne doit PAS hériter du défaut `true` de DEFAULT_CONFIG ici
        // comme les autres clés : une review sauvegardée AVANT ce chantier n'a jamais eu cette clé
        // du tout, et sa config est par définition déjà une personnalisation existante (pas un
        // template fraîchement choisi) — la traiter comme verrouillée regriserait à tort ses
        // contrôles. Seule une review qui a explicitement ENREGISTRÉ `templateLocked` (vrai ou
        // faux, depuis ce chantier) voit cette valeur respectée telle quelle.
        templateLocked: savedConfig && Object.prototype.hasOwnProperty.call(savedConfig, 'templateLocked')
            ? savedConfig.templateLocked
            : false,
    };
}

export const useExportMakerStore = create(
    persist(
        (set, get) => ({
            // État de l'interface
            activePanel: 'template', // 'template' | 'typography' | 'colors' | 'content' | 'image'
            isPreviewFullscreen: false,

            // Configuration actuelle
            config: { ...DEFAULT_CONFIG },

            // Config souvenue par template (2026-08-02), en mémoire pour la session d'édition en
            // cours uniquement (jamais persisté — voir `partialize` plus bas) : basculer entre
            // templates ne doit plus écraser la personnalisation déjà faite sur un template si on y
            // revient plus tard dans la même session. Clé = id de template, valeur = dernier `config`
            // complet actif pour ce template. Remise à zéro à chaque review chargée (`applyConfig`)
            // ou config réinitialisée (`resetConfig`) — la mémoire ne doit pas fuiter d'une review à
            // l'autre.
            configByTemplate: {},

            // Préréglages sauvegardés
            presets: [],
            activePreset: null,

            // Templates dynamiques (permet d'enregistrer et personnaliser de nouveaux templates)
            templates: { ...DEFAULT_TEMPLATES },

            // Données de la review en cours de rendu
            reviewData: null,

            // Actions pour modifier la configuration
            //
            // Choisir un template applique désormais VRAIMENT son identité par défaut — typo,
            // couleurs ET contentModules (remplacement, plus une simple fusion partielle des
            // modules comme avant le 2026-07-30) — et reverrouille la config (`templateLocked:
            // true`). Sans ça, changer de template ne changeait pas l'apparence si l'utilisateur
            // avait déjà personnalisé police/couleurs, et rien ne distinguait "config encore
            // fidèle au template" de "config dérivée".
            // Basculer de template restaure désormais la config souvenue de ce template si on l'a
            // déjà visité dans cette session (`configByTemplate`, 2026-08-02) — sinon (première
            // visite) calcule les défauts du template comme avant (identité TEMPLATE_DEFAULT_IDENTITY
            // + preset de modules + verrouillage). Dans les deux cas, la config qu'on quitte est
            // d'abord sauvegardée dans sa propre case pour pouvoir y revenir plus tard intacte.
            setTemplate: (templateId) => set((state) => {
                const outgoingId = state.config.template;
                const configByTemplate = {
                    ...state.configByTemplate,
                    ...(outgoingId ? { [outgoingId]: state.config } : {}),
                };

                const remembered = configByTemplate[templateId];
                if (remembered) {
                    return { config: remembered, configByTemplate };
                }

                const templateDef = get().templates[templateId] || DEFAULT_TEMPLATES[templateId];
                const newRatio = templateDef?.defaultRatio || '1:1';

                const identity = TEMPLATE_DEFAULT_IDENTITY[templateId];
                const palette = identity ? COLOR_PALETTES[identity.defaultPalette] : null;

                const preset = TEMPLATE_MODULE_PRESETS[templateId];
                let newModules = { ...DEFAULT_CONFIG.contentModules };
                if (preset) {
                    if (preset.enable) preset.enable.forEach(m => { newModules[m] = true; });
                    if (preset.disable) preset.disable.forEach(m => { newModules[m] = false; });
                }

                const freshConfig = {
                    ...state.config,
                    template: templateId,
                    ratio: newRatio,
                    contentModules: newModules,
                    typography: identity
                        ? { ...DEFAULT_CONFIG.typography, ...identity.defaultTypography }
                        : { ...DEFAULT_CONFIG.typography },
                    colors: palette
                        ? { ...DEFAULT_CONFIG.colors, palette: identity.defaultPalette, ...palette }
                        : { ...DEFAULT_CONFIG.colors },
                    templateLocked: true,
                };

                return { config: freshConfig, configByTemplate: { ...configByTemplate, [templateId]: freshConfig } };
            }),

            // Sort la config du verrou template — seul moyen de repasser `templateLocked` à false
            // sans passer par `loadPreset`/`applyConfig` (qui l'exemptent déjà automatiquement).
            unlockTemplateConfig: () => set((state) => ({
                config: { ...state.config, templateLocked: false }
            })),

            setRatio: (ratio) => set((state) => ({
                config: { ...state.config, ratio }
            })),

            // Chantier C1 (2026-07-30) — revient sur le comportement initial du verrou (correctif
            // #9, "contrôles désactivés + bouton Personnaliser") : la première modification sur
            // un onglet Contenu/Typographie/Couleurs/Image&Logo déverrouille désormais AUTOMATIQUEMENT
            // la config (pose `templateLocked:false`) puis applique le changement, au lieu de
            // l'ignorer silencieusement. Décision utilisateur explicite ("lorsqu'on modifie un
            // paramètre → passer direct en mode personnalisé"). `unlockTemplateConfig()` reste
            // disponible pour un déverrouillage explicite sans toucher à aucun réglage.
            updateTypography: (updates) => set((state) => ({
                config: { ...state.config, templateLocked: false, typography: { ...state.config.typography, ...updates } }
            })),

            updateColors: (updates) => set((state) => ({
                config: { ...state.config, templateLocked: false, colors: { ...state.config.colors, ...updates } }
            })),

            applyColorPalette: (paletteName) => {
                const palette = COLOR_PALETTES[paletteName];
                if (!palette) return;

                set((state) => ({
                    config: {
                        ...state.config,
                        templateLocked: false,
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
                    templateLocked: false,
                    contentModules: {
                        ...state.config.contentModules,
                        [moduleName]: !state.config.contentModules[moduleName]
                    }
                }
            })),

            // Set all content modules at once (for presets)
            setContentModules: (modules) => set((state) => ({
                config: { ...state.config, templateLocked: false, contentModules: { ...state.config.contentModules, ...modules } }
            })),

            reorderModules: (newOrder) => set((state) => ({
                config: { ...state.config, templateLocked: false, moduleOrder: newOrder }
            })),

            updateImage: (updates) => set((state) => ({
                config: { ...state.config, templateLocked: false, image: { ...state.config.image, ...updates } }
            })),

            updateBranding: (updates) => set((state) => ({
                config: { ...state.config, templateLocked: false, branding: { ...state.config.branding, ...updates } }
            })),

            updatePagination: (updates) => set((state) => ({
                config: {
                    ...state.config,
                    pagination: { ...state.config.pagination, ...updates }
                }
            })),

            // Per-section style override
            updateSectionStyle: (sectionKey, updates) => set((state) => ({
                config: {
                    ...state.config,
                    templateLocked: false,
                    sectionStyles: {
                        ...state.config.sectionStyles,
                        [sectionKey]: { ...(state.config.sectionStyles?.[sectionKey] || {}), ...updates }
                    }
                }
            })),

            resetSectionStyle: (sectionKey) => set((state) => {
                const { [sectionKey]: _, ...rest } = state.config.sectionStyles || {};
                return { config: { ...state.config, templateLocked: false, sectionStyles: rest } };
            }),

            // Gestion des préréglages — persistés localement (réactivité immédiate) ET côté
            // serveur via /api/library/templates (templateType 'orchard') pour qu'ils survivent
            // au nettoyage du navigateur et apparaissent dans Bibliothèque > Templates.
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

                fetch('/api/library/templates', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        description,
                        templateType: 'orchard',
                        format: preset.config.ratio || '1:1',
                        config: preset.config,
                    }),
                }).then(res => (res.ok ? res.json() : null)).then(saved => {
                    if (!saved) return;
                    set((state) => ({
                        presets: state.presets.map(p => p.id === preset.id ? { ...p, remoteId: saved.id } : p)
                    }));
                }).catch(() => { /* préréglage local conservé même si la synchro échoue */ });

                return preset;
            },

            // Récupère les préréglages Export Maker sauvegardés côté serveur et les fusionne avec
            // les préréglages locaux (par remoteId, pour éviter les doublons entre navigateurs).
            fetchRemotePresets: async () => {
                try {
                    const res = await fetch('/api/library/templates?templateType=orchard', { credentials: 'include' });
                    if (!res.ok) return;
                    const remote = await res.json();
                    if (!Array.isArray(remote)) return;

                    set((state) => {
                        const knownRemoteIds = new Set(state.presets.map(p => p.remoteId).filter(Boolean));
                        const newOnes = remote
                            .filter(t => !knownRemoteIds.has(t.id))
                            .map(t => ({
                                id: `remote-${t.id}`,
                                remoteId: t.id,
                                name: t.name,
                                description: t.description || '',
                                config: typeof t.config === 'string' ? JSON.parse(t.config) : t.config,
                                createdAt: t.createdAt,
                            }));
                        return newOnes.length > 0 ? { presets: [...state.presets, ...newOnes] } : {};
                    });
                } catch {
                    // pas bloquant — les préréglages locaux restent utilisables hors-ligne
                }
            },

            loadPreset: (presetId) => {
                const preset = get().presets.find(p => p.id === presetId);
                if (!preset) return;

                // Un préréglage chargé est par nature déjà personnalisé — jamais reverrouillé.
                const loaded = { ...preset.config, templateLocked: false };
                set((state) => ({
                    config: loaded,
                    // Mémorisée pour son propre template aussi, sinon un aller-retour vers ce
                    // template dans la même session perdrait le préréglage au profit de ses défauts.
                    configByTemplate: loaded.template ? { ...state.configByTemplate, [loaded.template]: loaded } : state.configByTemplate,
                    activePreset: presetId
                }));
            },

            deletePreset: (presetId) => {
                const preset = get().presets.find(p => p.id === presetId);
                set((state) => ({
                    presets: state.presets.filter(p => p.id !== presetId),
                    activePreset: state.activePreset === presetId ? null : state.activePreset
                }));
                if (preset?.remoteId) {
                    fetch(`/api/library/templates/${preset.remoteId}`, { method: 'DELETE', credentials: 'include' }).catch(() => {});
                }
            },

            updatePreset: (presetId, updates) => {
                set((state) => ({
                    presets: state.presets.map(p =>
                        p.id === presetId ? { ...p, ...updates } : p
                    )
                }));
                const preset = get().presets.find(p => p.id === presetId);
                if (preset?.remoteId) {
                    fetch(`/api/library/templates/${preset.remoteId}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: preset.name, description: preset.description, config: preset.config }),
                    }).catch(() => {});
                }
            },

            // Actions de l'interface
            setActivePanel: (panel) => set({ activePanel: panel }),

            togglePreviewFullscreen: () => set((state) => ({
                isPreviewFullscreen: !state.isPreviewFullscreen
            })),

            // Setter explicite (par opposition au toggle ci-dessus) — nécessaire pour resynchroniser
            // ce flag avec l'état réel du navigateur quand l'utilisateur quitte le plein écran via
            // Échap/chrome navigateur plutôt que par le bouton (écouteur `fullscreenchange`).
            setPreviewFullscreen: (value) => set({ isPreviewFullscreen: !!value }),

            setReviewData: (data) => set({ reviewData: data }),

            // Réinitialiser à la configuration par défaut — `configByTemplate` vidée avec, sinon un
            // ancien template resterait "souvenu" avec une config d'une session/review précédente.
            resetConfig: () => set({
                config: { ...DEFAULT_CONFIG },
                configByTemplate: {},
                activePreset: null
            }),

            // Applique une configuration Export Maker arbitraire (ex: template sauvegardé
            // sélectionné depuis Bibliothèque > Templates, ou config déjà persistée d'une review
            // qu'on rouvre en édition) sans passer par un preset local. `templateLocked` fait
            // partie de `config` depuis le 2026-07-30 et est donc déjà correctement sauvegardé/
            // rechargé avec le reste — on respecte cette valeur si présente (une review sauvegardée
            // juste après avoir choisi un template, sans le personnaliser, doit rouvrir verrouillée
            // elle aussi) ; seul un `config` sans cette clé du tout (review sauvegardée AVANT ce
            // chantier, ou config construit à la main) retombe sur `false` — la traiter comme
            // verrouillée par défaut regriserait à tort des contrôles sur d'anciennes reviews dont
            // la config est en réalité déjà personnalisée à la main.
            applyConfig: (config) => set((state) => {
                const merged = { ...DEFAULT_CONFIG, ...config, templateLocked: config?.templateLocked ?? false };
                return {
                    config: merged,
                    // Nouvelle review/config chargée : la mémoire par template repart de zéro (pas de
                    // fuite entre reviews) mais se souvient déjà de CE template avec la config qu'on
                    // vient de charger, pour qu'un aller-retour immédiat vers ce même template dans la
                    // session le retrouve tel quel plutôt que ses défauts génériques.
                    configByTemplate: merged.template ? { [merged.template]: merged } : {},
                    activePreset: null
                };
            }),

            // Obtenir les templates et palettes disponibles
            getTemplates: () => get().templates,
            getColorPalettes: () => COLOR_PALETTES
        }),
        {
            name: STORAGE_KEY,
            // Ne persister que les préréglages et la dernière config
            partialize: (state) => ({
                presets: state.presets,
                config: state.config
            }),
            // Version du storage - doit correspondre à CURRENT_STORAGE_VERSION
            // v8: Dark default background + reset colors - MAR 2026
            version: CURRENT_STORAGE_VERSION,
            // Migration pour les changements de version
            migrate: (persistedState, version) => {
                console.warn('🔄 Export Maker Storage Migration:', { from: version, to: CURRENT_STORAGE_VERSION, hasState: !!persistedState });

                // Si version < 7, reset COMPLET des contentModules et moduleOrder
                if (version < CURRENT_STORAGE_VERSION) {
                    console.warn('📦 v8 Migration: Reset colors + contentModules to new defaults');
                    return {
                        ...persistedState,
                        config: {
                            ...DEFAULT_CONFIG,
                            ...(persistedState?.config || {}),
                            contentModules: { ...DEFAULT_CONFIG.contentModules },
                            moduleOrder: [...DEFAULT_CONFIG.moduleOrder],
                            colors: { ...DEFAULT_CONFIG.colors }
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

                console.log('🔄 Export Maker Storage Merge:', {
                    savedModulesCount,
                    defaultModulesCount,
                    forceDefault: savedModulesCount < 50 // Moins de 50 = vieux format
                });

                // TOUJOURS utiliser les modules par défaut si moins de 70 modules
                // Car l'ancien format avait seulement 13 modules
                const contentModules = resolveContentModules(persistedState.config?.contentModules);

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
export const useExportMakerConfig = () => useExportMakerStore((state) => state.config);
export const useExportMakerPresets = () => useExportMakerStore((state) => state.presets);
export const useExportMakerActions = () => useExportMakerStore((state) => ({
    setTemplate: state.setTemplate,
    unlockTemplateConfig: state.unlockTemplateConfig,
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
    setPreviewFullscreen: state.setPreviewFullscreen,
    setReviewData: state.setReviewData,
    resetConfig: state.resetConfig,
    getTemplates: state.getTemplates,
    getColorPalettes: state.getColorPalettes
}));
