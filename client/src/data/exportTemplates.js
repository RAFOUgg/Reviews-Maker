/**
 * Export Maker - Templates et formats d'export
 * Phase 3 - Définitions des templates prédéfinis et formats disponibles
 */

/**
 * Formats d'export disponibles
 */
export const EXPORT_FORMATS = {
    square: {
        id: 'square',
        label: 'Carré 1:1',
        icon: '⬜',
        ratio: '1:1',
        width: 1080,
        height: 1080,
        description: 'Instagram post, profil',
        maxPages: 9,
        category: 'social'
    },
    landscape: {
        id: 'landscape',
        label: 'Paysage 16:9',
        icon: '▬',
        ratio: '16:9',
        width: 1920,
        height: 1080,
        description: 'YouTube, desktop',
        maxPages: 9,
        category: 'screen'
    },
    a4: {
        id: 'a4',
        label: 'A4 Portrait',
        icon: '📄',
        ratio: '210:297',
        width: 2480,
        height: 3508,
        description: 'Document imprimable',
        maxPages: 9,
        category: 'print'
    },
    story: {
        id: 'story',
        label: 'Story 9:16',
        icon: '📱',
        ratio: '9:16',
        width: 1080,
        height: 1920,
        description: 'Instagram/TikTok story',
        maxPages: 1,
        category: 'social'
    }
};

/**
 * Types de templates disponibles
 */
export const TEMPLATE_TYPES = {
    minimal: {
        id: 'minimal',
        label: 'Minimal',
        icon: '◯',
        description: 'Essentiel uniquement',
        color: 'gray',
        accountTypes: ['Amateur', 'Influenceur', 'Producteur'],
        maxElements: 5
    },
    standard: {
        id: 'standard',
        label: 'Standard',
        icon: '◐',
        description: 'Équilibré',
        color: 'blue',
        accountTypes: ['Amateur', 'Influenceur', 'Producteur'],
        maxElements: 10
    },
    detailed: {
        id: 'detailed',
        label: 'Détaillé',
        icon: '◉',
        description: 'Complet',
        color: 'purple',
        accountTypes: ['Influenceur', 'Producteur'],
        maxElements: 15
    },
    custom: {
        id: 'custom',
        label: 'Personnalisé',
        icon: '🎨',
        description: 'Configuration libre',
        color: 'gradient',
        accountTypes: ['Producteur'],
        maxElements: 20
    }
};

/**
 * Templates prédéfinis par type de produit
 */
