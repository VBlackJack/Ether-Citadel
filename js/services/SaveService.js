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

import { t, formatDate } from '../i18n.js';
import { sanitizeJsonObject } from '../utils/HtmlSanitizer.js';

/**
 * SaveService - Centralized save/load management with versioning and migrations
 */

/**
 * Current save format version
 * Increment this when making breaking changes to save structure
 */
export const SAVE_VERSION = 2;

/**
 * Migration functions indexed by target version
 * Each migration transforms data from version (n-1) to version n
 */
const MIGRATIONS = {
    // Migration from v1 to v2: Add version field and normalize structure
    2: (data) => {
        // v1 saves don't have version field
        const migrated = { ...data };

        // Ensure all subsystem data exists
        migrated.production = data.production || { buildings: {}, lastTick: 0 };
        migrated.auras = data.auras || { active: [], unlocked: [] };
        migrated.chips = data.chips || { inventory: [], equipped: {} };
        migrated.dailyQuests = data.dailyQuests || { quests: [], lastReset: 0 };
        migrated.prestige = data.prestige || { points: 0, upgrades: {}, totalPrestiges: 0 };
        migrated.passives = data.passives || { levels: {}, sp: 0 };

        // Normalize settings structure
        migrated.settings = {
            showDamageText: data.settings?.showDamageText ?? true,
            showRange: data.settings?.showRange ?? true,
            autoUpgradeTurrets: data.settings?.autoUpgradeTurrets ?? false,
            ...data.settings
        };

        return migrated;
    }
};

/**
 * Simple checksum for data integrity
 * @param {string} str - JSON string to checksum
 * @returns {number}
 */
function computeChecksum(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
}

/**
 * Verify checksum matches data
 * @param {string} str - JSON string
 * @param {number} checksum - Expected checksum
 * @returns {boolean}
 */
function verifyChecksum(str, checksum) {
    return computeChecksum(str) === checksum;
}

/**
 * SaveService class - Singleton for save management
 */
class SaveServiceClass {
    constructor() {
        this.storageKey = 'defenderIdleSave_v2';
        this.backupSlots = 3;
        this.autoSaveInterval = 30000; // 30 seconds
        this.autoSaveTimer = null;
        this.subsystems = new Map();
        this.onSaveCallbacks = [];
        this.onLoadCallbacks = [];
        // Mutex for preventing concurrent save operations
        this._isSaving = false;
        this._saveQueued = false;
        this._queuedData = null;
    }

    /**
     * Initialize the service with a storage key
     * @param {string} key - localStorage key
     */
    init(key) {
        if (key) {
            this.storageKey = key;
        }
        return this;
    }

    /**
     * Register a subsystem for save/load
     * @param {string} name - Unique identifier
     * @param {object} handler - { getSaveData: () => data, loadSaveData: (data) => void }
     */
    registerSubsystem(name, handler) {
        if (typeof handler.getSaveData !== 'function') {
            console.warn(`SaveService: Subsystem ${name} missing getSaveData`);
            return;
        }
        if (typeof handler.loadSaveData !== 'function') {
            console.warn(`SaveService: Subsystem ${name} missing loadSaveData`);
            return;
        }
        this.subsystems.set(name, handler);
    }

    /**
     * Unregister a subsystem
     * @param {string} name
     */
    unregisterSubsystem(name) {
        this.subsystems.delete(name);
    }

    /**
     * Register callback for save events
     * @param {function} callback
     */
    onSave(callback) {
        this.onSaveCallbacks.push(callback);
    }

    /**
     * Register callback for load events
     * @param {function} callback
     */
    onLoad(callback) {
        this.onLoadCallbacks.push(callback);
    }

    /**
     * Create a save data object from current game state
     * @param {object} coreData - Core game data (gold, wave, etc.)
     * @returns {object}
     */
    createSaveData(coreData) {
        const data = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            ...coreData
        };

        // Collect data from all registered subsystems
        for (const [name, handler] of this.subsystems) {
            try {
                data[name] = handler.getSaveData();
            } catch (e) {
                console.error(`SaveService: Error getting save data from ${name}:`, e);
                data[name] = null;
            }
        }

