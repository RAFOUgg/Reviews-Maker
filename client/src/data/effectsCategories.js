/**
 * Catégories d'effets pour cannabis - Système complet
 * Utilisé pour sections Effets Ressentis (Hash, Concentrés, Fleurs)
 * Source: data/effects.json du projet
 */

export const EFFECTS_CATEGORIES = {
    mental: {
        id: 'mental',
        label: 'Effets Mentaux',
        icon: '🧠',
        color: '#8B5CF6',
        positive: [
            { id: 'relaxant', name: 'Relaxant', type: 'mental' },
            { id: 'apaisant', name: 'Apaisant', type: 'mental' },
            { id: 'euphorique', name: 'Euphorique', type: 'mental' },
            { id: 'heureux', name: 'Heureux', type: 'mental' },
            { id: 'energisant', name: 'Énergisant', type: 'mental' },
            { id: 'stimulant', name: 'Stimulant', type: 'mental' },
            { id: 'creatif', name: 'Créatif', type: 'mental' },
            { id: 'concentre', name: 'Concentré', type: 'mental' },
            { id: 'motivant', name: 'Motivant', type: 'mental' },
            { id: 'sociable', name: 'Sociable', type: 'mental' },
            { id: 'rire', name: 'Rire', type: 'mental' },
            { id: 'lucide', name: 'Lucide', type: 'mental' }
        ],
        negative: [
            { id: 'paranoia', name: 'Paranoïa', type: 'mental' },
            { id: 'anxiete', name: 'Anxiété', type: 'mental' },
            { id: 'confusion', name: 'Confusion', type: 'mental' }
        ]
    },

    physical: {
        id: 'physical',
        label: 'Effets Physiques',
        icon: '💪',
        color: '#10B981',
        positive: [
            { id: 'detente-musculaire', name: 'Détente musculaire', type: 'physical' },
            { id: 'soulagement-douleur', name: 'Soulagement douleur', type: 'physical' },
            { id: 'anti-inflammatoire', name: 'Anti-inflammatoire', type: 'physical' },
            { id: 'sedatif', name: 'Sédatif', type: 'physical' },
            { id: 'appetit-stimule', name: 'Appétit stimulé', type: 'physical' },
            { id: 'sensation-corporelle', name: 'Sensation corporelle', type: 'physical' },
            { id: 'fourmillements', name: 'Fourmillements', type: 'physical' },
            { id: 'sensation-chaleur', name: 'Sensation de chaleur', type: 'physical' }
        ],
        negative: [
            { id: 'bouche-seche', name: 'Bouche sèche', type: 'physical' },
            { id: 'yeux-secs', name: 'Yeux secs', type: 'physical' },
            { id: 'etourdissements', name: 'Étourdissements', type: 'physical' },
            { id: 'fatigue-intense', name: 'Fatigue intense', type: 'physical' },
            { id: 'somnolence-excessive', name: 'Somnolence excessive', type: 'physical' }
        ]
    },

    therapeutic: {
        id: 'therapeutic',
        label: 'Effets Thérapeutiques',
        icon: '⚕️',
        color: '#3B82F6',
        items: [
            { id: 'anti-stress', name: 'Anti-stress', type: 'therapeutic' },
            { id: 'anti-anxiete', name: 'Anti-anxiété', type: 'therapeutic' },
            { id: 'anti-depression', name: 'Anti-dépression', type: 'therapeutic' },
            { id: 'aide-sommeil', name: 'Aide au sommeil', type: 'therapeutic' },
            { id: 'anti-nausee', name: 'Anti-nausée', type: 'therapeutic' },
            { id: 'anti-migraines', name: 'Anti-migraines', type: 'therapeutic' },
            { id: 'anti-spasmes', name: 'Anti-spasmes', type: 'therapeutic' },
            { id: 'augmentation-appetit', name: 'Augmentation appétit', type: 'therapeutic' },
            { id: 'focus', name: 'Focus', type: 'therapeutic' }
        ]
    }
};

