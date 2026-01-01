/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { VISUAL_EFFECTS } from '../../data.js';

export class VisualEffectsManager {
    constructor(game) {
        this.game = game;
        this.particles = [];
        this.screenShake = { x: 0, y: 0, duration: 0 };
        this.trails = [];
    }

    addParticle(x, y, type) {
        const config = VISUAL_EFFECTS.particles[type];
        if (!config) return;
        for (let i = 0; i < config.count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * config.speed * 2,
                vy: (Math.random() - 0.5) * config.speed * 2,
                life: config.life,
                maxLife: config.life,
                size: config.size,
                color: config.color || '#fff',
                icon: config.icon
            });
        }
    }

    triggerScreenShake(intensity = 5) {
        this.screenShake.duration = VISUAL_EFFECTS.screenShake.duration;
        this.screenShake.intensity = intensity;
    }

    addTrail(x, y, color) {
        this.trails.push({ x, y, color, life: 10 });
        if (this.trails.length > 50) this.trails.shift();
    }

    update(dt) {
        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx * (dt / 16);
            p.y += p.vy * (dt / 16);
            p.vy += 0.1;
            p.life -= dt;
            return p.life > 0;
        });

        // Update screen shake
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= dt;
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
        }

        // Update trails
        this.trails = this.trails.filter(t => {
            t.life -= dt / 16;
            return t.life > 0;
        });
    }

    draw(ctx) {
        // Draw trails
        for (const trail of this.trails) {
            ctx.save();
            ctx.globalAlpha = trail.life / 10;
            ctx.fillStyle = trail.color;
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Draw particles
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.life / p.maxLife;
            if (p.icon) {
                ctx.font = `${p.size}px Arial`;
                ctx.fillText(p.icon, p.x, p.y);
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    getShakeOffset() {
        return { x: this.screenShake.x, y: this.screenShake.y };
    }

    // Visual effects are transient - no persistence needed
    getSaveData() { return {}; }
    loadSaveData() { }
}