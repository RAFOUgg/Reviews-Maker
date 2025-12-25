/**
 * Utilitaires de filtrage avancé pour les reviews
 * Utilise les données structurées de productStructures.js
 */

/**
 * Recherche si une chaîne de recherche correspond à un élément dans un tableau
 * @param {string} searchTerm - Terme de recherche
 * @param {Array} array - Tableau dans lequel chercher
 * @returns {boolean}
 */
export const searchInArray = (searchTerm, array) => {
    if (!array || !Array.isArray(array)) return false
    return array.some(item =>
        item?.toLowerCase().includes(searchTerm.toLowerCase())
    )
}

/**
 * Recherche si une chaîne de recherche correspond à une valeur
 * @param {string} searchTerm - Terme de recherche
 * @param {string} value - Valeur dans laquelle chercher
 * @returns {boolean}
 */
export const searchInString = (searchTerm, value) => {
    if (!value) return false
    return value.toLowerCase().includes(searchTerm.toLowerCase())
}

/**
 * Extrait tous les termes de recherche uniques d'une review
 * @param {Object} review - Objet review
 * @returns {Set<string>} - Ensemble de termes de recherche
 */
export const extractSearchableTerms = (review) => {
    const terms = new Set()

    // Champs de base
    if (review.holderName) terms.add(review.holderName.toLowerCase())
    if (review.cultivars) terms.add(review.cultivars.toLowerCase())
    if (review.breeder) terms.add(review.breeder.toLowerCase())
    if (review.farm) terms.add(review.farm.toLowerCase())
    if (review.type) terms.add(review.type.toLowerCase())

    // Données de culture
    if (review.typeCulture) terms.add(review.typeCulture.toLowerCase())
    if (review.landrace) terms.add(review.landrace.toLowerCase())

    // Substrat (peut être un tableau)
    if (Array.isArray(review.substrat)) {
        review.substrat.forEach(s => terms.add(s.toLowerCase()))
    } else if (review.substrat) {
        terms.add(review.substrat.toLowerCase())
    }

    // Extraction et texture
    if (review.extractionMethod) terms.add(review.extractionMethod.toLowerCase())
    if (review.extractionSolvant) terms.add(review.extractionSolvant.toLowerCase())
    if (review.texture) terms.add(review.texture.toLowerCase())

    // Séparation
    if (Array.isArray(review.separationMethod)) {
        review.separationMethod.forEach(m => terms.add(m.toLowerCase()))
    } else if (review.separationMethod) {
        terms.add(review.separationMethod.toLowerCase())
    }

    // Comestibles
    if (Array.isArray(review.ingredients)) {
        review.ingredients.forEach(i => terms.add(i.toLowerCase()))
    }
    if (review.recette) terms.add(review.recette.toLowerCase())

    // Terpènes
    if (Array.isArray(review.terpenes)) {
        review.terpenes.forEach(t => {
            if (t.name) terms.add(t.name.toLowerCase())
        })
    }

    // Effets
    if (Array.isArray(review.effects)) {
        review.effects.forEach(e => {
            if (e.name) terms.add(e.name.toLowerCase())
        })
    }

    return terms
}

/**
 * Filtrage intelligent de reviews basé sur un terme de recherche
 * @param {Array} reviews - Liste des reviews
 * @param {string} searchTerm - Terme de recherche
 * @returns {Array} - Reviews filtrées
 */
export const smartSearch = (reviews, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return reviews

    const search = searchTerm.toLowerCase().trim()

    return reviews.filter(review => {
        const terms = extractSearchableTerms(review)

        // Recherche exacte
        if (terms.has(search)) return true

        // Recherche partielle dans tous les termes
        return Array.from(terms).some(term => term.includes(search))
    })
}

/**
 * Crée un index de recherche inversé pour accélérer les recherches
 * @param {Array} reviews - Liste des reviews
 * @returns {Map<string, Set<string>>} - Index inversé (terme -> IDs de reviews)
 */
export const buildSearchIndex = (reviews) => {
    const index = new Map()

    reviews.forEach(review => {
        const terms = extractSearchableTerms(review)

        terms.forEach(term => {
            if (!index.has(term)) {
                index.set(term, new Set())
            }
            index.get(term).add(review.id)
        })
    })

    return index
}

