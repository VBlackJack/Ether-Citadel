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
 * Event Types - Centralized event definitions
 */
export const GameEvents = {
    // Game Lifecycle
    GAME_INIT: 'game:init',
    GAME_START: 'game:start',
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    GAME_OVER: 'game:over',
    GAME_RESTART: 'game:restart',

    // Wave Events
    WAVE_START: 'wave:start',
    WAVE_COMPLETE: 'wave:complete',
    WAVE_RUSH: 'wave:rush',

    // Combat Events
    ENEMY_SPAWN: 'enemy:spawn',
    ENEMY_KILL: 'enemy:kill',
    BOSS_SPAWN: 'boss:spawn',
    BOSS_KILL: 'boss:kill',
    DAMAGE_DEALT: 'damage:dealt',
    DAMAGE_TAKEN: 'damage:taken',

    // Resource Events
    GOLD_CHANGE: 'resource:gold',
    ETHER_CHANGE: 'resource:ether',
    CRYSTALS_CHANGE: 'resource:crystals',
    XP_GAIN: 'resource:xp',
    LEVEL_UP: 'player:levelup',

    // Upgrade Events
    UPGRADE_PURCHASE: 'upgrade:purchase',
    META_UPGRADE_PURCHASE: 'meta:purchase',
    RESEARCH_UNLOCK: 'research:unlock',

    // UI Events
    TAB_SWITCH: 'ui:tab',
    MODAL_OPEN: 'ui:modal:open',
    MODAL_CLOSE: 'ui:modal:close',
    TOAST_SHOW: 'ui:toast',

    // Skill Events
    SKILL_ACTIVATE: 'skill:activate',
    SKILL_READY: 'skill:ready',

    // Progression Events
    PRESTIGE: 'progression:prestige',
    EVOLUTION: 'progression:evolution',
    DREAD_CHANGE: 'progression:dread',

    // Save Events
    SAVE_START: 'save:start',
    SAVE_COMPLETE: 'save:complete',
    LOAD_START: 'load:start',
    LOAD_COMPLETE: 'load:complete',

    // Settings Events
    SETTINGS_CHANGE: 'settings:change',
    LOCALE_CHANGE: 'settings:locale'
};

/**
 * EventBus - A simple pub/sub event system for decoupled communication
 */
class EventBus {
    constructor() {
        this._listeners = new Map();
        this._onceListeners = new Map();
        this._history = [];
        this._historyLimit = 100;
        this._debugMode = false;
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {Object} context - Optional context for callback
     * @returns {Function} Unsubscribe function
     */
    on(event, callback, context = null) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, []);
        }

        const listener = { callback, context };
        this._listeners.get(event).push(listener);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event once
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {Object} context - Optional context for callback
     */
    once(event, callback, context = null) {
        if (!this._onceListeners.has(event)) {
            this._onceListeners.set(event, []);
        }
        this._onceListeners.get(event).push({ callback, context });
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback to remove
     */
    off(event, callback) {
        if (this._listeners.has(event)) {
            const listeners = this._listeners.get(event);
            const index = listeners.findIndex(l => l.callback === callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data = null) {
        // Debug logging
        if (this._debugMode) {
            console.log(`[EventBus] ${event}`, data);
        }

        // Track history
        this._history.push({ event, data, timestamp: Date.now() });
        if (this._history.length > this._historyLimit) {
            this._history.shift();
        }

        // Regular listeners
        if (this._listeners.has(event)) {
            const listeners = this._listeners.get(event);
            for (const { callback, context } of listeners) {
                try {
                    callback.call(context, data);
                } catch (e) {
                    console.error(`[EventBus] Error in listener for ${event}:`, e);
                }
            }
        }

        // Once listeners
        if (this._onceListeners.has(event)) {
            const listeners = this._onceListeners.get(event);
            this._onceListeners.delete(event);
            for (const { callback, context } of listeners) {
                try {
                    callback.call(context, data);
                } catch (e) {
                    console.error(`[EventBus] Error in once listener for ${event}:`, e);
                }
            }
        }

        // Wildcard listeners
        if (this._listeners.has('*')) {
            const wildcardListeners = this._listeners.get('*');
            for (const { callback, context } of wildcardListeners) {
                try {
                    callback.call(context, { event, data });
                } catch (e) {
                    console.error(`[EventBus] Error in wildcard listener:`, e);
                }
            }
        }
    }

    /**
     * Clear all listeners for an event or all events
     * @param {string} event - Optional event name
     */
    clear(event = null) {
        if (event) {
            this._listeners.delete(event);
            this._onceListeners.delete(event);
        } else {
            this._listeners.clear();
            this._onceListeners.clear();
        }
    }

    /**
     * Get listener count for an event
     * @param {string} event - Event name
     * @returns {number}
     */
    listenerCount(event) {
        const regular = this._listeners.get(event)?.length || 0;
        const once = this._onceListeners.get(event)?.length || 0;
        return regular + once;
    }

    /**
     * Get event history
     * @param {number} limit - Number of events to return
     * @returns {Array}
     */
    getHistory(limit = 10) {
        return this._history.slice(-limit);
    }

    /**
     * Enable/disable debug mode
     * @param {boolean} enabled
     */
    setDebugMode(enabled) {
        this._debugMode = enabled;
    }
}

// Singleton instance
export const eventBus = new EventBus();

export default EventBus;
