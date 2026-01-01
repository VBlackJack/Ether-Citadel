/*
 * Copyright 2025 Julien Bombled
 * Game Loop - Handles the main game heartbeat, timing, and FPS
 */

export class GameLoop {
    constructor(game) {
        this.game = game;
        this.isRunning = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.rafId = null;

        // Debug stats
        this.debugStats = {
            fps: 0,
            frames: 0,
            lastFpsUpdate: 0,
            frameTime: 0,
            updateTime: 0,
            renderTime: 0
        };

        // Bind the loop to keep 'this' context
        this._boundLoop = this.loop.bind(this);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame(this._boundLoop);
    }

    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        // Request next frame immediately
        this.rafId = requestAnimationFrame(this._boundLoop);

        // Calculate delta time
        const dtRaw = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Debug: FPS Calculation (every 1 second)
        this.debugStats.frames++;
        if (currentTime - this.debugStats.lastFpsUpdate >= 1000) {
            this.debugStats.fps = this.debugStats.frames;
            this.debugStats.frames = 0;
            this.debugStats.lastFpsUpdate = currentTime;
        }

        // Performance monitoring
        const startUpdate = performance.now();

        // Game Logic Update
        // Only update if not paused, OR if we want to allow some systems to run while paused (optional)
        // Cap dt to prevent spiraling (e.g. if tab was inactive)
        const safeDt = Math.min(dtRaw, 100);

        // Apply game speed multiplier
        const dt = safeDt * (this.game.speedMultiplier || 1);

        if (!this.game.isPaused) {
            this.game.gameTime += dt;
            this.game.update(dt);
        }

        const endUpdate = performance.now();
        this.debugStats.updateTime = endUpdate - startUpdate;

        // Rendering
        // Always draw, even when paused
        this.game.draw();

        const endRender = performance.now();
        this.debugStats.renderTime = endRender - endUpdate;
        this.debugStats.frameTime = dtRaw;
    }
}
