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
 * AutoSkillManager - Handles automatic skill casting
 * Skills auto-cast when off cooldown if enabled
 */

export class AutoSkillManager {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;

        // Auto-cast settings for each skill
        this.autoEnabled = {
            Q: false, // Overdrive
            W: false, // Meteor/Nuke
            E: false  // Black Hole
        };

        // Priority order for auto-casting (lower = higher priority)
        this.priority = {
            Q: 1,
            W: 2,
            E: 3
        };

        // Minimum enemies required to auto-cast each skill
        this.minEnemies = {
            Q: 1,  // Overdrive: cast anytime
            W: 3,  // Meteor: need some enemies
            E: 5   // Black Hole: need cluster
        };
    }

    /**
     * Check if auto-skill is unlocked via meta upgrades
     * @param {string} skillKey - Q, W, or E
     * @returns {boolean}
     */
    isUnlocked(skillKey) {
        if (!this.game.metaUpgrades) return false;

        const upgradeMap = {
            Q: 'autoSkillQ',
            W: 'autoSkillW',
            E: 'autoSkillE'
        };

        return this.game.metaUpgrades.getEffectValue(upgradeMap[skillKey]) > 0;
    }

    /**
     * Toggle auto-cast for a skill
     * @param {string} skillKey - Q, W, or E
     * @returns {boolean} New state
     */
    toggle(skillKey) {
        if (!this.isUnlocked(skillKey)) return false;

        this.autoEnabled[skillKey] = !this.autoEnabled[skillKey];
        this.updateUI(skillKey);
        this.game.save?.();

        return this.autoEnabled[skillKey];
    }

    /**
     * Set auto-cast state for a skill
     * @param {string} skillKey
     * @param {boolean} enabled
     */
    setEnabled(skillKey, enabled) {
        if (!this.isUnlocked(skillKey)) return;

        this.autoEnabled[skillKey] = enabled;
        this.updateUI(skillKey);
    }

    /**
     * Check if skill can be auto-cast right now
     * @param {string} skillKey
     * @returns {boolean}
     */
    canAutoCast(skillKey) {
        // Must be enabled
        if (!this.autoEnabled[skillKey]) return false;

        // Must be unlocked
        if (!this.isUnlocked(skillKey)) return false;

        // Must not be on cooldown
        if (!this.game.skills) return false;
        const skill = this.game.skills.skills?.[skillKey];
        if (!skill || skill.currentCooldown > 0) return false;

        // Must have enough enemies
        const enemyCount = this.game.enemies?.filter(e => !e.dead)?.length || 0;
        if (enemyCount < this.minEnemies[skillKey]) return false;

        // Don't auto-cast if game is paused or over
        if (this.game.isPaused || this.game.isGameOver) return false;

        return true;
    }

    /**
     * Update loop - check and auto-cast skills
     * Called from game update loop
     */
    update() {
        // Get skills sorted by priority
        const skillKeys = Object.keys(this.autoEnabled)
            .filter(key => this.canAutoCast(key))
            .sort((a, b) => this.priority[a] - this.priority[b]);

        // Cast first available skill
        if (skillKeys.length > 0) {
            this.game.skills?.use?.(skillKeys[0]);
        }
    }

    /**
     * Update UI for a skill's auto state
     * @param {string} skillKey
     */
    updateUI(skillKey) {
        const toggle = document.getElementById(`auto-skill-${skillKey.toLowerCase()}`);
        if (toggle) {
            toggle.checked = this.autoEnabled[skillKey];
        }

        const btn = document.getElementById(`skill-${skillKey.toLowerCase()}-btn`);
        if (btn) {
            btn.classList.toggle('auto-active', this.autoEnabled[skillKey]);
        }
    }

    /**
     * Update all UI elements
     */
    updateAllUI() {
        ['Q', 'W', 'E'].forEach(key => this.updateUI(key));
    }

    /**
     * Render auto-skill toggles
     */
    render() {
        ['Q', 'W', 'E'].forEach(skillKey => {
            const container = document.getElementById(`skill-${skillKey.toLowerCase()}-auto-container`);
            if (!container) return;

            const unlocked = this.isUnlocked(skillKey);

            if (unlocked) {
                container.classList.remove('hidden');
                const toggle = container.querySelector('input[type="checkbox"]');
                if (toggle) {
                    toggle.checked = this.autoEnabled[skillKey];
                    toggle.onchange = () => this.toggle(skillKey);
                }
            } else {
                container.classList.add('hidden');
            }
        });
    }

    /**
     * Get save data
     * @returns {object}
     */
    getSaveData() {
        return {
            autoEnabled: { ...this.autoEnabled }
        };
    }

    /**
     * Load save data
     * @param {object} data
     */
    loadSaveData(data) {
        if (data?.autoEnabled) {
            Object.assign(this.autoEnabled, data.autoEnabled);
        }
        this.updateAllUI();
    }
}
