/*
 * Copyright 2025 Julien Bombled
 * Error Handling Utilities
 */

import { t } from '../i18n.js';

/**
 * Error severity levels
 */
export const ErrorSeverity = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
};

/**
 * Error handler class
 */
export class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.onError = null;
    }

    /**
     * Log an error
     */
    log(error, context = '', severity = ErrorSeverity.ERROR) {
        const entry = {
            timestamp: Date.now(),
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : null,
            context,
            severity
        };

        this.errorLog.push(entry);

        // Trim log if too large
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // Console logging based on severity
        switch (severity) {
            case ErrorSeverity.INFO:
                console.info(`[${context}]`, error);
                break;
            case ErrorSeverity.WARNING:
                console.warn(`[${context}]`, error);
                break;
            case ErrorSeverity.CRITICAL:
                console.error(`[CRITICAL][${context}]`, error);
                break;
            default:
                console.error(`[${context}]`, error);
        }

        // Call custom error handler if set
        if (this.onError) {
            this.onError(entry);
        }

        return entry;
    }

    /**
     * Handle save/load errors with user notification
     */
    handleSaveError(error, showToast = true) {
        this.log(error, 'Save', ErrorSeverity.ERROR);

        if (showToast && window.game?.ui?.showToast) {
            window.game.ui.showToast(t('notifications.saveFailed'), 'error');
        }

        return false;
    }

    /**
     * Handle load errors with user notification
     */
    handleLoadError(error, showToast = true) {
        this.log(error, 'Load', ErrorSeverity.ERROR);

        if (showToast && window.game?.ui?.showToast) {
            window.game.ui.showToast(t('notifications.loadFailed'), 'error');
        }

        return false;
    }

    /**
     * Handle import errors
     */
    handleImportError(error, showNotification = true) {
        this.log(error, 'Import', ErrorSeverity.WARNING);

        if (showNotification) {
            const message = t('notifications.invalidSave') || 'Invalid save data';
            if (window.game?.ui?.showToast) {
                window.game.ui.showToast(message, 'error');
            } else {
                console.warn('[Import Error]', message);
            }
        }

        return false;
    }

    /**
     * Handle network errors
     */
    handleNetworkError(error, context = 'Network') {
        this.log(error, context, ErrorSeverity.WARNING);

        if (window.game?.ui?.showToast) {
            window.game.ui.showToast(t('notifications.networkError'), 'warning');
        }

        return null;
    }

    /**
     * Wrap async function with error handling
     */
    async wrapAsync(fn, context = 'Async', fallback = null) {
        try {
            return await fn();
        } catch (error) {
            this.log(error, context, ErrorSeverity.ERROR);
            return fallback;
        }
    }

    /**
     * Wrap sync function with error handling
     */
    wrap(fn, context = 'Sync', fallback = null) {
        try {
            return fn();
        } catch (error) {
            this.log(error, context, ErrorSeverity.ERROR);
            return fallback;
        }
    }

    /**
     * Get recent errors
     */
    getRecentErrors(count = 10) {
        return this.errorLog.slice(-count);
    }

    /**
     * Clear error log
     */
    clearLog() {
        this.errorLog = [];
    }

    /**
     * Set custom error handler
     */
    setErrorHandler(handler) {
        this.onError = handler;
    }
}

// Singleton instance
let errorHandlerInstance = null;

export function getErrorHandler() {
    if (!errorHandlerInstance) {
        errorHandlerInstance = new ErrorHandler();
    }
    return errorHandlerInstance;
}

/**
 * Quick error logging function
 */
export function logError(error, context = '', severity = ErrorSeverity.ERROR) {
    return getErrorHandler().log(error, context, severity);
}
