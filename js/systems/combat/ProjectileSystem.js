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
 * ProjectileSystem - Handles projectile lifecycle, movement, and collision
 * Supports various projectile types with different behaviors
 */

/**
 * Projectile types
 */
export const ProjectileType = {
    BULLET: 'bullet',
    LASER: 'laser',
    MISSILE: 'missile',
    ARTILLERY: 'artillery',
    TESLA: 'tesla',
    ICE: 'ice',
    POISON: 'poison'
};

/**
 * Projectile configuration
 */
const PROJECTILE_CONFIG = {
    [ProjectileType.BULLET]: {
        speed: 12,
        size: 4,
        color: '#60a5fa',
        trail: false,
        pierce: 0,
        splash: 0
    },
    [ProjectileType.LASER]: {
        speed: 20,
        size: 2,
        color: '#ef4444',
        trail: true,
        pierce: 1,
        splash: 0
    },
    [ProjectileType.MISSILE]: {
        speed: 6,
        size: 8,
        color: '#f97316',
        trail: true,
        pierce: 0,
        splash: 50,
        homing: true
    },
    [ProjectileType.ARTILLERY]: {
        speed: 8,
        size: 10,
        color: '#fbbf24',
        trail: true,
        pierce: 0,
        splash: 80,
        arc: true
    },
    [ProjectileType.TESLA]: {
        speed: 15,
        size: 3,
        color: '#a78bfa',
        trail: true,
        pierce: 0,
        splash: 0,
        chain: 3,
        chainRange: 100
    },
    [ProjectileType.ICE]: {
        speed: 10,
        size: 5,
        color: '#22d3ee',
        trail: false,
        pierce: 0,
        splash: 30,
        slow: 0.5,
        slowDuration: 2000
    },
    [ProjectileType.POISON]: {
        speed: 9,
        size: 5,
        color: '#22c55e',
        trail: false,
        pierce: 0,
        splash: 20,
        dot: true,
        dotDamage: 0.1,
        dotDuration: 3000
    }
};

// Trail buffer size - using circular buffer pattern
const TRAIL_MAX_LENGTH = 10;

/**
 * Projectile class
 */
export class Projectile {
    constructor(options) {
        this.x = options.x;
        this.y = options.y;
        this.targetX = options.targetX;
        this.targetY = options.targetY;
        this.target = options.target || null;
        this.damage = options.damage || 10;
        this.type = options.type || ProjectileType.BULLET;
        this.source = options.source || null;

        const config = PROJECTILE_CONFIG[this.type] || PROJECTILE_CONFIG[ProjectileType.BULLET];
        this.speed = options.speed || config.speed;
        this.size = options.size || config.size;
        this.color = options.color || config.color;
        this.pierce = options.pierce ?? config.pierce;
        this.splash = options.splash ?? config.splash;
        this.splashSq = this.splash * this.splash; // Pre-compute squared for comparisons
        this.chain = options.chain ?? config.chain ?? 0;
        this.chainRange = options.chainRange ?? config.chainRange ?? 100;
        this.chainRangeSq = this.chainRange * this.chainRange; // Pre-compute squared
        this.slow = options.slow ?? config.slow;
        this.slowDuration = options.slowDuration ?? config.slowDuration;
        this.dot = options.dot ?? config.dot;
        this.dotDamage = options.dotDamage ?? config.dotDamage;
        this.dotDuration = options.dotDuration ?? config.dotDuration;
        this.homing = options.homing ?? config.homing;
        this.arc = options.arc ?? config.arc;
        this.trail = options.trail ?? config.trail;

        // Calculate initial velocity
        const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;

        // Arc projectile additional properties
        if (this.arc) {
            this.startY = this.y;
            this.totalDistance = Math.sqrt((this.targetX - this.x) ** 2 + (this.targetY - this.y) ** 2);
            this.traveledDistance = 0;
            this.arcHeight = 50;
        }

        this.dead = false;
        this.active = true;
        this.hitTargets = new Set();

        // Circular buffer for trail points (O(1) operations instead of shift's O(n))
        if (this.trail) {
            this.trailPoints = new Array(TRAIL_MAX_LENGTH);
            this.trailIndex = 0;
            this.trailCount = 0;
        }
    }

