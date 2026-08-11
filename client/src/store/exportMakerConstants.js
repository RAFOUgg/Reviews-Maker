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
            // Sections de DOCUMENT, hors sujet sur un format glanceable — et surtout : ce sont
            // elles qui faisaient qu'une review affichée sous « Story » ressemblait quand même à
            // une fiche technique interminable. La Vue Détaillée conditionne ces trois blocs à ces
            // clés exactes (`ReviewFullDisplay`), qui ne figuraient dans AUCUNE liste `disable` —
            // choisir Story ne les retirait donc jamais. Signalé par l'utilisateur, capture à l'appui.
            'pipelineInteractiveView', 'phenoHuntView', 'productionChainView',
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
/**
 * DEUX FAMILLES DE RENDU, et non cinq options équivalentes.
 *
 * Les cinq templates répondent à deux besoins opposés — un document qu'on classe et qu'on oppose,
 * ou une carte qu'on partage — mais l'interface les présentait à plat, comme des variantes de goût.
 * Un utilisateur qui cherche une fiche à joindre à un lot n'a aucune raison de comparer « Story
 * Réseau Social » à « Rapport de Traçabilité ».
 *
 * La famille vit ICI, à côté de la définition du template, et le sélecteur en dérive : ajouter un
 * template sans le classer devient visible immédiatement, au lieu de créer une table parallèle à
 * maintenir en plus (cf. les tables concurrentes que ce dépôt a déjà payées).
 */
export const TEMPLATE_FAMILIES = {
    certificate: {
        id: 'certificate',
        label: 'Documents',
        hint: 'À imprimer, classer, joindre à un lot — porte le code de lot et l’empreinte.',
    },
    showcase: {
        id: 'showcase',
        label: 'Vitrine',
        hint: 'À partager — réseaux, blog, galerie.',
    },
};

