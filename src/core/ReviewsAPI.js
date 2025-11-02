/**
 * ReviewsAPI - Client API centralisé pour toutes les opérations reviews
 * 
 * Résout les problèmes:
 * - 10+ fonctions remote* dupliquées (500+ lignes)
 * - Gestion incohérente des tokens/headers
 * - Retry/timeout différents partout
 * - Impossible de tester
 * 
 * @version 1.0.0
 * @date 2025-11-02
 */

import { storage } from './StorageManager.js';

class ReviewsAPI {
    constructor(options = {}) {
        this.baseURL = options.baseURL || '';
        this.timeout = options.timeout || 5000;
        this.maxRetries = options.maxRetries || 2;
        this.enabled = false;

        // Auto-détection du baseURL si nécessaire
        this.detectBaseURL();
    }

    /**
     * Détecte automatiquement si on est sous /reviews
     * @private
     */
    detectBaseURL() {
        try {
            const path = window.location.pathname;
            if (path && path.startsWith('/reviews')) {
                this.baseURL = '/reviews';
                console.info('[ReviewsAPI] Detected base path: /reviews');
            }
        } catch (e) {
            console.warn('[ReviewsAPI] Failed to detect base URL:', e);
        }
    }

    /**
     * Vérifie si l'API est disponible
     * @returns {Promise<boolean>}
     */
    async checkAvailability() {
        try {
            const response = await this.request('/api/ping', { method: 'GET' });
            if (response && response.ok) {
                this.enabled = true;
                console.info('[ReviewsAPI] API available');
                return true;
            }
        } catch (e) {
            console.warn('[ReviewsAPI] API not available:', e);
        }

        this.enabled = false;
        return false;
    }

