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
 * TalentManager - Handles talent trees
 */

import { TALENT_TREES } from '../../data.js';
import { t } from '../../i18n.js';

export class TalentManager {
    constructor(game) {
        this.game = game;
        this.points = 0;
        this.allocated = {};
    }

    getPoints() {
        return this.points;
    }

    addPoints(amount) {
        this.points += amount;
    }

    canAllocate(talentId) {
        const talent = this.findTalent(talentId);
        if (!talent) return false;
        const current = this.allocated[talentId] || 0;
        if (current >= talent.max) return false;
        if (this.points < talent.cost) return false;
        if (talent.requires) {
            for (const req of talent.requires) {
                if (!this.allocated[req] || this.allocated[req] === 0) return false;
            }
        }
        return true;
    }

    allocate(talentId) {
        if (!this.canAllocate(talentId)) return false;
        const talent = this.findTalent(talentId);
        this.allocated[talentId] = (this.allocated[talentId] || 0) + 1;
        this.points -= talent.cost;
        this.game.save();
        return true;
    }

    findTalent(talentId) {
        for (const tree of TALENT_TREES) {
            const talent = tree.talents.find(t => t.id === talentId);
            if (talent) return talent;
        }
        return null;
    }

    getLevel(talentId) {
        return this.allocated[talentId] || 0;
    }

    getTotalEffects() {
        const effects = {};
        for (const tree of TALENT_TREES) {
            for (const talent of tree.talents) {
                const level = this.getLevel(talent.id);
                if (level > 0) {
                    for (const [key, value] of Object.entries(talent.effect)) {
                        effects[key] = (effects[key] || 0) + value * level;
                    }
                }
            }
        }
        return effects;
    }

    reset() {
        let refund = 0;
        for (const tree of TALENT_TREES) {
            for (const talent of tree.talents) {
                const level = this.allocated[talent.id] || 0;
                refund += level * talent.cost;
            }
        }
        this.allocated = {};
        this.points += refund;
        this.game.save();
    }

    getSaveData() {
        return { points: this.points, allocated: this.allocated };
    }

    loadSaveData(data) {
        if (!data) return;
        this.points = data.points || 0;
        this.allocated = data.allocated || {};
    }
}