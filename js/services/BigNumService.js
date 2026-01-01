/*
 * Copyright 2025 Julien Bombled
 * Licensed under the Apache License, Version 2.0
 */

// Notation Types Enum
export const NOTATIONS = {
    STANDARD: 'standard', // K, M, B, T...
    SCIENTIFIC: 'scientific', // 1.23e5
    ENGINEERING: 'engineering', // 123.45e3
    LETTERS: 'letters' // 10a, 10b... 1aa
};

// Configuration state (Defaults to STANDARD)
let currentNotation = NOTATIONS.STANDARD;

const STANDARD_SUFFIXES = [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
    'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg',
    'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OcVg', 'NoVg', 'Tg'
];

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

function getDecimal() {
    if (typeof window !== 'undefined' && window.Decimal) return window.Decimal;
    if (typeof Decimal !== 'undefined') return Decimal;
    return null;
}

export const BigNumService = {
    isAvailable() { return getDecimal() !== null; },
    init() { if (!this.isAvailable()) console.error('BigNumService: break_infinity.js missing!'); },

    create(value) {
        const D = getDecimal();
        if (!D) return { toNumber: () => Number(value) || 0 };
        if (value === null || value === undefined) return new D(0);
        if (value instanceof D) return value;
        if (typeof value === 'object' && value !== null && 'mantissa' in value && 'exponent' in value) {
            return D.fromMantissaExponent(value.mantissa, value.exponent);
        }
        if (typeof value === 'number') {
            if (Number.isNaN(value)) return new D(0);
            if (!Number.isFinite(value)) return new D(value > 0 ? Number.MAX_VALUE : -Number.MAX_VALUE);
        }
        try { return new D(value); } catch (e) { return new D(0); }
    },

    add(a, b) { return this.create(a).add(this.create(b)); },
    sub(a, b) { return this.create(a).sub(this.create(b)); },
    mul(a, b) { return this.create(a).mul(this.create(b)); },
    div(a, b) {
        const divisor = this.create(b);
        if (divisor.eq(0)) return this.create(0);
        return this.create(a).div(divisor);
    },
    pow(a, b) { return this.create(a).pow(this.create(b)); },
    sqrt(v) { return this.create(v).sqrt(); },
    log10(v) { return this.create(v).log10(); },
    ln(v) { return this.create(v).ln(); },
    floor(v) { return this.create(v).floor(); },
    ceil(v) { return this.create(v).ceil(); },
    round(v) { return this.create(v).round(); },
    abs(v) { return this.create(v).abs(); },

    max(a, b) {
        const D = getDecimal();
        return D ? D.max(this.create(a), this.create(b)) : this.create(0);
    },
    min(a, b) {
        const D = getDecimal();
        return D ? D.min(this.create(a), this.create(b)) : this.create(0);
    },

    eq(a, b) { return this.create(a).eq(this.create(b)); },
    gt(a, b) { return this.create(a).gt(this.create(b)); },
    gte(a, b) { return this.create(a).gte(this.create(b)); },
    lt(a, b) { return this.create(a).lt(this.create(b)); },
    lte(a, b) { return this.create(a).lte(this.create(b)); },

    isZero(v) { return this.create(v).eq(0); },
    isPositive(v) { return this.create(v).gt(0); },
    isNegative(v) { return this.create(v).lt(0); },
    isFinite(v) {
        const d = this.create(v);
        return Number.isFinite(d.mantissa) && Number.isFinite(d.exponent);
    },
    toNumber(v) { return this.create(v).toNumber(); },
    serialize(d) { const val = this.create(d); return { mantissa: val.mantissa, exponent: val.exponent }; },
    deserialize(d) { return this.create(d); },

    setNotation(notation) {
        if (Object.values(NOTATIONS).includes(notation)) {
            currentNotation = notation;
        } else {
            console.warn(`BigNumService: Invalid notation '${notation}'`);
        }
    },

    getNotation() {
        return currentNotation;
    }
};

