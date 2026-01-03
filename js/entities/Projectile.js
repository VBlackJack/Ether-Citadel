/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { MathUtils } from '../config.js';
import { Particle } from './Particle.js';
import { getProjectilePool, registerProjectileClass } from '../utils/ObjectPool.js';

// Static game reference to avoid window.game dependency
let _gameRef = null;

export class Projectile {
    /**
     * Set the global game reference for all projectiles
     */
    static setGameRef(game) {
        _gameRef = game;
    }

    /**
     * Get the game reference
     */
    static getGameRef() {
        return _gameRef;
    }

    constructor(x, y, target, damage, speed, color, tier, isMulti, isCrit, isSuperCrit, effects, props) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.color = color;
        this.active = true;
        this.dead = false;
        this.tier = tier;
        this.isMulti = isMulti;
        this.isCrit = isCrit;
        this.isSuperCrit = isSuperCrit;
        this.effects = effects || {};
        this.bounceCount = (props && props.bounce) || 0;
        this.blastRadius = (props && props.blast) || 0;
        this.leech = (props && props.leech) || 0;
        this.stasisChance = (props && props.stasis) || 0;
    }

    /**
     * Reset projectile for reuse (pool-friendly)
     */
    reset(x, y, target, damage, speed, color, tier, isMulti, isCrit, isSuperCrit, effects, props) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.color = color;
        this.active = true;
        this.dead = false;
        this.tier = tier;
        this.isMulti = isMulti;
        this.isCrit = isCrit;
        this.isSuperCrit = isSuperCrit;
        this.effects = effects || {};
        this.bounceCount = (props && props.bounce) || 0;
        this.blastRadius = (props && props.blast) || 0;
        this.leech = (props && props.leech) || 0;
        this.stasisChance = (props && props.stasis) || 0;
        return this;
    }

    update(dt) {
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
            const hitRadius = this.target.radius + 15;
            if (MathUtils.distSq(this.x, this.y, this.target.x, this.target.y) < hitRadius * hitRadius) {
                this.hit(this.target);
            }
        } else {
            this.active = false;
        }
    }

    hit(target) {
        const game = _gameRef;
        target.takeDamage(this.damage, this.isCrit, this.isSuperCrit);
        if (this.effects.ice) target.applyStatus('ice', 0.6, 2000);
        if (this.effects.poison) target.applyStatus('poison', this.damage * 0.2, 3000);
        if (this.stasisChance > 0 && Math.random() < this.stasisChance) target.applyStatus('stasis', 0, 2000);
        if (this.leech > 0 && target.hp <= 0) game?.castle?.heal(this.leech);
        if (this.blastRadius > 0) this.explode();
        if (this.bounceCount > 0) this.bounce(target);
        else if (this.blastRadius <= 0) this.active = false;
        if (this.bounceCount <= 0) this.active = false;
        if (game?.particles?.length < 50) {
            for (let i = 0; i < 3; i++) game.particles.push(new Particle(this.x, this.y, this.color));
        }
    }

    explode() {
        const game = _gameRef;
        const blastRadiusSq = this.blastRadius * this.blastRadius;
        game?.enemies?.forEach(e => {
            if (e.hp > 0 && MathUtils.distSq(this.x, this.y, e.x, e.y) < blastRadiusSq) {
                e.takeDamage(this.damage * 0.5, false, false, true);
            }
        });
        const ripple = new Particle(this.x, this.y, 'rgba(255,200,0,0.5)');
        ripple.draw = function(ctx) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, (1 - this.life) * 50, 0, Math.PI * 2);
            ctx.stroke();
        };
        game?.particles?.push(ripple);
    }

    bounce(lastTarget) {
        const game = _gameRef;
        let nearest = null;
        let minDistSq = 250 * 250;
        const enemies = game?.enemies || [];
        for (const e of enemies) {
            if (e !== lastTarget && e.hp > 0) {
                const dSq = MathUtils.distSq(this.x, this.y, e.x, e.y);
                if (dSq < minDistSq) {
                    minDistSq = dSq;
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
                ctx.save();
                ctx.globalAlpha = this.life;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.tx, this.ty);
                ctx.stroke();
                ctx.restore();
            };
            game?.particles?.push(line);
        } else {
            this.bounceCount = 0;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const size = this.isSuperCrit ? 10 : (this.isCrit ? 8 : (this.isMulti ? 3 : 5));
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
        ctx.shadowBlur = this.isSuperCrit ? 20 : (this.isCrit ? 15 : 10);
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    /**
     * Check if projectile is still active
     */
    isAlive() {
        return this.active;
    }

    /**
     * Create a projectile using the object pool
     */
    static create(x, y, target, damage, speed, color, tier, isMulti, isCrit, isSuperCrit, effects, props) {
        const pool = getProjectilePool();
        const config = { damage, speed, color, tier, isMulti, isCrit, isSuperCrit };
        return pool.acquire(x, y, target, config, effects, props);
    }

    /**
     * Acquire from pool (preferred for high-frequency creation)
     */
    static acquire(x, y, target, config, effects, props) {
        return getProjectilePool().acquire(x, y, target, config, effects, props);
    }

    /**
     * Release back to pool
     */
    static release(projectile) {
        getProjectilePool().release(projectile);
    }
}

// Register Projectile class with the pool for proper instance creation
registerProjectileClass(Projectile);