/**
 * Gestionnaires d'erreurs centralisés pour améliorer la robustesse
 */

/**
 * Classe d'erreur personnalisée pour les erreurs API
 */
export class APIError extends Error {
    constructor(code, message, statusCode = 400, details = null) {
        super(message)
        this.name = 'APIError'
        this.code = code
        this.statusCode = statusCode
        this.details = details
        Error.captureStackTrace(this, this.constructor)
    }
}

/**
 * Erreurs prédéfinies courantes
 */
export const Errors = {
    // Erreurs d'authentification (401)
    UNAUTHORIZED: () => new APIError(
        'unauthorized',
        'Authentication required',
        401
    ),
    INVALID_CREDENTIALS: () => new APIError(
        'invalid_credentials',
        'Invalid credentials provided',
        401
    ),
    SESSION_EXPIRED: () => new APIError(
        'session_expired',
        'Your session has expired. Please log in again.',
        401
    ),

    // Erreurs d'autorisation (403)
    FORBIDDEN: () => new APIError(
        'forbidden',
        'You do not have permission to access this resource',
        403
    ),
    NOT_OWNER: (resource = 'resource') => new APIError(
        'not_owner',
        `You do not have permission to modify this ${resource}`,
        403
    ),

    // Erreurs de ressource (404)
    NOT_FOUND: (resource = 'Resource') => new APIError(
        'not_found',
        `${resource} not found`,
        404
    ),
    REVIEW_NOT_FOUND: () => new APIError(
        'review_not_found',
        'Review not found',
        404
    ),
    USER_NOT_FOUND: () => new APIError(
        'user_not_found',
        'User not found',
        404
    ),

    // Erreurs de validation (400)
    VALIDATION_ERROR: (details) => new APIError(
        'validation_error',
        'Validation failed',
        400,
        details
    ),
    MISSING_FIELD: (field) => new APIError(
        'missing_field',
        `Required field missing: ${field}`,
        400
    ),
    INVALID_FIELD: (field, reason) => new APIError(
        'invalid_field',
        `Invalid field '${field}': ${reason}`,
        400
    ),
    INVALID_FILE_TYPE: () => new APIError(
        'invalid_file_type',
        'Only image files (jpeg, jpg, png, gif, webp) are allowed',
        400
    ),
    FILE_TOO_LARGE: (maxSize = '10MB') => new APIError(
        'file_too_large',
        `File size exceeds the limit of ${maxSize}`,
        400
    ),
    TOO_MANY_FILES: (max) => new APIError(
        'too_many_files',
        `Maximum ${max} files allowed`,
        400
    ),

    // Erreurs serveur (500)
    INTERNAL_ERROR: (message = 'An unexpected error occurred') => new APIError(
        'internal_error',
        message,
        500
    ),
    DATABASE_ERROR: () => new APIError(
        'database_error',
        'Database operation failed',
        500
    ),
    FILE_OPERATION_ERROR: () => new APIError(
        'file_operation_error',
        'File operation failed',
        500
    )
}

/**
 * Middleware de gestion d'erreurs global
 * À placer en dernier dans la chaîne de middlewares Express
 */
export function errorHandler(err, req, res, next) {
    // Logger l'erreur pour le débogage
    }
}

export default {
    APIError,
    Errors,
    errorHandler,
    asyncHandler,
    notFoundHandler,
    requireAuthOrThrow,
    requireOwnershipOrThrow
}
