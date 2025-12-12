/**
 * Méthodes d'extraction pour Concentrés
 * Phase 2.2 - Pipeline Extraction
 */

export const EXTRACTION_METHODS = {
    // Extractions solvants alcools
    eho: {
        id: 'eho',
        label: 'Éthanol (EHO)',
        category: 'solvent',
        icon: '🧪',
        description: 'Extraction à l\'éthanol alimentaire',
        fields: ['solventVolume', 'duration', 'temperature', 'passes'],
        purityRange: [60, 90]
    },
    ipa: {
        id: 'ipa',
        label: 'Isopropylique (IPA)',
        category: 'solvent',
        icon: '⚗️',
        description: 'Extraction alcool isopropylique',
        fields: ['solventVolume', 'duration', 'temperature'],
        purityRange: [50, 85]
    },
    aho: {
        id: 'aho',
        label: 'Acétone (AHO)',
        category: 'solvent',
        icon: '🧴',
        description: 'Extraction à l\'acétone',
        fields: ['solventVolume', 'duration', 'temperature'],
        purityRange: [55, 80]
    },

    // Extractions hydrocarbures
    bho: {
        id: 'bho',
        label: 'Butane (BHO)',
        category: 'hydrocarbon',
        icon: '💨',
        description: 'Extraction au butane (shatter, wax, etc.)',
        fields: ['pressure', 'temperature', 'duration', 'solventVolume'],
        purityRange: [70, 95]
    },
    pho: {
        id: 'pho',
        label: 'Propane (PHO)',
        category: 'hydrocarbon',
        icon: '🔥',
        description: 'Extraction au propane',
        fields: ['pressure', 'temperature', 'duration'],
        purityRange: [70, 92]
    },
    iho: {
        id: 'iho',
        label: 'Isobutane (IHO)',
        category: 'hydrocarbon',
        icon: '⚡',
        description: 'Extraction à l\'isobutane',
        fields: ['pressure', 'temperature', 'duration'],
        purityRange: [68, 90]
    },
    hho: {
        id: 'hho',
        label: 'Hexane (HHO)',
        category: 'hydrocarbon',
        icon: '🧬',
        description: 'Extraction à l\'hexane',
        fields: ['solventVolume', 'temperature', 'duration'],
        purityRange: [65, 88]
    },

    // Extractions spéciales
    co2: {
        id: 'co2',
        label: 'CO₂ Supercritique',
        category: 'gas',
        icon: '☁️',
        description: 'Extraction CO₂ supercritique (haute pureté)',
        fields: ['pressure', 'temperature', 'duration', 'flowRate'],
        purityRange: [85, 99]
    },
    vegetalOil: {
        id: 'vegetalOil',
        label: 'Huiles végétales',
        category: 'natural',
        icon: '🥥',
        description: 'Extraction huiles (coco, olive, etc.)',
        fields: ['oilType', 'temperature', 'duration'],
        purityRange: [30, 60]
    },

    // Extractions mécaniques
    hotPress: {
        id: 'hotPress',
        label: 'Pressage chaud (Rosin)',
        category: 'mechanical',
        icon: '🔨',
        description: 'Pressage à chaud sans solvant',
        fields: ['temperature', 'pressure', 'duration'],
        purityRange: [70, 90]
    },
    coldPress: {
        id: 'coldPress',
        label: 'Pressage froid',
        category: 'mechanical',
        icon: '❄️',
        description: 'Pressage à froid (live rosin)',
        fields: ['pressure', 'duration', 'preFreeze'],
        purityRange: [75, 95]
    },

    // Méthodes avancées
    ultrasound: {
        id: 'ultrasound',
        label: 'Ultrasons (UAE)',
        category: 'advanced',
        icon: '🔊',
        description: 'Extraction assistée ultrasons',
        fields: ['frequency', 'power', 'duration', 'solvent'],
        purityRange: [60, 85]
    },
    microwave: {
        id: 'microwave',
        label: 'Micro-ondes (MAE)',
        category: 'advanced',
        icon: '📡',
        description: 'Extraction micro-ondes',
        fields: ['power', 'duration', 'solvent'],
        purityRange: [55, 80]
    },

    other: {
        id: 'other',
        label: 'Autre méthode',
        category: 'custom',
        icon: '🔧',
        description: 'Méthode personnalisée',
        fields: ['customMethod', 'duration'],
        purityRange: [30, 95]
    }
};

