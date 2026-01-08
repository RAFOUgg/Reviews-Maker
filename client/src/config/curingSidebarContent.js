/**
 * CURING SIDEBAR CONTENT - Configuration CDC complète
 * 
 * Structure pour Pipeline Curing/Maturation (tous types de produits)
 * Focus : Évolution temporelle des caractéristiques organoleptiques
 * 
 * Particularité : Chaque cellule stocke l'évolution des notes /10
 * - Visuel & Technique
 * - Odeurs
 * - Goûts  
 * - Effets ressentis
 */

export const CURING_SIDEBAR_CONTENT = {
    CONFIGURATION: {
        icon: '⚙️',
        label: 'Configuration Curing',
        color: 'blue',
        collapsed: false,
        items: [
            {
                id: 'curingType',
                label: 'Type de maturation',
                type: 'select',
                options: [
                    { value: 'cold', label: 'Froid (<5°C)', icon: '❄️' },
                    { value: 'warm', label: 'Chaud (>5°C)', icon: '🌡️' },
                    { value: 'room', label: 'Température ambiante', icon: '🏠' },
                    { value: 'controlled', label: 'Contrôlée (cave)', icon: '📦' }
                ],
                icon: '🌡️',
                tooltip: 'Température générale de maturation',
                defaultValue: 'room'
            },
            {
                id: 'curingDuration',
                label: 'Durée prévue',
                type: 'slider',
                min: 1,
                max: 365,
                step: 1,
                unit: 'jours',
                icon: '⏱️',
                defaultValue: 30,
                tooltip: 'Durée totale de curing prévue'
            },
            {
                id: 'intervalType',
                label: 'Intervalle de mesure',
                type: 'select',
                options: [
                    { value: 'hours', label: 'Heures', icon: '⏰' },
                    { value: 'days', label: 'Jours', icon: '📅' },
                    { value: 'weeks', label: 'Semaines', icon: '📆' },
                    { value: 'months', label: 'Mois', icon: '🗓️' }
                ],
                icon: '📊',
                tooltip: 'Fréquence de prise de mesure',
                defaultValue: 'days'
            }
        ]
    },

    CONTAINER: {
        icon: '📦',
        label: 'Récipient & Emballage',
        color: 'purple',
        collapsed: true,
        items: [
            {
                id: 'containerType',
                label: 'Type de récipient',
                type: 'select',
                options: [
                    { value: 'glass', label: 'Verre (Mason jar)', icon: '🫙' },
                    { value: 'plastic', label: 'Plastique (Tupperware)', icon: '🥡' },
                    { value: 'metal', label: 'Métal (boîte)', icon: '🥫' },
                    { value: 'wood', label: 'Bois (cave à cigares)', icon: '🪵' },
                    { value: 'bag', label: 'Sac (Grove, Boveda)', icon: '👜' },
                    { value: 'open-air', label: 'Air libre', icon: '🌬️' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '📦',
                tooltip: 'Matériau principal du récipient'
            },
            {
                id: 'containerVolume',
                label: 'Volume du récipient',
                type: 'slider',
                min: 10,
                max: 10000,
                step: 10,
                unit: 'mL',
                icon: '📏',
                defaultValue: 500,
                tooltip: 'Capacité totale du récipient',
                zones: [
                    { min: 10, max: 100, label: 'Petit', color: 'yellow' },
                    { min: 100, max: 1000, label: 'Moyen', color: 'green' },
                    { min: 1000, max: 10000, label: 'Grand', color: 'blue' }
                ]
            },
            {
                id: 'productVolume',
                label: 'Volume occupé par le produit',
                type: 'slider',
                min: 1,
                max: 10000,
                step: 1,
                unit: 'mL',
                icon: '🌿',
                defaultValue: 250,
                tooltip: 'Volume réel occupé (remplissage)',
                zones: [
                    { min: 1, max: 30, label: 'Peu rempli', color: 'orange' },
                    { min: 30, max: 80, label: 'Optimal', color: 'green' },
                    { min: 80, max: 100, label: 'Très rempli', color: 'red' }
                ]
            },
            {
                id: 'fillRate',
                label: 'Taux de remplissage',
                type: 'computed',
                unit: '%',
                icon: '📊',
                computeFrom: ['containerVolume', 'productVolume'],
                computeFn: (data) => {
                    if (!data.containerVolume || data.containerVolume === 0) return 0
                    return ((data.productVolume / data.containerVolume) * 100).toFixed(1)
                },
                tooltip: 'Pourcentage de remplissage du récipient'
            },
            {
                id: 'packaging',
                label: 'Emballage primaire',
                type: 'multiselect',
                options: [
                    { value: 'cellophane', label: 'Cellophane', icon: '📄' },
                    { value: 'parchment', label: 'Papier cuisson', icon: '📜' },
                    { value: 'aluminum', label: 'Aluminium', icon: '🪙' },
                    { value: 'hash-paper', label: 'Paper hash', icon: '📃' },
                    { value: 'vacuum-bag', label: 'Sac sous vide', icon: '🗜️' },
                    { value: 'freezer-bag', label: 'Sac congélation', icon: '❄️' },
                    { value: 'none', label: 'Aucun (direct)', icon: '🚫' }
                ],
                icon: '📦',
                tooltip: 'Emballage(s) en contact direct avec le produit'
            },
            {
                id: 'containerOpacity',
                label: 'Opacité du récipient',
                type: 'select',
                options: [
                    { value: 'opaque', label: 'Opaque (noir)', icon: '⬛' },
                    { value: 'semi-opaque', label: 'Semi-opaque', icon: '🔳' },
                    { value: 'transparent', label: 'Transparent', icon: '◻️' },
                    { value: 'amber', label: 'Ambré (UV)', icon: '🟠' }
                ],
                icon: '🔦',
                tooltip: 'Protection contre la lumière',
                defaultValue: 'amber'
            },
            {
                id: 'humidityControl',
                label: 'Contrôle humidité',
                type: 'select',
                options: [
                    { value: 'none', label: 'Aucun', icon: '🚫' },
                    { value: 'boveda', label: 'Boveda pack', icon: '💧' },
                    { value: 'integra', label: 'Integra Boost', icon: '💦' },
                    { value: 'orange-peel', label: 'Écorce orange/citron', icon: '🍊' },
                    { value: 'humidor', label: 'Humidificateur', icon: '💨' }
                ],
                icon: '💧',
                tooltip: 'Système de régulation d\'humidité'
            },
            {
                id: 'targetHumidity',
                label: 'Humidité cible',
                type: 'slider',
                min: 40,
                max: 75,
                step: 1,
                unit: '%',
                icon: '🎯',
                defaultValue: 62,
                tooltip: 'Humidité relative visée',
                zones: [
                    { min: 55, max: 62, label: 'Optimal fleurs', color: 'green' },
                    { min: 62, max: 65, label: 'Optimal hash', color: 'purple' }
                ]
            }
        ]
    },

    ENVIRONMENT: {
        icon: '🌡️',
        label: 'Environnement',
        color: 'red',
        collapsed: true,
        items: [
            {
                id: 'temperature',
                label: 'Température moyenne',
                type: 'slider',
                min: -5,
                max: 35,
                step: 0.5,
                unit: '°C',
                icon: '🌡️',
                defaultValue: 18,
                tooltip: 'Température ambiante de stockage',
                zones: [
                    { min: -5, max: 5, label: 'Très froid', color: 'blue' },
                    { min: 5, max: 15, label: 'Froid', color: 'cyan' },
                    { min: 15, max: 22, label: 'Optimal', color: 'green' },
                    { min: 22, max: 35, label: 'Chaud', color: 'orange' }
                ]
            },
            {
                id: 'ambientHumidity',
                label: 'Humidité ambiante',
                type: 'slider',
                min: 20,
                max: 90,
                step: 5,
                unit: '%',
                icon: '💧',
                defaultValue: 50,
                tooltip: 'Humidité de la pièce de stockage'
            },
            {
                id: 'lightExposure',
                label: 'Exposition lumière',
                type: 'select',
                options: [
                    { value: 'dark', label: 'Obscurité totale', icon: '🌑' },
                    { value: 'low', label: 'Lumière faible', icon: '🌘' },
                    { value: 'indirect', label: 'Lumière indirecte', icon: '🌤️' },
                    { value: 'direct', label: 'Lumière directe', icon: '☀️' }
                ],
                icon: '💡',
                tooltip: 'Niveau d\'exposition à la lumière',
                defaultValue: 'dark'
            },
            {
                id: 'airCirculation',
                label: 'Circulation d\'air',
                type: 'select',
                options: [
                    { value: 'sealed', label: 'Scellé hermétique', icon: '🔒' },
                    { value: 'minimal', label: 'Minimale (burping)', icon: '💨' },
                    { value: 'moderate', label: 'Modérée', icon: '🌬️' },
                    { value: 'open', label: 'Air libre', icon: '🌪️' }
                ],
                icon: '💨',
                tooltip: 'Fréquence d\'ouverture/aération',
                defaultValue: 'minimal'
            },
            {
                id: 'burpingFrequency',
                label: 'Fréquence burping',
                type: 'select',
                options: [
                    { value: 'none', label: 'Aucun', icon: '🚫' },
                    { value: 'daily', label: 'Quotidien', icon: '📅' },
                    { value: 'every-2-days', label: 'Tous les 2 jours', icon: '📆' },
                    { value: 'weekly', label: 'Hebdomadaire', icon: '📆' },
                    { value: 'monthly', label: 'Mensuel', icon: '🗓️' }
                ],
                icon: '🔄',
                tooltip: 'Fréquence d\'ouverture pour libérer gaz',
                dependsOn: 'airCirculation',
                showIf: (data) => data.airCirculation === 'minimal'
            }
        ]
    },

    EVOLUTION: {
        icon: '📈',
        label: 'Évolution des notes',
        color: 'green',
        collapsed: true,
        items: [
            {
                id: 'visualEvolution',
                label: 'Évolution Visuel & Technique',
                type: 'info',
                icon: '👁️',
                tooltip: 'Couleur, densité, trichomes - Mesuré à chaque point de la timeline'
            },
            {
                id: 'odorEvolution',
                label: 'Évolution Odeurs',
                type: 'info',
                icon: '👃',
                tooltip: 'Intensité, fidélité, complexité - Mesuré à chaque point'
            },
            {
                id: 'tasteEvolution',
                label: 'Évolution Goûts',
                type: 'info',
                icon: '😋',
                tooltip: 'Intensité, douceur, palette aromatique - Mesuré à chaque point'
            },
            {
                id: 'effectsEvolution',
                label: 'Évolution Effets',
                type: 'info',
                icon: '💥',
                tooltip: 'Puissance, durée, profil - Mesuré à chaque point'
            },
            {
                id: 'moistureEvolution',
                label: 'Évolution Humidité produit',
                type: 'info',
                icon: '💧',
                tooltip: 'Humidité interne mesurée - Tendance séchage/hydratation'
            },
            {
                id: 'weightEvolution',
                label: 'Évolution Poids',
                type: 'info',
                icon: '⚖️',
                tooltip: 'Perte de poids due à l\'évaporation - Suivi grammes'
            }
        ]
    },

    NOTES: {
        icon: '📝',
        label: 'Notes & Observations',
        color: 'yellow',
        collapsed: true,
        items: [
            {
                id: 'curingNotes',
                label: 'Notes générales',
                type: 'textarea',
                maxLength: 1000,
                icon: '📝',
                tooltip: 'Observations sur l\'évolution du curing'
            },
            {
                id: 'moldRisk',
                label: 'Risque moisissure',
                type: 'slider',
                min: 0,
                max: 10,
                step: 1,
                icon: '🍄',
                defaultValue: 0,
                tooltip: 'Évaluation du risque de moisissure (0=aucun, 10=élevé)'
            },
            {
                id: 'qualityImprovement',
                label: 'Amélioration qualité',
                type: 'slider',
                min: -5,
                max: 5,
                step: 0.5,
                icon: '⭐',
                defaultValue: 0,
                tooltip: 'Évolution qualité vs début (-5=dégradation, +5=nette amélioration)'
            }
        ]
    }
}

/**
 * Helper: Obtenir tous les IDs de champs (flat)
 */
export const getAllCuringFieldIds = () => {
    const ids = []
    Object.values(CURING_SIDEBAR_CONTENT).forEach(section => {
        section.items.forEach(item => {
            ids.push(item.id)
        })
    })
    return ids
}

/**
 * Helper: Obtenir un champ par ID
 */
export const getCuringFieldById = (id) => {
    for (const section of Object.values(CURING_SIDEBAR_CONTENT)) {
        const field = section.items.find(item => item.id === id)
        if (field) return field
    }
    return null
}

/**
 * Helper: Valider les dépendances d'un champ
 */
export const shouldShowField = (field, data) => {
    if (!field.dependsOn) return true
    if (!field.showIf) return true
    return field.showIf(data)
}

/**
 * Structure des données d'évolution par cellule
 * Chaque cellule de la timeline stocke :
 */
export const CURING_CELL_DATA_STRUCTURE = {
    // Timestamp
    timestamp: null, // Date ISO ou index

    // Environnement à ce moment
    temperature: null,
    humidity: null,

    // Notes évolutives /10
    visual: {
        color: null,        // /10
        density: null,      // /10
        trichomes: null,    // /10
        overall: null       // /10 moyenne
    },
    odor: {
        intensity: null,    // /10
        fidelity: null,     // /10
        complexity: null,   // /10
        overall: null       // /10
    },
    taste: {
        intensity: null,    // /10
        smoothness: null,   // /10
        palette: null,      // /10
        overall: null       // /10
    },
    effects: {
        onset: null,        // /10
        intensity: null,    // /10
        duration: null,     // /10
        overall: null       // /10
    },

    // Mesures physiques
    weight: null,           // grammes
    moisture: null,         // % humidité interne

    // Notes textuelles
    notes: ''
}
