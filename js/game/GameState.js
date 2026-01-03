/*
 * Copyright 2025 Julien Bombled
 * Game State Management Module
 *
 * BigNum Architecture:
 * - Core currencies (gold, ether, crystals) are stored as Decimal (BigNum)
 * - Mining resources are stored as BigNum for infinite scaling
 * - Save format: BigNum values are serialized as strings via .toString()
 * - Load format: Strings are deserialized via BigNumService.create()
 * - Legacy support: Old number formats are handled by safeBigNum()
 */

import { CONFIG, BigNumService } from '../config.js';
import { NOTATIONS } from '../services/BigNumService.js';
import { getErrorHandler, logError, ErrorSeverity } from '../utils/ErrorHandler.js';
import { sanitizeJsonObject } from '../utils/HtmlSanitizer.js';

/**
 * Validate base64 string format
 */
function isValidBase64(str) {
    if (typeof str !== 'string' || str.length === 0) return false;
    try {
        return btoa(atob(str)) === str;
    } catch {
        return false;
    }
}

/**
 * Initial game state values
 */
export const INITIAL_STATE = {
    gold: 0,
    wave: 1,
    ether: 0,
    crystals: 0,
    dreadLevel: 0,
    speedIndex: 0,
    speedMultiplier: 1,
    isPaused: false,
    isGameOver: false,
    autoRetryEnabled: false,
    autoBuyEnabled: false,
    gameTime: 0,
    lastSaveTime: 0,
    settings: {
        showDamageText: true,
        showRange: true,
        notation: NOTATIONS.STANDARD
    }
};

/**
 * Game State Manager
 * Handles saving, loading, and managing game state
 */
/**
 * Subsystem keys for save/load operations
 * Used to iterate over all game subsystems that implement getSaveData/loadSaveData
 */
const SUBSYSTEM_KEYS = [
    'stats', 'upgrades', 'metaUpgrades', 'challenges', 'skills', 'mining',
    'research', 'production', 'auras', 'chips', 'dailyQuests', 'prestige',
    'town', 'school', 'office', 'awakening', 'turretSlots', 'weather',
    'combo', 'events', 'talents', 'statistics', 'ascensionMgr', 'synergies',
    'gameModes', 'seasonalEvents', 'campaign', 'buildPresets',
    'mazing', 'worlds', 'skillCards', 'landmarks', 'towerModules'
];

export class GameStateManager {
    constructor(game) {
        this.game = game;
        this.saveKey = CONFIG.saveKey;
        this.version = CONFIG.SAVE_VERSION || 1;
    }

    /**
     * Create a full save object
     */
    createSaveData() {
        const g = this.game;
        const data = {
            version: this.version,
            timestamp: Date.now(),
            gold: g.gold.toString(),
            wave: g.wave,
            ether: g.ether.toString(),
            crystals: g.crystals.toString(),
            dreadLevel: g.dreadLevel,
            speedIndex: g.speedIndex,
            settings: { ...g.settings },
            relics: [...g.relics],
            miningResources: this.serializeMiningResources(g.miningResources),
            castle: {
                hp: g.castle?.hp || 100,
                maxHp: g.castle?.maxHp || 100,
                shield: g.castle?.shield || 0,
                maxShield: g.castle?.maxShield || 0,
                tier: g.castle?.tier || 1
            }
        };

        // Save all subsystems
        for (const key of SUBSYSTEM_KEYS) {
            data[key] = g[key]?.getSaveData?.() || {};
        }

        return data;
    }

    /**
     * Save game to localStorage
     */
    save() {
        try {
            const data = this.createSaveData();
            const json = JSON.stringify(data);
            const encoded = btoa(json);
            localStorage.setItem(this.saveKey, encoded);
            this.game.lastSaveTime = Date.now();
            return true;
        } catch (e) {
            return getErrorHandler().handleSaveError(e);
        }
    }

    /**
     * Load game from localStorage
     */
    load() {
        try {
            const encoded = localStorage.getItem(this.saveKey);
            if (!encoded) return false;

            if (!isValidBase64(encoded)) {
                logError('Invalid save data format, clearing corrupted save', 'GameState.load', ErrorSeverity.WARNING);
                localStorage.removeItem(this.saveKey);
                return false;
            }

            const json = atob(encoded);
            const parsed = JSON.parse(json);
            // Sanitize to prevent prototype pollution
            const data = sanitizeJsonObject(parsed);

            if (!data || typeof data !== 'object') {
                logError('Invalid save data structure', 'GameState.load', ErrorSeverity.WARNING);
                return false;
            }

            this.applyLoadedData(data);
            return true;
        } catch (e) {
            return getErrorHandler().handleLoadError(e);
        }
    }

    /**
     * Apply loaded data to game
     */
    /**
     * Safely get numeric value with fallback
     */
    safeNumber(value, fallback) {
        return Number.isFinite(value) ? value : fallback;
    }

