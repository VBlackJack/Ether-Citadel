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
 * BigNumService - Robust wrapper for break_infinity.js Decimal class
 * Provides formatting, arithmetic, and serialization for large numbers
 * Used as the mathematical foundation for the game economy
 */

// Standard suffixes for number formatting
const SUFFIXES = [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
    'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg',
    'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OcVg', 'NoVg', 'Tg'
];

/**
 * Get the Decimal class from window (provided by break_infinity.min.js)
 * @returns {typeof Decimal|null}
 */
function getDecimal() {
    if (typeof window !== 'undefined' && window.Decimal) {
        return window.Decimal;
    }
    if (typeof Decimal !== 'undefined') {
        return Decimal;
    }
    return null;
}

/**
 * BigNumService - Static service for big number operations
 * All methods are static for easy access throughout the codebase
 */
export const BigNumService = {
    /**
     * Check if break_infinity.js is loaded
     * @returns {boolean}
     */
    isAvailable() {
        return getDecimal() !== null;
    },

    /**
     * Create a Decimal instance from any value
     * Handles null, undefined, and invalid values safely
     * @param {number|string|Decimal|null|undefined} value
     * @returns {Decimal}
     */
    create(value) {
        const D = getDecimal();
        if (!D) {
            console.warn('BigNumService: Decimal not available');
            return { toNumber: () => Number(value) || 0 };
        }

        // Safety checks
        if (value === null || value === undefined) {
            return new D(0);
        }

        // Already a Decimal
        if (value instanceof D) {
            return value;
        }

        // Handle serialized format { mantissa, exponent }
        if (typeof value === 'object' && value !== null && 'mantissa' in value && 'exponent' in value) {
            return D.fromMantissaExponent(value.mantissa, value.exponent);
        }

        // Handle NaN and Infinity
        if (typeof value === 'number') {
            if (Number.isNaN(value)) return new D(0);
            if (!Number.isFinite(value)) return new D(value > 0 ? Number.MAX_VALUE : -Number.MAX_VALUE);
        }

        try {
            return new D(value);
        } catch (e) {
            console.warn('BigNumService: Failed to create Decimal from', value);
            return new D(0);
        }
    },

    /**
     * Add two values
     * @param {number|string|Decimal} a
     * @param {number|string|Decimal} b
     * @returns {Decimal}
     */
    add(a, b) {
        return this.create(a).add(this.create(b));
    },

    /**
     * Subtract b from a
     * @param {number|string|Decimal} a
     * @param {number|string|Decimal} b
     * @returns {Decimal}
     */
    sub(a, b) {
        return this.create(a).sub(this.create(b));
    },

    /**
     * Multiply two values
     * @param {number|string|Decimal} a
     * @param {number|string|Decimal} b
     * @returns {Decimal}
     */
    mul(a, b) {
        return this.create(a).mul(this.create(b));
    },

    /**
     * Divide a by b
     * @param {number|string|Decimal} a
     * @param {number|string|Decimal} b
     * @returns {Decimal}
     */
    div(a, b) {
        const divisor = this.create(b);
        if (divisor.eq(0)) {
            console.warn('BigNumService: Division by zero');
            return this.create(0);
        }
        return this.create(a).div(divisor);
    },

    /**
     * Raise base to exponent power
     * Critical for exponential scaling formulas
     * @param {number|string|Decimal} base
     * @param {number|string|Decimal} exponent
     * @returns {Decimal}
     */
    pow(base, exponent) {
        return this.create(base).pow(this.create(exponent));
    },

    /**
     * Square root
     * @param {number|string|Decimal} value
     * @returns {Decimal}
     */
    sqrt(value) {
        return this.create(value).sqrt();
    },

    /**
     * Log base 10
     * @param {number|string|Decimal} value
     * @returns {Decimal}
     */
    log10(value) {
        return this.create(value).log10();
    },

    /**
     * Natural log
     * @param {number|string|Decimal} value
     * @returns {Decimal}
     */
    ln(value) {
        return this.create(value).ln();
    },

    /**
     * Floor (round down)
     * @param {number|string|Decimal} value
     * @returns {Decimal}
     */
    floor(value) {
        return this.create(value).floor();
    },

    /**
     * Ceiling (round up)
     * @param {number|string|Decimal} value
     * @returns {Decimal}
     */
    ceil(value) {
        return this.create(value).ceil();
    },

    /**
     * Round to nearest integer
     * @param {number|string|Decimal} value
     * @returns {Decimal}
     */
    round(value) {
        return this.create(value).round();
    },

    /**
     * Absolute value
     * @param {number|string|Decimal} value
     * @returns {Decimal}
     */
    abs(value) {
        return this.create(value).abs();
    },

    /**
     * Maximum of two values
     * @param {number|string|Decimal} a
     * @param {number|string|Decimal} b
     * @returns {Decimal}
     */
    max(a, b) {
        const D = getDecimal();
        if (!D) return this.create(Math.max(Number(a) || 0, Number(b) || 0));
        return D.max(this.create(a), this.create(b));
    },

    /**
     * Minimum of two values
     * @param {number|string|Decimal} a
     * @param {number|string|Decimal} b
     * @returns {Decimal}
     */
    min(a, b) {
        const D = getDecimal();
        if (!D) return this.create(Math.min(Number(a) || 0, Number(b) || 0));
        return D.min(this.create(a), this.create(b));
    },

    // ============ Comparison Methods ============

    /**
     * Check if a equals b
     * @param {number|string|Decimal} a
     * @param {number|string|Decimal} b
     * @returns {boolean}
     */
    eq(a, b) {
        return this.create(a).eq(this.create(b));
    },

    /**
     * Check if a is greater than b
     * @param {number|string|Decimal} a
     * @param {number|string|Decimal} b
     * @returns {boolean}
     */
    gt(a, b) {
        return this.create(a).gt(this.create(b));
    },

    /**
     * Check if a is greater than or equal to b
     * Critical for checking if player can afford costs
     * @param {number|string|Decimal} a
     * @param {number|string|Decimal} b
     * @returns {boolean}
     */
    gte(a, b) {
        return this.create(a).gte(this.create(b));
    },

    /**
     * Check if a is less than b
     * @param {number|string|Decimal} a
     * @param {number|string|Decimal} b
     * @returns {boolean}
     */
    lt(a, b) {
        return this.create(a).lt(this.create(b));
    },

    /**
     * Check if a is less than or equal to b
     * @param {number|string|Decimal} a
     * @param {number|string|Decimal} b
     * @returns {boolean}
     */
    lte(a, b) {
        return this.create(a).lte(this.create(b));
    },

    // ============ Utility Methods ============

    /**
     * Check if value is zero
     * @param {number|string|Decimal} value
     * @returns {boolean}
     */
    isZero(value) {
        return this.create(value).eq(0);
    },

    /**
     * Check if value is positive
     * @param {number|string|Decimal} value
     * @returns {boolean}
     */
    isPositive(value) {
        return this.create(value).gt(0);
    },

    /**
     * Check if value is negative
     * @param {number|string|Decimal} value
     * @returns {boolean}
     */
    isNegative(value) {
        return this.create(value).lt(0);
    },

    /**
     * Check if value is finite (not NaN or Infinity)
     * @param {number|string|Decimal} value
     * @returns {boolean}
     */
    isFinite(value) {
        const d = this.create(value);
        return Number.isFinite(d.mantissa) && Number.isFinite(d.exponent);
    },

    /**
     * Convert to regular JavaScript number
     * Warning: precision loss for very large numbers
     * @param {number|string|Decimal} value
     * @returns {number}
     */
    toNumber(value) {
        return this.create(value).toNumber();
    },

    // ============ Serialization ============

    /**
     * Serialize a Decimal for save data
     * @param {Decimal} decimal
     * @returns {{ mantissa: number, exponent: number }}
     */
    serialize(decimal) {
        const d = this.create(decimal);
        return {
            mantissa: d.mantissa,
            exponent: d.exponent
        };
    },

    /**
     * Deserialize from save data
     * @param {{ mantissa: number, exponent: number }|number} data
     * @returns {Decimal}
     */
    deserialize(data) {
        return this.create(data);
    }
};

