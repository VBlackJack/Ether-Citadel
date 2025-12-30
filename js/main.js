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

import { i18n, t } from './i18n.js';
import { CONFIG, SOUND_DB, MathUtils, formatNumber } from './config.js';
import {
    CHALLENGES,
    DARK_MATTER_UPGRADES,
    RELIC_DB,
    ACHIEVEMENTS_DB,
    ENEMY_TYPES,
    RUNE_TYPES,
    MASTERIES,
    MINING_RESOURCES,
    FORGE_RECIPES,
    RESEARCH_TREE,
    TURRET_TIERS,
    DREAD_LEVELS,
    PRODUCTION_BUILDINGS,
    AURA_TYPES,
    CHIP_TYPES,
    DAILY_QUEST_TYPES,
    PRESTIGE_UPGRADES,
    GAME_SPEEDS,
    TOWN_LEVELS,
    SCHOOL_TURRETS,
    OFFICE_BOOSTS,
    AWAKENING_BONUSES,
    TURRET_SLOTS,
    WEATHER_TYPES,
    TALENT_TREES,
    RANDOM_EVENTS,
    ASCENSION_PERKS,
    COMBO_TIERS,
    createUpgrades,
    createMetaUpgrades,
    getName,
    getDesc
} from './data.js';

class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.muted = false;
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
    }

    play(id) {
        if (this.muted || !this.ctx) return;
        const s = SOUND_DB[id];
        if (!s) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = s.type;
        osc.frequency.setValueAtTime(s.freq, this.ctx.currentTime);
        if (s.slide) osc.frequency.exponentialRampToValueAtTime(s.freq * 2, this.ctx.currentTime + s.decay);
        if (s.slideDown) osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + s.decay);
        gain.gain.setValueAtTime(s.vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + s.decay);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + s.decay);
        if (s.melody) {
            setTimeout(() => {
                const osc2 = this.ctx.createOscillator();
                const gain2 = this.ctx.createGain();
                osc2.frequency.setValueAtTime(s.freq * 1.5, this.ctx.currentTime);
                gain2.gain.setValueAtTime(s.vol, this.ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + s.decay);
                osc2.connect(gain2);
                gain2.connect(this.masterGain);
                osc2.start();
                osc2.stop(this.ctx.currentTime + s.decay);
            }, 150);
        }
    }

    toggle() {
        this.muted = !this.muted;
        const btn = document.getElementById('btn-sound');
        if (btn) btn.innerText = this.muted ? '🔇' : '🔊';
        if (!this.muted && this.ctx.state === 'suspended') this.ctx.resume();
    }
}

class TutorialManager {
    constructor() {
        this.step = 0;
    }

    check(gold) {
        const overlay = document.getElementById('tutorial-overlay');
        if (!overlay) return;
        const title = document.getElementById('tuto-title');
        const text = document.getElementById('tuto-text');
        const arrow = document.getElementById('tuto-arrow');

        if (this.step === 0) {
            overlay.classList.remove('hidden');
            title.innerText = t('tutorial.welcome.title');
            text.innerText = t('tutorial.welcome.text');
            arrow.classList.add('hidden');
        } else if (this.step === 1 && gold >= 10) {
            overlay.classList.remove('hidden');
            overlay.style.top = '60%';
            overlay.style.left = '80%';
            title.innerText = t('tutorial.upgrade.title');
            text.innerText = t('tutorial.upgrade.text');
            arrow.classList.remove('hidden');
            arrow.style.transform = 'rotate(90deg)';
            arrow.style.right = '-40px';
        }
    }

    next() {
        this.step++;
        document.getElementById('tutorial-overlay').classList.add('hidden');
    }
}

class FloatingText {
    constructor(x, y, text, color, size = 20) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.life = 1.0;
        this.vy = -1;
    }

    update(dt) {
        this.y += this.vy * (dt / 16);
        this.life -= 0.02 * (dt / 16);
    }

    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.size}px Rajdhani`;
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1.0;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.02;
    }

    update(dt) {
        const timeScale = dt / 16;
        this.x += this.vx * timeScale;
        this.y += this.vy * timeScale;
        this.life -= this.decay * timeScale;
    }

    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

class Rune {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = RUNE_TYPES[Math.floor(Math.random() * RUNE_TYPES.length)];
        this.life = 10000;
        this.scale = 1;
        this.scaleDir = 1;
    }

    update(dt) {
        this.life -= dt;
        this.scale += 0.01 * this.scaleDir;
        if (this.scale > 1.2 || this.scale < 0.8) this.scaleDir *= -1;
        if (game.drone && game.drone.canCollect) {
            const d = MathUtils.dist(this.x, this.y, game.drone.x, game.drone.y);
            if (d < 100) {
                this.x = MathUtils.lerp(this.x, game.drone.x, 0.1);
                this.y = MathUtils.lerp(this.y, game.drone.y, 0.1);
                if (d < 20) {
                    game.activateRune(this);
                    this.life = 0;
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.fillStyle = this.type.color;
        ctx.shadowColor = this.type.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.icon, 0, 0);
        ctx.restore();
    }
}

class Projectile {
    constructor(x, y, target, damage, speed, color, tier, isMulti, isCrit, isSuperCrit, effects, props) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.color = color;
        this.active = true;
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
            if (MathUtils.dist(this.x, this.y, this.target.x, this.target.y) < this.target.radius + 15) {
                this.hit(this.target);
            }
        } else {
            this.active = false;
        }
    }

    hit(target) {
        target.takeDamage(this.damage, this.isCrit, this.isSuperCrit);
        if (this.effects.ice) target.applyStatus('ice', 0.6, 2000);
        if (this.effects.poison) target.applyStatus('poison', this.damage * 0.2, 3000);
        if (this.stasisChance > 0 && Math.random() < this.stasisChance) target.applyStatus('stasis', 0, 2000);
        if (this.leech > 0 && target.hp <= 0) game.castle.heal(this.leech);
        if (this.blastRadius > 0) this.explode();
        if (this.bounceCount > 0) this.bounce(target);
        else if (this.blastRadius <= 0) this.active = false;
        if (this.bounceCount <= 0) this.active = false;
        if (game.particles.length < 50) {
            for (let i = 0; i < 3; i++) game.particles.push(new Particle(this.x, this.y, this.color));
        }
    }

    explode() {
        game.enemies.forEach(e => {
            if (e.hp > 0 && MathUtils.dist(this.x, this.y, e.x, e.y) < this.blastRadius) {
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
        game.particles.push(ripple);
    }

    bounce(lastTarget) {
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
}

class Turret {
    constructor(id, offsetIndex, total, type = 'NORMAL', tier = 1) {
        this.id = id;
        this.offsetIndex = offsetIndex;
        this.total = total;
        this.type = type;
        this.tier = tier;
        this.x = 0;
        this.y = 0;
        this.lastShotTime = 0;
        this.updateTierStats();
    }

    updateTierStats() {
        const tierData = TURRET_TIERS[this.tier] || TURRET_TIERS[1];
        this.damageMultiplier = 0.25 * tierData.damageMult;
        this.rangeMult = tierData.rangeMult;
        this.fireRateMult = tierData.fireRateMult;

        if (this.type === 'ARTILLERY') { this.damageMultiplier = 0.8 * tierData.damageMult; this.fireRateMult *= 0.3; this.rangeMult *= 1.5; }
        if (this.type === 'ROCKET') { this.damageMultiplier = 0.5 * tierData.damageMult; this.fireRateMult *= 0.5; this.rangeMult *= 1.2; }
        if (this.type === 'TESLA') { this.damageMultiplier = 0.2 * tierData.damageMult; this.fireRateMult *= 1.5; this.rangeMult *= 0.8; }
    }

    upgradeTier() {
        if (this.tier >= 6) return false;
        const nextTier = TURRET_TIERS[this.tier + 1];
        if (!nextTier) return false;
        if (game.wave < nextTier.unlockWave) return false;
        if (game.crystals < nextTier.cost) return false;

        game.crystals -= nextTier.cost;
        this.tier++;
        this.updateTierStats();
        game.updateCrystalsUI();
        game.save();
        return true;
    }

    update(dt, gameTime) {
        const slots = [{ x: -40, y: -60 }, { x: 40, y: -60 }, { x: -40, y: 60 }, { x: 40, y: 60 }];
        if (this.type === 'ARTILLERY') { this.x = game.castle.x; this.y = game.castle.y - 70; }
        else if (this.type === 'ROCKET') { this.x = game.castle.x - 50; this.y = game.castle.y; }
        else if (this.type === 'TESLA') { this.x = game.castle.x + 50; this.y = game.castle.y; }
        else {
            if (this.id < 4) {
                const pos = slots[this.id];
                this.x = game.castle.x + pos.x;
                this.y = game.castle.y + pos.y;
            } else {
                const orbitSpeed = 0.001;
                const angle = (gameTime * orbitSpeed) + (this.id * (Math.PI / 2));
                const orbitRadius = 100;
                this.x = game.castle.x + Math.cos(angle) * orbitRadius;
                this.y = game.castle.y + Math.sin(angle) * orbitRadius;
            }
        }

        const baseFireRate = game.skills.isActive('overdrive') || game.activeBuffs['rage'] > 0 ? game.currentFireRate / 3 : game.currentFireRate;
        const fireInterval = baseFireRate / this.fireRateMult;
        if (gameTime - this.lastShotTime > fireInterval) {
            const range = game.currentRange * this.rangeMult;
            const target = game.findTarget(this.x, this.y, range);
            if (target) {
                this.shoot(target);
                this.lastShotTime = gameTime;
            }
        }
    }

    shoot(target) {
        const dmg = Math.max(1, Math.floor(game.currentDamage * this.damageMultiplier));
        let speed = 15;
        const tierData = TURRET_TIERS[this.tier] || TURRET_TIERS[1];
        let color = tierData.color || '#a5b4fc';
        let props = { ...game.currentProps };
        if (this.type === 'ARTILLERY') { speed = 8; color = '#fca5a5'; props.blast = 100; }
        if (this.type === 'ROCKET') { speed = 12; color = '#fdba74'; }
        if (this.type === 'TESLA') { speed = 25; color = '#67e8f9'; props.bounce = (props.bounce || 0) + 3; }
        game.projectiles.push(new Projectile(this.x, this.y, target, dmg, speed, color, this.tier, false, false, false, game.currentEffects, props));
    }

    draw(ctx) {
        const tierData = TURRET_TIERS[this.tier] || TURRET_TIERS[1];
        ctx.save();
        ctx.translate(this.x, this.y);
        const target = game.findTarget(this.x, this.y, game.currentRange * this.rangeMult);
        if (target) ctx.rotate(Math.atan2(target.y - this.y, target.x - this.x));

        ctx.shadowColor = tierData.color;
        ctx.shadowBlur = this.tier > 1 ? 5 + this.tier * 2 : 0;

        if (this.type === 'ARTILLERY') { ctx.fillStyle = '#7f1d1d'; ctx.fillRect(0, -8, 24, 16); }
        else if (this.type === 'ROCKET') { ctx.fillStyle = '#c2410c'; ctx.fillRect(0, -6, 20, 12); }
        else if (this.type === 'TESLA') {
            ctx.fillStyle = '#0e7490';
            ctx.fillRect(0, -4, 15, 8);
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.strokeStyle = '#67e8f9';
            ctx.stroke();
        }
        else { ctx.fillStyle = tierData.color; ctx.fillRect(0, -6, 20, 12); }
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#312e81';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

class Drone {
    constructor() {
        this.angle = 0;
        this.radius = 60;
        this.x = 0;
        this.y = 0;
        this.lastShotTime = 0;
        this.canCollect = false;
        this.fireRate = 500;
        this.damage = 10;
    }

    update(dt, gameTime) {
        this.angle += 0.02 * (dt / 16);
        this.x = 100 + Math.cos(this.angle) * this.radius;
        this.y = game.height / 2 + Math.sin(this.angle) * this.radius;
        const speedBoost = game.stats.mastery['drone_spd'] ? (1 + game.stats.mastery['drone_spd'] * 0.1) : 1;
        const overlord = game.challenges.dmTech['overlord'] ? 2 : 1;
        if (gameTime - this.lastShotTime > (this.fireRate / (speedBoost * overlord))) {
            const target = game.findTarget(this.x, this.y, 400);
            if (target) {
                const dmg = Math.max(1, Math.floor(game.currentDamage * 0.1));
                game.projectiles.push(new Projectile(this.x, this.y, target, dmg, 20, '#06b6d4', 1));
                game.sound.play('shoot');
                this.lastShotTime = gameTime;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-5, 5);
        ctx.lineTo(-5, -5);
        ctx.fill();
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Enemy {
    constructor(wave, typeKey = 'NORMAL', x, y) {
        this.type = ENEMY_TYPES[typeKey];
        this.typeKey = typeKey;
        this.radius = 12 * this.type.scale;
        this.isElite = Math.random() < 0.05;
        this.x = x || game.width + 50;
        this.y = y || MathUtils.randomRange(game.height * 0.2, game.height * 0.8);
        const diffMult = 1 + (wave * 0.20);
        const hpMod = game.activeChallenge && game.activeChallenge.id === 'glass' ? 0.1 : 1;
        const speedMod = game.activeChallenge && game.activeChallenge.id === 'speed' ? 2 : 1;
        const dread = game.getDreadMultipliers();
        this.maxHp = Math.floor(CONFIG.baseEnemyHp * diffMult * this.type.hpMult * (this.isElite ? 5 : 1) * hpMod * dread.enemyHp);
        this.hp = this.maxHp;
        this.baseSpeed = CONFIG.baseEnemySpeed * (1 + wave * 0.03) * this.type.speedMult * speedMod * dread.enemySpeed;
        this.damage = Math.floor((5 + Math.floor(wave * 0.8)) * (typeKey === 'BOSS' ? 5 : 1) * dread.enemyDamage);
        const baseGold = Math.max(1, Math.floor(2 * (1 + wave * 0.18)));
        const goldMult = game.metaUpgrades.getEffectValue('goldMult') * (1 + (game.relicMults.gold || 0));
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
            this.takeDamage(game.currentDamage * 2, true, false, false);
            game.floatingTexts.push(new FloatingText(this.x, this.y - 40, t('notifications.thermalShock'), "#f97316", 24));
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
                game.particles.push(new Particle(this.x + 100, this.y, '#fff'));
                this.teleportTimer = 0;
            }
        }
        if (this.typeKey === 'THIEF') {
            if (this.state === 'APPROACH') {
                if (dist <= 90) {
                    this.state = 'FLEE';
                    const stolen = Math.floor(game.gold * 0.1);
                    game.gold -= stolen;
                    game.floatingTexts.push(new FloatingText(this.x, this.y - 30, `-${stolen} 💰`, '#ef4444', 20));
                }
            } else if (this.state === 'FLEE') {
                this.x += currentSpeed * 1.5 * (dt / 16);
                if (this.x > game.width + 100) this.hp = 0;
            }
            return;
        }
        if (this.typeKey === 'HEALER') {
            if (Math.random() < 0.05) {
                game.enemies.forEach(e => {
                    if (e !== this && e.hp < e.maxHp && MathUtils.dist(this.x, this.y, e.x, e.y) < 150) {
                        e.hp = Math.min(e.maxHp, e.hp + (e.maxHp * 0.05));
                        const beam = new Particle(this.x, this.y, '#4ade80');
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
        if (game.challenges.dmTech['berserk']) {
            const missingHpPct = 1 - (game.castle.hp / game.castle.maxHp);
            if (missingHpPct > 0) amount *= (1 + missingHpPct);
        }
        this.hp -= amount;
        if (!silent && game.settings.showDamageText) {
            game.floatingTexts.push(new FloatingText(
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
                game.enemies.push(new Enemy(game.wave, 'MINI', this.x, this.y - 10));
                game.enemies.push(new Enemy(game.wave, 'MINI', this.x, this.y + 10));
            }
            if (Math.random() < 0.05) game.runes.push(new Rune(this.x, this.y));
            if (!silent && game.settings.showDamageText) {
                game.floatingTexts.push(new FloatingText(this.x, this.y - 40, `+${formatNumber(this.goldValue)}`, '#fbbf24', 16));
            }
            game.sound.play('coin');
            if (this.typeKey === 'BOSS') {
                for (let i = 0; i < 20; i++) game.particles.push(new Particle(this.x, this.y, '#ef4444'));
                game.tryDropRelic();
                game.onBossKill();
            } else if (game.particles.length < 50) {
                for (let i = 0; i < 3; i++) game.particles.push(new Particle(this.x, this.y, this.color));
            }
        }
    }

    draw(ctx) {
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

class Castle {
    constructor() {
        this.x = 100;
        this.y = 0;
        this.baseMaxHp = 100;
        this.maxHp = 100;
        this.hp = 100;
        this.regen = 0;
        this.tier = 1;
        this.shield = 0;
        this.maxShield = 0;
        this.shieldRegenTimer = 0;
        this.width = 80;
        this.height = 100;
        this.radius = 60;
        this.armor = 0;
    }

    update(dt) {
        if (game.activeChallenge && game.activeChallenge.id === 'noregen') {
            // No regen
        } else if (this.hp < this.maxHp && this.hp > 0) {
            this.hp += (this.regen / 60) * (dt / 16);
            if (this.hp > this.maxHp) this.hp = this.maxHp;
        }
        if (this.maxShield > 0) {
            if (this.shieldRegenTimer > 0) this.shieldRegenTimer -= dt;
            else if (this.shield < this.maxShield) this.shield += (this.maxShield * 0.05) * (dt / 16);
            if (this.shield > this.maxShield) this.shield = this.maxShield;
        }
    }

    heal(amount) {
        if (game.activeChallenge && game.activeChallenge.id === 'noregen') return;
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    takeDamage(amount) {
        amount = amount * (1 - this.armor);
        if (this.shield > 0) {
            if (this.shield >= amount) {
                this.shield -= amount;
                amount = 0;
            } else {
                amount -= this.shield;
                this.shield = 0;
            }
            this.shieldRegenTimer = 3000;
        }
        if (amount > 0) {
            this.hp -= amount;
            document.getElementById('damage-overlay').classList.add('damage-effect');
            setTimeout(() => document.getElementById('damage-overlay').classList.remove('damage-effect'), 200);
            if (this.hp <= 0) {
                this.hp = 0;
                game.gameOver();
            }
        }
    }

    draw(ctx, width, height) {
        this.y = height / 2;
        if (game.settings.showRange) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, game.currentRange, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(this.x - 40, this.y - 60, 80, 120);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x - 40, this.y - 60, 80, 120);
        const slots = [{ x: -40, y: -60 }, { x: 40, y: -60 }, { x: -40, y: 60 }, { x: 40, y: 60 }];
        slots.forEach(s => {
            ctx.beginPath();
            ctx.arc(this.x + s.x, this.y + s.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.stroke();
        });
        ctx.translate(this.x, this.y);
        const target = game.findTarget(this.x, this.y, game.currentRange);
        if (target) ctx.rotate(Math.atan2(target.y - this.y, target.x - this.x));
        if (this.shield > 0) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#60a5fa';
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 70, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        if (this.tier === 1) {
            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(0, -10, 30, 20);
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.fillStyle = '#2563eb';
            ctx.fill();
        } else if (this.tier === 2) {
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(0, -12, 35, 24);
            ctx.fillStyle = '#7e22ce';
            ctx.fillRect(-25, -25, 50, 50);
            ctx.strokeStyle = '#d8b4fe';
            ctx.lineWidth = 2;
            ctx.strokeRect(-20, -20, 40, 40);
        } else if (this.tier === 3) {
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(0, -8, 45, 16);
            ctx.fillStyle = '#be123c';
            ctx.beginPath();
            for (let i = 0; i < 6; i++) ctx.lineTo(30 * Math.cos(i * Math.PI / 3), 30 * Math.sin(i * Math.PI / 3));
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const hue = (Date.now() / 20) % 360;
            ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
            ctx.fillRect(0, -10, 50, 20);
            ctx.fillStyle = '#fff';
            ctx.shadowColor = `hsl(${hue}, 80%, 60%)`;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.restore();
    }
}

class SkillManager {
    constructor() {
        this.skills = {
            overdrive: { duration: 5000, cooldown: 30000, activeTime: 0, cdTime: 0 },
            nuke: { duration: 0, cooldown: 60000, activeTime: 0, cdTime: 0 },
            blackhole: { duration: 4000, cooldown: 45000, activeTime: 0, cdTime: 0 }
        };
        this.autoSkills = {
            overdrive: false,
            nuke: false,
            blackhole: false
        };
    }

    toggleAutoSkill(id) {
        this.autoSkills[id] = !this.autoSkills[id];
        this.updateAutoSkillUI();
    }

    updateAutoSkillUI() {
        for (let key in this.autoSkills) {
            const btn = document.getElementById(`auto-${key}`);
            if (btn) {
                if (this.autoSkills[key]) {
                    btn.classList.add('bg-green-600');
                    btn.classList.remove('bg-slate-600');
                } else {
                    btn.classList.remove('bg-green-600');
                    btn.classList.add('bg-slate-600');
                }
            }
        }
    }

    canUseAutoSkill() {
        return window.game && (game.relicMults.autoSkill || game.metaUpgrades.getEffectValue('autoSkillQ') || game.metaUpgrades.getEffectValue('autoSkillW') || game.metaUpgrades.getEffectValue('autoSkillE'));
    }

    activate(id) {
        if (!window.game || game.isGameOver) return;
        const s = this.skills[id];
        const maxCd = s.cooldown * (1 - (game.relicMults.cooldown || 0));
        if (s.cdTime <= 0) {
            s.activeTime = s.duration;
            s.cdTime = maxCd;
            if (id === 'nuke') {
                game.enemies.forEach(e => {
                    if (e.typeKey !== 'BOSS') e.takeDamage(e.maxHp * 20, false, false, true);
                    else e.takeDamage(game.currentDamage * 50, false, false, true);
                });
                document.body.classList.add('shake');
                setTimeout(() => document.body.classList.remove('shake'), 500);
            }
            if (game.dailyQuests) {
                game.dailyQuests.updateProgress('use_skills', 1);
            }
        }
    }

    isActive(id) {
        return this.skills[id].activeTime > 0;
    }

    update(dt) {
        for (let key in this.skills) {
            const s = this.skills[key];
            const skillEl = document.getElementById('skill-' + key);

            if (s.activeTime > 0) {
                s.activeTime -= dt;
                if (skillEl) skillEl.classList.add('skill-active');
            } else {
                if (skillEl) skillEl.classList.remove('skill-active');
            }

            if (s.cdTime > 0) {
                s.cdTime -= dt;
                if (s.cdTime <= 0) {
                    if (skillEl) {
                        skillEl.classList.add('skill-ready-anim');
                        setTimeout(() => skillEl.classList.remove('skill-ready-anim'), 500);
                    }
                }
            }
            const btn = document.getElementById(`cd-${key}`);
            const maxCd = s.cooldown * (1 - (game.relicMults.cooldown || 0));
            if (btn) btn.style.height = `${Math.max(0, s.cdTime / maxCd) * 100}%`;

            if (this.autoSkills[key] && s.cdTime <= 0 && game.enemies.length > 0 && !game.isGameOver) {
                const canAuto = (key === 'overdrive' && game.metaUpgrades.getEffectValue('autoSkillQ')) ||
                               (key === 'nuke' && game.metaUpgrades.getEffectValue('autoSkillW')) ||
                               (key === 'blackhole' && game.metaUpgrades.getEffectValue('autoSkillE')) ||
                               game.relicMults.autoSkill;
                if (canAuto) {
                    this.activate(key);
                }
            }
        }
    }
}

class MetaUpgradeManager {
    constructor() {
        this.upgrades = createMetaUpgrades();
    }

    getCost(u) {
        return Math.floor(u.baseCost * Math.pow(u.costMult, u.level));
    }

    getEffectValue(id) {
        const u = this.upgrades.find(up => up.id === id);
        return u ? u.getEffect(u.level) : 0;
    }

    buy(id) {
        if (!window.game) return;
        const u = this.upgrades.find(up => up.id === id);
        if (!u || (u.maxLevel && u.level >= u.maxLevel)) return;
        const cost = this.getCost(u);
        if (game.ether >= cost) {
            game.ether -= cost;
            u.level++;
            game.save();
            this.render();
            game.updateEtherUI();
            game.updateAutomationUI();
            game.updateDroneStatus();
        }
    }

    render() {
        const container = document.getElementById('meta-upgrade-list');
        if (!container) return;
        container.innerHTML = '';
        this.upgrades.forEach(u => {
            const cost = this.getCost(u);
            const isMaxed = u.maxLevel && u.level >= u.maxLevel;
            const canAfford = game.ether >= cost && !isMaxed;
            const div = document.createElement('div');
            div.className = `p-4 rounded-xl border flex justify-between items-center transition-all ${isMaxed ? 'bg-slate-700 border-slate-600 opacity-75' : canAfford ? 'bg-purple-900/40 border-purple-500 hover:bg-purple-800/60 cursor-pointer active:scale-95' : 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed'}`;
            if (canAfford) div.onclick = () => this.buy(u.id);
            div.innerHTML = `<div class="flex items-center gap-3"><div class="text-3xl">${u.icon}</div><div><div class="font-bold text-white">${t(u.nameKey)} ${isMaxed ? `<span class="text-xs text-yellow-400">${t('lab.max')}</span>` : ''}</div><div class="text-xs text-purple-200">${t(u.descKey)}</div></div></div><div class="text-right">${!isMaxed ? `<div class="text-purple-300 font-bold font-mono text-xl">${cost} 🔮</div>` : ''}<div class="text-xs text-slate-500">${t('lab.level')} ${u.level}</div></div>`;
            container.appendChild(div);
        });
    }
}

