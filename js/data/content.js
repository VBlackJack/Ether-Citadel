/*
 * Copyright 2025 Julien Bombled
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Challenge definitions
 * @type {Array<{id: string, nameKey: string, descKey: string, diff: number}>}
 */
export const CHALLENGES = [
    { id: 'noregen', nameKey: 'challenges.noregen.name', descKey: 'challenges.noregen.desc', diff: 2 },
    { id: 'speed', nameKey: 'challenges.speed.name', descKey: 'challenges.speed.desc', diff: 3 },
    { id: 'glass', nameKey: 'challenges.glass.name', descKey: 'challenges.glass.desc', diff: 4 },
    { id: 'horde', nameKey: 'challenges.horde.name', descKey: 'challenges.horde.desc', diff: 5 }
];

/**
 * Campaign missions
 */
export const CAMPAIGN_MISSIONS = [
    { id: 'tutorial', chapter: 1, nameKey: 'campaign.tutorial.name', descKey: 'campaign.tutorial.desc', objective: { type: 'wave', target: 5 }, reward: { gold: 500, crystals: 5 }, stars: [] },
    { id: 'first_boss', chapter: 1, nameKey: 'campaign.firstBoss.name', descKey: 'campaign.firstBoss.desc', objective: { type: 'boss', target: 1 }, reward: { gold: 1000, crystals: 10 }, stars: [] },
    { id: 'speed_challenge', chapter: 1, nameKey: 'campaign.speedChallenge.name', descKey: 'campaign.speedChallenge.desc', objective: { type: 'wave', target: 10, timeLimit: 120 }, reward: { gold: 1500, ether: 5 }, stars: [] },
    { id: 'tank_buster', chapter: 2, nameKey: 'campaign.tankBuster.name', descKey: 'campaign.tankBuster.desc', objective: { type: 'kill', target: 20, enemyType: 'TANK' }, reward: { crystals: 25, relic: true }, stars: [] },
    { id: 'no_damage', chapter: 2, nameKey: 'campaign.noDamage.name', descKey: 'campaign.noDamage.desc', objective: { type: 'wave', target: 15, noDamage: true }, reward: { gold: 5000, ether: 15 }, stars: [] },
    { id: 'mega_boss', chapter: 2, nameKey: 'campaign.megaBoss.name', descKey: 'campaign.megaBoss.desc', objective: { type: 'boss', target: 1, bossType: 'MEGA_BOSS' }, reward: { crystals: 50, relic: true, tier: 3 }, stars: [] },
    { id: 'endless_50', chapter: 3, nameKey: 'campaign.endless50.name', descKey: 'campaign.endless50.desc', objective: { type: 'wave', target: 50 }, reward: { ether: 50, relic: true, tier: 3 }, stars: [] },
    { id: 'boss_rush_10', chapter: 3, nameKey: 'campaign.bossRush10.name', descKey: 'campaign.bossRush10.desc', objective: { type: 'boss', target: 10, mode: 'boss_rush' }, reward: { crystals: 100, relic: true, tier: 4 }, stars: [] },
    { id: 'dread_master', chapter: 3, nameKey: 'campaign.dreadMaster.name', descKey: 'campaign.dreadMaster.desc', objective: { type: 'wave', target: 25, dreadLevel: 5 }, reward: { ether: 100, relic: true, tier: 4 }, stars: [] },
    { id: 'ultimate', chapter: 4, nameKey: 'campaign.ultimate.name', descKey: 'campaign.ultimate.desc', objective: { type: 'wave', target: 100, dreadLevel: 10 }, reward: { crystals: 500, ether: 500, relic: true, tier: 4 }, stars: [] }
];

/**
 * Game modes
 */
export const GAME_MODES = [
    { id: 'standard', nameKey: 'modes.standard.name', descKey: 'modes.standard.desc', icon: '🎮', unlocked: true },
    { id: 'endless', nameKey: 'modes.endless.name', descKey: 'modes.endless.desc', icon: '♾️', unlocked: true, scaling: { hpMult: 1.05, speedMult: 1.02, goldMult: 1.03 } },
    { id: 'boss_rush', nameKey: 'modes.bossRush.name', descKey: 'modes.bossRush.desc', icon: '👑', unlocked: true, bossOnly: true, bossInterval: 1 },
    { id: 'survival', nameKey: 'modes.survival.name', descKey: 'modes.survival.desc', icon: '💀', unlockWave: 50, noRegen: true, oneLife: true },
    { id: 'speedrun', nameKey: 'modes.speedrun.name', descKey: 'modes.speedrun.desc', icon: '⏱️', unlockWave: 25, timerMode: true, targetWave: 100 }
];

