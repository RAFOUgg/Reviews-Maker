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

import { RATIO_DIMENSIONS, getTemplateColumns } from './exportMakerHelpers';

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
    documents: { label: 'Documents & certificats', icon: '📎' },
    description: { label: 'Commentaire', icon: '💬' },
    cultureStats: { label: 'Statistiques de culture', icon: '📈' },
    genealogyCanvas: { label: 'Généalogie', icon: '🧬' },
    productionChainCanvas: { label: 'Chaîne de production', icon: '⚙️' },
    pipelineDetailGrids: { label: 'Pipelines — détail', icon: '🗓️' },
    extraData: { label: 'Données complémentaires', icon: '➕' },
    // Rapport de Traçabilité (paginé depuis le 2026-08-06)
    massBalance: { label: 'Bilan matière', icon: '⚖️' },
    eventLog: { label: "Journal d'événements", icon: '📜' },
    pipelines: { label: 'Processus de production', icon: '📅' },
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

// Coût d'un module EN PLUS de sa hauteur propre : l'espace qui le sépare du bloc suivant dans la
// même colonne.
//
// C'était 40px, posé comme « ordre de grandeur » au motif qu'un module déplacé sur sa propre page
// porterait un en-tête de `Section` non mesuré. Vérifié le 2026-08-11 en confrontant, sur la même
// review et le même template, les hauteurs prédites aux hauteurs RENDUES : elles coïncident au
// pixel près (sensoryEvaluation 296/296, sensoryRadar 321/321, cannabinoidGrid 266/266,
// cultureStats 301/301) — l'en-tête est donc DÉJÀ compris dans la hauteur mesurée, et la majoration
// ne compensait rien. Les écarts verticaux réellement observés entre blocs consécutifs d'une même
// colonne valent 0, 6, 16 ou 20px selon le format. À 40px et une quinzaine de modules, c'était
// ~460px de hauteur fantôme facturés à chaque page — soit une page entière de gâchis tous les deux
// écrans, et une part directe des remplissages à 52-62 %.
//
// Valeur retenue : la médiane haute des écarts mesurés, pas une marge de confort.
const SECTION_HEADER_OVERHEAD = 16;

// Modules rendus PLEINE LARGEUR, hors du flux en colonnes.
//
// Le budget d'une page est une hauteur CUMULÉE de modules : sur deux colonnes, une page en absorbe
// le double (cf. `budget` ci-dessous). Ce raisonnement ne vaut que pour les blocs qui coulent
// RÉELLEMENT dans les colonnes. Le masthead de `DetailedCardTemplate.jsx` est rendu au-dessus du
// conteneur `columnCount` (`sectionFlow`), en pleine largeur : ses 1948px consomment 1948px de
// hauteur de page dans LES DEUX colonnes à la fois, soit 3896px de budget cumulé — pas 1948.
//
// Mesuré le 2026-08-06 sur Fleur/dense en A4 : le packer, comptant le masthead pour sa seule
// hauteur, le jugeait à 45 % d'un budget de 4386 et lui adjoignait « Évaluation sensorielle »
// (672px). Rendu réel : 1948 + 672 empilés = 2684px sur une page de 2480 → 108,2 % de remplissage,
// donc du contenu COUPÉ. C'est la régression du passage de l'A4 à deux colonnes (`2f9ce905`) :
// jusque-là toutes les pages étaient à une colonne, le facteur valait 1 partout et l'écart ne
// pouvait pas apparaître.
//
// Sans effet sur les templates à une colonne (`getTemplateColumns` renvoie 1 hors `detailedCard`) :
// le facteur y vaut 1, le coût est inchangé.
const FULL_WIDTH_MODULES = new Set(['masthead']);

