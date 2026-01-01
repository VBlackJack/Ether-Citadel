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
 * CampaignManager - Handles campaign missions and progression
 */

import { CAMPAIGN_MISSIONS } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';
import { BigNumService } from '../../config.js';

export class CampaignManager {
    constructor(game) {
        this.game = game;
        this.completedMissions = {};
        this.activeMission = null;
        this.missionProgress = {};
    }

    startMission(missionId) {
        const mission = CAMPAIGN_MISSIONS.find(m => m.id === missionId);
        if (!mission) return false;
        this.activeMission = mission;
        this.missionProgress = { kills: 0, bosses: 0, wave: 0, time: 0, damageTaken: 0 };
        return true;
    }

    update(dt) {
        if (!this.activeMission) return;
        this.missionProgress.time += dt / 1000;
        this.missionProgress.wave = this.game.wave;
    }

    onKill(enemyType) {
        if (!this.activeMission) return;
        this.missionProgress.kills++;
        if (this.activeMission.objective.enemyType === enemyType) {
            this.missionProgress.targetKills = (this.missionProgress.targetKills || 0) + 1;
        }
    }

    onBossKill() {
        if (!this.activeMission) return;
        this.missionProgress.bosses++;
    }

    onDamageTaken(amount) {
        if (!this.activeMission) return;
        this.missionProgress.damageTaken += amount;
    }

    checkCompletion() {
        if (!this.activeMission) return false;
        const obj = this.activeMission.objective;
        let completed = false;

        switch (obj.type) {
            case 'wave': completed = this.missionProgress.wave >= obj.target; break;
            case 'boss': completed = this.missionProgress.bosses >= obj.target; break;
            case 'kill': completed = (this.missionProgress.targetKills || this.missionProgress.kills) >= obj.target; break;
        }

        if (completed && obj.timeLimit && this.missionProgress.time > obj.timeLimit) completed = false;
        if (completed && obj.noDamage && this.missionProgress.damageTaken > 0) completed = false;

        if (completed) {
            this.completeMission();
        }
        return completed;
    }

    completeMission() {
        if (!this.activeMission) return;
        const reward = this.activeMission.reward;
        if (reward.gold) this.game.gold = BigNumService.add(this.game.gold, BigNumService.create(reward.gold));
        if (reward.crystals) this.game.crystals = BigNumService.add(this.game.crystals, BigNumService.create(reward.crystals));
        if (reward.ether) this.game.ether = BigNumService.add(this.game.ether, BigNumService.create(reward.ether));

        this.completedMissions[this.activeMission.id] = {
            time: this.missionProgress.time,
            stars: this.calculateStars()
        };

        const color = '#22c55e';
        this.game.floatingTexts.push(FloatingText.create(
            this.game.width / 2, this.game.height / 2,
            `${t('campaign.completed')}!`, color, 36
        ));

        this.activeMission = null;
    }

    calculateStars() {
        let stars = 1;
        if (this.missionProgress.damageTaken === 0) stars++;
        if (this.activeMission.objective.timeLimit &&
            this.missionProgress.time < this.activeMission.objective.timeLimit * 0.5) stars++;
        return stars;
    }

    draw(ctx) {
        if (!this.activeMission) return;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(10, 100, 200, 60);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(t(this.activeMission.nameKey), 15, 115);
        ctx.fillStyle = '#fff';
        ctx.font = '11px Arial';
        const obj = this.activeMission.objective;
        let progress = '';
        switch (obj.type) {
            case 'wave': progress = `${t('game.wave')}: ${this.missionProgress.wave}/${obj.target}`; break;
            case 'boss': progress = `${t('enemies.BOSS.name')}: ${this.missionProgress.bosses}/${obj.target}`; break;
            case 'kill': progress = `${t('campaign.kills')}: ${this.missionProgress.kills}/${obj.target}`; break;
        }
        ctx.fillText(progress, 15, 130);
        if (obj.timeLimit) {
            const remaining = Math.max(0, obj.timeLimit - this.missionProgress.time);
            ctx.fillText(`${t('campaign.time')}: ${Math.floor(remaining)}s`, 15, 145);
        }
        ctx.restore();
    }

    isCompleted(missionId) {
        return missionId in this.completedMissions;
    }

    canAttemptMission(missionId) {
        const mission = CAMPAIGN_MISSIONS.find(m => m.id === missionId);
        if (!mission) return false;
        if (this.isCompleted(missionId)) return true; // Can replay completed missions
        // Check if prerequisites are met (previous missions in chapter completed)
        const sameChaperMissions = CAMPAIGN_MISSIONS.filter(m => m.chapter === mission.chapter && m.order < mission.order);
        return sameChaperMissions.every(m => this.isCompleted(m.id));
    }

    getSaveData() { return { completed: this.completedMissions }; }
    loadSaveData(data) { if (data) this.completedMissions = data.completed || {}; }
}