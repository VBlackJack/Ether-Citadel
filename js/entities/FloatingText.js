/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
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