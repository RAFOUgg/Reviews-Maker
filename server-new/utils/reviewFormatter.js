/**
 * Utilitaires de formatage pour les reviews
 * Évite la duplication de code de parsing JSON dans toutes les routes
 */

/**
 * Parse un champ JSON de manière sécurisée
 * @param {string|null} value - Valeur JSON à parser
 * @param {any} defaultValue - Valeur par défaut si parsing échoue
 * @returns {any} - Valeur parsée ou défaut
 */
function safeJSONParse(value, defaultValue = null) {
    if (!value) {
        return defaultValue
    }

    try {
        // If already parsed, return as-is
        if (typeof value !== 'string') {
            return value
        }

        // Clean up common malformed patterns
        let cleaned = value.trim()

        // Fix trailing commas: "item1, " -> "item1"
        if (cleaned.endsWith(', ') || cleaned.endsWith(',')) {
            cleaned = cleaned.replace(/,\s*$/, '')
        }

        // If it looks like it should be an array but isn't wrapped
        if (cleaned && !cleaned.startsWith('[') && !cleaned.startsWith('{')) {
            // Split by comma and create array
            const items = cleaned.split(',').map(s => s.trim()).filter(Boolean)
            return items.length > 0 ? items : defaultValue
        }

        return JSON.parse(cleaned)
    } catch (error) {
        where.OR = [
            { holderName: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { hashmaker: { contains: searchTerm, mode: 'insensitive' } },
            { breeder: { contains: searchTerm, mode: 'insensitive' } },
            { farm: { contains: searchTerm, mode: 'insensitive' } }
        ]
    }

    return where
}

export default {
    formatReview,
    formatReviews,
    prepareReviewData,
    extractImageFilenames,
    buildReviewFilters
}
