/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { DAILY_QUEST_TYPES, DAILY_CHESTS } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';
import { BigNumService, formatNumber } from '../../config.js';

export class DailyQuestManager {
    constructor(game) {
        this.game = game;
        this.quests = [];
        this.lastRefresh = null;
        this.progress = {};

        // Daily chest system
        this.loginStreak = 0;
        this.lastLoginDate = null;
        this.chestClaimed = false;

        // Ether dividends (passive income)
        this.etherDividendRate = 0;
        this.lastDividendTime = Date.now();
    }

    /**
     * Check and update login streak
     */
    checkLoginStreak() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterday = today - (24 * 60 * 60 * 1000);

        if (this.lastLoginDate === today) {
            return; // Already logged in today
        }

        if (this.lastLoginDate === yesterday) {
            // Consecutive day
            this.loginStreak = Math.min(this.loginStreak + 1, 7);
        } else if (this.lastLoginDate !== today) {
            // Streak broken or first login
            this.loginStreak = 1;
        }

        this.lastLoginDate = today;
        this.chestClaimed = false;
        this.game.save();
    }

    /**
     * Get current daily chest
     */
    getCurrentChest() {
        const day = Math.min(this.loginStreak, 7);
        return DAILY_CHESTS.find(c => c.day === day) || DAILY_CHESTS[0];
    }

    /**
     * Check if daily chest can be claimed
     */
    canClaimChest() {
        return this.loginStreak > 0 && !this.chestClaimed;
    }

    /**
     * Claim daily chest
     */
    claimChest() {
        if (!this.canClaimChest()) return false;

        const chest = this.getCurrentChest();
        const reward = chest.reward;

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
        if (reward.relic) {
            this.game.spawnRandomRelic?.(2);
        }

        this.chestClaimed = true;

        // Show notification
        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${chest.icon} ${t('dailyChest.claimed')}!`,
                '#fbbf24',
                32
            ));
        }

        this.game.sound?.play('chest');
        this.game.save();
        return true;
    }

    /**
     * Calculate ether dividend rate based on total ether earned
     */
    updateDividendRate() {
        const totalEther = this.game.statistics?.stats?.totalEtherEarned || 0;
        // 0.1% of total ether earned per hour, minimum 1
        this.etherDividendRate = Math.max(1, Math.floor(totalEther * 0.001));
    }

    /**
     * Collect ether dividends (called periodically)
     */
    collectDividends() {
        if (this.etherDividendRate <= 0) return 0;

        const now = Date.now();
        const elapsed = (now - this.lastDividendTime) / (1000 * 60 * 60); // Hours
        const dividends = Math.floor(elapsed * this.etherDividendRate);

        if (dividends > 0) {
            this.game.ether = BigNumService.add(this.game.ether, dividends);
            this.lastDividendTime = now;
            this.game.updateEtherUI?.();
            return dividends;
        }

        return 0;
    }

    /**
     * Get pending dividends without collecting
     */
    getPendingDividends() {
        if (this.etherDividendRate <= 0) return 0;
        const now = Date.now();
        const elapsed = (now - this.lastDividendTime) / (1000 * 60 * 60);
        return Math.floor(elapsed * this.etherDividendRate);
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
            progress: serializedProgress,
            loginStreak: this.loginStreak,
            lastLoginDate: this.lastLoginDate,
            chestClaimed: this.chestClaimed,
            etherDividendRate: this.etherDividendRate,
            lastDividendTime: this.lastDividendTime
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

        // Daily chest data
        this.loginStreak = data.loginStreak || 0;
        this.lastLoginDate = data.lastLoginDate || null;
        this.chestClaimed = data.chestClaimed || false;

        // Dividend data
        this.etherDividendRate = data.etherDividendRate || 0;
        this.lastDividendTime = data.lastDividendTime || Date.now();
    }
}