/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { SOUND_DB } from '../../config.js';

// Minimum interval (ms) between plays of the same sound
const SOUND_COOLDOWNS = {
    shoot: 80,   // Max ~12 shots/sec audible
    hit: 50,     // Max ~20 hits/sec audible
    coin: 30,
    levelup: 200,
    gameover: 500
};

export class SoundManager {
    constructor() {
        this.ctx = null;  // Lazy init to avoid autoplay policy warnings
        this.masterGain = null;
        this.muted = false;
        this.lastPlayTime = {};  // Throttle tracking
    }

    /**
     * Initialize AudioContext on first user gesture
     */
    initContext() {
        if (this.ctx) return true;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            return true;
        } catch (e) {
            console.warn('AudioContext not available:', e.message);
            return false;
        }
    }

    /**
     * Resume AudioContext if suspended (browser autoplay policy)
     */
    async ensureResumed() {
        if (!this.ctx) return false;
        if (this.ctx.state === 'suspended') {
            try {
                await this.ctx.resume();
            } catch (e) {
                // Silently fail - will retry on next gesture
                return false;
            }
        }
        return this.ctx.state === 'running';
    }

    play(id) {
        if (this.muted) return;

        // Lazy init on first play attempt
        if (!this.ctx && !this.initContext()) return;

        // Don't spam console if suspended - just skip silently
        if (this.ctx.state === 'suspended') {
            this.ensureResumed();
            return;
        }

        const s = SOUND_DB[id];
        if (!s) return;

        // Throttle: skip if played too recently
        const now = performance.now();
        const cooldown = SOUND_COOLDOWNS[id] || 0;
        if (this.lastPlayTime[id] && now - this.lastPlayTime[id] < cooldown) {
            return;
        }
        this.lastPlayTime[id] = now;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = s.type;
        osc.frequency.setValueAtTime(s.freq, this.ctx.currentTime);
        if (s.slide) osc.frequency.exponentialRampToValueAtTime(s.freq * 2, this.ctx.currentTime + s.decay);
        if (s.slideDown) osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + s.decay);
        gain.gain.setValueAtTime(s.vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + s.decay);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + s.decay);
        if (s.melody) {
            setTimeout(() => {
                if (!this.ctx || this.ctx.state !== 'running') return;
                const osc2 = this.ctx.createOscillator();
                const gain2 = this.ctx.createGain();
                osc2.frequency.setValueAtTime(s.freq * 1.5, this.ctx.currentTime);
                gain2.gain.setValueAtTime(s.vol, this.ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + s.decay);
                osc2.connect(gain2);
                gain2.connect(this.masterGain);
                osc2.start();
                osc2.stop(this.ctx.currentTime + s.decay);
            }, 150);
        }
    }

    toggle() {
        this.muted = !this.muted;
        const btn = document.getElementById('btn-sound');
        if (btn) btn.innerText = this.muted ? '🔇' : '🔊';

        // Init and resume on unmute (user gesture)
        if (!this.muted) {
            this.initContext();
            this.ensureResumed();
        }
    }
}
