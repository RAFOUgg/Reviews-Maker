/**
 * Export Data Adapter — Projette une review brute (Fleur/Hash/Concentré/Comestible) vers les
 * clés canoniques attendues par les templates Export Maker (thcLevel, aromas, effects,
 * terpenes, categoryRatings…), en dérivant du registre de champs unique (fieldRegistry.js).
 *
 * Deux origines de données convergent ici, toutes deux couvertes par les `sources[]` du
 * registre :
 *   - chemin public : review renvoyée par l'API, déjà APLATIE côté serveur
 *     (reviewFormatter.flattenSubReview) → noms de colonnes DB (thcPercent, dureteScore…) ;
 *   - chemin Orchard : état de formulaire normalisé (normalizeReviewData) → noms formData
 *     (densite, durete, montee…).
 *
 * Le registre encapsule ce mapping ; ce fichier ne fait qu'appliquer les transformations de
 * type et reconstruire categoryRatings à partir des sous-scores /10. Point de branchement
 * unique : TemplateRenderer.jsx (+ ExportModal pour le figement de traçabilité).
 */
import { asArray, safeParse } from './orchardHelpers';
import { getFieldRegistry, normalizeProductType } from './fieldRegistry';

function pick(...values) {
    for (const v of values) {
        if (v !== undefined && v !== null && v !== '') return v;
    }
    return undefined;
}

// Applique la transformation de type d'une entrée de registre à une valeur brute.
function coerce(type, raw) {
    switch (type) {
        case 'list':
            return asArray(raw);
        case 'rich':
        case 'json':
            return safeParse(raw);
        case 'number':
        case 'percent':
        case 'score': {
            const n = Number(raw);
            return Number.isFinite(n) ? n : undefined;
        }
        case 'bool':
            if (raw === true || raw === 'true') return true;
            if (raw === false || raw === 'false') return false;
            return undefined;
        default: // text | url | date
            return raw;
    }
}

// Écrit `key` seulement si `value` est une donnée réelle ; sinon supprime la clé (au lieu de
// null/[]), pour que les checks `!== undefined` / `.length` des templates masquent le bloc.
function setOrDelete(target, key, value) {
    if (
        value === undefined || value === null || value === '' ||
        (Array.isArray(value) && value.length === 0)
    ) {
        delete target[key];
    } else {
        target[key] = value;
    }
}

/**
 * Reconstruit categoryRatings { visual: {champ: note}, smell: {...}, ... } à partir des
 * sous-scores /10 présents (couvre noms DB ET formData via les `sources[]` du registre).
 * Reproduit le comportement de OrchardPanel.normalizeReviewData mais pour les deux origines.
 */
function buildCategoryRatings(source, fields) {
    const cats = {};
    for (const f of fields) {
        if (f.type !== 'score' || !f.cat) continue;
        const raw = pick(...f.sources.map((s) => source[s]));
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) {
            if (!cats[f.cat]) cats[f.cat] = {};
            cats[f.cat][f.key] = n;
        }
    }
    return Object.keys(cats).length > 0 ? cats : null;
}

// Les formulaires Hash/Concentré/Comestible (et Fleur) structurent formData en SECTIONS
// imbriquées avec des clés génériques (odeurs.intensity, texture.hardness, effets.onset…),
// et ne remontent pas toujours les colonnes DB à la racine. On aplatit ces conteneurs vers
// les noms canoniques que le registre attend. `analytics` porte déjà les noms DB (merge direct).
const SECTION_FLATTEN = {
    analytics: null, // clés déjà en noms DB (thcPercent, terpeneProfile, labName…)
    visual: { colorRating: 'couleurScore', density: 'densiteVisuelle', transparency: 'couleurTransparence', purity: 'pureteVisuelle', trichomes: 'trichomesScore', mold: 'moisissureScore', seeds: 'grainesScore', pistils: 'pistilsScore', colors: 'couleurNuancier' },
    texture: { hardness: 'dureteScore', density: 'densiteTactileScore', elasticity: 'elasticiteScore', stickiness: 'collantScore', malleability: 'malleabiliteScore', friability: 'friabiliteScore', viscosity: 'viscositeScore', melting: 'meltingScore', residue: 'residuScore' },
    odeurs: { intensity: 'intensiteAromeScore', complexity: 'complexiteAromeScore', fidelity: 'fideliteAromeScore', dominantNotes: 'notesOdeursDominantes', secondaryNotes: 'notesOdeursSecondaires' },
    gouts: { intensity: 'intensiteGoutScore', aggressiveness: 'agressiviteScore', dryPuffNotes: 'dryPuffNotes', inhalationNotes: 'inhalationNotes', exhalationNotes: 'expirationNotes' },
    effets: { onset: 'monteeScore', intensity: 'intensiteEffetScore', effects: 'effetsChoisis', duration: 'dureeEffet', effectProfiles: 'effectProfiles', usagesPreferes: 'preferredUse', methodeConsommation: 'consumptionMethod', dosageUtilise: 'dosage' },
    recipe: { ingredients: 'ingredients', steps: 'etapesPreparation' },
    // Conteneurs de pipeline : les clés sont déjà des noms DB, sauf le renommage `curingTimeline`
    // (les hooks de formulaire renomment curingTimelineData → curingTimeline au chargement).
    genetics: null,
    culture: null,
    separationPipeline: null,
    extractionPipeline: null,
    curing: { curingTimeline: 'curingTimelineData' },
};
// Alias de conteneurs (le nom français `visuel` désigne la même section que `visual`)
const SECTION_ALIASES = { visuel: 'visual' };

