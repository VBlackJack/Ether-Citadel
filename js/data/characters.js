/*
 * Copyright 2025 Julien Bombled
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Character class system
 */
export const CHARACTER_CLASSES = [
    {
        id: 'defender',
        nameKey: 'classes.defender.name',
        descKey: 'classes.defender.desc',
        icon: '🛡️',
        color: '#3b82f6',
        startingBonus: { health: 0.25, armor: 0.15, regen: 0.2 },
        passives: [
            { id: 'fortitude', nameKey: 'classes.defender.fortitude', effect: { healthPerLevel: 0.02 }, maxLevel: 25 },
            { id: 'iron_skin', nameKey: 'classes.defender.ironSkin', effect: { armorPerLevel: 0.01 }, maxLevel: 20 },
            { id: 'guardian', nameKey: 'classes.defender.guardian', effect: { shieldOnHit: 0.05 }, maxLevel: 15 },
            { id: 'last_stand', nameKey: 'classes.defender.lastStand', effect: { damageReductionLowHp: 0.03 }, maxLevel: 20 },
            { id: 'immortal', nameKey: 'classes.defender.immortal', effect: { reviveChance: 0.05 }, maxLevel: 5 }
        ],
        ultimateSkill: 'mirrorshield'
    },
    {
        id: 'berserker',
        nameKey: 'classes.berserker.name',
        descKey: 'classes.berserker.desc',
        icon: '⚔️',
        color: '#ef4444',
        startingBonus: { damage: 0.2, critChance: 10, critDamage: 0.25 },
        passives: [
            { id: 'fury', nameKey: 'classes.berserker.fury', effect: { damagePerLevel: 0.02 }, maxLevel: 25 },
            { id: 'bloodlust', nameKey: 'classes.berserker.bloodlust', effect: { leechPerLevel: 0.005 }, maxLevel: 20 },
            { id: 'rampage', nameKey: 'classes.berserker.rampage', effect: { damageOnKill: 0.01, stackMax: 50 }, maxLevel: 15 },
            { id: 'executioner', nameKey: 'classes.berserker.executioner', effect: { damageToLowHp: 0.04 }, maxLevel: 20 },
            { id: 'warlord', nameKey: 'classes.berserker.warlord', effect: { allDamage: 0.1 }, maxLevel: 5 }
        ],
        ultimateSkill: 'voidrift'
    },
    {
        id: 'mage',
        nameKey: 'classes.mage.name',
        descKey: 'classes.mage.desc',
        icon: '🔮',
        color: '#a855f7',
        startingBonus: { skillPower: 0.3, cooldown: 0.15, ether: 0.2 },
        passives: [
            { id: 'arcane_power', nameKey: 'classes.mage.arcanePower', effect: { skillPowerPerLevel: 0.03 }, maxLevel: 25 },
            { id: 'quick_cast', nameKey: 'classes.mage.quickCast', effect: { cooldownPerLevel: 0.02 }, maxLevel: 20 },
            { id: 'mana_surge', nameKey: 'classes.mage.manaSurge', effect: { runeChancePerLevel: 0.02 }, maxLevel: 15 },
            { id: 'time_warp', nameKey: 'classes.mage.timeWarp', effect: { skillDurationPerLevel: 0.03 }, maxLevel: 20 },
            { id: 'archmage', nameKey: 'classes.mage.archmage', effect: { doubleSkillChance: 0.05 }, maxLevel: 5 }
        ],
        ultimateSkill: 'meteorstorm'
    },
    {
        id: 'ranger',
        nameKey: 'classes.ranger.name',
        descKey: 'classes.ranger.desc',
        icon: '🏹',
        color: '#22c55e',
        startingBonus: { fireRate: 0.2, range: 0.15, critChance: 15 },
        passives: [
            { id: 'precision', nameKey: 'classes.ranger.precision', effect: { critChancePerLevel: 1 }, maxLevel: 25 },
            { id: 'rapid_fire', nameKey: 'classes.ranger.rapidFire', effect: { fireRatePerLevel: 0.015 }, maxLevel: 20 },
            { id: 'eagle_eye', nameKey: 'classes.ranger.eagleEye', effect: { rangePerLevel: 0.02 }, maxLevel: 15 },
            { id: 'multishot', nameKey: 'classes.ranger.multishot', effect: { projectileChance: 0.02 }, maxLevel: 20 },
            { id: 'sniper', nameKey: 'classes.ranger.sniper', effect: { critDamagePerLevel: 0.1 }, maxLevel: 5 }
        ],
        ultimateSkill: 'timewarp'
    },
    {
        id: 'merchant',
        nameKey: 'classes.merchant.name',
        descKey: 'classes.merchant.desc',
        icon: '💰',
        color: '#fbbf24',
        startingBonus: { gold: 0.3, crystals: 0.2, production: 0.25 },
        passives: [
            { id: 'gold_sense', nameKey: 'classes.merchant.goldSense', effect: { goldPerLevel: 0.03 }, maxLevel: 25 },
            { id: 'treasure_hunter', nameKey: 'classes.merchant.treasureHunter', effect: { relicChancePerLevel: 0.02 }, maxLevel: 20 },
            { id: 'efficient', nameKey: 'classes.merchant.efficient', effect: { upgradeCostPerLevel: -0.01 }, maxLevel: 15 },
            { id: 'lucky', nameKey: 'classes.merchant.lucky', effect: { doubleGoldChance: 0.02 }, maxLevel: 20 },
            { id: 'tycoon', nameKey: 'classes.merchant.tycoon', effect: { passiveGoldPerLevel: 1 }, maxLevel: 5 }
        ],
        ultimateSkill: 'earthquake'
    }
];

