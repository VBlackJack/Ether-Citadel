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
 * Unit tests for SaveService
 * Run with: node tests/saveservice.test.js
 */

// Mock localStorage
const localStorage = {
    store: {},
    getItem(key) {
        return this.store[key] || null;
    },
    setItem(key, value) {
        this.store[key] = String(value);
    },
    removeItem(key) {
        delete this.store[key];
    },
    clear() {
        this.store = {};
    }
};

// Simple test framework
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('\n=== Running SaveService Tests ===\n');

        for (const { name, fn } of this.tests) {
            localStorage.clear();
            try {
                await fn();
                console.log(`✓ ${name}`);
                this.passed++;
            } catch (e) {
                console.log(`✗ ${name}`);
                console.log(`  Error: ${e.message}`);
                this.failed++;
            }
        }

        console.log(`\n=== Results: ${this.passed} passed, ${this.failed} failed ===\n`);
        return this.failed === 0;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertDeepEquals(actual, expected, message) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
        throw new Error(message || `Expected ${expectedStr}, got ${actualStr}`);
    }
}

// Mock SaveService implementation for testing
const SAVE_VERSION = 2;

function computeChecksum(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

function verifyChecksum(str, checksum) {
    return computeChecksum(str) === checksum;
}

class SaveServiceMock {
    constructor() {
        this.storageKey = 'defenderIdleSave_v2';
        this.backupSlots = 3;
        this.subsystems = new Map();
    }

    init(key) {
        if (key) this.storageKey = key;
        return this;
    }

    registerSubsystem(name, handler) {
        if (typeof handler.getSaveData !== 'function' ||
            typeof handler.loadSaveData !== 'function') {
            return;
        }
        this.subsystems.set(name, handler);
    }

    createSaveData(coreData) {
        const data = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            ...coreData
        };
        for (const [name, handler] of this.subsystems) {
            try {
                data[name] = handler.getSaveData();
            } catch (e) {
                data[name] = null;
            }
        }
        return data;
    }

    save(data) {
        try {
            const saveData = this.createSaveData(data);
            const jsonData = JSON.stringify(saveData);
            const checksum = computeChecksum(jsonData);
            const envelope = { checksum, data: saveData };
            localStorage.setItem(this.storageKey, JSON.stringify(envelope));
            return true;
        } catch (e) {
            return false;
        }
    }

    load() {
        const saved = localStorage.getItem(this.storageKey);
        if (!saved) {
            return { success: true, data: null, error: null };
        }
        try {
            const parsed = JSON.parse(saved);
            let data;
            let checksumValid = true;

            if (parsed.checksum !== undefined && parsed.data !== undefined) {
                const jsonData = JSON.stringify(parsed.data);
                checksumValid = verifyChecksum(jsonData, parsed.checksum);
                data = parsed.data;
            } else {
                data = parsed;
            }
            return {
                success: true,
                data: data,
                error: checksumValid ? null : 'checksum_mismatch'
            };
        } catch (e) {
            return { success: false, data: null, error: e.message };
        }
    }

    createBackup(slot = 1) {
        if (slot < 1 || slot > this.backupSlots) return false;
        const current = localStorage.getItem(this.storageKey);
        if (!current) return false;
        const backupKey = `${this.storageKey}_backup_${slot}`;
        localStorage.setItem(backupKey, current);
        return true;
    }

    restoreBackup(slot) {
        const backupKey = `${this.storageKey}_backup_${slot}`;
        const backup = localStorage.getItem(backupKey);
        if (!backup) return { success: false, data: null };
        localStorage.setItem(this.storageKey, backup);
        return this.load();
    }

    exportSave() {
        const saved = localStorage.getItem(this.storageKey);
        if (!saved) return '';
        return Buffer.from(encodeURIComponent(saved)).toString('base64');
    }

    importSave(str) {
        if (!str || typeof str !== 'string') {
            return { success: false, error: 'empty_input' };
        }
        str = str.trim();
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(str)) {
            return { success: false, error: 'invalid_format' };
        }
        try {
            const decoded = decodeURIComponent(Buffer.from(str, 'base64').toString());
            const parsed = JSON.parse(decoded);
            if (!parsed || typeof parsed !== 'object') {
                return { success: false, error: 'invalid_json' };
            }
            localStorage.setItem(this.storageKey, JSON.stringify(parsed));
            return { success: true, error: null };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    deleteSave(includeBackups = false) {
        localStorage.removeItem(this.storageKey);
        if (includeBackups) {
            for (let i = 1; i <= this.backupSlots; i++) {
                localStorage.removeItem(`${this.storageKey}_backup_${i}`);
            }
        }
    }

    hasSave() {
        return localStorage.getItem(this.storageKey) !== null;
    }
}

const runner = new TestRunner();
let saveService;

// Reset service before each test
runner.test('SaveService initializes correctly', () => {
    saveService = new SaveServiceMock();
    saveService.init('test_save');
    assert(saveService.storageKey === 'test_save', 'Storage key should be set');
});

// ========================================
// Core Save/Load Tests
// ========================================

runner.test('hasSave returns false when no save exists', () => {
    saveService = new SaveServiceMock().init('test_save');
    assert(saveService.hasSave() === false, 'Should return false');
});

runner.test('save creates a valid save in localStorage', () => {
    saveService = new SaveServiceMock().init('test_save');
    const result = saveService.save({ gold: 1000, wave: 50 });
    assert(result === true, 'Save should succeed');
    assert(saveService.hasSave() === true, 'Should have save after saving');
});

runner.test('load returns null when no save exists', () => {
    saveService = new SaveServiceMock().init('test_save');
    const result = saveService.load();
    assert(result.success === true, 'Load should succeed');
    assert(result.data === null, 'Data should be null');
});

runner.test('load retrieves saved data correctly', () => {
    saveService = new SaveServiceMock().init('test_save');
    saveService.save({ gold: 1000, wave: 50 });
    const result = saveService.load();
    assert(result.success === true, 'Load should succeed');
    assert(result.data.gold === 1000, 'Gold should match');
    assert(result.data.wave === 50, 'Wave should match');
});

runner.test('save includes version and timestamp', () => {
    saveService = new SaveServiceMock().init('test_save');
    saveService.save({ gold: 500 });
    const result = saveService.load();
    assert(result.data.version === SAVE_VERSION, 'Version should be set');
    assert(typeof result.data.timestamp === 'number', 'Timestamp should be a number');
});

// ========================================
// Checksum Tests
// ========================================

runner.test('checksum is validated on load', () => {
    saveService = new SaveServiceMock().init('test_save');
    saveService.save({ gold: 1000 });
    const result = saveService.load();
    assert(result.error === null, 'Checksum should be valid');
});

runner.test('tampering is detected via checksum mismatch', () => {
    saveService = new SaveServiceMock().init('test_save');
    saveService.save({ gold: 1000 });

    // Tamper with the save
    const saved = localStorage.getItem('test_save');
    const parsed = JSON.parse(saved);
    parsed.data.gold = 999999; // Modify data
    localStorage.setItem('test_save', JSON.stringify(parsed));

    const result = saveService.load();
    assert(result.error === 'checksum_mismatch', 'Tampering should be detected');
});

// ========================================
// Backup Tests
// ========================================

runner.test('createBackup stores a backup', () => {
    saveService = new SaveServiceMock().init('test_save');
    saveService.save({ gold: 1000 });
    const result = saveService.createBackup(1);
    assert(result === true, 'Backup should succeed');
    assert(localStorage.getItem('test_save_backup_1') !== null, 'Backup should exist');
});

runner.test('createBackup fails with invalid slot', () => {
    saveService = new SaveServiceMock().init('test_save');
    saveService.save({ gold: 1000 });
    assert(saveService.createBackup(0) === false, 'Slot 0 should fail');
    assert(saveService.createBackup(4) === false, 'Slot 4 should fail');
    assert(saveService.createBackup(-1) === false, 'Slot -1 should fail');
});

runner.test('restoreBackup restores from backup', () => {
    saveService = new SaveServiceMock().init('test_save');
    saveService.save({ gold: 1000, wave: 10 });
    saveService.createBackup(1);

    // Modify main save
    saveService.save({ gold: 5000, wave: 100 });

    // Restore
    const result = saveService.restoreBackup(1);
    assert(result.success === true, 'Restore should succeed');
    assert(result.data.gold === 1000, 'Gold should match backup');
    assert(result.data.wave === 10, 'Wave should match backup');
});

runner.test('restoreBackup fails if no backup exists', () => {
    saveService = new SaveServiceMock().init('test_save');
    const result = saveService.restoreBackup(2);
    assert(result.success === false, 'Restore should fail');
});

// ========================================
// Export/Import Tests
// ========================================

runner.test('exportSave returns base64 encoded string', () => {
    saveService = new SaveServiceMock().init('test_save');
    saveService.save({ gold: 1000 });
    const exported = saveService.exportSave();
    assert(typeof exported === 'string', 'Export should return string');
    assert(exported.length > 0, 'Export should not be empty');
});

runner.test('exportSave returns empty string when no save exists', () => {
    saveService = new SaveServiceMock().init('test_save');
    const exported = saveService.exportSave();
    assert(exported === '', 'Export should be empty');
});

runner.test('importSave restores exported save', () => {
    saveService = new SaveServiceMock().init('test_save');
    saveService.save({ gold: 1000, wave: 50 });
    const exported = saveService.exportSave();

    // Clear and import
    saveService.deleteSave();
    assert(saveService.hasSave() === false, 'Save should be deleted');

    const importResult = saveService.importSave(exported);
    assert(importResult.success === true, 'Import should succeed');
    assert(saveService.hasSave() === true, 'Save should exist after import');
});

runner.test('importSave rejects invalid base64', () => {
    saveService = new SaveServiceMock().init('test_save');
    const result = saveService.importSave('not!valid@base64#');
    assert(result.success === false, 'Import should fail');
    assert(result.error === 'invalid_format', 'Should report invalid format');
});

runner.test('importSave rejects empty input', () => {
    saveService = new SaveServiceMock().init('test_save');
    assert(saveService.importSave('').success === false, 'Empty string should fail');
    assert(saveService.importSave(null).success === false, 'Null should fail');
});

// ========================================
// Delete Tests
// ========================================

runner.test('deleteSave removes save data', () => {
    saveService = new SaveServiceMock().init('test_save');
    saveService.save({ gold: 1000 });
    saveService.deleteSave();
    assert(saveService.hasSave() === false, 'Save should be deleted');
});

runner.test('deleteSave with includeBackups removes backups', () => {
    saveService = new SaveServiceMock().init('test_save');
    saveService.save({ gold: 1000 });
    saveService.createBackup(1);
    saveService.createBackup(2);

    saveService.deleteSave(true);
    assert(localStorage.getItem('test_save_backup_1') === null, 'Backup 1 should be deleted');
    assert(localStorage.getItem('test_save_backup_2') === null, 'Backup 2 should be deleted');
});

runner.test('deleteSave without includeBackups preserves backups', () => {
    saveService = new SaveServiceMock().init('test_save');
    saveService.save({ gold: 1000 });
    saveService.createBackup(1);

    saveService.deleteSave(false);
    assert(saveService.hasSave() === false, 'Main save should be deleted');
    assert(localStorage.getItem('test_save_backup_1') !== null, 'Backup should be preserved');
});

// ========================================
// Subsystem Integration Tests
// ========================================

runner.test('registerSubsystem stores subsystem handler', () => {
    saveService = new SaveServiceMock().init('test_save');
    const mockSubsystem = {
        data: { level: 5 },
        getSaveData() { return this.data; },
        loadSaveData(data) { this.data = data; }
    };
    saveService.registerSubsystem('test', mockSubsystem);
    assert(saveService.subsystems.has('test'), 'Subsystem should be registered');
});

runner.test('save includes subsystem data', () => {
    saveService = new SaveServiceMock().init('test_save');
    const mockSubsystem = {
        data: { level: 5, xp: 100 },
        getSaveData() { return this.data; },
        loadSaveData(data) { this.data = data; }
    };
    saveService.registerSubsystem('player', mockSubsystem);
    saveService.save({ gold: 1000 });

    const result = saveService.load();
    assert(result.data.player.level === 5, 'Subsystem level should be saved');
    assert(result.data.player.xp === 100, 'Subsystem xp should be saved');
});

runner.test('registerSubsystem rejects invalid handlers', () => {
    saveService = new SaveServiceMock().init('test_save');
    saveService.registerSubsystem('invalid', {});
    assert(saveService.subsystems.has('invalid') === false, 'Invalid handler should not be registered');
});

// ========================================
// Edge Cases
// ========================================

runner.test('handles malformed JSON gracefully', () => {
    saveService = new SaveServiceMock().init('test_save');
    localStorage.setItem('test_save', 'not valid json{');
    const result = saveService.load();
    assert(result.success === false, 'Load should fail');
    assert(result.error !== null, 'Error should be set');
});

runner.test('handles large save data', () => {
    saveService = new SaveServiceMock().init('test_save');
    const largeData = {
        gold: Number.MAX_SAFE_INTEGER,
        items: Array(1000).fill({ id: 1, name: 'test' })
    };
    const result = saveService.save(largeData);
    assert(result === true, 'Large save should succeed');

    const loaded = saveService.load();
    assert(loaded.success === true, 'Large load should succeed');
    assert(loaded.data.items.length === 1000, 'Items should be preserved');
});

// Run all tests
runner.run().then(success => {
    process.exit(success ? 0 : 1);
});
