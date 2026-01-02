/*
 * Copyright 2025 Julien Bombled
 * Toast Notification System
 */

import { escapeHtml } from '../utils/HtmlSanitizer.js';

/**
 * Toast types configuration
 */
const TOAST_TYPES = {
    success: {
        icon: '✓',
        class: 'toast-success'
    },
    error: {
        icon: '✕',
        class: 'toast-error'
    },
    warning: {
        icon: '⚠',
        class: 'toast-warning'
    },
    info: {
        icon: 'ℹ',
        class: 'toast-info'
    }
};

/**
 * Toast Manager - Handles toast notifications
 */
export class ToastManager {
    constructor(options = {}) {
        this.container = null;
        this.toasts = [];
        this.maxToasts = options.maxToasts || 5;
        this.defaultDuration = options.defaultDuration || 3000;
        this.position = options.position || 'bottom-center';
        this.init();
    }

    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = this.getPositionClasses();
            // Accessibility: aria-live for screen reader announcements
            this.container.setAttribute('role', 'status');
            this.container.setAttribute('aria-live', 'polite');
            this.container.setAttribute('aria-atomic', 'false');
            document.body.appendChild(this.container);
        } else {
            // Ensure existing container has a11y attributes
            if (!this.container.hasAttribute('aria-live')) {
                this.container.setAttribute('role', 'status');
                this.container.setAttribute('aria-live', 'polite');
                this.container.setAttribute('aria-atomic', 'false');
            }
        }
    }

    getPositionClasses() {
        const positions = {
            'top-left': 'fixed top-4 left-4 z-[9999] flex flex-col gap-2',
            'top-center': 'fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center',
            'top-right': 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end',
            'bottom-left': 'fixed bottom-4 left-4 z-[9999] flex flex-col-reverse gap-2',
            'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse gap-2 items-center',
            'bottom-right': 'fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 items-end'
        };
        return positions[this.position] || positions['bottom-center'];
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(str) {
        return escapeHtml(str);
    }

    /**
     * Show a toast notification
     */
    show(message, options = {}) {
        const type = options.type || 'info';
        const duration = options.duration !== undefined ? options.duration : this.defaultDuration;
        const config = TOAST_TYPES[type] || TOAST_TYPES.info;

        if (this.toasts.length >= this.maxToasts) {
            const oldest = this.toasts.shift();
            if (oldest) {
                this.removeToast(oldest);
            }
        }

        const toast = document.createElement('div');
        toast.className = `toast ${config.class}`;
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
        toast.innerHTML = `
            <span class="toast-icon" aria-hidden="true">${this.escapeHtml(options.icon || config.icon)}</span>
            <span class="toast-message">${this.escapeHtml(message)}</span>
            <button type="button" class="toast-close" aria-label="Dismiss notification">&times;</button>
        `;

        this.container.appendChild(toast);

        const toastData = {
            element: toast,
            timeout: null
        };

        // Add click handler for close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.removeToast(toastData));
        }

        this.toasts.push(toastData);

        if (duration > 0) {
            toastData.timeout = setTimeout(() => {
                this.removeToast(toastData);
            }, duration);
        }

        return toastData;
    }

    /**
     * Remove a toast
     */
    removeToast(toastData) {
        if (toastData.timeout) {
            clearTimeout(toastData.timeout);
            toastData.timeout = null;
        }

        const index = this.toasts.indexOf(toastData);
        if (index > -1) {
            this.toasts.splice(index, 1);
        }

        if (toastData.element) {
            toastData.element.style.animation = 'toast-out 0.3s ease-out forwards';
            setTimeout(() => {
                if (toastData.element && toastData.element.parentNode) {
                    toastData.element.remove();
                }
            }, 300);
        }
    }

    /**
     * Show success toast
     */
    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    /**
     * Show error toast
     */
    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error' });
    }

    /**
     * Show warning toast
     */
    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }

    /**
     * Show info toast
     */
    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }

    /**
     * Clear all toasts
     */
    clear() {
        for (const toast of [...this.toasts]) {
            this.removeToast(toast);
        }
        this.toasts = [];
    }

    /**
     * Cleanup all resources
     */
    cleanup() {
        this.clear();

        if (this.container && this.container.parentNode) {
            this.container.remove();
        }
        this.container = null;
    }
}

// Singleton instance
let toastManagerInstance = null;

export function getToastManager(options) {
    if (!toastManagerInstance) {
        toastManagerInstance = new ToastManager(options);
    }
    return toastManagerInstance;
}

/**
 * Cleanup toast resources
 */
export function cleanupToasts() {
    if (toastManagerInstance) {
        toastManagerInstance.cleanup();
        toastManagerInstance = null;
    }
}