    /**
     * Update projectile position
     * @param {number} deltaTime
     */
    update(deltaTime) {
        if (this.dead) return;

        // Store trail point using circular buffer (O(1) instead of shift's O(n))
        if (this.trail) {
            this.trailPoints[this.trailIndex] = { x: this.x, y: this.y };
            this.trailIndex = (this.trailIndex + 1) % TRAIL_MAX_LENGTH;
            if (this.trailCount < TRAIL_MAX_LENGTH) this.trailCount++;
        }

        // Homing behavior
        if (this.homing && this.target && !this.target.dead) {
            const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            const turnRate = 0.1;
            const currentAngle = Math.atan2(this.vy, this.vx);
            const angleDiff = angle - currentAngle;
            const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnRate);
            this.vx = Math.cos(newAngle) * this.speed;
            this.vy = Math.sin(newAngle) * this.speed;
        }

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Arc behavior (parabolic motion)
        if (this.arc) {
            this.traveledDistance += this.speed;
            const progress = this.traveledDistance / this.totalDistance;
            const arcOffset = Math.sin(progress * Math.PI) * this.arcHeight;
            this.y -= arcOffset * 0.1;
        }
    }

    /**
     * Check collision with enemy (uses squared distance - no sqrt)
     * @param {object} enemy
     * @returns {boolean}
     */
    checkCollision(enemy) {
        if (this.dead || enemy.dead) return false;
        if (this.hitTargets.has(enemy)) return false;

        const dx = this.x - enemy.x;
        const dy = this.y - enemy.y;
        const distSq = dx * dx + dy * dy;
        const hitRadius = this.size + (enemy.size || 15);

        return distSq < hitRadius * hitRadius;
    }

    /**
     * Handle hit on enemy
     * @param {object} enemy
     * @param {object} game - Game instance for splash/chain effects
     */
    onHit(enemy, game) {
        this.hitTargets.add(enemy);

        // Apply damage
        enemy.takeDamage?.(this.damage, this.source);

        // Apply slow effect
        if (this.slow && this.slowDuration) {
            enemy.applySlow?.(this.slow, this.slowDuration);
        }

        // Apply DoT effect
        if (this.dot && this.dotDamage && this.dotDuration) {
            enemy.applyDot?.(this.damage * this.dotDamage, this.dotDuration);
        }

        // Splash damage - uses squared distance for O(1) comparison
        if (this.splash > 0 && game?.enemies) {
            const projX = this.x;
            const projY = this.y;
            const splashSq = this.splashSq;

            for (let i = 0; i < game.enemies.length; i++) {
                const e = game.enemies[i];
                if (e.dead || e === enemy || this.hitTargets.has(e)) continue;

                const dx = projX - e.x;
                const dy = projY - e.y;
                if (dx * dx + dy * dy <= splashSq) {
                    e.takeDamage?.(this.damage * 0.5, this.source);
                    this.hitTargets.add(e);
                }
            }
        }

        // Chain lightning - optimized O(n) per chain instead of O(n²)
        if (this.chain > 0 && game) {
            this.chainTo(enemy, game);
        }

        // Check if projectile should die
        if (this.pierce <= 0) {
            this.dead = true;
            this.active = false;
        } else {
            this.pierce--;
        }
    }

    /**
     * Chain to nearby enemies - Optimized: single pass distance calculation
     * @param {object} fromEnemy
     * @param {object} game
     */
    chainTo(fromEnemy, game) {
        let chainsLeft = this.chain;
        let currentEnemy = fromEnemy;
        const chainRangeSq = this.chainRangeSq;

        while (chainsLeft > 0 && game.enemies) {
            let nearestEnemy = null;
            let nearestDistSq = chainRangeSq;

            // Single pass: find nearest valid enemy using squared distance
            const cx = currentEnemy.x;
            const cy = currentEnemy.y;

            for (let i = 0; i < game.enemies.length; i++) {
                const e = game.enemies[i];
                if (e.dead || this.hitTargets.has(e)) continue;

                const dx = cx - e.x;
                const dy = cy - e.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < nearestDistSq) {
                    nearestDistSq = distSq;
                    nearestEnemy = e;
                }
            }

            if (!nearestEnemy) break;

            this.hitTargets.add(nearestEnemy);
            nearestEnemy.takeDamage?.(this.damage * 0.7, this.source);

            // Visual effect (chain lightning line)
            if (game.addVisualEffect) {
                game.addVisualEffect({
                    type: 'chain',
                    from: { x: currentEnemy.x, y: currentEnemy.y },
                    to: { x: nearestEnemy.x, y: nearestEnemy.y },
                    color: this.color,
                    duration: 100
                });
            }

            currentEnemy = nearestEnemy;
            chainsLeft--;
        }
    }

    /**
     * Squared distance from this projectile to an entity (no sqrt - faster)
     * @param {object} entity
     * @returns {number}
     */
    distanceToSq(entity) {
        const dx = this.x - entity.x;
        const dy = this.y - entity.y;
        return dx * dx + dy * dy;
    }

    /**
     * Distance from this projectile to an entity (uses sqrt - for display only)
     * @param {object} entity
     * @returns {number}
     */
    distanceTo(entity) {
        return Math.sqrt(this.distanceToSq(entity));
    }

    /**
     * Squared distance between two entities (no sqrt - faster)
     * @param {object} a
     * @param {object} b
     * @returns {number}
     */
    distanceFromToSq(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return dx * dx + dy * dy;
    }

    /**
     * Check if projectile is out of bounds
     * @param {number} width
     * @param {number} height
     * @returns {boolean}
     */
    isOutOfBounds(width, height) {
        const margin = 50;
        return this.x < -margin || this.x > width + margin ||
               this.y < -margin || this.y > height + margin;
    }

    /**
     * Render the projectile
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        if (this.dead) return;

        // Draw trail using circular buffer
        if (this.trail && this.trailCount > 1) {
            ctx.beginPath();
            // Start from oldest point in circular buffer
            const startIdx = this.trailCount < TRAIL_MAX_LENGTH ? 0 : this.trailIndex;
            const firstPoint = this.trailPoints[startIdx];
            ctx.moveTo(firstPoint.x, firstPoint.y);

            for (let i = 1; i < this.trailCount; i++) {
                const idx = (startIdx + i) % TRAIL_MAX_LENGTH;
                const point = this.trailPoints[idx];
                ctx.lineTo(point.x, point.y);
            }
            ctx.strokeStyle = this.color + '80';
            ctx.lineWidth = this.size * 0.5;
            ctx.stroke();
        }

        // Draw projectile
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Glow effect - save/restore to isolate shadow state
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();
    }
}

/**
 * ProjectileSystem - Manages all projectiles
 */
