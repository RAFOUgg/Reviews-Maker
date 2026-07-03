/**
 * Notes gustatives pour cannabis - Système complet par familles
 * Utilisé pour sections Goûts (Hash, Concentrés, Fleurs)
 */

export const TASTE_FAMILIES = {
    fruity: {
        id: 'fruity',
        label: 'Fruité',
        color: '#FF6B9D',
        icon: '🍓',
        notes: [
            { id: 'citrus', name: 'Citrus', intensity: 'forte', icon: '🍋' },
            { id: 'lemon', name: 'Citron', intensity: 'forte', icon: '🍋' },
            { id: 'orange', name: 'Orange', intensity: 'moyenne', icon: '🍊' },
            { id: 'grapefruit', name: 'Pamplemousse', intensity: 'forte', icon: '🍊' },
            { id: 'lime', name: 'Lime', intensity: 'moyenne', icon: '🍋' },
            { id: 'berry', name: 'Baies', intensity: 'moyenne', icon: '🫐' },
            { id: 'strawberry', name: 'Fraise', intensity: 'douce', icon: '🍓' },
            { id: 'blueberry', name: 'Myrtille', intensity: 'douce', icon: '🫐' },
            { id: 'raspberry', name: 'Framboise', intensity: 'moyenne', icon: '🍓' },
            { id: 'blackberry', name: 'Mûre', intensity: 'moyenne', icon: '🫐' },
            { id: 'grape', name: 'Raisin', intensity: 'douce', icon: '🍇' },
            { id: 'mango', name: 'Mangue', intensity: 'forte', icon: '🥭' },
            { id: 'pineapple', name: 'Ananas', intensity: 'forte', icon: '🍍' },
            { id: 'apple', name: 'Pomme', intensity: 'douce', icon: '🍎' },
            { id: 'pear', name: 'Poire', intensity: 'douce', icon: '🍐' },
            { id: 'peach', name: 'Pêche', intensity: 'douce', icon: '🍑' },
            { id: 'apricot', name: 'Abricot', intensity: 'douce', icon: '🍑' },
            { id: 'cherry', name: 'Cerise', intensity: 'moyenne', icon: '🍒' },
            { id: 'plum', name: 'Prune', intensity: 'moyenne', icon: '🍑' },
            { id: 'melon', name: 'Melon', intensity: 'douce', icon: '🍈' },
            { id: 'watermelon', name: 'Pastèque', intensity: 'douce', icon: '🍉' },
            { id: 'tropical', name: 'Fruits tropicaux', intensity: 'forte', icon: '🥭' },
        ]
    },

    earthy: {
        id: 'earthy',
        label: 'Terreux',
        color: '#8B4513',
        icon: '🌍',
        notes: [
            { id: 'soil', name: 'Terre', intensity: 'moyenne', icon: '🌍' },
            { id: 'moss', name: 'Mousse', intensity: 'douce', icon: '🍃' },
            { id: 'humid', name: 'Humide', intensity: 'moyenne', icon: '💧' },
            { id: 'mushroom', name: 'Champignon', intensity: 'forte', icon: '🍄' },
            { id: 'wood', name: 'Bois', intensity: 'moyenne', icon: '🪵' },
            { id: 'oak', name: 'Chêne', intensity: 'moyenne', icon: '🌳' },
            { id: 'cedar', name: 'Cèdre', intensity: 'forte', icon: '🌲' },
            { id: 'sandalwood', name: 'Bois de santal', intensity: 'douce', icon: '🪵' },
            { id: 'patchouli', name: 'Patchouli', intensity: 'forte', icon: '🍃' },
            { id: 'hay', name: 'Foin', intensity: 'moyenne', icon: '🌾' },
            { id: 'grass', name: 'Herbe coupée', intensity: 'forte', icon: '🌿' },
            { id: 'tobacco', name: 'Tabac', intensity: 'forte', icon: '🚬' },
            { id: 'leather', name: 'Cuir', intensity: 'moyenne', icon: '👜' },
            { id: 'coffee', name: 'Café', intensity: 'forte', icon: '☕' },
            { id: 'cocoa', name: 'Cacao', intensity: 'moyenne', icon: '🍫' },
        ]
    },

    spicy: {
        id: 'spicy',
        label: 'Épicé',
        color: '#DC143C',
        icon: '🌶️',
        notes: [
            { id: 'pepper', name: 'Poivre', intensity: 'forte', icon: '🌶️' },
            { id: 'black-pepper', name: 'Poivre noir', intensity: 'forte', icon: '⚫' },
            { id: 'white-pepper', name: 'Poivre blanc', intensity: 'moyenne', icon: '⚪' },
            { id: 'clove', name: 'Clou de girofle', intensity: 'forte', icon: '🌰' },
            { id: 'cinnamon', name: 'Cannelle', intensity: 'moyenne', icon: '🥖' },
            { id: 'nutmeg', name: 'Noix de muscade', intensity: 'moyenne', icon: '🥜' },
            { id: 'anise', name: 'Anis', intensity: 'forte', icon: '⭐' },
            { id: 'ginger', name: 'Gingembre', intensity: 'forte', icon: '🫚' },
            { id: 'cardamom', name: 'Cardamome', intensity: 'moyenne', icon: '🌰' },
            { id: 'curry', name: 'Curry', intensity: 'forte', icon: '🍛' },
            { id: 'wasabi', name: 'Wasabi', intensity: 'très forte', icon: '🟢' },
            { id: 'chili', name: 'Piment', intensity: 'très forte', icon: '🌶️' },
            { id: 'horseradish', name: 'Raifort', intensity: 'très forte', icon: '🌿' },
        ]
    },

    herbal: {
        id: 'herbal',
        label: 'Herbacé',
        color: '#228B22',
        icon: '🌿',
        notes: [
            { id: 'mint', name: 'Menthe', intensity: 'forte', icon: '🌱' },
            { id: 'eucalyptus', name: 'Eucalyptus', intensity: 'forte', icon: '🌿' },
            { id: 'basil', name: 'Basilic', intensity: 'moyenne', icon: '🌿' },
            { id: 'rosemary', name: 'Romarin', intensity: 'forte', icon: '🌿' },
            { id: 'thyme', name: 'Thym', intensity: 'moyenne', icon: '🌿' },
            { id: 'sage', name: 'Sauge', intensity: 'forte', icon: '🍃' },
            { id: 'lavender', name: 'Lavande', intensity: 'douce', icon: '💜' },
            { id: 'chamomile', name: 'Camomille', intensity: 'douce', icon: '🌼' },
            { id: 'tea', name: 'Thé', intensity: 'moyenne', icon: '🍵' },
            { id: 'green-tea', name: 'Thé vert', intensity: 'douce', icon: '🍵' },
            { id: 'oregano', name: 'Origan', intensity: 'forte', icon: '🌿' },
            { id: 'dill', name: 'Aneth', intensity: 'moyenne', icon: '🌿' },
            { id: 'parsley', name: 'Persil', intensity: 'douce', icon: '🌿' },
            { id: 'cilantro', name: 'Coriandre', intensity: 'forte', icon: '🌿' },
            { id: 'tarragon', name: 'Estragon', intensity: 'moyenne', icon: '🍃' },
        ]
    },

    floral: {
        id: 'floral',
        label: 'Floral',
        color: '#FF69B4',
        icon: '🌸',
        notes: [
            { id: 'rose', name: 'Rose', intensity: 'douce', icon: '🌹' },
            { id: 'jasmine', name: 'Jasmin', intensity: 'douce', icon: '🤍' },
            { id: 'lilac', name: 'Lilas', intensity: 'douce', icon: '💜' },
            { id: 'violet', name: 'Violette', intensity: 'douce', icon: '💜' },
            { id: 'honeysuckle', name: 'Chèvrefeuille', intensity: 'douce', icon: '🌼' },
            { id: 'orange-blossom', name: 'Fleur d\'oranger', intensity: 'moyenne', icon: '🌼' },
            { id: 'hibiscus', name: 'Hibiscus', intensity: 'douce', icon: '🌺' },
            { id: 'magnolia', name: 'Magnolia', intensity: 'douce', icon: '🌸' },
            { id: 'gardenia', name: 'Gardénia', intensity: 'forte', icon: '🤍' },
            { id: 'peony', name: 'Pivoine', intensity: 'douce', icon: '🌸' },
            { id: 'lotus', name: 'Lotus', intensity: 'douce', icon: '🪷' },
        ]
    },

    sweet: {
        id: 'sweet',
        label: 'Sucré',
        color: '#FFB6C1',
        icon: '🍬',
        notes: [
            { id: 'honey', name: 'Miel', intensity: 'douce', icon: '🍯' },
            { id: 'caramel', name: 'Caramel', intensity: 'moyenne', icon: '🍮' },
            { id: 'vanilla', name: 'Vanille', intensity: 'douce', icon: '🤍' },
            { id: 'chocolate', name: 'Chocolat', intensity: 'moyenne', icon: '🍫' },
            { id: 'butterscotch', name: 'Caramel au beurre', intensity: 'douce', icon: '🧈' },
            { id: 'molasses', name: 'Mélasse', intensity: 'forte', icon: '🍯' },
            { id: 'brown-sugar', name: 'Cassonade', intensity: 'douce', icon: '🟤' },
            { id: 'maple', name: 'Érable', intensity: 'douce', icon: '🍁' },
            { id: 'candy', name: 'Bonbon', intensity: 'moyenne', icon: '🍬' },
            { id: 'cotton-candy', name: 'Barbe à papa', intensity: 'douce', icon: '🍭' },
            { id: 'sugar', name: 'Sucre', intensity: 'douce', icon: '🧂' },
            { id: 'toffee', name: 'Toffee', intensity: 'moyenne', icon: '🍬' },
        ]
    },

    pine: {
        id: 'pine',
        label: 'Pin & Résine',
        color: '#2E8B57',
        icon: '🌲',
        notes: [
            { id: 'pine', name: 'Pin', intensity: 'forte', icon: '🌲' },
            { id: 'fir', name: 'Sapin', intensity: 'forte', icon: '🎄' },
            { id: 'resin', name: 'Résine', intensity: 'très forte', icon: '💧' },
            { id: 'turpentine', name: 'Térébenthine', intensity: 'forte', icon: '🧪' },
            { id: 'cypress', name: 'Cyprès', intensity: 'moyenne', icon: '🌲' },
            { id: 'juniper', name: 'Genévrier', intensity: 'forte', icon: '🌲' },
            { id: 'spruce', name: 'Épicéa', intensity: 'forte', icon: '🌲' },
        ]
    },

    diesel: {
        id: 'diesel',
        label: 'Diesel & Chimique',
        color: '#696969',
        icon: '⛽',
        notes: [
            { id: 'diesel', name: 'Diesel', intensity: 'très forte', icon: '⛽' },
            { id: 'gas', name: 'Essence', intensity: 'très forte', icon: '⛽' },
            { id: 'fuel', name: 'Carburant', intensity: 'très forte', icon: '🛢️' },
            { id: 'chemical', name: 'Chimique', intensity: 'forte', icon: '🧪' },
            { id: 'ammonia', name: 'Ammoniaque', intensity: 'très forte', icon: '⚗️' },
            { id: 'skunk', name: 'Skunk', intensity: 'très forte', icon: '🦨' },
            { id: 'rubber', name: 'Caoutchouc', intensity: 'forte', icon: '⚫' },
            { id: 'plastic', name: 'Plastique', intensity: 'moyenne', icon: '🔲' },
        ]
    },

    nutty: {
        id: 'nutty',
        label: 'Noisette & Noix',
        color: '#CD853F',
        icon: '🥜',
        notes: [
            { id: 'almond', name: 'Amande', intensity: 'douce', icon: '🌰' },
            { id: 'hazelnut', name: 'Noisette', intensity: 'douce', icon: '🌰' },
            { id: 'walnut', name: 'Noix', intensity: 'moyenne', icon: '🥜' },
            { id: 'peanut', name: 'Cacahuète', intensity: 'moyenne', icon: '🥜' },
            { id: 'chestnut', name: 'Châtaigne', intensity: 'douce', icon: '🌰' },
            { id: 'pistachio', name: 'Pistache', intensity: 'douce', icon: '🥜' },
            { id: 'cashew', name: 'Cajou', intensity: 'douce', icon: '🥜' },
            { id: 'pecan', name: 'Pécan', intensity: 'douce', icon: '🥜' },
            { id: 'macadamia', name: 'Macadamia', intensity: 'douce', icon: '🥜' },
        ]
    },

    creamy: {
        id: 'creamy',
        label: 'Crémeux',
        color: '#FAEBD7',
        icon: '🥛',
        notes: [
            { id: 'cream', name: 'Crème', intensity: 'douce', icon: '🥛' },
            { id: 'butter', name: 'Beurre', intensity: 'douce', icon: '🧈' },
            { id: 'milk', name: 'Lait', intensity: 'douce', icon: '🥛' },
            { id: 'yogurt', name: 'Yaourt', intensity: 'douce', icon: '🥛' },
            { id: 'cheese', name: 'Fromage', intensity: 'forte', icon: '🧀' },
            { id: 'custard', name: 'Crème anglaise', intensity: 'douce', icon: '🍮' },
        ]
    }
};

