/**
 * Pagination adaptative (Chantier D, 2026-07-31) — packing séquentiel simple des blocs mesurés
 * de `DetailedCardTemplate.jsx` (voir `measureDetailedCardModules.jsx`) en pages, selon le budget
 * de hauteur réel du ratio ciblé. Remplace le lookup statique `PAGE_TEMPLATES`
 * (`exportMakerPagesStore.js`) pour ce template pilote uniquement (`detailedCard`) — les 4 autres
 * templates gardent leurs gabarits statiques par ratio, cohérent avec le reste de la refonte DA
 * "COA v2" qui a délibérément commencé par un seul template pilote avant tout rollout.
 *
 * Volontairement simple (pas d'algorithme d'optimisation/bin-packing complexe) pour rester
 * prévisible et débogable, comme le reste d'Export Maker : un module qui, à lui seul, dépasse le
 * budget d'une page occupe sa propre page en débordant (limite connue et déjà acceptée pour les
 * très longs pipelines, documentée dans CLAUDE.md — pas une régression de ce chantier).
 */

import { RATIO_DIMENSIONS } from './exportMakerHelpers';

// Libellés/icônes de page pour chaque id de module mesurable — reprend le vocabulaire déjà utilisé
// par `PAGE_TEMPLATES` là où un équivalent existait, pour rester familier dans l'UI (liste de pages,
// PageManager). 'masthead' démarre TOUJOURS sa propre page (page de couverture dédiée), comme
// l'étaient déjà les entrées `id: 'cover'` de tous les gabarits statiques.
export const MODULE_META = {
    masthead: { label: 'Couverture', icon: '📸' },
    sensoryEvaluation: { label: 'Évaluation sensorielle', icon: '⭐' },
    cannabinoidProfile: { label: 'Profil cannabinoïde', icon: '🧪' },
    aromaticProfile: { label: 'Profil aromatique', icon: '🌸' },
    labData: { label: 'Données laboratoire & curing', icon: '🔬' },
    description: { label: 'Commentaire', icon: '💬' },
    cultureStats: { label: 'Statistiques de culture', icon: '📈' },
    genealogyCanvas: { label: 'Généalogie', icon: '🧬' },
    productionChainCanvas: { label: 'Chaîne de production', icon: '⚙️' },
    pipelineDetailGrids: { label: 'Pipelines — détail', icon: '🗓️' },
    extraData: { label: 'Données complémentaires', icon: '➕' },
    // Ids propres au rollout Phase C (2026-08-03) sur ModernCompact/BlogArticle/SocialStory —
    // pas de composant Section commun entre les 3 templates statiques, donc chacun a introduit
    // localement l'id qui correspond le mieux à sa propre structure plutôt que de forcer un
    // vocabulaire partagé qui n'aurait pas matché leur mise en page réelle.
    identity: { label: 'Identité', icon: '🪪' },
    provenance: { label: 'Provenance', icon: '📍' },
    substrat: { label: 'Substrat', icon: '🪴' },
    // Distinct de `cannabinoidProfile` (grille dense 8 cannabinoïdes, forcée isolée ci-dessous) :
    // paire de mini-cartes THC/CBD sur SocialStory, volontairement PAS isolée pour rester compacte.
    thcCbdMini: { label: 'THC/CBD', icon: '🧪' },
    // Photo hero SEULE (SocialStory) — distinct de `masthead` (bloc combiné photo+titre+note des
    // autres templates), volontairement PAS isolée pour pouvoir se combiner avec `identity`.
    heroImage: { label: 'Photo', icon: '📸' },
    'gisement:harvest': { label: 'Récolte', icon: '🌾' },
    'gisement:culture': { label: 'Culture', icon: '🌱' },
    'gisement:usage': { label: 'Usage', icon: '💨' },
    'gisement:separation': { label: 'Séparation', icon: '🧊' },
    'gisement:extraction': { label: 'Extraction', icon: '⚗️' },
    'gisement:purification': { label: 'Purification', icon: '💧' },
    'gisement:recipe': { label: 'Recette', icon: '🍯' },
    'gisement:overflow': { label: 'Données supplémentaires', icon: '➕' },
    'pipeline:pipelineGlobal': { label: 'Culture — étapes', icon: '🌱' },
    'pipeline:cultureTimeline': { label: 'Culture — étapes', icon: '🌱' },
    'pipeline:pipelineCuring': { label: 'Curing — étapes', icon: '🔥' },
    'pipeline:curingTimeline': { label: 'Curing — étapes', icon: '🔥' },
    'pipeline:pipelineExtraction': { label: 'Extraction — étapes', icon: '⚗️' },
    'pipeline:extractionTimelineData': { label: 'Extraction — étapes', icon: '⚗️' },
    'pipeline:pipelineSeparation': { label: 'Séparation — étapes', icon: '🔬' },
    'pipeline:separationTimelineData': { label: 'Séparation — étapes', icon: '🔬' },
    'pipeline:pipelinePurification': { label: 'Purification — étapes', icon: '✨' },
    'pipeline:fertilizationPipeline': { label: 'Fertilisation', icon: '🌱' },
};

