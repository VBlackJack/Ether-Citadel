/*
 * Copyright 2025 Julien Bombled
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Prestige upgrade definitions for permanent bonuses
 */
export const PRESTIGE_UPGRADES = [
    { id: 'prestige_damage', nameKey: 'prestige.damage.name', descKey: 'prestige.damage.desc', icon: '🗡️', baseCost: 1, costMult: 1.7, maxLevel: 20, effect: (lvl) => 1 + lvl * 0.05 },
    { id: 'prestige_health', nameKey: 'prestige.health.name', descKey: 'prestige.health.desc', icon: '❤️', baseCost: 1, costMult: 1.7, maxLevel: 20, effect: (lvl) => 1 + lvl * 0.05 },
    { id: 'prestige_gold', nameKey: 'prestige.gold.name', descKey: 'prestige.gold.desc', icon: '🥇', baseCost: 2, costMult: 1.6, maxLevel: 20, effect: (lvl) => 1 + lvl * 0.08 },
    { id: 'prestige_crystals', nameKey: 'prestige.crystals.name', descKey: 'prestige.crystals.desc', icon: '💎', baseCost: 3, costMult: 1.8, maxLevel: 15, effect: (lvl) => 1 + lvl * 0.10 },
    { id: 'prestige_start_wave', nameKey: 'prestige.start_wave.name', descKey: 'prestige.start_wave.desc', icon: '⏩', baseCost: 5, costMult: 1.8, maxLevel: 10, effect: (lvl) => lvl * 5 },
    { id: 'prestige_auto_turrets', nameKey: 'prestige.auto_turrets.name', descKey: 'prestige.auto_turrets.desc', icon: '🤖', baseCost: 10, costMult: 4.0, maxLevel: 4, effect: (lvl) => lvl },
    { id: 'prestige_production', nameKey: 'prestige.production.name', descKey: 'prestige.production.desc', icon: '🏭', baseCost: 5, costMult: 2.0, maxLevel: 10, effect: (lvl) => 1 + lvl * 0.15 },
    { id: 'prestige_skill_cd', nameKey: 'prestige.skill_cd.name', descKey: 'prestige.skill_cd.desc', icon: '⏰', baseCost: 8, costMult: 2.5, maxLevel: 8, effect: (lvl) => 1 - lvl * 0.06 }
];

/**
 * Passive upgrades organized by category (Defender Idle 2 style)
 * Each passive has: id, category, nameKey, descKey, icon, baseCost, costMult, maxLevel, effect, unlockReq
 */
