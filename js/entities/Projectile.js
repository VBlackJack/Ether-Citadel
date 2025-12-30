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

import { MathUtils } from '../config.js';
import { Particle } from '../effects/index.js';
import { COLORS } from '../constants/colors.js';
import { PARTICLE_COUNTS } from '../constants/balance.js';

/**
 * Projectile configuration object
 * @typedef {Object} ProjectileConfig
 * @property {number} damage - Damage amount
 * @property {number} speed - Movement speed
 * @property {string} color - CSS color
 * @property {number} tier - Turret tier
 * @property {boolean} [isMulti=false] - Multi-shot projectile
 * @property {boolean} [isCrit=false] - Critical hit
 * @property {boolean} [isSuperCrit=false] - Super critical hit
 */

/**
 * Projectile effects object
 * @typedef {Object} ProjectileEffects
 * @property {boolean} [ice=false] - Ice effect
 * @property {boolean} [poison=false] - Poison effect
 */

/**
 * Projectile properties object
 * @typedef {Object} ProjectileProps
 * @property {number} [bounce=0] - Bounce count
 * @property {number} [blast=0] - Blast radius
 * @property {number} [leech=0] - Life leech amount
 * @property {number} [stasis=0] - Stasis chance
 */

/**
 * Projectile entity for turret shots
 */
export class Projectile {
    /**
     * Create a projectile
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     * @param {Object} target - Target enemy
     * @param {ProjectileConfig} config - Projectile configuration
     * @param {ProjectileEffects} [effects={}] - Status effects to apply
     * @param {ProjectileProps} [props={}] - Additional properties
     */
    constructor(x, y, target, config, effects = {}, props = {}) {
        // Position
        this.x = x;
        this.y = y;
        this.target = target;
        this.active = true;

        // Config
        this.damage = config.damage;
        this.speed = config.speed;
        this.color = config.color;
        this.tier = config.tier;
        this.isMulti = config.isMulti || false;
        this.isCrit = config.isCrit || false;
        this.isSuperCrit = config.isSuperCrit || false;

        // Effects
        this.effects = effects;

        // Props
        this.bounceCount = props.bounce || 0;
        this.blastRadius = props.blast || 0;
        this.leech = props.leech || 0;
        this.stasisChance = props.stasis || 0;
    }

    /**
     * Factory method for creating projectiles (maintains backward compatibility)
     * @deprecated Use constructor with config object instead
     */
    static create(x, y, target, damage, speed, color, tier, isMulti, isCrit, isSuperCrit, effects, props) {
        return new Projectile(x, y, target, {
            damage,
            speed,
            color,
            tier,
            isMulti,
            isCrit,
            isSuperCrit
        }, effects, props);
    }

    update(dt, game) {
        if (!this.target || this.target.hp <= 0) {
            if (this.bounceCount <= 0 && this.blastRadius <= 0) {
                this.active = false;
                return;
            }
        }
        if (this.target && this.target.hp > 0) {
            const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            const moveStep = this.speed * (dt / 16);
            this.x += Math.cos(angle) * moveStep;
            this.y += Math.sin(angle) * moveStep;
            if (MathUtils.dist(this.x, this.y, this.target.x, this.target.y) < this.target.radius + 15) {
                this.hit(this.target, game);
            }
        } else {
            this.active = false;
        }
    }

    hit(target, game) {
        target.takeDamage(this.damage, this.isCrit, this.isSuperCrit);
        if (this.effects.ice) target.applyStatus('ice', 0.6, 2000);
        if (this.effects.poison) target.applyStatus('poison', this.damage * 0.2, 3000);
        if (this.stasisChance > 0 && Math.random() < this.stasisChance) target.applyStatus('stasis', 0, 2000);
        if (this.leech > 0 && target.hp <= 0) game.castle.heal(this.leech);
        if (this.blastRadius > 0) {
            this.explode(game);
            this.active = false;
        }
        if (this.bounceCount > 0) {
            this.bounce(target, game);
        } else if (this.blastRadius <= 0) {
            this.active = false;
        }
        if (game.particles.length < PARTICLE_COUNTS.MAX_PARTICLES) {
            for (let i = 0; i < PARTICLE_COUNTS.ENEMY_DEATH; i++) {
                game.particles.push(new Particle(this.x, this.y, this.color));
            }
        }
    }

    explode(game) {
        game.enemies.forEach(e => {
            if (e.hp > 0 && MathUtils.dist(this.x, this.y, e.x, e.y) < this.blastRadius) {
                e.takeDamage(this.damage * 0.5, false, false, true);
            }
        });
        const ripple = new Particle(this.x, this.y, COLORS.BLAST_ORANGE);
        ripple.draw = function(ctx) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, (1 - this.life) * 50, 0, Math.PI * 2);
            ctx.stroke();
        };
        game.particles.push(ripple);
    }

    bounce(lastTarget, game) {
        let nearest = null;
        let minDist = 250;
        for (const e of game.enemies) {
            if (e !== lastTarget && e.hp > 0) {
                const d = MathUtils.dist(this.x, this.y, e.x, e.y);
                if (d < minDist) {
                    minDist = d;
                    nearest = e;
                }
            }
        }
        if (nearest) {
            this.bounceCount--;
            this.target = nearest;
            const line = new Particle(this.x, this.y, this.color);
            line.tx = nearest.x;
            line.ty = nearest.y;
            line.life = 0.5;
            line.draw = function(ctx) {
                ctx.globalAlpha = this.life;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.tx, this.ty);
                ctx.stroke();
            };
            game.particles.push(line);
        } else {
            this.bounceCount = 0;
        }
    }

    /**
     * Get projectile size based on crit status
     */
    getSize() {
        if (this.isSuperCrit) return 10;
        if (this.isCrit) return 8;
        if (this.isMulti) return 3;
        return 5;
    }

    /**
     * Get shadow blur based on crit status
     */
    getShadowBlur() {
        if (this.isSuperCrit) return 20;
        if (this.isCrit) return 15;
        return 10;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const size = this.getSize();
        if (this.tier >= 3) {
            ctx.moveTo(this.x, this.y - size);
            ctx.lineTo(this.x + size, this.y);
            ctx.lineTo(this.x, this.y + size);
            ctx.lineTo(this.x - size, this.y);
        } else {
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = this.getShadowBlur();
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
