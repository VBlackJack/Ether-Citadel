/*
 * Copyright 2025 Julien Bombled
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Mining resource definitions
 */
export const MINING_RESOURCES = [
    { id: 'copper', nameKey: 'mining.copper.name', icon: '⛏️', baseRate: 1.5, color: '#b87333', tier: 1 },
    { id: 'iron', nameKey: 'mining.iron.name', icon: '🔩', baseRate: 0.8, color: '#71797E', tier: 1 },
    { id: 'crystal', nameKey: 'mining.crystal.name', icon: '💎', baseRate: 0.4, color: '#22d3ee', tier: 2 },
    { id: 'gold_ore', nameKey: 'mining.gold_ore.name', icon: '🥇', baseRate: 0.2, color: '#fbbf24', tier: 2 },
    { id: 'void_shard', nameKey: 'mining.void_shard.name', icon: '🔮', baseRate: 0.12, color: '#a855f7', tier: 3 },
    { id: 'starlight', nameKey: 'mining.starlight.name', icon: '✨', baseRate: 0.08, color: '#fff', tier: 3, critChance: 0.05 }
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
 * Resource exchange rates
 */
export const EXCHANGE_RATES = {
    goldToCrystals: { from: 'gold', to: 'crystals', rate: 1000, min: 1000 },
    crystalsToEther: { from: 'crystals', to: 'ether', rate: 50, min: 50 },
    etherToAscension: { from: 'ether', to: 'ascensionPoints', rate: 500, min: 500, unlockAscensions: 1 }
};

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
