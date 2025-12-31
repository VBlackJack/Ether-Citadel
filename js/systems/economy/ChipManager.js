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
 * ChipManager - Handles chip inventory, equipment, and effects
 */

import { CHIP_TYPES } from '../../data.js';

export class ChipManager {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
        this.inventory = [];
        this.turretChips = {};
        this.maxChipsPerTurret = 3;
    }

    /**
     * Generate a cryptographically unique ID
     * @returns {string}
     */
    generateUid() {
        const array = new Uint32Array(2);
        crypto.getRandomValues(array);
        return `${array[0].toString(36)}${array[1].toString(36)}`;
    }

    /**
     * Generate a random chip with rarity
     * @returns {object}
     */
    generateRandomChip() {
        const rarityRoll = Math.random();
        let maxRarity = 1;
        if (rarityRoll > 0.95) maxRarity = 4;
        else if (rarityRoll > 0.85) maxRarity = 3;
        else if (rarityRoll > 0.6) maxRarity = 2;

        const available = CHIP_TYPES.filter(c => c.rarity <= maxRarity);
        const chip = available[Math.floor(Math.random() * available.length)];
        return { ...chip, uid: this.generateUid() };
    }

    /**
     * Add a chip to inventory
     * @param {object} chip
     */
    addChip(chip) {
        this.inventory.push(chip);
        this.game.save?.();
    }

    /**
     * Remove a chip from inventory
     * @param {number} uid
     */
    removeChip(uid) {
        const idx = this.inventory.findIndex(c => c.uid === uid);
        if (idx !== -1) {
            this.inventory.splice(idx, 1);
            this.game.save?.();
        }
    }

    /**
     * Equip a chip to a turret
     * @param {string} turretId
     * @param {number} chipUid
     * @returns {boolean}
     */
    equipChip(turretId, chipUid) {
        if (!this.turretChips[turretId]) {
            this.turretChips[turretId] = [];
        }
        if (this.turretChips[turretId].length >= this.maxChipsPerTurret) return false;

        const chipIdx = this.inventory.findIndex(c => c.uid === chipUid);
        if (chipIdx === -1) return false;

        const chip = this.inventory.splice(chipIdx, 1)[0];
        this.turretChips[turretId].push(chip);
        this.game.save?.();
        return true;
    }

    /**
     * Unequip a chip from a turret
     * @param {string} turretId
     * @param {number} chipUid
     * @returns {boolean}
     */
    unequipChip(turretId, chipUid) {
        if (!this.turretChips[turretId]) return false;
        const idx = this.turretChips[turretId].findIndex(c => c.uid === chipUid);
        if (idx === -1) return false;

        const chip = this.turretChips[turretId].splice(idx, 1)[0];
        this.inventory.push(chip);
        this.game.save?.();
        return true;
    }

    /**
     * Get combined chip effects for a turret
     * @param {string} turretId
     * @returns {object}
     */
    getTurretChipEffects(turretId) {
        const effects = {
            damage: 0,
            fireRate: 0,
            range: 0,
            critChance: 0,
            critDamage: 0,
            pierce: 0,
            splash: 0,
            leech: 0
        };

        const chips = this.turretChips[turretId] || [];
        for (const chip of chips) {
            for (const [key, value] of Object.entries(chip.effect)) {
                effects[key] = (effects[key] || 0) + value;
            }
        }
        return effects;
    }

    /**
     * Get inventory count
     * @returns {number}
     */
    getInventoryCount() {
        return this.inventory.length;
    }

    /**
     * Get chips equipped on a turret
     * @param {string} turretId
     * @returns {Array}
     */
    getTurretChips(turretId) {
        return this.turretChips[turretId] || [];
    }

    /**
     * Get save data
     * @returns {object}
     */
    getSaveData() {
        return {
            inventory: this.inventory,
            turretChips: this.turretChips
        };
    }

    /**
     * Load save data
     * @param {object} data
     */
    loadSaveData(data) {
        if (!data) return;
        this.inventory = data.inventory || [];
        this.turretChips = data.turretChips || {};
    }
}
