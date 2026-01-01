/*
 * Copyright 2025 Julien Bombled
 * Game Balance Constants - Defender Idle Style Scaling
 */

export const BALANCE = {
    SCALING: {
        // Exponential growth factors (1.10 = +10% per wave)
        HP_GROWTH: 1.12,       // Enemies get tougher fast
        DAMAGE_GROWTH: 1.05,   // Damage scales slower than HP
        GOLD_GROWTH: 1.10,     // Gold keeps up with HP to allow upgrades

        // Wave management
        BOSS_WAVE_INTERVAL: 10,
        BOSS_HP_MULTIPLIER: 12, // Bosses are huge walls (12x normal HP)
        BOSS_DAMAGE_MULTIPLIER: 2.5,

        // Late game scaling (Wave 50+)
        LATE_GAME_FACTOR: 1.02 // Extra multiplier added per wave after wave 50
    },
    BASE: {
        ENEMY_HP: 20,
        ENEMY_DAMAGE: 5,
        GOLD_DROP: 2,
        CRYSTAL_DROP_CHANCE: 0.05
    },
    WAVE: {
        ENEMIES_PER_WAVE_BASE: 5,
        ENEMIES_GROWTH: 0.2 // +1 enemy every 5 waves
    }
};
