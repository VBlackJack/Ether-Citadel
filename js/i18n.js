/*
 * Copyright 2025 Julien Bombled
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { logError, ErrorSeverity } from './utils/ErrorHandler.js';

/**
 * Lightweight i18n system for Defender Idle
 */
class I18n {
    constructor() {
        this.translations = {};
        this.currentLocale = 'en';
        this.fallbackLocale = 'en';
        this.supportedLocales = ['en', 'fr'];
        this.storageKey = 'defenderIdle_locale';
        this.isLoaded = false;
        this.onLocaleChangeCallbacks = [];
    }

    /**
     * Initialize the i18n system
     * @returns {Promise<void>}
     */
    async init() {
        const savedLocale = localStorage.getItem(this.storageKey);

        if (savedLocale && this.supportedLocales.includes(savedLocale)) {
            this.currentLocale = savedLocale;
        } else {
            this.currentLocale = this.detectBrowserLocale();
        }

        await this.loadTranslations(this.currentLocale);

        if (this.currentLocale !== this.fallbackLocale) {
            await this.loadTranslations(this.fallbackLocale);
        }

        this.isLoaded = true;
        this.updateDocumentLang();
    }

    /**
     * Detect browser language and return supported locale
     * @returns {string}
     */
    detectBrowserLocale() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();

        if (this.supportedLocales.includes(langCode)) {
            return langCode;
        }

        return this.fallbackLocale;
    }

    /**
     * Load translation file for a locale
     * @param {string} locale
     * @returns {Promise<void>}
     */
    async loadTranslations(locale) {
        if (this.translations[locale]) {
            return;
        }

        try {
            const response = await fetch(`locales/${locale}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load locale: ${locale}`);
            }
            this.translations[locale] = await response.json();
        } catch (error) {
            logError(error, `i18n.loadTranslations(${locale})`, ErrorSeverity.ERROR);
            this.translations[locale] = {};
        }
    }

    /**
     * Change the current locale
     * @param {string} locale
     * @returns {Promise<void>}
     */
    async setLocale(locale) {
        if (!this.supportedLocales.includes(locale)) {
            logError(`Unsupported locale: ${locale}`, 'i18n.setLocale', ErrorSeverity.WARNING);
            return;
        }

        if (!this.translations[locale]) {
            await this.loadTranslations(locale);
        }

        this.currentLocale = locale;
        localStorage.setItem(this.storageKey, locale);
        this.updateDocumentLang();
        this.translatePage();
        this.notifyLocaleChange();
    }

    /**
     * Get the current locale
     * @returns {string}
     */
    getLocale() {
        return this.currentLocale;
    }

    /**
     * Update document lang attribute
     */
    updateDocumentLang() {
        document.documentElement.lang = this.currentLocale;
    }

    /**
     * Translate a key with optional interpolation
     * @param {string} key - Dot-notation key (e.g., 'ui.gold')
     * @param {Object} params - Interpolation parameters
     * @returns {string}
     */
    t(key, params = {}) {
        let value = this.getNestedValue(this.translations[this.currentLocale], key);

        if (value === undefined) {
            value = this.getNestedValue(this.translations[this.fallbackLocale], key);
        }

        if (value === undefined) {
            // Don't log missing keys to avoid spam - just return the key
            return key;
        }

        return this.interpolate(value, params);
    }

    /**
     * Get nested value from object using dot notation
     * @param {Object} obj
     * @param {string} path
     * @returns {*}
     */
    getNestedValue(obj, path) {
        if (!obj) return undefined;

        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Interpolate parameters into string
     * @param {string} str
     * @param {Object} params
     * @returns {string}
     */
    interpolate(str, params) {
        return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * Translate all elements with data-i18n attribute
     */
    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            element.innerHTML = this.sanitizeHtml(this.t(key));
        });
    }

    /**
     * Sanitize HTML to prevent XSS - allows only safe tags
     * @param {string} html
     * @returns {string}
     */
    sanitizeHtml(html) {
        if (typeof html !== 'string') return '';
        // Remove script tags and event handlers
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+\s*=/gi, 'data-blocked=')
            .replace(/javascript:/gi, 'blocked:');
    }

    /**
     * Register callback for locale changes
     * @param {Function} callback
     */
    onLocaleChange(callback) {
        this.onLocaleChangeCallbacks.push(callback);
    }

    /**
     * Notify all registered callbacks of locale change
     */
    notifyLocaleChange() {
        this.onLocaleChangeCallbacks.forEach(callback => {
            try {
                callback(this.currentLocale);
            } catch (error) {
                logError(error, 'i18n.notifyLocaleChange', ErrorSeverity.ERROR);
            }
        });
    }

    /**
     * Get list of supported locales with their display names
     * @returns {Array<{code: string, name: string}>}
     */
    getSupportedLocales() {
        return this.supportedLocales.map(code => ({
            code,
            name: this.t(`locales.${code}`)
        }));
    }
}

const i18n = new I18n();

/**
 * Shorthand translation function
 * @param {string} key
 * @param {Object} params
 * @returns {string}
 */
function t(key, params = {}) {
    return i18n.t(key, params);
}

export { i18n, t };
