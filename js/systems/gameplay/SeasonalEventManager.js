/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { SEASONAL_EVENTS } from '../../data.js';
import { t } from '../../i18n.js';

export class SeasonalEventManager {
    constructor(game) {
        this.game = game;
        this.activeEvent = null;
        this.collectedRelics = [];
    }

    update() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();

        this.activeEvent = null;
        for (const event of SEASONAL_EVENTS) {
            if (this.isEventActive(event, month, day)) {
                this.activeEvent = event;
                break;
            }
        }
    }

    isEventActive(event, month, day) {
        if (event.startMonth <= event.endMonth) {
            return (month > event.startMonth || (month === event.startMonth && day >= event.startDay)) &&
                   (month < event.endMonth || (month === event.endMonth && day <= event.endDay));
        } else {
            return (month > event.startMonth || (month === event.startMonth && day >= event.startDay)) ||
                   (month < event.endMonth || (month === event.endMonth && day <= event.endDay));
        }
    }

    getBonuses() {
        return this.activeEvent?.bonuses || {};
    }

    getSpecialEnemy() {
        return this.activeEvent?.specialEnemy || null;
    }

    canDropExclusiveRelic() {
        if (!this.activeEvent?.exclusiveRelic) return false;
        return !this.collectedRelics.includes(this.activeEvent.exclusiveRelic.id);
    }

    collectExclusiveRelic() {
        if (!this.canDropExclusiveRelic()) return null;
        const relic = this.activeEvent.exclusiveRelic;
        this.collectedRelics.push(relic.id);
        return relic;
    }

    draw(ctx) {
        if (!this.activeEvent) return;
        ctx.save();
        ctx.fillStyle = this.activeEvent.theme.accentColor;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.activeEvent.icon} ${t(this.activeEvent.nameKey)}`, this.game.width / 2, 25);
        ctx.restore();
    }

    getActiveEvent() {
        return this.activeEvent;
    }

    getSaveData() { return { collected: this.collectedRelics }; }
    loadSaveData(data) { if (data) this.collectedRelics = data.collected || []; }
}