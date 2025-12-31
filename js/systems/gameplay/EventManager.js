/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { RANDOM_EVENTS } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';

export class EventManager {
    constructor(game) {
        this.game = game;
        this.activeEvent = null;
        this.eventTimer = 0;
        this.nextEventIn = 60000 + Math.random() * 60000;
    }

    update(dt) {
        if (this.activeEvent) {
            this.eventTimer -= dt;
            if (this.eventTimer <= 0) {
                this.activeEvent = null;
            }
        } else {
            this.nextEventIn -= dt;
            if (this.nextEventIn <= 0) {
                this.triggerRandomEvent();
                this.nextEventIn = 90000 + Math.random() * 90000;
            }
        }
    }

    triggerRandomEvent() {
        const totalWeight = RANDOM_EVENTS.reduce((sum, e) => sum + e.weight, 0);
        let random = Math.random() * totalWeight;
        for (const event of RANDOM_EVENTS) {
            random -= event.weight;
            if (random <= 0) {
                this.activeEvent = event;
                this.eventTimer = event.duration;
                const color = event.negative ? '#ef4444' : '#22c55e';
                this.game.floatingTexts.push(FloatingText.create(
                    this.game.width / 2,
                    this.game.height / 2 - 100,
                    `${event.icon} ${t(event.nameKey)}!`,
                    color,
                    36
                ));
                break;
            }
        }
    }

    getEffects() {
        if (!this.activeEvent) return {};
        return this.activeEvent.effects || {};
    }

    draw(ctx) {
        if (!this.activeEvent) return;
        ctx.save();
        ctx.fillStyle = this.activeEvent.negative ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 197, 94, 0.8)';
        ctx.fillRect(this.game.width / 2 - 100, 10, 200, 30);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.activeEvent.icon} ${t(this.activeEvent.nameKey)} (${Math.ceil(this.eventTimer / 1000)}s)`, this.game.width / 2, 30);
        ctx.restore();
    }

    getSaveData() {
        return { nextEventIn: this.nextEventIn };
    }

    loadSaveData(data) {
        if (data) this.nextEventIn = data.nextEventIn || 60000;
    }
}