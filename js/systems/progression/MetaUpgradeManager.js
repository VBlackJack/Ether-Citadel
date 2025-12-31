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
 * MetaUpgradeManager - Handles permanent ether-based upgrades
 * These upgrades persist across runs and provide global bonuses
 */

import { t } from '../../i18n.js';
import { createMetaUpgrades } from '../../data.js';

export class MetaUpgradeManager {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
        this.upgrades = createMetaUpgrades();
    }

    /**
     * Calculate upgrade cost
     * @param {object} upgrade - Upgrade object
     * @returns {number}
     */
    getCost(upgrade) {
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.level));
    }

    /**
     * Get effect value for an upgrade
     * @param {string} id - Upgrade ID
     * @returns {number}
     */
    getEffectValue(id) {
        const upgrade = this.upgrades.find(u => u.id === id);
        return upgrade ? upgrade.getEffect(upgrade.level) : 0;
    }

    /**
     * Purchase an upgrade
     * @param {string} id - Upgrade ID
     * @returns {boolean} Success
     */
    buy(id) {
        if (!this.game) return false;

        const upgrade = this.upgrades.find(u => u.id === id);
        if (!upgrade) return false;
        if (upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) return false;

        const cost = this.getCost(upgrade);
        if (this.game.ether < cost) return false;

        this.game.ether -= cost;
        upgrade.level++;
        this.game.save();
        this.render();
        this.game.updateEtherUI?.();
        this.game.updateAutomationUI?.();
        this.game.updateDroneStatus?.();

        return true;
    }

    /**
     * Render meta upgrade list
     */
    render() {
        const container = document.getElementById('meta-upgrade-list');
        if (!container) return;

        container.innerHTML = '';

        this.upgrades.forEach(u => {
            const cost = this.getCost(u);
            const isMaxed = u.maxLevel && u.level >= u.maxLevel;
            const canAfford = (this.game?.ether || 0) >= cost && !isMaxed;

            const div = document.createElement('div');
            div.className = `p-4 rounded-xl border flex justify-between items-center transition-all ${
                isMaxed
                    ? 'bg-slate-700 border-slate-600 opacity-75'
                    : canAfford
                        ? 'bg-purple-900/40 border-purple-500 hover:bg-purple-800/60 cursor-pointer active:scale-95'
                        : 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed'
            }`;

            if (canAfford) {
                div.onclick = () => this.buy(u.id);
            }

            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="text-3xl">${u.icon}</div>
                    <div>
                        <div class="font-bold text-white">
                            ${t(u.nameKey)}
                            ${isMaxed ? `<span class="text-xs text-yellow-400">${t('lab.max')}</span>` : ''}
                        </div>
                        <div class="text-xs text-purple-200">${t(u.descKey)}</div>
                    </div>
                </div>
                <div class="text-right">
                    ${!isMaxed ? `<div class="text-purple-300 font-bold font-mono text-xl">${cost} 🔮</div>` : ''}
                    <div class="text-xs text-slate-500">${t('lab.level')} ${u.level}</div>
                </div>
            `;

            container.appendChild(div);
        });
    }

    /**
     * Check if player can afford any upgrade
     * @returns {boolean}
     */
    canAffordAny() {
        if (!this.game) return false;
        return this.upgrades.some(u =>
            (!u.maxLevel || u.level < u.maxLevel) &&
            this.game.ether >= this.getCost(u)
        );
    }

    /**
     * Get save data
     * @returns {object}
     */
    getSaveData() {
        const data = {};
        this.upgrades.forEach(u => {
            if (u.level > 0) {
                data[u.id] = u.level;
            }
        });
        return data;
    }

    /**
     * Load save data
     * @param {object} data
     */
    loadSaveData(data) {
        if (!data) return;
        this.upgrades.forEach(u => {
            u.level = data[u.id] || 0;
        });
    }
}
