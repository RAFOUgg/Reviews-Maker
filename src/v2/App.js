/**
 * App - Point d'entrée principal de Reviews Maker v2
 * Architecture modulaire production-ready
 * Initialisation progressive, gestion d'erreurs globale
 */

// Core modules
import { stateManager } from './core/StateManager.js';
import { eventBus } from './core/EventBus.js';
import { errorHandler } from './core/ErrorHandler.js';
import { logger } from './core/Logger.js';

// Services
import { authService } from './services/AuthService.js';
import { userService } from './services/UserService.js';

// UI modules
import { modalController } from './ui/ModalController.js';

class App {
    constructor() {
        this.log = logger.child('App');
        this._initialized = false;
        this._modules = new Map();
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this._initialized) {
            this.log.warn('App already initialized');
            return;
        }

        this.log.info('🚀 Initializing Reviews Maker v2...');

        try {
            // Step 1: Core initialization
            await this._initCore();

            // Step 2: Register modals
            await this._initModals();

            // Step 3: Setup authentication
            await this._initAuth();

            // Step 4: Setup UI bindings
            await this._initUI();

            // Step 5: Prefetch data
            await this._prefetchData();

            this._initialized = true;
            this.log.info('✅ App initialized successfully');

            eventBus.emit('app:ready');

            // Expose to window for debugging
            if (window.DEBUG) {
                window.__RM_V2__ = {
                    app: this,
                    state: stateManager,
                    events: eventBus,
                    auth: authService,
                    user: userService,
                    modal: modalController,
                    error: errorHandler,
                    logger: logger
                };
                this.log.debug('Debug API exposed to window.__RM_V2__');
            }

        } catch (error) {
            this.log.error('Failed to initialize app', error);
            errorHandler.capture(error, {
                category: 'UNKNOWN',
                context: { action: 'app_init' },
                showToast: true
            });
            throw error;
        }
    }

    /**
     * Initialize core modules
     */
    async _initCore() {
        this.log.debug('Initializing core...');

        // Setup debug mode
        const isDebug = window.DEBUG === true || window.location.search.includes('debug=1');
        if (isDebug) {
            logger.setLevel('DEBUG');
            eventBus.setDebug(true);
            this.log.info('Debug mode enabled');
        }

        // Subscribe to critical state changes
        stateManager.subscribe('auth.isConnected', (isConnected) => {
            this.log.info('Auth state changed:', isConnected);
            eventBus.emit('auth:state-changed', { isConnected });
        });

        this.log.debug('Core initialized');
    }

    /**
     * Register all modals
     */
    async _initModals() {
        this.log.debug('Registering modals...');

        // Account modal
        modalController.register('account', 'accountModal', {
            overlay: document.getElementById('accountModalOverlay'),
            onOpen: async () => {
                await this._renderAccountView();
            }
        });

        // Auth modal
        modalController.register('auth', 'authModal', {
            overlay: document.getElementById('authModalOverlay')
        });

        // Library modal
        modalController.register('library', 'libraryModal', {
            overlay: document.getElementById('libraryModalOverlay'),
            onOpen: async (data) => {
                const mode = data.mode || 'mine';
                await this._renderLibrary(mode);
            }
        });

        // Tips modal
        modalController.register('tips', 'tipsModal', {
            overlay: document.getElementById('tipsModalOverlay')
        });

        this.log.debug('Modals registered');
    }

    /**
     * Setup authentication
     */
    async _initAuth() {
        this.log.debug('Setting up authentication...');

        // Listen to auth events
        eventBus.on('auth:success', async (user) => {
            this.log.info('User authenticated', user);

            // Close auth modal
            modalController.close('auth');

            // Show success toast
            if (typeof window.showToast === 'function') {
                window.showToast(`Connecté en tant que ${user.discordUsername || user.email}`, 'success');
            }

            // Open account modal
            setTimeout(() => modalController.open('account'), 300);

            // Refresh UI
            await this._updateAuthUI();

            // Prefetch user data
            userService.prefetch();
        });

        eventBus.on('auth:logout', async () => {
            this.log.info('User logged out');

            // Close all modals
            modalController.closeAll();

            // Clear caches
            userService.clearCache();

            // Refresh UI
            await this._updateAuthUI();

            // Show toast
            if (typeof window.showToast === 'function') {
                window.showToast('Déconnecté', 'info');
            }
        });

        // Update UI based on initial auth state
        await this._updateAuthUI();

        this.log.debug('Authentication setup complete');
    }

    /**
     * Setup UI bindings
     */
    async _initUI() {
        this.log.debug('Setting up UI bindings...');

        // Floating auth button
        const floatingBtn = document.getElementById('floatingAuthBtn');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', () => {
                if (authService.isAuthenticated()) {
                    modalController.open('account');
                } else {
                    modalController.open('auth');
                }
            });
        }

        // Open tips button
        const openTips = document.getElementById('openTips');
        if (openTips) {
            openTips.addEventListener('click', () => {
                modalController.open('tips');
            });
        }

        // Library button
        const openLibrary = document.getElementById('openLibrary');
        if (openLibrary) {
            openLibrary.addEventListener('click', () => {
                if (!authService.isAuthenticated()) {
                    if (typeof window.showToast === 'function') {
                        window.showToast('Connectez-vous pour accéder à votre bibliothèque', 'warning');
                    }
                    modalController.open('auth');
                    return;
                }
                modalController.open('library', { mode: 'mine' });
            });
        }

        // Library from account modal
        const openLibraryFromAccount = document.getElementById('openLibraryFromAccount');
        if (openLibraryFromAccount) {
            openLibraryFromAccount.addEventListener('click', () => {
                modalController.close('account');
                setTimeout(() => {
                    modalController.open('library', { mode: 'mine', fromAccount: true });
                }, 300);
            });
        }

        // Disconnect button
        const disconnectBtn = document.getElementById('accountDisconnect');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', async () => {
                await authService.logout();
            });
        }

        // Settings
        this._setupSettings();

        this.log.debug('UI bindings complete');
    }

    /**
     * Setup settings panel
     */
    _setupSettings() {
        const openSettings = document.getElementById('openAccountSettings');
        const settingsPanel = document.getElementById('accountSettingsPanel');
        const preferencesPanel = document.getElementById('accountPreferences');
        const settingsBack = document.getElementById('accountSettingsBack');

        if (openSettings && settingsPanel) {
            openSettings.addEventListener('click', () => {
                if (preferencesPanel) preferencesPanel.style.display = 'none';
                settingsPanel.style.display = 'block';
            });
        }

        if (settingsBack) {
            settingsBack.addEventListener('click', () => {
                if (settingsPanel) settingsPanel.style.display = 'none';
                if (preferencesPanel) preferencesPanel.style.display = 'block';
            });
        }

        // Theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                const theme = e.target.value;
                localStorage.setItem('siteTheme', theme);
                this._applyTheme(theme);

                if (typeof window.showToast === 'function') {
                    window.showToast(`Thème "${theme}" appliqué`, 'success');
                }
            });

            // Set current theme
            const currentTheme = localStorage.getItem('siteTheme') || 'auto';
            themeSelect.value = currentTheme;
        }
    }

    /**
     * Apply theme
     */
    _applyTheme(theme) {
        const root = document.documentElement;

        root.classList.remove('theme-dark', 'theme-light', 'theme-violet', 'theme-rose', 'theme-bluish');

        if (theme !== 'auto') {
            root.classList.add(`theme-${theme}`);
        }

        stateManager.setState('ui.theme', theme);
        this.log.debug('Theme applied:', theme);
    }

    /**
     * Update auth UI elements
     */
    async _updateAuthUI() {
        const isAuth = authService.isAuthenticated();
        const user = authService.getUser();

        // Update floating button
        const floatingBtn = document.getElementById('floatingAuthBtn');
        if (floatingBtn) {
            if (isAuth) {
                floatingBtn.innerHTML = '<span aria-hidden="true">👤</span>';
                floatingBtn.title = 'Mon compte';
                floatingBtn.classList.add('connected');
            } else {
                floatingBtn.innerHTML = '<span aria-hidden="true">🔗</span>';
                floatingBtn.title = 'Se connecter';
                floatingBtn.classList.remove('connected');
            }
        }

        // Show/hide library button
        const openLibrary = document.getElementById('openLibrary');
        if (openLibrary) {
            openLibrary.style.display = isAuth ? 'inline-flex' : 'none';
        }

        this.log.debug('Auth UI updated', { isAuth, user });
    }

    /**
     * Render account view
     */
    async _renderAccountView() {
        this.log.debug('Rendering account view...');

        const user = authService.getUser();
        if (!user) return;

        try {
            // Get display name
            const displayName = authService.getDisplayName();
            const accountEmail = document.getElementById('accountEmail');
            if (accountEmail) {
                accountEmail.textContent = displayName;
            }

            // Get stats
            const stats = await userService.getStats();

            // Update stats display
            const statPublic = document.getElementById('statPublic');
            const statPrivate = document.getElementById('statPrivate');
            const accountTotal = document.getElementById('accountTotal');

            if (statPublic) statPublic.textContent = stats.public;
            if (statPrivate) statPrivate.textContent = stats.private;
            if (accountTotal) accountTotal.textContent = stats.total;

            // Favorite type
            const favType = await userService.getFavoriteType();
            const statFavType = document.getElementById('statFavType');
            if (statFavType) statFavType.textContent = favType;

            // By type breakdown
            const byTypeContainer = document.getElementById('accountStatsByType');
            if (byTypeContainer) {
                byTypeContainer.innerHTML = '';

                const formatted = userService.formatStats(stats);
                formatted.byType.forEach(({ type, count }) => {
                    const pill = document.createElement('div');
                    pill.className = 'type-pill';
                    pill.textContent = `${type}: ${count}`;
                    byTypeContainer.appendChild(pill);
                });
            }

            this.log.debug('Account view rendered');
        } catch (error) {
            this.log.error('Failed to render account view', error);
            errorHandler.capture(error, {
                category: 'UI',
                context: { action: 'render_account_view' },
                showToast: true
            });
        }
    }

    /**
     * Render library
     */
    async _renderLibrary(mode = 'mine') {
        this.log.debug('Rendering library...', { mode });

        try {
            // Call legacy render function if available
            if (typeof window.renderFullLibrary === 'function') {
                await window.renderFullLibrary(mode);
            } else {
                this.log.warn('renderFullLibrary not available');
            }
        } catch (error) {
            this.log.error('Failed to render library', error);
            errorHandler.capture(error, {
                category: 'UI',
                context: { action: 'render_library', mode },
                showToast: true
            });
        }
    }

    /**
     * Prefetch data
     */
    async _prefetchData() {
        this.log.debug('Prefetching data...');

        if (authService.isAuthenticated()) {
            userService.prefetch();
        }
    }

    /**
     * Check if initialized
     */
    isInitialized() {
        return this._initialized;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.log.info('Destroying app...');

        authService.destroy();
        modalController.destroy();
        stateManager.destroy();
        eventBus.clear();

        this._initialized = false;
        this.log.info('App destroyed');
    }
}

// Create and export singleton
export const app = new App();
export default app;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init().catch(err => {
            console.error('[App] Initialization failed:', err);
        });
    });
} else {
    app.init().catch(err => {
        console.error('[App] Initialization failed:', err);
    });
}
