/**
 * CULTURE_PHASES - 12 phases prédéfinies pour pipeline culture Fleurs
 * Conforme CDC : Graine → Germination → Croissance → Stretch → Floraison
 */
export const CULTURE_PHASES = [
    {
        id: 'day-0',
        name: 'Jour 0 - Graine',
        icon: '🌰',
        color: '#8B4513',
        duration: 1,
        description: 'Graine avant germination'
    },
    {
        id: 'germination',
        name: 'Germination',
        icon: '🌱',
        color: '#90EE90',
        duration: 3,
        description: 'Germination et apparition radicule'
    },
    {
        id: 'plantule',
        name: 'Plantule',
        icon: '🌿',
        color: '#32CD32',
        duration: 7,
        description: 'Premières vraies feuilles'
    },
    {
        id: 'croissance-debut',
        name: 'Début Croissance',
        icon: '🌳',
        color: '#228B22',
        duration: 7,
        description: 'Croissance végétative initiale'
    },
    {
        id: 'croissance-milieu',
        name: 'Milieu Croissance',
        icon: '🌲',
        color: '#006400',
        duration: 7,
        description: 'Développement végétatif intense'
    },
    {
        id: 'croissance-fin',
        name: 'Fin Croissance',
        icon: '🎋',
        color: '#2F4F2F',
        duration: 7,
        description: 'Préparation au passage en floraison'
    },
    {
        id: 'stretch-debut',
        name: 'Début Stretch',
        icon: '📈',
        color: '#FFD700',
        duration: 7,
        description: 'Élongation des entre-nœuds'
    },
    {
        id: 'stretch-milieu',
        name: 'Milieu Stretch',
        icon: '🌾',
        color: '#FFA500',
        duration: 7,
        description: 'Croissance maximale en hauteur'
    },
    {
        id: 'stretch-fin',
        name: 'Fin Stretch',
        icon: '🌺',
        color: '#FF8C00',
        duration: 7,
        description: 'Ralentissement croissance verticale'
    },
    {
        id: 'floraison-debut',
        name: 'Début Floraison',
        icon: '🌸',
        color: '#FF69B4',
        duration: 14,
        description: 'Apparition premiers pistils'
    },
    {
        id: 'floraison-milieu',
        name: 'Milieu Floraison',
        icon: '🌼',
        color: '#FF1493',
        duration: 14,
        description: 'Développement des buds'
    },
    {
        id: 'floraison-fin',
        name: 'Fin Floraison',
        icon: '💐',
        color: '#C71585',
        duration: 14,
        description: 'Maturation finale et récolte'
    }
];

/**
 * Calcule la durée totale des phases en jours
 */
export const getTotalPhaseDuration = () => {
    return CULTURE_PHASES.reduce((sum, phase) => sum + phase.duration, 0);
};

/**
 * Récupère une phase par son ID
 */
export const getPhaseById = (phaseId) => {
    return CULTURE_PHASES.find(p => p.id === phaseId);
};

/**
 * Récupère l'index d'une phase
 */
export const getPhaseIndex = (phaseId) => {
    return CULTURE_PHASES.findIndex(p => p.id === phaseId);
};
