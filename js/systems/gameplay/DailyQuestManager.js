/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { DAILY_QUEST_TYPES } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';
import { BigNumService, formatNumber } from '../../config.js';

export class DailyQuestManager {
    constructor(game) {
        this.game = game;
        this.quests = [];
        this.lastRefresh = null;
        this.progress = {};
    }

    generateQuests() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (this.lastRefresh === today) return;
        this.lastRefresh = today;
        this.quests = [];
        this.progress = {};

        const shuffled = [...DAILY_QUEST_TYPES].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);

        for (const quest of selected) {
            const difficultyMult = 1 + (this.game.stats?.maxWave || 0) * 0.05;
            const target = BigNumService.floor(
                BigNumService.mul(quest.targetBase * quest.targetMult, difficultyMult)
            );
            const reward = BigNumService.floor(
                BigNumService.mul(quest.rewardBase, difficultyMult)
            );

            this.quests.push({
                ...quest,
                target,
                reward,
                completed: false
            });
            this.progress[quest.id] = BigNumService.create(0);
        }
        this.game.save();
    }

    updateProgress(questType, amount = 1) {
        const quest = this.quests.find(q => q.id === questType && !q.completed);
        if (!quest) return;

        const currentProgress = this.progress[questType] || BigNumService.create(0);
        const addAmount = BigNumService.create(amount);
        this.progress[questType] = BigNumService.add(currentProgress, addAmount);
        // Quest ready to claim when progress >= target, but don't auto-complete
    }

    /**
     * Check if a quest is ready to claim (progress >= target but not yet claimed)
     */
    isReadyToClaim(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (!quest || quest.completed) return false;
        const progress = this.progress[questId] || BigNumService.create(0);
        return BigNumService.gte(progress, quest.target);
    }

    /**
     * Claim reward for a completed quest
     */
    claimReward(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (!quest || quest.completed) return false;

        const progress = this.progress[questId] || BigNumService.create(0);
        if (!BigNumService.gte(progress, quest.target)) return false;

        quest.completed = true;

        switch (quest.rewardType) {
            case 'gold':
                this.game.gold = BigNumService.add(this.game.gold, quest.reward);
                break;
            case 'crystals':
                this.game.crystals = BigNumService.add(this.game.crystals, quest.reward);
                this.game.updateCrystalsUI?.();
                break;
            case 'ether':
                this.game.ether = BigNumService.add(this.game.ether, quest.reward);
                this.game.updateEtherUI?.();
                break;
        }

        this.game.floatingTexts.push(FloatingText.create(
            this.game.width / 2,
            this.game.height / 2,
            `${t('quests.completed')} +${formatNumber(quest.reward)}`,
            '#22c55e',
            28
        ));
        this.game.sound.play('levelup');
        this.game.renderDailyQuestsUI();
        this.game.save();
        return true;
    }

    getTimeUntilReset() {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return tomorrow.getTime() - now.getTime();
    }

    hasClaimableReward() {
        return this.quests.some(q => this.isReadyToClaim(q.id));
    }

    hasIncompleteQuests() {
        return this.quests.some(q => !q.completed);
    }

    getSaveData() {
        // Serialize BigNum values to strings
        const serializedQuests = this.quests.map(q => ({
            ...q,
            target: q.target?.toString?.() || q.target,
            reward: q.reward?.toString?.() || q.reward
        }));

        const serializedProgress = {};
        for (const [key, value] of Object.entries(this.progress)) {
            serializedProgress[key] = value?.toString?.() || value;
        }

        return {
            quests: serializedQuests,
            lastRefresh: this.lastRefresh,
            progress: serializedProgress
        };
    }

    loadSaveData(data) {
        if (!data) return;

        // Deserialize BigNum values
        this.quests = (data.quests || []).map(q => ({
            ...q,
            target: BigNumService.create(q.target || 0),
            reward: BigNumService.create(q.reward || 0)
        }));

        this.lastRefresh = data.lastRefresh;

        this.progress = {};
        if (data.progress) {
            for (const [key, value] of Object.entries(data.progress)) {
                this.progress[key] = BigNumService.create(value || 0);
            }
        }
    }
}