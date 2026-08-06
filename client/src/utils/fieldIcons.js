/**
 * Base d'icônes — une icône pour (presque) toute donnée du produit.
 *
 * POURQUOI UNE SEULE TABLE. Les icônes étaient jusqu'ici éparpillées dans au moins quatre endroits
 * (`PIPELINE_FIELD_ICONS`, `GISEMENT_ICONS`, les icônes de `TIMELINE_PIPELINES`, celles des tables
 * d'arômes/effets), chacun ne couvrant que son propre périmètre. Résultat : le même champ pouvait
 * apparaître avec une icône ici et sans icône là. Ce repo a déjà payé sept fois le prix d'un
 * vocabulaire réinventé à côté de celui qui existait — cette table est la réponse : un seul endroit
 * à consulter, un seul endroit à compléter.
 *
 * PORTÉE. Les clés proviennent de `fieldRegistry.js` (les 108 champs curés) et des clés de champ de
 * pipeline réellement enregistrées par les formulaires. Aucune n'est inventée : elles ont été
 * extraites du code, pas devinées.
 *
 * COMPLÉTER. Ajouter une entrée ici suffit — tous les rendus la reprennent. Un champ inconnu retombe
 * sur l'icône de son GROUPE, et à défaut sur un puce neutre : une donnée nouvelle n'est jamais sans
 * icône, elle a juste une icône générique en attendant qu'on la précise.
 */

/** Icônes par TYPE DE PRODUIT — la base, comme demandé. */
export const PRODUCT_TYPE_ICONS = {
    Fleurs: '🌸', Fleur: '🌸', flower: '🌸',
    Hash: '🟫', hash: '🟫',
    Concentré: '🍯', Concentre: '🍯', concentrate: '🍯',
    Comestible: '🍪', edible: '🍪',
};

/** Icônes par GROUPE — le repli quand un champ précis n'a pas la sienne. */
export const GROUP_ICONS = {
    presentation: '🖼️', general: 'ℹ️', genetics: '🧬', culture: '🌱', harvest: '🌾',
    analytics: '🧪', lab: '🔬', visual: '👁️', smell: '👃', texture: '✋', taste: '👅',
    effects: '⚡', usage: '💨', separation: '🧊', extraction: '⚗️', purification: '💧',
    recipe: '🍯', traceability: '🔗', overflow: '➕',
};

/**
 * Icônes par CLÉ DE CHAMP. Clés issues de `fieldRegistry.js` et des formulaires de pipeline.
 * Une icône répétée entre champs voisins est volontaire : mieux vaut une famille visuelle
 * cohérente qu'une icône unique et absconse pour chaque nuance.
 */