// BLOCS ÉLASTIQUES — ceux qui peuvent GRANDIR sans se dégrader.
//
// Une photo, un canevas ou un graphique occupent la place qu'on leur donne : les agrandir les rend
// plus lisibles. Un paragraphe ou un tableau, non — les étirer ne fait qu'ajouter du vide entre les
// lignes. C'est cette distinction qui permet de résorber l'espace vide d'une page sans toucher à la
// typographie : le reliquat de hauteur va aux blocs qui savent l'absorber, les autres gardent leur
// taille naturelle.
//
// Approche retenue APRÈS l'échec mesuré d'une mise à l'échelle globale (`FitToFill` sur les
// templates paginés, 2026-08-11) : agrandir TOUT le contenu d'un facteur commun recompose le texte,
// donc change sa hauteur, donc invalide le calcul qui vient de fixer ce facteur — la boucle ne
// converge pas et des pages ont été rendues à 189 %. Ici rien ne se recompose : on ne change que la
// hauteur de blocs dont le contenu est mis à l'échelle par nature.
const ELASTIC_MODULES = new Set([
    'mainImage', 'heroImage', 'masthead',
    'genealogyCanvas', 'productionChainCanvas',
    'cultureStats', 'sensoryRadar',
]);

// Un bloc élastique ne peut pas doubler : une photo qui prend toute la page au motif qu'il restait
// de la place déséquilibre la fiche autant que le vide qu'on cherche à combler.
//
// Sauf que « déséquilibré » ne veut pas dire la même chose selon le bloc. Une PHOTO agrandie de
// moitié devient une affiche, et c'est bien ce que ce plafond protège. Un CANEVAS (généalogie,
// chaîne de production), un GRAPHIQUE ou un RADAR, eux, ne font que gagner en lisibilité : ce sont
// des dessins vectoriels dont l'échelle est l'unité de lecture, pas une composition à respecter.
// Les brider au même taux, c'était laisser du vide sur une page qui ne demandait qu'à être remplie
// par le seul type de bloc qui pouvait le faire sans dommage (mesuré : Fiche 4:3 page 3 à 52,2 %,
// dont les deux seuls blocs élastiques sont les deux canevas).
//
// Le vrai garde-fou anti-débordement n'est de toute façon PAS ce plafond mais la place restante
// DANS LA COLONNE du bloc (cf. `reliquat` plus bas) — c'est cette borne-là qui a réglé les
// débordements du 2026-08-12, pas celle-ci.
const MAX_STRETCH_RATIO = 0.75;
const MAX_STRETCH_BY_MODULE = {
    genealogyCanvas: 1.6,
    productionChainCanvas: 1.6,
    cultureStats: 1.6,
    sensoryRadar: 1.6,
};
const maxStretchFor = (id) => MAX_STRETCH_BY_MODULE[baseModuleId(id)] ?? MAX_STRETCH_RATIO;

// PLAFOND ABSOLU d'un bloc étiré, en part du budget de colonne.
//
// La résorption se veut « purement arithmétique » : on demande `min-height: X`, on obtient X. C'est
// vrai — jusqu'à un seuil. Mesuré le 2026-08-12 sur `hash/dense` (Fiche Technique 16:9, flux à deux
// colonnes), en faisant varier le `min-height` d'un canevas de 297px de haut :
//
//     min-height demandé :   0    200    400    587    700
//     hauteur rendue     : 297    297    400   =803=   860
//
// À 587 le bloc rend 803px, soit 216 de plus que demandé : passé un certain rapport à la hauteur de
// colonne, la fragmentation multi-colonnes cesse de suivre la consigne. C'est ce décrochage qui
// produisait le seul CONTENU COUPÉ restant des 132 combinaisons (page à 101,4 %).
//
// On reste donc dans le régime linéaire, vérifié à 400/949 ≈ 0,42. Ce plafond ne s'applique qu'aux
// pages à plusieurs colonnes : à une seule colonne, la mesure suit la consigne sans décrochage
// (c'est ce même constat qui a motivé la bascule des pages légères en une colonne).
const MAX_ELASTIC_SHARE_MULTICOL = 0.45;

// Part du reliquat réellement redistribuée (cf. le calcul plus bas pour la justification chiffrée).
const RELIQUAT_DISTRIBUE = 0.7;