/**
 * Recherche rapide utilisant l'index inversé
 * @param {string} searchTerm - Terme de recherche
 * @param {Map} searchIndex - Index de recherche
 * @param {Array} reviews - Liste des reviews
 * @returns {Array} - Reviews filtrées
 */
export const fastSearch = (searchTerm, searchIndex, reviews) => {
    if (!searchTerm || !searchTerm.trim()) return reviews

    const search = searchTerm.toLowerCase().trim()
    const matchingIds = new Set()

    // Chercher tous les termes qui contiennent le terme de recherche
    for (const [term, ids] of searchIndex.entries()) {
        if (term.includes(search)) {
            ids.forEach(id => matchingIds.add(id))
        }
    }

    // Retourner les reviews correspondantes
    return reviews.filter(review => matchingIds.has(review.id))
}

/**
 * Suggère des termes de recherche basés sur l'input partiel
 * @param {string} partial - Terme partiel
 * @param {Map} searchIndex - Index de recherche
 * @param {number} limit - Nombre max de suggestions
 * @returns {Array<string>} - Suggestions
 */
export const suggestSearchTerms = (partial, searchIndex, limit = 10) => {
    if (!partial || !partial.trim()) return []

    const search = partial.toLowerCase().trim()
    const suggestions = []

    for (const term of searchIndex.keys()) {
        if (term.startsWith(search) && suggestions.length < limit) {
            suggestions.push(term)
        }
    }

    return suggestions.sort()
}

/**
 * Filtre les reviews par critères multiples
 * @param {Array} reviews - Liste des reviews
 * @param {Object} filters - Objet de filtres
 * @returns {Array} - Reviews filtrées
 */
export const applyMultipleFilters = (reviews, filters) => {
    return reviews.filter(review => {
        // Type
        if (filters.type && filters.type !== 'all' && review.type !== filters.type) {
            return false
        }

        // Note minimale
        if (filters.minRating && (review.overallRating || review.note || 0) < filters.minRating) {
            return false
        }

        // Durée des effets
        if (filters.dureeEffet && filters.dureeEffet !== 'all' && review.dureeEffet !== filters.dureeEffet) {
            return false
        }

        // Type de culture
        if (filters.typeCulture && filters.typeCulture !== 'all' && review.typeCulture !== filters.typeCulture) {
            return false
        }

        // Extraction
        if (filters.extraction && filters.extraction !== 'all') {
            const hasExtraction =
                review.extractionMethod?.includes(filters.extraction) ||
                review.extractionSolvant === filters.extraction ||
                review.separationMethod?.includes(filters.extraction)
            if (!hasExtraction) return false
        }

        // Texture
        if (filters.texture && filters.texture !== 'all' && review.texture !== filters.texture) {
            return false
        }

        // Landrace
        if (filters.landrace && filters.landrace !== 'all' && review.landrace !== filters.landrace) {
            return false
        }

        // Substrat
        if (filters.substrat && filters.substrat !== 'all') {
            const hasSubstrat =
                review.substrat?.includes(filters.substrat) ||
                review.substratsSystemes?.includes(filters.substrat)
            if (!hasSubstrat) return false
        }

        // Ingrédient
        if (filters.ingredient && filters.ingredient !== 'all') {
            if (!review.ingredients?.includes(filters.ingredient)) return false
        }

        return true
    })
}

/**
 * Trie les reviews selon le critère spécifié
 * @param {Array} reviews - Liste des reviews
 * @param {string} sortBy - Critère de tri
 * @returns {Array} - Reviews triées
 */
export const sortReviews = (reviews, sortBy) => {
    const sorted = [...reviews]

    switch (sortBy) {
        case 'date-desc':
            return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        case 'date-asc':
            return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        case 'rating-desc':
            return sorted.sort((a, b) => (b.overallRating || b.note || 0) - (a.overallRating || a.note || 0))
        case 'rating-asc':
            return sorted.sort((a, b) => (a.overallRating || a.note || 0) - (b.overallRating || b.note || 0))
        case 'name':
            return sorted.sort((a, b) => (a.holderName || '').localeCompare(b.holderName || ''))
        default:
            return sorted
    }
}