class UpgradeManager {
    constructor() {
        this.upgrades = createUpgrades();
    }

    getCost(upgrade) {
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.level));
    }

    buy(id, silent = false) {
        if (!window.game) return false;
        const u = this.upgrades.find(upg => upg.id === id);
        if (!u || (u.maxLevel && u.level >= u.maxLevel)) return false;

        if (game.buyMode === 'MAX') {
            let count = 0;
            let totalCost = 0;
            let currentLvl = u.level;
            while (true) {
                let nextCost = Math.floor(u.baseCost * Math.pow(u.costMult, currentLvl + count));
                if (game.gold < totalCost + nextCost) break;
                if (u.maxLevel && currentLvl + count >= u.maxLevel) break;
                totalCost += nextCost;
                count++;
                if (count > 1000) break;
            }
            if (count > 0) {
                game.gold -= totalCost;
                u.level += count;
                game.updateStats();
                if (!silent) this.render(game.activeTab);
                game.save();
                game.tutorial.check(game.gold);
                return true;
            }
        } else {
            const cost = this.getCost(u);
            if (game.gold >= cost) {
                game.gold -= cost;
                u.level++;
                game.updateStats();
                if (!silent) this.render(game.activeTab);
                game.save();
                game.tutorial.check(game.gold);
                return true;
            }
        }
        return false;
    }

    formatValue(u, val) {
        if (u.id === 'speed') return (1000 / val).toFixed(1) + t('units.perSecond');
        if (u.id === 'crit') return `${val.chance}% / x${val.mult.toFixed(1)}`;
        if (u.id === 'range' || u.id === 'blast') return val + 'px';
        if (u.id === 'multishot' || u.id === 'armor' || u.id === 'stasis') {
            if (u.id === 'armor') return '-' + (val * 100).toFixed(1) + '%';
            return val + '%';
        }
        if (u.id === 'regen') return val + t('units.perSecond');
        if (u.id === 'leech') return `+${val} ${t('game.hp')}`;
        if (u.id === 'shield') return formatNumber(val) + ' SP';
        if (u.id === 'turret') return val + ' ' + t('units.units');
        if (u.id === 'bounce') return val + ' ' + t('units.bounces');
        if (u.id === 'orbital') return val > 0 ? (val / 1000).toFixed(1) + 's' : `<span class="text-red-400">${t('status.inactive')}</span>`;
        if (typeof val === 'boolean' || (u.maxLevel === 1 && u.level === 0)) {
            return val ? `<span class="text-green-400">${t('status.active')}</span>` : `<span class="text-red-400">${t('status.inactive')}</span>`;
        }
        return formatNumber(val);
    }

    render(activeTab) {
        const container = document.getElementById('upgrade-list');
        if (!container || typeof game === 'undefined') return;
        container.innerHTML = '';
        const filtered = this.upgrades.filter(u => u.category === activeTab);

        [0, 1, 2].forEach(catId => {
            const hasAffordable = this.upgrades.some(u => u.category === catId && game.gold >= this.getCost(u) && (!u.maxLevel || u.level < u.maxLevel));
            const tabBtn = document.getElementById(`tab-${catId}`);
            if (tabBtn) {
                if (hasAffordable) tabBtn.classList.add('tab-notify');
                else tabBtn.classList.remove('tab-notify');
            }
        });

        document.getElementById('btn-bulk-buy').innerHTML = `<span>${t('lab.bulkBuy')}</span>: ${game.buyMode}`;

        filtered.forEach(u => {
            let cost = this.getCost(u);
            if (game.buyMode === 'MAX') {
                let count = 0;
                let totalCost = 0;
                let currentLvl = u.level;
                while (true) {
                    let nextCost = Math.floor(u.baseCost * Math.pow(u.costMult, currentLvl + count));
                    if (game.gold < totalCost + nextCost && count > 0) break;
                    if (game.gold < nextCost && count === 0) { totalCost = nextCost; break; }
                    if (u.maxLevel && currentLvl + count >= u.maxLevel) break;
                    totalCost += nextCost;
                    count++;
                    if (count > 1000) break;
                }
                cost = totalCost;
            }

            const isMaxed = u.maxLevel && u.level >= u.maxLevel;
            const canAfford = game.gold >= cost && !isMaxed;
            const tm = Math.pow(CONFIG.evolutionMultiplier, game.castle.tier - 1);
            const mdm = game.metaUpgrades.getEffectValue('damageMult') * (1 + (game.relicMults.damage || 0));
            const mhm = game.metaUpgrades.getEffectValue('healthMult') * (1 + (game.relicMults.health || 0));

            let val = u.getValue(u.level);
            let next = u.getValue(u.level + 1);

            if (u.id === 'damage') { val = Math.floor(val * tm * mdm); next = Math.floor(next * tm * mdm); }
            else if (u.id === 'health') { val = Math.floor(val * tm * mhm); next = Math.floor(next * tm * mhm); }
            else if (u.id === 'regen') { val = (val * tm).toFixed(1); next = (next * tm).toFixed(1); }

            const div = document.createElement('div');
            div.className = `p-3 rounded-lg border-2 transition-all cursor-pointer select-none group ${isMaxed ? 'bg-slate-700 border-slate-600 opacity-75' : canAfford ? 'bg-slate-800 border-blue-600 hover:bg-slate-700 active:scale-95' : 'bg-slate-900 border-slate-700 opacity-60 cursor-not-allowed'}`;
            if (!isMaxed) div.onclick = () => { if (canAfford) this.buy(u.id); };
            div.innerHTML = `<div class="flex justify-between items-start mb-1"><div class="flex items-center gap-2"><span class="text-2xl">${u.icon}</span><div><div class="font-bold text-white leading-tight">${t(u.nameKey)} ${isMaxed ? `<span class="text-xs text-yellow-400">${t('lab.max')}</span>` : ''}</div><div class="text-xs text-blue-300">${t('lab.level')} ${u.level}</div></div></div><div class="text-right">${!isMaxed ? `<div class="text-yellow-400 font-bold font-mono">${formatNumber(cost)}</div>` : ''}</div></div><div class="flex justify-between items-center text-xs font-mono bg-black/30 p-1 rounded"><span class="text-slate-300">${this.formatValue(u, val)}</span><span class="text-slate-500">➜</span><span class="text-green-400 font-bold">${this.formatValue(u, next)}</span></div>`;
            container.appendChild(div);
        });
        if (filtered.length === 0) {
            container.innerHTML = `<div class="text-slate-500 text-center py-4">${t('lab.empty')}</div>`;
        }
    }
}

class StatsManager {
    constructor() {
        this.kills = 0;
        this.bosses = 0;
        this.totalGold = 0;
        this.maxWave = 0;
        this.unlockedAchievements = [];
        this.xp = 0;
        this.level = 1;
        this.masteryPoints = 0;
        this.mastery = { crit_dmg: 0, ether_gain: 0, drone_spd: 0, gold_drop: 0 };
        this.seenEnemies = [];
    }

    registerKill(isBoss, x, y) {
        this.kills++;
        if (isBoss) this.bosses++;
        const gain = isBoss ? 50 : 5;
        this.xp += gain;
        if (this.xp >= this.getNextLevelXp()) {
            this.xp -= this.getNextLevelXp();
            this.level++;
            this.masteryPoints++;
            game.floatingTexts.push(new FloatingText(100, game.height / 2 - 50, t('notifications.levelUp'), "#22d3ee", 30));
        }
        this.checkAchievements();

        if (game.dailyQuests) {
            game.dailyQuests.updateProgress('kill_enemies', 1);
            if (isBoss) {
                game.dailyQuests.updateProgress('kill_bosses', 1);
            }
        }
    }

    getNextLevelXp() {
        return this.level * 200;
    }

    registerGold(amount) {
        this.totalGold += amount;
        this.checkAchievements();
        if (game.dailyQuests) {
            game.dailyQuests.updateProgress('collect_gold', amount);
        }
    }

    registerWave(wave) {
        if (wave > this.maxWave) this.maxWave = wave;
        this.checkAchievements();
        if (game.dailyQuests) {
            // Set progress to current wave (tracks highest wave reached)
            const quest = game.dailyQuests.quests.find(q => q.id === 'reach_wave' && !q.completed);
            if (quest) {
                game.dailyQuests.progress['reach_wave'] = Math.max(game.dailyQuests.progress['reach_wave'] || 0, wave);
                if (game.dailyQuests.progress['reach_wave'] >= quest.target) {
                    game.dailyQuests.completeQuest(quest);
                }
            }
        }
    }

    registerEnemySeen(typeKey) {
        if (!this.seenEnemies.includes(typeKey)) {
            this.seenEnemies.push(typeKey);
        }
    }

    checkAchievements() {
        ACHIEVEMENTS_DB.forEach(ach => {
            if (!this.unlockedAchievements.includes(ach.id) && ach.cond(this)) {
                this.unlockedAchievements.push(ach.id);
                game.ether += ach.reward;
                game.save();
                game.updateEtherUI();
                this.showPopup(ach);
            }
        });
    }

    showPopup(ach) {
        const div = document.createElement('div');
        div.className = 'absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white font-bold p-3 rounded-xl border-2 border-white shadow-2xl z-50 loot-popup flex items-center gap-2';
        div.innerHTML = `<span class="text-2xl">🏆</span> <div><div class="text-sm">${t('modals.achievements.unlocked')}</div><div class="text-lg leading-none">${t(ach.nameKey)}</div><div class="text-xs text-green-200">+${ach.reward} Ether</div></div>`;
        document.getElementById('loot-container').appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    render() {
        const list = document.getElementById('achieve-list');
        list.innerHTML = '';
        ACHIEVEMENTS_DB.forEach(ach => {
            const unlocked = this.unlockedAchievements.includes(ach.id);
            const div = document.createElement('div');
            div.className = `p-2 rounded border flex justify-between items-center ${unlocked ? 'bg-green-900/50 border-green-500' : 'bg-slate-800 border-slate-700 opacity-60'}`;
            div.innerHTML = `<div><div class="font-bold ${unlocked ? 'text-white' : 'text-slate-400'}">${t(ach.nameKey)}</div><div class="text-xs text-slate-400">${t(ach.descKey)}</div></div><div class="text-xs font-mono ${unlocked ? 'text-green-300' : 'text-slate-500'}">${unlocked ? '✓' : `+${ach.reward}🔮`}</div>`;
            list.appendChild(div);
        });

        const mGrid = document.getElementById('mastery-grid');
        mGrid.innerHTML = '';
        document.getElementById('mastery-pts-display').innerText = this.masteryPoints;
        MASTERIES.forEach(m => {
            const lvl = this.mastery[m.id] || 0;
            const div = document.createElement('div');
            div.className = `p-3 rounded bg-slate-700 border border-slate-600 flex justify-between items-center ${this.masteryPoints > 0 && lvl < m.max ? 'cursor-pointer hover:bg-slate-600' : 'opacity-70'}`;
            if (this.masteryPoints > 0 && lvl < m.max) {
                div.onclick = () => {
                    this.mastery[m.id] = lvl + 1;
                    this.masteryPoints--;
                    game.save();
                    this.render();
                };
            }
            div.innerHTML = `<div><div class="font-bold text-cyan-300">${t(m.nameKey)}</div><div class="text-xs text-slate-400">${t(m.descKey)}</div></div><div class="text-right font-mono font-bold">${lvl}/${m.max}</div>`;
            mGrid.appendChild(div);
        });

        document.getElementById('stat-kills').innerText = formatNumber(this.kills);
        document.getElementById('stat-bosses').innerText = formatNumber(this.bosses);
        document.getElementById('stat-gold').innerText = formatNumber(Math.floor(this.totalGold));
        document.getElementById('stat-wave').innerText = this.maxWave;
        const xpPct = (this.xp / this.getNextLevelXp()) * 100;
        document.getElementById('ui-xp-bar').style.width = `${xpPct}%`;
        document.getElementById('ui-level').innerText = this.level;
        document.getElementById('ui-mastery-pts').innerText = this.masteryPoints;
        const uiMasteryPts2 = document.getElementById('ui-mastery-pts-2');
        if (uiMasteryPts2) uiMasteryPts2.innerText = this.masteryPoints;

        const cGrid = document.getElementById('codex-grid');
        cGrid.innerHTML = '';
        for (let key in ENEMY_TYPES) {
            const e = ENEMY_TYPES[key];
            const seen = this.seenEnemies.includes(key);
            const div = document.createElement('div');
            div.className = `p-3 rounded border flex items-center gap-3 ${seen ? 'bg-slate-700 border-blue-500' : 'bg-slate-800 border-slate-700 opacity-50'}`;
            div.innerHTML = seen
                ? `<div class="w-8 h-8 rounded-full" style="background:${e.color}"></div><div><div class="font-bold text-white">${t(e.nameKey)}</div><div class="text-xs text-slate-300">${t(e.descKey)}</div><div class="text-[10px] text-slate-400 mt-1">${t('modals.codex.hpMult', { value: e.hpMult })} • ${t('modals.codex.speedMult', { value: e.speedMult })}</div></div>`
                : `<div class="w-8 h-8 rounded-full bg-black"></div><div><div class="font-bold text-slate-500">${t('modals.codex.unknown')}</div><div class="text-xs text-slate-600">${t('modals.codex.unknownDesc')}</div></div>`;
            cGrid.appendChild(div);
        }
    }
}

class ChallengeManager {
    constructor() {
        this.challenges = CHALLENGES;
        this.dmTech = { berserk: 0, siphon: 0, overlord: 0 };
        this.darkMatter = 0;
    }

    startChallenge(id) {
        if (!window.game) return;
        game.activeChallenge = this.challenges.find(c => c.id === id);
        game.restart(false);
        game.updateChallengeUI();
    }

    cancelChallenge() {
        game.activeChallenge = null;
        game.restart(false);
        game.updateChallengeUI();
    }

    buyTech(id) {
        const tech = DARK_MATTER_UPGRADES.find(t => t.id === id);
        const lvl = this.dmTech[id] || 0;
        if (lvl < tech.max && this.darkMatter >= tech.cost) {
            this.darkMatter -= tech.cost;
            this.dmTech[id] = lvl + 1;
            game.save();
            this.render();
        }
    }

    render() {
        const list = document.getElementById('challenges-list');
        list.innerHTML = '';
        this.challenges.forEach(c => {
            const div = document.createElement('div');
            div.className = `bg-slate-700 p-2 rounded border border-red-900 flex justify-between items-center ${game.activeChallenge?.id === c.id ? 'border-yellow-400 bg-red-900/40' : ''}`;
            div.innerHTML = `<div><div class="font-bold text-red-300">${t(c.nameKey)}</div><div class="text-xs text-slate-400">${t(c.descKey)}</div></div><button onclick="game.challenges.startChallenge('${c.id}')" class="px-2 py-1 bg-red-600 text-xs font-bold rounded hover:bg-red-500">${t('modals.challenges.go')}</button>`;
            list.appendChild(div);
        });

        document.getElementById('dm-total-display').innerText = this.darkMatter;
        const shop = document.getElementById('dm-shop-grid');
        shop.innerHTML = '';
        DARK_MATTER_UPGRADES.forEach(tech => {
            const lvl = this.dmTech[tech.id] || 0;
            const div = document.createElement('div');
            div.className = `p-2 rounded bg-purple-900/30 border border-purple-700 ${lvl >= tech.max ? 'opacity-50' : 'hover:bg-purple-800/50 cursor-pointer'}`;
            if (lvl < tech.max) div.onclick = () => this.buyTech(tech.id);
            div.innerHTML = `<div class="flex justify-between"><span class="font-bold text-xs text-purple-300">${t(tech.nameKey)}</span><span class="text-xs">${lvl}/${tech.max}</span></div><div class="text-[10px] text-slate-400">${t(tech.descKey)}</div>${lvl < tech.max ? `<div class="text-right text-xs font-bold mt-1 text-white">${tech.cost} ⚫</div>` : `<div class="text-right text-xs text-green-400">${t('lab.max')}</div>`}`;
            shop.appendChild(div);
        });

        const hud = document.getElementById('active-challenge-hud');
        const hudName = document.getElementById('challenge-name-hud');
        if (game.activeChallenge) {
            hud.classList.remove('hidden');
            hudName.innerText = t(game.activeChallenge.nameKey);
            document.getElementById('btn-cancel-challenge').classList.remove('hidden');
        } else {
            hud.classList.add('hidden');
            document.getElementById('btn-cancel-challenge').classList.add('hidden');
        }
    }
}

class MiningManager {
    constructor(game) {
        this.game = game;
        this.activeMiners = [];
        this.maxMiners = 3;
    }

    startMining(resourceId) {
        if (this.activeMiners.length >= this.maxMiners) return false;
        if (this.activeMiners.some(m => m.resourceId === resourceId)) return false;

        const resource = MINING_RESOURCES.find(r => r.id === resourceId);
        if (!resource) return false;

        const baseDuration = 60000 / resource.baseRate;
        const speedMult = 1 + (this.game.researchEffects?.miningSpeed || 0) + (this.game.relicMults?.mining || 0);

        this.activeMiners.push({
            resourceId,
            startTime: Date.now(),
            duration: baseDuration / speedMult
        });
        this.game.renderMiningUI();
        return true;
    }

