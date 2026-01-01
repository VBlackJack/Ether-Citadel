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
 * AscensionManager - Handles ascension perks with BigNum support
 * Ascension is the "prestige of prestige" layer
 */

import { ASCENSION_PERKS } from '../../data.js';
import { t } from '../../i18n.js';
import { BigNumService } from '../../config.js';

export class AscensionManager {
    constructor(game) {
        this.game = game;
        this.ascensionPoints = BigNumService.create(0);
        this.totalAscensions = 0;
        this.perkLevels = {};

        // Initialize perk levels
        ASCENSION_PERKS.forEach(perk => {
            this.perkLevels[perk.id] = 0;
        });
    }

    /**
     * Check if player can ascend (requires 1000 ether)
     */
    canAscend() {
        const ether = this.game.ether || BigNumService.create(0);
        return BigNumService.gte(ether, 1000);
    }

    /**
     * Calculate ascension points gain from current ether
     * Formula: floor(sqrt(ether / 100))
     */
    getAscensionGain() {
        const ether = this.game.ether || BigNumService.create(0);
        return BigNumService.floor(BigNumService.sqrt(BigNumService.div(ether, 100)));
    }

    /**
     * Perform ascension - reset ether, gain AP
     */
    doAscend() {
        if (!this.canAscend()) return false;

        const gain = this.getAscensionGain();
        this.ascensionPoints = BigNumService.add(this.ascensionPoints, gain);
        this.totalAscensions++;
        this.game.statistics?.increment('totalAscensions');

        // Full reset including prestige
        this.game.ether = BigNumService.create(0);
        this.game.prestige?.fullReset();
        this.game.restart();
        this.game.save();

        return true;
    }

    /**
     * Get perk definition by ID
     */
    getPerk(perkId) {
        return ASCENSION_PERKS.find(p => p.id === perkId);
    }

    /**
     * Get current level of a perk
     */
    getPerkLevel(perkId) {
        return this.perkLevels[perkId] || 0;
    }

    /**
     * Calculate cost for next level of a perk
     * Formula: costBase * (costFactor ^ currentLevel)
     */
    getPerkCost(perkId) {
        const perk = this.getPerk(perkId);
        if (!perk) return BigNumService.create(Infinity);

        const level = this.getPerkLevel(perkId);
        const base = BigNumService.create(perk.costBase);
        const factor = BigNumService.create(perk.costFactor);

        return BigNumService.floor(BigNumService.mul(base, BigNumService.pow(factor, level)));
    }

    /**
     * Check if perk requirement is met
     */
    meetsRequirement(perkId) {
        const perk = this.getPerk(perkId);
        if (!perk) return false;
        if (!perk.req) return true;

        return this.getPerkLevel(perk.req) >= 1;
    }

    /**
     * Check if perk is at max level (0 = infinite)
     */
    isMaxed(perkId) {
        const perk = this.getPerk(perkId);
        if (!perk) return true;
        if (perk.maxLevel === 0) return false; // Infinite

        return this.getPerkLevel(perkId) >= perk.maxLevel;
    }

    /**
     * Check if player can afford a perk
     */
    canAfford(perkId) {
        if (!this.meetsRequirement(perkId)) return false;
        if (this.isMaxed(perkId)) return false;

        const cost = this.getPerkCost(perkId);
        return BigNumService.gte(this.ascensionPoints, cost);
    }

    /**
     * Purchase a perk level
     */
    purchasePerk(perkId) {
        if (!this.canAfford(perkId)) return false;

        const cost = this.getPerkCost(perkId);
        this.ascensionPoints = BigNumService.sub(this.ascensionPoints, cost);
        this.perkLevels[perkId] = (this.perkLevels[perkId] || 0) + 1;

        this.game.sound?.play('upgrade');
        this.game.save();

        return true;
    }

    /**
     * Get total effect value for a perk
     * Formula: level * effectBase
     */
    getPerkEffect(perkId) {
        const perk = this.getPerk(perkId);
        if (!perk) return 0;

        const level = this.getPerkLevel(perkId);
        return level * perk.effectBase;
    }

    /**
     * Get all active effects as an object
     */
    getTotalEffects() {
        const effects = {
            damage: 0,
            miningSpeed: 0,
            etherGain: 0,
            startWave: 0
        };

        effects.damage = this.getPerkEffect('ap_starter_damage');
        effects.miningSpeed = this.getPerkEffect('ap_mining_speed');
        effects.etherGain = this.getPerkEffect('ap_ether_boost');
        effects.startWave = Math.floor(this.getPerkEffect('ap_start_wave'));

        return effects;
    }

    /**
     * Check if player has at least 1 level in a perk
     */
    hasPerk(perkId) {
        return this.getPerkLevel(perkId) >= 1;
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            points: BigNumService.serialize(this.ascensionPoints),
            total: this.totalAscensions,
            levels: { ...this.perkLevels }
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;

        this.ascensionPoints = BigNumService.deserialize(data.points) || BigNumService.create(0);
        this.totalAscensions = data.total || 0;

        // Load perk levels
        if (data.levels) {
            Object.assign(this.perkLevels, data.levels);
        }

        // Legacy support: convert old purchasedPerks to levels
        if (data.perks && !data.levels) {
            for (const [perkId, purchased] of Object.entries(data.perks)) {
                if (purchased) {
                    this.perkLevels[perkId] = 1;
                }
            }
        }

        // Legacy support: convert old number points to BigNum
        if (typeof data.points === 'number') {
            this.ascensionPoints = BigNumService.create(data.points);
        }
    }
}
