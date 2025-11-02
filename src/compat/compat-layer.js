/**
 * Compat Layer - Couche de compatibilité pour l'ancien code
 * 
 * Expose les nouvelles API sous les anciens noms pour éviter
 * de casser l'application pendant la migration.
 * 
 * À supprimer progressivement une fois la migration terminée.
 * 
 * @version 1.0.0
 * @date 2025-11-02
 */

import { storage } from '../core/StorageManager.js';
import { reviewsAPI } from '../core/ReviewsAPI.js';
import { modalManager } from '../core/ModalManager.js';
import { userDataManager } from '../core/UserDataManager.js';

// ============================================================================
// STORAGE COMPATIBILITY
// ============================================================================

// Migration automatique des anciennes clés au premier chargement
(function migrateOldStorage() {
    const oldKeys = [
        'authToken',
        'authEmail',
        'discordUsername',
        'discordId',
        'siteTheme',
        'previewMode'
    ];

    storage.migrateOldKeys(oldKeys);
})();

// ============================================================================
// API COMPATIBILITY
// ============================================================================

/**
 * @deprecated Utiliser reviewsAPI.checkAvailability()
 */
window.tryEnableRemote = async function () {
    const available = await reviewsAPI.checkAvailability();
    window.remoteEnabled = available;
    window.remoteBase = reviewsAPI.baseURL;
    return available;
};

/**
 * @deprecated Utiliser reviewsAPI.listReviews({ mode: 'all' })
 */
window.remoteListReviews = async function () {
    return await reviewsAPI.listReviews({ mode: 'all' });
};

/**
 * @deprecated Utiliser reviewsAPI.listReviews({ mode: 'public' })
 */
if (!window.remoteListPublicReviews) {
    window.remoteListPublicReviews = async function () {
        return await reviewsAPI.listReviews({ mode: 'public' });
    };
}

/**
 * @deprecated Utiliser reviewsAPI.listReviews({ mode: 'mine' })
 */
if (!window.remoteListMyReviews) {
    window.remoteListMyReviews = async function () {
        return await reviewsAPI.listReviews({ mode: 'mine' });
    };
}

/**
 * @deprecated Utiliser reviewsAPI.getReview(id)
 */
if (!window.remoteGetReview) {
    window.remoteGetReview = async function (id) {
        return await reviewsAPI.getReview(id);
    };
}

/**
 * @deprecated Utiliser reviewsAPI.saveReview(data, imageFile)
 */
if (!window.remoteSave) {
    window.remoteSave = async function (reviewObj) {
        const imageFile = window.lastSelectedImageFile || null;
        return await reviewsAPI.saveReview(reviewObj, imageFile);
    };
}

/**
 * @deprecated Utiliser reviewsAPI.deleteReview(id)
 */
if (!window.remoteDeleteReview) {
    window.remoteDeleteReview = async function (id) {
        return await reviewsAPI.deleteReview(id);
    };
}

/**
 * @deprecated Utiliser reviewsAPI.togglePrivacy(id, isPrivate)
 */
if (!window.remoteTogglePrivacy) {
    window.remoteTogglePrivacy = async function (id, isPrivate) {
        return await reviewsAPI.togglePrivacy(id, isPrivate);
    };
}

/**
 * @deprecated Utiliser reviewsAPI.getVotes(id)
 */
if (!window.remoteGetReviewVotes) {
    window.remoteGetReviewVotes = async function (id) {
        return await reviewsAPI.getVotes(id);
    };
}

/**
 * @deprecated Utiliser reviewsAPI.castVote(id, vote)
 */
if (!window.remoteCastVote) {
    window.remoteCastVote = async function (id, vote) {
        return await reviewsAPI.castVote(id, vote);
    };
}

/**
 * @deprecated Utiliser reviewsAPI.removeVote(id)
 */
if (!window.remoteDeleteVote) {
    window.remoteDeleteVote = async function (id) {
        return await reviewsAPI.removeVote(id);
    };
}

// ============================================================================
// MODAL COMPATIBILITY
// ============================================================================
// Note: Ces fonctions ne sont définies QUE si app.js ne les définit pas déjà

/**
 * @deprecated Utiliser modalManager.open(modalId)
 */
if (!window.openAccountModal) {
    window.openAccountModal = function () {
        return modalManager.open('accountModal', {
            onOpen: async () => {
                if (typeof window.renderAccountView === 'function') {
                    await window.renderAccountView();
                }
            }
        });
    };
}

/**
 * @deprecated Utiliser modalManager.close(modalId)
 */
if (!window.closeAccountModal) {
    window.closeAccountModal = function () {
        return modalManager.close('accountModal');
    };
}

/**
 * @deprecated Utiliser modalManager.open(modalId)
 */