    /**
     * Safely create BigNum from value with fallback
     * Handles legacy number formats and new string formats
     * @param {string|number|Decimal} value - Value from save data
     * @param {number} fallback - Fallback value if invalid
     * @returns {Decimal}
     */
    safeBigNum(value, fallback = 0) {
        // Handle null/undefined
        if (value === null || value === undefined) {
            return BigNumService.create(fallback);
        }
        // Handle string "0" or empty string
        if (value === '' || value === '0') {
            return BigNumService.create(fallback);
        }
        // Handle number 0 explicitly (legacy format)
        if (value === 0) {
            return BigNumService.create(fallback);
        }
        // Create BigNum from value (handles strings, numbers, Decimals)
        try {
            return BigNumService.create(value);
        } catch {
            return BigNumService.create(fallback);
        }
    }

    /**
     * Serialize miningResources BigNum values to strings
     */
    serializeMiningResources(resources) {
        if (!resources || typeof resources !== 'object') return {};
        const serialized = {};
        for (const [key, value] of Object.entries(resources)) {
            serialized[key] = value?.toString?.() || value;
        }
        return serialized;
    }

    /**
     * Deserialize miningResources strings to BigNum values
     */
    deserializeMiningResources(data) {
        if (!data || typeof data !== 'object') return {};
        const resources = {};
        for (const [key, value] of Object.entries(data)) {
            resources[key] = BigNumService.create(value || 0);
        }
        return resources;
    }

    applyLoadedData(data) {
        const g = this.game;

        // Core currencies - use safeBigNum for legacy number format support
        g.gold = this.safeBigNum(data.gold, INITIAL_STATE.gold);
        g.ether = this.safeBigNum(data.ether, INITIAL_STATE.ether);
        g.crystals = this.safeBigNum(data.crystals, INITIAL_STATE.crystals);

        // Numeric values
        g.wave = this.safeNumber(data.wave, INITIAL_STATE.wave);
        g.dreadLevel = this.safeNumber(data.dreadLevel, INITIAL_STATE.dreadLevel);
        g.speedIndex = this.safeNumber(data.speedIndex, INITIAL_STATE.speedIndex);
        g.lastSaveTime = this.safeNumber(data.timestamp, Date.now());

        // Objects and arrays
        g.settings = { ...INITIAL_STATE.settings, ...(typeof data.settings === 'object' ? data.settings : {}) };
        g.relics = Array.isArray(data.relics) ? data.relics : [];

        // Apply notation setting
        if (g.settings.notation) {
            BigNumService.setNotation(g.settings.notation);
        }

        // Mining resources - BigNum values
        g.miningResources = this.deserializeMiningResources(data.miningResources);

        // Load all subsystems
        for (const key of SUBSYSTEM_KEYS) {
            if (data[key] && g[key]?.loadSaveData) {
                g[key].loadSaveData(data[key]);
            }
        }

        if (data.castle && typeof data.castle === 'object' && g.castle) {
            g.castle.hp = Number.isFinite(data.castle.hp) ? data.castle.hp : 100;
            g.castle.maxHp = Number.isFinite(data.castle.maxHp) ? data.castle.maxHp : 100;
            g.castle.shield = Number.isFinite(data.castle.shield) ? data.castle.shield : 0;
            g.castle.maxShield = Number.isFinite(data.castle.maxShield) ? data.castle.maxShield : 0;
            g.castle.tier = Number.isFinite(data.castle.tier) ? data.castle.tier : 1;
        }
    }

    /**
     * Export save as string
     */
    exportSave() {
        const data = this.createSaveData();
        return btoa(JSON.stringify(data));
    }

    /**
     * Import save from string
     */
    importSave(saveString) {
        try {
            if (!isValidBase64(saveString)) {
                logError('Import failed: Invalid base64 format', 'GameState.import', ErrorSeverity.WARNING);
                return false;
            }

            const json = atob(saveString);
            const parsed = JSON.parse(json);
            // Sanitize to prevent prototype pollution
            const data = sanitizeJsonObject(parsed);

            if (!data || typeof data !== 'object') {
                logError('Import failed: Invalid data structure', 'GameState.import', ErrorSeverity.WARNING);
                return false;
            }

            this.applyLoadedData(data);
            this.save();
            return true;
        } catch (e) {
            return getErrorHandler().handleLoadError(e);
        }
    }

    /**
     * Reset all game data
     */
    reset() {
        localStorage.removeItem(this.saveKey);
        location.reload();
    }

    /**
     * Calculate offline earnings
     */
    calculateOfflineEarnings() {
        const savedTime = this.game.lastSaveTime;
        if (!savedTime) return null;

        const now = Date.now();
        const elapsedMs = now - savedTime;
        const maxOfflineMs = (CONFIG.maxOfflineHours || 24) * 60 * 60 * 1000;

        if (elapsedMs < 60000) return null; // Less than 1 minute

        const cappedMs = Math.min(elapsedMs, maxOfflineMs);
        const offlineMinutes = cappedMs / 60000;

        return {
            elapsed: elapsedMs,
            capped: cappedMs,
            minutes: offlineMinutes,
            multiplier: CONFIG.offlineEarningsMultiplier || 0.75
        };
    }
}
