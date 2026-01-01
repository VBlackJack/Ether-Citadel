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
 * PrestigeManager - Handles prestige/rebirth mechanics and prestige upgrades
 * Includes auto-prestige functionality
 */

import { PRESTIGE_UPGRADES } from '../../data.js';
import { t } from '../../i18n.js';
import { formatNumber } from '../../config.js';
import { FloatingText } from '../../entities/FloatingText.js';
import { PRESTIGE_RESET_UPGRADES } from '../../constants/skillIds.js';
import { COLORS } from '../../constants/colors.js';

export class PrestigeManager {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
        this.prestigePoints = 0;
        this.totalPrestiges = 0;
        this.upgrades = {};

        // Auto-prestige settings
        this.autoPrestige = false;
        this.autoPrestigeWave = 30;

        PRESTIGE_UPGRADES.forEach(u => {
            this.upgrades[u.id] = 0;
        });
    }

    /**
     * Calculate prestige points based on current run
     * Improved formula for better progression curve
     * @returns {number}
     */
    calculatePrestigePoints() {
        const baseWave = this.game.stats?.maxWave || 0;
        const dreadMult = 1 + ((this.game.dreadLevel || 0) * 0.5);
        const prestigeCountBonus = 1 + (this.totalPrestiges * 0.08);
        // Improved formula: (wave/8)^1.6 gives ~50% more PP than before
        return Math.floor(Math.pow(baseWave / 8, 1.6) * dreadMult * prestigeCountBonus);
    }

    /**
     * Calculate prestige points for a given wave (for projection)
     * @param {number} wave
     * @param {number} dreadLevel
     * @returns {number}
     */
    calculatePointsAtWave(wave, dreadLevel = this.game.dreadLevel) {
        const dreadMult = 1 + ((dreadLevel || 0) * 0.5);
        const prestigeCountBonus = 1 + (this.totalPrestiges * 0.08);
        return Math.floor(Math.pow(wave / 8, 1.6) * dreadMult * prestigeCountBonus);
    }

    /**
     * Get prestige calculator projections
     * @returns {object}
     */
    getPrestigeProjections() {
        const currentWave = this.game.stats?.maxWave || this.game.wave;
        const currentPoints = this.calculatePrestigePoints();
        const projections = [];

        // Project points at various wave milestones
        const milestones = [50, 75, 100, 150, 200, 300, 500];
        for (const wave of milestones) {
            if (wave > currentWave) {
                const points = this.calculatePointsAtWave(wave);
                const gain = points - currentPoints;
                projections.push({
                    wave,
                    points,
                    gain,
                    efficiency: (gain / (wave - currentWave)).toFixed(2)
                });
            }
        }

        return {
            current: {
                wave: currentWave,
                points: currentPoints,
                dreadLevel: this.game.dreadLevel || 0
            },
            projections,
            nextMilestone: projections[0] || null
        };
    }

    /**
     * Check if prestige is available
     * @returns {boolean}
     */
    canPrestige() {
        return (this.game.stats?.maxWave || this.game.wave) >= 25;
    }

    /**
     * Get wave skip amount based on total prestiges
     * @returns {number}
     */
    getWaveSkipAmount() {
        if (this.totalPrestiges < 3) return 0;
        let baseSkip = Math.min(50, Math.floor(this.totalPrestiges * 2));
        const awakeningBonus = this.game.awakening?.getWaveSkipBonus?.() || 0;
        return baseSkip + awakeningBonus;
    }

    /**
     * Check and trigger auto-prestige if conditions are met
     */
    checkAutoPrestige() {
        if (!this.autoPrestige || !this.canPrestige()) return;
        if (this.game.wave >= this.autoPrestigeWave && this.game.isGameOver) {
            this.doPrestige();
        }
    }

    /**
     * Set auto-prestige enabled state
     * @param {boolean} enabled
     */
    setAutoPrestige(enabled) {
        this.autoPrestige = enabled;
        this.game.save();
    }

    /**
     * Set auto-prestige wave threshold
     * @param {number} wave
     */
    setAutoPrestigeWave(wave) {
        this.autoPrestigeWave = Math.max(25, wave);
        this.game.save();
    }

    /**
     * Execute prestige/rebirth
     * @returns {boolean} Success
     */
    doPrestige() {
        if (!this.canPrestige()) return false;

        const points = this.calculatePrestigePoints();
        this.prestigePoints += points;
        this.totalPrestiges++;

        // Reset run progress
        this.game.gold = 0;
        this.game.wave = 1;
        if (this.game.castle) {
            this.game.castle.tier = 1;
            this.game.castle.hp = this.game.castle.maxHp;
        }
        this.game.enemies = [];
        this.game.projectiles = [];
        this.game.relics = [];
        this.game.isGameOver = false;

        // Reset upgrades (keep base levels)
        if (this.game.upgrades?.upgrades) {
            this.game.upgrades.upgrades.forEach(u => {
                u.level = PRESTIGE_RESET_UPGRADES.includes(u.id) ? 0 : 1;
            });
        }

        // Apply wave skip
        const waveSkip = this.getWaveSkipAmount();
        const startWaveBonus = this.getEffectValue('prestige_start_wave');
        const finalStartWave = Math.max(waveSkip, startWaveBonus);
        if (finalStartWave > 0) {
            this.game.wave = finalStartWave + 1;
        }

        // Auto-Turrets from prestige upgrade
        const autoTurrets = this.getEffectValue('prestige_auto_turrets');
        if (autoTurrets > 0 && this.game.upgrades) {
            const turretUpg = this.game.upgrades.getById('turret');
            if (turretUpg) turretUpg.level = autoTurrets;
        }

        // Auto-buy starting upgrades based on prestige count
        const autoBuyLevels = Math.min(10, Math.floor(this.totalPrestiges / 2));
        if (autoBuyLevels > 0 && this.game.upgrades) {
            const dmgUpg = this.game.upgrades.getById('damage');
            const spdUpg = this.game.upgrades.getById('speed');
            const hpUpg = this.game.upgrades.getById('health');
            if (dmgUpg) dmgUpg.level = Math.max(dmgUpg.level, autoBuyLevels);
            if (spdUpg) spdUpg.level = Math.max(spdUpg.level, Math.floor(autoBuyLevels / 2));
            if (hpUpg) hpUpg.level = Math.max(hpUpg.level, Math.floor(autoBuyLevels / 2));
        }

        // Apply starting gold from meta upgrades
        this.game.gold = this.game.metaUpgrades?.getEffectValue?.('startGold') || 0;

        // Recalculate bonuses
        this.game.recalcRelicBonuses?.();
        this.game.updateStats?.();
        this.game.save();

        // Show notification
        if (this.game.floatingTexts && typeof FloatingText !== 'undefined') {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${t('prestige.complete')} +${points} PP`,
                COLORS.GOLD,
                36
            ));
        }

        // Hide game over screen and start new wave (don't call restart - it resets wave to 1)
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
        this.game.isGameOver = false;
        this.game.startWave?.();

        return true;
    }

    /**
     * Get upgrade level
     * @param {string} id
     * @returns {number}
     */
    getLevel(id) {
        return this.upgrades[id] || 0;
    }

    /**
     * Get upgrade effect value
     * @param {string} id
     * @returns {number}
     */
    getEffect(id) {
        const upgrade = PRESTIGE_UPGRADES.find(u => u.id === id);
        if (!upgrade) return 1;
        return upgrade.effect(this.getLevel(id));
    }

    /**
     * Alias for getEffect for compatibility
     */
    getEffectValue(id) {
        return this.getEffect(id);
    }

    /**
     * Get upgrade cost
     * @param {string} id
     * @returns {number}
     */
    getCost(id) {
        const upgrade = PRESTIGE_UPGRADES.find(u => u.id === id);
        if (!upgrade) return Infinity;
        const level = this.getLevel(id);
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, level));
    }

    /**
     * Alias for getCost
     */
    getUpgradeCost(id) {
        return this.getCost(id);
    }

    /**
     * Check if can afford upgrade
     * @param {string} id
     * @returns {boolean}
     */
    canAfford(id) {
        return this.prestigePoints >= this.getCost(id);
    }

    /**
     * Alias for canAfford
     */
    canAffordUpgrade(id) {
        return this.canAfford(id);
    }

    /**
     * Buy a prestige upgrade
     * @param {string} id
     * @returns {boolean} Success
     */
    buy(id) {
        const upgrade = PRESTIGE_UPGRADES.find(u => u.id === id);
        if (!upgrade) return false;

        const level = this.getLevel(id);
        if (level >= upgrade.maxLevel) return false;

        const cost = this.getCost(id);
        if (this.prestigePoints < cost) return false;

        this.prestigePoints -= cost;
        this.upgrades[id] = level + 1;
        this.game.save();
        this.render();
        return true;
    }

    /**
     * Alias for buy
     */
    buyUpgrade(id) {
        return this.buy(id);
    }

    /**
     * Render prestige UI
     */
    render() {
        const container = document.getElementById('prestige-grid');
        if (!container) return;

        container.innerHTML = '';

        const crystalsDisplay = document.getElementById('prestige-crystals-display');
        if (crystalsDisplay) {
            crystalsDisplay.innerText = formatNumber(this.prestigePoints);
        }

        PRESTIGE_UPGRADES.forEach(u => {
            const level = this.getLevel(u.id);
            const isMaxed = level >= u.maxLevel;
            const cost = this.getCost(u.id);
            const canAfford = this.prestigePoints >= cost && !isMaxed;
            const effect = u.effect(level);
            const nextEffect = u.effect(level + 1);

            const div = document.createElement('div');
            let stateClass = 'bg-slate-800 border-slate-600 opacity-60';
            if (isMaxed) {
                stateClass = 'bg-slate-700 border-yellow-500/50';
            } else if (canAfford) {
                stateClass = 'bg-cyan-900/30 border-cyan-500 hover:bg-cyan-800/40 cursor-pointer';
            }
            div.className = `p-3 rounded-lg border-2 transition-all ${stateClass}`;

            if (canAfford) {
                div.onclick = () => this.buy(u.id);
            }

            const effectDisplay = typeof effect === 'number' ?
                (effect < 10 ? `x${effect.toFixed(2)}` : `+${effect}`) :
                effect;
            const nextDisplay = typeof nextEffect === 'number' ?
                (nextEffect < 10 ? `x${nextEffect.toFixed(2)}` : `+${nextEffect}`) :
                nextEffect;

            div.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">${u.icon}</span>
                    <div>
                        <div class="font-bold text-white">${t(u.nameKey)}</div>
                        <div class="text-xs text-cyan-300">${t(u.descKey)}</div>
                    </div>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-400">${t('lab.level')} ${level}/${u.maxLevel}</span>
                    ${!isMaxed ? `<span class="font-mono font-bold text-cyan-400">${formatNumber(cost)} PP</span>` : `<span class="text-yellow-400">${t('lab.max')}</span>`}
                </div>
                ${!isMaxed ? `<div class="text-xs text-slate-500 mt-1">${effectDisplay} → ${nextDisplay}</div>` : ''}
            `;
            container.appendChild(div);
        });

        // Update auto-prestige UI
        this.renderAutoPrestigeUI();
    }

    /**
     * Render auto-prestige settings UI
     */
    renderAutoPrestigeUI() {
        const toggle = document.getElementById('toggle-auto-prestige');
        const waveInput = document.getElementById('auto-prestige-wave');

        if (toggle) {
            toggle.checked = this.autoPrestige;
        }
        if (waveInput) {
            waveInput.value = this.autoPrestigeWave;
        }
    }

    /**
     * Get save data
     * @returns {object}
     */
    getSaveData() {
        return {
            prestigePoints: this.prestigePoints,
            totalPrestiges: this.totalPrestiges,
            upgrades: { ...this.upgrades },
            autoPrestige: this.autoPrestige,
            autoPrestigeWave: this.autoPrestigeWave
        };
    }

    /**
     * Load save data
     * @param {object} data
     */
    loadSaveData(data) {
        if (!data) return;
        this.prestigePoints = data.prestigePoints || 0;
        this.totalPrestiges = data.totalPrestiges || 0;
        this.upgrades = data.upgrades || {};
        this.autoPrestige = data.autoPrestige || false;
        this.autoPrestigeWave = data.autoPrestigeWave || 30;
    }
}