export const PREDEFINED_TEMPLATES = {
    Fleurs: {
        minimal: {
            elements: [
                { id: 'productName', type: 'text', label: 'Nom produit', position: 'top-center', required: true },
                { id: 'photo', type: 'image', label: 'Photo principale', position: 'center', required: true },
                { id: 'overallRating', type: 'rating', label: 'Note globale', position: 'bottom-center', required: false },
                { id: 'thc', type: 'stat', label: 'THC %', position: 'top-right', required: false },
                { id: 'cbd', type: 'stat', label: 'CBD %', position: 'top-left', required: false }
            ]
        },
        standard: {
            elements: [
                { id: 'productName', type: 'text', label: 'Nom produit', position: 'top-center', required: true },
                { id: 'photo', type: 'image', label: 'Photo principale', position: 'center-main', required: true },
                { id: 'genetics', type: 'text', label: 'Génétiques', position: 'below-title', required: false },
                { id: 'thc', type: 'stat', label: 'THC %', position: 'sidebar-top', required: false },
                { id: 'cbd', type: 'stat', label: 'CBD %', position: 'sidebar-top', required: false },
                { id: 'dominantTerpenes', type: 'list', label: 'Terpènes dominants', position: 'sidebar-middle', required: false },
                { id: 'odorNotes', type: 'pills', label: 'Odeurs', position: 'bottom-section', required: false },
                { id: 'tasteNotes', type: 'pills', label: 'Goûts', position: 'bottom-section', required: false },
                { id: 'effects', type: 'pills', label: 'Effets', position: 'bottom-section', required: false },
                { id: 'overallRating', type: 'rating', label: 'Note globale', position: 'bottom-right', required: false }
            ]
        },
        detailed: {
            elements: [
                { id: 'productName', type: 'text', label: 'Nom produit', position: 'header', required: true },
                { id: 'photos', type: 'gallery', label: 'Galerie photos', position: 'main-grid', required: true },
                { id: 'genetics', type: 'text', label: 'Génétiques', position: 'header-sub', required: false },
                { id: 'breeder', type: 'text', label: 'Breeder', position: 'header-sub', required: false },
                { id: 'analytics', type: 'chart', label: 'Données analytiques', position: 'sidebar-full', required: false },
                { id: 'visual', type: 'radar', label: 'Visuel radar', position: 'section-1', required: false },
                { id: 'odor', type: 'radar', label: 'Odeurs radar', position: 'section-2', required: false },
                { id: 'texture', type: 'radar', label: 'Texture radar', position: 'section-3', required: false },
                { id: 'taste', type: 'radar', label: 'Goûts radar', position: 'section-4', required: false },
                { id: 'effects', type: 'radar', label: 'Effets radar', position: 'section-5', required: false },
                { id: 'culture', type: 'timeline', label: 'Pipeline culture', position: 'bottom-full', required: false },
                { id: 'curing', type: 'timeline', label: 'Curing maturation', position: 'bottom-full', required: false },
                { id: 'terpeneProfile', type: 'bar-chart', label: 'Profil terpénique', position: 'sidebar-bottom', required: false },
                { id: 'notes', type: 'text-block', label: 'Notes personnelles', position: 'footer', required: false },
                { id: 'watermark', type: 'image', label: 'Filigrane', position: 'overlay-bottom-right', required: false }
            ]
        }
    },
    Hash: {
        minimal: {
            elements: [
                { id: 'productName', type: 'text', label: 'Nom produit', position: 'top-center', required: true },
                { id: 'photo', type: 'image', label: 'Photo principale', position: 'center', required: true },
                { id: 'hashType', type: 'badge', label: 'Type hash', position: 'top-left', required: false },
                { id: 'purity', type: 'stat', label: 'Pureté %', position: 'top-right', required: false },
                { id: 'overallRating', type: 'rating', label: 'Note globale', position: 'bottom-center', required: false }
            ]
        },
        standard: {
            elements: [
                { id: 'productName', type: 'text', label: 'Nom produit', position: 'top-center', required: true },
                { id: 'photo', type: 'image', label: 'Photo principale', position: 'center-main', required: true },
                { id: 'hashType', type: 'badge', label: 'Type hash', position: 'header-badge', required: false },
                { id: 'separationMethod', type: 'text', label: 'Méthode séparation', position: 'below-title', required: false },
                { id: 'purity', type: 'stat', label: 'Pureté %', position: 'sidebar-top', required: false },
                { id: 'meshSizes', type: 'list', label: 'Tailles mailles', position: 'sidebar-middle', required: false },
                { id: 'odorNotes', type: 'pills', label: 'Odeurs', position: 'bottom-section', required: false },
                { id: 'textureScore', type: 'radar-mini', label: 'Texture', position: 'sidebar-bottom', required: false },
                { id: 'effects', type: 'pills', label: 'Effets', position: 'bottom-section', required: false },
                { id: 'overallRating', type: 'rating', label: 'Note globale', position: 'bottom-right', required: false }
            ]
        },
        detailed: {
            elements: [
                { id: 'productName', type: 'text', label: 'Nom produit', position: 'header', required: true },
                { id: 'photos', type: 'gallery', label: 'Galerie photos', position: 'main-grid', required: true },
                { id: 'hashType', type: 'badge', label: 'Type hash', position: 'header-badge', required: false },
                { id: 'separation', type: 'timeline', label: 'Pipeline séparation', position: 'section-1', required: false },
                { id: 'purification', type: 'flow', label: 'Purification', position: 'section-2', required: false },
                { id: 'visual', type: 'radar', label: 'Visuel radar', position: 'section-3', required: false },
                { id: 'odor', type: 'radar', label: 'Odeurs radar', position: 'section-4', required: false },
                { id: 'texture', type: 'radar', label: 'Texture radar', position: 'section-5', required: false },
                { id: 'taste', type: 'radar', label: 'Goûts radar', position: 'section-6', required: false },
                { id: 'effects', type: 'radar', label: 'Effets radar', position: 'section-7', required: false },
                { id: 'curing', type: 'timeline', label: 'Curing maturation', position: 'bottom-full', required: false },
                { id: 'notes', type: 'text-block', label: 'Notes personnelles', position: 'footer', required: false },
                { id: 'watermark', type: 'image', label: 'Filigrane', position: 'overlay-bottom-right', required: false }
            ]
        }
    },
    Concentrés: {
        minimal: {
            elements: [
                { id: 'productName', type: 'text', label: 'Nom produit', position: 'top-center', required: true },
                { id: 'photo', type: 'image', label: 'Photo principale', position: 'center', required: true },
                { id: 'extractionMethod', type: 'badge', label: 'Méthode extraction', position: 'top-left', required: false },
                { id: 'purity', type: 'stat', label: 'Pureté %', position: 'top-right', required: false },
                { id: 'overallRating', type: 'rating', label: 'Note globale', position: 'bottom-center', required: false }
            ]
        },
        standard: {
            elements: [
                { id: 'productName', type: 'text', label: 'Nom produit', position: 'top-center', required: true },
                { id: 'photo', type: 'image', label: 'Photo principale', position: 'center-main', required: true },
                { id: 'extractionMethod', type: 'badge', label: 'Méthode extraction', position: 'header-badge', required: false },
                { id: 'purity', type: 'stat', label: 'Pureté %', position: 'sidebar-top', required: false },
                { id: 'purificationSteps', type: 'list', label: 'Étapes purification', position: 'sidebar-middle', required: false },
                { id: 'odorNotes', type: 'pills', label: 'Odeurs', position: 'bottom-section', required: false },
                { id: 'textureScore', type: 'radar-mini', label: 'Texture', position: 'sidebar-bottom', required: false },
                { id: 'effects', type: 'pills', label: 'Effets', position: 'bottom-section', required: false },
                { id: 'overallRating', type: 'rating', label: 'Note globale', position: 'bottom-right', required: false }
            ]
        },
        detailed: {
            elements: [
                { id: 'productName', type: 'text', label: 'Nom produit', position: 'header', required: true },
                { id: 'photos', type: 'gallery', label: 'Galerie photos', position: 'main-grid', required: true },
                { id: 'extractionMethod', type: 'badge', label: 'Méthode extraction', position: 'header-badge', required: false },
                { id: 'extraction', type: 'timeline', label: 'Pipeline extraction', position: 'section-1', required: false },
                { id: 'purification', type: 'flow', label: 'Pipeline purification', position: 'section-2', required: false },
                { id: 'visual', type: 'radar', label: 'Visuel radar', position: 'section-3', required: false },
                { id: 'odor', type: 'radar', label: 'Odeurs radar', position: 'section-4', required: false },
                { id: 'texture', type: 'radar', label: 'Texture radar', position: 'section-5', required: false },
                { id: 'taste', type: 'radar', label: 'Goûts radar', position: 'section-6', required: false },
                { id: 'effects', type: 'radar', label: 'Effets radar', position: 'section-7', required: false },
                { id: 'curing', type: 'timeline', label: 'Curing maturation', position: 'bottom-full', required: false },
                { id: 'notes', type: 'text-block', label: 'Notes personnelles', position: 'footer', required: false },
                { id: 'watermark', type: 'image', label: 'Filigrane', position: 'overlay-bottom-right', required: false }
            ]
        }
    },
    Comestibles: {
        minimal: {
            elements: [
                { id: 'productName', type: 'text', label: 'Nom produit', position: 'top-center', required: true },
                { id: 'photo', type: 'image', label: 'Photo principale', position: 'center', required: true },
                { id: 'dosage', type: 'stat', label: 'Dosage mg', position: 'top-right', required: false },
                { id: 'effects', type: 'pills', label: 'Effets', position: 'bottom-section', required: false },
                { id: 'overallRating', type: 'rating', label: 'Note globale', position: 'bottom-center', required: false }
            ]
        },
        standard: {
            elements: [
                { id: 'productName', type: 'text', label: 'Nom produit', position: 'top-center', required: true },
                { id: 'photo', type: 'image', label: 'Photo principale', position: 'center-main', required: true },
                { id: 'dosage', type: 'stat', label: 'Dosage mg', position: 'sidebar-top', required: false },
                { id: 'ingredients', type: 'list', label: 'Ingrédients', position: 'sidebar-middle', required: false },
                { id: 'tasteNotes', type: 'pills', label: 'Saveurs', position: 'bottom-section', required: false },
                { id: 'effects', type: 'pills', label: 'Effets', position: 'bottom-section', required: false },
                { id: 'duration', type: 'badge', label: 'Durée effets', position: 'sidebar-bottom', required: false },
                { id: 'overallRating', type: 'rating', label: 'Note globale', position: 'bottom-right', required: false }
            ]
        }
    }
};

