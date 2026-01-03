/*
 * Copyright 2025 Julien Bombled
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Game configuration constants
 */
export const CONFIG = {
    // Enemy settings
    baseEnemySpeed: 0.8,
    enemySpawnRate: 1500,

    // Save settings
    saveKey: 'ether_citadel_save_v2',
    saveIntervalMs: 30000,
    SAVE_VERSION: 2,

    // Evolution settings
    evolutionInterval: 10,
    evolutionMultiplier: 1.5,

    // Offline progression (increased cap and multiplier)
    maxOfflineHours: 24,
    offlineEarningsMultiplier: 0.75,

    // Crystal calculation
    crystalWaveDivisor: 10,
    dreadBonusPerLevel: 0.25,

    // Castle defaults
    castle: {
        baseMaxHp: 100,
        width: 80,
        height: 100,
        radius: 60
    },

    // Turret settings
    turret: {
        baseDamageMultiplier: 0.25,
        orbitSpeed: 0.001,
        orbitRadius: 100,
        projectileSpeed: 15
    },

    // Particle counts
    particles: {
        explosion: 20,
        death: 6,
        impact: 3,
        levelUp: 30,
        prestige: 5
    },

    // UI settings
    ui: {
        toastDuration: 3000,
        floatingTextSize: 20,
        damageOverlayDuration: 200,
        storageKeys: {
            activeTab: 'aegis_ui_tab',
            buyMode: 'aegis_ui_buyMode',
            tutorialComplete: 'aegis_tutorial_complete'
        }
    },

    // Dread system
    dread: {
        maxUnlockedLevels: 10,
        wavesPerUnlock: 10
    }
};

/**
 * Sound definitions for procedural audio - Improved volumes for better feedback
 */
export const SOUND_DB = {
    shoot: { type: 'square', freq: 400, decay: 0.1, vol: 0.25 },
    hit: { type: 'sawtooth', freq: 100, decay: 0.1, vol: 0.2 },
    coin: { type: 'sine', freq: 800, decay: 0.2, vol: 0.15, slide: true },
    levelup: { type: 'triangle', freq: 600, decay: 0.5, vol: 0.35, melody: true },
    gameover: { type: 'sawtooth', freq: 150, decay: 1.0, vol: 0.4, slideDown: true },
    // Enhanced feedback sounds
    crit: { type: 'square', freq: 600, decay: 0.15, vol: 0.3, slide: true },
    upgrade: { type: 'sine', freq: 500, decay: 0.2, vol: 0.25, slide: true },
    prestige: { type: 'triangle', freq: 400, decay: 0.8, vol: 0.4, melody: true },
    unlock: { type: 'sine', freq: 700, decay: 0.3, vol: 0.3, slide: true },
    skill: { type: 'square', freq: 300, decay: 0.3, vol: 0.3 },
    boss: { type: 'sawtooth', freq: 80, decay: 0.5, vol: 0.35 },
    // New sounds from UX audit
    achievement: { type: 'triangle', freq: 800, decay: 0.6, vol: 0.4, melody: true },
    waveStart: { type: 'sine', freq: 350, decay: 0.3, vol: 0.25 },
    waveComplete: { type: 'triangle', freq: 500, decay: 0.4, vol: 0.3, slide: true },
    comboUp: { type: 'square', freq: 450, decay: 0.2, vol: 0.25, slide: true }
};

/**
 * Math utility functions
 */
export const MathUtils = {
    lerp: (a, b, t) => a + (b - a) * t,
    dist: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
    distSq: (x1, y1, x2, y2) => (x2 - x1) ** 2 + (y2 - y1) ** 2,
    randomRange: (min, max) => Math.random() * (max - min) + min
};

// Re-export from services for backward compatibility
export {
    formatNumber,
    formatCurrency,
    formatPercent,
    formatMultiplier,
    formatTime,
    BigNum,
    BigNumService
} from './services/BigNumService.js';

export {
    SaveService,
    SAVE_VERSION
} from './services/SaveService.js';

export {
    ConfigLoader,
    SCHEMAS,
    ConfigValidationError
} from './services/ConfigLoader.js';
