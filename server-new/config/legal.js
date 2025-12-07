/**
 * Configuration légale pour la conformité RDR et vérification d'âge
 */

// Pays où le cannabis est légal avec restrictions d'âge
const LEGAL_COUNTRIES = [
    'CA', // Canada - 18+ (19+ selon provinces)
    'US', // États-Unis - 21+ (États légaux uniquement)
    'UY', // Uruguay - 18+
    'MX', // Mexique - 18+
    'NL', // Pays-Bas - 18+
    'ES', // Espagne - 18+
    'PT', // Portugal - 18+
    'DE', // Allemagne - 18+ (usage médical)
    'CH', // Suisse - 18+
    'LU', // Luxembourg - 18+
    'MT', // Malte - 18+
    'IL', // Israël - 18+ (médical)
    'TH', // Thaïlande - 20+ (médical)
    'AU', // Australie - 18+ (médical, selon états)
    'NZ', // Nouvelle-Zélande - 18+ (médical)
    'ZA', // Afrique du Sud - 18+
];

// États US où le cannabis récréatif est légal (21+)
const US_LEGAL_STATES_21 = [
    'AK', // Alaska
    'AZ', // Arizona
    'CA', // Californie
    'CO', // Colorado
    'CT', // Connecticut
    'DE', // Delaware
    'IL', // Illinois
    'ME', // Maine
    'MD', // Maryland
    'MA', // Massachusetts
    'MI', // Michigan
    'MN', // Minnesota
    'MO', // Missouri
    'MT', // Montana
    'NJ', // New Jersey
    'NM', // Nouveau-Mexique
    'NV', // Nevada
    'NY', // New York
    'OH', // Ohio
    'OR', // Oregon
    'RI', // Rhode Island
    'VT', // Vermont
    'VA', // Virginie
    'WA', // Washington
];

// Provinces canadiennes avec âge 19+ (autres sont 18+)
const CA_PROVINCES_19 = [
    'AB', // Alberta
    'BC', // Colombie-Britannique
    'MB', // Manitoba
    'NB', // Nouveau-Brunswick
    'NL', // Terre-Neuve
    'NS', // Nouvelle-Écosse
    'NT', // Territoires du Nord-Ouest
    'NU', // Nunavut
    'ON', // Ontario
    'PE', // Île-du-Prince-Édouard
    'SK', // Saskatchewan
    'YT', // Yukon
];

/**
 * Calcule si l'utilisateur a l'âge légal selon son pays et région
 * @param {Date} birthdate - Date de naissance
 * @param {string} country - Code pays ISO 2 lettres
 * @param {string|null} region - Code région/état (US states, CA provinces)
 * @returns {boolean} true si l'utilisateur a l'âge légal
 */
function calculateLegalAge(birthdate, country, region = null) {
    if (!birthdate || !country) return false;

    const birth = new Date(birthdate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    // Ajustement si l'anniversaire n'est pas encore passé cette année
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    // Pays non légal
    if (!LEGAL_COUNTRIES.includes(country.toUpperCase())) {
        return false;
    }

    // États-Unis : 21+ dans états légaux uniquement
    if (country.toUpperCase() === 'US') {
        if (!region || !US_LEGAL_STATES_21.includes(region.toUpperCase())) {
            return false;
        }
        return actualAge >= 21;
    }

    // Canada : 19+ dans certaines provinces, 18+ ailleurs
    if (country.toUpperCase() === 'CA') {
        if (region && CA_PROVINCES_19.includes(region.toUpperCase())) {
            return actualAge >= 19;
        }
        return actualAge >= 18;
    }

    // Thaïlande : 20+
    if (country.toUpperCase() === 'TH') {
        return actualAge >= 20;
    }

    // Autres pays : 18+
    return actualAge >= 18;
}

/**
 * Vérifie si un pays autorise l'accès à la plateforme
 * @param {string} country - Code pays ISO 2 lettres
 * @returns {boolean}
 */
function isCountryAllowed(country) {
    return LEGAL_COUNTRIES.includes(country.toUpperCase());
}

/**
 * Obtient l'âge minimum requis pour un pays/région
 * @param {string} country - Code pays ISO 2 lettres
 * @param {string|null} region - Code région/état
 * @returns {number} Âge minimum requis
 */
function getMinimumAge(country, region = null) {
    if (country.toUpperCase() === 'US') return 21;
    if (country.toUpperCase() === 'TH') return 20;
    if (country.toUpperCase() === 'CA' && region && CA_PROVINCES_19.includes(region.toUpperCase())) {
        return 19;
    }
    return 18;
}

export {
    LEGAL_COUNTRIES,
    US_LEGAL_STATES_21,
    CA_PROVINCES_19,
    calculateLegalAge,
    isCountryAllowed,
    getMinimumAge,
};
