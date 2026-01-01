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
 * SchoolManager - Handles turret upgrades and training
 */

import { SCHOOL_TURRETS } from '../../data.js';
import { BigNumService } from '../../config.js';

export class SchoolManager {
    constructor(game) {
        this.game = game;
        this.turrets = {};
        SCHOOL_TURRETS.forEach(t => {
            this.turrets[t.id] = { unlocked: t.unlockCost === 0, level: t.unlockCost === 0 ? 1 : 0 };
        });
    }

    isUnlocked(turretId) {
        return this.turrets[turretId]?.unlocked || false;
    }

    getLevel(turretId) {
        return this.turrets[turretId]?.level || 0;
    }

    getUnlockCost(turretId) {
        const turret = SCHOOL_TURRETS.find(t => t.id === turretId);
        return turret?.unlockCost || 0;
    }

    getLevelUpCost(turretId) {
        const turret = SCHOOL_TURRETS.find(t => t.id === turretId);
        const level = this.getLevel(turretId);
        return BigNumService.floor(
            BigNumService.mul(turret.levelCost, BigNumService.pow(1.5, level))
        );
    }

    unlock(turretId) {
        const cost = BigNumService.create(this.getUnlockCost(turretId));
        const crystals = this.game.crystals || BigNumService.create(0);
        if (!BigNumService.gte(crystals, cost)) return false;
        if (this.isUnlocked(turretId)) return false;

        this.game.crystals = BigNumService.sub(this.game.crystals, cost);
        this.turrets[turretId] = { unlocked: true, level: 1 };
        this.game.updateCrystalsUI();
        this.game.save();
        return true;
    }

    levelUp(turretId) {
        if (!this.isUnlocked(turretId)) return false;
        const turret = SCHOOL_TURRETS.find(t => t.id === turretId);
        const level = this.getLevel(turretId);
        if (level >= turret.maxLevel) return false;

        const cost = this.getLevelUpCost(turretId);
        const crystals = this.game.crystals || BigNumService.create(0);
        if (!BigNumService.gte(crystals, cost)) return false;

        this.game.crystals = BigNumService.sub(this.game.crystals, cost);
        this.turrets[turretId].level++;
        this.game.updateCrystalsUI();
        this.game.save();
        return true;
    }

    getTurretStats(turretId) {
        const turret = SCHOOL_TURRETS.find(t => t.id === turretId);
        const level = this.getLevel(turretId);
        if (!turret || level === 0) return null;

        return {
            damage: turret.stats.damage * (1 + level * 0.1),
            speed: turret.stats.speed * (1 + level * 0.05),
            range: turret.stats.range * (1 + level * 0.05),
            aoe: turret.stats.aoe ? turret.stats.aoe * (1 + level * 0.1) : 0,
            slow: turret.stats.slow || 0,
            dot: turret.stats.dot || false
        };
    }

    getSaveData() {
        return { turrets: this.turrets };
    }

    loadSaveData(data) {
        if (!data) return;
        this.turrets = data.turrets || {};
        SCHOOL_TURRETS.forEach(t => {
            if (!this.turrets[t.id]) {
                this.turrets[t.id] = { unlocked: t.unlockCost === 0, level: t.unlockCost === 0 ? 1 : 0 };
            }
        });
    }
}