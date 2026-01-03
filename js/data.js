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

/**
 * Data Module
 *
 * Note: Modular data files are available in ./data/ directory:
 * - enemies.js: ENEMY_TYPES, BOSS_MECHANICS, etc.
 * - turrets.js: TURRET_TIERS, SCHOOL_TURRETS, etc.
 * - resources.js: MINING_RESOURCES, FORGE_RECIPES, etc.
 * - progression.js: PRESTIGE_UPGRADES, TALENT_TREES, etc.
 * - content.js: CHALLENGES, CAMPAIGN_MISSIONS, etc.
 * - upgrades.js: createUpgrades, createMetaUpgrades
 * - misc.js: RELIC_DB, ACHIEVEMENTS_DB, etc.
 *
 * New code can import from './data/index.js' for modular access.
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
    { level: 0, nameKey: 'dread.level0', enemyMult: 1.0, rewardMult: 1.0, color: '#94a3b8', unlockWave: 0 },
    { level: 1, nameKey: 'dread.level1', enemyMult: 1.5, rewardMult: 1.5, color: '#fbbf24', unlockWave: 10 },
    { level: 2, nameKey: 'dread.level2', enemyMult: 2.0, rewardMult: 2.0, color: '#f97316', unlockWave: 20 },
    { level: 3, nameKey: 'dread.level3', enemyMult: 3.0, rewardMult: 3.0, color: '#ef4444', unlockWave: 30 },
    { level: 4, nameKey: 'dread.level4', enemyMult: 5.0, rewardMult: 5.0, color: '#dc2626', unlockWave: 40 },
    { level: 5, nameKey: 'dread.level5', enemyMult: 8.0, rewardMult: 8.0, color: '#991b1b', unlockWave: 50 },
    { level: 6, nameKey: 'dread.level6', enemyMult: 12.0, rewardMult: 12.0, color: '#7f1d1d', unlockWave: 60 },
    { level: 7, nameKey: 'dread.level7', enemyMult: 20.0, rewardMult: 20.0, color: '#a855f7', unlockWave: 70 },
    { level: 8, nameKey: 'dread.level8', enemyMult: 30.0, rewardMult: 33.0, color: '#9333ea', unlockWave: 80 },
    { level: 9, nameKey: 'dread.level9', enemyMult: 40.0, rewardMult: 48.0, color: '#6b21a8', unlockWave: 90 },
    { level: 10, nameKey: 'dread.level10', enemyMult: 50.0, rewardMult: 65.0, color: '#000000', unlockWave: 100 }
];

/**
 * Mining resource definitions
 */
export const MINING_RESOURCES = [
    { id: 'copper', nameKey: 'mining.copper.name', icon: '⛏️', baseRate: 1.0, color: '#b87333', tier: 1 },
    { id: 'iron', nameKey: 'mining.iron.name', icon: '🔩', baseRate: 0.5, color: '#71797E', tier: 1 },
    { id: 'crystal', nameKey: 'mining.crystal.name', icon: '💎', baseRate: 0.2, color: '#22d3ee', tier: 2 },
    { id: 'gold_ore', nameKey: 'mining.gold_ore.name', icon: '🥇', baseRate: 0.1, color: '#fbbf24', tier: 2 },
    { id: 'void_shard', nameKey: 'mining.void_shard.name', icon: '🔮', baseRate: 0.05, color: '#a855f7', tier: 3 },
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
    { id: 'siphon', nameKey: 'darkMatter.siphon.name', descKey: 'darkMatter.siphon.desc', max: 10, cost: 8, effectPerLevel: 0.5 },
    { id: 'overlord', nameKey: 'darkMatter.overlord.name', descKey: 'darkMatter.overlord.desc', max: 3, cost: 8 },
    { id: 'etherSurge', nameKey: 'darkMatter.etherSurge.name', descKey: 'darkMatter.etherSurge.desc', max: 5, cost: 15, effectPerLevel: 0.1 },
    { id: 'voidAffinity', nameKey: 'darkMatter.voidAffinity.name', descKey: 'darkMatter.voidAffinity.desc', max: 3, cost: 25, effectPerLevel: 0.15 }
];

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
 * Achievement definitions
 * @type {Array<{id: string, nameKey: string, descKey: string, cond: Function, reward: number}>}
 */
