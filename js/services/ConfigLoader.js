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
 * ConfigLoader - JSON Schema-based configuration validation and loading
 * Provides runtime validation for game data configurations
 */

/**
 * JSON Schema definitions for config validation
 * Each schema follows JSON Schema Draft-07 specification
 */
export const SCHEMAS = {
    turretTier: {
        type: 'object',
        required: ['nameKey', 'damageMult', 'rangeMult', 'fireRateMult', 'cost', 'color', 'unlockWave'],
        properties: {
            nameKey: { type: 'string', pattern: '^[a-zA-Z0-9_.]+$' },
            damageMult: { type: 'number', minimum: 0 },
            rangeMult: { type: 'number', minimum: 0 },
            fireRateMult: { type: 'number', minimum: 0 },
            cost: { type: 'number', minimum: 0 },
            color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
            unlockWave: { type: 'integer', minimum: 1 }
        },
        additionalProperties: false
    },

    dreadLevel: {
        type: 'object',
        required: ['level', 'nameKey', 'enemyMult', 'rewardMult', 'color'],
        properties: {
            level: { type: 'integer', minimum: 0 },
            nameKey: { type: 'string', pattern: '^[a-zA-Z0-9_.]+$' },
            enemyMult: { type: 'number', minimum: 0 },
            rewardMult: { type: 'number', minimum: 0 },
            color: { type: 'string', pattern: '^#[0-9a-fA-F]{3,6}$' }
        },
        additionalProperties: false
    },

    miningResource: {
        type: 'object',
        required: ['id', 'nameKey', 'icon', 'baseRate', 'color', 'tier'],
        properties: {
            id: { type: 'string', pattern: '^[a-z_]+$' },
            nameKey: { type: 'string', pattern: '^[a-zA-Z0-9_.]+$' },
            icon: { type: 'string', minLength: 1 },
            baseRate: { type: 'number', minimum: 0, maximum: 1 },
            color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
            tier: { type: 'integer', minimum: 1, maximum: 10 }
        },
        additionalProperties: false
    },

    forgeRecipe: {
        type: 'object',
        required: ['id', 'nameKey', 'descKey', 'cost', 'successRate', 'type'],
        properties: {
            id: { type: 'string', pattern: '^[a-z_]+$' },
            nameKey: { type: 'string', pattern: '^[a-zA-Z0-9_.]+$' },
            descKey: { type: 'string', pattern: '^[a-zA-Z0-9_.]+$' },
            cost: { type: 'object', additionalProperties: { type: 'integer', minimum: 0 } },
            successRate: { type: 'number', minimum: 0, maximum: 1 },
            type: { type: 'string', enum: ['upgrade', 'reroll', 'fuse', 'legendary', 'special'] }
        },
        additionalProperties: false
    },

    researchNode: {
        type: 'object',
        required: ['id', 'nameKey', 'descKey', 'cost', 'effect', 'requires'],
        properties: {
            id: { type: 'string', pattern: '^[a-z_0-9]+$' },
            nameKey: { type: 'string', pattern: '^[a-zA-Z0-9_.]+$' },
            descKey: { type: 'string', pattern: '^[a-zA-Z0-9_.]+$' },
            cost: { type: 'integer', minimum: 0 },
            effect: { type: 'object' },
            requires: { type: 'array', items: { type: 'string' } }
        },
        additionalProperties: false
    },

    researchBranch: {
        type: 'object',
        required: ['id', 'nameKey', 'icon', 'color', 'nodes'],
        properties: {
            id: { type: 'string', pattern: '^[a-z]+$' },
            nameKey: { type: 'string', pattern: '^[a-zA-Z0-9_.]+$' },
            icon: { type: 'string', minLength: 1 },
            color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
            nodes: { type: 'array', items: { $ref: '#/definitions/researchNode' } }
        },
        additionalProperties: false
    },

    enemyType: {
        type: 'object',
        required: ['id', 'nameKey', 'baseHp', 'speed', 'gold', 'xp', 'color', 'emoji', 'tier'],
        properties: {
            id: { type: 'string', pattern: '^[a-z_]+$' },
            nameKey: { type: 'string', pattern: '^[a-zA-Z0-9_.]+$' },
            baseHp: { type: 'number', minimum: 1 },
            speed: { type: 'number', minimum: 0.1 },
            gold: { type: 'number', minimum: 0 },
            xp: { type: 'integer', minimum: 0 },
            color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
            emoji: { type: 'string', minLength: 1 },
            tier: { type: 'integer', minimum: 1 },
            abilities: { type: 'array', items: { type: 'string' } }
        },
        additionalProperties: true
    },

    upgrade: {
        type: 'object',
        required: ['id', 'nameKey', 'descKey', 'baseCost', 'costMult', 'maxLevel', 'icon', 'category'],
        properties: {
            id: { type: 'string', pattern: '^[a-z_]+$' },
            nameKey: { type: 'string', pattern: '^[a-zA-Z0-9_.]+$' },
            descKey: { type: 'string', pattern: '^[a-zA-Z0-9_.]+$' },
            baseCost: { type: 'number', minimum: 0 },
            costMult: { type: 'number', minimum: 1 },
            maxLevel: { type: 'integer', minimum: 1 },
            icon: { type: 'string', minLength: 1 },
            category: { type: 'string', enum: ['attack', 'defense', 'tech', 'meta'] }
        },
        additionalProperties: true
    },

    passive: {
        type: 'object',
        required: ['id', 'nameKey', 'descKey', 'icon', 'category', 'maxLevel', 'costPerLevel', 'effect'],
        properties: {
            id: { type: 'string', pattern: '^[a-z_]+$' },
            nameKey: { type: 'string', pattern: '^[a-zA-Z0-9_.]+$' },
            descKey: { type: 'string', pattern: '^[a-zA-Z0-9_.]+$' },
            icon: { type: 'string', minLength: 1 },
            category: { type: 'string', enum: ['offense', 'defense', 'utility', 'resources'] },
            maxLevel: { type: 'integer', minimum: 1, maximum: 100 },
            costPerLevel: { type: 'integer', minimum: 1 },
            effect: {
                type: 'object',
                required: ['type', 'valuePerLevel'],
                properties: {
                    type: { type: 'string' },
                    valuePerLevel: { type: 'number' }
                }
            }
        },
        additionalProperties: false
    }
};