export const PASSIVES = {
    offense: [
        { id: 'damage', nameKey: 'passives.damage.name', descKey: 'passives.damage.desc', icon: '🗡️', baseCost: 1, costMult: 1.5, maxLevel: 40, effect: (lvl) => 1 + lvl * 0.05 },
        { id: 'critChance', nameKey: 'passives.critChance.name', descKey: 'passives.critChance.desc', icon: '🎲', baseCost: 2, costMult: 1.8, maxLevel: 50, effect: (lvl) => lvl * 0.02 },
        { id: 'critDamage', nameKey: 'passives.critDamage.name', descKey: 'passives.critDamage.desc', icon: '💥', baseCost: 3, costMult: 2.0, maxLevel: 40, effect: (lvl) => 1.5 + lvl * 0.1 },
        { id: 'splash', nameKey: 'passives.splash.name', descKey: 'passives.splash.desc', icon: '💫', baseCost: 2, costMult: 1.6, maxLevel: 30, effect: (lvl) => lvl * 5 },
        { id: 'armorIgnore', nameKey: 'passives.armorIgnore.name', descKey: 'passives.armorIgnore.desc', icon: '🔱', baseCost: 5, costMult: 2.2, maxLevel: 20, effect: (lvl) => lvl * 0.03, unlockReq: { passive: 'damage', level: 10 } },
        { id: 'firstStrike', nameKey: 'passives.firstStrike.name', descKey: 'passives.firstStrike.desc', icon: '⚡', baseCost: 10, costMult: 3.0, maxLevel: 10, effect: (lvl) => 1 + lvl * 0.25, unlockReq: { passive: 'critChance', level: 15 } }
    ],
    defense: [
        { id: 'health', nameKey: 'passives.health.name', descKey: 'passives.health.desc', icon: '❤️', baseCost: 1, costMult: 1.5, maxLevel: 40, effect: (lvl) => 1 + lvl * 0.05 },
        { id: 'armor', nameKey: 'passives.armor.name', descKey: 'passives.armor.desc', icon: '🛡️', baseCost: 2, costMult: 1.6, maxLevel: 50, effect: (lvl) => lvl * 0.01 },
        { id: 'barrier', nameKey: 'passives.barrier.name', descKey: 'passives.barrier.desc', icon: '🔮', baseCost: 3, costMult: 1.8, maxLevel: 20, effect: (lvl) => 1 + lvl * 0.1 },
        { id: 'regen', nameKey: 'passives.regen.name', descKey: 'passives.regen.desc', icon: '💚', baseCost: 4, costMult: 2.0, maxLevel: 25, effect: (lvl) => lvl * 0.5 },
        { id: 'block', nameKey: 'passives.block.name', descKey: 'passives.block.desc', icon: '🚫', baseCost: 5, costMult: 2.2, maxLevel: 25, effect: (lvl) => lvl * 0.02, unlockReq: { passive: 'armor', level: 10 } },
        { id: 'lastStand', nameKey: 'passives.lastStand.name', descKey: 'passives.lastStand.desc', icon: '🔥', baseCost: 15, costMult: 3.5, maxLevel: 5, effect: (lvl) => 1 + lvl * 0.2, unlockReq: { passive: 'health', level: 25 } }
    ],
    utility: [
        { id: 'expGain', nameKey: 'passives.expGain.name', descKey: 'passives.expGain.desc', icon: '📚', baseCost: 2, costMult: 1.6, maxLevel: 50, effect: (lvl) => 1 + lvl * 0.05 },
        { id: 'skillCd', nameKey: 'passives.skillCd.name', descKey: 'passives.skillCd.desc', icon: '⏰', baseCost: 3, costMult: 2.0, maxLevel: 20, effect: (lvl) => 1 - lvl * 0.03 },
        { id: 'energy', nameKey: 'passives.energy.name', descKey: 'passives.energy.desc', icon: '⚡', baseCost: 2, costMult: 1.7, maxLevel: 30, effect: (lvl) => 1 + lvl * 0.1 },
        { id: 'speed', nameKey: 'passives.speed.name', descKey: 'passives.speed.desc', icon: '💨', baseCost: 4, costMult: 2.2, maxLevel: 15, effect: (lvl) => 1 + lvl * 0.05 },
        { id: 'statPointGain', nameKey: 'passives.statPointGain.name', descKey: 'passives.statPointGain.desc', icon: '🎁', baseCost: 10, costMult: 3.0, maxLevel: 20, effect: (lvl) => lvl, unlockReq: { passive: 'expGain', level: 15 } },
        { id: 'autoPlay', nameKey: 'passives.autoPlay.name', descKey: 'passives.autoPlay.desc', icon: '🤖', baseCost: 20, costMult: 4.0, maxLevel: 5, effect: (lvl) => lvl, unlockReq: { passive: 'speed', level: 10 } }
    ],
    resources: [
        { id: 'goldGain', nameKey: 'passives.goldGain.name', descKey: 'passives.goldGain.desc', icon: '🥇', baseCost: 1, costMult: 1.5, maxLevel: 25, effect: (lvl) => 1 + lvl * 0.08 },
        { id: 'startGold', nameKey: 'passives.startGold.name', descKey: 'passives.startGold.desc', icon: '💰', baseCost: 2, costMult: 1.8, maxLevel: 50, effect: (lvl) => lvl * 100 },
        { id: 'production', nameKey: 'passives.production.name', descKey: 'passives.production.desc', icon: '🏭', baseCost: 3, costMult: 2.0, maxLevel: 20, effect: (lvl) => 1 + lvl * 0.2 },
        { id: 'crystalGain', nameKey: 'passives.crystalGain.name', descKey: 'passives.crystalGain.desc', icon: '💎', baseCost: 5, costMult: 2.5, maxLevel: 25, effect: (lvl) => 1 + lvl * 0.15 },
        { id: 'dropChance', nameKey: 'passives.dropChance.name', descKey: 'passives.dropChance.desc', icon: '🎲', baseCost: 8, costMult: 2.8, maxLevel: 30, effect: (lvl) => 1 + lvl * 0.05, unlockReq: { passive: 'goldGain', level: 15 } },
        { id: 'offlineGains', nameKey: 'passives.offlineGains.name', descKey: 'passives.offlineGains.desc', icon: '🌙', baseCost: 15, costMult: 3.5, maxLevel: 20, effect: (lvl) => 1 + lvl * 0.1, unlockReq: { passive: 'production', level: 10 } }
    ]
};

