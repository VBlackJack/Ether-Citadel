/*
 * Copyright 2025 Julien Bombled
 * Game Balance Constants - Defender Idle Style Scaling
 */

export const BALANCE = {
    SCALING: {
        // Exponential growth factors - tuned for challenging progression
        // Key: HP grows faster than player damage upgrades forcing continuous investment
        HP_GROWTH: 1.22,       // Enemies get tougher (+22%/wave) - reduced from 1.25 for smoother curve
        DAMAGE_GROWTH: 1.12,   // Enemy damage scales steadily (reduced from 1.15)
        GOLD_GROWTH: 1.08,     // Gold scales to keep pace with difficulty (was 1.06)

        // Wave management
        BOSS_WAVE_INTERVAL: 10,
        BOSS_HP_MULTIPLIER: 10, // Bosses are challenging but not walls (10x normal HP)
        BOSS_DAMAGE_MULTIPLIER: 3.0,
        BOSS_CC_RESIST: 0.5,        // Boss CC duration reduced by 50%
        BOSS_SLOW_CAP: 0.85,        // Boss minimum speed when slowed (85% instead of 60%)

        // Late game scaling (Wave 50+)
        LATE_GAME_FACTOR: 1.08, // Extra multiplier added per wave after wave 50 (was 1.05)
        LATE_GAME_THRESHOLD: 50 // Wave threshold for late game scaling
    },
    TURRET: {
        // Diminishing returns per turret slot (first turret = 100%, 8th = 40%)
        // Total efficiency: 1+0.85+0.75+0.65+0.55+0.50+0.45+0.40 = 5.15x (not 8x)
        EFFICIENCY: [1.0, 0.85, 0.75, 0.65, 0.55, 0.50, 0.45, 0.40]
    },
    BASE: {
        ENEMY_HP: 18,      // Easier early game (was 30)
        ENEMY_DAMAGE: 6,   // Less punishing early (was 12)
        GOLD_DROP: 3,      // More gold to upgrade faster (was 2)
        CRYSTAL_DROP_CHANCE: 0.08  // 8% crystal drop (was 5%)
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
        ENEMIES_GROWTH: 0.2, // +1 enemy every 5 waves
        ENEMY_COUNT_MULTIPLIER: 1.5,
        ENEMY_COUNT_BASE: 3
    },
    DREAD: {
        // Dread difficulty scaling per level
        HP_PER_LEVEL: 0.5,        // +50% enemy HP per dread level
        DAMAGE_PER_LEVEL: 0.3,    // +30% enemy damage per dread level
        SPEED_PER_LEVEL: 0.1,     // +10% enemy speed per dread level
        CRYSTAL_BONUS_PER_LEVEL: 0.25, // +25% crystal bonus per level
        ETHER_BONUS_PER_LEVEL: 0.2     // +20% ether bonus per level
    },
    RUNE: {
        HEAL_PERCENT: 0.25 // Heal rune heals 25% of max HP
    },
    OFFLINE: {
        BASE_GOLD_PER_WAVE: 10 // Base gold earned per wave for offline progress
    }
};
