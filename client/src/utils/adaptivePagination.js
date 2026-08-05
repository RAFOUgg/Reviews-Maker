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

import { RATIO_DIMENSIONS, getFormatLayout } from './exportMakerHelpers';

// Libellés/icônes de page pour chaque id de module mesurable — reprend le vocabulaire déjà utilisé
// par `PAGE_TEMPLATES` là où un équivalent existait, pour rester familier dans l'UI (liste de pages,
// PageManager). 'masthead' démarre TOUJOURS sa propre page (page de couverture dédiée), comme
// l'étaient déjà les entrées `id: 'cover'` de tous les gabarits statiques.
export const MODULE_META = {
    masthead: { label: 'Couverture', icon: '📸' },
    sensoryEvaluation: { label: 'Évaluation sensorielle', icon: '⭐' },
    cannabinoidProfile: { label: 'Profil cannabinoïde', icon: '🧪' }, // encore utilisé par BlogArticle
    cannabinoidGrid: { label: 'Profil cannabinoïde', icon: '🧪' },
    sensoryRadar: { label: 'Empreinte sensorielle', icon: '🕸️' },
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
    // Image principale de ModernCompact — contrairement aux autres templates, où l'image est
    // imbriquée DANS le bloc `masthead` mesuré (DetailedCard/BlogArticle), ici elle est un bloc
    // frère séparé (mise en page landscape/portrait distincte) : id propre, forcée isolée ci-dessous
    // (ALWAYS_ISOLATE) pour ne jamais dépendre d'un calcul de budget précis avec le contenu voisin.
    mainImage: { label: 'Image', icon: '📸' },
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
// Recalibré 0.70 → 0.92 le 2026-08-04, sur mesure et non au jugé.
//
// Deux causes de la sous-estimation qui justifiait 0.70 ont été supprimées depuis :
//   1. Les polices web n'étaient chargées qu'à la première utilisation. La MESURE les attendait
//      (`document.fonts.ready` après montage), mais la CAPTURE, elle, s'exécutait avant leur
//      arrivée — les deux travaillaient donc sur des métriques différentes. Les polices sont
//      désormais préchargées au démarrage (`main.jsx`), mesure et rendu concordent.
//   2. Les pipelines étaient insécables : un module de 1229px sur un canevas de 800px débordait
//      quoi qu'il arrive, et aucune marge n'y pouvait rien. Ils sont maintenant découpés en
//      tronçons paginables.
//
// Relevé de contrôle (Playwright, pages réellement rendues) : sur 5 pages, aucune n'était
// sur-remplie — l'écart mesure/rendu était nul à l'arrondi près. 8% de marge couvre le sous-pixel
// et la variance de rendu, sans transformer chaque page en tiers de page.
const BUDGET_SAFETY_FACTOR = 0.92;

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
// Recalibré le 2026-08-04 sur MESURE réelle, plus sur prudence.
//
// Relevé du remplissage effectif de chaque page rendue (Playwright, review réelle, ratio 1:1) avant
// cette passe : masthead seul = 30% de la page, description seule = 7%, deux petites sections = 38%
// — et AUCUNE page n'était sur-remplie. La marge et l'isolement protégeaient donc contre un risque
// qui ne se matérialisait pas, au prix d'un document deux fois trop long. Un export commercialement
// présentable ne peut pas comporter des pages remplies à 7%.
//
// `masthead` et `mainImage` sortent de l'isolement : ce sont des blocs simples (texte, image), dont
// la hauteur se mesure sans ambiguïté — rien à voir avec les deux widgets composites ci-dessous.
// `cannabinoidProfile` (grille + radar SVG) et `cultureStats` (Recharts) restent isolés : leur
// mesure a réellement échoué par le passé, et leur contenu disparaissait SILENCIEUSEMENT — un mode
// de défaillance bien pire qu'une page peu remplie.
// Vidé le 2026-08-04, sur mesure de l'audit outillé (règle E6).
//
// L'isolement forcé était un contournement : `cannabinoidProfile` et `cultureStats` perdaient
// silencieusement leur contenu en cohabitant, on les a donc mis chacun sur sa page. Le prix mesuré
// est lourd — `cultureStats` seul remplit 31% d'une page, et `cannabinoidProfile`, insécable à
// 1038px sur un canevas de 800px, débordait à 131% MALGRÉ son isolement. Isoler ne réglait donc
// même pas le cas qui l'avait motivé.
//
// Traité à la racine à la place : `cannabinoidProfile` est scindé en `cannabinoidGrid` +
// `sensoryRadar` (DetailedCardTemplate.jsx), deux blocs de taille raisonnable que le packer sait
// répartir. Et les deux causes historiques d'imprécision de mesure ont disparu depuis (polices
// préchargées, mesure et capture concordantes).
//
// Le mécanisme est conservé — vide — parce qu'il reste le bon outil si un widget composite se
// révélait à nouveau non mesurable. Mais il ne doit plus servir à masquer un bloc trop gros :
// dans ce cas, la réponse est de le rendre sécable.
const ALWAYS_ISOLATE = new Set();

// Un tronçon de pipeline porte un id `<module>#<n>` (cf. PipelineTimeline.jsx) : les règles
// d'isolement et de libellé s'appliquent au module de base, pas au numéro de tronçon.
function baseModuleId(id) {
    const hash = id.indexOf('#');
    return hash === -1 ? id : id.slice(0, hash);
}

function resolveMeta(id) {
    return MODULE_META[baseModuleId(id)] || { label: baseModuleId(id), icon: '📄' };
}

export function computeAdaptivePages(moduleHeights, ratio, containerPadding) {
    const dims = RATIO_DIMENSIONS[ratio] || RATIO_DIMENSIONS['1:1'];
    // Le budget est une hauteur CUMULÉE de modules. Sur un format à deux colonnes, une page en
    // absorbe donc environ le double — l'ignorer ferait paginer comme si la page n'en tenait
    // qu'une, produisant deux fois trop de pages toutes à moitié vides.
    const { columns } = getFormatLayout(ratio);
    const budget = Math.max(200, (dims.height - containerPadding * 2) * BUDGET_SAFETY_FACTOR * columns);

    const all = Array.from(moduleHeights.entries())
        .filter(([, h]) => Number.isFinite(h) && h > 4); // hauteur ~0 = module absent (pas de données)

    // En-têtes de pipeline (`<module>#hdr`) : reportés sur chaque page portant un tronçon du même
    // pipeline, ils ne sont donc PAS des modules à placer mais un coût fixe à réserver une fois par
    // page et par pipeline. Les omettre du budget faisait croire au packer qu'il restait de la place
    // qui n'existait pas (mesuré : ~124px non comptés par page de pipeline).
    const headerHeights = new Map();
    const entries = [];
    for (const [id, h] of all) {
        if (id.endsWith('#hdr')) headerHeights.set(id.slice(0, -4), h);
        else entries.push([id, h]);
    }
    if (entries.length === 0) return [];

    // Coût de l'en-tête à réserver si ce module est le premier de son pipeline sur la page visée.
    const headerCostOn = (page, id) => {
        const base = baseModuleId(id);
        if (!headerHeights.has(base)) return 0;
        return page && page.bases.has(base) ? 0 : headerHeights.get(base);
    };

    /** Packing séquentiel « premier qui rentre » sous un budget de hauteur donné. */
    const pack = (cap) => {
        const pages = [];
        let current = null;
        let currentHeight = 0;

        const startPage = (firstId) => {
            if (current) pages.push(current);
            const meta = resolveMeta(firstId);
            current = { id: `adaptive-${pages.length}-${Date.now()}`, label: meta.label, icon: meta.icon, modules: [], adaptive: true, bases: new Set() };
            currentHeight = 0;
        };

        for (const [id, rawHeight] of entries) {
            const height = rawHeight + SECTION_HEADER_OVERHEAD;
            const isolated = ALWAYS_ISOLATE.has(baseModuleId(id));
            // Un module isolé démarre TOUJOURS sa propre page ; les modules suivants ne doivent pas
            // non plus rejoindre SA page (sinon on recrée le même risque de perte pour le voisin
            // suivant) — `current.solo` marque une page occupée par un module isolé comme close.
            const fitsCurrent = current && !current.solo && !isolated
                && (currentHeight + height + headerCostOn(current, id) <= cap);
            if (!fitsCurrent) startPage(id);
            if (isolated) current.solo = true;
            currentHeight += headerCostOn(current, id);
            current.bases.add(baseModuleId(id));
            current.modules.push(id);
            currentHeight += height;
        }
        if (current) pages.push(current);
        return pages;
    };

    let pages = pack(budget);

    // RÉÉQUILIBRAGE. Le « premier qui rentre » remplit chaque page au maximum et laisse à la
    // DERNIÈRE tout ce qui reste — mesuré le 2026-08-05 sur la Fiche Technique 16:9 : page 1 à
    // 76,9 %, page 2 à 30,1 %. Le nombre de pages est pourtant le bon ; c'est la répartition qui
    // est mauvaise.
    //
    // On cherche donc le plus PETIT budget qui produit encore ce même nombre de pages. Réduire le
    // budget force le packer à couper plus tôt, donc à étaler le contenu sur toutes les pages au
    // lieu de saturer les premières. Recherche dichotomique bornée : la borne basse est la moyenne
    // parfaite (total / nombre de pages), qu'aucun packing ne peut battre.
    if (pages.length > 1) {
        const total = entries.reduce((sum, [, h]) => sum + h + SECTION_HEADER_OVERHEAD, 0);
        let lo = Math.max(200, total / pages.length);
        let hi = budget;
        let best = pages;
        for (let i = 0; i < 12 && hi - lo > 8; i += 1) {
            const mid = (lo + hi) / 2;
            const attempt = pack(mid);
            if (attempt.length <= pages.length) { best = attempt; hi = mid; } else { lo = mid; }
        }
        pages = best;
    }

    // `bases` est un accumulateur interne au packing — un Set ne se sérialise pas en JSON (il
    // deviendrait `{}` en traversant le store de pages), on ne le laisse pas fuiter dans la sortie.
    return pages.map(({ bases, ...page }) => page); // eslint-disable-line no-unused-vars
}