export const ACHIEVEMENTS_DB = [
    { id: 'kill_100', nameKey: 'achievements.kill_100.name', descKey: 'achievements.kill_100.desc', cond: (s) => s.kills >= 100, reward: 5 },
    { id: 'kill_1000', nameKey: 'achievements.kill_1000.name', descKey: 'achievements.kill_1000.desc', cond: (s) => s.kills >= 1000, reward: 25 },
    { id: 'kill_5000', nameKey: 'achievements.kill_5000.name', descKey: 'achievements.kill_5000.desc', cond: (s) => s.kills >= 5000, reward: 100 },
    { id: 'kill_50000', nameKey: 'achievements.kill_50000.name', descKey: 'achievements.kill_50000.desc', cond: (s) => s.kills >= 50000, reward: 500 },
    { id: 'boss_5', nameKey: 'achievements.boss_5.name', descKey: 'achievements.boss_5.desc', cond: (s) => s.bosses >= 5, reward: 15 },
    { id: 'boss_50', nameKey: 'achievements.boss_50.name', descKey: 'achievements.boss_50.desc', cond: (s) => s.bosses >= 50, reward: 100 },
    { id: 'boss_200', nameKey: 'achievements.boss_200.name', descKey: 'achievements.boss_200.desc', cond: (s) => s.bosses >= 200, reward: 500 },
    { id: 'wave_20', nameKey: 'achievements.wave_20.name', descKey: 'achievements.wave_20.desc', cond: (s) => s.maxWave >= 20, reward: 10 },
    { id: 'wave_50', nameKey: 'achievements.wave_50.name', descKey: 'achievements.wave_50.desc', cond: (s) => s.maxWave >= 50, reward: 50 },
    { id: 'wave_100', nameKey: 'achievements.wave_100.name', descKey: 'achievements.wave_100.desc', cond: (s) => s.maxWave >= 100, reward: 150 },
    { id: 'wave_250', nameKey: 'achievements.wave_250.name', descKey: 'achievements.wave_250.desc', cond: (s) => s.maxWave >= 250, reward: 500 },
    { id: 'wave_500', nameKey: 'achievements.wave_500.name', descKey: 'achievements.wave_500.desc', cond: (s) => s.maxWave >= 500, reward: 2000 },
    { id: 'gold_10k', nameKey: 'achievements.gold_10k.name', descKey: 'achievements.gold_10k.desc', cond: (s) => s.totalGold >= 10000, reward: 20 },
    { id: 'gold_1m', nameKey: 'achievements.gold_1m.name', descKey: 'achievements.gold_1m.desc', cond: (s) => s.totalGold >= 1000000, reward: 200 },
    { id: 'ether_100', nameKey: 'achievements.ether_100.name', descKey: 'achievements.ether_100.desc', cond: (s) => s.totalEther >= 100, reward: 25 },
    { id: 'ether_1000', nameKey: 'achievements.ether_1000.name', descKey: 'achievements.ether_1000.desc', cond: (s) => s.totalEther >= 1000, reward: 150 },
    { id: 'ether_10000', nameKey: 'achievements.ether_10000.name', descKey: 'achievements.ether_10000.desc', cond: (s) => s.totalEther >= 10000, reward: 1000 },
    { id: 'consistent_10', nameKey: 'achievements.consistent_10.name', descKey: 'achievements.consistent_10.desc', cond: (s) => s.consistentRuns >= 10, reward: 50 },
    { id: 'consistent_50', nameKey: 'achievements.consistent_50.name', descKey: 'achievements.consistent_50.desc', cond: (s) => s.consistentRuns >= 50, reward: 250 },
    { id: 'dread_5', nameKey: 'achievements.dread_5.name', descKey: 'achievements.dread_5.desc', cond: (s) => s.highestDread >= 5, reward: 100 },
    { id: 'dread_10', nameKey: 'achievements.dread_10.name', descKey: 'achievements.dread_10.desc', cond: (s) => s.highestDread >= 10, reward: 500 },
    { id: 'prestige_10', nameKey: 'achievements.prestige_10.name', descKey: 'achievements.prestige_10.desc', cond: (s) => s.totalPrestiges >= 10, reward: 75 },
    { id: 'prestige_100', nameKey: 'achievements.prestige_100.name', descKey: 'achievements.prestige_100.desc', cond: (s) => s.totalPrestiges >= 100, reward: 500 },
    { id: 'ascend_1', nameKey: 'achievements.ascend_1.name', descKey: 'achievements.ascend_1.desc', cond: (s) => s.totalAscensions >= 1, reward: 250 },
    { id: 'ascend_5', nameKey: 'achievements.ascend_5.name', descKey: 'achievements.ascend_5.desc', cond: (s) => s.totalAscensions >= 5, reward: 1000 }
];

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
 * Rune type definitions
 * @type {Array<{id: string, nameKey: string, color: string, icon: string, duration: number, descKey: string, instant?: boolean}>}
 */
export const RUNE_TYPES = [
    { id: 'rage', nameKey: 'runes.rage.name', color: '#ef4444', icon: '🔥', duration: 10000, descKey: 'runes.rage.desc' },
    { id: 'midas', nameKey: 'runes.midas.name', color: '#fbbf24', icon: '👑', duration: 10000, descKey: 'runes.midas.desc' },
    { id: 'heal', nameKey: 'runes.heal.name', color: '#4ade80', icon: '💚', duration: 0, descKey: 'runes.heal.desc', instant: true }
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
    { id: 'ether_condenser', nameKey: 'production.ether_condenser.name', descKey: 'production.ether_condenser.desc', icon: '⚗️', resource: 'ether', baseRate: 0.05, baseCost: 1000, costMult: 2.0, maxLevel: 10 },
    { id: 'void_harvester', nameKey: 'production.void_harvester.name', descKey: 'production.void_harvester.desc', icon: '🌌', resource: 'void_shard', baseRate: 0.02, baseCost: 5000, costMult: 2.5, maxLevel: 5 }
];

/**
 * Aura types for turret buffs
 */
export const AURA_TYPES = [
    { id: 'damage_aura', nameKey: 'auras.damage.name', descKey: 'auras.damage.desc', icon: '⚔️', color: '#ef4444', effect: 'damage', baseValue: 0.1, range: 150, cost: 50 },
    { id: 'speed_aura', nameKey: 'auras.speed.name', descKey: 'auras.speed.desc', icon: '💨', color: '#fbbf24', effect: 'fireRate', baseValue: 0.15, range: 150, cost: 75 },
    { id: 'range_aura', nameKey: 'auras.range.name', descKey: 'auras.range.desc', icon: '🎯', color: '#3b82f6', effect: 'range', baseValue: 0.2, range: 200, cost: 60 },
    { id: 'crit_aura', nameKey: 'auras.crit.name', descKey: 'auras.crit.desc', icon: '💥', color: '#a855f7', effect: 'crit', baseValue: 10, range: 100, cost: 100 },
    { id: 'regen_aura', nameKey: 'auras.regen.name', descKey: 'auras.regen.desc', icon: '💚', color: '#22c55e', effect: 'regen', baseValue: 5, range: 250, cost: 150 }
];

