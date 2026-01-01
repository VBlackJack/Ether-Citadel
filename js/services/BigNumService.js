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
 * BigNumService - Wrapper for break_infinity.js Decimal class
 * Provides formatting, arithmetic, and serialization for large numbers
 */

// Standard suffixes for number formatting
const SUFFIXES = [
    '', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
    'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg',
    'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OcVg', 'NoVg', 'Tg'
];

// Thresholds for switching notation
const NOTATION_THRESHOLDS = {
    standard: 1e33,     // Switch to scientific after Tg
    scientific: 1e308,  // Max JS number, use break_infinity beyond
    engineering: 1e303
};

/**
 * Notation types supported by the formatter
 */
export const NotationType = {
    STANDARD: 'standard',       // k, M, B, T...
    SCIENTIFIC: 'scientific',   // 1.23e10
    ENGINEERING: 'engineering', // 1.23e9 (exponent multiple of 3)
    LETTERS: 'letters'          // aa, ab, ac...
};

/**
 * BigNum class - Wraps Decimal for large number operations
 */
export class BigNum {
    /**
     * @param {number|string|BigNum|Decimal} value
     */
    constructor(value = 0) {
        if (value instanceof BigNum) {
            this.value = new Decimal(value.value);
        } else if (typeof value === 'object' && value !== null && 'mantissa' in value) {
            // Serialized format { mantissa, exponent }
            this.value = Decimal.fromMantissaExponent(value.mantissa, value.exponent);
        } else {
            this.value = new Decimal(value);
        }
    }

    // Arithmetic operations (return new BigNum)
    add(other) { return new BigNum(this.value.add(BigNum.toDecimal(other))); }
    sub(other) { return new BigNum(this.value.sub(BigNum.toDecimal(other))); }
    mul(other) { return new BigNum(this.value.mul(BigNum.toDecimal(other))); }
    div(other) { return new BigNum(this.value.div(BigNum.toDecimal(other))); }
    pow(other) { return new BigNum(this.value.pow(BigNum.toDecimal(other))); }
    sqrt() { return new BigNum(this.value.sqrt()); }
    log10() { return new BigNum(this.value.log10()); }
    log(base) { return new BigNum(this.value.log(base)); }
    abs() { return new BigNum(this.value.abs()); }
    neg() { return new BigNum(this.value.neg()); }
    floor() { return new BigNum(this.value.floor()); }
    ceil() { return new BigNum(this.value.ceil()); }
    round() { return new BigNum(this.value.round()); }

    // Comparison operations
    eq(other) { return this.value.eq(BigNum.toDecimal(other)); }
    neq(other) { return this.value.neq(BigNum.toDecimal(other)); }
    lt(other) { return this.value.lt(BigNum.toDecimal(other)); }
    lte(other) { return this.value.lte(BigNum.toDecimal(other)); }
    gt(other) { return this.value.gt(BigNum.toDecimal(other)); }
    gte(other) { return this.value.gte(BigNum.toDecimal(other)); }

    // In-place operations (mutate and return this)
    iadd(other) { this.value = this.value.add(BigNum.toDecimal(other)); return this; }
    isub(other) { this.value = this.value.sub(BigNum.toDecimal(other)); return this; }
    imul(other) { this.value = this.value.mul(BigNum.toDecimal(other)); return this; }
    idiv(other) { this.value = this.value.div(BigNum.toDecimal(other)); return this; }

    // Utility
    isFinite() {
        return Number.isFinite(this.value.mantissa) && Number.isFinite(this.value.exponent);
    }
    isNaN() {
        return Number.isNaN(this.value.mantissa) || Number.isNaN(this.value.exponent);
    }
    isZero() { return this.value.eq(0); }
    isPositive() { return this.value.gt(0); }
    isNegative() { return this.value.lt(0); }
    sign() {
        // break_infinity.js uses .sign as a property, not a method
        return typeof this.value.sign === 'function' ? this.value.sign() : this.value.sign;
    }

    // Conversion
    toNumber() { return this.value.toNumber(); }
    toString() { return this.value.toString(); }
    toFixed(places = 0) { return this.value.toFixed(places); }

    /**
     * Serialize for save data
     * @returns {{ mantissa: number, exponent: number }}
     */
    serialize() {
        return {
            mantissa: this.value.mantissa,
            exponent: this.value.exponent
        };
    }

    /**
     * Clone this BigNum
     * @returns {BigNum}
     */
    clone() {
        return new BigNum(this);
    }

    /**
     * Get the exponent (power of 10)
     * @returns {number}
     */
    exponent() {
        return this.value.exponent;
    }

    /**
     * Get the mantissa
     * @returns {number}
     */
    mantissa() {
        return this.value.mantissa;
    }

    /**
     * Convert value to Decimal (static helper)
     * @param {number|string|BigNum|Decimal} value
     * @returns {Decimal}
     */
    static toDecimal(value) {
        if (value instanceof BigNum) return value.value;
        if (value instanceof Decimal) return value;
        return new Decimal(value);
    }

