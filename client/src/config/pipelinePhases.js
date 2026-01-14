/**
 * Configurations des phases pour les pipelines
 * Conformément au CDC - définition des phases prédéfinies par type
 */

export const CULTURE_PHASES = {
    phases: [
        { id: 'seed', label: 'Graine (J0)', order: 0, duration: 1 },
        { id: 'germination', label: 'Germination', order: 1, duration: 3 },
        { id: 'seedling', label: 'Plantule', order: 2, duration: 7 },
        { id: 'veg-early', label: 'Début Croissance', order: 3, duration: 14 },
        { id: 'veg-mid', label: 'Milieu Croissance', order: 4, duration: 14 },
        { id: 'veg-late', label: 'Fin Croissance', order: 5, duration: 7 },
        { id: 'stretch-early', label: 'Début Stretch', order: 6, duration: 7 },
        { id: 'stretch-mid', label: 'Milieu Stretch', order: 7, duration: 7 },
        { id: 'stretch-late', label: 'Fin Stretch', order: 8, duration: 7 },
        { id: 'flower-early', label: 'Début Floraison', order: 9, duration: 14 },
        { id: 'flower-mid', label: 'Milieu Floraison', order: 10, duration: 14 },
        { id: 'flower-late', label: 'Fin Floraison', order: 11, duration: 14 }
    ]
}

export const CURING_PHASES = {
    phases: [
        { id: 'drying', label: 'Séchage', order: 0, duration: 7 },
        { id: 'early-cure', label: 'Début curing', order: 1, duration: 14 },
        { id: 'maturation', label: 'Maturation/Affinage', order: 2, duration: 30 },
        { id: 'final', label: 'Fin', order: 3, duration: 30 }
    ]
}

export const SEPARATION_PHASES = null // Pas de phases, basé sur le temps

export const PURIFICATION_PHASES = null // Passes successives, pas de phases

export const EXTRACTION_PHASES = null // Basé sur le temps

export const RECIPE_PHASES = {
    phases: [
        { id: 'prep', label: 'Préparation', order: 0 },
        { id: 'mix', label: 'Mélange', order: 1 },
        { id: 'cook', label: 'Cuisson', order: 2 },
        { id: 'cool', label: 'Refroidissement', order: 3 },
        { id: 'finish', label: 'Finition', order: 4 }
    ]
}