export const DEFAULT_TEMPLATES = {
    modernCompact: {
        id: 'modernCompact',
        family: 'showcase',
        name: 'Moderne Compact',
        description: 'Design épuré et moderne, idéal pour les réseaux sociaux',
        layout: 'compact',
        defaultRatio: '1:1',
        supportedRatios: ['1:1', '16:9', '9:16'],
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
        family: 'certificate',
        name: 'Fiche Technique Détaillée',
        description: 'Présentation complète avec tous les détails de la review',
        layout: 'detailed',
        defaultRatio: '16:9',
        supportedRatios: ['16:9', '4:3', 'A4']
    },
    blogArticle: {
        id: 'blogArticle',
        family: 'showcase',
        name: 'Article de Blog',
        description: 'Format long adapté aux blogs et documentation',
        layout: 'article',
        defaultRatio: 'A4',
        supportedRatios: ['16:9', 'A4']
    },
    socialStory: {
        id: 'socialStory',
        family: 'showcase',
        name: 'Story Social Media',
        description: 'Format vertical pour Instagram et TikTok',
        layout: 'story',
        defaultRatio: '9:16',
        supportedRatios: ['9:16', '1:1']
    },
    traceabilityReport: {
        id: 'traceabilityReport',
        family: 'certificate',
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

// ═══════════════════════════════════════════════════════════════════════════════
// PAGINATION PAR TEMPLATE — matrice C4 (2026-08-04)
// ═══════════════════════════════════════════════════════════════════════════════
// Un template n'est pas un rendu générique paramétrable : c'est un contrat. Moderne Compact et
// Story sont des CARTES — une carte ne se pagine pas, ce qui n'y tient pas en est exclu, jamais
// reporté sur une page 2.
//
// Mesuré avant cette règle (audit outillé, règle E6) : Story produisait 6 pages remplies à
// 49,3 / 4,1 / 4,1 / 4,1 / 32,4 / 16,8 % — trois pages à 4 %. Ce n'était pas un défaut de
// calibrage mais l'absence de ce contrat.
//
// `traceabilityReport` reste à `false` : la matrice C4 le veut paginé, mais il est aujourd'hui
// construit comme un document continu (exempté de `shouldAutoLockPagination`, absent des
// templates adaptatifs). Le basculer est un chantier distinct, pas un drapeau à retourner.
export const TEMPLATE_PAGINATION = {
    modernCompact: false,
    // Traçabilité activé le 2026-08-06 : il était déclaré non paginable, d'où l'onglet Pagination
    // inerte signalé par l'utilisateur. C'est un DOCUMENT — sa pagination n'est pas une option,
    // c'est sa nature.
    //
    // Story reste NON paginé, contre la demande initiale, sur preuve chiffrée : activé puis mesuré
    // le 2026-08-06, il produit 5 pages remplies à 95/3/20/3/12 % — alors qu'il tient à 95 % en UNE
    // page grâce à `FitToFill`, que la pagination désactive. Une story est une carte unique par
    // nature (Instagram, TikTok) : la découper en pages quasi vides dégrade le produit au lieu de
    // l'améliorer. À rouvrir si l'usage prouve le contraire.
    socialStory: false,
    detailedCard: true,
    blogArticle: true,
    traceabilityReport: true,
};

/** Ce template accepte-t-il d'être réparti sur plusieurs pages ? */
export function isTemplatePaginable(templateId) {
    return TEMPLATE_PAGINATION[templateId] === true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRAT DE CONTENU PAR TEMPLATE — matrice C4 (2026-08-04)
// ═══════════════════════════════════════════════════════════════════════════════
// Un template déclare CE QU'IL REND. Ce n'est pas un réglage cosmétique : c'est ce qui rend un
// template viable ou non. Mesuré avant ce contrat, une fois la pagination retirée des cartes
// (Compact/Story ne se paginent pas) : Moderne Compact débordait à 313 % en 1:1 et 142 % en 9:16,
// parce qu'il rendait encore pipelines, canevas et gisement complet dans une carte unique.
//
// Décision utilisateur actée : sur un template non paginable, ce qui ne tient pas est EXCLU,
// jamais reporté sur une page suivante. Le contrat ci-dessous est cette exclusion.
//
// Valeurs : true = rendu complet · false = absent · 'compact'/'summary'/'grid'/'single' = variante.
// Les booléens `contentModules` restent une couche SECONDAIRE : ils permettent à l'utilisateur de
// retirer une section prévue au contrat, jamais d'en ajouter une hors contrat.
export const TEMPLATE_SECTIONS = {
    modernCompact: {
        sensory: 'compact', cannabinoids: 'compact', description: true,
        pipelines: false, canvases: false, gisement: false, lotCode: false,
        // Surcharges PAR FORMAT — un carré de 800×800 n'a pas la hauteur d'une story de 1920.
        // Mesuré avant cette règle : une review Fleur dense débordait de 8 % en 1:1, et sur une
        // carte non paginable ce qui déborde est définitivement perdu. Décision actée : un carré
        // porte l'essentiel glanceable (photo, identité, note, cannabinoïdes, arômes) ; le détail
        // sensoriel et le commentaire sont réservés aux formats qui ont la place.
        byFormat: {
            '1:1': { sensory: false, description: false },
        },
    },
    socialStory: {
        sensory: 'compact', cannabinoids: 'compact',
        pipelines: false, canvases: false, gisement: 'single', lotCode: false,
        // Même raisonnement que Moderne Compact ci-dessus, et même précédent : le carré manque de
        // hauteur. Sonde `FitToFill` du 2026-08-05 sur Fleur dense en 1:1 : `avail=800`,
        // `contenu=913`, `scale=0.900` — exactement la borne basse. La mesure était juste ; c'est
        // le bridage d'échelle qui empêchait de compenser, et sur une carte non paginable les
        // 113px excédentaires sont définitivement perdus.
        //
        // Le bridage ne peut rien y faire : `natural = 913/0,9 = 1014`, il faudrait descendre à
        // 0,79 — soit 9,5px effectifs, franchement illisible. Le contenu est trop haut de 27 %,
        // il faut en RETIRER. (Première tentative mesurée inerte : retirer gisement + labo n'a
        // rien changé, ces blocs ne se rendaient pas sur la review testée.)
        //
        // On retire donc le détail sensoriel — 5 barres de catégorie, le bloc réellement
        // volumineux — exactement comme Moderne Compact en 1:1. Le score global reste affiché
        // dans l'identité. Gisement et labo suivent, comme les moins « glanceable » d'un post
        // carré. Tout cela reste présent en 9:16, qui a la hauteur pour l'accueillir.
        byFormat: {
            '1:1': { sensory: false, gisement: false, labData: false },
        },
    },
    blogArticle: {
        sensory: true, cannabinoids: true,
        pipelines: 'summary', canvases: false, gisement: true, lotCode: false,
    },
    detailedCard: {
        sensory: true, cannabinoids: true,
        pipelines: 'grid', canvases: true, gisement: true, lotCode: true,
    },
    traceabilityReport: {
        // Document de traçabilité, pas de dégustation : pas de sections sensorielles (décision
        // utilisateur, « on se concentre sur le technique »).
        sensory: false, cannabinoids: true,
        pipelines: 'grid', canvases: true, gisement: true, lotCode: true,
    },
};

/**
 * Ce template rend-il cette section ? Retourne la variante ('compact', 'grid'…) ou false.
 * Un template inconnu rend tout — un template non déclaré ne doit pas perdre silencieusement
 * son contenu.
 */
export function templateSection(templateId, section, ratio) {
    const contract = TEMPLATE_SECTIONS[templateId];
    if (!contract) return true;
    // La surcharge de format prime : c'est elle qui exprime « ce format n'a pas la place ».
    const override = ratio && contract.byFormat && contract.byFormat[ratio];
    if (override && section in override) return override[section];
    return contract[section] ?? false;
}
