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
 * ConfigRegistry - Centralized registry for game configuration data
 * Loads JSON config files and provides typed access to game data
 */

import { ConfigLoader } from './ConfigLoader.js';

/**
 * Config file definitions
 */
const CONFIG_FILES = {
    enemies: { path: 'configs/enemies.json', schema: 'enemyType' },
    turrets: { path: 'configs/turrets.json', schema: 'turretTier' },
    dread: { path: 'configs/dread.json', schema: 'dreadLevel' },
    research: { path: 'configs/research.json', schema: 'researchBranch' },
    mining: { path: 'configs/mining.json', schema: 'miningResource' },
    chips: { path: 'configs/chips.json', schema: null },
    passives: { path: 'configs/passives.json', schema: 'passive' },
    production: { path: 'configs/production.json', schema: null },
    prestige: { path: 'configs/prestige.json', schema: null },
    waves: { path: 'configs/waves.json', schema: null },
    upgrades: { path: 'configs/upgrades.json', schema: 'upgrade' },
    constants: { path: 'configs/constants.json', schema: null }
};

/**
 * ConfigRegistry class - Singleton for config access
 */
class ConfigRegistryClass {
    constructor() {
        this.configs = new Map();
        this.loaded = false;
        this.loadPromise = null;
    }

    /**
     * Load all config files
     * @param {string} basePath - Base path to configs directory
     * @returns {Promise<boolean>}
     */
    async loadAll(basePath = '') {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._loadAllConfigs(basePath);
        return this.loadPromise;
    }

    /**
     * Internal method to load all configs
     * @param {string} basePath
     * @returns {Promise<boolean>}
     */
    async _loadAllConfigs(basePath) {
        const results = await Promise.allSettled(
            Object.entries(CONFIG_FILES).map(async ([name, { path }]) => {
                try {
                    const fullPath = basePath ? `${basePath}/${path}` : path;
                    const response = await fetch(fullPath);
                    if (!response.ok) {
                        console.warn(`ConfigRegistry: Failed to load ${name}: ${response.status}`);
                        return { name, success: false };
                    }
                    const data = await response.json();
                    this.configs.set(name, data);
                    return { name, success: true };
                } catch (e) {
                    console.warn(`ConfigRegistry: Error loading ${name}:`, e.message);
                    return { name, success: false };
                }
            })
        );

        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        console.log(`ConfigRegistry: Loaded ${successful}/${Object.keys(CONFIG_FILES).length} configs`);

        this.loaded = true;
        return successful > 0;
    }

    /**
     * Check if configs are loaded
     * @returns {boolean}
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * Get a config by name
     * @param {string} name
     * @returns {object|null}
     */
    get(name) {
        return this.configs.get(name) || null;
    }

    /**
     * Get enemy config by ID
     * @param {string} id
     * @returns {object|null}
     */
    getEnemy(id) {
        const enemies = this.configs.get('enemies');
        return enemies?.enemies?.[id] || null;
    }

    /**
     * Get all enemies
     * @returns {object}
     */
    getEnemies() {
        const enemies = this.configs.get('enemies');
        return enemies?.enemies || {};
    }

    /**
     * Get turret tier config
     * @param {number} tier
     * @returns {object|null}
     */
    getTurretTier(tier) {
        const turrets = this.configs.get('turrets');
        return turrets?.tiers?.[tier] || null;
    }

    /**
     * Get all turret tiers
     * @returns {object}
     */
    getTurretTiers() {
        const turrets = this.configs.get('turrets');
        return turrets?.tiers || {};
    }

    /**
     * Get dread level config
     * @param {number} level
     * @returns {object|null}
     */
    getDreadLevel(level) {
        const dread = this.configs.get('dread');
        return dread?.levels?.find(d => d.level === level) || null;
    }

    /**
     * Get all dread levels
     * @returns {Array}
     */
    getDreadLevels() {
        const dread = this.configs.get('dread');
        return dread?.levels || [];
    }

    /**
     * Get research branch by ID
     * @param {string} id
     * @returns {object|null}
     */
    getResearchBranch(id) {
        const research = this.configs.get('research');
        return research?.branches?.find(b => b.id === id) || null;
    }

    /**
     * Get all research branches
     * @returns {Array}
     */
    getResearchBranches() {
        const research = this.configs.get('research');
        return research?.branches || [];
    }

    /**
     * Get research node by ID
     * @param {string} nodeId
     * @returns {object|null}
     */
    getResearchNode(nodeId) {
        const branches = this.getResearchBranches();
        for (const branch of branches) {
            const node = branch.nodes?.find(n => n.id === nodeId);
            if (node) return node;
        }
        return null;
    }

    /**
     * Get mining resource by ID
     * @param {string} id
     * @returns {object|null}
     */
    getMiningResource(id) {
        const mining = this.configs.get('mining');
        return mining?.resources?.find(r => r.id === id) || null;
    }

    /**
     * Get all mining resources
     * @returns {Array}
     */
    getMiningResources() {
        const mining = this.configs.get('mining');
        return mining?.resources || [];
    }

