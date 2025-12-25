/**
 * Canva Génétique - Système arbre généalogique cultivars
 * Phase 6 - Gestion génétiques, PhenoHunt, relations
 */

/**
 * Types de relations génétiques
 */
export const GENETIC_RELATIONS = {
  parent: {
    id: 'parent',
    label: 'Parent',
    icon: '⬆️',
    color: 'blue',
    description: 'Géniteur direct'
  },
  child: {
    id: 'child',
    label: 'Enfant',
    icon: '⬇️',
    color: 'green',
    description: 'Descendant direct'
  },
  sibling: {
    id: 'sibling',
    label: 'Fratrie',
    icon: '↔️',
    color: 'purple',
    description: 'Même parents'
  },
  grandparent: {
    id: 'grandparent',
    label: 'Grand-parent',
    icon: '⏫',
    color: 'indigo',
    description: 'Ancêtre 2ème génération'
  }
};

/**
 * Types de cultivars
 */
export const CULTIVAR_TYPES = {
  strain: {
    id: 'strain',
    label: 'Variété',
    icon: '🌿',
    description: 'Variété commerciale stabilisée'
  },
  pheno: {
    id: 'pheno',
    label: 'Phénotype',
    icon: '🔬',
    description: 'Expression génétique spécifique'
  },
  cross: {
    id: 'cross',
    label: 'Croisement',
    icon: '🔀',
    description: 'F1/F2/Fn non stabilisé'
  },
  landrace: {
    id: 'landrace',
    label: 'Landrace',
    icon: '🌍',
    description: 'Variété native originale'
  },
  hybrid: {
    id: 'hybrid',
    label: 'Hybride',
    icon: '⚡',
    description: 'Croisement stabilisé'
  }
};

/**
 * Dominance génétique
 */
export const DOMINANCE_TYPES = {
  indica: {
    id: 'indica',
    label: 'Indica',
    icon: '🌙',
    color: 'indigo',
    description: 'Dominante Indica'
  },
  sativa: {
    id: 'sativa',
    label: 'Sativa',
    icon: '☀️',
    color: 'amber',
    description: 'Dominante Sativa'
  },
  hybrid: {
    id: 'hybrid',
    label: 'Hybride',
    icon: '⚖️',
    color: 'green',
    description: 'Équilibre 50/50'
  },
  ruderalis: {
    id: 'ruderalis',
    label: 'Ruderalis',
    icon: '🔄',
    color: 'gray',
    description: 'Auto-floraison'
  }
};

/**
 * Statuts projet PhenoHunt
 */
export const PHENOHUNT_STATUS = {
  planning: {
    id: 'planning',
    label: 'Planification',
    icon: '📋',
    color: 'blue',
    description: 'Projet en préparation'
  },
  germination: {
    id: 'germination',
    label: 'Germination',
    icon: '🌱',
    color: 'green',
    description: 'Germination en cours'
  },
  selection: {
    id: 'selection',
    label: 'Sélection',
    icon: '🔍',
    color: 'purple',
    description: 'Observation phénotypes'
  },
  testing: {
    id: 'testing',
    label: 'Tests',
    icon: '🧪',
    color: 'orange',
    description: 'Analyse approfondie'
  },
  completed: {
    id: 'completed',
    label: 'Terminé',
    icon: '✅',
    color: 'emerald',
    description: 'Phénotype sélectionné'
  }
};

/**
 * Actions canva
 */
export const CANVA_ACTIONS = {
  add: {
    id: 'add',
    label: 'Ajouter cultivar',
    icon: '➕',
    shortcut: 'A'
  },
  connect: {
    id: 'connect',
    label: 'Relier génétiques',
    icon: '🔗',
    shortcut: 'C'
  },
  edit: {
    id: 'edit',
    label: 'Éditer',
    icon: '✏️',
    shortcut: 'E'
  },
  delete: {
    id: 'delete',
    label: 'Supprimer',
    icon: '🗑️',
    shortcut: 'Del'
  },
  export: {
    id: 'export',
    label: 'Exporter arbre',
    icon: '📤',
    shortcut: 'Ctrl+E'
  },
  zoom: {
    id: 'zoom',
    label: 'Zoom',
    icon: '🔍',
    shortcut: '+/-'
  }
};

/**
 * Calculer génération
 */
export const calculateGeneration = (cultivar, tree) => {
  if (!cultivar.parents || cultivar.parents.length === 0) return 0;
  
  const parentGenerations = cultivar.parents.map(parentId => {
    const parent = tree.find(c => c.id === parentId);
    return parent ? calculateGeneration(parent, tree) : 0;
  });
  
  return Math.max(...parentGenerations) + 1;
};

/**
 * Obtenir descendants
 */
export const getDescendants = (cultivarId, tree) => {
  return tree.filter(c => c.parents && c.parents.includes(cultivarId));
};

/**
 * Obtenir ancêtres
 */
export const getAncestors = (cultivar, tree, maxDepth = 10) => {
  if (!cultivar.parents || cultivar.parents.length === 0 || maxDepth === 0) {
    return [];
  }
  
  const parents = tree.filter(c => cultivar.parents.includes(c.id));
  const grandparents = parents.flatMap(p => getAncestors(p, tree, maxDepth - 1));
  
  return [...parents, ...grandparents];
};
