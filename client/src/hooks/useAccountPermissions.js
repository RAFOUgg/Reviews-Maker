/**
 * useAccountPermissions - Hook pour gérer les permissions par type de compte
 * 
 * Types de comptes :
 * - amateur (gratuit) : Accès limité
 * - producteur (29.99€/mois) : Accès complet
 * - influenceur (15.99€/mois) : Accès étendu
 */

import { useStore } from '../store/useStore';

const ACCOUNT_TYPES = {
    AMATEUR: 'amateur',
    PRODUCTEUR: 'producteur',
    INFLUENCEUR: 'influenceur'
};

const PERMISSIONS = {
    // Sections accessibles
    sections: {
        [ACCOUNT_TYPES.AMATEUR]: [
            'infos', 'visual', 'odeurs', 'gouts', 'effets', 'curing'
        ],
        [ACCOUNT_TYPES.PRODUCTEUR]: [
            'infos', 'genetics', 'culture', 'separation', 'extraction',
            'recipe', 'visual', 'odeurs', 'texture', 'gouts', 'effets',
            'curing', 'analytics', 'experience'
        ],
        [ACCOUNT_TYPES.INFLUENCEUR]: [
            'infos', 'visual', 'odeurs', 'texture', 'gouts', 'effets',
            'curing', 'analytics', 'experience'
        ]
    },

    // Templates d'export
    exportTemplates: {
        [ACCOUNT_TYPES.AMATEUR]: ['compact', 'detaille', 'complete'],
        [ACCOUNT_TYPES.PRODUCTEUR]: ['compact', 'detaille', 'complete', 'influenceur', 'personnalise'],
        [ACCOUNT_TYPES.INFLUENCEUR]: ['compact', 'detaille', 'complete', 'influenceur']
    },

    // Formats d'export
    exportFormats: {
        [ACCOUNT_TYPES.AMATEUR]: ['png', 'jpeg', 'pdf-low'],
        [ACCOUNT_TYPES.PRODUCTEUR]: ['png', 'jpeg', 'pdf', 'svg', 'csv', 'json', 'html'],
        [ACCOUNT_TYPES.INFLUENCEUR]: ['png', 'jpeg', 'pdf', 'svg']
    },

    // Qualité d'export
    exportQuality: {
        [ACCOUNT_TYPES.AMATEUR]: { max: 150, label: 'Moyenne (150 DPI)' },
        [ACCOUNT_TYPES.PRODUCTEUR]: { max: 300, label: 'Haute (300 DPI)' },
        [ACCOUNT_TYPES.INFLUENCEUR]: { max: 300, label: 'Haute (300 DPI)' }
    },

    // Pipelines
    pipelines: {
        [ACCOUNT_TYPES.AMATEUR]: {
            enabled: false,
            message: '🔒 Les Pipelines sont réservés aux comptes Producteur'
        },
        [ACCOUNT_TYPES.PRODUCTEUR]: {
            enabled: true,
            configurable: true,
            dragDrop: true
        },
        [ACCOUNT_TYPES.INFLUENCEUR]: {
            enabled: true,
            configurable: false,
            dragDrop: false
        }
    },

    // Personnalisation
    customization: {
        [ACCOUNT_TYPES.AMATEUR]: {
            theme: true,
            colors: true,
            fonts: false,
            watermark: false,
            layout: false
        },
        [ACCOUNT_TYPES.PRODUCTEUR]: {
            theme: true,
            colors: true,
            fonts: true,
            watermark: true,
            layout: true,
            dragDrop: true
        },
        [ACCOUNT_TYPES.INFLUENCEUR]: {
            theme: true,
            colors: true,
            fonts: true,
            watermark: true,
            layout: false
        }
    },

    // Stockage
    storage: {
        [ACCOUNT_TYPES.AMATEUR]: { maxReviews: 10, maxPhotos: 20 },
        [ACCOUNT_TYPES.PRODUCTEUR]: { maxReviews: -1, maxPhotos: -1 }, // Illimité
        [ACCOUNT_TYPES.INFLUENCEUR]: { maxReviews: 100, maxPhotos: 400 }
    }
};

export const useAccountPermissions = () => {
    const { user } = useStore();
    const accountType = user?.accountType || ACCOUNT_TYPES.AMATEUR;

    /**
     * Vérifier si une section est accessible
     */
    const canAccessSection = (sectionId) => {
        return PERMISSIONS.sections[accountType]?.includes(sectionId) || false;
    };

    /**
     * Vérifier si un template d'export est disponible
     */
    const canUseTemplate = (templateId) => {
        return PERMISSIONS.exportTemplates[accountType]?.includes(templateId) || false;
    };

    /**
     * Vérifier si un format d'export est disponible
     */
    const canExportAs = (format) => {
        return PERMISSIONS.exportFormats[accountType]?.includes(format) || false;
    };

    /**
     * Obtenir la qualité d'export maximale
     */
    const getMaxExportQuality = () => {
        return PERMISSIONS.exportQuality[accountType] || PERMISSIONS.exportQuality[ACCOUNT_TYPES.AMATEUR];
    };

    /**
     * Vérifier si les pipelines sont accessibles
     */
    const canUsePipelines = () => {
        return PERMISSIONS.pipelines[accountType]?.enabled || false;
    };

    /**
     * Obtenir les permissions de pipeline
     */
    const getPipelinePermissions = () => {
        return PERMISSIONS.pipelines[accountType] || PERMISSIONS.pipelines[ACCOUNT_TYPES.AMATEUR];
    };

    /**
     * Vérifier les permissions de personnalisation
     */
    const getCustomizationPermissions = () => {
        return PERMISSIONS.customization[accountType] || PERMISSIONS.customization[ACCOUNT_TYPES.AMATEUR];
    };

    /**
     * Obtenir les limites de stockage
     */
    const getStorageLimits = () => {
        return PERMISSIONS.storage[accountType] || PERMISSIONS.storage[ACCOUNT_TYPES.AMATEUR];
    };

    /**
     * Vérifier si c'est un compte premium
     */
    const isPremium = () => {
        return accountType === ACCOUNT_TYPES.PRODUCTEUR || accountType === ACCOUNT_TYPES.INFLUENCEUR;
    };

    /**
     * Obtenir les sections filtrées
     */
    const filterSections = (sections) => {
        return sections.filter(section => canAccessSection(section.id));
    };

    return {
        accountType,
        isPremium: isPremium(),
        canAccessSection,
        canUseTemplate,
        canExportAs,
        getMaxExportQuality,
        canUsePipelines,
        getPipelinePermissions,
        getCustomizationPermissions,
        getStorageLimits,
        filterSections,
        ACCOUNT_TYPES,
        PERMISSIONS
    };
};

export default useAccountPermissions;