/**
 * Equipment slots and types
 */
export const EQUIPMENT_SLOTS = ['head', 'chest', 'hands', 'feet', 'accessory1', 'accessory2'];

export const EQUIPMENT_TYPES = {
    head: [
        { id: 'iron_helm', nameKey: 'equipment.ironHelm.name', descKey: 'equipment.ironHelm.desc', icon: '🪖', tier: 1, stats: { health: 0.05, armor: 0.02 } },
        { id: 'crystal_crown', nameKey: 'equipment.crystalCrown.name', descKey: 'equipment.crystalCrown.desc', icon: '👑', tier: 2, stats: { health: 0.1, skillPower: 0.1 } },
        { id: 'dragon_helm', nameKey: 'equipment.dragonHelm.name', descKey: 'equipment.dragonHelm.desc', icon: '🐲', tier: 3, stats: { health: 0.2, damage: 0.15, armor: 0.1 } },
        { id: 'void_crown', nameKey: 'equipment.voidCrown.name', descKey: 'equipment.voidCrown.desc', icon: '👁️', tier: 4, stats: { health: 0.3, skillPower: 0.25, ether: 0.2 } }
    ],
    chest: [
        { id: 'leather_armor', nameKey: 'equipment.leatherArmor.name', descKey: 'equipment.leatherArmor.desc', icon: '🦺', tier: 1, stats: { health: 0.1, armor: 0.05 } },
        { id: 'chainmail', nameKey: 'equipment.chainmail.name', descKey: 'equipment.chainmail.desc', icon: '⛓️', tier: 2, stats: { health: 0.15, armor: 0.1, regen: 0.1 } },
        { id: 'dragon_plate', nameKey: 'equipment.dragonPlate.name', descKey: 'equipment.dragonPlate.desc', icon: '🛡️', tier: 3, stats: { health: 0.25, armor: 0.2, damage: 0.1 } },
        { id: 'celestial_robe', nameKey: 'equipment.celestialRobe.name', descKey: 'equipment.celestialRobe.desc', icon: '✨', tier: 4, stats: { health: 0.2, skillPower: 0.3, cooldown: 0.2 } }
    ],
    hands: [
        { id: 'leather_gloves', nameKey: 'equipment.leatherGloves.name', descKey: 'equipment.leatherGloves.desc', icon: '🧤', tier: 1, stats: { damage: 0.05, fireRate: 0.05 } },
        { id: 'steel_gauntlets', nameKey: 'equipment.steelGauntlets.name', descKey: 'equipment.steelGauntlets.desc', icon: '🥊', tier: 2, stats: { damage: 0.1, critChance: 5 } },
        { id: 'dragon_claws', nameKey: 'equipment.dragonClaws.name', descKey: 'equipment.dragonClaws.desc', icon: '🐉', tier: 3, stats: { damage: 0.2, critChance: 10, critDamage: 0.3 } },
        { id: 'void_grips', nameKey: 'equipment.voidGrips.name', descKey: 'equipment.voidGrips.desc', icon: '🌀', tier: 4, stats: { damage: 0.25, fireRate: 0.2, leech: 0.1 } }
    ],
    feet: [
        { id: 'leather_boots', nameKey: 'equipment.leatherBoots.name', descKey: 'equipment.leatherBoots.desc', icon: '👢', tier: 1, stats: { speed: 0.05, dodge: 0.02 } },
        { id: 'swift_boots', nameKey: 'equipment.swiftBoots.name', descKey: 'equipment.swiftBoots.desc', icon: '👟', tier: 2, stats: { speed: 0.1, cooldown: 0.05 } },
        { id: 'dragon_greaves', nameKey: 'equipment.dragonGreaves.name', descKey: 'equipment.dragonGreaves.desc', icon: '🦶', tier: 3, stats: { speed: 0.15, dodge: 0.1, health: 0.1 } },
        { id: 'astral_steps', nameKey: 'equipment.astralSteps.name', descKey: 'equipment.astralSteps.desc', icon: '🌟', tier: 4, stats: { speed: 0.25, dodge: 0.15, skillPower: 0.15 } }
    ],
    accessory1: [
        { id: 'copper_ring', nameKey: 'equipment.copperRing.name', descKey: 'equipment.copperRing.desc', icon: '💍', tier: 1, stats: { gold: 0.1 } },
        { id: 'silver_amulet', nameKey: 'equipment.silverAmulet.name', descKey: 'equipment.silverAmulet.desc', icon: '📿', tier: 2, stats: { gold: 0.15, crystals: 0.1 } },
        { id: 'dragon_pendant', nameKey: 'equipment.dragonPendant.name', descKey: 'equipment.dragonPendant.desc', icon: '🔱', tier: 3, stats: { gold: 0.25, damage: 0.15, health: 0.1 } },
        { id: 'cosmic_orb', nameKey: 'equipment.cosmicOrb.name', descKey: 'equipment.cosmicOrb.desc', icon: '🔮', tier: 4, stats: { allStats: 0.1, ether: 0.25 } }
    ],
    accessory2: [
        { id: 'lucky_charm', nameKey: 'equipment.luckyCharm.name', descKey: 'equipment.luckyCharm.desc', icon: '🍀', tier: 1, stats: { critChance: 3 } },
        { id: 'crystal_pendant', nameKey: 'equipment.crystalPendant.name', descKey: 'equipment.crystalPendant.desc', icon: '💎', tier: 2, stats: { crystals: 0.2, skillPower: 0.1 } },
        { id: 'war_medal', nameKey: 'equipment.warMedal.name', descKey: 'equipment.warMedal.desc', icon: '🎖️', tier: 3, stats: { damage: 0.2, critDamage: 0.3 } },
        { id: 'infinity_stone', nameKey: 'equipment.infinityStone.name', descKey: 'equipment.infinityStone.desc', icon: '💠', tier: 4, stats: { allStats: 0.15, cooldown: 0.15 } }
    ]
};

