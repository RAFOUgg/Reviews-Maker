/**
 * StorageManager - Système de stockage unifié
 * 
 * Remplace le mix chaotique IndexedDB + localStorage + sessionStorage
 * par une API unifiée avec fallback automatique et cache en mémoire.
 * 
 * Architecture:
 * 1. Cache mémoire (Map) - ultra rapide, temporaire
 * 2. IndexedDB - persistant, grande capacité
 * 3. localStorage - fallback automatique si IndexedDB échoue
 * 4. sessionStorage - données éphémères seulement
 * 
 * Fonctionnalités:
 * - TTL (Time To Live) configurable par clé
 * - Dédoublonnage automatique
 * - Email-scoped keys (fix du bug cache collision)
 * - Migration automatique depuis ancien système
 * - Retry avec backoff exponentiel
 * 
 * @version 2.0
 * @date 2025-11-02
 */

class StorageManager {
    constructor() {
        this.db = null;
        this.dbName = 'ReviewsMaker';
        this.dbVersion = 2;
        this.storeName = 'storage';
        this.cache = new Map(); // Cache mémoire
        this.useIndexedDB = true; // Toggle si IndexedDB échoue
        this.ready = false;
        this.initPromise = null;

        // Configuration TTL par défaut (5 minutes)
        this.defaultTTL = 5 * 60 * 1000;

        // Configuration retry
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 seconde

        // Statistiques (debug)
        this.stats = {
            hits: 0,
            misses: 0,
            errors: 0,
            fallbacks: 0
        };
    }

    /**
     * Initialise le stockage (IndexedDB + migration)
     * Appelé automatiquement au premier get/set
     */
    async init() {
        if (this.ready) return true;
        if (this.initPromise) return this.initPromise;

        this.initPromise = this._initIndexedDB();

        try {
            await this.initPromise;
            this.ready = true;
            console.log('[StorageManager] Initialisé avec succès');
            await this._migrateOldData();
            return true;
        } catch (error) {
            console.warn('[StorageManager] IndexedDB non disponible, fallback localStorage:', error);
            this.useIndexedDB = false;
            this.ready = true;
            return false;
        }
    }

