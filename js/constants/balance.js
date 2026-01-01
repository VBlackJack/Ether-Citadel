/*
 * Copyright 2025 Julien Bombled
 * Game Balance Constants - Defender Idle Style Scaling
 */

export const BALANCE = {
    SCALING: {
        // Exponential growth factors (1.10 = +10% per wave)
        HP_GROWTH: 1.18,       // Enemies get tougher fast (+18%/wave)
        DAMAGE_GROWTH: 1.08,   // Damage scales with HP
        GOLD_GROWTH: 1.12,     // Gold keeps up with HP to allow upgrades

        // Wave management
        BOSS_WAVE_INTERVAL: 10,
        BOSS_HP_MULTIPLIER: 15, // Bosses are huge walls (15x normal HP)
        BOSS_DAMAGE_MULTIPLIER: 3.0,

        // Late game scaling (Wave 50+)
        LATE_GAME_FACTOR: 1.03 // Extra multiplier added per wave after wave 50
    },
    BASE: {
        ENEMY_HP: 25,
        ENEMY_DAMAGE: 8,
        GOLD_DROP: 3,
        CRYSTAL_DROP_CHANCE: 0.05
    },
    WAVE: {
        ENEMIES_PER_WAVE_BASE: 5,
        ENEMIES_GROWTH: 0.2 // +1 enemy every 5 waves
    }
};
