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

import { t } from '../../i18n.js';

/**
 * Tutorial steps configuration
 * Each step has: id, trigger condition, position, arrow direction
 */
const TUTORIAL_STEPS = [
    {
        id: 'welcome',
        trigger: (game) => game.wave === 1 && game.tutorial.step === 0,
        position: { top: '50%', left: '50%' },
        arrow: null
    },
    {
        id: 'firstUpgrade',
        trigger: (game) => game.tutorial.step === 1 && game.gold >= 10,
        position: { top: '60%', left: '75%' },
        arrow: { direction: 'right', offset: '-40px' },
        highlight: '#upgrade-panel'
    },
    {
        id: 'skills',
        trigger: (game) => game.tutorial.step === 2 && game.wave >= 3,
        position: { top: '70%', left: '30%' },
        arrow: { direction: 'down', offset: '40px' },
        highlight: '.skill-btn'
    },
    {
        id: 'rush',
        trigger: (game) => game.tutorial.step === 3 && game.wave >= 5,
        position: { top: '20%', left: '40%' },
        arrow: { direction: 'up', offset: '-30px' }
    },
    {
        id: 'firstBoss',
        trigger: (game) => game.tutorial.step === 4 && game.wave >= 9,
        position: { top: '50%', left: '50%' },
        arrow: null
    },
    {
        id: 'prestige',
        trigger: (game) => game.tutorial.step === 5 && game.isGameOver && game.wave >= 10,
        position: { top: '50%', left: '50%' },
        arrow: null
    },
    {
        id: 'ether',
        trigger: (game) => game.tutorial.step === 6 && game.ether > 0,
        position: { top: '30%', left: '70%' },
        arrow: { direction: 'right', offset: '-30px' }
    },
    {
        id: 'metaUpgrades',
        trigger: (game) => game.tutorial.step === 7 && game.ether >= 5,
        position: { top: '50%', left: '50%' },
        arrow: null
    },
    {
        id: 'research',
        trigger: (game) => game.tutorial.step === 8 && game.wave >= 15,
        position: { top: '50%', left: '50%' },
        arrow: null
    },
    {
        id: 'production',
        trigger: (game) => game.tutorial.step === 9 && game.wave >= 20,
        position: { top: '50%', left: '50%' },
        arrow: null
    },
    {
        id: 'dread',
        trigger: (game) => game.tutorial.step === 10 && game.highestWave >= 50,
        position: { top: '50%', left: '50%' },
        arrow: null
    },
    {
        id: 'complete',
        trigger: (game) => game.tutorial.step === 11,
        position: { top: '50%', left: '50%' },
        arrow: null,
        final: true
    }
];

/**
 * TutorialManager - Extended tutorial system with progressive guidance
 */
export class TutorialManager {
    constructor(game) {
        this.game = game;
        this.step = 0;
        this.completed = false;
        this.dismissed = false;
        this._checkInterval = null;
    }

    /**
     * Initialize tutorial from saved state
     * @param {object} data
     */
    loadSaveData(data) {
        if (data) {
            this.step = data.step || 0;
            this.completed = data.completed || false;
            this.dismissed = data.dismissed || false;
        }
    }

    /**
     * Get save data
     * @returns {object}
     */
    getSaveData() {
        return {
            step: this.step,
            completed: this.completed,
            dismissed: this.dismissed
        };
    }

    /**
     * Start periodic tutorial checks
     */
    startChecking() {
        if (this._checkInterval) return;
        this._checkInterval = setInterval(() => this.check(), 1000);
    }

    /**
     * Stop periodic checks
     */
    stopChecking() {
        if (this._checkInterval) {
            clearInterval(this._checkInterval);
            this._checkInterval = null;
        }
    }

    /**
     * Check if any tutorial step should trigger
     */
    check() {
        if (this.completed || this.dismissed) return;

        const currentStep = TUTORIAL_STEPS[this.step];
        if (!currentStep) {
            this.completed = true;
            return;
        }

        if (currentStep.trigger(this.game)) {
            this.show(currentStep);
        }
    }

    /**
     * Show a tutorial step
     * @param {object} stepConfig
     */
    show(stepConfig) {
        const overlay = document.getElementById('tutorial-overlay');
        if (!overlay) return;

        const title = document.getElementById('tuto-title');
        const text = document.getElementById('tuto-text');
        const arrow = document.getElementById('tuto-arrow');
        const tip = document.getElementById('tuto-tip');

        // Set content
        title.innerText = t(`tutorial.${stepConfig.id}.title`) || stepConfig.id;
        text.innerText = t(`tutorial.${stepConfig.id}.text`) || '';

        // Set tip if exists
        const tipText = t(`tutorial.${stepConfig.id}.tip`);
        if (tip) {
            if (tipText) {
                tip.innerText = tipText;
                tip.classList.remove('hidden');
            } else {
                tip.classList.add('hidden');
            }
        }

        // Position overlay
        overlay.style.top = stepConfig.position.top;
        overlay.style.left = stepConfig.position.left;
        overlay.style.transform = 'translate(-50%, -50%)';

        // Configure arrow
        if (stepConfig.arrow) {
            arrow.classList.remove('hidden');
            const rotations = {
                'up': '0deg',
                'right': '90deg',
                'down': '180deg',
                'left': '270deg'
            };
            arrow.style.transform = `rotate(${rotations[stepConfig.arrow.direction] || '0deg'})`;

            // Position arrow based on direction
            arrow.style.top = '';
            arrow.style.bottom = '';
            arrow.style.left = '';
            arrow.style.right = '';

            switch (stepConfig.arrow.direction) {
                case 'up':
                    arrow.style.top = stepConfig.arrow.offset;
                    arrow.style.left = '50%';
                    break;
                case 'down':
                    arrow.style.bottom = stepConfig.arrow.offset;
                    arrow.style.left = '50%';
                    break;
                case 'left':
                    arrow.style.left = stepConfig.arrow.offset;
                    arrow.style.top = '50%';
                    break;
                case 'right':
                    arrow.style.right = stepConfig.arrow.offset;
                    arrow.style.top = '50%';
                    break;
            }
        } else {
            arrow.classList.add('hidden');
        }

        // Highlight element if specified
        if (stepConfig.highlight) {
            const el = document.querySelector(stepConfig.highlight);
            if (el) {
                el.classList.add('tutorial-highlight');
            }
        }

        // Show overlay
        overlay.classList.remove('hidden');

        // Announce for screen readers
        this.game.announce?.(t(`tutorial.${stepConfig.id}.title`));
    }

    /**
     * Advance to next step
     */
    next() {
        // Remove any highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });

        // Hide overlay
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) overlay.classList.add('hidden');

        this.step++;

        // Check if tutorial is complete
        if (this.step >= TUTORIAL_STEPS.length) {
            this.completed = true;
            this.game.ui?.showToast?.(t('tutorial.complete.toast') || 'Tutorial complete!', 'success');
        }

        this.game.save?.();
    }

    /**
     * Skip tutorial entirely
     */
    skip() {
        this.dismissed = true;
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) overlay.classList.add('hidden');
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        this.game.save?.();
    }

    /**
     * Reset tutorial
     */
    reset() {
        this.step = 0;
        this.completed = false;
        this.dismissed = false;
    }

    /**
     * Get current step info for debugging
     * @returns {object}
     */
    getStatus() {
        return {
            currentStep: this.step,
            totalSteps: TUTORIAL_STEPS.length,
            completed: this.completed,
            dismissed: this.dismissed,
            currentStepId: TUTORIAL_STEPS[this.step]?.id || 'done'
        };
    }
}
