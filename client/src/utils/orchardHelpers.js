/**
 * Orchard Helpers - Utilitaires centralisés pour le système Orchard Studio
 * Ces fonctions sont partagées entre tous les templates et renderers
 */

/**
 * Parse une valeur JSON de manière sécurisée
 * @param {*} value - Valeur à parser (string JSON, object, ou autre)
 * @param {*} fallback - Valeur par défaut si le parsing échoue
 * @returns {*} Valeur parsée ou fallback
 */
export function safeParse(value, fallback = null) {
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }
    return value;
}

/**
 * Convertit une valeur en tableau
 * @param {*} value - Valeur à convertir
 * @returns {Array} Tableau résultant
 */
export function asArray(value) {
    const parsed = safeParse(value, []);
    if (Array.isArray(parsed)) return parsed;
    if (parsed === null || parsed === undefined) return [];
    if (typeof parsed === 'string') return parsed.split(',').map(s => s.trim()).filter(Boolean);
    if (typeof parsed === 'object') return Object.values(parsed);
    return [parsed];
}

/**
 * Convertit une valeur en objet
 * @param {*} value - Valeur à convertir
 * @returns {Object} Objet résultant
 */
export function asObject(value) {
    const parsed = safeParse(value, {});
    if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) return parsed;
    return {};
}

/**
 * Extrait un label lisible depuis un objet ou une chaîne
 * @param {*} item - Élément à traiter
 * @param {string[]} keys - Clés à chercher dans l'ordre de priorité
 * @returns {string} Label extrait
 */
export function extractLabel(item, keys = ['name', 'label', 'cultivar', 'method', 'commercialName']) {
    if (typeof item === 'string') return item;
    if (typeof item !== 'object' || item === null) return String(item);

    for (const key of keys) {
        if (item[key] !== undefined && item[key] !== null) {
            return String(item[key]);
        }
    }

    // Fallback: première valeur string trouvée
    for (const val of Object.values(item)) {
        if (typeof val === 'string') return val;
    }

    return JSON.stringify(item);
}

/**
 * Formate une note sur 10 avec étoiles
 * @param {number} rating - Note sur 10
 * @param {number} maxStars - Nombre d'étoiles maximum
 * @returns {Object} { filled, empty, value }
 */
export function formatRating(rating, maxStars = 5) {
    const value = parseFloat(rating) || 0;
    const normalized = value / 10 * maxStars; // Convertit /10 en /maxStars
    const filled = Math.round(normalized);
    const empty = maxStars - filled;
    return { filled, empty, value, normalized };
}

/**
 * Formate une date en français
 * @param {string|Date} date - Date à formater
 * @param {Object} options - Options Intl.DateTimeFormat
 * @returns {string} Date formatée
 */
export function formatDate(date, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
    if (!date) return '';
    try {
        return new Date(date).toLocaleDateString('fr-FR', options);
    } catch {
        return String(date);
    }
}

/**
 * Génère une couleur avec opacité
 * @param {string} color - Couleur hex
 * @param {number} opacity - Opacité (0-100)
 * @returns {string} Couleur avec opacité
 */
export function colorWithOpacity(color, opacity) {
    if (!color) return 'transparent';
    const hex = Math.round((opacity / 100) * 255).toString(16).padStart(2, '0');
    return `${color}${hex}`;
}

/**
 * Détermine si une couleur est claire ou foncée
 * @param {string} hexColor - Couleur hex
 * @returns {boolean} true si la couleur est claire
 */
export function isLightColor(hexColor) {
    if (!hexColor) return true;
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}

/**
 * Extrait les données de categoryRatings
 * Gère deux formats possibles:
 * 1. Valeurs directes: { visual: 7.5, smell: 8 }
 * 2. Sous-objets: { visual: { densite: 6.5, trichome: 5.5 }, smell: { aromasIntensity: 8 } }
 * @param {*} categoryRatings - Données des notes par catégorie
 * @returns {Array} Liste des notes formatées
 */
