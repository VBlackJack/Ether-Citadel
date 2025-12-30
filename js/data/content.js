/*
 * Copyright 2025 Julien Bombled
 * Game Content and Events Data
 */

/**
 * Challenge definitions
 */
export const CHALLENGES = [
    { id: 'noregen', nameKey: 'challenges.noregen.name', descKey: 'challenges.noregen.desc', diff: 2 },
    { id: 'speed', nameKey: 'challenges.speed.name', descKey: 'challenges.speed.desc', diff: 3 },
    { id: 'glass', nameKey: 'challenges.glass.name', descKey: 'challenges.glass.desc', diff: 4 },
    { id: 'horde', nameKey: 'challenges.horde.name', descKey: 'challenges.horde.desc', diff: 5 }
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
