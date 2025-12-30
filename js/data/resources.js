/*
 * Copyright 2025 Julien Bombled
 * Resource and Production Data
 */

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
 * Production building definitions for passive resource generation
 */
export const PRODUCTION_BUILDINGS = [
    { id: 'gold_mine', nameKey: 'production.gold_mine.name', descKey: 'production.gold_mine.desc', icon: '🏭', resource: 'gold', baseRate: 1, baseCost: 100, costMult: 1.5, maxLevel: 50 },
    { id: 'crystal_extractor', nameKey: 'production.crystal_extractor.name', descKey: 'production.crystal_extractor.desc', icon: '💎', resource: 'crystal', baseRate: 0.1, baseCost: 500, costMult: 1.8, maxLevel: 25 },
    { id: 'ether_condenser', nameKey: 'production.ether_condenser.name', descKey: 'production.ether_condenser.desc', icon: '🔮', resource: 'ether', baseRate: 0.05, baseCost: 1000, costMult: 2.0, maxLevel: 10 },
    { id: 'void_harvester', nameKey: 'production.void_harvester.name', descKey: 'production.void_harvester.desc', icon: '🌑', resource: 'void_shard', baseRate: 0.02, baseCost: 5000, costMult: 2.5, maxLevel: 5 }
];

/**
 * Office - Temporary boost system
 */
export const OFFICE_BOOSTS = [
    { id: 'damage_boost', nameKey: 'office.damage.name', descKey: 'office.damage.desc', icon: '⚔️', mult: 2.0, duration: 300, baseCost: 10, effect: 'damage' },
    { id: 'gold_boost', nameKey: 'office.gold.name', descKey: 'office.gold.desc', icon: '💰', mult: 3.0, duration: 300, baseCost: 15, effect: 'gold' },
    { id: 'speed_boost', nameKey: 'office.speed.name', descKey: 'office.speed.desc', icon: '🚀', mult: 1.5, duration: 300, baseCost: 20, effect: 'attackSpeed' },
    { id: 'xp_boost', nameKey: 'office.xp.name', descKey: 'office.xp.desc', icon: '📈', mult: 2.0, duration: 300, baseCost: 25, effect: 'xp' },
    { id: 'crit_boost', nameKey: 'office.crit.name', descKey: 'office.crit.desc', icon: '💥', mult: 2.0, duration: 300, baseCost: 30, effect: 'critChance' }
];
