/**
 * StorageManager - Gestion centralisée du stockage (localStorage, sessionStorage, IndexedDB)
 * 
 * Résout les problèmes:
 * - Accès directs éparpillés (60+ occurrences)
 * - Pas de gestion d'erreurs de quota
 * - Collisions de clés
 * - Pas de préfixage
 * 
 * @version 1.0.0
 * @date 2025-11-02
 */

class StorageManager {
    constructor(namespace = 'rm') {
        this.namespace = namespace;
        this.prefix = `${namespace}_`;
        this.quotaExceeded = false;

        // Test quota disponible au démarrage
        this.checkQuota();
    }

    /**
     * Construit la clé avec préfixe namespace
     * @private
     */
    _buildKey(key) {
        return this.prefix + key;
    }

    /**
     * Détermine le storage à utiliser
     * @private
     */
    _getStorage(storageType) {
        switch (storageType) {
            case 'session':
                return window.sessionStorage;
            case 'local':
            default:
                return window.localStorage;
        }
    }

    /**
     * Vérifie si le quota storage est dépassé
     */
    checkQuota() {
        try {
            const testKey = this._buildKey('__quota_test__');
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
            this.quotaExceeded = false;
            return true;
        } catch (e) {
            if (this._isQuotaError(e)) {
                this.quotaExceeded = true;
                console.error('[StorageManager] Quota exceeded:', e);
                return false;
            }
            return true; // Autre erreur, on considère que le quota est OK
        }
    }

    /**
     * Détecte une erreur de quota
     * @private
     */
    _isQuotaError(e) {
        return e instanceof DOMException && (
            e.code === 22 ||
            e.code === 1014 ||
            e.name === 'QuotaExceededError' ||
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
        );
    }

    /**
     * Récupère une valeur du storage
     * @param {string} key - Clé (sans préfixe)
     * @param {string} storageType - 'local' ou 'session'
     * @param {*} defaultValue - Valeur par défaut
     * @returns {*}
     */
    get(key, storageType = 'local', defaultValue = null) {
        try {
            const storage = this._getStorage(storageType);
            const fullKey = this._buildKey(key);
            const value = storage.getItem(fullKey);

            if (value === null) return defaultValue;

            // Tente de parser le JSON si possible
            try {
                return JSON.parse(value);
            } catch {
                return value; // Retourne la string brute
            }
        } catch (e) {
            console.warn(`[StorageManager] Error getting ${key}:`, e);
            return defaultValue;
        }
    }

    /**
     * Stocke une valeur
     * @param {string} key - Clé (sans préfixe)
     * @param {*} value - Valeur (sera JSON.stringify si objet)
     * @param {string} storageType - 'local' ou 'session'
     * @returns {boolean} Succès
     */
    set(key, value, storageType = 'local') {
        try {
            const storage = this._getStorage(storageType);
            const fullKey = this._buildKey(key);
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

            storage.setItem(fullKey, stringValue);
            return true;
        } catch (e) {
            if (this._isQuotaError(e)) {
                this.quotaExceeded = true;
                console.error('[StorageManager] Quota exceeded, attempting cleanup');

                // Tente de libérer de l'espace
                this.clearExpired();

                // Réessaye une fois
                try {
                    const storage = this._getStorage(storageType);
                    const fullKey = this._buildKey(key);
                    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                    storage.setItem(fullKey, stringValue);
                    return true;
                } catch (e2) {
                    console.error('[StorageManager] Failed after cleanup:', e2);
                    return false;
                }
            }

            console.warn(`[StorageManager] Error setting ${key}:`, e);
            return false;
        }
    }

    /**
     * Supprime une clé
     * @param {string} key - Clé (sans préfixe)
     * @param {string} storageType - 'local' ou 'session'
     */
    remove(key, storageType = 'local') {
        try {
            const storage = this._getStorage(storageType);
            const fullKey = this._buildKey(key);
            storage.removeItem(fullKey);
            return true;
        } catch (e) {
            console.warn(`[StorageManager] Error removing ${key}:`, e);
            return false;
        }
    }

    /**
     * Vérifie si une clé existe
     * @param {string} key
     * @param {string} storageType
     * @returns {boolean}
     */
    has(key, storageType = 'local') {
        try {
            const storage = this._getStorage(storageType);
            const fullKey = this._buildKey(key);
            return storage.getItem(fullKey) !== null;
        } catch {
            return false;
        }
    }