/**
 * Chip/Module types for turret customization
 */
export const CHIP_TYPES = [
    { id: 'chip_dmg', nameKey: 'chips.damage.name', descKey: 'chips.damage.desc', icon: '🗡️', rarity: 1, effect: { damage: 0.15 } },
    { id: 'chip_speed', nameKey: 'chips.speed.name', descKey: 'chips.speed.desc', icon: '⚡', rarity: 1, effect: { fireRate: 0.1 } },
    { id: 'chip_range', nameKey: 'chips.range.name', descKey: 'chips.range.desc', icon: '🎯', rarity: 1, effect: { range: 0.2 } },
    { id: 'chip_crit', nameKey: 'chips.crit.name', descKey: 'chips.crit.desc', icon: '💥', rarity: 2, effect: { critChance: 5, critDamage: 0.25 } },
    { id: 'chip_pierce', nameKey: 'chips.pierce.name', descKey: 'chips.pierce.desc', icon: '🔱', rarity: 2, effect: { pierce: 1 } },
    { id: 'chip_splash', nameKey: 'chips.splash.name', descKey: 'chips.splash.desc', icon: '💣', rarity: 2, effect: { splash: 30 } },
    { id: 'chip_vampiric', nameKey: 'chips.vampiric.name', descKey: 'chips.vampiric.desc', icon: '🩸', rarity: 3, effect: { leech: 0.05 } },
    { id: 'chip_chaos', nameKey: 'chips.chaos.name', descKey: 'chips.chaos.desc', icon: '☢️', rarity: 3, effect: { damage: 0.3, fireRate: -0.1 } },
    { id: 'chip_void', nameKey: 'chips.void.name', descKey: 'chips.void.desc', icon: '🌀', rarity: 4, effect: { damage: 0.5, critChance: 10, pierce: 2 } }
];

/**
 * Daily quest type definitions
 */
export const DAILY_QUEST_TYPES = [
    { id: 'kill_enemies', nameKey: 'quests.kill_enemies.name', descKey: 'quests.kill_enemies.desc', icon: '💀', targetBase: 100, targetMult: 1.5, rewardType: 'gold', rewardBase: 750 },
    { id: 'reach_wave', nameKey: 'quests.reach_wave.name', descKey: 'quests.reach_wave.desc', icon: '🌊', targetBase: 10, targetMult: 1.2, rewardType: 'crystals', rewardBase: 20 },
    { id: 'kill_bosses', nameKey: 'quests.kill_bosses.name', descKey: 'quests.kill_bosses.desc', icon: '👑', targetBase: 1, targetMult: 1.0, rewardType: 'ether', rewardBase: 10 },
    { id: 'collect_gold', nameKey: 'quests.collect_gold.name', descKey: 'quests.collect_gold.desc', icon: '💰', targetBase: 1000, targetMult: 2.0, rewardType: 'crystals', rewardBase: 25 },
    { id: 'use_skills', nameKey: 'quests.use_skills.name', descKey: 'quests.use_skills.desc', icon: '✨', targetBase: 10, targetMult: 1.3, rewardType: 'gold', rewardBase: 500 },
    { id: 'upgrade_turrets', nameKey: 'quests.upgrade_turrets.name', descKey: 'quests.upgrade_turrets.desc', icon: '🔧', targetBase: 5, targetMult: 1.2, rewardType: 'crystals', rewardBase: 30 }
];

/**
 * Prestige upgrade definitions for permanent bonuses
 */
