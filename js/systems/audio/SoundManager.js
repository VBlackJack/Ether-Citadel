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

import { SOUND_DB } from '../../config.js';

/**
 * Sound Manager - Handles game audio using Web Audio API
 */
export class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.muted = false;
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
    }

    play(id) {
        if (this.muted || !this.ctx) return;
        const s = SOUND_DB[id];
        if (!s) return;
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
        if (!this.muted && this.ctx.state === 'suspended') this.ctx.resume();
    }
}
