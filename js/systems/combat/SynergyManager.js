/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { TURRET_SYNERGIES } from '../../data.js';
import { t } from '../../i18n.js';

export class SynergyManager {
    constructor(game) {
        this.game = game;
        this.activeSynergies = [];
    }

    update() {
        this.activeSynergies = [];
        if (!this.game.turretSlots) return;

        const placedTurrets = this.game.turretSlots.slots
            .filter(s => s.turret)
            .map(s => s.turret.type);

        for (const synergy of TURRET_SYNERGIES) {
            if (synergy.requires.every(req => placedTurrets.includes(req))) {
                this.activeSynergies.push(synergy);
            }
        }
    }

    getTotalBonus() {
        const bonus = {};
        for (const synergy of this.activeSynergies) {
            for (const [key, value] of Object.entries(synergy.bonus)) {
                bonus[key] = (bonus[key] || 0) + value;
            }
        }
        return bonus;
    }

    draw(ctx) {
        if (this.activeSynergies.length === 0) return;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(10, this.game.height - 60, 200, 50);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(t('synergy.active'), 15, this.game.height - 45);
        ctx.font = '11px Arial';
        this.activeSynergies.forEach((syn, i) => {
            ctx.fillStyle = syn.color;
            ctx.fillText(`${t(syn.nameKey)}`, 15, this.game.height - 30 + i * 12);
        });
        ctx.restore();
    }

    getActiveSynergies() {
        return this.activeSynergies;
    }

    getSaveData() { return { active: this.activeSynergies.map(s => s.id) }; }
    loadSaveData(data) { }
}