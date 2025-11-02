/**
 * EventBus - Communication inter-modules sans couplage
 * Design pattern: Pub/Sub avec typage et validation
 * Production-ready: error handling, async support, debugging
 */

export class EventBus {
    constructor() {
        this._events = new Map();
        this._eventHistory = [];
        this._maxHistory = 100;
        this._debug = false;
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - { once: boolean, priority: number }
     * @returns {Function} unsubscribe function
     */
    on(event, handler, options = {}) {
        if (typeof handler !== 'function') {
            throw new TypeError('Event handler must be a function');
        }

        if (!this._events.has(event)) {
            this._events.set(event, []);
        }

        const wrapped = {
            handler,
            once: options.once || false,
            priority: options.priority || 0,
            id: Math.random().toString(36).substr(2, 9)
        };

        const handlers = this._events.get(event);
        handlers.push(wrapped);

        // Sort by priority (higher first)
        handlers.sort((a, b) => b.priority - a.priority);

        if (this._debug) {
            console.log(`[EventBus] Subscribed to "${event}" (ID: ${wrapped.id})`);
        }

        // Return unsubscribe function
        return () => this.off(event, wrapped.id);
    }

    /**
     * Subscribe once
     */
    once(event, handler, options = {}) {
        return this.on(event, handler, { ...options, once: true });
    }

    /**
     * Unsubscribe from event
     */
    off(event, handlerOrId) {
        if (!this._events.has(event)) return;

        const handlers = this._events.get(event);
        const index = typeof handlerOrId === 'string'
            ? handlers.findIndex(h => h.id === handlerOrId)
            : handlers.findIndex(h => h.handler === handlerOrId);

        if (index !== -1) {
            handlers.splice(index, 1);
            if (handlers.length === 0) {
                this._events.delete(event);
            }
            if (this._debug) {
                console.log(`[EventBus] Unsubscribed from "${event}"`);
            }
        }
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @returns {Promise<void>}
     */
    async emit(event, data) {
        if (!this._events.has(event)) {
            if (this._debug) {
                console.log(`[EventBus] No listeners for "${event}"`);
            }
            return;
        }

        const timestamp = Date.now();
        this._addToHistory({ event, data, timestamp });

        if (this._debug) {
            console.log(`[EventBus] Emitting "${event}"`, data);
        }

        const handlers = [...this._events.get(event)]; // Copy to avoid mutation during iteration
        const toRemove = [];

        for (const wrapped of handlers) {
            try {
                await Promise.resolve(wrapped.handler(data));

                if (wrapped.once) {
                    toRemove.push(wrapped.id);
                }
            } catch (error) {
                console.error(`[EventBus] Handler error for "${event}":`, error);
                // Continue executing other handlers even if one fails
            }
        }

        // Remove "once" handlers
        toRemove.forEach(id => this.off(event, id));
    }

    /**
     * Emit synchronously (use sparingly)
     */
    emitSync(event, data) {
        if (!this._events.has(event)) return;

        const timestamp = Date.now();
        this._addToHistory({ event, data, timestamp });

        const handlers = [...this._events.get(event)];
        const toRemove = [];

        for (const wrapped of handlers) {
            try {
                wrapped.handler(data);

                if (wrapped.once) {
                    toRemove.push(wrapped.id);
                }
            } catch (error) {
                console.error(`[EventBus] Handler error for "${event}":`, error);
            }
        }

        toRemove.forEach(id => this.off(event, id));
    }

    /**
     * Check if event has listeners
     */
    has(event) {
        return this._events.has(event) && this._events.get(event).length > 0;
    }

    /**
     * Get listener count for event
     */
    listenerCount(event) {
        return this._events.has(event) ? this._events.get(event).length : 0;
    }

    /**
     * Get all event names
     */
    eventNames() {
        return Array.from(this._events.keys());
    }

    /**
     * Add event to history
     */
    _addToHistory(entry) {
        this._eventHistory.push(entry);
        if (this._eventHistory.length > this._maxHistory) {
            this._eventHistory.shift();
        }
    }

    /**
     * Get event history (for debugging)
     */
    getHistory(event = null) {
        if (!event) return [...this._eventHistory];
        return this._eventHistory.filter(e => e.event === event);
    }

    /**
     * Clear all listeners
     */
    clear() {
        this._events.clear();
        if (this._debug) {
            console.log('[EventBus] All listeners cleared');
        }
    }

    /**
     * Enable/disable debug mode
     */
    setDebug(enabled) {
        this._debug = !!enabled;
    }
}

// Singleton instance
export const eventBus = new EventBus();
export default eventBus;
