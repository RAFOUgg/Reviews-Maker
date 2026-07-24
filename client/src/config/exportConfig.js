/**
 * Configuration des exports selon le type de compte utilisateur
 * Basé sur le cahier des charges COMPTE_FONCTIONNALITES
 */

// Types de comptes
export const ACCOUNT_TYPES = {
    CONSUMER: 'consumer',
    INFLUENCER_BASIC: 'influencer_basic',
    INFLUENCER_PRO: 'influencer_pro',
    PRODUCER: 'producer',
    BETA_TESTER: 'beta_tester' // Équivalent Producer pendant la bêta
}

// Formats d'export disponibles
export const EXPORT_FORMATS = {
    PNG: 'png',
    JPEG: 'jpeg',
    PDF: 'pdf',
    SVG: 'svg',
    CSV: 'csv',
    JSON: 'json',
    HTML: 'html'
}

// Formats de templates (ratios)
export const TEMPLATE_FORMATS = {
    SQUARE: { id: '1:1', name: 'Carré (1:1)', width: 1080, height: 1080, maxPages: 9 },
    LANDSCAPE: { id: '16:9', name: 'Paysage (16:9)', width: 1920, height: 1080, maxPages: 9 },
    PORTRAIT: { id: '9:16', name: 'Portrait (9:16)', width: 1080, height: 1920, maxPages: 1 },
    A4: { id: 'A4', name: 'A4', width: 2480, height: 3508, maxPages: 9 }
}

// Templates prédéfinis
export const PREDEFINED_TEMPLATES = {
    COMPACT: 'compact',
    DETAILED: 'detailed',
    COMPLETE: 'complete'
}