/**
 * Format a number for display
 * Handles small numbers with locale formatting and large numbers with suffixes
 * @param {number|Decimal} value
 * @param {number} precision - Decimal places for large numbers (default 2)
 * @returns {string}
 */
export function formatNumber(value, precision = 2) {
    // Safety check for null/undefined
    if (value === null || value === undefined) {
        return '0';
    }

    // Convert Decimal to number for comparison
    let num;
    const D = getDecimal();
    if (D && value instanceof D) {
        num = value.toNumber();
    } else {
        num = Number(value);
    }

    // Handle NaN
    if (Number.isNaN(num)) {
        return '0';
    }

    // Handle Infinity
    if (!Number.isFinite(num)) {
        return num > 0 ? '∞' : '-∞';
    }

    // Small numbers: use locale formatting with commas
    if (Math.abs(num) < 1000) {
        if (Number.isInteger(num)) {
            return num.toLocaleString();
        }
        return num.toFixed(precision).replace(/\.?0+$/, '');
    }

    // Medium to large numbers: use suffixes
    const exp = Math.floor(Math.log10(Math.abs(num)));
    const suffixIndex = Math.floor(exp / 3);

    if (suffixIndex < SUFFIXES.length) {
        const divisor = Math.pow(10, suffixIndex * 3);
        const scaled = num / divisor;

        // Adjust precision based on magnitude
        const displayPrecision = scaled >= 100 ? 1 : precision;
        return scaled.toFixed(displayPrecision) + SUFFIXES[suffixIndex];
    }

    // Very large numbers: use scientific notation
    const mantissa = num / Math.pow(10, exp);
    return mantissa.toFixed(precision) + 'e' + exp;
}

