/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { WEATHER_TYPES } from '../../data.js';
import { t } from '../../i18n.js';

export class WeatherManager {
    constructor(game) {
        this.game = game;
        this.currentWeather = WEATHER_TYPES[0];
        this.timeRemaining = 0;
        this.particles = [];
    }

    update(dt) {
        this.timeRemaining -= dt;
        if (this.timeRemaining <= 0) {
            this.changeWeather();
        }
        this.updateParticles(dt);
    }

    changeWeather() {
        const totalWeight = WEATHER_TYPES.reduce((sum, w) => sum + w.weight, 0);
        let random = Math.random() * totalWeight;
        for (const weather of WEATHER_TYPES) {
            random -= weather.weight;
            if (random <= 0) {
                this.currentWeather = weather;
                this.timeRemaining = weather.duration;
                break;
            }
        }
    }

    getEffects() {
        return this.currentWeather.effects || {};
    }

    updateParticles(dt) {
        const id = this.currentWeather.id;
        if (id === 'rain' || id === 'storm') {
            if (Math.random() < 0.3) {
                this.particles.push({
                    x: Math.random() * this.game.width,
                    y: -10,
                    vy: 400 + Math.random() * 200,
                    life: 2
                });
            }
        }
        this.particles = this.particles.filter(p => {
            p.y += p.vy * dt / 1000;
            p.life -= dt / 1000;
            return p.life > 0 && p.y < this.game.height;
        });
    }

    draw(ctx) {
        const id = this.currentWeather.id;
        if (id === 'rain' || id === 'storm') {
            ctx.strokeStyle = id === 'storm' ? '#6366f1' : '#3b82f6';
            ctx.lineWidth = 1;
            this.particles.forEach(p => {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - 2, p.y + 15);
                ctx.stroke();
            });
        }
        if (id === 'fog') {
            ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
        }
        if (id === 'blood_moon') {
            ctx.fillStyle = 'rgba(220, 38, 38, 0.15)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
        }
        // Weather HUD
        ctx.fillStyle = this.currentWeather.color;
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${this.currentWeather.icon} ${t(this.currentWeather.nameKey)}`, 10, this.game.height - 10);
    }

    getSaveData() {
        return { weatherId: this.currentWeather.id, timeRemaining: this.timeRemaining };
    }

    loadSaveData(data) {
        if (!data) return;
        const weather = WEATHER_TYPES.find(w => w.id === data.weatherId);
        if (weather) {
            this.currentWeather = weather;
            this.timeRemaining = data.timeRemaining || weather.duration;
        }
    }
}