/**
 * Données de culture pour Pipeline Culture (Fleurs)
 * Phase 2.3 - 12 phases de croissance complètes
 */

export const GROWTH_PHASES = [
  { id: 'seed', label: 'Graine', icon: '🌰', duration: 0, order: 0 },
  { id: 'germination', label: 'Germination', icon: '🌱', duration: 3, order: 1 },
  { id: 'seedling', label: 'Plantule', icon: '🌿', duration: 7, order: 2 },
  { id: 'veg-early', label: 'Début croissance', icon: '🌾', duration: 14, order: 3 },
  { id: 'veg-mid', label: 'Milieu croissance', icon: '🌳', duration: 14, order: 4 },
  { id: 'veg-late', label: 'Fin croissance', icon: '🌲', duration: 7, order: 5 },
  { id: 'stretch-early', label: 'Début stretch', icon: '📈', duration: 7, order: 6 },
  { id: 'stretch-mid', label: 'Milieu stretch', icon: '📊', duration: 7, order: 7 },
  { id: 'stretch-late', label: 'Fin stretch', icon: '⬆️', duration: 7, order: 8 },
  { id: 'flower-early', label: 'Début floraison', icon: '🌸', duration: 14, order: 9 },
  { id: 'flower-mid', label: 'Milieu floraison', icon: '🌺', duration: 21, order: 10 },
  { id: 'flower-late', label: 'Fin floraison', icon: '💐', duration: 14, order: 11 }
];

export const CULTIVATION_MODES = [
  { id: 'indoor', label: 'Indoor', icon: '🏠', description: 'Culture intérieure contrôlée' },
  { id: 'outdoor', label: 'Outdoor', icon: '☀️', description: 'Culture extérieure naturelle' },
  { id: 'greenhouse', label: 'Greenhouse', icon: '🏡', description: 'Serre mi-contrôlée' },
  { id: 'notill', label: 'No-till', icon: '🌍', description: 'Organique sans labour' },
  { id: 'other', label: 'Autre', icon: '🔧', description: 'Méthode personnalisée' }
];

export const SPACE_TYPES = [
  { id: 'closet', label: 'Armoire', icon: '🚪' },
  { id: 'tent', label: 'Tente', icon: '⛺' },
  { id: 'room', label: 'Pièce', icon: '🏠' },
  { id: 'greenhouse', label: 'Serre', icon: '🏡' },
  { id: 'outdoor', label: 'Extérieur', icon: '🌳' },
  { id: 'other', label: 'Autre', icon: '🔧' }
];

export const PROPAGATION_METHODS = [
  { id: 'seed', label: 'Graine', icon: '🌰' },
  { id: 'clone', label: 'Clone', icon: '🌿' },
  { id: 'cutting', label: 'Bouture', icon: '✂️' },
  { id: 'tissue', label: 'Culture tissulaire', icon: '🧬' }
];

export const GERMINATION_METHODS = [
  { id: 'paper-towel', label: 'Serviette papier', icon: '🧻' },
  { id: 'cotton', label: 'Coton', icon: '☁️' },
  { id: 'water-glass', label: 'Verre d\'eau', icon: '🥛' },
  { id: 'soil-direct', label: 'Direct en terre', icon: '🌱' },
  { id: 'rockwool', label: 'Laine de roche', icon: '🧱' },
  { id: 'peat-pellet', label: 'Pastille tourbe', icon: '⚫' }
];

export const SUBSTRATE_TYPES = [
  { id: 'hydro', label: 'Hydroponique', icon: '💧', category: 'Hydro' },
  { id: 'coco', label: 'Coco', icon: '🥥', category: 'Bio' },
  { id: 'soil-bio', label: 'Terre bio', icon: '🌍', category: 'Bio' },
  { id: 'soil-mineral', label: 'Terre minérale', icon: '⛰️', category: 'Organique' },
  { id: 'perlite', label: 'Perlite', icon: '⚪', category: 'Organique' },
  { id: 'vermiculite', label: 'Vermiculite', icon: '🟫', category: 'Organique' },
  { id: 'rockwool', label: 'Laine de roche', icon: '🧱', category: 'Hydro' },
  { id: 'mix', label: 'Mélange', icon: '🔀', category: 'Mixte' }
];

export const IRRIGATION_SYSTEMS = [
  { id: 'drip', label: 'Goutte à goutte', icon: '💧' },
  { id: 'flood', label: 'Inondation', icon: '🌊' },
  { id: 'manual', label: 'Manuel', icon: '✋' },
  { id: 'wick', label: 'Mèche', icon: '🕯️' },
  { id: 'dwc', label: 'DWC', icon: '🪣' },
  { id: 'nft', label: 'NFT', icon: '🔄' },
  { id: 'aeroponic', label: 'Aéroponique', icon: '💨' }
];

