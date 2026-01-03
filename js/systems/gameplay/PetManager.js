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
 * PetManager - Handles pet/companion system
 */

import { PETS } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';

export class PetManager {
    constructor(game) {
        this.game = game;
        this.unlockedPets = [];
        this.activePet = null;
        this.petLevels = {};
        this.petXp = {};
        this.abilityCooldowns = {};

        // Initialize pet data
        for (const pet of PETS) {
            this.petLevels[pet.id] = 1;
            this.petXp[pet.id] = 0;
            this.abilityCooldowns[pet.id] = 0;
        }
    }

    /**
     * Unlock a pet
     */
    unlockPet(petId) {
        if (this.unlockedPets.includes(petId)) return false;

        const pet = PETS.find(p => p.id === petId);
        if (!pet) return false;

        this.unlockedPets.push(petId);

        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${pet.icon} ${t('pets.unlocked')}!`,
                pet.color,
                32
            ));
        }

        this.game.sound?.play('achievement');
        this.game.save();
        return true;
    }

    /**
     * Set active pet
     */
    setActivePet(petId) {
        if (!this.unlockedPets.includes(petId)) return false;

        const pet = PETS.find(p => p.id === petId);
        if (!pet) return false;

        this.activePet = petId;
        this.applyPetBonuses();

        this.game.sound?.play('select');
        this.game.save();
        return true;
    }

    /**
     * Get active pet data
     */
    getActivePet() {
        if (!this.activePet) return null;
        return PETS.find(p => p.id === this.activePet);
    }

    /**
     * Apply pet passive bonuses
     */
    applyPetBonuses() {
        if (!this.game.petMults) {
            this.game.petMults = {};
        }

        // Reset
        for (const key of Object.keys(this.game.petMults)) {
            this.game.petMults[key] = 0;
        }

        const pet = this.getActivePet();
        if (!pet) return;

        const level = this.petLevels[pet.id] || 1;
        const levelMult = 1 + (level - 1) * 0.1;

        for (const [stat, value] of Object.entries(pet.passiveBonus)) {
            this.game.petMults[stat] = value * levelMult;
        }
    }

    /**
     * Add XP to active pet
     */
    addXp(amount) {
        if (!this.activePet) return;

        this.petXp[this.activePet] += amount;
        const xpNeeded = this.getXpForLevel(this.petLevels[this.activePet] + 1);

        if (this.petXp[this.activePet] >= xpNeeded) {
            this.levelUpPet();
        }
    }

    /**
     * Get XP needed for pet level
     */
    getXpForLevel(level) {
        return Math.floor(50 * Math.pow(1.4, level - 1));
    }

    /**
     * Level up active pet
     */
    levelUpPet() {
        if (!this.activePet) return;

        const xpNeeded = this.getXpForLevel(this.petLevels[this.activePet] + 1);
        this.petXp[this.activePet] -= xpNeeded;
        this.petLevels[this.activePet]++;

        const pet = this.getActivePet();
        if (this.game.floatingTexts && pet) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${pet.icon} ${t('pets.levelUp')} ${this.petLevels[this.activePet]}!`,
                pet.color,
                28
            ));
        }

        this.applyPetBonuses();
        this.game.sound?.play('levelup');
        this.game.save();
    }

    /**
     * Update pet (for ability cooldowns and triggers)
     */
    update(dt) {
        if (!this.activePet) return;

        // Update cooldown
        if (this.abilityCooldowns[this.activePet] > 0) {
            this.abilityCooldowns[this.activePet] -= dt;
        }

        // Auto-trigger ability when ready and enemies present
        if (this.abilityCooldowns[this.activePet] <= 0 && this.game.enemies?.length > 0) {
            this.triggerAbility();
        }
    }

    /**
     * Trigger pet ability
     */
    triggerAbility() {
        const pet = this.getActivePet();
        if (!pet || !pet.activeAbility) return;

        const ability = pet.activeAbility;
        const level = this.petLevels[pet.id] || 1;
        const levelMult = 1 + (level - 1) * 0.15;

        switch (ability.type) {
            case 'fireball':
            case 'shadow_strike':
            case 'void_bite':
            case 'dragon_breath':
                // Damage ability
                const damage = (ability.damage || 0) * levelMult;
                const targets = ability.targets || 1;
                let count = 0;
                for (const enemy of this.game.enemies) {
                    if (count >= targets) break;
                    enemy.takeDamage(damage, false, false, true);
                    count++;
                }
                break;

            case 'freeze':
                // Freeze enemies
                for (const enemy of this.game.enemies) {
                    enemy.frozen = true;
                    enemy.frozenTime = ability.duration * levelMult;
                }
                break;

            case 'gold_burst':
                // Gold multiplier buff
                this.game.tempGoldMult = (this.game.tempGoldMult || 1) * ability.goldMult;
                setTimeout(() => {
                    this.game.tempGoldMult = 1;
                }, ability.duration);
                break;

            case 'lightning_strike':
                // Chain lightning
                const chainDamage = (ability.damage || 0) * levelMult;
                const chainCount = ability.chain || 3;
                let chained = 0;
                for (const enemy of this.game.enemies) {
                    if (chained >= chainCount) break;
                    enemy.takeDamage(chainDamage, false, false, true);
                    chained++;
                }
                break;

            case 'rebirth':
                // Store revive for later
                this.game.petReviveAvailable = ability.reviveHealth;
                break;

            case 'divine_shield':
                // Temporary invulnerability
                this.game.invulnerable = true;
                setTimeout(() => {
                    this.game.invulnerable = false;
                }, ability.invulnerable);
                break;
        }

        // Set cooldown
        this.abilityCooldowns[this.activePet] = ability.cooldown;

        // Visual feedback
        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 3,
                `${pet.icon}`,
                pet.color,
                24
            ));
        }
    }

    /**
     * Drop pet from boss
     */
    dropFromBoss(tier = 1) {
        const availablePets = PETS.filter(p =>
            p.tier <= tier + 1 && !this.unlockedPets.includes(p.id)
        );

        if (availablePets.length === 0) return null;

        // Random selection weighted by tier
        const weights = availablePets.map(p => p.tier === tier ? 3 : 1);
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < availablePets.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                this.unlockPet(availablePets[i].id);
                return availablePets[i];
            }
        }
        return null;
    }

    /**
     * Get all pets with status
     */
    getAllPets() {
        return PETS.map(pet => ({
            ...pet,
            unlocked: this.unlockedPets.includes(pet.id),
            active: pet.id === this.activePet,
            level: this.petLevels[pet.id] || 1,
            xp: this.petXp[pet.id] || 0,
            xpNeeded: this.getXpForLevel((this.petLevels[pet.id] || 1) + 1),
            cooldown: this.abilityCooldowns[pet.id] || 0
        }));
    }

    /**
     * Get stat bonuses from pet
     */
    getStatBonuses() {
        return this.game.petMults || {};
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            unlockedPets: [...this.unlockedPets],
            activePet: this.activePet,
            petLevels: { ...this.petLevels },
            petXp: { ...this.petXp }
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;

        this.unlockedPets = data.unlockedPets || [];
        this.activePet = data.activePet || null;
        this.petLevels = data.petLevels || this.petLevels;
        this.petXp = data.petXp || this.petXp;

        // Ensure all pets have data
        for (const pet of PETS) {
            if (this.petLevels[pet.id] === undefined) this.petLevels[pet.id] = 1;
            if (this.petXp[pet.id] === undefined) this.petXp[pet.id] = 0;
        }

        this.applyPetBonuses();
    }
}
