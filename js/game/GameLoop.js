/*
 * Copyright 2025 Julien Bombled
 * Game Loop - Handles the main game heartbeat, timing, and FPS
 */

export class GameLoop {
    constructor(game) {
        this.game = game;
        this.isRunning = false;
        this.lastTime = 0;
        this.rafId = null;

        // Frame timing constants
        this.TARGET_FRAME_TIME = 1000 / 60; // 60 FPS target
        this.MAX_FRAME_TIME = 100; // Cap to prevent spiral
        this.FRAME_SKIP_THRESHOLD = 50; // Skip frame if too slow

        // Debug stats with exponential moving average for smoother FPS
        this.debugStats = {
            fps: 60,
            fpsSmooth: 60,
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
        // Guard against double-queuing during shutdown
        if (!this.isRunning) {
            this.rafId = null;
            return;
        }

        // Calculate delta time FIRST
        const dtRaw = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap dt to prevent spiral (e.g. if tab was inactive)
        const safeDt = Math.min(dtRaw, this.MAX_FRAME_TIME);

        // Debug: FPS Calculation with exponential moving average
        this.debugStats.frames++;
        if (currentTime - this.debugStats.lastFpsUpdate >= 1000) {
            this.debugStats.fps = this.debugStats.frames;
            // Smooth FPS using EMA (alpha = 0.3)
            this.debugStats.fpsSmooth = this.debugStats.fpsSmooth * 0.7 + this.debugStats.fps * 0.3;
            this.debugStats.frames = 0;
            this.debugStats.lastFpsUpdate = currentTime;
        }

        // Performance monitoring
        const startUpdate = performance.now();

        // Apply game speed multiplier
        const dt = safeDt * (this.game.speedMultiplier || 1);

        // Game Logic Update (skip if paused)
        if (!this.game.isPaused) {
            this.game.gameTime += dt;
            this.game.update(dt);
        }

        const endUpdate = performance.now();
        this.debugStats.updateTime = endUpdate - startUpdate;

        // Rendering - always draw, even when paused
        // Skip render if frame took too long (catch-up mode)
        if (dtRaw < this.FRAME_SKIP_THRESHOLD) {
            this.game.draw();
        }

        const endRender = performance.now();
        this.debugStats.renderTime = endRender - endUpdate;
        this.debugStats.frameTime = dtRaw;

        // Request next frame at END of loop (not start)
        // This prevents frame queue buildup when frames are slow
        this.rafId = requestAnimationFrame(this._boundLoop);
    }
}
