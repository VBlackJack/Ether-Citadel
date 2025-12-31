/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { RUNE_TYPES } from '../data.js';
import { MathUtils } from '../config.js';

export class Rune {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = RUNE_TYPES[Math.floor(Math.random() * RUNE_TYPES.length)];
        this.life = 10000;
        this.scale = 1;
        this.scaleDir = 1;
    }

    update(dt) {
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