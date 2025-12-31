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
 * TargetingSystem - Handles target acquisition for turrets
 * Supports multiple targeting modes and priority systems
 */

/**
 * Targeting modes
 */
export const TargetingMode = {
    NEAREST: 'nearest',      // Target closest enemy
    FURTHEST: 'furthest',    // Target enemy closest to castle
    STRONGEST: 'strongest',  // Target highest HP enemy
    WEAKEST: 'weakest',      // Target lowest HP enemy
    FASTEST: 'fastest',      // Target fastest enemy
    CLUSTER: 'cluster',      // Target center of enemy cluster
    BOSS: 'boss',            // Prioritize bosses
    FLYING: 'flying'         // Prioritize flying enemies
};

export class TargetingSystem {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
    }

    /**
     * Find a target for a turret
     * @param {object} turret - Turret looking for target
     * @param {string} mode - Targeting mode
     * @param {number} range - Maximum range
     * @returns {object|null} Target enemy or null
     */
    findTarget(turret, mode = TargetingMode.NEAREST, range = 150) {
        const enemies = this.getEnemiesInRange(turret.x, turret.y, range);

        if (enemies.length === 0) return null;

        switch (mode) {
            case TargetingMode.NEAREST:
                return this.findNearest(turret, enemies);
            case TargetingMode.FURTHEST:
                return this.findFurthest(enemies);
            case TargetingMode.STRONGEST:
                return this.findStrongest(enemies);
            case TargetingMode.WEAKEST:
                return this.findWeakest(enemies);
            case TargetingMode.FASTEST:
                return this.findFastest(enemies);
            case TargetingMode.CLUSTER:
                return this.findClusterCenter(enemies);
            case TargetingMode.BOSS:
                return this.findBoss(enemies) || this.findNearest(turret, enemies);
            case TargetingMode.FLYING:
                return this.findFlying(enemies) || this.findNearest(turret, enemies);
            default:
                return this.findNearest(turret, enemies);
        }
    }

    /**
     * Get all enemies within range of a point
     * @param {number} x
     * @param {number} y
     * @param {number} range
     * @returns {Array}
     */
    getEnemiesInRange(x, y, range) {
        if (!this.game.enemies) return [];

        const rangeSquared = range * range;
        return this.game.enemies.filter(enemy => {
            if (enemy.dead) return false;
            const distSq = this.distanceSquared(x, y, enemy.x, enemy.y);
            return distSq <= rangeSquared;
        });
    }

    /**
     * Find nearest enemy to turret
     * @param {object} turret
     * @param {Array} enemies
     * @returns {object|null}
     */
    findNearest(turret, enemies) {
        let nearest = null;
        let minDistSq = Infinity;

        for (const enemy of enemies) {
            const distSq = this.distanceSquared(turret.x, turret.y, enemy.x, enemy.y);
            if (distSq < minDistSq) {
                minDistSq = distSq;
                nearest = enemy;
            }
        }

        return nearest;
    }

    /**
     * Find enemy closest to castle (furthest along path)
     * @param {Array} enemies
     * @returns {object|null}
     */
    findFurthest(enemies) {
        if (!this.game.castle) return enemies[0];

        let furthest = null;
        let minDistToCastleSq = Infinity;

        for (const enemy of enemies) {
            const distSq = this.distanceSquared(enemy.x, enemy.y, this.game.castle.x, this.game.castle.y);
            if (distSq < minDistToCastleSq) {
                minDistToCastleSq = distSq;
                furthest = enemy;
            }
        }

        return furthest;
    }

    /**
     * Find enemy with highest HP
     * @param {Array} enemies
     * @returns {object|null}
     */
    findStrongest(enemies) {
        let strongest = null;
        let maxHp = -Infinity;

        for (const enemy of enemies) {
            if (enemy.hp > maxHp) {
                maxHp = enemy.hp;
                strongest = enemy;
            }
        }

        return strongest;
    }

    /**
     * Find enemy with lowest HP
     * @param {Array} enemies
     * @returns {object|null}
     */
    findWeakest(enemies) {
        let weakest = null;
        let minHp = Infinity;

        for (const enemy of enemies) {
            if (enemy.hp < minHp) {
                minHp = enemy.hp;
                weakest = enemy;
            }
        }

        return weakest;
    }

    /**
     * Find fastest enemy
     * @param {Array} enemies
     * @returns {object|null}
     */
    findFastest(enemies) {
        let fastest = null;
        let maxSpeed = -Infinity;

        for (const enemy of enemies) {
            const speed = enemy.speed || 1;
            if (speed > maxSpeed) {
                maxSpeed = speed;
                fastest = enemy;
            }
        }

        return fastest;
    }

    /**
     * Find center of enemy cluster
     * @param {Array} enemies
     * @returns {object|null}
     */
    findClusterCenter(enemies) {
        if (enemies.length === 0) return null;
        if (enemies.length === 1) return enemies[0];

        // Calculate center of mass
        let sumX = 0, sumY = 0;
        for (const enemy of enemies) {
            sumX += enemy.x;
            sumY += enemy.y;
        }
        const centerX = sumX / enemies.length;
        const centerY = sumY / enemies.length;

        // Find enemy closest to center
        let closest = null;
        let minDistSq = Infinity;

        for (const enemy of enemies) {
            const distSq = this.distanceSquared(centerX, centerY, enemy.x, enemy.y);
            if (distSq < minDistSq) {
                minDistSq = distSq;
                closest = enemy;
            }
        }

        return closest;
    }

    /**
     * Find boss enemy
     * @param {Array} enemies
     * @returns {object|null}
     */
    findBoss(enemies) {
        return enemies.find(e => e.type === 'BOSS' || e.type === 'MEGA_BOSS') || null;
    }

    /**
     * Find flying enemy
     * @param {Array} enemies
     * @returns {object|null}
     */
    findFlying(enemies) {
        return enemies.find(e => e.flying) || null;
    }

    /**
     * Find all enemies in splash radius
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Splash radius
     * @returns {Array}
     */
    getEnemiesInSplash(x, y, radius) {
        return this.getEnemiesInRange(x, y, radius);
    }

    /**
     * Find chain targets for chain lightning effect
     * @param {object} startEnemy - Initial target
     * @param {number} chainCount - Number of chains
     * @param {number} chainRange - Range for chain
     * @returns {Array}
     */
    findChainTargets(startEnemy, chainCount, chainRange = 100) {
        const targets = [startEnemy];
        let current = startEnemy;

        for (let i = 0; i < chainCount; i++) {
            const nearby = this.getEnemiesInRange(current.x, current.y, chainRange)
                .filter(e => !targets.includes(e));

            if (nearby.length === 0) break;

            // Find nearest not already targeted
            const next = this.findNearest({ x: current.x, y: current.y }, nearby);
            if (next) {
                targets.push(next);
                current = next;
            }
        }

        return targets;
    }

    /**
     * Calculate distance between two points
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @returns {number}
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    /**
     * Calculate squared distance (faster, avoids sqrt)
     * Use for comparisons where actual distance value is not needed
     */
    distanceSquared(x1, y1, x2, y2) {
        return (x2 - x1) ** 2 + (y2 - y1) ** 2;
    }

    /**
     * Check if point is in range
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {number} range
     * @returns {boolean}
     */
    inRange(x1, y1, x2, y2, range) {
        return this.distanceSquared(x1, y1, x2, y2) <= range * range;
    }

    /**
     * Get angle from source to target
     * @param {number} x1 - Source X
     * @param {number} y1 - Source Y
     * @param {number} x2 - Target X
     * @param {number} y2 - Target Y
     * @returns {number} Angle in radians
     */
    getAngle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * Predict target position for leading shots
     * @param {object} target - Target enemy
     * @param {number} sourceX - Projectile source X
     * @param {number} sourceY - Projectile source Y
     * @param {number} projectileSpeed - Projectile speed
     * @returns {{ x: number, y: number }}
     */
    predictPosition(target, sourceX, sourceY, projectileSpeed) {
        if (!target.vx && !target.vy) {
            return { x: target.x, y: target.y };
        }

        const dist = this.distance(sourceX, sourceY, target.x, target.y);
        const timeToHit = dist / projectileSpeed;

        return {
            x: target.x + (target.vx || 0) * timeToHit,
            y: target.y + (target.vy || 0) * timeToHit
        };
    }
}
