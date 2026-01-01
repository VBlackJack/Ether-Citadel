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
 * Swipe directions
 */
export const SwipeDirection = {
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
};

/**
 * SwipeManager - Handles touch swipe gestures for mobile navigation
 */
export class SwipeManager {
    constructor(game) {
        this.game = game;
        this.enabled = true;
        this.minSwipeDistance = 50;
        this.maxSwipeTime = 300;
        this.touchStart = null;
        this.callbacks = new Map();

        this._boundTouchStart = this.handleTouchStart.bind(this);
        this._boundTouchEnd = this.handleTouchEnd.bind(this);

        this.init();
    }

    /**
     * Initialize swipe listeners
     */
    init() {
        document.addEventListener('touchstart', this._boundTouchStart, { passive: true });
        document.addEventListener('touchend', this._boundTouchEnd, { passive: true });
    }

    /**
     * Clean up listeners
     */
    destroy() {
        document.removeEventListener('touchstart', this._boundTouchStart);
        document.removeEventListener('touchend', this._boundTouchEnd);
    }

    /**
     * Register a swipe callback for a specific element or selector
     * @param {string} selector - CSS selector or 'global'
     * @param {SwipeDirection} direction - Swipe direction
     * @param {Function} callback - Callback function
     */
    on(selector, direction, callback) {
        const key = `${selector}:${direction}`;
        if (!this.callbacks.has(key)) {
            this.callbacks.set(key, []);
        }
        this.callbacks.get(key).push(callback);
    }

    /**
     * Remove a swipe callback
     * @param {string} selector
     * @param {SwipeDirection} direction
     * @param {Function} callback
     */
    off(selector, direction, callback) {
        const key = `${selector}:${direction}`;
        if (this.callbacks.has(key)) {
            const callbacks = this.callbacks.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Handle touch start
     * @param {TouchEvent} e
     */
    handleTouchStart(e) {
        if (!this.enabled) return;
        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        this.touchStart = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
            target: e.target
        };
    }

    /**
     * Handle touch end
     * @param {TouchEvent} e
     */
    handleTouchEnd(e) {
        if (!this.enabled || !this.touchStart) return;

        const touch = e.changedTouches[0];
        const dx = touch.clientX - this.touchStart.x;
        const dy = touch.clientY - this.touchStart.y;
        const dt = Date.now() - this.touchStart.time;

        // Check if it's a valid swipe
        if (dt > this.maxSwipeTime) {
            this.touchStart = null;
            return;
        }

        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // Determine swipe direction
        let direction = null;
        if (absDx > absDy && absDx > this.minSwipeDistance) {
            direction = dx > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT;
        } else if (absDy > absDx && absDy > this.minSwipeDistance) {
            direction = dy > 0 ? SwipeDirection.DOWN : SwipeDirection.UP;
        }

        if (direction) {
            this.triggerSwipe(direction, this.touchStart.target, { dx, dy, dt });
        }

        this.touchStart = null;
    }

    /**
     * Trigger swipe callbacks
     * @param {SwipeDirection} direction
     * @param {Element} target
     * @param {Object} data
     */
    triggerSwipe(direction, target, data) {
        // Check element-specific callbacks
        for (const [key, callbacks] of this.callbacks) {
            const [selector, dir] = key.split(':');
            if (dir !== direction) continue;

            if (selector === 'global') {
                callbacks.forEach(cb => cb(data));
            } else {
                const el = target.closest(selector);
                if (el) {
                    callbacks.forEach(cb => cb(data, el));
                }
            }
        }

        // Emit event via game's event bus
        this.game.eventBus?.emit('swipe', { direction, target, ...data });
    }

    /**
     * Enable/disable swipe detection
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Configure swipe sensitivity
     * @param {Object} options
     */
    configure(options = {}) {
        if (options.minDistance !== undefined) {
            this.minSwipeDistance = options.minDistance;
        }
        if (options.maxTime !== undefined) {
            this.maxSwipeTime = options.maxTime;
        }
    }
}

export default SwipeManager;
