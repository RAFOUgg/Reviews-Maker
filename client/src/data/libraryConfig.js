/**
 * Bibliothèque utilisateur - Gestion centralisée
 * Phase 4 - Reviews, Templates, Cultivars, Statistiques
 */

/**
 * Catégories de la bibliothèque
 */
export const LIBRARY_CATEGORIES = {
  reviews: {
    id: 'reviews',
    label: 'Reviews',
    icon: '📝',
    description: 'Mes reviews sauvegardées',
    color: 'purple',
    sections: ['all', 'public', 'private', 'drafts']
  },
  templates: {
    id: 'templates',
    label: 'Templates',
    icon: '🎨',
    description: 'Aperçus sauvegardés',
    color: 'blue',
    sections: ['all', 'favorites', 'shared']
  },
  cultivars: {
    id: 'cultivars',
    label: 'Cultivars',
    icon: '🌱',
    description: 'Bibliothèque génétique',
    color: 'green',
    sections: ['all', 'favorites', 'genetics']
  },
  watermarks: {
    id: 'watermarks',
    label: 'Filigranes',
    icon: '©️',
    description: 'Logos et filigranes',
    color: 'gray',
    sections: ['all']
  },
  stats: {
    id: 'stats',
    label: 'Statistiques',
    icon: '📊',
    description: 'Analyses et données',
    color: 'indigo',
    sections: ['overview', 'reviews', 'engagement']
  }
};

/**
 * Actions disponibles par catégorie
 */
export const LIBRARY_ACTIONS = {
  reviews: ['edit', 'duplicate', 'delete', 'share', 'visibility', 'export'],
  templates: ['edit', 'duplicate', 'delete', 'share'],
  cultivars: ['edit', 'delete', 'genetics'],
  watermarks: ['edit', 'delete', 'preview'],
  stats: ['export', 'refresh']
};

/**
 * Filtres de tri
 */
export const SORT_OPTIONS = {
  recent: { id: 'recent', label: 'Plus récents', icon: '🕐' },
  oldest: { id: 'oldest', label: 'Plus anciens', icon: '📅' },
  name: { id: 'name', label: 'Nom A-Z', icon: '🔤' },
  rating: { id: 'rating', label: 'Note', icon: '⭐' },
  popular: { id: 'popular', label: 'Popularité', icon: '🔥' }
};

/**
 * Types de visibilité reviews
 */
export const VISIBILITY_TYPES = {
  public: { id: 'public', label: 'Publique', icon: '🌍', description: 'Visible par tous' },
  private: { id: 'private', label: 'Privée', icon: '🔒', description: 'Visible par moi uniquement' },
  shared: { id: 'shared', label: 'Partagée', icon: '🔗', description: 'Accessible via lien' },
  staff: { id: 'staff', label: 'Staff', icon: '👤', description: 'Visible par staff uniquement' }
};

/**
 * Statistiques utilisateur types
 */
export const STATS_METRICS = {
  reviews: {
    total: { label: 'Total reviews', icon: '📝', type: 'counter' },
    public: { label: 'Publiques', icon: '🌍', type: 'counter' },
    private: { label: 'Privées', icon: '🔒', type: 'counter' },
    drafts: { label: 'Brouillons', icon: '✏️', type: 'counter' }
  },
  products: {
    fleurs: { label: 'Fleurs', icon: '🌿', type: 'counter' },
    hash: { label: 'Hash', icon: '🟫', type: 'counter' },
    concentres: { label: 'Concentrés', icon: '💧', type: 'counter' },
    comestibles: { label: 'Comestibles', icon: '🍪', type: 'counter' }
  },
  engagement: {
    likes: { label: 'Likes reçus', icon: '❤️', type: 'counter' },
    views: { label: 'Vues', icon: '👁️', type: 'counter' },
    shares: { label: 'Partages', icon: '🔗', type: 'counter' },
    comments: { label: 'Commentaires', icon: '💬', type: 'counter' }
  },
  averages: {
    rating: { label: 'Note moyenne', icon: '⭐', type: 'percentage' },
    thc: { label: 'THC moyen', icon: '🧪', type: 'percentage' },
    cbd: { label: 'CBD moyen', icon: '🌿', type: 'percentage' }
  }
};

/**
 * Helpers bibliothèque
 */
export const getCategory = (categoryId) => {
  return LIBRARY_CATEGORIES[categoryId] || null;
};

export const getActions = (categoryId) => {
  return LIBRARY_ACTIONS[categoryId] || [];
};

export const getSortOption = (sortId) => {
  return SORT_OPTIONS[sortId] || SORT_OPTIONS.recent;
};