    /**
     * Get forge recipe by ID
     * @param {string} id
     * @returns {object|null}
     */
    getForgeRecipe(id) {
        const mining = this.configs.get('mining');
        return mining?.forgeRecipes?.find(r => r.id === id) || null;
    }

    /**
     * Get all forge recipes
     * @returns {Array}
     */
    getForgeRecipes() {
        const mining = this.configs.get('mining');
        return mining?.forgeRecipes || [];
    }

    /**
     * Get chip by ID
     * @param {string} id
     * @returns {object|null}
     */
    getChip(id) {
        const chips = this.configs.get('chips');
        return chips?.chips?.find(c => c.id === id) || null;
    }

    /**
     * Get all chips
     * @returns {Array}
     */
    getChips() {
        const chips = this.configs.get('chips');
        return chips?.chips || [];
    }

    /**
     * Get aura by ID
     * @param {string} id
     * @returns {object|null}
     */
    getAura(id) {
        const chips = this.configs.get('chips');
        return chips?.auras?.find(a => a.id === id) || null;
    }

    /**
     * Get all auras
     * @returns {Array}
     */
    getAuras() {
        const chips = this.configs.get('chips');
        return chips?.auras || [];
    }

    /**
     * Get passive by ID
     * @param {string} id
     * @returns {object|null}
     */
    getPassive(id) {
        const passives = this.configs.get('passives');
        return passives?.passives?.find(p => p.id === id) || null;
    }

    /**
     * Get all passives
     * @returns {Array}
     */
    getPassives() {
        const passives = this.configs.get('passives');
        return passives?.passives || [];
    }

    /**
     * Get passives by category
     * @param {string} category
     * @returns {Array}
     */
    getPassivesByCategory(category) {
        return this.getPassives().filter(p => p.category === category);
    }

    /**
     * Get production building by ID
     * @param {string} id
     * @returns {object|null}
     */
    getProductionBuilding(id) {
        const production = this.configs.get('production');
        return production?.buildings?.find(b => b.id === id) || null;
    }

    /**
     * Get all production buildings
     * @returns {Array}
     */
    getProductionBuildings() {
        const production = this.configs.get('production');
        return production?.buildings || [];
    }

    /**
     * Get prestige upgrade by ID
     * @param {string} id
     * @returns {object|null}
     */
    getPrestigeUpgrade(id) {
        const prestige = this.configs.get('prestige');
        return prestige?.upgrades?.find(u => u.id === id) || null;
    }

    /**
     * Get all prestige upgrades
     * @returns {Array}
     */
    getPrestigeUpgrades() {
        const prestige = this.configs.get('prestige');
        return prestige?.upgrades || [];
    }

    /**
     * Get wave composition for a wave number
     * @param {number} wave
     * @returns {object}
     */
    getWaveComposition(wave) {
        const waves = this.configs.get('waves');
        if (!waves?.compositions) return { NORMAL: 100 };

        const thresholds = Object.keys(waves.compositions)
            .map(Number)
            .sort((a, b) => b - a);

        for (const threshold of thresholds) {
            if (wave >= threshold) {
                return waves.compositions[threshold];
            }
        }

        return waves.compositions[thresholds[thresholds.length - 1]] || { NORMAL: 100 };
    }

    /**
     * Get wave generator config
     * @returns {object}
     */
    getWaveGenerator() {
        const waves = this.configs.get('waves');
        return waves?.generator || {};
    }

    /**
     * Get run upgrade by ID
     * @param {string} id
     * @returns {object|null}
     */
    getRunUpgrade(id) {
        const upgrades = this.configs.get('upgrades');
        if (!upgrades?.runUpgrades) return null;

        for (const category of Object.values(upgrades.runUpgrades)) {
            const upgrade = category.find(u => u.id === id);
            if (upgrade) return upgrade;
        }
        return null;
    }

    /**
     * Get all run upgrades by category
     * @param {string} category - 'attack', 'defense', or 'tech'
     * @returns {Array}
     */
    getRunUpgradesByCategory(category) {
        const upgrades = this.configs.get('upgrades');
        return upgrades?.runUpgrades?.[category] || [];
    }

    /**
     * Get meta upgrade by ID
     * @param {string} id
     * @returns {object|null}
     */
    getMetaUpgrade(id) {
        const upgrades = this.configs.get('upgrades');
        return upgrades?.metaUpgrades?.find(u => u.id === id) || null;
    }

    /**
     * Get all meta upgrades
     * @returns {Array}
     */
    getMetaUpgrades() {
        const upgrades = this.configs.get('upgrades');
        return upgrades?.metaUpgrades || [];
    }

    /**
     * Get game constants
     * @returns {object}
     */
    getConstants() {
        return this.configs.get('constants') || {};
    }

    /**
     * Get a specific constant
     * @param {string} path - Dot-notation path (e.g., 'game.baseEnemyHp')
     * @returns {any}
     */
    getConstant(path) {
        const constants = this.getConstants();
        return path.split('.').reduce((obj, key) => obj?.[key], constants);
    }
}

// Export singleton instance
export const ConfigRegistry = new ConfigRegistryClass();
