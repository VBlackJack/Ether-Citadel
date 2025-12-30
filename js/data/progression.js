/*
 * Copyright 2025 Julien Bombled
 * Progression and Upgrade Data
 */

/**
 * Prestige upgrade definitions for permanent bonuses
 */
export const PRESTIGE_UPGRADES = [
    { id: 'prestige_damage', nameKey: 'prestige.damage.name', descKey: 'prestige.damage.desc', icon: '⚔️', baseCost: 1, costMult: 2.0, maxLevel: 100, effect: (lvl) => 1 + lvl * 0.05 },
    { id: 'prestige_health', nameKey: 'prestige.health.name', descKey: 'prestige.health.desc', icon: '❤️', baseCost: 1, costMult: 2.0, maxLevel: 100, effect: (lvl) => 1 + lvl * 0.05 },
    { id: 'prestige_gold', nameKey: 'prestige.gold.name', descKey: 'prestige.gold.desc', icon: '💰', baseCost: 2, costMult: 1.8, maxLevel: 50, effect: (lvl) => 1 + lvl * 0.1 },
    { id: 'prestige_crystals', nameKey: 'prestige.crystals.name', descKey: 'prestige.crystals.desc', icon: '💎', baseCost: 3, costMult: 2.2, maxLevel: 25, effect: (lvl) => 1 + lvl * 0.15 },
    { id: 'prestige_start_wave', nameKey: 'prestige.start_wave.name', descKey: 'prestige.start_wave.desc', icon: '🚀', baseCost: 5, costMult: 3.0, maxLevel: 10, effect: (lvl) => lvl * 5 },
    { id: 'prestige_auto_turrets', nameKey: 'prestige.auto_turrets.name', descKey: 'prestige.auto_turrets.desc', icon: '🤖', baseCost: 10, costMult: 5.0, maxLevel: 4, effect: (lvl) => lvl },
    { id: 'prestige_production', nameKey: 'prestige.production.name', descKey: 'prestige.production.desc', icon: '🏭', baseCost: 5, costMult: 2.5, maxLevel: 20, effect: (lvl) => 1 + lvl * 0.2 },
    { id: 'prestige_skill_cd', nameKey: 'prestige.skill_cd.name', descKey: 'prestige.skill_cd.desc', icon: '⏰', baseCost: 8, costMult: 3.0, maxLevel: 10, effect: (lvl) => 1 - lvl * 0.05 }
];

/**
 * Town Level definitions - Progressive unlock system
 */