/**
 * Validation error class
 */
export class ConfigValidationError extends Error {
    constructor(schemaName, errors) {
        super(`Config validation failed for ${schemaName}: ${JSON.stringify(errors)}`);
        this.name = 'ConfigValidationError';
        this.schemaName = schemaName;
        this.errors = errors;
    }
}

/**
 * Simple JSON Schema validator (subset implementation)
 * For full validation, consider using Ajv library
 */
class SchemaValidator {
    /**
     * Validate a value against a schema
     * @param {any} value - Value to validate
     * @param {object} schema - JSON Schema
     * @param {string} path - Current path for error messages
     * @returns {{ valid: boolean, errors: string[] }}
     */
    validate(value, schema, path = '') {
        const errors = [];

        // Type validation
        if (schema.type) {
            const actualType = Array.isArray(value) ? 'array' : typeof value;
            const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];

            if (schema.type === 'integer') {
                if (!Number.isInteger(value)) {
                    errors.push(`${path}: expected integer, got ${actualType}`);
                }
            } else if (!expectedTypes.includes(actualType)) {
                errors.push(`${path}: expected ${schema.type}, got ${actualType}`);
            }
        }

        // Required properties
        if (schema.required && typeof value === 'object' && value !== null) {
            for (const prop of schema.required) {
                if (!(prop in value)) {
                    errors.push(`${path}: missing required property "${prop}"`);
                }
            }
        }

        // Properties validation
        if (schema.properties && typeof value === 'object' && value !== null) {
            for (const [prop, propSchema] of Object.entries(schema.properties)) {
                if (prop in value) {
                    const result = this.validate(value[prop], propSchema, `${path}.${prop}`);
                    errors.push(...result.errors);
                }
            }
        }

