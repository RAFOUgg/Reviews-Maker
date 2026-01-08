/**
 * Presets visuels pour WeedPreview
 * Configurations prédéfinies représentant différentes qualités de cannabis
 */

export const VISUAL_PRESETS = {
    "Top Shelf Premium": {
        description: "Qualité exceptionnelle - Dispensaire haut de gamme",
        icon: "💎",
        params: {
            densite: 9,
            trichomes: 10,
            pistils: 8,
            manucure: 10,
            moisissure: 10,
            graines: 10
        },
        colors: [
            { colorId: 'purple', percentage: 40 },
            { colorId: 'green-forest', percentage: 35 },
            { colorId: 'orange', percentage: 25 }
        ]
    },

    "High Grade": {
        description: "Excellente qualité - Indoor bien cultivé",
        icon: "✨",
        params: {
            densite: 8,
            trichomes: 8,
            pistils: 7,
            manucure: 9,
            moisissure: 10,
            graines: 10
        },
        colors: [
            { colorId: 'green', percentage: 60 },
            { colorId: 'green-lime', percentage: 25 },
            { colorId: 'purple', percentage: 15 }
        ]
    },

    "Mid-Grade Commercial": {
        description: "Qualité moyenne - Standard commercial",
        icon: "🌿",
        params: {
            densite: 6,
            trichomes: 5,
            pistils: 5,
            manucure: 6,
            moisissure: 10,
            graines: 10
        },
        colors: [
            { colorId: 'green', percentage: 70 },
            { colorId: 'green-forest', percentage: 30 }
        ]
    },

    "Outdoor Natural": {
        description: "Culture extérieure naturelle - Aspect rustique",
        icon: "🌲",
        params: {
            densite: 5,
            trichomes: 4,
            pistils: 7,
            manucure: 4,
            moisissure: 9,
            graines: 9
        },
        colors: [
            { colorId: 'green-dark', percentage: 50 },
            { colorId: 'green-forest', percentage: 30 },
            { colorId: 'brown', percentage: 20 }
        ]
    },

    "Budget Quality": {
        description: "Qualité économique - Basique",
        icon: "🌱",
        params: {
            densite: 4,
            trichomes: 3,
            pistils: 4,
            manucure: 3,
            moisissure: 9,
            graines: 8
        },
        colors: [
            { colorId: 'green-lime', percentage: 60 },
            { colorId: 'yellow', percentage: 40 }
        ]
    },

    "Purple Exotic": {
        description: "Phénotype violet exotique - Rare",
        icon: "🔮",
        params: {
            densite: 8,
            trichomes: 9,
            pistils: 7,
            manucure: 9,
            moisissure: 10,
            graines: 10
        },
        colors: [
            { colorId: 'purple-dark', percentage: 50 },
            { colorId: 'purple', percentage: 30 },
            { colorId: 'green-forest', percentage: 20 }
        ]
    },

    "Golden Harvest": {
        description: "Cure parfaite - Tons dorés",
        icon: "🏆",
        params: {
            densite: 7,
            trichomes: 9,
            pistils: 8,
            manucure: 8,
            moisissure: 10,
            graines: 10
        },
        colors: [
            { colorId: 'yellow', percentage: 35 },
            { colorId: 'green-lime', percentage: 35 },
            { colorId: 'orange', percentage: 30 }
        ]
    },

    "Frosted Sugar": {
        description: "Couverture trichomes maximale",
        icon: "❄️",
        params: {
            densite: 8,
            trichomes: 10,
            pistils: 6,
            manucure: 10,
            moisissure: 10,
            graines: 10
        },
        colors: [
            { colorId: 'green-lime', percentage: 45 },
            { colorId: 'green', percentage: 35 },
            { colorId: 'purple', percentage: 20 }
        ]
    },

    "Mold Issue": {
        description: "Problème de moisissure - Qualité compromise",
        icon: "⚠️",
        params: {
            densite: 6,
            trichomes: 5,
            pistils: 6,
            manucure: 5,
            moisissure: 3,
            graines: 9
        },
        colors: [
            { colorId: 'green-dark', percentage: 50 },
            { colorId: 'brown', percentage: 30 },
            { colorId: 'green-forest', percentage: 20 }
        ]
    },

    "Seeded Batch": {
        description: "Lot grainé - Hermaphrodite",
        icon: "🌰",
        params: {
            densite: 5,
            trichomes: 4,
            pistils: 7,
            manucure: 6,
            moisissure: 10,
            graines: 2
        },
        colors: [
            { colorId: 'green', percentage: 60 },
            { colorId: 'green-lime', percentage: 25 },
            { colorId: 'yellow', percentage: 15 }
        ]
    },

    "Fluffy Sativa": {
        description: "Sativa aérée typique",
        icon: "🎋",
        params: {
            densite: 3,
            trichomes: 6,
            pistils: 9,
            manucure: 7,
            moisissure: 10,
            graines: 10
        },
        colors: [
            { colorId: 'green-lime', percentage: 50 },
            { colorId: 'green', percentage: 35 },
            { colorId: 'yellow', percentage: 15 }
        ]
    },

    "Dense Indica": {
        description: "Indica ultra compacte",
        icon: "🪨",
        params: {
            densite: 10,
            trichomes: 8,
            pistils: 5,
            manucure: 8,
            moisissure: 10,
            graines: 10
        },
        colors: [
            { colorId: 'green-dark', percentage: 55 },
            { colorId: 'green-forest', percentage: 30 },
            { colorId: 'purple-dark', percentage: 15 }
        ]
    }
};

/**
 * Obtenir les catégories de presets
 */
export const PRESET_CATEGORIES = {
    quality: {
        name: "Par qualité",
        icon: "⭐",
        presets: [
            "Top Shelf Premium",
            "High Grade",
            "Mid-Grade Commercial",
            "Budget Quality"
        ]
    },
    cultivation: {
        name: "Par culture",
        icon: "🌱",
        presets: [
            "Outdoor Natural",
            "Frosted Sugar",
            "Golden Harvest"
        ]
    },
    genetics: {
        name: "Par génétique",
        icon: "🧬",
        presets: [
            "Purple Exotic",
            "Fluffy Sativa",
            "Dense Indica"
        ]
    },
    issues: {
        name: "Problèmes",
        icon: "⚠️",
        presets: [
            "Mold Issue",
            "Seeded Batch"
        ]
    }
};

/**
 * Obtenir un preset par nom
 */
export const getPreset = (presetName) => {
    return VISUAL_PRESETS[presetName] || null;
};

/**
 * Obtenir tous les presets
 */
export const getAllPresets = () => {
    return Object.keys(VISUAL_PRESETS).map(key => ({
        name: key,
        ...VISUAL_PRESETS[key]
    }));
};

/**
 * Obtenir les presets d'une catégorie
 */
export const getPresetsByCategory = (category) => {
    const cat = PRESET_CATEGORIES[category];
    if (!cat) return [];

    return cat.presets.map(name => ({
        name,
        ...VISUAL_PRESETS[name]
    }));
};