/**
 * Get all passives as flat array
 */
export function getAllPassives() {
    return Object.values(PASSIVES).flat();
}

/**
 * Get passive by ID
 */
export function getPassiveById(id) {
    return getAllPassives().find(p => p.id === id);
}

/**
 * Dread (Chaos) level definitions
 * Higher dread = harder enemies but better rewards
 */
export const DREAD_LEVELS = [
    // Reward scaling: enemyMult^1.1 to ensure higher dread always has better ROI
    // Each level guarantees reward/difficulty ratio > 1.3
    { level: 0, nameKey: 'dread.level0', enemyMult: 1.0, rewardMult: 1.0, color: '#94a3b8', unlockWave: 0 },
    { level: 1, nameKey: 'dread.level1', enemyMult: 1.5, rewardMult: 2.0, color: '#fbbf24', unlockWave: 10 },
    { level: 2, nameKey: 'dread.level2', enemyMult: 2.0, rewardMult: 2.8, color: '#f97316', unlockWave: 20 },
    { level: 3, nameKey: 'dread.level3', enemyMult: 3.0, rewardMult: 4.5, color: '#ef4444', unlockWave: 30 },
    { level: 4, nameKey: 'dread.level4', enemyMult: 5.0, rewardMult: 7.5, color: '#dc2626', unlockWave: 40 },
    { level: 5, nameKey: 'dread.level5', enemyMult: 8.0, rewardMult: 12.0, color: '#991b1b', unlockWave: 50 },
    { level: 6, nameKey: 'dread.level6', enemyMult: 12.0, rewardMult: 18.0, color: '#7f1d1d', unlockWave: 60 },
    { level: 7, nameKey: 'dread.level7', enemyMult: 20.0, rewardMult: 30.0, color: '#a855f7', unlockWave: 70 },
    { level: 8, nameKey: 'dread.level8', enemyMult: 30.0, rewardMult: 48.0, color: '#9333ea', unlockWave: 80 },
    { level: 9, nameKey: 'dread.level9', enemyMult: 40.0, rewardMult: 68.0, color: '#6b21a8', unlockWave: 90 },
    { level: 10, nameKey: 'dread.level10', enemyMult: 50.0, rewardMult: 90.0, color: '#000000', unlockWave: 100 }
];

/**
 * Awakening bonuses (unlocked at Dread 6)
 */
export const AWAKENING_BONUSES = [
    { id: 'wave_skip_100', nameKey: 'awakening.waveSkip.name', descKey: 'awakening.waveSkip.desc', icon: '⏫', effect: { waveSkip: 100 } },
    { id: 'auto_all', nameKey: 'awakening.autoAll.name', descKey: 'awakening.autoAll.desc', icon: '🦾', effect: { autoPlacement: true, autoBuy: true } },
    { id: 'prestige_x2', nameKey: 'awakening.prestigeX2.name', descKey: 'awakening.prestigeX2.desc', icon: '✨', effect: { prestigeMult: 2.0 } },
    { id: 'production_x3', nameKey: 'awakening.productionX3.name', descKey: 'awakening.productionX3.desc', icon: '🏗️', effect: { productionMult: 3.0 } },
    { id: 'starting_gold', nameKey: 'awakening.startGold.name', descKey: 'awakening.startGold.desc', icon: '💰', effect: { startGold: 10000 } }
];

/**
 * Ascension system (prestige of prestige)
 * Scalable perk tree with BigNum costs
 */
