/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { DAILY_QUEST_TYPES } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';

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
            const target = Math.floor(quest.targetBase * quest.targetMult * difficultyMult);
            const reward = Math.floor(quest.rewardBase * difficultyMult);

            this.quests.push({
                ...quest,
                target,
                reward,
                completed: false
            });
            this.progress[quest.id] = 0;
        }
        this.game.save();
    }

    updateProgress(questType, amount = 1) {
        const quest = this.quests.find(q => q.id === questType && !q.completed);
        if (!quest) return;

        this.progress[questType] = (this.progress[questType] || 0) + amount;

        if (this.progress[questType] >= quest.target) {
            this.completeQuest(quest);
        }
    }

    completeQuest(quest) {
        quest.completed = true;

        switch (quest.rewardType) {
            case 'gold':
                this.game.gold += quest.reward;
                break;
            case 'crystals':
                this.game.crystals += quest.reward;
                this.game.updateCrystalsUI();
                break;
            case 'ether':
                this.game.ether += quest.reward;
                this.game.updateEtherUI();
                break;
        }

        this.game.floatingTexts.push(FloatingText.create(
            this.game.width / 2,
            this.game.height / 2,
            `${t('quests.completed')} +${quest.reward}`,
            '#22c55e',
            28
        ));
        this.game.sound.play('levelup');
        this.game.save();
    }

    getTimeUntilReset() {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return tomorrow.getTime() - now.getTime();
    }

    hasClaimableReward() {
        return this.quests.some(q =>
            !q.completed &&
            (this.progress[q.id] || 0) >= q.target
        );
    }

    hasIncompleteQuests() {
        return this.quests.some(q => !q.completed);
    }

    getSaveData() {
        return {
            quests: this.quests,
            lastRefresh: this.lastRefresh,
            progress: this.progress
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.quests = data.quests || [];
        this.lastRefresh = data.lastRefresh;
        this.progress = data.progress || {};
    }
}