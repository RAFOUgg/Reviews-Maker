/**
 * Compatibility Layer - Pont entre code legacy et architecture v2
 * Permet une transition progressive sans casser l'existant
 */

import { app } from './App.js';
import { authService } from './services/AuthService.js';
import { userService } from './services/UserService.js';
import { modalController } from './ui/ModalController.js';
import { stateManager } from './core/StateManager.js';
import { eventBus } from './core/EventBus.js';
import { logger } from './core/Logger.js';

const compatLog = logger.child('Compat');

/**
 * Export global functions for legacy code
 */
export function setupCompatibilityLayer() {
    compatLog.info('Setting up compatibility layer...');

    // Wait for app to be ready
    if (!app.isInitialized()) {
        eventBus.once('app:ready', () => {
            _exposeLegacyAPI();
        });
    } else {
        _exposeLegacyAPI();
    }
}

/**
 * Expose legacy API functions
 */
function _exposeLegacyAPI() {
    compatLog.debug('Exposing legacy API...');

    // Modal functions
    window.openAccountModal = function () {
        compatLog.debug('Legacy: openAccountModal called');
        return modalController.open('account');
    };

    window.closeAccountModal = function () {
        compatLog.debug('Legacy: closeAccountModal called');
        return modalController.close('account');
    };

    window.openLibraryModal = function (mode = 'mine', options = {}) {
        compatLog.debug('Legacy: openLibraryModal called', { mode, options });
        return modalController.open('library', { mode, ...options });
    };

    window.closeLibraryModal = function () {
        compatLog.debug('Legacy: closeLibraryModal called');
        return modalController.close('library');
    };

    window.openTips = function () {
        compatLog.debug('Legacy: openTips called');
        return modalController.open('tips');
    };

    // Auth functions
    window.isUserConnected = authService.isAuthenticated();

    // Update isUserConnected when auth state changes
    stateManager.subscribe('auth.isConnected', (isConnected) => {
        window.isUserConnected = isConnected;
        compatLog.debug('isUserConnected updated:', isConnected);
    });

    // Update auth UI (legacy function)
    window.updateAuthUI = async function () {
        compatLog.debug('Legacy: updateAuthUI called');

        const isConnected = authService.isAuthenticated();
        const user = authService.getUser();

        // Update floating button
        const floatingBtn = document.getElementById('floatingAuthBtn');
        if (floatingBtn) {
            if (isConnected) {
                floatingBtn.innerHTML = '<span aria-hidden="true">👤</span>';
                floatingBtn.title = 'Mon compte';
                floatingBtn.classList.add('connected');
            } else {
                floatingBtn.innerHTML = '<span aria-hidden="true">🔗</span>';
                floatingBtn.title = 'Se connecter';
                floatingBtn.classList.remove('connected');
            }
        }

        // Update library button visibility
        const openLibrary = document.getElementById('openLibrary');
        if (openLibrary) {
            openLibrary.style.display = isConnected ? 'inline-flex' : 'none';
        }

        // Update global variable
        window.isUserConnected = isConnected;

        compatLog.debug('updateAuthUI complete', { isConnected, user });
    };

    // Render account view (legacy function)
    window.renderAccountView = async function () {
        compatLog.debug('Legacy: renderAccountView called');

        const user = authService.getUser();
        if (!user) {
            compatLog.warn('No user authenticated');
            return;
        }

        try {
            // Display name
            const displayName = authService.getDisplayName();
            const accountEmail = document.getElementById('accountEmail');
            if (accountEmail) {
                accountEmail.textContent = displayName;
            }

            // Stats
            const stats = await userService.getStats();

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

            // By type
            const byTypeContainer = document.getElementById('accountStatsByType');
            if (byTypeContainer) {
                byTypeContainer.innerHTML = '';
                Object.entries(stats.by_type || {}).forEach(([type, count]) => {
                    const pill = document.createElement('div');
                    pill.className = 'type-pill';
                    pill.textContent = `${type}: ${count}`;
                    byTypeContainer.appendChild(pill);
                });
            }

            compatLog.debug('renderAccountView complete');
        } catch (error) {
            compatLog.error('renderAccountView failed', error);
            throw error;
        }
    };

    // User data manager (legacy)
    window.UserDataManager = {
        getDisplayName: async (identifier) => {
            return userService.getDisplayName(identifier);
        },
        getUserStats: async (email, forceRefresh) => {
            return userService.getStats(email, forceRefresh);
        },
        invalidateUserCache: (email) => {
            userService.invalidateCache(email);
        }
    };

    compatLog.info('Legacy API exposed');

    // Notify that compat layer is ready
    window.__RM_COMPAT_READY__ = true;
    eventBus.emit('compat:ready');
}

// Auto-setup
setupCompatibilityLayer();

compatLog.info('Compatibility layer loaded');