// GROUPES DE LECTURE — plan de page validé le 2026-08-07.
//
// Ce n'est PAS un gabarit de pages. Un gabarit fixe quelles pages existent et ce qu'elles
// contiennent ; il a déjà été essayé deux fois ici et a produit des modules qui disparaissaient
// (`PAGE_TEMPLATES`, cf. C12 §1). Un groupe dit seulement OÙ IL EST PRÉFÉRABLE DE COUPER : le
// nombre de pages reste décidé par la mesure. Une frontière de groupe est un endroit naturel pour
// changer de page ; une coupure à l'intérieur d'un groupe sépare des blocs qui se lisent ensemble.
//
// Le groupe d'un module se déduit de son id de base, jamais dupliqué dans un template.
const MODULE_GROUPS = {
    // Identité — qui est ce produit, comment il se présente, comment il note.
    masthead: 'identity',
    identity: 'identity',
    heroImage: 'identity',
    mainImage: 'identity',
    sensoryEvaluation: 'identity',
    sensoryRadar: 'identity',
    // Chimie — ce que le produit contient, mesuré.
    cannabinoidGrid: 'chemistry',
    cannabinoidProfile: 'chemistry',
    thcCbdMini: 'chemistry',
    aromaticProfile: 'chemistry',
    labData: 'chemistry',
    // Le certificat se lit avec les données qu'il atteste, jamais en annexe.
    documents: 'chemistry',
    // Production — d'où il vient et comment il a été fait.
    description: 'production',
    cultureStats: 'production',
    pipelines: 'production',
    pipelineDetailGrids: 'production',
    genealogyCanvas: 'production',
    productionChainCanvas: 'production',
    massBalance: 'production',
    eventLog: 'production',
    provenance: 'production',
    substrat: 'production',
    // Annexe — tout ce qui complète sans porter la lecture.
    extraData: 'appendix',
};

// Un module inconnu du plan (gisement générique, tronçon de pipeline, champ d'un futur formulaire)
// prend le groupe du module qui le précède plutôt qu'un groupe à part : sans ça, tout nouveau
// contenu déclencherait une coupure de page à lui seul. C'est le sens de `null` ici.
function groupOf(id, previousGroup) {
    const base = baseModuleId(id);
    if (base.startsWith('pipeline:')) return 'production';
    if (base.startsWith('gisement:')) return 'appendix';
    return MODULE_GROUPS[base] || previousGroup || null;
}

// Une frontière de groupe ne justifie une page neuve que si la page courante est DÉJÀ bien
// remplie. Sinon on troquerait un défaut de structure contre un défaut de remplissage — or les
// pages trop vides sont précisément le défaut dominant du relevé actuel. En dessous de ce seuil,
// deux groupes cohabitent : mieux vaut une page dense et mixte qu'une page pure à 30 %.
const GROUP_BREAK_MIN_FILL = 0.62;

// …et seulement si le groupe qui COMMENCE a de quoi tenir une page décente. Sans cette condition,
// un groupe réduit à un petit bloc ouvre une page pour lui seul : mesuré le 2026-08-07, les 146px
// de « Caractéristiques détaillées » (groupe annexe) chassaient une page entière à eux tout seuls
// sur la Fiche Technique A4, faisant passer le document de 2 à 3 pages et le remplissage de 66,5 %
// à 34,3/36,7 %. Une coupure de structure ne doit jamais coûter plus qu'elle ne rapporte.
const GROUP_BREAK_MIN_PAYLOAD = 0.35;

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
// Exporté : `ModuleOrderControls` (flèches) et `BlockDragOverlay` (glisser-déposer) ordonnent tous
// deux des MODULES, jamais des tronçons — trois copies du même découpage étaient une invitation à
// les voir diverger.
export function baseModuleId(id) {
    const hash = id.indexOf('#');
    return hash === -1 ? id : id.slice(0, hash);
}

function resolveMeta(id) {
    return MODULE_META[baseModuleId(id)] || { label: baseModuleId(id), icon: '📄' };
}

/** Libellé/icône d'un id de bloc, pour toute UI qui manipule ces ids (ordre des blocs, pages). */
export function getModuleMeta(id) {
    return resolveMeta(id);
}

/**
 * Un id appartient-il au vocabulaire des blocs de rendu ?
 *
 * Sert à purger `config.moduleOrder`, qui a porté jusqu'au 2026-08-12 une liste de ~100 CLÉS DE
 * CHAMP (`densite`, `tastes`, `thcLevel`…) — un vocabulaire sans aucun rapport avec les blocs que
 * les templates rendent réellement, et que rien n'a jamais lu. Le laisser filtrer par recoupement
 * serait pire que l'ignorer : `description` et `extraData` existent dans les DEUX vocabulaires, donc
 * deux entrées héritées prendraient un rang réel et déplaceraient vraiment ces deux blocs, au nom
 * d'un ordre que personne n'a choisi.
 */
