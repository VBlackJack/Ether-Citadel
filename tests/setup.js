/*
 * Copyright 2025 Julien Bombled
 * Jest Test Setup
 */

// Mock browser globals
global.localStorage = {
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

// Mock window.requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock AudioContext for sound tests
global.AudioContext = class AudioContext {
    constructor() {
        this.state = 'running';
    }
    createOscillator() {
        return { connect: () => {}, start: () => {}, stop: () => {}, type: 'sine', frequency: { value: 440 } };
    }
    createGain() {
        return { connect: () => {}, gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} } };
    }
    resume() {
        return Promise.resolve();
    }
};

// Reset localStorage before each test
beforeEach(() => {
    global.localStorage.clear();
});