// Permissions et limites par type de compte
export const ACCOUNT_PERMISSIONS = {
    [ACCOUNT_TYPES.CONSUMER]: {
        name: 'Amateur',
        price: 0,
        features: {
            // Formats d'export autorisés
            exportFormats: [EXPORT_FORMATS.PNG, EXPORT_FORMATS.JPEG, EXPORT_FORMATS.PDF],
            maxExportQuality: 150, // DPI

            // Templates autorisés
            allowedTemplates: [
                PREDEFINED_TEMPLATES.COMPACT,
                PREDEFINED_TEMPLATES.DETAILED,
                PREDEFINED_TEMPLATES.COMPLETE
            ],
            customTemplates: false, // Pas de templates personnalisés
            dragAndDrop: false, // Pas de mode drag & drop

            // Formats de templates autorisés
            allowedFormats: Object.values(TEMPLATE_FORMATS), // Tous mais imposés par template
            formatCustomization: false, // Format imposé par le template

            // Personnalisation
            themeCustomization: true, // Thème clair/sombre
            colorCustomization: true, // Choix des couleurs
            imageCustomization: true, // Configuration image
            typographyCustomization: true, // Typo de base
            customFonts: false, // Pas de polices custom
            watermark: false,

            // Limites
            maxPages: 1, // Pas de pagination
            brandingRemoval: false // Branding Reviews-Maker obligatoire
        }
    },

    [ACCOUNT_TYPES.INFLUENCER_BASIC]: {
        name: 'Influenceur Basic',
        price: 7.99,
        features: {
            exportFormats: [
                EXPORT_FORMATS.PNG,
                EXPORT_FORMATS.JPEG,
                EXPORT_FORMATS.SVG,
                EXPORT_FORMATS.PDF
            ],
            maxExportQuality: 300, // DPI

            allowedTemplates: [
                PREDEFINED_TEMPLATES.COMPACT,
                PREDEFINED_TEMPLATES.DETAILED,
                PREDEFINED_TEMPLATES.COMPLETE,
                'custom' // Templates personnalisés
            ],
            customTemplates: true,
            dragAndDrop: true,

            allowedFormats: Object.values(TEMPLATE_FORMATS),
            formatCustomization: true,

            themeCustomization: true,
            colorCustomization: true,
            imageCustomization: true,
            typographyCustomization: true,
            customFonts: true,
            watermark: true, // Logo personnel

            maxPages: 9,
            brandingRemoval: true // Peut retirer le branding RM
        }
    },

    [ACCOUNT_TYPES.INFLUENCER_PRO]: {
        name: 'Influenceur Pro',
        price: 15.99,
        features: {
            exportFormats: [
                EXPORT_FORMATS.PNG,
                EXPORT_FORMATS.JPEG,
                EXPORT_FORMATS.SVG,
                EXPORT_FORMATS.PDF
            ],
            maxExportQuality: 300, // 4K mentionné dans specs = 300dpi

            allowedTemplates: [
                PREDEFINED_TEMPLATES.COMPACT,
                PREDEFINED_TEMPLATES.DETAILED,
                PREDEFINED_TEMPLATES.COMPLETE,
                'custom'
            ],
            customTemplates: true,
            dragAndDrop: true,

            allowedFormats: Object.values(TEMPLATE_FORMATS),
            formatCustomization: true,

            themeCustomization: true,
            colorCustomization: true,
            imageCustomization: true,
            typographyCustomization: true,
            customFonts: true,
            watermark: true,

            maxPages: 9,
            brandingRemoval: true
        }
    },

    [ACCOUNT_TYPES.BETA_TESTER]: {
        name: 'Beta Testeur',
        price: 0,
        features: {
            // Accès complet = équivalent Producteur pendant la bêta
            exportFormats: Object.values(EXPORT_FORMATS),
            maxExportQuality: 300,

            allowedTemplates: [
                PREDEFINED_TEMPLATES.COMPACT,
                PREDEFINED_TEMPLATES.DETAILED,
                PREDEFINED_TEMPLATES.COMPLETE
            ],
            customTemplates: true,
            dragAndDrop: true,

            allowedFormats: Object.values(TEMPLATE_FORMATS),
            formatCustomization: true,

            themeCustomization: true,
            colorCustomization: true,
            imageCustomization: true,
            typographyCustomization: true,
            customFonts: true,
            watermark: true,

            maxPages: 9,
            brandingRemoval: true,

            // Fonctionnalités avancées
            pipelineConfig: true,
            advancedStats: true,
            teamManagement: false,
            apiAccess: true
        }
    },

    [ACCOUNT_TYPES.PRODUCER]: {
        name: 'Producteur',
        price: 29.99,
        features: {
            exportFormats: Object.values(EXPORT_FORMATS), // Tous les formats
            maxExportQuality: 300,

            allowedTemplates: [
                PREDEFINED_TEMPLATES.COMPACT,
                PREDEFINED_TEMPLATES.DETAILED,
                PREDEFINED_TEMPLATES.COMPLETE,
                'custom'
            ],
            customTemplates: true,
            dragAndDrop: true,

            allowedFormats: Object.values(TEMPLATE_FORMATS),
            formatCustomization: true,

            themeCustomization: true,
            colorCustomization: true,
            imageCustomization: true,
            typographyCustomization: true,
            customFonts: true,
            watermark: true,

            maxPages: 9,
            brandingRemoval: true,

            // Exclusif producteur
            whiteLabel: true, // Exports sans marque
            apiAccess: true,
            teamManagement: true
        }
    }
}

/**
 * Résout la vraie clé de tier à utiliser dans ACCOUNT_PERMISSIONS à partir d'un utilisateur.
 *
 * `user.accountType` en base ne vaut que 'consumer'|'influencer'|'producer' (jamais
 * 'influencer_basic'/'influencer_pro', qui n'existent que dans ACCOUNT_PERMISSIONS) — le
 * sous-palier Influenceur vit en fait dans `user.roles` (JSON, même pattern de résolution que
 * `server-new/routes/templates.js:getUserAccountType`). Sans cette résolution, tout compte
 * Influenceur payant retombait silencieusement sur les permissions Consumer (perte de
 * SVG/CSV/JSON/HTML et de la haute résolution).
 * @param {{accountType?: string, roles?: string}} user
 * @returns {string} clé valide dans ACCOUNT_PERMISSIONS
 */
export function resolveAccountTypeKey(user) {
    const rawAccountType = user?.accountType
    const accountType = (typeof rawAccountType === 'string' ? rawAccountType : rawAccountType?.type) || ACCOUNT_TYPES.CONSUMER

    if (accountType !== 'influencer' && accountType !== 'influenceur') {
        // producer/consumer/beta_tester sont déjà des clés valides telles quelles.
        return accountType
    }

    let roles = []
    try {
        roles = JSON.parse(user?.roles || '{"roles":[]}').roles || []
    } catch {
        roles = []
    }

    if (roles.includes('influencer_pro')) return ACCOUNT_TYPES.INFLUENCER_PRO
    if (roles.includes('influencer_basic')) return ACCOUNT_TYPES.INFLUENCER_BASIC
    // Compte Influenceur confirmé mais sans étiquette de sous-palier retrouvée : ne jamais
    // rétrograder silencieusement vers Consumer, défaut sur le palier payant le plus bas.
    return ACCOUNT_TYPES.INFLUENCER_BASIC
}

