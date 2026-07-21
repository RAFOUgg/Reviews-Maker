/**
 * fieldRegistry — Source de vérité UNIQUE des champs affichables d'une review, par type de
 * produit (Fleur / Hash / Concentré / Comestible).
 *
 * Pourquoi ce fichier existe :
 *  - Historiquement, 3 vocabulaires de modules incompatibles cohabitaient (moduleMappings.js
 *    en clés pointées vs plates, TEMPLATE_MODULE_PRESETS, alias manuels de exportDataAdapter),
 *    et les listes de extractCategoryRatings/normalizeReviewData utilisaient les noms de
 *    *formData* (`densite`, `durete`, `montee`) qui ne correspondent PAS aux colonnes Prisma
 *    (`densiteVisuelle`, `dureteScore`, `monteeScore`). Résultat : la config ne pilotait rien
 *    et les notes par catégorie étaient vides sur le chemin d'export public.
 *  - Ce registre décrit chaque champ une seule fois, avec TOUS ses noms de colonnes possibles
 *    (`sources[]` : formData + colonnes DB + legacy Review), son libellé, son unité, son groupe
 *    et son type. exportDataAdapter en dérive les clés canoniques que lisent les templates,
 *    et il servira aussi aux futurs panneaux de contenu et aux exports CSV/JSON.
 *
 * Une entrée :
 *   {
 *     key,     // clé canonique écrite dans reviewData adapté (lue par templates/CSV/JSON)
 *     label,   // libellé humain
 *     group,   // groupe logique (voir GROUPS)
 *     type,    // 'text'|'number'|'percent'|'score'|'list'|'rich'|'date'|'bool'|'url'|'json'
 *     sources, // noms de colonnes candidats, par ordre de préférence
 *     unit?,   // unité d'affichage ('%', '°C', 'g'…)
 *     ref?,    // id dans data/cannabinoids.js ou data/terpenes.js (métadonnées enrichies)
 *     cat?,    // pour type 'score' : catégorie de notation à laquelle il contribue
 *     types?,  // sous-ensemble de PRODUCT_TYPES ; absent = tous
 *   }
 */

export const PRODUCT_TYPES = ['flower', 'hash', 'concentrate', 'edible'];

// Clés de categoryRatings reconstruites (alignées sur normalizeReviewData / DEFAULT_CONFIG)
export const CATEGORY_KEYS = ['visual', 'smell', 'texture', 'taste', 'effects'];

export const GROUPS = [
    'general', 'genetics', 'culture', 'harvest', 'analytics', 'lab',
    'visual', 'smell', 'texture', 'taste', 'effects', 'usage', 'curing',
    'separation', 'extraction', 'purification', 'recipe', 'traceability',
];

/**
 * Normalise un type de produit hétérogène (`Fleurs`, `flower`, `Hash`, `concentré`, `Comestible`…)
 * vers l'une des 4 valeurs canoniques. (review.type n'a pas de casse uniforme entre les 4 types.)
 */