        // Additional properties
        if (schema.additionalProperties === false && typeof value === 'object' && value !== null && schema.properties) {
            const allowedProps = new Set(Object.keys(schema.properties));
            for (const prop of Object.keys(value)) {
                if (!allowedProps.has(prop)) {
                    errors.push(`${path}: unexpected property "${prop}"`);
                }
            }
        }

        // Minimum/maximum for numbers
        if (typeof value === 'number') {
            if (schema.minimum !== undefined && value < schema.minimum) {
                errors.push(`${path}: ${value} is less than minimum ${schema.minimum}`);
            }
            if (schema.maximum !== undefined && value > schema.maximum) {
                errors.push(`${path}: ${value} is greater than maximum ${schema.maximum}`);
            }
        }

        // String pattern
        if (typeof value === 'string' && schema.pattern) {
            const regex = new RegExp(schema.pattern);
            if (!regex.test(value)) {
                errors.push(`${path}: "${value}" does not match pattern ${schema.pattern}`);
            }
        }

        // String length
        if (typeof value === 'string') {
            if (schema.minLength !== undefined && value.length < schema.minLength) {
                errors.push(`${path}: string length ${value.length} is less than minLength ${schema.minLength}`);
            }
            if (schema.maxLength !== undefined && value.length > schema.maxLength) {
                errors.push(`${path}: string length ${value.length} is greater than maxLength ${schema.maxLength}`);
            }
        }

        // Enum validation
        if (schema.enum && !schema.enum.includes(value)) {
            errors.push(`${path}: "${value}" is not in enum [${schema.enum.join(', ')}]`);
        }

        // Array items validation
        if (Array.isArray(value) && schema.items) {
            value.forEach((item, index) => {
                const result = this.validate(item, schema.items, `${path}[${index}]`);
                errors.push(...result.errors);
            });
        }

        return { valid: errors.length === 0, errors };
    }
}

/**
 * ConfigLoader class - Singleton for config management
 */
class ConfigLoaderClass {
    constructor() {
        this.validator = new SchemaValidator();
        this.configs = new Map();
        this.validationEnabled = true;
        this.onErrorCallbacks = [];
    }

    /**
     * Enable or disable validation
     * @param {boolean} enabled
     */
    setValidationEnabled(enabled) {
        this.validationEnabled = enabled;
    }

    /**
     * Register error callback
     * @param {function} callback
     */
    onError(callback) {
        this.onErrorCallbacks.push(callback);
    }

    /**
     * Validate a single config item
     * @param {string} schemaName - Name of schema in SCHEMAS
     * @param {any} data - Data to validate
     * @param {boolean} throwOnError - Throw error on validation failure
     * @returns {{ valid: boolean, errors: string[] }}
     */
    validate(schemaName, data, throwOnError = false) {
        const schema = SCHEMAS[schemaName];
        if (!schema) {
            const error = { valid: false, errors: [`Unknown schema: ${schemaName}`] };
            if (throwOnError) throw new ConfigValidationError(schemaName, error.errors);
            return error;
        }

        const result = this.validator.validate(data, schema, schemaName);

        if (!result.valid && throwOnError) {
            throw new ConfigValidationError(schemaName, result.errors);
        }

        return result;
    }

    /**
     * Validate an array of config items
     * @param {string} schemaName
     * @param {any[]} dataArray
     * @returns {{ valid: boolean, errors: string[], itemErrors: Map<number, string[]> }}
     */
    validateArray(schemaName, dataArray) {
        const itemErrors = new Map();
        const allErrors = [];

        dataArray.forEach((item, index) => {
            const result = this.validate(schemaName, item);
            if (!result.valid) {
                itemErrors.set(index, result.errors);
                allErrors.push(...result.errors.map(e => `[${index}] ${e}`));
            }
        });

        return {
            valid: allErrors.length === 0,
            errors: allErrors,
            itemErrors
        };
    }

