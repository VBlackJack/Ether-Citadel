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
 * LandmarkManager - Handles unique map landmarks with special effects
 */

import { LANDMARKS } from '../../data.js';
import { BigNumService } from '../../config.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';

export class LandmarkManager {
    constructor(game) {
        this.game = game;
        this.placedLandmarks = [];
        this.unlockedLandmarks = [];
        this.maxLandmarks = 3;
        this.effectTimers = {};
    }

    /**
     * Get available landmarks based on wave
     */
    getAvailableLandmarks() {
        const wave = this.game.wave || 0;
        return LANDMARKS.filter(l => !l.unlockWave || l.unlockWave <= wave);
    }

    /**
     * Get unlocked landmarks
     */
    getUnlockedLandmarks() {
        return LANDMARKS.filter(l => this.unlockedLandmarks.includes(l.id));
    }

    /**
     * Unlock a landmark
     */
    unlockLandmark(landmarkId) {
        if (this.unlockedLandmarks.includes(landmarkId)) return false;

        const landmark = LANDMARKS.find(l => l.id === landmarkId);
        if (!landmark) return false;

        this.unlockedLandmarks.push(landmarkId);

        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${landmark.icon} ${t('landmarks.unlocked')}!`,
                '#fbbf24',
                28
            ));
        }

        this.game.sound?.play('achievement');
        this.game.save();
        return true;
    }

    /**
     * Purchase and place a landmark
     */
    placeLandmark(landmarkId, x, y) {
        if (this.placedLandmarks.length >= this.maxLandmarks) {
            return { success: false, reason: 'maxLandmarks' };
        }

        const landmark = LANDMARKS.find(l => l.id === landmarkId);
        if (!landmark) return { success: false, reason: 'invalidLandmark' };

        // Check if already placed
        if (this.placedLandmarks.some(l => l.id === landmarkId)) {
            return { success: false, reason: 'alreadyPlaced' };
        }

        // Check cost
        if (landmark.cost.crystals && BigNumService.lt(this.game.crystals, landmark.cost.crystals)) {
            return { success: false, reason: 'notEnoughCrystals' };
        }
        if (landmark.cost.ether && BigNumService.lt(this.game.ether, landmark.cost.ether)) {
            return { success: false, reason: 'notEnoughEther' };
        }

        // Deduct cost
        if (landmark.cost.crystals) this.game.crystals = BigNumService.sub(this.game.crystals, landmark.cost.crystals);
        if (landmark.cost.ether) this.game.ether = BigNumService.sub(this.game.ether, landmark.cost.ether);

        const placed = {
            id: landmarkId,
            data: landmark,
            x,
            y,
            active: true
        };

        this.placedLandmarks.push(placed);
        this.effectTimers[landmarkId] = 0;

        this.recalculateBonuses();

        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                x,
                y,
                `${landmark.icon}`,
                '#fbbf24',
                32
            ));
        }

        this.game.sound?.play('build');
        this.game.save();

        return { success: true, landmark: placed };
    }

    /**
     * Remove a placed landmark
     */
    removeLandmark(landmarkId) {
        const index = this.placedLandmarks.findIndex(l => l.id === landmarkId);
        if (index === -1) return false;

        this.placedLandmarks.splice(index, 1);
        delete this.effectTimers[landmarkId];

        this.recalculateBonuses();
        this.game.save();
        return true;
    }

    /**
     * Recalculate bonuses from landmarks
     */
    recalculateBonuses() {
        if (!this.game.landmarkMults) {
            this.game.landmarkMults = {};
        }

        // Reset
        for (const key of Object.keys(this.game.landmarkMults)) {
            this.game.landmarkMults[key] = 0;
        }

        // Apply passive landmark effects
        for (const placed of this.placedLandmarks) {
            const effect = placed.data.effect;
            if (!effect) continue;

            if (effect.type === 'buff' || effect.type === 'passive') {
                this.game.landmarkMults[effect.stat] =
                    (this.game.landmarkMults[effect.stat] || 0) + effect.value;
            }
        }
    }

    /**
     * Update landmarks
     */
    update(dt) {
        for (const placed of this.placedLandmarks) {
            const effect = placed.data.effect;
            if (!effect) continue;

            // Update effect timers
            if (effect.interval) {
                this.effectTimers[placed.id] = (this.effectTimers[placed.id] || 0) + dt;

                if (this.effectTimers[placed.id] >= effect.interval) {
                    this.triggerEffect(placed);
                    this.effectTimers[placed.id] = 0;
                }
            }

            // Continuous effects
            this.applyContinuousEffect(placed, dt);
        }
    }

    /**
     * Trigger interval-based landmark effect
     */
    triggerEffect(placed) {
        const effect = placed.data.effect;

        switch (effect.type) {
            case 'damage':
                // Lightning/damage effect
                const enemies = this.getEnemiesInRange(placed.x, placed.y, effect.range);
                if (enemies.length > 0) {
                    let targets = enemies.slice(0, effect.chain || 1);
                    for (const enemy of targets) {
                        enemy.takeDamage(effect.damage, false, false, true);
                    }

                    if (this.game.floatingTexts) {
                        this.game.floatingTexts.push(FloatingText.create(
                            placed.x,
                            placed.y,
                            placed.data.icon,
                            '#fbbf24',
                            24
                        ));
                    }
                }
                break;

            case 'heal':
                if (this.game.castle) {
                    this.game.castle.heal(effect.value);
                }
                break;

            case 'multi':
                for (const subEffect of effect.effects) {
                    if (subEffect.type === 'heal' && this.game.castle) {
                        this.game.castle.heal(subEffect.value);
                    }
                }
                break;
        }
    }

    /**
     * Apply continuous effects
     */
    applyContinuousEffect(placed, dt) {
        const effect = placed.data.effect;

        switch (effect.type) {
            case 'slow':
                // Slow enemies in range
                const enemies = this.getEnemiesInRange(placed.x, placed.y, effect.range);
                for (const enemy of enemies) {
                    enemy.addStatusEffect?.('slow', {
                        value: effect.value,
                        duration: 100,
                        source: 'landmark'
                    });
                }
                break;

            case 'dot':
                // Damage over time to enemies in range
                const dotsTargets = this.getEnemiesInRange(placed.x, placed.y, effect.range);
                for (const enemy of dotsTargets) {
                    enemy.takeDamage(effect.damage * (dt / 1000), false, false, true);
                }
                break;

            case 'debuff':
                // Apply debuff to enemies (handled in enemy stat calculations)
                break;

            case 'passive':
                // Gold per second
                if (effect.stat === 'goldPerSecond') {
                    this.game.gold = BigNumService.add(this.game.gold, effect.value * (dt / 1000));
                }
                break;
        }
    }

    /**
     * Get enemies in range of position
     */
    getEnemiesInRange(x, y, range) {
        if (!this.game.enemies) return [];
        return this.game.enemies.filter(e => {
            const dx = e.x - x;
            const dy = e.y - y;
            return Math.sqrt(dx * dx + dy * dy) <= range;
        });
    }

    /**
     * Get buff value at position
     */
    getBuffAtPosition(x, y, stat) {
        let totalBuff = 0;

        for (const placed of this.placedLandmarks) {
            const effect = placed.data.effect;
            if (!effect || effect.type !== 'buff') continue;
            if (effect.stat !== stat && effect.stat !== 'allStats') continue;

            const dx = x - placed.x;
            const dy = y - placed.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= effect.range) {
                totalBuff += effect.value;
            }
        }

        return totalBuff;
    }

    /**
     * Get landmarks for rendering
     */
    getLandmarksForRender() {
        return this.placedLandmarks.map(l => ({
            x: l.x,
            y: l.y,
            icon: l.data.icon,
            range: l.data.effect?.range || 0,
            tier: l.data.tier,
            name: t(l.data.nameKey)
        }));
    }

    /**
     * Get all landmarks with status
     */
    getAllLandmarks() {
        return LANDMARKS.map(landmark => ({
            ...landmark,
            name: t(landmark.nameKey),
            desc: t(landmark.descKey),
            unlocked: this.unlockedLandmarks.includes(landmark.id),
            placed: this.placedLandmarks.some(l => l.id === landmark.id),
            canAfford: this.canAfford(landmark)
        }));
    }

    /**
     * Check if player can afford landmark
     */
    canAfford(landmark) {
        if (landmark.cost.crystals && BigNumService.lt(this.game.crystals, landmark.cost.crystals)) {
            return false;
        }
        if (landmark.cost.ether && BigNumService.lt(this.game.ether, landmark.cost.ether)) {
            return false;
        }
        return true;
    }

    /**
     * Clear all landmarks (for prestige)
     */
    clear() {
        this.placedLandmarks = [];
        this.effectTimers = {};
        this.recalculateBonuses();
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            unlockedLandmarks: [...this.unlockedLandmarks],
            placedLandmarks: this.placedLandmarks.map(l => ({
                id: l.id,
                x: l.x,
                y: l.y
            }))
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;

        this.unlockedLandmarks = data.unlockedLandmarks || [];
        this.placedLandmarks = [];
        this.effectTimers = {};

        if (data.placedLandmarks) {
            for (const saved of data.placedLandmarks) {
                const landmark = LANDMARKS.find(l => l.id === saved.id);
                if (landmark) {
                    this.placedLandmarks.push({
                        id: saved.id,
                        data: landmark,
                        x: saved.x,
                        y: saved.y,
                        active: true
                    });
                    this.effectTimers[saved.id] = 0;
                }
            }
        }

        this.recalculateBonuses();
    }
}