    stopMining(resourceId) {
        const idx = this.activeMiners.findIndex(m => m.resourceId === resourceId);
        if (idx !== -1) {
            this.activeMiners.splice(idx, 1);
            this.game.renderMiningUI();
        }
    }

    update() {
        const now = Date.now();
        const completed = [];

        for (const miner of this.activeMiners) {
            if (now - miner.startTime >= miner.duration) {
                completed.push(miner);
            }
        }

        for (const miner of completed) {
            const resource = MINING_RESOURCES.find(r => r.id === miner.resourceId);
            const relicBonus = 1 + (this.game.relicMults?.mining || 0);
            const amount = Math.max(1, Math.floor(1 * relicBonus));

            this.game.miningResources[miner.resourceId] =
                (this.game.miningResources[miner.resourceId] || 0) + amount;

            const idx = this.activeMiners.indexOf(miner);
            if (idx !== -1) {
                this.activeMiners[idx].startTime = now;
            }
        }

        if (completed.length > 0) {
            this.game.renderMiningUI();
            this.game.save();
        }
    }

    getProgress(resourceId) {
        const miner = this.activeMiners.find(m => m.resourceId === resourceId);
        if (!miner) return 0;
        const elapsed = Date.now() - miner.startTime;
        return Math.min(1, elapsed / miner.duration);
    }

    isMining(resourceId) {
        return this.activeMiners.some(m => m.resourceId === resourceId);
    }

    getSaveData() {
        return this.activeMiners.map(m => ({
            resourceId: m.resourceId,
            elapsed: Date.now() - m.startTime,
            duration: m.duration
        }));
    }

    loadSaveData(data) {
        if (!data) return;
        const now = Date.now();
        this.activeMiners = data.map(m => ({
            resourceId: m.resourceId,
            startTime: now - (m.elapsed || 0),
            duration: m.duration
        }));
    }
}

class ForgeManager {
    constructor(game) {
        this.game = game;
    }

    canAfford(recipe) {
        for (const [resource, amount] of Object.entries(recipe.cost)) {
            if ((this.game.miningResources[resource] || 0) < amount) return false;
        }
        return true;
    }

    execute(recipeId, relicId = null) {
        const recipe = FORGE_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return { success: false, reason: 'not_found' };
        if (!this.canAfford(recipe)) return { success: false, reason: 'cost' };

        for (const [resource, amount] of Object.entries(recipe.cost)) {
            this.game.miningResources[resource] -= amount;
        }

        const bonusRate = this.game.researchEffects.forgeSuccess || 0;
        const finalRate = Math.min(1, recipe.successRate + bonusRate);

        if (Math.random() < finalRate) {
            return this.applyRecipe(recipe, relicId);
        } else {
            this.game.save();
            return { success: false, reason: 'failed' };
        }
    }

    applyRecipe(recipe, relicId) {
        let result;
        switch (recipe.type) {
            case 'upgrade':
                result = this.upgradeRelic(relicId);
                break;
            case 'reroll':
                result = this.rerollRelic(relicId);
                break;
            case 'fuse':
                result = this.fuseRelics();
                break;
            case 'legendary':
                result = this.forgeLegendary();
                break;
            default:
                result = { success: false, reason: 'unknown_type' };
        }
        if (result.success) {
            this.game.recalcRelicBonuses();
            this.game.updateStats();
            this.game.renderRelicGrid();
            this.game.save();
        }
        return result;
    }

    upgradeRelic(relicId) {
        const relicIdx = this.game.relics.indexOf(relicId);
        if (relicIdx === -1) return { success: false, reason: 'not_found' };

        const relic = RELIC_DB.find(r => r.id === relicId);
        if (!relic) return { success: false, reason: 'not_found' };
        if (relic.tier >= 4) return { success: false, reason: 'max_tier' };

        const higherTierRelics = RELIC_DB.filter(r => r.tier === relic.tier + 1);
        if (higherTierRelics.length === 0) return { success: false, reason: 'no_upgrade' };

        const upgraded = higherTierRelics[Math.floor(Math.random() * higherTierRelics.length)];
        this.game.relics[relicIdx] = upgraded.id;
        return { success: true, result: upgraded };
    }

    rerollRelic(relicId) {
        const relicIdx = this.game.relics.indexOf(relicId);
        if (relicIdx === -1) return { success: false, reason: 'not_found' };

        const oldRelic = RELIC_DB.find(r => r.id === relicId);
        if (!oldRelic) return { success: false, reason: 'not_found' };

        const sameTier = RELIC_DB.filter(r => r.tier === oldRelic.tier && r.id !== oldRelic.id);
        if (sameTier.length === 0) return { success: false, reason: 'no_options' };

        const newRelic = sameTier[Math.floor(Math.random() * sameTier.length)];
        this.game.relics[relicIdx] = newRelic.id;
        return { success: true, result: newRelic };
    }

    fuseRelics() {
        if (this.game.relics.length < 2) return { success: false, reason: 'not_enough_relics' };

        const relicObjects = this.game.relics.map(id => RELIC_DB.find(r => r.id === id)).filter(Boolean);
        const maxTier = Math.max(...relicObjects.map(r => r.tier));
        const targetTier = Math.min(4, maxTier + 1);

        const higherTier = RELIC_DB.filter(r => r.tier === targetTier);
        if (higherTier.length === 0) return { success: false, reason: 'no_higher_tier' };

        this.game.relics.splice(0, 2);
        const result = higherTier[Math.floor(Math.random() * higherTier.length)];
        this.game.relics.push(result.id);
        return { success: true, result };
    }

    forgeLegendary() {
        const legendaries = RELIC_DB.filter(r => r.tier === 4);
        if (legendaries.length === 0) return { success: false, reason: 'no_legendaries' };

        const result = legendaries[Math.floor(Math.random() * legendaries.length)];
        this.game.relics.push(result.id);
        return { success: true, result };
    }
}

class ResearchManager {
    constructor(game) {
        this.game = game;
        this.purchased = {};
    }

    canPurchase(node) {
        if (this.purchased[node.id]) return false;
        if (this.game.crystals < node.cost) return false;

        if (node.requires) {
            for (const reqId of node.requires) {
                if (!this.purchased[reqId]) return false;
            }
        }
        return true;
    }

    purchase(nodeId) {
        const node = this.findNode(nodeId);
        if (!node) return { success: false, reason: 'not_found' };
        if (!this.canPurchase(node)) return { success: false, reason: 'cannot_purchase' };

        this.game.crystals -= node.cost;
        this.purchased[nodeId] = true;

        this.applyEffects();
        this.game.updateCrystalsUI();
        this.game.updateStats();
        this.game.save();

        return { success: true };
    }

    findNode(nodeId) {
        for (const branch of RESEARCH_TREE) {
            const node = branch.nodes.find(n => n.id === nodeId);
            if (node) return node;
        }
        return null;
    }

    applyEffects() {
        this.game.researchEffects = {};
        for (const [nodeId, owned] of Object.entries(this.purchased)) {
            if (!owned) continue;
            const node = this.findNode(nodeId);
            if (node?.effect) {
                for (const [key, value] of Object.entries(node.effect)) {
                    this.game.researchEffects[key] = (this.game.researchEffects[key] || 0) + value;
                }
            }
        }
    }

    getSaveData() {
        return this.purchased;
    }

    loadSaveData(data) {
        this.purchased = data || {};
        this.applyEffects();
    }
}

class ProductionManager {
    constructor(game) {
        this.game = game;
        this.buildings = {};
        PRODUCTION_BUILDINGS.forEach(b => {
            this.buildings[b.id] = { level: 0, accumulated: 0 };
        });
        this.lastUpdate = Date.now();
    }

    getBuildingCost(buildingId) {
        const building = PRODUCTION_BUILDINGS.find(b => b.id === buildingId);
        const level = this.buildings[buildingId]?.level || 0;
        return Math.floor(building.baseCost * Math.pow(building.costMult, level));
    }

    canAfford(buildingId) {
        const cost = this.getBuildingCost(buildingId);
        return this.game.gold >= cost;
    }

    upgrade(buildingId) {
        const building = PRODUCTION_BUILDINGS.find(b => b.id === buildingId);
        if (!building) return false;
        const data = this.buildings[buildingId];
        if (data.level >= building.maxLevel) return false;

        const cost = this.getBuildingCost(buildingId);
        if (this.game.gold < cost) return false;

        this.game.gold -= cost;
        data.level++;
        this.game.save();
        return true;
    }

    getProductionRate(buildingId) {
        const building = PRODUCTION_BUILDINGS.find(b => b.id === buildingId);
        const level = this.buildings[buildingId]?.level || 0;
        if (level === 0) return 0;

        const prestigeMult = this.game.prestige?.getEffectValue('prestige_production') || 1;
        return building.baseRate * level * prestigeMult;
    }

    update() {
        const now = Date.now();
        const elapsed = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;

        PRODUCTION_BUILDINGS.forEach(building => {
            const rate = this.getProductionRate(building.id);
            if (rate <= 0) return;

            const data = this.buildings[building.id];
            data.accumulated += rate * elapsed;

            const whole = Math.floor(data.accumulated);
            if (whole > 0) {
                data.accumulated -= whole;
                switch (building.resource) {
                    case 'gold':
                        this.game.gold += whole;
                        break;
                    case 'crystal':
                        this.game.miningResources.crystal = (this.game.miningResources.crystal || 0) + whole;
                        break;
                    case 'ether':
                        this.game.ether += whole;
                        break;
                    case 'void_shard':
                        this.game.miningResources.void_shard = (this.game.miningResources.void_shard || 0) + whole;
                        break;
                }
            }
        });
    }

    getSaveData() {
        return this.buildings;
    }

    loadSaveData(data) {
        if (!data) return;
        for (const [id, buildingData] of Object.entries(data)) {
            if (this.buildings[id]) {
                this.buildings[id] = buildingData;
            }
        }
    }
}

class AuraManager {
    constructor(game) {
        this.game = game;
        this.placedAuras = [];
        this.maxAuras = 5;
    }

    getAvailableAuras() {
        return AURA_TYPES.filter(a => this.game.crystals >= a.cost);
    }

    placeAura(auraId, x, y) {
        if (this.placedAuras.length >= this.maxAuras) return false;
        const auraType = AURA_TYPES.find(a => a.id === auraId);
        if (!auraType) return false;
        if (this.game.crystals < auraType.cost) return false;

        this.game.crystals -= auraType.cost;
        this.placedAuras.push({
            id: auraId,
            x: x,
            y: y,
            type: auraType
        });
        this.game.updateCrystalsUI();
        this.game.save();
        return true;
    }

    removeAura(index) {
        if (index >= 0 && index < this.placedAuras.length) {
            this.placedAuras.splice(index, 1);
            this.game.save();
        }
    }

    getAuraBuffsForTurret(turretX, turretY) {
        const buffs = { damage: 0, fireRate: 0, range: 0, crit: 0, regen: 0 };
        for (const aura of this.placedAuras) {
            const dist = MathUtils.dist(turretX, turretY, aura.x, aura.y);
            if (dist <= aura.type.range) {
                buffs[aura.type.effect] += aura.type.baseValue;
            }
        }
        return buffs;
    }

    getSaveData() {
        return this.placedAuras.map(a => ({ id: a.id, x: a.x, y: a.y }));
    }

    loadSaveData(data) {
        if (!data) return;
        this.placedAuras = data.map(a => {
            const auraType = AURA_TYPES.find(t => t.id === a.id);
            return { ...a, type: auraType };
        }).filter(a => a.type);
    }
}

class ChipManager {
    constructor(game) {
        this.game = game;
        this.inventory = [];
        this.turretChips = {};
        this.maxChipsPerTurret = 3;
    }

    generateRandomChip() {
        const rarityRoll = Math.random();
        let maxRarity = 1;
        if (rarityRoll > 0.95) maxRarity = 4;
        else if (rarityRoll > 0.85) maxRarity = 3;
        else if (rarityRoll > 0.6) maxRarity = 2;

        const available = CHIP_TYPES.filter(c => c.rarity <= maxRarity);
        const chip = available[Math.floor(Math.random() * available.length)];
        return { ...chip, uid: Date.now() + Math.random() };
    }

    addChip(chip) {
        this.inventory.push(chip);
        this.game.save();
    }

    removeChip(uid) {
        const idx = this.inventory.findIndex(c => c.uid === uid);
        if (idx !== -1) {
            this.inventory.splice(idx, 1);
            this.game.save();
        }
    }

    equipChip(turretId, chipUid) {
        if (!this.turretChips[turretId]) {
            this.turretChips[turretId] = [];
        }
        if (this.turretChips[turretId].length >= this.maxChipsPerTurret) return false;

        const chipIdx = this.inventory.findIndex(c => c.uid === chipUid);
        if (chipIdx === -1) return false;

        const chip = this.inventory.splice(chipIdx, 1)[0];
        this.turretChips[turretId].push(chip);
        this.game.save();
        return true;
    }

    unequipChip(turretId, chipUid) {
        if (!this.turretChips[turretId]) return false;
        const idx = this.turretChips[turretId].findIndex(c => c.uid === chipUid);
        if (idx === -1) return false;

        const chip = this.turretChips[turretId].splice(idx, 1)[0];
        this.inventory.push(chip);
        this.game.save();
        return true;
    }

    getTurretChipEffects(turretId) {
        const effects = { damage: 0, fireRate: 0, range: 0, critChance: 0, critDamage: 0, pierce: 0, splash: 0, leech: 0 };
        const chips = this.turretChips[turretId] || [];
        for (const chip of chips) {
            for (const [key, value] of Object.entries(chip.effect)) {
                effects[key] = (effects[key] || 0) + value;
            }
        }
        return effects;
    }

    getSaveData() {
        return {
            inventory: this.inventory,
            turretChips: this.turretChips
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.inventory = data.inventory || [];
        this.turretChips = data.turretChips || {};
    }
}

class DailyQuestManager {
    constructor(game) {
        this.game = game;
        this.quests = [];
        this.lastRefresh = null;
        this.progress = {};
    }

    generateQuests() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (this.lastRefresh === today) return;
        this.lastRefresh = today;
        this.quests = [];
        this.progress = {};

        const shuffled = [...DAILY_QUEST_TYPES].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);

        for (const quest of selected) {
            const difficultyMult = 1 + (this.game.stats?.maxWave || 0) * 0.05;
            const target = Math.floor(quest.targetBase * quest.targetMult * difficultyMult);
            const reward = Math.floor(quest.rewardBase * difficultyMult);

            this.quests.push({
                ...quest,
                target,
                reward,
                completed: false
            });
            this.progress[quest.id] = 0;
        }
        this.game.save();
    }

    updateProgress(questType, amount = 1) {
        const quest = this.quests.find(q => q.id === questType && !q.completed);
        if (!quest) return;

        this.progress[questType] = (this.progress[questType] || 0) + amount;

        if (this.progress[questType] >= quest.target) {
            this.completeQuest(quest);
        }
    }

    completeQuest(quest) {
        quest.completed = true;

        switch (quest.rewardType) {
            case 'gold':
                this.game.gold += quest.reward;
                break;
            case 'crystals':
                this.game.crystals += quest.reward;
                this.game.updateCrystalsUI();
                break;
            case 'ether':
                this.game.ether += quest.reward;
                this.game.updateEtherUI();
                break;
        }

        this.game.floatingTexts.push(new FloatingText(
            this.game.width / 2,
            this.game.height / 2,
            `${t('quests.completed')} +${quest.reward}`,
            '#22c55e',
            28
        ));
        this.game.sound.play('levelup');
        this.game.save();
    }

    getTimeUntilReset() {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return tomorrow.getTime() - now.getTime();
    }

    getSaveData() {
        return {
            quests: this.quests,
            lastRefresh: this.lastRefresh,
            progress: this.progress
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.quests = data.quests || [];
        this.lastRefresh = data.lastRefresh;
        this.progress = data.progress || {};
    }
}

class PrestigeManager {
    constructor(game) {
        this.game = game;
        this.prestigePoints = 0;
        this.totalPrestiges = 0;
        this.upgrades = {};
        this.autoPrestige = false;
        this.autoPrestigeWave = 30;
        PRESTIGE_UPGRADES.forEach(u => {
            this.upgrades[u.id] = 0;
        });
    }

    calculatePrestigePoints() {
        const baseWave = this.game.stats?.maxWave || 0;
        const dreadMult = 1 + (this.game.dreadLevel * 0.5);
        const prestigeCountBonus = 1 + (this.totalPrestiges * 0.05);
        return Math.floor(Math.pow(baseWave / 10, 1.5) * dreadMult * prestigeCountBonus);
    }

    canPrestige() {
        return (this.game.stats?.maxWave || this.game.wave) >= 25;
    }

    getWaveSkipAmount() {
        if (this.totalPrestiges < 3) return 0;
        let baseSkip = Math.min(50, Math.floor(this.totalPrestiges * 2));
        const awakeningBonus = this.game.awakening?.getWaveSkipBonus() || 0;
        return baseSkip + awakeningBonus;
    }

    checkAutoPrestige() {
        if (!this.autoPrestige || !this.canPrestige()) return;
        if (this.game.wave >= this.autoPrestigeWave && this.game.isGameOver) {
            this.doPrestige();
        }
    }

    doPrestige() {
        if (!this.canPrestige()) return false;

        const points = this.calculatePrestigePoints();
        this.prestigePoints += points;
        this.totalPrestiges++;

        this.game.gold = 0;
        this.game.wave = 1;
        this.game.castle.tier = 1;
        this.game.castle.hp = this.game.castle.maxHp;
        this.game.enemies = [];
        this.game.projectiles = [];
        this.game.relics = [];
        this.game.isGameOver = false;

        this.game.upgrades.upgrades.forEach(u => {
            const resetIds = ['regen', 'multishot', 'turret', 'crit', 'ice', 'poison', 'bounce', 'blast', 'leech', 'shield', 'stasis', 'orbital', 'artillery', 'rocket', 'tesla', 'armor'];
            u.level = resetIds.includes(u.id) ? 0 : 1;
        });

        // Wave Skip based on total prestiges (unlocks after 3 prestiges)
        const waveSkip = this.getWaveSkipAmount();
        const startWaveBonus = this.getEffectValue('prestige_start_wave');
        const finalStartWave = Math.max(waveSkip, startWaveBonus);
        if (finalStartWave > 0) {
            this.game.wave = finalStartWave + 1;
        }

        // Auto-Turrets from prestige upgrade
        const autoTurrets = this.getEffectValue('prestige_auto_turrets');
        if (autoTurrets > 0) {
            const turretUpg = this.game.upgrades.upgrades.find(u => u.id === 'turret');
            if (turretUpg) turretUpg.level = autoTurrets;
        }

        // Auto-buy starting upgrades based on prestige count (new feature)
        const autoBuyLevels = Math.min(10, Math.floor(this.totalPrestiges / 2));
        if (autoBuyLevels > 0) {
            const dmgUpg = this.game.upgrades.upgrades.find(u => u.id === 'damage');
            const spdUpg = this.game.upgrades.upgrades.find(u => u.id === 'speed');
            const hpUpg = this.game.upgrades.upgrades.find(u => u.id === 'health');
            if (dmgUpg) dmgUpg.level = Math.max(dmgUpg.level, autoBuyLevels);
            if (spdUpg) spdUpg.level = Math.max(spdUpg.level, Math.floor(autoBuyLevels / 2));
            if (hpUpg) hpUpg.level = Math.max(hpUpg.level, Math.floor(autoBuyLevels / 2));
        }

        this.game.gold = this.game.metaUpgrades.getEffectValue('startGold');
        this.game.recalcRelicBonuses();
        this.game.updateStats();
        this.game.save();

        this.game.floatingTexts.push(new FloatingText(
            this.game.width / 2,
            this.game.height / 2,
            `${t('prestige.complete')} +${points} PP`,
            '#fbbf24',
            36
        ));

        // Restart game if was game over
        if (document.getElementById('game-over-screen') && !document.getElementById('game-over-screen').classList.contains('hidden')) {
            this.game.restart();
        }

        return true;
    }

    getUpgradeCost(upgradeId) {
        const upgrade = PRESTIGE_UPGRADES.find(u => u.id === upgradeId);
        const level = this.upgrades[upgradeId] || 0;
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, level));
    }

    canAffordUpgrade(upgradeId) {
        return this.prestigePoints >= this.getUpgradeCost(upgradeId);
    }

    buyUpgrade(upgradeId) {
        const upgrade = PRESTIGE_UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return false;
        const level = this.upgrades[upgradeId] || 0;
        if (level >= upgrade.maxLevel) return false;

        const cost = this.getUpgradeCost(upgradeId);
        if (this.prestigePoints < cost) return false;

        this.prestigePoints -= cost;
        this.upgrades[upgradeId]++;
        this.game.save();
        return true;
    }

    getEffectValue(upgradeId) {
        const upgrade = PRESTIGE_UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return 0;
        const level = this.upgrades[upgradeId] || 0;
        return upgrade.effect(level);
    }

    getSaveData() {
        return {
            prestigePoints: this.prestigePoints,
            totalPrestiges: this.totalPrestiges,
            upgrades: this.upgrades,
            autoPrestige: this.autoPrestige,
            autoPrestigeWave: this.autoPrestigeWave
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.prestigePoints = data.prestigePoints || 0;
        this.totalPrestiges = data.totalPrestiges || 0;
        this.upgrades = data.upgrades || {};
        this.autoPrestige = data.autoPrestige || false;
        this.autoPrestigeWave = data.autoPrestigeWave || 30;
    }
}

