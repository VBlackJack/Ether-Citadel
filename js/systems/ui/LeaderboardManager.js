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