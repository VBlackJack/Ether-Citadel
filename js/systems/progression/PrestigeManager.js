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

import { PRESTIGE_UPGRADES, PRESTIGE_THEMES, ENDLESS_PRESTIGE_CONFIG } from '../../data.js';
import { t } from '../../i18n.js';
import { formatNumber, BigNumService } from '../../config.js';
import { FloatingText } from '../../entities/FloatingText.js';
import { PRESTIGE_RESET_UPGRADES } from '../../constants/skillIds.js';
import { COLORS } from '../../constants/colors.js';

export class PrestigeManager {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
        this.prestigePoints = BigNumService.create(0);
        this.totalPrestiges = 0;
        this.upgrades = {};

        // Auto-prestige settings
        this.autoPrestige = false;
        this.autoPrestigeWave = 30;

        // Endless prestige mode
        this.endlessMode = false;
        this.endlessInterval = ENDLESS_PRESTIGE_CONFIG.defaultInterval;
        this.endlessCycles = 0;

        // Themed prestige
        this.activeTheme = null;

        PRESTIGE_UPGRADES.forEach(u => {
            this.upgrades[u.id] = 0;
        });
    }

    /**
     * Toggle endless prestige mode
     */
    setEndlessMode(enabled) {
        this.endlessMode = enabled;
        this.game.save();
    }

    /**
     * Set endless prestige wave interval
     */
    setEndlessInterval(waves) {
        this.endlessInterval = Math.max(ENDLESS_PRESTIGE_CONFIG.minWave, waves);
        this.game.save();
    }

    /**
     * Get endless prestige bonus multiplier
     */
    getEndlessBonus() {
        const stacks = Math.min(this.endlessCycles, ENDLESS_PRESTIGE_CONFIG.maxBonusStacks);
        return 1 + (stacks * ENDLESS_PRESTIGE_CONFIG.bonusPerCycle);
    }

    /**
     * Check if endless prestige should trigger
     */
    checkEndlessPrestige() {
        if (!this.endlessMode || this.game.isGameOver) return;
        if (this.game.wave > 0 && this.game.wave % this.endlessInterval === 0) {
            this.doEndlessPrestige();
        }
    }

    /**
     * Execute endless prestige (quick prestige without full reset)
     */
    doEndlessPrestige() {
        if (!this.canPrestige()) return;

        const points = this.calculatePrestigePoints();
        const bonusPoints = BigNumService.mul(points, this.getEndlessBonus());
        this.prestigePoints = BigNumService.add(this.prestigePoints, bonusPoints);
        this.totalPrestiges++;
        this.endlessCycles++;

        // Partial reset - keep wave progress but reset gold and upgrades
        this.game.gold = BigNumService.create(this.game.metaUpgrades?.getEffectValue?.('startGold') || 0);
        if (this.game.upgrades?.upgrades) {
            this.game.upgrades.upgrades.forEach(u => {
                if (PRESTIGE_RESET_UPGRADES.includes(u.id)) {
                    u.level = 0;
                }
            });
        }

        // Show notification
        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 4,
                `♾️ ${t('prestige.endless')} +${formatNumber(bonusPoints)} PP`,
                '#22d3ee',
                28
            ));
        }

        this.game.save();
    }

    /**
     * Get available prestige themes
     */
    getAvailableThemes() {
        return PRESTIGE_THEMES.filter(theme =>
            this.totalPrestiges >= theme.unlockPrestiges
        );
    }

    /**
     * Set active prestige theme
     */
    setTheme(themeId) {
        const theme = PRESTIGE_THEMES.find(t => t.id === themeId);
        if (!theme || this.totalPrestiges < theme.unlockPrestiges) return false;
        this.activeTheme = themeId;
        this.game.save();
        return true;
    }

    /**
     * Get theme bonuses
     */
    getThemeBonuses() {
        if (!this.activeTheme) return { bonuses: {}, penalties: {} };
        const theme = PRESTIGE_THEMES.find(t => t.id === this.activeTheme);
        if (!theme) return { bonuses: {}, penalties: {} };
        return { bonuses: theme.bonuses, penalties: theme.penalty };
    }

    /**
     * Get theme bonus for a specific stat
     */
    getThemeBonus(stat) {
        const { bonuses, penalties } = this.getThemeBonuses();
        const bonus = bonuses[stat] || 0;
        const penalty = penalties[stat] || 0;
        return bonus + penalty;
    }

    /**
     * Calculate prestige points based on current run
     * Improved formula for better progression curve
     * @returns {Decimal}
     */
    calculatePrestigePoints() {
        const baseWave = this.game.stats?.maxWave || 0;
        const dreadMult = 1 + ((this.game.dreadLevel || 0) * 0.5);
        const prestigeCountBonus = 1 + (this.totalPrestiges * 0.08);
        // Improved formula: (wave/8)^1.6 gives ~50% more PP than before
        let points = BigNumService.floor(
            BigNumService.mul(
                BigNumService.pow(baseWave / 8, 1.6),
                dreadMult * prestigeCountBonus
            )
        );
        // First prestige bonus: +25 PP to make first prestige feel rewarding
        if (this.totalPrestiges === 0 && baseWave >= 25) {
            points = BigNumService.add(points, 25);
        }
        return points;
    }

    /**
     * Calculate prestige points for a given wave (for projection)
     * @param {number} wave
     * @param {number} dreadLevel
     * @returns {Decimal}
     */
    calculatePointsAtWave(wave, dreadLevel = this.game.dreadLevel) {
        const dreadMult = 1 + ((dreadLevel || 0) * 0.5);
        const prestigeCountBonus = 1 + (this.totalPrestiges * 0.08);
        return BigNumService.floor(
            BigNumService.mul(
                BigNumService.pow(wave / 8, 1.6),
                dreadMult * prestigeCountBonus
            )
        );
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
                const gain = BigNumService.sub(points, currentPoints);
                const gainNum = BigNumService.toNumber(gain);
                projections.push({
                    wave,
                    points,
                    gain,
                    efficiency: (gainNum / (wave - currentWave)).toFixed(2)
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
        this.prestigePoints = BigNumService.add(this.prestigePoints, points);
        this.totalPrestiges++;

        // Reset run progress
        this.game.gold = BigNumService.create(0);
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
        this.game.gold = BigNumService.create(this.game.metaUpgrades?.getEffectValue?.('startGold') || 0);

        // Recalculate bonuses
        this.game.recalcRelicBonuses?.();
        this.game.updateStats?.();
        this.game.save();

        // Show celebration notification
        if (this.game.floatingTexts && typeof FloatingText !== 'undefined') {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${t('prestige.complete')} +${formatNumber(points)} PP`,
                COLORS.GOLD,
                36
            ));
        }

        // Celebration effects
        this.game.sound?.play('prestige');
        this.game.visualEffects?.triggerScreenShake(10);

        // First prestige milestone celebration
        if (this.totalPrestiges === 1) {
            this.game.ui?.showToast(`🎉 ${t('milestones.firstPrestige')}`, 'success');
        } else if (this.totalPrestiges === 10) {
            this.game.ui?.showToast(`🏆 ${t('milestones.tenPrestiges')}`, 'success');
        } else if (this.totalPrestiges === 50) {
            this.game.ui?.showToast(`👑 ${t('milestones.fiftyPrestiges')}`, 'success');
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
     * @returns {Decimal}
     */
    getCost(id) {
        const upgrade = PRESTIGE_UPGRADES.find(u => u.id === id);
        if (!upgrade) return BigNumService.create(Infinity);
        const level = this.getLevel(id);
        return BigNumService.floor(
            BigNumService.mul(upgrade.baseCost, BigNumService.pow(upgrade.costMult, level))
        );
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
        return BigNumService.gte(this.prestigePoints, this.getCost(id));
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
        if (!BigNumService.gte(this.prestigePoints, cost)) return false;

        this.prestigePoints = BigNumService.sub(this.prestigePoints, cost);
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
            const canAfford = BigNumService.gte(this.prestigePoints, cost) && !isMaxed;
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

            // Format effect display with detailed bonus info
            const formatEffect = (val, id) => {
                if (id === 'prestige_start_wave') return `+${val} waves`;
                if (id === 'prestige_auto_turrets') return `${val} turrets`;
                if (id === 'prestige_skill_cd') return `-${Math.round((1 - val) * 100)}% CD`;
                if (val >= 1) return `+${Math.round((val - 1) * 100)}%`;
                return `x${val.toFixed(2)}`;
            };

            const currentBonus = formatEffect(effect, u.id);
            const nextBonus = formatEffect(nextEffect, u.id);
            const bonusGain = typeof effect === 'number' && typeof nextEffect === 'number' ?
                (u.id === 'prestige_skill_cd' ? `-${Math.round((effect - nextEffect) * 100)}%` :
                 u.id === 'prestige_start_wave' || u.id === 'prestige_auto_turrets' ? `+${nextEffect - effect}` :
                 `+${Math.round((nextEffect - effect) * 100)}%`) : '';

            div.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">${u.icon}</span>
                    <div>
                        <div class="font-bold text-white">${t(u.nameKey)}</div>
                        <div class="text-xs text-cyan-300">${t(u.descKey)}</div>
                    </div>
                </div>
                <div class="text-sm mb-1">
                    <span class="text-green-400 font-bold">${t('prestige.current')}: ${currentBonus}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-400">${t('lab.level')} ${level}/${u.maxLevel}</span>
                    ${!isMaxed ? `<span class="font-mono font-bold text-cyan-400">${formatNumber(cost)} PP</span>` : `<span class="text-yellow-400">${t('lab.max')}</span>`}
                </div>
                ${!isMaxed ? `<div class="text-xs text-yellow-300 mt-1">${t('prestige.next')}: ${nextBonus} <span class="text-green-400">(${bonusGain})</span></div>` : ''}
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
            prestigePoints: this.prestigePoints.toString(),
            totalPrestiges: this.totalPrestiges,
            upgrades: { ...this.upgrades },
            autoPrestige: this.autoPrestige,
            autoPrestigeWave: this.autoPrestigeWave,
            endlessMode: this.endlessMode,
            endlessInterval: this.endlessInterval,
            endlessCycles: this.endlessCycles,
            activeTheme: this.activeTheme
        };
    }

    /**
     * Load save data
     * @param {object} data
     */
    loadSaveData(data) {
        if (!data) return;
        this.prestigePoints = BigNumService.create(data.prestigePoints || 0);
        this.totalPrestiges = data.totalPrestiges || 0;
        this.upgrades = data.upgrades || {};
        this.autoPrestige = data.autoPrestige || false;
        this.autoPrestigeWave = data.autoPrestigeWave || 30;
        this.endlessMode = data.endlessMode || false;
        this.endlessInterval = data.endlessInterval || ENDLESS_PRESTIGE_CONFIG.defaultInterval;
        this.endlessCycles = data.endlessCycles || 0;
        this.activeTheme = data.activeTheme || null;
    }
}