function getLetterSuffix(exponent) {
    const letterIndex = Math.floor(exponent / 3) - 1;
    if (letterIndex < 0) return '';
    let suffix = '';
    let remainder = letterIndex;
    do {
        suffix = ALPHABET[remainder % 26] + suffix;
        remainder = Math.floor(remainder / 26) - 1;
    } while (remainder >= 0);
    return suffix;
}

export function formatNumber(value, precision = 2) {
    if (value === null || value === undefined) return '0';

    let decimal = BigNumService.create(value);

    if (decimal.eq(0)) return '0';
    if (!Number.isFinite(decimal.mantissa) || !Number.isFinite(decimal.exponent)) return '∞';

    if (decimal.abs().lt(1000)) {
        const num = decimal.toNumber();
        if (Number.isInteger(num)) return num.toLocaleString();
        return num.toFixed(precision).replace(/\.?0+$/, '');
    }

    const exponent = decimal.exponent;

    switch (currentNotation) {
        case NOTATIONS.SCIENTIFIC:
            return decimal.toExponential(precision).replace('+', '');

        case NOTATIONS.ENGINEERING:
            const engExponent = Math.floor(exponent / 3) * 3;
            const engMantissa = decimal.div(Decimal.pow(10, engExponent)).toNumber();
            return engMantissa.toFixed(precision) + 'e' + engExponent;

        case NOTATIONS.LETTERS:
             const letterExponent = Math.floor(exponent / 3) * 3;
             const letterMantissa = decimal.div(Decimal.pow(10, letterExponent)).toNumber();
             return letterMantissa.toFixed(precision) + getLetterSuffix(exponent);

        case NOTATIONS.STANDARD:
        default:
            const suffixIndex = Math.floor(exponent / 3);
            if (suffixIndex < STANDARD_SUFFIXES.length) {
                const stdExponent = suffixIndex * 3;
                const stdMantissa = decimal.div(Decimal.pow(10, stdExponent)).toNumber();
                if (suffixIndex === 0) return stdMantissa.toFixed(precision);
                return stdMantissa.toFixed(precision) + STANDARD_SUFFIXES[suffixIndex];
            }
            return decimal.toExponential(precision).replace('+', '');
    }
}

export function formatCurrency(value) { return formatNumber(value) + ' 💰'; }
export function formatPercent(value, precision = 1) {
    const pct = value > 1 ? value : value * 100;
    return pct.toFixed(precision) + '%';
}
export function formatMultiplier(value, precision = 2) {
    const num = BigNumService.toNumber(value);
    if (num < 10) return num.toFixed(precision) + 'x';
    return formatNumber(num) + 'x';
}
export function formatTime(seconds) {
    if (seconds < 60) return Math.floor(seconds) + 's';
    if (seconds < 3600) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}m ${s}s`;
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
}

// Legacy support
export class BigNum {
    constructor(value = 0) { this.value = BigNumService.create(value); }
    add(o) { return new BigNum(BigNumService.add(this.value, o)); }
    sub(o) { return new BigNum(BigNumService.sub(this.value, o)); }
    mul(o) { return new BigNum(BigNumService.mul(this.value, o)); }
    div(o) { return new BigNum(BigNumService.div(this.value, o)); }
    pow(o) { return new BigNum(BigNumService.pow(this.value, o)); }
    eq(o) { return BigNumService.eq(this.value, o); }
    gt(o) { return BigNumService.gt(this.value, o); }
    gte(o) { return BigNumService.gte(this.value, o); }
    lt(o) { return BigNumService.lt(this.value, o); }
    lte(o) { return BigNumService.lte(this.value, o); }
    toNumber() { return BigNumService.toNumber(this.value); }
    toString() { return this.value.toString(); }
    static zero() { return new BigNum(0); }
    static one() { return new BigNum(1); }
}