class TownManager {
    constructor(game) {
        this.game = game;
        this.level = 1;
        this.xp = 0;
        this.unlockedFeatures = ['basic'];
    }

    getCurrentLevel() {
        return TOWN_LEVELS.find(t => t.level === this.level) || TOWN_LEVELS[0];
    }

    getNextLevel() {
        return TOWN_LEVELS.find(t => t.level === this.level + 1);
    }

    addXP(amount) {
        this.xp += amount;
        this.checkLevelUp();
    }

    checkLevelUp() {
        const next = this.getNextLevel();
        if (next && this.xp >= next.xpRequired) {
            this.level++;
            next.unlocks.forEach(u => {
                if (!this.unlockedFeatures.includes(u)) {
                    this.unlockedFeatures.push(u);
                }
            });
            this.game.floatingTexts.push(new FloatingText(
                this.game.width / 2,
                this.game.height / 2,
                `${t('town.levelUp')} ${this.level}!`,
                '#fbbf24',
                36
            ));
            this.game.sound.play('levelup');
            this.checkLevelUp();
        }
    }

    hasUnlock(feature) {
        return this.unlockedFeatures.includes(feature);
    }

    getXPProgress() {
        const next = this.getNextLevel();
        if (!next) return 100;
        const current = this.getCurrentLevel();
        const needed = next.xpRequired - current.xpRequired;
        const progress = this.xp - current.xpRequired;
        return Math.min(100, (progress / needed) * 100);
    }

    getSaveData() {
        return {
            level: this.level,
            xp: this.xp,
            unlockedFeatures: this.unlockedFeatures
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.level = data.level || 1;
        this.xp = data.xp || 0;
        this.unlockedFeatures = data.unlockedFeatures || ['basic'];
    }
}

class SchoolManager {
    constructor(game) {
        this.game = game;
        this.turrets = {};
        SCHOOL_TURRETS.forEach(t => {
            this.turrets[t.id] = { unlocked: t.unlockCost === 0, level: t.unlockCost === 0 ? 1 : 0 };
        });
    }

    isUnlocked(turretId) {
        return this.turrets[turretId]?.unlocked || false;
    }

    getLevel(turretId) {
        return this.turrets[turretId]?.level || 0;
    }

    getUnlockCost(turretId) {
        const turret = SCHOOL_TURRETS.find(t => t.id === turretId);
        return turret?.unlockCost || 0;
    }

    getLevelUpCost(turretId) {
        const turret = SCHOOL_TURRETS.find(t => t.id === turretId);
        const level = this.getLevel(turretId);
        return Math.floor(turret.levelCost * Math.pow(1.5, level));
    }

    unlock(turretId) {
        const cost = this.getUnlockCost(turretId);
        if (this.game.crystals < cost) return false;
        if (this.isUnlocked(turretId)) return false;

        this.game.crystals -= cost;
        this.turrets[turretId] = { unlocked: true, level: 1 };
        this.game.updateCrystalsUI();
        this.game.save();
        return true;
    }

    levelUp(turretId) {
        if (!this.isUnlocked(turretId)) return false;
        const turret = SCHOOL_TURRETS.find(t => t.id === turretId);
        const level = this.getLevel(turretId);
        if (level >= turret.maxLevel) return false;

        const cost = this.getLevelUpCost(turretId);
        if (this.game.crystals < cost) return false;

        this.game.crystals -= cost;
        this.turrets[turretId].level++;
        this.game.updateCrystalsUI();
        this.game.save();
        return true;
    }

    getTurretStats(turretId) {
        const turret = SCHOOL_TURRETS.find(t => t.id === turretId);
        const level = this.getLevel(turretId);
        if (!turret || level === 0) return null;

        return {
            damage: turret.stats.damage * (1 + level * 0.1),
            speed: turret.stats.speed * (1 + level * 0.05),
            range: turret.stats.range * (1 + level * 0.05),
            aoe: turret.stats.aoe ? turret.stats.aoe * (1 + level * 0.1) : 0,
            slow: turret.stats.slow || 0,
            dot: turret.stats.dot || false
        };
    }

    getSaveData() {
        return { turrets: this.turrets };
    }

    loadSaveData(data) {
        if (!data) return;
        this.turrets = data.turrets || {};
        SCHOOL_TURRETS.forEach(t => {
            if (!this.turrets[t.id]) {
                this.turrets[t.id] = { unlocked: t.unlockCost === 0, level: t.unlockCost === 0 ? 1 : 0 };
            }
        });
    }
}

class OfficeManager {
    constructor(game) {
        this.game = game;
        this.gems = 0;
        this.activeBoosts = {};
    }

    canAfford(boostId) {
        const boost = OFFICE_BOOSTS.find(b => b.id === boostId);
        return boost && this.gems >= boost.baseCost;
    }

    activateBoost(boostId) {
        const boost = OFFICE_BOOSTS.find(b => b.id === boostId);
        if (!boost || this.gems < boost.baseCost) return false;

        this.gems -= boost.baseCost;
        this.activeBoosts[boostId] = {
            remaining: boost.duration,
            mult: boost.mult,
            effect: boost.effect
        };
        this.game.save();
        return true;
    }

    update(dt) {
        Object.keys(this.activeBoosts).forEach(id => {
            this.activeBoosts[id].remaining -= dt / 1000;
            if (this.activeBoosts[id].remaining <= 0) {
                delete this.activeBoosts[id];
            }
        });
    }

    getBoostMult(effectType) {
        let mult = 1;
        Object.values(this.activeBoosts).forEach(boost => {
            if (boost.effect === effectType) {
                mult *= boost.mult;
            }
        });
        return mult;
    }

    hasActiveBoost(boostId) {
        return !!this.activeBoosts[boostId];
    }

    getActiveBoosts() {
        return Object.entries(this.activeBoosts).map(([id, data]) => ({
            id,
            ...data,
            boost: OFFICE_BOOSTS.find(b => b.id === id)
        }));
    }

    addGems(amount) {
        this.gems += amount;
    }

    getSaveData() {
        return {
            gems: this.gems,
            activeBoosts: this.activeBoosts
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.gems = data.gems || 0;
        this.activeBoosts = data.activeBoosts || {};
    }
}

class AwakeningManager {
    constructor(game) {
        this.game = game;
        this.isAwakened = false;
        this.awakeningLevel = 0;
        this.unlockedBonuses = [];
    }

    canAwaken() {
        return this.game.dreadLevel >= 6 && !this.isAwakened;
    }

    awaken() {
        if (!this.canAwaken()) return false;

        this.isAwakened = true;
        this.awakeningLevel = 1;
        AWAKENING_BONUSES.forEach(b => {
            this.unlockedBonuses.push(b.id);
        });

        this.game.floatingTexts.push(new FloatingText(
            this.game.width / 2,
            this.game.height / 2,
            t('awakening.unlocked'),
            '#fbbf24',
            48
        ));
        this.game.sound.play('levelup');
        this.game.save();
        return true;
    }

    getBonus(bonusId) {
        if (!this.isAwakened) return null;
        const bonus = AWAKENING_BONUSES.find(b => b.id === bonusId);
        if (!bonus || !this.unlockedBonuses.includes(bonusId)) return null;
        return bonus.effect;
    }

    getWaveSkipBonus() {
        if (!this.isAwakened) return 0;
        const bonus = this.getBonus('wave_skip_100');
        return bonus?.waveSkip || 0;
    }

    getPrestigeMult() {
        if (!this.isAwakened) return 1;
        const bonus = this.getBonus('prestige_x2');
        return bonus?.prestigeMult || 1;
    }

    getProductionMult() {
        if (!this.isAwakened) return 1;
        const bonus = this.getBonus('production_x3');
        return bonus?.productionMult || 1;
    }

    getStartingGold() {
        if (!this.isAwakened) return 0;
        const bonus = this.getBonus('starting_gold');
        return bonus?.startGold || 0;
    }

    getSaveData() {
        return {
            isAwakened: this.isAwakened,
            awakeningLevel: this.awakeningLevel,
            unlockedBonuses: this.unlockedBonuses
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.isAwakened = data.isAwakened || false;
        this.awakeningLevel = data.awakeningLevel || 0;
        this.unlockedBonuses = data.unlockedBonuses || [];
    }
}

class TurretSlotManager {
    constructor(game) {
        this.game = game;
        this.slots = TURRET_SLOTS.map(slot => ({
            ...slot,
            purchased: slot.free,
            turretId: null,
            lastFireTime: 0
        }));
        this.selectedSlot = null;
    }

    getSlotPosition(slotId) {
        const slot = this.slots[slotId];
        if (!slot) return null;
        const rad = (slot.angle * Math.PI) / 180;
        const castleX = this.game.castle?.x || 100;
        const castleY = this.game.height / 2;
        return {
            x: castleX + Math.cos(rad) * slot.distance,
            y: castleY + Math.sin(rad) * slot.distance
        };
    }

    canPurchaseSlot(slotId) {
        const slot = this.slots[slotId];
        if (!slot || slot.purchased) return false;
        return this.game.gold >= slot.cost;
    }

    purchaseSlot(slotId) {
        const slot = this.slots[slotId];
        if (!this.canPurchaseSlot(slotId)) return false;

        this.game.gold -= slot.cost;
        slot.purchased = true;
        this.game.save();
        return true;
    }

    canPlaceTurret(slotId, turretId) {
        const slot = this.slots[slotId];
        if (!slot || !slot.purchased) return false;
        return this.game.school.isUnlocked(turretId);
    }

    placeTurret(slotId, turretId) {
        if (!this.canPlaceTurret(slotId, turretId)) return false;

        this.slots[slotId].turretId = turretId;
        this.game.updateStats();
        this.game.save();
        return true;
    }

    removeTurret(slotId) {
        const slot = this.slots[slotId];
        if (!slot || !slot.turretId) return false;

        slot.turretId = null;
        this.game.updateStats();
        this.game.save();
        return true;
    }

    getPassiveBonuses() {
        let bonuses = { damage: 0, speed: 0, range: 0, critChance: 0 };

        this.slots.forEach(slot => {
            if (!slot.purchased || !slot.turretId) return;

            const turret = SCHOOL_TURRETS.find(t => t.id === slot.turretId);
            const level = this.game.school.getLevel(slot.turretId);
            if (!turret || level === 0) return;

            const mult = 0.05 * level;
            bonuses.damage += turret.stats.damage * mult;
            bonuses.speed += turret.stats.speed * mult * 0.5;
            bonuses.range += turret.stats.range * mult * 0.3;
        });

        return bonuses;
    }

    update(dt) {
        if (this.game.isGameOver || this.game.enemies.length === 0) return;

        this.slots.forEach(slot => {
            if (!slot.purchased || !slot.turretId) return;

            const turret = SCHOOL_TURRETS.find(t => t.id === slot.turretId);
            const stats = this.game.school.getTurretStats(slot.turretId);
            if (!turret || !stats) return;

            const pos = this.getSlotPosition(slot.id);
            if (!pos) return;

            const fireRate = 2000 / stats.speed;
            if (this.game.gameTime - slot.lastFireTime < fireRate) return;

            const range = 150 * stats.range;
            let target = null;
            let minDist = Infinity;

            this.game.enemies.forEach(e => {
                const dist = Math.hypot(e.x - pos.x, e.y - pos.y);
                if (dist < range && dist < minDist) {
                    minDist = dist;
                    target = e;
                }
            });

            if (target) {
                slot.lastFireTime = this.game.gameTime;
                const baseDamage = this.game.currentDamage * 0.3;
                const damage = Math.floor(baseDamage * stats.damage);
                const color = this.getTurretColor(slot.turretId);

                const effects = {};
                if (stats.slow > 0) effects.ice = true;
                if (stats.dot) effects.poison = true;

                const props = { blast: stats.aoe || 0 };

                this.game.projectiles.push(new Projectile(
                    pos.x, pos.y, target, damage, 8, color,
                    1, false, false, false, effects, props
                ));

                this.game.sound.play('shoot');
            }
        });
    }

    getTurretColor(turretId) {
        const colors = {
            sentry: '#60a5fa',
            blaster: '#f97316',
            laser: '#ef4444',
            solidifier: '#38bdf8',
            swamper: '#22c55e',
            rocket: '#fbbf24',
            sniper: '#a855f7',
            inferno: '#f43f5e'
        };
        return colors[turretId] || '#fff';
    }

    draw(ctx) {
        this.slots.forEach(slot => {
            const pos = this.getSlotPosition(slot.id);
            if (!pos) return;

            ctx.save();
            ctx.translate(pos.x, pos.y);

            const nearestEnemy = this.findNearestEnemy(pos);
            const aimAngle = nearestEnemy ? Math.atan2(nearestEnemy.y - pos.y, nearestEnemy.x - pos.x) : 0;

            if (!slot.purchased) {
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = '#475569';
                ctx.font = 'bold 9px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${formatNumber(slot.cost)}g`, 0, 4);
            } else if (!slot.turretId) {
                ctx.strokeStyle = '#22d3ee';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
                ctx.stroke();

                ctx.fillStyle = '#22d3ee';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('+', 0, 5);
            } else {
                this.drawTurretSkin(ctx, slot.turretId, aimAngle);

                if (this.game.settings.showRange) {
                    const stats = this.game.school.getTurretStats(slot.turretId);
                    const color = this.getTurretColor(slot.turretId);
                    if (stats) {
                        ctx.strokeStyle = `${color}30`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.arc(0, 0, 150 * stats.range, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            }

            ctx.restore();
        });
    }

    findNearestEnemy(pos) {
        let nearest = null;
        let minDist = Infinity;
        this.game.enemies.forEach(e => {
            const dist = Math.hypot(e.x - pos.x, e.y - pos.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = e;
            }
        });
        return nearest;
    }

    drawTurretSkin(ctx, turretId, aimAngle) {
        const color = this.getTurretColor(turretId);

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.rotate(aimAngle);

        switch (turretId) {
            case 'sentry':
                ctx.fillStyle = color;
                ctx.fillRect(-4, -4, 8, 8);
                ctx.fillStyle = '#fff';
                ctx.fillRect(4, -2, 12, 4);
                break;

            case 'blaster':
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(-6, -8);
                ctx.lineTo(6, 0);
                ctx.lineTo(-6, 8);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.fillRect(4, -3, 14, 6);
                ctx.fillRect(14, -5, 4, 10);
                break;

            case 'laser':
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(20, 0);
                ctx.stroke();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'solidifier':
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                for (let i = 0; i < 6; i++) {
                    ctx.save();
                    ctx.rotate(i * Math.PI / 3);
                    ctx.fillRect(6, -2, 8, 4);
                    ctx.restore();
                }
                break;

            case 'swamper':
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 9, -0.5, 0.5);
                ctx.stroke();
                break;

            case 'rocket':
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(-8, -10, 16, 20);
                ctx.fillStyle = color;
                ctx.fillRect(-6, -8, 12, 16);
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(6, -6);
                ctx.lineTo(16, 0);
                ctx.lineTo(6, 6);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'sniper':
                ctx.fillStyle = color;
                ctx.fillRect(-6, -6, 12, 12);
                ctx.fillStyle = '#fff';
                ctx.fillRect(4, -2, 22, 4);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(20, -6);
                ctx.lineTo(20, 6);
                ctx.moveTo(17, -4);
                ctx.lineTo(23, -4);
                ctx.moveTo(17, 4);
                ctx.lineTo(23, 4);
                ctx.stroke();
                break;

            case 'inferno':
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.moveTo(8, 0);
                ctx.quadraticCurveTo(14, -6, 18, 0);
                ctx.quadraticCurveTo(14, 6, 8, 0);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();
                break;

            default:
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.fill();
        }
    }

    getSaveData() {
        return this.slots.map(s => ({
            id: s.id,
            purchased: s.purchased,
            turretId: s.turretId
        }));
    }

    loadSaveData(data) {
        if (!data) return;
        data.forEach(saved => {
            const slot = this.slots.find(s => s.id === saved.id);
            if (slot) {
                slot.purchased = saved.purchased;
                slot.turretId = saved.turretId;
            }
        });
    }
}

class WeatherManager {
    constructor(game) {
        this.game = game;
        this.currentWeather = WEATHER_TYPES[0];
        this.timeRemaining = 0;
        this.particles = [];
    }

    update(dt) {
        this.timeRemaining -= dt / 1000;
        if (this.timeRemaining <= 0) {
            this.changeWeather();
        }
        this.updateParticles(dt);
    }

    changeWeather() {
        const totalWeight = WEATHER_TYPES.reduce((sum, w) => sum + w.weight, 0);
        let random = Math.random() * totalWeight;
        for (const weather of WEATHER_TYPES) {
            random -= weather.weight;
            if (random <= 0) {
                this.currentWeather = weather;
                this.timeRemaining = weather.duration;
                break;
            }
        }
    }

    getEffects() {
        return this.currentWeather.effects || {};
    }

    updateParticles(dt) {
        const id = this.currentWeather.id;
        if (id === 'rain' || id === 'storm') {
            if (Math.random() < 0.3) {
                this.particles.push({
                    x: Math.random() * this.game.width,
                    y: -10,
                    vy: 400 + Math.random() * 200,
                    life: 2
                });
            }
        }
        this.particles = this.particles.filter(p => {
            p.y += p.vy * dt / 1000;
            p.life -= dt / 1000;
            return p.life > 0 && p.y < this.game.height;
        });
    }

    draw(ctx) {
        const id = this.currentWeather.id;
        if (id === 'rain' || id === 'storm') {
            ctx.strokeStyle = id === 'storm' ? '#6366f1' : '#3b82f6';
            ctx.lineWidth = 1;
            this.particles.forEach(p => {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - 2, p.y + 15);
                ctx.stroke();
            });
        }
        if (id === 'fog') {
            ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
        }
        if (id === 'blood_moon') {
            ctx.fillStyle = 'rgba(220, 38, 38, 0.15)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
        }
        // Weather HUD
        ctx.fillStyle = this.currentWeather.color;
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${this.currentWeather.icon} ${t(this.currentWeather.nameKey)}`, 10, this.game.height - 10);
    }

    getSaveData() {
        return { weatherId: this.currentWeather.id, timeRemaining: this.timeRemaining };
    }

    loadSaveData(data) {
        if (!data) return;
        const weather = WEATHER_TYPES.find(w => w.id === data.weatherId);
        if (weather) {
            this.currentWeather = weather;
            this.timeRemaining = data.timeRemaining || weather.duration;
        }
    }
}

class ComboManager {
    constructor(game) {
        this.game = game;
        this.hits = 0;
        this.timer = 0;
        this.maxCombo = 0;
        this.currentTier = null;
    }

    addHit() {
        this.hits++;
        this.timer = 2;
        if (this.hits > this.maxCombo) this.maxCombo = this.hits;
        this.updateTier();
    }

    updateTier() {
        this.currentTier = null;
        for (let i = COMBO_TIERS.length - 1; i >= 0; i--) {
            if (this.hits >= COMBO_TIERS[i].hits) {
                this.currentTier = COMBO_TIERS[i];
                break;
            }
        }
    }

    update(dt) {
        if (this.timer > 0) {
            this.timer -= dt / 1000;
            if (this.timer <= 0) {
                this.hits = 0;
                this.currentTier = null;
            }
        }
    }

    getMultiplier() {
        return this.currentTier ? this.currentTier.mult : 1;
    }

    draw(ctx) {
        if (!this.currentTier || this.hits < 5) return;
        const centerX = this.game.width / 2;
        ctx.save();
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.currentTier.color;
        ctx.shadowColor = this.currentTier.color;
        ctx.shadowBlur = 10;
        ctx.fillText(`${this.hits} ${t(this.currentTier.nameKey)}`, centerX, 80);
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText(`x${this.currentTier.mult.toFixed(1)}`, centerX, 100);
        ctx.restore();
    }

    getSaveData() {
        return { maxCombo: this.maxCombo };
    }

    loadSaveData(data) {
        if (data) this.maxCombo = data.maxCombo || 0;
    }
}

class EventManager {
    constructor(game) {
        this.game = game;
        this.activeEvent = null;
        this.eventTimer = 0;
        this.nextEventIn = 60 + Math.random() * 60;
    }

    update(dt) {
        const seconds = dt / 1000;
        if (this.activeEvent) {
            this.eventTimer -= seconds;
            if (this.eventTimer <= 0) {
                this.activeEvent = null;
            }
        } else {
            this.nextEventIn -= seconds;
            if (this.nextEventIn <= 0) {
                this.triggerRandomEvent();
                this.nextEventIn = 90 + Math.random() * 90;
            }
        }
    }

    triggerRandomEvent() {
        const totalWeight = RANDOM_EVENTS.reduce((sum, e) => sum + e.weight, 0);
        let random = Math.random() * totalWeight;
        for (const event of RANDOM_EVENTS) {
            random -= event.weight;
            if (random <= 0) {
                this.activeEvent = event;
                this.eventTimer = event.duration;
                const color = event.negative ? '#ef4444' : '#22c55e';
                this.game.floatingTexts.push(new FloatingText(
                    this.game.width / 2,
                    this.game.height / 2 - 100,
                    `${event.icon} ${t(event.nameKey)}!`,
                    color,
                    36
                ));
                break;
            }
        }
    }

    getEffects() {
        if (!this.activeEvent) return {};
        return this.activeEvent.effects || {};
    }

    draw(ctx) {
        if (!this.activeEvent) return;
        ctx.save();
        ctx.fillStyle = this.activeEvent.negative ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 197, 94, 0.8)';
        ctx.fillRect(this.game.width / 2 - 100, 10, 200, 30);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.activeEvent.icon} ${t(this.activeEvent.nameKey)} (${Math.ceil(this.eventTimer)}s)`, this.game.width / 2, 30);
        ctx.restore();
    }

