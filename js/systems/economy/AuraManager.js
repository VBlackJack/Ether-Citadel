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
 * AuraManager - Handles aura placement and buff calculations
 */

import { AURA_TYPES } from '../../data.js';
import { MathUtils } from '../../config.js';

export class AuraManager {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
        this.placedAuras = [];
        this.maxAuras = 5;
    }

    /**
     * Get auras the player can afford
     * @returns {Array}
     */
    getAvailableAuras() {
        return AURA_TYPES.filter(a => this.game.crystals >= a.cost);
    }

    /**
     * Place an aura at a position
     * @param {string} auraId
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    placeAura(auraId, x, y) {
        if (this.placedAuras.length >= this.maxAuras) return false;

        const auraType = AURA_TYPES.find(a => a.id === auraId);
        if (!auraType) return false;
        if (this.game.crystals < auraType.cost) return false;

        this.game.crystals -= auraType.cost;
        this.placedAuras.push({
            id: auraId,
            x: x,
            y: y,
            type: auraType
        });

        this.game.updateCrystalsUI?.();
        this.game.save?.();
        return true;
    }

    /**
     * Remove an aura by index
     * @param {number} index
     */
    removeAura(index) {
        if (index >= 0 && index < this.placedAuras.length) {
            this.placedAuras.splice(index, 1);
            this.game.save?.();
        }
    }

    /**
     * Get combined aura buffs for a turret at position
     * @param {number} turretX
     * @param {number} turretY
     * @returns {object}
     */
    getAuraBuffsForTurret(turretX, turretY) {
        const buffs = { damage: 0, fireRate: 0, range: 0, crit: 0, regen: 0 };

        for (const aura of this.placedAuras) {
            const rangeSq = aura.type.range * aura.type.range;
            const distSq = MathUtils.distSq(turretX, turretY, aura.x, aura.y);
            if (distSq <= rangeSq) {
                buffs[aura.type.effect] = (buffs[aura.type.effect] || 0) + aura.type.baseValue;
            }
        }

        return buffs;
    }

    /**
     * Get number of placed auras
     * @returns {number}
     */
    getCount() {
        return this.placedAuras.length;
    }

    /**
     * Check if max auras reached
     * @returns {boolean}
     */
    isFull() {
        return this.placedAuras.length >= this.maxAuras;
    }

    /**
     * Get save data
     * @returns {Array}
     */
    getSaveData() {
        return this.placedAuras.map(a => ({ id: a.id, x: a.x, y: a.y }));
    }

    /**
     * Load save data
     * @param {Array} data
     */
    loadSaveData(data) {
        if (!data) return;
        this.placedAuras = data.map(a => {
            const auraType = AURA_TYPES.find(t => t.id === a.id);
            return { ...a, type: auraType };
        }).filter(a => a.type);
    }
}
