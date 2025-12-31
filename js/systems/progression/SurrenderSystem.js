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
 * SurrenderSystem - Handles strategic surrender mechanics
 * Allows players to surrender early for bonus rewards
 */

import { t } from '../../i18n.js';
import { formatNumber } from '../../config.js';
import { FloatingText } from '../../entities/FloatingText.js';

export class SurrenderSystem {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
        this.minWave = 5; // Minimum wave to surrender
        this.surrenderGoldBonus = 0; // Gold bonus for next run
    }

    /**
     * Check if surrender is available
     * @returns {boolean}
     */
    canSurrender() {
        return this.game.wave >= this.minWave && !this.game.isGameOver;
    }

    /**
     * Calculate surrender bonuses
     * @returns {object} Bonus amounts
     */
    calculateBonuses() {
        const wave = this.game.wave;
        const dreadLevel = this.game.dreadLevel || 0;
        const dreadMult = 1 + (dreadLevel * 0.25);

        // Ether bonus: scales with wave, boosted by dread
        const etherBonus = Math.floor(wave * 0.75 * dreadMult);

        // Gold bonus: 25% of current gold carried to next run
        const goldBonus = Math.floor(this.game.gold * 0.25);

        // Crystal bonus: small crystal bonus for higher waves
        const crystalBonus = wave >= 25 ? Math.floor(wave / 10) : 0;

        return {
            ether: etherBonus,
            gold: goldBonus,
            crystals: crystalBonus
        };
    }

    /**
     * Get bonus preview text for UI
     * @returns {string}
     */
    getBonusPreview() {
        if (!this.canSurrender()) {
            return t('surrender.minWave') || `Available from wave ${this.minWave}`;
        }

        const bonuses = this.calculateBonuses();
        const parts = [];

        if (bonuses.ether > 0) {
            parts.push(`+${formatNumber(bonuses.ether)} 🔮`);
        }
        if (bonuses.gold > 0) {
            parts.push(`+${formatNumber(bonuses.gold)} 💰 (next run)`);
        }
        if (bonuses.crystals > 0) {
            parts.push(`+${bonuses.crystals} 💎`);
        }

        return parts.join(', ') || t('surrender.bonus');
    }

    /**
     * Execute strategic surrender
     * @returns {boolean} Success
     */
    execute() {
        if (!this.canSurrender()) return false;

        const bonuses = this.calculateBonuses();

        // Apply bonuses
        this.game.ether += bonuses.ether;
        this.game.crystals = (this.game.crystals || 0) + bonuses.crystals;
        this.surrenderGoldBonus = bonuses.gold;

        // Show notification
        if (this.game.floatingTexts && typeof FloatingText !== 'undefined') {
            this.game.floatingTexts.push(new FloatingText(
                this.game.width / 2,
                this.game.height / 2 - 50,
                t('surrender.bonus') || 'Strategic Bonus!',
                '#22c55e',
                32
            ));
        }

        // Trigger game over with surrender flag
        this.game.isGameOver = true;
        this.game.save();

        // Show game over screen with surrender bonuses
        this.showSurrenderScreen(bonuses);

        return true;
    }

    /**
     * Show surrender result screen
     * @param {object} bonuses
     */
    showSurrenderScreen(bonuses) {
        const screen = document.getElementById('game-over-screen');
        if (!screen) return;

        screen.classList.remove('hidden');

        const waveEl = document.getElementById('go-wave');
        const etherEl = document.getElementById('go-ether-gain');

        if (waveEl) waveEl.innerText = this.game.wave;
        if (etherEl) etherEl.innerText = formatNumber(bonuses.ether);

        // Hide dark matter box for surrender
        const dmBox = document.getElementById('go-dm-gain-box');
        if (dmBox) dmBox.classList.add('hidden');

        this.game.updateEtherUI?.();
        this.game.metaUpgrades?.render?.();
        this.game.sound?.play?.('gameover');
    }

    /**
     * Apply surrender gold bonus on restart
     */
    applyGoldBonus() {
        if (this.surrenderGoldBonus > 0) {
            this.game.gold += this.surrenderGoldBonus;
            this.surrenderGoldBonus = 0;
        }
    }

    /**
     * Show surrender confirmation dialog
     */
    showConfirmDialog() {
        if (!this.canSurrender()) {
            this.game.ui?.showToast?.(
                t('surrender.minWave') || `Available from wave ${this.minWave}`,
                'warning'
            );
            return;
        }

        const preview = this.getBonusPreview();
        const message = `${t('surrender.confirm')}\n\n${preview}`;

        if (confirm(message)) {
            this.execute();
        }
    }

    /**
     * Render surrender button state
     */
    renderButton() {
        const btn = document.getElementById('surrender-btn');
        if (!btn) return;

        const canSurrender = this.canSurrender();
        btn.disabled = !canSurrender;
        btn.classList.toggle('opacity-50', !canSurrender);
        btn.classList.toggle('cursor-not-allowed', !canSurrender);

        // Update tooltip
        if (canSurrender) {
            btn.title = this.getBonusPreview();
        } else {
            btn.title = t('surrender.minWave') || `Available from wave ${this.minWave}`;
        }
    }

    /**
     * Get save data
     * @returns {object}
     */
    getSaveData() {
        return {
            surrenderGoldBonus: this.surrenderGoldBonus
        };
    }

    /**
     * Load save data
     * @param {object} data
     */
    loadSaveData(data) {
        if (data) {
            this.surrenderGoldBonus = data.surrenderGoldBonus || 0;
        }
    }
}
