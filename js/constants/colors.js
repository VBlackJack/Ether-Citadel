/*
 * Copyright 2025 Julien Bombled
 * Color Constants
 */

/**
 * Game color palette
 */
export const COLORS = {
    // Status effect colors
    STATUS_STASIS: '#1e40af',
    STATUS_ICE: '#38bdf8',
    STATUS_POISON: '#4ade80',
    STATUS_THERMAL: '#f97316',

    // Enemy type colors
    ENEMY_THIEF: '#94a3b8',
    ENEMY_PHANTOM: '#fff',

    // UI feedback colors
    SUCCESS: '#22c55e',
    ERROR: '#ef4444',
    WARNING: '#fbbf24',

    // Currency colors
    GOLD: '#fbbf24',
    CRYSTAL: '#22d3ee',
    ETHER: '#a855f7',
    GEM: '#e879f9',

    // UI colors
    ELITE_GOLD: '#facc15',
    GOLD_TEXT: '#fbbf24',
    DAMAGE_RED: '#ef4444',
    CRIT_PURPLE: '#d946ef',
    SUPER_CRIT: '#d946ef',
    WHITE: '#fff',

    // Health bar
    HEALTH_BG: 'red',
    HEALTH_FILL: '#4ade80',

    // Effects
    HEAL_BEAM: '#4ade80',
    BLAST_ORANGE: 'rgba(255,200,0,0.5)',
    CHAIN_LIGHTNING: '#67e8f9',
    ORBITAL: '#3b82f6',

    // Turret colors
    TURRET_ARTILLERY: '#fca5a5',
    TURRET_ROCKET: '#fdba74',
    TURRET_TESLA: '#67e8f9',
    TURRET_BASE: '#a5b4fc',

    // Castle tier colors
    CASTLE_TIER_1: '#3b82f6',
    CASTLE_TIER_2: '#a855f7',
    CASTLE_TIER_3: '#f43f5e',

    // Projectile colors
    PROJECTILE_BASE: '#60a5fa',

    // Background colors
    BG_DARK: '#0f172a',
    BG_SLATE: '#1e293b',

    // Wave effect colors
    WAVE_EFFECTS: ['#0f172a', '#1e1b4b', '#1a2e05', '#270a0a']
};

/**
 * Get enemy display color based on status effects
 * @param {Object} status - Enemy status object
 * @param {string} typeKey - Enemy type key
 * @param {string} defaultColor - Default color if no status active
 * @returns {string} CSS color value
 */
export function getEnemyDisplayColor(status, typeKey, defaultColor) {
    if (status.stasisTimer > 0) return COLORS.STATUS_STASIS;
    if (status.iceTimer > 0) return COLORS.STATUS_ICE;
    if (status.poisonTimer > 0) return COLORS.STATUS_POISON;
    if (typeKey === 'THIEF') return COLORS.ENEMY_THIEF;
    if (typeKey === 'PHANTOM') return COLORS.ENEMY_PHANTOM;
    return defaultColor;
}

/**
 * Get castle laser/projectile color based on tier
 * @param {number} tier - Castle tier (1-3+)
 * @returns {string} CSS color value
 */
export function getCastleTierColor(tier) {
    if (tier === 1) return COLORS.CASTLE_TIER_1;
    if (tier === 2) return COLORS.CASTLE_TIER_2;
    if (tier >= 3) return COLORS.CASTLE_TIER_3;
    return COLORS.WHITE;
}