export const ASCENSION_PERKS = [
    {
        id: 'ap_starter_damage',
        nameKey: 'ascension.perks.ap_starter_damage.name',
        descKey: 'ascension.perks.ap_starter_damage.desc',
        icon: '🗡️',
        maxLevel: 100,
        costBase: '1',
        costFactor: '1.5',
        effectBase: 0.1,
        req: null
    },
    {
        id: 'ap_mining_speed',
        nameKey: 'ascension.perks.ap_mining_speed.name',
        descKey: 'ascension.perks.ap_mining_speed.desc',
        icon: '⛏️',
        maxLevel: 50,
        costBase: '5',
        costFactor: '2',
        effectBase: 0.05,
        req: 'ap_starter_damage'
    },
    {
        id: 'ap_ether_boost',
        nameKey: 'ascension.perks.ap_ether_boost.name',
        descKey: 'ascension.perks.ap_ether_boost.desc',
        icon: '🔮',
        maxLevel: 25,
        costBase: '10',
        costFactor: '1.2',
        effectBase: 0.25,
        req: 'ap_starter_damage'
    },
    {
        id: 'ap_start_wave',
        nameKey: 'ascension.perks.ap_start_wave.name',
        descKey: 'ascension.perks.ap_start_wave.desc',
        icon: '🌠',
        maxLevel: 10,
        costBase: '50',
        costFactor: '2.5',
        effectBase: 5,
        req: 'ap_ether_boost'
    },
    {
        id: 'ap_crit_power',
        nameKey: 'ascension.perks.ap_crit_power.name',
        descKey: 'ascension.perks.ap_crit_power.desc',
        icon: '💥',
        maxLevel: 20,
        costBase: '15',
        costFactor: '1.3',
        effectBase: 0.15,
        req: 'ap_starter_damage'
    },
    {
        id: 'ap_prestige_mult',
        nameKey: 'ascension.perks.ap_prestige_mult.name',
        descKey: 'ascension.perks.ap_prestige_mult.desc',
        icon: '✨',
        maxLevel: 25,
        costBase: '25',
        costFactor: '2.5',
        effectBase: 0.1,
        req: 'ap_ether_boost'
    },
    {
        id: 'ap_dread_resist',
        nameKey: 'ascension.perks.ap_dread_resist.name',
        descKey: 'ascension.perks.ap_dread_resist.desc',
        icon: '🛡️',
        maxLevel: 20,
        costBase: '30',
        costFactor: '2',
        effectBase: 0.03,
        req: 'ap_start_wave'
    },
    {
        id: 'ap_skill_power',
        nameKey: 'ascension.perks.ap_skill_power.name',
        descKey: 'ascension.perks.ap_skill_power.desc',
        icon: '⚡',
        maxLevel: 15,
        costBase: '20',
        costFactor: '1.25',
        effectBase: 0.1,
        req: 'ap_crit_power'
    },
    {
        id: 'ap_offline_bonus',
        nameKey: 'ascension.perks.ap_offline_bonus.name',
        descKey: 'ascension.perks.ap_offline_bonus.desc',
        icon: '🌙',
        maxLevel: 10,
        costBase: '100',
        costFactor: '2',
        effectBase: 0.2,
        req: 'ap_prestige_mult'
    },
    {
        id: 'ap_consistency_bonus',
        nameKey: 'ascension.perks.ap_consistency_bonus.name',
        descKey: 'ascension.perks.ap_consistency_bonus.desc',
        icon: '🎯',
        maxLevel: 5,
        costBase: '75',
        costFactor: '2.5',
        effectBase: 0.1,
        req: 'ap_ether_boost'
    }
];

/**
 * Talent tree - Permanent character specialization
 */
