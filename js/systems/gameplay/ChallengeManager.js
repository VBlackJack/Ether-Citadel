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
 * ChallengeManager - Handles challenge modes and dark matter upgrades
 */

import { CHALLENGES, DARK_MATTER_UPGRADES } from '../../data.js';
import { t } from '../../i18n.js';
import { BigNumService, formatNumber } from '../../config.js';

export class ChallengeManager {
    constructor() {
        this.challenges = CHALLENGES;
        this.dmTech = { berserk: 0, siphon: 0, overlord: 0, etherSurge: 0, voidAffinity: 0 };
        this.darkMatter = BigNumService.create(0);
        this.siphonProcs = 0;
    }

    /**
     * Get siphon ether chance based on upgrade level
     * @returns {number} Chance percentage (0-100)
     */
    getSiphonChance() {
        const level = this.dmTech.siphon || 0;
        return level * 0.5; // 0.5% per level, max 5%
    }

    /**
     * Get ether surge bonus multiplier
     * @returns {number} Multiplier (1 = no bonus)
     */
    getEtherSurgeBonus() {
        const level = this.dmTech.etherSurge || 0;
        return 1 + (level * 0.1); // 10% per level
    }

    /**
     * Get void affinity damage reduction in challenges
     * @returns {number} Reduction percentage
     */
    getVoidAffinityBonus() {
        const level = this.dmTech.voidAffinity || 0;
        return level * 0.15; // 15% per level
    }

    /**
     * Try to proc siphon ether gain
     * @returns {boolean} Whether ether was gained
     */
    trySiphonProc() {
        const chance = this.getSiphonChance();
        if (chance > 0 && Math.random() * 100 < chance) {
            this.siphonProcs++;
            return true;
        }
        return false;
    }

    startChallenge(id) {
        if (!window.game) return;
        window.game.activeChallenge = this.challenges.find(c => c.id === id);
        window.game.restart(false);
        window.game.updateChallengeUI();
    }

    cancelChallenge() {
        if (!window.game) return;
        window.game.activeChallenge = null;
        window.game.restart(false);
        window.game.updateChallengeUI();
    }

    buyTech(id) {
        const tech = DARK_MATTER_UPGRADES.find(t => t.id === id);
        const lvl = this.dmTech[id] || 0;
        const cost = BigNumService.create(tech.cost);
        if (lvl < tech.max && BigNumService.gte(this.darkMatter, cost)) {
            this.darkMatter = BigNumService.sub(this.darkMatter, cost);
            this.dmTech[id] = lvl + 1;
            window.game?.save();
            this.render();
        }
    }

    render() {
        const list = document.getElementById('challenges-list');
        list.innerHTML = '';
        this.challenges.forEach(c => {
            const div = document.createElement('div');
            div.className = `bg-slate-700 p-2 rounded border border-red-900 flex justify-between items-center ${window.game?.activeChallenge?.id === c.id ? 'border-yellow-400 bg-red-900/40' : ''}`;
            div.innerHTML = `<div><div class="font-bold text-red-300">${t(c.nameKey)}</div><div class="text-xs text-slate-400">${t(c.descKey)}</div></div><button data-action="challenge.start" data-id="${c.id}" class="px-2 py-1 bg-red-600 text-xs font-bold rounded hover:bg-red-500">${t('modals.challenges.go')}</button>`;
            list.appendChild(div);
        });

        document.getElementById('dm-total-display').innerText = formatNumber(this.darkMatter);
        const shop = document.getElementById('dm-shop-grid');
        shop.innerHTML = '';
        DARK_MATTER_UPGRADES.forEach(tech => {
            const lvl = this.dmTech[tech.id] || 0;
            const div = document.createElement('div');
            div.className = `p-2 rounded bg-purple-900/30 border border-purple-700 ${lvl >= tech.max ? 'opacity-50' : 'hover:bg-purple-800/50 cursor-pointer'}`;
            if (lvl < tech.max) div.onclick = () => this.buyTech(tech.id);
            div.innerHTML = `<div class="flex justify-between"><span class="font-bold text-xs text-purple-300">${t(tech.nameKey)}</span><span class="text-xs">${lvl}/${tech.max}</span></div><div class="text-[10px] text-slate-400">${t(tech.descKey)}</div>${lvl < tech.max ? `<div class="text-right text-xs font-bold mt-1 text-white">${tech.cost} 🌑</div>` : `<div class="text-right text-xs text-green-400">${t('lab.max')}</div>`}`;
            shop.appendChild(div);
        });

        const hud = document.getElementById('active-challenge-hud');
        const hudName = document.getElementById('challenge-name-hud');
        if (window.game?.activeChallenge) {
            hud.classList.remove('hidden');
            hudName.innerText = t(window.game.activeChallenge.nameKey);
            document.getElementById('btn-cancel-challenge').classList.remove('hidden');
        } else {
            hud.classList.add('hidden');
            document.getElementById('btn-cancel-challenge').classList.add('hidden');
        }
    }

    getSaveData() {
        return {
            dm: BigNumService.serialize(this.darkMatter),
            tech: this.dmTech,
            siphonProcs: this.siphonProcs
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.darkMatter = BigNumService.deserialize(data.dm) || BigNumService.create(0);
        this.dmTech = {
            berserk: 0,
            siphon: 0,
            overlord: 0,
            etherSurge: 0,
            voidAffinity: 0,
            ...data.tech
        };
        this.siphonProcs = data.siphonProcs || 0;
    }
}