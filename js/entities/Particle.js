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

import { MathUtils } from '../config.js';
import { getParticlePool } from '../utils/ObjectPool.js';

export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.02;
        this.customDraw = null;
        this.tx = 0;
        this.ty = 0;
    }

    /**
     * Reset particle for reuse (pool-friendly)
     */
    reset(x, y, color, customDraw = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.02;
        this.customDraw = customDraw;
        this.tx = 0;
        this.ty = 0;
        return this;
    }

    update(dt) {
        const timeScale = dt / 16;
        this.x += this.vx * timeScale;
        this.y += this.vy * timeScale;
        this.life -= this.decay * timeScale;
    }

    draw(ctx) {
        if (this.customDraw) {
            this.customDraw.call(this, ctx);
            return;
        }
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    /**
     * Check if particle is still alive
     */
    isAlive() {
        return this.life > 0;
    }

    /**
     * Create a particle using the pool (preferred method)
     */
    static acquire(x, y, color, customDraw = null) {
        return getParticlePool().acquire(x, y, color, customDraw);
    }

    /**
     * Release a particle back to the pool
     */
    static release(particle) {
        getParticlePool().release(particle);
    }
}