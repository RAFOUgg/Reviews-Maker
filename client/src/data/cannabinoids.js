/**
 * CANNABINOÏDES - Liste exhaustive
 * Basé sur Dev_cultures.md section 7.1
 * 
 * Format : { id, label, unit, max, description, effects, category }
 */

export const CANNABINOIDS = [
    // Cannabinoïdes majeurs
    {
        id: 'thc',
        label: 'THC (Δ9-tétrahydrocannabinol)',
        shortLabel: 'THC',
        unit: '%',
        max: 40,
        step: 0.1,
        category: 'major',
        psychoactive: true,
        effects: ['Euphorisant', 'Psychoactif', 'Analgésique', 'Antiémétique', 'Stimulant appétit'],
        description: 'Principal cannabinoïde psychoactif du cannabis',
        color: '#FF6B6B'
    },
    {
        id: 'cbd',
        label: 'CBD (Cannabidiol)',
        shortLabel: 'CBD',
        unit: '%',
        max: 25,
        step: 0.1,
        category: 'major',
        psychoactive: false,
        effects: ['Anxiolytique', 'Anti-inflammatoire', 'Anticonvulsivant', 'Neuroprotecteur', 'Relaxant'],
        description: 'Principal cannabinoïde non-psychoactif, effets thérapeutiques importants',
        color: '#4ECDC4'
    },

    // Cannabinoïdes acides (précurseurs)
    {
        id: 'thca',
        label: 'THCA (Acide tétrahydrocannabinolique)',
        shortLabel: 'THCA',
        unit: '%',
        max: 35,
        step: 0.1,
        category: 'acid',
        psychoactive: false,
        effects: ['Anti-inflammatoire', 'Neuroprotecteur', 'Antiémétique', 'Non-psychoactif'],
        description: 'Forme acide du THC, non-psychoactif avant décarboxylation',
        color: '#FFB6C1'
    },
    {
        id: 'cbda',
        label: 'CBDA (Acide cannabidiolique)',
        shortLabel: 'CBDA',
        unit: '%',
        max: 20,
        step: 0.1,
        category: 'acid',
        psychoactive: false,
        effects: ['Anti-nauséeux', 'Anti-inflammatoire', 'Anticonvulsivant', 'Anxiolytique'],
        description: 'Forme acide du CBD, précurseur avant décarboxylation',
        color: '#B0E0E6'
    },

    // Cannabinoïdes mineurs
    {
        id: 'cbg',
        label: 'CBG (Cannabigérol)',
        shortLabel: 'CBG',
        unit: '%',
        max: 10,
        step: 0.1,
        category: 'minor',
        psychoactive: false,
        effects: ['Antibactérien', 'Anti-inflammatoire', 'Neuroprotecteur', 'Stimulant appétit'],
        description: 'Cannabinoïde mère, précurseur des autres cannabinoïdes',
        color: '#98D8C8'
    },
    {
        id: 'cbga',
        label: 'CBGA (Acide cannabigérolique)',
        shortLabel: 'CBGA',
        unit: '%',
        max: 8,
        step: 0.1,
        category: 'acid',
        psychoactive: false,
        effects: ['Précurseur', 'Anti-inflammatoire', 'Antibactérien'],
        description: 'Forme acide du CBG, précurseur de tous les cannabinoïdes',
        color: '#C1E1C1'
    },
    {
        id: 'cbc',
        label: 'CBC (Cannabichromène)',
        shortLabel: 'CBC',
        unit: '%',
        max: 5,
        step: 0.1,
        category: 'minor',
        psychoactive: false,
        effects: ['Anti-inflammatoire', 'Analgésique', 'Antidépresseur', 'Neurogenèse'],
        description: 'Cannabinoïde aux propriétés anti-inflammatoires et analgésiques',
        color: '#F0E68C'
    },
    {
        id: 'cbn',
        label: 'CBN (Cannabinol)',
        shortLabel: 'CBN',
        unit: '%',
        max: 5,
        step: 0.1,
        category: 'minor',
        psychoactive: true,
        psychoactiveLevel: 'mild',
        effects: ['Sédatif', 'Aide au sommeil', 'Analgésique', 'Antibactérien'],
        description: 'Produit de dégradation du THC, effet sédatif léger',
        color: '#DDA0DD'
    },
    {
        id: 'cbdv',
        label: 'CBDV (Cannabidivarine)',
        shortLabel: 'CBDV',
        unit: '%',
        max: 3,
        step: 0.1,
        category: 'minor',
        psychoactive: false,
        effects: ['Anticonvulsivant', 'Antiémétique', 'Modulateur CB1'],
        description: 'Analogue du CBD, propriétés anticonvulsivantes prometteuses',
        color: '#87CEEB'
    },
    {
        id: 'thcv',
        label: 'THCV (Tétrahydrocannabivarine)',
        shortLabel: 'THCV',
        unit: '%',
        max: 5,
        step: 0.1,
        category: 'minor',
        psychoactive: true,
        psychoactiveLevel: 'high',
        effects: ['Énergisant', 'Coupe-faim', 'Neuroprotecteur', 'Régulateur glycémie', 'Stimulant'],
        description: 'Analogue du THC, effet stimulant et énergisant à hautes doses',
        color: '#FF7F50'
    },
    {
        id: 'thca',
        label: 'THCVA (Acide tétrahydrocannabivarinoïque)',
        shortLabel: 'THCVA',
        unit: '%',
        max: 3,
        step: 0.1,
        category: 'acid',
        psychoactive: false,
        effects: ['Précurseur THCV', 'Anti-inflammatoire'],
        description: 'Forme acide du THCV',
        color: '#FFB347'
    },

    // Cannabinoïdes rares
    {
        id: 'delta8',
        label: 'Δ8-THC (Delta-8-tétrahydrocannabinol)',
        shortLabel: 'Δ8-THC',
        unit: '%',
        max: 3,
        step: 0.1,
        category: 'rare',
        psychoactive: true,
        psychoactiveLevel: 'mild',
        effects: ['Psychoactif modéré', 'Antiémétique', 'Anxiolytique', 'Stimulant appétit'],
        description: 'Isomère du THC, effet psychoactif plus doux et clair',
        color: '#FA8072'
    },
    {
        id: 'delta10',
        label: 'Δ10-THC (Delta-10-tétrahydrocannabinol)',
        shortLabel: 'Δ10-THC',
        unit: '%',
        max: 1,
        step: 0.01,
        category: 'rare',
        psychoactive: true,
        psychoactiveLevel: 'mild',
        effects: ['Énergisant', 'Créatif', 'Focus', 'Psychoactif léger'],
        description: 'Isomère du THC très rare, effet stimulant et créatif',
        color: '#FFA07A'
    },
    {
        id: 'cbl',
        label: 'CBL (Cannabicyclol)',
        shortLabel: 'CBL',
        unit: 'mg/g',
        max: 100,
        step: 1,
        category: 'rare',
        psychoactive: false,
        effects: ['Anti-inflammatoire', 'Recherche en cours'],
        description: 'Cannabinoïde rare formé par dégradation du CBC',
        color: '#E6E6FA'
    },
    {
        id: 'cbt',
        label: 'CBT (Cannabitriol)',
        shortLabel: 'CBT',
        unit: 'mg/g',
        max: 50,
        step: 1,
        category: 'rare',
        psychoactive: false,
        effects: ['Recherche en cours'],
        description: 'Cannabinoïde très rare, peu étudié',
        color: '#F5DEB3'
    },
    {
        id: 'thcoa',
        label: 'THC-O-Acétate',
        shortLabel: 'THC-O',
        unit: 'mg/g',
        max: 50,
        step: 1,
        category: 'synthetic',
        psychoactive: true,
        psychoactiveLevel: 'very-high',
        effects: ['Très psychoactif', 'Puissant', 'Synthétique'],
        description: 'Forme acétylée du THC, très puissante (utilisation avec précaution)',
        color: '#DC143C',
        warning: true
    }
]