export const FIELD_ICONS = {
    // ── Présentation ────────────────────────────────────────────────────────────
    mainImage: '📸', rating: '⭐', categoryRatings: '📊', author: '✍️', date: '📅',
    phenoHuntView: '🧬', productionChainView: '⚙️', pipelineInteractiveView: '📈',
    pipelineDetailGrids: '🗓️',

    // ── Général ─────────────────────────────────────────────────────────────────
    title: '🏷️', type: '📦', category: '🗂️', description: '💬',
    farm: '🚜', hashmaker: '🧑‍🏭', laboratoire: '🔬', breeder: '🌱',
    cultivar: '🌿', cultivarsList: '🌿',

    // ── Génétique ───────────────────────────────────────────────────────────────
    strainType: '🧬', geneticType: '🧬', indicaRatio: '🌙', sativaPercent: '☀️',
    parentage: '🌳', phenotypeCode: '🔖',

    // ── Culture ─────────────────────────────────────────────────────────────────
    cultureMode: '🌱', cultureSpaceType: '🏠', cultureDuration: '⏳', cultureSeason: '🗓️',
    cultureStartDate: '▶️', cultureEndDate: '⏹️', substratMix: '🪴',

    // ── Récolte ─────────────────────────────────────────────────────────────────
    trichomesTranslucides: '💎', trichomesLaiteux: '🤍', trichomesAmbres: '🟠',
    modeRecolte: '✂️', poidsBrut: '⚖️', poidsNet: '⚖️',

    // ── Analytique / cannabinoïdes ──────────────────────────────────────────────
    thcLevel: '🔥', cbdLevel: '🌿', thcaLevel: '🔥', cbdaLevel: '🌿',
    cbgLevel: '🧪', cbcLevel: '🧪', cbnLevel: '😴', thcvLevel: '🧪',
    otherCannabinoids: '🧪', terpenes: '🌡️',

    // ── Laboratoire ─────────────────────────────────────────────────────────────
    labName: '🔬', labAccredited: '✅', terpeneFileUrl: '📄', labReportUrl: '📄',
    labMethod: '⚙️',

    // ── Visuel ──────────────────────────────────────────────────────────────────
    couleurScore: '🎨', densiteVisuelle: '🧱', trichomesScore: '💎', pistilsScore: '🌾',
    manucureScore: '✂️', moisissureScore: '🍄', grainesScore: '🌰',
    pureteVisuelle: '💠', couleurTransparence: '🔎', couleurNuancier: '🎨',

    // ── Odeur ───────────────────────────────────────────────────────────────────
    intensiteAromeScore: '👃', complexiteAromeScore: '🌀', fideliteAromeScore: '🎯',
    aromas: '🌸', secondaryAromas: '🌼',

    // ── Texture ─────────────────────────────────────────────────────────────────
    dureteScore: '🪨', densiteTactileScore: '🧱', elasticiteScore: '🩹', collantScore: '🍯',
    malleabiliteScore: '🖐️', friabiliteScore: '🥠', viscositeScore: '🫗',
    meltingScore: '🫠', residuScore: '🧯',

    // ── Goût ────────────────────────────────────────────────────────────────────
    intensiteGoutScore: '👅', agressiviteScore: '🌶️',
    dryPuffNotes: '🌬️', inhalationNotes: '💨', exhalationNotes: '🌫️',

    // ── Effets ──────────────────────────────────────────────────────────────────
    monteeScore: '🚀', intensiteEffetScore: '⚡', effects: '✨', dureeEffet: '⏱️',

    // ── Usage ───────────────────────────────────────────────────────────────────
    consumptionMethod: '💨', dosage: '⚖️', dosageUnit: '📏', effectOnset: '⏱️',
    sideEffects: '⚠️', preferredUse: '🕰️', foodIntakeStatus: '🍽️',

    // ── Séparation ──────────────────────────────────────────────────────────────
    methodeSeparation: '🧊', nombrePasses: '🔁', tailleMailles: '🕸️',
    typeMatierePremiere: '🌿', rendementEstime: '📉',

    // ── Extraction / purification ───────────────────────────────────────────────
    methodeExtraction: '⚗️', pression: '🗜️', solvant: '🧴', purge: '🌬️',

    // ── Recette ─────────────────────────────────────────────────────────────────
    ingredients: '🥣', etapesPreparation: '📋', servings: '🍽️', finalWeight: '⚖️',

    // ── Traçabilité ─────────────────────────────────────────────────────────────
    sourceLineage: '🔗', producerVerified: '✅', lotCode: '🏷️',

    // ── Curing ──────────────────────────────────────────────────────────────────
    curingType: '🫙', curingTemperature: '🌡️', curingHumidity: '💧', curingDuration: '⏳',

    // ── Champs de PIPELINE (absorbe l'ancienne PIPELINE_FIELD_ICONS) ────────────
    // Y compris les grandeurs « farfelues » explicitement demandées : VPD, PPFD, EC…
    temperature: '🌡️', temp: '🌡️', temperatureDay: '🌡️', temperatureNight: '🌡️',
    temperatureEau: '🌡️', tempEau: '🌡️',
    humidity: '💧', ambientHumidity: '💧', humidityDay: '💧', humidityNight: '💧',
    humidite: '💧', hr: '💧',
    co2: '☁️', co2Ppm: '☁️', co2Level: '☁️', enrichissementCo2: '☁️',
    vpd: '💨', vaporPressureDeficit: '💨',
    ppfd: '☀️', dli: '🔆', lightType: '💡', photoperiode: '🕐', photoperiod: '🕐',
    ph: '⚗️', ec: '⚡', conductivite: '⚡', tds: '⚡',
    container: '🫙', recipient: '🫙', packaging: '📦', emballage: '📦',
    action: '⚡', event: '⚡', evenement: '⚡',
    method: '⚙️', methode: '⚙️', spaceType: '🏠', seedType: '🌱',
    arrosage: '🚿', irrigation: '🚿', volumeEau: '🚿',
    engrais: '🧪', fertilisation: '🧪', nutriments: '🧪',
    taille: '✂️', defoliation: '🍃', palissage: '🪢',
    note: '📝', comment: '📝', commentaire: '📝', notes: '📝',

    // ── Clés récupérées de la table locale de `PipelineGridView` (la 5e), absorbée le 2026-08-06.
    //    Elles n'existaient QUE là : les perdre en centralisant aurait dégradé la grille.
    ventilation: '🌀', light: '💡', lightHours: '💡', lightPower: '⚡', lightDistance: '📏',
    irrigationType: '🚿', waterVolume: '🚿',
    fertilizer: '🧪', fertilizerType: '🧪', fertilizationFrequency: '🧪',
    training: '✂️', trainingMethod: '✂️', trainingLST: '✂️', trainingHST: '✂️',
    morphology: '📏', plantHeight: '📏', plantVolume: '📊',
    harvest: '⚖️', harvestDate: '📅', containerType: '📦',
    propagationMethod: '🌱', substrateType: '🏔️', substrateVolume: '🏔️', potVolume: '🪴',
};

/**
 * Icône d'un champ.
 *
 * Ordre de résolution : clé exacte → clé insensible à la casse → icône du groupe → puce neutre.
 * Ne retourne jamais une chaîne vide : une donnée sans icône dédiée reste identifiable.
 *
 * @param {string} key    clé du champ (vocabulaire `fieldRegistry.js` / formulaires)
 * @param {string} [group] groupe du registre, utilisé en repli
 */
export function getFieldIcon(key, group) {
    if (!key) return GROUP_ICONS[group] || '•';
    if (FIELD_ICONS[key]) return FIELD_ICONS[key];
    const lower = String(key).toLowerCase();
    const hit = Object.keys(FIELD_ICONS).find((k) => k.toLowerCase() === lower);
    if (hit) return FIELD_ICONS[hit];
    return GROUP_ICONS[group] || '•';
}

/** Icône d'un type de produit, tolérante aux trois formes de `type` qui coexistent en base. */
export function getProductIcon(type) {
    if (!type) return '📦';
    return PRODUCT_TYPE_ICONS[type]
        || PRODUCT_TYPE_ICONS[String(type).toLowerCase()]
        || '📦';
}
