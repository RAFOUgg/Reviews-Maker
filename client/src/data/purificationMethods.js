/**
 * MÉTHODES DE PURIFICATION - Hash & Concentrés
 * Conforme CDC - 16 méthodes avec paramètres spécifiques
 */

export const PURIFICATION_METHODS = {
    chromatographie_colonne: {
        id: 'chromatographie_colonne',
        name: 'Chromatographie sur colonne',
        icon: '🧪',
        category: 'chromatographie',
        description: 'Séparation par affinité sur support solide',
        fields: [
            { key: 'support', label: 'Support', type: 'select', options: ['Silice', 'Alumine', 'C18', 'Autre'], required: true },
            { key: 'solvant', label: 'Solvant', type: 'select', options: ['Hexane', 'Éthanol', 'Méthanol', 'DCM', 'Autre'], required: true },
            { key: 'debit', label: 'Débit', unit: 'mL/min', type: 'number', min: 0.1, max: 100 },
            { key: 'temperature', label: 'Température', unit: '°C', type: 'number', min: -20, max: 50 },
            { key: 'duration', label: 'Durée', unit: 'min', type: 'number', min: 10, max: 600 },
        ]
    },

    flash_chromatography: {
        id: 'flash_chromatography',
        name: 'Flash Chromatography',
        icon: '⚡',
        category: 'chromatographie',
        description: 'Chromatographie rapide sous pression',
        fields: [
            { key: 'pressure', label: 'Pression', unit: 'bar', type: 'number', min: 1, max: 20, required: true },
            { key: 'support', label: 'Support', type: 'select', options: ['Silice', 'Alumine', 'C18'], required: true },
            { key: 'solvant', label: 'Solvant', type: 'select', options: ['Hexane/EtOAc', 'DCM/MeOH', 'Autre'], required: true },
            { key: 'duration', label: 'Durée', unit: 'min', type: 'number', min: 5, max: 120 },
        ]
    },

    winterisation: {
        id: 'winterisation',
        name: 'Winterisation',
        icon: '❄️',
        category: 'precipitation',
        description: 'Élimination des lipides/cires par le froid',
        fields: [
            { key: 'temperature', label: 'Température', unit: '°C', type: 'number', min: -80, max: -20, required: true },
            { key: 'duration', label: 'Durée', unit: 'h', type: 'number', min: 12, max: 72, required: true },
            { key: 'solvant', label: 'Solvant', type: 'select', options: ['Éthanol', 'Méthanol', 'Isopropanol'], required: true },
            { key: 'ratio', label: 'Ratio solvant/extrait', type: 'text', placeholder: 'Ex: 10:1' },
        ]
    },

    decarboxylation: {
        id: 'decarboxylation',
        name: 'Décarboxylation',
        icon: '🔥',
        category: 'activation',
        description: 'Activation des cannabinoïdes par chaleur',
        fields: [
            { key: 'temperature', label: 'Température', unit: '°C', type: 'number', min: 100, max: 150, required: true },
            { key: 'duration', label: 'Durée', unit: 'min', type: 'number', min: 30, max: 120, required: true },
            { key: 'atmosphere', label: 'Atmosphère', type: 'select', options: ['Air', 'Azote', 'Vide'] },
        ]
    },

    fractionnement_temperature: {
        id: 'fractionnement_temperature',
        name: 'Fractionnement par température',
        icon: '🌡️',
        category: 'fractionnement',
        description: 'Séparation par point d\'ébullition',
        fields: [
            { key: 'temperature_init', label: 'Température initiale', unit: '°C', type: 'number', min: 50, max: 200, required: true },
            { key: 'temperature_finale', label: 'Température finale', unit: '°C', type: 'number', min: 100, max: 250, required: true },
            { key: 'rampe', label: 'Rampe', unit: '°C/min', type: 'number', min: 1, max: 20 },
            { key: 'pressure', label: 'Pression', unit: 'mbar', type: 'number', min: 1, max: 1000 },
        ]
    },

    fractionnement_solubilite: {
        id: 'fractionnement_solubilite',
        name: 'Fractionnement par solubilité',
        icon: '💧',
        category: 'fractionnement',
        description: 'Extraction séquentielle par solvants',
        fields: [
            { key: 'solvants', label: 'Solvants utilisés', type: 'text', placeholder: 'Ex: Hexane, DCM, MeOH', required: true },
            { key: 'temperature', label: 'Température', unit: '°C', type: 'number', min: -20, max: 60 },
            { key: 'nb_extractions', label: 'Nombre d\'extractions', type: 'number', min: 1, max: 10 },
        ]
    },

    filtration: {
        id: 'filtration',
        name: 'Filtration',
        icon: '🔬',
        category: 'separation',
        description: 'Élimination particules solides',
        fields: [
            { key: 'type', label: 'Type de filtre', type: 'select', options: ['Papier', 'Membrane', 'Frité', 'Celite'], required: true },
            { key: 'porosite', label: 'Porosité', unit: 'µm', type: 'number', min: 0.2, max: 100 },
            { key: 'temperature', label: 'Température', unit: '°C', type: 'number', min: -20, max: 60 },
        ]
    },

    centrifugation: {
        id: 'centrifugation',
        name: 'Centrifugation',
        icon: '🌀',
        category: 'separation',
        description: 'Séparation par force centrifuge',
        fields: [
            { key: 'vitesse', label: 'Vitesse', unit: 'rpm', type: 'number', min: 1000, max: 15000, required: true },
            { key: 'duration', label: 'Durée', unit: 'min', type: 'number', min: 5, max: 60, required: true },
            { key: 'temperature', label: 'Température', unit: '°C', type: 'number', min: -10, max: 40 },
        ]
    },

    decantation: {
        id: 'decantation',
        name: 'Décantation',
        icon: '⏳',
        category: 'separation',
        description: 'Séparation par gravité',
        fields: [
            { key: 'duration', label: 'Durée', unit: 'h', type: 'number', min: 1, max: 48, required: true },
            { key: 'temperature', label: 'Température', unit: '°C', type: 'number', min: -20, max: 40 },
        ]
    },

    sechage_vide: {
        id: 'sechage_vide',
        name: 'Séchage sous vide',
        icon: '🎯',
        category: 'evaporation',
        description: 'Évaporation sous pression réduite',
        fields: [
            { key: 'pressure', label: 'Pression', unit: 'mbar', type: 'number', min: 1, max: 100, required: true },
            { key: 'temperature', label: 'Température', unit: '°C', type: 'number', min: 20, max: 60, required: true },
            { key: 'duration', label: 'Durée', unit: 'h', type: 'number', min: 1, max: 24 },
        ]
    },

    recristallisation: {
        id: 'recristallisation',
        name: 'Recristallisation',
        icon: '💎',
        category: 'purification',
        description: 'Purification par cristallisation',
        fields: [
            { key: 'solvant', label: 'Solvant', type: 'select', options: ['Pentane', 'Hexane', 'Éthanol', 'Autre'], required: true },
            { key: 'temperature_dissolution', label: 'Température dissolution', unit: '°C', type: 'number', min: 20, max: 80 },
            { key: 'temperature_cristallisation', label: 'Température cristallisation', unit: '°C', type: 'number', min: -80, max: 20 },
            { key: 'duration', label: 'Durée', unit: 'h', type: 'number', min: 12, max: 72 },
        ]
    },

    sublimation: {
        id: 'sublimation',
        name: 'Sublimation',
        icon: '🌫️',
        category: 'purification',
        description: 'Passage solide → gaz → solide',
        fields: [
            { key: 'temperature', label: 'Température', unit: '°C', type: 'number', min: 100, max: 250, required: true },
            { key: 'pressure', label: 'Pression', unit: 'mbar', type: 'number', min: 0.1, max: 100, required: true },
            { key: 'duration', label: 'Durée', unit: 'h', type: 'number', min: 1, max: 12 },
        ]
    },

    extraction_liquide_liquide: {
        id: 'extraction_liquide_liquide',
        name: 'Extraction liquide-liquide',
        icon: '🧴',
        category: 'extraction',
        description: 'Extraction par partition entre 2 phases',
        fields: [
            { key: 'solvant_extraction', label: 'Solvant extraction', type: 'select', options: ['Hexane', 'DCM', 'AcOEt', 'Autre'], required: true },
            { key: 'nb_extractions', label: 'Nombre d\'extractions', type: 'number', min: 1, max: 10, required: true },
            { key: 'ratio', label: 'Ratio volumique', type: 'text', placeholder: 'Ex: 1:1' },
            { key: 'temperature', label: 'Température', unit: '°C', type: 'number', min: 0, max: 60 },
        ]
    },

    adsorption_charbon: {
        id: 'adsorption_charbon',
        name: 'Adsorption sur charbon actif',
        icon: '⚫',
        category: 'adsorption',
        description: 'Élimination impuretés par adsorption',
        fields: [
            { key: 'quantite', label: 'Quantité charbon', unit: 'g/L', type: 'number', min: 1, max: 100, required: true },
            { key: 'duration', label: 'Durée contact', unit: 'min', type: 'number', min: 10, max: 120, required: true },
            { key: 'temperature', label: 'Température', unit: '°C', type: 'number', min: 20, max: 60 },
            { key: 'agitation', label: 'Agitation', type: 'select', options: ['Magnétique', 'Mécanique', 'Aucune'] },
        ]
    },

    filtration_membranaire: {
        id: 'filtration_membranaire',
        name: 'Filtration membranaire',
        icon: '🎛️',
        category: 'separation',
        description: 'Ultrafiltration ou nanofiltration',
        fields: [
            { key: 'type_membrane', label: 'Type membrane', type: 'select', options: ['PTFE', 'PVDF', 'Nylon', 'PES'], required: true },
            { key: 'seuil_coupure', label: 'Seuil de coupure', unit: 'kDa ou µm', type: 'text', required: true },
            { key: 'pressure', label: 'Pression', unit: 'bar', type: 'number', min: 0.5, max: 10 },
            { key: 'temperature', label: 'Température', unit: '°C', type: 'number', min: 20, max: 40 },
        ]
    },

    hplc: {
        id: 'hplc',
        name: 'HPLC (Chromatographie liquide haute performance)',
        icon: '🔬',
        category: 'analytique',
        description: 'Analyse/purification haute résolution',
        fields: [
            { key: 'colonne', label: 'Colonne', type: 'text', placeholder: 'Ex: C18, 250x4.6mm, 5µm', required: true },
            { key: 'phase_mobile', label: 'Phase mobile', type: 'text', placeholder: 'Ex: ACN/H2O 70:30', required: true },
            { key: 'debit', label: 'Débit', unit: 'mL/min', type: 'number', min: 0.1, max: 5 },
            { key: 'detection', label: 'Détection', type: 'select', options: ['UV-Vis', 'DAD', 'Fluorescence', 'MS'] },
        ]
    },
};

/**
 * Récupère une méthode par son ID
 */
export const getPurificationMethodById = (methodId) => {
    return PURIFICATION_METHODS[methodId];
};

/**
 * Récupère toutes les méthodes par catégorie
 */
export const getPurificationMethodsByCategory = () => {
    const categories = {};
    Object.values(PURIFICATION_METHODS).forEach(method => {
        if (!categories[method.category]) {
            categories[method.category] = [];
        }
        categories[method.category].push(method);
    });
    return categories;
};

/**
 * Labels des catégories
 */
export const PURIFICATION_CATEGORIES = {
    chromatographie: { name: 'Chromatographie', icon: '🧪' },
    precipitation: { name: 'Précipitation', icon: '❄️' },
    activation: { name: 'Activation', icon: '🔥' },
    fractionnement: { name: 'Fractionnement', icon: '🌡️' },
    separation: { name: 'Séparation', icon: '🔬' },
    evaporation: { name: 'Évaporation', icon: '🎯' },
    purification: { name: 'Purification', icon: '💎' },
    extraction: { name: 'Extraction', icon: '🧴' },
    adsorption: { name: 'Adsorption', icon: '⚫' },
    analytique: { name: 'Analytique', icon: '🔬' }
};
