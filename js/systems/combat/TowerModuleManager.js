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
 * TowerModuleManager - Handles modular tower component system
 */

import { TOWER_MODULES, MODULE_SYNERGIES } from '../../data.js';
import { BigNumService } from '../../config.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';

export class TowerModuleManager {
    constructor(game) {
        this.game = game;
        this.unlockedModules = {
            barrels: ['standard_barrel'],
            cores: ['basic_core'],
            bases: ['fixed_base'],
            ammo: ['standard_ammo']
        };
        this.turretConfigs = {}; // turretId -> { barrel, core, base, ammo }
        this.activeSynergies = {};
    }

    /**
     * Get available modules by category
     */
    getAvailableModules(category) {
        const wave = this.game.wave || 0;
        const modules = TOWER_MODULES[category] || [];

        return modules.filter(m =>
            (!m.unlockWave || m.unlockWave <= wave) &&
            this.unlockedModules[category]?.includes(m.id)
        );
    }

    /**
     * Get all modules by category (including locked)
     */
    getAllModules(category) {
        const wave = this.game.wave || 0;
        const modules = TOWER_MODULES[category] || [];

        return modules.map(m => ({
            ...m,
            name: t(m.nameKey),
            unlocked: this.unlockedModules[category]?.includes(m.id),
            available: !m.unlockWave || m.unlockWave <= wave
        }));
    }

