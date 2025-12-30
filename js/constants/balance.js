/*
 * Copyright 2025 Julien Bombled
 * Game Balance Constants
 */

/**
 * Enemy balance constants
 */
export const ENEMY_BALANCE = {
    // Elite enemies
    ELITE_SPAWN_CHANCE: 0.05,
    ELITE_HP_MULTIPLIER: 5,
    ELITE_GOLD_MULTIPLIER: 10,

    // Status effects
    ICE_SLOW_MULTIPLIER: 0.6,
    POISON_TICK_DIVISOR: 60,

    // Healer
    HEALER_HEAL_CHANCE: 0.05,
    HEALER_HEAL_PERCENTAGE: 0.05,
    HEALER_HEAL_RANGE: 150,

    // Thief
    THIEF_STEAL_PERCENTAGE: 0.1,
    THIEF_FLEE_SPEED_MULT: 1.5,

    // Phantom
    PHANTOM_TELEPORT_INTERVAL: 2000,
    PHANTOM_TELEPORT_DISTANCE: 100,

    // Boss
    BOSS_DAMAGE_MULT: 5,
    BOSS_GOLD_MULT: 15,
    BOSS_XP_VALUE: 10,

    // General
    NORMAL_XP_VALUE: 1,
    RUNE_DROP_CHANCE: 0.05,
    DARK_MATTER_DROP_CHANCE: 0.01,
    THERMAL_SHOCK_DAMAGE_MULT: 2,
    THERMAL_SHOCK_COOLDOWN: 1000,

    // Turret attack
    TURRET_ATTACK_RANGE: 50,
    TURRET_ATTACK_SLOW: 0.3,
    TURRET_DAMAGE_RATE: 0.08
};

/**
 * Combat balance constants
 */
export const COMBAT_BALANCE = {
    // Damage calculation
    BLACKHOLE_DAMAGE_MULT: 0.1,
    RUSH_BONUS_MULT: 0.25,
    CATCHUP_BONUS_MULT: 1.5,

    // Castle
    CASTLE_DAMAGE_RATE: 0.05,
    MIDAS_GOLD_MULT: 5,

    // Critical hits
    CRIT_TEXT_SIZE: 30,
    SUPER_CRIT_TEXT_SIZE: 40,
    NORMAL_TEXT_SIZE: 20
};

/**
 * Particle system constants
 */
export const PARTICLE_COUNTS = {
    BOSS_DEATH: 20,
    ENEMY_DEATH: 3,
    MAX_PARTICLES: 50
};

/**
 * Forge error codes
 */
export const FORGE_ERRORS = {
    RECIPE_NOT_FOUND: 'not_found',
    UNKNOWN_TYPE: 'unknown_type',
    INSUFFICIENT_RELICS: 'not_enough_relics',
    NO_UPGRADE_PATH: 'no_upgrade',
    NO_OPTIONS: 'no_options',
    CANNOT_PURCHASE: 'cannot_purchase'
};
