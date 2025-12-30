/*
 * Copyright 2025 Julien Bombled
 * Miscellaneous Game Data
 */

/**
 * Relic definitions
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
    { id: 'temporal_shard', nameKey: 'relics.temporal_shard.name', icon: '⏱️', descKey: 'relics.temporal_shard.desc', tier: 2, effect: (g) => { g.relicMults.cooldown += 0.15; g.relicMults.speed += 0.1; } },
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
    { id: 0, name: 'Preset 1', icon: '1️⃣' },
    { id: 1, name: 'Preset 2', icon: '2️⃣' },
    { id: 2, name: 'Preset 3', icon: '3️⃣' },
    { id: 3, name: 'Preset 4', icon: '4️⃣' },
    { id: 4, name: 'Preset 5', icon: '5️⃣' }
];

/**
 * Leaderboard categories
 */
export const LEADERBOARD_CATEGORIES = [
    { id: 'highest_wave', nameKey: 'leaderboard.highestWave', icon: '🌊', sortDesc: true },
    { id: 'max_dps', nameKey: 'leaderboard.maxDps', icon: '⚔️', sortDesc: true },
    { id: 'fastest_wave_50', nameKey: 'leaderboard.fastestWave50', icon: '⏱️', sortDesc: false },
    { id: 'total_kills', nameKey: 'leaderboard.totalKills', icon: '💀', sortDesc: true },
    { id: 'bosses_defeated', nameKey: 'leaderboard.bossesDefeated', icon: '👑', sortDesc: true },
    { id: 'highest_combo', nameKey: 'leaderboard.highestCombo', icon: '🔥', sortDesc: true },
    { id: 'endless_record', nameKey: 'leaderboard.endlessRecord', icon: '♾️', sortDesc: true },
    { id: 'boss_rush_record', nameKey: 'leaderboard.bossRushRecord', icon: '👑', sortDesc: true }
];