        return data;
    }

    /**
     * Save data to localStorage with mutex protection
     * Prevents race conditions from concurrent save operations
     * @param {object} data - Save data object
     * @returns {boolean} Success
     */
    save(data) {
        // If already saving, queue this save for later
        if (this._isSaving) {
            this._saveQueued = true;
            this._queuedData = data;
            return true; // Will be saved when current save completes
        }

        this._isSaving = true;

        try {
            const saveData = this.createSaveData(data);
            const jsonData = JSON.stringify(saveData);
            const checksum = computeChecksum(jsonData);

            const envelope = {
                checksum,
                data: saveData
            };

            localStorage.setItem(this.storageKey, JSON.stringify(envelope));

            // Notify callbacks
            this.onSaveCallbacks.forEach(cb => {
                try { cb(saveData); } catch (e) { console.error('Save callback error:', e); }
            });

            return true;
        } catch (e) {
            console.error('SaveService: Save failed:', e);
            return false;
        } finally {
            this._isSaving = false;

            // Process queued save if any
            if (this._saveQueued) {
                this._saveQueued = false;
                const queuedData = this._queuedData;
                this._queuedData = null;
                // Use setTimeout to avoid stack overflow with rapid saves
                setTimeout(() => this.save(queuedData), 0);
            }
        }
    }

    /**
     * Load data from localStorage
     * @returns {{ success: boolean, data: object|null, error: string|null }}
     */
    load() {
        const saved = localStorage.getItem(this.storageKey);
        if (!saved) {
            return { success: true, data: null, error: null };
        }

        try {
            const parsed = JSON.parse(saved);

            // Handle envelope format (with checksum)
            let data;
            let checksumValid = true;

            if (parsed.checksum !== undefined && parsed.data !== undefined) {
                const jsonData = JSON.stringify(parsed.data);
                checksumValid = verifyChecksum(jsonData, parsed.checksum);
                data = parsed.data;
            } else {
                // Legacy format without checksum
                data = parsed;
            }

            // Sanitize loaded data to prevent prototype pollution
            const sanitizedData = sanitizeJsonObject(data);

            // Run migrations if needed
            const migratedData = this.migrate(sanitizedData);

            // Load data into registered subsystems
            for (const [name, handler] of this.subsystems) {
                if (migratedData[name] !== undefined) {
                    try {
                        handler.loadSaveData(migratedData[name]);
                    } catch (e) {
                        console.error(`SaveService: Error loading data into ${name}:`, e);
                    }
                }
            }

            // Notify callbacks
            this.onLoadCallbacks.forEach(cb => {
                try { cb(migratedData); } catch (e) { console.error('Load callback error:', e); }
            });

            return {
                success: true,
                data: migratedData,
                error: checksumValid ? null : 'checksum_mismatch'
            };
        } catch (e) {
            console.error('SaveService: Load failed:', e);
            return { success: false, data: null, error: e.message };
        }
    }

    /**
     * Run migrations on data to bring it to current version
     * @param {object} data
     * @returns {object} Migrated data
     */
    migrate(data) {
        let currentVersion = data.version || 1;
        let migratedData = { ...data };

        while (currentVersion < SAVE_VERSION) {
            const nextVersion = currentVersion + 1;
            const migration = MIGRATIONS[nextVersion];

            if (migration) {
                console.log(`SaveService: Migrating v${currentVersion} -> v${nextVersion}`);
                try {
                    migratedData = migration(migratedData);
                    migratedData.version = nextVersion;
                } catch (e) {
                    console.error(`SaveService: Migration to v${nextVersion} failed:`, e);
                    break;
                }
            }

            currentVersion = nextVersion;
        }

        return migratedData;
    }

    /**
     * Create a backup in the specified slot
     * @param {number} slot - Slot number (1-3)
     * @returns {boolean}
     */
    createBackup(slot = 1) {
        if (slot < 1 || slot > this.backupSlots) {
            console.error(`SaveService: Invalid backup slot ${slot}`);
            return false;
        }

        const current = localStorage.getItem(this.storageKey);
        if (!current) {
            return false;
        }

        const backupKey = `${this.storageKey}_backup_${slot}`;
        localStorage.setItem(backupKey, current);
        return true;
    }

    /**
     * Restore from a backup slot
     * @param {number} slot
     * @returns {{ success: boolean, data: object|null }}
     */
    restoreBackup(slot) {
        const backupKey = `${this.storageKey}_backup_${slot}`;
        const backup = localStorage.getItem(backupKey);

        if (!backup) {
            return { success: false, data: null };
        }

        localStorage.setItem(this.storageKey, backup);
        return this.load();
    }

    /**
     * Get info about available backups
     * @returns {Array<{ slot: number, wave: number, timestamp: number, date: string }>}
     */
    getBackupsInfo() {
        const backups = [];

        for (let i = 1; i <= this.backupSlots; i++) {
            const backup = localStorage.getItem(`${this.storageKey}_backup_${i}`);
            if (backup) {
                try {
                    const parsed = JSON.parse(backup);
                    const rawData = parsed.data || parsed;
                    // Sanitize to prevent prototype pollution
                    const data = sanitizeJsonObject(rawData);
                    const timestamp = data.timestamp || data.lastSaveTime || 0;
                    backups.push({
                        slot: i,
                        wave: data.wave || 1,
                        gold: data.gold || 0,
                        timestamp: timestamp,
                        date: formatDate(timestamp)
                    });
                } catch {
                    backups.push({ slot: i, wave: 0, gold: 0, timestamp: 0, date: t('common.unknown') });
                }
            }
        }

        return backups;
    }

    /**
     * Export save as base64 string
     * @returns {string}
     */
    exportSave() {
        const saved = localStorage.getItem(this.storageKey);
        if (!saved) {
            return '';
        }
        return btoa(encodeURIComponent(saved));
    }

    /**
     * Import save from base64 string
     * @param {string} str - Base64 encoded save
     * @returns {{ success: boolean, error: string|null }}
     */
    importSave(str) {
        if (!str || typeof str !== 'string') {
            return { success: false, error: 'empty_input' };
        }

        str = str.trim();

        // Validate base64 format
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(str)) {
            return { success: false, error: 'invalid_format' };
        }

        try {
            const decoded = decodeURIComponent(atob(str));

            // Validate JSON and sanitize to prevent prototype pollution
            let parsed;
            try {
                parsed = JSON.parse(decoded);
            } catch (parseError) {
                return { success: false, error: 'invalid_json' };
            }

            if (!parsed || typeof parsed !== 'object') {
                return { success: false, error: 'invalid_json' };
            }

            // Sanitize imported data to prevent prototype pollution
            const sanitized = sanitizeJsonObject(parsed);
            localStorage.setItem(this.storageKey, JSON.stringify(sanitized));
            return { success: true, error: null };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /**
     * Delete all save data
     * @param {boolean} includeBackups - Also delete backups
     */
    deleteSave(includeBackups = false) {
        localStorage.removeItem(this.storageKey);

        if (includeBackups) {
            for (let i = 1; i <= this.backupSlots; i++) {
                localStorage.removeItem(`${this.storageKey}_backup_${i}`);
            }
        }
    }

    /**
     * Check if a save exists
     * @returns {boolean}
     */
    hasSave() {
        return localStorage.getItem(this.storageKey) !== null;
    }

    /**
     * Start auto-save timer
     * @param {function} saveCallback - Function to call for saving
     */
    startAutoSave(saveCallback) {
        this.stopAutoSave();
        this.autoSaveTimer = setInterval(() => {
            if (typeof saveCallback === 'function') {
                saveCallback();
            }
        }, this.autoSaveInterval);
    }

    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * Get save data size in bytes
     * @returns {number}
     */
    getSaveSize() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? new Blob([saved]).size : 0;
    }

    /**
     * Get formatted save size string
     * @returns {string}
     */
    getFormattedSaveSize() {
        const bytes = this.getSaveSize();
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}

// Export singleton instance
export const SaveService = new SaveServiceClass();

// Export utilities
export { computeChecksum, verifyChecksum, MIGRATIONS };
