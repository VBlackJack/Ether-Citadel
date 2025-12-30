/*
 * Copyright 2025 Julien Bombled
 * Turret and Defense Data
 */

/**
 * Turret tier definitions
 */
export const TURRET_TIERS = {
    1: { nameKey: 'turretTiers.T1.name', damageMult: 1.0, rangeMult: 1.0, fireRateMult: 1.0, cost: 0, color: '#60a5fa', unlockWave: 1 },
    2: { nameKey: 'turretTiers.T2.name', damageMult: 1.5, rangeMult: 1.1, fireRateMult: 1.2, cost: 10, color: '#a855f7', unlockWave: 10 },
    3: { nameKey: 'turretTiers.T3.name', damageMult: 2.5, rangeMult: 1.2, fireRateMult: 1.4, cost: 50, color: '#f43f5e', unlockWave: 25 },
    4: { nameKey: 'turretTiers.T4.name', damageMult: 4.0, rangeMult: 1.3, fireRateMult: 1.6, cost: 150, color: '#fbbf24', unlockWave: 50 },
    5: { nameKey: 'turretTiers.T5.name', damageMult: 7.0, rangeMult: 1.5, fireRateMult: 2.0, cost: 500, color: '#22d3ee', unlockWave: 100 },
    6: { nameKey: 'turretTiers.T6.name', damageMult: 12.0, rangeMult: 1.8, fireRateMult: 2.5, cost: 2000, color: '#fff', unlockWave: 200 }
};

/**
 * School turret types (unlockable special turrets)
 */
export const SCHOOL_TURRETS = [
    { id: 'sentry', nameKey: 'school.sentry.name', descKey: 'school.sentry.desc', icon: '🛡️', unlockCost: 0, baseDamage: 10, baseRange: 150, baseFireRate: 500, color: '#60a5fa' },
    { id: 'blaster', nameKey: 'school.blaster.name', descKey: 'school.blaster.desc', icon: '🔥', unlockCost: 25, baseDamage: 25, baseRange: 120, baseFireRate: 800, color: '#ef4444' },
    { id: 'sniper', nameKey: 'school.sniper.name', descKey: 'school.sniper.desc', icon: '🎯', unlockCost: 50, baseDamage: 100, baseRange: 300, baseFireRate: 2000, color: '#22c55e' },
    { id: 'laser', nameKey: 'school.laser.name', descKey: 'school.laser.desc', icon: '⚡', unlockCost: 75, baseDamage: 5, baseRange: 200, baseFireRate: 50, color: '#fbbf24', beam: true },
    { id: 'rocket', nameKey: 'school.rocket.name', descKey: 'school.rocket.desc', icon: '🚀', unlockCost: 100, baseDamage: 50, baseRange: 175, baseFireRate: 1500, color: '#f97316', splash: 50 },
    { id: 'swamper', nameKey: 'school.swamper.name', descKey: 'school.swamper.desc', icon: '🧊', unlockCost: 150, baseDamage: 5, baseRange: 125, baseFireRate: 300, color: '#38bdf8', slow: 0.5 },
    { id: 'inferno', nameKey: 'school.inferno.name', descKey: 'school.inferno.desc', icon: '🔥', unlockCost: 200, baseDamage: 15, baseRange: 100, baseFireRate: 100, color: '#dc2626', dot: true },
    { id: 'solidifier', nameKey: 'school.solidifier.name', descKey: 'school.solidifier.desc', icon: '❄️', unlockCost: 250, baseDamage: 20, baseRange: 150, baseFireRate: 1000, color: '#06b6d4', freeze: 0.1 }
];

/**
 * Turret slot positions around the castle
 */
export const TURRET_SLOTS = [
    { id: 0, angle: -25, distance: 85, free: true },
    { id: 1, angle: 0, distance: 115, free: true },
    { id: 2, angle: 25, distance: 85, free: true },
    { id: 3, angle: -55, distance: 120, free: false, cost: 500 },
    { id: 4, angle: 55, distance: 120, free: false, cost: 1000 },
    { id: 5, angle: -115, distance: 115, free: false, cost: 2500 },
    { id: 6, angle: 115, distance: 115, free: false, cost: 5000 },
    { id: 7, angle: 180, distance: 125, free: false, cost: 10000 }
];

/**
 * Turret synergy combinations
 */
