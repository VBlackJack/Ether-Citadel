/*
 * Copyright 2025 Julien Bombled
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
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
        // Ensure all upgrades have a level property initialized
        this.upgrades.forEach(u => {
            if (typeof u.level === 'undefined') u.level = 0;
        });
        this._buildUpgradeMap();
    }

    /**
     * Build a Map for O(1) upgrade lookups by ID
     * @private
     */
    _buildUpgradeMap() {
        this.upgradeMap = new Map();
        for (const u of this.upgrades) {
            this.upgradeMap.set(u.id, u);
        }
    }

    /**
     * Calculate cost of an upgrade at current level
     * Formula: baseCost * (costFactor ^ level)
     * @param {object} upgrade
     * @returns {number}
     */
    getCost(upgrade) {
        const factor = upgrade.costFactor || 1.15;
        return Math.floor(upgrade.baseCost * Math.pow(factor, upgrade.level));
    }

    /**
     * Get upgrade value at a specific level based on type
     * @param {string} id
     * @param {number} [level] - Optional level, defaults to current
     * @returns {number}
     */
    getValue(id, level) {
        const u = this.getById(id);
        if (!u) return 0;

        const lvl = level !== undefined ? level : u.level;

        switch (u.type) {
            case 'linear':
                // base + (level * perLevel)
                return u.baseValue + (lvl * u.valuePerLevel);

            case 'decay':
                // base * (perLevel ^ level) - used for speed/cooldowns
                return u.baseValue * Math.pow(u.valuePerLevel, lvl);

            case 'chance':
                // base + (level * perLevel), capped
                const val = u.baseValue + (lvl * u.valuePerLevel);
                return u.cap ? Math.min(u.cap, val) : val;

            default:
                // Fallback for flat or unspecified types
                return u.baseValue + (lvl * (u.valuePerLevel || 0));
        }
    }

    /**
     * Purchase an upgrade
     * @param {string} id - Upgrade ID
     * @param {boolean} silent - Skip UI update
     * @returns {boolean} Success
     */
    buy(id, silent = false) {
        if (!this.game) return false;

        const u = this.getById(id);
        if (!u) return false;

        // Check max level if defined
        if (u.maxLevel && u.level >= u.maxLevel) return false;

        // Check value cap logic
        const currentVal = this.getValue(id, u.level);
        if (u.cap) {
            if (u.type === 'decay') {
                if (currentVal <= u.cap) return false;
            } else {
                if (currentVal >= u.cap) return false;
            }
        }

        if (this.game.buyMode === 'MAX') {
            return this._buyMax(u, silent);
        } else {
            return this._buySingle(u, silent);
        }
    }

    _buySingle(u, silent) {
        const cost = this.getCost(u);
        if (this.game.gold >= cost) {
            this.game.gold -= cost;
            u.level++;
            this._onPurchase(u, 1, silent);
            return true;
        }
        return false;
    }

    _buyMax(u, silent) {
        let count = 0;
        let totalCost = 0;
        let currentLvl = u.level;
        const factor = u.costFactor || 1.15;

        while (true) {
            let nextCost = Math.floor(u.baseCost * Math.pow(factor, currentLvl + count));

            if (this.game.gold < totalCost + nextCost) break;
            if (u.maxLevel && currentLvl + count >= u.maxLevel) break;

            // Check if next level hits cap
            const nextVal = this.getValue(u.id, currentLvl + count + 1);
            if (u.cap) {
                if (u.type === 'decay' && nextVal < u.cap) break;
                if (u.type !== 'decay' && nextVal > u.cap) break;
            }

            totalCost += nextCost;
            count++;
            if (count > 1000) break; // Safety break
        }

        if (count > 0) {
            this.game.gold -= totalCost;
            u.level += count;
            this._onPurchase(u, count, silent);
            return true;
        }
        return false;
    }

    _onPurchase(u, count, silent) {
        this.game.updateStats();
        if (!silent) {
            this.render(this.game.activeTab);
            this.game.ui?.showToast(`${t(u.nameKey)} +${count}`, 'success');
        }
        this.game.save();
        this.game.tutorial.check(this.game.gold);
    }

    /**
     * Format upgrade value for display
     * @param {object} u - Upgrade object
     * @param {any} val - Value to format
     * @returns {string}
     */
    formatValue(u, val) {
        if (u.id === 'speed') return (1000 / val).toFixed(1) + '/s'; // Speed as attacks per second? Or just value
        if (u.id === 'crit') return val.toFixed(1) + '%';
        if (u.id === 'range' || u.id === 'blast') return Math.floor(val) + 'px';
        if (u.id === 'multishot' || u.id === 'armor' || u.id === 'stasis') return val.toFixed(1) + '%';
        if (u.id === 'regen') return val.toFixed(1) + '/s';
        if (u.id === 'leech') return `+${val} HP`;
        if (u.id === 'shield') return formatNumber(val) + ' SP';
        if (u.id === 'turret') return val + ' ' + t('units.units');
        if (u.id === 'bounce') return val + ' ' + t('units.bounces');

        if (typeof val === 'boolean') {
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
        return this.upgrades.some(u => {
            if (u.maxLevel && u.level >= u.maxLevel) return false;
            return this.game.gold >= this.getCost(u);
        });
    }

    /**
     * Render upgrades UI
     * @param {number} activeTab - Current tab index
     */
    render(activeTab) {
        const container = document.getElementById('upgrade-list');
        if (!container || !this.game) return;

        container.innerHTML = '';

        // Filter by category if present in config, otherwise show all or specific logic
        // Assuming new config might not have category, we show all or define a default
        const filtered = this.upgrades.filter(u => {
            // Default mapping if category is missing in new JSON
            const cat = u.category !== undefined ? u.category : this._guessCategory(u.id);
            return cat === activeTab;
        });

        this.updateTabNotifications();
        this.updateBulkBuyButton();

        filtered.forEach(u => this.renderUpgrade(container, u));

        if (filtered.length === 0) {
            container.innerHTML = `<div class="text-slate-500 text-center py-4">${t('lab.empty')}</div>`;
        }
    }

    _guessCategory(id) {
        const defense = ['health', 'regen', 'armor', 'shield'];
        const tech = ['turret', 'orbital', 'stasis'];
        if (defense.includes(id)) return 1;
        if (tech.includes(id)) return 2;
        return 0; // Default Attack
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
            const hasAffordable = this.upgrades.some(u => {
                const cat = u.category !== undefined ? u.category : this._guessCategory(u.id);
                return cat === catId &&
                       this.game.gold >= this.getCost(u) &&
                       (!u.maxLevel || u.level < u.maxLevel);
            });
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
        const isMaxBuy = this.game.buyMode === 'MAX';

        if (isMaxBuy) {
            cost = this.calculateMaxCost(u);
        }

        const isMaxed = (u.maxLevel && u.level >= u.maxLevel) ||
                        (u.cap && u.type === 'chance' && this.getValue(u.id, u.level) >= u.cap);

        const canAfford = this.game.gold >= cost && !isMaxed && cost > 0;

        // Calculate display values
        const { val, next } = this.calculateDisplayValues(u);

        const div = document.createElement('div');
        div.className = this.getUpgradeClassName(isMaxed, canAfford);

        if (!isMaxed) {
            div.onclick = (e) => {
                if (canAfford) {
                    const target = e.currentTarget;
                    target.classList.add('purchase-success');
                    setTimeout(() => target.classList.remove('purchase-success'), 300);
                    this.buy(u.id);
                } else {
                    this.game.ui?.showToast(t('feedback.notEnoughGold'), 'warning');
                }
            };
        }

        div.innerHTML = this.getUpgradeHTML(u, cost, isMaxed, val, next);
        container.appendChild(div);
    }

    /**
     * Calculate cost when buying max levels (UI helper)
     */
    calculateMaxCost(u) {
        let count = 0;
        let totalCost = 0;
        let currentLvl = u.level;
        const factor = u.costFactor || 1.15;

        for (let iter = 0; iter < 1000; iter++) {
            let nextCost = Math.floor(u.baseCost * Math.pow(factor, currentLvl + count));

            if (this.game.gold < totalCost + nextCost && count > 0) break;
            if (this.game.gold < nextCost && count === 0) {
                totalCost = nextCost;
                break;
            }

            if (u.maxLevel && currentLvl + count >= u.maxLevel) break;

            const nextVal = this.getValue(u.id, currentLvl + count + 1);
            if (u.cap) {
                if (u.type === 'decay' && nextVal < u.cap) break;
                if (u.type !== 'decay' && nextVal > u.cap) break;
            }

            totalCost += nextCost;
            count++;
        }

        return totalCost;
    }

    /**
     * Calculate display values with tier and meta multipliers
     */
    calculateDisplayValues(u) {
        const tm = Math.pow(CONFIG.evolutionMultiplier, this.game.castle.tier - 1);
        const mdm = (this.game.metaUpgrades.getEffectValue('damageMult') || 1) *
                    (1 + (this.game.relicMults.damage || 0));
        const mhm = (this.game.metaUpgrades.getEffectValue('healthMult') || 1) *
                    (1 + (this.game.relicMults.health || 0));

        let val = this.getValue(u.id, u.level);
        let next = this.getValue(u.id, u.level + 1);

        if (u.id === 'damage') {
            val = Math.floor(val * tm * mdm);
            next = Math.floor(next * tm * mdm);
        } else if (u.id === 'health') {
            val = Math.floor(val * tm * mhm);
            next = Math.floor(next * tm * mhm);
        } else if (u.id === 'regen') {
            // Regen might handle decimals
            val = val * tm;
            next = next * tm;
        }

        return { val, next };
    }

    getUpgradeClassName(isMaxed, canAfford) {
        const base = 'p-3 rounded-lg border-2 transition-all cursor-pointer select-none group';
        if (isMaxed) return `${base} bg-slate-700 border-slate-600 opacity-75`;
        if (canAfford) return `${base} bg-slate-800 border-blue-600 hover:bg-slate-700 active:scale-95`;
        return `${base} bg-slate-900 border-slate-700 opacity-60 cursor-not-allowed`;
    }

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

    getById(id) {
        return this.upgradeMap.get(id);
    }

    getLevel(id) {
        const u = this.getById(id);
        return u ? u.level : 0;
    }

    reset() {
        this.upgrades.forEach(u => { u.level = 0; });
    }

    getSaveData() {
        return this.upgrades.map(u => ({ id: u.id, level: u.level }));
    }

    loadSaveData(data) {
        if (!Array.isArray(data)) return;
        for (const s of data) {
            const u = this.getById(s.id);
            if (u) u.level = s.level;
        }
    }
}