export const TALENT_TREES = [
    {
        id: 'warrior',
        nameKey: 'talents.warrior.name',
        icon: '⚔️',
        color: '#ef4444',
        talents: [
            { id: 'brute_force', nameKey: 'talents.bruteForce.name', descKey: 'talents.bruteForce.desc', max: 5, cost: 1, effect: { damage: 0.1 }, row: 0 },
            { id: 'berserker', nameKey: 'talents.berserker.name', descKey: 'talents.berserker.desc', max: 3, cost: 2, effect: { damageOnLowHp: 0.25 }, row: 1, requires: ['brute_force'] },
            { id: 'executioner', nameKey: 'talents.executioner.name', descKey: 'talents.executioner.desc', max: 3, cost: 2, effect: { executeDmg: 0.15 }, row: 1, requires: ['brute_force'] },
            { id: 'rampage', nameKey: 'talents.rampage.name', descKey: 'talents.rampage.desc', max: 1, cost: 5, effect: { killDmgStack: true }, row: 2, requires: ['berserker', 'executioner'] },
            { id: 'warlord', nameKey: 'talents.warlord.name', descKey: 'talents.warlord.desc', max: 1, cost: 10, effect: { allDamage: 0.5 }, row: 3, requires: ['rampage'] }
        ]
    },
    {
        id: 'guardian',
        nameKey: 'talents.guardian.name',
        icon: '🛡️',
        color: '#3b82f6',
        talents: [
            { id: 'fortify', nameKey: 'talents.fortify.name', descKey: 'talents.fortify.desc', max: 5, cost: 1, effect: { health: 0.1 }, row: 0 },
            { id: 'regenerator', nameKey: 'talents.regenerator.name', descKey: 'talents.regenerator.desc', max: 3, cost: 2, effect: { regen: 0.2 }, row: 1, requires: ['fortify'] },
            { id: 'barrier', nameKey: 'talents.barrier.name', descKey: 'talents.barrier.desc', max: 3, cost: 2, effect: { shield: 0.15 }, row: 1, requires: ['fortify'] },
            { id: 'second_wind', nameKey: 'talents.secondWind.name', descKey: 'talents.secondWind.desc', max: 1, cost: 5, effect: { reviveChance: 0.25 }, row: 2, requires: ['regenerator', 'barrier'] },
            { id: 'immortal', nameKey: 'talents.immortal.name', descKey: 'talents.immortal.desc', max: 1, cost: 10, effect: { damageReduction: 0.25 }, row: 3, requires: ['second_wind'] }
        ]
    },
    {
        id: 'mystic',
        nameKey: 'talents.mystic.name',
        icon: '🔮',
        color: '#a855f7',
        talents: [
            { id: 'arcane_power', nameKey: 'talents.arcanePower.name', descKey: 'talents.arcanePower.desc', max: 5, cost: 1, effect: { skillDamage: 0.15 }, row: 0 },
            { id: 'quick_cast', nameKey: 'talents.quickCast.name', descKey: 'talents.quickCast.desc', max: 3, cost: 2, effect: { cooldown: 0.1 }, row: 1, requires: ['arcane_power'] },
            { id: 'mana_surge', nameKey: 'talents.manaSurge.name', descKey: 'talents.manaSurge.desc', max: 3, cost: 2, effect: { runeChance: 0.1 }, row: 1, requires: ['arcane_power'] },
            { id: 'time_warp', nameKey: 'talents.timeWarp.name', descKey: 'talents.timeWarp.desc', max: 1, cost: 5, effect: { skillDuration: 0.5 }, row: 2, requires: ['quick_cast', 'mana_surge'] },
            { id: 'archmage', nameKey: 'talents.archmage.name', descKey: 'talents.archmage.desc', max: 1, cost: 10, effect: { doubleSkill: true }, row: 3, requires: ['time_warp'] }
        ]
    },
    {
        id: 'merchant',
        nameKey: 'talents.merchant.name',
        icon: '💰',
        color: '#fbbf24',
        talents: [
            { id: 'gold_sense', nameKey: 'talents.goldSense.name', descKey: 'talents.goldSense.desc', max: 5, cost: 1, effect: { gold: 0.1 }, row: 0 },
            { id: 'treasure_hunter', nameKey: 'talents.treasureHunter.name', descKey: 'talents.treasureHunter.desc', max: 3, cost: 2, effect: { relicChance: 0.1 }, row: 1, requires: ['gold_sense'] },
            { id: 'efficient', nameKey: 'talents.efficient.name', descKey: 'talents.efficient.desc', max: 3, cost: 2, effect: { upgradeCost: -0.05 }, row: 1, requires: ['gold_sense'] },
            { id: 'lucky', nameKey: 'talents.lucky.name', descKey: 'talents.lucky.desc', max: 1, cost: 5, effect: { doubleGold: 0.1 }, row: 2, requires: ['treasure_hunter', 'efficient'] },
            { id: 'tycoon', nameKey: 'talents.tycoon.name', descKey: 'talents.tycoon.desc', max: 1, cost: 10, effect: { passiveGold: true }, row: 3, requires: ['lucky'] }
        ]
    }
];

/**
 * Mastery definitions
 * @type {Array<{id: string, nameKey: string, descKey: string, max: number}>}
 */
export const MASTERIES = [
    { id: 'crit_dmg', nameKey: 'mastery.crit_dmg.name', descKey: 'mastery.crit_dmg.desc', max: 50 },
    { id: 'ether_gain', nameKey: 'mastery.ether_gain.name', descKey: 'mastery.ether_gain.desc', max: 20 },
    { id: 'drone_spd', nameKey: 'mastery.drone_spd.name', descKey: 'mastery.drone_spd.desc', max: 10 },
    { id: 'gold_drop', nameKey: 'mastery.gold_drop.name', descKey: 'mastery.gold_drop.desc', max: 100 }
];