    /**
     * Unlock a module
     */
    unlockModule(category, moduleId) {
        if (!TOWER_MODULES[category]) return false;

        const module = TOWER_MODULES[category].find(m => m.id === moduleId);
        if (!module) return false;

        if (this.unlockedModules[category]?.includes(moduleId)) return false;

        // Check cost
        if (module.cost > 0 && BigNumService.lt(this.game.gold, module.cost)) {
            return false;
        }

        if (module.cost > 0) {
            this.game.gold = BigNumService.sub(this.game.gold, module.cost);
        }

        if (!this.unlockedModules[category]) {
            this.unlockedModules[category] = [];
        }
        this.unlockedModules[category].push(moduleId);

        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${module.icon} ${t('modules.unlocked')}!`,
                '#22c55e',
                24
            ));
        }

        this.game.sound?.play('achievement');
        this.game.save();
        return true;
    }

    /**
     * Set module for turret
     */
    setTurretModule(turretId, category, moduleId) {
        if (!TOWER_MODULES[category]) return false;

        const module = TOWER_MODULES[category].find(m => m.id === moduleId);
        if (!module) return false;

        if (!this.unlockedModules[category]?.includes(moduleId)) {
            return false;
        }

        if (!this.turretConfigs[turretId]) {
            this.turretConfigs[turretId] = {
                barrel: 'standard_barrel',
                core: 'basic_core',
                base: 'fixed_base',
                ammo: 'standard_ammo'
            };
        }

        // Map category to config key
        const configKey = category.slice(0, -1); // Remove 's' (barrels -> barrel)
        this.turretConfigs[turretId][configKey] = moduleId;

        this.recalculateTurretStats(turretId);
        this.checkSynergies(turretId);

        this.game.sound?.play('equip');
        this.game.save();
        return true;
    }

    /**
     * Get turret configuration
     */
    getTurretConfig(turretId) {
        return this.turretConfigs[turretId] || {
            barrel: 'standard_barrel',
            core: 'basic_core',
            base: 'fixed_base',
            ammo: 'standard_ammo'
        };
    }

    /**
     * Get turret module stats
     */
    getTurretModuleStats(turretId) {
        const config = this.getTurretConfig(turretId);
        const stats = {};

        // Aggregate effects from all modules
        for (const [category, moduleId] of Object.entries(config)) {
            const modules = TOWER_MODULES[category + 's'];
            const module = modules?.find(m => m.id === moduleId);

            if (module?.effect) {
                for (const [stat, value] of Object.entries(module.effect)) {
                    stats[stat] = (stats[stat] || 0) + value;
                }
            }
        }

        // Add synergy bonuses
        const synergies = this.activeSynergies[turretId] || [];
        for (const synergyId of synergies) {
            const synergy = MODULE_SYNERGIES.find(s => s.id === synergyId);
            if (synergy?.bonus) {
                for (const [stat, value] of Object.entries(synergy.bonus)) {
                    stats[stat] = (stats[stat] || 0) + value;
                }
            }
        }

        return stats;
    }

    /**
     * Recalculate turret stats based on modules
     */
    recalculateTurretStats(turretId) {
        const stats = this.getTurretModuleStats(turretId);

        // Store for turret to read
        if (!this.game.turretModuleStats) {
            this.game.turretModuleStats = {};
        }
        this.game.turretModuleStats[turretId] = stats;
    }

    /**
     * Check and activate synergies for turret
     */
    checkSynergies(turretId) {
        const config = this.getTurretConfig(turretId);
        const equippedModules = Object.values(config);

        this.activeSynergies[turretId] = [];

        for (const synergy of MODULE_SYNERGIES) {
            const hasAll = synergy.modules.every(m => equippedModules.includes(m));

            if (hasAll) {
                this.activeSynergies[turretId].push(synergy.id);

                if (this.game.floatingTexts) {
                    this.game.floatingTexts.push(FloatingText.create(
                        this.game.width / 2,
                        this.game.height / 3,
                        `${t(synergy.nameKey)}!`,
                        '#fbbf24',
                        24
                    ));
                }
            }
        }

        // Recalculate stats with synergies
        this.recalculateTurretStats(turretId);
    }

    /**
     * Get active synergies for turret
     */
    getActiveSynergies(turretId) {
        return (this.activeSynergies[turretId] || []).map(id => {
            const synergy = MODULE_SYNERGIES.find(s => s.id === id);
            return synergy ? {
                ...synergy,
                name: t(synergy.nameKey)
            } : null;
        }).filter(Boolean);
    }

    /**
     * Get all possible synergies
     */
    getAllSynergies() {
        return MODULE_SYNERGIES.map(s => ({
            ...s,
            name: t(s.nameKey)
        }));
    }

    /**
     * Apply module effects to projectile
     */
    getProjectileEffects(turretId) {
        const config = this.getTurretConfig(turretId);
        const effects = {};

        // Check ammo effects
        const ammoModules = TOWER_MODULES.ammo;
        const ammo = ammoModules.find(m => m.id === config.ammo);

        if (ammo?.effect) {
            if (ammo.effect.burnDamage) {
                effects.burn = {
                    damage: ammo.effect.burnDamage,
                    duration: ammo.effect.burnDuration || 3000
                };
            }
            if (ammo.effect.slow) {
                effects.slow = {
                    value: ammo.effect.slow,
                    duration: ammo.effect.slowDuration || 2000
                };
            }
            if (ammo.effect.chainCount) {
                effects.chain = {
                    count: ammo.effect.chainCount,
                    damage: ammo.effect.chainDamage || 0.5
                };
            }
            if (ammo.effect.aoeRadius) {
                effects.aoe = {
                    radius: ammo.effect.aoeRadius,
                    damage: ammo.effect.aoeDamage || 0.5
                };
            }
            if (ammo.effect.voidMark) {
                effects.voidMark = {
                    damageBonus: ammo.effect.voidDamageBonus || 0.5
                };
            }
        }

        // Check barrel effects
        const barrelModules = TOWER_MODULES.barrels;
        const barrel = barrelModules.find(m => m.id === config.barrel);

        if (barrel?.effect) {
            if (barrel.effect.projectiles) {
                effects.multishot = barrel.effect.projectiles;
            }
            if (barrel.effect.pierce) {
                effects.pierce = barrel.effect.pierce;
            }
            if (barrel.effect.voidDamage) {
                effects.voidDamage = true;
            }
        }

        return effects;
    }

    /**
     * Get visual info for turret
     */
    getTurretVisual(turretId) {
        const config = this.getTurretConfig(turretId);
        const icons = [];

        for (const [category, moduleId] of Object.entries(config)) {
            const modules = TOWER_MODULES[category + 's'];
            const module = modules?.find(m => m.id === moduleId);
            if (module?.icon) {
                icons.push(module.icon);
            }
        }

        return icons;
    }

    /**
     * Clear turret configuration
     */
    clearTurretConfig(turretId) {
        delete this.turretConfigs[turretId];
        delete this.activeSynergies[turretId];

        if (this.game.turretModuleStats) {
            delete this.game.turretModuleStats[turretId];
        }
    }

    /**
     * Get total module power
     */
    getTotalModulePower() {
        let power = 0;

        for (const turretId of Object.keys(this.turretConfigs)) {
            const stats = this.getTurretModuleStats(turretId);
            for (const value of Object.values(stats)) {
                if (typeof value === 'number') {
                    power += Math.abs(value) * 100;
                }
            }

            // Bonus for synergies
            power += (this.activeSynergies[turretId]?.length || 0) * 50;
        }

        return Math.floor(power);
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            unlockedModules: JSON.parse(JSON.stringify(this.unlockedModules)),
            turretConfigs: JSON.parse(JSON.stringify(this.turretConfigs))
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;

        this.unlockedModules = data.unlockedModules || {
            barrels: ['standard_barrel'],
            cores: ['basic_core'],
            bases: ['fixed_base'],
            ammo: ['standard_ammo']
        };

        this.turretConfigs = data.turretConfigs || {};
        this.activeSynergies = {};

        // Recalculate all turret stats
        for (const turretId of Object.keys(this.turretConfigs)) {
            this.checkSynergies(turretId);
        }
    }
}
