/*
 * Copyright 2025 Julien Bombled
 * Enemy and Combat Data
 */

/**
 * Enemy type definitions
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
    PHANTOM: { color: '#ffffff', hpMult: 0.8, speedMult: 1.0, scale: 1.0, nameKey: 'enemies.PHANTOM.name', descKey: 'enemies.PHANTOM.desc' },
    FLYING: { color: '#38bdf8', hpMult: 0.7, speedMult: 1.4, scale: 0.9, nameKey: 'enemies.FLYING.name', descKey: 'enemies.FLYING.desc', flying: true },
    ARMORED: { color: '#78716c', hpMult: 3.0, speedMult: 0.5, scale: 1.5, nameKey: 'enemies.ARMORED.name', descKey: 'enemies.ARMORED.desc', armor: 0.5 },
    SHIELDED: { color: '#06b6d4', hpMult: 1.0, speedMult: 0.9, scale: 1.2, nameKey: 'enemies.SHIELDED.name', descKey: 'enemies.SHIELDED.desc', shield: true },
    NECRO: { color: '#581c87', hpMult: 2.0, speedMult: 0.6, scale: 1.3, nameKey: 'enemies.NECRO.name', descKey: 'enemies.NECRO.desc', summon: true },
    BERSERKER: { color: '#dc2626', hpMult: 1.8, speedMult: 1.0, scale: 1.2, nameKey: 'enemies.BERSERKER.name', descKey: 'enemies.BERSERKER.desc', enrage: true },
    MEGA_BOSS: { color: '#7c3aed', hpMult: 50, speedMult: 0.3, scale: 3.5, nameKey: 'enemies.MEGA_BOSS.name', descKey: 'enemies.MEGA_BOSS.desc', phases: 3 }
};

/**
 * Boss mechanics for multi-phase boss fights
 */
export const BOSS_MECHANICS = {
    phases: [
        { hpThreshold: 0.75, ability: 'summonMinions', cooldown: 10000 },
        { hpThreshold: 0.50, ability: 'enrage', cooldown: 15000 },
        { hpThreshold: 0.25, ability: 'shieldBurst', cooldown: 20000 }
    ],
    megaBossPhases: [
        { hpThreshold: 0.80, abilities: ['summonElites', 'barrier'], duration: 30000 },
        { hpThreshold: 0.50, abilities: ['enrage', 'deathSpiral'], duration: 45000 },
        { hpThreshold: 0.20, abilities: ['heal', 'meteorStorm'], duration: 60000 }
    ]
};

/**
 * Boss abilities
 */
export const BOSS_ABILITIES = {
    summonMinions: { nameKey: 'bossAbility.summonMinions', count: 5, type: 'NORMAL' },
    summonElites: { nameKey: 'bossAbility.summonElites', count: 2, type: 'TANK' },
    enrage: { nameKey: 'bossAbility.enrage', speedMult: 2, damageMult: 1.5, duration: 5000 },
    shieldBurst: { nameKey: 'bossAbility.shieldBurst', shieldAmount: 0.3 },
    barrier: { nameKey: 'bossAbility.barrier', duration: 3000, invulnerable: true },
    deathSpiral: { nameKey: 'bossAbility.deathSpiral', damage: 50, radius: 200 },
    heal: { nameKey: 'bossAbility.heal', amount: 0.1 },
    meteorStorm: { nameKey: 'bossAbility.meteorStorm', count: 10, damage: 100 }
};

/**
 * Rune collectible types
 */
export const RUNE_TYPES = [
    { id: 'rage', nameKey: 'runes.rage.name', color: '#ef4444', icon: '🔴', duration: 10000, descKey: 'runes.rage.desc' },
    { id: 'midas', nameKey: 'runes.midas.name', color: '#fbbf24', icon: '🟡', duration: 10000, descKey: 'runes.midas.desc' },
    { id: 'heal', nameKey: 'runes.heal.name', color: '#4ade80', icon: '🟢', duration: 0, descKey: 'runes.heal.desc', instant: true }
];

/**
 * Dread (difficulty) level definitions
 * Rebalanced: enemy multiplier capped at 50x, rewards scale more generously
 */
export const DREAD_LEVELS = [
    { level: 0, nameKey: 'dread.level0', enemyMult: 1.0, rewardMult: 1.0, color: '#94a3b8' },
    { level: 1, nameKey: 'dread.level1', enemyMult: 1.5, rewardMult: 1.5, color: '#fbbf24' },
    { level: 2, nameKey: 'dread.level2', enemyMult: 2.0, rewardMult: 2.0, color: '#f97316' },
    { level: 3, nameKey: 'dread.level3', enemyMult: 3.0, rewardMult: 3.0, color: '#ef4444' },
    { level: 4, nameKey: 'dread.level4', enemyMult: 5.0, rewardMult: 5.0, color: '#dc2626' },
    { level: 5, nameKey: 'dread.level5', enemyMult: 8.0, rewardMult: 8.0, color: '#991b1b' },
    { level: 6, nameKey: 'dread.level6', enemyMult: 12.0, rewardMult: 12.0, color: '#7f1d1d' },
    { level: 7, nameKey: 'dread.level7', enemyMult: 20.0, rewardMult: 20.0, color: '#a855f7' },
    { level: 8, nameKey: 'dread.level8', enemyMult: 30.0, rewardMult: 35.0, color: '#9333ea' },
    { level: 9, nameKey: 'dread.level9', enemyMult: 40.0, rewardMult: 50.0, color: '#6b21a8' },
    { level: 10, nameKey: 'dread.level10', enemyMult: 50.0, rewardMult: 75.0, color: '#000' }
];

/**
 * Combo tier definitions for kill streaks
 */
export const COMBO_TIERS = [
    { threshold: 0, name: 'combo.none', multiplier: 1.0, color: '#94a3b8' },
    { threshold: 5, name: 'combo.nice', multiplier: 1.1, color: '#22c55e' },
    { threshold: 10, name: 'combo.good', multiplier: 1.25, color: '#3b82f6' },
    { threshold: 25, name: 'combo.great', multiplier: 1.5, color: '#a855f7' },
    { threshold: 50, name: 'combo.amazing', multiplier: 2.0, color: '#f97316' },
    { threshold: 100, name: 'combo.incredible', multiplier: 2.5, color: '#ef4444' },
    { threshold: 200, name: 'combo.unstoppable', multiplier: 3.0, color: '#ec4899' },
    { threshold: 500, name: 'combo.godlike', multiplier: 4.0, color: '#fbbf24' }
];