    /**
     * Construit les headers pour une requête
     * @private
     */
    _buildHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...customHeaders
        };

        // Ajoute le token d'auth si disponible
        const token = storage.get('auth_token');
        if (token) {
            headers['X-Auth-Token'] = token;
        }

        return headers;
    }

    /**
     * Construit l'URL complète
     * @private
     */
    _buildURL(endpoint) {
        const base = this.baseURL || '';
        return base + endpoint;
    }

    /**
     * Fetch avec timeout
     * @private
     */
    async _fetchWithTimeout(url, options, timeoutMs) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    /**
     * Requête HTTP générique avec retry
     * @param {string} endpoint - Chemin de l'endpoint (ex: '/api/reviews')
     * @param {object} options - Options fetch (method, body, headers, etc.)
     * @returns {Promise<object>} Réponse JSON
     */
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            headers = {},
            retries = this.maxRetries,
            timeout = this.timeout,
            ...otherOptions
        } = options;

        const url = this._buildURL(endpoint);
        const finalHeaders = this._buildHeaders(headers);

        const fetchOptions = {
            method,
            headers: finalHeaders,
            ...otherOptions
        };

        if (body && method !== 'GET' && method !== 'HEAD') {
            if (body instanceof FormData) {
                // Ne pas définir Content-Type pour FormData (automatique)
                delete fetchOptions.headers['Content-Type'];
                fetchOptions.body = body;
            } else if (typeof body === 'object') {
                fetchOptions.body = JSON.stringify(body);
            } else {
                fetchOptions.body = body;
            }
        }

        let lastError = null;
        let attempt = 0;

        while (attempt <= retries) {
            try {
                const response = await this._fetchWithTimeout(url, fetchOptions, timeout);

                // Si succès, retourne la réponse
                if (response.ok) {
                    const contentType = response.headers.get('content-type') || '';
                    if (contentType.includes('application/json')) {
                        return await response.json();
                    } else {
                        return await response.text();
                    }
                }

                // Erreur HTTP
                const error = new Error(`HTTP ${response.status}`);
                error.status = response.status;
                error.response = response;

                // Essaie de parser le JSON d'erreur
                try {
                    error.data = await response.json();
                } catch {
                    error.data = await response.text().catch(() => null);
                }

                // Ne pas retry sur erreurs client (4xx)
                if (response.status >= 400 && response.status < 500) {
                    throw error;
                }

                lastError = error;
            } catch (error) {
                lastError = error;

                // Ne pas retry sur certaines erreurs
                if (error.name === 'AbortError' || error.status === 401 || error.status === 403) {
                    throw error;
                }
            }

            attempt++;
            if (attempt <= retries) {
                // Backoff exponentiel
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
                console.warn(`[ReviewsAPI] Retry ${attempt}/${retries} after ${delay}ms`);
            }
        }

        throw lastError || new Error('Request failed');
    }

    // ==================== REVIEWS OPERATIONS ====================

    /**
     * Liste toutes les reviews (avec filtres optionnels)
     * @param {object} filters - { mode: 'all'|'mine'|'public', search, type, etc. }
     * @returns {Promise<Array>}
     */
    async listReviews(filters = {}) {
        const { mode = 'all' } = filters;

        let endpoint = '/api/reviews';

        if (mode === 'mine') {
            endpoint = '/api/my/reviews';
        } else if (mode === 'public') {
            endpoint = '/api/public/reviews';
        }

        try {
            const reviews = await this.request(endpoint, { method: 'GET' });
            return Array.isArray(reviews) ? reviews : [];
        } catch (error) {
            console.error('[ReviewsAPI] listReviews error:', error);
            return [];
        }
    }

    /**
     * Récupère une review par ID
     * @param {number|string} id
     * @returns {Promise<object|null>}
     */
    async getReview(id) {
        if (!id) return null;

        try {
            const review = await this.request(`/api/reviews/${id}`, { method: 'GET' });
            return review || null;
        } catch (error) {
            console.error('[ReviewsAPI] getReview error:', error);
            return null;
        }
    }

    /**
     * Crée ou met à jour une review
     * @param {object} reviewData - Données de la review
     * @param {File} imageFile - Fichier image (optionnel)
     * @returns {Promise<object>} { ok, review, error }
     */
    async saveReview(reviewData, imageFile = null) {
        try {
            const isUpdate = !!reviewData.id;
            const method = isUpdate ? 'PUT' : 'POST';
            const endpoint = isUpdate ? `/api/reviews/${reviewData.id}` : '/api/reviews';

            let body;
            if (imageFile instanceof File) {
                // Envoi avec FormData (multipart)
                body = new FormData();
                body.append('data', JSON.stringify(reviewData));
                body.append('image', imageFile, imageFile.name);
            } else {
                // Envoi JSON simple
                const copy = { ...reviewData };
                // Éviter d'envoyer des base64 énormes
                if (copy.image && copy.image.length > 50000) {
                    delete copy.image;
                }
                body = copy;
            }

            const response = await this.request(endpoint, {
                method,
                body
            });

            return {
                ok: true,
                review: response.review || response
            };
        } catch (error) {
            console.error('[ReviewsAPI] saveReview error:', error);
            return {
                ok: false,
                error: error.data?.error || 'network_error',
                message: error.data?.message || String(error.message || error)
            };
        }
    }

    /**
     * Supprime une review
     * @param {number|string} id
     * @returns {Promise<boolean>}
     */
    async deleteReview(id) {
        if (!id) return false;

        try {
            await this.request(`/api/reviews/${id}`, { method: 'DELETE' });
            return true;
        } catch (error) {
            console.error('[ReviewsAPI] deleteReview error:', error);
            return false;
        }
    }

    /**
     * Bascule la confidentialité d'une review
     * @param {number|string} id
     * @param {boolean} isPrivate
     * @returns {Promise<boolean>}
     */
    async togglePrivacy(id, isPrivate) {
        if (!id) return false;

        try {
            await this.request(`/api/reviews/${id}/privacy`, {
                method: 'PUT',
                body: { isPrivate: !!isPrivate }
            });
            return true;
        } catch (error) {
            console.error('[ReviewsAPI] togglePrivacy error:', error);
            return false;
        }
    }

    // ==================== VOTES ====================

    /**
     * Récupère les votes d'une review
     * @param {number|string} id
     * @returns {Promise<object>} { likes, dislikes, myVote, score }
     */
    async getVotes(id) {
        const defaultVotes = { likes: 0, dislikes: 0, myVote: 0, score: 0 };
        if (!id) return defaultVotes;

        try {
            const votes = await this.request(`/api/reviews/${id}/votes`, { method: 'GET' });
            return {
                likes: votes.likes || 0,
                dislikes: votes.dislikes || 0,
                myVote: votes.myVote || 0,
                score: votes.score || 0
            };
        } catch (error) {
            console.error('[ReviewsAPI] getVotes error:', error);
            return defaultVotes;
        }
    }

    /**
     * Vote pour une review
     * @param {number|string} id
     * @param {number} vote - 1 (like) ou -1 (dislike)
     * @returns {Promise<object>} { ok, likes, dislikes, myVote }
     */
    async castVote(id, vote) {
        if (!id) return { ok: false };

        try {
            const result = await this.request(`/api/reviews/${id}/vote`, {
                method: 'POST',
                body: { vote: Number(vote) }
            });
            return { ok: true, ...result };
        } catch (error) {
            console.error('[ReviewsAPI] castVote error:', error);
            return { ok: false, error: error.data?.error || 'vote_failed' };
        }
    }

    /**
     * Retire un vote
     * @param {number|string} id
     * @returns {Promise<object>} { ok, likes, dislikes, myVote }
     */
    async removeVote(id) {
        if (!id) return { ok: false };

        try {
            const result = await this.request(`/api/reviews/${id}/vote`, {
                method: 'DELETE'
            });
            return { ok: true, ...result };
        } catch (error) {
            console.error('[ReviewsAPI] removeVote error:', error);
            return { ok: false };
        }
    }

    // ==================== USER / AUTH ====================

    /**
     * Récupère les infos de l'utilisateur connecté
     * @returns {Promise<object|null>}
     */
    async getMe() {
        try {
            const user = await this.request('/api/auth/me', { method: 'GET' });
            return user || null;
        } catch (error) {
            console.error('[ReviewsAPI] getMe error:', error);
            return null;
        }
    }

    /**
     * Récupère les stats d'un utilisateur
     * @param {string} email
     * @returns {Promise<object>}
     */
    async getUserStats(email = null) {
        const defaultStats = { total: 0, public: 0, private: 0, by_type: {} };

        try {
            const params = email ? `?email=${encodeURIComponent(email)}` : '';
            const stats = await this.request(`/api/auth/stats${params}`, { method: 'GET' });
            return stats || defaultStats;
        } catch (error) {
            console.error('[ReviewsAPI] getUserStats error:', error);
            return defaultStats;
        }
    }

    /**
     * Recherche un utilisateur par email (via LaFoncedalle)
     * @param {string} email
     * @returns {Promise<object|null>}
     */
    async getUserByEmail(email) {
        if (!email) return null;

        try {
            const user = await this.request('/api/auth/user-by-email', {
                method: 'POST',
                body: { email }
            });
            return user || null;
        } catch (error) {
            console.error('[ReviewsAPI] getUserByEmail error:', error);
            return null;
        }
    }

    // ==================== AUTH FLOW ====================

    /**
     * Demande l'envoi d'un code de vérification
     * @param {string} email
     * @returns {Promise<object>} { ok, message, error }
     */
    async sendCode(email) {
        try {
            const result = await this.request('/api/auth/send-code', {
                method: 'POST',
                body: { email }
            });
            return { ok: true, ...result };
        } catch (error) {
            console.error('[ReviewsAPI] sendCode error:', error);
            return {
                ok: false,
                error: error.data?.error || 'send_failed',
                message: error.data?.message || 'Erreur lors de l\'envoi du code'
            };
        }
    }

    /**
     * Vérifie un code de vérification
     * @param {string} email
     * @param {string} code
     * @returns {Promise<object>} { ok, token, email, error }
     */
    async verifyCode(email, code) {
        try {
            const result = await this.request('/api/auth/verify-code', {
                method: 'POST',
                body: { email, code }
            });

            if (result && result.ok && result.token) {
                // Stocke le token automatiquement
                storage.set('auth_token', result.token);
                storage.set('auth_email', result.email || email);
                return { ok: true, ...result };
            }

            return { ok: false, error: 'invalid_response' };
        } catch (error) {
            console.error('[ReviewsAPI] verifyCode error:', error);
            return {
                ok: false,
                error: error.data?.error || 'verify_failed',
                message: error.data?.message || 'Code invalide'
            };
        }
    }

    /**
     * Déconnexion
     * @returns {Promise<boolean>}
     */
    async logout() {
        try {
            await this.request('/api/auth/logout', { method: 'POST' });

            // Nettoie le storage
            storage.remove('auth_token');
            storage.remove('auth_email');
            storage.remove('discord_username');
            storage.remove('discord_id');

            return true;
        } catch (error) {
            console.error('[ReviewsAPI] logout error:', error);

            // Nettoie quand même le storage local
            storage.remove('auth_token');
            storage.remove('auth_email');

            return false;
        }
    }
}

// Export singleton
export const reviewsAPI = new ReviewsAPI();
export default reviewsAPI;
