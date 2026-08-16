import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COLOR_PALETTES, DEFAULT_TEMPLATES, TEMPLATE_MODULE_PRESETS, TEMPLATE_DEFAULT_IDENTITY } from './exportMakerConstants';
import { useStore } from './useStore';
import { getAllowedTemplates } from '../hooks/useAccountFeatures';
import { sanitizeModuleOrder } from '../utils/adaptivePagination';

/**
 * Le type de compte vit dans `useStore` (session), pas dans ce store (config de rendu). On le lit
 * hors composant via `getState()` — `useAccountFeatures` est un hook, inutilisable ici.
 * Même normalisation que le hook, source de vérité unique pour la liste : `getAllowedTemplates`.
 */
function isTemplateAllowedForCurrentAccount(templateId) {
    const { accountType, user } = useStore.getState();
    const normalized = String(accountType || '').toLowerCase();
    const isAdmin = Array.isArray(user?.roles) && user.roles.includes('admin');
    const isProducer = isAdmin || ['producteur', 'producer', 'beta_tester'].includes(normalized);
    const isInfluencer = isAdmin || ['influenceur', 'influencer'].includes(normalized);
    return getAllowedTemplates({ isProducer, isInfluencer }).includes(templateId);
}

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
        // 'Inter' est désormais réellement chargée (client/index.html, 2026-08-04) — jusque-là ce
        // défaut se rendait dans une police système. C'est l'équivalent web de la pile du site.
        fontFamily: 'Inter',
        titleSize: 32,
        textSize: 16,
        titleWeight: '700',
        textWeight: '400',
        titleColor: '#ffffff',
        textColor: '#e0e0e0'
    },

    // Couleurs — DÉRIVÉES de COLOR_PALETTES, jamais recopiées.
    //
    // Ce bloc était auparavant une copie manuelle qui s'annonçait `palette: 'modern'` tout en
    // portant des valeurs sans aucun rapport avec `COLOR_PALETTES.modern` (accent or `#ffd700`,
    // dégradé différent) : une seconde source de vérité divergente pour la palette par défaut.
    // Conséquence concrète, vue sur un export réel le 2026-08-04 : réaligner `COLOR_PALETTES.modern`
    // sur la DA du site n'avait AUCUN effet sur le rendu par défaut, qui ne lisait jamais la palette.
    colors: {
        palette: 'modern',
        ...COLOR_PALETTES.modern,
        // `name` est un libellé d'UI, pas un token de rendu.
        name: undefined,
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

        // === CULTURE (métadonnées, hors pipeline — groupe `culture` de fieldRegistry.js) ===
        // Ajoutées 2026-08-03 (Phase B) : `substratMix` était la SEULE clé du groupe `culture`
        // déjà présente ici — les 6 autres (mode/espace/durée/saison/dates de culture) manquaient
        // depuis toujours, donc `isModuleOn()` les traitait comme actives sur CHAQUE page une fois
        // `GisementSections` câblée dans ModernCompactTemplate/BlogArticleTemplate (duplication
        // silencieuse sur toutes les pages au lieu d'une seule, même symptôme déjà documenté
        // ci-dessus pour harvest/separation/extraction).
        cultureMode: true,
        cultureSpaceType: true,
        cultureDuration: true,
        cultureSeason: true,
        cultureStartDate: true,
        cultureEndDate: true,

        // === USAGE (groupe `usage` de fieldRegistry.js — jamais gaté ici avant ce jour) ===
        // Même bug que ci-dessus : ces 8 clés n'existaient nulle part dans `contentModules`, donc
        // toujours "actives" sur chaque page dès qu'un template listait `GisementSections`.
        consumptionMethod: true,
        dosage: true,
        dosageUnit: true,
        effectOnset: true,
        effectProfiles: true,
        sideEffects: true,
        preferredUse: true,
        foodIntakeStatus: true,

        // === RECETTE (groupe `recipe`, Comestible — `recipe` lui-même était déjà gaté, pas ses
        // 2 sous-champs bruts rendus par GisementSections) ===
        ingredients: true,
        etapesPreparation: true,

        // === VUES INTERACTIVES (Fiche Détaillée uniquement) ===
        phenoHuntView: true,
        productionChainView: true,
        pipelineInteractiveView: true,
        // `pipelineDetailGrids` arbitre entre DEUX représentations du même pipeline : la grille de
        // cellules (`PipelineMiniGrid`, celle des formulaires de saisie) et la liste détaillée
        // (`PipelineTimeline`). Les deux s'affichaient simultanément jusqu'à l'audit du
        // 2026-08-02, qui a tranché en faveur de la liste.
        //
        // Arbitrage INVERSÉ le 2026-08-05, sur capture : une culture de 25 jours produisait
        // 25 lignes « TEMPÉRATURE JOUR · 24 °C » empilées sur toute la hauteur de la page,
        // illisibles, laissant la moitié droite vide. La grille dit la même chose en quelques
        // cellules, avec la grammaire visuelle déjà connue de la saisie. La liste reste accessible
        // en basculant ce drapeau sur `false`.
        pipelineDetailGrids: true,

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

    // ORDRE DES BLOCS DE RENDU — vocabulaire des ids `data-module` (MODULE_META,
    // `adaptivePagination.js`), le même que lisent la mesure de pagination et les 5 templates.
    //
    // Ce champ a porté jusqu'au 2026-08-12 une liste de ~100 CLÉS DE CHAMP (`densite`, `tastes`,
    // `thcLevel`…) qu'AUCUN template n'a jamais lue : un réglage entièrement mort, et un second
    // vocabulaire concurrent de celui des blocs réellement rendus. Les configs déjà enregistrées
    // dans ce format sont purgées (`sanitizeModuleOrder`) — cf. le commentaire d'`isKnownModuleId`
    // sur le danger d'un filtrage par recoupement.
    //
    // VIDE = ordre naturel du template, et c'est le défaut : chacun des 5 templates a son propre
    // plan de lecture (cf. MODULE_GROUPS et les commentaires de placement dans les templates), un
    // ordre unique codé ici les écraserait tous. Se remplit quand l'utilisateur réordonne.
    moduleOrder: [],

    // Image et branding
    image: {
        aspectRatio: '1:1',
        borderRadius: 12,
        filter: 'none',
        opacity: 1,
        // CADRAGE — 'cover' (remplit le cadre en recadrant) ou 'contain' (photo entière).
        //
        // Les templates recadraient TOUJOURS, sans aucun réglage ; le réglage a été ajouté le
        // 2026-08-16 parce que les infographies jointes aux reviews (planches de terpènes, « Goûts
        // et effets ») y perdaient leur texte, coupé en haut et en bas.
        //
        // Le défaut est passé de 'contain' à 'cover' le jour même, après essai sur des fiches
        // réelles : 'contain' épargne le texte mais laisse des bandes de fond sur TOUTE photo qui
        // n'a pas le format de son cadre, c'est-à-dire la majorité — le remède était plus visible
        // que le mal. Le plein cadre redevient donc le défaut, et qui joint une infographie bascule
        // sur « Photo entière ».
        fit: 'cover',
        // Marque une config dont les réglages photo sont réellement appliqués au rendu (cf.
        // `resolveImageConfig`) — vrai par construction sur toute config neuve.
        imageFxLive: true,
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
        image: resolveImageConfig(savedConfig?.image),
        // Une review enregistrée avant le 2026-08-12 porte un `moduleOrder` en clés de champ, qui
        // n'a jamais rien piloté. Maintenant que ce champ ORDONNE VRAIMENT les blocs, l'appliquer
        // tel quel réordonnerait des fiches existantes au nom d'un ordre que personne n'a choisi.
        moduleOrder: sanitizeModuleOrder(savedConfig?.moduleOrder),
    };
}

