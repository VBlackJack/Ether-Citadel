/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { TURRET_SLOTS, SCHOOL_TURRETS } from '../../data.js';
import { t } from '../../i18n.js';
import { formatNumber, BigNumService } from '../../config.js';
import { Projectile } from '../../entities/Projectile.js';

// Turret slot upgrade constants
const SLOT_UPGRADE_CONFIG = {
    maxLevel: 10,
    baseCost: 500,
    costScale: 1.8,
    bonusPerLevel: 0.10 // +10% per level
};

export class TurretSlotManager {
    constructor(game) {
        this.game = game;
        this.slots = TURRET_SLOTS.map(slot => ({
            ...slot,
            purchased: slot.free,
            turretId: null,
            lastFireTime: 0,
            // Per-slot upgrades
            upgrades: {
                damage: 0,
                range: 0,
                speed: 0
            }
        }));
        this.selectedSlot = null;
    }

    /**
     * Get upgrade cost for a specific stat on a slot
     */
    getUpgradeCost(slotId, stat) {
        const slot = this.slots[slotId];
        if (!slot || !slot.upgrades) return Infinity;
        const level = slot.upgrades[stat] || 0;
        if (level >= SLOT_UPGRADE_CONFIG.maxLevel) return Infinity;
        return Math.floor(SLOT_UPGRADE_CONFIG.baseCost * Math.pow(SLOT_UPGRADE_CONFIG.costScale, level));
    }

    /**
     * Check if upgrade can be purchased
     */
    canUpgradeSlot(slotId, stat) {
        const slot = this.slots[slotId];
        if (!slot || !slot.purchased || !slot.turretId) return false;
        const level = slot.upgrades[stat] || 0;
        if (level >= SLOT_UPGRADE_CONFIG.maxLevel) return false;
        const cost = this.getUpgradeCost(slotId, stat);
        const gold = this.game.gold || BigNumService.create(0);
        return BigNumService.gte(gold, BigNumService.create(cost));
    }

    /**
     * Upgrade a specific stat on a turret slot
     */
    upgradeSlot(slotId, stat) {
        if (!this.canUpgradeSlot(slotId, stat)) return false;
        const cost = this.getUpgradeCost(slotId, stat);
        this.game.gold = BigNumService.sub(this.game.gold, BigNumService.create(cost));
        this.slots[slotId].upgrades[stat]++;
        this.game.sound?.play('upgrade');
        this.game.save();
        return true;
    }

    /**
     * Get slot upgrade bonus multiplier for a stat
     */
    getSlotBonus(slotId, stat) {
        const slot = this.slots[slotId];
        if (!slot || !slot.upgrades) return 1;
        const level = slot.upgrades[stat] || 0;
        return 1 + level * SLOT_UPGRADE_CONFIG.bonusPerLevel;
    }

    /**
     * Get total upgrade level for a slot
     */
    getTotalUpgradeLevel(slotId) {
        const slot = this.slots[slotId];
        if (!slot || !slot.upgrades) return 0;
        return (slot.upgrades.damage || 0) + (slot.upgrades.range || 0) + (slot.upgrades.speed || 0);
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
        const gold = this.game.gold || BigNumService.create(0);
        return BigNumService.gte(gold, BigNumService.create(slot.cost));
    }

    purchaseSlot(slotId) {
        const slot = this.slots[slotId];
        if (!this.canPurchaseSlot(slotId)) return false;

        this.game.gold = BigNumService.sub(this.game.gold, BigNumService.create(slot.cost));
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

            // Apply per-slot upgrade bonuses
            const damageBonus = this.getSlotBonus(slot.id, 'damage');
            const rangeBonus = this.getSlotBonus(slot.id, 'range');
            const speedBonus = this.getSlotBonus(slot.id, 'speed');

            const fireRate = 2000 / (stats.speed * speedBonus);
            if (this.game.gameTime - slot.lastFireTime < fireRate) return;

            const range = 150 * stats.range * rangeBonus;
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
                const damage = Math.floor(baseDamage * stats.damage * damageBonus);
                const color = this.getTurretColor(slot.turretId);

                const effects = {};
                if (stats.slow > 0) effects.ice = true;
                if (stats.dot) effects.poison = true;

                const props = { blast: stats.aoe || 0 };

                this.game.projectiles.push(Projectile.create(
                    pos.x, pos.y, target, damage, 8, color,
                    1, false, false, false, effects, props
                ));

                this.game.sound?.play('shoot');
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

                // Show upgrade level indicator
                const totalLevel = this.getTotalUpgradeLevel(slot.id);
                if (totalLevel > 0) {
                    ctx.fillStyle = '#fbbf24';
                    ctx.font = 'bold 8px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`+${totalLevel}`, 0, -22);
                }

                if (this.game.settings.showRange) {
                    const stats = this.game.school.getTurretStats(slot.turretId);
                    const rangeBonus = this.getSlotBonus(slot.id, 'range');
                    const color = this.getTurretColor(slot.turretId);
                    if (stats) {
                        ctx.strokeStyle = `${color}30`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.arc(0, 0, 150 * stats.range * rangeBonus, 0, Math.PI * 2);
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
            turretId: s.turretId,
            upgrades: s.upgrades || { damage: 0, range: 0, speed: 0 }
        }));
    }

    loadSaveData(data) {
        if (!data) return;
        data.forEach(saved => {
            const slot = this.slots.find(s => s.id === saved.id);
            if (slot) {
                slot.purchased = saved.purchased;
                slot.turretId = saved.turretId;
                slot.upgrades = saved.upgrades || { damage: 0, range: 0, speed: 0 };
            }
        });
    }

    /**
     * Reset upgrades when turret is removed from slot
     */
    resetSlotUpgrades(slotId) {
        const slot = this.slots[slotId];
        if (slot) {
            slot.upgrades = { damage: 0, range: 0, speed: 0 };
        }
    }
}