export const PRESTIGE_UPGRADES = [
    { id: 'prestige_damage', nameKey: 'prestige.damage.name', descKey: 'prestige.damage.desc', icon: '🗡️', baseCost: 1, costMult: 1.7, maxLevel: 20, effect: (lvl) => 1 + lvl * 0.05 },
    { id: 'prestige_health', nameKey: 'prestige.health.name', descKey: 'prestige.health.desc', icon: '❤️', baseCost: 1, costMult: 1.7, maxLevel: 20, effect: (lvl) => 1 + lvl * 0.05 },
    { id: 'prestige_gold', nameKey: 'prestige.gold.name', descKey: 'prestige.gold.desc', icon: '🥇', baseCost: 2, costMult: 1.6, maxLevel: 20, effect: (lvl) => 1 + lvl * 0.08 },
    { id: 'prestige_crystals', nameKey: 'prestige.crystals.name', descKey: 'prestige.crystals.desc', icon: '💎', baseCost: 3, costMult: 1.8, maxLevel: 15, effect: (lvl) => 1 + lvl * 0.10 },
    { id: 'prestige_start_wave', nameKey: 'prestige.start_wave.name', descKey: 'prestige.start_wave.desc', icon: '⏩', baseCost: 5, costMult: 2.5, maxLevel: 10, effect: (lvl) => lvl * 5 },
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
    { id: 'blaster', nameKey: 'school.blaster.name', descKey: 'school.blaster.desc', icon: '🧨', unlockCost: 50, maxLevel: 10, levelCost: 10, stats: { damage: 1.5, speed: 1.2, range: 0.8 } },
    { id: 'laser', nameKey: 'school.laser.name', descKey: 'school.laser.desc', icon: '📡', unlockCost: 200, maxLevel: 15, levelCost: 25, stats: { damage: 2.0, speed: 2.0, range: 1.0 } },
    { id: 'solidifier', nameKey: 'school.solidifier.name', descKey: 'school.solidifier.desc', icon: '❄️', unlockCost: 300, maxLevel: 10, levelCost: 20, stats: { damage: 0.5, speed: 0.8, range: 1.2, slow: 0.5 } },
    { id: 'swamper', nameKey: 'school.swamper.name', descKey: 'school.swamper.desc', icon: '💧', unlockCost: 500, maxLevel: 15, levelCost: 40, stats: { damage: 0.8, speed: 0.5, range: 2.0, aoe: 100 } },
    { id: 'rocket', nameKey: 'school.rocket.name', descKey: 'school.rocket.desc', icon: '🚀', unlockCost: 1000, maxLevel: 10, levelCost: 75, stats: { damage: 3.0, speed: 0.3, range: 1.5, aoe: 60 } },
    { id: 'sniper', nameKey: 'school.sniper.name', descKey: 'school.sniper.desc', icon: '🔭', unlockCost: 1500, maxLevel: 10, levelCost: 100, stats: { damage: 5.0, speed: 0.2, range: 3.0 } },
    { id: 'inferno', nameKey: 'school.inferno.name', descKey: 'school.inferno.desc', icon: '🌋', unlockCost: 5000, maxLevel: 20, levelCost: 200, stats: { damage: 4.0, speed: 1.0, range: 1.0, aoe: 80, dot: true } }
];

/**
 * Office - Temporary boost system
 */
