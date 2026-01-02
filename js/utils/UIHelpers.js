/*
 * Copyright 2025 Julien Bombled
 * UI Helper Functions
 */

/**
 * Safely update element text content
 * @param {string} id - Element ID
 * @param {string|number} value - Value to set
 * @returns {boolean} - Whether update was successful
 */
export function updateElementText(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = String(value);
        return true;
    }
    return false;
}

/**
 * Safely update element innerHTML (use with caution - prefer textContent)
 * @param {string} id - Element ID
 * @param {string} html - HTML to set
 * @returns {boolean} - Whether update was successful
 */
export function updateElementHTML(id, html) {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = html;
        return true;
    }
    return false;
}

/**
 * Toggle element visibility
 * @param {string} id - Element ID
 * @param {boolean} visible - Whether element should be visible
 * @param {string} hiddenClass - CSS class for hidden state
 */
export function toggleElementVisibility(id, visible, hiddenClass = 'hidden') {
    const el = document.getElementById(id);
    if (el) {
        el.classList.toggle(hiddenClass, !visible);
    }
}

/**
 * Create a styled grid item element
 * @param {Object} config - Configuration for the grid item
 * @returns {HTMLElement}
 */
export function createGridItem(config) {
    const {
        icon = '',
        title = '',
        subtitle = '',
        description = '',
        isActive = false,
        isLocked = false,
        borderColor = 'slate-600',
        activeBorderColor = 'blue-400',
        lockedOpacity = true
    } = config;

    const div = document.createElement('div');

    let borderClass = `border-${borderColor}`;
    let bgClass = 'bg-slate-800';

    if (isActive) {
        borderClass = `border-${activeBorderColor}`;
        bgClass = `bg-${activeBorderColor.split('-')[0]}-900/30`;
    }

    div.className = `p-3 rounded border ${borderClass} ${bgClass} ${isLocked && lockedOpacity ? 'opacity-50' : ''}`;

    const content = [];

    if (icon || title) {
        content.push(`
            <div class="flex items-center gap-2 mb-2">
                ${icon ? `<span class="text-2xl">${escapeHtml(icon)}</span>` : ''}
                <div>
                    <div class="font-bold ${isActive ? `text-${activeBorderColor.split('-')[0]}-400` : 'text-white'}">${escapeHtml(title)}</div>
                    ${subtitle ? `<div class="text-xs text-slate-300">${escapeHtml(subtitle)}</div>` : ''}
                </div>
            </div>
        `);
    }

    if (description) {
        content.push(`<div class="text-xs text-slate-400 mb-2">${escapeHtml(description)}</div>`);
    }

    div.innerHTML = content.join('');

    return div;
}

/**
 * Calculate exponential cost
 * @param {number} baseCost - Base cost
 * @param {number} costMultiplier - Cost multiplier per level
 * @param {number} level - Current level
 * @returns {number}
 */
export function calculateExponentialCost(baseCost, costMultiplier, level) {
    return Math.floor(baseCost * Math.pow(costMultiplier, level));
}

/**
 * Calculate bulk purchase info
 * @param {number} gold - Available gold
 * @param {number} baseCost - Base cost
 * @param {number} costMultiplier - Cost multiplier
 * @param {number} currentLevel - Current level
 * @param {number|null} maxLevel - Maximum level (null for unlimited)
 * @returns {Object} - { count, totalCost }
 */
export function calculateBulkPurchase(gold, baseCost, costMultiplier, currentLevel, maxLevel = null) {
    let count = 0;
    let totalCost = 0;
    const MAX_ITERATIONS = 10000;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const nextCost = calculateExponentialCost(baseCost, costMultiplier, currentLevel + count);

        if (gold < totalCost + nextCost && count > 0) break;
        if (gold < nextCost && count === 0) {
            return { count: 0, totalCost: nextCost };
        }
        if (maxLevel !== null && currentLevel + count >= maxLevel) break;

        totalCost += nextCost;
        count++;
    }

    return { count, totalCost };
}

// Re-export escapeHtml from centralized sanitizer
export { escapeHtml } from './HtmlSanitizer.js';

/**
 * Create a button element with data-action
 * @param {Object} config - Button configuration
 * @returns {HTMLElement}
 */
export function createActionButton(config) {
    const {
        action,
        params = {},
        text,
        className = 'px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded',
        disabled = false
    } = config;

    const button = document.createElement('button');
    button.className = `${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    button.textContent = text;
    button.dataset.action = action;

    for (const [key, value] of Object.entries(params)) {
        button.dataset[key] = String(value);
    }

    if (disabled) {
        button.disabled = true;
    }

    return button;
}

/**
 * Batch DOM updates for better performance
 * @param {Function} updateFn - Function containing DOM updates
 */
export function batchDOMUpdates(updateFn) {
    requestAnimationFrame(() => {
        updateFn();
    });
}

/**
 * Show loading state in a modal content area
 * @param {string} containerId - ID of the container element
 * @param {string} message - Optional loading message
 */
export function showModalLoading(containerId, message = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="modal-loading flex-col">
            <div class="modal-loading-spinner" role="status" aria-label="Loading"></div>
            ${message ? `<div class="modal-loading-text">${message}</div>` : ''}
        </div>
    `;
}

/**
 * Debounce function calls
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Throttle function calls
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function}
 */
export function throttle(fn, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Create a focus trap within an element (for modals)
 * @param {HTMLElement} element - Container element to trap focus within
 * @returns {Object} - { activate, deactivate } methods
 */
export function createFocusTrap(element) {
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let previousActiveElement = null;

    function getFocusableElements() {
        return Array.from(element.querySelectorAll(focusableSelectors))
            .filter(el => !el.disabled && el.offsetParent !== null);
    }

    function handleKeyDown(e) {
        if (e.key !== 'Tab') return;

        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    return {
        activate() {
            previousActiveElement = document.activeElement;
            element.addEventListener('keydown', handleKeyDown);
            const focusable = getFocusableElements();
            if (focusable.length > 0) {
                focusable[0].focus();
            }
        },
        deactivate() {
            element.removeEventListener('keydown', handleKeyDown);
            if (previousActiveElement && previousActiveElement.focus) {
                previousActiveElement.focus();
            }
        }
    };
}

/**
 * Initialize touch-friendly tooltips
 * Converts hover-only tooltips to work on touch devices
 */
export function initTouchTooltips() {
    let activeTooltip = null;

    function closeActiveTooltip() {
        if (activeTooltip) {
            activeTooltip.classList.remove('tooltip-active');
            activeTooltip = null;
        }
    }

    // Close tooltip when clicking outside
    document.addEventListener('click', (e) => {
        if (activeTooltip && !activeTooltip.contains(e.target)) {
            closeActiveTooltip();
        }
    });

    // Close tooltip on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeActiveTooltip();
        }
    });

    // Handle touch/click on tooltip triggers
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.touch-tooltip-trigger');
        if (trigger) {
            e.stopPropagation();
            if (activeTooltip === trigger) {
                closeActiveTooltip();
            } else {
                closeActiveTooltip();
                trigger.classList.add('tooltip-active');
                activeTooltip = trigger;
            }
        }
    });
}

/**
 * Show a purchase success animation on an element
 * @param {HTMLElement} element - Element to animate
 */
export function showPurchaseAnimation(element) {
    if (!element) return;
    element.classList.add('purchase-success');
    setTimeout(() => element.classList.remove('purchase-success'), 800);
}
