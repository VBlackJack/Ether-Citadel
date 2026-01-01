/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { ACHIEVEMENTS_DB, MASTERIES, ENEMY_TYPES } from '../../data.js';
import { formatNumber } from '../../config.js';
import { t } from '../../i18n.js';
import { sanitizeColor } from '../../utils/HtmlSanitizer.js';
import { FloatingText } from '../../entities/FloatingText.js';
import { COLORS } from '../../constants/colors.js';

export class StatsManager {
    constructor() {
        this.kills = 0;
        this.bosses = 0;
        this.totalGold = 0;
        this.maxWave = 0;
        this.unlockedAchievements = [];
        this.xp = 0;
        this.level = 1;
        this.masteryPoints = 0;
        this.mastery = { crit_dmg: 0, ether_gain: 0, drone_spd: 0, gold_drop: 0 };
        this.seenEnemies = [];
    }

    registerKill(isBoss, x, y) {
        this.kills++;
        if (isBoss) this.bosses++;
        const gain = isBoss ? 50 : 5;
        this.xp += gain;
        if (this.xp >= this.getNextLevelXp()) {
            this.xp -= this.getNextLevelXp();
            this.level++;
            this.masteryPoints++;
            game.floatingTexts.push(FloatingText.create(100, game.height / 2 - 50, t('notifications.levelUp'), COLORS.CRYSTAL, 30));
        }
        this.checkAchievements();

        if (game.dailyQuests) {
            game.dailyQuests.updateProgress('kill_enemies', 1);
            if (isBoss) {
                game.dailyQuests.updateProgress('kill_bosses', 1);
            }
        }
    }

    getNextLevelXp() {
        return this.level * 200;
    }

    registerGold(amount) {
        this.totalGold += amount;
        this.checkAchievements();
        if (game.dailyQuests) {
            game.dailyQuests.updateProgress('collect_gold', amount);
        }
    }

    registerWave(wave) {
        if (wave > this.maxWave) this.maxWave = wave;
        this.checkAchievements();
        if (game.dailyQuests) {
            // Set progress to current wave (tracks highest wave reached)
            const quest = game.dailyQuests.quests.find(q => q.id === 'reach_wave' && !q.completed);
            if (quest) {
                game.dailyQuests.progress['reach_wave'] = Math.max(game.dailyQuests.progress['reach_wave'] || 0, wave);
                if (game.dailyQuests.progress['reach_wave'] >= quest.target) {
                    game.dailyQuests.completeQuest(quest);
                }
            }
        }
    }

    registerEnemySeen(typeKey) {
        if (!this.seenEnemies.includes(typeKey)) {
            this.seenEnemies.push(typeKey);
        }
    }

    checkAchievements() {
        ACHIEVEMENTS_DB.forEach(ach => {
            if (!this.unlockedAchievements.includes(ach.id) && ach.cond(this)) {
                this.unlockedAchievements.push(ach.id);
                game.ether += ach.reward;
                game.save();
                game.updateEtherUI();
                this.showPopup(ach);
            }
        });
    }

    showPopup(ach) {
        const div = document.createElement('div');
        div.className = 'absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white font-bold p-3 rounded-xl border-2 border-white shadow-2xl z-50 loot-popup flex items-center gap-2';
        div.innerHTML = `<span class="text-2xl">🏆</span> <div><div class="text-sm">${t('modals.achievements.unlocked')}</div><div class="text-lg leading-none">${t(ach.nameKey)}</div><div class="text-xs text-green-200">+${ach.reward} Ether</div></div>`;
        document.getElementById('loot-container').appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    render() {
        const list = document.getElementById('achieve-list');
        list.innerHTML = '';
        ACHIEVEMENTS_DB.forEach(ach => {
            const unlocked = this.unlockedAchievements.includes(ach.id);
            const div = document.createElement('div');
            div.className = `p-2 rounded border flex justify-between items-center ${unlocked ? 'bg-green-900/50 border-green-500' : 'bg-slate-800 border-slate-700 opacity-60'}`;
            div.innerHTML = `<div><div class="font-bold ${unlocked ? 'text-white' : 'text-slate-400'}">${t(ach.nameKey)}</div><div class="text-xs text-slate-400">${t(ach.descKey)}</div></div><div class="text-xs font-mono ${unlocked ? 'text-green-300' : 'text-slate-500'}">${unlocked ? '✓' : `+${ach.reward}🔮`}</div>`;
            list.appendChild(div);
        });

        const mGrid = document.getElementById('mastery-grid');
        mGrid.innerHTML = '';
        document.getElementById('mastery-pts-display').innerText = this.masteryPoints;
        MASTERIES.forEach(m => {
            const lvl = this.mastery[m.id] || 0;
            const div = document.createElement('div');
            div.className = `p-3 rounded bg-slate-700 border border-slate-600 flex justify-between items-center ${this.masteryPoints > 0 && lvl < m.max ? 'cursor-pointer hover:bg-slate-600' : 'opacity-70'}`;
            if (this.masteryPoints > 0 && lvl < m.max) {
                div.onclick = () => {
                    this.mastery[m.id] = lvl + 1;
                    this.masteryPoints--;
                    game.save();
                    this.render();
                };
            }
            div.innerHTML = `<div><div class="font-bold text-cyan-300">${t(m.nameKey)}</div><div class="text-xs text-slate-400">${t(m.descKey)}</div></div><div class="text-right font-mono font-bold">${lvl}/${m.max}</div>`;
            mGrid.appendChild(div);
        });

        document.getElementById('stat-kills').innerText = formatNumber(this.kills);
        document.getElementById('stat-bosses').innerText = formatNumber(this.bosses);
        document.getElementById('stat-gold').innerText = formatNumber(Math.floor(this.totalGold));
        document.getElementById('stat-wave').innerText = this.maxWave;
        const xpPct = (this.xp / this.getNextLevelXp()) * 100;
        document.getElementById('ui-xp-bar').style.width = `${xpPct}%`;
        document.getElementById('ui-level').innerText = this.level;
        document.getElementById('ui-mastery-pts').innerText = this.masteryPoints;
        const uiMasteryPts2 = document.getElementById('ui-mastery-pts-2');
        if (uiMasteryPts2) uiMasteryPts2.innerText = this.masteryPoints;

        const cGrid = document.getElementById('codex-grid');
        cGrid.innerHTML = '';
        for (let key in ENEMY_TYPES) {
            const e = ENEMY_TYPES[key];
            const seen = this.seenEnemies.includes(key);
            const div = document.createElement('div');
            div.className = `p-3 rounded border flex items-center gap-3 ${seen ? 'bg-slate-700 border-blue-500' : 'bg-slate-800 border-slate-700 opacity-50'}`;
            div.innerHTML = seen
                ? `<div class="w-8 h-8 rounded-full" style="background:${sanitizeColor(e.color)}"></div><div><div class="font-bold text-white">${t(e.nameKey)}</div><div class="text-xs text-slate-300">${t(e.descKey)}</div><div class="text-[10px] text-slate-400 mt-1">${t('modals.codex.hpMult', { value: e.hpMult })} • ${t('modals.codex.speedMult', { value: e.speedMult })}</div></div>`
                : `<div class="w-8 h-8 rounded-full bg-black"></div><div><div class="font-bold text-slate-500">${t('modals.codex.unknown')}</div><div class="text-xs text-slate-600">${t('modals.codex.unknownDesc')}</div></div>`;
            cGrid.appendChild(div);
        }
    }
}