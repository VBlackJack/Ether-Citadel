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
 * ProductionManager - Handles passive resource generation buildings
 * Buildings produce resources over time, even while offline
 */

import { PRODUCTION_BUILDINGS } from '../../data.js';
import { CONFIG, BigNumService } from '../../config.js';

export class ProductionManager {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
        this.buildings = {};

        PRODUCTION_BUILDINGS.forEach(b => {
            this.buildings[b.id] = { level: 0, accumulated: 0 };
        });

        this.lastUpdate = Date.now();
    }

    /**
     * Get upgrade cost for a building
     * @param {string} buildingId
     * @returns {Decimal}
     */
    getBuildingCost(buildingId) {
        const building = PRODUCTION_BUILDINGS.find(b => b.id === buildingId);
        if (!building) return BigNumService.create(Infinity);
        const level = this.buildings[buildingId]?.level || 0;
        return BigNumService.floor(
            BigNumService.mul(building.baseCost, BigNumService.pow(building.costMult, level))
        );
    }

    /**
     * Check if player can afford building upgrade
     * @param {string} buildingId
     * @returns {boolean}
     */
    canAfford(buildingId) {
        const cost = this.getBuildingCost(buildingId);
        return BigNumService.gte(this.game.gold, cost);
    }

    /**
     * Upgrade a building
     * @param {string} buildingId
     * @returns {boolean} Success
     */
    upgrade(buildingId) {
        const building = PRODUCTION_BUILDINGS.find(b => b.id === buildingId);
        if (!building) return false;

        const data = this.buildings[buildingId];
        if (data.level >= building.maxLevel) return false;

        const cost = this.getBuildingCost(buildingId);
        if (!BigNumService.gte(this.game.gold, cost)) return false;

        this.game.gold = BigNumService.sub(this.game.gold, cost);
        data.level++;
        this.game.save();
        return true;
    }

    /**
     * Get production rate for a building
     * @param {string} buildingId
     * @returns {Decimal} Resources per second
     */
    getProductionRate(buildingId) {
        const building = PRODUCTION_BUILDINGS.find(b => b.id === buildingId);
        if (!building) return BigNumService.create(0);

        const level = this.buildings[buildingId]?.level || 0;
        if (level === 0) return BigNumService.create(0);

        const prestigeMult = this.game.prestige?.getEffectValue?.('prestige_production') || 1;
        return BigNumService.mul(building.baseRate * level, prestigeMult);
    }

    /**
     * Get total production for all buildings of a resource type
     * @param {string} resourceType
     * @returns {Decimal}
     */
    getTotalProductionRate(resourceType) {
        let total = BigNumService.create(0);
        PRODUCTION_BUILDINGS.forEach(building => {
            if (building.resource === resourceType) {
                total = BigNumService.add(total, this.getProductionRate(building.id));
            }
        });
        return total;
    }

    /**
     * Update production - called each game tick
     */
    update() {
        const now = Date.now();
        const elapsed = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;

        PRODUCTION_BUILDINGS.forEach(building => {
            const rate = this.getProductionRate(building.id);
            if (BigNumService.lte(rate, 0)) return;

            const data = this.buildings[building.id];
            // Accumulate production (rate is BigNum, elapsed is number)
            const produced = BigNumService.mul(rate, elapsed);
            data.accumulated = BigNumService.add(
                BigNumService.create(data.accumulated || 0),
                produced
            );

            // Extract whole units to add
            const whole = BigNumService.floor(data.accumulated);
            if (BigNumService.isPositive(whole)) {
                data.accumulated = BigNumService.sub(data.accumulated, whole);
                this.addResource(building.resource, whole);
            }
        });
    }

    /**
     * Add resource to game state
     * @param {string} resourceType
     * @param {Decimal} amount
     */
    addResource(resourceType, amount) {
        switch (resourceType) {
            case 'gold':
                this.game.gold = BigNumService.add(this.game.gold, amount);
                break;
            case 'crystal':
                this.game.miningResources.crystal = (this.game.miningResources.crystal || 0) + BigNumService.toNumber(amount);
                break;
            case 'ether':
                this.game.ether = BigNumService.add(this.game.ether, amount);
                break;
            case 'void_shard':
                this.game.miningResources.void_shard = (this.game.miningResources.void_shard || 0) + BigNumService.toNumber(amount);
                break;
        }
    }

    /**
     * Calculate offline earnings
     * @param {number} offlineSeconds - Seconds player was offline
     * @returns {object} Earnings by resource type (as BigNums)
     */
    calculateOfflineEarnings(offlineSeconds) {
        const earnings = {};
        const cappedSeconds = Math.min(offlineSeconds, CONFIG.maxOfflineHours * 3600);
        const offlineEfficiency = CONFIG.offlineEarningsMultiplier;

        PRODUCTION_BUILDINGS.forEach(building => {
            const rate = this.getProductionRate(building.id);
            if (BigNumService.isPositive(rate)) {
                const earned = BigNumService.floor(
                    BigNumService.mul(BigNumService.mul(rate, cappedSeconds), offlineEfficiency)
                );
                if (BigNumService.isPositive(earned)) {
                    earnings[building.resource] = BigNumService.add(
                        earnings[building.resource] || BigNumService.create(0),
                        earned
                    );
                }
            }
        });

        return earnings;
    }

    /**
     * Apply offline earnings
     * @param {object} earnings - Object with BigNum values
     */
    applyOfflineEarnings(earnings) {
        for (const [resource, amount] of Object.entries(earnings)) {
            this.addResource(resource, amount);
        }
    }

    /**
     * Get save data
     * @returns {object}
     */
    getSaveData() {
        return this.buildings;
    }

    /**
     * Load save data
     * @param {object} data
     */
    loadSaveData(data) {
        if (!data) return;
        for (const [id, buildingData] of Object.entries(data)) {
            if (this.buildings[id]) {
                this.buildings[id] = buildingData;
            }
        }
    }
}