/**
 * Dungeon mode room types
 */
export const DUNGEON_ROOMS = [
    { id: 'combat', nameKey: 'dungeon.combat.name', descKey: 'dungeon.combat.desc', icon: '⚔️', type: 'combat', waves: 3, rewardMult: 1.0 },
    { id: 'elite', nameKey: 'dungeon.elite.name', descKey: 'dungeon.elite.desc', icon: '💀', type: 'combat', waves: 1, eliteOnly: true, rewardMult: 2.0 },
    { id: 'boss', nameKey: 'dungeon.boss.name', descKey: 'dungeon.boss.desc', icon: '👑', type: 'boss', bossType: 'random', rewardMult: 3.0 },
    { id: 'treasure', nameKey: 'dungeon.treasure.name', descKey: 'dungeon.treasure.desc', icon: '💎', type: 'reward', rewards: { gold: 5000, crystals: 50, relicChance: 0.5 } },
    { id: 'shop', nameKey: 'dungeon.shop.name', descKey: 'dungeon.shop.desc', icon: '🏪', type: 'shop', items: 3, discount: 0.2 },
    { id: 'altar', nameKey: 'dungeon.altar.name', descKey: 'dungeon.altar.desc', icon: '⛩️', type: 'choice', options: ['buff', 'curse_reward', 'gamble'] },
    { id: 'rest', nameKey: 'dungeon.rest.name', descKey: 'dungeon.rest.desc', icon: '🏕️', type: 'heal', healPercent: 0.5, upgradeChoice: true },
    { id: 'mystery', nameKey: 'dungeon.mystery.name', descKey: 'dungeon.mystery.desc', icon: '❓', type: 'random', possibilities: ['treasure', 'combat', 'elite', 'trap'] }
];

/**
 * Dungeon configuration
 */
export const DUNGEON_CONFIG = {
    floors: 20,
    roomsPerFloor: 3,
    bossFloors: [5, 10, 15, 20],
    startingLives: 3,
    difficultyPerFloor: 0.1,
    rewardPerFloor: { ether: 10, crystals: 25 }
};

/**
 * Rift mode configuration
 */
export const RIFT_CONFIG = {
    duration: 180000, // 3 minutes
    waves: 10,
    rewardTokensBase: 10,
    rewardTokensPerWave: 5,
    difficultyScale: 1.5,
    leaderboardEnabled: true
};

/**
 * World/Planet Progression - Multiple themed worlds
 */
