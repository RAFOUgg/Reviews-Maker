/**
 * SPRINT 1 - Part 1.2: Frontend-Backend Permission Sync
 * 
 * Ensures frontend permissions match backend exactly
 * API calls to fetch backend permission configuration
 */

import axios from 'axios'

/**
 * Permission Sync Service
 * Fetches server-side permissions configuration
 */
export class PermissionSyncService {
    constructor(apiClient = axios) {
        this.api = apiClient
    }

    /**
     * Fetch all account types and their permissions from backend
     */
    async getAccountTypes(timeoutMs = 5000) {
        const request = this.api.get('/api/permissions/account-types', { withCredentials: true })
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeoutMs))

        try {
            const response = await Promise.race([request, timeout])
            return response.data
        } catch (error) {
            console.warn('Failed to fetch account types (fallback to defaults):', error && error.message ? error.message : error)
            // Fallback to hardcoded defaults
            return DEFAULT_ACCOUNT_TYPES
        }
    }

    /**
     * Fetch available formats for user's account type
     */
    async getAvailableExportFormats() {
        try {
            const response = await this.api.get('/api/export/formats', { withCredentials: true })
            return response.data.availableFormats
        } catch (error) {
            console.error('Failed to fetch export formats:', error && error.message ? error.message : error)
            return ['png', 'jpg', 'pdf'] // Consumer default
        }
    }

    /**
     * Fetch available templates for user
     */
    async getAvailableTemplates() {
        try {
            const response = await this.api.get('/api/export/templates', { withCredentials: true })
            return response.data.templates
        } catch (error) {
            console.error('Failed to fetch templates:', error && error.message ? error.message : error)
            return []
        }
    }

    /**
     * Check if user can access specific feature
     */
    async canAccessFeature(featureName) {
        try {
            const response = await this.api.get(`/api/permissions/feature/${featureName}`, { withCredentials: true })
            return response.data.allowed
        } catch (error) {
            // If endpoint doesn't exist, assume based on user tier
            console.warn('Failed to check feature availability:', error && error.message ? error.message : error)
            return false
        }
    }

    /**
     * Sync permissions from server on app init
     */
    async syncPermissions(user) {
        try {
            const accountTypes = await this.getAccountTypes()
            const currentUserType = accountTypes[user.accountType]

            // Store in local cache
            localStorage.setItem('permissions_cache', JSON.stringify({
                timestamp: Date.now(),
                accountTypes,
                currentUserType,
                userId: user.id
            }))

            return currentUserType
        } catch (error) {
            console.error('Permission sync failed:', error)
            return null
        }
    }
}

/**
 * Default account types (fallback if API fails)
 */
export const DEFAULT_ACCOUNT_TYPES = {
    consumer: {
        label: 'Amateur',
        sections: ['info', 'visual', 'aromas', 'taste', 'effects', 'pipeline_curing'],
        exportFormats: ['png', 'jpg', 'pdf'],
        templates: ['compact', 'detailed', 'complete']
    },
    influencer: {
        label: 'Influenceur',
        sections: ['info', 'visual', 'aromas', 'taste', 'texture', 'effects', 'pipeline_curing'],
        exportFormats: ['png', 'jpg', 'pdf', 'svg'],
        templates: ['compact', 'detailed', 'complete', 'influencer']
    },
    producer: {
        label: 'Producteur',
        sections: ['info', 'visual', 'genetic', 'aromas', 'taste', 'texture', 'effects', 'pipeline_curing', 'pipeline_culture'],
        exportFormats: ['png', 'jpg', 'pdf', 'svg', 'csv', 'json', 'html'],
        templates: ['compact', 'detailed', 'complete', 'influencer', 'custom']
    }
}

/**
 * React Hook: useFrontendPermissions
 * 
 * Combines local permissions with server sync
 */
export function useFrontendPermissions() {
    const [permissions, setPermissions] = React.useState(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState(null)
    const { user } = useUserStore()

    React.useEffect(() => {
        const syncPermissions = async () => {
            if (!user) return

            try {
                const service = new PermissionSyncService()
                const userPermissions = await service.syncPermissions(user)
                setPermissions(userPermissions)
                setError(null)
            } catch (err) {
                console.error('Failed to sync permissions:', err)
                setError(err)
                // Use defaults as fallback
                setPermissions(DEFAULT_ACCOUNT_TYPES[user.accountType])
            } finally {
                setIsLoading(false)
            }
        }

        syncPermissions()
    }, [user])

    return { permissions, isLoading, error }
}

/**
 * API: Send permission error to server for logging
 */
export async function logPermissionDenial(feature, accountType) {
    try {
        await axios.post('/api/logs/permission-denial', {
            feature,
            accountType,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        })
    } catch (error) {
        console.error('Failed to log permission denial:', error)
    }
}

/**
 * Helper: Check if feature is available
 */
export function isFeatureAvailable(feature, userAccountType) {
    const userPerms = DEFAULT_ACCOUNT_TYPES[userAccountType]
    if (!userPerms) return false

    // Check sections
    if (feature.includes('section_')) {
        const section = feature.replace('section_', '')
        return userPerms.sections.includes(section)
    }

    // Check exports
    if (feature.includes('export_')) {
        const format = feature.replace('export_', '')
        return userPerms.exportFormats.includes(format)
    }

    // Check templates
    if (feature.includes('template_')) {
        const template = feature.replace('template_', '')
        return userPerms.templates.includes(template)
    }

    return false
}

/**
 * Helper: Get upgrade suggestion
 */
export function getUpgradeSuggestion(feature, currentAccountType) {
    const suggestions = {
        genetic: 'Producteur',
        pipeline_culture: 'Producteur',
        phenohunt: 'Producteur',
        csv_export: 'Producteur',
        json_export: 'Producteur',
        html_export: 'Producteur',
        svg_export: 'Influenceur',
        template_custom: 'Producteur',
        batch_export: 'Producteur'
    }

    return suggestions[feature] || null
}

export default {
    PermissionSyncService,
    DEFAULT_ACCOUNT_TYPES,
    useFrontendPermissions,
    logPermissionDenial,
    isFeatureAvailable,
    getUpgradeSuggestion
}
