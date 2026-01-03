/*
 * Copyright 2025 Julien Bombled
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Turret tier definitions
 * Each tier multiplies base stats and changes appearance
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
 * Turret slot system - positions around the castle
 * Each slot can hold a turret from the School system
 * Angles spread evenly to avoid overlap
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
 * School - Turret unlock and upgrade system
 */
export const SCHOOL_TURRETS = [
    { id: 'sentry', nameKey: 'school.sentry.name', descKey: 'school.sentry.desc', icon: '🔫', unlockCost: 0, maxLevel: 10, levelCost: 5, stats: { damage: 1.0, speed: 1.0, range: 1.0 } },
    { id: 'blaster', nameKey: 'school.blaster.name', descKey: 'school.blaster.desc', icon: '🧨', unlockCost: 50, maxLevel: 10, levelCost: 10, stats: { damage: 1.5, speed: 1.2, range: 0.8 } },
    { id: 'laser', nameKey: 'school.laser.name', descKey: 'school.laser.desc', icon: '📡', unlockCost: 200, maxLevel: 15, levelCost: 25, stats: { damage: 2.0, speed: 2.0, range: 1.0 } },
    { id: 'solidifier', nameKey: 'school.solidifier.name', descKey: 'school.solidifier.desc', icon: '❄️', unlockCost: 300, maxLevel: 10, levelCost: 20, stats: { damage: 0.5, speed: 0.8, range: 1.2, slow: 0.5 } },
    { id: 'swamper', nameKey: 'school.swamper.name', descKey: 'school.swamper.desc', icon: '💧', unlockCost: 500, maxLevel: 15, levelCost: 40, stats: { damage: 0.8, speed: 0.5, range: 2.0, aoe: 100 } },
    { id: 'rocket', nameKey: 'school.rocket.name', descKey: 'school.rocket.desc', icon: '🚀', unlockCost: 1000, maxLevel: 10, levelCost: 75, stats: { damage: 3.0, speed: 0.3, range: 1.5, aoe: 60 } },
    { id: 'sniper', nameKey: 'school.sniper.name', descKey: 'school.sniper.desc', icon: '🔭', unlockCost: 1500, maxLevel: 10, levelCost: 100, stats: { damage: 5.0, speed: 0.2, range: 3.0 } },
    { id: 'inferno', nameKey: 'school.inferno.name', descKey: 'school.inferno.desc', icon: '🌋', unlockCost: 5000, maxLevel: 20, levelCost: 200, stats: { damage: 4.0, speed: 1.0, range: 1.0, aoe: 80, dot: true } }
];

/**
 * Turret synergies - Bonuses when specific turrets are placed together
 */
export const TURRET_SYNERGIES = [
    { id: 'fire_combo', nameKey: 'synergy.fireCombo.name', descKey: 'synergy.fireCombo.desc', requires: ['blaster', 'inferno'], bonus: { damage: 0.25, aoe: 20 }, color: '#f97316' },
    { id: 'frost_combo', nameKey: 'synergy.frostCombo.name', descKey: 'synergy.frostCombo.desc', requires: ['solidifier', 'swamper'], bonus: { slow: 0.3, range: 0.15 }, color: '#22d3ee' },
    { id: 'precision_combo', nameKey: 'synergy.precisionCombo.name', descKey: 'synergy.precisionCombo.desc', requires: ['laser', 'sniper'], bonus: { critChance: 15, critDamage: 0.5 }, color: '#ef4444' },
    { id: 'artillery_combo', nameKey: 'synergy.artilleryCombo.name', descKey: 'synergy.artilleryCombo.desc', requires: ['rocket', 'swamper'], bonus: { aoe: 40, damage: 0.15 }, color: '#a855f7' },
    { id: 'full_defense', nameKey: 'synergy.fullDefense.name', descKey: 'synergy.fullDefense.desc', requires: ['sentry', 'blaster', 'laser'], bonus: { fireRate: 0.2, damage: 0.1 }, color: '#3b82f6' },
    { id: 'elemental_master', nameKey: 'synergy.elementalMaster.name', descKey: 'synergy.elementalMaster.desc', requires: ['solidifier', 'inferno', 'swamper'], bonus: { damage: 0.3, slow: 0.2, aoe: 30 }, color: '#fbbf24' },
    { id: 'tech_supremacy', nameKey: 'synergy.techSupremacy.name', descKey: 'synergy.techSupremacy.desc', requires: ['laser', 'rocket', 'sniper'], bonus: { damage: 0.4, critChance: 20, range: 0.2 }, color: '#22c55e' },
    { id: 'chaos_engine', nameKey: 'synergy.chaosEngine.name', descKey: 'synergy.chaosEngine.desc', requires: ['inferno', 'rocket', 'blaster'], bonus: { aoe: 60, damage: 0.35, fireRate: 0.15 }, color: '#dc2626' }
];

/**
 * Tower Modules - Mix and match components for turrets
 */
