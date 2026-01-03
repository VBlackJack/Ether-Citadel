/*
 * Copyright 2025 Julien Bombled
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Enemy type definitions
 * @type {Object<string, {color: string, hpMult: number, speedMult: number, scale: number, nameKey: string, descKey: string}>}
 */
export const ENEMY_TYPES = {
    NORMAL: { color: '#d94949', hpMult: 1, speedMult: 1, scale: 1, goldMult: 1.0, xpMult: 1.0, nameKey: 'enemies.NORMAL.name', descKey: 'enemies.NORMAL.desc' },
    SPEEDY: { color: '#fbbf24', hpMult: 0.6, speedMult: 1.8, scale: 0.8, goldMult: 1.2, xpMult: 1.0, nameKey: 'enemies.SPEEDY.name', descKey: 'enemies.SPEEDY.desc' },
    TANK: { color: '#64748b', hpMult: 4.0, speedMult: 0.6, scale: 1.5, goldMult: 1.5, xpMult: 1.5, nameKey: 'enemies.TANK.name', descKey: 'enemies.TANK.desc' },
    BOSS: { color: '#ef4444', hpMult: 25, speedMult: 0.4, scale: 2.8, goldMult: 5.0, xpMult: 10.0, isBoss: true, nameKey: 'enemies.BOSS.name', descKey: 'enemies.BOSS.desc' },
    HEALER: { color: '#4ade80', hpMult: 1.5, speedMult: 0.7, scale: 1.1, goldMult: 1.3, xpMult: 1.2, abilities: ['heal_allies'], nameKey: 'enemies.HEALER.name', descKey: 'enemies.HEALER.desc' },
    SPLITTER: { color: '#a855f7', hpMult: 1.2, speedMult: 0.8, scale: 1.3, goldMult: 1.5, xpMult: 1.5, abilities: ['split_on_death'], nameKey: 'enemies.SPLITTER.name', descKey: 'enemies.SPLITTER.desc' },
    MINI: { color: '#d8b4fe', hpMult: 0.4, speedMult: 1.2, scale: 0.6, goldMult: 0.5, xpMult: 0.5, nameKey: 'enemies.MINI.name', descKey: 'enemies.MINI.desc' },
    THIEF: { color: '#94a3b8', hpMult: 0.8, speedMult: 2.5, scale: 0.9, goldMult: 2.0, xpMult: 1.0, abilities: ['steal_gold'], nameKey: 'enemies.THIEF.name', descKey: 'enemies.THIEF.desc' },
    PHANTOM: { color: '#ffffff', hpMult: 0.8, speedMult: 1.0, scale: 1.0, goldMult: 1.5, xpMult: 1.2, abilities: ['phase_through'], nameKey: 'enemies.PHANTOM.name', descKey: 'enemies.PHANTOM.desc' },
    FLYING: { color: '#38bdf8', hpMult: 0.7, speedMult: 1.4, scale: 0.9, goldMult: 1.3, xpMult: 1.0, flying: true, nameKey: 'enemies.FLYING.name', descKey: 'enemies.FLYING.desc' },
    ARMORED: { color: '#78716c', hpMult: 5.0, speedMult: 0.5, scale: 1.6, goldMult: 2.0, xpMult: 2.0, armor: 0.5, nameKey: 'enemies.ARMORED.name', descKey: 'enemies.ARMORED.desc' },
    SHIELDED: { color: '#06b6d4', hpMult: 1.0, speedMult: 0.9, scale: 1.2, goldMult: 1.5, xpMult: 1.3, shield: true, nameKey: 'enemies.SHIELDED.name', descKey: 'enemies.SHIELDED.desc' },
    NECRO: { color: '#581c87', hpMult: 2.0, speedMult: 0.6, scale: 1.3, goldMult: 2.0, xpMult: 2.0, abilities: ['summon_minions'], nameKey: 'enemies.NECRO.name', descKey: 'enemies.NECRO.desc' },
    BERSERKER: { color: '#dc2626', hpMult: 1.8, speedMult: 1.0, scale: 1.2, goldMult: 1.5, xpMult: 1.5, abilities: ['enrage_on_damage'], nameKey: 'enemies.BERSERKER.name', descKey: 'enemies.BERSERKER.desc' },
    MEGA_BOSS: { color: '#7c3aed', hpMult: 100, speedMult: 0.3, scale: 4.0, goldMult: 20.0, xpMult: 50.0, isBoss: true, phases: 3, nameKey: 'enemies.MEGA_BOSS.name', descKey: 'enemies.MEGA_BOSS.desc' }
};

