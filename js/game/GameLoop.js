/*
 * Copyright 2025 Julien Bombled
 * Game Loop Module
 */

import { MathUtils } from '../config.js';

/**
 * Game Loop Manager
 * Handles the main game loop, timing, and speed control
 */
export class GameLoopManager {
    constructor(game) {
        this.game = game;
        this.lastTime = performance.now();
        this.animationFrameId = null;
        this.isRunning = false;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.then = performance.now();
    }

    /**
     * Start the game loop
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.then = performance.now();
        this.loop();
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Main game loop
     */
    loop() {
        if (!this.isRunning) return;

        this.animationFrameId = requestAnimationFrame(() => this.loop());

        const now = performance.now();
        const delta = now - this.then;

        if (delta >= this.frameInterval) {
            this.then = now - (delta % this.frameInterval);

            const rawDt = now - this.lastTime;
            this.lastTime = now;

            const dt = Math.min(rawDt, 100) * this.game.speedMultiplier;

            if (!this.game.isPaused && !this.game.isGameOver) {
                this.update(dt);
            }

            this.render();
        }
    }

    /**
     * Update game state
     */
    update(dt) {
        const g = this.game;

        g.gameTime += dt;

        // Update wave spawning
        if (g.waveInProgress && g.enemiesToSpawn > 0) {
            g.spawnTimer -= dt;
            if (g.spawnTimer <= 0) {
                g.spawnEnemy();
                g.spawnTimer = g.getSpawnInterval();
            }
        }

        // Update entities
        for (let i = g.enemies.length - 1; i >= 0; i--) {
            const enemy = g.enemies[i];
            enemy.update(dt);
            if (enemy.hp <= 0 || enemy.reachedEnd) {
                g.enemies.splice(i, 1);
            }
        }

        for (let i = g.projectiles.length - 1; i >= 0; i--) {
            const proj = g.projectiles[i];
            if (proj.update) proj.update(dt, g);
            if (proj.dead) {
                g.projectiles.splice(i, 1);
            }
        }

        for (let i = g.particles.length - 1; i >= 0; i--) {
            const p = g.particles[i];
            p.update(dt);
            if (p.life <= 0) {
                g.particles.splice(i, 1);
            }
        }

        for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
            const ft = g.floatingTexts[i];
            ft.update(dt);
            if (ft.life <= 0) {
                g.floatingTexts.splice(i, 1);
            }
        }

        for (let i = g.runes.length - 1; i >= 0; i--) {
            const rune = g.runes[i];
            if (rune.update) rune.update(dt);
            if (rune.expired) {
                g.runes.splice(i, 1);
            }
        }

        // Update turrets
        for (const turret of g.turrets) {
            if (turret.update) turret.update(dt, g.gameTime, g);
        }

        // Update drone
        if (g.drone?.update) {
            g.drone.update(dt, g.gameTime, g);
        }

        // Update castle
        if (g.castle?.update) {
            g.castle.update(dt);
        }

        // Update skills
        if (g.skills?.update) {
            g.skills.update(dt, g);
        }

        // Update buffs
        for (const key in g.activeBuffs) {
            if (g.activeBuffs[key] > 0) {
                g.activeBuffs[key] -= dt;
                if (g.activeBuffs[key] <= 0) {
                    g.activeBuffs[key] = 0;
                }
            }
        }

        // Update managers
        if (g.mining?.update) g.mining.update();
        if (g.production?.update) g.production.update(dt);
        if (g.weather?.update) g.weather.update(dt);
        if (g.combo?.update) g.combo.update(dt);
        if (g.events?.update) g.events.update(dt);
        if (g.auras?.update) g.auras.update(dt);
        if (g.visualEffects?.update) g.visualEffects.update(dt);
        if (g.music?.update) g.music.update(dt);
        if (g.seasonalEvents?.update) g.seasonalEvents.update(dt);
        if (g.bossMechanics?.update) g.bossMechanics.update(dt);

        // Check wave completion
        if (g.waveInProgress && g.enemiesToSpawn <= 0 && g.enemies.length === 0) {
            g.completeWave();
        }

        // Auto-save
        if (Date.now() - g.lastSaveTime > 30000) {
            g.save();
        }
    }

    /**
     * Render game
     */
    render() {
        const g = this.game;
        const ctx = g.ctx;

        ctx.clearRect(0, 0, g.width, g.height);

        // Draw background
        this.drawBackground(ctx);

        // Draw turret slots
        if (g.turretSlots?.draw) {
            g.turretSlots.draw(ctx);
        }

        // Draw castle
        if (g.castle?.draw) {
            g.castle.draw(ctx, g.width, g.height);
        }

        // Draw turrets
        for (const turret of g.turrets) {
            if (turret.draw) turret.draw(ctx, g);
        }

        // Draw drone
        if (g.drone?.draw) {
            g.drone.draw(ctx);
        }

        // Draw enemies
        for (const enemy of g.enemies) {
            if (enemy.draw) enemy.draw(ctx);
        }

        // Draw projectiles
        for (const proj of g.projectiles) {
            if (proj.draw) proj.draw(ctx);
        }

        // Draw particles
        for (const p of g.particles) {
            if (p.draw) p.draw(ctx);
        }

        // Draw floating texts
        for (const ft of g.floatingTexts) {
            if (ft.draw) ft.draw(ctx);
        }

        // Draw runes
        for (const rune of g.runes) {
            if (rune.draw) rune.draw(ctx);
        }

        // Draw visual effects
        if (g.visualEffects?.draw) {
            g.visualEffects.draw(ctx);
        }

        // Draw weather effects
        if (g.weather?.draw) {
            g.weather.draw(ctx);
        }

        // Draw combo indicator
        if (g.combo?.draw) {
            g.combo.draw(ctx);
        }
    }

    /**
     * Draw background
     */
    drawBackground(ctx) {
        const g = this.game;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, g.width, g.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
        ctx.lineWidth = 1;

        const gridSize = 50;
        for (let x = 0; x < g.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, g.height);
            ctx.stroke();
        }

        for (let y = 0; y < g.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(g.width, y);
            ctx.stroke();
        }
    }

    /**
     * Get current FPS
     */
    getCurrentFPS() {
        const now = performance.now();
        const delta = now - this.lastTime;
        return delta > 0 ? Math.round(1000 / delta) : 0;
    }
}
