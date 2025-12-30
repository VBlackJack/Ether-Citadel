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

import { Projectile } from './Projectile.js';

/**
 * Drone entity that orbits and shoots enemies
 */
export class Drone {
    constructor() {
        this.angle = 0;
        this.radius = 60;
        this.x = 0;
        this.y = 0;
        this.lastShotTime = 0;
        this.canCollect = false;
        this.fireRate = 500;
        this.damage = 10;
    }

    update(dt, gameTime, game) {
        this.angle += 0.02 * (dt / 16);
        this.x = 100 + Math.cos(this.angle) * this.radius;
        this.y = game.height / 2 + Math.sin(this.angle) * this.radius;
        const speedBoost = game.stats.mastery['drone_spd'] ? (1 + game.stats.mastery['drone_spd'] * 0.1) : 1;
        const overlord = game.challenges.dmTech['overlord'] ? 2 : 1;
        if (gameTime - this.lastShotTime > (this.fireRate / (speedBoost * overlord))) {
            const target = game.findTarget(this.x, this.y, 400);
            if (target) {
                const dmg = Math.max(1, Math.floor(game.currentDamage * 0.1));
                game.projectiles.push(new Projectile(this.x, this.y, target, dmg, 20, '#06b6d4', 1));
                game.sound.play('shoot');
                this.lastShotTime = gameTime;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-5, 5);
        ctx.lineTo(-5, -5);
        ctx.fill();
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