    /**
     * Create BigNum from serialized data
     * @param {{ mantissa: number, exponent: number }} data
     * @returns {BigNum}
     */
    static fromSerialized(data) {
        if (!data || typeof data !== 'object') return new BigNum(0);
        if ('mantissa' in data && 'exponent' in data) {
            return new BigNum(data);
        }
        return new BigNum(data);
    }

    // Static factory methods
    static zero() { return new BigNum(0); }
    static one() { return new BigNum(1); }
    static fromNumber(n) { return new BigNum(n); }

    // Static comparison
    static max(a, b) { return new BigNum(Decimal.max(BigNum.toDecimal(a), BigNum.toDecimal(b))); }
    static min(a, b) { return new BigNum(Decimal.min(BigNum.toDecimal(a), BigNum.toDecimal(b))); }
}

/**
 * BigNumService - Singleton service for number formatting and operations
 */
class BigNumServiceClass {
    constructor() {
        this.notation = NotationType.STANDARD;
        this.precision = 2;
        this.smallNumberPrecision = 0;
        this.initialized = false;
    }

    /**
     * Initialize the service (call after Decimal is loaded)
     */
    init() {
        if (typeof Decimal === 'undefined') {
            console.warn('BigNumService: Decimal not available, using fallback formatting');
            return false;
        }
        this.initialized = true;
        return true;
    }

    /**
     * Set the default notation type
     * @param {string} notation - One of NotationType values
     */
    setNotation(notation) {
        if (Object.values(NotationType).includes(notation)) {
            this.notation = notation;
        }
    }

    /**
     * Set default precision for large numbers
     * @param {number} precision
     */
    setPrecision(precision) {
        this.precision = Math.max(0, Math.min(10, precision));
    }

    /**
     * Format a number using the current notation settings
     * @param {number|BigNum|Decimal} value
     * @param {object} options - Override options
     * @param {string} options.notation - Notation type
     * @param {number} options.precision - Decimal places
     * @param {boolean} options.showSign - Show + for positive
     * @returns {string}
     */
    format(value, options = {}) {
        const notation = options.notation || this.notation;
        const precision = options.precision ?? this.precision;
        const showSign = options.showSign || false;

        // Convert to BigNum if needed
        const bn = value instanceof BigNum ? value : new BigNum(value);
        const num = bn.toNumber();

        // Handle special cases
        if (bn.isNaN()) return 'NaN';
        if (!bn.isFinite()) return bn.isPositive() ? 'Infinity' : '-Infinity';

        // Small numbers - use regular formatting
        if (Math.abs(num) < 1000) {
            const formatted = Number.isInteger(num) ? num.toString() : num.toFixed(this.smallNumberPrecision);
            return showSign && num > 0 ? '+' + formatted : formatted;
        }

        let result;
        switch (notation) {
            case NotationType.SCIENTIFIC:
                result = this.formatScientific(bn, precision);
                break;
            case NotationType.ENGINEERING:
                result = this.formatEngineering(bn, precision);
                break;
            case NotationType.LETTERS:
                result = this.formatLetters(bn, precision);
                break;
            case NotationType.STANDARD:
            default:
                result = this.formatStandard(bn, precision);
        }

        return showSign && bn.isPositive() ? '+' + result : result;
    }

    /**
     * Format with standard suffixes (k, M, B, T, Qa, Qi, ...)
     * @param {BigNum} bn
     * @param {number} precision
     * @returns {string}
     */
    formatStandard(bn, precision) {
        const exp = bn.exponent();

        // For very large numbers, fall back to scientific
        if (exp >= 33 * 3) { // Beyond our suffix list
            return this.formatScientific(bn, precision);
        }

        const suffixIndex = Math.floor(exp / 3);
        if (suffixIndex >= SUFFIXES.length) {
            return this.formatScientific(bn, precision);
        }

        const divisor = Math.pow(10, suffixIndex * 3);
        const num = bn.toNumber() / divisor;

        // Determine precision based on size
        const displayPrecision = num >= 100 ? 1 : precision;
        return num.toFixed(displayPrecision) + SUFFIXES[suffixIndex];
    }

    /**
     * Format in scientific notation (1.23e10)
     * @param {BigNum} bn
     * @param {number} precision
     * @returns {string}
     */
    formatScientific(bn, precision) {
        const exp = Math.floor(bn.exponent());
        const mantissa = bn.mantissa();
        return mantissa.toFixed(precision) + 'e' + exp;
    }

    /**
     * Format in engineering notation (exponent multiple of 3)
     * @param {BigNum} bn
     * @param {number} precision
     * @returns {string}
     */
    formatEngineering(bn, precision) {
        const exp = Math.floor(bn.exponent());
        const engExp = Math.floor(exp / 3) * 3;
        const adjustment = exp - engExp;
        const mantissa = bn.mantissa() * Math.pow(10, adjustment);
        return mantissa.toFixed(precision) + 'e' + engExp;
    }

