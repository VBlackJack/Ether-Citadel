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
 * Generic object pool for reducing garbage collection
 */
export class ObjectPool {
    constructor(factory, reset, initialSize = 50) {
        this.factory = factory;
        this.reset = reset;
        this.pool = [];
        this.active = [];

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }

    /**
     * Get an object from the pool
     */
    acquire(...args) {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.factory();
        }
        this.reset(obj, ...args);
        this.active.push(obj);
        return obj;
    }

    /**
     * Return an object to the pool
     */
    release(obj) {
        const idx = this.active.indexOf(obj);
        if (idx !== -1) {
            this.active.splice(idx, 1);
            this.pool.push(obj);
        }
    }

    /**
     * Release all dead objects (objects with life <= 0 or active === false)
     * Returns the filtered active array
     */
    releaseInactive(checkFn) {
        const stillActive = [];
        for (const obj of this.active) {
            if (checkFn(obj)) {
                stillActive.push(obj);
            } else {
                this.pool.push(obj);
            }
        }
        this.active = stillActive;
        return this.active;
    }

    /**
     * Get all active objects
     */
    getActive() {
        return this.active;
    }

    /**
     * Clear all objects
     */
    clear() {
        this.pool.push(...this.active);
        this.active = [];
    }

    /**
     * Get pool stats
     */
    getStats() {
        return {
            pooled: this.pool.length,
            active: this.active.length,
            total: this.pool.length + this.active.length
        };
    }
}

/**
 * Particle pool singleton
 */
let particlePool = null;

export function getParticlePool() {
    if (!particlePool) {
        particlePool = new ObjectPool(
            () => ({
                x: 0, y: 0, vx: 0, vy: 0,
                color: '#fff', life: 0, decay: 0,
                tx: 0, ty: 0, // For beam particles
                customDraw: null
            }),
            (p, x, y, color, customDraw = null) => {
                p.x = x;
                p.y = y;
                p.color = color;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 1;
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
                p.life = 1.0;
                p.decay = Math.random() * 0.03 + 0.02;
                p.tx = 0;
                p.ty = 0;
                p.customDraw = customDraw;
            },
            100
        );
    }
    return particlePool;
}

/**
 * FloatingText pool singleton
 */
let floatingTextPool = null;

export function getFloatingTextPool() {
    if (!floatingTextPool) {
        floatingTextPool = new ObjectPool(
            () => ({
                x: 0, y: 0, text: '', color: '#fff',
                size: 20, life: 0, vy: 0, offsetX: 0
            }),
            (ft, x, y, text, color, size = 20, offsetX = 0) => {
                ft.x = x;
                ft.y = y;
                ft.text = text;
                ft.color = color;
                ft.size = size;
                ft.life = 1.0;
                ft.vy = -1;
                ft.offsetX = offsetX;
            },
            50
        );
    }
    return floatingTextPool;
}

/**
 * Projectile pool singleton
 */
let projectilePool = null;

export function getProjectilePool() {
    if (!projectilePool) {
        projectilePool = new ObjectPool(
            () => ({
                x: 0, y: 0, target: null, active: false,
                damage: 0, speed: 0, color: '#fff', tier: 1,
                isMulti: false, isCrit: false, isSuperCrit: false,
                effects: {}, bounceCount: 0, blastRadius: 0,
                leech: 0, stasisChance: 0
            }),
            (p, x, y, target, config, effects = {}, props = {}) => {
                p.x = x;
                p.y = y;
                p.target = target;
                p.active = true;
                p.damage = config.damage;
                p.speed = config.speed;
                p.color = config.color;
                p.tier = config.tier;
                p.isMulti = config.isMulti || false;
                p.isCrit = config.isCrit || false;
                p.isSuperCrit = config.isSuperCrit || false;
                p.effects = effects;
                p.bounceCount = props.bounce || 0;
                p.blastRadius = props.blast || 0;
                p.leech = props.leech || 0;
                p.stasisChance = props.stasis || 0;
            },
            100
        );
    }
    return projectilePool;
}
