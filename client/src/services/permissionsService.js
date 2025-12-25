/**
 * Service de gestion des permissions et limitations par type de compte
 * Conforme au CDC : Amateur (gratuit) / Influenceur (15.99€) / Producteur (29.99€)
 */

export const ACCOUNT_TYPES = {
    CONSUMER: 'consumer', // Amateur
    INFLUENCER: 'influencer',
    PRODUCER: 'producer'
};

export const ACCOUNT_FEATURES = {
    [ACCOUNT_TYPES.CONSUMER]: {
        name: 'Amateur',
        price: 0,
        features: {
            // Exports
            exportFormats: ['png', 'jpeg', 'pdf'],
            exportQuality: 'standard', // 72dpi
            exportDailyLimit: 3,
            exportGif: false,
            forcedWatermark: true, // Filigrane "Terpologie" forcé
            customWatermarks: 0,

            // Templates
            templates: ['compact', 'detailed', 'complete'], // Prédéfinis imposés
            customTemplates: false,
            maxCustomTemplates: 0,
            dragAndDrop: false,

            // Bibliothèque
            maxPrivateReviews: 20,
            maxPublicReviews: 5,
            unlimitedLibrary: false,

            // PipeLines
            pipelineCulture: false,
            pipelineExtraction: false,
            pipelineSeparation: false,
            pipelineCuring: true, // Tous ont accès au curing
            pipelineConfigurable: false,

            // Sections
            sections: ['info', 'visual', 'curing', 'aromas', 'tastes', 'effects'],

            // Génétique
            geneticsSystem: false,

            // Personnalisation
            customFonts: false,
            themeCustomization: 'basic', // Thèmes, couleurs, typo de base

            // Autres
            analytics: 'basic',
            apiAccess: false
        }
    },

    [ACCOUNT_TYPES.INFLUENCER]: {
        name: 'Influenceur',
        price: 15.99,
        features: {
            // Exports
            exportFormats: ['png', 'jpeg', 'pdf', 'svg'],
            exportQuality: 'high', // 300dpi
            exportDailyLimit: 50,
            exportGif: true,
            forcedWatermark: false, // Pas de filigrane forcé
            customWatermarks: 10,

            // Templates
            templates: ['compact', 'detailed', 'complete', 'influencer'],
            customTemplates: true,
            maxCustomTemplates: 20,
            dragAndDrop: true,

            // Bibliothèque
            maxPrivateReviews: -1, // Illimité
            maxPublicReviews: -1, // Illimité
            unlimitedLibrary: true,

            // PipeLines
            pipelineCulture: false, // Réservé Producteurs
            pipelineExtraction: false, // Réservé Producteurs
            pipelineSeparation: false, // Réservé Producteurs
            pipelineCuring: true,
            pipelineConfigurable: false,

            // Sections
            sections: ['info', 'visual', 'curing', 'aromas', 'tastes', 'effects', 'texture'],

            // Génétique
            geneticsSystem: false, // Réservé Producteurs

            // Personnalisation
            customFonts: false,
            themeCustomization: 'advanced',

            // Autres
            analytics: 'advanced',
            apiAccess: false
        }
    },

    [ACCOUNT_TYPES.PRODUCER]: {
        name: 'Producteur',
        price: 29.99,
        features: {
            // Exports
            exportFormats: ['png', 'jpeg', 'pdf', 'svg', 'csv', 'json', 'html'],
            exportQuality: 'ultra', // 300dpi+
            exportDailyLimit: -1, // Illimité
            exportGif: true,
            forcedWatermark: false,
            customWatermarks: -1, // Illimité

            // Templates
            templates: ['compact', 'detailed', 'complete', 'influencer', 'custom'],
            customTemplates: true,
            maxCustomTemplates: -1, // Illimité
            dragAndDrop: true,

            // Bibliothèque
            maxPrivateReviews: -1,
            maxPublicReviews: -1,
            unlimitedLibrary: true,

            // PipeLines
            pipelineCulture: true,
            pipelineExtraction: true,
            pipelineSeparation: true,
            pipelineCuring: true,
            pipelineConfigurable: true,

            // Sections
            sections: ['info', 'visual', 'culture', 'extraction', 'separation', 'curing', 'aromas', 'tastes', 'effects', 'texture', 'analytics'],

            // Génétique
            geneticsSystem: true,

            // Personnalisation
            customFonts: true,
            themeCustomization: 'full',

            // Autres
            analytics: 'pro',
            apiAccess: true // À venir
        }
    }
};