    /**
     * Validate an object/map of config items
     * @param {string} schemaName
     * @param {object} dataMap
     * @returns {{ valid: boolean, errors: string[], itemErrors: Map<string, string[]> }}
     */
    validateMap(schemaName, dataMap) {
        const itemErrors = new Map();
        const allErrors = [];

        for (const [key, item] of Object.entries(dataMap)) {
            const result = this.validate(schemaName, item);
            if (!result.valid) {
                itemErrors.set(key, result.errors);
                allErrors.push(...result.errors.map(e => `[${key}] ${e}`));
            }
        }

        return {
            valid: allErrors.length === 0,
            errors: allErrors,
            itemErrors
        };
    }

    /**
     * Load and validate a config from URL
     * @param {string} url - URL to fetch config from
     * @param {string} schemaName - Schema to validate against
     * @returns {Promise<{ success: boolean, data: any, errors: string[] }>}
     */
    async loadFromUrl(url, schemaName) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                return { success: false, data: null, errors: [`HTTP ${response.status}: ${response.statusText}`] };
            }

            const data = await response.json();

            if (this.validationEnabled) {
                const validation = Array.isArray(data)
                    ? this.validateArray(schemaName, data)
                    : this.validate(schemaName, data);

                if (!validation.valid) {
                    this.notifyError(schemaName, validation.errors);
                    return { success: false, data, errors: validation.errors };
                }
            }

            this.configs.set(schemaName, data);
            return { success: true, data, errors: [] };
        } catch (e) {
            const errors = [e.message];
            this.notifyError(schemaName, errors);
            return { success: false, data: null, errors };
        }
    }

    /**
     * Register a config directly (with validation)
     * @param {string} name - Config name
     * @param {any} data - Config data
     * @param {string} schemaName - Optional schema to validate against
     * @returns {{ success: boolean, errors: string[] }}
     */
    register(name, data, schemaName = null) {
        if (schemaName && this.validationEnabled) {
            const validation = Array.isArray(data)
                ? this.validateArray(schemaName, data)
                : this.validate(schemaName, data);

            if (!validation.valid) {
                this.notifyError(schemaName || name, validation.errors);
                return { success: false, errors: validation.errors };
            }
        }

        this.configs.set(name, data);
        return { success: true, errors: [] };
    }

    /**
     * Get a registered config
     * @param {string} name
     * @returns {any}
     */
    get(name) {
        return this.configs.get(name);
    }

    /**
     * Check if a config is registered
     * @param {string} name
     * @returns {boolean}
     */
    has(name) {
        return this.configs.has(name);
    }

    /**
     * Get all registered config names
     * @returns {string[]}
     */
    getRegisteredConfigs() {
        return Array.from(this.configs.keys());
    }

    /**
     * Notify error callbacks
     * @param {string} schemaName
     * @param {string[]} errors
     */
    notifyError(schemaName, errors) {
        this.onErrorCallbacks.forEach(cb => {
            try {
                cb(schemaName, errors);
            } catch (e) {
                console.error('ConfigLoader error callback failed:', e);
            }
        });
    }

    /**
     * Validate all game configs (for development/testing)
     * @param {object} configs - Object with config name -> data
     * @returns {{ valid: boolean, results: Map<string, { valid: boolean, errors: string[] }> }}
     */
    validateAllConfigs(configs) {
        const results = new Map();
        let allValid = true;

        const configSchemaMap = {
            TURRET_TIERS: { schema: 'turretTier', isMap: true },
            DREAD_LEVELS: { schema: 'dreadLevel', isArray: true },
            MINING_RESOURCES: { schema: 'miningResource', isArray: true },
            FORGE_RECIPES: { schema: 'forgeRecipe', isArray: true },
            RESEARCH_TREE: { schema: 'researchBranch', isArray: true },
            PASSIVES: { schema: 'passive', isArray: true }
        };

        for (const [configName, { schema, isMap, isArray }] of Object.entries(configSchemaMap)) {
            if (configs[configName]) {
                let result;
                if (isMap) {
                    result = this.validateMap(schema, configs[configName]);
                } else if (isArray) {
                    result = this.validateArray(schema, configs[configName]);
                } else {
                    result = this.validate(schema, configs[configName]);
                }

                results.set(configName, result);
                if (!result.valid) allValid = false;
            }
        }

        return { valid: allValid, results };
    }
}

// Export singleton instance
export const ConfigLoader = new ConfigLoaderClass();
