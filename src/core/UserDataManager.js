/**
 * UserDataManager - Gestion centralisée des données utilisateur
 * 
 * Refactorisé pour utiliser:
 * - StorageManager pour le cache
 * - ReviewsAPI pour les appels API
 * 
 * Supprime:
 * - clearLegacyCache() (code mort)
 * - Double stockage username/discordId
 * - Cache avec clés sans email (bug collision)
 * 
 * @version 2.0.0
 * @date 2025-11-02
 */

import { storage } from './StorageManager.js';
import { reviewsAPI } from './ReviewsAPI.js';

class UserDataManager {
    constructor() {
        // Configuration TTL (Time To Live) pour le cache
        this.CACHE_TTL = {
            discordInfo: 24 * 60 * 60 * 1000, // 24 heures
            userStats: 5 * 60 * 1000           // 5 minutes
        };
    }

    /**
     * Construit une clé de cache unique par utilisateur
     * @private
     */
    _buildCacheKey(type, email) {
        if (!email) return null;
        return `cache_${type}_${email.toLowerCase()}`;
    }

    /**
     * Récupère le profil Discord d'un utilisateur (avec cache)
     * @param {string} email
     * @param {boolean} forceRefresh
     * @returns {Promise<object|null>}
     */
    async getUserProfile(email, forceRefresh = false) {
        if (!email) return null;

        const emailLower = email.toLowerCase();
        const cacheKey = this._buildCacheKey('discord', emailLower);

        // Cache check
        if (!forceRefresh && cacheKey) {
            const cached = storage.getWithTTL(cacheKey);
            if (cached && cached.email === emailLower) {
                return cached;
            }
        }

        // Fetch from API
        try {
            const userData = await reviewsAPI.getUserByEmail(emailLower);

            if (userData) {
                const profile = {
                    email: emailLower,
                    username: userData.username || userData.user_name || null,
                    discordId: userData.discordId || userData.discord_id || null,
                    timestamp: Date.now()
                };

                // Cache avec TTL
                if (cacheKey) {
                    storage.setWithTTL(cacheKey, profile, this.CACHE_TTL.discordInfo);
                }

                return profile;
            }
        } catch (error) {
            console.warn('[UserDataManager] Failed to fetch user profile:', error);
        }

        return null;
    }

    /**
     * Récupère le nom d'affichage (username ou email)
     * @param {string} email - Si null, utilise l'email connecté
     * @returns {Promise<string>}
     */
    async getDisplayName(email = null) {
        const userEmail = email || storage.get('auth_email');
        if (!userEmail) return 'Utilisateur non connecté';

        const profile = await this.getUserProfile(userEmail);

        if (profile && profile.username &&
            !profile.username.startsWith('User#') &&
            !profile.username.startsWith('Discord #')) {
            return profile.username;
        }

        return userEmail;
    }

    /**
     * Récupère les statistiques d'un utilisateur (avec cache)
     * @param {string} email - Si null, utilise l'email connecté
     * @param {boolean} forceRefresh
     * @returns {Promise<object>}
     */
    async getUserStats(email = null, forceRefresh = false) {
        const userEmail = email || storage.get('auth_email');
        if (!userEmail) {
            return { total: 0, public: 0, private: 0, by_type: {}, email: null };
        }

        const emailLower = userEmail.toLowerCase();
        const cacheKey = this._buildCacheKey('stats', emailLower);

        // Cache check
        if (!forceRefresh && cacheKey) {
            const cached = storage.getWithTTL(cacheKey);
            if (cached && cached.email === emailLower) {
                return cached;
            }
        }

        let stats = {
            email: emailLower,
            total: 0,
            public: 0,
            private: 0,
            by_type: {},
            timestamp: Date.now()
        };

        // Fetch from API
        try {
            const apiStats = await reviewsAPI.getUserStats(emailLower);

            if (apiStats) {
                stats = {
                    email: emailLower,
                    total: apiStats.total || 0,
                    public: apiStats.public || 0,
                    private: apiStats.private || 0,
                    by_type: apiStats.by_type || apiStats.types || {},
                    timestamp: Date.now()
                };

                // Cache avec TTL
                if (cacheKey) {
                    storage.setWithTTL(cacheKey, stats, this.CACHE_TTL.userStats);
                }
            }
        } catch (error) {
            console.warn('[UserDataManager] Failed to fetch user stats:', error);
        }

        return stats;
    }

    /**
     * Invalide le cache d'un utilisateur
     * @param {string} email
     */
    invalidateUserCache(email) {
        if (!email) return;

        const emailLower = email.toLowerCase();
        const discordKey = this._buildCacheKey('discord', emailLower);
        const statsKey = this._buildCacheKey('stats', emailLower);

        if (discordKey) storage.remove(discordKey);
        if (statsKey) storage.remove(statsKey);

        console.info(`[UserDataManager] Cache invalidated for ${emailLower}`);
    }

    /**
     * Invalide tous les caches (utile après déconnexion)
     */
    clearAllCache() {
        // Récupère toutes les clés de cache
        const keys = storage.keys();
        const cacheKeys = keys.filter(k => k.startsWith('cache_'));

        cacheKeys.forEach(key => storage.remove(key));

        console.info(`[UserDataManager] Cleared ${cacheKeys.length} cache entries`);
    }

    /**
     * Nettoie les caches expirés
     * @returns {number} Nombre d'entrées supprimées
     */
    cleanExpiredCache() {
        return storage.clearExpired();
    }
}

// Export singleton
export const userDataManager = new UserDataManager();
export default userDataManager;
