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

import { TURRET_TIERS } from '../data.js';
import { CONFIG } from '../config.js';
import { Projectile } from './Projectile.js';

/**
 * Turret entity for castle defense
 */
export class Turret {
    constructor(id, offsetIndex, total, type = 'NORMAL', tier = 1) {
        this.id = id;
        this.offsetIndex = offsetIndex;
        this.total = total;
        this.type = type;
        this.tier = tier;
        this.x = 0;
        this.y = 0;
        this.lastShotTime = 0;
        this.destroyed = false;
        this.updateTierStats();
        this.initHP();
    }

    /**
     * Initialize HP based on tier
     */
    initHP() {
        const baseHP = 50;
        const tierMult = 1 + (this.tier - 1) * 0.5;
        this.maxHp = Math.floor(baseHP * tierMult);
        this.hp = this.maxHp;
        this.destroyed = false;
    }

    /**
     * Take damage from enemies
     */
    takeDamage(amount) {
        if (this.destroyed) return;
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.destroyed = true;
        }
    }

    /**
     * Repair turret (called on wave completion or prestige)
     */
    repair() {
        this.hp = this.maxHp;
        this.destroyed = false;
    }

    /**
     * Check if turret can attack
     */
    isOperational() {
        return !this.destroyed && this.hp > 0;
    }

    updateTierStats() {
        const tierData = TURRET_TIERS[this.tier] || TURRET_TIERS[1];
        this.damageMultiplier = CONFIG.turret.baseDamageMultiplier * tierData.damageMult;
        this.rangeMult = tierData.rangeMult;
        this.fireRateMult = tierData.fireRateMult;

        // Special turret balancing - aim for ~0.8-1.0x effective DPS vs NORMAL
        if (this.type === 'ARTILLERY') {
            // High damage, slow fire, long range, splash damage
            this.damageMultiplier = 2.5 * tierData.damageMult;
            this.fireRateMult *= 0.35;
            this.rangeMult *= 1.5;
        }
        if (this.type === 'ROCKET') {
            // Medium damage, medium fire rate, good range
            this.damageMultiplier = 1.2 * tierData.damageMult;
            this.fireRateMult *= 0.7;
            this.rangeMult *= 1.3;
        }
        if (this.type === 'TESLA') {
            // Low damage per hit, very fast, short range, chain lightning
            this.damageMultiplier = 0.5 * tierData.damageMult;
            this.fireRateMult *= 1.8;
            this.rangeMult *= 0.9;
        }

        // Update max HP when tier changes
        const baseHP = 50;
        const tierMult = 1 + (this.tier - 1) * 0.5;
        const newMaxHp = Math.floor(baseHP * tierMult);
        const hpRatio = this.maxHp > 0 ? this.hp / this.maxHp : 1;
        this.maxHp = newMaxHp;
        this.hp = Math.floor(newMaxHp * hpRatio);
    }

    upgradeTier(game) {
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

    update(dt, gameTime, game) {
        // Update position even if destroyed (for visual)
        const slots = [{ x: -40, y: -60 }, { x: 40, y: -60 }, { x: -40, y: 60 }, { x: 40, y: 60 }];
        if (this.type === 'ARTILLERY') {
            this.x = game.castle.x;
            this.y = game.castle.y - 70;
        } else if (this.type === 'ROCKET') {
            this.x = game.castle.x - 50;
            this.y = game.castle.y;
        } else if (this.type === 'TESLA') {
            this.x = game.castle.x + 50;
            this.y = game.castle.y;
        }
        else {
            if (this.id < 4) {
                const pos = slots[this.id];
                this.x = game.castle.x + pos.x;
                this.y = game.castle.y + pos.y;
            } else {
                const angle = (gameTime * CONFIG.turret.orbitSpeed) + (this.id * (Math.PI / 2));
                this.x = game.castle.x + Math.cos(angle) * CONFIG.turret.orbitRadius;
                this.y = game.castle.y + Math.sin(angle) * CONFIG.turret.orbitRadius;
            }
        }

        // Don't shoot if destroyed
        if (!this.isOperational()) return;

        const isRapidFire = game.skills.isActive('overdrive') || game.activeBuffs['rage'] > 0;
        const baseFireRate = isRapidFire ? game.currentFireRate / 3 : game.currentFireRate;
        const fireInterval = baseFireRate / this.fireRateMult;
        if (gameTime - this.lastShotTime > fireInterval) {
            const range = game.currentRange * this.rangeMult;
            const target = game.findTarget(this.x, this.y, range);
            if (target) {
                this.shoot(target, game);
                this.lastShotTime = gameTime;
            }
        }
    }

    shoot(target, game) {
        const dmg = Math.max(1, Math.floor(game.currentDamage * this.damageMultiplier));
        let speed = CONFIG.turret.projectileSpeed;
        const tierData = TURRET_TIERS[this.tier] || TURRET_TIERS[1];
        let color = tierData.color || '#a5b4fc';
        let props = { ...game.currentProps };

        if (this.type === 'ARTILLERY') {
            speed = 8;
            color = '#fca5a5';
            props.blast = 100;
        }
        if (this.type === 'ROCKET') {
            speed = 12;
            color = '#fdba74';
        }
        if (this.type === 'TESLA') {
            speed = 25;
            color = '#67e8f9';
            props.bounce = (props.bounce || 0) + 3;
        }

        game.projectiles.push(Projectile.create(
            this.x, this.y, target,
            dmg, speed, color, this.tier,
            false, false, false,
            game.currentEffects, props
        ));
    }

    draw(ctx, game) {
        const tierData = TURRET_TIERS[this.tier] || TURRET_TIERS[1];
        ctx.save();
        ctx.translate(this.x, this.y);

        // Apply destroyed visual effect
        if (this.destroyed) {
            ctx.globalAlpha = 0.3;
        }

        const target = this.isOperational()
            ? game.findTarget(this.x, this.y, game.currentRange * this.rangeMult)
            : null;
        if (target) ctx.rotate(Math.atan2(target.y - this.y, target.x - this.x));

        ctx.shadowColor = tierData.color;
        ctx.shadowBlur = this.tier > 1 ? 5 + this.tier * 2 : 0;

        if (this.type === 'ARTILLERY') {
            ctx.fillStyle = '#7f1d1d';
            ctx.fillRect(0, -8, 24, 16);
        } else if (this.type === 'ROCKET') {
            ctx.fillStyle = '#c2410c';
            ctx.fillRect(0, -6, 20, 12);
        }
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
        ctx.fillStyle = this.destroyed ? '#4a044e' : '#312e81';
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        // Draw HP bar (only if not at full HP and not destroyed)
        if (!this.destroyed && this.hp < this.maxHp) {
            this.drawHpBar(ctx);
        }

        // Draw destroyed indicator
        if (this.destroyed) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-8, -8);
            ctx.lineTo(8, 8);
            ctx.moveTo(8, -8);
            ctx.lineTo(-8, 8);
            ctx.stroke();
            ctx.restore();
        }
    }

    /**
     * Draw turret HP bar
     */
    drawHpBar(ctx) {
        const barWidth = 24;
        const barHeight = 4;
        const x = this.x - barWidth / 2;
        const y = this.y - 20;

        // Background
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(x, y, barWidth, barHeight);

        // HP fill
        const hpRatio = this.hp / this.maxHp;
        const hpColor = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
        ctx.fillStyle = hpColor;
        ctx.fillRect(x, y, barWidth * hpRatio, barHeight);

        // Border
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }
}
