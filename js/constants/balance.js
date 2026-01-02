/*
 * Copyright 2025 Julien Bombled
 * Game Balance Constants - Defender Idle Style Scaling
 */

export const BALANCE = {
    SCALING: {
        // Exponential growth factors - tuned for challenging progression
        // Key: HP grows faster (1.18) than player damage upgrades (1.10) forcing continuous investment
        HP_GROWTH: 1.18,       // Enemies get tougher (+18%/wave) - outpaces player damage scaling
        DAMAGE_GROWTH: 1.10,   // Enemy damage scales with HP
        GOLD_GROWTH: 1.10,     // Gold scales slower than HP - forces strategic choices

        // Wave management
        BOSS_WAVE_INTERVAL: 10,
        BOSS_HP_MULTIPLIER: 20, // Bosses are huge walls (20x normal HP)
        BOSS_DAMAGE_MULTIPLIER: 3.0,

        // Late game scaling (Wave 50+)
        LATE_GAME_FACTOR: 1.05, // Extra multiplier added per wave after wave 50
        LATE_GAME_THRESHOLD: 50 // Wave threshold for late game scaling
    },
    TURRET: {
        // Diminishing returns per turret slot (first turret = 100%, 8th = 40%)
        // Total efficiency: 1+0.85+0.75+0.65+0.55+0.50+0.45+0.40 = 5.15x (not 8x)
        EFFICIENCY: [1.0, 0.85, 0.75, 0.65, 0.55, 0.50, 0.45, 0.40]
    },
    BASE: {
        ENEMY_HP: 25,
        ENEMY_DAMAGE: 8,
        GOLD_DROP: 3,
        CRYSTAL_DROP_CHANCE: 0.05
    },
    ENTITY: {
        BASE_ENEMY_RADIUS: 12,    // Base radius for enemy collision/display
        ELITE_SPAWN_CHANCE: 0.05, // 5% chance for elite variant
        ELITE_HP_MULTIPLIER: 5,   // Elite enemies have 5x HP
        BOSS_SIZE_SCALE: 1.5,     // Boss visual scale multiplier
        SPAWN_OFFSET_X: 50        // Horizontal spawn offset from screen edge
    },
    WAVE: {
        ENEMIES_PER_WAVE_BASE: 5,
        ENEMIES_GROWTH: 0.2 // +1 enemy every 5 waves
    }
};
