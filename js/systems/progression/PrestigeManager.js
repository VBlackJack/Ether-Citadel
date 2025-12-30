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

import { PRESTIGE_UPGRADES } from '../../data.js';
import { t } from '../../i18n.js';
import { formatNumber } from '../../config.js';

/**
 * Prestige Manager - Handles prestige upgrades and rebirth mechanics
 */
export class PrestigeManager {
    constructor(game) {
        this.game = game;
        this.upgrades = {};
        PRESTIGE_UPGRADES.forEach(u => {
            this.upgrades[u.id] = 0;
        });
    }

    getLevel(id) {
        return this.upgrades[id] || 0;
    }

    getEffect(id) {
        const upgrade = PRESTIGE_UPGRADES.find(u => u.id === id);
        if (!upgrade) return 1;
        return upgrade.effect(this.getLevel(id));
    }

    getCost(id) {
        const upgrade = PRESTIGE_UPGRADES.find(u => u.id === id);
        if (!upgrade) return Infinity;
        const level = this.getLevel(id);
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, level));
    }

    canAfford(id) {
        return this.game.crystals >= this.getCost(id);
    }

    buy(id) {
        const upgrade = PRESTIGE_UPGRADES.find(u => u.id === id);
        if (!upgrade) return false;

        const level = this.getLevel(id);
        if (level >= upgrade.maxLevel) return false;

        const cost = this.getCost(id);
        if (this.game.crystals < cost) return false;

        this.game.crystals -= cost;
        this.upgrades[id] = level + 1;
        this.game.updateCrystalsUI();
        this.game.save();
        this.render();
        return true;
    }

    render() {
        const container = document.getElementById('prestige-grid');
        if (!container) return;

        container.innerHTML = '';
        document.getElementById('prestige-crystals-display').innerText = formatNumber(this.game.crystals);

        PRESTIGE_UPGRADES.forEach(u => {
            const level = this.getLevel(u.id);
            const isMaxed = level >= u.maxLevel;
            const cost = this.getCost(u.id);
            const canAfford = this.game.crystals >= cost && !isMaxed;
            const effect = u.effect(level);
            const nextEffect = u.effect(level + 1);

            const div = document.createElement('div');
            div.className = `p-3 rounded-lg border-2 transition-all ${isMaxed ? 'bg-slate-700 border-yellow-500/50' : canAfford ? 'bg-cyan-900/30 border-cyan-500 hover:bg-cyan-800/40 cursor-pointer' : 'bg-slate-800 border-slate-600 opacity-60'}`;

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
                    ${!isMaxed ? `<span class="font-mono font-bold text-cyan-400">${formatNumber(cost)} 💎</span>` : `<span class="text-yellow-400">${t('lab.max')}</span>`}
                </div>
                ${!isMaxed ? `<div class="text-xs text-slate-500 mt-1">${effectDisplay} → ${nextDisplay}</div>` : ''}
            `;
            container.appendChild(div);
        });
    }

    getSaveData() {
        return { ...this.upgrades };
    }

    loadSaveData(data) {
        if (!data) return;
        Object.assign(this.upgrades, data);
    }
}
