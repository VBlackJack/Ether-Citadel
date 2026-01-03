/*
 * Copyright 2025 Julien Bombled
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Relic definitions
 * @type {Array<{id: string, nameKey: string, icon: string, descKey: string, effect: Function}>}
 */
export const RELIC_DB = [
    // Common relics (tier 1)
    { id: 'dmg_boost', nameKey: 'relics.dmg_boost.name', icon: '🗡️', descKey: 'relics.dmg_boost.desc', tier: 1, effect: (g) => g.relicMults.damage += 0.2 },
    { id: 'gold_boost', nameKey: 'relics.gold_boost.name', icon: '💰', descKey: 'relics.gold_boost.desc', tier: 1, effect: (g) => g.relicMults.gold += 0.25 },
    { id: 'speed_boost', nameKey: 'relics.speed_boost.name', icon: '💨', descKey: 'relics.speed_boost.desc', tier: 1, effect: (g) => g.relicMults.speed += 0.15 },
    { id: 'crit_boost', nameKey: 'relics.crit_boost.name', icon: '💥', descKey: 'relics.crit_boost.desc', tier: 1, effect: (g) => g.relicMults.critChance += 10 },
    { id: 'hp_boost', nameKey: 'relics.hp_boost.name', icon: '❤️', descKey: 'relics.hp_boost.desc', tier: 1, effect: (g) => g.relicMults.health += 0.3 },
    { id: 'skill_cd', nameKey: 'relics.skill_cd.name', icon: '⏰', descKey: 'relics.skill_cd.desc', tier: 1, effect: (g) => g.relicMults.cooldown += 0.1 },
    // Rare relics (tier 2)
    { id: 'vampiric_blade', nameKey: 'relics.vampiric_blade.name', icon: '🩸', descKey: 'relics.vampiric_blade.desc', tier: 2, effect: (g) => { g.relicMults.damage += 0.15; g.relicMults.leech += 0.05; } },
    { id: 'miners_pick', nameKey: 'relics.miners_pick.name', icon: '⛏️', descKey: 'relics.miners_pick.desc', tier: 2, effect: (g) => g.relicMults.mining += 0.5 },
    { id: 'chaos_gem', nameKey: 'relics.chaos_gem.name', icon: '☠️', descKey: 'relics.chaos_gem.desc', tier: 2, effect: (g) => g.relicMults.dreadReward += 0.25 },
    { id: 'temporal_shard', nameKey: 'relics.temporal_shard.name', icon: '⏰', descKey: 'relics.temporal_shard.desc', tier: 2, effect: (g) => { g.relicMults.cooldown += 0.15; g.relicMults.speed += 0.1; } },
    // Epic relics (tier 3)
    { id: 'dragon_heart', nameKey: 'relics.dragon_heart.name', icon: '🐉', descKey: 'relics.dragon_heart.desc', tier: 3, effect: (g) => { g.relicMults.damage += 0.35; g.relicMults.health += 0.35; } },
    { id: 'void_crystal', nameKey: 'relics.void_crystal.name', icon: '🔷', descKey: 'relics.void_crystal.desc', tier: 3, effect: (g) => { g.relicMults.critChance += 20; g.relicMults.critDamage += 0.5; } },
    { id: 'phoenix_feather', nameKey: 'relics.phoenix_feather.name', icon: '🪶', descKey: 'relics.phoenix_feather.desc', tier: 3, effect: (g) => g.relicMults.revive = true },
    // Legendary relics (tier 4) - only from forge
    { id: 'infinity_stone', nameKey: 'relics.infinity_stone.name', icon: '🌟', descKey: 'relics.infinity_stone.desc', tier: 4, effect: (g) => { g.relicMults.damage += 0.5; g.relicMults.health += 0.5; g.relicMults.gold += 0.5; } },
    { id: 'time_loop', nameKey: 'relics.time_loop.name', icon: '🔄', descKey: 'relics.time_loop.desc', tier: 4, effect: (g) => { g.relicMults.cooldown += 0.3; g.relicMults.autoSkill = true; } },
    { id: 'world_eater', nameKey: 'relics.world_eater.name', icon: '🕳️', descKey: 'relics.world_eater.desc', tier: 4, effect: (g) => { g.relicMults.damage += 1.0; g.relicMults.health -= 0.3; } }
];

/**
 * Relic evolution system
 */
