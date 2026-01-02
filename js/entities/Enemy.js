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
 * Enemy - Base enemy entity with type-specific behaviors
 */

import { ENEMY_TYPES } from '../data.js';
import { CONFIG, MathUtils, formatNumber, BigNumService } from '../config.js';
import { t } from '../i18n.js';
import { SKILL, RUNE } from '../constants/skillIds.js';
import { COLORS, getEnemyDisplayColor } from '../constants/colors.js';
import { BALANCE } from '../constants/balance.js';

export class Enemy {
    constructor(game, wave, typeKey = 'NORMAL', x, y) {
        this.game = game;
        this.type = ENEMY_TYPES[typeKey];
        this.typeKey = typeKey;
        this.radius = BALANCE.ENTITY.BASE_ENEMY_RADIUS * this.type.scale;
        this.isElite = Math.random() < BALANCE.ENTITY.ELITE_SPAWN_CHANCE;
        this.x = x || game.width + BALANCE.ENTITY.SPAWN_OFFSET_X;
        this.y = y || MathUtils.randomRange(game.height * 0.2, game.height * 0.8);
        this.wave = wave;

        // Calculate Wave Factor (Exponential) - Defender Idle 2 style
        let growthFactor = BigNumService.pow(BALANCE.SCALING.HP_GROWTH, wave - 1);

        // Apply Late Game Scaling (if Wave > threshold)
        if (wave > BALANCE.SCALING.LATE_GAME_THRESHOLD) {
            growthFactor = BigNumService.mul(growthFactor, BigNumService.pow(BALANCE.SCALING.LATE_GAME_FACTOR, wave - BALANCE.SCALING.LATE_GAME_THRESHOLD));
        }

        // Challenge and Dread modifiers
        const hpMod = game.activeChallenge?.id === 'glass' ? 0.1 : 1;
        const speedMod = game.activeChallenge?.id === 'speed' ? 2 : 1;
        const dread = game.getDreadMultipliers();

        // Base Stats with exponential scaling (BigNum)
        this.maxHp = BigNumService.floor(
            BigNumService.mul(
                BigNumService.mul(
                    BigNumService.mul(BALANCE.BASE.ENEMY_HP, growthFactor),
                    this.type.hpMult * (this.isElite ? BALANCE.ENTITY.ELITE_HP_MULTIPLIER : 1)
                ),
                hpMod * dread.enemyHp
            )
        );

        this.damage = BigNumService.floor(
            BigNumService.mul(
                BigNumService.mul(BALANCE.BASE.ENEMY_DAMAGE, BigNumService.pow(BALANCE.SCALING.DAMAGE_GROWTH, wave - 1)),
                dread.enemyDamage
            )
        );

        this.goldValue = BigNumService.floor(
            BigNumService.mul(BALANCE.BASE.GOLD_DROP, BigNumService.pow(BALANCE.SCALING.GOLD_GROWTH, wave - 1))
        );

        // Boss Modifiers
        if (typeKey === 'BOSS') {
            this.maxHp = BigNumService.mul(this.maxHp, BALANCE.SCALING.BOSS_HP_MULTIPLIER);
            this.damage = BigNumService.mul(this.damage, BALANCE.SCALING.BOSS_DAMAGE_MULTIPLIER);
            this.goldValue = BigNumService.mul(this.goldValue, Math.floor(BALANCE.SCALING.BOSS_HP_MULTIPLIER * 0.5));
            this.radius *= BALANCE.ENTITY.BOSS_SIZE_SCALE;
        }

        // Apply gold multipliers from game systems
        const passiveGoldMult = game.passives?.getEffect('goldGain') || 1;
        const prestigeGoldMult = game.prestige?.getEffect('prestige_gold') || 1;
        const goldMult = game.metaUpgrades.getEffectValue('goldMult') * (1 + (game.relicMults.gold || 0)) * passiveGoldMult * prestigeGoldMult;
        const catchupBonus = (wave > (game.stats?.maxWave || 0)) ? 1.5 : 1.0;
        const goldModifiers = goldMult * catchupBonus * (typeKey === 'TANK' ? 2 : 1) * (this.isElite ? 10 : 1) * dread.crystalBonus;
        this.goldValue = BigNumService.floor(BigNumService.mul(this.goldValue, goldModifiers));
        if (game.activeBuffs[RUNE.MIDAS] > 0) {
            this.goldValue = BigNumService.mul(this.goldValue, 5);
        }

        this.hp = this.maxHp;
        this.baseSpeed = CONFIG.baseEnemySpeed * (1 + wave * 0.03) * this.type.speedMult * speedMod * dread.enemySpeed;
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
        if (!game) return;
        if (game.skills?.isActive?.(SKILL.BLACKHOLE)) {
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
            this.takeDamage(game.currentDamage * 2, true, false, false);
            game.floatingTexts.push(game.createFloatingText(this.x, this.y - 40, t('notifications.thermalShock'), "#f97316", 24));
            this.thermalShockCooldown = 1000;
        }
        if (this.thermalShockCooldown > 0) this.thermalShockCooldown -= dt;
        let currentSpeed = this.baseSpeed;
        if (this.status.iceTimer > 0) { this.status.iceTimer -= dt * 16; currentSpeed *= 0.6; }
        if (this.status.poisonTimer > 0) {
            this.status.poisonTimer -= dt * 16;
            const tickDmg = (this.status.poisonDmg / 60) * (dt / 16);
            this.takeDamage(tickDmg, false, false, true);
        }

        const targetX = game.castle.x;
        const targetY = game.height / 2;
        const distSq = MathUtils.distSq(this.x, this.y, targetX, targetY);
        if (distSq > 6400) { // 80² = 6400, avoid Math.sqrt()
            const angle = Math.atan2(targetY - this.y, targetX - this.x);
            const moveStep = currentSpeed * (dt / 16);
            this.x += Math.cos(angle) * moveStep;
            this.y += Math.sin(angle) * moveStep;
        } else {
            game.castle.takeDamage(BigNumService.toNumber(this.damage) * 0.05 * (dt / 16));
        }
        if (this.typeKey === 'PHANTOM') {
            this.teleportTimer += dt;
            if (this.teleportTimer > 2000) {
                this.x -= 100;
                game.particles.push(game.createParticle(this.x + 100, this.y, '#fff'));
                this.teleportTimer = 0;
            }
        }
        if (this.typeKey === 'THIEF') {
            if (this.state === 'APPROACH') {
                if (distSq <= 8100) { // 90² = 8100
                    this.state = 'FLEE';
                    const stolen = BigNumService.floor(BigNumService.mul(game.gold, 0.1));
                    game.gold = BigNumService.sub(game.gold, stolen);
                    game.floatingTexts.push(game.createFloatingText(this.x, this.y - 30, `-${formatNumber(stolen)} 💰`, '#ef4444', 20));
                }
            } else if (this.state === 'FLEE') {
                this.x += currentSpeed * 1.5 * (dt / 16);
                if (this.x > game.width + 100) this.hp = BigNumService.create(0);
            }
            return;
        }
        if (this.typeKey === 'HEALER') {
            if (Math.random() < 0.05) {
                const healRangeSq = 150 * 150;
                game.enemies.forEach(e => {
                    if (e !== this && BigNumService.lt(e.hp, e.maxHp) && MathUtils.distSq(this.x, this.y, e.x, e.y) < healRangeSq) {
                        const healAmount = BigNumService.mul(e.maxHp, 0.05);
                        e.hp = BigNumService.min(e.maxHp, BigNumService.add(e.hp, healAmount));
                        const beam = game.createParticle(this.x, this.y, COLORS.HEAL_BEAM);
                        beam.tx = e.x;
                        beam.ty = e.y;
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
                });
            }
        }
    }

    takeDamage(amount, isCrit, isSuperCrit, silent = false) {
        const game = this.game;
        let dmg = BigNumService.create(amount);

        if (game.challenges.dmTech['berserk']) {
            const missingHpPct = 1 - (game.castle.hp / game.castle.maxHp);
            if (missingHpPct > 0) {
                dmg = BigNumService.mul(dmg, 1 + missingHpPct);
            }
        }

        this.hp = BigNumService.sub(this.hp, dmg);

        if (!silent && game.settings.showDamageText) {
            game.floatingTexts.push(game.createFloatingText(
                this.x, this.y - 20,
                formatNumber(dmg),
                isSuperCrit ? '#d946ef' : (isCrit ? '#ef4444' : '#fff'),
                isSuperCrit ? 40 : (isCrit ? 30 : 20)
            ));
        }
        if (!silent) game.sound.play('hit');

        if (BigNumService.lte(this.hp, 0)) {
            if (this.state !== 'FLEE' || BigNumService.lte(this.hp, 0)) {
                const rushBonus = game.isRushBonus ? BigNumService.floor(BigNumService.mul(this.goldValue, 0.25)) : BigNumService.create(0);
                game.addGold(BigNumService.add(this.goldValue, rushBonus));
            }
            game.stats.registerKill(this.typeKey === 'BOSS', this.x, this.y);
            game.stats.registerEnemySeen(this.typeKey);
            game.town.addXP(this.typeKey === 'BOSS' ? 10 : 1);
            if (game.challenges.dmTech['siphon'] && this.typeKey !== 'BOSS' && Math.random() < 0.01) {
                game.ether = BigNumService.add(game.ether, 1);
            }
            if (this.typeKey === 'SPLITTER') {
                game.enemies.push(new Enemy(game, this.wave, 'MINI', this.x, this.y - 10));
                game.enemies.push(new Enemy(game, this.wave, 'MINI', this.x, this.y + 10));
            }
            if (Math.random() < 0.05) game.runes.push(game.createRune(this.x, this.y));
            if (!silent && game.settings.showDamageText) {
                game.floatingTexts.push(game.createFloatingText(this.x, this.y - 40, `+${formatNumber(this.goldValue)}`, '#fbbf24', 16));
            }
            game.sound.play('coin');
            if (this.typeKey === 'BOSS') {
                for (let i = 0; i < 20; i++) game.particles.push(game.createParticle(this.x, this.y, '#ef4444'));
                game.tryDropRelic();
                game.onBossKill();
            } else if (game.particles.length < 50) {
                for (let i = 0; i < 3; i++) game.particles.push(game.createParticle(this.x, this.y, this.color));
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
        if (this.typeKey === 'PHANTOM') {
            ctx.globalAlpha = 0.6;
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        } else if (this.type.scale > 2) {
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#fff';
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
        if (this.isElite) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#facc15';
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        ctx.restore();
        // Convert BigNum to standard Number for canvas operations
        const hpPercent = Math.max(0, BigNumService.toNumber(BigNumService.div(this.hp, this.maxHp)));
        ctx.fillStyle = COLORS.HEALTH_BG;
        ctx.fillRect(this.x - 10, this.y - 20 - (this.radius), 20, 4);
        ctx.fillStyle = COLORS.HEALTH_FILL;
        ctx.fillRect(this.x - 10, this.y - 20 - (this.radius), 20 * hpPercent, 4);
    }
}