/**
 * Boss phases and special mechanics
 */
export const BOSS_MECHANICS = {
    MEGA_BOSS: {
        phases: [
            { hpThreshold: 1.0, nameKey: 'boss.phase1', color: '#7c3aed', abilities: ['summon_minions'] },
            { hpThreshold: 0.66, nameKey: 'boss.phase2', color: '#dc2626', abilities: ['enrage', 'shield_burst'] },
            { hpThreshold: 0.33, nameKey: 'boss.phase3', color: '#000', abilities: ['enrage', 'death_spiral', 'heal'] }
        ],
        loot: { guaranteed: true, tier: 3, bonusGold: 5 }
    },
    RAID_BOSS: {
        phases: [
            { hpThreshold: 1.0, nameKey: 'boss.phase1', color: '#f59e0b', abilities: [] },
            { hpThreshold: 0.75, nameKey: 'boss.phase2', color: '#ef4444', abilities: ['barrier'] },
            { hpThreshold: 0.5, nameKey: 'boss.phase3', color: '#dc2626', abilities: ['barrier', 'summon_elites'] },
            { hpThreshold: 0.25, nameKey: 'boss.phase4', color: '#7f1d1d', abilities: ['enrage', 'barrier', 'meteor_storm'] }
        ],
        loot: { guaranteed: true, tier: 4, bonusGold: 10 }
    }
};

export const BOSS_ABILITIES = {
    summon_minions: { nameKey: 'bossAbility.summonMinions', cooldown: 10, count: 5, type: 'MINI' },
    summon_elites: { nameKey: 'bossAbility.summonElites', cooldown: 15, count: 2, type: 'TANK' },
    enrage: { nameKey: 'bossAbility.enrage', damageMult: 1.5, speedMult: 1.3 },
    shield_burst: { nameKey: 'bossAbility.shieldBurst', shieldAmount: 0.2, duration: 5 },
    barrier: { nameKey: 'bossAbility.barrier', immuneDuration: 3, cooldown: 12 },
    death_spiral: { nameKey: 'bossAbility.deathSpiral', damage: 50, radius: 200 },
    heal: { nameKey: 'bossAbility.heal', amount: 0.1, cooldown: 8 },
    meteor_storm: { nameKey: 'bossAbility.meteorStorm', count: 5, damage: 100, radius: 80 }
};

/**
 * Unique boss encounters with distinct mechanics
 */
