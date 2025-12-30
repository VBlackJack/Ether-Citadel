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

import { CONFIG, MathUtils, formatNumber } from '../config.js';
import { ENEMY_TYPES } from '../data.js';
import { t } from '../i18n.js';
import { FloatingText, Particle, Rune } from '../effects/index.js';
import { COLORS, getEnemyDisplayColor } from '../constants/colors.js';
import { ENEMY_BALANCE, COMBAT_BALANCE, PARTICLE_COUNTS } from '../constants/balance.js';

/**
 * Enemy entity
 */
export class Enemy {
    constructor(wave, typeKey = 'NORMAL', x, y, game) {
        this.game = game;
        this.type = ENEMY_TYPES[typeKey];
        this.typeKey = typeKey;
        this.radius = 12 * this.type.scale;
        this.isElite = Math.random() < ENEMY_BALANCE.ELITE_SPAWN_CHANCE;
        this.x = x || game.width + 50;
        this.y = y || MathUtils.randomRange(game.height * 0.2, game.height * 0.8);
        const diffMult = 1 + (wave * 0.20);
        const hpMod = game.activeChallenge && game.activeChallenge.id === 'glass' ? 0.1 : 1;
        const speedMod = game.activeChallenge && game.activeChallenge.id === 'speed' ? 2 : 1;
        const dread = game.getDreadMultipliers();
        this.maxHp = Math.floor(CONFIG.baseEnemyHp * diffMult * this.type.hpMult * (this.isElite ? ENEMY_BALANCE.ELITE_HP_MULTIPLIER : 1) * hpMod * dread.enemyHp);
        this.hp = this.maxHp;
        this.baseSpeed = CONFIG.baseEnemySpeed * (1 + wave * 0.03) * this.type.speedMult * speedMod * dread.enemySpeed;
        this.damage = Math.floor((5 + Math.floor(wave * 0.8)) * (typeKey === 'BOSS' ? ENEMY_BALANCE.BOSS_DAMAGE_MULT : 1) * dread.enemyDamage);
        const baseGold = Math.max(1, Math.floor(2 * (1 + wave * 0.18)));
        const goldMult = game.metaUpgrades.getEffectValue('goldMult') * (1 + (game.relicMults.gold || 0));
        const catchupBonus = (wave > (game.stats?.maxWave || 0)) ? COMBAT_BALANCE.CATCHUP_BONUS_MULT : 1.0;
        this.goldValue = Math.floor(baseGold * goldMult * catchupBonus * (typeKey === 'BOSS' ? ENEMY_BALANCE.BOSS_GOLD_MULT : (typeKey === 'TANK' ? 2 : 1)) * (this.isElite ? ENEMY_BALANCE.ELITE_GOLD_MULTIPLIER : 1) * dread.crystalBonus);
        if (game.activeBuffs['midas'] > 0) this.goldValue *= COMBAT_BALANCE.MIDAS_GOLD_MULT;
        this.color = typeKey === 'NORMAL' ? `hsl(${(wave * 15) % 360}, 70%, 60%)` : this.type.color;
        this.status = { iceTimer: 0, poisonTimer: 0, poisonDmg: 0, stasisTimer: 0 };
        this.state = 'APPROACH';
        this.teleportTimer = 0;
        this.thermalShockCooldown = 0;
    }

    applyStatus(type, power, duration) {
        if (type === 'ice') this.status.iceTimer = duration;
        if (type === 'poison') { this.status.poisonTimer = duration; this.status.poisonDmg = power; }
        if (type === 'stasis') this.status.stasisTimer = duration;
    }