export const RELIC_EVOLUTIONS = {
    // Format: original_relic_id: evolved_form
    bloodstone: {
        evolvedId: 'crimson_heart',
        nameKey: 'relics.crimsonHeart.name',
        descKey: 'relics.crimsonHeart.desc',
        icon: '❤️‍🔥',
        tier: 4,
        requirement: { kills: 10000 },
        effect: (g) => { g.relicMults.damage += 0.5; g.relicMults.leech += 0.1; g.relicMults.health += 0.25; }
    },
    swift_boots: {
        evolvedId: 'wings_of_hermes',
        nameKey: 'relics.wingsOfHermes.name',
        descKey: 'relics.wingsOfHermes.desc',
        icon: '👟',
        tier: 4,
        requirement: { waveReached: 100 },
        effect: (g) => { g.relicMults.speed += 0.6; g.relicMults.cooldown += 0.3; g.relicMults.dodge += 0.15; }
    },
    gold_magnet: {
        evolvedId: 'midas_crown',
        nameKey: 'relics.midasCrown.name',
        descKey: 'relics.midasCrown.desc',
        icon: '👑',
        tier: 4,
        requirement: { goldEarned: 1000000 },
        effect: (g) => { g.relicMults.gold += 1.0; g.relicMults.crystals += 0.5; g.relicMults.ether += 0.25; }
    },
    crit_lens: {
        evolvedId: 'eye_of_precision',
        nameKey: 'relics.eyeOfPrecision.name',
        descKey: 'relics.eyeOfPrecision.desc',
        icon: '👁️',
        tier: 4,
        requirement: { criticalHits: 50000 },
        effect: (g) => { g.relicMults.critChance += 30; g.relicMults.critDamage += 1.5; g.relicMults.damage += 0.2; }
    },
    void_shard: {
        evolvedId: 'void_core',
        nameKey: 'relics.voidCore.name',
        descKey: 'relics.voidCore.desc',
        icon: '💜',
        tier: 4,
        requirement: { skillsUsed: 1000 },
        effect: (g) => { g.relicMults.skillPower += 0.75; g.relicMults.cooldown += 0.4; g.relicMults.ether += 0.5; }
    }
};

/**
 * Relic synergy bonuses
 */
export const RELIC_SYNERGIES = [
    {
        id: 'fire_set',
        nameKey: 'relicSynergy.fireSet.name',
        descKey: 'relicSynergy.fireSet.desc',
        relics: ['inferno_core', 'flame_heart', 'ember_ring'],
        minCount: 2,
        bonuses: {
            2: { damage: 0.15, burnDamage: 0.25 },
            3: { damage: 0.35, burnDamage: 0.5, burnSpread: true }
        },
        color: '#ef4444',
        icon: '🔥'
    },
    {
        id: 'ice_set',
        nameKey: 'relicSynergy.iceSet.name',
        descKey: 'relicSynergy.iceSet.desc',
        relics: ['frost_core', 'glacier_heart', 'frozen_ring'],
        minCount: 2,
        bonuses: {
            2: { slow: 0.2, shield: 0.15 },
            3: { slow: 0.4, shield: 0.3, freezeChance: 0.1 }
        },
        color: '#22d3ee',
        icon: '❄️'
    },
    {
        id: 'void_set',
        nameKey: 'relicSynergy.voidSet.name',
        descKey: 'relicSynergy.voidSet.desc',
        relics: ['void_shard', 'shadow_gem', 'darkness_orb'],
        minCount: 2,
        bonuses: {
            2: { ether: 0.25, skillPower: 0.2 },
            3: { ether: 0.5, skillPower: 0.4, voidDamage: 0.3 }
        },
        color: '#a855f7',
        icon: '🌀'
    },
    {
        id: 'wealth_set',
        nameKey: 'relicSynergy.wealthSet.name',
        descKey: 'relicSynergy.wealthSet.desc',
        relics: ['gold_magnet', 'lucky_coin', 'treasure_map'],
        minCount: 2,
        bonuses: {
            2: { gold: 0.3, crystals: 0.2 },
            3: { gold: 0.6, crystals: 0.4, doubleDropChance: 0.1 }
        },
        color: '#fbbf24',
        icon: '💰'
    },
    {
        id: 'warrior_set',
        nameKey: 'relicSynergy.warriorSet.name',
        descKey: 'relicSynergy.warriorSet.desc',
        relics: ['bloodstone', 'berserker_axe', 'war_banner'],
        minCount: 2,
        bonuses: {
            2: { damage: 0.2, critChance: 10 },
            3: { damage: 0.45, critChance: 20, critDamage: 0.5 }
        },
        color: '#dc2626',
        icon: '⚔️'
    }
];