/**
 * Récupère toutes les notes gustatives triées par famille
 */
export const getAllTasteNotes = () => {
    const allNotes = [];
    Object.values(TASTE_FAMILIES).forEach(family => {
        family.notes.forEach(note => {
            allNotes.push({
                ...note,
                familyId: family.id,
                familyLabel: family.label,
                familyColor: family.color,
                familyIcon: family.icon
            });
        });
    });
    return allNotes;
};

/**
 * Récupère une note par son ID
 */
export const getTasteNoteById = (noteId) => {
    const allNotes = getAllTasteNotes();
    return allNotes.find(note => note.id === noteId);
};

/**
 * Récupère toutes les notes d'une famille
 */
export const getNotesByFamily = (familyId) => {
    return TASTE_FAMILIES[familyId]?.notes || [];
};

/**
 * Niveaux d'intensité gustative
 */
export const TASTE_INTENSITY_LEVELS = [
    { value: 1, label: 'Très faible', color: 'text-gray-400' },
    { value: 2, label: 'Faible', color: 'text-gray-500' },
    { value: 3, label: 'Légère', color: '' },
    { value: 4, label: 'Modérée faible', color: '' },
    { value: 5, label: 'Modérée', color: 'text-green-500' },
    { value: 6, label: 'Modérée forte', color: 'text-green-600' },
    { value: 7, label: 'Forte', color: 'text-yellow-500' },
    { value: 8, label: 'Très forte', color: 'text-orange-500' },
    { value: 9, label: 'Puissante', color: 'text-red-500' },
    { value: 10, label: 'Exceptionnelle', color: '' }
];