export const UNIQUE_BOSSES = {
    GOBLIN_KING: {
        wave: 10,
        nameKey: 'bosses.goblinKing.name',
        descKey: 'bosses.goblinKing.desc',
        color: '#22c55e',
        hpMult: 30,
        speedMult: 0.5,
        scale: 2.5,
        goldMult: 8,
        icon: '👺',
        phases: [
            { hpThreshold: 1.0, abilities: ['spin_attack'], color: '#22c55e' },
            { hpThreshold: 0.5, abilities: ['spin_attack', 'summon_goblins'], color: '#16a34a' }
        ],
        abilities: {
            spin_attack: { damage: 25, radius: 150, cooldown: 5000, duration: 2000 },
            summon_goblins: { count: 8, type: 'MINI', cooldown: 8000 }
        },
        loot: { ether: 15, crystals: 20, relicChance: 0.5 }
    },
    CRYSTAL_GIANT: {
        wave: 20,
        nameKey: 'bosses.crystalGiant.name',
        descKey: 'bosses.crystalGiant.desc',
        color: '#22d3ee',
        hpMult: 50,
        speedMult: 0.35,
        scale: 3.2,
        goldMult: 12,
        icon: '💎',
        phases: [
            { hpThreshold: 1.0, abilities: ['crystal_shield'], color: '#22d3ee' },
            { hpThreshold: 0.66, abilities: ['crystal_shield', 'shard_burst'], color: '#06b6d4' },
            { hpThreshold: 0.33, abilities: ['crystal_shield', 'shard_burst', 'crystal_prison'], color: '#0891b2' }
        ],
        abilities: {
            crystal_shield: { immuneDuration: 3000, cooldown: 12000 },
            shard_burst: { damage: 40, count: 8, radius: 200, cooldown: 7000 },
            crystal_prison: { slowAmount: 0.8, duration: 4000, cooldown: 15000 }
        },
        loot: { ether: 35, crystals: 50, relicChance: 0.7, relicTier: 2 }
    },
    INFERNO_DRAGON: {
        wave: 50,
        nameKey: 'bosses.infernoDragon.name',
        descKey: 'bosses.infernoDragon.desc',
        color: '#ef4444',
        hpMult: 120,
        speedMult: 0.4,
        scale: 4.0,
        goldMult: 25,
        icon: '🐉',
        phases: [
            { hpThreshold: 1.0, abilities: ['fire_breath'], color: '#ef4444' },
            { hpThreshold: 0.75, abilities: ['fire_breath', 'wing_gust'], color: '#dc2626' },
            { hpThreshold: 0.5, abilities: ['fire_breath', 'wing_gust', 'summon_drakes'], color: '#b91c1c' },
            { hpThreshold: 0.25, abilities: ['fire_breath', 'meteor_rain', 'enrage'], color: '#7f1d1d' }
        ],
        abilities: {
            fire_breath: { damage: 60, coneAngle: 60, range: 250, cooldown: 4000, burnDuration: 3000 },
            wing_gust: { pushForce: 200, radius: 300, cooldown: 10000 },
            summon_drakes: { count: 3, type: 'FLYING', cooldown: 15000 },
            meteor_rain: { count: 6, damage: 80, radius: 100, cooldown: 12000 },
            enrage: { damageMult: 1.5, speedMult: 1.3 }
        },
        loot: { ether: 100, crystals: 150, relicChance: 1.0, relicTier: 3 }
    },
    VOID_EMPEROR: {
        wave: 100,
        nameKey: 'bosses.voidEmperor.name',
        descKey: 'bosses.voidEmperor.desc',
        color: '#a855f7',
        hpMult: 300,
        speedMult: 0.3,
        scale: 4.5,
        goldMult: 50,
        icon: '👁️',
        phases: [
            { hpThreshold: 1.0, abilities: ['void_orbs'], color: '#a855f7' },
            { hpThreshold: 0.8, abilities: ['void_orbs', 'dimensional_rift'], color: '#9333ea' },
            { hpThreshold: 0.6, abilities: ['void_orbs', 'dimensional_rift', 'mind_control'], color: '#7c3aed' },
            { hpThreshold: 0.4, abilities: ['void_orbs', 'dimensional_rift', 'void_explosion'], color: '#6d28d9' },
            { hpThreshold: 0.2, abilities: ['void_orbs', 'dimensional_rift', 'void_explosion', 'time_stop'], color: '#5b21b6' }
        ],
        abilities: {
            void_orbs: { count: 5, damage: 50, speed: 3, cooldown: 3000 },
            dimensional_rift: { teleportCount: 3, summonType: 'PHANTOM', cooldown: 10000 },
            mind_control: { duration: 5000, cooldown: 20000, disableTurrets: 2 },
            void_explosion: { damage: 150, radius: 400, chargeTime: 2000, cooldown: 15000 },
            time_stop: { duration: 3000, cooldown: 30000 }
        },
        loot: { ether: 500, crystals: 300, ascensionPoints: 1, relicChance: 1.0, relicTier: 4 }
    },
    ANCIENT_ONE: {
        wave: 200,
        nameKey: 'bosses.ancientOne.name',
        descKey: 'bosses.ancientOne.desc',
        color: '#000000',
        hpMult: 1000,
        speedMult: 0.25,
        scale: 5.0,
        goldMult: 100,
        icon: '🌌',
        phases: [
            { hpThreshold: 1.0, abilities: ['cosmic_beam'], color: '#1e3a5f' },
            { hpThreshold: 0.75, abilities: ['cosmic_beam', 'gravity_well'], color: '#172554' },
            { hpThreshold: 0.5, abilities: ['cosmic_beam', 'gravity_well', 'star_collapse'], color: '#0c1e3a' },
            { hpThreshold: 0.25, abilities: ['cosmic_beam', 'gravity_well', 'star_collapse', 'reality_warp'], color: '#000000' }
        ],
        abilities: {
            cosmic_beam: { damage: 200, width: 50, length: 500, rotateSpeed: 30, cooldown: 5000 },
            gravity_well: { pullForce: 150, radius: 350, damage: 30, cooldown: 8000, duration: 4000 },
            star_collapse: { damage: 300, radius: 250, warningTime: 3000, cooldown: 20000 },
            reality_warp: { shuffleTurrets: true, invertControls: true, duration: 5000, cooldown: 45000 }
        },
        loot: { ether: 2000, crystals: 1000, ascensionPoints: 5, relicChance: 1.0, relicTier: 4 }
    }
};

/**
 * Enemy Affixes - Special modifiers that enemies can have
 */