export function extractCategoryRatings(categoryRatings) {
    const ratings = asObject(categoryRatings);
    const result = [];

    const categories = [
        { key: 'visual', label: 'Visuel', icon: '👁️' },
        { key: 'smell', label: 'Odeur', icon: '👃' },
        { key: 'texture', label: 'Texture', icon: '✋' },
        { key: 'taste', label: 'Goût', icon: '👅' },
        { key: 'effects', label: 'Effets', icon: '⚡' },
        { key: 'overall', label: 'Global', icon: '⭐' },
    ];

    for (const cat of categories) {
        const catValue = ratings[cat.key];
        
        if (catValue === undefined || catValue === null) continue;
        
        let value;
        
        // Si c'est un nombre directement
        if (typeof catValue === 'number') {
            value = catValue;
        }
        // Si c'est une chaîne numérique
        else if (typeof catValue === 'string' && !isNaN(parseFloat(catValue))) {
            value = parseFloat(catValue);
        }
        // Si c'est un objet avec des sous-champs (calcul de la moyenne)
        else if (typeof catValue === 'object' && catValue !== null) {
            const subValues = Object.values(catValue)
                .filter(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))))
                .map(v => parseFloat(v));
            
            if (subValues.length > 0) {
                value = subValues.reduce((sum, v) => sum + v, 0) / subValues.length;
            } else {
                continue; // Pas de valeurs numériques dans le sous-objet
            }
        }
        else {
            continue; // Format non reconnu
        }

        // Ne pas inclure 'overall' dans les affichages de catégories individuelles
        if (cat.key !== 'overall' || value > 0) {
            result.push({
                ...cat,
                value: Math.round(value * 10) / 10 // Arrondi à 1 décimale
            });
        }
    }

    return result;
}

/**
 * Extrait les données extraData avec labels français
 * @param {*} extraData - Données extra
 * @returns {Array} Liste des données formatées
 */
export function extractExtraData(extraData) {
    const extra = asObject(extraData);

    const fieldDefs = [
        { key: 'typeCulture', label: 'Type de culture', icon: '🌿', category: 'culture' },
        { key: 'spectre', label: 'Spectre lumineux', icon: '🌈', category: 'culture' },
        { key: 'techniquesPropagation', label: 'Propagation', icon: '🌱', category: 'culture' },
        { key: 'densite', label: 'Densité', icon: '📊', category: 'visual' },
        { key: 'trichome', label: 'Trichomes', icon: '✨', category: 'visual' },
        { key: 'pistil', label: 'Pistils', icon: '🌺', category: 'visual' },
        { key: 'manucure', label: 'Manucure', icon: '✂️', category: 'visual' },
        { key: 'moisissure', label: 'Moisissure', icon: '🔬', category: 'quality' },
        { key: 'graines', label: 'Graines', icon: '🫘', category: 'quality' },
        { key: 'durete', label: 'Dureté', icon: '💎', category: 'texture' },
        { key: 'elasticite', label: 'Élasticité', icon: '🔄', category: 'texture' },
        { key: 'collant', label: 'Collant', icon: '🍯', category: 'texture' },
        { key: 'intensiteFumee', label: 'Intensité fumée', icon: '💨', category: 'smoke' },
        { key: 'agressivite', label: 'Agressivité', icon: '🔥', category: 'smoke' },
        { key: 'cendre', label: 'Cendre', icon: '⚪', category: 'smoke' },
        { key: 'montee', label: 'Montée', icon: '📈', category: 'effects' },
        { key: 'intensiteEffet', label: 'Intensité effets', icon: '⚡', category: 'effects' },
        { key: 'aromasIntensity', label: 'Intensité arômes', icon: '🌸', category: 'sensory' },
        { key: 'notesDominantesOdeur', label: 'Notes dominantes', icon: '🎵', category: 'sensory' },
        { key: 'notesSecondairesOdeur', label: 'Notes secondaires', icon: '🎶', category: 'sensory' },
        { key: 'purgevide', label: 'Purge vide', icon: '🫧', category: 'process' },
    ];

    return fieldDefs
        .filter(({ key }) => extra[key] !== undefined && extra[key] !== null && extra[key] !== '')
        .map(({ key, label, icon, category }) => ({
            key,
            label,
            icon,
            category,
            value: extra[key]
        }));
}

/**
 * Extrait les pipelines depuis les données de review
 * @param {Object} reviewData - Données de la review
 * @returns {Array} Liste des pipelines
 */
