/**
 * Utilitaires de validation pour améliorer la robustesse du backend
 */

/**
 * Valide et nettoie une chaîne de caractères
 * @param {string} value - Valeur à valider
 * @param {number} minLength - Longueur minimale
 * @param {number} maxLength - Longueur maximale
 * @returns {string|null} - Valeur nettoyée ou null si invalide
 */
export function validateString(value, minLength = 1, maxLength = 1000) {
    if (!value || typeof value !== 'string') {
        return null
    }

    const trimmed = value.trim()

    if (trimmed.length < minLength || trimmed.length > maxLength) {
        return null
    }

    return trimmed
}

/**
 * Valide un nombre dans une plage donnée
 * @param {any} value - Valeur à valider
 * @param {number} min - Valeur minimale
 * @param {number} max - Valeur maximale
 * @returns {number|null} - Nombre validé ou null si invalide
 */
export function validateNumber(value, min = 0, max = 10) {
    const num = parseFloat(value)

    if (isNaN(num) || num < min || num > max) {
        return null
    }

    return num
}

/**
 * Valide et parse un objet JSON
 * @param {any} value - Valeur à valider
 * @param {any} defaultValue - Valeur par défaut si invalide
 * @returns {any} - Objet parsé ou valeur par défaut
 */
export function validateJSON(value, defaultValue = null) {
    if (!value) {
        return defaultValue
    }

    // Si c'est déjà un objet/array, le retourner
    if (typeof value === 'object') {
        return value
    }

    // Sinon, tenter de parser
    try {
        return JSON.parse(value)
    } catch (error) {
        console.error('Invalid JSON:', error)
        return defaultValue
    }
}

/**
 * Valide un booléen
 * @param {any} value - Valeur à valider
 * @param {boolean} defaultValue - Valeur par défaut
 * @returns {boolean} - Booléen validé
 */
export function validateBoolean(value, defaultValue = false) {
    if (typeof value === 'boolean') {
        return value
    }

    if (typeof value === 'string') {
        return value.toLowerCase() === 'true'
    }

    return defaultValue
}

/**
 * Valide un tableau de chaînes
 * @param {any} value - Valeur à valider
 * @param {number} maxLength - Nombre maximum d'éléments
 * @returns {string[]|null} - Tableau validé ou null
 */
export function validateStringArray(value, maxLength = 100) {
    const parsed = validateJSON(value, null)

    if (!Array.isArray(parsed)) {
        return null
    }

    // Vérifier que tous les éléments sont des chaînes
    if (!parsed.every(item => typeof item === 'string')) {
        return null
    }

    // Limiter la taille du tableau
    return parsed.slice(0, maxLength)
}

/**
 * Nettoie les données d'entrée pour éviter les injections XSS
 * @param {string} value - Valeur à nettoyer
 * @returns {string} - Valeur nettoyée
 */
export function sanitizeInput(value) {
    if (!value || typeof value !== 'string') {
        return ''
    }

    // Échapper les caractères HTML dangereux
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
}

/**
 * Valide un ID de review (format UUID ou CUID)
 * @param {string} id - ID à valider
 * @returns {boolean} - true si valide
 */
export function validateReviewId(id) {
    if (!id || typeof id !== 'string') {
        return false
    }

    // Accepter plusieurs formats d'ID :

    // 1. CUID classique : c[a-z0-9]{24}
    const cuidRegex = /^c[a-z0-9]{24}$/

    // 2. UUID v4 standard avec tirets : xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    // 3. CUID2 (nouveau format, plus long, peut contenir des tirets)
    const cuid2Regex = /^[a-z][a-z0-9_-]{8,}$/i

    return cuidRegex.test(id) || uuidRegex.test(id) || cuid2Regex.test(id)
}

/**
 * Crée un objet d'erreur standardisé
 * @param {string} code - Code d'erreur
 * @param {string} message - Message d'erreur
 * @param {number} statusCode - Code HTTP
 * @returns {object} - Objet d'erreur
 */
export function createError(code, message, statusCode = 400) {
    return {
        error: code,
        message,
        statusCode
    }
}

/**
 * Valide les données d'une review
 * @param {object} data - Données de la review
 * @returns {object} - { valid: boolean, errors: string[], cleaned: object }
 */
export function validateReviewData(data) {
    const errors = []
    const cleaned = {}

    // Champ requis: holderName
    const holderName = validateString(data.holderName, 1, 200)
    if (!holderName) {
        errors.push('holderName est requis et doit contenir 1-200 caractères')
    } else {
        cleaned.holderName = holderName
    }

    // Champ requis: type
    const validTypes = ['flower', 'hash', 'concentrate', 'edible']
    if (!data.type || !validTypes.includes(data.type)) {
        errors.push(`type est requis et doit être l'un de: ${validTypes.join(', ')}`)
    } else {
        cleaned.type = data.type
    }

    // Champs optionnels
    if (data.description !== undefined) {
        const description = validateString(data.description, 0, 5000)
        if (description !== null) {
            cleaned.description = description
        }
    }

    // Note globale (0-10) - gérer explicitement les valeurs falsy (0)
    if (Object.prototype.hasOwnProperty.call(data, 'overallRating') || Object.prototype.hasOwnProperty.call(data, 'note')) {
        const raw = Object.prototype.hasOwnProperty.call(data, 'overallRating') ? data.overallRating : data.note
        if (raw !== undefined && raw !== null && raw !== '') {
            const note = validateNumber(raw, 0, 10)
            if (note !== null) {
                cleaned.note = note
            }
        } else {
            // Valeur fournie mais vide -> définir explicitement à null
            cleaned.note = null
        }
    }

    // Ratio indica/sativa (0-100)
    if (data.indicaRatio !== undefined) {
        const indicaRatio = validateNumber(data.indicaRatio, 0, 100)
        if (indicaRatio !== null) {
            cleaned.indicaRatio = Math.round(indicaRatio)
        }
    }

    // Champs JSON (terpenes, tastes, aromas, effects, etc.)
    const jsonFields = ['terpenes', 'tastes', 'aromas', 'effects', 'ratings', 'cultivarsList', 'pipelineExtraction', 'pipelineSeparation', 'substratMix']
    jsonFields.forEach(field => {
        if (data[field] !== undefined) {
            const validated = validateJSON(data[field], null)
            if (validated !== null) {
                cleaned[field] = typeof validated === 'string' ? validated : JSON.stringify(validated)
            }
        }
    })

    // Champs booléens
    if (data.isPublic !== undefined) {
        cleaned.isPublic = validateBoolean(data.isPublic, true)
    }
    if (data.isPrivate !== undefined) {
        cleaned.isPrivate = validateBoolean(data.isPrivate, false)
    }
    if (data.purgevide !== undefined) {
        cleaned.purgevide = validateBoolean(data.purgevide, false)
    }

    // Champs texte simples
    const simpleTextFields = ['strainType', 'hashmaker', 'breeder', 'farm', 'cultivars', 'dureeEffet']
    simpleTextFields.forEach(field => {
        if (data[field] !== undefined) {
            const validated = validateString(data[field], 0, 200)
            if (validated !== null) {
                cleaned[field] = validated
            }
        }
    })

    return {
        valid: errors.length === 0,
        errors,
        cleaned
    }
}