export function isKnownModuleId(id) {
    if (typeof id !== 'string' || !id) return false;
    const base = baseModuleId(id);
    return base.startsWith('pipeline:') || base.startsWith('gisement:') || Object.prototype.hasOwnProperty.call(MODULE_META, base);
}

/**
 * Normalise un `moduleOrder` venu du stockage : ids inconnus retirés, doublons écartés.
 * Retourne un tableau vide si rien de valide n'en sort — c'est-à-dire « ordre naturel du
 * template » (cf. `orderRenderBlocks`), jamais un ordre partiel deviné.
 */
export function sanitizeModuleOrder(order) {
    if (!Array.isArray(order)) return [];
    const seen = new Set();
    const clean = [];
    for (const id of order) {
        if (!isKnownModuleId(id) || seen.has(id)) continue;
        seen.add(id);
        clean.push(id);
    }
    return clean;
}

// SONDE. Le remplissage seul ne dit jamais POURQUOI une page déborde : il faut confronter la
// hauteur mesurée de chaque module au budget réellement appliqué. Trois diagnostics de ce chantier
// ont échoué par déduction depuis le remplissage ; celui du débordement A4 (108,2 %) a été résolu
// en une mesure une fois cette sonde en place. Elle n'a aucun effet sur le calcul — elle publie
// l'état, comme `data-fit-scale` pour `FitToFill`.
function publishProbe(entry) {
    const g = typeof globalThis === 'undefined' ? null : globalThis;
    if (!g) return;
    if (!Array.isArray(g.__adaptivePaginationProbe)) g.__adaptivePaginationProbe = [];
    g.__adaptivePaginationProbe.push(entry);
    if (g.__adaptivePaginationProbe.length > 20) g.__adaptivePaginationProbe.shift();
}

