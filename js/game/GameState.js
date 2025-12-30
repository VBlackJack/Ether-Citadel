/*
 * Copyright 2025 Julien Bombled
 * Game State Management Module
 */

import { CONFIG } from '../config.js';
import { getErrorHandler, logError, ErrorSeverity } from '../utils/ErrorHandler.js';

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
        showRange: true
    }
};

/**
 * Game State Manager
 * Handles saving, loading, and managing game state
 */
export class GameStateManager {
    constructor(game) {
        this.game = game;
        this.saveKey = 'ether_citadel_save';
        this.version = CONFIG.SAVE_VERSION || 1;
    }

    /**
     * Create a full save object
     */
    createSaveData() {
        const g = this.game;
        return {
            version: this.version,
            timestamp: Date.now(),
            gold: g.gold,
            wave: g.wave,
            ether: g.ether,
            crystals: g.crystals,
            dreadLevel: g.dreadLevel,
            speedIndex: g.speedIndex,
            settings: { ...g.settings },
            relics: [...g.relics],
            miningResources: { ...g.miningResources },
            stats: g.stats?.getSaveData?.() || {},
            upgrades: g.upgrades?.getSaveData?.() || {},
            metaUpgrades: g.metaUpgrades?.getSaveData?.() || {},
            challenges: g.challenges?.getSaveData?.() || {},
            skills: g.skills?.getSaveData?.() || {},
            mining: g.mining?.getSaveData?.() || {},
            research: g.research?.getSaveData?.() || {},
            production: g.production?.getSaveData?.() || {},
            auras: g.auras?.getSaveData?.() || {},
            chips: g.chips?.getSaveData?.() || {},
            dailyQuests: g.dailyQuests?.getSaveData?.() || {},
            prestige: g.prestige?.getSaveData?.() || {},
            town: g.town?.getSaveData?.() || {},
            school: g.school?.getSaveData?.() || {},
            office: g.office?.getSaveData?.() || {},
            awakening: g.awakening?.getSaveData?.() || {},
            turretSlots: g.turretSlots?.getSaveData?.() || {},
            weather: g.weather?.getSaveData?.() || {},
            combo: g.combo?.getSaveData?.() || {},
            events: g.events?.getSaveData?.() || {},
            talents: g.talents?.getSaveData?.() || {},
            statistics: g.statistics?.getSaveData?.() || {},
            ascensionMgr: g.ascensionMgr?.getSaveData?.() || {},
            synergies: g.synergies?.getSaveData?.() || {},
            gameModes: g.gameModes?.getSaveData?.() || {},
            seasonalEvents: g.seasonalEvents?.getSaveData?.() || {},
            campaign: g.campaign?.getSaveData?.() || {},
            buildPresets: g.buildPresets?.getSaveData?.() || {},
            castle: {
                hp: g.castle?.hp || 100,
                maxHp: g.castle?.maxHp || 100,
                shield: g.castle?.shield || 0,
                maxShield: g.castle?.maxShield || 0,
                tier: g.castle?.tier || 1
            }
        };
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
            const data = JSON.parse(json);

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

    applyLoadedData(data) {
        const g = this.game;

        g.gold = this.safeNumber(data.gold, INITIAL_STATE.gold);
        g.wave = this.safeNumber(data.wave, INITIAL_STATE.wave);
        g.ether = this.safeNumber(data.ether, INITIAL_STATE.ether);
        g.crystals = this.safeNumber(data.crystals, INITIAL_STATE.crystals);
        g.dreadLevel = this.safeNumber(data.dreadLevel, INITIAL_STATE.dreadLevel);
        g.speedIndex = this.safeNumber(data.speedIndex, INITIAL_STATE.speedIndex);
        g.settings = { ...INITIAL_STATE.settings, ...(typeof data.settings === 'object' ? data.settings : {}) };
        g.relics = Array.isArray(data.relics) ? data.relics : [];
        g.miningResources = (data.miningResources && typeof data.miningResources === 'object') ? data.miningResources : {};
        g.lastSaveTime = this.safeNumber(data.timestamp, Date.now());

        if (data.stats && g.stats?.loadSaveData) g.stats.loadSaveData(data.stats);
        if (data.upgrades && g.upgrades?.loadSaveData) g.upgrades.loadSaveData(data.upgrades);
        if (data.metaUpgrades && g.metaUpgrades?.loadSaveData) g.metaUpgrades.loadSaveData(data.metaUpgrades);
        if (data.challenges && g.challenges?.loadSaveData) g.challenges.loadSaveData(data.challenges);
        if (data.skills && g.skills?.loadSaveData) g.skills.loadSaveData(data.skills);
        if (data.mining && g.mining?.loadSaveData) g.mining.loadSaveData(data.mining);
        if (data.research && g.research?.loadSaveData) g.research.loadSaveData(data.research);
        if (data.production && g.production?.loadSaveData) g.production.loadSaveData(data.production);
        if (data.auras && g.auras?.loadSaveData) g.auras.loadSaveData(data.auras);
        if (data.chips && g.chips?.loadSaveData) g.chips.loadSaveData(data.chips);
        if (data.dailyQuests && g.dailyQuests?.loadSaveData) g.dailyQuests.loadSaveData(data.dailyQuests);
        if (data.prestige && g.prestige?.loadSaveData) g.prestige.loadSaveData(data.prestige);
        if (data.town && g.town?.loadSaveData) g.town.loadSaveData(data.town);
        if (data.school && g.school?.loadSaveData) g.school.loadSaveData(data.school);
        if (data.office && g.office?.loadSaveData) g.office.loadSaveData(data.office);
        if (data.awakening && g.awakening?.loadSaveData) g.awakening.loadSaveData(data.awakening);
        if (data.turretSlots && g.turretSlots?.loadSaveData) g.turretSlots.loadSaveData(data.turretSlots);
        if (data.weather && g.weather?.loadSaveData) g.weather.loadSaveData(data.weather);
        if (data.combo && g.combo?.loadSaveData) g.combo.loadSaveData(data.combo);
        if (data.events && g.events?.loadSaveData) g.events.loadSaveData(data.events);
        if (data.talents && g.talents?.loadSaveData) g.talents.loadSaveData(data.talents);
        if (data.statistics && g.statistics?.loadSaveData) g.statistics.loadSaveData(data.statistics);
        if (data.ascensionMgr && g.ascensionMgr?.loadSaveData) g.ascensionMgr.loadSaveData(data.ascensionMgr);
        if (data.synergies && g.synergies?.loadSaveData) g.synergies.loadSaveData(data.synergies);
        if (data.gameModes && g.gameModes?.loadSaveData) g.gameModes.loadSaveData(data.gameModes);
        if (data.seasonalEvents && g.seasonalEvents?.loadSaveData) g.seasonalEvents.loadSaveData(data.seasonalEvents);
        if (data.campaign && g.campaign?.loadSaveData) g.campaign.loadSaveData(data.campaign);
        if (data.buildPresets && g.buildPresets?.loadSaveData) g.buildPresets.loadSaveData(data.buildPresets);

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
            const data = JSON.parse(json);

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
