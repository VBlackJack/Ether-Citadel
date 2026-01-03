/*
 * Copyright 2025 Julien Bombled
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Skills data with loadout system
 */
export const SKILLS_DATA = {
    // Original skills
    overdrive: {
        id: 'overdrive',
        nameKey: 'skills.overdrive.name',
        descKey: 'skills.overdrive.desc',
        icon: '⚡',
        color: '#fbbf24',
        duration: 5000,
        cooldown: 30000,
        hotkey: 'Q',
        category: 'buff',
        effect: { fireRateMult: 3, damageMult: 1.5 },
        upgrades: [
            { id: 'duration', nameKey: 'skills.upgrades.duration', effect: { durationMult: 1.5 }, cost: 50 },
            { id: 'power', nameKey: 'skills.upgrades.power', effect: { damageMult: 2.0 }, cost: 75 },
            { id: 'cooldown', nameKey: 'skills.upgrades.cooldown', effect: { cooldownMult: 0.7 }, cost: 100 }
        ]
    },
    nuke: {
        id: 'nuke',
        nameKey: 'skills.nuke.name',
        descKey: 'skills.nuke.desc',
        icon: '💥',
        color: '#ef4444',
        duration: 0,
        cooldown: 60000,
        hotkey: 'W',
        category: 'damage',
        effect: { damagePercent: 1.0, bossDamageMult: 50 },
        upgrades: [
            { id: 'chain', nameKey: 'skills.upgrades.chain', effect: { chainReaction: true }, cost: 100 },
            { id: 'vacuum', nameKey: 'skills.upgrades.vacuum', effect: { pullEnemies: true, pullRadius: 200 }, cost: 80 },
            { id: 'aftershock', nameKey: 'skills.upgrades.aftershock', effect: { aftershockDamage: 0.3, aftershockDelay: 1000 }, cost: 120 }
        ]
    },
    blackhole: {
        id: 'blackhole',
        nameKey: 'skills.blackhole.name',
        descKey: 'skills.blackhole.desc',
        icon: '🌀',
        color: '#a855f7',
        duration: 4000,
        cooldown: 45000,
        hotkey: 'E',
        category: 'control',
        effect: { pullForce: 5, damagePerSecond: 50, radius: 150 },
        upgrades: [
            { id: 'size', nameKey: 'skills.upgrades.size', effect: { radiusMult: 1.5 }, cost: 60 },
            { id: 'duration', nameKey: 'skills.upgrades.duration', effect: { durationMult: 1.75 }, cost: 70 },
            { id: 'damage', nameKey: 'skills.upgrades.damage', effect: { damageMult: 2.0 }, cost: 90 }
        ]
    },
    // New skills
    timewarp: {
        id: 'timewarp',
        nameKey: 'skills.timewarp.name',
        descKey: 'skills.timewarp.desc',
        icon: '⏰',
        color: '#22d3ee',
        duration: 8000,
        cooldown: 50000,
        hotkey: 'R',
        category: 'control',
        unlockWave: 30,
        effect: { enemySlowMult: 0.3, turretSpeedMult: 2.0 },
        upgrades: [
            { id: 'freeze', nameKey: 'skills.upgrades.freeze', effect: { enemySlowMult: 0.1 }, cost: 80 },
            { id: 'haste', nameKey: 'skills.upgrades.haste', effect: { turretSpeedMult: 3.0 }, cost: 100 },
            { id: 'extend', nameKey: 'skills.upgrades.extend', effect: { durationMult: 1.5 }, cost: 75 }
        ]
    },
    earthquake: {
        id: 'earthquake',
        nameKey: 'skills.earthquake.name',
        descKey: 'skills.earthquake.desc',
        icon: '🌋',
        color: '#78716c',
        duration: 0,
        cooldown: 55000,
        hotkey: 'T',
        category: 'control',
        unlockWave: 40,
        effect: { stunDuration: 3000, damage: 100, radius: 400 },
        upgrades: [
            { id: 'aftershock', nameKey: 'skills.upgrades.aftershock', effect: { waves: 3, waveDelay: 500 }, cost: 90 },
            { id: 'fissure', nameKey: 'skills.upgrades.fissure', effect: { fissureDamage: 50, fissureDuration: 5000 }, cost: 110 },
            { id: 'magnitude', nameKey: 'skills.upgrades.magnitude', effect: { damageMult: 2.0, stunDurationMult: 1.5 }, cost: 130 }
        ]
    },
    mirrorshield: {
        id: 'mirrorshield',
        nameKey: 'skills.mirrorshield.name',
        descKey: 'skills.mirrorshield.desc',
        icon: '🛡️',
        color: '#3b82f6',
        duration: 6000,
        cooldown: 45000,
        hotkey: 'Y',
        category: 'defense',
        unlockWave: 35,
        effect: { reflectPercent: 0.5, damageReduction: 0.5 },
        upgrades: [
            { id: 'reflect', nameKey: 'skills.upgrades.reflect', effect: { reflectPercent: 0.8 }, cost: 85 },
            { id: 'absorb', nameKey: 'skills.upgrades.absorb', effect: { damageReduction: 0.75, healOnHit: 0.1 }, cost: 95 },
            { id: 'counter', nameKey: 'skills.upgrades.counter', effect: { counterAttack: true, counterDamage: 200 }, cost: 120 }
        ]
    },
    meteorstorm: {
        id: 'meteorstorm',
        nameKey: 'skills.meteorstorm.name',
        descKey: 'skills.meteorstorm.desc',
        icon: '☄️',
        color: '#f97316',
        duration: 5000,
        cooldown: 60000,
        hotkey: 'U',
        category: 'damage',
        unlockWave: 50,
        effect: { meteorCount: 8, meteorDamage: 150, meteorRadius: 80, interval: 500 },
        upgrades: [
            { id: 'barrage', nameKey: 'skills.upgrades.barrage', effect: { meteorCount: 15 }, cost: 100 },
            { id: 'impact', nameKey: 'skills.upgrades.impact', effect: { meteorDamage: 250, meteorRadius: 120 }, cost: 120 },
            { id: 'burn', nameKey: 'skills.upgrades.burn', effect: { burnDamage: 30, burnDuration: 4000 }, cost: 90 }
        ]
    },
    voidrift: {
        id: 'voidrift',
        nameKey: 'skills.voidrift.name',
        descKey: 'skills.voidrift.desc',
        icon: '🕳️',
        color: '#6d28d9',
        duration: 0,
        cooldown: 70000,
        hotkey: 'I',
        category: 'damage',
        unlockWave: 60,
        effect: { instantKillCount: 5, maxHpPercent: 0.2, bossExcluded: true },
        upgrades: [
            { id: 'expand', nameKey: 'skills.upgrades.expand', effect: { instantKillCount: 10 }, cost: 150 },
            { id: 'drain', nameKey: 'skills.upgrades.drain', effect: { etherPerKill: 1 }, cost: 200 },
            { id: 'boss', nameKey: 'skills.upgrades.boss', effect: { bossExcluded: false, bossDamagePercent: 0.1 }, cost: 250 }
        ]
    }
};