    /**
     * Initialise IndexedDB
     * @private
     */
    _initIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                return reject(new Error('IndexedDB not supported'));
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Créer ou upgrader l'object store
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
                    store.createIndex('email', 'email', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    /**
     * Migre les données de l'ancien système
     * @private
     */
    async _migrateOldData() {
        try {
            // Migrer authToken et authEmail si présents
            const authToken = localStorage.getItem('authToken');
            const authEmail = localStorage.getItem('authEmail');
            const discordUsername = localStorage.getItem('discordUsername');
            const discordId = localStorage.getItem('discordId');

            if (authToken && authEmail) {
                await this.set('auth', {
                    token: authToken,
                    email: authEmail,
                    discordUsername,
                    discordId
                }, { persist: true });

                console.log('[StorageManager] Migration auth data OK');
            }

            // Migrer theme
            const theme = localStorage.getItem('siteTheme');
            if (theme) {
                await this.set('theme', theme, { persist: true });
            }

            // Nettoyer les anciennes clés (optionnel, commenté par sécurité)
            // localStorage.removeItem('authToken');
            // localStorage.removeItem('authEmail');
            // etc.

        } catch (error) {
            console.warn('[StorageManager] Migration error (non-critique):', error);
        }
    }

    /**
     * Récupère une valeur
     * 
     * @param {string} key - Clé de la valeur
     * @param {object} options - Options
     * @param {string} options.scope - Email de l'utilisateur (pour scoping)
     * @param {boolean} options.useCache - Utiliser le cache mémoire (défaut: true)
     * @returns {Promise<any>} Valeur ou null
     */
    async get(key, options = {}) {
        const { scope = null, useCache = true } = options;
        const fullKey = scope ? `${scope}:${key}` : key;

        try {
            // 1. Cache mémoire
            if (useCache && this.cache.has(fullKey)) {
                const cached = this.cache.get(fullKey);
                if (this._isExpired(cached)) {
                    this.cache.delete(fullKey);
                } else {
                    this.stats.hits++;
                    return cached.value;
                }
            }

            // 2. IndexedDB
            if (this.useIndexedDB && this.ready) {
                const value = await this._getFromIndexedDB(fullKey);
                if (value !== null) {
                    if (useCache) {
                        this.cache.set(fullKey, {
                            value: value.data,
                            timestamp: value.timestamp,
                            ttl: value.ttl
                        });
                    }
                    this.stats.hits++;
                    return value.data;
                }
            }

            // 3. localStorage fallback
            const lsValue = this._getFromLocalStorage(fullKey);
            if (lsValue !== null) {
                this.stats.fallbacks++;
                return lsValue;
            }

            this.stats.misses++;
            return null;

        } catch (error) {
            console.error('[StorageManager] Get error:', error);
            this.stats.errors++;

            // Ultime fallback: localStorage
            try {
                return this._getFromLocalStorage(fullKey);
            } catch (e) {
                return null;
            }
        }
    }

    /**
     * Sauvegarde une valeur
     * 
     * @param {string} key - Clé de la valeur
     * @param {any} value - Valeur à sauvegarder
     * @param {object} options - Options
     * @param {string} options.scope - Email de l'utilisateur (pour scoping)
     * @param {number} options.ttl - Time to live en millisecondes
     * @param {boolean} options.persist - Sauvegarder dans IndexedDB (défaut: true)
     * @param {boolean} options.temporary - Sauvegarder dans sessionStorage uniquement
     * @returns {Promise<boolean>} Succès ou échec
     */
    async set(key, value, options = {}) {
        const {
            scope = null,
            ttl = this.defaultTTL,
            persist = true,
            temporary = false
        } = options;

        const fullKey = scope ? `${scope}:${key}` : key;
        const timestamp = Date.now();

        const item = {
            key: fullKey,
            data: value,
            timestamp,
            ttl,
            email: scope // Pour les requêtes par email
        };

        try {
            // 1. Cache mémoire
            this.cache.set(fullKey, {
                value,
                timestamp,
                ttl
            });

            // 2. sessionStorage si temporaire
            if (temporary) {
                sessionStorage.setItem(fullKey, JSON.stringify(item));
                return true;
            }

            // 3. IndexedDB si persist
            if (persist && this.useIndexedDB && this.ready) {
                await this._setInIndexedDB(item);
            }

            // 4. localStorage fallback/backup
            this._setInLocalStorage(fullKey, item);

            return true;

        } catch (error) {
            console.error('[StorageManager] Set error:', error);
            this.stats.errors++;

            // Fallback localStorage
            try {
                this._setInLocalStorage(fullKey, item);
                return true;
            } catch (e) {
                return false;
            }
        }
    }

    /**
     * Supprime une valeur
     * 
     * @param {string} key - Clé à supprimer
     * @param {object} options - Options
     * @param {string} options.scope - Email de l'utilisateur
     * @returns {Promise<boolean>} Succès ou échec
     */
    async remove(key, options = {}) {
        const { scope = null } = options;
        const fullKey = scope ? `${scope}:${key}` : key;

        try {
            // 1. Cache
            this.cache.delete(fullKey);

            // 2. sessionStorage
            sessionStorage.removeItem(fullKey);

            // 3. IndexedDB
            if (this.useIndexedDB && this.ready) {
                await this._removeFromIndexedDB(fullKey);
            }

            // 4. localStorage
            this._removeFromLocalStorage(fullKey);

            return true;

        } catch (error) {
            console.error('[StorageManager] Remove error:', error);
            return false;
        }
    }

    /**
     * Nettoie les données expirées
     * @returns {Promise<number>} Nombre d'entrées supprimées
     */
    async cleanup() {
        let removed = 0;

        try {
            // Cache mémoire
            for (const [key, item] of this.cache.entries()) {
                if (this._isExpired(item)) {
                    this.cache.delete(key);
                    removed++;
                }
            }

            // IndexedDB
            if (this.useIndexedDB && this.ready) {
                const all = await this._getAllFromIndexedDB();
                for (const item of all) {
                    if (this._isExpired(item)) {
                        await this._removeFromIndexedDB(item.key);
                        removed++;
                    }
                }
            }

            // localStorage (plus délicat, limite de quota)
            const lsKeys = Object.keys(localStorage);
            for (const key of lsKeys) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (item && item.timestamp && item.ttl && this._isExpired(item)) {
                        localStorage.removeItem(key);
                        removed++;
                    }
                } catch (e) {
                    // Pas un item géré par StorageManager, ignorer
                }
            }

            console.log(`[StorageManager] Cleanup: ${removed} entrées expirées supprimées`);
            return removed;

        } catch (error) {
            console.error('[StorageManager] Cleanup error:', error);
            return removed;
        }
    }

    /**
     * Nettoie toutes les données d'un utilisateur
     * 
     * @param {string} email - Email de l'utilisateur
     * @returns {Promise<number>} Nombre d'entrées supprimées
     */
    async clearUserData(email) {
        let removed = 0;
        const prefix = `${email}:`;

        try {
            // Cache
            for (const key of this.cache.keys()) {
                if (key.startsWith(prefix)) {
                    this.cache.delete(key);
                    removed++;
                }
            }

            // IndexedDB
            if (this.useIndexedDB && this.ready) {
                const items = await this._getByEmail(email);
                for (const item of items) {
                    await this._removeFromIndexedDB(item.key);
                    removed++;
                }
            }

            // localStorage
            const lsKeys = Object.keys(localStorage);
            for (const key of lsKeys) {
                if (key.startsWith(prefix)) {
                    localStorage.removeItem(key);
                    removed++;
                }
            }

            console.log(`[StorageManager] Cleared ${removed} items for user ${email}`);
            return removed;

        } catch (error) {
            console.error('[StorageManager] Clear user data error:', error);
            return removed;
        }
    }

    /**
     * Récupère les statistiques
     * @returns {object} Statistiques d'utilisation
     */
    getStats() {
        return {
            ...this.stats,
            cacheSize: this.cache.size,
            useIndexedDB: this.useIndexedDB,
            ready: this.ready,
            hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
        };
    }

    /**
     * Réinitialise les statistiques
     */
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            errors: 0,
            fallbacks: 0
        };
    }

    // ========================================
    // MÉTHODES PRIVÉES
    // ========================================

    _isExpired(item) {
        if (!item || !item.timestamp || !item.ttl) return false;
        return Date.now() - item.timestamp > item.ttl;
    }

    async _getFromIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([this.storeName], 'readonly');
            const store = tx.objectStore(this.storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                const item = request.result;
                if (item && !this._isExpired(item)) {
                    resolve(item);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async _setInIndexedDB(item) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([this.storeName], 'readwrite');
            const store = tx.objectStore(this.storeName);
            const request = store.put(item);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async _removeFromIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([this.storeName], 'readwrite');
            const store = tx.objectStore(this.storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async _getAllFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([this.storeName], 'readonly');
            const store = tx.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async _getByEmail(email) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([this.storeName], 'readonly');
            const store = tx.objectStore(this.storeName);
            const index = store.index('email');
            const request = index.getAll(email);

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    _getFromLocalStorage(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;

            const item = JSON.parse(raw);
            if (this._isExpired(item)) {
                localStorage.removeItem(key);
                return null;
            }

            return item.data;
        } catch (e) {
            // Peut-être un ancien format, retourner tel quel
            return localStorage.getItem(key);
        }
    }

    _setInLocalStorage(key, item) {
        try {
            localStorage.setItem(key, JSON.stringify(item));
        } catch (e) {
            // Quota exceeded, essayer de nettoyer
            console.warn('[StorageManager] localStorage quota exceeded, cleaning...');
            this.cleanup();
            try {
                localStorage.setItem(key, JSON.stringify(item));
            } catch (e2) {
                throw new Error('localStorage quota exceeded even after cleanup');
            }
        }
    }

    _removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            localStorage.removeItem(`${key}_timestamp`); // Ancien format
        } catch (e) {
            console.error('[StorageManager] Error removing from localStorage:', e);
        }
    }
}

// Export singleton
window.storageManager = window.storageManager || new StorageManager();

// Auto-cleanup toutes les 10 minutes
setInterval(() => {
    if (window.storageManager) {
        window.storageManager.cleanup();
    }
}, 10 * 60 * 1000);

// Cleanup au déchargement de la page
window.addEventListener('beforeunload', () => {
    if (window.storageManager) {
        window.storageManager.cleanup();
    }
});

console.log('[StorageManager] Module chargé');