export const OFFICE_BOOSTS = [
    { id: 'damage_boost', nameKey: 'office.damage.name', descKey: 'office.damage.desc', icon: '🗡️', mult: 2.0, duration: 300, baseCost: 10, effect: 'damage' },
    { id: 'gold_boost', nameKey: 'office.gold.name', descKey: 'office.gold.desc', icon: '💰', mult: 3.0, duration: 300, baseCost: 15, effect: 'gold' },
    { id: 'speed_boost', nameKey: 'office.speed.name', descKey: 'office.speed.desc', icon: '⚡', mult: 1.5, duration: 300, baseCost: 20, effect: 'attackSpeed' },
    { id: 'xp_boost', nameKey: 'office.xp.name', descKey: 'office.xp.desc', icon: '📈', mult: 2.0, duration: 300, baseCost: 25, effect: 'xp' },
    { id: 'crit_boost', nameKey: 'office.crit.name', descKey: 'office.crit.desc', icon: '💥', mult: 2.0, duration: 300, baseCost: 30, effect: 'critChance' }
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
 * Weather system - Dynamic conditions affecting gameplay
 * Note: duration is in milliseconds for consistency with other game systems
 */
export const WEATHER_TYPES = [
    { id: 'clear', nameKey: 'weather.clear.name', icon: '☀️', color: '#fbbf24', effects: {}, duration: 120000, weight: 40 },
    { id: 'rain', nameKey: 'weather.rain.name', icon: '🌧️', color: '#3b82f6', effects: { enemySpeed: -0.15, goldMult: 1.1 }, duration: 90000, weight: 20 },
    { id: 'storm', nameKey: 'weather.storm.name', icon: '⛈️', color: '#6366f1', effects: { enemySpeed: -0.2, damage: 1.2, critChance: 10 }, duration: 60000, weight: 10 },
    { id: 'fog', nameKey: 'weather.fog.name', icon: '🌫️', color: '#94a3b8', effects: { range: -0.3, enemySpeed: -0.1 }, duration: 90000, weight: 15 },
    { id: 'wind', nameKey: 'weather.wind.name', icon: '💨', color: '#22d3ee', effects: { projectileSpeed: 1.3, enemySpeed: 0.1 }, duration: 75000, weight: 15 },
    { id: 'blood_moon', nameKey: 'weather.bloodMoon.name', icon: '🌑', color: '#dc2626', effects: { enemyHp: 1.5, enemySpeed: 0.2, goldMult: 2.0, xpMult: 1.5 }, duration: 45000, weight: 5 },
    { id: 'aurora', nameKey: 'weather.aurora.name', icon: '🌌', color: '#a855f7', effects: { xpMult: 2.0, critDamage: 0.5 }, duration: 60000, weight: 5 },
    { id: 'solar_flare', nameKey: 'weather.solarFlare.name', icon: '🔥', color: '#f97316', effects: { damage: 1.5, regenMult: -0.5 }, duration: 45000, weight: 5 }
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
 * Random events system
 * Note: duration is in milliseconds for consistency with other game systems
 */
export const RANDOM_EVENTS = [
    { id: 'gold_rush', nameKey: 'events.goldRush.name', descKey: 'events.goldRush.desc', icon: '💰', duration: 30000, effects: { goldMult: 3 }, weight: 15 },
    { id: 'power_surge', nameKey: 'events.powerSurge.name', descKey: 'events.powerSurge.desc', icon: '⚡', duration: 20000, effects: { damageMult: 2 }, weight: 15 },
    { id: 'slow_motion', nameKey: 'events.slowMotion.name', descKey: 'events.slowMotion.desc', icon: '🐌', duration: 15000, effects: { enemySpeedMult: 0.5 }, weight: 12 },
    { id: 'critical_frenzy', nameKey: 'events.critFrenzy.name', descKey: 'events.critFrenzy.desc', icon: '💥', duration: 25000, effects: { critChance: 50 }, weight: 12 },
    { id: 'meteor_shower', nameKey: 'events.meteorShower.name', descKey: 'events.meteorShower.desc', icon: '☄️', duration: 15000, effects: { meteorDamage: true }, weight: 8 },
    { id: 'healing_aura', nameKey: 'events.healingAura.name', descKey: 'events.healingAura.desc', icon: '💚', duration: 30000, effects: { regenMult: 5 }, weight: 10 },
    { id: 'xp_boost', nameKey: 'events.xpBoost.name', descKey: 'events.xpBoost.desc', icon: '📈', duration: 45000, effects: { xpMult: 2 }, weight: 15 },
    { id: 'invasion', nameKey: 'events.invasion.name', descKey: 'events.invasion.desc', icon: '👾', duration: 20000, effects: { enemySpawn: 2, goldMult: 2 }, weight: 8, negative: true },
    { id: 'elite_wave', nameKey: 'events.eliteWave.name', descKey: 'events.eliteWave.desc', icon: '👑', duration: 0, effects: { eliteSpawn: true }, weight: 5, negative: true },
    { id: 'treasure_goblin', nameKey: 'events.treasureGoblin.name', descKey: 'events.treasureGoblin.desc', icon: '🧌', duration: 0, effects: { spawnGoblin: true }, weight: 5 }
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
        costFactor: '5',
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
        costFactor: '3',
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
        costFactor: '4',
        effectBase: 0.1,
        req: 'ap_ether_boost'
    }
];

/**
 * Combo system tiers
 */
export const COMBO_TIERS = [
    { tier: 1, hits: 5, nameKey: 'combo.tier1', color: '#94a3b8', mult: 1.1 },
    { tier: 2, hits: 15, nameKey: 'combo.tier2', color: '#22c55e', mult: 1.25 },
    { tier: 3, hits: 30, nameKey: 'combo.tier3', color: '#3b82f6', mult: 1.5 },
    { tier: 4, hits: 50, nameKey: 'combo.tier4', color: '#a855f7', mult: 1.75 },
    { tier: 5, hits: 75, nameKey: 'combo.tier5', color: '#f97316', mult: 2.0 },
    { tier: 6, hits: 100, nameKey: 'combo.tier6', color: '#ef4444', mult: 2.5 },
    { tier: 7, hits: 150, nameKey: 'combo.tier7', color: '#fbbf24', mult: 3.0 },
    { tier: 8, hits: 200, nameKey: 'combo.tier8', color: '#fff', mult: 4.0 }
];

/**
 * Upgrade definitions factory
 * @returns {Array}
 */
export function createUpgrades() {
    return [
        { id: 'damage', nameKey: 'upgrades.damage.name', descKey: 'upgrades.damage.desc', category: 0, baseCost: 10, costMult: 1.25, level: 1, getValue: (lvl) => Math.floor(4 * Math.pow(1.08, lvl - 1)), icon: '\u2694\ufe0f' },
        { id: 'speed', nameKey: 'upgrades.speed.name', descKey: 'upgrades.speed.desc', category: 0, baseCost: 30, costMult: 1.30, level: 1, getValue: (lvl) => Math.max(80, 1000 * Math.pow(0.96, lvl - 1)), icon: '\u26a1' },
        { id: 'crit', nameKey: 'upgrades.crit.name', descKey: 'upgrades.crit.desc', category: 0, baseCost: 50, costMult: 1.7, level: 0, getValue: (lvl) => ({ chance: Math.min(150, lvl * 2), mult: 2 + (lvl * 0.1) }), icon: '\ud83d\udca5' },
        { id: 'range', nameKey: 'upgrades.range.name', descKey: 'upgrades.range.desc', category: 0, baseCost: 30, costMult: 1.5, level: 1, getValue: (lvl) => 300 + (lvl * 60), icon: '\ud83c\udfaf' },
        { id: 'multishot', nameKey: 'upgrades.multishot.name', descKey: 'upgrades.multishot.desc', category: 0, baseCost: 100, costMult: 2.0, level: 0, getValue: (lvl) => Math.min(60, lvl * 6), icon: '\ud83c\udff9' },
        { id: 'health', nameKey: 'upgrades.health.name', descKey: 'upgrades.health.desc', category: 1, baseCost: 15, costMult: 1.5, level: 1, getValue: (lvl) => Math.floor(80 * Math.pow(1.18, lvl - 1)), icon: '\u2764\ufe0f' },
        { id: 'regen', nameKey: 'upgrades.regen.name', descKey: 'upgrades.regen.desc', category: 1, baseCost: 50, costMult: 2.0, level: 0, getValue: (lvl) => lvl === 0 ? 0 : 3 * lvl, icon: '\ud83d\udd27' },
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
        { id: 'goldMult', nameKey: 'metaUpgrades.goldMult.name', descKey: 'metaUpgrades.goldMult.desc', baseCost: 5, costMult: 2, level: 0, maxLevel: 6, getEffect: (lvl) => 1 + (lvl * 0.1), format: (v) => `x${v.toFixed(1)}`, icon: '\ud83e\udd11' },
        { id: 'damageMult', nameKey: 'metaUpgrades.damageMult.name', descKey: 'metaUpgrades.damageMult.desc', baseCost: 3, costMult: 1.8, level: 0, maxLevel: 20, getEffect: (lvl) => 1 + (lvl * 0.1), format: (v) => `x${v.toFixed(1)}`, icon: '\ud83d\udcaa' },
        { id: 'healthMult', nameKey: 'metaUpgrades.healthMult.name', descKey: 'metaUpgrades.healthMult.desc', baseCost: 2, costMult: 1.5, level: 0, maxLevel: 20, getEffect: (lvl) => 1 + (lvl * 0.1), format: (v) => `x${v.toFixed(1)}`, icon: '\ud83c\udff0' },
        { id: 'unlockAuto', nameKey: 'metaUpgrades.unlockAuto.name', descKey: 'metaUpgrades.unlockAuto.desc', baseCost: 10, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '\ud83d\udd04' },
        { id: 'unlockAI', nameKey: 'metaUpgrades.unlockAI.name', descKey: 'metaUpgrades.unlockAI.desc', baseCost: 25, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '\ud83e\udd16' },
        { id: 'unlockDrone', nameKey: 'metaUpgrades.unlockDrone.name', descKey: 'metaUpgrades.unlockDrone.desc', baseCost: 50, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '\ud83d\udef8' },
        // Infinite scaling upgrades for late game (diminishing returns)
        { id: 'infiniteDamage', nameKey: 'metaUpgrades.infiniteDamage.name', descKey: 'metaUpgrades.infiniteDamage.desc', baseCost: 100, costMult: 1.15, level: 0, maxLevel: 0, getEffect: (lvl) => 1 + (lvl * 0.02), format: (v) => `x${v.toFixed(2)}`, icon: '🗡️' },
        { id: 'infiniteHealth', nameKey: 'metaUpgrades.infiniteHealth.name', descKey: 'metaUpgrades.infiniteHealth.desc', baseCost: 100, costMult: 1.15, level: 0, maxLevel: 0, getEffect: (lvl) => 1 + (lvl * 0.02), format: (v) => `x${v.toFixed(2)}`, icon: '💖' },
        { id: 'infiniteGold', nameKey: 'metaUpgrades.infiniteGold.name', descKey: 'metaUpgrades.infiniteGold.desc', baseCost: 150, costMult: 1.2, level: 0, maxLevel: 0, getEffect: (lvl) => 1 + (lvl * 0.03), format: (v) => `x${v.toFixed(2)}`, icon: '💎' },
        { id: 'autoSkillQ', nameKey: 'metaUpgrades.autoSkillQ.name', descKey: 'metaUpgrades.autoSkillQ.desc', baseCost: 75, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '⚡' },
        { id: 'autoSkillW', nameKey: 'metaUpgrades.autoSkillW.name', descKey: 'metaUpgrades.autoSkillW.desc', baseCost: 100, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '☄️' },
        { id: 'autoSkillE', nameKey: 'metaUpgrades.autoSkillE.name', descKey: 'metaUpgrades.autoSkillE.desc', baseCost: 125, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '🌀' }
    ];
}

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
 * Milestone definitions - One-time rewards for reaching specific goals
 */
export const MILESTONES = [
    { id: 'first_boss', wave: 10, nameKey: 'milestones.firstBoss.name', descKey: 'milestones.firstBoss.desc', icon: '👑', reward: { ether: 10, crystals: 25 } },
    { id: 'wave_25', wave: 25, nameKey: 'milestones.wave25.name', descKey: 'milestones.wave25.desc', icon: '🌊', reward: { ether: 25, gold: 5000 } },
    { id: 'wave_50', wave: 50, nameKey: 'milestones.wave50.name', descKey: 'milestones.wave50.desc', icon: '⭐', reward: { ether: 75, crystals: 100 } },
    { id: 'wave_100', wave: 100, nameKey: 'milestones.wave100.name', descKey: 'milestones.wave100.desc', icon: '🏆', reward: { ether: 200, crystals: 250, relic: true } },
    { id: 'wave_150', wave: 150, nameKey: 'milestones.wave150.name', descKey: 'milestones.wave150.desc', icon: '💎', reward: { ether: 400, crystals: 500 } },
    { id: 'wave_200', wave: 200, nameKey: 'milestones.wave200.name', descKey: 'milestones.wave200.desc', icon: '🔥', reward: { ether: 750, relic: true, relicTier: 3 } },
    { id: 'wave_250', wave: 250, nameKey: 'milestones.wave250.name', descKey: 'milestones.wave250.desc', icon: '🌟', reward: { ether: 1500, crystals: 1000, relic: true, relicTier: 4 } },
    { id: 'wave_300', wave: 300, nameKey: 'milestones.wave300.name', descKey: 'milestones.wave300.desc', icon: '👁️', reward: { ether: 3000, ascensionPoints: 1 } },
    { id: 'wave_500', wave: 500, nameKey: 'milestones.wave500.name', descKey: 'milestones.wave500.desc', icon: '🌌', reward: { ether: 10000, ascensionPoints: 5, relic: true, relicTier: 4 } },
    { id: 'dread_complete', dread: 10, nameKey: 'milestones.dreadComplete.name', descKey: 'milestones.dreadComplete.desc', icon: '💀', reward: { ether: 5000, ascensionPoints: 3 } }
];

/**
 * Daily chest tiers - Guaranteed rewards based on streak
 */
export const DAILY_CHESTS = [
    { day: 1, nameKey: 'dailyChest.day1.name', icon: '📦', reward: { ether: 5, gold: 1000 } },
    { day: 2, nameKey: 'dailyChest.day2.name', icon: '📦', reward: { ether: 10, crystals: 15 } },
    { day: 3, nameKey: 'dailyChest.day3.name', icon: '🎁', reward: { ether: 20, gold: 2500 } },
    { day: 4, nameKey: 'dailyChest.day4.name', icon: '🎁', reward: { ether: 30, crystals: 30 } },
    { day: 5, nameKey: 'dailyChest.day5.name', icon: '🎁', reward: { ether: 50, gold: 5000, crystals: 25 } },
    { day: 6, nameKey: 'dailyChest.day6.name', icon: '✨', reward: { ether: 75, crystals: 50 } },
    { day: 7, nameKey: 'dailyChest.day7.name', icon: '👑', reward: { ether: 150, crystals: 100, relic: true } }
];

/**
 * Themed prestige layers - Elemental specializations
 */
export const PRESTIGE_THEMES = [
    { id: 'fire', nameKey: 'prestigeTheme.fire.name', descKey: 'prestigeTheme.fire.desc', icon: '🔥', color: '#ef4444', unlockPrestiges: 5, bonuses: { damage: 0.25, critDamage: 0.3 }, penalty: { health: -0.1 } },
    { id: 'ice', nameKey: 'prestigeTheme.ice.name', descKey: 'prestigeTheme.ice.desc', icon: '❄️', color: '#22d3ee', unlockPrestiges: 5, bonuses: { slow: 0.2, shield: 0.3 }, penalty: { fireRate: -0.1 } },
    { id: 'lightning', nameKey: 'prestigeTheme.lightning.name', descKey: 'prestigeTheme.lightning.desc', icon: '⚡', color: '#fbbf24', unlockPrestiges: 10, bonuses: { fireRate: 0.3, critChance: 15 }, penalty: { damage: -0.1 } },
    { id: 'void', nameKey: 'prestigeTheme.void.name', descKey: 'prestigeTheme.void.desc', icon: '🌀', color: '#a855f7', unlockPrestiges: 15, bonuses: { etherGain: 0.5, skillPower: 0.25 }, penalty: { gold: -0.15 } },
    { id: 'cosmic', nameKey: 'prestigeTheme.cosmic.name', descKey: 'prestigeTheme.cosmic.desc', icon: '🌌', color: '#3b82f6', unlockPrestiges: 25, bonuses: { allStats: 0.15, prestigePoints: 0.25 }, penalty: {} }
];

/**
 * Resource exchange rates
 */
export const EXCHANGE_RATES = {
    goldToCrystals: { from: 'gold', to: 'crystals', rate: 1000, min: 1000 },
    crystalsToEther: { from: 'crystals', to: 'ether', rate: 50, min: 50 },
    etherToAscension: { from: 'ether', to: 'ascensionPoints', rate: 500, min: 500, unlockAscensions: 1 }
};

/**
 * Endless prestige settings
 */
export const ENDLESS_PRESTIGE_CONFIG = {
    minWave: 50,
    defaultInterval: 100,
    bonusPerCycle: 0.05,
    maxBonusStacks: 20
};

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
 * Seasonal events
 */
export const SEASONAL_EVENTS = [
    {
        id: 'halloween',
        nameKey: 'seasonal.halloween.name',
        descKey: 'seasonal.halloween.desc',
        icon: '🎃',
        startMonth: 10, startDay: 15,
        endMonth: 11, endDay: 5,
        theme: { bgColor: '#1a0a2e', accentColor: '#ff6b00' },
        bonuses: { xpMult: 1.5, relicChance: 1.25 },
        specialEnemy: { type: 'GHOST', color: '#9333ea', hpMult: 0.8, speedMult: 1.5, scale: 1.0, reward: 3 },
        exclusiveRelic: { id: 'pumpkin_crown', nameKey: 'relics.pumpkinCrown.name', icon: '🎃', tier: 3, effect: (g) => { g.relicMults.critChance += 25; g.relicMults.gold += 0.3; } }
    },
    {
        id: 'christmas',
        nameKey: 'seasonal.christmas.name',
        descKey: 'seasonal.christmas.desc',
        icon: '🎄',
        startMonth: 12, startDay: 15,
        endMonth: 1, endDay: 5,
        theme: { bgColor: '#0f2027', accentColor: '#c41e3a' },
        bonuses: { goldMult: 2.0, productionMult: 1.5 },
        specialEnemy: { type: 'SNOWMAN', color: '#e0f2fe', hpMult: 2.0, speedMult: 0.5, scale: 1.3, reward: 2, freezeOnDeath: true },
        exclusiveRelic: { id: 'santas_blessing', nameKey: 'relics.santasBlessing.name', icon: '🎅', tier: 3, effect: (g) => { g.relicMults.gold += 0.5; g.relicMults.health += 0.25; } }
    },
    {
        id: 'lunar_new_year',
        nameKey: 'seasonal.lunarNewYear.name',
        descKey: 'seasonal.lunarNewYear.desc',
        icon: '🐉',
        startMonth: 1, startDay: 20,
        endMonth: 2, endDay: 15,
        theme: { bgColor: '#2d0a0a', accentColor: '#ffd700' },
        bonuses: { damageMult: 1.25, xpMult: 1.25, goldMult: 1.25 },
        specialEnemy: { type: 'DRAGON', color: '#ffd700', hpMult: 5.0, speedMult: 0.8, scale: 2.0, reward: 5, fireBreath: true },
        exclusiveRelic: { id: 'dragon_pearl', nameKey: 'relics.dragonPearl.name', icon: '🐲', tier: 4, effect: (g) => { g.relicMults.damage += 0.4; g.relicMults.critDamage += 0.75; } }
    },
    {
        id: 'summer',
        nameKey: 'seasonal.summer.name',
        descKey: 'seasonal.summer.desc',
        icon: '☀️',
        startMonth: 6, startDay: 15,
        endMonth: 8, endDay: 31,
        theme: { bgColor: '#1a3a4a', accentColor: '#00bcd4' },
        bonuses: { speedMult: 1.2, cooldownMult: 0.8 },
        specialEnemy: { type: 'BEACH_CRAB', color: '#ff7043', hpMult: 1.5, speedMult: 1.2, scale: 0.9, reward: 2 },
        exclusiveRelic: { id: 'sun_stone', nameKey: 'relics.sunStone.name', icon: '🌞', tier: 3, effect: (g) => { g.relicMults.speed += 0.3; g.relicMults.cooldown += 0.2; } }
    }
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
 * Visual effects definitions
 */
export const VISUAL_EFFECTS = {
    screenShake: { intensity: 5, duration: 200, triggers: ['boss_hit', 'critical', 'skill_use'] },
    particles: {
        hit: { count: 5, speed: 3, life: 300, size: 4 },
        crit: { count: 12, speed: 5, life: 400, size: 6, color: '#fbbf24' },
        death: { count: 8, speed: 4, life: 500, size: 5 },
        gold: { count: 3, speed: 2, life: 600, size: 8, color: '#fbbf24', icon: '💰' },
        levelUp: { count: 20, speed: 6, life: 800, size: 10, color: '#22d3ee' }
    },
    trails: {
        projectile: { length: 5, width: 2, fade: 0.8 },
        laser: { width: 3, glow: 10, color: '#ef4444' }
    }
};

/**
 * Music and sound tracks
 */
export const MUSIC_TRACKS = [
    { id: 'menu', nameKey: 'music.menu', bpm: 80, mood: 'calm' },
    { id: 'gameplay', nameKey: 'music.gameplay', bpm: 120, mood: 'action' },
    { id: 'boss', nameKey: 'music.boss', bpm: 140, mood: 'intense' },
    { id: 'victory', nameKey: 'music.victory', bpm: 100, mood: 'triumphant' },
    { id: 'defeat', nameKey: 'music.defeat', bpm: 60, mood: 'somber' }
];

export const SOUND_EFFECTS = [
    { id: 'turret_fire', variations: 3 },
    { id: 'enemy_hit', variations: 4 },
    { id: 'enemy_death', variations: 3 },
    { id: 'boss_roar', variations: 2 },
    { id: 'boss_phase', variations: 1 },
    { id: 'skill_activate', variations: 3 },
    { id: 'upgrade_buy', variations: 1 },
    { id: 'gold_collect', variations: 2 },
    { id: 'relic_drop', variations: 1 },
    { id: 'level_up', variations: 1 },
    { id: 'combo_increase', variations: 5 },
    { id: 'critical_hit', variations: 2 }
];

/**
 * Build presets structure
 */
export const BUILD_PRESET_SLOTS = [
    { id: 0, nameKey: 'presets.slot1.name', icon: '1️⃣' },
    { id: 1, nameKey: 'presets.slot2.name', icon: '2️⃣' },
    { id: 2, nameKey: 'presets.slot3.name', icon: '3️⃣' },
    { id: 3, nameKey: 'presets.slot4.name', icon: '4️⃣' },
    { id: 4, nameKey: 'presets.slot5.name', icon: '5️⃣' }
];

/**
 * Leaderboard categories
 */
export const LEADERBOARD_CATEGORIES = [
    { id: 'highest_wave', nameKey: 'leaderboard.highestWave', icon: '📊', sortDesc: true },
    { id: 'max_dps', nameKey: 'leaderboard.maxDps', icon: '🔥', sortDesc: true },
    { id: 'fastest_wave_50', nameKey: 'leaderboard.fastestWave50', icon: '⏱️', sortDesc: false },
    { id: 'total_kills', nameKey: 'leaderboard.totalKills', icon: '💀', sortDesc: true },
    { id: 'bosses_defeated', nameKey: 'leaderboard.bossesDefeated', icon: '👑', sortDesc: true },
    { id: 'highest_combo', nameKey: 'leaderboard.highestCombo', icon: '🔗', sortDesc: true },
    { id: 'endless_record', nameKey: 'leaderboard.endlessRecord', icon: '♾️', sortDesc: true },
    { id: 'boss_rush_record', nameKey: 'leaderboard.bossRushRecord', icon: '🏆', sortDesc: true }
];

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

/**
 * Card pack types for skill card system
 */
export const CARD_PACKS = [
    { id: 'basic_pack', nameKey: 'cardPacks.basic.name', cards: 3, guaranteedRarity: null, cost: { crystals: 50 } },
    { id: 'premium_pack', nameKey: 'cardPacks.premium.name', cards: 5, guaranteedRarity: 'uncommon', cost: { crystals: 150 } },
    { id: 'elite_pack', nameKey: 'cardPacks.elite.name', cards: 5, guaranteedRarity: 'rare', cost: { ether: 50 } },
    { id: 'legendary_pack', nameKey: 'cardPacks.legendary.name', cards: 3, guaranteedRarity: 'legendary', cost: { ether: 200 } }
];

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