    update(dt) {
        const game = this.game;
        if (game.skills.isActive('blackhole')) {
            const cx = game.width * 0.7;
            const cy = game.height / 2;
            const dist = MathUtils.dist(this.x, this.y, cx, cy);
            if (dist > 20) {
                this.x = MathUtils.lerp(this.x, cx, 0.05);
                this.y = MathUtils.lerp(this.y, cy, 0.05);
            }
            this.takeDamage(game.currentDamage * 0.1 * (dt / 16), false, false, true);
            return;
        }
        if (this.status.stasisTimer > 0) { this.status.stasisTimer -= dt * 16; return; }
        if (this.status.iceTimer > 0 && this.status.poisonTimer > 0 && this.thermalShockCooldown <= 0) {
            this.takeDamage(game.currentDamage * ENEMY_BALANCE.THERMAL_SHOCK_DAMAGE_MULT, true, false, false);
            game.floatingTexts.push(new FloatingText(this.x, this.y - 40, t('notifications.thermalShock'), COLORS.STATUS_THERMAL, 24));
            this.thermalShockCooldown = ENEMY_BALANCE.THERMAL_SHOCK_COOLDOWN;
        }
        if (this.thermalShockCooldown > 0) this.thermalShockCooldown -= dt;
        let currentSpeed = this.baseSpeed;
        if (this.status.iceTimer > 0) { this.status.iceTimer -= dt * 16; currentSpeed *= ENEMY_BALANCE.ICE_SLOW_MULTIPLIER; }
        if (this.status.poisonTimer > 0) {
            this.status.poisonTimer -= dt * 16;
            const tickDmg = (this.status.poisonDmg / 60) * (dt / 16);
            this.takeDamage(tickDmg, false, false, true);
        }

        const targetX = game.castle.x;
        const targetY = game.height / 2;
        const dist = MathUtils.dist(this.x, this.y, targetX, targetY);
        if (dist > 80) {
            const angle = Math.atan2(targetY - this.y, targetX - this.x);
            const moveStep = currentSpeed * (dt / 16);
            this.x += Math.cos(angle) * moveStep;
            this.y += Math.sin(angle) * moveStep;
        } else {
            game.castle.takeDamage((this.damage * 0.05) * (dt / 16));
        }
        if (this.typeKey === 'PHANTOM') {
            this.teleportTimer += dt;
            if (this.teleportTimer > ENEMY_BALANCE.PHANTOM_TELEPORT_INTERVAL) {
                this.x -= ENEMY_BALANCE.PHANTOM_TELEPORT_DISTANCE;
                game.particles.push(new Particle(this.x + ENEMY_BALANCE.PHANTOM_TELEPORT_DISTANCE, this.y, COLORS.ENEMY_PHANTOM));
                this.teleportTimer = 0;
            }
        }
        if (this.typeKey === 'THIEF') {
            if (this.state === 'APPROACH') {
                if (dist <= 90) {
                    this.state = 'FLEE';
                    const stolen = Math.floor(game.gold * ENEMY_BALANCE.THIEF_STEAL_PERCENTAGE);
                    game.gold -= stolen;
                    game.floatingTexts.push(new FloatingText(this.x, this.y - 30, `-${stolen} 💰`, COLORS.DAMAGE_RED, 20));
                }
            } else if (this.state === 'FLEE') {
                this.x += currentSpeed * ENEMY_BALANCE.THIEF_FLEE_SPEED_MULT * (dt / 16);
                if (this.x > game.width + 100) this.hp = 0;
            }
            return;
        }
        if (this.typeKey === 'HEALER') {
            this.tryHealNearbyAllies(game);
        }
    }

    /**
     * Attempt to heal nearby allied enemies
     * @param {Object} game - Game instance
     */
    tryHealNearbyAllies(game) {
        if (Math.random() >= ENEMY_BALANCE.HEALER_HEAL_CHANCE) return;

        game.enemies.forEach(e => {
            if (!this.canHealAlly(e)) return;

            e.hp = Math.min(e.maxHp, e.hp + (e.maxHp * ENEMY_BALANCE.HEALER_HEAL_PERCENTAGE));
            this.createHealBeam(e, game);
        });
    }

    /**
     * Check if enemy can be healed
     * @param {Enemy} enemy - Target enemy
     * @returns {boolean}
     */
    canHealAlly(enemy) {
        return enemy !== this
            && enemy.hp < enemy.maxHp
            && MathUtils.dist(this.x, this.y, enemy.x, enemy.y) < ENEMY_BALANCE.HEALER_HEAL_RANGE;
    }

