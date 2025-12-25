/**
 * Méthodes de séparation pour Hash (Ice-O-Lator, Dry-Sift, etc.)
 * Phase 2.1 - Pipeline Séparation
 */

export const SEPARATION_METHODS = {
    ice_water: {
        id: 'ice_water',
        name: 'Eau/Glace (Ice-O-Lator)',
        icon: '❄️',
        description: 'Extraction par agitation dans eau glacée',
        fields: [
            { key: 'waterTemp', label: 'Température eau', type: 'number', unit: '°C', min: 0, max: 10, required: true },
            { key: 'passes', label: 'Nombre de passes', type: 'number', min: 1, max: 10, required: true },
            { key: 'iceRatio', label: 'Ratio glace/eau', type: 'select', options: ['1:1', '2:1', '3:1'], required: true },
            { key: 'duration', label: 'Durée totale', type: 'number', unit: 'min', required: true },
            { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Observations...', required: false }
        ]
    },
    dry_sift: {
        id: 'dry_sift',
        name: 'Tamisage à sec (Dry-Sift)',
        icon: '🥄',
        description: 'Tamisage mécanique sans solvant',
        fields: [
            { key: 'passes', label: 'Nombre de passes', type: 'number', min: 1, max: 10, required: true },
            { key: 'duration', label: 'Durée totale', type: 'number', unit: 'min', required: true },
            { key: 'temperature', label: 'Température', type: 'number', unit: '°C', min: -20, max: 30, required: false },
            { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Observations...', required: false }
        ]
    },
    manual: {
        id: 'manual',
        name: 'Manuelle',
        icon: '✋',
        description: 'Séparation manuelle des trichomes',
        fields: [
            { key: 'duration', label: 'Durée totale', type: 'number', unit: 'min', required: true },
            { key: 'method', label: 'Méthode utilisée', type: 'text', placeholder: 'Décrivez la méthode...', required: true },
            { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Observations...', required: false }
        ]
    },
    other: {
        id: 'other',
        name: 'Autre méthode',
        icon: '🔧',
        description: 'Méthode personnalisée',
        fields: [
            { key: 'customMethod', label: 'Nom de la méthode', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Décrivez le processus...', required: true },
            { key: 'duration', label: 'Durée totale', type: 'number', unit: 'min', required: false },
            { key: 'notes', label: 'Notes additionnelles', type: 'textarea', placeholder: 'Observations...', required: false }
        ]
    }
};

export const MESH_SIZES = [
    { value: 25, label: '25µ', quality: 'Très haute' },
    { value: 45, label: '45µ', quality: 'Haute' },
    { value: 73, label: '73µ', quality: 'Moyenne-Haute' },
    { value: 90, label: '90µ', quality: 'Moyenne' },
    { value: 120, label: '120µ', quality: 'Basse' },
    { value: 160, label: '160µ', quality: 'Très basse' },
    { value: 190, label: '190µ', quality: 'Contamination' },
    { value: 220, label: '220µ', quality: 'Contamination' }
];

export const SOURCE_MATERIAL_TYPES = [
    { id: 'fresh-buds', label: 'Buds fraîches', icon: '🌸', quality: 10 },
    { id: 'dry-buds', label: 'Buds sèches', icon: '🌿', quality: 9 },
    { id: 'sugar-leaves', label: 'Sugar leaves', icon: '🍃', quality: 7 },
    { id: 'trim', label: 'Trim', icon: '✂️', quality: 5 },
    { id: 'mix', label: 'Mélange', icon: '🔀', quality: 6 },
    { id: 'other', label: 'Autre', icon: '📦', quality: 5 }
];

export const TIMELINE_INTERVALS = [
    { id: 'seconds', label: 'Secondes', unit: 's', max: 3600 },
    { id: 'minutes', label: 'Minutes', unit: 'min', max: 1440 },
    { id: 'hours', label: 'Heures', unit: 'h', max: 168 }
];

/**
 * Obtenir la méthode par ID
 */
export const getMethodById = (methodId) => {
    return SEPARATION_METHODS[methodId] || null;
};

/**
 * Obtenir toutes les méthodes en array
 */
export const getAllMethods = () => {
    return Object.values(SEPARATION_METHODS);
};

/**
 * Calculer le rendement estimé basé sur qualité matière et méthode
 */
export const estimateYield = (materialQuality, method) => {
    const baseYields = {
        manual: 0.05, // 5%
        drySift: 0.08, // 8%
        iceWater: 0.12, // 12%
        other: 0.06 // 6%
    };

    const base = baseYields[method] || 0.05;
    const qualityMultiplier = materialQuality / 10;

    return (base * qualityMultiplier * 100).toFixed(2);
};
