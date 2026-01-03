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
 * EquipmentManager - Handles equipment/gear system
 */

import { EQUIPMENT_SLOTS, EQUIPMENT_TYPES } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';

export class EquipmentManager {
    constructor(game) {
        this.game = game;
        this.inventory = [];
        this.equipped = {};
        this.maxInventory = 50;

        // Initialize empty slots
        for (const slot of EQUIPMENT_SLOTS) {
            this.equipped[slot] = null;
        }
    }

    /**
     * Add equipment to inventory
     */
    addToInventory(equipmentId, slot) {
        if (this.inventory.length >= this.maxInventory) {
            return false;
        }

        const equipment = EQUIPMENT_TYPES[slot]?.find(e => e.id === equipmentId);
        if (!equipment) return false;

        this.inventory.push({
            id: equipmentId,
            slot: slot,
            ...equipment
        });

        this.game.save();
        return true;
    }

    /**
     * Drop random equipment from boss
     */
    dropFromBoss(tier = 1) {
        const slots = Object.keys(EQUIPMENT_TYPES);
        const randomSlot = slots[Math.floor(Math.random() * slots.length)];
        const slotEquipment = EQUIPMENT_TYPES[randomSlot].filter(e => e.tier <= tier + 1);

        if (slotEquipment.length === 0) return null;

        // Weight towards current tier
        const weights = slotEquipment.map(e => e.tier === tier ? 3 : (e.tier === tier + 1 ? 1 : 2));
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < slotEquipment.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                const dropped = slotEquipment[i];
                if (this.addToInventory(dropped.id, randomSlot)) {
                    if (this.game.floatingTexts) {
                        this.game.floatingTexts.push(FloatingText.create(
                            this.game.width / 2,
                            this.game.height / 2,
                            `${dropped.icon} ${t('equipment.found')}!`,
                            '#fbbf24',
                            28
                        ));
                    }
                    return dropped;
                }
                return null;
            }
        }
        return null;
    }

    /**
     * Equip item from inventory
     */
    equip(inventoryIndex) {
        if (inventoryIndex < 0 || inventoryIndex >= this.inventory.length) {
            return false;
        }

        const item = this.inventory[inventoryIndex];
        const slot = item.slot;

        // Unequip current item first
        if (this.equipped[slot]) {
            this.inventory.push(this.equipped[slot]);
        }

        // Equip new item
        this.equipped[slot] = item;
        this.inventory.splice(inventoryIndex, 1);

        this.recalculateStats();
        this.game.sound?.play('equip');
        this.game.save();
        return true;
    }

    /**
     * Unequip item from slot
     */
    unequip(slot) {
        if (!this.equipped[slot]) return false;
        if (this.inventory.length >= this.maxInventory) return false;

        this.inventory.push(this.equipped[slot]);
        this.equipped[slot] = null;

        this.recalculateStats();
        this.game.save();
        return true;
    }

    /**
     * Sell item from inventory
     */
    sell(inventoryIndex) {
        if (inventoryIndex < 0 || inventoryIndex >= this.inventory.length) {
            return false;
        }

        const item = this.inventory[inventoryIndex];
        const goldValue = this.getItemValue(item);

        this.game.gold += goldValue;
        this.inventory.splice(inventoryIndex, 1);

        this.game.sound?.play('coin');
        this.game.save();
        return true;
    }

    /**
     * Get gold value of an item
     */
    getItemValue(item) {
        const tierValues = { 1: 100, 2: 500, 3: 2000, 4: 10000 };
        return tierValues[item.tier] || 100;
    }

    /**
     * Recalculate equipment stats
     */
    recalculateStats() {
        if (!this.game.equipmentMults) {
            this.game.equipmentMults = {};
        }

        // Reset
        const mults = this.game.equipmentMults;
        for (const key of Object.keys(mults)) {
            mults[key] = 0;
        }

        // Add all equipped stats
        for (const slot of EQUIPMENT_SLOTS) {
            const item = this.equipped[slot];
            if (item && item.stats) {
                for (const [stat, value] of Object.entries(item.stats)) {
                    mults[stat] = (mults[stat] || 0) + value;
                }
            }
        }
    }

    /**
     * Get equipment stat bonuses
     */
    getStatBonuses() {
        return this.game.equipmentMults || {};
    }

    /**
     * Get inventory items
     */
    getInventory() {
        return this.inventory.map((item, index) => ({
            ...item,
            index,
            value: this.getItemValue(item)
        }));
    }

    /**
     * Get equipped items
     */
    getEquipped() {
        const result = {};
        for (const slot of EQUIPMENT_SLOTS) {
            result[slot] = this.equipped[slot];
        }
        return result;
    }

    /**
     * Get total equipment power
     */
    getTotalPower() {
        let power = 0;
        for (const slot of EQUIPMENT_SLOTS) {
            const item = this.equipped[slot];
            if (item) {
                power += item.tier * 10;
                for (const value of Object.values(item.stats || {})) {
                    power += Math.abs(value) * 100;
                }
            }
        }
        return Math.floor(power);
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            inventory: this.inventory.map(item => ({ id: item.id, slot: item.slot })),
            equipped: Object.fromEntries(
                Object.entries(this.equipped).map(([slot, item]) =>
                    [slot, item ? { id: item.id, slot: item.slot } : null]
                )
            )
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;

        // Restore inventory
        this.inventory = [];
        if (data.inventory) {
            for (const saved of data.inventory) {
                const equipment = EQUIPMENT_TYPES[saved.slot]?.find(e => e.id === saved.id);
                if (equipment) {
                    this.inventory.push({ ...equipment, slot: saved.slot });
                }
            }
        }

        // Restore equipped
        for (const slot of EQUIPMENT_SLOTS) {
            this.equipped[slot] = null;
            if (data.equipped && data.equipped[slot]) {
                const saved = data.equipped[slot];
                const equipment = EQUIPMENT_TYPES[saved.slot]?.find(e => e.id === saved.id);
                if (equipment) {
                    this.equipped[slot] = { ...equipment, slot: saved.slot };
                }
            }
        }

        this.recalculateStats();
    }
}
