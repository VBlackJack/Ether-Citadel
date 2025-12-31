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

/**
 * AscensionManager - Handles ascension perks
 */

import { ASCENSION_PERKS } from '../../data.js';
import { t } from '../../i18n.js';

export class AscensionManager {
    constructor(game) {
        this.game = game;
        this.ascensionPoints = 0;
        this.totalAscensions = 0;
        this.purchasedPerks = {};
    }

    canAscend() {
        return this.game.ether >= 1000;
    }

    getAscensionGain() {
        return Math.floor(Math.sqrt(this.game.ether / 100));
    }

    doAscend() {
        if (!this.canAscend()) return false;
        const gain = this.getAscensionGain();
        this.ascensionPoints += gain;
        this.totalAscensions++;
        this.game.statistics?.increment('totalAscensions');
        // Full reset including prestige
        this.game.ether = 0;
        this.game.prestige?.fullReset();
        this.game.restart();
        this.game.save();
        return true;
    }

    canPurchasePerk(perkId) {
        const perk = ASCENSION_PERKS.find(p => p.id === perkId);
        if (!perk) return false;
        if (this.purchasedPerks[perkId]) return false;
        return this.ascensionPoints >= perk.cost;
    }

    purchasePerk(perkId) {
        if (!this.canPurchasePerk(perkId)) return false;
        const perk = ASCENSION_PERKS.find(p => p.id === perkId);
        this.ascensionPoints -= perk.cost;
        this.purchasedPerks[perkId] = true;
        this.game.save();
        return true;
    }

    hasPerk(perkId) {
        return !!this.purchasedPerks[perkId];
    }

    getTotalEffects() {
        const effects = {};
        for (const perk of ASCENSION_PERKS) {
            if (this.purchasedPerks[perk.id]) {
                for (const [key, value] of Object.entries(perk.effect)) {
                    effects[key] = (effects[key] || 0) + value;
                }
            }
        }
        return effects;
    }

    getSaveData() {
        return {
            points: this.ascensionPoints,
            total: this.totalAscensions,
            perks: this.purchasedPerks
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.ascensionPoints = data.points || 0;
        this.totalAscensions = data.total || 0;
        this.purchasedPerks = data.perks || {};
    }
}