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
import { CONFIG, MathUtils, formatNumber } from '../config.js';
import { t } from '../i18n.js';

export class Enemy {
    constructor(game, wave, typeKey = 'NORMAL', x, y) {
        this.game = game;
        this.type = ENEMY_TYPES[typeKey];
        this.typeKey = typeKey;
        this.radius = 12 * this.type.scale;
        this.isElite = Math.random() < 0.05;
        this.x = x || game.width + 50;
        this.y = y || MathUtils.randomRange(game.height * 0.2, game.height * 0.8);
        const diffMult = 1 + (wave * 0.35);
        const hpMod = game.activeChallenge && game.activeChallenge.id === 'glass' ? 0.1 : 1;
        const speedMod = game.activeChallenge && game.activeChallenge.id === 'speed' ? 2 : 1;
        const dread = game.getDreadMultipliers();
        this.wave = wave;
        this.maxHp = Math.floor(CONFIG.baseEnemyHp * diffMult * this.type.hpMult * (this.isElite ? 5 : 1) * hpMod * dread.enemyHp);
        this.hp = this.maxHp;
        this.baseSpeed = CONFIG.baseEnemySpeed * (1 + wave * 0.03) * this.type.speedMult * speedMod * dread.enemySpeed;
        this.damage = Math.floor((5 + Math.floor(wave * 0.8)) * (typeKey === 'BOSS' ? 5 : 1) * dread.enemyDamage);
        const baseGold = Math.max(1, Math.floor(2 * (1 + wave * 0.18)));
        const passiveGoldMult = game.passives?.getEffect('goldGain') || 1;
        const prestigeGoldMult = game.prestige?.getEffect('prestige_gold') || 1;
        const goldMult = game.metaUpgrades.getEffectValue('goldMult') * (1 + (game.relicMults.gold || 0)) * passiveGoldMult * prestigeGoldMult;
        const catchupBonus = (wave > (game.stats?.maxWave || 0)) ? 1.5 : 1.0;
        this.goldValue = Math.floor(baseGold * goldMult * catchupBonus * (typeKey === 'BOSS' ? 15 : (typeKey === 'TANK' ? 2 : 1)) * (this.isElite ? 10 : 1) * dread.crystalBonus);
        if (game.activeBuffs['midas'] > 0) this.goldValue *= 5;
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
        if (game.skills?.isActive?.('blackhole')) {
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
            if (this.teleportTimer > 2000) {
                this.x -= 100;
                game.particles.push(game.createParticle(this.x + 100, this.y, '#fff'));
                this.teleportTimer = 0;
            }
        }
        if (this.typeKey === 'THIEF') {
            if (this.state === 'APPROACH') {
                if (dist <= 90) {
                    this.state = 'FLEE';
                    const stolen = Math.floor(game.gold * 0.1);
                    game.gold -= stolen;
                    game.floatingTexts.push(game.createFloatingText(this.x, this.y - 30, `-${stolen} 💰`, '#ef4444', 20));
                }
            } else if (this.state === 'FLEE') {
                this.x += currentSpeed * 1.5 * (dt / 16);
                if (this.x > game.width + 100) this.hp = 0;
            }
            return;
        }
        if (this.typeKey === 'HEALER') {
            if (Math.random() < 0.05) {
                const healRangeSq = 150 * 150;
                game.enemies.forEach(e => {
                    if (e !== this && e.hp < e.maxHp && MathUtils.distSq(this.x, this.y, e.x, e.y) < healRangeSq) {
                        e.hp = Math.min(e.maxHp, e.hp + (e.maxHp * 0.05));
                        const beam = game.createParticle(this.x, this.y, '#4ade80');
                        beam.tx = e.x;
                        beam.ty = e.y;
                        beam.life = 0.5;
                        beam.draw = function(ctx) {
                            ctx.globalAlpha = this.life;
                            ctx.strokeStyle = '#4ade80';
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
        if (game.challenges.dmTech['berserk']) {
            const missingHpPct = 1 - (game.castle.hp / game.castle.maxHp);
            if (missingHpPct > 0) amount *= (1 + missingHpPct);
        }
        this.hp -= amount;
        if (!silent && game.settings.showDamageText) {
            game.floatingTexts.push(game.createFloatingText(
                this.x, this.y - 20,
                formatNumber(amount),
                isSuperCrit ? '#d946ef' : (isCrit ? '#ef4444' : '#fff'),
                isSuperCrit ? 40 : (isCrit ? 30 : 20)
            ));
        }
        if (!silent) game.sound.play('hit');
        if (this.hp <= 0) {
            if (this.state !== 'FLEE' || this.hp <= 0) {
                game.addGold(this.goldValue + (game.isRushBonus ? Math.floor(this.goldValue * 0.25) : 0));
            }
            game.stats.registerKill(this.typeKey === 'BOSS', this.x, this.y);
            game.stats.registerEnemySeen(this.typeKey);
            game.town.addXP(this.typeKey === 'BOSS' ? 10 : 1);
            if (game.challenges.dmTech['siphon'] && this.typeKey !== 'BOSS' && Math.random() < 0.01) game.ether++;
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
        ctx.fillStyle = this.status.stasisTimer > 0 ? '#1e40af' : (this.status.iceTimer > 0 ? '#38bdf8' : (this.status.poisonTimer > 0 ? '#4ade80' : (this.typeKey === 'THIEF' ? '#94a3b8' : (this.typeKey === 'PHANTOM' ? '#fff' : this.color))));
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
        const hpPercent = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 10, this.y - 20 - (this.radius), 20, 4);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(this.x - 10, this.y - 20 - (this.radius), 20 * hpPercent, 4);
    }
}
