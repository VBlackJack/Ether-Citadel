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
 * WorldManager - Handles world/planet progression system
 */

import { WORLDS, WORLD_HAZARDS } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';

export class WorldManager {
    constructor(game) {
        this.game = game;
        this.currentWorld = 'grasslands';
        this.worldProgress = {};
        this.unlockedWorlds = ['grasslands'];
        this.worldCompletions = {};
        this.activeHazards = [];
        this.hazardTimers = {};

        // Initialize progress
        for (const world of WORLDS) {
            this.worldProgress[world.id] = 0;
            this.worldCompletions[world.id] = 0;
        }
    }

    /**
     * Get current world data
     */
    getCurrentWorld() {
        return WORLDS.find(w => w.id === this.currentWorld);
    }

    /**
     * Get available worlds
     */
    getAvailableWorlds() {
        return WORLDS.filter(w => this.unlockedWorlds.includes(w.id));
    }

    /**
     * Check if a world is unlocked
     */
    isWorldUnlocked(worldId) {
        return this.unlockedWorlds.includes(worldId);
    }

    /**
     * Unlock a world
     */
    unlockWorld(worldId) {
        if (this.unlockedWorlds.includes(worldId)) return false;

        const world = WORLDS.find(w => w.id === worldId);
        if (!world) return false;

        this.unlockedWorlds.push(worldId);

        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${world.icon} ${t('worlds.unlocked')}!`,
                world.background,
                32
            ));
        }

        this.game.sound?.play('achievement');
        this.game.save();
        return true;
    }

    /**
     * Select a world to play
     */
    selectWorld(worldId) {
        if (!this.unlockedWorlds.includes(worldId)) return false;

        const world = WORLDS.find(w => w.id === worldId);
        if (!world) return false;

        this.currentWorld = worldId;
        this.applyWorldModifiers();
        this.setupHazards();

        this.game.sound?.play('select');
        this.game.save();
        return true;
    }

    /**
     * Apply world modifiers to game
     */
    applyWorldModifiers() {
        const world = this.getCurrentWorld();
        if (!world || !this.game.worldMods) {
            this.game.worldMods = {};
        }

        // Reset modifiers
        this.game.worldMods = {};

        if (world?.modifiers) {
            for (const [key, value] of Object.entries(world.modifiers)) {
                this.game.worldMods[key] = value;
            }
        }

        // Apply reward multipliers
        if (world?.rewards) {
            this.game.worldMods.goldMult = world.rewards.goldMult || 1;
            this.game.worldMods.etherMult = world.rewards.etherMult || 1;
        }
    }

    /**
     * Setup hazards for current world
     */
    setupHazards() {
        const world = this.getCurrentWorld();
        this.activeHazards = [];
        this.hazardTimers = {};

        if (!world?.hazards) return;

        for (const hazardId of world.hazards) {
            const hazard = WORLD_HAZARDS[hazardId];
            if (hazard) {
                this.activeHazards.push({
                    id: hazardId,
                    ...hazard
                });
                this.hazardTimers[hazardId] = hazard.interval || 5000;
            }
        }
    }

    /**
     * Get world modifiers
     */
    getWorldModifiers() {
        return this.game.worldMods || {};
    }

    /**
     * Get reward multipliers for current world
     */
    getRewardMultipliers() {
        const world = this.getCurrentWorld();
        return world?.rewards || { goldMult: 1, etherMult: 1 };
    }

    /**
     * Update world progress after wave
     */
    updateProgress(wave) {
        const world = this.getCurrentWorld();
        if (!world) return;

        this.worldProgress[this.currentWorld] = Math.max(
            this.worldProgress[this.currentWorld] || 0,
            wave
        );

        // Check if world is complete
        if (wave >= world.waves) {
            this.completeWorld();
        }

        // Check for world unlocks
        this.checkWorldUnlocks(wave);
    }

    /**
     * Complete current world
     */
    completeWorld() {
        const world = this.getCurrentWorld();
        if (!world) return;

        this.worldCompletions[this.currentWorld] =
            (this.worldCompletions[this.currentWorld] || 0) + 1;

        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${world.icon} ${t('worlds.complete')}!`,
                '#22c55e',
                36
            ));
        }

        this.game.sound?.play('victory');
    }

    /**
     * Check if any new worlds should be unlocked
     */
    checkWorldUnlocks(wave) {
        const highestWave = this.game.highestWave || wave;

        for (const world of WORLDS) {
            if (!this.unlockedWorlds.includes(world.id) &&
                highestWave >= world.unlockWave) {
                this.unlockWorld(world.id);
            }
        }
    }

    /**
     * Update hazards
     */
    update(dt) {
        for (const hazard of this.activeHazards) {
            if (this.hazardTimers[hazard.id] !== undefined) {
                this.hazardTimers[hazard.id] -= dt;

                if (this.hazardTimers[hazard.id] <= 0) {
                    this.triggerHazard(hazard);
                    this.hazardTimers[hazard.id] = hazard.interval || 5000;
                }
            }
        }
    }

    /**
     * Trigger a hazard effect
     */
    triggerHazard(hazard) {
        switch (hazard.id) {
            case 'lava_pools':
                // Damage castle
                this.game.castle?.takeDamage(hazard.damage);
                break;

            case 'meteor_showers':
                // Random area damage
                if (this.game.enemies?.length > 0) {
                    const randomEnemy = this.game.enemies[
                        Math.floor(Math.random() * this.game.enemies.length)
                    ];
                    const nearby = this.game.enemies.filter(e => {
                        const dx = e.x - randomEnemy.x;
                        const dy = e.y - randomEnemy.y;
                        return Math.sqrt(dx * dx + dy * dy) <= hazard.aoe;
                    });
                    for (const e of nearby) {
                        e.takeDamage(hazard.damage, false, false, true);
                    }

                    if (this.game.floatingTexts) {
                        this.game.floatingTexts.push(FloatingText.create(
                            randomEnemy.x,
                            randomEnemy.y,
                            hazard.visual,
                            '#ef4444',
                            32
                        ));
                    }
                }
                break;

            case 'ice_patches':
                // Slow random enemies
                if (this.game.enemies?.length > 0) {
                    for (const enemy of this.game.enemies) {
                        if (Math.random() < hazard.slipChance) {
                            enemy.addStatusEffect?.('slow', {
                                value: hazard.slow,
                                duration: 2000
                            });
                        }
                    }
                }
                break;

            case 'shadow_zones':
                // Chance to miss attacks
                this.game.shadowMissChance = hazard.missChance;
                setTimeout(() => {
                    this.game.shadowMissChance = 0;
                }, 3000);
                break;

            case 'void_rifts':
                // Random teleport enemies forward
                if (this.game.enemies?.length > 0) {
                    for (const enemy of this.game.enemies) {
                        if (Math.random() < hazard.teleportChance) {
                            enemy.x -= 100; // Teleport forward
                            enemy.takeDamage(hazard.damage, false, false, true);
                        }
                    }
                }
                break;
        }
    }

    /**
     * Get enemy types for current world
     */
    getEnemyTypes() {
        const world = this.getCurrentWorld();
        if (!world) return ['basic'];

        if (world.enemyTypes.includes('all')) {
            return null; // Use all enemy types
        }
        return world.enemyTypes;
    }

    /**
     * Get boss key for current world
     */
    getBossKey() {
        const world = this.getCurrentWorld();
        return world?.bossKey || null;
    }

    /**
     * Get all worlds with status
     */
    getAllWorlds() {
        return WORLDS.map(world => ({
            ...world,
            name: t(world.nameKey),
            desc: t(world.descKey),
            unlocked: this.unlockedWorlds.includes(world.id),
            current: world.id === this.currentWorld,
            progress: this.worldProgress[world.id] || 0,
            completions: this.worldCompletions[world.id] || 0
        }));
    }

    /**
     * Get total world completions
     */
    getTotalCompletions() {
        return Object.values(this.worldCompletions).reduce((a, b) => a + b, 0);
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            currentWorld: this.currentWorld,
            unlockedWorlds: [...this.unlockedWorlds],
            worldProgress: { ...this.worldProgress },
            worldCompletions: { ...this.worldCompletions }
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;

        this.currentWorld = data.currentWorld || 'grasslands';
        this.unlockedWorlds = data.unlockedWorlds || ['grasslands'];
        this.worldProgress = data.worldProgress || {};
        this.worldCompletions = data.worldCompletions || {};

        // Ensure all worlds have progress entries
        for (const world of WORLDS) {
            if (this.worldProgress[world.id] === undefined) {
                this.worldProgress[world.id] = 0;
            }
            if (this.worldCompletions[world.id] === undefined) {
                this.worldCompletions[world.id] = 0;
            }
        }

        this.applyWorldModifiers();
        this.setupHazards();
    }
}