    /**
     * Format with letter notation (aa, ab, ac, ...)
     * @param {BigNum} bn
     * @param {number} precision
     * @returns {string}
     */
    formatLetters(bn, precision) {
        const exp = Math.floor(bn.exponent());

        // For small exponents, use standard suffixes
        if (exp < 15) {
            return this.formatStandard(bn, precision);
        }

        // Calculate letter pair based on exponent
        const letterIndex = Math.floor((exp - 15) / 3);
        const first = Math.floor(letterIndex / 26);
        const second = letterIndex % 26;

        const divisor = Math.pow(10, (letterIndex * 3) + 15);
        const num = bn.toNumber() / divisor;

        const letters = String.fromCharCode(97 + first) + String.fromCharCode(97 + second);
        return num.toFixed(precision) + letters;
    }

    /**
     * Parse a formatted string back to BigNum
     * @param {string} str
     * @returns {BigNum}
     */
    parse(str) {
        if (!str || typeof str !== 'string') return new BigNum(0);

        str = str.trim().toLowerCase();

        // Try scientific notation first
        if (str.includes('e')) {
            return new BigNum(str);
        }

        // Try suffix parsing
        for (let i = SUFFIXES.length - 1; i >= 0; i--) {
            const suffix = SUFFIXES[i].toLowerCase();
            if (suffix && str.endsWith(suffix)) {
                const numPart = parseFloat(str.slice(0, -suffix.length));
                return new BigNum(numPart * Math.pow(10, i * 3));
            }
        }

        // Plain number
        return new BigNum(parseFloat(str) || 0);
    }

    /**
     * Create a new BigNum
     * @param {number|string|BigNum} value
     * @returns {BigNum}
     */
    create(value = 0) {
        return new BigNum(value);
    }

    /**
     * Check if a value is a valid number (not NaN, not Infinity)
     * @param {number|BigNum} value
     * @returns {boolean}
     */
    isValid(value) {
        const bn = value instanceof BigNum ? value : new BigNum(value);
        return bn.isFinite() && !bn.isNaN();
    }

    /**
     * Safely add, returning 0 if result is invalid
     * @param {number|BigNum} a
     * @param {number|BigNum} b
     * @returns {BigNum}
     */
    safeAdd(a, b) {
        const result = new BigNum(a).add(b);
        return this.isValid(result) ? result : BigNum.zero();
    }

    /**
     * Safely multiply, returning 0 if result is invalid
     * @param {number|BigNum} a
     * @param {number|BigNum} b
     * @returns {BigNum}
     */
    safeMul(a, b) {
        const result = new BigNum(a).mul(b);
        return this.isValid(result) ? result : BigNum.zero();
    }
}

// Export singleton instance
export const BigNumService = new BigNumServiceClass();

/**
 * Backward-compatible formatNumber function
 * Drop-in replacement for the existing formatNumber in config.js
 * @param {number|BigNum} num
 * @returns {string}
 */
export function formatNumber(num) {
    // Fast path for small numbers (most common case)
    if (typeof num === 'number' && num < 1000) {
        return Math.floor(num).toString();
    }

    // Fallback when Decimal is not available
    if (typeof Decimal === 'undefined') {
        const n = Number(num);
        if (n < 1e6) {
            try {
                // Use app locale for consistent formatting
                const locale = window.i18n?.getLocale?.() || 'en';
                return new Intl.NumberFormat(locale).format(Math.floor(n));
            } catch {
                return Math.floor(n).toLocaleString();
            }
        }
        if (n < 1e9) return (n / 1e6).toFixed(2) + 'M';
        if (n < 1e12) return (n / 1e9).toFixed(2) + 'B';
        if (n < 1e15) return (n / 1e12).toFixed(2) + 'T';
        return n.toExponential(2);
    }

    return BigNumService.format(num, { precision: 2 });
}

/**
 * Format a number as currency (with gold icon placeholder)
 * @param {number|BigNum} num
 * @returns {string}
 */
export function formatCurrency(num) {
    return formatNumber(num) + 'g';
}

/**
 * Format a percentage
 * @param {number} value - Value between 0 and 1
 * @param {number} precision - Decimal places
 * @returns {string}
 */
export function formatPercent(value, precision = 1) {
    return (value * 100).toFixed(precision) + '%';
}

/**
 * Format a multiplier (e.g., 1.5x, 2x)
 * @param {number|BigNum} value
 * @param {number} precision
 * @returns {string}
 */
export function formatMultiplier(value, precision = 2) {
    const num = value instanceof BigNum ? value.toNumber() : value;
    if (num < 10) {
        return num.toFixed(precision) + 'x';
    }
    return formatNumber(num) + 'x';
}