export const TOWN_LEVELS = [
    { level: 1, nameKey: 'town.level1', icon: '🏠', xpRequired: 0, unlocks: ['basic'] },
    { level: 2, nameKey: 'town.level2', icon: '🏘️', xpRequired: 100, unlocks: ['dailyQuests'] },
    { level: 3, nameKey: 'town.level3', icon: '🏙️', xpRequired: 500, unlocks: ['school'] },
    { level: 4, nameKey: 'town.level4', icon: '🌆', xpRequired: 2000, unlocks: ['autoRebirth', 'office'] },
    { level: 5, nameKey: 'town.level5', icon: '🌃', xpRequired: 10000, unlocks: ['advancedResearch'] },
    { level: 6, nameKey: 'town.level6', icon: '🏰', xpRequired: 50000, unlocks: ['awakening'] },
    { level: 7, nameKey: 'town.level7', icon: '⭐', xpRequired: 200000, unlocks: ['legendary'] }
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
 */
export const ASCENSION_PERKS = [
    { id: 'eternal_damage', nameKey: 'ascension.eternalDamage.name', descKey: 'ascension.eternalDamage.desc', icon: '🗡️', cost: 1, effect: { permanentDamage: 0.25 } },
    { id: 'eternal_health', nameKey: 'ascension.eternalHealth.name', descKey: 'ascension.eternalHealth.desc', icon: '💓', cost: 1, effect: { permanentHealth: 0.25 } },
    { id: 'eternal_gold', nameKey: 'ascension.eternalGold.name', descKey: 'ascension.eternalGold.desc', icon: '🪙', cost: 1, effect: { permanentGold: 0.25 } },
    { id: 'ether_mastery', nameKey: 'ascension.etherMastery.name', descKey: 'ascension.etherMastery.desc', icon: '🔮', cost: 2, effect: { etherGainMult: 0.5 } },
    { id: 'starting_power', nameKey: 'ascension.startingPower.name', descKey: 'ascension.startingPower.desc', icon: '🌠', cost: 2, effect: { startWave: 10, startGold: 5000 } },
    { id: 'relic_affinity', nameKey: 'ascension.relicAffinity.name', descKey: 'ascension.relicAffinity.desc', icon: '🎁', cost: 3, effect: { relicDropMult: 1.5 } },
    { id: 'time_dilation', nameKey: 'ascension.timeDilation.name', descKey: 'ascension.timeDilation.desc', icon: '⏳', cost: 3, effect: { offlineProgress: 0.5 } },
    { id: 'cosmic_power', nameKey: 'ascension.cosmicPower.name', descKey: 'ascension.cosmicPower.desc', icon: '🌟', cost: 5, effect: { allStats: 0.1 } },
    { id: 'infinite_growth', nameKey: 'ascension.infiniteGrowth.name', descKey: 'ascension.infiniteGrowth.desc', icon: '♾️', cost: 10, effect: { scalingBonus: true } }
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
 */
export const MASTERIES = [
    { id: 'crit_dmg', nameKey: 'mastery.crit_dmg.name', descKey: 'mastery.crit_dmg.desc', max: 50 },
    { id: 'ether_gain', nameKey: 'mastery.ether_gain.name', descKey: 'mastery.ether_gain.desc', max: 20 },
    { id: 'drone_spd', nameKey: 'mastery.drone_spd.name', descKey: 'mastery.drone_spd.desc', max: 10 },
    { id: 'gold_drop', nameKey: 'mastery.gold_drop.name', descKey: 'mastery.gold_drop.desc', max: 100 }
];

/**
 * Dark Matter upgrade definitions
 */
export const DARK_MATTER_UPGRADES = [
    { id: 'berserk', nameKey: 'darkMatter.berserk.name', descKey: 'darkMatter.berserk.desc', max: 1, cost: 5 },
    { id: 'siphon', nameKey: 'darkMatter.siphon.name', descKey: 'darkMatter.siphon.desc', max: 5, cost: 10 },
    { id: 'overlord', nameKey: 'darkMatter.overlord.name', descKey: 'darkMatter.overlord.desc', max: 3, cost: 8 }
];

/**
 * Research tree definitions
 */
export const RESEARCH_TREE = [
    {
        id: 'offense',
        nameKey: 'research.offense.name',
        icon: '⚔️',
        color: '#ef4444',
        nodes: [
            { id: 'dmg_1', nameKey: 'research.dmg_1.name', descKey: 'research.dmg_1.desc', cost: 5, effect: { damageMult: 0.1 }, requires: [] },
            { id: 'dmg_2', nameKey: 'research.dmg_2.name', descKey: 'research.dmg_2.desc', cost: 15, effect: { damageMult: 0.15 }, requires: ['dmg_1'] },
            { id: 'dmg_3', nameKey: 'research.dmg_3.name', descKey: 'research.dmg_3.desc', cost: 50, effect: { damageMult: 0.25 }, requires: ['dmg_2'] },
            { id: 'crit_1', nameKey: 'research.crit_1.name', descKey: 'research.crit_1.desc', cost: 10, effect: { critChance: 5 }, requires: ['dmg_1'] },
            { id: 'crit_2', nameKey: 'research.crit_2.name', descKey: 'research.crit_2.desc', cost: 30, effect: { critDamage: 0.5 }, requires: ['crit_1'] },
            { id: 'speed_1', nameKey: 'research.speed_1.name', descKey: 'research.speed_1.desc', cost: 20, effect: { fireRateMult: 0.1 }, requires: ['dmg_1'] },
            { id: 'speed_2', nameKey: 'research.speed_2.name', descKey: 'research.speed_2.desc', cost: 60, effect: { fireRateMult: 0.15 }, requires: ['speed_1'] }
        ]
    },
    {
        id: 'defense',
        nameKey: 'research.defense.name',
        icon: '🛡️',
        color: '#3b82f6',
        nodes: [
            { id: 'hp_1', nameKey: 'research.hp_1.name', descKey: 'research.hp_1.desc', cost: 5, effect: { healthMult: 0.1 }, requires: [] },
            { id: 'hp_2', nameKey: 'research.hp_2.name', descKey: 'research.hp_2.desc', cost: 15, effect: { healthMult: 0.15 }, requires: ['hp_1'] },
            { id: 'hp_3', nameKey: 'research.hp_3.name', descKey: 'research.hp_3.desc', cost: 50, effect: { healthMult: 0.25 }, requires: ['hp_2'] },
            { id: 'regen_1', nameKey: 'research.regen_1.name', descKey: 'research.regen_1.desc', cost: 10, effect: { regenMult: 0.2 }, requires: ['hp_1'] },
            { id: 'shield_1', nameKey: 'research.shield_1.name', descKey: 'research.shield_1.desc', cost: 25, effect: { shieldMult: 0.2 }, requires: ['hp_2'] },
            { id: 'armor_1', nameKey: 'research.armor_1.name', descKey: 'research.armor_1.desc', cost: 40, effect: { armorFlat: 0.05 }, requires: ['shield_1'] }
        ]
    },
    {
        id: 'utility',
        nameKey: 'research.utility.name',
        icon: '⚙️',
        color: '#22d3ee',
        nodes: [
            { id: 'gold_1', nameKey: 'research.gold_1.name', descKey: 'research.gold_1.desc', cost: 5, effect: { goldMult: 0.1 }, requires: [] },
            { id: 'gold_2', nameKey: 'research.gold_2.name', descKey: 'research.gold_2.desc', cost: 20, effect: { goldMult: 0.15 }, requires: ['gold_1'] },
            { id: 'xp_1', nameKey: 'research.xp_1.name', descKey: 'research.xp_1.desc', cost: 15, effect: { xpMult: 0.2 }, requires: ['gold_1'] },
            { id: 'mining_1', nameKey: 'research.mining_1.name', descKey: 'research.mining_1.desc', cost: 10, effect: { miningSpeed: 0.25 }, requires: [] },
            { id: 'mining_2', nameKey: 'research.mining_2.name', descKey: 'research.mining_2.desc', cost: 35, effect: { miningSpeed: 0.5 }, requires: ['mining_1'] },
            { id: 'forge_1', nameKey: 'research.forge_1.name', descKey: 'research.forge_1.desc', cost: 50, effect: { forgeSuccess: 0.1 }, requires: ['mining_2'] }
        ]
    }
];
