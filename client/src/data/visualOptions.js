// Data: Nuancier couleurs cannabis et options visuelles
// Utilisé pour la section Visuel & Technique

export const CANNABIS_COLORS = {
  vert: {
    label: 'Vert',
    shades: [
      { id: 'vert-clair', name: 'Vert Clair', hex: '#9ACD32', value: 1 },
      { id: 'vert-lime', name: 'Vert Lime', hex: '#7FFF00', value: 2 },
      { id: 'vert-foret', name: 'Vert Forêt', hex: '#228B22', value: 3 },
      { id: 'vert-olive', name: 'Vert Olive', hex: '#556B2F', value: 4 },
      { id: 'vert-fonce', name: 'Vert Foncé', hex: '#006400', value: 5 }
    ]
  },
  violet: {
    label: 'Violet',
    shades: [
      { id: 'violet-clair', name: 'Violet Clair', hex: '#DA70D6', value: 6 },
      { id: 'violet-moyen', name: 'Violet Moyen', hex: '#9370DB', value: 7 },
      { id: 'violet-profond', name: 'Violet Profond', hex: '#4B0082', value: 8 },
      { id: 'prune', name: 'Prune', hex: '#8B008B', value: 9 }
    ]
  },
  orange: {
    label: 'Orange',
    shades: [
      { id: 'orange-clair', name: 'Orange Clair', hex: '#FFA500', value: 10 },
      { id: 'orange-brule', name: 'Orange Brûlé', hex: '#FF8C00', value: 11 },
      { id: 'cuivre', name: 'Cuivré', hex: '#CD853F', value: 12 }
    ]
  },
  brun: {
    label: 'Brun',
    shades: [
      { id: 'brun-clair', name: 'Brun Clair', hex: '#D2691E', value: 13 },
      { id: 'brun-moyen', name: 'Brun Moyen', hex: '#8B4513', value: 14 },
      { id: 'brun-fonce', name: 'Brun Foncé', hex: '#654321', value: 15 }
    ]
  },
  jaune: {
    label: 'Jaune',
    shades: [
      { id: 'jaune-or', name: 'Jaune Or', hex: '#FFD700', value: 16 },
      { id: 'ambre', name: 'Ambré', hex: '#FFBF00', value: 17 },
      { id: 'miel', name: 'Miel', hex: '#FFA500', value: 18 }
    ]
  },
  blanc: {
    label: 'Blanc',
    shades: [
      { id: 'blanc-creme', name: 'Blanc Crème', hex: '#FFFACD', value: 19 },
      { id: 'blanc-glace', name: 'Blanc Glacé', hex: '#F0F8FF', value: 20 }
    ]
  },
  gris: {
    label: 'Gris',
    shades: [
      { id: 'gris-clair', name: 'Gris Clair', hex: '#D3D3D3', value: 21 },
      { id: 'gris-moyen', name: 'Gris Moyen', hex: '#A9A9A9', value: 22 },
      { id: 'gris-fonce', name: 'Gris Foncé', hex: '#696969', value: 23 }
    ]
  }
};

// Obtenir toutes les nuances triées par valeur
export const getAllColorShades = () => {
  const allShades = [];
  Object.values(CANNABIS_COLORS).forEach(colorFamily => {
    allShades.push(...colorFamily.shades);
  });
  return allShades.sort((a, b) => a.value - b.value);
};

// Obtenir couleur par ID
export const getColorById = (id) => {
  const allShades = getAllColorShades();
  return allShades.find(shade => shade.id === id);
};

// Obtenir note sur 10 depuis valeur couleur
export const getColorRating = (colorValue) => {
  // Mapping simple : diviser par 2.3 pour avoir une note sur 10
  return Math.min(10, Math.ceil(colorValue / 2.3));
};

// Options visuelles communes
export const VISUAL_QUALITY_LEVELS = [
  { value: 1, label: 'Très mauvais', color: 'text-red-600' },
  { value: 2, label: 'Mauvais', color: 'text-red-500' },
  { value: 3, label: 'Médiocre', color: 'text-orange-500' },
  { value: 4, label: 'Passable', color: 'text-yellow-500' },
  { value: 5, label: 'Moyen', color: 'text-yellow-400' },
  { value: 6, label: 'Correct', color: 'text-lime-500' },
  { value: 7, label: 'Bien', color: 'text-green-500' },
  { value: 8, label: 'Très bien', color: 'text-green-600' },
  { value: 9, label: 'Excellent', color: 'text-emerald-600' },
  { value: 10, label: 'Exceptionnel', color: 'text-emerald-700' }
];

// Labels inversés (10 = aucun problème)
export const INVERTED_LABELS = {
  moisissures: {
    1: 'Envahi de moisissures',
    2: 'Fortement moisi',
    3: 'Très moisi',
    4: 'Moisi',
    5: 'Légèrement moisi',
    6: 'Traces visibles',
    7: 'Très peu',
    8: 'Quasiment aucune',
    9: 'Aucune visible',
    10: 'Parfaitement sain'
  },
  graines: {
    1: 'Rempli de graines',
    2: 'Très nombreuses graines',
    3: 'Nombreuses graines',
    4: 'Graines fréquentes',
    5: 'Quelques graines',
    6: 'Peu de graines',
    7: 'Rares graines',
    8: 'Très peu de graines',
    9: 'Quasiment aucune',
    10: 'Sans graines (sensimilla)'
  }
};

// Transparence (Hash/Concentrés)
export const TRANSPARENCY_LEVELS = [
  { value: 1, label: 'Opaque total', example: 'Impossible de voir au travers' },
  { value: 2, label: 'Très opaque', example: 'Très peu translucide' },
  { value: 3, label: 'Opaque', example: 'Légèrement translucide' },
  { value: 4, label: 'Semi-opaque', example: 'Peu translucide' },
  { value: 5, label: 'Semi-translucide', example: 'Moyennement translucide' },
  { value: 6, label: 'Translucide', example: 'Bien translucide' },
  { value: 7, label: 'Très translucide', example: 'Très bien translucide' },
  { value: 8, label: 'Quasi-transparent', example: 'Presque transparent' },
  { value: 9, label: 'Transparent', example: 'Transparent' },
  { value: 10, label: 'Cristallin', example: 'Parfaitement transparent' }
];
