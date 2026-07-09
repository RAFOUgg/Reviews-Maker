/**
 * Export Data Adapter - Normalise les données brutes d'une review (Fleur/Hash/Concentré/Comestible)
 * vers les noms de champs génériques attendus par les templates Export Maker
 * (client/src/components/templates/*.jsx), qui ont toujours lu des alias legacy
 * (thcLevel, aromas, effects, terpenes, indicaRatio...) jamais alimentés par
 * les vrais modèles Prisma (thcPercent, effetsChoisis, terpeneProfile...).
 *
 * Point de branchement unique : TemplateRenderer.jsx, avant transmission aux templates.
 */
import { asArray, safeParse } from './orchardHelpers';

function pick(...values) {
    for (const v of values) {
        if (v !== undefined && v !== null && v !== '') return v;
    }
    return undefined;
}

// Ecrit `key` seulement si `value` est une donnée réelle ; sinon supprime la clé
// (au lieu de la laisser à `null`), pour que les checks `!== undefined` déjà
// présents dans les templates masquent correctement le bloc au lieu d'afficher
// des artefacts du type "null%" ou "0.0/10".
function setOrDelete(target, key, value) {
    if (value === undefined || value === null || value === '') {
        delete target[key];
    } else {
        target[key] = value;
    }
}

/**
 * Construit l'objet reviewData "adapté" consommé par les templates Export Maker.
 * @param {Object} reviewData - Review brute telle que renvoyée par l'API (déjà aplatie
 *   avec les champs FlowerReview/HashReview/ConcentrateReview/EdibleReview au niveau racine)
 * @returns {Object} reviewData enrichi des alias attendus par les templates
 */
export function buildExportReviewData(reviewData) {
    if (!reviewData || typeof reviewData !== 'object') return reviewData;

    const adapted = { ...reviewData };

    // Note globale — le backend calcule déjà une moyenne correcte dans computedOverall
    // (reviewFormatter.js), les templates lisent `rating`.
    setOrDelete(adapted, 'rating', pick(reviewData.computedOverall, reviewData.rating));

    // Cannabinoïdes (%THC/%CBD/...) — jamais lus depuis xxxPercent auparavant
    setOrDelete(adapted, 'thcLevel', pick(reviewData.thcPercent, reviewData.thcLevel));
    setOrDelete(adapted, 'cbdLevel', pick(reviewData.cbdPercent, reviewData.cbdLevel));
    setOrDelete(adapted, 'cbgLevel', reviewData.cbgPercent);
    setOrDelete(adapted, 'cbcLevel', reviewData.cbcPercent);
    setOrDelete(adapted, 'cbnLevel', reviewData.cbnPercent);
    setOrDelete(adapted, 'thcvLevel', reviewData.thcvPercent);

    // Confiance producteur — ProducerProfile.isVerified/businessType, jusqu'ici lus uniquement côté
    // compte (page Account, admin), jamais exposés sur une review/export (Chantier 5 de la roadmap
    // traçabilité). `author.producerProfile` doit être inclus par la route qui a fourni `reviewData`
    // (cf. flower/hash/concentrate/edible-reviews.js, GET /:id) — absent sinon, pas une erreur.
    setOrDelete(adapted, 'producerVerified', pick(reviewData.producerVerified, reviewData.author?.producerProfile?.isVerified));
    setOrDelete(adapted, 'producerBusinessType', pick(reviewData.producerBusinessType, reviewData.author?.producerProfile?.businessType));

    // Génétique / provenance
    setOrDelete(adapted, 'strainType', pick(reviewData.varietyType, reviewData.strainType));
    setOrDelete(adapted, 'indicaRatio', pick(reviewData.indicaPercent, reviewData.indicaRatio));
    setOrDelete(adapted, 'category', pick(reviewData.concentrateType, reviewData.category));
    setOrDelete(adapted, 'parentage', safeParse(reviewData.parentage) ?? reviewData.parentage);

    const cultivarsListRaw = pick(reviewData.cultivarsList, reviewData.cultivarsUtilises, reviewData.cultivars);
    const cultivarsList = asArray(cultivarsListRaw);
    setOrDelete(adapted, 'cultivarsList', cultivarsList);
    setOrDelete(adapted, 'cultivar', pick(reviewData.variety, reviewData.cultivar, cultivarsList[0]));

    // Odeurs / goûts / effets — noms de champs différents entre Fleur, Hash/Concentré et le
    // legacy Review de base (voir schema.prisma FlowerReview vs HashReview/ConcentrateReview)
    setOrDelete(adapted, 'aromas', asArray(pick(
        reviewData.notesOdeursDominantes, reviewData.notesDominantes, reviewData.notesDominantesOdeur
    )));
    setOrDelete(adapted, 'secondaryAromas', asArray(pick(
        reviewData.notesOdeursSecondaires, reviewData.notesSecondaires, reviewData.notesSecondairesOdeur
    )));
    setOrDelete(adapted, 'dryPuffNotes', asArray(pick(reviewData.dryPuffNotes, reviewData.dryPuff)));
    setOrDelete(adapted, 'inhalationNotes', asArray(pick(reviewData.inhalationNotes, reviewData.inhalation)));
    setOrDelete(adapted, 'exhalationNotes', asArray(pick(reviewData.expirationNotes, reviewData.expiration)));
    setOrDelete(adapted, 'effects', asArray(pick(reviewData.effetsChoisis, reviewData.effects)));
    setOrDelete(adapted, 'terpenes', asArray(pick(reviewData.terpeneProfile, reviewData.terpenes)));
    setOrDelete(adapted, 'dureeEffet', pick(reviewData.dureeEffets, reviewData.effectDuration, reviewData.dureeEffet));

    // Substrat de culture (Fleur) — cultureSubstrat est le champ réellement alimenté aujourd'hui
    setOrDelete(adapted, 'substratMix', pick(reviewData.cultureSubstrat, reviewData.substratMix));

    return adapted;
}

export default buildExportReviewData;
