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
 * Data Module
 *
 * This file re-exports all data definitions for backwards compatibility.
 * Modular data files are available in ./data/ directory:
 * - turrets.js: TURRET_TIERS, SCHOOL_TURRETS, TURRET_SYNERGIES, etc.
 * - enemies.js: ENEMY_TYPES, BOSS_MECHANICS, UNIQUE_BOSSES, etc.
 * - resources.js: MINING_RESOURCES, FORGE_RECIPES, EXCHANGE_RATES, etc.
 * - progression.js: PRESTIGE_UPGRADES, PASSIVES, TALENT_TREES, etc.
 * - content.js: CHALLENGES, CAMPAIGN_MISSIONS, GAME_MODES, WORLDS, etc.
 * - skills.js: SKILLS_DATA, SKILL_COMBOS, SKILL_CARDS, etc.
 * - relics.js: RELIC_DB, RELIC_EVOLUTIONS, RELIC_SYNERGIES
 * - upgrades.js: DARK_MATTER_UPGRADES, RESEARCH_TREE, createUpgrades, etc.
 * - misc.js: ACHIEVEMENTS_DB, WEATHER_TYPES, RANDOM_EVENTS, etc.
 * - characters.js: CHARACTER_CLASSES, EQUIPMENT_TYPES, PETS
 * - town.js: TOWN_LEVELS, OFFICE_BOOSTS
 *
 * New code can import from './data/index.js' for modular access.
 */

import { t } from './i18n.js';

// Re-export everything from modular data files
export * from './data/index.js';

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
