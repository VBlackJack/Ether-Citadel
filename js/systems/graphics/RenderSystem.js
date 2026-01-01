/*
 * Copyright 2025 Julien Bombled
 * Render System - Handles all canvas drawing operations
 */

import { COLORS } from '../../constants/colors.js';
import { SKILL } from '../../constants/skillIds.js';

export class RenderSystem {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
        // Cache DOM elements to avoid querying them every frame
        this.fxContainer = document.getElementById('fx-container');
    }

    draw() {
        const ctx = this.game.ctx;
        const width = this.game.width;
        const height = this.game.height;

        // 1. Clear & Background
        // Use the body background color (dynamic based on tier) or fallback to constant
        ctx.fillStyle = document.body.style.backgroundColor || COLORS.BG_DARK;
        ctx.fillRect(0, 0, width, height);

        // 2. Sidebar Background
        ctx.fillStyle = COLORS.BG_SLATE;
        ctx.fillRect(0, 0, 120, height);

        // 3. Visual Effects (DOM based)
        this.handleDomEffects();

        // 4. Sidebar Separator (Laser Line)
        this.drawSidebarSeparator(ctx, height);

        // 5. Game Entities
        // Draw order matters: bottom to top
        this.game.turrets.forEach(t => t.draw(ctx));
        this.game.castle.draw(ctx, width, height);
        this.game.turretSlots.draw(ctx);

        if (this.game.drone) {
            this.game.drone.draw(ctx);
        }

        this.game.runes.forEach(r => r.draw(ctx));
        this.game.enemies.forEach(e => e.draw(ctx));
        this.game.projectiles.forEach(p => p.draw(ctx));
        this.game.particles.forEach(p => p.draw(ctx));
        this.game.floatingTexts.forEach(t => t.draw(ctx));

        // 6. System Overlays
        this.game.weather.draw(ctx);
        this.game.combo.draw(ctx);
        this.game.events.draw(ctx);
        this.game.synergies.draw(ctx);
        this.game.gameModes.draw(ctx);
        this.game.seasonalEvents.draw(ctx);
        this.game.campaign.draw(ctx);
        this.game.visualEffects.draw(ctx);
        this.game.bossMechanics.draw(ctx);
    }

    drawSidebarSeparator(ctx, height) {
        const tier = this.game.castle.tier;
        // Use tier-specific colors from constants
        let laserColor;
        if (tier === 1) {
            laserColor = COLORS.CASTLE_TIER_1;
        } else if (tier === 2) {
            laserColor = COLORS.CASTLE_TIER_2;
        } else {
            laserColor = COLORS.CASTLE_TIER_3;
        }

        ctx.shadowBlur = 15;
        ctx.shadowColor = laserColor;
        ctx.strokeStyle = laserColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(120, 0);
        ctx.lineTo(120, height);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    handleDomEffects() {
        if (!this.fxContainer) return;

        // Handle Blackhole visual
        if (this.game.skills.isActive(SKILL.BLACKHOLE)) {
            // Only update if not already present to avoid DOM thrashing
            if (!this.fxContainer.querySelector('.black-hole-visual')) {
                this.fxContainer.innerHTML = `<div class="absolute top-1/2 left-[70%] transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-purple-600 shadow-[0_0_50px_#9333ea] opacity-80 black-hole-visual bg-black"></div>`;
            }
        } else {
            // Clean up if no orbital laser is active
            if (!this.fxContainer.querySelector('.orbital-laser')) {
                this.fxContainer.innerHTML = '';
            }
        }
    }
}