export class ProjectileSystem {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
        this.projectiles = [];
        this.maxProjectiles = 500;
    }

    /**
     * Create a new projectile
     * @param {object} options
     * @returns {Projectile}
     */
    create(options) {
        if (this.projectiles.length >= this.maxProjectiles) {
            // Remove oldest projectile
            this.projectiles.shift();
        }

        const projectile = new Projectile(options);
        this.projectiles.push(projectile);
        return projectile;
    }

    /**
     * Create projectile from turret to target
     * @param {object} turret
     * @param {object} target
     * @param {object} options
     * @returns {Projectile}
     */
    fireAt(turret, target, options = {}) {
        return this.create({
            x: turret.x,
            y: turret.y,
            targetX: target.x,
            targetY: target.y,
            target: target,
            source: turret,
            damage: turret.damage || options.damage || 10,
            type: turret.projectileType || options.type || ProjectileType.BULLET,
            ...options
        });
    }

    /**
     * Update all projectiles
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // Use in-place compaction instead of splice() for O(n) vs O(n²) performance
        let writeIdx = 0;
        for (let i = 0; i < this.projectiles.length; i++) {
            const projectile = this.projectiles[i];

            projectile.update(deltaTime);

            // Check out of bounds
            if (projectile.isOutOfBounds(this.game.width, this.game.height)) {
                projectile.dead = true;
                projectile.active = false;
            }

            // Check collision with enemies
            if (!projectile.dead && this.game.enemies) {
                for (const enemy of this.game.enemies) {
                    if (projectile.checkCollision(enemy)) {
                        projectile.onHit(enemy, this.game);
                        if (projectile.dead) break;
                    }
                }
            }

            // Keep alive projectiles via compaction
            if (!projectile.dead) {
                this.projectiles[writeIdx++] = projectile;
            }
        }
        this.projectiles.length = writeIdx;
    }

    /**
     * Render all projectiles
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        for (const projectile of this.projectiles) {
            projectile.render(ctx);
        }
    }

    /**
     * Clear all projectiles
     */
    clear() {
        this.projectiles = [];
    }

    /**
     * Get active projectile count
     * @returns {number}
     */
    getCount() {
        return this.projectiles.length;
    }
}
