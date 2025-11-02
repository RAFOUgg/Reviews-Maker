/**
 * ModalController - Gestionnaire de modales production-ready
 * Features: stack management, animations fluides, accessibility, focus trap
 * Design: Apple-like animations avec spring physics
 */

import { stateManager } from '../core/StateManager.js';
import { eventBus } from '../core/EventBus.js';
import { logger } from '../core/Logger.js';

class ModalController {
    constructor() {
        this.log = logger.child('Modal');
        this._modals = new Map(); // Registry of all modals
        this._stack = []; // Currently open modals (LIFO)
        this._focusTrapHandlers = new Map();
        this._previousFocus = null;

        this._init();
    }

    /**
     * Initialize modal system
     */
    _init() {
        // Listen to Escape key globally
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._stack.length > 0) {
                e.preventDefault();
                this.closeTop();
            }
        });

        // Register state changes
        stateManager.subscribe('ui.activeModal', (modalId) => {
            this.log.debug('Active modal changed:', modalId);
        });

        this.log.info('ModalController initialized');
    }

    /**
     * Register a modal
     * @param {string} id - Modal ID
     * @param {HTMLElement|string} element - Modal element or selector
     * @param {Object} options - Configuration options
     */
    register(id, element, options = {}) {
        const modalElement = typeof element === 'string'
            ? document.getElementById(element) || document.querySelector(element)
            : element;

        if (!modalElement) {
            this.log.error(`Modal element not found: ${element}`);
            return false;
        }

        const config = {
            id,
            element: modalElement,
            overlay: options.overlay || modalElement.previousElementSibling,
            closeOnOverlay: options.closeOnOverlay !== false,
            closeOnEscape: options.closeOnEscape !== false,
            trapFocus: options.trapFocus !== false,
            animation: options.animation || 'fade-scale',
            onOpen: options.onOpen || null,
            onClose: options.onClose || null,
            onBeforeOpen: options.onBeforeOpen || null,
            onBeforeClose: options.onBeforeClose || null
        };

        this._modals.set(id, config);
        this._setupModalEvents(config);

        this.log.debug('Modal registered:', id);
        return true;
    }

    /**
     * Setup event listeners for a modal
     */
    _setupModalEvents(config) {
        const { element, overlay, closeOnOverlay, id } = config;

        // Close button (×)
        const closeBtn = element.querySelector('.modal-close, [data-modal-close]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close(id));
        }

        // Overlay click
        if (overlay && closeOnOverlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close(id);
                }
            });
        }
    }

    /**
     * Open a modal
     * @param {string} id - Modal ID
     * @param {Object} data - Data to pass to onOpen callback
     */
    async open(id, data = {}) {
        const config = this._modals.get(id);
        if (!config) {
            this.log.error(`Modal not registered: ${id}`);
            return false;
        }

        // Check if already open
        if (this._stack.includes(id)) {
            this.log.warn(`Modal already open: ${id}`);
            return false;
        }

        this.log.info('Opening modal:', id);

        try {
            // Before open callback
            if (config.onBeforeOpen) {
                const result = await config.onBeforeOpen(data);
                if (result === false) {
                    this.log.info('Modal open cancelled by onBeforeOpen:', id);
                    return false;
                }
            }

            // Hide other modals
            this._hideOtherModals(id);

            // Save focus
            if (this._stack.length === 0) {
                this._previousFocus = document.activeElement;
            }

            // Show overlay
            if (config.overlay) {
                config.overlay.style.display = 'block';
                config.overlay.classList.add('show');
                config.overlay.setAttribute('aria-hidden', 'false');
            }

            // Show modal with animation
            config.element.style.display = 'flex';
            config.element.setAttribute('aria-hidden', 'false');
            config.element.setAttribute('aria-modal', 'true');

            // Trigger animation after display
            requestAnimationFrame(() => {
                config.element.classList.add('show');
                this._applyAnimation(config.element, 'open', config.animation);
            });

            // Lock body scroll
            document.body.classList.add('modal-open');

            // Setup focus trap
            if (config.trapFocus) {
                this._setupFocusTrap(id, config.element);
            }

            // Add to stack
            this._stack.push(id);
            stateManager.setState('ui.activeModal', id);
            stateManager.setState('ui.modalStack', [...this._stack]);

            // On open callback
            if (config.onOpen) {
                await config.onOpen(data);
            }

            eventBus.emit('modal:opened', { id, data });
            this.log.debug('Modal opened:', id);

            return true;
        } catch (error) {
            this.log.error('Failed to open modal:', id, error);
            return false;
        }
    }

    /**
     * Close a modal
     * @param {string} id - Modal ID
     */
    async close(id) {
        const config = this._modals.get(id);
        if (!config) {
            this.log.error(`Modal not registered: ${id}`);
            return false;
        }

        // Check if open
        if (!this._stack.includes(id)) {
            this.log.warn(`Modal not open: ${id}`);
            return false;
        }

        this.log.info('Closing modal:', id);

        try {
            // Before close callback
            if (config.onBeforeClose) {
                const result = await config.onBeforeClose();
                if (result === false) {
                    this.log.info('Modal close cancelled by onBeforeClose:', id);
                    return false;
                }
            }

            // Apply close animation
            await this._applyAnimation(config.element, 'close', config.animation);

            // Hide modal
            config.element.classList.remove('show');
            config.element.style.display = 'none';
            config.element.setAttribute('aria-hidden', 'true');
            config.element.removeAttribute('aria-modal');

            // Hide overlay if no other modals
            if (config.overlay && this._stack.length <= 1) {
                config.overlay.classList.remove('show');
                config.overlay.style.display = 'none';
                config.overlay.setAttribute('aria-hidden', 'true');
            }

            // Release focus trap
            this._releaseFocusTrap(id);

            // Remove from stack
            const index = this._stack.indexOf(id);
            if (index !== -1) {
                this._stack.splice(index, 1);
            }

            // Update state
            const newActive = this._stack[this._stack.length - 1] || null;
            stateManager.setState('ui.activeModal', newActive);
            stateManager.setState('ui.modalStack', [...this._stack]);

            // Unlock body scroll if no modals
            if (this._stack.length === 0) {
                document.body.classList.remove('modal-open');

                // Restore focus
                if (this._previousFocus && this._previousFocus.focus) {
                    this._previousFocus.focus();
                    this._previousFocus = null;
                }
            } else {
                // Show previous modal
                const previousModal = this._modals.get(newActive);
                if (previousModal) {
                    previousModal.element.style.display = 'flex';
                    previousModal.element.classList.add('show');
                }
            }

            // On close callback
            if (config.onClose) {
                await config.onClose();
            }

            eventBus.emit('modal:closed', { id });
            this.log.debug('Modal closed:', id);

            return true;
        } catch (error) {
            this.log.error('Failed to close modal:', id, error);
            return false;
        }
    }

    /**
     * Close the topmost modal
     */
    closeTop() {
        if (this._stack.length === 0) return false;
        const topId = this._stack[this._stack.length - 1];
        return this.close(topId);
    }

    /**
     * Close all modals
     */
    async closeAll() {
        const modals = [...this._stack].reverse(); // Close in reverse order
        for (const id of modals) {
            await this.close(id);
        }
    }

    /**
     * Toggle modal
     */
    toggle(id, data = {}) {
        if (this.isOpen(id)) {
            return this.close(id);
        } else {
            return this.open(id, data);
        }
    }

    /**
     * Check if modal is open
     */
    isOpen(id) {
        return this._stack.includes(id);
    }

    /**
     * Get current modal stack
     */
    getStack() {
        return [...this._stack];
    }

    /**
     * Hide other modals when opening one
     */
    _hideOtherModals(exceptId) {
        this._modals.forEach((config, id) => {
            if (id !== exceptId && this._stack.includes(id)) {
                config.element.style.display = 'none';
                config.element.classList.remove('show');
            }
        });
    }

    /**
     * Apply animation (Apple-like spring physics)
     */
    _applyAnimation(element, direction, type) {
        return new Promise(resolve => {
            const duration = 300; // ms

            element.style.transition = `all ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;

            if (direction === 'open') {
                element.style.opacity = '1';
                element.style.transform = 'scale(1) translateY(0)';
            } else {
                element.style.opacity = '0';
                element.style.transform = 'scale(0.95) translateY(10px)';
            }

            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    /**
     * Setup focus trap for accessibility
     */
    _setupFocusTrap(id, element) {
        const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusable = Array.from(element.querySelectorAll(focusableSelector));

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        const handler = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        element.addEventListener('keydown', handler);
        this._focusTrapHandlers.set(id, handler);

        // Focus first element
        setTimeout(() => first.focus(), 100);
    }

    /**
     * Release focus trap
     */
    _releaseFocusTrap(id) {
        const handler = this._focusTrapHandlers.get(id);
        if (handler) {
            const config = this._modals.get(id);
            if (config && config.element) {
                config.element.removeEventListener('keydown', handler);
            }
            this._focusTrapHandlers.delete(id);
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.closeAll();
        this._modals.clear();
        this._focusTrapHandlers.clear();
    }
}

// Singleton instance
export const modalController = new ModalController();
export default modalController;
