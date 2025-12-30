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
 * Data Module Index
 * Re-exports all game data constants for backward compatibility
 */

// Enemy and Combat Data
export {
    ENEMY_TYPES,
    BOSS_MECHANICS,
    BOSS_ABILITIES,
    RUNE_TYPES,
    DREAD_LEVELS,
    COMBO_TIERS
} from './enemies.js';

// Turret and Defense Data
export {
    TURRET_TIERS,
    SCHOOL_TURRETS,
    TURRET_SLOTS,
    TURRET_SYNERGIES,
    AURA_TYPES,
    CHIP_TYPES
} from './turrets.js';

// Resource and Production Data
export {
    MINING_RESOURCES,
    FORGE_RECIPES,
    PRODUCTION_BUILDINGS,
    OFFICE_BOOSTS
} from './resources.js';

// Progression Data
export {
    PRESTIGE_UPGRADES,
    TOWN_LEVELS,
    AWAKENING_BONUSES,
    ASCENSION_PERKS,
    TALENT_TREES,
    MASTERIES,
    DARK_MATTER_UPGRADES,
    RESEARCH_TREE
} from './progression.js';

// Game Content Data
export {
    CHALLENGES,
    DAILY_QUEST_TYPES,
    CAMPAIGN_MISSIONS,
    GAME_MODES,
    SEASONAL_EVENTS,
    RANDOM_EVENTS,
    WEATHER_TYPES
} from './content.js';

// Upgrade System Data
export {
    createUpgrades,
    createMetaUpgrades,
    GAME_SPEEDS
} from './upgrades.js';

// Miscellaneous Data
export {
    RELIC_DB,
    ACHIEVEMENTS_DB,
    VISUAL_EFFECTS,
    MUSIC_TRACKS,
    SOUND_EFFECTS,
    BUILD_PRESET_SLOTS,
    LEADERBOARD_CATEGORIES
} from './misc.js';

// Re-export translation helpers
import { t } from '../i18n.js';

/**
 * Get translated name for a data item
 * @param {Object} item - Item with nameKey
 * @returns {string}
 */
export function getName(item) {
    return t(item.nameKey);
}

/**
 * Get translated description for a data item
 * @param {Object} item - Item with descKey
 * @returns {string}
 */
export function getDesc(item) {
    return t(item.descKey);
}
