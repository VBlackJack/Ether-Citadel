/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { COMBO_TIERS } from '../../data.js';
import { t } from '../../i18n.js';

export class ComboManager {
    constructor(game) {
        this.game = game;
        this.hits = 0;
        this.timer = 0;
        this.maxCombo = 0;
        this.currentTier = null;
    }

    addHit() {
        this.hits++;
        this.timer = 2;
        if (this.hits > this.maxCombo) this.maxCombo = this.hits;
        this.updateTier();
    }

    updateTier() {
        this.currentTier = null;
        for (let i = COMBO_TIERS.length - 1; i >= 0; i--) {
            if (this.hits >= COMBO_TIERS[i].hits) {
                this.currentTier = COMBO_TIERS[i];
                break;
            }
        }
    }

    update(dt) {
        if (this.timer > 0) {
            this.timer -= dt / 1000;
            if (this.timer <= 0) {
                this.hits = 0;
                this.currentTier = null;
            }
        }
    }

    getMultiplier() {
        return this.currentTier ? this.currentTier.mult : 1;
    }

    draw(ctx) {
        if (!this.currentTier || this.hits < 5) return;
        const centerX = this.game.width / 2;
        ctx.save();
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.currentTier.color;
        ctx.shadowColor = this.currentTier.color;
        ctx.shadowBlur = 10;
        ctx.fillText(`${this.hits} ${t(this.currentTier.nameKey)}`, centerX, 80);
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText(`x${this.currentTier.mult.toFixed(1)}`, centerX, 100);
        ctx.restore();
    }

    getSaveData() {
        return { maxCombo: this.maxCombo };
    }

    loadSaveData(data) {
        if (data) this.maxCombo = data.maxCombo || 0;
    }
}