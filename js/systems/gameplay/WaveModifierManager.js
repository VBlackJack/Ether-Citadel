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
 * WaveModifierManager - Handles roguelike wave modifiers
 */

import { WAVE_MODIFIERS } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';

export class WaveModifierManager {
    constructor(game) {
        this.game = game;
        this.enabled = false;
        this.activeModifiers = [];
        this.pendingChoices = [];
        this.modifierHistory = [];
        this.totalRewardMult = 1.0;
    }

    /**
     * Enable roguelike mode
     */
    enable() {
        this.enabled = true;
        this.activeModifiers = [];
        this.modifierHistory = [];
        this.totalRewardMult = 1.0;
    }

    /**
     * Disable roguelike mode
     */
    disable() {
        this.enabled = false;
        this.clearModifiers();
    }

    /**
     * Generate modifier choices for next wave
     */
    generateChoices(count = 3) {
        if (!this.enabled) return [];

        const available = WAVE_MODIFIERS.filter(m =>
            !this.activeModifiers.some(active => active.id === m.id)
        );

        const shuffled = [...available].sort(() => Math.random() - 0.5);
        this.pendingChoices = shuffled.slice(0, count);

        return this.pendingChoices.map(m => ({
            ...m,
            name: t(m.nameKey),
            desc: t(m.descKey)
        }));
    }

    /**
     * Select a modifier
     */
    selectModifier(modifierId) {
        const modifier = this.pendingChoices.find(m => m.id === modifierId);
        if (!modifier) return false;

        this.activeModifiers.push(modifier);
        this.modifierHistory.push(modifierId);
        this.pendingChoices = [];

        // Update reward multiplier
        if (modifier.rewardMult) {
            this.totalRewardMult *= modifier.rewardMult;
        }

        // Apply immediate effects
        this.applyModifier(modifier);

        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${modifier.icon} ${t(modifier.nameKey)}`,
                '#fbbf24',
                28
            ));
        }

        this.game.sound?.play('select');
        return true;
    }

    /**
     * Skip modifier selection
     */
    skipSelection() {
        this.pendingChoices = [];
    }

    /**
     * Apply modifier effects
     */
    applyModifier(modifier) {
        if (!modifier.effect) return;

        const effect = modifier.effect;

        // Store in game modifiers object for stat calculations
        if (!this.game.waveModifiers) {
            this.game.waveModifiers = {};
        }

        for (const [key, value] of Object.entries(effect)) {
            this.game.waveModifiers[key] = (this.game.waveModifiers[key] || 0) + value;
        }
    }

    /**
     * Get enemy stat modifiers
     */
    getEnemyModifiers() {
        const mods = this.game.waveModifiers || {};
        return {
            hpMult: 1 + (mods.enemyHp || 0),
            speedMult: 1 + (mods.enemySpeed || 0),
            armorMult: 1 + (mods.enemyArmor || 0),
            sizeMult: 1 + (mods.enemySize || 0),
            countMult: 1 + (mods.enemyCount || 0),
            regenMult: mods.enemyRegen || 0,
            leechMult: mods.enemyLeech || 0
        };
    }

    /**
     * Get player stat modifiers
     */
    getPlayerModifiers() {
        const mods = this.game.waveModifiers || {};
        return {
            damageMult: 1 + (mods.damage || 0),
            healthMult: 1 + (mods.health || 0),
            fireRateMult: 1 + (mods.fireRate || 0),
            skillCooldownMult: 1 + (mods.skillCooldown || 0),
            limitedShots: mods.limitedShots || null
        };
    }

    /**
     * Get reward modifiers
     */
    getRewardModifiers() {
        const mods = this.game.waveModifiers || {};
        return {
            goldMult: mods.goldMult || 1,
            crystalMult: mods.crystalMult || 1,
            etherMult: mods.etherMult || 1,
            relicChanceBonus: mods.relicChance || 0,
            totalMult: this.totalRewardMult
        };
    }

    /**
     * Clear all modifiers
     */
    clearModifiers() {
        this.activeModifiers = [];
        this.totalRewardMult = 1.0;
        this.game.waveModifiers = {};
    }

    /**
     * Get active modifiers for UI
     */
    getActiveModifiers() {
        return this.activeModifiers.map(m => ({
            ...m,
            name: t(m.nameKey),
            desc: t(m.descKey)
        }));
    }

    /**
     * Check if there are pending choices
     */
    hasPendingChoices() {
        return this.pendingChoices.length > 0;
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            enabled: this.enabled,
            activeModifiers: this.activeModifiers.map(m => m.id),
            modifierHistory: [...this.modifierHistory],
            totalRewardMult: this.totalRewardMult
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;

        this.enabled = data.enabled || false;
        this.modifierHistory = data.modifierHistory || [];
        this.totalRewardMult = data.totalRewardMult || 1.0;

        // Restore active modifiers
        this.activeModifiers = [];
        this.game.waveModifiers = {};

        if (data.activeModifiers) {
            for (const modId of data.activeModifiers) {
                const modifier = WAVE_MODIFIERS.find(m => m.id === modId);
                if (modifier) {
                    this.activeModifiers.push(modifier);
                    this.applyModifier(modifier);
                }
            }
        }
    }
}