export function extractPipelines(reviewData) {
    const pipelines = [];

    const pipelineTypes = [
        { key: 'pipelineExtraction', name: 'Extraction', icon: '⚗️' },
        { key: 'pipelineSeparation', name: 'Séparation', icon: '🔬' },
        { key: 'pipelinePurification', name: 'Purification', icon: '✨' },
        { key: 'fertilizationPipeline', name: 'Fertilisation', icon: '🌱' },
    ];

    for (const { key, name, icon } of pipelineTypes) {
        const data = asArray(reviewData[key]);
        if (data.length > 0) {
            pipelines.push({
                key,
                name,
                icon,
                steps: data.map(step => extractLabel(step))
            });
        }
    }

    return pipelines;
}

/**
 * Extrait les données du substrat
 * @param {*} substratMix - Données du substrat
 * @returns {Array} Liste des composants du substrat
 */
export function extractSubstrat(substratMix) {
    const substrat = asArray(substratMix);
    return substrat.map(s => {
        if (typeof s === 'string') return { name: s, percentage: null };
        return {
            name: s.substrat || s.component || s.name || 'Substrat',
            percentage: s.percentage || s.percent || null
        };
    });
}

/**
 * Dimensions par ratio
 */
export const RATIO_DIMENSIONS = {
    '1:1': { width: 1080, height: 1080, label: 'Carré (1:1)' },
    '16:9': { width: 1920, height: 1080, label: 'Paysage (16:9)' },
    '9:16': { width: 1080, height: 1920, label: 'Portrait (9:16)' },
    '4:3': { width: 1440, height: 1080, label: 'Standard (4:3)' },
    'A4': { width: 2480, height: 3508, label: 'A4 (Document)' },
};

/**
 * Calcule les dimensions du canvas
 * @param {string} ratio - Ratio sélectionné
 * @param {number} scale - Facteur d'échelle (0-1)
 * @returns {Object} { width, height, cssWidth, cssHeight }
 */
export function calculateDimensions(ratio, scale = 0.5) {
    const dims = RATIO_DIMENSIONS[ratio] || RATIO_DIMENSIONS['1:1'];
    return {
        width: dims.width,
        height: dims.height,
        cssWidth: dims.width * scale,
        cssHeight: dims.height * scale,
        label: dims.label
    };
}

/**
 * Types de produits avec leurs champs spécifiques
 */
export const PRODUCT_TYPES = {
    'Fleur': {
        icon: '🌸',
        fields: ['cultivar', 'breeder', 'farm', 'strainType', 'indicaRatio', 'thcLevel', 'cbdLevel', 'terpenes', 'aromas', 'effects']
    },
    'Concentré': {
        icon: '💎',
        fields: ['cultivar', 'hashmaker', 'pipelineExtraction', 'pipelineSeparation', 'pipelinePurification', 'thcLevel', 'terpenes', 'aromas', 'effects']
    },
    'Hash': {
        icon: '🟤',
        fields: ['cultivar', 'hashmaker', 'pipelineExtraction', 'thcLevel', 'aromas', 'effects', 'texture']
    },
    'Edible': {
        icon: '🍬',
        fields: ['thcLevel', 'cbdLevel', 'dureeEffet', 'effects', 'tastes']
    },
    'Vape': {
        icon: '💨',
        fields: ['cultivar', 'thcLevel', 'cbdLevel', 'terpenes', 'aromas', 'effects']
    },
    'Topical': {
        icon: '🧴',
        fields: ['cbdLevel', 'effects', 'ingredients']
    },
};

/**
 * Vérifie si un champ est pertinent pour un type de produit
 * @param {string} type - Type de produit
 * @param {string} field - Nom du champ
 * @returns {boolean}
 */
export function isFieldRelevant(type, field) {
    const productType = PRODUCT_TYPES[type];
    if (!productType) return true; // Par défaut, afficher tout
    return productType.fields.includes(field);
}

export default {
    safeParse,
    asArray,
    asObject,
    extractLabel,
    formatRating,
    formatDate,
    colorWithOpacity,
    isLightColor,
    extractCategoryRatings,
    extractExtraData,
    extractPipelines,
    extractSubstrat,
    RATIO_DIMENSIONS,
    calculateDimensions,
    PRODUCT_TYPES,
    isFieldRelevant,
};
