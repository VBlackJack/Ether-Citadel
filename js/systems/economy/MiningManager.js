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

import { MINING_RESOURCES } from '../../data.js';
import { BigNumService } from '../../config.js';

/**
 * Mining Manager - Handles resource mining operations
 */
export class MiningManager {
    constructor(game) {
        this.game = game;
        this.activeMiners = [];
        this.maxMiners = 3;
    }

    startMining(resourceId) {
        if (this.activeMiners.length >= this.maxMiners) return false;
        if (this.activeMiners.some(m => m.resourceId === resourceId)) return false;

        const resource = MINING_RESOURCES.find(r => r.id === resourceId);
        if (!resource) return false;

        const baseDuration = 60000 / resource.baseRate;
        // Safely convert potential BigNum values to numbers for speed calculation
        const researchSpeed = BigNumService.toNumber(this.game.researchEffects?.miningSpeed || 0);
        const relicMining = BigNumService.toNumber(this.game.relicMults?.mining || 0);
        const speedMult = 1 + researchSpeed + relicMining;

        this.activeMiners.push({
            resourceId,
            startTime: Date.now(),
            duration: baseDuration / speedMult
        });
        this.game.renderMiningUI();
        return true;
    }

    stopMining(resourceId) {
        const idx = this.activeMiners.findIndex(m => m.resourceId === resourceId);
        if (idx !== -1) {
            this.activeMiners.splice(idx, 1);
            this.game.renderMiningUI();
        }
    }

    update() {
        const now = Date.now();
        const completed = [];

        for (const miner of this.activeMiners) {
            if (now - miner.startTime >= miner.duration) {
                completed.push(miner);
            }
        }

        for (const miner of completed) {
            const resource = MINING_RESOURCES.find(r => r.id === miner.resourceId);
            const relicBonus = 1 + BigNumService.toNumber(this.game.relicMults?.mining || 0);
            const amount = BigNumService.create(Math.max(1, Math.floor(1 * relicBonus)));

            const currentAmount = this.game.miningResources[miner.resourceId] || BigNumService.create(0);
            this.game.miningResources[miner.resourceId] = BigNumService.add(
                BigNumService.create(currentAmount),
                amount
            );

            const idx = this.activeMiners.indexOf(miner);
            if (idx !== -1) {
                this.activeMiners[idx].startTime = now;
            }
        }

        if (completed.length > 0) {
            this.game.renderMiningUI();
            this.game.save();
        }
    }

    getProgress(resourceId) {
        const miner = this.activeMiners.find(m => m.resourceId === resourceId);
        if (!miner) return 0;
        const elapsed = Date.now() - miner.startTime;
        return Math.min(1, elapsed / miner.duration);
    }

    isMining(resourceId) {
        return this.activeMiners.some(m => m.resourceId === resourceId);
    }

    getSaveData() {
        return this.activeMiners.map(m => ({
            resourceId: m.resourceId,
            elapsed: Date.now() - m.startTime,
            duration: m.duration
        }));
    }

    loadSaveData(data) {
        if (!data) return;
        const now = Date.now();
        this.activeMiners = data.map(m => ({
            resourceId: m.resourceId,
            startTime: now - (m.elapsed || 0),
            duration: m.duration
        }));
    }
}