export const PURIFICATION_METHODS = {
    columnChromatography: {
        id: 'columnChromatography',
        label: 'Chromatographie colonne',
        icon: '🧪',
        description: 'Séparation par colonne chromatographique',
        fields: ['columnType', 'solvent', 'duration']
    },
    flashChromatography: {
        id: 'flashChromatography',
        label: 'Flash Chromatography',
        icon: '⚡',
        description: 'Chromatographie rapide sous pression',
        fields: ['pressure', 'solvent', 'duration']
    },
    winterization: {
        id: 'winterization',
        label: 'Winterisation',
        icon: '❄️',
        description: 'Élimination cires/lipides par froid',
        fields: ['temperature', 'duration', 'solvent']
    },
    decarboxylation: {
        id: 'decarboxylation',
        label: 'Décarboxylation',
        icon: '🔥',
        description: 'Activation cannabinoïdes par chaleur',
        fields: ['temperature', 'duration']
    },
    tempFractionation: {
        id: 'tempFractionation',
        label: 'Fractionnement température',
        icon: '🌡️',
        description: 'Séparation par température',
        fields: ['temperature', 'duration']
    },
    filtration: {
        id: 'filtration',
        label: 'Filtration',
        icon: '🔬',
        description: 'Filtration mécanique/membranaire',
        fields: ['filterSize', 'passes']
    },
    centrifugation: {
        id: 'centrifugation',
        label: 'Centrifugation',
        icon: '🌀',
        description: 'Séparation par force centrifuge',
        fields: ['speed', 'duration']
    },
    vacuumDrying: {
        id: 'vacuumDrying',
        label: 'Séchage sous vide',
        icon: '💨',
        description: 'Évaporation solvant sous vide',
        fields: ['pressure', 'temperature', 'duration']
    },
    recrystallization: {
        id: 'recrystallization',
        label: 'Recristallisation',
        icon: '💎',
        description: 'Purification par recristallisation',
        fields: ['solvent', 'temperature', 'duration']
    }
};

export const TIMELINE_INTERVALS = [
    { id: 'seconds', label: 'Secondes', unit: 's', max: 3600 },
    { id: 'minutes', label: 'Minutes', unit: 'min', max: 1440 },
    { id: 'hours', label: 'Heures', unit: 'h', max: 168 }
];

export const OIL_TYPES = [
    { id: 'coconut', label: 'Coco', icon: '🥥' },
    { id: 'olive', label: 'Olive', icon: '🫒' },
    { id: 'mct', label: 'MCT', icon: '🧴' },
    { id: 'other', label: 'Autre', icon: '🔧' }
];

export const SOLVENT_TYPES = [
    { id: 'ethanol', label: 'Éthanol', purity: 95 },
    { id: 'isopropanol', label: 'Isopropanol', purity: 90 },
    { id: 'acetone', label: 'Acétone', purity: 85 },
    { id: 'hexane', label: 'Hexane', purity: 80 },
    { id: 'water', label: 'Eau', purity: 100 },
    { id: 'other', label: 'Autre', purity: 70 }
];

/**
 * Obtenir méthode extraction par ID
 */
export const getExtractionMethod = (methodId) => {
    return EXTRACTION_METHODS[methodId] || null;
};

/**
 * Obtenir toutes méthodes extraction en array
 */
export const getAllExtractionMethods = () => {
    return Object.values(EXTRACTION_METHODS);
};

/**
 * Obtenir méthodes par catégorie
 */
export const getMethodsByCategory = (category) => {
    return Object.values(EXTRACTION_METHODS).filter(m => m.category === category);
};

/**
 * Obtenir méthode purification par ID
 */
export const getPurificationMethod = (methodId) => {
    return PURIFICATION_METHODS[methodId] || null;
};

/**
 * Obtenir toutes méthodes purification
 */
export const getAllPurificationMethods = () => {
    return Object.values(PURIFICATION_METHODS);
};

/**
 * Estimer pureté basée sur méthode et purification
 */
export const estimatePurity = (extractionMethod, purificationSteps = []) => {
    const method = EXTRACTION_METHODS[extractionMethod];
    if (!method) return 50;

    const basePurity = (method.purityRange[0] + method.purityRange[1]) / 2;
    const purificationBonus = purificationSteps.length * 3; // +3% par étape purification

    return Math.min(99, basePurity + purificationBonus).toFixed(1);
};
