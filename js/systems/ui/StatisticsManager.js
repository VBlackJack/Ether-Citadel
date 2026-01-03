/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { t } from '../../i18n.js';
import { sanitizeJsonObject } from '../../utils/HtmlSanitizer.js';

export class StatisticsManager {
    constructor(game) {
        this.game = game;
        this.stats = {
            totalPlayTime: 0,
            totalKills: 0,
            totalBosses: 0,
            totalGoldEarned: 0,
            totalDamageDealt: 0,
            highestWave: 0,
            highestCombo: 0,
            totalPrestiges: 0,
            totalAscensions: 0,
            criticalHits: 0,
            projectilesFired: 0,
            skillsUsed: 0,
            runesCollected: 0,
            relicsFound: 0,
            totalEtherEarned: 0,
            runsCompleted: 0,
            consistentRuns: 0,
            fastestWave50: Infinity,
            highestDreadCleared: 0
        };
    }

    increment(stat, amount = 1) {
        if (this.stats[stat] !== undefined) {
            this.stats[stat] += amount;
        }
    }

    setMax(stat, value) {
        if (this.stats[stat] !== undefined && value > this.stats[stat]) {
            this.stats[stat] = value;
        }
    }

    get(stat) {
        return this.stats[stat] || 0;
    }

    update(dt) {
        this.stats.totalPlayTime += dt / 1000;
    }

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}h ${m}m ${s}s`;
    }

    getSaveData() {
        return this.stats;
    }

    loadSaveData(data) {
        if (!data) return;
        Object.assign(this.stats, sanitizeJsonObject(data));
    }
}