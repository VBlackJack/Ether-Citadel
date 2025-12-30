/*
 * Copyright 2025 Julien Bombled
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { t } from './i18n.js';

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
 * Dread (Chaos) level definitions
 * Higher dread = harder enemies but better rewards
 */
export const DREAD_LEVELS = [
    { level: 0, nameKey: 'dread.level0', enemyMult: 1.0, rewardMult: 1.0, color: '#94a3b8' },
    { level: 1, nameKey: 'dread.level1', enemyMult: 1.5, rewardMult: 1.3, color: '#fbbf24' },
    { level: 2, nameKey: 'dread.level2', enemyMult: 2.5, rewardMult: 1.8, color: '#f97316' },
    { level: 3, nameKey: 'dread.level3', enemyMult: 4.0, rewardMult: 2.5, color: '#ef4444' },
    { level: 4, nameKey: 'dread.level4', enemyMult: 7.0, rewardMult: 4.0, color: '#dc2626' },
    { level: 5, nameKey: 'dread.level5', enemyMult: 12.0, rewardMult: 6.0, color: '#991b1b' },
    { level: 6, nameKey: 'dread.level6', enemyMult: 20.0, rewardMult: 10.0, color: '#7f1d1d' },
    { level: 7, nameKey: 'dread.level7', enemyMult: 35.0, rewardMult: 18.0, color: '#a855f7' },
    { level: 8, nameKey: 'dread.level8', enemyMult: 60.0, rewardMult: 30.0, color: '#9333ea' },
    { level: 9, nameKey: 'dread.level9', enemyMult: 100.0, rewardMult: 50.0, color: '#6b21a8' },
    { level: 10, nameKey: 'dread.level10', enemyMult: 200.0, rewardMult: 100.0, color: '#000' }
];

/**
 * Mining resource definitions
 */
export const MINING_RESOURCES = [
    { id: 'copper', nameKey: 'mining.copper.name', icon: '🟤', baseRate: 1.0, color: '#b87333', tier: 1 },
    { id: 'iron', nameKey: 'mining.iron.name', icon: '⚫', baseRate: 0.5, color: '#71797E', tier: 1 },
    { id: 'crystal', nameKey: 'mining.crystal.name', icon: '💎', baseRate: 0.2, color: '#22d3ee', tier: 2 },
    { id: 'gold_ore', nameKey: 'mining.gold_ore.name', icon: '🟡', baseRate: 0.1, color: '#fbbf24', tier: 2 },
    { id: 'void_shard', nameKey: 'mining.void_shard.name', icon: '🟣', baseRate: 0.05, color: '#a855f7', tier: 3 },
    { id: 'starlight', nameKey: 'mining.starlight.name', icon: '✨', baseRate: 0.02, color: '#fff', tier: 3 }
];

/**
 * Forge recipes for combining relics
 */
