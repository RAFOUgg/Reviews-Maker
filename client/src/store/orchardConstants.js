// Constantes pour Orchard Studio
// Séparées du store pour éviter les problèmes de références circulaires

// Palettes de couleurs harmonieuses prédéfinies
export const COLOR_PALETTES = {
    modern: {
        name: 'Moderne',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#e0e0e0',
        accent: '#ffd700',
        title: '#ffffff'
    },
    nature: {
        name: 'Nature',
        background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#ecf0f1',
        accent: '#f39c12',
        title: '#ffffff'
    },
    ocean: {
        name: 'Océan',
        background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#ecf0f1',
        accent: '#e74c3c',
        title: '#ffffff'
    },
    sunset: {
        name: 'Coucher de soleil',
        background: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#ecf0f1',
        accent: '#3498db',
        title: '#ffffff'
    },
    elegant: {
        name: 'Élégant',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        textPrimary: '#ecf0f1',
        textSecondary: '#bdc3c7',
        accent: '#e67e22',
        title: '#ffffff'
    },
    minimal: {
        name: 'Minimaliste',
        background: '#ffffff',
        textPrimary: '#2c3e50',
        textSecondary: '#7f8c8d',
        accent: '#3498db',
        title: '#2c3e50'
    }
};

// Templates de base avec leurs configurations
export const DEFAULT_TEMPLATES = {
    modernCompact: {
        id: 'modernCompact',
        name: 'Moderne Compact',
        description: 'Design épuré et moderne, idéal pour les réseaux sociaux',
        layout: 'compact',
        defaultRatio: '1:1',
        supportedRatios: ['1:1', '16:9', '9:16', '4:3', 'A4'],
        // Zones par défaut (x,y in %, width/height in % relative to canvas)
        defaultZones: [
            { id: 'zone-title', label: 'Titre', type: 'zone', position: { x: 50, y: 8 }, width: 80, height: 12, placeholder: 'title' },
            { id: 'zone-image', label: 'Image', type: 'zone', position: { x: 10, y: 20 }, width: 40, height: 45, placeholder: 'image' },
            { id: 'zone-rating', label: 'Note', type: 'zone', position: { x: 62, y: 22 }, width: 28, height: 12, placeholder: 'rating' },
            { id: 'zone-description', label: 'Description', type: 'zone', position: { x: 10, y: 68 }, width: 84, height: 22, placeholder: 'description' }
        ]
    },
    detailedCard: {
        id: 'detailedCard',
        name: 'Fiche Technique Détaillée',
        description: 'Présentation complète avec tous les détails de la review',
        layout: 'detailed',
        defaultRatio: '16:9',
        supportedRatios: ['1:1', '16:9', '9:16', '4:3', 'A4']
    },
    blogArticle: {
        id: 'blogArticle',
        name: 'Article de Blog',
        description: 'Format long adapté aux blogs et documentation',
        layout: 'article',
        defaultRatio: 'A4',
        supportedRatios: ['1:1', '16:9', '9:16', '4:3', 'A4']
    },
    socialStory: {
        id: 'socialStory',
        name: 'Story Social Media',
        description: 'Format vertical pour Instagram et TikTok',
        layout: 'story',
        defaultRatio: '9:16',
        supportedRatios: ['1:1', '16:9', '9:16', '4:3', 'A4']
    }
};