export const LIGHT_TYPES = [
  { id: 'led', label: 'LED', icon: '💡', spectrum: 'full', efficiency: 95 },
  { id: 'hps', label: 'HPS', icon: '🔥', spectrum: 'red', efficiency: 70 },
  { id: 'mh', label: 'MH', icon: '⚡', spectrum: 'blue', efficiency: 75 },
  { id: 'cfl', label: 'CFL', icon: '💡', spectrum: 'full', efficiency: 60 },
  { id: 'cmh', label: 'CMH/LEC', icon: '⚡', spectrum: 'full', efficiency: 85 },
  { id: 'natural', label: 'Naturel', icon: '☀️', spectrum: 'full', efficiency: 100 },
  { id: 'mix', label: 'Mixte', icon: '🔀', spectrum: 'full', efficiency: 80 }
];

export const SPECTRUM_TYPES = [
  { id: 'full', label: 'Spectre complet', color: '#FFFFFF' },
  { id: 'blue', label: 'Bleu (végé)', color: '#4169E1' },
  { id: 'red', label: 'Rouge (flo)', color: '#DC143C' },
  { id: 'uv', label: 'UV', color: '#9400D3' },
  { id: 'ir', label: 'Infrarouge', color: '#8B0000' }
];

export const TRAINING_METHODS = [
  { id: 'scrog', label: 'SCROG', icon: '🕸️', type: 'LST', description: 'Screen of Green' },
  { id: 'sog', label: 'SOG', icon: '🌊', type: 'LST', description: 'Sea of Green' },
  { id: 'lst', label: 'LST', icon: '🔽', type: 'LST', description: 'Low Stress Training' },
  { id: 'hst', label: 'HST', icon: '✂️', type: 'HST', description: 'High Stress Training' },
  { id: 'topping', label: 'Topping', icon: '✂️', type: 'HST', description: 'Étêtage' },
  { id: 'fimming', label: 'FIM', icon: '✂️', type: 'HST', description: 'Fuck I Missed' },
  { id: 'mainlining', label: 'Main-Lining', icon: '🔱', type: 'HST', description: 'Manifolding' },
  { id: 'supercrop', label: 'Supercropping', icon: '💪', type: 'HST', description: 'Pliage tige' },
  { id: 'defoliation', label: 'Défoliation', icon: '🍃', type: 'HST', description: 'Effeuillage' }
];

export const TRICHOME_COLORS = [
  { id: 'clear', label: 'Translucide', icon: '⚪', color: '#E8E8E8', maturity: 30 },
  { id: 'milky', label: 'Laiteux', icon: '🥛', color: '#FFFFFF', maturity: 70 },
  { id: 'amber', label: 'Ambré', icon: '🟠', color: '#FFA500', maturity: 90 },
  { id: 'mix-milky-amber', label: 'Laiteux/Ambré', icon: '🟡', color: '#FFD700', maturity: 80 }
];

export const FERTILIZER_TYPES = [
  { id: 'bio', label: 'Biologique', icon: '🌿', npk: 'variable' },
  { id: 'mineral', label: 'Minéral', icon: '⛰️', npk: 'précis' },
  { id: 'organic', label: 'Organique', icon: '🍂', npk: 'lent' },
  { id: 'mix', label: 'Mixte', icon: '🔀', npk: 'variable' }
];

/**
 * Calculer durée totale estimée culture
 */
export const calculateTotalDuration = (startPhase = 'seed', endPhase = 'flower-late') => {
  const start = GROWTH_PHASES.find(p => p.id === startPhase);
  const end = GROWTH_PHASES.find(p => p.id === endPhase);
  
  if (!start || !end) return 0;
  
  return GROWTH_PHASES
    .filter(p => p.order >= start.order && p.order <= end.order)
    .reduce((total, phase) => total + phase.duration, 0);
};

/**
 * Obtenir phase par ID
 */
export const getPhaseById = (phaseId) => {
  return GROWTH_PHASES.find(p => p.id === phaseId) || null;
};

/**
 * Obtenir phases suivantes
 */
export const getNextPhases = (currentPhaseId) => {
  const current = GROWTH_PHASES.find(p => p.id === currentPhaseId);
  if (!current) return [];
  
  return GROWTH_PHASES.filter(p => p.order > current.order);
};

/**
 * Estimer rendement basé sur conditions
 */
export const estimateYield = (spaceSize, lightPower, plantCount, mode) => {
  const modeMultipliers = {
    indoor: 0.5, // g/W
    outdoor: 200, // g/plante
    greenhouse: 300, // g/plante
    notill: 250, // g/plante
    other: 150 // g/plante
  };
  
  const multiplier = modeMultipliers[mode] || 100;
  
  if (mode === 'indoor') {
    return (lightPower * multiplier).toFixed(0);
  } else {
    return (plantCount * multiplier).toFixed(0);
  }
};