/**
 * Classe de gestion des permissions
 */
export class PermissionsService {
    constructor(user) {
        this.user = user;
        this.accountType = user?.accountType || ACCOUNT_TYPES.CONSUMER;
        this.features = ACCOUNT_FEATURES[this.accountType]?.features || ACCOUNT_FEATURES[ACCOUNT_TYPES.CONSUMER].features;
    }

    // Vérifications d'export
    canExportFormat(format) {
        return this.features.exportFormats.includes(format.toLowerCase());
    }

    canExportGif() {
        return this.features.exportGif;
    }

    hasReachedExportLimit(todayExports) {
        if (this.features.exportDailyLimit === -1) return false;
        return todayExports >= this.features.exportDailyLimit;
    }

    getRemainingExports(todayExports) {
        if (this.features.exportDailyLimit === -1) return -1; // Illimité
        return Math.max(0, this.features.exportDailyLimit - todayExports);
    }

    hasCustomWatermark() {
        return !this.features.forcedWatermark && this.features.customWatermarks !== 0;
    }

    canAddWatermark(currentCount) {
        if (this.features.customWatermarks === -1) return true;
        return currentCount < this.features.customWatermarks;
    }

    // Vérifications de templates
    canUseTemplate(templateType) {
        return this.features.templates.includes(templateType);
    }

    canCreateCustomTemplate(currentCount) {
        if (!this.features.customTemplates) return false;
        if (this.features.maxCustomTemplates === -1) return true;
        return currentCount < this.features.maxCustomTemplates;
    }

    hasDragAndDrop() {
        return this.features.dragAndDrop;
    }

    // Vérifications de bibliothèque
    canAddPrivateReview(currentCount) {
        if (this.features.maxPrivateReviews === -1) return true;
        return currentCount < this.features.maxPrivateReviews;
    }

    canPublishReview(currentPublicCount) {
        if (this.features.maxPublicReviews === -1) return true;
        return currentPublicCount < this.features.maxPublicReviews;
    }

    getRemainingPrivateSlots(currentCount) {
        if (this.features.maxPrivateReviews === -1) return -1;
        return Math.max(0, this.features.maxPrivateReviews - currentCount);
    }

    getRemainingPublicSlots(currentCount) {
        if (this.features.maxPublicReviews === -1) return -1;
        return Math.max(0, this.features.maxPublicReviews - currentCount);
    }

    // Vérifications de PipeLines
    canAccessPipeline(pipelineType) {
        const pipelineKey = `pipeline${pipelineType.charAt(0).toUpperCase() + pipelineType.slice(1)}`;
        return this.features[pipelineKey] || false;
    }

    canConfigurePipeline() {
        return this.features.pipelineConfigurable;
    }

    // Vérifications de sections
    canAccessSection(sectionName) {
        return this.features.sections.includes(sectionName.toLowerCase());
    }

    getAvailableSections() {
        return this.features.sections;
    }

    // Vérifications de génétique
    hasGeneticsAccess() {
        return this.features.geneticsSystem;
    }

    // Vérifications de personnalisation
    canUseCustomFonts() {
        return this.features.customFonts;
    }

    getThemeLevel() {
        return this.features.themeCustomization;
    }

    // Vérifications analytics
    getAnalyticsLevel() {
        return this.features.analytics;
    }

    hasApiAccess() {
        return this.features.apiAccess;
    }

    // Infos du compte
    getAccountInfo() {
        return {
            type: this.accountType,
            name: ACCOUNT_FEATURES[this.accountType].name,
            price: ACCOUNT_FEATURES[this.accountType].price,
            features: this.features
        };
    }

    // Vérification d'upgrade nécessaire
    needsUpgradeFor(feature) {
        const messages = {
            'exportGif': 'L\'export GIF nécessite un compte Influenceur ou Producteur',
            'pipelineCulture': 'Les PipeLines Culture nécessitent un compte Producteur',
            'geneticsSystem': 'Le système de génétique nécessite un compte Producteur',
            'customTemplates': 'Les templates personnalisés nécessitent un compte Influenceur ou Producteur',
            'unlimitedExports': 'Les exports illimités nécessitent un compte Producteur',
            'highQuality': 'Les exports haute qualité nécessitent un compte Influenceur ou Producteur'
        };

        return messages[feature] || 'Cette fonctionnalité nécessite un compte supérieur';
    }
}

// Hook React pour faciliter l'utilisation
export const usePermissions = (user) => {
    return new PermissionsService(user);
};

// Export par défaut
export default PermissionsService;
