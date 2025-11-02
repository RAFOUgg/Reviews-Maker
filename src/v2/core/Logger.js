/**
 * Logger - Système de logging professionnel
 * Features: niveaux, filtres, export, performance tracking
 * Production-ready: structuré, searchable, avec contexte riche
 */

export class Logger {
    constructor(namespace = 'App') {
        this.namespace = namespace;
        this._logs = [];
        this._maxLogs = 1000;
        this._level = this._getLogLevel();
        this._filters = new Set();
        this._performance = new Map();

        this.LEVELS = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            NONE: 4
        };
    }

    /**
     * Get log level from localStorage or URL
     */
    _getLogLevel() {
        // Check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('log')) {
            const level = urlParams.get('log').toUpperCase();
            if (this.LEVELS[level] !== undefined) {
                return this.LEVELS[level];
            }
        }

        // Check localStorage
        const stored = localStorage.getItem('rm_log_level');
        if (stored && this.LEVELS[stored] !== undefined) {
            return this.LEVELS[stored];
        }

        // Check DEBUG flag
        if (window.DEBUG === true) {
            return this.LEVELS.DEBUG;
        }

        // Default: INFO in production
        return this.LEVELS.INFO;
    }

    /**
     * Create log entry
     */
    _createEntry(level, levelName, args) {
        const entry = {
            timestamp: Date.now(),
            level: levelName,
            namespace: this.namespace,
            message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
            args: args,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this._logs.push(entry);
        if (this._logs.length > this._maxLogs) {
            this._logs.shift();
        }

        return entry;
    }

    /**
     * Check if should log based on level and filters
     */
    _shouldLog(level) {
        if (level < this._level) return false;
        if (this._filters.size === 0) return true;
        return this._filters.has(this.namespace);
    }

    /**
     * Format log message for console
     */
    _format(levelName, args) {
        const timestamp = new Date().toISOString().substr(11, 12);
        const badge = `[${timestamp}] [${this.namespace}] ${levelName}`;
        return [badge, ...args];
    }

    /**
     * Debug log (development only)
     */
    debug(...args) {
        if (!this._shouldLog(this.LEVELS.DEBUG)) return;

        const entry = this._createEntry(this.LEVELS.DEBUG, 'DEBUG', args);
        console.debug(...this._format('🔍 DEBUG', args));

        return entry;
    }

    /**
     * Info log
     */
    info(...args) {
        if (!this._shouldLog(this.LEVELS.INFO)) return;

        const entry = this._createEntry(this.LEVELS.INFO, 'INFO', args);
        console.info(...this._format('ℹ️ INFO', args));

        return entry;
    }

    /**
     * Warning log
     */
    warn(...args) {
        if (!this._shouldLog(this.LEVELS.WARN)) return;

        const entry = this._createEntry(this.LEVELS.WARN, 'WARN', args);
        console.warn(...this._format('⚠️ WARN', args));

        return entry;
    }

    /**
     * Error log
     */
    error(...args) {
        if (!this._shouldLog(this.LEVELS.ERROR)) return;

        const entry = this._createEntry(this.LEVELS.ERROR, 'ERROR', args);
        console.error(...this._format('❌ ERROR', args));

        return entry;
    }

    /**
     * Group logs together
     */
    group(label, collapsed = false) {
        if (collapsed) {
            console.groupCollapsed(`[${this.namespace}] ${label}`);
        } else {
            console.group(`[${this.namespace}] ${label}`);
        }
    }

    /**
     * End group
     */
    groupEnd() {
        console.groupEnd();
    }

    /**
     * Start performance timer
     */
    time(label) {
        const key = `${this.namespace}:${label}`;
        this._performance.set(key, performance.now());
    }

    /**
     * End performance timer and log
     */
    timeEnd(label) {
        const key = `${this.namespace}:${label}`;
        const start = this._performance.get(key);

        if (start === undefined) {
            this.warn(`Timer "${label}" was not started`);
            return;
        }

        const duration = performance.now() - start;
        this._performance.delete(key);

        this.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`);

        return duration;
    }

    /**
     * Set log level
     */
    setLevel(level) {
        if (typeof level === 'string') {
            level = this.LEVELS[level.toUpperCase()];
        }

        if (level === undefined || level < 0 || level > 4) {
            this.warn(`Invalid log level: ${level}`);
            return;
        }

        this._level = level;
        localStorage.setItem('rm_log_level', Object.keys(this.LEVELS)[level]);
        this.info(`Log level set to ${Object.keys(this.LEVELS)[level]}`);
    }

    /**
     * Add namespace filter (only these will log)
     */
    addFilter(namespace) {
        this._filters.add(namespace);
    }

    /**
     * Remove namespace filter
     */
    removeFilter(namespace) {
        this._filters.delete(namespace);
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this._filters.clear();
    }

    /**
     * Get logs
     */
    getLogs(options = {}) {
        const {
            level = null,
            namespace = null,
            since = null,
            search = null,
            limit = null
        } = options;

        let filtered = [...this._logs];

        if (level) {
            const levelValue = typeof level === 'string' ? this.LEVELS[level.toUpperCase()] : level;
            filtered = filtered.filter(log => log.level === Object.keys(this.LEVELS)[levelValue]);
        }

        if (namespace) {
            filtered = filtered.filter(log => log.namespace === namespace);
        }

        if (since) {
            filtered = filtered.filter(log => log.timestamp >= since);
        }

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter(log =>
                log.message.toLowerCase().includes(query)
            );
        }

        if (limit) {
            filtered = filtered.slice(-limit);
        }

        return filtered;
    }

    /**
     * Export logs as JSON
     */
    export() {
        const data = {
            exported: new Date().toISOString(),
            namespace: this.namespace,
            level: Object.keys(this.LEVELS)[this._level],
            logs: this._logs
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${this.namespace}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.info('Logs exported');
    }

    /**
     * Clear logs
     */
    clear() {
        this._logs = [];
        this._performance.clear();
        console.clear();
        this.info('Logs cleared');
    }

    /**
     * Create child logger with sub-namespace
     */
    child(subNamespace) {
        return new Logger(`${this.namespace}:${subNamespace}`);
    }
}

// Create default logger instance
export const logger = new Logger('ReviewsMaker');
export default logger;