/**
 * Vérifie si un format d'export est autorisé pour un type de compte
 */
export function canExportFormat(accountType, format) {
    // Beta tester = accès complet
    if (accountType === ACCOUNT_TYPES.BETA_TESTER) return true

    const permissions = ACCOUNT_PERMISSIONS[accountType]
    if (!permissions) return false
    return permissions.features.exportFormats.includes(format)
}

/**
 * Obtient la qualité max d'export pour un type de compte
 */
export function getMaxExportQuality(accountType) {
    // Beta tester = qualité maximale
    if (accountType === ACCOUNT_TYPES.BETA_TESTER) return 300

    const permissions = ACCOUNT_PERMISSIONS[accountType]
    return permissions?.features.maxExportQuality || 150
}

/**
 * Vérifie si le drag & drop est disponible
 */
export function hasDragAndDrop(accountType) {
    // Beta tester = accès complet
    if (accountType === ACCOUNT_TYPES.BETA_TESTER) return true

    const permissions = ACCOUNT_PERMISSIONS[accountType]
    return permissions?.features.dragAndDrop || false
}

/**
 * Vérifie si les templates personnalisés sont autorisés
 */
export function canCreateCustomTemplates(accountType) {
    // Beta tester = accès complet
    if (accountType === ACCOUNT_TYPES.BETA_TESTER) return true

    const permissions = ACCOUNT_PERMISSIONS[accountType]
    return permissions?.features.customTemplates || false
}

/**
 * Obtient le nombre max de pages pour un type de compte
 */
export function getMaxPages(accountType) {
    // Beta tester = accès complet
    if (accountType === ACCOUNT_TYPES.BETA_TESTER) return 9

    const permissions = ACCOUNT_PERMISSIONS[accountType]
    return permissions?.features.maxPages || 1
}

/**
 * Obtient toutes les permissions pour un type de compte
 */
export function getAccountFeatures(accountType) {
    // Beta tester = accès complet
    if (accountType === ACCOUNT_TYPES.BETA_TESTER) {
        return ACCOUNT_PERMISSIONS[ACCOUNT_TYPES.BETA_TESTER].features
    }

    return ACCOUNT_PERMISSIONS[accountType]?.features || ACCOUNT_PERMISSIONS[ACCOUNT_TYPES.CONSUMER].features
}

/**
 * Formatte les formats d'export pour l'UI
 */
export function getExportFormatsForUI(accountType) {
    const formats = {
        png: {
            id: 'png',
            name: 'PNG',
            description: 'Image haute qualité pour le web',
            icon: '🖼️',
            color: ' '
        },
        jpeg: {
            id: 'jpeg',
            name: 'JPEG',
            description: 'Image compressée pour les réseaux sociaux',
            icon: '📸',
            color: 'from-green-500 to-green-600'
        },
        pdf: {
            id: 'pdf',
            name: 'PDF',
            description: 'Document imprimable et archivable',
            icon: '📄',
            color: 'from-red-500 to-red-600'
        },
        svg: {
            id: 'svg',
            name: 'SVG',
            description: 'Vectoriel éditable',
            icon: '🎨',
            color: ' ',
            premium: true
        },
        csv: {
            id: 'csv',
            name: 'CSV',
            description: 'Données brutes pour analyse',
            icon: '📊',
            color: 'from-orange-500 to-orange-600',
            premium: true
        },
        json: {
            id: 'json',
            name: 'JSON',
            description: 'Export technique (API)',
            icon: '🔧',
            color: 'from-gray-500 to-gray-600',
            premium: true
        },
        html: {
            id: 'html',
            name: 'HTML',
            description: 'Page web autonome',
            icon: '🌐',
            color: 'from-teal-500 to-teal-600',
            premium: true
        }
    }

    const allowedFormats = getAccountFeatures(accountType).exportFormats
    return allowedFormats.map(formatId => formats[formatId]).filter(Boolean)
}
