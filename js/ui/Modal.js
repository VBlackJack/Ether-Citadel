/*
 * Copyright 2025 Julien Bombled
 * Modal System
 */

/**
 * Modal configuration and templates
 */
export const MODAL_COLORS = {
    default: { border: 'slate-500', text: 'white' },
    combat: { border: 'red-600', text: 'red-400' },
    economy: { border: 'amber-600', text: 'amber-400' },
    progression: { border: 'purple-600', text: 'purple-400' },
    info: { border: 'cyan-600', text: 'cyan-400' },
    success: { border: 'green-600', text: 'green-400' },
    warning: { border: 'orange-600', text: 'orange-400' },
    danger: { border: 'red-600', text: 'red-400' }
};

/**
 * Modal Manager - Handles creation and management of modal dialogs
 */
export class ModalManager {
    constructor() {
        this.modals = new Map();
        this.activeModal = null;
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.getElementById('modal-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'modal-container';
            this.container.className = 'modal-container';
            document.body.appendChild(this.container);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.hide(this.activeModal);
            }
        });
    }

    /**
     * Register a modal configuration
     */
    register(id, config) {
        this.modals.set(id, {
            id,
            title: config.title || '',
            titleKey: config.titleKey || null,
            color: config.color || 'default',
            size: config.size || 'md',
            content: config.content || '',
            helpKey: config.helpKey || null,
            onShow: config.onShow || null,
            onHide: config.onHide || null,
            render: config.render || null,
            element: null
        });
    }

    /**
     * Create modal DOM element
     */
    create(id) {
        const config = this.modals.get(id);
        if (!config) {
            console.error(`Modal ${id} not registered`);
            return null;
        }

        const colors = MODAL_COLORS[config.color] || MODAL_COLORS.default;
        const sizeClass = this.getSizeClass(config.size);

        const modal = document.createElement('div');
        modal.id = `${id}-modal`;
        modal.className = 'hidden fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 backdrop-blur-sm p-4 modal-backdrop';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `${id}-modal-title`);

        modal.onclick = (e) => {
            if (e.target === modal) {
                this.hide(id);
            }
        };

        const titleHtml = config.titleKey
            ? `<span data-i18n="${config.titleKey}">${config.title}</span>`
            : config.title;

        const helpHtml = config.helpKey
            ? `<span class="help-icon" data-help="${config.helpKey}">?</span>`
            : '';

        modal.innerHTML = `
            <div class="${sizeClass} bg-slate-800 border border-${colors.border} rounded-2xl shadow-2xl flex flex-col max-h-[80vh]" onclick="event.stopPropagation()">
                <div class="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900 rounded-t-2xl">
                    <h2 id="${id}-modal-title" class="text-2xl text-${colors.text} font-bold uppercase flex items-center gap-2">
                        ${titleHtml}
                        ${helpHtml}
                    </h2>
                    <button class="modal-close-btn text-slate-400 hover:text-white text-2xl transition" aria-label="Close">&times;</button>
                </div>
                <div id="${id}-modal-content" class="p-4 overflow-y-auto flex-1">
                    ${config.content}
                </div>
            </div>
        `;

        modal.querySelector('.modal-close-btn').onclick = () => this.hide(id);

        config.element = modal;
        return modal;
    }

    /**
     * Get size class for modal
     */
    getSizeClass(size) {
        const sizes = {
            sm: 'w-full max-w-sm',
            md: 'w-full max-w-2xl',
            lg: 'w-full max-w-4xl',
            xl: 'w-full max-w-6xl',
            full: 'w-full max-w-[95vw]'
        };
        return sizes[size] || sizes.md;
    }

    /**
     * Show a modal
     */
    show(id, data = {}) {
        const config = this.modals.get(id);
        if (!config) {
            console.error(`Modal ${id} not registered`);
            return;
        }

        if (!config.element) {
            const element = this.create(id);
            if (!element) return;
            this.container.appendChild(element);
        }

        if (config.render) {
            const contentEl = config.element.querySelector(`#${id}-modal-content`);
            if (contentEl) {
                const html = config.render(data);
                if (typeof html === 'string') {
                    contentEl.innerHTML = html;
                }
            }
        }

        if (config.onShow) {
            config.onShow(config.element, data);
        }

        config.element.classList.remove('hidden');
        this.activeModal = id;

        const focusable = config.element.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) {
            focusable.focus();
        }
    }

    /**
     * Hide a modal
     */
    hide(id) {
        const config = this.modals.get(id);
        if (!config || !config.element) return;

        config.element.classList.add('hidden');

        if (config.onHide) {
            config.onHide(config.element);
        }

        if (this.activeModal === id) {
            this.activeModal = null;
        }
    }

    /**
     * Toggle modal visibility
     */
    toggle(id, data = {}) {
        const config = this.modals.get(id);
        if (!config) return;

        if (config.element && !config.element.classList.contains('hidden')) {
            this.hide(id);
        } else {
            this.show(id, data);
        }
    }

    /**
     * Update modal content
     */
    setContent(id, content) {
        const config = this.modals.get(id);
        if (!config || !config.element) return;

        const contentEl = config.element.querySelector(`#${id}-modal-content`);
        if (contentEl) {
            if (typeof content === 'string') {
                contentEl.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                contentEl.innerHTML = '';
                contentEl.appendChild(content);
            }
        }
    }

    /**
     * Get modal element
     */
    getElement(id) {
        const config = this.modals.get(id);
        return config?.element || null;
    }

    /**
     * Get modal content container
     */
    getContent(id) {
        const config = this.modals.get(id);
        if (!config?.element) return null;
        return config.element.querySelector(`#${id}-modal-content`);
    }

    /**
     * Check if modal is visible
     */
    isVisible(id) {
        const config = this.modals.get(id);
        return config?.element && !config.element.classList.contains('hidden');
    }

    /**
     * Hide all modals
     */
    hideAll() {
        for (const [id] of this.modals) {
            this.hide(id);
        }
    }

    /**
     * Destroy a modal
     */
    destroy(id) {
        const config = this.modals.get(id);
        if (config?.element) {
            config.element.remove();
        }
        this.modals.delete(id);
    }
}