export const TOWER_MODULES = {
    barrels: [
        { id: 'standard_barrel', nameKey: 'modules.standardBarrel.name', icon: '🔫', tier: 1, effect: { damage: 1.0, fireRate: 1.0 }, cost: 0 },
        { id: 'heavy_barrel', nameKey: 'modules.heavyBarrel.name', icon: '💪', tier: 2, effect: { damage: 1.5, fireRate: 0.7 }, cost: 500, unlockWave: 20 },
        { id: 'rapid_barrel', nameKey: 'modules.rapidBarrel.name', icon: '⚡', tier: 2, effect: { damage: 0.7, fireRate: 1.8 }, cost: 500, unlockWave: 20 },
        { id: 'sniper_barrel', nameKey: 'modules.sniperBarrel.name', icon: '🎯', tier: 3, effect: { damage: 2.0, range: 1.5, fireRate: 0.5 }, cost: 1200, unlockWave: 40 },
        { id: 'scatter_barrel', nameKey: 'modules.scatterBarrel.name', icon: '💥', tier: 3, effect: { projectiles: 3, damage: 0.5 }, cost: 1500, unlockWave: 50 },
        { id: 'void_barrel', nameKey: 'modules.voidBarrel.name', icon: '🔮', tier: 4, effect: { damage: 2.5, pierce: 3, voidDamage: true }, cost: 3000, unlockWave: 80 }
    ],
    cores: [
        { id: 'basic_core', nameKey: 'modules.basicCore.name', icon: '⚙️', tier: 1, effect: {}, cost: 0 },
        { id: 'power_core', nameKey: 'modules.powerCore.name', icon: '🔋', tier: 2, effect: { damage: 0.25 }, cost: 400, unlockWave: 15 },
        { id: 'speed_core', nameKey: 'modules.speedCore.name', icon: '⏩', tier: 2, effect: { fireRate: 0.3 }, cost: 400, unlockWave: 15 },
        { id: 'crit_core', nameKey: 'modules.critCore.name', icon: '💎', tier: 3, effect: { critChance: 0.1, critDamage: 0.5 }, cost: 1000, unlockWave: 35 },
        { id: 'elemental_core', nameKey: 'modules.elementalCore.name', icon: '🌈', tier: 3, effect: { elementalDamage: 0.3, statusChance: 0.2 }, cost: 1200, unlockWave: 45 },
        { id: 'cosmic_core', nameKey: 'modules.cosmicCore.name', icon: '🌟', tier: 4, effect: { allStats: 0.2, skillBoost: 0.15 }, cost: 2500, unlockWave: 70 }
    ],
    bases: [
        { id: 'fixed_base', nameKey: 'modules.fixedBase.name', icon: '🏗️', tier: 1, effect: {}, cost: 0 },
        { id: 'rotating_base', nameKey: 'modules.rotatingBase.name', icon: '🔄', tier: 2, effect: { rotationSpeed: 2.0 }, cost: 300, unlockWave: 10 },
        { id: 'elevated_base', nameKey: 'modules.elevatedBase.name', icon: '📡', tier: 2, effect: { range: 0.2 }, cost: 350, unlockWave: 12 },
        { id: 'armored_base', nameKey: 'modules.armoredBase.name', icon: '🛡️', tier: 3, effect: { turretHp: 0.5, turretArmor: 0.3 }, cost: 800, unlockWave: 30 },
        { id: 'mobile_base', nameKey: 'modules.mobileBase.name', icon: '🚗', tier: 3, effect: { canMove: true, moveSpeed: 50 }, cost: 1500, unlockWave: 55 },
        { id: 'phasing_base', nameKey: 'modules.phasingBase.name', icon: '👻', tier: 4, effect: { phaseShift: true, phaseInterval: 5000 }, cost: 2000, unlockWave: 75 }
    ],
    ammo: [
        { id: 'standard_ammo', nameKey: 'modules.standardAmmo.name', icon: '🔹', tier: 1, effect: {}, cost: 0 },
        { id: 'incendiary_ammo', nameKey: 'modules.incendiaryAmmo.name', icon: '🔥', tier: 2, effect: { burnDamage: 5, burnDuration: 3000 }, cost: 300, unlockWave: 18 },
        { id: 'cryo_ammo', nameKey: 'modules.cryoAmmo.name', icon: '❄️', tier: 2, effect: { slow: 0.3, slowDuration: 2000 }, cost: 300, unlockWave: 18 },
        { id: 'shock_ammo', nameKey: 'modules.shockAmmo.name', icon: '⚡', tier: 3, effect: { chainCount: 2, chainDamage: 0.4 }, cost: 700, unlockWave: 38 },
        { id: 'explosive_ammo', nameKey: 'modules.explosiveAmmo.name', icon: '💣', tier: 3, effect: { aoeRadius: 40, aoeDamage: 0.4 }, cost: 800, unlockWave: 42 },
        { id: 'void_ammo', nameKey: 'modules.voidAmmo.name', icon: '🌀', tier: 4, effect: { voidMark: true, voidDamageBonus: 0.5 }, cost: 1800, unlockWave: 65 }
    ]
};

/**
 * Module synergies - Bonus for combining specific modules
 */
export const MODULE_SYNERGIES = [
    { id: 'fire_storm', modules: ['rapid_barrel', 'incendiary_ammo'], bonus: { burnDamage: 0.5, fireRate: 0.1 }, nameKey: 'synergies.fireStorm.name' },
    { id: 'frozen_fortress', modules: ['armored_base', 'cryo_ammo'], bonus: { slow: 0.2, turretHp: 0.2 }, nameKey: 'synergies.frozenFortress.name' },
    { id: 'death_ray', modules: ['sniper_barrel', 'crit_core'], bonus: { critDamage: 1.0, range: 0.2 }, nameKey: 'synergies.deathRay.name' },
    { id: 'void_storm', modules: ['void_barrel', 'void_ammo', 'cosmic_core'], bonus: { voidDamage: 0.5, pierce: 2 }, nameKey: 'synergies.voidStorm.name' },
    { id: 'artillery', modules: ['heavy_barrel', 'explosive_ammo'], bonus: { aoeDamage: 0.3, aoeRadius: 20 }, nameKey: 'synergies.artillery.name' },
    { id: 'chain_master', modules: ['scatter_barrel', 'shock_ammo'], bonus: { chainCount: 2, chainDamage: 0.2 }, nameKey: 'synergies.chainMaster.name' }
];
