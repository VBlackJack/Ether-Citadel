/*
 * Copyright 2025 Julien Bombled
 * Licensed under the Apache License, Version 2.0
 */

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
 * Office - Temporary boost system
 */
export const OFFICE_BOOSTS = [
    { id: 'damage_boost', nameKey: 'office.damage.name', descKey: 'office.damage.desc', icon: '🗡️', mult: 2.0, duration: 300, baseCost: 10, effect: 'damage' },
    { id: 'gold_boost', nameKey: 'office.gold.name', descKey: 'office.gold.desc', icon: '💰', mult: 3.0, duration: 300, baseCost: 15, effect: 'gold' },
    { id: 'speed_boost', nameKey: 'office.speed.name', descKey: 'office.speed.desc', icon: '⚡', mult: 1.5, duration: 300, baseCost: 20, effect: 'attackSpeed' },
    { id: 'xp_boost', nameKey: 'office.xp.name', descKey: 'office.xp.desc', icon: '📈', mult: 2.0, duration: 300, baseCost: 25, effect: 'xp' },
    { id: 'crit_boost', nameKey: 'office.crit.name', descKey: 'office.crit.desc', icon: '💥', mult: 2.0, duration: 300, baseCost: 30, effect: 'critChance' }
];