    getSaveData() {
        return { nextEventIn: this.nextEventIn };
    }

    loadSaveData(data) {
        if (data) this.nextEventIn = data.nextEventIn || 60;
    }
}

class TalentManager {
    constructor(game) {
        this.game = game;
        this.points = 0;
        this.allocated = {};
    }

    getPoints() {
        return this.points;
    }

    addPoints(amount) {
        this.points += amount;
    }

    canAllocate(talentId) {
        const talent = this.findTalent(talentId);
        if (!talent) return false;
        const current = this.allocated[talentId] || 0;
        if (current >= talent.max) return false;
        if (this.points < talent.cost) return false;
        if (talent.requires) {
            for (const req of talent.requires) {
                if (!this.allocated[req] || this.allocated[req] === 0) return false;
            }
        }
        return true;
    }

    allocate(talentId) {
        if (!this.canAllocate(talentId)) return false;
        const talent = this.findTalent(talentId);
        this.allocated[talentId] = (this.allocated[talentId] || 0) + 1;
        this.points -= talent.cost;
        this.game.save();
        return true;
    }

    findTalent(talentId) {
        for (const tree of TALENT_TREES) {
            const talent = tree.talents.find(t => t.id === talentId);
            if (talent) return talent;
        }
        return null;
    }

    getLevel(talentId) {
        return this.allocated[talentId] || 0;
    }

    getTotalEffects() {
        const effects = {};
        for (const tree of TALENT_TREES) {
            for (const talent of tree.talents) {
                const level = this.getLevel(talent.id);
                if (level > 0) {
                    for (const [key, value] of Object.entries(talent.effect)) {
                        effects[key] = (effects[key] || 0) + value * level;
                    }
                }
            }
        }
        return effects;
    }

    reset() {
        let refund = 0;
        for (const tree of TALENT_TREES) {
            for (const talent of tree.talents) {
                const level = this.allocated[talent.id] || 0;
                refund += level * talent.cost;
            }
        }
        this.allocated = {};
        this.points += refund;
        this.game.save();
    }

    getSaveData() {
        return { points: this.points, allocated: this.allocated };
    }

    loadSaveData(data) {
        if (!data) return;
        this.points = data.points || 0;
        this.allocated = data.allocated || {};
    }
}

class StatisticsManager {
    constructor(game) {
        this.game = game;
        this.stats = {
            totalPlayTime: 0,
            totalKills: 0,
            totalBosses: 0,
            totalGoldEarned: 0,
            totalDamageDealt: 0,
            highestWave: 0,
            highestCombo: 0,
            totalPrestiges: 0,
            totalAscensions: 0,
            criticalHits: 0,
            projectilesFired: 0,
            skillsUsed: 0,
            runesCollected: 0,
            relicsFound: 0
        };
    }

    increment(stat, amount = 1) {
        if (this.stats[stat] !== undefined) {
            this.stats[stat] += amount;
        }
    }

    setMax(stat, value) {
        if (this.stats[stat] !== undefined && value > this.stats[stat]) {
            this.stats[stat] = value;
        }
    }

    get(stat) {
        return this.stats[stat] || 0;
    }

    update(dt) {
        this.stats.totalPlayTime += dt / 1000;
    }

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}h ${m}m ${s}s`;
    }

    getSaveData() {
        return this.stats;
    }

    loadSaveData(data) {
        if (!data) return;
        Object.assign(this.stats, data);
    }
}

class AscensionManager {
    constructor(game) {
        this.game = game;
        this.ascensionPoints = 0;
        this.totalAscensions = 0;
        this.purchasedPerks = {};
    }

    canAscend() {
        return this.game.ether >= 1000;
    }

    getAscensionGain() {
        return Math.floor(Math.sqrt(this.game.ether / 100));
    }

    doAscend() {
        if (!this.canAscend()) return false;
        const gain = this.getAscensionGain();
        this.ascensionPoints += gain;
        this.totalAscensions++;
        this.game.statistics?.increment('totalAscensions');
        // Full reset including prestige
        this.game.ether = 0;
        this.game.prestige?.fullReset();
        this.game.restart();
        this.game.save();
        return true;
    }

    canPurchasePerk(perkId) {
        const perk = ASCENSION_PERKS.find(p => p.id === perkId);
        if (!perk) return false;
        if (this.purchasedPerks[perkId]) return false;
        return this.ascensionPoints >= perk.cost;
    }

    purchasePerk(perkId) {
        if (!this.canPurchasePerk(perkId)) return false;
        const perk = ASCENSION_PERKS.find(p => p.id === perkId);
        this.ascensionPoints -= perk.cost;
        this.purchasedPerks[perkId] = true;
        this.game.save();
        return true;
    }

    hasPerk(perkId) {
        return !!this.purchasedPerks[perkId];
    }

    getTotalEffects() {
        const effects = {};
        for (const perk of ASCENSION_PERKS) {
            if (this.purchasedPerks[perk.id]) {
                for (const [key, value] of Object.entries(perk.effect)) {
                    effects[key] = (effects[key] || 0) + value;
                }
            }
        }
        return effects;
    }

    getSaveData() {
        return {
            points: this.ascensionPoints,
            total: this.totalAscensions,
            perks: this.purchasedPerks
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.ascensionPoints = data.points || 0;
        this.totalAscensions = data.total || 0;
        this.purchasedPerks = data.perks || {};
    }
}

class Game {
    constructor() {
        window.game = this;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = performance.now();
        this.gameTime = 0;
        this.speedMultiplier = 1;
        this.ether = 0;
        this.activeTab = 0;
        this.buyMode = '1';
        this.sound = new SoundManager();
        this.metaUpgrades = new MetaUpgradeManager();
        this.skills = new SkillManager();
        this.stats = new StatsManager();
        this.challenges = new ChallengeManager();
        this.tutorial = new TutorialManager();
        this.activeChallenge = null;

        this.relics = [];
        this.relicMults = { damage: 0, gold: 0, speed: 0, critChance: 0, health: 0, cooldown: 0, mining: 0, leech: 0, dreadReward: 0, critDamage: 0, revive: false, autoSkill: false };
        this.crystals = 0;
        this.miningResources = {};
        this.researchEffects = {};
        this.mining = new MiningManager(this);
        this.forge = new ForgeManager(this);
        this.research = new ResearchManager(this);
        this.production = new ProductionManager(this);
        this.auras = new AuraManager(this);
        this.chips = new ChipManager(this);
        this.dailyQuests = new DailyQuestManager(this);
        this.prestige = new PrestigeManager(this);
        this.town = new TownManager(this);
        this.school = new SchoolManager(this);
        this.office = new OfficeManager(this);
        this.awakening = new AwakeningManager(this);
        this.turretSlots = new TurretSlotManager(this);
        this.weather = new WeatherManager(this);
        this.combo = new ComboManager(this);
        this.events = new EventManager(this);
        this.talents = new TalentManager(this);
        this.statistics = new StatisticsManager(this);
        this.ascensionMgr = new AscensionManager(this);
        this.dreadLevel = 0;
        this.speedIndex = 0;
        this.selectedForgeRelic = null;
        this.autoRetryEnabled = false;
        this.autoBuyEnabled = false;
        this.retryTimeoutId = null;
        this.gold = 0;
        this.wave = 1;
        this.lastSaveTime = Date.now();
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.floatingTexts = [];
        this.turrets = [];
        this.runes = [];
        this.activeBuffs = { rage: 0, midas: 0 };
        this.castle = new Castle();
        this.upgrades = new UpgradeManager();
        this.drone = null;
        this.lastShotTime = 0;
        this.spawnTimer = 0;
        this.waveInProgress = false;
        this.enemiesToSpawn = 0;
        this.currentEffects = { ice: false, poison: false };
        this.currentProps = { bounce: 0, blast: 0, leech: 0, stasis: 0, orbital: 0 };
        this.settings = { showDamageText: true, showRange: true };
        this.isRushBonus = false;
        this.orbitalTimer = 0;
        this.isPaused = false;
        this.devClickCount = 0;

        this.dev = {
            addGold: (amt) => { this.addGold(amt); },
            addEther: (amt) => { this.ether += amt; this.updateEtherUI(); },
            skipWaves: (amt) => { this.wave += amt; this.checkEvolution(); this.save(); },
            resetCooldowns: () => { for (let k in this.skills.skills) this.skills.skills[k].cdTime = 0; }
        };

        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'q') this.activateSkill('overdrive');
            if (e.key.toLowerCase() === 'w') this.activateSkill('nuke');
            if (e.key.toLowerCase() === 'e') this.activateSkill('blackhole');
            if (e.key.toLowerCase() === 'p') this.togglePause();
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (this.isPaused) return;
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            for (const slot of this.turretSlots.slots) {
                const pos = this.turretSlots.getSlotPosition(slot.id);
                if (pos && MathUtils.dist(clickX, clickY, pos.x, pos.y) < 25) {
                    this.handleSlotClick(slot);
                    return;
                }
            }

            this.runes.forEach((r, i) => {
                if (MathUtils.dist(clickX, clickY, r.x, r.y) < 30) {
                    this.activateRune(r);
                    this.runes.splice(i, 1);
                }
            });
        });

        const dmgToggle = document.getElementById('toggle-damage');
        if (dmgToggle) {
            dmgToggle.addEventListener('change', (e) => { this.settings.showDamageText = e.target.checked; });
        }

        const rangeToggle = document.getElementById('toggle-range');
        if (rangeToggle) {
            rangeToggle.addEventListener('change', (e) => { this.settings.showRange = e.target.checked; });
        }

        document.getElementById('toggle-buy').addEventListener('change', (e) => { this.autoBuyEnabled = e.target.checked; });

        this.load();
        this.recalcRelicBonuses();
        this.updateDroneStatus();
        this.checkOfflineEarnings();
        if (this.wave === 1 && this.gold === 0) this.gold = this.metaUpgrades.getEffectValue('startGold');
        if (this.wave === 1) this.tutorial.check(this.gold);

        this.updateStats();
        this.upgrades.render(this.activeTab);
        this.updateTierUI();
        this.updateEtherUI();
        this.updateCrystalsUI();
        this.updateAutomationUI();
        this.renderRelicGrid();
        this.stats.render();
        this.challenges.render();

        document.getElementById('toggle-retry').addEventListener('change', (e) => this.autoRetryEnabled = e.target.checked);

        const langSelect = document.getElementById('language-select');
        if (langSelect) {
            langSelect.value = i18n.getLocale();
        }

        i18n.onLocaleChange(() => {
            this.upgrades.render(this.activeTab);
            this.stats.render();
            this.challenges.render();
            this.metaUpgrades.render();
            this.renderRelicGrid();
            this.renderMiningUI();
        });

        setInterval(() => {
            const miningModal = document.getElementById('mining-modal');
            if (miningModal && !miningModal.classList.contains('hidden')) {
                this.renderMiningUI();
            }
        }, 500);

        if (!this.waveInProgress && !document.getElementById('game-over-screen').classList.contains('hidden') === false) {
            this.startWave();
        }
        requestAnimationFrame((t) => this.loop(t));

        setInterval(() => {
            if (this.autoBuyEnabled && !this.isPaused && !this.isGameOver && this.metaUpgrades.getEffectValue('unlockAI')) {
                this.performAutoBuy();
                document.getElementById('auto-status').classList.remove('hidden');
            } else {
                document.getElementById('auto-status').classList.add('hidden');
            }
        }, 500);
    }

    async changeLanguage(locale) {
        await i18n.setLocale(locale);
    }

    triggerDevSecret() {
        this.devClickCount++;
        if (this.devClickCount >= 5) {
            this.devClickCount = 0;
            const btn = document.getElementById('btn-dev-menu');
            btn.classList.remove('hidden');
            this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2, t('notifications.devModeActivated'), "#ef4444", 40));
        }
    }

    toggleBulk() {
        this.buyMode = this.buyMode === '1' ? 'MAX' : '1';
        this.upgrades.render(this.activeTab);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('btn-pause');
        if (this.isPaused) {
            btn.classList.add('bg-yellow-600');
        } else {
            btn.classList.remove('bg-yellow-600');
            this.lastTime = performance.now();
        }
    }

    resize() {
        const container = document.getElementById('game-container');
        if (!container) return;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    toggleSpeed() {
        this.speedIndex = (this.speedIndex + 1) % GAME_SPEEDS.length;
        this.speedMultiplier = GAME_SPEEDS[this.speedIndex].mult;
        document.getElementById('ui-speed').innerText = 'x' + this.speedMultiplier;
    }

    activateSkill(id) {
        this.skills.activate(id);
        this.tutorial.check(0);
    }

    addGold(amount) {
        this.gold += amount;
        this.stats.registerGold(amount);
        this.upgrades.render(this.activeTab);
        this.tutorial.check(this.gold);
    }

    switchTab(id) {
        this.activeTab = id;
        document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
            if (idx === id) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        this.upgrades.render(this.activeTab);
    }

    updateChallengeUI() {
        this.challenges.render();
    }

    updateDroneStatus() {
        if (this.metaUpgrades.getEffectValue('unlockDrone') && !this.drone) {
            this.drone = new Drone();
            this.drone.canCollect = true;
        }
    }

    activateRune(rune) {
        if (rune.type.instant) {
            if (rune.type.id === 'heal') this.castle.heal(this.castle.maxHp * 0.25);
        } else {
            this.activeBuffs[rune.type.id] = rune.type.duration;
        }
        this.floatingTexts.push(new FloatingText(rune.x, rune.y - 20, t(rune.type.nameKey) + '!', rune.type.color, 24));
        this.sound.play('coin');
    }

    checkOfflineEarnings() {
        const now = Date.now();
        const diffMs = now - this.lastSaveTime;
        const diffSec = diffMs / 1000;
        const maxOfflineHours = 8; // Maximum 8 hours of offline earnings
        const cappedDiffSec = Math.min(diffSec, maxOfflineHours * 3600);

        if (cappedDiffSec > 60) {
            // Base gold from wave progress
            const baseGold = this.wave * 10;

            // Multipliers (stacking)
            const goldMult = this.metaUpgrades.getEffectValue('goldMult');
            const relicMult = 1 + (this.relicMults.gold || 0);
            const prestigeMult = this.prestige?.getEffectValue('prestige_gold') || 1;
            const totalMult = goldMult * relicMult * prestigeMult;

            // Production building earnings
            let productionEarnings = 0;
            if (this.production) {
                PRODUCTION_BUILDINGS.forEach(b => {
                    const rate = this.production.getProductionRate(b.id);
                    if (b.resource === 'gold') {
                        productionEarnings += rate * cappedDiffSec;
                    }
                });
            }

            const earned = Math.floor((baseGold * (cappedDiffSec / 60) * totalMult) + productionEarnings);

            if (earned > 0) {
                this.gold += earned;
                this.stats.registerGold(earned);
                document.getElementById('offline-gold').innerText = formatNumber(earned);

                // Show offline time
                const hours = Math.floor(cappedDiffSec / 3600);
                const mins = Math.floor((cappedDiffSec % 3600) / 60);
                const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                const subtitleEl = document.getElementById('offline-modal').querySelector('[data-i18n="modals.offline.subtitle"]');
                if (subtitleEl) subtitleEl.innerText = `${t('modals.offline.subtitle')} (${timeStr})`;

                document.getElementById('offline-modal').classList.remove('hidden');
            }
        }
    }

    tryDropRelic() {
        if (Math.random() < 0.25) {
            const uncollected = RELIC_DB.filter(r => !this.relics.includes(r.id));
            if (uncollected.length > 0) {
                const drop = uncollected[Math.floor(Math.random() * uncollected.length)];
                this.relics.push(drop.id);
                this.recalcRelicBonuses();
                this.updateStats();
                this.renderRelicGrid();
                this.showLootPopup(drop);
                this.save();
                this.sound.play('levelup');
            }
        }
    }

    recalcRelicBonuses() {
        this.relicMults = { damage: 0, gold: 0, speed: 0, critChance: 0, health: 0, cooldown: 0, mining: 0, leech: 0, dreadReward: 0, critDamage: 0, revive: false, autoSkill: false };
        this.relics.forEach(id => {
            const r = RELIC_DB.find(db => db.id === id);
            if (r) r.effect(this);
        });
    }

    onBossKill() {
        const baseCrystals = Math.floor(this.wave / 10) + 1;
        const dreadBonus = 1 + (this.dreadLevel * 0.25);
        const crystalAffinity = 1 + (this.researchEffects.crystalGain || 0);
        const crystalsEarned = Math.floor(baseCrystals * dreadBonus * crystalAffinity);
        this.crystals += crystalsEarned;
        this.updateCrystalsUI();
        this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 3, `+${crystalsEarned} ${t('currency.crystals')}`, '#22d3ee', 28));

        if (this.town.hasUnlock('office') && Math.random() < 0.3) {
            const gemsEarned = Math.floor((this.wave / 20) + 1);
            this.office.addGems(gemsEarned);
            this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 3 + 40, `+${gemsEarned} 💠`, '#e879f9', 24));
        }
    }

    setDreadLevel(level) {
        this.dreadLevel = Math.max(0, Math.min(10, level));
        this.updateDreadUI();
        this.save();
    }

    updateDreadUI() {
        const el = document.getElementById('dread-level');
        if (el) el.innerText = this.dreadLevel;

        const dreadDisplay = document.getElementById('ui-dread-display');
        if (dreadDisplay) {
            if (this.dreadLevel > 0) {
                dreadDisplay.classList.remove('hidden');
            } else {
                dreadDisplay.classList.add('hidden');
            }
        }

        this.renderDreadSelector();
    }

    renderDreadSelector() {
        const container = document.getElementById('dread-selector');
        if (!container) return;

        const maxUnlocked = Math.min(10, Math.floor(this.stats.maxWave / 10));

        container.innerHTML = '';
        DREAD_LEVELS.forEach(dread => {
            const isUnlocked = dread.level <= maxUnlocked;
            const isSelected = dread.level === this.dreadLevel;

            const btn = document.createElement('button');
            btn.className = `dread-level ${isUnlocked ? '' : 'locked'} ${isSelected ? 'selected' : ''}`;
            btn.dataset.level = dread.level;
            btn.innerHTML = `${dread.level}`;
            btn.style.color = dread.color;

            if (isUnlocked) {
                btn.onclick = () => {
                    this.setDreadLevel(dread.level);
                };
            }

            container.appendChild(btn);
        });

        const infoTitle = document.getElementById('dread-info-title');
        const infoBonus = document.getElementById('dread-info-bonus');
        const infoDifficulty = document.getElementById('dread-info-difficulty');

        const currentDread = DREAD_LEVELS[this.dreadLevel];
        if (currentDread && infoTitle && infoBonus && infoDifficulty) {
            infoTitle.innerText = t(currentDread.nameKey);
            const mult = this.getDreadMultipliers();
            infoBonus.innerHTML = `${t('dread.bonus')}: +${Math.floor((mult.crystalBonus - 1) * 100)}% ${t('currency.crystals')}, +${Math.floor((mult.etherBonus - 1) * 100)}% Ether`;
            infoDifficulty.innerHTML = `${t('dread.difficulty')}: HP x${mult.enemyHp.toFixed(1)}, DMG x${mult.enemyDamage.toFixed(1)}, SPD x${mult.enemySpeed.toFixed(1)}`;
        }
    }

    getDreadMultipliers() {
        const level = this.dreadLevel;
        return {
            enemyHp: 1 + (level * 0.5),
            enemyDamage: 1 + (level * 0.3),
            enemySpeed: 1 + (level * 0.1),
            crystalBonus: 1 + (level * 0.25),
            etherBonus: 1 + (level * 0.2)
        };
    }

    canSurrender() {
        return this.wave >= 5 && !this.isGameOver;
    }

    strategicSurrender() {
        if (!this.canSurrender()) return;

        const surrenderBonus = 1.5;
        const dreadMult = this.getDreadMultipliers();

        const bonusEther = Math.floor(this.wave * surrenderBonus * dreadMult.etherBonus);
        const bonusGold = Math.floor(this.gold * 0.1);

        this.ether += bonusEther;
        this.gold += bonusGold;

        this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2 - 50, t('surrender.bonus'), '#22c55e', 32));
        this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2, `+${bonusEther} 🔮`, '#a855f7', 28));
        this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2 + 40, `+${formatNumber(bonusGold)} ${t('game.gold')}`, '#fbbf24', 24));

        this.sound.play('levelup');
        this.gameOver();
    }

    updateSurrenderButton() {
        const btn = document.getElementById('btn-surrender');
        if (btn) {
            if (this.canSurrender()) {
                btn.classList.remove('hidden');
            } else {
                btn.classList.add('hidden');
            }
        }
    }

    t(key) {
        return t(key);
    }

    updateCrystalsUI() {
        const el = document.getElementById('ui-crystals');
        if (el) el.innerText = formatNumber(this.crystals);
    }

    renderMiningUI() {
        const grid = document.getElementById('mining-grid');
        if (!grid) return;

        grid.innerHTML = '';

        MINING_RESOURCES.forEach(resource => {
            const amount = this.miningResources[resource.id] || 0;
            const isMining = this.mining.isMining(resource.id);
            const progress = this.mining.getProgress(resource.id);

            const div = document.createElement('div');
            div.className = 'bg-slate-700 p-3 rounded border border-slate-600 flex flex-col gap-2';

            div.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">${resource.icon}</span>
                        <span class="font-bold" style="color: ${resource.color}">${t(resource.nameKey)}</span>
                    </div>
                    <span class="text-white font-mono">${formatNumber(amount)}</span>
                </div>
                <div class="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div class="h-full transition-all duration-200" style="width: ${isMining ? progress * 100 : 0}%; background: ${resource.color}"></div>
                </div>
                <button class="mining-btn text-xs py-1 px-2 rounded font-bold ${isMining ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-600 hover:bg-cyan-500'} text-white" data-resource="${resource.id}">
                    ${isMining ? t('mining.stop') : t('mining.start')}
                </button>
            `;

