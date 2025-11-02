/**
 * Input Validation Utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Sanitize string input
 */
export function sanitizeString(str, maxLength = 1000) {
    if (!str) return '';
    return String(str).trim().slice(0, maxLength);
}

/**
 * Validate review data
 */
export function validateReviewData(data) {
    const errors = [];

    // Required: holderName
    if (!data.holderName || sanitizeString(data.holderName).length === 0) {
        errors.push({
            field: 'holderName',
            message: 'Titulaire requis'
        });
    }

    // Optional: productType should be one of known types
    const validTypes = ['Hash', 'Fleur', 'Concentré', 'Comestible'];
    if (data.productType && !validTypes.includes(data.productType)) {
        errors.push({
            field: 'productType',
            message: 'Type de produit invalide'
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate vote value
 */
export function isValidVote(vote) {
    return [1, -1].includes(Number(vote));
}

/**
 * Validate ID parameter
 */
export function isValidId(id) {
    const num = Number(id);
    return !isNaN(num) && num > 0 && Number.isInteger(num);
}

/**
 * Sanitize query params
 */
export function sanitizeQueryParams(params) {
    const sanitized = {};

    if (params.limit) {
        const limit = Number(params.limit);
        sanitized.limit = !isNaN(limit) && limit > 0 ? Math.min(limit, 1000) : 500;
    }

    if (params.offset) {
        const offset = Number(params.offset);
        sanitized.offset = !isNaN(offset) && offset >= 0 ? offset : 0;
    }

    if (params.search) {
        sanitized.search = sanitizeString(params.search, 200);
    }

    return sanitized;
}