export function normalizeProductType(productType) {
    const t = (productType || '').toLowerCase();
    if (t.includes('hash')) return 'hash';
    if (t.includes('concentr') || t.includes('concentré')) return 'concentrate';
    if (t.includes('edible') || t.includes('comestible')) return 'edible';
    return 'flower';
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRE
// ═══════════════════════════════════════════════════════════════════════════════
// NB : les `key` de type 'score' (visuel/texture/…) ne sont PAS des clés lues telles quelles
// par les templates ; elles alimentent categoryRatings via `cat`. Les clés canoniques que les
// templates consomment sont les entrées text/list/percent/rich (thcLevel, aromas, effects…).

const REGISTRY = [
    // ── GENERAL ────────────────────────────────────────────────────────────────
    { key: 'title', label: 'Nom', group: 'general', type: 'text', sources: ['holderName', 'nomCommercial', 'nomProduit', 'title', 'name'] },
    { key: 'type', label: 'Type de produit', group: 'general', type: 'text', sources: ['type', 'category'] },
    { key: 'category', label: 'Catégorie', group: 'general', type: 'text', sources: ['concentrateType', 'typeComestible', 'category'] },
    { key: 'description', label: 'Description', group: 'general', type: 'text', sources: ['description'] },
    { key: 'farm', label: 'Ferme', group: 'general', type: 'text', sources: ['farm'], types: ['flower'] },
    { key: 'hashmaker', label: 'Artisan', group: 'general', type: 'text', sources: ['hashmaker', 'fabricant'], types: ['hash', 'concentrate', 'edible'] },
    { key: 'laboratoire', label: 'Laboratoire', group: 'general', type: 'text', sources: ['laboratoire'], types: ['hash', 'concentrate'] },
    { key: 'breeder', label: 'Breeder', group: 'general', type: 'text', sources: ['breeder'] },
    { key: 'cultivar', label: 'Cultivar', group: 'general', type: 'text', sources: ['variety', 'cultivar'] },
    { key: 'cultivarsList', label: 'Cultivars', group: 'general', type: 'list', sources: ['cultivarsList', 'cultivarsUtilises', 'cultivars'] },

    // ── GENETICS ───────────────────────────────────────────────────────────────
    { key: 'strainType', label: 'Type de variété', group: 'genetics', type: 'text', sources: ['varietyType', 'strainType'] },
    { key: 'geneticType', label: 'Génétique', group: 'genetics', type: 'text', sources: ['geneticType'] },
    { key: 'indicaRatio', label: 'Indica', group: 'genetics', type: 'number', unit: '%', sources: ['indicaPercent', 'indicaRatio'] },
    { key: 'sativaPercent', label: 'Sativa', group: 'genetics', type: 'number', unit: '%', sources: ['sativaPercent'] },
    { key: 'parentage', label: 'Généalogie', group: 'genetics', type: 'rich', sources: ['parentage'] },
    { key: 'phenotypeCode', label: 'Phénotype', group: 'genetics', type: 'text', sources: ['phenotypeCode'] },

    // ── CULTURE (Fleur) ─────────────────────────────────────────────────────────
    { key: 'cultureMode', label: 'Mode de culture', group: 'culture', type: 'text', sources: ['cultureMode', 'typeCulture'], types: ['flower'] },
    { key: 'cultureSpaceType', label: 'Espace de culture', group: 'culture', type: 'text', sources: ['cultureSpaceType'], types: ['flower'] },
    { key: 'cultureDuration', label: 'Durée de culture', group: 'culture', type: 'number', unit: 'j', sources: ['cultureDuration'], types: ['flower'] },
    { key: 'cultureSeason', label: 'Saison', group: 'culture', type: 'list', sources: ['cultureSeason'], types: ['flower'] },
    { key: 'cultureStartDate', label: 'Début de culture', group: 'culture', type: 'date', sources: ['cultureStartDate'], types: ['flower'] },
    { key: 'cultureEndDate', label: 'Fin de culture', group: 'culture', type: 'date', sources: ['cultureEndDate'], types: ['flower'] },
    { key: 'substratMix', label: 'Substrat', group: 'culture', type: 'list', sources: ['cultureSubstrat', 'substratMix'], types: ['flower'] },

    // ── HARVEST / RÉCOLTE (Fleur) ────────────────────────────────────────────────
    { key: 'trichomesTranslucides', label: 'Trichomes translucides', group: 'harvest', type: 'number', unit: '%', sources: ['trichomesTranslucides'], types: ['flower'] },
    { key: 'trichomesLaiteux', label: 'Trichomes laiteux', group: 'harvest', type: 'number', unit: '%', sources: ['trichomesLaiteux'], types: ['flower'] },
    { key: 'trichomesAmbres', label: 'Trichomes ambrés', group: 'harvest', type: 'number', unit: '%', sources: ['trichomesAmbres'], types: ['flower'] },
    { key: 'modeRecolte', label: 'Mode de récolte', group: 'harvest', type: 'text', sources: ['modeRecolte'], types: ['flower'] },
    { key: 'poidsBrut', label: 'Poids brut', group: 'harvest', type: 'number', unit: 'g', sources: ['poidsBrut'], types: ['flower'] },
    { key: 'poidsNet', label: 'Poids net', group: 'harvest', type: 'number', unit: 'g', sources: ['poidsNet'], types: ['flower'] },

    // ── ANALYTICS (cannabinoïdes) ─────────────────────────────────────────────────
    { key: 'thcLevel', label: 'THC', group: 'analytics', type: 'percent', unit: '%', ref: 'thc', sources: ['thcPercent', 'thcLevel', 'thc'] },
    { key: 'cbdLevel', label: 'CBD', group: 'analytics', type: 'percent', unit: '%', ref: 'cbd', sources: ['cbdPercent', 'cbdLevel', 'cbd'] },
    { key: 'thcaLevel', label: 'THCA', group: 'analytics', type: 'percent', unit: '%', ref: 'thca', sources: ['thcaPercent'] },
    { key: 'cbdaLevel', label: 'CBDA', group: 'analytics', type: 'percent', unit: '%', ref: 'cbda', sources: ['cbdaPercent'] },
    { key: 'cbgLevel', label: 'CBG', group: 'analytics', type: 'percent', unit: '%', ref: 'cbg', sources: ['cbgPercent', 'cbgLevel'] },
    { key: 'cbcLevel', label: 'CBC', group: 'analytics', type: 'percent', unit: '%', ref: 'cbc', sources: ['cbcPercent', 'cbcLevel'] },
    { key: 'cbnLevel', label: 'CBN', group: 'analytics', type: 'percent', unit: '%', ref: 'cbn', sources: ['cbnPercent', 'cbnLevel'] },
    { key: 'thcvLevel', label: 'THCV', group: 'analytics', type: 'percent', unit: '%', ref: 'thcv', sources: ['thcvPercent', 'thcvLevel'] },
    { key: 'otherCannabinoids', label: 'Autres cannabinoïdes', group: 'analytics', type: 'rich', sources: ['otherCannabinoids'] },
    { key: 'terpenes', label: 'Terpènes', group: 'analytics', type: 'list', sources: ['terpeneProfile', 'terpenes'] },

    // ── LAB / COA ─────────────────────────────────────────────────────────────────
    { key: 'labName', label: 'Laboratoire', group: 'lab', type: 'text', sources: ['labName'] },
    { key: 'labMethod', label: 'Méthode d\'analyse', group: 'lab', type: 'text', sources: ['labMethod'] },
    { key: 'labAccredited', label: 'Laboratoire accrédité', group: 'lab', type: 'bool', sources: ['labAccredited'] },
    { key: 'labAccreditationStandard', label: 'Norme d\'accréditation', group: 'lab', type: 'text', sources: ['labAccreditationStandard'] },
    { key: 'labAnalysisDate', label: 'Date d\'analyse', group: 'lab', type: 'date', sources: ['labAnalysisDate'] },
    { key: 'labReportUrl', label: 'Certificat d\'analyse', group: 'lab', type: 'url', sources: ['labReportUrl'] },
    { key: 'terpeneFileUrl', label: 'Certificat terpènes', group: 'lab', type: 'url', sources: ['terpeneFileUrl'] },

    // ── VISUAL (scores → categoryRatings.visual) ──────────────────────────────────
    { key: 'couleurScore', label: 'Couleur', group: 'visual', type: 'score', cat: 'visual', sources: ['couleurScore', 'couleur'] },
    { key: 'densiteVisuelle', label: 'Densité', group: 'visual', type: 'score', cat: 'visual', sources: ['densiteVisuelle', 'densite'] },
    { key: 'trichomesScore', label: 'Trichomes', group: 'visual', type: 'score', cat: 'visual', sources: ['trichomesScore', 'trichome'] },
    { key: 'pistilsScore', label: 'Pistils', group: 'visual', type: 'score', cat: 'visual', sources: ['pistilsScore', 'pistil'] },
    { key: 'manucureScore', label: 'Manucure', group: 'visual', type: 'score', cat: 'visual', sources: ['manucureScore', 'manucure'] },
    { key: 'moisissureScore', label: 'Absence moisissure', group: 'visual', type: 'score', cat: 'visual', sources: ['moisissureScore', 'moisissure'] },
    { key: 'grainesScore', label: 'Absence graines', group: 'visual', type: 'score', cat: 'visual', sources: ['grainesScore', 'graines'] },
    { key: 'pureteVisuelle', label: 'Pureté visuelle', group: 'visual', type: 'score', cat: 'visual', sources: ['pureteVisuelle'], types: ['hash', 'concentrate'] },
    { key: 'couleurTransparence', label: 'Transparence', group: 'visual', type: 'score', cat: 'visual', sources: ['couleurTransparence', 'transparency'], types: ['hash', 'concentrate'] },
    { key: 'couleurNuancier', label: 'Nuancier de couleur', group: 'visual', type: 'list', sources: ['couleurNuancier'] },

    // ── SMELL / ODEURS ────────────────────────────────────────────────────────────
    { key: 'intensiteAromeScore', label: 'Intensité arôme', group: 'smell', type: 'score', cat: 'smell', sources: ['intensiteAromeScore', 'aromasIntensity', 'intensiteAromatique'] },
    { key: 'complexiteAromeScore', label: 'Complexité arôme', group: 'smell', type: 'score', cat: 'smell', sources: ['complexiteAromeScore', 'complexiteAromas'] },
    { key: 'fideliteAromeScore', label: 'Fidélité au cultivar', group: 'smell', type: 'score', cat: 'smell', sources: ['fideliteAromeScore', 'fideliteCultivars'] },
    { key: 'aromas', label: 'Notes dominantes', group: 'smell', type: 'list', sources: ['notesOdeursDominantes', 'notesDominantes', 'saveursDominantes', 'aromas'] },
    { key: 'secondaryAromas', label: 'Notes secondaires', group: 'smell', type: 'list', sources: ['notesOdeursSecondaires', 'notesSecondaires', 'secondaryAromas'] },

    // ── TEXTURE (scores → categoryRatings.texture) ────────────────────────────────
    { key: 'dureteScore', label: 'Dureté', group: 'texture', type: 'score', cat: 'texture', sources: ['dureteScore', 'durete', 'toucheDensite'] },
    { key: 'densiteTactileScore', label: 'Densité tactile', group: 'texture', type: 'score', cat: 'texture', sources: ['densiteTactileScore', 'densiteTexture'] },
    { key: 'elasticiteScore', label: 'Élasticité', group: 'texture', type: 'score', cat: 'texture', sources: ['elasticiteScore', 'elasticite', 'toucheElasticite'] },
    { key: 'collantScore', label: 'Collant', group: 'texture', type: 'score', cat: 'texture', sources: ['collantScore', 'collant', 'toucheCollant'] },
    { key: 'malleabiliteScore', label: 'Malléabilité', group: 'texture', type: 'score', cat: 'texture', sources: ['malleabiliteScore', 'toucheMalleabilite'] },
    { key: 'friabiliteScore', label: 'Friabilité', group: 'texture', type: 'score', cat: 'texture', sources: ['friabiliteScore', 'friabilite', 'toucheFriabilite'] },
    { key: 'viscositeScore', label: 'Viscosité', group: 'texture', type: 'score', cat: 'texture', sources: ['viscositeScore', 'toucheViscosite'] },
    { key: 'meltingScore', label: 'Melting', group: 'texture', type: 'score', cat: 'texture', sources: ['meltingScore', 'textureMeltingScore', 'melting'] },
    { key: 'residuScore', label: 'Résidus', group: 'texture', type: 'score', cat: 'texture', sources: ['residuScore', 'textureResiduScore', 'residus'] },

    // ── TASTE / GOÛTS ─────────────────────────────────────────────────────────────
    { key: 'intensiteGoutScore', label: 'Intensité goût', group: 'taste', type: 'score', cat: 'taste', sources: ['intensiteGoutScore', 'intensiteFumee', 'tastesIntensity', 'goutIntensity', 'intensite'] },
    { key: 'agressiviteScore', label: 'Agressivité', group: 'taste', type: 'score', cat: 'taste', sources: ['agressiviteScore', 'agressivite', 'agressivitePiquant'] },
    { key: 'dryPuffNotes', label: 'Dry puff', group: 'taste', type: 'list', sources: ['dryPuffNotes', 'dryPuff'] },
    { key: 'inhalationNotes', label: 'Inhalation', group: 'taste', type: 'list', sources: ['inhalationNotes', 'inhalation'] },
    { key: 'exhalationNotes', label: 'Expiration', group: 'taste', type: 'list', sources: ['expirationNotes', 'exhalationNotes', 'expiration'] },

    // ── EFFECTS / EFFETS ──────────────────────────────────────────────────────────
    { key: 'monteeScore', label: 'Montée', group: 'effects', type: 'score', cat: 'effects', sources: ['monteeScore', 'montee'] },
    { key: 'intensiteEffetScore', label: 'Intensité effet', group: 'effects', type: 'score', cat: 'effects', sources: ['intensiteEffetScore', 'intensiteEffet', 'effectsIntensity', 'intensiteEffets'] },
    { key: 'effects', label: 'Effets ressentis', group: 'effects', type: 'list', sources: ['effetsChoisis', 'effects'] },
    { key: 'dureeEffet', label: 'Durée des effets', group: 'effects', type: 'text', sources: ['dureeEffets', 'effectDuration', 'effectLength', 'dureeEffet'] },

    // ── USAGE (jamais rendu auparavant) ───────────────────────────────────────────
    { key: 'consumptionMethod', label: 'Mode de consommation', group: 'usage', type: 'text', sources: ['consumptionMethod', 'methodeConsommation'] },
    { key: 'dosage', label: 'Dosage', group: 'usage', type: 'number', sources: ['dosage', 'dosageUtilise'] },
    { key: 'dosageUnit', label: 'Unité de dosage', group: 'usage', type: 'text', sources: ['dosageUnit'] },
    { key: 'effectOnset', label: 'Déclenchement', group: 'usage', type: 'text', sources: ['effectOnset'] },
    { key: 'effectProfiles', label: 'Profils d\'effet', group: 'usage', type: 'list', sources: ['effectProfiles'] },
    { key: 'sideEffects', label: 'Effets secondaires', group: 'usage', type: 'list', sources: ['sideEffects'] },
    { key: 'preferredUse', label: 'Usage recommandé', group: 'usage', type: 'list', sources: ['preferredUse'] },
    { key: 'foodIntakeStatus', label: 'Estomac', group: 'usage', type: 'text', sources: ['foodIntakeStatus'], types: ['edible'] },

    // ── SEPARATION (Hash) ─────────────────────────────────────────────────────────
    { key: 'methodeSeparation', label: 'Méthode de séparation', group: 'separation', type: 'text', sources: ['methodeSeparation'], types: ['hash'] },
    { key: 'nombrePasses', label: 'Nombre de passes', group: 'separation', type: 'number', sources: ['nombrePasses'], types: ['hash'] },
    { key: 'temperatureEau', label: 'Température de l\'eau', group: 'separation', type: 'number', unit: '°C', sources: ['temperatureEau'], types: ['hash'] },
    { key: 'tailleMailles', label: 'Taille des mailles', group: 'separation', type: 'text', unit: 'µ', sources: ['tailleMailles'], types: ['hash'] },
    { key: 'typeMatierePremiere', label: 'Matière première', group: 'separation', type: 'text', sources: ['typeMatierePremiere'], types: ['hash'] },
    { key: 'rendementEstime', label: 'Rendement estimé', group: 'separation', type: 'number', unit: '%', sources: ['rendementEstime'], types: ['hash'] },

    // ── EXTRACTION (Concentré) ────────────────────────────────────────────────────
    { key: 'methodeExtraction', label: 'Méthode d\'extraction', group: 'extraction', type: 'text', sources: ['methodeExtraction'], types: ['concentrate'] },

    // ── RECIPE (Comestible) ───────────────────────────────────────────────────────
    { key: 'ingredients', label: 'Ingrédients', group: 'recipe', type: 'json', sources: ['ingredients'], types: ['edible'] },
    { key: 'etapesPreparation', label: 'Étapes de préparation', group: 'recipe', type: 'json', sources: ['etapesPreparation'], types: ['edible'] },

    // ── TRACEABILITY ──────────────────────────────────────────────────────────────
    { key: 'sourceLineage', label: 'Lignée source', group: 'traceability', type: 'json', sources: ['sourceLineage'], types: ['hash', 'concentrate', 'edible'] },
    { key: 'producerVerified', label: 'Producteur vérifié', group: 'traceability', type: 'bool', sources: ['producerVerified'] },
    { key: 'producerBusinessType', label: 'Type d\'établissement', group: 'traceability', type: 'text', sources: ['producerBusinessType'] },
];

/**
 * Retourne les entrées de registre applicables à un type de produit donné.
 * @param {string} productType - type hétérogène, normalisé en interne
 * @returns {Array} entrées applicables
 */
export function getFieldRegistry(productType) {
    const t = normalizeProductType(productType);
    return REGISTRY.filter((f) => !f.types || f.types.includes(t));
}

/** Toutes les entrées, tous types confondus. */
export function getAllFields() {
    return REGISTRY;
}

/** Entrées d'un groupe pour un type de produit. */
export function getFieldsByGroup(group, productType) {
    return getFieldRegistry(productType).filter((f) => f.group === group);
}

export default {
    PRODUCT_TYPES,
    CATEGORY_KEYS,
    GROUPS,
    normalizeProductType,
    getFieldRegistry,
    getAllFields,
    getFieldsByGroup,
};
