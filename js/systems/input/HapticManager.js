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
 * Haptic patterns - predefined vibration patterns
 */
export const HapticPattern = {
    // Simple feedback
    TAP: [10],
    LIGHT: [5],
    MEDIUM: [15],
    HEAVY: [30],

    // Action feedback
    SUCCESS: [10, 50, 10],
    ERROR: [50, 30, 50, 30, 50],
    WARNING: [30, 50, 30],

    // Game events
    LEVEL_UP: [20, 30, 20, 30, 40],
    BOSS_SPAWN: [50, 50, 50, 50, 100],
    WAVE_COMPLETE: [10, 20, 10, 20, 30],
    UPGRADE: [10, 30, 10],
    SKILL_ACTIVATE: [20, 40, 20],
    DAMAGE: [15],
    CRITICAL: [20, 10, 30],
    GOLD_COLLECT: [5, 10, 5]
};

/**
 * HapticManager - Provides haptic feedback for mobile devices
 */
export class HapticManager {
    constructor(game) {
        this.game = game;
        this.enabled = true;
        this.supported = this._checkSupport();
        this.intensity = 1.0; // 0.0 to 1.0

        this._setupEventListeners();
    }

    /**
     * Check if vibration API is supported
     * @returns {boolean}
     */
    _checkSupport() {
        return 'vibrate' in navigator;
    }

    /**
     * Setup automatic haptic feedback for game events
     */
    _setupEventListeners() {
        if (!this.game.eventBus) return;

        const events = this.game.eventBus;

        // Wave events
        events.on('wave:start', (data) => {
            if (data.isBoss) {
                this.play(HapticPattern.BOSS_SPAWN);
            }
        });

        events.on('wave:complete', () => {
            this.play(HapticPattern.WAVE_COMPLETE);
        });

        // Player events
        events.on('player:levelup', () => {
            this.play(HapticPattern.LEVEL_UP);
        });

        // Skill events
        events.on('skill:activate', () => {
            this.play(HapticPattern.SKILL_ACTIVATE);
        });

        // Upgrade events
        events.on('upgrade:purchase', () => {
            this.play(HapticPattern.UPGRADE);
        });
    }

    /**
     * Play a haptic pattern
     * @param {number|number[]} pattern - Duration(s) in ms
     */
    play(pattern) {
        if (!this.enabled || !this.supported) return;

        try {
            // Apply intensity scaling
            const scaledPattern = Array.isArray(pattern)
                ? pattern.map(d => Math.round(d * this.intensity))
                : Math.round(pattern * this.intensity);

            navigator.vibrate(scaledPattern);
        } catch (e) {
            // Silently fail - vibration may be blocked
        }
    }

    /**
     * Play a simple tap feedback
     */
    tap() {
        this.play(HapticPattern.TAP);
    }

    /**
     * Play success feedback
     */
    success() {
        this.play(HapticPattern.SUCCESS);
    }

    /**
     * Play error feedback
     */
    error() {
        this.play(HapticPattern.ERROR);
    }

    /**
     * Play warning feedback
     */
    warning() {
        this.play(HapticPattern.WARNING);
    }

    /**
     * Stop any ongoing vibration
     */
    stop() {
        if (this.supported) {
            navigator.vibrate(0);
        }
    }

    /**
     * Enable/disable haptic feedback
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stop();
        }
    }

    /**
     * Set vibration intensity
     * @param {number} intensity - 0.0 to 1.0
     */
    setIntensity(intensity) {
        this.intensity = Math.max(0, Math.min(1, intensity));
    }

    /**
     * Check if haptics are available
     * @returns {boolean}
     */
    isAvailable() {
        return this.supported;
    }

    /**
     * Get save data
     * @returns {Object}
     */
    getSaveData() {
        return {
            enabled: this.enabled,
            intensity: this.intensity
        };
    }

    /**
     * Load save data
     * @param {Object} data
     */
    loadSaveData(data) {
        if (data) {
            this.enabled = data.enabled ?? true;
            this.intensity = data.intensity ?? 1.0;
        }
    }
}

export default HapticManager;