            grid.appendChild(div);
        });

        grid.querySelectorAll('.mining-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resourceId = e.target.dataset.resource;
                if (this.mining.isMining(resourceId)) {
                    this.mining.stopMining(resourceId);
                } else {
                    this.mining.startMining(resourceId);
                }
            });
        });

        const slotsEl = document.getElementById('mining-slots');
        if (slotsEl) {
            slotsEl.innerText = `${this.mining.activeMiners.length}/${this.mining.maxMiners}`;
        }
    }

    renderForgeUI() {
        const grid = document.getElementById('forge-recipes');
        if (!grid) return;

        grid.innerHTML = '';

        FORGE_RECIPES.forEach(recipe => {
            const canAfford = this.forge.canAfford(recipe);
            const needsRelic = recipe.type === 'upgrade' || recipe.type === 'reroll';

            const costHtml = Object.entries(recipe.cost).map(([res, amt]) => {
                const resource = MINING_RESOURCES.find(r => r.id === res);
                const owned = this.miningResources[res] || 0;
                const color = owned >= amt ? 'text-green-400' : 'text-red-400';
                return `<span class="${color}">${resource?.icon || res} ${owned}/${amt}</span>`;
            }).join(' ');

            const div = document.createElement('div');
            div.className = `bg-slate-700 p-4 rounded border ${canAfford ? 'border-yellow-600' : 'border-slate-600'} flex flex-col gap-2`;

            div.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="font-bold text-yellow-400">${t(recipe.nameKey)}</span>
                    <span class="text-xs text-slate-400">${Math.floor(recipe.successRate * 100)}%</span>
                </div>
                <div class="text-xs text-slate-300">${t(recipe.descKey)}</div>
                <div class="text-xs">${costHtml}</div>
                ${needsRelic ? `
                <select class="forge-relic-select bg-slate-800 text-white text-xs p-1 rounded border border-slate-600" data-recipe="${recipe.id}">
                    <option value="">${t('forge.selectRelic')}</option>
                    ${this.relics.map(id => {
                        const r = RELIC_DB.find(db => db.id === id);
                        return r ? `<option value="${id}">${r.icon} ${t(r.nameKey)} (T${r.tier})</option>` : '';
                    }).join('')}
                </select>
                ` : ''}
                <button class="forge-btn text-xs py-2 px-3 rounded font-bold ${canAfford ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-slate-600 cursor-not-allowed'} text-white"
                    data-recipe="${recipe.id}" ${!canAfford ? 'disabled' : ''}>
                    ${t('forge.craft')}
                </button>
            `;

            grid.appendChild(div);
        });

        grid.querySelectorAll('.forge-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recipeId = e.target.dataset.recipe;
                const recipe = FORGE_RECIPES.find(r => r.id === recipeId);
                const needsRelic = recipe.type === 'upgrade' || recipe.type === 'reroll';

                let relicId = null;
                if (needsRelic) {
                    const select = grid.querySelector(`.forge-relic-select[data-recipe="${recipeId}"]`);
                    relicId = select?.value;
                    if (!relicId) {
                        this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2, t('forge.selectRelic'), '#ef4444', 24));
                        return;
                    }
                }

                const result = this.forge.execute(recipeId, relicId);

                if (result.success) {
                    this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2, t('forge.success'), '#22c55e', 32));
                    if (result.result) {
                        this.showLootPopup(result.result);
                    }
                    this.sound.play('levelup');
                } else if (result.reason === 'failed') {
                    this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2, t('forge.failed'), '#ef4444', 32));
                    this.sound.play('gameover');
                } else if (result.reason === 'cost') {
                    this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2, t('forge.notEnough'), '#ef4444', 24));
                }

                this.renderForgeUI();
                this.renderMiningUI();
            });
        });
    }

    renderResearchUI() {
        const container = document.getElementById('research-branches');
        if (!container) return;

        const crystalsEl = document.getElementById('research-crystals');
        if (crystalsEl) crystalsEl.innerText = formatNumber(this.crystals);

        container.innerHTML = '';

        RESEARCH_TREE.forEach(branch => {
            const branchDiv = document.createElement('div');
            branchDiv.className = 'bg-slate-700 p-4 rounded border border-slate-600';

            const headerColor = branch.id === 'offense' ? 'text-red-400' : (branch.id === 'defense' ? 'text-blue-400' : 'text-green-400');

            branchDiv.innerHTML = `
                <h3 class="font-bold ${headerColor} text-lg mb-3">${t(branch.nameKey)}</h3>
                <div class="research-nodes space-y-2">
                    ${branch.nodes.map(node => {
                        const purchased = this.research.purchased[node.id];
                        const canBuy = this.research.canPurchase(node);
                        const bgColor = purchased ? 'bg-green-900/50 border-green-500' : (canBuy ? 'bg-slate-800 border-yellow-500' : 'bg-slate-900 border-slate-600');

                        return `
                            <div class="p-3 rounded border ${bgColor}">
                                <div class="flex justify-between items-center">
                                    <span class="font-bold text-white">${t(node.nameKey)}</span>
                                    <span class="text-xs text-cyan-400">💎 ${node.cost}</span>
                                </div>
                                <div class="text-xs text-slate-300 mt-1">${t(node.descKey)}</div>
                                ${!purchased ? `
                                    <button class="research-btn mt-2 text-xs py-1 px-3 rounded font-bold ${canBuy ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-slate-600 cursor-not-allowed'} text-white"
                                        data-node="${node.id}" ${!canBuy ? 'disabled' : ''}>
                                        ${purchased ? t('research.purchased') : t('research.purchase')}
                                    </button>
                                ` : `<span class="text-xs text-green-400 mt-2 block">${t('research.purchased')}</span>`}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            container.appendChild(branchDiv);
        });

        container.querySelectorAll('.research-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nodeId = e.target.dataset.node;
                const result = this.research.purchase(nodeId);

                if (result.success) {
                    this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2, t('research.unlocked'), '#22c55e', 32));
                    this.sound.play('levelup');
                } else {
                    this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2, t('research.cannotPurchase'), '#ef4444', 24));
                }

                this.renderResearchUI();
            });
        });
    }

    showLootPopup(relic) {
        const div = document.createElement('div');
        div.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black font-bold p-4 rounded-xl border-4 border-white shadow-2xl z-40 loot-popup';
        div.innerHTML = `<div>🏆 ${t('notifications.relicObtained')}</div><div class="text-2xl mt-1">${relic.icon} ${t(relic.nameKey)}</div><div class="text-xs font-normal">${t(relic.descKey)}</div>`;
        document.getElementById('loot-container').appendChild(div);
        setTimeout(() => div.remove(), 2000);
    }

    renderProductionUI() {
        const container = document.getElementById('production-grid');
        const summaryContainer = document.getElementById('production-summary');
        if (!container) return;

        // Render production summary
        if (summaryContainer) {
            const totals = {};
            PRODUCTION_BUILDINGS.forEach(building => {
                const rate = this.production.getProductionRate(building.id);
                if (!totals[building.resource]) totals[building.resource] = 0;
                totals[building.resource] += rate;
            });

            const resourceIcons = { gold: '💰', crystal: '💎', ether: '🔮', void_shard: '🌑' };
            summaryContainer.innerHTML = Object.entries(totals).map(([resource, rate]) =>
                `<div class="bg-slate-800 p-2 rounded">
                    <div class="text-lg">${resourceIcons[resource] || '?'}</div>
                    <div class="text-green-400 font-bold">+${rate.toFixed(2)}/${t('units.second')}</div>
                </div>`
            ).join('');
        }

        container.innerHTML = '';

        PRODUCTION_BUILDINGS.forEach(building => {
            const data = this.production.buildings[building.id];
            const level = data?.level || 0;
            const cost = this.production.getBuildingCost(building.id);
            const rate = this.production.getProductionRate(building.id);
            const canAfford = this.gold >= cost;
            const isMaxed = level >= building.maxLevel;

            const div = document.createElement('div');
            div.className = `p-4 rounded-xl border-2 transition-all ${isMaxed ? 'bg-slate-700 border-slate-600 opacity-75' : canAfford ? 'bg-orange-900/40 border-orange-500 hover:bg-orange-800/60 cursor-pointer' : 'bg-slate-800 border-slate-700 opacity-60'}`;

            div.innerHTML = `
                <div class="flex items-center gap-3 mb-2">
                    <span class="text-3xl">${building.icon}</span>
                    <div>
                        <div class="font-bold text-white">${t(building.nameKey)}</div>
                        <div class="text-xs text-slate-400">${t(building.descKey)}</div>
                    </div>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-orange-300">${t('production.level')}: ${level}/${building.maxLevel}</span>
                    <span class="text-green-400">${rate > 0 ? `+${rate.toFixed(2)}/${t('units.second')}` : '-'}</span>
                </div>
                ${!isMaxed ? `
                    <button class="production-btn mt-2 w-full py-2 rounded font-bold text-white ${canAfford ? 'bg-orange-600 hover:bg-orange-500' : 'bg-slate-600 cursor-not-allowed'}"
                        data-building="${building.id}" ${!canAfford ? 'disabled' : ''}>
                        ${t('production.upgrade')} - ${formatNumber(cost)} 💰
                    </button>
                ` : `<div class="text-center text-yellow-400 text-sm mt-2">${t('lab.max')}</div>`}
            `;

            container.appendChild(div);
        });

        container.querySelectorAll('.production-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const buildingId = e.target.dataset.building;
                if (this.production.upgrade(buildingId)) {
                    this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2, t('production.upgraded'), '#22c55e', 24));
                    this.sound.play('levelup');
                }
                this.renderProductionUI();
            });
        });
    }

    renderDailyQuestsUI() {
        const container = document.getElementById('quests-grid');
        const timerEl = document.getElementById('quests-timer');
        if (!container) return;

        this.dailyQuests.generateQuests();

        const timeLeft = this.dailyQuests.getTimeUntilReset();
        const hours = Math.floor(timeLeft / 3600000);
        const minutes = Math.floor((timeLeft % 3600000) / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        if (timerEl) timerEl.innerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        container.innerHTML = '';

        if (this.dailyQuests.quests.length === 0) {
            container.innerHTML = `<div class="text-slate-500 text-center py-8">${t('quests.noQuests')}</div>`;
            return;
        }

        this.dailyQuests.quests.forEach(quest => {
            const progress = this.dailyQuests.progress[quest.id] || 0;
            const percent = Math.min(100, (progress / quest.target) * 100);

            const div = document.createElement('div');
            div.className = `p-4 rounded-xl border-2 transition-all ${quest.completed ? 'bg-emerald-900/40 border-emerald-500' : 'bg-slate-800 border-slate-600'}`;

            const rewardIcon = quest.rewardType === 'gold' ? '💰' : (quest.rewardType === 'crystals' ? '💎' : '🔮');

            div.innerHTML = `
                <div class="flex items-center gap-3 mb-2">
                    <span class="text-3xl">${quest.icon}</span>
                    <div class="flex-1">
                        <div class="font-bold text-white">${t(quest.nameKey)}</div>
                        <div class="text-xs text-slate-400">${t(quest.descKey)}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-emerald-400 font-bold">+${quest.reward} ${rewardIcon}</div>
                    </div>
                </div>
                <div class="relative h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div class="absolute inset-0 h-full bg-emerald-500 transition-all" style="width: ${percent}%"></div>
                    <div class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        ${progress}/${quest.target} ${quest.completed ? `✓ ${t('quests.completed')}` : ''}
                    </div>
                </div>
            `;

            container.appendChild(div);
        });
    }

    renderPrestigeUI() {
        const pointsEl = document.getElementById('prestige-points');
        const potentialEl = document.getElementById('prestige-potential');
        const totalEl = document.getElementById('prestige-total');
        const btnEl = document.getElementById('btn-prestige');
        const container = document.getElementById('prestige-upgrades-grid');
        const waveSkipEl = document.getElementById('prestige-wave-skip');
        const autoPrestigeToggle = document.getElementById('toggle-auto-prestige');
        const autoPrestigeWaveInput = document.getElementById('auto-prestige-wave');

        if (pointsEl) pointsEl.innerText = this.prestige.prestigePoints;
        if (potentialEl) potentialEl.innerText = this.prestige.calculatePrestigePoints();
        if (totalEl) totalEl.innerText = this.prestige.totalPrestiges;
        if (btnEl) btnEl.disabled = !this.prestige.canPrestige();

        // Wave skip display
        const waveSkip = this.prestige.getWaveSkipAmount();
        if (waveSkipEl) {
            if (waveSkip > 0) {
                waveSkipEl.innerText = `+${waveSkip}`;
                waveSkipEl.parentElement.classList.remove('hidden');
            } else {
                waveSkipEl.parentElement.classList.add('hidden');
            }
        }

        // Auto-prestige controls
        if (autoPrestigeToggle) {
            autoPrestigeToggle.checked = this.prestige.autoPrestige;
            autoPrestigeToggle.onchange = (e) => {
                this.prestige.autoPrestige = e.target.checked;
                this.save();
            };
        }
        if (autoPrestigeWaveInput) {
            autoPrestigeWaveInput.value = this.prestige.autoPrestigeWave;
            autoPrestigeWaveInput.onchange = (e) => {
                this.prestige.autoPrestigeWave = Math.max(25, parseInt(e.target.value) || 30);
                this.save();
            };
        }

        if (!container) return;
        container.innerHTML = '';

        PRESTIGE_UPGRADES.forEach(upgrade => {
            const level = this.prestige.upgrades[upgrade.id] || 0;
            const cost = this.prestige.getUpgradeCost(upgrade.id);
            const canAfford = this.prestige.prestigePoints >= cost;
            const isMaxed = level >= upgrade.maxLevel;
            const effectValue = upgrade.effect(level);
            const nextValue = upgrade.effect(level + 1);

            const div = document.createElement('div');
            div.className = `p-4 rounded-xl border-2 transition-all ${isMaxed ? 'bg-slate-700 border-slate-600 opacity-75' : canAfford ? 'bg-amber-900/40 border-amber-500 hover:bg-amber-800/60 cursor-pointer' : 'bg-slate-800 border-slate-700 opacity-60'}`;

            div.innerHTML = `
                <div class="flex items-center gap-3 mb-2">
                    <span class="text-3xl">${upgrade.icon}</span>
                    <div class="flex-1">
                        <div class="font-bold text-white">${t(upgrade.nameKey)}</div>
                        <div class="text-xs text-slate-400">${t(upgrade.descKey)}</div>
                    </div>
                </div>
                <div class="flex justify-between items-center text-sm mb-2">
                    <span class="text-amber-300">${t('lab.level')} ${level}/${upgrade.maxLevel}</span>
                    <span class="text-green-400">${typeof effectValue === 'number' ? (effectValue % 1 === 0 ? effectValue : effectValue.toFixed(2)) : effectValue}</span>
                </div>
                ${!isMaxed ? `
                    <button class="prestige-btn mt-2 w-full py-2 rounded font-bold text-white ${canAfford ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-600 cursor-not-allowed'}"
                        data-upgrade="${upgrade.id}" ${!canAfford ? 'disabled' : ''}>
                        ${t('prestige.buy')} - ${cost} 👑
                    </button>
                ` : `<div class="text-center text-yellow-400 text-sm">${t('lab.max')}</div>`}
            `;

            container.appendChild(div);
        });

        container.querySelectorAll('.prestige-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgradeId = e.target.dataset.upgrade;
                if (this.prestige.buyUpgrade(upgradeId)) {
                    this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2, t('prestige.upgraded'), '#fbbf24', 24));
                    this.sound.play('levelup');
                }
                this.renderPrestigeUI();
            });
        });
    }

    renderChipsUI() {
        const inventoryContainer = document.getElementById('chips-inventory');
        const equippedContainer = document.getElementById('chips-equipped');

        if (!inventoryContainer || !equippedContainer) return;

        inventoryContainer.innerHTML = '';
        equippedContainer.innerHTML = '';

        const rarityColors = { 1: 'border-slate-500', 2: 'border-blue-500', 3: 'border-purple-500', 4: 'border-yellow-500' };
        const rarityBgs = { 1: 'bg-slate-800', 2: 'bg-blue-900/30', 3: 'bg-purple-900/30', 4: 'bg-yellow-900/30' };

        if (this.chips.inventory.length === 0) {
            inventoryContainer.innerHTML = `<div class="col-span-4 text-slate-500 text-center py-4">${t('chips.empty')}</div>`;
        } else {
            this.chips.inventory.forEach(chip => {
                const div = document.createElement('div');
                div.className = `p-3 rounded border-2 ${rarityColors[chip.rarity]} ${rarityBgs[chip.rarity]} cursor-pointer hover:opacity-80 transition`;
                div.innerHTML = `
                    <div class="text-2xl text-center">${chip.icon}</div>
                    <div class="text-xs text-center font-bold text-white mt-1">${t(chip.nameKey)}</div>
                `;
                div.title = t(chip.descKey);
                inventoryContainer.appendChild(div);
            });
        }

        this.turrets.forEach((turret, idx) => {
            const chips = this.chips.turretChips[idx] || [];
            const div = document.createElement('div');
            div.className = 'bg-slate-700 p-3 rounded border border-slate-600';
            div.innerHTML = `
                <div class="font-bold text-pink-400 mb-2">${t('chips.turret')} ${idx + 1}</div>
                <div class="flex gap-2">
                    ${[0, 1, 2].map(slotIdx => {
                        const chip = chips[slotIdx];
                        if (chip) {
                            return `<div class="w-12 h-12 rounded border-2 ${rarityColors[chip.rarity]} ${rarityBgs[chip.rarity]} flex items-center justify-center text-xl" title="${t(chip.nameKey)}">${chip.icon}</div>`;
                        } else {
                            return `<div class="w-12 h-12 rounded border-2 border-dashed border-slate-500 flex items-center justify-center text-slate-500">+</div>`;
                        }
                    }).join('')}
                </div>
            `;
            equippedContainer.appendChild(div);
        });
    }

    renderTownUI() {
        const levelEl = document.getElementById('town-level');
        const levelIconEl = document.getElementById('town-level-icon');
        const xpEl = document.getElementById('town-xp');
        const nextXpEl = document.getElementById('town-next-xp');
        const progressEl = document.getElementById('town-progress');
        const unlocksGrid = document.getElementById('town-unlocks-grid');

        if (!levelEl || !unlocksGrid) return;

        const current = this.town.getCurrentLevel();
        const next = this.town.getNextLevel();

        levelEl.innerText = this.town.level;
        levelIconEl.innerText = current.icon;
        xpEl.innerText = formatNumber(this.town.xp);
        nextXpEl.innerText = next ? formatNumber(next.xpRequired) : t('town.maxLevel');
        progressEl.style.width = `${this.town.getXPProgress()}%`;

        unlocksGrid.innerHTML = '';
        TOWN_LEVELS.forEach(lvl => {
            const unlocked = this.town.level >= lvl.level;
            const div = document.createElement('div');
            div.className = `p-3 rounded border ${unlocked ? 'border-teal-500 bg-teal-900/30' : 'border-slate-600 bg-slate-800 opacity-50'}`;
            div.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">${lvl.icon}</span>
                    <span class="font-bold ${unlocked ? 'text-teal-400' : 'text-slate-500'}">${t(lvl.nameKey)}</span>
                </div>
                <div class="text-xs text-slate-400">${t('town.requires')} ${formatNumber(lvl.xpRequired)} XP</div>
                <div class="text-xs text-slate-300 mt-1">${lvl.unlocks.map(u => t(`town.unlock.${u}`)).join(', ')}</div>
            `;
            unlocksGrid.appendChild(div);
        });

        const schoolBtn = document.getElementById('btn-school');
        const officeBtn = document.getElementById('btn-office');
        const awakeningBtn = document.getElementById('btn-awakening');
        if (schoolBtn) schoolBtn.classList.toggle('hidden', !this.town.hasUnlock('school'));
        if (officeBtn) officeBtn.classList.toggle('hidden', !this.town.hasUnlock('office'));
        if (awakeningBtn) awakeningBtn.classList.toggle('hidden', !this.town.hasUnlock('awakening'));
    }

    renderSchoolUI() {
        const crystalsEl = document.getElementById('school-crystals');
        const grid = document.getElementById('school-turrets-grid');

        if (!crystalsEl || !grid) return;

        crystalsEl.innerText = formatNumber(this.crystals);
        grid.innerHTML = '';

        SCHOOL_TURRETS.forEach(turret => {
            const unlocked = this.school.isUnlocked(turret.id);
            const level = this.school.getLevel(turret.id);
            const maxed = level >= turret.maxLevel;

            const div = document.createElement('div');
            div.className = `p-3 rounded border ${unlocked ? 'border-indigo-500 bg-indigo-900/30' : 'border-slate-600 bg-slate-800'}`;
            div.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">${turret.icon}</span>
                    <div>
                        <div class="font-bold ${unlocked ? 'text-indigo-400' : 'text-slate-400'}">${t(turret.nameKey)}</div>
                        ${unlocked ? `<div class="text-xs text-slate-300">${t('school.level')} ${level}/${turret.maxLevel}</div>` : ''}
                    </div>
                </div>
                <div class="text-xs text-slate-400 mb-2">${t(turret.descKey)}</div>
                ${!unlocked ? `
                    <button onclick="game.school.unlock('${turret.id}'); game.renderSchoolUI()" class="w-full px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded ${this.crystals >= turret.unlockCost ? '' : 'opacity-50 cursor-not-allowed'}">
                        ${t('school.unlock')} (${turret.unlockCost} 💎)
                    </button>
                ` : maxed ? `
                    <div class="text-center text-xs text-yellow-400">${t('school.maxed')}</div>
                ` : `
                    <button onclick="game.school.levelUp('${turret.id}'); game.renderSchoolUI()" class="w-full px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded ${this.crystals >= this.school.getLevelUpCost(turret.id) ? '' : 'opacity-50 cursor-not-allowed'}">
                        ${t('school.upgrade')} (${this.school.getLevelUpCost(turret.id)} 💎)
                    </button>
                `}
            `;
            grid.appendChild(div);
        });
    }

    renderOfficeUI() {
        const gemsEl = document.getElementById('office-gems');
        const activeContainer = document.getElementById('office-active-boosts');
        const grid = document.getElementById('office-boosts-grid');

        if (!gemsEl || !grid) return;

        gemsEl.innerText = formatNumber(this.office.gems);

        activeContainer.innerHTML = '';
        const activeBoosts = this.office.getActiveBoosts();
        if (activeBoosts.length === 0) {
            activeContainer.innerHTML = `<div class="text-slate-500 text-center py-2">${t('office.noActive')}</div>`;
        } else {
            activeBoosts.forEach(ab => {
                const div = document.createElement('div');
                div.className = 'flex items-center justify-between bg-lime-900/30 p-2 rounded border border-lime-700';
                div.innerHTML = `
                    <span>${ab.boost.icon} ${t(ab.boost.nameKey)}</span>
                    <span class="text-lime-400">${Math.ceil(ab.remaining)}s</span>
                `;
                activeContainer.appendChild(div);
            });
        }

        grid.innerHTML = '';
        OFFICE_BOOSTS.forEach(boost => {
            const active = this.office.hasActiveBoost(boost.id);
            const canAfford = this.office.gems >= boost.baseCost;

            const div = document.createElement('div');
            div.className = `p-3 rounded border ${active ? 'border-lime-400 bg-lime-900/50' : 'border-slate-600 bg-slate-800'}`;
            div.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">${boost.icon}</span>
                    <div>
                        <div class="font-bold text-lime-400">${t(boost.nameKey)}</div>
                        <div class="text-xs text-slate-300">${boost.mult}x - ${boost.duration}s</div>
                    </div>
                </div>
                <div class="text-xs text-slate-400 mb-2">${t(boost.descKey)}</div>
                <button onclick="game.office.activateBoost('${boost.id}'); game.renderOfficeUI()"
                    class="w-full px-3 py-1 bg-lime-600 hover:bg-lime-500 text-white text-sm rounded ${canAfford && !active ? '' : 'opacity-50 cursor-not-allowed'}"
                    ${active || !canAfford ? 'disabled' : ''}>
                    ${active ? t('office.active') : `${t('office.activate')} (${boost.baseCost} 💠)`}
                </button>
            `;
            grid.appendChild(div);
        });
    }

    renderAwakeningUI() {
        const statusEl = document.getElementById('awakening-status');
        const requirementEl = document.getElementById('awakening-requirement');
        const awakenBtn = document.getElementById('btn-awaken');
        const grid = document.getElementById('awakening-bonuses-grid');

        if (!statusEl || !grid) return;

        if (this.awakening.isAwakened) {
            statusEl.innerText = t('awakening.awakened');
            statusEl.className = 'text-xl font-bold text-fuchsia-400 mb-2';
            requirementEl.innerText = `${t('awakening.level')} ${this.awakening.awakeningLevel}`;
            awakenBtn.classList.add('hidden');
        } else {
            statusEl.innerText = t('awakening.notAwakened');
            statusEl.className = 'text-xl font-bold text-slate-400 mb-2';
            requirementEl.innerText = `${t('awakening.requirement')} (${t('dread.level')} 6+)`;
            if (this.awakening.canAwaken()) {
                awakenBtn.classList.remove('hidden');
            } else {
                awakenBtn.classList.add('hidden');
            }
        }

        grid.innerHTML = '';
        AWAKENING_BONUSES.forEach(bonus => {
            const unlocked = this.awakening.unlockedBonuses.includes(bonus.id);
            const div = document.createElement('div');
            div.className = `p-3 rounded border ${unlocked ? 'border-fuchsia-500 bg-fuchsia-900/30' : 'border-slate-600 bg-slate-800 opacity-50'}`;
            div.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">${bonus.icon}</span>
                    <div class="font-bold ${unlocked ? 'text-fuchsia-400' : 'text-slate-500'}">${t(bonus.nameKey)}</div>
                </div>
                <div class="text-xs text-slate-400">${t(bonus.descKey)}</div>
                ${unlocked ? `<div class="text-xs text-fuchsia-400 mt-1">✓ ${t('awakening.active')}</div>` : ''}
            `;
            grid.appendChild(div);
        });
    }

    handleSlotClick(slot) {
        if (!slot.purchased) {
            if (this.turretSlots.canPurchaseSlot(slot.id)) {
                if (confirm(t('slots.confirmBuy').replace('{{cost}}', formatNumber(slot.cost)))) {
                    this.turretSlots.purchaseSlot(slot.id);
                    this.floatingTexts.push(new FloatingText(
                        this.turretSlots.getSlotPosition(slot.id).x,
                        this.turretSlots.getSlotPosition(slot.id).y,
                        t('slots.purchased'),
                        '#22d3ee',
                        24
                    ));
                }
            } else {
                this.floatingTexts.push(new FloatingText(
                    this.turretSlots.getSlotPosition(slot.id).x,
                    this.turretSlots.getSlotPosition(slot.id).y,
                    t('slots.notEnoughGold'),
                    '#ef4444',
                    18
                ));
            }
        } else {
            this.turretSlots.selectedSlot = slot.id;
            this.renderTurretSlotsUI();
            document.getElementById('slots-modal').classList.remove('hidden');
        }
    }

    renderTurretSlotsUI() {
        const selectedSlot = this.turretSlots.slots[this.turretSlots.selectedSlot];
        const grid = document.getElementById('slots-turrets-grid');
        const currentEl = document.getElementById('slots-current-turret');

        if (!grid || !selectedSlot) return;

        if (selectedSlot.turretId) {
            const turret = SCHOOL_TURRETS.find(t => t.id === selectedSlot.turretId);
            currentEl.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${turret?.icon || '?'}</span>
                    <div>
                        <div class="font-bold text-cyan-400">${t(turret?.nameKey || 'slots.empty')}</div>
                        <div class="text-xs text-slate-400">${t('school.level')} ${this.school.getLevel(selectedSlot.turretId)}</div>
                    </div>
                </div>
                <button onclick="game.turretSlots.removeTurret(${selectedSlot.id}); game.renderTurretSlotsUI()"
                    class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm">
                    ${t('slots.remove')}
                </button>
            `;
        } else {
            currentEl.innerHTML = `<span class="text-slate-500">${t('slots.empty')}</span>`;
        }

        grid.innerHTML = '';
        SCHOOL_TURRETS.forEach(turret => {
            const unlocked = this.school.isUnlocked(turret.id);
            const level = this.school.getLevel(turret.id);
            const isEquipped = selectedSlot.turretId === turret.id;

            const div = document.createElement('div');
            div.className = `p-3 rounded border cursor-pointer transition ${
                isEquipped ? 'border-cyan-400 bg-cyan-900/50' :
                unlocked ? 'border-slate-600 bg-slate-800 hover:border-cyan-600' :
                'border-slate-700 bg-slate-900 opacity-50 cursor-not-allowed'
            }`;
            div.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-2xl">${turret.icon}</span>
                    <div>
                        <div class="font-bold ${unlocked ? 'text-white' : 'text-slate-500'}">${t(turret.nameKey)}</div>
                        ${unlocked ? `<div class="text-xs text-slate-400">${t('school.level')} ${level}</div>` : `<div class="text-xs text-red-400">${t('slots.locked')}</div>`}
                    </div>
                </div>
            `;

            if (unlocked && !isEquipped) {
                div.onclick = () => {
                    this.turretSlots.placeTurret(selectedSlot.id, turret.id);
                    this.renderTurretSlotsUI();
                };
            }

            grid.appendChild(div);
        });
    }

    t(key) {
        return t(key);
    }

    renderRelicGrid() {
        const container = document.getElementById('ui-relic-count');
        if (container) container.innerText = this.relics.length;
        const container2 = document.getElementById('ui-relic-count-2');
        if (container2) container2.innerText = this.relics.length;
        const grid = document.getElementById('relic-grid');
        grid.innerHTML = '';
        if (this.relics.length === 0) {
            grid.innerHTML = `<div class="text-slate-500 col-span-3 text-center py-8">${t('modals.collection.empty')}</div>`;
            return;
        }
        this.relics.forEach(id => {
            const r = RELIC_DB.find(db => db.id === id);
            if (r) {
                const div = document.createElement('div');
                div.className = 'bg-slate-700 p-2 rounded border border-yellow-700 flex flex-col items-center text-center';
                div.innerHTML = `<div class="text-3xl mb-1">${r.icon}</div><div class="font-bold text-sm text-yellow-400 leading-tight">${t(r.nameKey)}</div><div class="text-[10px] text-slate-300 mt-1">${t(r.descKey)}</div>`;
                grid.appendChild(div);
            }
        });
    }

    updateStats() {
        const tierMult = Math.pow(CONFIG.evolutionMultiplier, Math.min(3, this.castle.tier) - 1 + Math.max(0, this.castle.tier - 3) * 0.5);

        // Multiplicative stacking for damage (meta × relic × prestige × research)
        const metaDmgMult = this.metaUpgrades.getEffectValue('damageMult');
        const relicDmgMult = 1 + (this.relicMults.damage || 0);
        const prestigeDmgMult = this.prestige?.getEffectValue('prestige_damage') || 1;
        const researchDmgMult = 1 + (this.researchEffects?.damageMult || 0);
        const slotBonuses = this.turretSlots?.getPassiveBonuses() || { damage: 0, speed: 0, range: 0 };
        const slotDmgMult = 1 + slotBonuses.damage;
        const totalDmgMult = metaDmgMult * relicDmgMult * prestigeDmgMult * researchDmgMult * slotDmgMult;

        // Multiplicative stacking for health
        const metaHpMult = this.metaUpgrades.getEffectValue('healthMult');
        const relicHpMult = 1 + (this.relicMults.health || 0);
        const prestigeHpMult = this.prestige?.getEffectValue('prestige_health') || 1;
        const researchHpMult = 1 + (this.researchEffects?.healthMult || 0);
        const totalHpMult = metaHpMult * relicHpMult * prestigeHpMult * researchHpMult;

        const dmgBase = this.upgrades.upgrades.find(u => u.id === 'damage');
        this.currentDamage = Math.floor(dmgBase.getValue(dmgBase.level) * tierMult * totalDmgMult);

        const spdBase = this.upgrades.upgrades.find(u => u.id === 'speed');
        const prestigeSkillCd = this.prestige?.getEffectValue('prestige_skill_cd') || 1;
        const slotSpeedMult = 1 + slotBonuses.speed;
        this.currentFireRate = (spdBase.getValue(spdBase.level) / (1 + this.relicMults.speed) * prestigeSkillCd) / slotSpeedMult;

        const critStat = this.upgrades.upgrades.find(u => u.id === 'crit').getValue(this.upgrades.upgrades.find(u => u.id === 'crit').level);
        const researchCritChance = this.researchEffects?.critChance || 0;
        const researchCritDmg = this.researchEffects?.critDamage || 0;
        this.critChance = critStat.chance + this.relicMults.critChance + researchCritChance;
        this.critMult = critStat.mult + (this.stats.mastery['crit_dmg'] || 0) * 0.1 + (this.relicMults.critDamage || 0) + researchCritDmg;

        const hpBase = this.upgrades.upgrades.find(u => u.id === 'health');
        const hpMod = this.activeChallenge && this.activeChallenge.id === 'glass' ? 0.1 : 1;
        this.castle.maxHp = Math.floor(hpBase.getValue(hpBase.level) * tierMult * totalHpMult * hpMod);

        const regBase = this.upgrades.upgrades.find(u => u.id === 'regen');
        const researchRegenMult = 1 + (this.researchEffects?.regenMult || 0);
        this.castle.regen = regBase.getValue(regBase.level) * tierMult * researchRegenMult;

        this.currentRange = this.upgrades.upgrades.find(u => u.id === 'range').getValue(this.upgrades.upgrades.find(u => u.id === 'range').level);
        this.multiShotChance = this.upgrades.upgrades.find(u => u.id === 'multishot').getValue(this.upgrades.upgrades.find(u => u.id === 'multishot').level);
        this.currentEffects = {
            ice: this.upgrades.upgrades.find(u => u.id === 'ice').getValue(this.upgrades.upgrades.find(u => u.id === 'ice').level),
            poison: this.upgrades.upgrades.find(u => u.id === 'poison').getValue(this.upgrades.upgrades.find(u => u.id === 'poison').level)
        };
        this.currentProps = {
            bounce: this.upgrades.upgrades.find(u => u.id === 'bounce').getValue(this.upgrades.upgrades.find(u => u.id === 'bounce').level),
            blast: this.upgrades.upgrades.find(u => u.id === 'blast').getValue(this.upgrades.upgrades.find(u => u.id === 'blast').level),
            leech: this.upgrades.upgrades.find(u => u.id === 'leech').getValue(this.upgrades.upgrades.find(u => u.id === 'leech').level),
            stasis: this.upgrades.upgrades.find(u => u.id === 'stasis').getValue(this.upgrades.upgrades.find(u => u.id === 'stasis').level),
            orbital: this.upgrades.upgrades.find(u => u.id === 'orbital').getValue(this.upgrades.upgrades.find(u => u.id === 'orbital').level)
        };
        const shieldUpg = this.upgrades.upgrades.find(u => u.id === 'shield');
        this.castle.maxShield = shieldUpg.getValue(shieldUpg.level);

        const turretPositions = [{ x: -40, y: -60 }, { x: 40, y: -60 }, { x: -40, y: 60 }, { x: 40, y: 60 }];
        const turretCount = this.upgrades.upgrades.find(u => u.id === 'turret').level;
        const specialTypes = ['artillery', 'rocket', 'tesla'];

        this.turrets = [];
        specialTypes.forEach(type => {
            const upg = this.upgrades.upgrades.find(u => u.id === type);
            if (upg && upg.level > 0) {
                const posIndex = this.turrets.length % turretPositions.length;
                this.turrets.push(new Turret(this.turrets.length, turretPositions[posIndex], 0, type.toUpperCase()));
            }
        });

        for (let i = 0; i < turretCount; i++) {
            const posIndex = this.turrets.length % turretPositions.length;
            this.turrets.push(new Turret(this.turrets.length, turretPositions[posIndex], 0, 'NORMAL'));
        }
    }

    checkEvolution() {
        const newTier = 1 + Math.floor((this.wave - 1) / CONFIG.evolutionInterval);
        if (newTier > this.castle.tier) {
            this.castle.tier = newTier;
            this.updateStats();
            this.upgrades.render(this.activeTab);
            this.updateTierUI();
            const notif = document.getElementById('evo-notification');
            notif.classList.remove('hidden');
            notif.style.opacity = '1';
            setTimeout(() => {
                notif.style.opacity = '0';
                setTimeout(() => notif.classList.add('hidden'), 1000);
            }, 3000);
            for (let i = 0; i < 30; i++) this.particles.push(new Particle(100, this.height / 2, '#a855f7'));
            this.sound.play('levelup');
        }
        if (this.castle.tier >= 4) {
            const hue = (Date.now() / 50) % 360;
            document.body.style.backgroundColor = `hsl(${hue}, 20%, 10%)`;
        } else {
            const colors = ['#0f172a', '#1e1b4b', '#1a2e05', '#270a0a'];
            document.body.style.backgroundColor = colors[(newTier - 1) % colors.length];
        }
    }

    updateTierUI() {
        const el = document.getElementById('ui-tier');
        if (el) el.innerText = this.castle.tier;
        if (this.castle.tier > 1) document.getElementById('ui-tier-display').classList.remove('hidden');
    }

    updateEtherUI() {
        document.getElementById('ui-ether-hud').innerText = formatNumber(this.ether);
        document.getElementById('shop-ether-total').innerText = formatNumber(this.ether);
    }

    updateAutomationUI() {
        if (this.metaUpgrades.getEffectValue('unlockAuto')) {
            document.getElementById('auto-controls').classList.remove('hidden');
            if (this.metaUpgrades.getEffectValue('unlockAI')) {
                document.getElementById('auto-buy-container').classList.remove('hidden');
                document.getElementById('toggle-buy').disabled = false;
                document.getElementById('auto-buy-container').classList.remove('opacity-50');
            }
        }
    }

    rushWave() {
        if (this.isBossWave) return;
        this.isRushBonus = true;
        for (let i = 0; i < 5; i++) this.spawnEnemy();
        this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2 - 100, t('notifications.waveRush'), "#ef4444", 40));
        this.enemiesToSpawn = 0;
        this.waveInProgress = false;
        this.wave++;
        this.enemiesToSpawn += (5 + Math.floor(this.wave * 3));
        this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2, `${t('game.wave')} ${this.wave}`, '#fff', 40));
        this.checkEvolution();
        this.save();
    }

    startWave() {
        this.waveInProgress = true;
        this.stats.registerWave(this.wave);
        this.isBossWave = (this.wave % 10 === 0);
        this.isRushBonus = false;
        this.enemiesToSpawn = this.isBossWave ? 1 : (5 + Math.floor(this.wave * 3));
        if (this.activeChallenge && this.activeChallenge.id === 'horde') this.enemiesToSpawn *= 3;
        if (this.isBossWave) {
            const notif = document.getElementById('boss-notification');
            notif.classList.remove('hidden');
            setTimeout(() => notif.classList.add('hidden'), 3000);
        }
        this.checkEvolution();
        this.floatingTexts.push(new FloatingText(
            this.width / 2,
            this.height / 2,
            this.isBossWave ? `${t('notifications.bossWarning')} - ${t('game.wave')} ${this.wave}` : `${t('game.wave')} ${this.wave}`,
            this.isBossWave ? '#ef4444' : '#fff',
            40
        ));
    }

    spawnEnemy() {
        const startX = this.width + 50;
        const startY = MathUtils.randomRange(this.height * 0.1, this.height * 0.9);

        if (this.isBossWave) {
            this.enemies.push(new Enemy(this.wave, 'BOSS', startX, startY));
        } else {
            const rand = Math.random();
            let type = 'NORMAL';
            if (this.wave > 5 && rand < 0.2) type = 'SPEEDY';
            if (this.wave > 15 && rand > 0.8) type = 'TANK';
            if (this.wave > 20 && rand > 0.9 && rand < 0.95) type = 'HEALER';
            if (this.wave > 25 && rand > 0.95) type = 'SPLITTER';
            if (this.wave > 10 && rand > 0.3 && rand < 0.35) type = 'THIEF';
            if (this.wave > 30 && rand > 0.4 && rand < 0.45) type = 'PHANTOM';
            this.enemies.push(new Enemy(this.wave, type, startX, startY));
        }
    }

    findTarget(sourceX, sourceY, range) {
        let nearest = null;
        let minDist = Infinity;
        for (const enemy of this.enemies) {
            const d = MathUtils.dist(sourceX, sourceY, enemy.x, enemy.y);
            if (d < range && d < minDist) {
                minDist = d;
                nearest = enemy;
            }
        }
        return nearest;
    }

    shoot(target) {
        if (!target) return;
        let color = '#60a5fa';
        if (this.castle.tier === 2) color = '#a855f7';
        if (this.castle.tier >= 3) color = '#f43f5e';
        let isCrit = false;
        let isSuperCrit = false;
        let dmg = this.currentDamage;
        if (this.critChance > 100) {
            isCrit = true;
            if (Math.random() * 100 < (this.critChance - 100)) {
                isSuperCrit = true;
                dmg = Math.floor(dmg * this.critMult * 2.5);
            } else {
                dmg = Math.floor(dmg * this.critMult);
            }
        } else {
            if (Math.random() * 100 < this.critChance) {
                isCrit = true;
                dmg = Math.floor(dmg * this.critMult);
            }
        }
        const finalColor = isSuperCrit ? '#d946ef' : (isCrit ? '#fbbf24' : color);
        this.projectiles.push(new Projectile(100, this.height / 2, target, dmg, 15, finalColor, this.castle.tier, false, isCrit, isSuperCrit, this.currentEffects, this.currentProps));
        this.sound.play('shoot');
        if (Math.random() * 100 < this.multiShotChance) {
            setTimeout(() => {
                if (target && target.hp > 0) {
                    this.projectiles.push(new Projectile(100, this.height / 2, target, Math.floor(dmg * 0.5), 15, '#fff', this.castle.tier, true, isCrit, isSuperCrit, this.currentEffects, this.currentProps));
                }
            }, 100 / this.speedMultiplier);
        }
    }

    fireOrbital() {
        let target = null;
        let maxHp = -1;
        this.enemies.forEach(e => {
            if (e.hp > maxHp) {
                maxHp = e.hp;
                target = e;
            }
        });
        if (target) {
            const dmg = this.currentDamage * 5;
            target.takeDamage(dmg, true, true);
            const div = document.createElement('div');
            div.className = 'orbital-laser';
            div.style.left = (target.x) + 'px';
            div.style.top = '0px';
            div.style.height = (target.y) + 'px';
            document.getElementById('fx-container').appendChild(div);
            setTimeout(() => div.remove(), 500);
            this.floatingTexts.push(new FloatingText(target.x, target.y - 60, t('notifications.orbital'), "#3b82f6", 36));
        }
    }

    loop(currentTime) {
        if (!this.isPaused) {
            const dtRaw = currentTime - this.lastTime;
            this.lastTime = currentTime;
            const dt = Math.min(dtRaw, 100) * this.speedMultiplier;
            this.gameTime += dt;
            this.update(dt);
        }
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        this.mining.update();
        this.production.update();
        this.office.update(dt);
        this.turretSlots.update(dt);
        this.weather.update(dt);
        this.combo.update(dt);
        this.events.update(dt);
        this.statistics.update(dt);
        if (this.isGameOver) return;
        this.skills.update(dt);
        if (this.drone) this.drone.update(dt, this.gameTime);
        if (this.currentProps.orbital > 0) {
            this.orbitalTimer += dt;
            if (this.orbitalTimer >= this.currentProps.orbital) {
                this.fireOrbital();
                this.orbitalTimer = 0;
            }
        }

        for (let k in this.activeBuffs) {
            if (this.activeBuffs[k] > 0) this.activeBuffs[k] -= dt;
        }
        const buffContainer = document.getElementById('buff-container');
        if (buffContainer) {
            buffContainer.innerHTML = '';
            for (let k in this.activeBuffs) {
                if (this.activeBuffs[k] > 0) {
                    const runeType = RUNE_TYPES.find(r => r.id === k);
                    if (runeType) {
                        const d = document.createElement('div');
                        d.className = 'text-xs bg-black/50 px-2 py-1 rounded text-white border';
                        d.style.borderColor = runeType.color;
                        d.innerText = `${runeType.icon} ${(this.activeBuffs[k] / 1000).toFixed(1)}s`;
                        buffContainer.appendChild(d);
                    }
                }
            }
        }

        if (this.enemiesToSpawn > 0) {
            if (this.gameTime - this.spawnTimer > CONFIG.enemySpawnRate / (1 + this.wave * 0.05)) {
                this.spawnEnemy();
                this.enemiesToSpawn--;
                this.spawnTimer = this.gameTime;
            }
        } else if (this.enemies.length === 0 && this.waveInProgress) {
            this.waveInProgress = false;
            this.wave++;
            this.save();
            setTimeout(() => this.startWave(), 2000 / this.speedMultiplier);
        }

        this.castle.update(dt);
        this.turrets.forEach(t => t.update(dt, this.gameTime));
        this.runes.forEach(r => r.update(dt));
        this.runes = this.runes.filter(r => r.life > 0);

        if (this.particles.length > 50) this.particles.shift();
        if (this.floatingTexts.length > 20) this.floatingTexts.shift();

        const fireRate = (this.skills.isActive('overdrive') || this.activeBuffs['rage'] > 0) ? this.currentFireRate / 3 : this.currentFireRate;
        if (this.gameTime - this.lastShotTime > fireRate) {
            const target = this.findTarget(this.castle.x, this.castle.y, this.currentRange);
            if (target) {
                this.shoot(target);
                this.lastShotTime = this.gameTime;
            }
        }

        this.enemies.forEach(e => e.update(dt));
        this.projectiles.forEach(p => p.update(dt));
        this.particles.forEach(p => p.update(dt));
        this.floatingTexts.forEach(t => t.update(dt));
        this.enemies = this.enemies.filter(e => e.hp > 0);
        this.projectiles = this.projectiles.filter(p => p.active);
        this.particles = this.particles.filter(p => p.life > 0);
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);

        const elGold = document.getElementById('ui-gold');
        if (elGold) elGold.innerText = formatNumber(this.gold);
        const elWave = document.getElementById('ui-wave');
        if (elWave) elWave.innerText = this.wave;
        this.updateSurrenderButton();
        const elEnemies = document.getElementById('ui-enemies');
        if (elEnemies) elEnemies.innerText = this.enemies.length + this.enemiesToSpawn;
        const hpPct = Math.max(0, Math.ceil((this.castle.hp / this.castle.maxHp) * 100));
        const elHealthBar = document.getElementById('ui-health-bar');
        if (elHealthBar) elHealthBar.style.width = `${hpPct}%`;
        const elHpText = document.getElementById('ui-hp-text');
        if (elHpText) elHpText.innerText = `${formatNumber(Math.ceil(this.castle.hp))}/${formatNumber(this.castle.maxHp)}`;
        const shPct = Math.max(0, Math.min(100, Math.ceil((this.castle.shield / this.castle.maxShield) * 100)));
        const elShieldBar = document.getElementById('ui-shield-bar');
        if (elShieldBar) elShieldBar.style.width = `${shPct}%`;
        const dmDisplay = document.getElementById('ui-dm-amount');
        if (dmDisplay) {
            dmDisplay.innerText = this.challenges.darkMatter;
            if (this.challenges.darkMatter > 0) document.getElementById('ui-dark-matter').classList.remove('hidden');
        }
        this.stats.render();
    }

    draw() {
        this.ctx.fillStyle = document.body.style.backgroundColor || '#0f172a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(0, 0, 120, this.height);
        const fx = document.getElementById('fx-container');
        if (this.skills.isActive('blackhole')) {
            fx.innerHTML = `<div class="absolute top-1/2 left-[70%] transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-purple-600 shadow-[0_0_50px_#9333ea] opacity-80 black-hole-visual bg-black"></div>`;
        } else {
            if (!document.querySelector('.orbital-laser')) fx.innerHTML = '';
        }
        const laserColor = this.castle.tier === 1 ? '#3b82f6' : (this.castle.tier === 2 ? '#a855f7' : (this.castle.tier === 3 ? '#f43f5e' : '#fff'));
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = laserColor;
        this.ctx.strokeStyle = laserColor;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(120, 0);
        this.ctx.lineTo(120, this.height);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        this.turrets.forEach(t => t.draw(this.ctx));
        this.castle.draw(this.ctx, this.width, this.height);
        this.turretSlots.draw(this.ctx);
        if (this.drone) this.drone.draw(this.ctx);
        this.runes.forEach(r => r.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
        this.projectiles.forEach(p => p.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
        this.floatingTexts.forEach(t => t.draw(this.ctx));
        this.weather.draw(this.ctx);
        this.combo.draw(this.ctx);
        this.events.draw(this.ctx);
    }

    gameOver() {
        this.isGameOver = true;
        const dreadMult = this.getDreadMultipliers();
        const earnedEther = Math.max(1, Math.floor(this.wave / 1.5)) * (1 + (this.stats.mastery['ether_gain'] || 0) * 0.05) * dreadMult.etherBonus;
        this.ether += earnedEther;
        if (this.activeChallenge) {
            const rewardDM = Math.floor(this.wave / 5) * this.activeChallenge.diff;
            this.challenges.darkMatter += rewardDM;
            document.getElementById('go-dm-gain').innerText = rewardDM;
            document.getElementById('go-dm-gain-box').classList.remove('hidden');
        } else {
            document.getElementById('go-dm-gain-box').classList.add('hidden');
        }
        this.save();
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('go-wave').innerText = this.wave;
        document.getElementById('go-ether-gain').innerText = formatNumber(Math.floor(earnedEther));
        this.updateEtherUI();
        this.metaUpgrades.render();
        this.sound.play('gameover');

        // Check auto-prestige first (priority over auto-retry)
        if (this.prestige?.autoPrestige && this.prestige.canPrestige() && this.wave >= this.prestige.autoPrestigeWave) {
            document.getElementById('auto-retry-timer').classList.remove('hidden');
            document.getElementById('retry-countdown').innerText = 'PP';
            if (this.retryTimeoutId) clearInterval(this.retryTimeoutId);
            this.retryTimeoutId = setTimeout(() => {
                this.prestige.doPrestige();
            }, 1500);
            return;
        }

        if (this.autoRetryEnabled && this.metaUpgrades.getEffectValue('unlockAuto')) {
            document.getElementById('auto-retry-timer').classList.remove('hidden');
            let countdown = 3;
            document.getElementById('retry-countdown').innerText = countdown;
            if (this.retryTimeoutId) clearInterval(this.retryTimeoutId);
            this.retryTimeoutId = setInterval(() => {
                countdown--;
                document.getElementById('retry-countdown').innerText = countdown;
                if (countdown <= 0) {
                    clearInterval(this.retryTimeoutId);
                    this.restart(true);
                }
            }, 1000);
        } else {
            document.getElementById('auto-retry-timer').classList.add('hidden');
        }
    }

    manualRestart() {
        if (this.retryTimeoutId) clearInterval(this.retryTimeoutId);
        this.restart(false);
    }

    restart(isAuto) {
        this.isGameOver = false;
        this.wave = 1;
        this.castle.hp = this.castle.maxHp;
        this.castle.tier = 1;
        this.castle.shield = this.castle.maxShield;
        this.enemies = [];
        this.projectiles = [];
        this.runes = [];
        this.activeBuffs = { rage: 0, midas: 0 };
        this.upgrades.upgrades.forEach(u => {
            const resetIds = ['regen', 'multishot', 'turret', 'crit', 'ice', 'poison', 'bounce', 'blast', 'leech', 'shield', 'stasis', 'orbital', 'artillery', 'rocket', 'tesla', 'armor'];
            u.level = resetIds.includes(u.id) ? 0 : 1;
        });
        this.gold = this.metaUpgrades.getEffectValue('startGold');
        if (isAuto && this.autoBuyEnabled && this.metaUpgrades.getEffectValue('unlockAI')) {
            document.getElementById('auto-status').classList.remove('hidden');
        } else {
            document.getElementById('auto-status').classList.add('hidden');
        }
        this.updateStats();
        this.upgrades.render(this.activeTab);
        this.updateTierUI();
        this.updateEtherUI();
        this.updateChallengeUI();
        document.getElementById('game-over-screen').classList.add('hidden');
        this.startWave();
        this.tutorial.check(this.gold);
    }

    performAutoBuy() {
        let bought = false;
        this.upgrades.upgrades.forEach(u => {
            if (this.upgrades.buy(u.id, true)) bought = true;
        });
        if (bought) this.save();
    }

    confirmReset() {
        if (confirm(t('modals.settings.confirmReset'))) {
            localStorage.removeItem(CONFIG.saveKey);
            location.reload();
        }
    }

    exportSave() {
        const str = btoa(localStorage.getItem(CONFIG.saveKey));
        document.getElementById('save-string').value = str;
        navigator.clipboard.writeText(str).then(() => alert(t('notifications.saveCopied')));
    }

    importSave() {
        const str = prompt(t('notifications.pasteSave'));
        if (str) {
            try {
                localStorage.setItem(CONFIG.saveKey, decodeURIComponent(escape(atob(str))));
                location.reload();
            } catch (e) {
                alert(t('notifications.invalidSave'));
            }
        }
    }

    save() {
        const data = {
            gold: this.gold,
            wave: this.wave,
            tier: this.castle.tier,
            upgrades: this.upgrades.upgrades.map(u => ({ id: u.id, level: u.level })),
            ether: this.ether,
            crystals: this.crystals,
            miningResources: this.miningResources,
            miningActiveMiners: this.mining.getSaveData(),
            researchPurchased: this.research.getSaveData(),
            researchEffects: this.researchEffects,
            dreadLevel: this.dreadLevel,
            metaUpgrades: this.metaUpgrades.upgrades.map(u => ({ id: u.id, level: u.level })),
            relics: this.relics,
            stats: {
                kills: this.stats.kills,
                bosses: this.stats.bosses,
                totalGold: this.stats.totalGold,
                maxWave: this.stats.maxWave,
                achievements: this.stats.unlockedAchievements,
                xp: this.stats.xp,
                level: this.stats.level,
                masteryPoints: this.stats.masteryPoints,
                mastery: this.stats.mastery,
                seenEnemies: this.stats.seenEnemies
            },
            autoRetry: this.autoRetryEnabled,
            autoBuy: this.autoBuyEnabled,
            lastSaveTime: Date.now(),
            settings: this.settings,
            challenges: { dm: this.challenges.darkMatter, tech: this.challenges.dmTech },
            locale: i18n.getLocale(),
            production: this.production.getSaveData(),
            auras: this.auras.getSaveData(),
            chips: this.chips.getSaveData(),
            dailyQuests: this.dailyQuests.getSaveData(),
            prestige: this.prestige.getSaveData(),
            speedIndex: this.speedIndex,
            town: this.town.getSaveData(),
            school: this.school.getSaveData(),
            office: this.office.getSaveData(),
            awakening: this.awakening.getSaveData(),
            turretSlots: this.turretSlots.getSaveData(),
            weather: this.weather.getSaveData(),
            combo: this.combo.getSaveData(),
            events: this.events.getSaveData(),
            talents: this.talents.getSaveData(),
            statistics: this.statistics.getSaveData(),
            ascensionMgr: this.ascensionMgr.getSaveData()
        };
        localStorage.setItem(CONFIG.saveKey, JSON.stringify(data));
        if (document.getElementById('save-string')) {
            try {
                document.getElementById('save-string').value = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
            } catch (e) {
                document.getElementById('save-string').value = '';
            }
        }
    }

    load() {
        const saved = localStorage.getItem(CONFIG.saveKey);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.ether = data.ether || 0;
                this.crystals = data.crystals || 0;
                this.miningResources = data.miningResources || {};
                this.researchEffects = data.researchEffects || {};
                this.mining.loadSaveData(data.miningActiveMiners);
                this.research.loadSaveData(data.researchPurchased);
                this.dreadLevel = data.dreadLevel || 0;
                this.lastSaveTime = data.lastSaveTime || Date.now();
                this.relics = data.relics || [];
                if (data.metaUpgrades) {
                    data.metaUpgrades.forEach(s => {
                        const u = this.metaUpgrades.upgrades.find(m => m.id === s.id);
                        if (u) u.level = s.level;
                    });
                }
                this.gold = data.gold || 0;
                this.wave = data.wave || 1;
                this.castle.tier = data.tier || 1;
                if (data.upgrades) {
                    data.upgrades.forEach(s => {
                        const u = this.upgrades.upgrades.find(m => m.id === s.id);
                        if (u) u.level = s.level;
                    });
                }
                if (data.stats) {
                    this.stats.kills = data.stats.kills || 0;
                    this.stats.bosses = data.stats.bosses || 0;
                    this.stats.totalGold = data.stats.totalGold || 0;
                    this.stats.maxWave = data.stats.maxWave || 0;
                    this.stats.unlockedAchievements = data.stats.achievements || [];
                    this.stats.xp = data.stats.xp || 0;
                    this.stats.level = data.stats.level || 1;
                    this.stats.masteryPoints = data.stats.masteryPoints || 0;
                    this.stats.mastery = data.stats.mastery || {};
                    this.stats.seenEnemies = data.stats.seenEnemies || [];
                }
                if (data.challenges) {
                    this.challenges.darkMatter = data.challenges.dm || 0;
                    this.challenges.dmTech = data.challenges.tech || {};
                }
                this.autoRetryEnabled = data.autoRetry || false;
                this.autoBuyEnabled = data.autoBuy || false;
                this.settings = data.settings || { showDamageText: true, showRange: true };
                document.getElementById('toggle-retry').checked = this.autoRetryEnabled;
                document.getElementById('toggle-buy').checked = this.autoBuyEnabled;
                if (document.getElementById('toggle-damage')) document.getElementById('toggle-damage').checked = this.settings.showDamageText;
                if (document.getElementById('toggle-range')) document.getElementById('toggle-range').checked = this.settings.showRange;
                if (data.locale) {
                    i18n.setLocale(data.locale);
                }
                if (data.production) {
                    this.production.loadSaveData(data.production);
                }
                if (data.auras) {
                    this.auras.loadSaveData(data.auras);
                }
                if (data.chips) {
                    this.chips.loadSaveData(data.chips);
                }
                if (data.dailyQuests) {
                    this.dailyQuests.loadSaveData(data.dailyQuests);
                }
                if (data.prestige) {
                    this.prestige.loadSaveData(data.prestige);
                }
                if (data.speedIndex !== undefined) {
                    this.speedIndex = data.speedIndex;
                    this.speedMultiplier = GAME_SPEEDS[this.speedIndex]?.mult || 1;
                }
                if (data.town) {
                    this.town.loadSaveData(data.town);
                }
                if (data.school) {
                    this.school.loadSaveData(data.school);
                }
                if (data.office) {
                    this.office.loadSaveData(data.office);
                }
                if (data.awakening) {
                    this.awakening.loadSaveData(data.awakening);
                }
                if (data.turretSlots) {
                    this.turretSlots.loadSaveData(data.turretSlots);
                }
                if (data.weather) {
                    this.weather.loadSaveData(data.weather);
                }
                if (data.combo) {
                    this.combo.loadSaveData(data.combo);
                }
                if (data.events) {
                    this.events.loadSaveData(data.events);
                }
                if (data.talents) {
                    this.talents.loadSaveData(data.talents);
                }
                if (data.statistics) {
                    this.statistics.loadSaveData(data.statistics);
                }
                if (data.ascensionMgr) {
                    this.ascensionMgr.loadSaveData(data.ascensionMgr);
                }
            } catch (e) {
                console.error("Save error", e);
            }
        }
        this.dailyQuests.generateQuests();
    }
}

async function init() {
    await i18n.init();
    i18n.translatePage();
    new Game();

    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(modal => {
                modal.classList.add('hidden');
            });
        }
    });

    // Quest timer auto-update
    setInterval(() => {
        if (window.game && !document.getElementById('quests-modal').classList.contains('hidden')) {
            const timerEl = document.getElementById('quests-timer');
            if (timerEl && game.dailyQuests) {
                const timeLeft = game.dailyQuests.getTimeUntilReset();
                const hours = Math.floor(timeLeft / 3600000);
                const minutes = Math.floor((timeLeft % 3600000) / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                timerEl.innerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }, 1000);

    // UI badge updates
    setInterval(() => {
        if (!window.game) return;

        // Quest badge - show only if there are incomplete quests
        const questBadge = document.getElementById('quest-badge');
        if (questBadge && game.dailyQuests) {
            const hasIncomplete = game.dailyQuests.quests.length > 0 && game.dailyQuests.quests.some(q => !q.completed);
            questBadge.classList.toggle('hidden', !hasIncomplete);
        }

        // Prestige button glow
        const prestigeBtn = document.getElementById('btn-prestige-menu');
        if (prestigeBtn && game.prestige) {
            prestigeBtn.classList.toggle('prestige-ready', game.prestige.canPrestige());
        }
    }, 2000);

    // Initialize help tooltips
    initHelpTooltips();

    // Hide loading screen when game is ready
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => loadingScreen.remove(), 500);
    }
}

function initHelpTooltips() {
    let activeTooltip = null;

    // Use event delegation for dynamic elements
    document.addEventListener('mouseenter', (e) => {
        const icon = e.target.closest('.help-icon[data-help]');
        if (!icon) return;

        const helpKey = icon.getAttribute('data-help');
        const titleKey = `help.${helpKey}.title`;
        const textKey = `help.${helpKey}.text`;

        const title = t(titleKey);
        const text = t(textKey);

        if (!title || title === titleKey) return;

        if (activeTooltip) {
            activeTooltip.remove();
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'help-tooltip';
        tooltip.innerHTML = `
            <div class="help-tooltip-title">${title}</div>
            <div class="help-tooltip-text">${text}</div>
        `;
        document.body.appendChild(tooltip);

        const rect = icon.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let top = rect.bottom + 10;

        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = rect.top - tooltipRect.height - 10;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;

        activeTooltip = tooltip;
    }, true);

    document.addEventListener('mouseout', (e) => {
        const icon = e.target.closest('.help-icon[data-help]');
        if (!icon) return;

        if (activeTooltip) {
            activeTooltip.remove();
            activeTooltip = null;
        }
    }, true);
}

init();