export const WORLDS = [
    {
        id: 'grasslands',
        nameKey: 'worlds.grasslands.name',
        descKey: 'worlds.grasslands.desc',
        icon: '🌿',
        tier: 1,
        unlockWave: 0,
        background: '#4ade80',
        enemyTypes: ['basic', 'runner', 'tank'],
        bossKey: 'GOBLIN_KING',
        rewards: { goldMult: 1.0, etherMult: 1.0 },
        waves: 50
    },
    {
        id: 'desert',
        nameKey: 'worlds.desert.name',
        descKey: 'worlds.desert.desc',
        icon: '🏜️',
        tier: 2,
        unlockWave: 50,
        background: '#fbbf24',
        enemyTypes: ['basic', 'runner', 'tank', 'healer'],
        bossKey: 'CRYSTAL_GIANT',
        rewards: { goldMult: 1.5, etherMult: 1.2 },
        waves: 50,
        modifiers: { enemyHp: 0.2, enemySpeed: 0.1 }
    },
    {
        id: 'volcanic',
        nameKey: 'worlds.volcanic.name',
        descKey: 'worlds.volcanic.desc',
        icon: '🌋',
        tier: 3,
        unlockWave: 100,
        background: '#ef4444',
        enemyTypes: ['basic', 'runner', 'tank', 'healer', 'splitter', 'shielder'],
        bossKey: 'INFERNO_DRAGON',
        rewards: { goldMult: 2.0, etherMult: 1.5 },
        waves: 50,
        modifiers: { enemyHp: 0.5, damage: 0.2 },
        hazards: ['lava_pools']
    },
    {
        id: 'frozen',
        nameKey: 'worlds.frozen.name',
        descKey: 'worlds.frozen.desc',
        icon: '❄️',
        tier: 4,
        unlockWave: 150,
        background: '#22d3ee',
        enemyTypes: ['basic', 'runner', 'tank', 'healer', 'splitter', 'shielder', 'teleporter'],
        bossKey: 'FROST_TITAN',
        rewards: { goldMult: 2.5, etherMult: 2.0 },
        waves: 50,
        modifiers: { enemyHp: 0.8, fireRate: -0.2 },
        hazards: ['ice_patches']
    },
    {
        id: 'shadow',
        nameKey: 'worlds.shadow.name',
        descKey: 'worlds.shadow.desc',
        icon: '🌑',
        tier: 5,
        unlockWave: 200,
        background: '#1e1b4b',
        enemyTypes: ['basic', 'runner', 'tank', 'healer', 'splitter', 'shielder', 'teleporter', 'ghost'],
        bossKey: 'VOID_EMPEROR',
        rewards: { goldMult: 3.0, etherMult: 2.5 },
        waves: 50,
        modifiers: { enemyHp: 1.0, range: -0.3 },
        hazards: ['shadow_zones']
    },
    {
        id: 'cosmic',
        nameKey: 'worlds.cosmic.name',
        descKey: 'worlds.cosmic.desc',
        icon: '🌌',
        tier: 6,
        unlockWave: 300,
        background: '#312e81',
        enemyTypes: ['all'],
        bossKey: 'ANCIENT_ONE',
        rewards: { goldMult: 5.0, etherMult: 4.0 },
        waves: 100,
        modifiers: { enemyHp: 2.0, enemySpeed: 0.5, damage: 0.5 },
        hazards: ['void_rifts', 'meteor_showers']
    }
];

/**
 * Landmarks - Unique map objects with special effects
 */
export const LANDMARKS = [
    {
        id: 'altar_of_power',
        nameKey: 'landmarks.altarOfPower.name',
        descKey: 'landmarks.altarOfPower.desc',
        icon: '⛩️',
        tier: 1,
        effect: { type: 'buff', stat: 'damage', value: 0.2, range: 150 },
        cost: { crystals: 100 },
        unlockWave: 10
    },
    {
        id: 'healing_spring',
        nameKey: 'landmarks.healingSpring.name',
        descKey: 'landmarks.healingSpring.desc',
        icon: '⛲',
        tier: 1,
        effect: { type: 'heal', value: 5, interval: 1000, range: 100 },
        cost: { crystals: 150 },
        unlockWave: 15
    },
    {
        id: 'gold_fountain',
        nameKey: 'landmarks.goldFountain.name',
        descKey: 'landmarks.goldFountain.desc',
        icon: '💰',
        tier: 2,
        effect: { type: 'passive', stat: 'goldPerSecond', value: 10 },
        cost: { crystals: 300 },
        unlockWave: 25
    },
    {
        id: 'storm_pillar',
        nameKey: 'landmarks.stormPillar.name',
        descKey: 'landmarks.stormPillar.desc',
        icon: '🌩️',
        tier: 2,
        effect: { type: 'damage', damage: 50, interval: 3000, range: 200, chain: 5 },
        cost: { crystals: 500 },
        unlockWave: 40
    },
    {
        id: 'crystal_obelisk',
        nameKey: 'landmarks.crystalObelisk.name',
        descKey: 'landmarks.crystalObelisk.desc',
        icon: '💎',
        tier: 3,
        effect: { type: 'buff', stat: 'critChance', value: 0.15, range: 200 },
        cost: { crystals: 800 },
        unlockWave: 60
    },
    {
        id: 'frost_shrine',
        nameKey: 'landmarks.frostShrine.name',
        descKey: 'landmarks.frostShrine.desc',
        icon: '🧊',
        tier: 3,
        effect: { type: 'slow', value: 0.3, range: 250 },
        cost: { crystals: 700 },
        unlockWave: 55
    },
    {
        id: 'fire_beacon',
        nameKey: 'landmarks.fireBeacon.name',
        descKey: 'landmarks.fireBeacon.desc',
        icon: '🔥',
        tier: 3,
        effect: { type: 'dot', damage: 10, duration: 3000, range: 180 },
        cost: { crystals: 750 },
        unlockWave: 50
    },
    {
        id: 'void_monolith',
        nameKey: 'landmarks.voidMonolith.name',
        descKey: 'landmarks.voidMonolith.desc',
        icon: '🗿',
        tier: 4,
        effect: { type: 'debuff', stat: 'enemyArmor', value: -0.3, range: 300 },
        cost: { crystals: 1200 },
        unlockWave: 80
    },
    {
        id: 'ancient_tree',
        nameKey: 'landmarks.ancientTree.name',
        descKey: 'landmarks.ancientTree.desc',
        icon: '🌳',
        tier: 4,
        effect: { type: 'multi', effects: [
            { type: 'heal', value: 10, interval: 2000 },
            { type: 'buff', stat: 'regen', value: 0.5 }
        ], range: 250 },
        cost: { crystals: 1500 },
        unlockWave: 100
    },
    {
        id: 'celestial_gate',
        nameKey: 'landmarks.celestialGate.name',
        descKey: 'landmarks.celestialGate.desc',
        icon: '🌟',
        tier: 5,
        effect: { type: 'buff', stat: 'allStats', value: 0.15, range: 400 },
        cost: { crystals: 3000 },
        unlockWave: 150
    }
];

