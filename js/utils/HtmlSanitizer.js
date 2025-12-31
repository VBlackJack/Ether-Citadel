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

/**
 * Centralized HTML sanitization utilities
 * Use these functions to prevent XSS attacks when rendering user content
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for innerHTML
 */
export function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Escape HTML and also escape newlines
 * @param {string} str - String to escape
 * @returns {string} Escaped string with newlines converted to <br>
 */
export function escapeHtmlWithBreaks(str) {
    if (typeof str !== 'string') return '';
    return escapeHtml(str).replace(/\n/g, '<br>');
}

/**
 * Sanitize a color value to prevent CSS injection
 * @param {string} color - Color string to validate
 * @param {string} fallback - Fallback color if invalid
 * @returns {string} Safe color value
 */
export function sanitizeColor(color, fallback = '#888') {
    if (typeof color !== 'string') return fallback;

    const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
    const rgbPattern = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+)?\s*\)$/;
    const hslPattern = /^hsla?\(\s*-?\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*[\d.]+)?\s*\)$/;
    const namedColors = [
        'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink',
        'white', 'black', 'gray', 'grey', 'cyan', 'magenta', 'transparent'
    ];

    if (hexPattern.test(color) || rgbPattern.test(color) || hslPattern.test(color)) {
        return color;
    }
    if (namedColors.includes(color.toLowerCase())) {
        return color;
    }

    return fallback;
}

/**
 * Sanitize a URL to prevent javascript: and data: injection
 * @param {string} url - URL to validate
 * @returns {string|null} Safe URL or null if invalid
 */
export function sanitizeUrl(url) {
    if (typeof url !== 'string') return null;

    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
        return null;
    }

    try {
        new URL(url);
        return url;
    } catch {
        // Relative URLs are allowed
        if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            return url;
        }
        return null;
    }
}

/**
 * Sanitize an object's string values recursively
 * @param {object} obj - Object to sanitize
 * @returns {object} Object with escaped string values
 */
export function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return typeof obj === 'string' ? escapeHtml(obj) : obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const result = {};
    for (const key of Object.keys(obj)) {
        result[key] = sanitizeObject(obj[key]);
    }
    return result;
}

/**
 * Calculate a simple checksum for data integrity verification
 * Uses DJB2 hash algorithm - fast and good distribution
 * @param {string} str - String to hash
 * @returns {string} Hex checksum
 */
export function calculateChecksum(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
        hash = hash >>> 0; // Convert to unsigned 32-bit
    }
    return hash.toString(16).padStart(8, '0');
}

/**
 * Verify data against its checksum
 * @param {string} data - Data to verify
 * @param {string} checksum - Expected checksum
 * @returns {boolean} Whether checksum matches
 */
export function verifyChecksum(data, checksum) {
    return calculateChecksum(data) === checksum;
}

/**
 * Dangerous keys that can cause prototype pollution
 * @type {Set<string>}
 */
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Sanitize a JSON object to prevent prototype pollution attacks
 * Recursively removes dangerous keys like __proto__, constructor, prototype
 * @param {any} obj - Object to sanitize
 * @param {number} depth - Current recursion depth (default 0)
 * @param {number} maxDepth - Maximum recursion depth (default 50)
 * @returns {any} Sanitized object safe from prototype pollution
 */
export function sanitizeJsonObject(obj, depth = 0, maxDepth = 50) {
    // Prevent infinite recursion
    if (depth > maxDepth) {
        return null;
    }

    // Handle primitives
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeJsonObject(item, depth + 1, maxDepth));
    }

    // Handle objects - create a clean object without prototype pollution
    const result = Object.create(null);

    for (const key of Object.keys(obj)) {
        // Skip dangerous keys
        if (DANGEROUS_KEYS.has(key)) {
            continue;
        }

        // Only copy own properties, not inherited ones
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = sanitizeJsonObject(obj[key], depth + 1, maxDepth);
        }
    }

    return result;
}
