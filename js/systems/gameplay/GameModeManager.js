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
 * GameModeManager - Handles game modes (survival, infinite, etc)
 */

import { GAME_MODES } from '../../data.js';
import { t } from '../../i18n.js';

export class GameModeManager {
    constructor(game) {
        this.game = game;
        this.currentMode = 'standard';
        this.modeStats = {};
        this.endlessWave = 0;
        this.bossRushKills = 0;
        this.speedrunTime = 0;
        this.speedrunActive = false;
        this.unlockedModes = ['standard'];
    }

    getCurrentMode() {
        return GAME_MODES.find(m => m.id === this.currentMode) || GAME_MODES[0];
    }

    isUnlocked(modeId) {
        const mode = GAME_MODES.find(m => m.id === modeId);
        if (!mode) return false;
        if (mode.unlocked) return true;
        if (mode.unlockWave && this.game.stats?.maxWave >= mode.unlockWave) return true;
        return this.unlockedModes.includes(modeId);
    }

    setMode(modeId) {
        const mode = GAME_MODES.find(m => m.id === modeId);
        if (!mode) return false;
        if (mode.unlockWave && this.game.maxWave < mode.unlockWave) return false;
        this.currentMode = modeId;
        this.resetModeStats();
        return true;
    }

    resetModeStats() {
        this.endlessWave = 0;
        this.bossRushKills = 0;
        this.speedrunTime = 0;
        this.speedrunActive = this.currentMode === 'speedrun';
    }

    getScaling() {
        const mode = GAME_MODES.find(m => m.id === this.currentMode);
        if (!mode?.scaling) return { hpMult: 1, speedMult: 1, goldMult: 1 };
        const wave = this.currentMode === 'endless' ? this.endlessWave : 0;
        return {
            hpMult: Math.pow(mode.scaling.hpMult, wave),
            speedMult: Math.pow(mode.scaling.speedMult, wave),
            goldMult: Math.pow(mode.scaling.goldMult, wave)
        };
    }

    isBossWave(wave) {
        const mode = GAME_MODES.find(m => m.id === this.currentMode);
        if (mode?.bossOnly) return true;
        return wave % 5 === 0;
    }

    update(dt) {
        if (this.speedrunActive) {
            this.speedrunTime += dt;
        }
        if (this.currentMode === 'endless') {
            this.endlessWave = this.game.wave;
        }
    }

    onBossKill() {
        if (this.currentMode === 'boss_rush') {
            this.bossRushKills++;
            this.updateRecord('boss_rush_record', this.bossRushKills);
        }
    }

    onWaveComplete(wave) {
        if (this.currentMode === 'endless') {
            this.updateRecord('endless_record', wave);
        }
        if (this.currentMode === 'speedrun' && wave >= 50) {
            this.updateRecord('fastest_wave_50', this.speedrunTime);
        }
    }

    updateRecord(category, value) {
        if (!this.modeStats[category] ||
            (category.includes('fastest') ? value < this.modeStats[category] : value > this.modeStats[category])) {
            this.modeStats[category] = value;
            this.game.leaderboards?.addEntry(category, value);
        }
    }

    draw(ctx) {
        if (this.currentMode === 'standard') return;
        const mode = GAME_MODES.find(m => m.id === this.currentMode);
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(this.game.width - 150, 60, 140, 40);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${mode.icon} ${t(mode.nameKey)}`, this.game.width - 15, 80);
        if (this.currentMode === 'boss_rush') {
            ctx.font = '12px Arial';
            ctx.fillText(`${t('modes.bossKills')}: ${this.bossRushKills}`, this.game.width - 15, 95);
        }
        ctx.restore();
    }

    getSaveData() {
        return { mode: this.currentMode, stats: this.modeStats, endless: this.endlessWave, bossRush: this.bossRushKills, unlocked: this.unlockedModes };
    }

    loadSaveData(data) {
        if (!data) return;
        this.currentMode = data.mode || 'standard';
        this.modeStats = data.stats || {};
        this.endlessWave = data.endless || 0;
        this.bossRushKills = data.bossRush || 0;
        this.unlockedModes = Array.isArray(data.unlocked) ? data.unlocked : ['standard'];
    }
}