/**
 * Roguelike wave modifiers
 */
export const WAVE_MODIFIERS = [
    // Enemy modifiers
    { id: 'armored_horde', nameKey: 'modifiers.armoredHorde.name', descKey: 'modifiers.armoredHorde.desc', icon: '🛡️', type: 'enemy', effect: { enemyArmor: 0.3, enemyHp: 0.2 }, rewardMult: 1.3 },
    { id: 'speed_demons', nameKey: 'modifiers.speedDemons.name', descKey: 'modifiers.speedDemons.desc', icon: '💨', type: 'enemy', effect: { enemySpeed: 0.5 }, rewardMult: 1.25 },
    { id: 'titan_wave', nameKey: 'modifiers.titanWave.name', descKey: 'modifiers.titanWave.desc', icon: '🗿', type: 'enemy', effect: { enemyHp: 1.0, enemySize: 0.5, enemyCount: -0.5 }, rewardMult: 1.4 },
    { id: 'swarm', nameKey: 'modifiers.swarm.name', descKey: 'modifiers.swarm.desc', icon: '🐜', type: 'enemy', effect: { enemyCount: 2.0, enemyHp: -0.5, enemySize: -0.3 }, rewardMult: 1.2 },
    { id: 'regenerators', nameKey: 'modifiers.regenerators.name', descKey: 'modifiers.regenerators.desc', icon: '💚', type: 'enemy', effect: { enemyRegen: 0.02 }, rewardMult: 1.35 },
    { id: 'vampiric', nameKey: 'modifiers.vampiric.name', descKey: 'modifiers.vampiric.desc', icon: '🧛', type: 'enemy', effect: { enemyLeech: 0.1 }, rewardMult: 1.3 },
    // Reward modifiers
    { id: 'gold_rush', nameKey: 'modifiers.goldRush.name', descKey: 'modifiers.goldRush.desc', icon: '💰', type: 'reward', effect: { goldMult: 2.0 }, difficultyMult: 1.0 },
    { id: 'crystal_shower', nameKey: 'modifiers.crystalShower.name', descKey: 'modifiers.crystalShower.desc', icon: '💎', type: 'reward', effect: { crystalMult: 3.0 }, difficultyMult: 1.0 },
    { id: 'ether_flow', nameKey: 'modifiers.etherFlow.name', descKey: 'modifiers.etherFlow.desc', icon: '🔮', type: 'reward', effect: { etherMult: 1.5 }, difficultyMult: 1.0 },
    { id: 'treasure_trove', nameKey: 'modifiers.treasureTrove.name', descKey: 'modifiers.treasureTrove.desc', icon: '🎁', type: 'reward', effect: { relicChance: 0.5 }, difficultyMult: 1.0 },
    // Player modifiers
    { id: 'glass_cannon', nameKey: 'modifiers.glassCannon.name', descKey: 'modifiers.glassCannon.desc', icon: '🔫', type: 'player', effect: { damage: 1.0, health: -0.5 }, rewardMult: 1.5 },
    { id: 'tank_mode', nameKey: 'modifiers.tankMode.name', descKey: 'modifiers.tankMode.desc', icon: '🛡️', type: 'player', effect: { health: 1.0, damage: -0.3 }, rewardMult: 1.2 },
    { id: 'overcharge', nameKey: 'modifiers.overcharge.name', descKey: 'modifiers.overcharge.desc', icon: '⚡', type: 'player', effect: { fireRate: 0.5, skillCooldown: -0.3 }, rewardMult: 1.1 },
    { id: 'limited_ammo', nameKey: 'modifiers.limitedAmmo.name', descKey: 'modifiers.limitedAmmo.desc', icon: '🎯', type: 'player', effect: { limitedShots: 100 }, rewardMult: 1.6 }
];

