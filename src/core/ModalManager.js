/**
 * ModalManager - Gestion centralisée des modales
 * 
 * Résout les problèmes:
 * - 5 méthodes différentes pour ouvrir/fermer modales
 * - Overlays qui restent affichés
 * - Focus trap incohérent
 * - Body scroll non géré partout
 * - 20+ fonctions de modale éparpillées
 * 
 * @version 1.0.0
 * @date 2025-11-02
 */

class ModalManager {
    constructor() {
        this.openModals = new Set();
        this.focusBeforeModal = null;
        this.trapFocusHandler = null;

        // Initialisation des event listeners
        this.initGlobalListeners();
    }

    /**
     * Initialise les listeners globaux (ESC, clicks, etc.)
     * @private
     */
    initGlobalListeners() {
        // ESC pour fermer la modale active
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.openModals.size > 0) {
                const lastModal = Array.from(this.openModals).pop();
                this.close(lastModal);
            }
        });
    }

    /**
     * Trouve l'élément modale par ID ou sélecteur
     * @private
     */
    _getModalElement(modalId) {
        if (typeof modalId === 'string') {
            // Si c'est un sélecteur CSS
            if (modalId.startsWith('#') || modalId.startsWith('.')) {
                return document.querySelector(modalId);
            }
            // Sinon c'est un ID
            return document.getElementById(modalId);
        }

        // Si c'est déjà un élément
        if (modalId instanceof HTMLElement) {
            return modalId;
        }

        return null;
    }

    /**
     * Trouve l'overlay associé à une modale
     * @private
     */
    _getOverlay(modalId) {
        // Patterns communs d'overlay
        const patterns = [
            `${modalId}Overlay`,
            `${modalId}-overlay`,
            modalId.replace('Modal', 'Overlay'),
            modalId.replace('modal', 'overlay')
        ];

        for (const pattern of patterns) {
            const overlay = document.getElementById(pattern);
            if (overlay) return overlay;
        }

        // Cherche un overlay dans la modale elle-même
        const modal = this._getModalElement(modalId);
        if (modal) {
            const overlay = modal.querySelector('.modal-overlay, [class*="overlay"]');
            if (overlay) return overlay;
        }

        return null;
    }

    /**
     * Bloque le scroll du body
     * @private
     */
    _lockBodyScroll() {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
    }

    /**
     * Débloque le scroll du body
     * @private
     */
    _unlockBodyScroll() {
        if (this.openModals.size === 0) {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
        }
    }

    /**
     * Piège le focus dans la modale
     * @private
     */
    _trapFocus(modal) {
        if (!modal) return;

        // Stocke l'élément qui avait le focus
        if (!this.focusBeforeModal) {
            this.focusBeforeModal = document.activeElement;
        }

        // Récupère tous les éléments focusables
        const focusableElements = modal.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus le premier élément
        setTimeout(() => firstElement.focus(), 100);

        // Handler pour le trap
        this.trapFocusHandler = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        modal.addEventListener('keydown', this.trapFocusHandler);
    }

    /**
     * Libère le trap focus
     * @private
     */
    _releaseFocusTrap(modal) {
        if (this.trapFocusHandler && modal) {
            modal.removeEventListener('keydown', this.trapFocusHandler);
            this.trapFocusHandler = null;
        }

        // Restore focus
        if (this.openModals.size === 0 && this.focusBeforeModal) {
            try {
                this.focusBeforeModal.focus();
            } catch (e) {
                // L'élément n'existe peut-être plus
            }
            this.focusBeforeModal = null;
        }
    }

    /**
     * Ouvre une modale
     * @param {string|HTMLElement} modalId - ID ou élément de la modale
     * @param {object} options - Options d'ouverture
     * @returns {boolean} Succès
     */
    open(modalId, options = {}) {
        const modal = this._getModalElement(modalId);
        if (!modal) {
            console.error(`[ModalManager] Modal not found: ${modalId}`);
            return false;
        }

        const {
            closeOthers = true,
            trapFocus = true,
            lockScroll = true,
            onOpen = null
        } = options;

        // Ferme les autres modales si demandé
        if (closeOthers) {
            this.closeAll();
        }

        // Overlay
        const overlay = this._getOverlay(modalId);
        if (overlay) {
            overlay.style.display = 'block';
            overlay.classList.add('show');
            overlay.setAttribute('aria-hidden', 'false');

            // Click sur overlay pour fermer
            overlay.onclick = () => this.close(modalId);
        }

        // Modale
        modal.style.display = 'flex';
        modal.classList.add('show', 'active');
        modal.setAttribute('aria-hidden', 'false');
        modal.removeAttribute('hidden');

        // Assure que le dialog interne est accessible
        const dialog = modal.querySelector('.modal-dialog, [class*="dialog"]');
        if (dialog) {
            dialog.setAttribute('aria-hidden', 'false');
        }

        // Lock scroll
        if (lockScroll) {
            this._lockBodyScroll();
        }

        // Trap focus
        if (trapFocus) {
            this._trapFocus(modal);
        }

        // Ajoute à la stack
        const modalKey = modal.id || modalId;
        this.openModals.add(modalKey);

        // Callback
        if (typeof onOpen === 'function') {
            try {
                onOpen(modal);
            } catch (e) {
                console.error('[ModalManager] onOpen callback error:', e);
            }
        }

        console.info(`[ModalManager] Opened: ${modalKey}`);
        return true;
    }

    /**
     * Ferme une modale
     * @param {string|HTMLElement} modalId - ID ou élément de la modale
     * @param {object} options - Options de fermeture
     * @returns {boolean} Succès
     */
    close(modalId, options = {}) {
        const modal = this._getModalElement(modalId);
        if (!modal) {
            console.warn(`[ModalManager] Modal not found: ${modalId}`);
            return false;
        }

        const { onClose = null } = options;

        // Overlay
        const overlay = this._getOverlay(modalId);
        if (overlay) {
            overlay.style.display = 'none';
            overlay.classList.remove('show');
            overlay.setAttribute('aria-hidden', 'true');
            overlay.onclick = null;
        }

        // Modale
        modal.style.display = 'none';
        modal.classList.remove('show', 'active');
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('hidden', '');

        // Dialog interne
        const dialog = modal.querySelector('.modal-dialog, [class*="dialog"]');
        if (dialog) {
            dialog.setAttribute('aria-hidden', 'true');
        }

        // Release focus trap
        this._releaseFocusTrap(modal);

        // Unlock scroll
        this._unlockBodyScroll();

        // Retire de la stack
        const modalKey = modal.id || modalId;
        this.openModals.delete(modalKey);

        // Callback
        if (typeof onClose === 'function') {
            try {
                onClose(modal);
            } catch (e) {
                console.error('[ModalManager] onClose callback error:', e);
            }
        }

        console.info(`[ModalManager] Closed: ${modalKey}`);
        return true;
    }

    /**
     * Ferme toutes les modales
     */
    closeAll() {
        const modals = Array.from(this.openModals);
        modals.forEach(modalId => this.close(modalId));
    }

    /**
     * Vérifie si une modale est ouverte
     * @param {string|HTMLElement} modalId
     * @returns {boolean}
     */
    isOpen(modalId) {
        const modal = this._getModalElement(modalId);
        if (!modal) return false;

        const modalKey = modal.id || modalId;
        return this.openModals.has(modalKey);
    }

    /**
     * Bascule l'état d'une modale
     * @param {string|HTMLElement} modalId
     * @param {object} options
     * @returns {boolean}
     */
    toggle(modalId, options = {}) {
        if (this.isOpen(modalId)) {
            return this.close(modalId, options);
        } else {
            return this.open(modalId, options);
        }
    }

    /**
     * Nettoie tous les listeners et états
     */
    destroy() {
        this.closeAll();
        this.trapFocusHandler = null;
        this.focusBeforeModal = null;
    }
}

// Export singleton
export const modalManager = new ModalManager();
export default modalManager;

// Export aussi les anciennes fonctions pour compatibilité
export const lockBodyScroll = () => modalManager._lockBodyScroll();
export const unlockBodyScroll = () => modalManager._unlockBodyScroll();
export const trapFocus = (element) => modalManager._trapFocus(element);
export const releaseFocusTrap = () => modalManager._releaseFocusTrap(null);
