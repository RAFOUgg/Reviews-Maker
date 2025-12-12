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
      { id: 'citrus', name: 'Citrus', intensity: 'forte' },
      { id: 'lemon', name: 'Citron', intensity: 'forte' },
      { id: 'orange', name: 'Orange', intensity: 'moyenne' },
      { id: 'grapefruit', name: 'Pamplemousse', intensity: 'forte' },
      { id: 'lime', name: 'Lime', intensity: 'moyenne' },
      { id: 'berry', name: 'Baies', intensity: 'moyenne' },
      { id: 'strawberry', name: 'Fraise', intensity: 'douce' },
      { id: 'blueberry', name: 'Myrtille', intensity: 'douce' },
      { id: 'raspberry', name: 'Framboise', intensity: 'moyenne' },
      { id: 'blackberry', name: 'Mûre', intensity: 'moyenne' },
      { id: 'grape', name: 'Raisin', intensity: 'douce' },
      { id: 'mango', name: 'Mangue', intensity: 'forte' },
      { id: 'pineapple', name: 'Ananas', intensity: 'forte' },
      { id: 'apple', name: 'Pomme', intensity: 'douce' },
      { id: 'pear', name: 'Poire', intensity: 'douce' },
      { id: 'peach', name: 'Pêche', intensity: 'douce' },
      { id: 'apricot', name: 'Abricot', intensity: 'douce' },
      { id: 'cherry', name: 'Cerise', intensity: 'moyenne' },
      { id: 'plum', name: 'Prune', intensity: 'moyenne' },
      { id: 'melon', name: 'Melon', intensity: 'douce' },
      { id: 'watermelon', name: 'Pastèque', intensity: 'douce' },
      { id: 'tropical', name: 'Fruits tropicaux', intensity: 'forte' },
    ]
  },
  
  earthy: {
    id: 'earthy',
    label: 'Terreux',
    color: '#8B4513',
    icon: '🌍',
    notes: [
      { id: 'soil', name: 'Terre', intensity: 'moyenne' },
      { id: 'moss', name: 'Mousse', intensity: 'douce' },
      { id: 'humid', name: 'Humide', intensity: 'moyenne' },
      { id: 'mushroom', name: 'Champignon', intensity: 'forte' },
      { id: 'wood', name: 'Bois', intensity: 'moyenne' },
      { id: 'oak', name: 'Chêne', intensity: 'moyenne' },
      { id: 'cedar', name: 'Cèdre', intensity: 'forte' },
      { id: 'sandalwood', name: 'Bois de santal', intensity: 'douce' },
      { id: 'patchouli', name: 'Patchouli', intensity: 'forte' },
      { id: 'hay', name: 'Foin', intensity: 'moyenne' },
      { id: 'grass', name: 'Herbe coupée', intensity: 'forte' },
      { id: 'tobacco', name: 'Tabac', intensity: 'forte' },
      { id: 'leather', name: 'Cuir', intensity: 'moyenne' },
      { id: 'coffee', name: 'Café', intensity: 'forte' },
      { id: 'cocoa', name: 'Cacao', intensity: 'moyenne' },
    ]
  },

  spicy: {
    id: 'spicy',
    label: 'Épicé',
    color: '#DC143C',
    icon: '🌶️',
    notes: [
      { id: 'pepper', name: 'Poivre', intensity: 'forte' },
      { id: 'black-pepper', name: 'Poivre noir', intensity: 'forte' },
      { id: 'white-pepper', name: 'Poivre blanc', intensity: 'moyenne' },
      { id: 'clove', name: 'Clou de girofle', intensity: 'forte' },
      { id: 'cinnamon', name: 'Cannelle', intensity: 'moyenne' },
      { id: 'nutmeg', name: 'Noix de muscade', intensity: 'moyenne' },
      { id: 'anise', name: 'Anis', intensity: 'forte' },
      { id: 'ginger', name: 'Gingembre', intensity: 'forte' },
      { id: 'cardamom', name: 'Cardamome', intensity: 'moyenne' },
      { id: 'curry', name: 'Curry', intensity: 'forte' },
      { id: 'wasabi', name: 'Wasabi', intensity: 'très forte' },
      { id: 'chili', name: 'Piment', intensity: 'très forte' },
      { id: 'horseradish', name: 'Raifort', intensity: 'très forte' },
    ]
  },

  herbal: {
    id: 'herbal',
    label: 'Herbacé',
    color: '#228B22',
    icon: '🌿',
    notes: [
      { id: 'mint', name: 'Menthe', intensity: 'forte' },
      { id: 'eucalyptus', name: 'Eucalyptus', intensity: 'forte' },
      { id: 'basil', name: 'Basilic', intensity: 'moyenne' },
      { id: 'rosemary', name: 'Romarin', intensity: 'forte' },
      { id: 'thyme', name: 'Thym', intensity: 'moyenne' },
      { id: 'sage', name: 'Sauge', intensity: 'forte' },
      { id: 'lavender', name: 'Lavande', intensity: 'douce' },
      { id: 'chamomile', name: 'Camomille', intensity: 'douce' },
      { id: 'tea', name: 'Thé', intensity: 'moyenne' },
      { id: 'green-tea', name: 'Thé vert', intensity: 'douce' },
      { id: 'oregano', name: 'Origan', intensity: 'forte' },
      { id: 'dill', name: 'Aneth', intensity: 'moyenne' },
      { id: 'parsley', name: 'Persil', intensity: 'douce' },
      { id: 'cilantro', name: 'Coriandre', intensity: 'forte' },
      { id: 'tarragon', name: 'Estragon', intensity: 'moyenne' },
    ]
  },

  floral: {
    id: 'floral',
    label: 'Floral',
    color: '#FF69B4',
    icon: '🌸',
    notes: [
      { id: 'rose', name: 'Rose', intensity: 'douce' },
      { id: 'jasmine', name: 'Jasmin', intensity: 'douce' },
      { id: 'lilac', name: 'Lilas', intensity: 'douce' },
      { id: 'violet', name: 'Violette', intensity: 'douce' },
      { id: 'honeysuckle', name: 'Chèvrefeuille', intensity: 'douce' },
      { id: 'orange-blossom', name: 'Fleur d\'oranger', intensity: 'moyenne' },
      { id: 'hibiscus', name: 'Hibiscus', intensity: 'douce' },
      { id: 'magnolia', name: 'Magnolia', intensity: 'douce' },
      { id: 'gardenia', name: 'Gardénia', intensity: 'forte' },
      { id: 'peony', name: 'Pivoine', intensity: 'douce' },
      { id: 'lotus', name: 'Lotus', intensity: 'douce' },
    ]
  },

  sweet: {
    id: 'sweet',
    label: 'Sucré',
    color: '#FFB6C1',
    icon: '🍬',
    notes: [
      { id: 'honey', name: 'Miel', intensity: 'douce' },
      { id: 'caramel', name: 'Caramel', intensity: 'moyenne' },
      { id: 'vanilla', name: 'Vanille', intensity: 'douce' },
      { id: 'chocolate', name: 'Chocolat', intensity: 'moyenne' },
      { id: 'butterscotch', name: 'Caramel au beurre', intensity: 'douce' },
      { id: 'molasses', name: 'Mélasse', intensity: 'forte' },
      { id: 'brown-sugar', name: 'Cassonade', intensity: 'douce' },
      { id: 'maple', name: 'Érable', intensity: 'douce' },
      { id: 'candy', name: 'Bonbon', intensity: 'moyenne' },
      { id: 'cotton-candy', name: 'Barbe à papa', intensity: 'douce' },
      { id: 'sugar', name: 'Sucre', intensity: 'douce' },
      { id: 'toffee', name: 'Toffee', intensity: 'moyenne' },
    ]
  },

  pine: {
    id: 'pine',
    label: 'Pin & Résine',
    color: '#2E8B57',
    icon: '🌲',
    notes: [
      { id: 'pine', name: 'Pin', intensity: 'forte' },
      { id: 'fir', name: 'Sapin', intensity: 'forte' },
      { id: 'resin', name: 'Résine', intensity: 'très forte' },
      { id: 'turpentine', name: 'Térébenthine', intensity: 'forte' },
      { id: 'cypress', name: 'Cyprès', intensity: 'moyenne' },
      { id: 'juniper', name: 'Genévrier', intensity: 'forte' },
      { id: 'spruce', name: 'Épicéa', intensity: 'forte' },
    ]
  },

  diesel: {
    id: 'diesel',
    label: 'Diesel & Chimique',
    color: '#696969',
    icon: '⛽',
    notes: [
      { id: 'diesel', name: 'Diesel', intensity: 'très forte' },
      { id: 'gas', name: 'Essence', intensity: 'très forte' },
      { id: 'fuel', name: 'Carburant', intensity: 'très forte' },
      { id: 'chemical', name: 'Chimique', intensity: 'forte' },
      { id: 'ammonia', name: 'Ammoniaque', intensity: 'très forte' },
      { id: 'skunk', name: 'Skunk', intensity: 'très forte' },
      { id: 'rubber', name: 'Caoutchouc', intensity: 'forte' },
      { id: 'plastic', name: 'Plastique', intensity: 'moyenne' },
    ]
  },

  nutty: {
    id: 'nutty',
    label: 'Noisette & Noix',
    color: '#CD853F',
    icon: '🥜',
    notes: [
      { id: 'almond', name: 'Amande', intensity: 'douce' },
      { id: 'hazelnut', name: 'Noisette', intensity: 'douce' },
      { id: 'walnut', name: 'Noix', intensity: 'moyenne' },
      { id: 'peanut', name: 'Cacahuète', intensity: 'moyenne' },
      { id: 'chestnut', name: 'Châtaigne', intensity: 'douce' },
      { id: 'pistachio', name: 'Pistache', intensity: 'douce' },
      { id: 'cashew', name: 'Cajou', intensity: 'douce' },
      { id: 'pecan', name: 'Pécan', intensity: 'douce' },
      { id: 'macadamia', name: 'Macadamia', intensity: 'douce' },
    ]
  },

  creamy: {
    id: 'creamy',
    label: 'Crémeux',
    color: '#FAEBD7',
    icon: '🥛',
    notes: [
      { id: 'cream', name: 'Crème', intensity: 'douce' },
      { id: 'butter', name: 'Beurre', intensity: 'douce' },
      { id: 'milk', name: 'Lait', intensity: 'douce' },
      { id: 'yogurt', name: 'Yaourt', intensity: 'douce' },
      { id: 'cheese', name: 'Fromage', intensity: 'forte' },
      { id: 'custard', name: 'Crème anglaise', intensity: 'douce' },
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
  { value: 3, label: 'Légère', color: 'text-blue-400' },
  { value: 4, label: 'Modérée faible', color: 'text-blue-500' },
  { value: 5, label: 'Modérée', color: 'text-green-500' },
  { value: 6, label: 'Modérée forte', color: 'text-green-600' },
  { value: 7, label: 'Forte', color: 'text-yellow-500' },
  { value: 8, label: 'Très forte', color: 'text-orange-500' },
  { value: 9, label: 'Puissante', color: 'text-red-500' },
  { value: 10, label: 'Exceptionnelle', color: 'text-purple-600' }
];

/**
 * Niveaux d'agressivité/piquant
 */
export const AGGRESSIVENESS_LEVELS = [
  { value: 1, label: 'Très doux', color: 'text-green-600' },
  { value: 2, label: 'Doux', color: 'text-green-500' },
  { value: 3, label: 'Agréable', color: 'text-blue-500' },
  { value: 4, label: 'Léger', color: 'text-blue-400' },
  { value: 5, label: 'Modéré', color: 'text-yellow-500' },
  { value: 6, label: 'Présent', color: 'text-yellow-600' },
  { value: 7, label: 'Piquant', color: 'text-orange-500' },
  { value: 8, label: 'Très piquant', color: 'text-orange-600' },
  { value: 9, label: 'Agressif', color: 'text-red-500' },
  { value: 10, label: 'Très agressif', color: 'text-red-600' }
];
