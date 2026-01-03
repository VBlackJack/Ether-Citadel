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
 * MilestoneManager - Handles one-time milestone rewards
 */

import { MILESTONES } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';
import { BigNumService, formatNumber } from '../../config.js';

export class MilestoneManager {
    constructor(game) {
        this.game = game;
        this.claimed = [];
    }

    /**
     * Check for newly reached milestones
     */
    checkMilestones() {
        const currentWave = this.game.stats?.maxWave || this.game.wave;
        const currentDread = this.game.dreadLevel || 0;

        for (const milestone of MILESTONES) {
            if (this.claimed.includes(milestone.id)) continue;

            let reached = false;
            if (milestone.wave && currentWave >= milestone.wave) {
                reached = true;
            }
            if (milestone.dread && currentDread >= milestone.dread) {
                reached = true;
            }

            if (reached) {
                this.claimMilestone(milestone);
            }
        }
    }

    /**
     * Claim a milestone reward
     */
    claimMilestone(milestone) {
        if (this.claimed.includes(milestone.id)) return false;

        this.claimed.push(milestone.id);
        const reward = milestone.reward;

        // Grant rewards
        if (reward.ether) {
            this.game.ether = BigNumService.add(this.game.ether, reward.ether);
            this.game.updateEtherUI?.();
        }
        if (reward.crystals) {
            this.game.crystals = BigNumService.add(this.game.crystals, reward.crystals);
            this.game.updateCrystalsUI?.();
        }
        if (reward.gold) {
            this.game.gold = BigNumService.add(this.game.gold, reward.gold);
        }
        if (reward.ascensionPoints && this.game.ascension) {
            this.game.ascension.points = BigNumService.add(
                this.game.ascension.points,
                reward.ascensionPoints
            );
        }
        if (reward.relic) {
            this.game.spawnRandomRelic?.(reward.relicTier || 2);
        }

        // Show notification
        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${milestone.icon} ${t('milestones.unlocked')}!`,
                '#fbbf24',
                36
            ));
        }

        this.game.sound?.play('achievement');
        this.game.save();
        return true;
    }

    /**
     * Get all milestones with their status
     */
    getAllMilestones() {
        const currentWave = this.game.stats?.maxWave || 0;
        const currentDread = this.game.dreadLevel || 0;

        return MILESTONES.map(m => ({
            ...m,
            claimed: this.claimed.includes(m.id),
            reachable: (m.wave && currentWave >= m.wave) || (m.dread && currentDread >= m.dread),
            progress: m.wave ? Math.min(1, currentWave / m.wave) : Math.min(1, currentDread / m.dread)
        }));
    }

    /**
     * Get next unclaimed milestone
     */
    getNextMilestone() {
        const currentWave = this.game.stats?.maxWave || 0;
        return MILESTONES.find(m =>
            !this.claimed.includes(m.id) && m.wave && m.wave > currentWave
        );
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            claimed: [...this.claimed]
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;
        this.claimed = data.claimed || [];
    }
}
