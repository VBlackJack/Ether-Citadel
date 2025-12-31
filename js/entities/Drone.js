/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { MathUtils } from '../config.js';

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

    update(dt, gameTime) {
        this.angle += 0.02 * (dt / 16);
        this.x = 100 + Math.cos(this.angle) * this.radius;
        this.y = game.height / 2 + Math.sin(this.angle) * this.radius;
        const speedBoost = game.stats.mastery['drone_spd'] ? (1 + game.stats.mastery['drone_spd'] * 0.1) : 1;
        const overlord = game.challenges.dmTech['overlord'] ? 2 : 1;
        if (gameTime - this.lastShotTime > (this.fireRate / (speedBoost * overlord))) {
            const target = game.findTarget(this.x, this.y, 400);
            if (target) {
                const dmg = Math.max(1, Math.floor(game.currentDamage * 0.1));
                game.projectiles.push(Projectile.create(this.x, this.y, target, dmg, 20, '#06b6d4', 1, false, false, false, {}, {}));
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