export const FORGE_RECIPES = [
    {
        id: 'upgrade_relic',
        nameKey: 'forge.upgrade.name',
        descKey: 'forge.upgrade.desc',
        cost: { crystal: 10, void_shard: 2 },
        successRate: 0.6,
        type: 'upgrade'
    },
    {
        id: 'reroll_relic',
        nameKey: 'forge.reroll.name',
        descKey: 'forge.reroll.desc',
        cost: { crystal: 5 },
        successRate: 1.0,
        type: 'reroll'
    },
    {
        id: 'fuse_relics',
        nameKey: 'forge.fuse.name',
        descKey: 'forge.fuse.desc',
        cost: { crystal: 20, void_shard: 5, starlight: 1 },
        successRate: 0.4,
        type: 'fuse'
    },
    {
        id: 'legendary_forge',
        nameKey: 'forge.legendary.name',
        descKey: 'forge.legendary.desc',
        cost: { crystal: 100, void_shard: 25, starlight: 10 },
        successRate: 0.2,
        type: 'legendary'
    }
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
 * Dark Matter upgrade definitions
 * @type {Array<{id: string, nameKey: string, descKey: string, max: number, cost: number}>}
 */
export const DARK_MATTER_UPGRADES = [
    { id: 'berserk', nameKey: 'darkMatter.berserk.name', descKey: 'darkMatter.berserk.desc', max: 1, cost: 5 },
    { id: 'siphon', nameKey: 'darkMatter.siphon.name', descKey: 'darkMatter.siphon.desc', max: 5, cost: 10 },
    { id: 'overlord', nameKey: 'darkMatter.overlord.name', descKey: 'darkMatter.overlord.desc', max: 3, cost: 8 }
];

/**
 * Relic definitions
 * @type {Array<{id: string, nameKey: string, icon: string, descKey: string, effect: Function}>}
 */
export const RELIC_DB = [
    // Common relics (tier 1)
    { id: 'dmg_boost', nameKey: 'relics.dmg_boost.name', icon: '🗡️', descKey: 'relics.dmg_boost.desc', tier: 1, effect: (g) => g.relicMults.damage += 0.2 },
    { id: 'gold_boost', nameKey: 'relics.gold_boost.name', icon: '🪙', descKey: 'relics.gold_boost.desc', tier: 1, effect: (g) => g.relicMults.gold += 0.25 },
    { id: 'speed_boost', nameKey: 'relics.speed_boost.name', icon: '💨', descKey: 'relics.speed_boost.desc', tier: 1, effect: (g) => g.relicMults.speed += 0.15 },
    { id: 'crit_boost', nameKey: 'relics.crit_boost.name', icon: '👁️', descKey: 'relics.crit_boost.desc', tier: 1, effect: (g) => g.relicMults.critChance += 10 },
    { id: 'hp_boost', nameKey: 'relics.hp_boost.name', icon: '❤️', descKey: 'relics.hp_boost.desc', tier: 1, effect: (g) => g.relicMults.health += 0.3 },
    { id: 'skill_cd', nameKey: 'relics.skill_cd.name', icon: '⏳', descKey: 'relics.skill_cd.desc', tier: 1, effect: (g) => g.relicMults.cooldown += 0.1 },
    // Rare relics (tier 2)
    { id: 'vampiric_blade', nameKey: 'relics.vampiric_blade.name', icon: '🩸', descKey: 'relics.vampiric_blade.desc', tier: 2, effect: (g) => { g.relicMults.damage += 0.15; g.relicMults.leech += 0.05; } },
    { id: 'miners_pick', nameKey: 'relics.miners_pick.name', icon: '⛏️', descKey: 'relics.miners_pick.desc', tier: 2, effect: (g) => g.relicMults.mining += 0.5 },
    { id: 'chaos_gem', nameKey: 'relics.chaos_gem.name', icon: '💀', descKey: 'relics.chaos_gem.desc', tier: 2, effect: (g) => g.relicMults.dreadReward += 0.25 },
    { id: 'temporal_shard', nameKey: 'relics.temporal_shard.name', icon: '⚡', descKey: 'relics.temporal_shard.desc', tier: 2, effect: (g) => { g.relicMults.cooldown += 0.15; g.relicMults.speed += 0.1; } },
    // Epic relics (tier 3)
    { id: 'dragon_heart', nameKey: 'relics.dragon_heart.name', icon: '🐉', descKey: 'relics.dragon_heart.desc', tier: 3, effect: (g) => { g.relicMults.damage += 0.35; g.relicMults.health += 0.35; } },
    { id: 'void_crystal', nameKey: 'relics.void_crystal.name', icon: '🔮', descKey: 'relics.void_crystal.desc', tier: 3, effect: (g) => { g.relicMults.critChance += 20; g.relicMults.critDamage += 0.5; } },
    { id: 'phoenix_feather', nameKey: 'relics.phoenix_feather.name', icon: '🔥', descKey: 'relics.phoenix_feather.desc', tier: 3, effect: (g) => g.relicMults.revive = true },
    // Legendary relics (tier 4) - only from forge
    { id: 'infinity_stone', nameKey: 'relics.infinity_stone.name', icon: '💎', descKey: 'relics.infinity_stone.desc', tier: 4, effect: (g) => { g.relicMults.damage += 0.5; g.relicMults.health += 0.5; g.relicMults.gold += 0.5; } },
    { id: 'time_loop', nameKey: 'relics.time_loop.name', icon: '🌀', descKey: 'relics.time_loop.desc', tier: 4, effect: (g) => { g.relicMults.cooldown += 0.3; g.relicMults.autoSkill = true; } },
    { id: 'world_eater', nameKey: 'relics.world_eater.name', icon: '🌑', descKey: 'relics.world_eater.desc', tier: 4, effect: (g) => { g.relicMults.damage += 1.0; g.relicMults.health -= 0.3; } }
];

/**
 * Achievement definitions
 * @type {Array<{id: string, nameKey: string, descKey: string, cond: Function, reward: number}>}
 */
export const ACHIEVEMENTS_DB = [
    { id: 'kill_100', nameKey: 'achievements.kill_100.name', descKey: 'achievements.kill_100.desc', cond: (s) => s.kills >= 100, reward: 5 },
    { id: 'kill_1000', nameKey: 'achievements.kill_1000.name', descKey: 'achievements.kill_1000.desc', cond: (s) => s.kills >= 1000, reward: 25 },
    { id: 'kill_5000', nameKey: 'achievements.kill_5000.name', descKey: 'achievements.kill_5000.desc', cond: (s) => s.kills >= 5000, reward: 100 },
    { id: 'boss_5', nameKey: 'achievements.boss_5.name', descKey: 'achievements.boss_5.desc', cond: (s) => s.bosses >= 5, reward: 15 },
    { id: 'boss_50', nameKey: 'achievements.boss_50.name', descKey: 'achievements.boss_50.desc', cond: (s) => s.bosses >= 50, reward: 100 },
    { id: 'wave_20', nameKey: 'achievements.wave_20.name', descKey: 'achievements.wave_20.desc', cond: (s) => s.maxWave >= 20, reward: 10 },
    { id: 'wave_50', nameKey: 'achievements.wave_50.name', descKey: 'achievements.wave_50.desc', cond: (s) => s.maxWave >= 50, reward: 50 },
    { id: 'gold_10k', nameKey: 'achievements.gold_10k.name', descKey: 'achievements.gold_10k.desc', cond: (s) => s.totalGold >= 10000, reward: 20 }
];

/**
 * Enemy type definitions
 * @type {Object<string, {color: string, hpMult: number, speedMult: number, scale: number, nameKey: string, descKey: string}>}
 */
export const ENEMY_TYPES = {
    NORMAL: { color: 'hsl(0, 70%, 60%)', hpMult: 1, speedMult: 1, scale: 1, nameKey: 'enemies.NORMAL.name', descKey: 'enemies.NORMAL.desc' },
    SPEEDY: { color: '#fbbf24', hpMult: 0.6, speedMult: 1.8, scale: 0.8, nameKey: 'enemies.SPEEDY.name', descKey: 'enemies.SPEEDY.desc' },
    TANK: { color: '#64748b', hpMult: 2.5, speedMult: 0.6, scale: 1.4, nameKey: 'enemies.TANK.name', descKey: 'enemies.TANK.desc' },
    BOSS: { color: '#ef4444', hpMult: 12, speedMult: 0.4, scale: 2.5, nameKey: 'enemies.BOSS.name', descKey: 'enemies.BOSS.desc' },
    HEALER: { color: '#4ade80', hpMult: 1.5, speedMult: 0.7, scale: 1.1, nameKey: 'enemies.HEALER.name', descKey: 'enemies.HEALER.desc' },
    SPLITTER: { color: '#a855f7', hpMult: 1.2, speedMult: 0.8, scale: 1.3, nameKey: 'enemies.SPLITTER.name', descKey: 'enemies.SPLITTER.desc' },
    MINI: { color: '#d8b4fe', hpMult: 0.4, speedMult: 1.2, scale: 0.6, nameKey: 'enemies.MINI.name', descKey: 'enemies.MINI.desc' },
    THIEF: { color: '#94a3b8', hpMult: 0.8, speedMult: 2.5, scale: 0.9, nameKey: 'enemies.THIEF.name', descKey: 'enemies.THIEF.desc' },
    PHANTOM: { color: '#ffffff', hpMult: 0.8, speedMult: 1.0, scale: 1.0, nameKey: 'enemies.PHANTOM.name', descKey: 'enemies.PHANTOM.desc' }
};

/**
 * Rune type definitions
 * @type {Array<{id: string, nameKey: string, color: string, icon: string, duration: number, descKey: string, instant?: boolean}>}
 */
export const RUNE_TYPES = [
    { id: 'rage', nameKey: 'runes.rage.name', color: '#ef4444', icon: '\ud83d\udd34', duration: 10000, descKey: 'runes.rage.desc' },
    { id: 'midas', nameKey: 'runes.midas.name', color: '#fbbf24', icon: '\ud83d\udfe1', duration: 10000, descKey: 'runes.midas.desc' },
    { id: 'heal', nameKey: 'runes.heal.name', color: '#4ade80', icon: '\ud83d\udfe2', duration: 0, descKey: 'runes.heal.desc', instant: true }
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

/**
 * Production building definitions for passive resource generation
 */
export const PRODUCTION_BUILDINGS = [
    { id: 'gold_mine', nameKey: 'production.gold_mine.name', descKey: 'production.gold_mine.desc', icon: '🏭', resource: 'gold', baseRate: 1, baseCost: 100, costMult: 1.5, maxLevel: 50 },
    { id: 'crystal_extractor', nameKey: 'production.crystal_extractor.name', descKey: 'production.crystal_extractor.desc', icon: '💎', resource: 'crystal', baseRate: 0.1, baseCost: 500, costMult: 1.8, maxLevel: 25 },
    { id: 'ether_condenser', nameKey: 'production.ether_condenser.name', descKey: 'production.ether_condenser.desc', icon: '🔮', resource: 'ether', baseRate: 0.05, baseCost: 1000, costMult: 2.0, maxLevel: 10 },
    { id: 'void_harvester', nameKey: 'production.void_harvester.name', descKey: 'production.void_harvester.desc', icon: '🌑', resource: 'void_shard', baseRate: 0.02, baseCost: 5000, costMult: 2.5, maxLevel: 5 }
];

/**
 * Aura types for turret buffs
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

/**
 * Daily quest type definitions
 */
export const DAILY_QUEST_TYPES = [
    { id: 'kill_enemies', nameKey: 'quests.kill_enemies.name', descKey: 'quests.kill_enemies.desc', icon: '💀', targetBase: 100, targetMult: 1.5, rewardType: 'gold', rewardBase: 500 },
    { id: 'reach_wave', nameKey: 'quests.reach_wave.name', descKey: 'quests.reach_wave.desc', icon: '🌊', targetBase: 10, targetMult: 1.2, rewardType: 'crystals', rewardBase: 10 },
    { id: 'kill_bosses', nameKey: 'quests.kill_bosses.name', descKey: 'quests.kill_bosses.desc', icon: '👑', targetBase: 1, targetMult: 1.0, rewardType: 'ether', rewardBase: 5 },
    { id: 'collect_gold', nameKey: 'quests.collect_gold.name', descKey: 'quests.collect_gold.desc', icon: '💰', targetBase: 1000, targetMult: 2.0, rewardType: 'crystals', rewardBase: 15 },
    { id: 'use_skills', nameKey: 'quests.use_skills.name', descKey: 'quests.use_skills.desc', icon: '✨', targetBase: 10, targetMult: 1.3, rewardType: 'gold', rewardBase: 300 },
    { id: 'upgrade_turrets', nameKey: 'quests.upgrade_turrets.name', descKey: 'quests.upgrade_turrets.desc', icon: '🔧', targetBase: 5, targetMult: 1.2, rewardType: 'crystals', rewardBase: 20 }
];

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
 * Game speed options
 */
export const GAME_SPEEDS = [
    { id: 'x1', mult: 1, nameKey: 'speeds.x1' },
    { id: 'x2', mult: 2, nameKey: 'speeds.x2' },
    { id: 'x4', mult: 4, nameKey: 'speeds.x4' },
    { id: 'x8', mult: 8, nameKey: 'speeds.x8' },
    { id: 'x16', mult: 16, nameKey: 'speeds.x16' }
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
 * School - Turret unlock and upgrade system
 */
export const SCHOOL_TURRETS = [
    { id: 'sentry', nameKey: 'school.sentry.name', descKey: 'school.sentry.desc', icon: '🔫', unlockCost: 0, maxLevel: 10, levelCost: 5, stats: { damage: 1.0, speed: 1.0, range: 1.0 } },
    { id: 'blaster', nameKey: 'school.blaster.name', descKey: 'school.blaster.desc', icon: '💥', unlockCost: 50, maxLevel: 10, levelCost: 10, stats: { damage: 1.5, speed: 1.2, range: 0.8 } },
    { id: 'laser', nameKey: 'school.laser.name', descKey: 'school.laser.desc', icon: '🔴', unlockCost: 200, maxLevel: 15, levelCost: 25, stats: { damage: 2.0, speed: 2.0, range: 1.0 } },
    { id: 'solidifier', nameKey: 'school.solidifier.name', descKey: 'school.solidifier.desc', icon: '❄️', unlockCost: 300, maxLevel: 10, levelCost: 20, stats: { damage: 0.5, speed: 0.8, range: 1.2, slow: 0.5 } },
    { id: 'swamper', nameKey: 'school.swamper.name', descKey: 'school.swamper.desc', icon: '🌊', unlockCost: 500, maxLevel: 15, levelCost: 40, stats: { damage: 0.8, speed: 0.5, range: 2.0, aoe: 100 } },
    { id: 'rocket', nameKey: 'school.rocket.name', descKey: 'school.rocket.desc', icon: '🚀', unlockCost: 1000, maxLevel: 10, levelCost: 75, stats: { damage: 3.0, speed: 0.3, range: 1.5, aoe: 60 } },
    { id: 'sniper', nameKey: 'school.sniper.name', descKey: 'school.sniper.desc', icon: '🎯', unlockCost: 1500, maxLevel: 10, levelCost: 100, stats: { damage: 5.0, speed: 0.2, range: 3.0 } },
    { id: 'inferno', nameKey: 'school.inferno.name', descKey: 'school.inferno.desc', icon: '🔥', unlockCost: 5000, maxLevel: 20, levelCost: 200, stats: { damage: 4.0, speed: 1.0, range: 1.0, aoe: 80, dot: true } }
];

/**
 * Office - Temporary boost system
 */
export const OFFICE_BOOSTS = [
    { id: 'damage_boost', nameKey: 'office.damage.name', descKey: 'office.damage.desc', icon: '⚔️', mult: 2.0, duration: 300, baseCost: 10, effect: 'damage' },
    { id: 'gold_boost', nameKey: 'office.gold.name', descKey: 'office.gold.desc', icon: '💰', mult: 3.0, duration: 300, baseCost: 15, effect: 'gold' },
    { id: 'speed_boost', nameKey: 'office.speed.name', descKey: 'office.speed.desc', icon: '⚡', mult: 1.5, duration: 300, baseCost: 20, effect: 'attackSpeed' },
    { id: 'xp_boost', nameKey: 'office.xp.name', descKey: 'office.xp.desc', icon: '📈', mult: 2.0, duration: 300, baseCost: 25, effect: 'xp' },
    { id: 'crit_boost', nameKey: 'office.crit.name', descKey: 'office.crit.desc', icon: '💥', mult: 2.0, duration: 180, baseCost: 30, effect: 'critChance' }
];

/**
 * Awakening bonuses (unlocked at Dread 6)
 */
export const AWAKENING_BONUSES = [
    { id: 'wave_skip_100', nameKey: 'awakening.waveSkip.name', descKey: 'awakening.waveSkip.desc', icon: '🚀', effect: { waveSkip: 100 } },
    { id: 'auto_all', nameKey: 'awakening.autoAll.name', descKey: 'awakening.autoAll.desc', icon: '🤖', effect: { autoPlacement: true, autoBuy: true } },
    { id: 'prestige_x2', nameKey: 'awakening.prestigeX2.name', descKey: 'awakening.prestigeX2.desc', icon: '👑', effect: { prestigeMult: 2.0 } },
    { id: 'production_x3', nameKey: 'awakening.productionX3.name', descKey: 'awakening.productionX3.desc', icon: '🏭', effect: { productionMult: 3.0 } },
    { id: 'starting_gold', nameKey: 'awakening.startGold.name', descKey: 'awakening.startGold.desc', icon: '💎', effect: { startGold: 10000 } }
];

/**
 * Turret slot system - positions around the castle
 * Each slot can hold a turret from the School system
 * Angles spread evenly to avoid overlap
 */
export const TURRET_SLOTS = [
    { id: 0, angle: -45, distance: 75, free: true },
    { id: 1, angle: 0, distance: 90, free: true },
    { id: 2, angle: 45, distance: 75, free: true },
    { id: 3, angle: -90, distance: 85, free: false, cost: 500 },
    { id: 4, angle: 90, distance: 85, free: false, cost: 1000 },
    { id: 5, angle: -135, distance: 80, free: false, cost: 2500 },
    { id: 6, angle: 135, distance: 80, free: false, cost: 5000 },
    { id: 7, angle: 180, distance: 95, free: false, cost: 10000 }
];

/**
 * Upgrade definitions factory
 * @returns {Array}
 */
export function createUpgrades() {
    return [
        { id: 'damage', nameKey: 'upgrades.damage.name', descKey: 'upgrades.damage.desc', category: 0, baseCost: 10, costMult: 1.5, level: 1, getValue: (lvl) => Math.floor(7 * Math.pow(1.2, lvl - 1)), icon: '\u2694\ufe0f' },
        { id: 'speed', nameKey: 'upgrades.speed.name', descKey: 'upgrades.speed.desc', category: 0, baseCost: 25, costMult: 1.6, level: 1, getValue: (lvl) => 1000 * Math.pow(0.88, lvl - 1), icon: '\u26a1' },
        { id: 'crit', nameKey: 'upgrades.crit.name', descKey: 'upgrades.crit.desc', category: 0, baseCost: 100, costMult: 1.8, level: 0, getValue: (lvl) => ({ chance: Math.min(150, lvl * 2), mult: 2 + (lvl * 0.1) }), icon: '\ud83d\udca5' },
        { id: 'range', nameKey: 'upgrades.range.name', descKey: 'upgrades.range.desc', category: 0, baseCost: 30, costMult: 1.5, level: 1, getValue: (lvl) => 300 + (lvl * 60), icon: '\ud83c\udfaf' },
        { id: 'multishot', nameKey: 'upgrades.multishot.name', descKey: 'upgrades.multishot.desc', category: 0, baseCost: 200, costMult: 2.2, level: 0, getValue: (lvl) => Math.min(60, lvl * 6), icon: '\ud83c\udff9' },
        { id: 'health', nameKey: 'upgrades.health.name', descKey: 'upgrades.health.desc', category: 1, baseCost: 15, costMult: 1.4, level: 1, getValue: (lvl) => Math.floor(100 * Math.pow(1.25, lvl - 1)), icon: '\u2764\ufe0f' },
        { id: 'regen', nameKey: 'upgrades.regen.name', descKey: 'upgrades.regen.desc', category: 1, baseCost: 50, costMult: 1.8, level: 0, getValue: (lvl) => lvl === 0 ? 0 : Math.floor(2 * Math.pow(1.4, lvl - 1)), icon: '\ud83d\udd27' },
        { id: 'leech', nameKey: 'upgrades.leech.name', descKey: 'upgrades.leech.desc', category: 1, baseCost: 2000, costMult: 2.5, level: 0, getValue: (lvl) => lvl * 2, icon: '\ud83e\ude78' },
        { id: 'shield', nameKey: 'upgrades.shield.name', descKey: 'upgrades.shield.desc', category: 1, baseCost: 1500, costMult: 1.6, level: 0, getValue: (lvl) => lvl * 50, icon: '\ud83d\udee1\ufe0f' },
        { id: 'armor', nameKey: 'upgrades.armor.name', descKey: 'upgrades.armor.desc', category: 1, baseCost: 3000, costMult: 2.0, level: 0, maxLevel: 50, getValue: (lvl) => Math.min(0.75, lvl * 0.015), icon: '\ud83e\uddf1' },
        { id: 'turret', nameKey: 'upgrades.turret.name', descKey: 'upgrades.turret.desc', category: 2, baseCost: 300, costMult: 2.5, level: 0, maxLevel: 4, getValue: (lvl) => lvl, icon: '\ud83d\udd2b' },
        { id: 'artillery', nameKey: 'upgrades.artillery.name', descKey: 'upgrades.artillery.desc', category: 2, baseCost: 4000, costMult: 2.5, level: 0, maxLevel: 1, getValue: (lvl) => lvl, icon: '\ud83d\udca3' },
        { id: 'rocket', nameKey: 'upgrades.rocket.name', descKey: 'upgrades.rocket.desc', category: 2, baseCost: 6000, costMult: 2.5, level: 0, maxLevel: 1, getValue: (lvl) => lvl, icon: '\ud83d\ude80' },
        { id: 'tesla', nameKey: 'upgrades.tesla.name', descKey: 'upgrades.tesla.desc', category: 2, baseCost: 8000, costMult: 2.5, level: 0, maxLevel: 1, getValue: (lvl) => lvl, icon: '\u26a1' },
        { id: 'orbital', nameKey: 'upgrades.orbital.name', descKey: 'upgrades.orbital.desc', category: 2, baseCost: 3000, costMult: 1.8, level: 0, maxLevel: 10, getValue: (lvl) => lvl > 0 ? (5000 - lvl * 300) : 0, icon: '\ud83d\udef0\ufe0f' },
        { id: 'ice', nameKey: 'upgrades.ice.name', descKey: 'upgrades.ice.desc', category: 2, baseCost: 500, costMult: 2.0, level: 0, maxLevel: 1, getValue: (lvl) => lvl > 0, icon: '\u2744\ufe0f' },
        { id: 'poison', nameKey: 'upgrades.poison.name', descKey: 'upgrades.poison.desc', category: 2, baseCost: 600, costMult: 2.0, level: 0, maxLevel: 1, getValue: (lvl) => lvl > 0, icon: '\u2620\ufe0f' },
        { id: 'stasis', nameKey: 'upgrades.stasis.name', descKey: 'upgrades.stasis.desc', category: 2, baseCost: 1500, costMult: 2.0, level: 0, maxLevel: 5, getValue: (lvl) => lvl * 5, icon: '\u23f3' },
        { id: 'bounce', nameKey: 'upgrades.bounce.name', descKey: 'upgrades.bounce.desc', category: 2, baseCost: 1200, costMult: 2.5, level: 0, maxLevel: 3, getValue: (lvl) => lvl, icon: '\u2934\ufe0f' },
        { id: 'blast', nameKey: 'upgrades.blast.name', descKey: 'upgrades.blast.desc', category: 2, baseCost: 1500, costMult: 2.5, level: 0, maxLevel: 5, getValue: (lvl) => lvl * 30, icon: '\ud83d\udca3' }
    ];
}

/**
 * Meta upgrade definitions factory
 * @returns {Array}
 */
export function createMetaUpgrades() {
    return [
        { id: 'startGold', nameKey: 'metaUpgrades.startGold.name', descKey: 'metaUpgrades.startGold.desc', baseCost: 1, costMult: 1.5, level: 0, maxLevel: 20, getEffect: (lvl) => lvl * 50, format: (v) => `+${v} ${t('game.gold')}`, icon: '\ud83d\udcb0' },
        { id: 'goldMult', nameKey: 'metaUpgrades.goldMult.name', descKey: 'metaUpgrades.goldMult.desc', baseCost: 5, costMult: 2, level: 0, maxLevel: 10, getEffect: (lvl) => 1 + (lvl * 0.1), format: (v) => `x${v.toFixed(1)}`, icon: '\ud83e\udd11' },
        { id: 'damageMult', nameKey: 'metaUpgrades.damageMult.name', descKey: 'metaUpgrades.damageMult.desc', baseCost: 3, costMult: 1.8, level: 0, maxLevel: 50, getEffect: (lvl) => 1 + (lvl * 0.1), format: (v) => `x${v.toFixed(1)}`, icon: '\ud83d\udcaa' },
        { id: 'healthMult', nameKey: 'metaUpgrades.healthMult.name', descKey: 'metaUpgrades.healthMult.desc', baseCost: 2, costMult: 1.5, level: 0, maxLevel: 50, getEffect: (lvl) => 1 + (lvl * 0.1), format: (v) => `x${v.toFixed(1)}`, icon: '\ud83c\udff0' },
        { id: 'unlockAuto', nameKey: 'metaUpgrades.unlockAuto.name', descKey: 'metaUpgrades.unlockAuto.desc', baseCost: 10, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '\ud83d\udd04' },
        { id: 'unlockAI', nameKey: 'metaUpgrades.unlockAI.name', descKey: 'metaUpgrades.unlockAI.desc', baseCost: 25, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '\ud83e\udd16' },
        { id: 'unlockDrone', nameKey: 'metaUpgrades.unlockDrone.name', descKey: 'metaUpgrades.unlockDrone.desc', baseCost: 50, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '\ud83d\udef8' }
    ];
}

/**
 * Get translated name for a data item
 * @param {Object} item - Item with nameKey
 * @returns {string}
 */
export function getName(item) {
    return t(item.nameKey);
}

/**
 * Get translated description for a data item
 * @param {Object} item - Item with descKey
 * @returns {string}
 */
export function getDesc(item) {
    return t(item.descKey);
}
