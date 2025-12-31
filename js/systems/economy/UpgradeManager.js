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
 * UpgradeManager - Handles in-run upgrade purchases and rendering
 */

import { t } from '../../i18n.js';
import { CONFIG, formatNumber } from '../../config.js';
import { createUpgrades } from '../../data.js';

export class UpgradeManager {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
        this.upgrades = createUpgrades();
    }

    /**
     * Calculate cost of an upgrade at current level
     * @param {object} upgrade
     * @returns {number}
     */
    getCost(upgrade) {
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.level));
    }

    /**
     * Purchase an upgrade
     * @param {string} id - Upgrade ID
     * @param {boolean} silent - Skip UI update
     * @returns {boolean} Success
     */
    buy(id, silent = false) {
        if (!this.game) return false;

        const u = this.upgrades.find(upg => upg.id === id);
        if (!u || (u.maxLevel && u.level >= u.maxLevel)) return false;

        if (this.game.buyMode === 'MAX') {
            let count = 0;
            let totalCost = 0;
            let currentLvl = u.level;

            while (true) {
                let nextCost = Math.floor(u.baseCost * Math.pow(u.costMult, currentLvl + count));
                if (this.game.gold < totalCost + nextCost) break;
                if (u.maxLevel && currentLvl + count >= u.maxLevel) break;
                totalCost += nextCost;
                count++;
                if (count > 1000) break;
            }

            if (count > 0) {
                this.game.gold -= totalCost;
                u.level += count;
                this.game.updateStats();
                if (!silent) {
                    this.render(this.game.activeTab);
                    this.game.ui?.showToast(`${t(u.nameKey)} +${count}`, 'success');
                }
                this.game.save();
                this.game.tutorial.check(this.game.gold);
                return true;
            }
        } else {
            const cost = this.getCost(u);
            if (this.game.gold >= cost) {
                this.game.gold -= cost;
                u.level++;
                this.game.updateStats();
                if (!silent) {
                    this.render(this.game.activeTab);
                    this.game.ui?.showToast(`${t(u.nameKey)} +1`, 'success');
                }
                this.game.save();
                this.game.tutorial.check(this.game.gold);
                return true;
            }
        }

        return false;
    }

    /**
     * Format upgrade value for display
     * @param {object} u - Upgrade object
     * @param {any} val - Value to format
     * @returns {string}
     */
    formatValue(u, val) {
        if (u.id === 'speed') return (1000 / val).toFixed(1) + t('units.perSecond');
        if (u.id === 'crit') return `${val.chance}% / x${val.mult.toFixed(1)}`;
        if (u.id === 'range' || u.id === 'blast') return val + 'px';

        if (u.id === 'multishot' || u.id === 'armor' || u.id === 'stasis') {
            if (u.id === 'armor') return '-' + (val * 100).toFixed(1) + '%';
            return val + '%';
        }

        if (u.id === 'regen') return val + t('units.perSecond');
        if (u.id === 'leech') return `+${val} ${t('game.hp')}`;
        if (u.id === 'shield') return formatNumber(val) + ' SP';
        if (u.id === 'turret') return val + ' ' + t('units.units');
        if (u.id === 'bounce') return val + ' ' + t('units.bounces');

        if (u.id === 'orbital') {
            return val > 0
                ? (val / 1000).toFixed(1) + 's'
                : `<span class="text-red-400">${t('status.inactive')}</span>`;
        }

        if (typeof val === 'boolean' || (u.maxLevel === 1 && u.level === 0)) {
            return val
                ? `<span class="text-green-400">${t('status.active')}</span>`
                : `<span class="text-red-400">${t('status.inactive')}</span>`;
        }

        return formatNumber(val);
    }

    /**
     * Check if player can afford any upgrade
     * @returns {boolean}
     */
    canAffordAny() {
        if (!this.game) return false;
        return this.upgrades.some(u =>
            (!u.maxLevel || u.level < u.maxLevel) &&
            this.game.gold >= this.getCost(u)
        );
    }

    /**
     * Render upgrades UI
     * @param {number} activeTab - Current tab index (0=attack, 1=defense, 2=tech)
     */
    render(activeTab) {
        const container = document.getElementById('upgrade-list');
        if (!container || !this.game) return;

        container.innerHTML = '';
        const filtered = this.upgrades.filter(u => u.category === activeTab);

        // Update tab notification states
        this.updateTabNotifications();

        // Update bulk buy button
        this.updateBulkBuyButton();

        // Render each upgrade
        filtered.forEach(u => this.renderUpgrade(container, u));

        if (filtered.length === 0) {
            container.innerHTML = `<div class="text-slate-500 text-center py-4">${t('lab.empty')}</div>`;
        }
    }

    /**
     * Update tab notification indicators
     */
    updateTabNotifications() {
        const tabButtons = [
            document.getElementById('tab-0'),
            document.getElementById('tab-1'),
            document.getElementById('tab-2')
        ];

        tabButtons.forEach((tabBtn, catId) => {
            if (!tabBtn) return;
            const hasAffordable = this.upgrades.some(u =>
                u.category === catId &&
                this.game.gold >= this.getCost(u) &&
                (!u.maxLevel || u.level < u.maxLevel)
            );
            tabBtn.classList.toggle('tab-notify', hasAffordable);
        });
    }

    /**
     * Update bulk buy button text
     */
    updateBulkBuyButton() {
        const bulkBtn = document.getElementById('btn-bulk-buy');
        const safeBuyMode = ['1', 'MAX'].includes(this.game.buyMode) ? this.game.buyMode : '1';
        if (bulkBtn) {
            bulkBtn.innerHTML = `<span>${t('lab.bulkBuy')}</span>: ${safeBuyMode}`;
        }
    }

    /**
     * Render a single upgrade item
     * @param {HTMLElement} container
     * @param {object} u - Upgrade object
     */
    renderUpgrade(container, u) {
        let cost = this.getCost(u);

        // Calculate MAX cost if in MAX mode
        if (this.game.buyMode === 'MAX') {
            cost = this.calculateMaxCost(u);
        }

        const isMaxed = u.maxLevel && u.level >= u.maxLevel;
        const canAfford = this.game.gold >= cost && !isMaxed;

        // Calculate display values with multipliers
        const { val, next } = this.calculateDisplayValues(u);

        // Create element
        const div = document.createElement('div');
        div.className = this.getUpgradeClassName(isMaxed, canAfford);

        if (!isMaxed) {
            div.onclick = () => {
                if (canAfford) {
                    this.buy(u.id);
                } else {
                    // Feedback for insufficient resources
                    this.game.ui?.showToast(t('feedback.notEnoughGold'), 'warning');
                }
            };
        }

        div.innerHTML = this.getUpgradeHTML(u, cost, isMaxed, val, next);
        container.appendChild(div);
    }

    /**
     * Calculate cost when buying max levels
     * @param {object} u - Upgrade
     * @returns {number}
     */
    calculateMaxCost(u) {
        let count = 0;
        let totalCost = 0;
        let currentLvl = u.level;
        const safeCostMult = Math.max(1.01, u.costMult || 1.15);

        for (let iter = 0; iter < 1000; iter++) {
            let nextCost = Math.floor(u.baseCost * Math.pow(safeCostMult, currentLvl + count));
            if (this.game.gold < totalCost + nextCost && count > 0) break;
            if (this.game.gold < nextCost && count === 0) {
                totalCost = nextCost;
                break;
            }
            if (u.maxLevel && currentLvl + count >= u.maxLevel) break;
            totalCost += nextCost;
            count++;
        }

        return totalCost;
    }

    /**
     * Calculate display values with tier and meta multipliers
     * @param {object} u - Upgrade
     * @returns {{ val: any, next: any }}
     */
    calculateDisplayValues(u) {
        const tm = Math.pow(CONFIG.evolutionMultiplier, this.game.castle.tier - 1);
        const mdm = (this.game.metaUpgrades.getEffectValue('damageMult') || 1) *
                    (1 + (this.game.relicMults.damage || 0));
        const mhm = (this.game.metaUpgrades.getEffectValue('healthMult') || 1) *
                    (1 + (this.game.relicMults.health || 0));

        let val = u.getValue(u.level);
        let next = u.getValue(u.level + 1);

        if (u.id === 'damage') {
            val = Math.floor(val * tm * mdm);
            next = Math.floor(next * tm * mdm);
        } else if (u.id === 'health') {
            val = Math.floor(val * tm * mhm);
            next = Math.floor(next * tm * mhm);
        } else if (u.id === 'regen') {
            val = (val * tm).toFixed(1);
            next = (next * tm).toFixed(1);
        }

        return { val, next };
    }

    /**
     * Get CSS class for upgrade element
     * @param {boolean} isMaxed
     * @param {boolean} canAfford
     * @returns {string}
     */
    getUpgradeClassName(isMaxed, canAfford) {
        const base = 'p-3 rounded-lg border-2 transition-all cursor-pointer select-none group';

        if (isMaxed) {
            return `${base} bg-slate-700 border-slate-600 opacity-75`;
        }
        if (canAfford) {
            return `${base} bg-slate-800 border-blue-600 hover:bg-slate-700 active:scale-95`;
        }
        return `${base} bg-slate-900 border-slate-700 opacity-60 cursor-not-allowed`;
    }

    /**
     * Generate HTML for upgrade element
     * @param {object} u - Upgrade
     * @param {number} cost
     * @param {boolean} isMaxed
     * @param {any} val
     * @param {any} next
     * @returns {string}
     */
    getUpgradeHTML(u, cost, isMaxed, val, next) {
        const nameText = t(u.nameKey);
        const maxBadge = isMaxed ? `<span class="text-xs text-yellow-400">${t('lab.max')}</span>` : '';
        const costText = !isMaxed ? `<div class="text-yellow-400 font-bold font-mono">${formatNumber(cost)}</div>` : '';

        return `
            <div class="flex justify-between items-start mb-1">
                <div class="flex items-center gap-2">
                    <span class="text-2xl">${u.icon}</span>
                    <div>
                        <div class="font-bold text-white leading-tight">${nameText} ${maxBadge}</div>
                        <div class="text-xs text-blue-300">${t('lab.level')} ${u.level}</div>
                    </div>
                </div>
                <div class="text-right">${costText}</div>
            </div>
            <div class="flex justify-between items-center text-xs font-mono bg-black/30 p-1 rounded">
                <span class="text-slate-300">${this.formatValue(u, val)}</span>
                <span class="text-slate-500">➜</span>
                <span class="text-green-400 font-bold">${this.formatValue(u, next)}</span>
            </div>
        `;
    }

    /**
     * Get an upgrade by ID
     * @param {string} id
     * @returns {object|undefined}
     */
    getById(id) {
        return this.upgrades.find(u => u.id === id);
    }

    /**
     * Get upgrade level
     * @param {string} id
     * @returns {number}
     */
    getLevel(id) {
        const u = this.getById(id);
        return u ? u.level : 0;
    }

    /**
     * Get upgrade value at current level
     * @param {string} id
     * @returns {any}
     */
    getValue(id) {
        const u = this.getById(id);
        return u ? u.getValue(u.level) : 0;
    }

    /**
     * Reset all upgrades to level 0
     */
    reset() {
        this.upgrades.forEach(u => { u.level = 0; });
    }

    /**
     * Get save data
     * @returns {Array<{ id: string, level: number }>}
     */
    getSaveData() {
        return this.upgrades.map(u => ({ id: u.id, level: u.level }));
    }

    /**
     * Load save data
     * @param {Array<{ id: string, level: number }>} data
     */
    loadSaveData(data) {
        if (!Array.isArray(data)) return;
        data.forEach(s => {
            const u = this.upgrades.find(m => m.id === s.id);
            if (u) u.level = s.level;
        });
    }
}