/**
 * Dialog helper for confirmation dialogs
 */
export class DialogHelper {
    constructor(modalManager) {
        this.modalManager = modalManager;
        this.registerDialogs();
    }

    registerDialogs() {
        this.modalManager.register('confirm', {
            title: 'Confirm',
            color: 'warning',
            size: 'sm',
            content: ''
        });

        this.modalManager.register('alert', {
            title: 'Notice',
            color: 'info',
            size: 'sm',
            content: ''
        });
    }

    /**
     * Show confirmation dialog
     */
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const title = options.title || 'Confirm';
            const confirmText = options.confirmText || 'Confirm';
            const cancelText = options.cancelText || 'Cancel';
            const danger = options.danger || false;

            const content = `
                <div class="text-center">
                    <p class="text-slate-300 mb-6">${message}</p>
                    <div class="flex gap-4 justify-center">
                        <button class="dialog-cancel px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded font-bold transition">
                            ${cancelText}
                        </button>
                        <button class="dialog-confirm px-6 py-2 ${danger ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'} text-white rounded font-bold transition">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;

            this.modalManager.setContent('confirm', content);

            const modal = this.modalManager.getElement('confirm');
            if (modal) {
                const titleEl = modal.querySelector('#confirm-modal-title span, #confirm-modal-title');
                if (titleEl) titleEl.textContent = title;
            }

            this.modalManager.show('confirm');

            const contentEl = this.modalManager.getContent('confirm');
            const confirmBtn = contentEl.querySelector('.dialog-confirm');
            const cancelBtn = contentEl.querySelector('.dialog-cancel');

            const cleanup = () => {
                this.modalManager.hide('confirm');
            };

            confirmBtn.onclick = () => {
                cleanup();
                resolve(true);
            };

            cancelBtn.onclick = () => {
                cleanup();
                resolve(false);
            };
        });
    }

    /**
     * Show alert dialog
     */
    alert(message, options = {}) {
        return new Promise((resolve) => {
            const title = options.title || 'Notice';
            const buttonText = options.buttonText || 'OK';

            const content = `
                <div class="text-center">
                    <p class="text-slate-300 mb-6">${message}</p>
                    <button class="dialog-ok px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition">
                        ${buttonText}
                    </button>
                </div>
            `;

            this.modalManager.setContent('alert', content);

            const modal = this.modalManager.getElement('alert');
            if (modal) {
                const titleEl = modal.querySelector('#alert-modal-title span, #alert-modal-title');
                if (titleEl) titleEl.textContent = title;
            }

            this.modalManager.show('alert');

            const contentEl = this.modalManager.getContent('alert');
            const okBtn = contentEl.querySelector('.dialog-ok');

            okBtn.onclick = () => {
                this.modalManager.hide('alert');
                resolve();
            };
        });
    }
}

// Singleton instance
let modalManagerInstance = null;
let dialogHelperInstance = null;

export function getModalManager() {
    if (!modalManagerInstance) {
        modalManagerInstance = new ModalManager();
    }
    return modalManagerInstance;
}

export function getDialogHelper() {
    if (!dialogHelperInstance) {
        dialogHelperInstance = new DialogHelper(getModalManager());
    }
    return dialogHelperInstance;
}
