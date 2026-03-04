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
    // Normalize account type to accept both French and English values
    const normalized = String(accountType || '').toLowerCase()
    const isProducer = ['producteur', 'producer'].includes(normalized)
    const isInfluencer = ['influenceur', 'influencer'].includes(normalized)
    const isAmateur = ['amateur', 'consumer'].includes(normalized)

    const features = {
        // ========== TOUTES LES TIERS ==========
        canCreateReviews: true,
        canViewBasicStats: true,
        canExportPNG: true,
        canExportJPEG: true,
        canExportPDF: true,

        // ========== PRODUCTEUR (29.99€/mois) ==========
        isProducteur: isProducer,
        canAccessProductorDashboard: isProducer,
        canCreateCustomTemplates: isProducer,
        canAccessTemplateEditor: isProducer,
        canCreateWatermarks: isProducer,
        canExportCSV: isProducer,
        canExportJSON: isProducer,
        canExportSVG: isProducer || isInfluencer, // SVG = Influenceur + Producteur (spec + serveur)
        canExportHTML: isProducer,
        canAccessDragDropExport: isProducer,
        canConfigurePipeline: isProducer,
        canAccessAdvancedStats: isProducer,
        canAccessProductorStats: isProducer, // Stats culture, rendements
        canExportUnlimited: isProducer,
        canAccessGeneticsCanvas: isProducer, // Généalogie cultivars
        canUseFertilizerTracking: isProducer,
        canAccessSavedPresets: isProducer,

        // ========== INFLUENCEUR (15.99€/mois) ==========
        isInfluenceur: isInfluencer,
        canAccessInfluencerDashboard: isInfluencer,
        canAccessInfluencerStats: isInfluencer, // Stats engagement
        canExportHighQuality: isInfluencer,
        canAccessEngagementMetrics: isInfluencer, // Likes, partages, comments
        canViewAudienceAnalytics: isInfluencer,
        canAccessPreviewSystem: isInfluencer,

        // ========== PRODUCTEUR + INFLUENCEUR ==========
        isPaid: isProducer || isInfluencer,
        isAmateurOrAbove: normalized !== '',

        // ========== ADMIN ==========
        isAdmin: normalized === 'admin',
        canAccessAdminPanel: normalized === 'admin',
        canManageUsers: normalized === 'admin',
        canViewAllReviews: normalized === 'admin',
        canModerateContent: normalized === 'admin',

        // ========== AMATEUR (gratuit) ==========
        isAmateur: isAmateur,
        canAccessPresetTemplatesOnly: isAmateur,
        hasExportLimit: isAmateur, // Max 5 exports/mois
        cannotAccessPremiumFeatures: isAmateur,
    }

    return features
}

/**
 * Hook pour obtenir des détails sur les limites d'utilisation
 */
export function useAccountLimits() {
    const { accountType } = useStore()
    const normalized = String(accountType || '').toLowerCase()
    const isProducer = ['producteur', 'producer'].includes(normalized)
    const isInfluencer = ['influenceur', 'influencer'].includes(normalized)

    return {
        // Limites d'export — alignées sur EXPORT_LIMITS serveur
        // Consumer=3/jour, Influencer=50/jour, Producer=illimité (-1)
        dailyExportLimit: isProducer ? -1 : isInfluencer ? 50 : 3,
        monthlyExportLimit: isProducer ? -1 : isInfluencer ? 999 : 90,

        // Limites templates sauvegardés — Consumer=3, Influencer=20, Producer=∞
        maxCustomTemplates: isProducer ? -1 : isInfluencer ? 20 : 3,
        maxWatermarks: isProducer ? -1 : isInfluencer ? 10 : 0,

        // Limites reviews publiques — Consumer=5, Influencer/Producer=∞
        maxPublicReviews: (isProducer || isInfluencer) ? -1 : 5,

        // Export quality
        exportDPI: (isProducer || isInfluencer) ? 300 : 150,

        // Features disponibles
        supportedFormats: getExportFormats(normalized),
    }
}

/**
 * Retourne les formats d'export disponibles selon le type de compte
 */
function getExportFormats(accountType) {
    const baseFormats = ['PNG', 'JPEG', 'PDF']

    if (['producteur', 'producer'].includes(accountType)) {
        return [...baseFormats, 'SVG', 'GIF', 'CSV', 'JSON', 'HTML']
    }

    if (['influenceur', 'influencer'].includes(accountType)) {
        return [...baseFormats, 'SVG', 'GIF']
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
    const normalized = String(accountType || '').toLowerCase()
    const labels = {
        amateur: 'Amateur',
        consumer: 'Amateur',
        producteur: 'Producteur',
        producer: 'Producteur',
        influenceur: 'Influenceur',
        influencer: 'Influenceur',
        admin: 'Administrateur',
    }
    return labels[normalized] || 'Inconnu'
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
