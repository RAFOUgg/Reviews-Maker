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
 * ⚠️ FONCTION DÉPRÉCIÉE - Retourne des couleurs SOLIDES au lieu de transparentes
 * Les transparences rgba() sont ILLISIBLES sur fonds clairs
 * 
 * Mapping: opacity -> couleur solide CSS variable
 * @param {string} color - Couleur hex (ignorée, utilise CSS variables)
 * @param {number} opacity - Opacité (0-100) → mappée sur des couleurs solides
 * @returns {string} Couleur CSS variable SANS transparence
 * 
 * @deprecated Utilisez directement les CSS variables (colors.bgSurface, colors.bgSecondary, etc.)
 */
export function colorWithOpacity(color, opacity) {
    // Transparences légères (5-10%) → bg-surface (très clair)
    if (opacity <= 10) return 'var(--bg-surface)';

    // Transparences moyennes (15-20%) → bg-secondary (clair)
    if (opacity <= 20) return 'var(--bg-secondary)';

    // Transparences fortes (30%+) → bg-tertiary (moyen)
    if (opacity <= 40) return 'var(--bg-tertiary)';

    // Très fortes (50%+) → accent ou primary
    return 'var(--bg-tertiary)';

    // ⛔ ANCIEN CODE (créait des transparences invisibles):
    // const hex = Math.round((opacity / 100) * 255).toString(16).padStart(2, '0');
    // return `${color}${hex}`;
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
 * Gère plusieurs formats possibles:
 * 1. Valeurs directes: { visual: 7.5, smell: 8 }
 * 2. Sous-objets: { visual: { densite: 6.5, trichome: 5.5 }, smell: { aromasIntensity: 8 } }
 * 3. Données imbriquées dans extraData
 * 4. Champs plats dans extraData: { densite: "6.5", trichome: "5.5", ... }
 * @param {*} categoryRatings - Données des notes par catégorie
 * @param {Object} reviewData - Données complètes de la review (optionnel)
 * @returns {Array} Liste des notes formatées
 */
export function extractCategoryRatings(categoryRatings, reviewData = null) {
    try {
        let ratings = asObject(categoryRatings);
        const result = [];

        // Définition des champs par catégorie pour reconstruction
        const categoryFields = {
            visual: {
                fields: [
                    // Actual form field names (from normalizeByType section merge)
                    'colorRating', 'transparency', 'density', 'trichomes', 'mold', 'seeds',
                    // Legacy flat names
                    'densiteVisuelle', 'trichome', 'pistil', 'manucure', 'moisissure', 'graines',
                    'couleur', 'pureteVisuelle', 'viscosite', 'melting', 'residus', 'couleurTransparence'
                ],
                labels: {
                    // Actual form field labels
                    colorRating: 'Couleur / Nuancier', transparency: 'Transparence',
                    density: 'Densité visuelle', trichomes: 'Trichomes',
                    mold: 'Moisissures', seeds: 'Graines',
                    // Legacy
                    densiteVisuelle: 'Densité visuelle', trichome: 'Trichomes', pistil: 'Pistils', manucure: 'Manucure',
                    moisissure: 'Moisissure', graines: 'Graines', couleur: 'Couleur', pureteVisuelle: 'Pureté',
                    viscosite: 'Viscosité', melting: 'Melting', residus: 'Résidus', couleurTransparence: 'Couleur/transparence'
                }
            },
            smell: {
                fields: [
                    'aromasIntensity', 'complexiteAromas', 'fideliteCultivars',
                    'intensiteAromatique'
                ],
                labels: {
                    aromasIntensity: 'Intensité aromatique', fideliteCultivars: 'Fidélité cultivar',
                    complexiteAromas: 'Complexité', intensiteAromatique: 'Intensité aromatique'
                }
            },
            texture: {
                fields: [
                    // Actual form field names
                    'hardness', 'elasticity', 'stickiness', 'melting', 'residue',
                    'malleability', 'friability', 'viscosity',
                    // Legacy
                    'durete', 'densiteTactile', 'elasticite', 'collant', 'friabilite',
                    'friabiliteViscosite', 'viscositeTexture', 'granularite', 'homogeneite',
                    'meltingResidus', 'aspectCollantGras'
                ],
                labels: {
                    // Actual form field labels
                    hardness: 'Dureté', elasticity: 'Élasticité', stickiness: 'Collant',
                    melting: 'Melting', residue: 'Résidus', malleability: 'Malléabilité',
                    friability: 'Friabilité', viscosity: 'Viscosité',
                    // Legacy
                    durete: 'Dureté', densiteTactile: 'Densité tactile', elasticite: 'Élasticité',
                    collant: 'Collant', friabilite: 'Friabilité', friabiliteViscosite: 'Friabilité/Viscosité',
                    viscositeTexture: 'Viscosité', granularite: 'Granularité', homogeneite: 'Homogénéité',
                    meltingResidus: 'Melting/Résidus', aspectCollantGras: 'Aspect collant/gras'
                }
            },
            taste: {
                fields: [
                    // Actual form field names (mapped in normalizeByType: gouts.intensity→intensiteFumee, aggressiveness→agressivite)
                    'intensiteFumee', 'agressivite',
                    // Legacy
                    'intensiteFumeeDab', 'agressivitePiquant', 'cendre', 'cendreFumee',
                    'douceur', 'persistanceGout', 'tastesIntensity', 'goutIntensity',
                    'intensiteGout', 'intensiteGustative', 'textureBouche'
                ],
                labels: {
                    intensiteFumee: 'Intensité', agressivite: 'Agressivité / Piquant',
                    intensiteFumeeDab: 'Intensité fumée/dab',
                    agressivitePiquant: 'Agressivité/piquant',
                    cendre: 'Cendre', cendreFumee: 'Cendre fumée',
                    douceur: 'Douceur', persistanceGout: 'Persistance',
                    tastesIntensity: 'Intensité goût', goutIntensity: 'Intensité',
                    intensiteGout: 'Intensité goût', intensiteGustative: 'Intensité gustative',
                    textureBouche: 'Texture bouche'
                }
            },
            effects: {
                fields: ['montee', 'intensiteEffet', 'dureeEffet', 'effectsIntensity', 'intensiteEffets'],
                labels: {
                    montee: 'Montée', intensiteEffet: 'Intensité', dureeEffet: 'Durée',
                    effectsIntensity: 'Intensité effets', intensiteEffets: 'Intensité effets'
                }
            }
        };

        // Reconstruire depuis reviewData si ratings est vide ou incomplet
        if (reviewData) {
            // Parser extraData une seule fois
            let extra = {};
            try {
                if (typeof reviewData.extraData === 'string') {
                    extra = JSON.parse(reviewData.extraData);
                } else if (typeof reviewData.extraData === 'object' && reviewData.extraData !== null) {
                    extra = reviewData.extraData;
                }
            } catch (e) {
                console.warn('extractCategoryRatings: Failed to parse extraData', e);
            }

            // Fusionner extra avec reviewData pour chercher les champs
            // reviewData a priorité car il contient les valeurs directes de formData
            const dataSource = { ...extra, ...reviewData };



            // TOUJOURS reconstruire chaque catégorie depuis les champs plats
            // car même si ratings[catKey] existe comme nombre, on veut les sous-détails
            for (const [catKey, catDef] of Object.entries(categoryFields)) {
                // Reconstruire depuis les champs plats
                const reconstructed = {};
                for (const field of catDef.fields) {
                    const value = dataSource[field];
                    if (value !== undefined && value !== null && value !== '') {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue) && numValue > 0) {
                            reconstructed[field] = numValue;
                        }
                    }
                }

                // Si on a reconstruit des sous-champs, les utiliser
                if (Object.keys(reconstructed).length > 0) {
                    ratings[catKey] = reconstructed;
                }
                // Sinon garder la valeur existante (nombre ou objet)
            }
        }

        const categories = [
            { key: 'visual', label: 'Visuel', icon: '👁️' },
            { key: 'smell', label: 'Odeur', icon: '👃' },
            { key: 'texture', label: 'Texture', icon: '✋' },
            { key: 'taste', label: 'Goût', icon: '👅' },
            { key: 'effects', label: 'Effets', icon: '⚡' },
        ];

        for (const cat of categories) {
            const catValue = ratings[cat.key];

            if (catValue === undefined || catValue === null) continue;

            let value;
            let subDetails = null;

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
                const subLabels = categoryFields[cat.key]?.labels || {};
                const subEntries = Object.entries(catValue)
                    .filter(([k, v]) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))))
                    .map(([k, v]) => ({
                        key: k,
                        label: subLabels[k] || k,
                        value: parseFloat(v)
                    }))
                    .filter(e => e.value > 0);

                if (subEntries.length > 0) {
                    value = subEntries.reduce((sum, e) => sum + e.value, 0) / subEntries.length;
                    subDetails = subEntries;
                } else {
                    continue;
                }
            }
            else {
                continue;
            }

            result.push({
                ...cat,
                value: Math.round(value * 10) / 10,
                subDetails,
                count: subDetails ? subDetails.length : 0
            });
        }

        return result;
    } catch (error) {
        return [];
    }
}

