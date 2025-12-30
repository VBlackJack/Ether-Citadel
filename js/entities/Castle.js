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

import { CONFIG } from '../config.js';

/**
 * Castle entity - The player's main base
 */
export class Castle {
    constructor(game) {
        this.game = game;
        this.x = 100;
        this.y = 0;
        this.baseMaxHp = CONFIG.castle.baseMaxHp;
        this.maxHp = CONFIG.castle.baseMaxHp;
        this.hp = CONFIG.castle.baseMaxHp;
        this.regen = 0;
        this.tier = 1;
        this.shield = 0;
        this.maxShield = 0;
        this.shieldRegenTimer = 0;
        this.width = CONFIG.castle.width;
        this.height = CONFIG.castle.height;
        this.radius = CONFIG.castle.radius;
        this.armor = 0;
    }

    update(dt) {
        const game = this.game;
        if (game.activeChallenge && game.activeChallenge.id === 'noregen') {
            // No regen
        } else if (this.hp < this.maxHp && this.hp > 0) {
            this.hp += (this.regen / 60) * (dt / 16);
            if (this.hp > this.maxHp) this.hp = this.maxHp;
        }
        if (this.maxShield > 0) {
            if (this.shieldRegenTimer > 0) this.shieldRegenTimer -= dt;
            else if (this.shield < this.maxShield) this.shield += (this.maxShield * 0.05) * (dt / 16);
            if (this.shield > this.maxShield) this.shield = this.maxShield;
        }
    }

    heal(amount) {
        if (this.game.activeChallenge && this.game.activeChallenge.id === 'noregen') return;
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    takeDamage(amount) {
        amount = amount * (1 - this.armor);
        if (this.shield > 0) {
            if (this.shield >= amount) {
                this.shield -= amount;
                amount = 0;
            } else {
                amount -= this.shield;
                this.shield = 0;
            }
            this.shieldRegenTimer = 3000;
        }
        if (amount > 0) {
            this.hp -= amount;
            const overlay = document.getElementById('damage-overlay');
            if (overlay) {
                overlay.classList.add('damage-effect');
                setTimeout(() => overlay.classList.remove('damage-effect'), CONFIG.ui.damageOverlayDuration);
            }
            if (this.hp <= 0) {
                this.hp = 0;
                this.game.gameOver();
            }
        }
    }

    draw(ctx, width, height) {
        const game = this.game;
        this.y = height / 2;
        if (game.settings.showRange) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, game.currentRange, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(this.x - 40, this.y - 60, 80, 120);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x - 40, this.y - 60, 80, 120);
        const slots = [{ x: -40, y: -60 }, { x: 40, y: -60 }, { x: -40, y: 60 }, { x: 40, y: 60 }];
        slots.forEach(s => {
            ctx.beginPath();
            ctx.arc(this.x + s.x, this.y + s.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.stroke();
        });
        ctx.translate(this.x, this.y);
        const target = game.findTarget(this.x, this.y, game.currentRange);
        if (target) ctx.rotate(Math.atan2(target.y - this.y, target.x - this.x));
        if (this.shield > 0) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#60a5fa';
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 70, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        if (this.tier === 1) {
            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(0, -10, 30, 20);
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.fillStyle = '#2563eb';
            ctx.fill();
        } else if (this.tier === 2) {
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(0, -12, 35, 24);
            ctx.fillStyle = '#7e22ce';
            ctx.fillRect(-25, -25, 50, 50);
            ctx.strokeStyle = '#d8b4fe';
            ctx.lineWidth = 2;
            ctx.strokeRect(-20, -20, 40, 40);
        } else if (this.tier === 3) {
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(0, -8, 45, 16);
            ctx.fillStyle = '#be123c';
            ctx.beginPath();
            for (let i = 0; i < 6; i++) ctx.lineTo(30 * Math.cos(i * Math.PI / 3), 30 * Math.sin(i * Math.PI / 3));
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const hue = (Date.now() / 20) % 360;
            ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
            ctx.fillRect(0, -10, 50, 20);
            ctx.fillStyle = '#fff';
            ctx.shadowColor = `hsl(${hue}, 80%, 60%)`;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.restore();
    }
}