/**
 * Niveaux d'agressivité/piquant — pertinent pour Fleur/Hash/Concentré (piquant en gorge à
 * l'inhalation). Non applicable aux comestibles (aucune combustion/inhalation) : voir
 * EDIBLE_AFTERTASTE_LEVELS pour l'équivalent adapté à la dégustation en bouche.
 */
export const AGGRESSIVENESS_LEVELS = [
    { value: 1, label: 'Très doux', color: 'text-green-600' },
    { value: 2, label: 'Doux', color: 'text-green-500' },
    { value: 3, label: 'Agréable', color: '' },
    { value: 4, label: 'Léger', color: '' },
    { value: 5, label: 'Modéré', color: 'text-yellow-500' },
    { value: 6, label: 'Présent', color: 'text-yellow-600' },
    { value: 7, label: 'Piquant', color: 'text-orange-500' },
    { value: 8, label: 'Très piquant', color: 'text-orange-600' },
    { value: 9, label: 'Agressif', color: 'text-red-500' },
    { value: 10, label: 'Très agressif', color: 'text-red-600' }
];

/**
 * Persistance en bouche / arrière-goût — remplace AGGRESSIVENESS_LEVELS pour les comestibles :
 * dimension réellement spécifique à la dégustation (masquage du goût cannabis par la recette,
 * durée de l'arrière-goût), sans équivalent pertinent en "piquant à l'inhalation".
 */
export const EDIBLE_AFTERTASTE_LEVELS = [
    { value: 1, label: 'Inexistante (goût cannabis totalement masqué)', color: 'text-green-600' },
    { value: 2, label: 'Très légère', color: 'text-green-500' },
    { value: 3, label: 'Légère', color: '' },
    { value: 4, label: 'Perceptible', color: '' },
    { value: 5, label: 'Modérée', color: 'text-yellow-500' },
    { value: 6, label: 'Présente', color: 'text-yellow-600' },
    { value: 7, label: 'Marquée', color: 'text-orange-500' },
    { value: 8, label: 'Longue en bouche', color: 'text-orange-600' },
    { value: 9, label: 'Très persistante', color: 'text-red-500' },
    { value: 10, label: 'Goût cannabis dominant et persistant', color: 'text-red-600' }
];
