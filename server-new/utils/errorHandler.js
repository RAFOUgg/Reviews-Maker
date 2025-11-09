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
    console.error('Error occurred:', {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        userId: req.user?.id
    })

    // Si c'est une APIError, utiliser ses propriétés
    if (err instanceof APIError) {
        return res.status(err.statusCode).json({
            error: err.code,
            message: err.message,
            ...(err.details && { details: err.details }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        })
    }

    // Erreur Prisma (base de données)
    if (err.code && err.code.startsWith('P')) {
        console.error('Prisma error:', err)
        return res.status(500).json({
            error: 'database_error',
            message: 'A database error occurred',
            ...(process.env.NODE_ENV === 'development' && {
                details: err.message,
                code: err.code
            })
        })
    }

    // Erreur Multer (upload de fichiers)
    if (err.name === 'MulterError') {
        let message = 'File upload error'
        let code = 'file_upload_error'

        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size exceeds the limit of 10MB'
            code = 'file_too_large'
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Too many files uploaded'
            code = 'too_many_files'
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected file field'
            code = 'unexpected_file'
        }

        return res.status(400).json({
            error: code,
            message,
            ...(process.env.NODE_ENV === 'development' && { details: err.message })
        })
    }

    // Erreur de syntaxe JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'invalid_json',
            message: 'Invalid JSON in request body'
        })
    }

    // Erreur générique non gérée
    res.status(err.statusCode || 500).json({
        error: 'internal_error',
        message: err.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
}

/**
 * Wrapper async pour gérer les erreurs dans les routes async
 * Évite d'avoir des try-catch partout
 * 
 * Usage:
 * router.get('/path', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation()
 *   res.json(data)
 * }))
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

/**
 * Middleware pour gérer les routes non trouvées (404)
 * À placer avant le errorHandler
 */
export function notFoundHandler(req, res, next) {
    res.status(404).json({
        error: 'not_found',
        message: `Route ${req.method} ${req.path} not found`
    })
}

/**
 * Valide qu'un utilisateur est authentifié, sinon throw une erreur
 * @param {object} req - Requête Express
 * @throws {APIError} Si non authentifié
 */
export function requireAuthOrThrow(req) {
    if (!req.isAuthenticated()) {
        throw Errors.UNAUTHORIZED()
    }
}

/**
 * Valide qu'un utilisateur est propriétaire d'une ressource
 * @param {string} resourceOwnerId - ID du propriétaire de la ressource
 * @param {object} req - Requête Express
 * @param {string} resourceName - Nom de la ressource (pour message d'erreur)
 * @throws {APIError} Si non propriétaire
 */
export function requireOwnershipOrThrow(resourceOwnerId, req, resourceName = 'resource') {
    requireAuthOrThrow(req)

    if (resourceOwnerId !== req.user.id) {
        throw Errors.NOT_OWNER(resourceName)
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
