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
 * MazingManager - Handles wall placement and trap systems for path manipulation
 */

import { WALL_TYPES, TRAP_TYPES } from '../../data.js';
import { BigNumService } from '../../config.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';

export class MazingManager {
    constructor(game) {
        this.game = game;
        this.walls = [];
        this.traps = [];
        this.maxWalls = 20;
        this.maxTraps = 10;
        this.gridSize = 40;
        this.pathCache = null;
    }

    /**
     * Get available wall types based on wave
     */
    getAvailableWalls() {
        const wave = this.game.wave || 0;
        return WALL_TYPES.filter(w => !w.unlockWave || w.unlockWave <= wave);
    }

    /**
     * Get available trap types based on wave
     */
    getAvailableTraps() {
        const wave = this.game.wave || 0;
        return TRAP_TYPES.filter(t => !t.unlockWave || t.unlockWave <= wave);
    }

    /**
     * Place a wall at grid position
     */
    placeWall(wallId, gridX, gridY) {
        if (this.walls.length >= this.maxWalls) {
            return { success: false, reason: 'maxWalls' };
        }

        const wallType = WALL_TYPES.find(w => w.id === wallId);
        if (!wallType) return { success: false, reason: 'invalidWall' };

        // Check if position is valid
        if (!this.isValidPlacement(gridX, gridY)) {
            return { success: false, reason: 'invalidPosition' };
        }

        // Check if would block path completely
        if (this.wouldBlockPath(gridX, gridY)) {
            return { success: false, reason: 'wouldBlockPath' };
        }

        // Check cost
        if (BigNumService.lt(this.game.gold, wallType.cost)) {
            return { success: false, reason: 'notEnoughGold' };
        }

        this.game.gold = BigNumService.sub(this.game.gold, wallType.cost);

        const wall = {
            id: wallId,
            type: wallType,
            gridX,
            gridY,
            x: gridX * this.gridSize,
            y: gridY * this.gridSize,
            hp: wallType.hp,
            maxHp: wallType.hp
        };

        this.walls.push(wall);
        this.invalidatePathCache();

        this.game.sound?.play('build');
        return { success: true, wall };
    }

    /**
     * Place a trap at grid position
     */
    placeTrap(trapId, gridX, gridY) {
        if (this.traps.length >= this.maxTraps) {
            return { success: false, reason: 'maxTraps' };
        }

        const trapType = TRAP_TYPES.find(t => t.id === trapId);
        if (!trapType) return { success: false, reason: 'invalidTrap' };

        // Traps must be on the path, not blocking it
        if (this.hasWallAt(gridX, gridY)) {
            return { success: false, reason: 'wallBlocking' };
        }

        if (this.hasTrapAt(gridX, gridY)) {
            return { success: false, reason: 'trapExists' };
        }

        if (BigNumService.lt(this.game.gold, trapType.cost)) {
            return { success: false, reason: 'notEnoughGold' };
        }

        this.game.gold = BigNumService.sub(this.game.gold, trapType.cost);

        const trap = {
            id: trapId,
            type: trapType,
            gridX,
            gridY,
            x: gridX * this.gridSize + this.gridSize / 2,
            y: gridY * this.gridSize + this.gridSize / 2,
            cooldownRemaining: 0
        };

        this.traps.push(trap);

        this.game.sound?.play('build');
        return { success: true, trap };
    }

    /**
     * Remove wall at position
     */
    removeWall(gridX, gridY) {
        const index = this.walls.findIndex(w => w.gridX === gridX && w.gridY === gridY);
        if (index === -1) return false;

        const wall = this.walls[index];
        // Refund partial cost based on HP
        const refund = Math.floor(wall.type.cost * 0.5 * (wall.hp / wall.maxHp));
        this.game.gold += refund;

        this.walls.splice(index, 1);
        this.invalidatePathCache();

        return true;
    }

    /**
     * Remove trap at position
     */
    removeTrap(gridX, gridY) {
        const index = this.traps.findIndex(t => t.gridX === gridX && t.gridY === gridY);
        if (index === -1) return false;

        const trap = this.traps[index];
        // Refund partial cost
        this.game.gold += Math.floor(trap.type.cost * 0.3);

        this.traps.splice(index, 1);
        return true;
    }

