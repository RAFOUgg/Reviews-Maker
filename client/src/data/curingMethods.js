/**
 * Méthodes et données pour Pipeline Curing/Maturation
 * Phase 2.4 - Universel (Hash, Concentrés, Fleurs)
 */

export const CURING_TYPES = [
  { id: 'cold', label: 'Froid (<5°C)', icon: '❄️', tempRange: [-5, 5], color: 'cyan' },
  { id: 'warm', label: 'Chaud (>5°C)', icon: '🌡️', tempRange: [5, 30], color: 'orange' }
];

export const CONTAINER_TYPES = [
  { id: 'open-air', label: 'Aire libre', icon: '🌬️', description: 'Séchage à l\'air libre' },
  { id: 'glass', label: 'Verre', icon: '🫙', description: 'Bocal en verre hermétique' },
  { id: 'plastic', label: 'Plastique', icon: '🥡', description: 'Récipient plastique' },
  { id: 'metal', label: 'Métal', icon: '🥫', description: 'Boîte métallique' },
  { id: 'wood', label: 'Bois', icon: '📦', description: 'Caisse en bois' },
  { id: 'silicone', label: 'Silicone', icon: '🧴', description: 'Récipient silicone' },
  { id: 'other', label: 'Autre', icon: '🔧', description: 'Conteneur personnalisé' }
];

export const PACKAGING_TYPES = [
  { id: 'cellophane', label: 'Cellophane', icon: '📄' },
  { id: 'parchment', label: 'Papier cuisson', icon: '📃' },
  { id: 'aluminum', label: 'Aluminium', icon: '🥈' },
  { id: 'hash-paper', label: 'Paper hash', icon: '📋' },
  { id: 'vacuum-bag', label: 'Sac à vide', icon: '🗜️' },
  { id: 'vacuum-full', label: 'Sous vide (machine)', icon: '📦' },
  { id: 'vacuum-partial', label: 'Sous vide (manuel)', icon: '✋' },
  { id: 'freezer', label: 'Congélation', icon: '🧊' },
  { id: 'none', label: 'Aucun', icon: '⚪' },
  { id: 'other', label: 'Autre', icon: '🔧' }
];

export const OPACITY_LEVELS = [
  { id: 'opaque', label: 'Opaque', icon: '⚫', lightBlock: 100 },
  { id: 'semi-opaque', label: 'Semi-opaque', icon: '🌫️', lightBlock: 70 },
  { id: 'translucent', label: 'Translucide', icon: '⚪', lightBlock: 30 },
  { id: 'transparent', label: 'Transparent', icon: '💎', lightBlock: 0 },
  { id: 'amber', label: 'Ambré', icon: '🟠', lightBlock: 50 }
];

export const TIMELINE_INTERVALS = [
  { id: 'seconds', label: 'Secondes', unit: 's', max: 3600 },
  { id: 'minutes', label: 'Minutes', unit: 'min', max: 1440 },
  { id: 'hours', label: 'Heures', unit: 'h', max: 720 },
  { id: 'days', label: 'Jours', unit: 'j', max: 365 },
  { id: 'weeks', label: 'Semaines', unit: 'sem', max: 52 },
  { id: 'months', label: 'Mois', unit: 'mois', max: 24 }
];

/**
 * Modèles de données évolutives par type de produit
 */
export const EVOLVABLE_DATA_FIELDS = {
  visual: {
    label: 'Visuel & Technique',
    icon: '👁️',
    fields: ['color', 'density', 'trichomes', 'pistils', 'purity']
  },
  odor: {
    label: 'Odeurs',
    icon: '👃',
    fields: ['intensity', 'fidelity', 'dominantNotes', 'secondaryNotes']
  },
  texture: {
    label: 'Texture',
    icon: '🤚',
    fields: ['hardness', 'density', 'stickiness', 'friability', 'melting', 'residue']
  },
  taste: {
    label: 'Goûts',
    icon: '😋',
    fields: ['intensity', 'aggressiveness', 'dryPuff', 'inhalation', 'exhalation']
  },
  effects: {
    label: 'Effets',
    icon: '💥',
    fields: ['onset', 'intensity', 'selectedEffects', 'duration']
  }
};

/**
 * Obtenir type curing par ID
 */
export const getCuringType = (typeId) => {
  return CURING_TYPES.find(t => t.id === typeId) || null;
};

/**
 * Obtenir conteneur par ID
 */
export const getContainerType = (containerId) => {
  return CONTAINER_TYPES.find(c => c.id === containerId) || null;
};

/**
 * Obtenir emballage par ID
 */
export const getPackagingType = (packagingId) => {
  return PACKAGING_TYPES.find(p => p.id === packagingId) || null;
};

/**
 * Calculer durée totale curing
 */
export const calculateCuringDuration = (interval, count) => {
  const multipliers = {
    seconds: 1,
    minutes: 60,
    hours: 3600,
    days: 86400,
    weeks: 604800,
    months: 2592000
  };
  
  const seconds = count * (multipliers[interval] || 1);
  
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} j`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} sem`;
  return `${Math.floor(seconds / 2592000)} mois`;
};

/**
 * Estimer qualité finale basée sur conditions curing
 */
export const estimateFinalQuality = (type, temperature, humidity, duration, containerType) => {
  let score = 50; // Base 50%
  
  // Type curing
  if (type === 'cold') score += 10;
  
  // Température optimale
  if (temperature >= 15 && temperature <= 21) score += 15;
  else if (temperature >= 10 && temperature <= 25) score += 10;
  else score -= 5;
  
  // Humidité optimale (60-65%)
  if (humidity >= 60 && humidity <= 65) score += 15;
  else if (humidity >= 55 && humidity <= 70) score += 10;
  else score -= 5;
  
  // Durée (minimum 2 semaines recommandé)
  if (duration >= 14) score += 10;
  else if (duration >= 7) score += 5;
  
  // Type conteneur
  if (containerType === 'glass') score += 5;
  else if (containerType === 'open-air') score -= 10;
  
  return Math.max(0, Math.min(100, score));
};
