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
 * Skill IDs - Active skills triggered by player
 */
export const SKILL = {
    OVERDRIVE: 'overdrive',
    NUKE: 'nuke',
    BLACKHOLE: 'blackhole'
};

/**
 * Rune IDs - Temporary buffs from rune pickups
 */
export const RUNE = {
    RAGE: 'rage',
    MIDAS: 'midas'
};

/**
 * Upgrade IDs - Purchasable upgrades
 */
export const UPGRADE = {
    // Core upgrades
    DAMAGE: 'damage',
    SPEED: 'speed',
    HEALTH: 'health',

    // Defensive upgrades
    REGEN: 'regen',
    SHIELD: 'shield',
    ARMOR: 'armor',

    // Offensive upgrades
    CRIT: 'crit',
    MULTISHOT: 'multishot',
    BOUNCE: 'bounce',
    BLAST: 'blast',
    LEECH: 'leech',

    // Status effect upgrades
    ICE: 'ice',
    POISON: 'poison',
    STASIS: 'stasis',

    // Turret upgrades
    TURRET: 'turret',
    ORBITAL: 'orbital',
    ARTILLERY: 'artillery',
    ROCKET: 'rocket',
    TESLA: 'tesla'
};

/**
 * List of upgrade IDs that reset on prestige
 */
export const PRESTIGE_RESET_UPGRADES = [
    UPGRADE.REGEN,
    UPGRADE.MULTISHOT,
    UPGRADE.TURRET,
    UPGRADE.CRIT,
    UPGRADE.ICE,
    UPGRADE.POISON,
    UPGRADE.BOUNCE,
    UPGRADE.BLAST,
    UPGRADE.LEECH,
    UPGRADE.SHIELD,
    UPGRADE.STASIS,
    UPGRADE.ORBITAL,
    UPGRADE.ARTILLERY,
    UPGRADE.ROCKET,
    UPGRADE.TESLA,
    UPGRADE.ARMOR
];
