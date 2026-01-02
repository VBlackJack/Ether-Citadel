/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { TURRET_SLOTS, SCHOOL_TURRETS, TURRET_TIERS } from '../data.js';
import { MathUtils } from '../config.js';
import { Projectile } from './Projectile.js';
import { SKILL, RUNE } from '../constants/skillIds.js';
import { COLORS } from '../constants/colors.js';
import { BALANCE } from '../constants/balance.js';

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
        this.cachedTarget = null;
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
        if (!window.game) return false;
        const nextTier = TURRET_TIERS[this.tier + 1];
        if (!nextTier) return false;
        if (window.game.wave < nextTier.unlockWave) return false;
        if (window.game.crystals < nextTier.cost) return false;

        window.game.crystals -= nextTier.cost;
        this.tier++;
        this.updateTierStats();
        window.game.updateCrystalsUI?.();
        window.game.save?.();
        return true;
    }

    update(dt, gameTime) {
        if (!window.game?.castle) return;
        const slots = [{ x: -40, y: -60 }, { x: 40, y: -60 }, { x: -40, y: 60 }, { x: 40, y: 60 }];
        if (this.type === 'ARTILLERY') { this.x = window.game.castle.x; this.y = window.game.castle.y - 70; }
        else if (this.type === 'ROCKET') { this.x = window.game.castle.x - 50; this.y = window.game.castle.y; }
        else if (this.type === 'TESLA') { this.x = window.game.castle.x + 50; this.y = window.game.castle.y; }
        else {
            if (this.id < 4) {
                const pos = slots[this.id];
                this.x = window.game.castle.x + pos.x;
                this.y = window.game.castle.y + pos.y;
            } else {
                const orbitSpeed = 0.001;
                const angle = (gameTime * orbitSpeed) + (this.id * (Math.PI / 2));
                const orbitRadius = 100;
                this.x = window.game.castle.x + Math.cos(angle) * orbitRadius;
                this.y = window.game.castle.y + Math.sin(angle) * orbitRadius;
            }
        }

        const baseFireRate = (window.game.skills?.isActive(SKILL.OVERDRIVE) || window.game.activeBuffs?.[RUNE.RAGE] > 0) ? window.game.currentFireRate / 3 : window.game.currentFireRate;
        const fireInterval = baseFireRate / this.fireRateMult;
        const range = window.game.currentRange * this.rangeMult;
        this.cachedTarget = window.game.findTarget?.(this.x, this.y, range) || null;
        if (gameTime - this.lastShotTime > fireInterval && this.cachedTarget) {
            this.shoot(this.cachedTarget);
            this.lastShotTime = gameTime;
        }
    }

    shoot(target) {
        if (!window.game) return;
        // Apply diminishing returns based on turret slot index
        const efficiency = BALANCE.TURRET.EFFICIENCY;
        const efficiencyMult = efficiency[Math.min(this.id, efficiency.length - 1)];
        const dmg = Math.max(1, Math.floor((window.game.currentDamage || 1) * this.damageMultiplier * efficiencyMult));
        let speed = 15;
        const tierData = TURRET_TIERS[this.tier] || TURRET_TIERS[1];
        let color = tierData.color || COLORS.TURRET_BASE;
        let props = { ...(window.game.currentProps || {}) };
        if (this.type === 'ARTILLERY') { speed = 8; color = COLORS.TURRET_ARTILLERY; props.blast = 100; }
        if (this.type === 'ROCKET') { speed = 12; color = COLORS.TURRET_ROCKET; }
        if (this.type === 'TESLA') { speed = 25; color = COLORS.TURRET_TESLA; props.bounce = (props.bounce || 0) + 3; }
        window.game.projectiles?.push(Projectile.create(this.x, this.y, target, dmg, speed, color, this.tier, false, false, false, window.game.currentEffects || {}, props));
    }

    draw(ctx) {
        const tierData = TURRET_TIERS[this.tier] || TURRET_TIERS[1];
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.cachedTarget) ctx.rotate(Math.atan2(this.cachedTarget.y - this.y, this.cachedTarget.x - this.x));

        ctx.shadowColor = tierData.color;
        ctx.shadowBlur = this.tier > 1 ? 5 + this.tier * 2 : 0;

        if (this.type === 'ARTILLERY') { ctx.fillStyle = COLORS.TURRET_ARTILLERY_BODY; ctx.fillRect(0, -8, 24, 16); }
        else if (this.type === 'ROCKET') { ctx.fillStyle = COLORS.TURRET_ROCKET_BODY; ctx.fillRect(0, -6, 20, 12); }
        else if (this.type === 'TESLA') {
            ctx.fillStyle = COLORS.TURRET_TESLA_BODY;
            ctx.fillRect(0, -4, 15, 8);
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.strokeStyle = COLORS.TURRET_TESLA;
            ctx.stroke();
        }
        else { ctx.fillStyle = tierData.color; ctx.fillRect(0, -6, 20, 12); }
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.TURRET_CORE;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}