    /**
     * Check if position has a wall
     */
    hasWallAt(gridX, gridY) {
        return this.walls.some(w => w.gridX === gridX && w.gridY === gridY);
    }

    /**
     * Check if position has a trap
     */
    hasTrapAt(gridX, gridY) {
        return this.traps.some(t => t.gridX === gridX && t.gridY === gridY);
    }

    /**
     * Check if placement position is valid
     */
    isValidPlacement(gridX, gridY) {
        // Check bounds
        const maxGridX = Math.floor(this.game.width / this.gridSize);
        const maxGridY = Math.floor(this.game.height / this.gridSize);

        if (gridX < 0 || gridX >= maxGridX || gridY < 0 || gridY >= maxGridY) {
            return false;
        }

        // Check if already occupied
        if (this.hasWallAt(gridX, gridY)) {
            return false;
        }

        // Check if on castle position
        const castleGridX = Math.floor((this.game.castle?.x || 100) / this.gridSize);
        const castleGridY = Math.floor((this.game.castle?.y || this.game.height / 2) / this.gridSize);
        if (Math.abs(gridX - castleGridX) <= 1 && Math.abs(gridY - castleGridY) <= 1) {
            return false;
        }

        return true;
    }

    /**
     * Check if placing wall would completely block path
     */
    wouldBlockPath(gridX, gridY) {
        // Simplified check - in a real implementation, use pathfinding
        // For now, just ensure there's always a gap
        const adjacentWalls = this.walls.filter(w =>
            Math.abs(w.gridX - gridX) <= 1 && Math.abs(w.gridY - gridY) <= 1
        );
        return adjacentWalls.length >= 7; // Nearly surrounded
    }

    /**
     * Invalidate path cache when walls change
     */
    invalidatePathCache() {
        this.pathCache = null;
        // Notify game to recalculate enemy paths
        this.game.recalculatePaths?.();
    }

    /**
     * Update traps and walls
     */
    update(dt) {
        // Update trap cooldowns
        for (const trap of this.traps) {
            if (trap.cooldownRemaining > 0) {
                trap.cooldownRemaining -= dt;
            }
        }

        // Check trap triggers
        this.checkTrapTriggers();

        // Check wall damage from enemies
        this.checkWallDamage(dt);
    }