export function computeAdaptivePages(moduleHeights, ratio, containerPadding, templateId) {
    const dims = RATIO_DIMENSIONS[ratio] || RATIO_DIMENSIONS['1:1'];
    // Le budget est une hauteur CUMULÉE de modules. Sur un format à deux colonnes, une page en
    // absorbe donc environ le double — l'ignorer ferait paginer comme si la page n'en tenait
    // qu'une, produisant deux fois trop de pages toutes à moitié vides.
    // Colonnes RÉELLEMENT rendues par ce template, pas celles que le format permettrait — voir
    // `getTemplateColumns`. Utiliser `getFormatLayout(ratio).columns` ici doublait le budget
    // d'Article de Blog, qui empile pourtant sur une seule colonne.
    const columns = getTemplateColumns(templateId, ratio);
    // Budget par COLONNE, pas par page. Le modèle précédent — hauteur de page × nombre de colonnes,
    // comparé à la somme des hauteurs — suppose que les blocs se répartissent parfaitement entre
    // les colonnes. Ils ne s'y répartissent pas : chacun est insécable (`break-inside: avoid`), et
    // il suffit que les tailles tombent mal pour qu'une colonne dépasse pendant que l'autre reste
    // courte. Mesuré le 2026-08-06 en 16:9 : une page dont la somme des modules tenait dans le
    // budget (1789 sur 1899) se rendait à 108,1 %, donc coupée. On simule désormais le remplissage
    // colonne par colonne, comme le fait le rendu.
    const availableHeight = dims.height - containerPadding * 2;
    const budget = Math.max(200, availableHeight * BUDGET_SAFETY_FACTOR);

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

    /** Hauteur qu'un module occupe dans SA colonne (ou en pleine largeur). */
    const blockHeight = (id, rawHeight) => rawHeight + SECTION_HEADER_OVERHEAD;

    // Groupe de lecture de chaque module, résolu UNE fois sur l'ordre de rendu (le repli sur le
    // groupe précédent n'a de sens que dans cet ordre, pas au gré d'un packing exploratoire), puis
    // hauteur cumulée du groupe à partir de chaque position — c'est elle qui dit si une frontière
    // vaut une page neuve.
    const groups = [];
    entries.forEach(([id], i) => { groups[i] = groupOf(id, i > 0 ? groups[i - 1] : null); });
    const groupPayload = [];
    for (let i = entries.length - 1; i >= 0; i -= 1) {
        const own = blockHeight(entries[i][0], entries[i][1]);
        groupPayload[i] = (i + 1 < entries.length && groups[i + 1] === groups[i])
            ? own + groupPayload[i + 1]
            : own;
    }

    // Coût de l'en-tête à réserver si ce module est le premier de son pipeline sur la page visée.
    const headerCostOn = (page, id) => {
        const base = baseModuleId(id);
        if (!headerHeights.has(base)) return 0;
        return page && page.bases.has(base) ? 0 : headerHeights.get(base);
    };

    /**
     * Packing séquentiel sous un budget de hauteur PAR COLONNE.
     *
     * Une page a `columns` colonnes. On remplit la colonne courante jusqu'à ce que le bloc suivant
     * n'y tienne plus, puis on passe à la colonne suivante ; quand il n'en reste plus, on ouvre une
     * page. C'est le comportement du flux `columnCount` avec des blocs insécables, donc le seul
     * modèle dont on puisse attendre qu'il prédise le rendu.
     *
     * Un bloc PLEINE LARGEUR (masthead) est rendu au-dessus du flux : il ampute la hauteur de
     * TOUTES les colonnes de la page.
     */
    const pack = (cap) => {
        const pages = [];
        let current = null;
        let colIndex = 0;      // colonne en cours de remplissage
        let colHeight = 0;     // hauteur déjà occupée dans cette colonne
        let fullWidthUsed = 0; // hauteur consommée en pleine largeur sur cette page
        let pageUsed = 0;      // hauteur totale posée sur la page, toutes colonnes confondues
        let lastGroup = null;

        const startPage = (firstId) => {
            if (current) pages.push(current);
            const meta = resolveMeta(firstId);
            current = { id: `adaptive-${pages.length}-${Date.now()}`, label: meta.label, icon: meta.icon, modules: [], adaptive: true, bases: new Set(), colOf: {}, colUsed: {}, fullWidthUsed: 0 };
            colIndex = 0;
            colHeight = 0;
            fullWidthUsed = 0;
            pageUsed = 0;
        };

        for (let idx = 0; idx < entries.length; idx += 1) {
            const [id, rawHeight] = entries[idx];
            const height = blockHeight(id, rawHeight);
            const isolated = ALWAYS_ISOLATE.has(baseModuleId(id));
            const isFullWidth = FULL_WIDTH_MODULES.has(baseModuleId(id));
            const group = groups[idx];
            // Changement de groupe sur une page déjà bien remplie : on coupe ici plutôt que de
            // laisser la coupure tomber au hasard du remplissage, quelques blocs plus loin.
            // Seuil calé sur le budget NOMINAL de la page, jamais sur `cap` : `cap` est le budget
            // exploratoire que la dichotomie de rééquilibrage fait varier, et l'y indexer faisait
            // dériver les coupures de groupe à chaque itération — mesuré en A4, une page de plus et
            // un remplissage tombé de 66,5 % à 41,8/30,6 %. Le seuil doit dire « cette page est
            // pleine », ce qui ne dépend pas de la recherche en cours.
            const breaksGroup = current && current.modules.length > 0
                && lastGroup && group && group !== lastGroup
                && pageUsed >= budget * columns * GROUP_BREAK_MIN_FILL
                && groupPayload[idx] >= budget * columns * GROUP_BREAK_MIN_PAYLOAD;

            if (isolated || !current || current.solo || breaksGroup) {
                startPage(id);
            } else if (isFullWidth) {
                // Un bloc pleine largeur n'a de sens qu'en tête de page (c'est là que le rendu le
                // place) : s'il en existe déjà du contenu, il ouvre la page suivante.
                if (current.modules.length > 0) startPage(id);
            } else {
                const extra = headerCostOn(current, id);
                let placed = colHeight + extra + height <= cap - fullWidthUsed;
                while (!placed && colIndex + 1 < columns) {
                    colIndex += 1;
                    colHeight = 0;
                    placed = extra + height <= cap - fullWidthUsed;
                }
                if (!placed) startPage(id);
            }

            if (isolated) current.solo = true;
            if (isFullWidth) {
                fullWidthUsed += height;
                pageUsed += height * columns; // ampute toutes les colonnes
            } else {
                const cost = headerCostOn(current, id) + height;
                colHeight += cost;
                pageUsed += cost;
            }
            current.bases.add(baseModuleId(id));
            current.modules.push(id);
            // Colonne d'atterrissage et occupation par colonne : c'est la place restante DANS SA
            // colonne qui borne l'étirement d'un bloc, pas celle de la page. Sans cette distinction,
            // un bloc de la colonne déjà la plus haute recevait une part du vide laissé par l'autre
            // colonne et poussait la page hors de son cadre (mesuré : 100,1 % en 16:9, 108 % en 4:3).
            if (!isFullWidth) {
                current.colOf[id] = colIndex;
                current.colUsed[colIndex] = (current.colUsed[colIndex] || 0) + headerCostOn(current, id) + height;
            } else {
                current.fullWidthUsed = (current.fullWidthUsed || 0) + height;
            }
            lastGroup = group;
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
        // Borne basse : la moyenne parfaite par colonne, qu'aucun packing ne peut battre.
        const total = entries.reduce((sum, [id, h]) => sum + blockHeight(id, h), 0);
        let lo = Math.max(200, total / (pages.length * columns));
        let hi = budget;
        let best = pages;
        for (let i = 0; i < 12 && hi - lo > 8; i += 1) {
            const mid = (lo + hi) / 2;
            const attempt = pack(mid);
            if (attempt.length <= pages.length) { best = attempt; hi = mid; } else { lo = mid; }
        }
        pages = best;
    }

    // ── PAGE LÉGÈRE : UNE SEULE COLONNE ────────────────────────────────────────────────────────
    //
    // Le flux multi-colonnes ÉQUILIBRE (`column-fill: balance`) : sur une page dont le contenu ne
    // remplit pas une colonne entière, le navigateur le coupe en deux moitiés côte à côte, et la
    // page se rend à moitié vide par le bas. Mesuré sur la Fiche Technique 4:3, page 3 : trois blocs
    // pour 910px de coût, une colonne en tient 1060 — donc ~455px de contenu réel sur 1152px de
    // page, soit 52,2 %. Ce n'est pas un défaut de répartition entre PAGES (le packing est correct),
    // c'est la mise en colonnes qui n'a plus lieu d'être.
    //
    // Aucun risque de débordement : on ne bascule que si tout tient déjà dans UNE colonne.
    // Et la résorption qui suit y gagne — le vide devient un reliquat de colonne exploitable.
    if (columns > 1) {
        pages.forEach((page) => {
            const coutColonnes = page.modules
                .filter((id) => !FULL_WIDTH_MODULES.has(baseModuleId(id)))
                .reduce((s, id) => s + blockHeight(id, moduleHeights.get(id) || 0), 0);
            if (coutColonnes > 0 && coutColonnes <= budget - (page.fullWidthUsed || 0)) {
                page.columns = 1;
                // La répartition simulée par le packer n'a plus cours : tout retombe en colonne 0,
                // et c'est cette occupation-là que la résorption doit lire.
                page.colUsed = { 0: coutColonnes };
                page.modules.forEach((id) => {
                    if (!FULL_WIDTH_MODULES.has(baseModuleId(id))) page.colOf[id] = 0;
                });
            }
        });
    }

    // ── RÉSORPTION DE L'ESPACE VIDE ────────────────────────────────────────────────────────────
    // Le packing pose des blocs jusqu'à ce que le suivant ne rentre plus ; ce qui reste sous le
    // dernier bloc de la colonne la plus haute est du vide. On le rend aux blocs élastiques de la
    // page, proportionnellement à leur taille (un grand canevas absorbe plus qu'une petite photo),
    // et borné par `MAX_STRETCH_RATIO`. Purement arithmétique : aucune mesure DOM, donc aucun risque
    // de boucle de rétroaction.
    pages.forEach((page) => {
        const elastiques = page.modules.filter((id) => ELASTIC_MODULES.has(baseModuleId(id)));
        if (elastiques.length === 0) return;
        const colonnesPage = page.columns || columns;
        const pleineLargeur = page.fullWidthUsed || 0;
        // On ne rend qu'une PART du reliquat. La capacité se calcule en supposant les colonnes
        // parfaitement équilibrées ; elles ne le sont pas toujours, et un bloc étiré dans la colonne
        // déjà la plus haute pousse alors la page au-delà de son cadre. Mesuré le 2026-08-12 en
        // distribuant 100 % : les remplissages passent bien de 52-79 % à 83-100 %, mais deux pages
        // franchissent la limite (100,1 % en 16:9, 108 % en 4:3) — donc du contenu coupé, ce qui est
        // pire que le vide qu'on résorbe. La part retenue garde l'essentiel du gain sans le risque.
        const stretch = {};
        // Une colonne à la fois : son vide ne peut profiter qu'aux blocs élastiques qu'elle porte.
        const parColonne = {};
        const pleineLargeurElastiques = [];
        elastiques.forEach((id) => {
            const col = page.colOf[id];
            // Un bloc PLEINE LARGEUR n'appartient à aucune colonne : il était donc écarté ici, et
            // sortait purement et simplement de la résorption. Sur l'Article de Blog, le masthead
            // EST le plus gros bloc élastique de la page (782px mesurés en A4) — la page 1 restait
            // à 61,3 % avec près de 1000px de vide qu'aucun autre bloc ne pouvait absorber. Son
            // reliquat n'est pas celui d'une colonne mais celui de la PAGE : ce qui reste sous la
            // colonne la plus haute.
            if (col === undefined) pleineLargeurElastiques.push(id);
            else (parColonne[col] = parColonne[col] || []).push(id);
        });

        // ORDRE IMPORTANT : le pleine-largeur d'abord, les colonnes ensuite sur ce qu'il RESTE.
        //
        // Traités en parallèle, chacun calcule sa part du vide en supposant l'autre immobile, et les
        // deux étirements s'additionnent : mesuré le 2026-08-12, deux pages passaient à 1102px de
        // contenu dans 1080 — donc coupées, pour résorber du vide. La hauteur gagnée en haut se
        // retranche de la capacité des colonnes, comme au rendu.
        let extraPleineLargeur = 0;
        if (pleineLargeurElastiques.length > 0) {
            const colonneLaPlusHaute = Math.max(0, ...Object.values(page.colUsed || {}));
            const reliquat = (budget - pleineLargeur - colonneLaPlusHaute) * RELIQUAT_DISTRIBUE;
            const baseTotale = pleineLargeurElastiques.reduce((s, id) => s + (moduleHeights.get(id) || 0), 0);
            if (reliquat > 24 && baseTotale > 0) {
                pleineLargeurElastiques.forEach((id) => {
                    const base = moduleHeights.get(id) || 0;
                    const extra = Math.round(Math.min(reliquat * (base / baseTotale), base * maxStretchFor(id)));
                    if (extra >= 12) { stretch[id] = Math.round(base + extra); extraPleineLargeur += extra; }
                });
            }
        }
        const capaciteColonne = budget - pleineLargeur - extraPleineLargeur;
        // Voir `MAX_ELASTIC_SHARE_MULTICOL` : au-delà, la consigne n'est plus suivie.
        const plafondBloc = colonnesPage > 1 ? capaciteColonne * MAX_ELASTIC_SHARE_MULTICOL : Infinity;
        Object.entries(parColonne).forEach(([col, ids]) => {
            // GARDE-FOU : ne jamais étirer jusqu'au dernier pixel modélisé.
            //
            // Le packer ne compte que les blocs porteurs d'un `data-module`. Ce qui les entoure —
            // en-tête d'article, marges internes du template, titres de section sans identifiant —
            // n'entre dans aucun total, mais occupe bien de la hauteur. Tant que les pages
            // restaient à 85-90 % de remplissage, l'écart passait inaperçu ; en resserrant le
            // contenu (doublon « Caractéristiques détaillées » retiré le 2026-08-14), une page
            // d'Article de Blog est montée à 95,5 % et a débordé de 8px sur 1080 — mesuré, contenu
            // coupé. On garde donc une réserve : l'étirement ne comble que le reliquat SOUS 96 % de
            // la capacité de colonne, le reste absorbe ce que le modèle ne voit pas.
            const RESERVE_HORS_MODULE = 0.96;
            const capaciteEtirable = capaciteColonne * RESERVE_HORS_MODULE;
            const reliquat = Math.max(0, capaciteEtirable - (page.colUsed[col] || 0)) * RELIQUAT_DISTRIBUE;
            if (reliquat <= 24) return; // en dessous, l'étirement ne se verrait pas
            const baseTotale = ids.reduce((somme, id) => somme + (moduleHeights.get(id) || 0), 0);
            if (baseTotale <= 0) return;
            ids.forEach((id) => {
                const base = moduleHeights.get(id) || 0;
                const part = reliquat * (base / baseTotale);
                const extra = Math.round(Math.min(part, base * maxStretchFor(id), Math.max(0, plafondBloc - base)));
                // Hauteur CIBLE absolue, pas un delta : la règle CSS appliquée au rendu est un
                // `min-height`, sans effet s'il reste sous la hauteur naturelle du bloc. Émettre le
                // delta seul produirait une règle inerte.
                if (extra >= 12) stretch[id] = Math.round(base + extra);
            });
        });
        if (Object.keys(stretch).length > 0) page.stretch = stretch;
    });

    // ── AÉRATION : le reliquat qu'AUCUN bloc élastique ne peut absorber ────────────────────────
    //
    // Une page peut n'avoir aucun bloc extensible. Mesuré sur l'Article de Blog 16:9, page 2 :
    // notes sensorielles + cannabinoïdes + provenance + arômes, 609px sur 949 de budget — quatre
    // blocs rigides et 340px de vide en bas de page, que la résorption élastique ne pouvait pas
    // toucher. Le reliquat va alors dans les ESPACES ENTRE LES BLOCS : une page aérée se lit mieux
    // qu'une page tassée en haut avec un trou dessous, et c'est la seule façon d'occuper la hauteur
    // sans inventer du contenu ni grossir la typographie.
    //
    // Réservé aux pages à UNE colonne : en multi-colonnes, une marge ajoutée à chaque bloc allonge
    // chaque colonne indépendamment et pousse la page hors cadre — le mode de défaillance qu'on
    // passe ce chantier à éliminer.
    pages.forEach((page) => {
        const colonnesPage = page.columns || columns;
        if (colonnesPage !== 1 || page.modules.length < 2) return;
        const occupe = page.modules.reduce((somme, id) => {
            const naturelle = blockHeight(id, moduleHeights.get(id) || 0);
            const etiree = page.stretch && page.stretch[id] ? page.stretch[id] + SECTION_HEADER_OVERHEAD : 0;
            return somme + Math.max(naturelle, etiree);
        }, 0);
        const reliquat = (budget - occupe) * RELIQUAT_DISTRIBUE;
        if (reliquat < 60) return; // en dessous, l'aération ne se voit pas et ne change rien
        page.gap = Math.round(reliquat / (page.modules.length - 1));
    });

    publishProbe({
        templateId, ratio, columns, containerPadding,
        canvasHeight: dims.height,
        availableHeight: Math.round(availableHeight),
        budgetPerColumn: Math.round(budget),
        safetyFactor: BUDGET_SAFETY_FACTOR,
        modules: entries.map(([id, h]) => ({
            id,
            height: Math.round(h),
            cost: Math.round(blockHeight(id, h)),
            fullWidth: FULL_WIDTH_MODULES.has(baseModuleId(id)),
        })),
        headers: [...headerHeights.entries()].map(([id, h]) => ({ id, height: Math.round(h) })),
        pages: pages.map((p) => ({
            modules: p.modules,
            cost: Math.round(p.modules.reduce((s, id) => s + blockHeight(id, moduleHeights.get(id) || 0), 0)),
        })),
    });

    // `bases` est un accumulateur interne au packing — un Set ne se sérialise pas en JSON (il
    // deviendrait `{}` en traversant le store de pages), on ne le laisse pas fuiter dans la sortie.
    return pages.map(({ bases, colOf, colUsed, ...page }) => page); // eslint-disable-line no-unused-vars
}
