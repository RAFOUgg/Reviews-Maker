/**
 * ErrorHandler - Gestion centralisée des erreurs
 * Features: retry logic, user-friendly messages, Sentry-ready
 * Production-ready: contexte riche, categorisation, reporting
 */

import { eventBus } from './EventBus.js';

export class ErrorHandler {
    constructor() {
        this._errorLog = [];
        this._maxLogSize = 200;
        this._errorCounts = new Map();
        this._suppressedErrors = new Set();

        // Error categories avec messages user-friendly
        this._categories = {
            AUTH: {
                title: 'Erreur d\'authentification',
                icon: '🔐',
                recovery: 'Veuillez vous reconnecter'
            },
            NETWORK: {
                title: 'Erreur réseau',
                icon: '🌐',
                recovery: 'Vérifiez votre connexion'
            },
            DATA: {
                title: 'Erreur de données',
                icon: '💾',
                recovery: 'Données corrompues, rechargez la page'
            },
            UI: {
                title: 'Erreur d\'interface',
                icon: '🖼️',
                recovery: 'Rechargez la page'
            },
            VALIDATION: {
                title: 'Erreur de validation',
                icon: '⚠️',
                recovery: 'Vérifiez votre saisie'
            },
            UNKNOWN: {
                title: 'Erreur inattendue',
                icon: '❌',
                recovery: 'Veuillez réessayer'
            }
        };

        this._setupGlobalHandlers();
    }

    /**
     * Setup global error handlers
     */
    _setupGlobalHandlers() {
        // Uncaught errors
        window.addEventListener('error', (event) => {
            this.capture(event.error || new Error(event.message), {
                category: 'UNKNOWN',
                context: { type: 'uncaught', filename: event.filename, lineno: event.lineno }
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.capture(event.reason, {
                category: 'UNKNOWN',
                context: { type: 'unhandled-rejection' }
            });
        });
    }

    /**
     * Capture and handle an error
     * @param {Error|string} error - The error
     * @param {Object} options - { category, context, showToast, retry }
     * @returns {string} Error ID
     */
    capture(error, options = {}) {
        const {
            category = 'UNKNOWN',
            context = {},
            showToast = true,
            retry = null,
            silent = false
        } = options;

        // Create error object if string
        const err = typeof error === 'string' ? new Error(error) : error;

        // Generate unique error ID
        const errorId = this._generateErrorId();

        // Create error entry
        const entry = {
            id: errorId,
            error: err,
            message: err.message || String(err),
            stack: err.stack,
            category,
            context,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Check if error is suppressed
        const errorKey = `${category}:${entry.message}`;
        if (this._suppressedErrors.has(errorKey) && !silent) {
            return errorId;
        }

        // Log to console in development
        if (window.DEBUG || window.location.search.includes('debug=1')) {
            console.error(`[ErrorHandler] ${category}:`, err, context);
        }

        // Add to error log
        this._errorLog.push(entry);
        if (this._errorLog.length > this._maxLogSize) {
            this._errorLog.shift();
        }

        // Track error count
        const count = (this._errorCounts.get(errorKey) || 0) + 1;
        this._errorCounts.set(errorKey, count);

        // Emit error event
        eventBus.emit('error:captured', entry);

        // Show user-friendly toast
        if (showToast && !silent) {
            this._showErrorToast(entry, retry);
        }

        // Send to external error tracking (Sentry, etc.)
        if (typeof window.Sentry !== 'undefined') {
            window.Sentry.captureException(err, {
                tags: { category },
                extra: { errorId, ...context }
            });
        }

        return errorId;
    }

    /**
     * Show user-friendly error toast
     */
    _showErrorToast(entry, retry = null) {
        const cat = this._categories[entry.category] || this._categories.UNKNOWN;

        let message = `${cat.icon} ${cat.title}`;
        if (entry.message) {
            message += `\n${entry.message}`;
        }
        if (cat.recovery) {
            message += `\n💡 ${cat.recovery}`;
        }

        // Use toast system if available
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'error', retry);
        } else {
            console.error(message);
        }
    }

    /**
     * Generate unique error ID
     */
    _generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Wrap async function with error handling
     * @param {Function} fn - Async function
     * @param {Object} options - Error handling options
     * @returns {Function} Wrapped function
     */
    wrapAsync(fn, options = {}) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.capture(error, options);
                if (options.rethrow) throw error;
                return options.fallback !== undefined ? options.fallback : null;
            }
        };
    }

    /**
     * Retry an async operation with exponential backoff
     * @param {Function} fn - Async function to retry
     * @param {Object} options - { maxRetries, baseDelay, maxDelay, onRetry }
     * @returns {Promise} Result of successful execution
     */
    async retry(fn, options = {}) {
        const {
            maxRetries = 3,
            baseDelay = 1000,
            maxDelay = 10000,
            onRetry = null,
            category = 'UNKNOWN'
        } = options;

        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                if (attempt < maxRetries) {
                    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

                    if (onRetry) {
                        onRetry({ attempt: attempt + 1, maxRetries, delay, error });
                    }

                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // All retries failed
        this.capture(lastError, {
            category,
            context: { retries: maxRetries, reason: 'max_retries_exceeded' },
            showToast: true
        });

        throw lastError;
    }

    /**
     * Suppress specific error (e.g., for known issues)
     */
    suppress(category, message) {
        this._suppressedErrors.add(`${category}:${message}`);
    }

    /**
     * Get error log
     */
    getLog(options = {}) {
        const { category = null, since = null, limit = null } = options;

        let filtered = [...this._errorLog];

        if (category) {
            filtered = filtered.filter(e => e.category === category);
        }

        if (since) {
            filtered = filtered.filter(e => e.timestamp >= since);
        }

        if (limit) {
            filtered = filtered.slice(-limit);
        }

        return filtered;
    }

    /**
     * Get error statistics
     */
    getStats() {
        const stats = {
            total: this._errorLog.length,
            byCategory: {},
            mostFrequent: []
        };

        // Count by category
        this._errorLog.forEach(entry => {
            stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;
        });

        // Get most frequent errors
        const sorted = Array.from(this._errorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        stats.mostFrequent = sorted.map(([key, count]) => {
            const [category, message] = key.split(':');
            return { category, message, count };
        });

        return stats;
    }

    /**
     * Clear error log
     */
    clear() {
        this._errorLog = [];
        this._errorCounts.clear();
        this._suppressedErrors.clear();
    }
}

// Singleton instance
export const errorHandler = new ErrorHandler();
export default errorHandler;