/**
 * Pet/Companion system
 */
export const PETS = [
    {
        id: 'fire_sprite',
        nameKey: 'pets.fireSprite.name',
        descKey: 'pets.fireSprite.desc',
        icon: '🔥',
        color: '#ef4444',
        tier: 1,
        passiveBonus: { damage: 0.05 },
        activeAbility: { type: 'fireball', damage: 50, cooldown: 10000 },
        evolutionMaterial: 'ember_essence'
    },
    {
        id: 'frost_fairy',
        nameKey: 'pets.frostFairy.name',
        descKey: 'pets.frostFairy.desc',
        icon: '❄️',
        color: '#22d3ee',
        tier: 1,
        passiveBonus: { slow: 0.1 },
        activeAbility: { type: 'freeze', duration: 2000, cooldown: 15000 },
        evolutionMaterial: 'frost_crystal'
    },
    {
        id: 'gold_pixie',
        nameKey: 'pets.goldPixie.name',
        descKey: 'pets.goldPixie.desc',
        icon: '✨',
        color: '#fbbf24',
        tier: 1,
        passiveBonus: { gold: 0.1 },
        activeAbility: { type: 'gold_burst', goldMult: 3, duration: 5000, cooldown: 20000 },
        evolutionMaterial: 'gold_dust'
    },
    {
        id: 'shadow_cat',
        nameKey: 'pets.shadowCat.name',
        descKey: 'pets.shadowCat.desc',
        icon: '🐱',
        color: '#a855f7',
        tier: 2,
        passiveBonus: { critChance: 5, critDamage: 0.15 },
        activeAbility: { type: 'shadow_strike', damage: 200, targets: 3, cooldown: 12000 },
        evolutionMaterial: 'shadow_essence'
    },
    {
        id: 'storm_hawk',
        nameKey: 'pets.stormHawk.name',
        descKey: 'pets.stormHawk.desc',
        icon: '🦅',
        color: '#3b82f6',
        tier: 2,
        passiveBonus: { fireRate: 0.1, range: 0.1 },
        activeAbility: { type: 'lightning_strike', damage: 150, chain: 5, cooldown: 10000 },
        evolutionMaterial: 'storm_feather'
    },
    {
        id: 'void_serpent',
        nameKey: 'pets.voidSerpent.name',
        descKey: 'pets.voidSerpent.desc',
        icon: '🐍',
        color: '#6d28d9',
        tier: 3,
        passiveBonus: { damage: 0.15, leech: 0.05 },
        activeAbility: { type: 'void_bite', damagePercent: 0.1, cooldown: 8000 },
        evolutionMaterial: 'void_scale'
    },
    {
        id: 'phoenix',
        nameKey: 'pets.phoenix.name',
        descKey: 'pets.phoenix.desc',
        icon: '🦅',
        color: '#f97316',
        tier: 3,
        passiveBonus: { damage: 0.1, regen: 0.2 },
        activeAbility: { type: 'rebirth', reviveHealth: 0.5, cooldown: 60000 },
        evolutionMaterial: 'phoenix_feather'
    },
    {
        id: 'dragon_whelp',
        nameKey: 'pets.dragonWhelp.name',
        descKey: 'pets.dragonWhelp.desc',
        icon: '🐲',
        color: '#dc2626',
        tier: 4,
        passiveBonus: { damage: 0.2, fireRate: 0.1, health: 0.1 },
        activeAbility: { type: 'dragon_breath', damage: 300, aoe: 150, cooldown: 15000 },
        evolutionMaterial: 'dragon_scale'
    },
    {
        id: 'celestial_guardian',
        nameKey: 'pets.celestialGuardian.name',
        descKey: 'pets.celestialGuardian.desc',
        icon: '👼',
        color: '#fff',
        tier: 4,
        passiveBonus: { allStats: 0.1, ether: 0.15 },
        activeAbility: { type: 'divine_shield', invulnerable: 3000, cooldown: 45000 },
        evolutionMaterial: 'celestial_shard'
    }
];