export const TURRET_SYNERGIES = [
    { id: 'fireCombo', turrets: ['blaster', 'inferno'], nameKey: 'synergy.fireCombo.name', descKey: 'synergy.fireCombo.desc', bonus: { damage: 0.25, aoe: 20 }, color: '#ef4444' },
    { id: 'frostCombo', turrets: ['solidifier', 'swamper'], nameKey: 'synergy.frostCombo.name', descKey: 'synergy.frostCombo.desc', bonus: { slow: 0.3, range: 0.15 }, color: '#38bdf8' },
    { id: 'precisionCombo', turrets: ['laser', 'sniper'], nameKey: 'synergy.precisionCombo.name', descKey: 'synergy.precisionCombo.desc', bonus: { critChance: 0.15, critDamage: 0.5 }, color: '#22c55e' },
    { id: 'artilleryCombo', turrets: ['rocket', 'swamper'], nameKey: 'synergy.artilleryCombo.name', descKey: 'synergy.artilleryCombo.desc', bonus: { aoe: 40, damage: 0.15 }, color: '#f97316' },
    { id: 'fullDefense', turrets: ['sentry', 'blaster', 'laser'], nameKey: 'synergy.fullDefense.name', descKey: 'synergy.fullDefense.desc', bonus: { fireRate: 0.2, damage: 0.1 }, color: '#a855f7' }
];

/**
 * Aura buff types for turret enhancement
 */
export const AURA_TYPES = [
    { id: 'damage_aura', nameKey: 'auras.damage.name', descKey: 'auras.damage.desc', icon: '⚔️', color: '#ef4444', effect: 'damage', baseValue: 0.1, range: 150, cost: 50 },
    { id: 'speed_aura', nameKey: 'auras.speed.name', descKey: 'auras.speed.desc', icon: '⚡', color: '#fbbf24', effect: 'fireRate', baseValue: 0.15, range: 150, cost: 75 },
    { id: 'range_aura', nameKey: 'auras.range.name', descKey: 'auras.range.desc', icon: '🎯', color: '#3b82f6', effect: 'range', baseValue: 0.2, range: 200, cost: 60 },
    { id: 'crit_aura', nameKey: 'auras.crit.name', descKey: 'auras.crit.desc', icon: '💥', color: '#a855f7', effect: 'crit', baseValue: 10, range: 100, cost: 100 },
    { id: 'regen_aura', nameKey: 'auras.regen.name', descKey: 'auras.regen.desc', icon: '💚', color: '#22c55e', effect: 'regen', baseValue: 5, range: 250, cost: 150 }
];

/**
 * Chip/Module types for turret customization
 */
export const CHIP_TYPES = [
    { id: 'chip_dmg', nameKey: 'chips.damage.name', descKey: 'chips.damage.desc', icon: '🔴', rarity: 1, effect: { damage: 0.15 } },
    { id: 'chip_speed', nameKey: 'chips.speed.name', descKey: 'chips.speed.desc', icon: '🟡', rarity: 1, effect: { fireRate: 0.1 } },
    { id: 'chip_range', nameKey: 'chips.range.name', descKey: 'chips.range.desc', icon: '🔵', rarity: 1, effect: { range: 0.2 } },
    { id: 'chip_crit', nameKey: 'chips.crit.name', descKey: 'chips.crit.desc', icon: '🟣', rarity: 2, effect: { critChance: 5, critDamage: 0.25 } },
    { id: 'chip_pierce', nameKey: 'chips.pierce.name', descKey: 'chips.pierce.desc', icon: '🟠', rarity: 2, effect: { pierce: 1 } },
    { id: 'chip_splash', nameKey: 'chips.splash.name', descKey: 'chips.splash.desc', icon: '🟤', rarity: 2, effect: { splash: 30 } },
    { id: 'chip_vampiric', nameKey: 'chips.vampiric.name', descKey: 'chips.vampiric.desc', icon: '🩸', rarity: 3, effect: { leech: 0.05 } },
    { id: 'chip_chaos', nameKey: 'chips.chaos.name', descKey: 'chips.chaos.desc', icon: '💀', rarity: 3, effect: { damage: 0.3, fireRate: -0.1 } },
    { id: 'chip_void', nameKey: 'chips.void.name', descKey: 'chips.void.desc', icon: '🌀', rarity: 4, effect: { damage: 0.5, critChance: 10, pierce: 2 } }
];
