/*
 * Copyright 2025 Julien Bombled
 * Licensed under the Apache License, Version 2.0
 */

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
 * Rune type definitions
 * @type {Array<{id: string, nameKey: string, color: string, icon: string, duration: number, descKey: string, instant?: boolean}>}
 */
export const RUNE_TYPES = [
    { id: 'rage', nameKey: 'runes.rage.name', color: '#ef4444', icon: '🔥', duration: 10000, descKey: 'runes.rage.desc' },
    { id: 'midas', nameKey: 'runes.midas.name', color: '#fbbf24', icon: '👑', duration: 10000, descKey: 'runes.midas.desc' },
    { id: 'heal', nameKey: 'runes.heal.name', color: '#4ade80', icon: '💚', duration: 0, descKey: 'runes.heal.desc', instant: true }
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
 * Production building definitions for passive resource generation
 */
export const PRODUCTION_BUILDINGS = [
    { id: 'gold_mine', nameKey: 'production.gold_mine.name', descKey: 'production.gold_mine.desc', icon: '🏭', resource: 'gold', baseRate: 1, baseCost: 100, costMult: 1.5, maxLevel: 50 },
    { id: 'crystal_extractor', nameKey: 'production.crystal_extractor.name', descKey: 'production.crystal_extractor.desc', icon: '💎', resource: 'crystal', baseRate: 0.1, baseCost: 500, costMult: 1.8, maxLevel: 25 },
    { id: 'ether_condenser', nameKey: 'production.ether_condenser.name', descKey: 'production.ether_condenser.desc', icon: '⚗️', resource: 'ether', baseRate: 0.05, baseCost: 1000, costMult: 2.0, maxLevel: 10 },
    { id: 'void_harvester', nameKey: 'production.void_harvester.name', descKey: 'production.void_harvester.desc', icon: '🌌', resource: 'void_shard', baseRate: 0.02, baseCost: 5000, costMult: 2.5, maxLevel: 5 }
];