// Petites majorations forfaitaires : un module déplacé sur sa propre page porte son propre en-tête
// de `Section` (filet + titre), pas mesuré individuellement car partagé visuellement quand plusieurs
// modules cohabitent sur la même page au moment de la mesure — ordre de grandeur, pas une mesure
// exacte, volontairement (cf. "packing séquentiel simple" ci-dessus).
const SECTION_HEADER_OVERHEAD = 40;

/**
 * @param {Map<string, number>} moduleHeights - id → hauteur mesurée en px (voir measureDetailedCardModules.jsx)
 * @param {string} ratio - clé de RATIO_DIMENSIONS
 * @param {number} containerPadding - `padding.container` (getResponsiveAdjustments) pour ce ratio/typo
 * @returns {Array<{id:string,label:string,icon:string,modules:string[],adaptive:true}>}
 */
// Marge de sécurité (Chantier D, correctif 2026-07-31) : la mesure (hors-écran, `pageModuleIds:
// null`, tous les modules stackés) et le rendu final d'une page isolée ne sont jamais rigoureusement
// identiques au pixel près (arrondis sous-pixel, léger delta de chargement de police malgré
// `document.fonts.ready`, etc.) — un budget calé à 100% du canevas laisse un vrai risque de
// débordement silencieux, le pire des modes de défaillance déjà documentés sur ce template
// (contenu qui disparaît sans signal). 85% laisse une marge généreuse plutôt que de courir après
// une précision pixel-perfect illusoire.
// Durci à 0.70 le 2026-07-31 (2e tour de vérification) : 0.85 restait insuffisant pour des sections
// riches (ex. grille cannabinoïdes + radar empilés verticalement en 1:1) — plusieurs sections se
// combinaient encore sur une même page avec le contenu excédentaire purement PERDU (pas relogé sur
// une page suivante), pas juste débordant proprement. Conforme à la préférence déjà actée par
// l'utilisateur sur ce même template (correctif post-déploiement, pipelines) : préférer une fiche
// plus longue (plus de pages) à la moindre perte de contenu.
const BUDGET_SAFETY_FACTOR = 0.70;

// Isolement forcé (2026-07-31, 3e tour de vérification) : même à 70% de marge, `cannabinoidProfile`
// (grille + radar SVG, empilés verticalement en formats étroits/carrés) et `cultureStats` (graphique
// Recharts) continuaient occasionnellement à se combiner avec une section voisine puis à perdre
// silencieusement leur contenu — pas juste déborder proprement, disparaître (le pire des deux modes
// de défaillance). Plutôt que de continuer à ajuster une marge numérique à l'aveugle (2 tours déjà
// insuffisants), ces widgets composites démarrent maintenant TOUJOURS leur propre page, comme
// `masthead` — élimine la question de précision de mesure pour ce type de contenu par construction.
// Seul risque résiduel : un de CES modules, à lui seul, peut encore déborder sa propre page dédiée —
// c'est la limite déjà documentée et acceptée (un bloc plus grand qu'une page occupe sa page en
// débordant), pas la perte silencieuse de contenu partagé avec des voisins qu'on corrige ici.
const ALWAYS_ISOLATE = new Set(['masthead', 'cannabinoidProfile', 'cultureStats']);

export function computeAdaptivePages(moduleHeights, ratio, containerPadding) {
    const dims = RATIO_DIMENSIONS[ratio] || RATIO_DIMENSIONS['1:1'];
    const budget = Math.max(200, (dims.height - containerPadding * 2) * BUDGET_SAFETY_FACTOR);

    const entries = Array.from(moduleHeights.entries())
        .filter(([, h]) => Number.isFinite(h) && h > 4); // hauteur ~0 = module absent (pas de données)
    if (entries.length === 0) return [];

    const pages = [];
    let current = null;
    let currentHeight = 0;

    const startPage = (firstId) => {
        if (current) pages.push(current);
        const meta = MODULE_META[firstId] || { label: firstId, icon: '📄' };
        current = { id: `adaptive-${pages.length}-${Date.now()}`, label: meta.label, icon: meta.icon, modules: [], adaptive: true };
        currentHeight = 0;
    };

    for (const [id, rawHeight] of entries) {
        const height = rawHeight + SECTION_HEADER_OVERHEAD;
        const isolated = ALWAYS_ISOLATE.has(id);
        // Un module isolé démarre TOUJOURS sa propre page ; les modules suivants ne doivent pas non
        // plus rejoindre SA page (sinon on recrée le même risque de perte pour le voisin suivant) —
        // `current.solo` marque une page occupée par un module isolé comme définitivement close.
        const fitsCurrent = current && !current.solo && !isolated && (currentHeight + height <= budget);
        if (!fitsCurrent) startPage(id);
        if (isolated) current.solo = true;
        current.modules.push(id);
        currentHeight += height;
    }
    if (current) pages.push(current);

    return pages;
}