/**
 * World hazards
 */
export const WORLD_HAZARDS = {
    lava_pools: { nameKey: 'hazards.lavaPools.name', damage: 10, interval: 1000, visual: '🔥' },
    ice_patches: { nameKey: 'hazards.icePatches.name', slow: 0.5, slipChance: 0.3, visual: '❄️' },
    shadow_zones: { nameKey: 'hazards.shadowZones.name', missChance: 0.3, visual: '🌑' },
    void_rifts: { nameKey: 'hazards.voidRifts.name', teleportChance: 0.2, damage: 50, visual: '🌀' },
    meteor_showers: { nameKey: 'hazards.meteorShowers.name', damage: 100, aoe: 80, interval: 10000, visual: '☄️' }
};

/**
 * Mazing System - Wall types for path manipulation
 */
export const WALL_TYPES = [
    { id: 'wooden_wall', nameKey: 'mazing.woodenWall.name', descKey: 'mazing.woodenWall.desc', icon: '🪵', tier: 1, hp: 100, cost: 50, slowMult: 0.8 },
    { id: 'stone_wall', nameKey: 'mazing.stoneWall.name', descKey: 'mazing.stoneWall.desc', icon: '🧱', tier: 2, hp: 300, cost: 150, slowMult: 0.6, unlockWave: 15 },
    { id: 'iron_wall', nameKey: 'mazing.ironWall.name', descKey: 'mazing.ironWall.desc', icon: '🔩', tier: 3, hp: 600, cost: 400, slowMult: 0.4, unlockWave: 30 },
    { id: 'crystal_wall', nameKey: 'mazing.crystalWall.name', descKey: 'mazing.crystalWall.desc', icon: '💎', tier: 4, hp: 1000, cost: 1000, slowMult: 0.2, effect: { damage: 5 }, unlockWave: 50 },
    { id: 'void_barrier', nameKey: 'mazing.voidBarrier.name', descKey: 'mazing.voidBarrier.desc', icon: '🔮', tier: 5, hp: 2000, cost: 2500, slowMult: 0, effect: { stun: 0.5 }, unlockWave: 80 }
];

/**
 * Mazing traps for path
 */
export const TRAP_TYPES = [
    { id: 'spike_trap', nameKey: 'mazing.spikeTrap.name', descKey: 'mazing.spikeTrap.desc', icon: '🗡️', damage: 10, cooldown: 2000, cost: 100 },
    { id: 'poison_trap', nameKey: 'mazing.poisonTrap.name', descKey: 'mazing.poisonTrap.desc', icon: '☠️', damage: 5, dot: { damage: 2, duration: 5000 }, cooldown: 3000, cost: 200 },
    { id: 'freeze_trap', nameKey: 'mazing.freezeTrap.name', descKey: 'mazing.freezeTrap.desc', icon: '❄️', slow: 0.5, duration: 3000, cooldown: 5000, cost: 300 },
    { id: 'fire_trap', nameKey: 'mazing.fireTrap.name', descKey: 'mazing.fireTrap.desc', icon: '🔥', damage: 25, aoe: 50, cooldown: 4000, cost: 400 },
    { id: 'lightning_trap', nameKey: 'mazing.lightningTrap.name', descKey: 'mazing.lightningTrap.desc', icon: '⚡', damage: 50, chain: 3, cooldown: 6000, cost: 600 },
    { id: 'void_trap', nameKey: 'mazing.voidTrap.name', descKey: 'mazing.voidTrap.desc', icon: '🌀', damage: 100, pull: true, cooldown: 8000, cost: 1000 }
];
