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

import { PASSIVES, getAllPassives, getPassiveById } from '../../data.js';
import { t } from '../../i18n.js';
import { formatNumber } from '../../config.js';

/**
 * Passive Manager - Handles Defender Idle 2 style passive upgrades
 * Passives are permanent upgrades bought with crystals
 */
export class PassiveManager {
    constructor(game) {
        this.game = game;
        this.levels = {};

        getAllPassives().forEach(p => {
            this.levels[p.id] = 0;
        });
    }

    /**
     * Get passive level
     */
    getLevel(id) {
        return this.levels[id] || 0;
    }

    /**
     * Get passive definition
     */
    getPassive(id) {
        return getPassiveById(id);
    }

    /**
     * Get passive effect value
     */
    getEffect(id) {
        const passive = this.getPassive(id);
        if (!passive) return 1;
        return passive.effect(this.getLevel(id));
    }

    /**
     * Calculate cost for next level
     */
    getCost(id) {
        const passive = this.getPassive(id);
        if (!passive) return Infinity;
        const level = this.getLevel(id);
        return Math.floor(passive.baseCost * Math.pow(passive.costMult, level));
    }

    /**
     * Check if player can afford passive
     */
    canAfford(id) {
        return this.game.crystals >= this.getCost(id);
    }

    /**
     * Check if passive is unlocked (meets requirements)
     */
    isUnlocked(id) {
        const passive = this.getPassive(id);
        if (!passive) return false;
        if (!passive.unlockReq) return true;

        const reqPassive = passive.unlockReq.passive;
        const reqLevel = passive.unlockReq.level;
        return this.getLevel(reqPassive) >= reqLevel;
    }

    /**
     * Get unlock requirement info
     */
    getUnlockReq(id) {
        const passive = this.getPassive(id);
        if (!passive?.unlockReq) return null;

        const reqPassive = this.getPassive(passive.unlockReq.passive);
        return {
            passiveId: passive.unlockReq.passive,
            passiveName: t(reqPassive?.nameKey) || passive.unlockReq.passive,
            level: passive.unlockReq.level,
            currentLevel: this.getLevel(passive.unlockReq.passive)
        };
    }

    /**
     * Check if passive is maxed
     */
    isMaxed(id) {
        const passive = this.getPassive(id);
        if (!passive) return true;
        return this.getLevel(id) >= passive.maxLevel;
    }

    /**
     * Buy passive upgrade
     */
    buy(id) {
        const passive = this.getPassive(id);
        if (!passive) return false;

        if (!this.isUnlocked(id)) return false;
        if (this.isMaxed(id)) return false;

        const cost = this.getCost(id);
        if (this.game.crystals < cost) return false;

        this.game.crystals -= cost;
        this.levels[id] = this.getLevel(id) + 1;
        this.game.updateCrystalsUI();
        this.game.sound?.play('upgrade');
        this.game.save();

        return true;
    }

    /**
     * Get passives by category
     */
    getPassivesByCategory(category) {
        return PASSIVES[category] || [];
    }

    /**
     * Get total levels invested
     */
    getTotalLevels() {
        return Object.values(this.levels).reduce((sum, lvl) => sum + lvl, 0);
    }

    /**
     * Refund all passives (returns crystals)
     */
    refundAll() {
        let totalRefund = 0;

        getAllPassives().forEach(p => {
            const level = this.getLevel(p.id);
            for (let i = 0; i < level; i++) {
                totalRefund += Math.floor(p.baseCost * Math.pow(p.costMult, i));
            }
            this.levels[p.id] = 0;
        });

        this.game.crystals += Math.floor(totalRefund * 0.8);
        this.game.updateCrystalsUI();
        this.game.sound?.play('sell');
        this.game.save();

        return totalRefund;
    }

    /**
     * Get save data
     */
    getSaveData() {
        return { ...this.levels };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;
        Object.assign(this.levels, data);
    }
}
