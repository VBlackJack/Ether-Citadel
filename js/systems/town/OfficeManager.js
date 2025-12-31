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
 * OfficeManager - Handles premium boosts
 */

import { OFFICE_BOOSTS } from '../../data.js';

export class OfficeManager {
    constructor(game) {
        this.game = game;
        this.gems = 0;
        this.activeBoosts = {};
    }

    canAfford(boostId) {
        const boost = OFFICE_BOOSTS.find(b => b.id === boostId);
        return boost && this.gems >= boost.baseCost;
    }

    activateBoost(boostId) {
        const boost = OFFICE_BOOSTS.find(b => b.id === boostId);
        if (!boost || this.gems < boost.baseCost) return false;

        this.gems -= boost.baseCost;
        this.activeBoosts[boostId] = {
            remaining: boost.duration,
            mult: boost.mult,
            effect: boost.effect
        };
        this.game.save();
        return true;
    }

    update(dt) {
        Object.keys(this.activeBoosts).forEach(id => {
            this.activeBoosts[id].remaining -= dt / 1000;
            if (this.activeBoosts[id].remaining <= 0) {
                delete this.activeBoosts[id];
            }
        });
    }

    getBoostMult(effectType) {
        let mult = 1;
        Object.values(this.activeBoosts).forEach(boost => {
            if (boost.effect === effectType) {
                mult *= boost.mult;
            }
        });
        return mult;
    }

    hasActiveBoost(boostId) {
        return !!this.activeBoosts[boostId];
    }

    getActiveBoosts() {
        return Object.entries(this.activeBoosts).map(([id, data]) => ({
            id,
            ...data,
            boost: OFFICE_BOOSTS.find(b => b.id === id)
        }));
    }

    addGems(amount) {
        this.gems += amount;
    }

    getSaveData() {
        return {
            gems: this.gems,
            activeBoosts: this.activeBoosts
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.gems = data.gems || 0;
        this.activeBoosts = data.activeBoosts || {};
    }
}