/**
 * Réglages photo d'une config sauvegardée.
 *
 * `filter` et `opacity` existaient dans le panneau depuis toujours mais aucun template ne les
 * lisait : ils étaient donc INERTES, et une valeur enregistrée n'y est pas un choix de rendu — elle
 * n'a jamais rien changé à l'écran, personne n'a pu la valider visuellement (constaté le 2026-08-11
 * sur une review portant `opacity: 0.2` alors que son image s'affichait pleine). Maintenant que les
 * deux réglages agissent réellement, honorer ces valeurs héritées assombrirait ou filtrerait des
 * fiches existantes sans que leur auteur l'ait jamais demandé. On les remet donc à neutre UNE fois,
 * en marquant la config (`imageFxLive`) pour que tout réglage postérieur, lui, soit respecté.
 */
function resolveImageConfig(savedImage) {
    const merged = { ...DEFAULT_CONFIG.image, ...(savedImage || {}) };
    if (merged.imageFxLive) return merged;
    return { ...merged, filter: 'none', opacity: 1, imageFxLive: true };
}

/**
 * Config Export Maker effective d'une review chargée depuis l'API — `exportMakerConfig` y arrive
 * tantôt en objet, tantôt en chaîne JSON (cf. `liftExportMakerFromExtra` côté serveur), et peut
 * être absente ou périmée. Extraite de `SingleReviewCard.jsx` (2026-08-06) pour que TOUTES les
 * surfaces de rendu écran — page publique `/r/:id`, page de lignée, aperçu Studio — résolvent la
 * config de la même façon, plutôt que chacune sa variante.
 */