/**
 * Skill combo definitions
 */
export const SKILL_COMBOS = [
    {
        id: 'devastation',
        nameKey: 'skillCombos.devastation.name',
        descKey: 'skillCombos.devastation.desc',
        skills: ['overdrive', 'nuke'],
        timeWindow: 5000,
        effect: { aoeDamage: true, radiusMult: 2.0 },
        icon: '💣',
        color: '#ef4444'
    },
    {
        id: 'singularity',
        nameKey: 'skillCombos.singularity.name',
        descKey: 'skillCombos.singularity.desc',
        skills: ['nuke', 'blackhole'],
        timeWindow: 5000,
        effect: { extendedPull: true, damageOnPull: 100 },
        icon: '🌑',
        color: '#a855f7'
    },
    {
        id: 'overcharge',
        nameKey: 'skillCombos.overcharge.name',
        descKey: 'skillCombos.overcharge.desc',
        skills: ['blackhole', 'overdrive'],
        timeWindow: 5000,
        effect: { ignoreRange: true, globalDamage: 0.5 },
        icon: '⚡',
        color: '#fbbf24'
    },
    {
        id: 'timestop',
        nameKey: 'skillCombos.timestop.name',
        descKey: 'skillCombos.timestop.desc',
        skills: ['timewarp', 'blackhole'],
        timeWindow: 5000,
        effect: { freezeInBlackhole: true, extendedDuration: 3000 },
        icon: '❄️',
        color: '#22d3ee'
    },
    {
        id: 'armageddon',
        nameKey: 'skillCombos.armageddon.name',
        descKey: 'skillCombos.armageddon.desc',
        skills: ['meteorstorm', 'earthquake'],
        timeWindow: 5000,
        effect: { meteorStun: true, earthquakeFire: true },
        icon: '🔥',
        color: '#f97316'
    },
    {
        id: 'voidstorm',
        nameKey: 'skillCombos.voidstorm.name',
        descKey: 'skillCombos.voidstorm.desc',
        skills: ['voidrift', 'meteorstorm'],
        timeWindow: 5000,
        effect: { voidMeteors: true, etherPerMeteor: 0.5 },
        icon: '🌌',
        color: '#6d28d9'
    }
];

