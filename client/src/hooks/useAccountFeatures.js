import { useStore } from '../store/useStore'

/**
 * Hook pour centraliser la logique d'accès aux features par tier
 * Retourne des booléens indiquant si l'utilisateur peut accéder à chaque feature
 * 
 * @returns {Object} Objet avec propriétés booléennes pour chaque feature
 * 
 * @example
 * const { canAccessTemplates, canExportCSV } = useAccountFeatures()
 * if (!canAccessTemplates) return <LockedFeature />
 */
export function useAccountFeatures() {
    const { accountType } = useStore()

    // Déterminer les features par type de compte
    const features = {
        // ========== TOUTES LES TIERS ==========
        canCreateReviews: true,
        canViewBasicStats: true,
        canExportPNG: true,
        canExportJPEG: true,
        canExportPDF: true,

        // ========== PRODUCTEUR (29.99€/mois) ==========
        isProducteur: accountType === 'producteur',
        canAccessProductorDashboard: accountType === 'producteur',
        canCreateCustomTemplates: accountType === 'producteur',
        canAccessTemplateEditor: accountType === 'producteur',
        canCreateWatermarks: accountType === 'producteur',
        canExportCSV: accountType === 'producteur',
        canExportJSON: accountType === 'producteur',
        canExportSVG: accountType === 'producteur',
        canExportHTML: accountType === 'producteur',
        canAccessDragDropExport: accountType === 'producteur',
        canConfigurePipeline: accountType === 'producteur',
        canAccessAdvancedStats: accountType === 'producteur',
        canAccessProductorStats: accountType === 'producteur', // Stats culture, rendements
        canExportUnlimited: accountType === 'producteur',
        canAccessGeneticsCanvas: accountType === 'producteur', // Généalogie cultivars
        canUseFertilizerTracking: accountType === 'producteur',
        canAccessSavedPresets: accountType === 'producteur',

        // ========== INFLUENCEUR (15.99€/mois) ==========
        isInfluenceur: accountType === 'influenceur',
        canAccessInfluencerDashboard: accountType === 'influenceur',
        canAccessInfluencerStats: accountType === 'influenceur', // Stats engagement
        canExportHighQuality: accountType === 'influenceur',
        canAccessEngagementMetrics: accountType === 'influenceur', // Likes, partages, comments
        canViewAudienceAnalytics: accountType === 'influenceur',
        canAccessPreviewSystem: accountType === 'influenceur',

        // ========== PRODUCTEUR + INFLUENCEUR ==========
        isPaid: accountType === 'producteur' || accountType === 'influenceur',
        isAmateurOrAbove: accountType !== undefined,

        // ========== ADMIN ==========
        isAdmin: accountType === 'admin',
        canAccessAdminPanel: accountType === 'admin',
        canManageUsers: accountType === 'admin',
        canViewAllReviews: accountType === 'admin',
        canModerateContent: accountType === 'admin',

        // ========== AMATEUR (gratuit) ==========
        isAmateur: accountType === 'amateur',
        canAccessPresetTemplatesOnly: accountType === 'amateur',
        hasExportLimit: accountType === 'amateur', // Max 5 exports/mois
        cannotAccessPremiumFeatures: accountType === 'amateur',
    }

    return features
}

/**
 * Hook pour obtenir des détails sur les limites d'utilisation
 */
export function useAccountLimits() {
    const { accountType } = useStore()

    return {
        // Limites d'export
        monthlyExportLimit: accountType === 'amateur' ? 5 : accountType === 'producteur' ? 999 : 50,

        // Limites templates
        maxCustomTemplates: accountType === 'producteur' ? 20 : 0,
        maxWatermarks: accountType === 'producteur' ? 10 : 0,

        // Limites reviews publiques
        maxPublicReviews: accountType === 'amateur' ? 10 : 999,

        // Export quality
        exportDPI: accountType === 'producteur' ? 300 : accountType === 'influenceur' ? 300 : 150,

        // Features disponibles
        supportedFormats: getExportFormats(accountType),
    }
}

/**
 * Retourne les formats d'export disponibles selon le type de compte
 */
function getExportFormats(accountType) {
    const baseFormats = ['PNG', 'JPEG', 'PDF']

    if (accountType === 'producteur') {
        return [...baseFormats, 'SVG', 'CSV', 'JSON', 'HTML']
    }

    if (accountType === 'influenceur') {
        return [...baseFormats, 'SVG']
    }

    return baseFormats
}

/**
 * Hook pour vérifier si une feature est verrouillée
 */
export function useFeatureLock(featureName) {
    const { accountType } = useStore()
    const features = useAccountFeatures()

    const isLocked = !features[featureName]

    return {
        isLocked,
        lockedForType: isLocked ? accountType : null,
        requiredType: getRequiredTierForFeature(featureName),
    }
}

/**
 * Retourne le tier minimum requis pour une feature
 */
function getRequiredTierForFeature(featureName) {
    const tierRequirements = {
        // Producteur only
        canCreateCustomTemplates: 'producteur',
        canAccessTemplateEditor: 'producteur',
        canCreateWatermarks: 'producteur',
        canExportCSV: 'producteur',
        canExportJSON: 'producteur',
        canExportSVG: 'producteur',
        canExportHTML: 'producteur',
        canAccessDragDropExport: 'producteur',
        canConfigurePipeline: 'producteur',
        canAccessAdvancedStats: 'producteur',
        canAccessProductorStats: 'producteur',
        canAccessGeneticsCanvas: 'producteur',
        canUseFertilizerTracking: 'producteur',

        // Producteur + Influenceur
        canAccessHighQuality: 'influenceur',
        canAccessInfluencerStats: 'influenceur',
    }

    return tierRequirements[featureName] || 'amateur'
}

/**
 * Obtenir l'étiquette du type de compte
 */
export function getAccountTypeLabel(accountType) {
    const labels = {
        amateur: 'Amateur',
        producteur: 'Producteur',
        influenceur: 'Influenceur',
        admin: 'Administrateur',
    }
    return labels[accountType] || 'Inconnu'
}

/**
 * Obtenir la couleur du badge pour le type de compte
 */
export function getAccountTypeColor(accountType) {
    const colors = {
        amateur: 'gray',
        producteur: 'blue',
        influenceur: 'purple',
        admin: 'red',
    }
    return colors[accountType] || 'gray'
}

/**
 * Obtenir l'emoji du type de compte
 */
export function getAccountTypeEmoji(accountType) {
    const emojis = {
        amateur: '👤',
        producteur: '🌾',
        influenceur: '⭐',
        admin: '👨‍💼',
    }
    return emojis[accountType] || '❓'
}
