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
 * CloudSaveService - Mock implementation for cloud save functionality
 * Uses localStorage with artificial delays to simulate network latency
 */

const CLOUD_STORAGE_KEY = 'EC_CLOUD_MOCK';
const MIN_LATENCY = 500;
const MAX_LATENCY = 1000;

/**
 * Simulate network latency with random delay
 */
function simulateLatency() {
    const delay = MIN_LATENCY + Math.random() * (MAX_LATENCY - MIN_LATENCY);
    return new Promise(resolve => setTimeout(resolve, delay));
}

class CloudSaveServiceClass {
    constructor() {
        this.isLoggedIn = false;
        this.username = '';
        this.lastSyncTime = 0;
    }

    /**
     * Login to cloud service (mock: succeeds if username > 3 chars)
     * @param {string} username
     * @param {string} password
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async login(username, password) {
        await simulateLatency();

        if (!username || username.length <= 3) {
            return {
                success: false,
                error: 'username_too_short'
            };
        }

        this.isLoggedIn = true;
        this.username = username;

        // Load last sync time from stored cloud data
        const cloudData = this._getCloudData();
        if (cloudData) {
            this.lastSyncTime = cloudData.timestamp || 0;
        }

        return { success: true };
    }

    /**
     * Logout from cloud service
     * @returns {Promise<void>}
     */
    async logout() {
        await simulateLatency();

        this.isLoggedIn = false;
        this.username = '';
        this.lastSyncTime = 0;
    }

    /**
     * Save data to cloud (mock: saves to localStorage)
     * @param {string} saveDataString - JSON string of save data
     * @returns {Promise<{success: boolean, timestamp: number}>}
     */
    async save(saveDataString) {
        await simulateLatency();

        if (!this.isLoggedIn) {
            return { success: false, error: 'not_logged_in' };
        }

        const timestamp = Date.now();
        const cloudData = {
            data: saveDataString,
            timestamp: timestamp,
            username: this.username
        };

        localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(cloudData));
        this.lastSyncTime = timestamp;

        return { success: true, timestamp };
    }

    /**
     * Load data from cloud (mock: loads from localStorage)
     * @returns {Promise<{success: boolean, data?: string, timestamp?: number}>}
     */
    async load() {
        await simulateLatency();

        if (!this.isLoggedIn) {
            return { success: false, error: 'not_logged_in' };
        }

        const cloudData = this._getCloudData();

        if (!cloudData) {
            return { success: false, error: 'no_cloud_save' };
        }

        this.lastSyncTime = cloudData.timestamp;

        return {
            success: true,
            data: cloudData.data,
            timestamp: cloudData.timestamp
        };
    }

    /**
     * Check for conflicts between local and cloud saves
     * Uses 60s buffer to avoid minor timing differences
     * @param {number} localTimestamp - Local save timestamp
     * @returns {Promise<'cloud_newer' | 'local_newer' | 'synced' | 'no_cloud'>}
     */
    async checkConflict(localTimestamp) {
        await simulateLatency();

        const cloudData = this._getCloudData();

        if (!cloudData || !cloudData.timestamp) {
            return 'no_cloud';
        }

        const cloudTimestamp = cloudData.timestamp;
        const BUFFER = 60000; // 60 seconds buffer

        if (cloudTimestamp > localTimestamp + BUFFER) {
            return 'cloud_newer';
        } else if (localTimestamp > cloudTimestamp + BUFFER) {
            return 'local_newer';
        } else {
            return 'synced';
        }
    }

    /**
     * Get formatted last sync time
     * @returns {string}
     */
    getLastSyncFormatted() {
        if (!this.lastSyncTime) {
            return '--';
        }
        return new Date(this.lastSyncTime).toLocaleString();
    }

    /**
     * Internal: Get cloud data from localStorage
     * @returns {Object|null}
     */
    _getCloudData() {
        try {
            const stored = localStorage.getItem(CLOUD_STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('Failed to parse cloud data:', e);
            return null;
        }
    }

    /**
     * Internal: Clear cloud data (for testing)
     */
    _clearCloudData() {
        localStorage.removeItem(CLOUD_STORAGE_KEY);
        this.lastSyncTime = 0;
    }
}

export const CloudSaveService = new CloudSaveServiceClass();
