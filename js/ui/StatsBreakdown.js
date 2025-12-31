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
 * StatsBreakdown - UI component for displaying detailed stat breakdowns
 * Shows all multiplier sources for damage, gold, health, etc.
 */

import { t } from '../i18n.js';
import { formatNumber } from '../config.js';

export class StatsBreakdown {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
        this.visible = false;
    }

    /**
     * Toggle breakdown visibility
     */
    toggle() {
        this.visible = !this.visible;
        this.render();
    }

    /**
     * Show breakdown
     */
    show() {
        this.visible = true;
        this.render();
    }

    /**
     * Hide breakdown
     */
    hide() {
        this.visible = false;
        const container = document.getElementById('stats-breakdown');
        if (container) container.classList.add('hidden');
    }

    /**
     * Render the stats breakdown panel
     */
    render() {
        let container = document.getElementById('stats-breakdown');

        if (!container) {
            container = document.createElement('div');
            container.id = 'stats-breakdown';
            container.className = 'stats-breakdown-panel';
            document.body.appendChild(container);
        }

        if (!this.visible) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');

        const damageBreakdown = this.getDamageBreakdown();
        const goldBreakdown = this.getGoldBreakdown();
        const defenseBreakdown = this.getDefenseBreakdown();

        container.innerHTML = `
            <div class="stats-breakdown-header">
                <h3>${t('stats.breakdown.title') || 'Stats Breakdown'}</h3>
                <button onclick="game.statsBreakdown?.hide()" class="stats-breakdown-close">&times;</button>
            </div>

            <div class="stats-breakdown-section">
                <h4>⚔️ ${t('stats.breakdown.damage') || 'Damage'}</h4>
                <div class="stats-breakdown-row">
                    <span>${t('stats.breakdown.base') || 'Base Damage'}</span>
                    <span class="stats-value">${formatNumber(damageBreakdown.base)}</span>
                </div>
                ${this.renderMultipliers(damageBreakdown.multipliers)}
                <div class="stats-breakdown-row stats-total">
                    <span>${t('stats.breakdown.final') || 'Final Damage'}</span>
                    <span class="stats-value text-green-400">${formatNumber(damageBreakdown.final)}</span>
                </div>
                <div class="stats-breakdown-row">
                    <span>${t('stats.breakdown.dps') || 'DPS'}</span>
                    <span class="stats-value text-cyan-400">${formatNumber(damageBreakdown.dps)}</span>
                </div>
                <div class="stats-breakdown-row">
                    <span>${t('stats.breakdown.critDps') || 'Avg DPS (with crits)'}</span>
                    <span class="stats-value text-purple-400">${formatNumber(damageBreakdown.critDps)}</span>
                </div>
            </div>

            <div class="stats-breakdown-section">
                <h4>💰 ${t('stats.breakdown.gold') || 'Gold'}</h4>
                <div class="stats-breakdown-row">
                    <span>${t('stats.breakdown.baseGold') || 'Base Gold/Kill'}</span>
                    <span class="stats-value">${formatNumber(goldBreakdown.base)}</span>
                </div>
                ${this.renderMultipliers(goldBreakdown.multipliers)}
                <div class="stats-breakdown-row stats-total">
                    <span>${t('stats.breakdown.finalGold') || 'Final Gold/Kill'}</span>
                    <span class="stats-value text-yellow-400">${formatNumber(goldBreakdown.final)}</span>
                </div>
            </div>

            <div class="stats-breakdown-section">
                <h4>🛡️ ${t('stats.breakdown.defense') || 'Defense'}</h4>
                <div class="stats-breakdown-row">
                    <span>${t('stats.breakdown.maxHp') || 'Max HP'}</span>
                    <span class="stats-value text-red-400">${formatNumber(defenseBreakdown.maxHp)}</span>
                </div>
                <div class="stats-breakdown-row">
                    <span>${t('stats.breakdown.regen') || 'HP Regen/s'}</span>
                    <span class="stats-value text-green-400">${defenseBreakdown.regen.toFixed(1)}</span>
                </div>
                <div class="stats-breakdown-row">
                    <span>${t('stats.breakdown.armor') || 'Armor'}</span>
                    <span class="stats-value">${(defenseBreakdown.armor * 100).toFixed(1)}%</span>
                </div>
                <div class="stats-breakdown-row">
                    <span>${t('stats.breakdown.shield') || 'Shield'}</span>
                    <span class="stats-value text-blue-400">${formatNumber(defenseBreakdown.shield)}</span>
                </div>
            </div>

            <div class="stats-breakdown-section">
                <h4>💥 ${t('stats.breakdown.crit') || 'Critical'}</h4>
                <div class="stats-breakdown-row">
                    <span>${t('stats.breakdown.critChance') || 'Crit Chance'}</span>
                    <span class="stats-value">${damageBreakdown.critChance.toFixed(1)}%</span>
                </div>
                <div class="stats-breakdown-row">
                    <span>${t('stats.breakdown.critMult') || 'Crit Multiplier'}</span>
                    <span class="stats-value">x${damageBreakdown.critMult.toFixed(2)}</span>
                </div>
            </div>

            <div class="stats-breakdown-section">
                <h4>🎯 ${t('stats.breakdown.turrets') || 'Turrets'}</h4>
                <div class="stats-breakdown-row">
                    <span>${t('stats.breakdown.turretCount') || 'Active Turrets'}</span>
                    <span class="stats-value">${this.game.turrets?.length || 0}</span>
                </div>
                <div class="stats-breakdown-row">
                    <span>${t('stats.breakdown.fireRate') || 'Fire Rate'}</span>
                    <span class="stats-value">${(1000 / (this.game.currentFireRate || 1000)).toFixed(1)}/s</span>
                </div>
                <div class="stats-breakdown-row">
                    <span>${t('stats.breakdown.range') || 'Range'}</span>
                    <span class="stats-value">${this.game.currentRange || 150}px</span>
                </div>
            </div>
        `;
    }

    /**
     * Render multiplier rows
     * @param {Array} multipliers
     * @returns {string}
     */
    renderMultipliers(multipliers) {
        return multipliers.map(m => `
            <div class="stats-breakdown-row stats-multiplier">
                <span class="text-slate-400">${m.label}</span>
                <span class="stats-value ${m.mult >= 1 ? 'text-green-400' : 'text-red-400'}">
                    ${m.mult >= 1 ? '+' : ''}${((m.mult - 1) * 100).toFixed(0)}%
                </span>
            </div>
        `).join('');
    }

    /**
     * Get damage breakdown data
     * @returns {object}
     */
    getDamageBreakdown() {
        const base = this.game.currentDamage || 10;
        const multipliers = [];
        let total = base;

        // Tier multiplier
        const tier = this.game.castle?.tier || 1;
        const tierMult = Math.pow(1.5, tier - 1);
        if (tierMult !== 1) {
            multipliers.push({ label: t('stats.sources.tier') || `Tier ${tier}`, mult: tierMult });
            total *= tierMult;
        }

        // Meta upgrades
        const metaMult = this.game.metaUpgrades?.getEffectValue('damageMult') || 1;
        if (metaMult !== 1) {
            multipliers.push({ label: t('stats.sources.meta') || 'Meta Upgrades', mult: metaMult });
            total *= metaMult;
        }

        // Relics
        const relicMult = 1 + (this.game.relicMults?.damage || 0);
        if (relicMult !== 1) {
            multipliers.push({ label: t('stats.sources.relics') || 'Relics', mult: relicMult });
            total *= relicMult;
        }

        // Research
        const researchMult = 1 + (this.game.researchEffects?.damageMult || 0);
        if (researchMult !== 1) {
            multipliers.push({ label: t('stats.sources.research') || 'Research', mult: researchMult });
            total *= researchMult;
        }

        // Passives
        const passiveMult = this.game.passives?.getEffect('damageMult') || 1;
        if (passiveMult !== 1) {
            multipliers.push({ label: t('stats.sources.passives') || 'Passives', mult: passiveMult });
            total *= passiveMult;
        }

        // Prestige
        const prestigeMult = this.game.prestige?.getEffect('damageMult') || 1;
        if (prestigeMult !== 1) {
            multipliers.push({ label: t('stats.sources.prestige') || 'Prestige', mult: prestigeMult });
            total *= prestigeMult;
        }

        // Dark Matter tech
        const berserkMult = 1 + ((this.game.challenges?.dmTech?.berserk || 0) * 0.2);
        if (berserkMult !== 1) {
            multipliers.push({ label: t('stats.sources.darkMatter') || 'Dark Matter', mult: berserkMult });
            total *= berserkMult;
        }

        // Calculate DPS
        const fireRate = this.game.currentFireRate || 1000;
        const turretCount = this.game.turrets?.length || 1;
        const dps = (total * turretCount * 1000) / fireRate;

        // Crit stats
        const critChance = this.getCritChance();
        const critMult = this.getCritMultiplier();
        const critDps = dps * (1 + (critChance / 100) * (critMult - 1));

        return {
            base,
            final: Math.floor(total),
            multipliers,
            dps: Math.floor(dps),
            critDps: Math.floor(critDps),
            critChance,
            critMult
        };
    }

    /**
     * Get gold breakdown data
     * @returns {object}
     */
    getGoldBreakdown() {
        const base = 5; // Base gold per kill
        const multipliers = [];
        let total = base;

        // Meta gold mult
        const metaMult = this.game.metaUpgrades?.getEffectValue('goldMult') || 1;
        if (metaMult !== 1) {
            multipliers.push({ label: t('stats.sources.meta') || 'Meta Upgrades', mult: metaMult });
            total *= metaMult;
        }

        // Relics
        const relicMult = 1 + (this.game.relicMults?.gold || 0);
        if (relicMult !== 1) {
            multipliers.push({ label: t('stats.sources.relics') || 'Relics', mult: relicMult });
            total *= relicMult;
        }

        // Research
        const researchMult = 1 + (this.game.researchEffects?.goldMult || 0);
        if (researchMult !== 1) {
            multipliers.push({ label: t('stats.sources.research') || 'Research', mult: researchMult });
            total *= researchMult;
        }

        // Passives
        const passiveMult = this.game.passives?.getEffect('goldMult') || 1;
        if (passiveMult !== 1) {
            multipliers.push({ label: t('stats.sources.passives') || 'Passives', mult: passiveMult });
            total *= passiveMult;
        }

        // Dread reward mult
        const dreadLevel = this.game.dreadLevel || 0;
        if (dreadLevel > 0) {
            const dreadData = this.game.getDreadData?.(dreadLevel);
            if (dreadData?.rewardMult > 1) {
                multipliers.push({ label: t('stats.sources.dread') || `Dread ${dreadLevel}`, mult: dreadData.rewardMult });
                total *= dreadData.rewardMult;
            }
        }

        // Midas rune
        if (this.game.activeRune?.id === 'midas') {
            multipliers.push({ label: t('stats.sources.rune') || 'Midas Rune', mult: 2 });
            total *= 2;
        }

        return {
            base,
            final: Math.floor(total),
            multipliers
        };
    }

    /**
     * Get defense breakdown data
     * @returns {object}
     */
    getDefenseBreakdown() {
        return {
            maxHp: this.game.castle?.maxHp || 100,
            regen: this.game.currentRegen || 0,
            armor: this.game.currentArmor || 0,
            shield: this.game.currentShield || 0
        };
    }

    /**
     * Get total crit chance
     * @returns {number}
     */
    getCritChance() {
        let chance = this.game.currentCrit?.chance || 5;
        chance += this.game.researchEffects?.critChance || 0;
        chance += this.game.passives?.getEffect('critChance') || 0;
        chance += this.game.relicMults?.critChance || 0;
        return Math.min(chance, 100);
    }

    /**
     * Get total crit multiplier
     * @returns {number}
     */
    getCritMultiplier() {
        let mult = this.game.currentCrit?.mult || 1.5;
        mult += this.game.researchEffects?.critDamage || 0;
        mult += this.game.passives?.getEffect('critDamage') || 0;
        mult += this.game.relicMults?.critDamage || 0;
        return mult;
    }
}