    /**
     * Check if enemies trigger traps
     */
    checkTrapTriggers() {
        if (!this.game.enemies) return;

        for (const trap of this.traps) {
            if (trap.cooldownRemaining > 0) continue;

            for (const enemy of this.game.enemies) {
                const dx = enemy.x - trap.x;
                const dy = enemy.y - trap.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.gridSize / 2) {
                    this.triggerTrap(trap, enemy);
                    break;
                }
            }
        }
    }

    /**
     * Trigger a trap effect
     */
    triggerTrap(trap, enemy) {
        const type = trap.type;

        // Apply damage
        if (type.damage) {
            const targets = type.aoe ? this.getEnemiesInRange(trap.x, trap.y, type.aoe) : [enemy];
            for (const target of targets) {
                target.takeDamage(type.damage, false, false, true);
            }
        }

        // Apply DoT
        if (type.dot) {
            enemy.addStatusEffect?.('poison', type.dot);
        }

        // Apply slow
        if (type.slow) {
            enemy.addStatusEffect?.('slow', { value: type.slow, duration: type.duration });
        }

        // Chain effect
        if (type.chain) {
            this.chainDamage(trap.x, trap.y, type.damage, type.chain);
        }

        // Pull effect
        if (type.pull) {
            const nearby = this.getEnemiesInRange(trap.x, trap.y, 150);
            for (const e of nearby) {
                e.pullTowards?.(trap.x, trap.y, 50);
            }
        }

        // Visual effect
        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                trap.x,
                trap.y,
                type.icon,
                '#fbbf24',
                24
            ));
        }

        // Set cooldown
        trap.cooldownRemaining = type.cooldown;
        this.game.sound?.play('trap');
    }

    /**
     * Get enemies in range
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
     * Chain damage to nearby enemies
     */
    chainDamage(x, y, damage, chains) {
        let currentX = x;
        let currentY = y;
        const hit = new Set();

        for (let i = 0; i < chains; i++) {
            const nearby = this.getEnemiesInRange(currentX, currentY, 100)
                .filter(e => !hit.has(e));

            if (nearby.length === 0) break;

            const target = nearby[0];
            target.takeDamage(damage * 0.7, false, false, true);
            hit.add(target);
            currentX = target.x;
            currentY = target.y;
        }
    }

    /**
     * Check if walls take damage from enemies
     */
    checkWallDamage(dt) {
        if (!this.game.enemies) return;

        for (let i = this.walls.length - 1; i >= 0; i--) {
            const wall = this.walls[i];

            for (const enemy of this.game.enemies) {
                const dx = enemy.x - wall.x - this.gridSize / 2;
                const dy = enemy.y - wall.y - this.gridSize / 2;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.gridSize) {
                    // Enemy is at wall, wall takes damage
                    wall.hp -= (enemy.damage || 1) * (dt / 1000);

                    // Wall effect on enemy
                    if (wall.type.effect?.damage) {
                        enemy.takeDamage(wall.type.effect.damage * (dt / 1000), false, false, true);
                    }

                    if (wall.hp <= 0) {
                        this.walls.splice(i, 1);
                        this.invalidatePathCache();

                        if (this.game.floatingTexts) {
                            this.game.floatingTexts.push(FloatingText.create(
                                wall.x + this.gridSize / 2,
                                wall.y + this.gridSize / 2,
                                t('mazing.destroyed'),
                                '#ef4444',
                                20
                            ));
                        }
                        break;
                    }
                }
            }
        }
    }

    /**
     * Get slow multiplier for position
     */
    getSlowAtPosition(x, y) {
        const gridX = Math.floor(x / this.gridSize);
        const gridY = Math.floor(y / this.gridSize);

        // Check adjacent walls
        let slowMult = 1.0;
        for (const wall of this.walls) {
            const dx = Math.abs(wall.gridX - gridX);
            const dy = Math.abs(wall.gridY - gridY);
            if (dx <= 1 && dy <= 1) {
                slowMult = Math.min(slowMult, wall.type.slowMult);
            }
        }

        return slowMult;
    }

    /**
     * Get walls for rendering
     */
    getWallsForRender() {
        return this.walls.map(w => ({
            x: w.x,
            y: w.y,
            width: this.gridSize,
            height: this.gridSize,
            hp: w.hp,
            maxHp: w.maxHp,
            icon: w.type.icon,
            tier: w.type.tier
        }));
    }

    /**
     * Get traps for rendering
     */
    getTrapsForRender() {
        return this.traps.map(t => ({
            x: t.x,
            y: t.y,
            icon: t.type.icon,
            ready: t.cooldownRemaining <= 0,
            cooldownPercent: t.cooldownRemaining > 0 ?
                t.cooldownRemaining / t.type.cooldown : 0
        }));
    }

    /**
     * Clear all walls and traps
     */
    clear() {
        this.walls = [];
        this.traps = [];
        this.invalidatePathCache();
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            walls: this.walls.map(w => ({
                id: w.id,
                gridX: w.gridX,
                gridY: w.gridY,
                hp: w.hp
            })),
            traps: this.traps.map(t => ({
                id: t.id,
                gridX: t.gridX,
                gridY: t.gridY
            }))
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;

        this.walls = [];
        this.traps = [];

        if (data.walls) {
            for (const saved of data.walls) {
                const wallType = WALL_TYPES.find(w => w.id === saved.id);
                if (wallType) {
                    this.walls.push({
                        id: saved.id,
                        type: wallType,
                        gridX: saved.gridX,
                        gridY: saved.gridY,
                        x: saved.gridX * this.gridSize,
                        y: saved.gridY * this.gridSize,
                        hp: saved.hp,
                        maxHp: wallType.hp
                    });
                }
            }
        }

        if (data.traps) {
            for (const saved of data.traps) {
                const trapType = TRAP_TYPES.find(t => t.id === saved.id);
                if (trapType) {
                    this.traps.push({
                        id: saved.id,
                        type: trapType,
                        gridX: saved.gridX,
                        gridY: saved.gridY,
                        x: saved.gridX * this.gridSize + this.gridSize / 2,
                        y: saved.gridY * this.gridSize + this.gridSize / 2,
                        cooldownRemaining: 0
                    });
                }
            }
        }

        this.invalidatePathCache();
    }
}