/**
 * Skill Cards - Collectible cards that modify abilities
 */
export const SKILL_CARDS = [
    // Attack cards
    { id: 'power_surge', nameKey: 'skillCards.powerSurge.name', descKey: 'skillCards.powerSurge.desc', icon: '⚡', rarity: 'common', category: 'attack', effect: { damage: 0.1 } },
    { id: 'rapid_fire', nameKey: 'skillCards.rapidFire.name', descKey: 'skillCards.rapidFire.desc', icon: '🔫', rarity: 'common', category: 'attack', effect: { fireRate: 0.1 } },
    { id: 'precision_strike', nameKey: 'skillCards.precisionStrike.name', descKey: 'skillCards.precisionStrike.desc', icon: '🎯', rarity: 'common', category: 'attack', effect: { critChance: 0.05 } },
    { id: 'armor_piercing', nameKey: 'skillCards.armorPiercing.name', descKey: 'skillCards.armorPiercing.desc', icon: '🗡️', rarity: 'uncommon', category: 'attack', effect: { armorIgnore: 0.15 } },
    { id: 'explosive_rounds', nameKey: 'skillCards.explosiveRounds.name', descKey: 'skillCards.explosiveRounds.desc', icon: '💥', rarity: 'uncommon', category: 'attack', effect: { splash: 20, splashDamage: 0.3 } },
    { id: 'chain_lightning', nameKey: 'skillCards.chainLightning.name', descKey: 'skillCards.chainLightning.desc', icon: '⚡', rarity: 'rare', category: 'attack', effect: { chain: 3, chainDamage: 0.5 } },
    { id: 'devastator', nameKey: 'skillCards.devastator.name', descKey: 'skillCards.devastator.desc', icon: '☢️', rarity: 'legendary', category: 'attack', effect: { damage: 0.5, critDamage: 1.0 } },
    // Defense cards
    { id: 'reinforced_walls', nameKey: 'skillCards.reinforcedWalls.name', descKey: 'skillCards.reinforcedWalls.desc', icon: '🧱', rarity: 'common', category: 'defense', effect: { health: 0.1 } },
    { id: 'quick_repair', nameKey: 'skillCards.quickRepair.name', descKey: 'skillCards.quickRepair.desc', icon: '🔧', rarity: 'common', category: 'defense', effect: { regen: 0.2 } },
    { id: 'energy_shield', nameKey: 'skillCards.energyShield.name', descKey: 'skillCards.energyShield.desc', icon: '🛡️', rarity: 'uncommon', category: 'defense', effect: { shield: 0.25 } },
    { id: 'damage_reflect', nameKey: 'skillCards.damageReflect.name', descKey: 'skillCards.damageReflect.desc', icon: '🪞', rarity: 'rare', category: 'defense', effect: { reflect: 0.1 } },
    { id: 'immortal_core', nameKey: 'skillCards.immortalCore.name', descKey: 'skillCards.immortalCore.desc', icon: '💎', rarity: 'legendary', category: 'defense', effect: { revive: 1, reviveHealth: 0.5 } },
    // Utility cards
    { id: 'gold_magnet', nameKey: 'skillCards.goldMagnet.name', descKey: 'skillCards.goldMagnet.desc', icon: '🧲', rarity: 'common', category: 'utility', effect: { gold: 0.15 } },
    { id: 'exp_boost', nameKey: 'skillCards.expBoost.name', descKey: 'skillCards.expBoost.desc', icon: '📚', rarity: 'common', category: 'utility', effect: { exp: 0.2 } },
    { id: 'lucky_star', nameKey: 'skillCards.luckyStar.name', descKey: 'skillCards.luckyStar.desc', icon: '⭐', rarity: 'uncommon', category: 'utility', effect: { luck: 0.1, relicChance: 0.1 } },
    { id: 'time_dilation', nameKey: 'skillCards.timeDilation.name', descKey: 'skillCards.timeDilation.desc', icon: '⏳', rarity: 'rare', category: 'utility', effect: { skillCooldown: -0.2 } },
    { id: 'void_touch', nameKey: 'skillCards.voidTouch.name', descKey: 'skillCards.voidTouch.desc', icon: '🔮', rarity: 'legendary', category: 'utility', effect: { ether: 0.5, allStats: 0.1 } },
    // Skill-specific cards
    { id: 'overdrive_extend', nameKey: 'skillCards.overdriveExtend.name', descKey: 'skillCards.overdriveExtend.desc', icon: '🔋', rarity: 'uncommon', category: 'skill', effect: { overdriveDuration: 0.5 } },
    { id: 'meteor_cluster', nameKey: 'skillCards.meteorCluster.name', descKey: 'skillCards.meteorCluster.desc', icon: '☄️', rarity: 'rare', category: 'skill', effect: { meteorCount: 3 } },
    { id: 'blackhole_gravity', nameKey: 'skillCards.blackholeGravity.name', descKey: 'skillCards.blackholeGravity.desc', icon: '🌀', rarity: 'rare', category: 'skill', effect: { blackholeRange: 0.5, blackholeDamage: 0.3 } }
];

/**
 * Card rarity weights and colors
 */
export const CARD_RARITIES = {
    common: { weight: 60, color: '#94a3b8', dustValue: 5 },
    uncommon: { weight: 25, color: '#22c55e', dustValue: 15 },
    rare: { weight: 12, color: '#3b82f6', dustValue: 40 },
    legendary: { weight: 3, color: '#fbbf24', dustValue: 100 }
};

/**
 * Card pack types for skill card system
 */
export const CARD_PACKS = [
    { id: 'basic_pack', nameKey: 'cardPacks.basic.name', cards: 3, guaranteedRarity: null, cost: { crystals: 50 } },
    { id: 'premium_pack', nameKey: 'cardPacks.premium.name', cards: 5, guaranteedRarity: 'uncommon', cost: { crystals: 150 } },
    { id: 'elite_pack', nameKey: 'cardPacks.elite.name', cards: 5, guaranteedRarity: 'rare', cost: { ether: 50 } },
    { id: 'legendary_pack', nameKey: 'cardPacks.legendary.name', cards: 3, guaranteedRarity: 'legendary', cost: { ether: 200 } }
];
