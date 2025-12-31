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
    get(x, y, text, color, size = 20) {
        let instance;
        if (this.pool.length > 0) {
            instance = this.pool.pop();
            instance.reset(x, y, text, color, size);
        } else {
            instance = new FloatingText(x, y, text, color, size);
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
    constructor(x, y, text, color, size = 20) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.life = 1.0;
        this.vy = -1;
    }

    /**
     * Reset instance for reuse from pool
     */
    reset(x, y, text, color, size = 20) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.life = 1.0;
        this.vy = -1;
    }

    /**
     * Static factory - use this instead of new FloatingText()
     */
    static create(x, y, text, color, size = 20) {
        return FloatingTextPool.get(x, y, text, color, size);
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
        this.y += this.vy * (dt / 16);
        this.life -= 0.02 * (dt / 16);
    }

    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.size}px Rajdhani`;
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1.0;
    }
}

export { FloatingTextPool };