/**
 * Récupère tous les effets par catégorie
 */
export const getAllEffects = () => {
    const allEffects = [];

    // Effets mentaux positifs/négatifs
    EFFECTS_CATEGORIES.mental.positive.forEach(effect => {
        allEffects.push({ ...effect, category: 'mental', sentiment: 'positive' });
    });
    EFFECTS_CATEGORIES.mental.negative.forEach(effect => {
        allEffects.push({ ...effect, category: 'mental', sentiment: 'negative' });
    });

    // Effets physiques positifs/négatifs
    EFFECTS_CATEGORIES.physical.positive.forEach(effect => {
        allEffects.push({ ...effect, category: 'physical', sentiment: 'positive' });
    });
    EFFECTS_CATEGORIES.physical.negative.forEach(effect => {
        allEffects.push({ ...effect, category: 'physical', sentiment: 'negative' });
    });

    // Effets thérapeutiques (neutres)
    EFFECTS_CATEGORIES.therapeutic.items.forEach(effect => {
        allEffects.push({ ...effect, category: 'therapeutic', sentiment: 'neutral' });
    });

    return allEffects;
};

/**
 * Récupère les effets par catégorie et sentiment
 */
export const getEffectsByFilter = (category = null, sentiment = null) => {
    const allEffects = getAllEffects();

    return allEffects.filter(effect => {
        const matchCategory = category ? effect.category === category : true;
        const matchSentiment = sentiment ? effect.sentiment === sentiment : true;
        return matchCategory && matchSentiment;
    });
};

/**
 * Niveaux de montée (rapidité)
 */
export const ONSET_LEVELS = [
    { value: 1, label: 'Très lente', color: '', time: '30+ min' },
    { value: 2, label: 'Lente', color: '', time: '20-30 min' },
    { value: 3, label: 'Modérée lente', color: '', time: '15-20 min' },
    { value: 4, label: 'Modérée', color: 'text-green-400', time: '10-15 min' },
    { value: 5, label: 'Normale', color: 'text-green-500', time: '5-10 min' },
    { value: 6, label: 'Assez rapide', color: 'text-yellow-500', time: '3-5 min' },
    { value: 7, label: 'Rapide', color: 'text-orange-400', time: '2-3 min' },
    { value: 8, label: 'Très rapide', color: 'text-orange-500', time: '1-2 min' },
    { value: 9, label: 'Immédiate', color: 'text-red-500', time: '< 1 min' },
    { value: 10, label: 'Instantanée', color: 'text-red-600', time: '< 30 sec' }
];

/**
 * Niveaux d'intensité des effets
 */
export const INTENSITY_LEVELS = [
    { value: 1, label: 'Très faible', color: 'text-gray-400' },
    { value: 2, label: 'Faible', color: 'text-gray-500' },
    { value: 3, label: 'Légère', color: '' },
    { value: 4, label: 'Modérée faible', color: '' },
    { value: 5, label: 'Modérée', color: 'text-green-500' },
    { value: 6, label: 'Modérée forte', color: 'text-green-600' },
    { value: 7, label: 'Forte', color: 'text-yellow-500' },
    { value: 8, label: 'Très forte', color: 'text-orange-500' },
    { value: 9, label: 'Puissante', color: 'text-red-500' },
    { value: 10, label: 'Extrême', color: '' }
];

/**
 * Options de durée des effets
 */
export const DURATION_OPTIONS = [
    { id: '5-15min', label: '5-15 min', value: 10 },
    { id: '15-30min', label: '15-30 min', value: 22.5 },
    { id: '30-60min', label: '30-60 min', value: 45 },
    { id: '1-2h', label: '1-2 h', value: 90 },
    { id: '2h+', label: '2 h+', value: 150 },
    { id: '4h+', label: '4 h+', value: 300 },
    { id: '8h+', label: '8 h+', value: 600 },
    { id: '24h+', label: '24 h+', value: 1440 }
];
