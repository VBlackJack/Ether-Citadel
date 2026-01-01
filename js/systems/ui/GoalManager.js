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
import { formatNumber } from '../../config.js';

/**
 * Goal definitions - ordered by priority/progression
 */
const GOALS = [
    {
        id: 'firstWave',
        check: (game) => game.wave < 5,
        getText: (game) => t('goals.firstWave') || `Survive to wave 5 (${game.wave}/5)`,
        progress: (game) => game.wave / 5
    },
    {
        id: 'firstBoss',
        check: (game) => game.highestWave < 10,
        getText: (game) => t('goals.firstBoss') || `Defeat first boss at wave 10`,
        progress: (game) => game.highestWave / 10
    },
    {
        id: 'earnEther',
        check: (game) => game.ether < 1 && game.highestWave >= 10,
        getText: () => t('goals.earnEther') || `Earn your first Ether (die past wave 10)`,
        progress: () => 0
    },
    {
        id: 'firstMetaUpgrade',
        check: (game) => game.ether >= 1 && !game.metaUpgrades?.totalPurchased,
        getText: () => t('goals.firstMetaUpgrade') || `Buy your first meta upgrade`,
        progress: () => 0
    },
    {
        id: 'wave25',
        check: (game) => game.highestWave < 25,
        getText: (game) => t('goals.wave25') || `Reach wave 25 (best: ${game.highestWave})`,
        progress: (game) => game.highestWave / 25
    },
    {
        id: 'unlockResearch',
        check: (game) => !game.research?.hasAnyResearch?.(),
        getText: () => t('goals.unlockResearch') || `Unlock your first research node`,
        progress: () => 0
    },
    {
        id: 'wave50',
        check: (game) => game.highestWave < 50,
        getText: (game) => t('goals.wave50') || `Reach wave 50 (best: ${game.highestWave})`,
        progress: (game) => game.highestWave / 50
    },
    {
        id: 'unlockDread',
        check: (game) => game.highestWave >= 50 && game.dreadLevel === 0,
        getText: () => t('goals.unlockDread') || `Try Dread level 1 for bonus rewards`,
        progress: () => 0
    },
    {
        id: 'wave100',
        check: (game) => game.highestWave < 100,
        getText: (game) => t('goals.wave100') || `Reach wave 100 (best: ${game.highestWave})`,
        progress: (game) => game.highestWave / 100
    },
    {
        id: 'evolution',
        check: (game) => game.castle?.tier === 1 && game.highestWave >= 100,
        getText: () => t('goals.evolution') || `Evolve your castle (reach wave 250)`,
        progress: (game) => game.highestWave / 250
    },
    {
        id: 'wave250',
        check: (game) => game.highestWave < 250,
        getText: (game) => t('goals.wave250') || `Reach wave 250 (best: ${game.highestWave})`,
        progress: (game) => game.highestWave / 250
    },
    {
        id: 'dread5',
        check: (game) => game.highestWave >= 250 && game.dreadLevel < 5,
        getText: (game) => t('goals.dread5') || `Reach Dread level 5 (current: ${game.dreadLevel})`,
        progress: (game) => game.dreadLevel / 5
    },
    {
        id: 'endgame',
        check: () => true, // Always shown as final goal
        getText: () => t('goals.endgame') || `Master the Citadel - Push your limits!`,
        progress: () => 1
    }
];

/**
 * GoalManager - Tracks and displays the player's next objective
 */
export class GoalManager {
    constructor(game) {
        this.game = game;
        this.currentGoal = null;
        this.dismissed = new Set();
    }

    /**
     * Get the current active goal
     * @returns {object|null}
     */
    getCurrentGoal() {
        for (const goal of GOALS) {
            if (this.dismissed.has(goal.id)) continue;
            if (goal.check(this.game)) {
                return goal;
            }
        }
        return null;
    }

    /**
     * Update the goal display
     */
    update() {
        const goalEl = document.getElementById('next-goal');
        const goalTextEl = document.getElementById('next-goal-text');
        const goalProgressEl = document.getElementById('next-goal-progress');

        if (!goalEl) return;

        const goal = this.getCurrentGoal();

        if (!goal) {
            goalEl.classList.add('hidden');
            return;
        }

        this.currentGoal = goal;
        goalEl.classList.remove('hidden');

        if (goalTextEl) {
            goalTextEl.textContent = goal.getText(this.game);
        }

        if (goalProgressEl) {
            const progress = Math.min(1, goal.progress(this.game));
            goalProgressEl.style.width = `${progress * 100}%`;
        }
    }

    /**
     * Dismiss current goal (hide temporarily)
     */
    dismissCurrent() {
        if (this.currentGoal) {
            this.dismissed.add(this.currentGoal.id);
            this.update();
        }
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            dismissed: Array.from(this.dismissed)
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (data?.dismissed) {
            this.dismissed = new Set(data.dismissed);
        }
    }
}