/**
 * Format as currency (with gold symbol)
 * @param {number|Decimal} value
 * @returns {string}
 */
export function formatCurrency(value) {
    return formatNumber(value) + ' 💰';
}

/**
 * Format as percentage
 * @param {number} value - Value between 0 and 1 (or 0-100)
 * @param {number} precision
 * @returns {string}
 */
export function formatPercent(value, precision = 1) {
    // Auto-detect if value is already in percentage form
    const pct = value > 1 ? value : value * 100;
    return pct.toFixed(precision) + '%';
}

/**
 * Format as multiplier
 * @param {number|Decimal} value
 * @param {number} precision
 * @returns {string}
 */
export function formatMultiplier(value, precision = 2) {
    const num = BigNumService.toNumber(value);
    if (num < 10) {
        return num.toFixed(precision) + 'x';
    }
    return formatNumber(num) + 'x';
}

/**
 * Format time duration
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
    if (seconds < 60) {
        return Math.floor(seconds) + 's';
    }
    if (seconds < 3600) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}m ${s}s`;
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
}

// Legacy BigNum class for backward compatibility
export class BigNum {
    constructor(value = 0) {
        this.value = BigNumService.create(value);
    }

    add(other) { return new BigNum(BigNumService.add(this.value, other)); }
    sub(other) { return new BigNum(BigNumService.sub(this.value, other)); }
    mul(other) { return new BigNum(BigNumService.mul(this.value, other)); }
    div(other) { return new BigNum(BigNumService.div(this.value, other)); }
    pow(other) { return new BigNum(BigNumService.pow(this.value, other)); }

    eq(other) { return BigNumService.eq(this.value, other); }
    gt(other) { return BigNumService.gt(this.value, other); }
    gte(other) { return BigNumService.gte(this.value, other); }
    lt(other) { return BigNumService.lt(this.value, other); }
    lte(other) { return BigNumService.lte(this.value, other); }

    toNumber() { return BigNumService.toNumber(this.value); }
    toString() { return this.value.toString(); }

    static zero() { return new BigNum(0); }
    static one() { return new BigNum(1); }
}
