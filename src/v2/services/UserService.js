/**
 * UserService - Gestion des données utilisateur et statistiques
 * Features: cache intelligent, API client, display name resolution
 * Production-ready: retry logic, fallbacks, error handling
 */

import { stateManager } from '../core/StateManager.js';
import { eventBus } from '../core/EventBus.js';
import { errorHandler } from '../core/ErrorHandler.js';
import { logger } from '../core/Logger.js';
import { authService } from './AuthService.js';

class UserService {
    constructor() {
        this.log = logger.child('User');
        this._cache = new Map();
        this._cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this._apiBase = '';
    }

    /**
     * Get user statistics
     * @param {string} email - User email (optional, uses current user if not provided)
     * @param {boolean} forceRefresh - Force refresh from API
     */
    async getStats(email = null, forceRefresh = false) {
        const userEmail = email || authService.getEmail();
        if (!userEmail) {
            return {
                total: 0,
                public: 0,
                private: 0,
                by_type: {}
            };
        }

        // Check cache
        const cacheKey = `stats:${userEmail.toLowerCase()}`;
        if (!forceRefresh) {
            const cached = this._getFromCache(cacheKey);
            if (cached) {
                this.log.debug('Stats from cache', { email: userEmail });
                return cached;
            }
        }

        this.log.info('Fetching stats', { email: userEmail });

        try {
            // Try API first
            const stats = await this._fetchStatsFromAPI(userEmail);

            // Cache the result
            this._saveToCache(cacheKey, stats);

            return stats;
        } catch (apiError) {
            this.log.warn('API fetch failed, trying local fallback', apiError);

            // Fallback to local computation
            try {
                const stats = await this._computeStatsFromLocal(userEmail);
                this._saveToCache(cacheKey, stats);
                return stats;
            } catch (localError) {
                this.log.error('Local fallback failed', localError);

                errorHandler.capture(localError, {
                    category: 'DATA',
                    context: { action: 'get_stats', email: userEmail },
                    showToast: false
                });

                // Return default stats
                return {
                    total: 0,
                    public: 0,
                    private: 0,
                    by_type: {}
                };
            }
        }
    }

    /**
     * Fetch stats from API
     */
    async _fetchStatsFromAPI(email) {
        const token = authService.getToken();
        if (!token) {
            throw new Error('No auth token available');
        }

        const response = await fetch(`${this._apiBase}/api/auth/stats`, {
            headers: { 'X-Auth-Token': token }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        return {
            total: data.total || 0,
            public: data.public || 0,
            private: data.private || 0,
            by_type: data.by_type || data.types || {}
        };
    }

    /**
     * Compute stats from local database
     */
    async _computeStatsFromLocal(email) {
        // Use global dbGetAllReviews if available
        if (typeof window.dbGetAllReviews !== 'function') {
            throw new Error('Local DB not available');
        }

        const all = await window.dbGetAllReviews();
        if (!all || !Array.isArray(all)) {
            throw new Error('Invalid reviews data');
        }

        const currentEmail = email.toLowerCase();
        const userReviews = all.filter(review => {
            if (!review || !review.id) return false;

            if (review.ownerId) {
                return review.ownerId.toLowerCase() === currentEmail;
            }

            return false;
        });

        // Remove duplicates
        const unique = Array.from(
            new Map(userReviews.map(r => [r.id, r])).values()
        );

        const stats = {
            total: unique.length,
            public: unique.filter(r => !r.isPrivate).length,
            private: unique.filter(r => r.isPrivate).length,
            by_type: {}
        };

        // Count by type
        unique.forEach(review => {
            const type = review.productType || review.type || 'Autre';
            stats.by_type[type] = (stats.by_type[type] || 0) + 1;
        });

        return stats;
    }

    /**
     * Get display name for a user
     * @param {string} identifier - Email or Discord ID
     */
    async getDisplayName(identifier = null) {
        if (!identifier) {
            // Use current user
            const user = authService.getUser();
            if (!user) return 'Utilisateur';

            return user.discordUsername || user.email || 'Utilisateur';
        }

        // Check cache
        const cacheKey = `displayName:${identifier.toLowerCase()}`;
        const cached = this._getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        this.log.debug('Resolving display name', { identifier });

        try {
            // Try API lookup
            const displayName = await this._fetchDisplayNameFromAPI(identifier);
            this._saveToCache(cacheKey, displayName, 10 * 60 * 1000); // 10 min cache
            return displayName;
        } catch (error) {
            this.log.warn('Display name lookup failed', error);

            // Fallback to identifier
            return identifier;
        }
    }

    /**
     * Fetch display name from API
     */
    async _fetchDisplayNameFromAPI(identifier) {
        const response = await fetch(`${this._apiBase}/api/users/display-name`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.displayName || identifier;
    }

    /**
     * Invalidate cache for a user
     */
    invalidateCache(email) {
        if (!email) return;

        const prefix = email.toLowerCase();
        const keys = Array.from(this._cache.keys());

        keys.forEach(key => {
            if (key.includes(prefix)) {
                this._cache.delete(key);
                this.log.debug('Cache invalidated', { key });
            }
        });

        eventBus.emit('user:cache-invalidated', { email });
    }

    /**
     * Clear all cache
     */
    clearCache() {
        this._cache.clear();
        this.log.info('All cache cleared');
    }

    /**
     * Get from cache
     */
    _getFromCache(key) {
        const entry = this._cache.get(key);
        if (!entry) return null;

        // Check if expired
        if (Date.now() > entry.expiry) {
            this._cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Save to cache
     */
    _saveToCache(key, data, ttl = null) {
        this._cache.set(key, {
            data,
            expiry: Date.now() + (ttl || this._cacheExpiry)
        });
    }

    /**
     * Prefetch data for current user
     */
    async prefetch() {
        const email = authService.getEmail();
        if (!email) return;

        this.log.info('Prefetching user data', { email });

        try {
            // Fetch stats in background
            this.getStats(email, true).catch(err => {
                this.log.warn('Prefetch stats failed', err);
            });

            // Fetch display name
            this.getDisplayName(email).catch(err => {
                this.log.warn('Prefetch display name failed', err);
            });
        } catch (error) {
            this.log.error('Prefetch failed', error);
        }
    }

    /**
     * Get favorite product type for user
     */
    async getFavoriteType(email = null) {
        const stats = await this.getStats(email);

        if (!stats.by_type || Object.keys(stats.by_type).length === 0) {
            return '—';
        }

        let maxType = '—';
        let maxCount = 0;

        Object.entries(stats.by_type).forEach(([type, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxType = type;
            }
        });

        return maxType;
    }

    /**
     * Format stats for display
     */
    formatStats(stats) {
        return {
            total: stats.total || 0,
            public: stats.public || 0,
            private: stats.private || 0,
            byType: Object.entries(stats.by_type || {})
                .map(([type, count]) => ({ type, count }))
                .sort((a, b) => b.count - a.count)
        };
    }
}

// Singleton instance
export const userService = new UserService();
export default userService;
