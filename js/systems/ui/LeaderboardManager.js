/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { LEADERBOARD_CATEGORIES } from '../../data.js';
import { t } from '../../i18n.js';

export class LeaderboardManager {
    constructor(game) {
        this.game = game;
        this.entries = {};
        for (const cat of LEADERBOARD_CATEGORIES) {
            this.entries[cat.id] = [];
        }
    }

    addEntry(category, value, name = 'Player') {
        if (!this.entries[category]) return;
        const entry = { name, value, date: Date.now() };
        this.entries[category].push(entry);
        const cat = LEADERBOARD_CATEGORIES.find(c => c.id === category);
        this.entries[category].sort((a, b) => cat.sortDesc ? b.value - a.value : a.value - b.value);
        this.entries[category] = this.entries[category].slice(0, 10);
        this.game.save();
    }

    getTopEntries(category, limit = 10) {
        return (this.entries[category] || []).slice(0, limit);
    }

    getPersonalBest(category) {
        const entries = this.entries[category] || [];
        return entries[0]?.value || 0;
    }

    getSaveData() { return { entries: this.entries }; }
    loadSaveData(data) { if (data) this.entries = data.entries || {}; }
}