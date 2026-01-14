/**
 * Configuration sidebar pour Pipeline Extraction Concentrés
 * Contenus draggables pour tracking extraction et purification
 */

export const EXTRACTION_SIDEBAR_CONTENT = {
    extraction: {
        icon: '⚗️',
        label: 'Configuration Extraction',
        color: 'purple',
        collapsed: false,
        items: [
            { id: 'method', key: 'extractionMethod', label: 'Méthode extraction', type: 'select', icon: '🧪' },
            { id: 'temperature', key: 'temperature', label: 'Température', type: 'number', unit: '°C', icon: '🌡️' },
            { id: 'pressure', key: 'pressure', label: 'Pression', type: 'number', unit: 'PSI', icon: '💨' },
            { id: 'duration', key: 'duration', label: 'Durée', type: 'number', unit: 'min', icon: '⏱️' },
            { id: 'yield', key: 'yieldExtraction', label: 'Rendement extraction', type: 'number', unit: '%', icon: '📊' }
        ]
    },
    purification: {
        icon: '✨',
        label: 'Purification',
        color: 'cyan',
        collapsed: false,
        items: [
            { id: 'winterization', key: 'winterization', label: 'Winterisation', type: 'boolean', icon: '❄️' },
            { id: 'filtration', key: 'filtration', label: 'Filtration', type: 'boolean', icon: '🔬' },
            { id: 'decarb', key: 'decarboxylation', label: 'Décarboxylation', type: 'boolean', icon: '🔥' },
            { id: 'distillation', key: 'distillation', label: 'Distillation', type: 'boolean', icon: '⚗️' },
            { id: 'purificationTemp', key: 'purificationTemp', label: 'Temp. purification', type: 'number', unit: '°C', icon: '🌡️' }
        ]
    },
    quality: {
        icon: '💎',
        label: 'Qualité finale',
        color: 'amber',
        collapsed: false,
        items: [
            { id: 'purity', key: 'purity', label: 'Pureté visuelle', type: 'slider', min: 0, max: 10, icon: '✨' },
            { id: 'color', key: 'color', label: 'Couleur/Transparence', type: 'slider', min: 0, max: 10, icon: '🎨' },
            { id: 'viscosity', key: 'viscosity', label: 'Viscosité', type: 'slider', min: 0, max: 10, icon: '💧' },
            { id: 'finalYield', key: 'finalYield', label: 'Rendement final', type: 'number', unit: '%', icon: '📊' },
            { id: 'weight', key: 'weight', label: 'Poids final', type: 'number', unit: 'g', icon: '⚖️' }
        ]
    },
    observations: {
        icon: '📝',
        label: 'Notes & Observations',
        color: 'gray',
        collapsed: true,
        items: [
            { id: 'notes', key: 'notes', label: 'Observations', type: 'textarea', icon: '📝' }
        ]
    }
};
