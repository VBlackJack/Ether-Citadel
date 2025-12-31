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
 * AwakeningManager - Handles awakening bonuses
 */

import { AWAKENING_BONUSES } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';

export class AwakeningManager {
    constructor(game) {
        this.game = game;
        this.isAwakened = false;
        this.awakeningLevel = 0;
        this.unlockedBonuses = [];
    }

    canAwaken() {
        return this.game.dreadLevel >= 6 && !this.isAwakened;
    }

    awaken() {
        if (!this.canAwaken()) return false;

        this.isAwakened = true;
        this.awakeningLevel = 1;
        AWAKENING_BONUSES.forEach(b => {
            this.unlockedBonuses.push(b.id);
        });

        this.game.floatingTexts.push(FloatingText.create(
            this.game.width / 2,
            this.game.height / 2,
            t('awakening.unlocked'),
            '#fbbf24',
            48
        ));
        this.game.sound.play('levelup');
        this.game.save();
        return true;
    }

    getBonus(bonusId) {
        if (!this.isAwakened) return null;
        const bonus = AWAKENING_BONUSES.find(b => b.id === bonusId);
        if (!bonus || !this.unlockedBonuses.includes(bonusId)) return null;
        return bonus.effect;
    }

    getWaveSkipBonus() {
        if (!this.isAwakened) return 0;
        const bonus = this.getBonus('wave_skip_100');
        return bonus?.waveSkip || 0;
    }

    getPrestigeMult() {
        if (!this.isAwakened) return 1;
        const bonus = this.getBonus('prestige_x2');
        return bonus?.prestigeMult || 1;
    }

    getProductionMult() {
        if (!this.isAwakened) return 1;
        const bonus = this.getBonus('production_x3');
        return bonus?.productionMult || 1;
    }

    getStartingGold() {
        if (!this.isAwakened) return 0;
        const bonus = this.getBonus('starting_gold');
        return bonus?.startGold || 0;
    }

    getSaveData() {
        return {
            isAwakened: this.isAwakened,
            awakeningLevel: this.awakeningLevel,
            unlockedBonuses: this.unlockedBonuses
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.isAwakened = data.isAwakened || false;
        this.awakeningLevel = data.awakeningLevel || 0;
        this.unlockedBonuses = data.unlockedBonuses || [];
    }
}