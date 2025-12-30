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
import { RUNE_TYPES } from '../data.js';

/**
 * Floating text effect for damage numbers, notifications, etc.
 */
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

/**
 * Particle effect for explosions, impacts, etc.
 */
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
    }

    update(dt) {
        const timeScale = dt / 16;
        this.x += this.vx * timeScale;
        this.y += this.vy * timeScale;
        this.life -= this.decay * timeScale;
    }

    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

/**
 * Collectible rune that provides temporary buffs
 */
export class Rune {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = RUNE_TYPES[Math.floor(Math.random() * RUNE_TYPES.length)];
        this.life = 10000;
        this.scale = 1;
        this.scaleDir = 1;
    }

    update(dt, game) {
        this.life -= dt;
        this.scale += 0.01 * this.scaleDir;
        if (this.scale > 1.2 || this.scale < 0.8) this.scaleDir *= -1;
        if (game.drone && game.drone.canCollect) {
            const d = MathUtils.dist(this.x, this.y, game.drone.x, game.drone.y);
            if (d < 100) {
                this.x = MathUtils.lerp(this.x, game.drone.x, 0.1);
                this.y = MathUtils.lerp(this.y, game.drone.y, 0.1);
                if (d < 20) {
                    game.activateRune(this);
                    this.life = 0;
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.fillStyle = this.type.color;
        ctx.shadowColor = this.type.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.icon, 0, 0);
        ctx.restore();
    }
}
