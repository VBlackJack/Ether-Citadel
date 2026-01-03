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
 * ClassManager - Handles character class system
 */

import { CHARACTER_CLASSES } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';

export class ClassManager {
    constructor(game) {
        this.game = game;
        this.selectedClass = null;
        this.classLevels = {};
        this.classXp = {};
        this.passiveLevels = {};

        // Initialize class data
        for (const cls of CHARACTER_CLASSES) {
            this.classLevels[cls.id] = 1;
            this.classXp[cls.id] = 0;
            this.passiveLevels[cls.id] = {};
            for (const passive of cls.passives) {
                this.passiveLevels[cls.id][passive.id] = 0;
            }
        }
    }

    /**
     * Select a character class
     */
    selectClass(classId) {
        const cls = CHARACTER_CLASSES.find(c => c.id === classId);
        if (!cls) return false;

        this.selectedClass = classId;
        this.applyClassBonuses();

        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${cls.icon} ${t('classes.selected')}!`,
                cls.color,
                32
            ));
        }

        this.game.sound?.play('levelup');
        this.game.save();
        return true;
    }

    /**
     * Get current class data
     */
    getCurrentClass() {
        if (!this.selectedClass) return null;
        return CHARACTER_CLASSES.find(c => c.id === this.selectedClass);
    }

    /**
     * Apply class bonuses to game
     */
    applyClassBonuses() {
        const cls = this.getCurrentClass();
        if (!cls) return;

        // Apply starting bonuses
        const bonuses = cls.startingBonus;
        for (const [stat, value] of Object.entries(bonuses)) {
            if (this.game.classMults) {
                this.game.classMults[stat] = (this.game.classMults[stat] || 0) + value;
            }
        }

        // Apply passive bonuses
        const passives = this.passiveLevels[cls.id];
        for (const passive of cls.passives) {
            const level = passives[passive.id] || 0;
            if (level > 0) {
                this.applyPassiveEffect(passive, level);
            }
        }
    }

    /**
     * Apply a passive effect
     */
    applyPassiveEffect(passive, level) {
        if (!this.game.classMults) return;

        for (const [key, value] of Object.entries(passive.effect)) {
            const effectValue = value * level;
            this.game.classMults[key] = (this.game.classMults[key] || 0) + effectValue;
        }
    }

    /**
     * Add class XP
     */
    addXp(amount) {
        if (!this.selectedClass) return;

        this.classXp[this.selectedClass] += amount;
        const xpNeeded = this.getXpForLevel(this.classLevels[this.selectedClass] + 1);

        if (this.classXp[this.selectedClass] >= xpNeeded) {
            this.levelUp();
        }
    }

    /**
     * Get XP needed for a level
     */
    getXpForLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    /**
     * Level up the current class
     */
    levelUp() {
        if (!this.selectedClass) return;

        const xpNeeded = this.getXpForLevel(this.classLevels[this.selectedClass] + 1);
        this.classXp[this.selectedClass] -= xpNeeded;
        this.classLevels[this.selectedClass]++;

        const cls = this.getCurrentClass();
        if (this.game.floatingTexts && cls) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${cls.icon} ${t('classes.levelUp')} ${this.classLevels[this.selectedClass]}!`,
                cls.color,
                28
            ));
        }

        this.game.sound?.play('levelup');
        this.game.save();
    }

    /**
     * Upgrade a passive ability
     */
    upgradePassive(passiveId) {
        if (!this.selectedClass) return false;

        const cls = this.getCurrentClass();
        const passive = cls?.passives.find(p => p.id === passiveId);
        if (!passive) return false;

        const currentLevel = this.passiveLevels[this.selectedClass][passiveId] || 0;
        if (currentLevel >= passive.maxLevel) return false;

        // Cost: crystals based on level
        const cost = Math.floor(10 * Math.pow(1.5, currentLevel));
        if (this.game.crystals < cost) return false;

        this.game.crystals -= cost;
        this.passiveLevels[this.selectedClass][passiveId] = currentLevel + 1;

        // Reapply bonuses
        this.resetClassMults();
        this.applyClassBonuses();

        this.game.updateCrystalsUI?.();
        this.game.sound?.play('upgrade');
        this.game.save();
        return true;
    }

    /**
     * Reset class multipliers
     */
    resetClassMults() {
        this.game.classMults = {
            health: 0,
            armor: 0,
            regen: 0,
            damage: 0,
            critChance: 0,
            critDamage: 0,
            fireRate: 0,
            range: 0,
            skillPower: 0,
            cooldown: 0,
            gold: 0,
            crystals: 0,
            ether: 0,
            production: 0,
            leech: 0,
            dodge: 0
        };
    }

    /**
     * Get all available classes
     */
    getAllClasses() {
        return CHARACTER_CLASSES.map(cls => ({
            ...cls,
            level: this.classLevels[cls.id],
            xp: this.classXp[cls.id],
            xpNeeded: this.getXpForLevel(this.classLevels[cls.id] + 1),
            selected: cls.id === this.selectedClass,
            passives: cls.passives.map(p => ({
                ...p,
                level: this.passiveLevels[cls.id][p.id] || 0,
                cost: Math.floor(10 * Math.pow(1.5, this.passiveLevels[cls.id][p.id] || 0))
            }))
        }));
    }

    /**
     * Get class stat bonuses
     */
    getStatBonuses() {
        return this.game.classMults || {};
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            selectedClass: this.selectedClass,
            classLevels: { ...this.classLevels },
            classXp: { ...this.classXp },
            passiveLevels: JSON.parse(JSON.stringify(this.passiveLevels))
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;

        this.selectedClass = data.selectedClass || null;
        this.classLevels = data.classLevels || this.classLevels;
        this.classXp = data.classXp || this.classXp;
        this.passiveLevels = data.passiveLevels || this.passiveLevels;

        // Ensure all classes/passives are initialized
        for (const cls of CHARACTER_CLASSES) {
            if (!this.classLevels[cls.id]) this.classLevels[cls.id] = 1;
            if (!this.classXp[cls.id]) this.classXp[cls.id] = 0;
            if (!this.passiveLevels[cls.id]) this.passiveLevels[cls.id] = {};
            for (const passive of cls.passives) {
                if (this.passiveLevels[cls.id][passive.id] === undefined) {
                    this.passiveLevels[cls.id][passive.id] = 0;
                }
            }
        }

        this.resetClassMults();
        this.applyClassBonuses();
    }
}