    /**
     * Récupère toutes les clés avec le préfixe namespace
     * @param {string} storageType
     * @returns {Array<string>} Clés sans préfixe
     */
    keys(storageType = 'local') {
        try {
            const storage = this._getStorage(storageType);
            const allKeys = Object.keys(storage);
            return allKeys
                .filter(k => k.startsWith(this.prefix))
                .map(k => k.substring(this.prefix.length));
        } catch {
            return [];
        }
    }

    /**
     * Vide tout le storage avec le namespace
     * @param {string} storageType
     */
    clear(storageType = 'local') {
        try {
            const keys = this.keys(storageType);
            keys.forEach(key => this.remove(key, storageType));
            return true;
        } catch (e) {
            console.warn('[StorageManager] Error clearing storage:', e);
            return false;
        }
    }

    /**
     * Stocke avec TTL (Time To Live)
     * @param {string} key
     * @param {*} value
     * @param {number} ttlMs - Durée de vie en millisecondes
     * @param {string} storageType
     */
    setWithTTL(key, value, ttlMs, storageType = 'local') {
        const expiry = Date.now() + ttlMs;
        const data = { value, expiry };
        return this.set(key, data, storageType);
    }

    /**
     * Récupère une valeur avec TTL (retourne null si expirée)
     * @param {string} key
     * @param {string} storageType
     * @returns {*}
     */
    getWithTTL(key, storageType = 'local') {
        try {
            const data = this.get(key, storageType);
            if (!data || typeof data !== 'object') return null;

            if (!data.expiry || !data.value) {
                // Format invalide, supprime
                this.remove(key, storageType);
                return null;
            }

            if (Date.now() > data.expiry) {
                // Expiré, supprime
                this.remove(key, storageType);
                return null;
            }

            return data.value;
        } catch {
            return null;
        }
    }

    /**
     * Supprime toutes les clés expirées (avec TTL)
     */
    clearExpired(storageType = 'local') {
        try {
            const keys = this.keys(storageType);
            let cleared = 0;

            keys.forEach(key => {
                const data = this.get(key, storageType);
                if (data && typeof data === 'object' && data.expiry) {
                    if (Date.now() > data.expiry) {
                        this.remove(key, storageType);
                        cleared++;
                    }
                }
            });

            if (cleared > 0) {
                console.info(`[StorageManager] Cleared ${cleared} expired entries`);
            }

            return cleared;
        } catch (e) {
            console.warn('[StorageManager] Error clearing expired:', e);
            return 0;
        }
    }

    /**
     * Obtient l'utilisation du storage (approximative)
     * @returns {object} { used: number, available: number, percent: number }
     */
    getUsage(storageType = 'local') {
        try {
            const storage = this._getStorage(storageType);
            let used = 0;

            for (let key in storage) {
                if (storage.hasOwnProperty(key)) {
                    used += key.length + (storage[key]?.length || 0);
                }
            }

            // Approximation: 5-10 MB pour localStorage
            const available = 5 * 1024 * 1024;
            const percent = Math.round((used / available) * 100);

            return { used, available, percent };
        } catch {
            return { used: 0, available: 0, percent: 0 };
        }
    }

    /**
     * Migration: supprime les anciennes clés non préfixées
     * @param {Array<string>} oldKeys - Liste des anciennes clés
     * @param {string} storageType
     */
    migrateOldKeys(oldKeys, storageType = 'local') {
        try {
            const storage = this._getStorage(storageType);
            let migrated = 0;

            oldKeys.forEach(oldKey => {
                const value = storage.getItem(oldKey);
                if (value !== null) {
                    // Copie avec nouveau préfixe
                    const newKey = this._buildKey(oldKey);
                    storage.setItem(newKey, value);

                    // Supprime l'ancienne
                    storage.removeItem(oldKey);
                    migrated++;
                }
            });

            if (migrated > 0) {
                console.info(`[StorageManager] Migrated ${migrated} old keys`);
            }

            return migrated;
        } catch (e) {
            console.warn('[StorageManager] Error migrating keys:', e);
            return 0;
        }
    }
}

// Export singleton
export const storage = new StorageManager('rm');
export default storage;