/**
 * Extrait les données extraData avec labels français - Liste COMPLÈTE
 * @param {*} extraData - Données extra
 * @param {Object} reviewData - Données complètes de la review (optionnel)
 * @returns {Array} Liste des données formatées
 */
export function extractExtraData(extraData, reviewData = null) {
    // Parser extraData si c'est une chaîne
    let extra = {};
    try {
        if (typeof extraData === 'string') {
            extra = JSON.parse(extraData);
        } else if (typeof extraData === 'object' && extraData !== null) {
            extra = extraData;
        }
    } catch (e) {
        console.warn('extractExtraData: Failed to parse extraData', e);
    }

    // Fusionner avec les champs de reviewData directement
    const merged = { ...extra };
    if (reviewData) {
        // Copier les champs directs de reviewData qui ne sont pas dans extra
        const directFields = [
            // Visuel
            'densiteVisuelle', 'trichome', 'pistil', 'manucure', 'moisissure', 'graines',
            'couleur', 'pureteVisuelle', 'viscosite', 'melting', 'residus', 'pistils', 'couleurTransparence',
            // Texture
            'durete', 'elasticite', 'collant', 'friabilite', 'granularite', 'densiteTactile', 'homogeneite',
            'friabiliteViscosite', 'viscositeTexture', 'meltingResidus', 'aspectCollantGras',
            // Fumée/Goût
            'intensiteFumee', 'intensiteFumeeDab', 'agressivite', 'agressivitePiquant',
            'cendre', 'cendreFumee', 'douceur', 'persistanceGout', 'retroGout', 'textureBouche',
            'intensiteGout', 'intensiteGustative', 'goutIntensity',
            // Effets
            'montee', 'intensiteEffet', 'intensiteEffets', 'dureeEffet',
            // Sensoriel
            'aromasIntensity', 'tastesIntensity', 'effectsIntensity', 'fideliteCultivars', 'complexiteAromas',
            'intensiteAromatique',
            // Process
            'purgevide', 'sechage', 'curing',
            // Culture
            'typeCulture', 'spectre', 'techniquesPropagation'
        ];
        directFields.forEach(f => {
            if (merged[f] === undefined && reviewData[f] !== undefined && reviewData[f] !== null && reviewData[f] !== '') {
                merged[f] = reviewData[f];
            }
        });
    }

    const fieldDefs = [
        // Culture
        { key: 'typeCulture', label: 'Type de culture', icon: '🌿', category: 'culture' },
        { key: 'spectre', label: 'Spectre lumineux', icon: '🌈', category: 'culture' },
        { key: 'techniquesPropagation', label: 'Propagation', icon: '🌱', category: 'culture' },
        // Visuel
        { key: 'densiteVisuelle', label: 'Densité visuelle', icon: '📊', category: 'visual' },
        { key: 'couleurTransparence', label: 'Couleur/transparence', icon: '🎨', category: 'visual' },
        { key: 'trichome', label: 'Trichomes', icon: '✨', category: 'visual' },
        { key: 'pistil', label: 'Pistils', icon: '🌺', category: 'visual' },
        { key: 'manucure', label: 'Manucure', icon: '✂️', category: 'visual' },
        { key: 'couleur', label: 'Couleur', icon: '🎨', category: 'visual' },
        { key: 'pureteVisuelle', label: 'Pureté visuelle', icon: '🔍', category: 'visual' },
        { key: 'viscosite', label: 'Viscosité', icon: '🫠', category: 'visual' },
        { key: 'melting', label: 'Melting', icon: '🔥', category: 'visual' },
        { key: 'residus', label: 'Résidus', icon: '⚫', category: 'visual' },
        // Qualité
        { key: 'moisissure', label: 'Moisissure', icon: '🔬', category: 'quality' },
        { key: 'graines', label: 'Graines', icon: '🫘', category: 'quality' },
        // Texture
        { key: 'durete', label: 'Dureté', icon: '💎', category: 'texture' },
        { key: 'densiteTactile', label: 'Densité tactile', icon: '🧱', category: 'texture' },
        { key: 'elasticite', label: 'Élasticité', icon: '🔄', category: 'texture' },
        { key: 'collant', label: 'Collant', icon: '🍯', category: 'texture' },
        { key: 'friabilite', label: 'Friabilité', icon: '🥧', category: 'texture' },
        { key: 'friabiliteViscosite', label: 'Friabilité/Viscosité', icon: '🫠', category: 'texture' },
        { key: 'viscositeTexture', label: 'Viscosité', icon: '💧', category: 'texture' },
        { key: 'meltingResidus', label: 'Melting/Résidus', icon: '🔥', category: 'texture' },
        { key: 'aspectCollantGras', label: 'Aspect collant/gras', icon: '🍯', category: 'texture' },
        { key: 'granularite', label: 'Granularité', icon: '🔘', category: 'texture' },
        { key: 'homogeneite', label: 'Homogénéité', icon: '⚖️', category: 'texture' },
        { key: 'textureBouche', label: 'Texture bouche', icon: '👄', category: 'texture' },
        // Fumée/Combustion
        { key: 'intensiteFumee', label: 'Intensité fumée', icon: '💨', category: 'smoke' },
        { key: 'intensiteFumeeDab', label: 'Intensité fumée/dab', icon: '🔥', category: 'smoke' },
        { key: 'agressivite', label: 'Agressivité', icon: '🌶️', category: 'smoke' },
        { key: 'agressivitePiquant', label: 'Agressivité/piquant', icon: '🌶️', category: 'smoke' },
        { key: 'cendre', label: 'Cendre', icon: '⚪', category: 'smoke' },
        { key: 'cendreFumee', label: 'Cendre fumée', icon: '⚫', category: 'smoke' },
        { key: 'douceur', label: 'Douceur', icon: '🍬', category: 'smoke' },
        // Effets
        { key: 'montee', label: 'Montée', icon: '📈', category: 'effects' },
        { key: 'intensiteEffet', label: 'Intensité effets', icon: '⚡', category: 'effects' },
        { key: 'dureeEffet', label: 'Durée effets', icon: '⏱️', category: 'effects' },
        // Sensoriel
        { key: 'aromasIntensity', label: 'Intensité arômes', icon: '🌸', category: 'sensory' },
        { key: 'intensiteAromatique', label: 'Intensité aromatique', icon: '🌺', category: 'sensory' },
        { key: 'tastesIntensity', label: 'Intensité goûts', icon: '👅', category: 'sensory' },
        { key: 'intensiteGustative', label: 'Intensité gustative', icon: '👄', category: 'sensory' },
        { key: 'intensiteGout', label: 'Intensité goût', icon: '👅', category: 'sensory' },
        { key: 'goutIntensity', label: 'Intensité', icon: '💪', category: 'sensory' },
        { key: 'effectsIntensity', label: 'Intensité effets', icon: '⚡', category: 'sensory' },
        { key: 'intensiteEffets', label: 'Intensité des effets', icon: '⚡', category: 'sensory' },
        { key: 'fideliteCultivars', label: 'Fidélité cultivar', icon: '🎯', category: 'sensory' },
        { key: 'complexiteAromas', label: 'Complexité arômes', icon: '🧩', category: 'sensory' },
        { key: 'persistanceGout', label: 'Persistance goût', icon: '⏳', category: 'sensory' },
        { key: 'retroGout', label: 'Rétro-goût', icon: '🔙', category: 'sensory' },
        { key: 'notesDominantesOdeur', label: 'Notes dominantes', icon: '🎵', category: 'sensory' },
        { key: 'notesSecondairesOdeur', label: 'Notes secondaires', icon: '🎶', category: 'sensory' },
        // Process
        { key: 'purgevide', label: 'Purge vide', icon: '🫧', category: 'process' },
        { key: 'sechage', label: 'Séchage', icon: '☀️', category: 'process' },
        { key: 'curing', label: 'Curing', icon: '🫙', category: 'process' },
    ];

    const results = fieldDefs
        .filter(({ key }) => merged[key] !== undefined && merged[key] !== null && merged[key] !== '')
        .map(({ key, label, icon, category }) => {
            let displayValue = merged[key];
            // Si c'est un nombre, formater
            if (typeof displayValue === 'number') {
                displayValue = displayValue % 1 === 0 ? displayValue : displayValue.toFixed(1);
            } else if (typeof displayValue === 'string') {
                // Essayer de parser comme nombre
                const numVal = parseFloat(displayValue);
                if (!isNaN(numVal)) {
                    displayValue = numVal % 1 === 0 ? numVal : numVal.toFixed(1);
                }
            }
            return { key, label, icon, category, value: displayValue };
        });

    console.log('📦 extractExtraData - Found:', results.length, 'fields from merged data');

    return results;
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

/**
 * Calcule les ajustements de style selon le ratio pour adapter le contenu sans scroll
 * @param {string} ratio - Ratio du canvas ('1:1', '16:9', '9:16', '4:3', 'A4')
 * @param {Object} baseTypography - Tailles de base de la typographie
 * @returns {Object} Ajustements pour padding, fontSize, spacing, etc.
 */
export function getResponsiveAdjustments(ratio, baseTypography = {}) {
    const dimensions = RATIO_DIMENSIONS[ratio] || RATIO_DIMENSIONS['1:1'];
    const area = dimensions.width * dimensions.height;
    const isSquare = ratio === '1:1';
    const isPortrait = dimensions.height > dimensions.width * 1.2;
    const isLandscape = dimensions.width > dimensions.height * 1.2;
    const isA4 = ratio === 'A4';

    // Facteur de réduction basé sur la surface disponible
    // 1:1 (1080x1080) est le format le plus contraint, donc facteur le plus bas
    const scaleFactor = isSquare ? 0.7 : isPortrait ? 0.8 : isLandscape ? 0.9 : isA4 ? 1.0 : 0.85;

    return {
        // Facteurs d'échelle
        scaleFactor,
        isSquare,
        isPortrait,
        isLandscape,
        isA4,

        // Padding adaptatif
        padding: {
            container: isSquare ? 16 : isPortrait ? 20 : isA4 ? 48 : 24,
            section: isSquare ? 8 : 12,
            card: isSquare ? 8 : 12,
        },

        // Marges et espacements
        spacing: {
            section: isSquare ? 12 : isPortrait ? 16 : 20,
            element: isSquare ? 6 : 8,
            gap: isSquare ? 4 : 6,
        },

        // Tailles de police ajustées
        fontSize: {
            title: Math.round((baseTypography.titleSize || 32) * scaleFactor),
            subtitle: Math.round((baseTypography.titleSize || 32) * scaleFactor * 0.7),
            section: Math.round((baseTypography.titleSize || 32) * scaleFactor * 0.55),
            text: Math.round((baseTypography.textSize || 14) * scaleFactor),
            small: Math.round((baseTypography.textSize || 14) * scaleFactor * 0.85),
        },

        // Layout
        layout: {
            columns: isSquare ? 1 : isPortrait ? 1 : 2,
            imageHeight: isSquare ? '25%' : isPortrait ? '30%' : '40%',
            contentHeight: isSquare ? '70%' : '60%',
        },

        // Tailles d'images
        image: {
            maxWidth: isSquare ? '100%' : '300px',
            maxHeight: isSquare ? '180px' : isPortrait ? '220px' : '300px',
            borderRadius: isSquare ? 8 : 12,
        },

        // Limites d'affichage
        limits: {
            maxTags: isSquare ? 3 : isPortrait ? 4 : 6,
            maxCategoryRatings: isSquare ? 4 : 5,
            maxInfoCards: isSquare ? 4 : 6,
            descriptionLines: isSquare ? 2 : isPortrait ? 3 : 4,
        },

        // Grid
        grid: {
            cols: isSquare ? 2 : isPortrait ? 2 : isA4 ? 4 : 3,
        },
    };
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
    getResponsiveAdjustments,
};
