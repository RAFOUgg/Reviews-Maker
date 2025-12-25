/**
 * Pipelines Avancés - Visualisation GitHub-style
 * Phase 5 - Timeline évolutive avec données par phase
 */

/**
 * Types de visualisation timeline
 */
export const TIMELINE_VIEWS = {
  daily: {
    id: 'daily',
    label: 'Quotidien',
    icon: '📅',
    unit: 'jour',
    maxCells: 365,
    cellSize: 12,
    description: 'Vue année (365 jours)'
  },
  weekly: {
    id: 'weekly',
    label: 'Hebdomadaire',
    icon: '📆',
    unit: 'semaine',
    maxCells: 52,
    cellSize: 16,
    description: 'Vue annuelle (52 semaines)'
  },
  monthly: {
    id: 'monthly',
    label: 'Mensuel',
    icon: '🗓️',
    unit: 'mois',
    maxCells: 24,
    cellSize: 20,
    description: 'Vue 2 ans (24 mois)'
  },
  phases: {
    id: 'phases',
    label: 'Par phases',
    icon: '🔄',
    unit: 'phase',
    maxCells: 12,
    cellSize: 40,
    description: 'Phases croissance (12 max)'
  }
};

/**
 * Types de données évolutives
 */
export const EVOLVABLE_DATA_TYPES = {
  visual: {
    id: 'visual',
    label: 'Visuel',
    icon: '👁️',
    color: 'purple',
    fields: ['color', 'density', 'trichomes', 'pistils', 'purity']
  },
  odor: {
    id: 'odor',
    label: 'Odeurs',
    icon: '👃',
    color: 'blue',
    fields: ['intensity', 'fidelity', 'dominant', 'secondary']
  },
  texture: {
    id: 'texture',
    label: 'Texture',
    icon: '🤚',
    color: 'green',
    fields: ['hardness', 'density', 'stickiness', 'friability', 'melting']
  },
  taste: {
    id: 'taste',
    label: 'Goûts',
    icon: '😋',
    color: 'orange',
    fields: ['intensity', 'aggressiveness', 'inhalation', 'exhalation']
  },
  effects: {
    id: 'effects',
    label: 'Effets',
    icon: '💥',
    color: 'red',
    fields: ['onset', 'intensity', 'duration', 'selected']
  }
};

/**
 * Intensité de données (GitHub-style)
 */
export const INTENSITY_LEVELS = [
  { level: 0, color: '#ebedf0', label: 'Aucune donnée' },
  { level: 1, color: '#9be9a8', label: 'Faible' },
  { level: 2, color: '#40c463', label: 'Moyen' },
  { level: 3, color: '#30a14e', label: 'Élevé' },
  { level: 4, color: '#216e39', label: 'Très élevé' }
];

/**
 * Calculer niveau intensité
 */
export const calculateIntensity = (dataCount) => {
  if (dataCount === 0) return 0;
  if (dataCount <= 2) return 1;
  if (dataCount <= 5) return 2;
  if (dataCount <= 10) return 3;
  return 4;
};

/**
 * Générer grille timeline
 */
export const generateTimelineGrid = (view, startDate, endDate) => {
  const cells = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calcul nombre de cellules selon vue
  let cellCount = 0;
  switch (view) {
    case 'daily':
      cellCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      break;
    case 'weekly':
      cellCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 7));
      break;
    case 'monthly':
      cellCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
      break;
    default:
      cellCount = 0;
  }
  
  for (let i = 0; i < Math.min(cellCount, TIMELINE_VIEWS[view].maxCells); i++) {
    cells.push({
      index: i,
      date: new Date(start.getTime() + i * getIntervalMs(view)),
      data: [],
      intensity: 0
    });
  }
  
  return cells;
};

/**
 * Obtenir intervalle en ms
 */
const getIntervalMs = (view) => {
  switch (view) {
    case 'daily': return 1000 * 60 * 60 * 24;
    case 'weekly': return 1000 * 60 * 60 * 24 * 7;
    case 'monthly': return 1000 * 60 * 60 * 24 * 30;
    default: return 0;
  }
};