export const ENEMY_AFFIXES = [
    // Offensive affixes
    { id: 'berserker', nameKey: 'affixes.berserker.name', descKey: 'affixes.berserker.desc', icon: '😡', tier: 1, effect: { damageMult: 1.5, speedMult: 1.2 }, rewardMult: 1.2 },
    { id: 'venomous', nameKey: 'affixes.venomous.name', descKey: 'affixes.venomous.desc', icon: '🐍', tier: 1, effect: { poisonOnHit: { damage: 5, duration: 3000 } }, rewardMult: 1.15 },
    { id: 'explosive', nameKey: 'affixes.explosive.name', descKey: 'affixes.explosive.desc', icon: '💣', tier: 2, effect: { deathExplosion: { damage: 50, range: 80 } }, rewardMult: 1.3 },
    { id: 'vampiric', nameKey: 'affixes.vampiric.name', descKey: 'affixes.vampiric.desc', icon: '🧛', tier: 2, effect: { lifesteal: 0.2 }, rewardMult: 1.25 },
    // Defensive affixes
    { id: 'armored', nameKey: 'affixes.armored.name', descKey: 'affixes.armored.desc', icon: '🛡️', tier: 1, effect: { armorMult: 2.0 }, rewardMult: 1.2 },
    { id: 'regenerating', nameKey: 'affixes.regenerating.name', descKey: 'affixes.regenerating.desc', icon: '💚', tier: 1, effect: { regenPercent: 0.02 }, rewardMult: 1.15 },
    { id: 'shielded', nameKey: 'affixes.shielded.name', descKey: 'affixes.shielded.desc', icon: '🔵', tier: 2, effect: { shieldPercent: 0.5 }, rewardMult: 1.3 },
    { id: 'ethereal', nameKey: 'affixes.ethereal.name', descKey: 'affixes.ethereal.desc', icon: '👻', tier: 3, effect: { evadeChance: 0.3 }, rewardMult: 1.4 },
    // Utility affixes
    { id: 'swift', nameKey: 'affixes.swift.name', descKey: 'affixes.swift.desc', icon: '💨', tier: 1, effect: { speedMult: 1.5 }, rewardMult: 1.1 },
    { id: 'teleporter', nameKey: 'affixes.teleporter.name', descKey: 'affixes.teleporter.desc', icon: '🌀', tier: 2, effect: { teleportChance: 0.1, teleportCooldown: 5000 }, rewardMult: 1.35 },
    { id: 'phasing', nameKey: 'affixes.phasing.name', descKey: 'affixes.phasing.desc', icon: '🌫️', tier: 2, effect: { phaseThrough: true, phaseDuration: 2000, phaseCooldown: 8000 }, rewardMult: 1.3 },
    // Turret-affecting affixes
    { id: 'jammer', nameKey: 'affixes.jammer.name', descKey: 'affixes.jammer.desc', icon: '📡', tier: 2, effect: { disableTurrets: { range: 100, duration: 2000 } }, rewardMult: 1.4 },
    { id: 'corrosive', nameKey: 'affixes.corrosive.name', descKey: 'affixes.corrosive.desc', icon: '🧪', tier: 2, effect: { turretDebuff: { stat: 'damage', value: -0.2, range: 120 } }, rewardMult: 1.35 },
    { id: 'magnetic', nameKey: 'affixes.magnetic.name', descKey: 'affixes.magnetic.desc', icon: '🧲', tier: 3, effect: { projectileDeflect: 0.3 }, rewardMult: 1.5 },
    { id: 'nullifier', nameKey: 'affixes.nullifier.name', descKey: 'affixes.nullifier.desc', icon: '⛔', tier: 3, effect: { immuneToSkills: true }, rewardMult: 1.6 },
    // Elite affixes
    { id: 'arcane', nameKey: 'affixes.arcane.name', descKey: 'affixes.arcane.desc', icon: '✨', tier: 3, effect: { spellCast: { type: 'fireball', damage: 30, interval: 4000 } }, rewardMult: 1.5 },
    { id: 'commander', nameKey: 'affixes.commander.name', descKey: 'affixes.commander.desc', icon: '👑', tier: 3, effect: { aura: { stat: 'damage', value: 0.2, range: 150 } }, rewardMult: 1.45 },
    { id: 'void_touched', nameKey: 'affixes.voidTouched.name', descKey: 'affixes.voidTouched.desc', icon: '🔮', tier: 4, effect: { voidPulse: { damage: 100, range: 200, interval: 8000 } }, rewardMult: 2.0 }
];
