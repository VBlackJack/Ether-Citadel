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
 * TownManager - Handles town progression and unlocks
 */

import { TOWN_LEVELS } from '../../data.js';
import { t } from '../../i18n.js';

export class TownManager {
    constructor(game) {
        this.game = game;
        this.level = 1;
        this.xp = 0;
        this.unlockedFeatures = ['basic'];
    }

    getCurrentLevel() {
        return TOWN_LEVELS.find(t => t.level === this.level) || TOWN_LEVELS[0];
    }

    getNextLevel() {
        return TOWN_LEVELS.find(t => t.level === this.level + 1);
    }

    addXP(amount) {
        this.xp += amount;
        this.checkLevelUp();
    }

    checkLevelUp() {
        const next = this.getNextLevel();
        if (next && this.xp >= next.xpRequired) {
            this.level++;
            next.unlocks.forEach(u => {
                if (!this.unlockedFeatures.includes(u)) {
                    this.unlockedFeatures.push(u);
                }
            });
            this.game.floatingTexts.push(this.game.createFloatingText(
                this.game.width / 2,
                this.game.height / 2,
                `${t('town.levelUp')} ${this.level}!`,
                '#fbbf24',
                36
            ));
            this.game.sound.play('levelup');
            this.checkLevelUp();
        }
    }

    hasUnlock(feature) {
        return this.unlockedFeatures.includes(feature);
    }

    getXPProgress() {
        const next = this.getNextLevel();
        if (!next) return 100;
        const current = this.getCurrentLevel();
        const needed = next.xpRequired - current.xpRequired;
        const progress = this.xp - current.xpRequired;
        return Math.min(100, (progress / needed) * 100);
    }

    getSaveData() {
        return {
            level: this.level,
            xp: this.xp,
            unlockedFeatures: this.unlockedFeatures
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.level = data.level || 1;
        this.xp = data.xp || 0;
        this.unlockedFeatures = data.unlockedFeatures || ['basic'];
    }
}