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

    // UI colors
    ELITE_GOLD: '#facc15',
    GOLD_TEXT: '#fbbf24',
    DAMAGE_RED: '#ef4444',
    CRIT_PURPLE: '#d946ef',
    WHITE: '#fff',

    // Health bar
    HEALTH_BG: 'red',
    HEALTH_FILL: '#4ade80',

    // Effects
    HEAL_BEAM: '#4ade80',
    BLAST_ORANGE: 'rgba(255,200,0,0.5)',
    CHAIN_LIGHTNING: '#67e8f9',

    // Turret colors
    TURRET_ARTILLERY: '#fca5a5',
    TURRET_ROCKET: '#fdba74',
    TURRET_TESLA: '#67e8f9',
    TURRET_BASE: '#a5b4fc'
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
