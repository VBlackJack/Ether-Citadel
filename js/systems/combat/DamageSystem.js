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
 * DamageSystem - Centralized damage calculation with full breakdown
 * Provides transparent damage calculations and multiplier tracking
 */

/**
 * Damage calculation result with full breakdown
 * @typedef {Object} DamageResult
 * @property {number} finalDamage - Final damage after all modifiers
 * @property {number} baseDamage - Base damage before modifiers
 * @property {boolean} isCrit - Whether this was a critical hit
 * @property {boolean} isSuperCrit - Whether this was a super crit
 * @property {Array<{source: string, mult: number}>} multipliers - All applied multipliers
 * @property {Array<{source: string, value: number}>} flatBonuses - All flat bonuses
 */

export class DamageSystem {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
    }

    /**
     * Calculate damage with full breakdown
     * @param {object} options
     * @param {number} options.baseDamage - Base damage value
     * @param {object} options.source - Source entity (turret, skill, etc.)
     * @param {object} options.target - Target enemy
     * @param {boolean} options.canCrit - Whether this damage can crit
     * @returns {DamageResult}
     */
    calculate(options) {
        const { baseDamage, source, target, canCrit = true } = options;

        const multipliers = [];
        const flatBonuses = [];
        let damage = baseDamage;

        // 1. Tier multiplier
        const tierMult = this.getTierMultiplier();
        if (tierMult !== 1) {
            multipliers.push({ source: 'tier', mult: tierMult, label: 'Evolution Tier' });
            damage *= tierMult;
        }

        // 2. Meta upgrade multiplier
        const metaDamageMult = this.game.metaUpgrades?.getEffectValue('damageMult') || 1;
        if (metaDamageMult !== 1) {
            multipliers.push({ source: 'meta', mult: metaDamageMult, label: 'Meta Upgrades' });
            damage *= metaDamageMult;
        }

        // 3. Relic multiplier
        const relicDamageMult = 1 + (this.game.relicMults?.damage || 0);
        if (relicDamageMult !== 1) {
            multipliers.push({ source: 'relics', mult: relicDamageMult, label: 'Relics' });
            damage *= relicDamageMult;
        }

        // 4. Research multiplier
        const researchDamageMult = 1 + (this.game.researchEffects?.damageMult || 0);
        if (researchDamageMult !== 1) {
            multipliers.push({ source: 'research', mult: researchDamageMult, label: 'Research' });
            damage *= researchDamageMult;
        }

        // 5. Passive multiplier
        const passiveDamageMult = this.game.passives?.getEffect('damageMult') || 1;
        if (passiveDamageMult !== 1) {
            multipliers.push({ source: 'passives', mult: passiveDamageMult, label: 'Passives' });
            damage *= passiveDamageMult;
        }

        // 6. Prestige multiplier
        const prestigeDamageMult = this.game.prestige?.getEffect('damageMult') || 1;
        if (prestigeDamageMult !== 1) {
            multipliers.push({ source: 'prestige', mult: prestigeDamageMult, label: 'Prestige' });
            damage *= prestigeDamageMult;
        }

        // 7. Aura multiplier (from nearby auras)
        const auraDamageMult = this.getAuraMultiplier(source, 'damage');
        if (auraDamageMult !== 1) {
            multipliers.push({ source: 'auras', mult: auraDamageMult, label: 'Auras' });
            damage *= auraDamageMult;
        }

        // 8. Chip multiplier (equipped chips)
        const chipDamageMult = this.getChipMultiplier(source, 'damage');
        if (chipDamageMult !== 1) {
            multipliers.push({ source: 'chips', mult: chipDamageMult, label: 'Chips' });
            damage *= chipDamageMult;
        }

        // 9. Dread multiplier (if applicable for damage buffs)
        const dreadMult = this.getDreadDamageMultiplier();
        if (dreadMult !== 1) {
            multipliers.push({ source: 'dread', mult: dreadMult, label: 'Dread Mode' });
            damage *= dreadMult;
        }

        // 10. Active rune multiplier (rage rune)
        const runeMult = this.getActiveRuneMultiplier();
        if (runeMult !== 1) {
            multipliers.push({ source: 'runes', mult: runeMult, label: 'Active Runes' });
            damage *= runeMult;
        }

        // 11. Challenge modifiers
        const challengeMult = this.getChallengeMultiplier();
        if (challengeMult !== 1) {
            multipliers.push({ source: 'challenge', mult: challengeMult, label: 'Challenge' });
            damage *= challengeMult;
        }

        // Critical hit calculation
        let isCrit = false;
        let isSuperCrit = false;

        if (canCrit) {
            const critResult = this.calculateCrit(damage, multipliers);
            damage = critResult.damage;
            isCrit = critResult.isCrit;
            isSuperCrit = critResult.isSuperCrit;
        }

        // Apply armor reduction from target
        if (target?.armor) {
            const armorReduction = 1 - target.armor;
            multipliers.push({ source: 'targetArmor', mult: armorReduction, label: 'Target Armor' });
            damage *= armorReduction;
        }

        // Apply our armor penetration
        const armorPen = this.game.currentArmor || 0;
        if (armorPen > 0 && target?.armor) {
            const penBonus = 1 + (armorPen * target.armor);
            multipliers.push({ source: 'armorPen', mult: penBonus, label: 'Armor Penetration' });
            damage *= penBonus;
        }

        return {
            finalDamage: Math.floor(damage),
            baseDamage,
            isCrit,
            isSuperCrit,
            multipliers,
            flatBonuses
        };
    }

    /**
     * Calculate critical hit
     * @param {number} damage
     * @param {Array} multipliers - Array to push crit multiplier to
     * @returns {{ damage: number, isCrit: boolean, isSuperCrit: boolean }}
     */
    calculateCrit(damage, multipliers) {
        const critChance = this.getTotalCritChance();
        const critMult = this.getTotalCritMultiplier();
        const superCritChance = this.getSuperCritChance();

        const roll = Math.random() * 100;

        if (roll < superCritChance) {
            const superMult = critMult * 2;
            multipliers.push({ source: 'superCrit', mult: superMult, label: 'SUPER CRIT!' });
            return { damage: damage * superMult, isCrit: true, isSuperCrit: true };
        }

        if (roll < critChance) {
            multipliers.push({ source: 'crit', mult: critMult, label: 'Critical Hit' });
            return { damage: damage * critMult, isCrit: true, isSuperCrit: false };
        }

        return { damage, isCrit: false, isSuperCrit: false };
    }

    /**
     * Get total crit chance from all sources
     * @returns {number} Crit chance percentage (0-100)
     */
    getTotalCritChance() {
        let chance = this.game.currentCrit?.chance || 5;

        // Research bonus
        chance += this.game.researchEffects?.critChance || 0;

        // Passive bonus
        chance += this.game.passives?.getEffect('critChance') || 0;

        // Relic bonus
        chance += this.game.relicMults?.critChance || 0;

        // Mastery bonus
        const masteryBonus = (this.game.stats?.mastery?.crit_dmg || 0) * 0.5;
        chance += masteryBonus;

        return Math.min(chance, 100);
    }

    /**
     * Get total crit multiplier from all sources
     * @returns {number}
     */
    getTotalCritMultiplier() {
        let mult = this.game.currentCrit?.mult || 1.5;

        // Research bonus
        mult += this.game.researchEffects?.critDamage || 0;

        // Passive bonus
        mult += this.game.passives?.getEffect('critDamage') || 0;

        // Relic bonus
        mult += this.game.relicMults?.critDamage || 0;

        // Mastery bonus
        const masteryBonus = (this.game.stats?.mastery?.crit_dmg || 0) * 0.02;
        mult += masteryBonus;

        return mult;
    }

    /**
     * Get super crit chance
     * @returns {number}
     */
    getSuperCritChance() {
        // Super crit is 10% of crit chance
        return this.getTotalCritChance() * 0.1;
    }

    /**
     * Get evolution tier multiplier
     * @returns {number}
     */
    getTierMultiplier() {
        const tier = this.game.castle?.tier || 1;
        const evolutionMult = 1.5; // CONFIG.evolutionMultiplier
        return Math.pow(evolutionMult, tier - 1);
    }

    /**
     * Get aura damage multiplier for a source
     * @param {object} source
     * @param {string} stat
     * @returns {number}
     */
    getAuraMultiplier(source, stat) {
        if (!this.game.auras || !source) return 1;
        return 1 + (this.game.auras.getAuraBonus?.(source, stat) || 0);
    }

    /**
     * Get chip multiplier for a source
     * @param {object} source
     * @param {string} stat
     * @returns {number}
     */
    getChipMultiplier(source, stat) {
        if (!this.game.chips || !source) return 1;
        return 1 + (this.game.chips.getChipBonus?.(source, stat) || 0);
    }

    /**
     * Get dread damage multiplier (player buffs from dread)
     * @returns {number}
     */
    getDreadDamageMultiplier() {
        // Dread doesn't buff player damage, only enemy stats
        // But some dark matter techs might
        const berserkLevel = this.game.challenges?.dmTech?.berserk || 0;
        return 1 + (berserkLevel * 0.2);
    }

    /**
     * Get active rune damage multiplier
     * @returns {number}
     */
    getActiveRuneMultiplier() {
        if (!this.game.activeRune) return 1;
        if (this.game.activeRune.id === 'rage') {
            return 2.0; // Rage rune doubles damage
        }
        return 1;
    }

    /**
     * Get challenge modifier
     * @returns {number}
     */
    getChallengeMultiplier() {
        if (!this.game.activeChallenge) return 1;

        // Glass challenge: deal 2x damage but have 50% HP
        if (this.game.activeChallenge.id === 'glass') {
            return 2.0;
        }

        return 1;
    }

    /**
     * Get full DPS breakdown for UI display
     * @returns {object}
     */
    getDPSBreakdown() {
        const baseDamage = this.game.currentDamage || 10;
        const fireRate = this.game.currentFireRate || 1000;
        const turretCount = this.game.turrets?.length || 1;

        // Calculate all multipliers
        const result = this.calculate({
            baseDamage,
            source: null,
            target: null,
            canCrit: false
        });

        const dps = (result.finalDamage * turretCount * 1000) / fireRate;
        const critDps = dps * (1 + (this.getTotalCritChance() / 100) * (this.getTotalCritMultiplier() - 1));

        return {
            baseDamage,
            finalDamage: result.finalDamage,
            fireRate,
            turretCount,
            dps: Math.floor(dps),
            critDps: Math.floor(critDps),
            critChance: this.getTotalCritChance(),
            critMult: this.getTotalCritMultiplier(),
            multipliers: result.multipliers,
            totalMultiplier: result.multipliers.reduce((acc, m) => acc * m.mult, 1)
        };
    }
}
