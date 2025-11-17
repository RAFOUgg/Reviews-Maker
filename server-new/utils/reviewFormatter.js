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
        return typeof value === 'string' ? JSON.parse(value) : value
    } catch (error) {
        console.error('JSON parse error:', error)
        return defaultValue
    }
}

/**
 * Formatte une review avec parsing des champs JSON
 * @param {object} review - Review brute de la base de données
 * @param {object|null} currentUser - Utilisateur courant (optionnel)
 * @returns {object} - Review formatée
 */
export function formatReview(review, currentUser = null) {
    if (!review) {
        return null
    }

    // Parser les champs JSON
    const formatted = {
        ...review,
        terpenes: safeJSONParse(review.terpenes, []),
        tastes: safeJSONParse(review.tastes, []),
        aromas: safeJSONParse(review.aromas, []),
        substratMix: safeJSONParse(review.substratMix, []),
        effects: safeJSONParse(review.effects, []),
        images: safeJSONParse(review.images, []),
        ratings: safeJSONParse(review.ratings, null),
        categoryRatings: safeJSONParse(review.categoryRatings, null),
        cultivarsList: safeJSONParse(review.cultivarsList, []),
        pipelineExtraction: safeJSONParse(review.pipelineExtraction, null),
        pipelineSeparation: safeJSONParse(review.pipelineSeparation, null),
        extraData: safeJSONParse(review.extraData, {}),

        // URL de l'image principale
        mainImageUrl: review.mainImage ? `/images/${review.mainImage}` : null
    }

    // Formater l'avatar de l'auteur si présent
    if (review.author) {
        formatted.author = {
            ...review.author,
            avatar: review.author.avatar && review.author.discordId
                ? `https://cdn.discordapp.com/avatars/${review.author.discordId}/${review.author.avatar}.png`
                : review.author.discriminator
                    ? `https://cdn.discordapp.com/embed/avatars/${parseInt(review.author.discriminator) % 5}.png`
                    : null
        }
    }

    // Calculer et ajouter les stats de likes si disponibles
    if (review.likes && Array.isArray(review.likes)) {
        const likesCount = review.likes.filter(like => like.isLike).length
        const dislikesCount = review.likes.filter(like => !like.isLike).length

        // État du like pour l'utilisateur courant
        let userLikeState = null
        if (currentUser && currentUser.id) {
            const userLike = review.likes.find(like => like.userId === currentUser.id)
            userLikeState = userLike ? (userLike.isLike ? 'like' : 'dislike') : null
        }

        formatted.likesCount = likesCount
        formatted.dislikesCount = dislikesCount
        formatted.userLikeState = userLikeState

        // Ne pas exposer le tableau complet des likes (protection des IDs)
        delete formatted.likes
    }

    return formatted
}

// Expose orchard config/preset if present inside extraData for convenience
export function liftOrchardFromExtra(formatted) {
    if (!formatted) return formatted
    try {
        const extra = formatted.extraData || {}
        if (extra.orchardConfig) {
            formatted.orchardConfig = safeJSONParse(extra.orchardConfig, extra.orchardConfig)
        }
        if (extra.orchardPreset) {
            // orchardPreset is usually a simple string, keep as-is
            formatted.orchardPreset = extra.orchardPreset
        }
    } catch (err) {
        // ignore
    }
    return formatted
}

/**
 * Formatte plusieurs reviews
 * @param {object[]} reviews - Reviews à formater
 * @param {object|null} currentUser - Utilisateur courant (optionnel)
 * @returns {object[]} - Reviews formatées
 */
export function formatReviews(reviews, currentUser = null) {
    if (!Array.isArray(reviews)) {
        return []
    }

    return reviews.map(review => formatReview(review, currentUser))
}

/**
 * Prépare les données de review pour l'insertion/update en base
 * Convertit les objets/arrays en JSON strings
 * @param {object} data - Données à préparer
 * @returns {object} - Données prêtes pour Prisma
 */
export function prepareReviewData(data) {
    const prepared = { ...data }

    // Champs à convertir en JSON
    const jsonFields = [
        'terpenes',
        'tastes',
        'substratMix',
        'aromas',
        'effects',
        'images',
        'ratings',
        'categoryRatings',
        'cultivarsList',
        'pipelineExtraction',
        'pipelineSeparation',
        'extraData'
    ]

    jsonFields.forEach(field => {
        if (prepared[field] !== undefined && prepared[field] !== null) {
            // Si c'est déjà une string, la garder telle quelle
            if (typeof prepared[field] === 'string') {
                // Valider que c'est du JSON valide
                try {
                    JSON.parse(prepared[field])
                } catch {
                    // Si invalide, stringifier quand même pour éviter les erreurs
                    prepared[field] = JSON.stringify(prepared[field])
                }
            } else {
                // Sinon, stringifier
                prepared[field] = JSON.stringify(prepared[field])
            }
        }
    })

    return prepared
}

/**
 * Extrait les noms de fichiers images depuis les URLs complètes
 * @param {string[]} imageUrls - URLs d'images (ex: ["/images/photo.jpg"])
 * @returns {string[]} - Noms de fichiers (ex: ["photo.jpg"])
 */
export function extractImageFilenames(imageUrls) {
    if (!Array.isArray(imageUrls)) {
        return []
    }

    return imageUrls.map(url => {
        if (typeof url !== 'string') {
            return ''
        }
        return url.replace('/images/', '').replace(/^\//, '')
    }).filter(filename => filename.length > 0)
}

/**
 * Construit les clauses WHERE pour les filtres de recherche
 * @param {object} filters - Filtres (type, search, userId, isPublic)
 * @param {object|null} currentUser - Utilisateur courant (pour visibilité)
 * @returns {object} - Clause WHERE pour Prisma
 */
export function buildReviewFilters(filters, currentUser = null) {
    const where = {}

    // Filtre de visibilité : publiques + privées de l'user
    // Si filters.publicOnly === true, on force uniquement les reviews publiques
    if (filters.publicOnly === true || filters.publicOnly === 'true') {
        where.isPublic = true
    } else {
        const visibilityConditions = [{ isPublic: true }]
        if (currentUser && currentUser.id) {
            visibilityConditions.push({ authorId: currentUser.id })
        }
        where.OR = visibilityConditions
    }

    // Filtre par type de produit
    if (filters.type && filters.type !== 'all') {
        where.type = filters.type
    }

    // Filtre par auteur spécifique
    if (filters.userId) {
        // Si on filtre par userId, on ignore le filtre de visibilité général
        delete where.OR
        where.authorId = filters.userId

        // Si l'utilisateur regarde son propre profil, montrer tout
        // Sinon, seulement les publiques
        if (!currentUser || currentUser.id !== filters.userId) {
            where.isPublic = true
        }
    }

    // Recherche textuelle
    if (filters.search && filters.search.trim().length > 0) {
        const searchTerm = filters.search.trim()
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