/**
 * Options d'export
 */
export const EXPORT_OPTIONS = {
    fileFormat: {
        png: { id: 'png', label: 'PNG', icon: '🖼️', quality: [72, 150, 300], transparency: true },
        jpeg: { id: 'jpeg', label: 'JPEG', icon: '📷', quality: [72, 150, 300], transparency: false },
        svg: { id: 'svg', label: 'SVG', icon: '📐', quality: ['vectoriel'], transparency: true },
        pdf: { id: 'pdf', label: 'PDF', icon: '📄', quality: [72, 150, 300], transparency: false }
    },
    quality: {
        web: { id: 'web', label: 'Web (72dpi)', dpi: 72, description: 'Optimisé écran' },
        print: { id: 'print', label: 'Impression (150dpi)', dpi: 150, description: 'Qualité moyenne' },
        pro: { id: 'pro', label: 'Professionnel (300dpi)', dpi: 300, description: 'Haute qualité' }
    }
};

/**
 * Obtenir template prédéfini
 */
export const getPredefinedTemplate = (productType, templateType) => {
    return PREDEFINED_TEMPLATES[productType]?.[templateType] || null;
};

/**
 * Obtenir format par ID
 */
export const getExportFormat = (formatId) => {
    return EXPORT_FORMATS[formatId] || null;
};

/**
 * Vérifier disponibilité template selon compte
 */
export const isTemplateAvailable = (templateType, accountType) => {
    const template = TEMPLATE_TYPES[templateType];
    return template?.accountTypes.includes(accountType) || false;
};

/**
 * Calculer nombre d'éléments max selon format
 */
export const getMaxElements = (formatId, templateType) => {
    const format = EXPORT_FORMATS[formatId];
    const template = TEMPLATE_TYPES[templateType];

    // Réduction pour formats petits
    if (formatId === 'story') return Math.floor(template.maxElements * 0.5);
    if (formatId === 'square') return template.maxElements;
    if (formatId === 'landscape') return Math.floor(template.maxElements * 1.2);
    if (formatId === 'a4') return Math.floor(template.maxElements * 1.5);

    return template.maxElements;
};