export function resolveConfigForReview(reviewData, fallbackTemplate = 'detailedCard') {
    const fallback = { template: fallbackTemplate, ratio: DEFAULT_TEMPLATES[fallbackTemplate]?.defaultRatio };
    if (!reviewData?.exportMakerConfig) return resolveExportMakerConfig(fallback);
    try {
        const saved = typeof reviewData.exportMakerConfig === 'string'
            ? JSON.parse(reviewData.exportMakerConfig)
            : reviewData.exportMakerConfig;
        return resolveExportMakerConfig(saved);
    } catch {
        return resolveExportMakerConfig(fallback);
    }
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

            // L'utilisateur a-t-il ARRÊTÉ un choix de rendu pour cette review ?
            //
            // Sert au parcours mobile : tant que rien n'est choisi, montrer un aperçu n'a pas de
            // sens — on afficherait un rendu par défaut que personne n'a demandé. Une fois un
            // template sélectionné, ou une configuration déjà enregistrée rechargée, l'aperçu
            // devient la vue naturelle. Volontairement HORS de `config` : c'est un état de session,
            // et `partialize` ne persiste que `presets` et `config`.
            templateChosen: false,

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
                // Gating par type de compte (2026-08-04). Le grisage dans `TemplateSelector.jsx`
                // est un confort d'interface, pas une garantie : `setTemplate` est aussi appelée
                // depuis le menu contextuel, le chargement d'un préréglage et la restauration
                // d'une config sauvegardée. La garde est ici pour couvrir tous ces chemins.
                // Ce n'est pas une frontière de sécurité (le client reste modifiable) — les droits
                // qui engagent la facturation sont validés côté serveur.
                if (!isTemplateAllowedForCurrentAccount(templateId)) {
                    console.warn(`[ExportMaker] Template "${templateId}" non autorisé pour ce type de compte — changement ignoré.`);
                    return {};
                }
                const outgoingId = state.config.template;
                const configByTemplate = {
                    ...state.configByTemplate,
                    ...(outgoingId ? { [outgoingId]: state.config } : {}),
                };

                const remembered = configByTemplate[templateId];
                if (remembered) {
                    return { config: remembered, configByTemplate, templateChosen: true };
                }

                const templateDef = get().templates[templateId] || DEFAULT_TEMPLATES[templateId];
                // Le ratio par défaut du template doit lui-même être supporté : depuis la matrice
                // C4, chaque template n'accepte plus qu'un sous-ensemble de formats (une carte
                // sociale n'a rien à faire en A4, un COA dense n'a rien à faire dans un carré de
                // 800px). On retombe sur le premier format autorisé si le défaut ne l'est plus.
                const supported = templateDef?.supportedRatios || [];
                const preferred = templateDef?.defaultRatio;
                const newRatio = supported.includes(preferred) ? preferred : (supported[0] || '1:1');

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

                return { config: freshConfig, configByTemplate: { ...configByTemplate, [templateId]: freshConfig }, templateChosen: true };
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
                        // Sémantique OPT-OUT, celle du rendu (`isModuleOn` : affiché tant que la
                        // valeur n'est pas `false`). `!valeur` traitait un champ ABSENT comme
                        // éteint et le passait à `true` — or il s'affichait déjà, donc le premier
                        // clic ne changeait rien et il en fallait deux pour masquer.
                        [moduleName]: state.config.contentModules[moduleName] === false
                    }
                }
            })),

            // Set all content modules at once (for presets)
            setContentModules: (modules) => set((state) => ({
                config: { ...state.config, templateLocked: false, contentModules: { ...state.config.contentModules, ...modules } }
            })),

            // Ordre des BLOCS de rendu (ids `data-module`, cf. `DEFAULT_CONFIG.moduleOrder`).
            // Passer une liste vide rend la main au template : c'est le « Réinitialiser » de l'UI,
            // pas un cas dégradé.
            reorderModules: (newOrder) => set((state) => ({
                config: { ...state.config, templateLocked: false, moduleOrder: sanitizeModuleOrder(newOrder) }
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
                    // Une configuration déjà enregistrée sur la review VAUT choix : le parcours
                    // mobile peut aller droit au rendu au lieu de réclamer une décision déjà prise.
                    templateChosen: true,
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

                // Purge du vocabulaire hérité (clés de champ) — la session locale en porte une copie
                // au même titre que les reviews enregistrées, cf. `resolveExportMakerConfig`.
                const moduleOrder = sanitizeModuleOrder(persistedState.config?.moduleOrder);

                console.warn('   Using contentModules:', Object.keys(contentModules).length, 'modules');
                console.warn('   Using moduleOrder:', moduleOrder.length, 'items');

                return {
                    ...currentState,
                    ...persistedState,
                    config: {
                        ...DEFAULT_CONFIG,
                        ...(persistedState.config || {}),
                        contentModules,
                        moduleOrder,
                        // Même remise à neutre unique que `resolveExportMakerConfig` : la session
                        // locale peut porter, elle aussi, un filtre/une opacité restés inertes.
                        image: resolveImageConfig(persistedState.config?.image),
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