    /**
     * Create heal beam particle effect
     * @param {Enemy} target - Target enemy
     * @param {Object} game - Game instance
     */
    createHealBeam(target, game) {
        const beam = new Particle(this.x, this.y, COLORS.HEAL_BEAM);
        beam.tx = target.x;
        beam.ty = target.y;
        beam.life = 0.5;
        beam.draw = function(ctx) {
            ctx.globalAlpha = this.life;
            ctx.strokeStyle = COLORS.HEAL_BEAM;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.tx, this.ty);
            ctx.stroke();
        };
        game.particles.push(beam);
    }

    takeDamage(amount, isCrit, isSuperCrit, silent = false) {
        const game = this.game;
        if (game.challenges.dmTech['berserk']) {
            const missingHpPct = 1 - (game.castle.hp / game.castle.maxHp);
            if (missingHpPct > 0) amount *= (1 + missingHpPct);
        }
        this.hp -= amount;

        if (!silent && game.settings.showDamageText) {
            const textColor = this.getDamageTextColor(isCrit, isSuperCrit);
            const textSize = this.getDamageTextSize(isCrit, isSuperCrit);
            game.floatingTexts.push(new FloatingText(this.x, this.y - 20, formatNumber(amount), textColor, textSize));
        }

        if (!silent) game.sound.play('hit');

        if (this.hp <= 0) {
            this.onDeath(game, silent);
        }
    }

    /**
     * Get damage text color based on crit status
     */
    getDamageTextColor(isCrit, isSuperCrit) {
        if (isSuperCrit) return COLORS.CRIT_PURPLE;
        if (isCrit) return COLORS.DAMAGE_RED;
        return COLORS.WHITE;
    }

    /**
     * Get damage text size based on crit status
     */
    getDamageTextSize(isCrit, isSuperCrit) {
        if (isSuperCrit) return COMBAT_BALANCE.SUPER_CRIT_TEXT_SIZE;
        if (isCrit) return COMBAT_BALANCE.CRIT_TEXT_SIZE;
        return COMBAT_BALANCE.NORMAL_TEXT_SIZE;
    }

    /**
     * Handle enemy death
     */
    onDeath(game, silent) {
        // Award gold if not fleeing
        if (this.state !== 'FLEE') {
            const rushBonus = game.isRushBonus ? Math.floor(this.goldValue * COMBAT_BALANCE.RUSH_BONUS_MULT) : 0;
            game.addGold(this.goldValue + rushBonus);
        }

        game.stats.registerKill(this.typeKey === 'BOSS', this.x, this.y);
        game.stats.registerEnemySeen(this.typeKey);
        game.town.addXP(this.typeKey === 'BOSS' ? ENEMY_BALANCE.BOSS_XP_VALUE : ENEMY_BALANCE.NORMAL_XP_VALUE);

        // Dark matter drop chance
        if (game.challenges.dmTech['siphon'] && this.typeKey !== 'BOSS' && Math.random() < ENEMY_BALANCE.DARK_MATTER_DROP_CHANCE) {
            game.ether++;
        }

        // Splitter spawns mini enemies
        if (this.typeKey === 'SPLITTER') {
            game.enemies.push(new Enemy(game.wave, 'MINI', this.x, this.y - 10, game));
            game.enemies.push(new Enemy(game.wave, 'MINI', this.x, this.y + 10, game));
        }

        // Rune drop
        if (Math.random() < ENEMY_BALANCE.RUNE_DROP_CHANCE) {
            game.runes.push(new Rune(this.x, this.y));
        }

        // Gold floating text
        if (!silent && game.settings.showDamageText) {
            game.floatingTexts.push(new FloatingText(this.x, this.y - 40, `+${formatNumber(this.goldValue)}`, COLORS.GOLD_TEXT, 16));
        }

        game.sound.play('coin');

        // Death particles
        if (this.typeKey === 'BOSS') {
            for (let i = 0; i < PARTICLE_COUNTS.BOSS_DEATH; i++) {
                game.particles.push(new Particle(this.x, this.y, COLORS.DAMAGE_RED));
            }
            game.tryDropRelic();
            game.onBossKill();
        } else if (game.particles.length < PARTICLE_COUNTS.MAX_PARTICLES) {
            for (let i = 0; i < PARTICLE_COUNTS.ENEMY_DEATH; i++) {
                game.particles.push(new Particle(this.x, this.y, this.color));
            }
        }
    }

    draw(ctx) {
        const game = this.game;
        ctx.save();
        ctx.translate(this.x, this.y);
        const angle = Math.atan2(game.height / 2 - this.y, game.castle.x - this.x);
        ctx.rotate(angle);
        ctx.fillStyle = getEnemyDisplayColor(this.status, this.typeKey, this.color);
        ctx.beginPath();

        this.drawShape(ctx);
        this.drawEliteEffect(ctx);

        ctx.restore();
        this.drawHealthBar(ctx);
    }

    /**
     * Draw enemy shape based on type
     */
    drawShape(ctx) {
        if (this.typeKey === 'PHANTOM') {
            ctx.globalAlpha = 0.6;
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        } else if (this.type.scale > 2) {
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = COLORS.WHITE;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fill();
        } else if (this.type.scale > 1.2) {
            ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(-this.radius, -this.radius);
            ctx.lineTo(-this.radius, this.radius);
            ctx.fill();
        }
    }

    /**
     * Draw elite enemy glow effect
     */
    drawEliteEffect(ctx) {
        if (!this.isElite) return;

        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.ELITE_GOLD;
        ctx.strokeStyle = COLORS.ELITE_GOLD;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    /**
     * Draw enemy health bar
     */
    drawHealthBar(ctx) {
        const hpPercent = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = COLORS.HEALTH_BG;
        ctx.fillRect(this.x - 10, this.y - 20 - this.radius, 20, 4);
        ctx.fillStyle = COLORS.HEALTH_FILL;
        ctx.fillRect(this.x - 10, this.y - 20 - this.radius, 20 * hpPercent, 4);
    }
}
