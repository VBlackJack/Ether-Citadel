/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

/**
 * Object pool for FloatingText to reduce GC pressure
 */
const FloatingTextPool = {
    pool: [],
    maxSize: 100,

    /**
     * Get a FloatingText from pool or create new
     */
    get(x, y, text, color, size = 20, isCrit = false) {
        let instance;
        if (this.pool.length > 0) {
            instance = this.pool.pop();
            instance.reset(x, y, text, color, size, isCrit);
        } else {
            instance = new FloatingText(x, y, text, color, size, isCrit);
        }
        return instance;
    },

    /**
     * Return a FloatingText to the pool
     */
    release(instance) {
        if (this.pool.length < this.maxSize) {
            this.pool.push(instance);
        }
    },

    /**
     * Clear the entire pool
     */
    clear() {
        this.pool = [];
    }
};

export class FloatingText {
    constructor(x, y, text, color, size = 20, isCrit = false) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this._baseSize = size;
        this._size = size;
        this._cachedFont = `bold ${size}px Rajdhani`;
        this.life = 1.0;
        this.vy = -1.2;
        this.vx = (Math.random() - 0.5) * 0.4; // Horizontal drift
        this.scale = 1.5; // Start scaled up for punch effect
        this.isCrit = isCrit;
    }

    get size() { return this._size; }
    set size(val) {
        if (this._size !== val) {
            this._size = val;
            this._cachedFont = `bold ${val}px Rajdhani`;
        }
    }

    /**
     * Reset instance for reuse from pool
     */
    reset(x, y, text, color, size = 20, isCrit = false) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this._baseSize = size;
        this.size = size;
        this.life = 1.0;
        this.vy = -1.2;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.scale = 1.5;
        this.isCrit = isCrit;
    }

    /**
     * Static factory - use this instead of new FloatingText()
     */
    static create(x, y, text, color, size = 20, isCrit = false) {
        return FloatingTextPool.get(x, y, text, color, size, isCrit);
    }

    /**
     * Return this instance to the pool
     */
    release() {
        FloatingTextPool.release(this);
    }

    /**
     * Check if this instance should be released (life <= 0)
     */
    isDead() {
        return this.life <= 0;
    }

    update(dt) {
        const t = dt / 16;
        // Ease-out curve for velocity (slows down over time)
        const easeOut = this.life * this.life;
        this.y += this.vy * t * (0.5 + easeOut * 0.5);
        this.x += this.vx * t * easeOut;
        this.life -= 0.025 * t;
        // Scale animation: start at 1.5, ease down to 1.0
        if (this.scale > 1.0) {
            this.scale = Math.max(1.0, this.scale - 0.08 * t);
        }
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life);
        // Apply scale to size
        const scaledSize = Math.round(this._baseSize * this.scale);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${scaledSize}px Rajdhani`;
        ctx.textAlign = 'center';
        // Draw crit label if applicable
        if (this.isCrit) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
        }
        ctx.fillText(this.text, this.x, this.y);
        // Draw "CRIT!" label below for crits
        if (this.isCrit && this.life > 0.7) {
            ctx.font = `bold ${Math.round(scaledSize * 0.5)}px Rajdhani`;
            ctx.fillStyle = '#fbbf24';
            ctx.fillText('CRIT!', this.x, this.y + scaledSize * 0.6);
        }
        ctx.restore();
    }
}

export { FloatingTextPool };