if (!window.openLibraryModal) {
    window.openLibraryModal = function (mode = 'mine', options = {}) {
        const success = modalManager.open('libraryModal', {
            onOpen: async () => {
                window.currentLibraryMode = mode;

                // Bouton retour si vient du compte
                if (options.fromAccount) {
                    const backBtn = document.getElementById('libraryBackToAccount');
                    if (backBtn) backBtn.style.display = 'inline-flex';
                }

                if (typeof window.renderFullLibrary === 'function') {
                    await window.renderFullLibrary(mode);
                }
            }
        });

        return success;
    };
}

/**
 * @deprecated Utiliser modalManager._lockBodyScroll()
 */
if (!window.lockBodyScroll) {
    window.lockBodyScroll = function () {
        modalManager._lockBodyScroll();
    };
}

/**
 * @deprecated Utiliser modalManager._unlockBodyScroll()
 */
if (!window.unlockBodyScroll) {
    window.unlockBodyScroll = function () {
        modalManager._unlockBodyScroll();
    };
}

/**
 * @deprecated Utiliser modalManager._trapFocus(element)
 */
if (!window.trapFocus) {
    window.trapFocus = function (element) {
        modalManager._trapFocus(element);
    };
}

/**
 * @deprecated Utiliser modalManager._releaseFocusTrap(element)
 */
if (!window.releaseFocusTrap) {
    window.releaseFocusTrap = function () {
        modalManager._releaseFocusTrap(null);
    };
}

// ============================================================================
// USER DATA COMPATIBILITY
// ============================================================================

/**
 * Ancien UserDataManager exposé globalement
 * @deprecated Utiliser import { userDataManager } from './core/UserDataManager.js'
 */
window.UserDataManager = {
    getUserProfile: (email, forceRefresh) => userDataManager.getUserProfile(email, forceRefresh),
    getDisplayName: (email) => userDataManager.getDisplayName(email),
    getUserStats: (email, forceRefresh) => userDataManager.getUserStats(email, forceRefresh),
    invalidateUserCache: (email) => userDataManager.invalidateUserCache(email),
    clearAllCache: () => userDataManager.clearAllCache(),

    // Anciennes méthodes supprimées (compatibilité silencieuse)
    clearLegacyCache: () => {
        console.warn('[UserDataManager] clearLegacyCache() is deprecated and does nothing');
    },
    getCachedData: () => {
        console.warn('[UserDataManager] getCachedData() is deprecated, use storage.getWithTTL()');
        return null;
    },
    setCachedData: () => {
        console.warn('[UserDataManager] setCachedData() is deprecated, use storage.setWithTTL()');
    },
    invalidateCache: () => {
        console.warn('[UserDataManager] invalidateCache() is deprecated, use invalidateUserCache()');
    }
};

// ============================================================================
// STORAGE HELPERS
// ============================================================================

/**
 * Helpers pour accès au storage avec les nouvelles clés
 */
window.StorageHelpers = {
    // Auth
    getAuthToken: () => storage.get('auth_token'),
    setAuthToken: (token) => storage.set('auth_token', token),
    getAuthEmail: () => storage.get('auth_email'),
    setAuthEmail: (email) => storage.set('auth_email', email),

    // Theme
    getTheme: () => storage.get('theme', 'local', 'auto'),
    setTheme: (theme) => storage.set('theme', theme),

    // Preview mode
    getPreviewMode: () => storage.get('preview_mode', 'local', 'detailed'),
    setPreviewMode: (mode) => storage.set('preview_mode', mode),

    // Connexion status
    isConnected: () => {
        const token = storage.get('auth_token');
        const email = storage.get('auth_email');
        return !!(token && email);
    }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialise la couche de compatibilité
 */
export async function initCompatLayer() {
    console.info('[Compat] Initializing compatibility layer...');

    // Nettoie les caches expirés au démarrage
    storage.clearExpired();
    userDataManager.cleanExpiredCache();

    // Vérifie la disponibilité de l'API
    await reviewsAPI.checkAvailability();

    // Expose les nouvelles API globalement pour debug
    if (window.DEBUG || /[?&]debug=1/.test(location.search)) {
        window.__RM_INTERNAL__ = {
            storage,
            reviewsAPI,
            modalManager,
            userDataManager
        };
        console.info('[Compat] Debug APIs exposed at window.__RM_INTERNAL__');
    }

    // Signal que la compat layer est prête
    window.__RM_COMPAT_READY__ = true;
    document.dispatchEvent(new Event('rm:compat-ready'));

    console.info('[Compat] Compatibility layer ready');
}

// Auto-init et bloquer app.js jusqu'à ce que ce soit prêt
(async function autoInit() {
    if (document.readyState === 'loading') {
        await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve, { once: true });
        });
    }

    await initCompatLayer();
})();