function flattenSections(reviewData) {
    const rd = { ...reviewData };
    for (const [rawName, obj] of Object.entries(reviewData)) {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) continue;
        const name = SECTION_ALIASES[rawName] || rawName;
        if (!(name in SECTION_FLATTEN)) continue;
        const map = SECTION_FLATTEN[name];
        for (const [k, v] of Object.entries(obj)) {
            if (v === undefined || v === null || v === '') continue;
            const canonical = map ? (map[k] || k) : k; // analytics: garder tel quel
            if (rd[canonical] === undefined || rd[canonical] === null || rd[canonical] === '') {
                rd[canonical] = v;
            }
        }
    }
    return rd;
}

function build(reviewDataRaw) {
    const reviewData = flattenSections(reviewDataRaw);
    const adapted = { ...reviewData };
    const fields = getFieldRegistry(reviewData.type);

    // Confiance producteur : la vraie source est author.producerProfile ; on la remonte à plat
    // pour que le registre (source 'producerVerified') la trouve. `author.producerProfile` doit
    // être inclus par la route (reviews.js / flower-reviews.js GET) — absent sinon, pas une erreur.
    const pp = reviewData.author?.producerProfile;
    if (pp) {
        if (reviewData.producerVerified === undefined) reviewData.producerVerified = pp.isVerified;
        if (reviewData.producerBusinessType === undefined) reviewData.producerBusinessType = pp.businessType;
    }

    // Note globale — le backend calcule déjà une moyenne correcte dans computedOverall
    // (reviewFormatter.js) ; les templates lisent `rating`.
    setOrDelete(adapted, 'rating', pick(reviewData.computedOverall, reviewData.rating));

    // Projeter chaque champ du registre vers sa clé canonique
    for (const f of fields) {
        const raw = pick(...f.sources.map((s) => reviewData[s]));
        setOrDelete(adapted, f.key, coerce(f.type, raw));
    }

    // cultivar : dernier recours sur le premier cultivar de la liste
    if (adapted.cultivar === undefined && Array.isArray(adapted.cultivarsList) && adapted.cultivarsList.length) {
        setOrDelete(adapted, 'cultivar', adapted.cultivarsList[0]);
    }

    // categoryRatings : reconstruire depuis les sous-scores, sinon préserver l'existant
    const rebuilt = buildCategoryRatings(reviewData, fields);
    if (rebuilt) {
        adapted.categoryRatings = rebuilt;
    } else {
        const existing = safeParse(reviewData.categoryRatings) ?? safeParse(reviewData.ratings);
        if (existing && typeof existing === 'object') adapted.categoryRatings = existing;
    }

    return adapted;
}

// Mémoïsation par référence d'entrée : TemplateRenderer recalcule à chaque render, mais tant
// que la review ne change pas de référence, on renvoie le même objet adapté (stabilise la
// mémoïsation en aval des templates). WeakMap → pas de fuite mémoire.
const _cache = new WeakMap();

/**
 * Construit l'objet reviewData "adapté" consommé par les templates Export Maker.
 * @param {Object} reviewData - Review brute (déjà aplatie par le serveur, ou état de formulaire normalisé)
 * @returns {Object} reviewData enrichi des clés canoniques attendues par les templates
 */
export function buildExportReviewData(reviewData) {
    if (!reviewData || typeof reviewData !== 'object') return reviewData;
    if (_cache.has(reviewData)) return _cache.get(reviewData);
    const out = build(reviewData);
    _cache.set(reviewData, out);
    return out;
}

export { normalizeProductType };
export default buildExportReviewData;
