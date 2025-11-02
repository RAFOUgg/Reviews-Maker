/**
 * AuthService - Gestion d'authentification robuste
 * Features: auto-reconnect, token refresh, état persistant
 * Production-ready: retry logic, error handling, security
 */

import { stateManager } from '../core/StateManager.js';
import { eventBus } from '../core/EventBus.js';
import { errorHandler } from '../core/ErrorHandler.js';
import { logger } from '../core/Logger.js';

class AuthService {
    constructor() {
        this.log = logger.child('Auth');
        this._token = null;
        this._email = null;
        this._user = null;
        this._refreshTimer = null;
        this._sessionCheckInterval = 60000; // Check every minute

        // Initialize from localStorage
        this._loadSession();
        this._startSessionCheck();
    }

    /**
     * Load session from localStorage
     */
    _loadSession() {
        try {
            const token = localStorage.getItem('authToken');
            const email = localStorage.getItem('authEmail');
            const discordUsername = localStorage.getItem('discordUsername');
            const discordId = localStorage.getItem('discordId');

            if (token && email) {
                this._token = token;
                this._email = email;
                this._user = {
                    email,
                    discordUsername: discordUsername || null,
                    discordId: discordId || null
                };

                // Update state
                stateManager.batchUpdate({
                    'auth.isConnected': true,
                    'auth.token': token,
                    'auth.email': email,
                    'auth.user': this._user,
                    'auth.discord': {
                        username: discordUsername || null,
                        id: discordId || null
                    }
                });

                this.log.info('Session restored', { email });
                eventBus.emit('auth:restored', this._user);
            } else {
                this.log.debug('No saved session found');
            }
        } catch (error) {
            errorHandler.capture(error, {
                category: 'AUTH',
                context: { action: 'load_session' },
                showToast: false
            });
        }
    }

    /**
     * Start periodic session check
     */
    _startSessionCheck() {
        this._refreshTimer = setInterval(() => {
            if (this.isAuthenticated()) {
                this._validateSession().catch(err => {
                    this.log.warn('Session validation failed', err);
                });
            }
        }, this._sessionCheckInterval);
    }

    /**
     * Validate current session with backend
     */
    async _validateSession() {
        if (!this._token) return false;

        try {
            const response = await fetch('/api/auth/validate', {
                headers: {
                    'X-Auth-Token': this._token
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.log.warn('Session expired');
                    await this.logout();
                    return false;
                }
                throw new Error(`Session validation failed: ${response.status}`);
            }

            const data = await response.json();
            this.log.debug('Session valid', data);
            return true;
        } catch (error) {
            this.log.warn('Session validation error', error);
            return false;
        }
    }

    /**
     * Send verification code to email
     */
    async sendVerificationCode(email) {
        this.log.info('Sending verification code', { email });

        try {
            const response = await errorHandler.retry(
                async () => {
                    const res = await fetch('/api/auth/send-code', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });

                    if (!res.ok) {
                        const error = await res.json();
                        throw new Error(error.message || 'Failed to send verification code');
                    }

                    return res.json();
                },
                {
                    maxRetries: 2,
                    baseDelay: 1000,
                    category: 'AUTH',
                    onRetry: ({ attempt }) => {
                        this.log.debug(`Retrying send code (attempt ${attempt})`);
                    }
                }
            );

            this.log.info('Verification code sent');
            eventBus.emit('auth:code-sent', { email });

            return { success: true };
        } catch (error) {
            errorHandler.capture(error, {
                category: 'AUTH',
                context: { action: 'send_code', email },
                showToast: true
            });
            throw error;
        }
    }

    /**
     * Verify code and complete authentication
     */
    async verifyCode(email, code) {
        this.log.info('Verifying code', { email });

        try {
            const response = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Invalid verification code');
            }

            const data = await response.json();

            // Store auth data
            this._token = data.token;
            this._email = email;
            this._user = {
                email,
                discordUsername: data.discordUsername || null,
                discordId: data.discordId || null
            };

            // Persist to localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authEmail', email);
            if (data.discordUsername) {
                localStorage.setItem('discordUsername', data.discordUsername);
            }
            if (data.discordId) {
                localStorage.setItem('discordId', data.discordId);
            }

            // Update state
            stateManager.batchUpdate({
                'auth.isConnected': true,
                'auth.token': data.token,
                'auth.email': email,
                'auth.user': this._user,
                'auth.discord': {
                    username: data.discordUsername || null,
                    id: data.discordId || null
                }
            });

            this.log.info('Authentication successful', { email });
            eventBus.emit('auth:success', this._user);

            return { success: true, user: this._user };
        } catch (error) {
            errorHandler.capture(error, {
                category: 'AUTH',
                context: { action: 'verify_code', email },
                showToast: true
            });
            throw error;
        }
    }

    /**
     * Logout and clear session
     */
    async logout() {
        this.log.info('Logging out');

        try {
            // Clear local state
            this._token = null;
            this._email = null;
            this._user = null;

            // Clear localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('authEmail');
            localStorage.removeItem('discordUsername');
            localStorage.removeItem('discordId');

            // Clear session storage
            sessionStorage.removeItem('authEmail');

            // Update state
            stateManager.batchUpdate({
                'auth.isConnected': false,
                'auth.token': null,
                'auth.email': null,
                'auth.user': null,
                'auth.discord': null
            });

            this.log.info('Logout complete');
            eventBus.emit('auth:logout');

            return { success: true };
        } catch (error) {
            errorHandler.capture(error, {
                category: 'AUTH',
                context: { action: 'logout' },
                showToast: true
            });
            throw error;
        }
    }

    /**
     * Get current authentication status
     */
    isAuthenticated() {
        return !!(this._token && this._email);
    }

    /**
     * Get current user
     */
    getUser() {
        return this._user;
    }

    /**
     * Get auth token
     */
    getToken() {
        return this._token;
    }

    /**
     * Get user email
     */
    getEmail() {
        return this._email;
    }

    /**
     * Get display name (Discord username or email)
     */
    getDisplayName() {
        if (!this._user) return null;
        return this._user.discordUsername || this._user.email;
    }

    /**
     * Check if user has Discord linked
     */
    hasDiscord() {
        return !!(this._user && this._user.discordId);
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this._refreshTimer) {
            clearInterval(this._refreshTimer);
            this._refreshTimer = null;
        }
    }
}

// Singleton instance
export const authService = new AuthService();
export default authService;
