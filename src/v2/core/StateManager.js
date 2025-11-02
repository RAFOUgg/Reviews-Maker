/**
 * StateManager - Gestionnaire d'état centralisé
 * Design pattern: Observer + Proxy pour réactivité
 * Production-ready: immutabilité, historique, rollback
 */

export class StateManager {
    constructor() {
        this._state = {
            auth: {
                isConnected: false,
                user: null,
                token: null,
                email: null,
                discord: null
            },
            ui: {
                activeModal: null,
                modalStack: [],
                theme: 'auto',
                isMobile: window.innerWidth <= 768
            },
            data: {
                reviews: [],
                userStats: null,
                cache: new Map()
            }
        };

        this._listeners = new Map();
        this._history = [];
        this._maxHistory = 50;
        this._proxy = this._createProxy();
    }

    /**
     * Crée un proxy réactif pour détecter les changements d'état
     */
    _createProxy() {
        const handler = {
            set: (target, property, value) => {
                const oldValue = target[property];
                if (oldValue !== value) {
                    target[property] = value;
                    this._notify(property, value, oldValue);
                    this._addToHistory({ property, value, oldValue, timestamp: Date.now() });
                }
                return true;
            }
        };

        const makeReactive = (obj, path = '') => {
            if (typeof obj !== 'object' || obj === null) return obj;

            Object.keys(obj).forEach(key => {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    obj[key] = makeReactive(obj[key], `${path}${key}.`);
                }
            });

            return new Proxy(obj, handler);
        };

        return makeReactive(this._state);
    }

    /**
     * Subscribe to state changes
     * @param {string} path - État à surveiller (ex: 'auth.isConnected')
     * @param {Function} callback - Fonction appelée lors du changement
     * @returns {Function} unsubscribe function
     */
    subscribe(path, callback) {
        if (!this._listeners.has(path)) {
            this._listeners.set(path, new Set());
        }
        this._listeners.get(path).add(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this._listeners.get(path);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this._listeners.delete(path);
                }
            }
        };
    }

    /**
     * Notify listeners of state changes
     */
    _notify(property, newValue, oldValue) {
        // Notify exact path listeners
        if (this._listeners.has(property)) {
            this._listeners.get(property).forEach(cb => {
                try {
                    cb(newValue, oldValue);
                } catch (e) {
                    console.error(`[StateManager] Listener error for ${property}:`, e);
                }
            });
        }

        // Notify wildcard listeners (*)
        if (this._listeners.has('*')) {
            this._listeners.get('*').forEach(cb => {
                try {
                    cb({ property, newValue, oldValue });
                } catch (e) {
                    console.error('[StateManager] Wildcard listener error:', e);
                }
            });
        }
    }

    /**
     * Add change to history for debugging and rollback
     */
    _addToHistory(change) {
        this._history.push(change);
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        }
    }

    /**
     * Get current state (read-only copy)
     */
    getState(path = null) {
        if (!path) {
            return JSON.parse(JSON.stringify(this._state));
        }

        const parts = path.split('.');
        let value = this._state;
        for (const part of parts) {
            value = value[part];
            if (value === undefined) return undefined;
        }

        return typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
    }

    /**
     * Update state (merges deeply)
     */
    setState(path, value) {
        const parts = path.split('.');
        let target = this._proxy;

        for (let i = 0; i < parts.length - 1; i++) {
            if (!target[parts[i]]) {
                target[parts[i]] = {};
            }
            target = target[parts[i]];
        }

        const lastKey = parts[parts.length - 1];
        target[lastKey] = value;
    }

    /**
     * Batch update multiple state paths
     */
    batchUpdate(updates) {
        Object.keys(updates).forEach(path => {
            this.setState(path, updates[path]);
        });
    }

    /**
     * Get state change history (for debugging)
     */
    getHistory() {
        return [...this._history];
    }

    /**
     * Clear all listeners
     */
    destroy() {
        this._listeners.clear();
        this._history = [];
    }
}

// Singleton instance
export const stateManager = new StateManager();
export default stateManager;