/**
 * Catégories de cannabinoïdes
 */
export const CANNABINOID_CATEGORIES = {
    major: { label: 'Majeurs', color: '#FF6B6B', description: 'Cannabinoïdes principaux (THC, CBD)' },
    minor: { label: 'Mineurs', color: '#4ECDC4', description: 'Cannabinoïdes mineurs naturels' },
    acid: { label: 'Acides', color: '#95E1D3', description: 'Formes acides (précurseurs)' },
    rare: { label: 'Rares', color: '#F38181', description: 'Cannabinoïdes rares ou traces' },
    synthetic: { label: 'Synthétiques', color: '#AA96DA', description: 'Formes synthétiques ou modifiées' }
}

/**
 * Obtenir les cannabinoïdes par catégorie
 */
export function getCannabinoidsByCategory(category) {
    return CANNABINOIDS.filter(c => c.category === category)
}

/**
 * Obtenir un cannabinoïde par ID
 */
export function getCannabinoidById(id) {
    return CANNABINOIDS.find(c => c.id === id)
}

/**
 * Calculer la somme totale des cannabinoïdes
 */
export function calculateTotalCannabinoids(values) {
    // Convertir tous en % pour calcul cohérent
    return Object.entries(values).reduce((sum, [key, value]) => {
        const cannabinoid = getCannabinoidById(key)
        if (!cannabinoid || !value) return sum

        // Si en mg/g, convertir en % approximatif (1% ≈ 10mg/g)
        const percentValue = cannabinoid.unit === 'mg/g' ? value / 10 : value
        return sum + percentValue
    }, 0)
}

/**
 * Vérifier la cohérence des valeurs (total ne doit pas dépasser 100%)
 */
export function validateCannabinoidValues(values) {
    const total = calculateTotalCannabinoids(values)
    return {
        valid: total <= 100,
        total,
        message: total > 100 ? `Total ${total.toFixed(1)}% dépasse 100%` : 'Valeurs cohérentes'
    }
}
