// Constantes pour Export Maker
// Séparées du store pour éviter les problèmes de références circulaires

// Palettes de couleurs harmonieuses prédéfinies
export const COLOR_PALETTES = {
    // Palette "Terpologie" — RÉALIGNÉE le 2026-08-04 sur la direction artistique réelle du site
    // (LiquidUI). Les valeurs ne sont pas approchées à l'œil : elles sont reprises telles quelles
    // des 2 feuilles canoniques de l'app.
    //   background   → recette de `--app-bg` (theme-tokens.css) posée sur `--app-bg-solid` #0b1220
    //   textPrimary  → `--text-primary` (theme-tokens.css)
    //   textSecondary→ `dark.muted` (tailwind.config.js)
    //   accent       → violet-400, nuance TEXTE du système (cf. ACCENT_TEXT_COLORS) — l'accent
    //                  signature `--liquid-primary` #8B5CF6 est réservé aux surfaces/glows, il
    //                  échoue AA en texte sur ce fond (4.42:1).
    modern: {
        name: 'Terpologie',
        background: 'radial-gradient(700px 420px at 50% 28%, rgba(255,255,255,0.02), rgba(0,0,0,0.5) 38%, rgba(0,0,0,0.95) 100%), #0b1220',
        textPrimary: '#E6EEF8',
        textSecondary: '#CBD5E1',
        accent: '#A78BFA',
        title: '#FFFFFF'
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
    },
    // Palette "Résine" (2026-07-30) — direction artistique v2 de la Fiche Technique Détaillée
    // (specs-direction-artistique.md), pensée "certificat de laboratoire" plutôt que glassmorphism
    // SaaS générique : charcoal-vert + ambre résine comme accent unique. Devient le défaut de ce
    // template (`TEMPLATE_DEFAULT_IDENTITY.detailedCard` ci-dessous) mais reste une palette normale,
    // sélectionnable/modifiable comme les autres. Les bandes sémantiques de score (vert conforme/
    // ambre moyen/terracotta bas) sont un système FIXE distinct — voir `SEMANTIC_SCORE_COLORS`
    // dans `exportMakerHelpers.js`, jamais dérivé de cette palette.
    resin: {
        name: 'Résine',
        background: 'radial-gradient(900px 500px at 20% -10%, rgba(62,124,90,.10), transparent 60%), radial-gradient(700px 500px at 100% 0%, rgba(201,146,46,.08), transparent 55%), #0E1512',
        textPrimary: '#EDEAE0',
        textSecondary: '#A9B2AA',
        accent: '#C9922E',
        title: '#EDEAE0'
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE PRESETS PAR TEMPLATE — modules auto-activés/désactivés à la sélection
// ═══════════════════════════════════════════════════════════════════════════════
// Vocabulaire aligné sur les clés canoniques de `client/src/utils/fieldRegistry.js` — ces
// presets utilisaient auparavant un vocabulaire pointé (`visual.colorRating`, `odeurs.intensity`,
// `effets.onset`…) qui ne correspondait à AUCUNE clé réelle de `contentModules` : appliquer un
// préréglage créait des clés mortes sans jamais activer/désactiver les groupes visés. Les clés
// ci-dessous sont celles réellement lues par `RegistrySections.jsx`/`DetailedCardTemplate.jsx`.
export const TEMPLATE_MODULE_PRESETS = {
    modernCompact: {
        // Essentiel seulement — aperçu compact. Les 4 clés de pipeline (fertilizationPipeline/
        // pipelineSeparation/pipelinePurification/pipelineExtraction) sont dans `enable`, pas
        // `disable` — ce preset datait d'avant que `ModernCompactTemplate.jsx` gagne son propre
        // rendu riche de pipeline ("Pipelines — riche avec métriques", 2026-07-27/28, avec
        // `summarizeCellFields`/`PipelineStepFields`, au même niveau de détail que BlogArticle/
        // DetailedCard) et n'avait jamais été mis à jour en conséquence. Conséquence trouvée le
        // 2026-08-02 : sélectionner Moderne Compact désactivait `fertilizationPipeline` dans
        // `contentModules` de façon GLOBALE (pas juste par page) — sans pagination, le pipeline
        // Culture ne s'affichait donc jamais dans ce template ; avec pagination (le cas courant),
        // la page dédiée "Culture" du gabarit `PAGE_TEMPLATES` (qui ne contient QUE des clés de
        // pipeline/récolte, aucune autre section n'y étant jamais lue par ce template — voir
        // `substrat`/`extraData`, calculés mais jamais rendus ici) se retrouvait 100% vide, alors
        // que la même review/page fonctionnait sur BlogArticleTemplate/DetailedCardTemplate (dont
        // les presets, eux, gardent ces clés actives).
        enable: [
            'title', 'mainImage', 'images', 'cultivar', 'cultivarsList',
            'farm', 'hashmaker', 'type',
            'thcLevel', 'cbdLevel',
            'couleurScore', 'densiteVisuelle', 'trichomesScore', 'moisissureScore', 'grainesScore',
            'intensiteAromeScore', 'aromas',
            'dureteScore', 'densiteTactileScore', 'elasticiteScore', 'collantScore',
            'intensiteGoutScore', 'agressiviteScore',
            'monteeScore', 'intensiteEffetScore', 'effects',
            'curing',
            'fertilizationPipeline', 'pipelineSeparation', 'pipelinePurification', 'pipelineExtraction',
        ],
        disable: [
            'breeder', 'strainType', 'genetics',
            'cultureTimelineData', 'cultureTimelineConfig',
            'substratMix', 'processing',
            'recipe', 'ingredients',
            'complexiteAromeScore', 'fideliteAromeScore', 'secondaryAromas',
            'dryPuffNotes', 'inhalationNotes', 'exhalationNotes',
            'dureeEffet',
            'terpenes',
        ],
    },
    detailedCard: {
        // Tout activé — fiche technique complète
        enable: [
            'title', 'mainImage', 'images', 'cultivar', 'cultivarsList',
            'farm', 'hashmaker', 'type', 'breeder', 'strainType', 'genetics',
            'thcLevel', 'cbdLevel', 'terpenes',
            'couleurScore', 'densiteVisuelle', 'trichomesScore', 'moisissureScore', 'grainesScore',
            'couleurTransparence', 'pureteVisuelle',
            'intensiteAromeScore', 'complexiteAromeScore', 'fideliteAromeScore', 'aromas', 'secondaryAromas',
            'dureteScore', 'densiteTactileScore', 'elasticiteScore', 'collantScore',
            'malleabiliteScore', 'friabiliteScore', 'meltingScore', 'residuScore', 'viscositeScore',
            'intensiteGoutScore', 'agressiviteScore', 'dryPuffNotes', 'inhalationNotes', 'exhalationNotes',
            'monteeScore', 'intensiteEffetScore', 'effects', 'dureeEffet',
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
            'title', 'mainImage', 'images', 'cultivar', 'cultivarsList',
            'farm', 'hashmaker', 'type', 'breeder', 'strainType', 'genetics',
            'thcLevel', 'cbdLevel', 'terpenes',
            'couleurScore', 'densiteVisuelle', 'trichomesScore', 'moisissureScore', 'grainesScore',
            'intensiteAromeScore', 'complexiteAromeScore', 'fideliteAromeScore', 'aromas', 'secondaryAromas',
            'dureteScore', 'densiteTactileScore', 'elasticiteScore', 'collantScore',
            'intensiteGoutScore', 'agressiviteScore', 'dryPuffNotes', 'inhalationNotes', 'exhalationNotes',
            'monteeScore', 'intensiteEffetScore', 'effects', 'dureeEffet',
            'curing',
            'pipelineSeparation', 'pipelinePurification', 'pipelineExtraction',
            'cultureTimelineData', 'cultureTimelineConfig',
        ],
        disable: [],
    },
    socialStory: {
        // Visuels + impactant — format story
        enable: [
            'title', 'mainImage', 'images', 'cultivar', 'farm', 'hashmaker', 'type',
            'thcLevel', 'cbdLevel',
            'couleurScore', 'densiteVisuelle', 'trichomesScore',
            'intensiteAromeScore', 'aromas',
            'intensiteGoutScore',
            'monteeScore', 'intensiteEffetScore', 'effects',
            'curing',
        ],
        disable: [
            'breeder', 'strainType', 'genetics',
            'cultureTimelineData', 'cultureTimelineConfig',
            'pipelineSeparation', 'pipelinePurification', 'pipelineExtraction',
            'fertilizationPipeline', 'substratMix', 'processing',
            'recipe', 'ingredients',
            'complexiteAromeScore', 'fideliteAromeScore', 'secondaryAromas',
            'dureteScore', 'densiteTactileScore', 'elasticiteScore', 'collantScore',
            'malleabiliteScore', 'friabiliteScore', 'meltingScore', 'residuScore',
            'agressiviteScore', 'dryPuffNotes', 'inhalationNotes', 'exhalationNotes',
            'dureeEffet',
            'terpenes',
        ],
    },
    // Absent avant le 2026-07-30 (asymétrie trouvée en audit) : sélectionner ce template ne
    // touchait donc jamais `contentModules`. `TraceabilityReportTemplate.jsx` ne rend déjà que les
    // sections avec des données réelles (cf. son propre commentaire de tête), donc "tout activé"
    // est sans risque — même liste large que `detailedCard`.
    traceabilityReport: {
        enable: [
            'title', 'mainImage', 'images', 'cultivar', 'cultivarsList',
            'farm', 'hashmaker', 'type', 'breeder', 'strainType', 'genetics',
            'thcLevel', 'cbdLevel', 'terpenes',
            'couleurScore', 'densiteVisuelle', 'trichomesScore', 'moisissureScore', 'grainesScore',
            'couleurTransparence', 'pureteVisuelle',
            'intensiteAromeScore', 'complexiteAromeScore', 'fideliteAromeScore', 'aromas', 'secondaryAromas',
            'dureteScore', 'densiteTactileScore', 'elasticiteScore', 'collantScore',
            'malleabiliteScore', 'friabiliteScore', 'meltingScore', 'residuScore', 'viscositeScore',
            'intensiteGoutScore', 'agressiviteScore', 'dryPuffNotes', 'inhalationNotes', 'exhalationNotes',
            'monteeScore', 'intensiteEffetScore', 'effects', 'dureeEffet',
            'curing',
            'pipelineSeparation', 'pipelinePurification', 'pipelineExtraction',
            'fertilizationPipeline', 'substratMix', 'processing',
            'cultureTimelineData', 'cultureTimelineConfig',
            'recipe', 'ingredients',
        ],
        disable: [],
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
    },
    traceabilityReport: {
        id: 'traceabilityReport',
        name: 'Rapport de Traçabilité',
        description: 'Lot, confiance producteur/labo, bilan matière, chaîne de production et journal d\'événements',
        layout: 'traceabilityReport',
        defaultRatio: 'A4',
        supportedRatios: ['A4']
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// IDENTITÉ VISUELLE PAR DÉFAUT — verrouillage de config par template (2026-07-30)
// ═══════════════════════════════════════════════════════════════════════════════
// Avant ce chantier, choisir un template ne touchait QUE `contentModules` (via
// TEMPLATE_MODULE_PRESETS ci-dessus) — police/couleurs restaient inchangées, donc changer de
// template ne changeait pas vraiment l'apparence si l'utilisateur avait déjà personnalisé l'un ou
// l'autre. `defaultPalette` référence une entrée de `COLOR_PALETTES` (jamais dupliquée en dur) ;
// `defaultTypography` ne liste que ce qui diffère des valeurs de base (`DEFAULT_CONFIG.typography`
// dans exportMakerStore.js), fusionné par-dessus au moment de l'application.
export const TEMPLATE_DEFAULT_IDENTITY = {
    // 2026-08-04 — identités par défaut UNIFIÉES sur la direction artistique du site (LiquidUI).
    //
    // Deux problèmes corrigés d'un coup :
    //   1. Les 5 templates avaient chacun une palette par défaut différente (modern/resin/elegant/
    //      sunset/ocean) — changer de template changeait l'identité de marque du rendu. Les
    //      templates doivent se différencier par leur MISE EN PAGE, pas par leur palette.
    //   2. 4 de ces 5 entrées pointaient vers une police jamais chargée (Inter/Merriweather/
    //      Poppins) : l'identité PAR DÉFAUT de 4 templates sur 5 se rendait dans un repli système.
    //
    // 'Inter' est désormais réellement chargée (client/index.html) : c'est l'équivalent web fidèle
    // de la pile système du site (`-apple-system`/`SF Pro Display`, tailwind.config.js > fontFamily).
    // Les palettes `resin`/`elegant`/`sunset`/`ocean` restent sélectionnables, simplement plus par
    // défaut.
    modernCompact: { defaultPalette: 'modern', defaultTypography: { fontFamily: 'Inter', titleWeight: '700' } },
    detailedCard: { defaultPalette: 'modern', defaultTypography: { fontFamily: 'Inter', titleWeight: '700' } },
    blogArticle: { defaultPalette: 'modern', defaultTypography: { fontFamily: 'Inter', titleWeight: '700' } },
    socialStory: { defaultPalette: 'modern', defaultTypography: { fontFamily: 'Inter', titleWeight: '800' } },
    traceabilityReport: { defaultPalette: 'modern', defaultTypography: { fontFamily: 'Inter', titleWeight: '700' } },
};
