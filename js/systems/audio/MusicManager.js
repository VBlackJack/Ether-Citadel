/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { MUSIC_TRACKS } from '../../data.js';

export class MusicManager {
    constructor(game) {
        this.game = game;
        this.ctx = null;
        this.currentTrack = null;
        this.volume = 0.3;
        this.enabled = false;
        this.oscillators = [];
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.ctx.destination);
    }

    playTrack(trackId) {
        if (!this.enabled || !this.ctx) return;
        this.stopTrack();
        const track = MUSIC_TRACKS.find(t => t.id === trackId);
        if (!track) return;

        this.currentTrack = trackId;
        // Generate procedural music based on BPM and mood
        this.generateMusic(track);
    }

    generateMusic(track) {
        const beatInterval = 60000 / track.bpm;
        const baseFreq = track.mood === 'intense' ? 110 : track.mood === 'calm' ? 220 : 165;

        const playBeat = () => {
            if (this.currentTrack !== track.id || !this.enabled) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = track.mood === 'intense' ? 'sawtooth' : 'sine';
            osc.frequency.value = baseFreq * (1 + Math.random() * 0.5);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);

            setTimeout(playBeat, beatInterval);
        };

        if (this.enabled) playBeat();
    }

    stopTrack() {
        this.currentTrack = null;
        this.oscillators.forEach(o => o.stop());
        this.oscillators = [];
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) this.masterGain.gain.value = this.volume;
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.init();
            this.playTrack('gameplay');
        } else {
            this.stopTrack();
        }
        return this.enabled;
    }

    getSaveData() { return { enabled: this.enabled, volume: this.volume }; }
    loadSaveData(data) {
        if (!data) return;
        this.enabled = data.enabled || false;
        this.volume = data.volume || 0.3;
    }
}