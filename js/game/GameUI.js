/*
 * Copyright 2025 Julien Bombled
 * Game UI Module
 */

import { formatNumber } from '../config.js';
import { t } from '../i18n.js';

/**
 * Game UI Manager
 * Handles all UI updates and rendering
 */
export class GameUIManager {
    constructor(game) {
        this.game = game;
        this.elements = {};
        this.cacheElements();
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        const ids = [
            'ui-gold', 'ui-wave', 'ui-level', 'ui-enemies', 'ui-ether-hud',
            'ui-crystals', 'ui-health-bar', 'ui-shield-bar', 'ui-xp-bar',
            'ui-speed', 'ui-tier', 'ui-tier-display', 'ui-mastery-pts',
            'ui-relic-count', 'ui-dm-amount', 'ui-dark-matter',
            'btn-pause', 'btn-surrender', 'btn-speed', 'quest-badge'
        ];

        for (const id of ids) {
            this.elements[id] = document.getElementById(id);
        }
    }

    /**
     * Update gold display
     */
    updateGold() {
        const el = this.elements['ui-gold'];
        if (el) el.innerText = formatNumber(this.game.gold);
    }

    /**
     * Update wave display
     */
    updateWave() {
        const el = this.elements['ui-wave'];
        if (el) el.innerText = this.game.wave;
    }

    /**
     * Update level display
     */
    updateLevel() {
        const el = this.elements['ui-level'];
        if (el) {
            const level = this.game.getLevel ? this.game.getLevel() : 1;
            el.innerText = level;
        }
    }

    /**
     * Update enemies count
     */
    updateEnemies() {
        const el = this.elements['ui-enemies'];
        if (el) el.innerText = this.game.enemies.length + this.game.enemiesToSpawn;
    }

    /**
     * Update ether display
     */
    updateEther() {
        const el = this.elements['ui-ether-hud'];
        if (el) el.innerText = formatNumber(this.game.ether);
    }

    /**
     * Update crystals display
     */
    updateCrystals() {
        const el = this.elements['ui-crystals'];
        if (el) el.innerText = formatNumber(this.game.crystals);
    }

    /**
     * Update health bar
     */
    updateHealthBar() {
        const el = this.elements['ui-health-bar'];
        if (el && this.game.castle) {
            const percent = (this.game.castle.hp / this.game.castle.maxHp) * 100;
            el.style.width = `${percent}%`;
        }
    }

    /**
     * Update shield bar
     */
    updateShieldBar() {
        const el = this.elements['ui-shield-bar'];
        if (el && this.game.castle) {
            const percent = this.game.castle.maxShield > 0
                ? (this.game.castle.shield / this.game.castle.maxShield) * 100
                : 0;
            el.style.width = `${percent}%`;
        }
    }

    /**
     * Update speed display
     */
    updateSpeed() {
        const el = this.elements['ui-speed'];
        if (el) el.innerText = `x${this.game.speedMultiplier}`;
    }

    /**
     * Update tier display
     */
    updateTier() {
        const tierEl = this.elements['ui-tier'];
        const displayEl = this.elements['ui-tier-display'];

        if (this.game.castle?.tier > 1) {
            if (displayEl) displayEl.classList.remove('hidden');
            if (tierEl) tierEl.innerText = this.game.castle.tier;
        } else {
            if (displayEl) displayEl.classList.add('hidden');
        }
    }

    /**
     * Update dark matter display
     */
    updateDarkMatter() {
        const amountEl = this.elements['ui-dm-amount'];
        const containerEl = this.elements['ui-dark-matter'];

        const darkMatter = this.game.challenges?.darkMatter || 0;

        if (darkMatter > 0) {
            if (containerEl) containerEl.classList.remove('hidden');
            if (amountEl) amountEl.innerText = formatNumber(darkMatter);
        } else {
            if (containerEl) containerEl.classList.add('hidden');
        }
    }

    /**
     * Update pause button
     */
    updatePauseButton() {
        const el = this.elements['btn-pause'];
        if (el) el.innerText = this.game.isPaused ? '▶️' : '⏸️';
    }

    /**
     * Update surrender button visibility
     */
    updateSurrenderButton() {
        const el = this.elements['btn-surrender'];
        if (el) {
            if (this.game.canSurrender && this.game.canSurrender()) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    }

    /**
     * Update quest badge
     */
    updateQuestBadge() {
        const el = this.elements['quest-badge'];
        if (el && this.game.dailyQuests) {
            const hasReady = this.game.dailyQuests.hasReadyQuests();
            if (hasReady) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    }

    /**
     * Update mastery points display
     */
    updateMasteryPoints() {
        const el = this.elements['ui-mastery-pts'];
        if (el && this.game.stats) {
            el.innerText = this.game.stats.masteryPoints || 0;
        }
    }

    /**
     * Update relic count
     */
    updateRelicCount() {
        const el = this.elements['ui-relic-count'];
        if (el) el.innerText = this.game.relics.length;
    }

    /**
     * Update all stats UI
     */
    updateAllStats() {
        this.updateGold();
        this.updateWave();
        this.updateLevel();
        this.updateEnemies();
        this.updateEther();
        this.updateCrystals();
        this.updateHealthBar();
        this.updateShieldBar();
        this.updateSpeed();
        this.updateTier();
        this.updateDarkMatter();
        this.updatePauseButton();
        this.updateSurrenderButton();
        this.updateQuestBadge();
        this.updateMasteryPoints();
        this.updateRelicCount();
    }

    /**
     * Show floating text
     */
    showFloatingText(x, y, text, color, size = 20) {
        if (this.game.FloatingText) {
            this.game.floatingTexts.push(
                new this.game.FloatingText(x, y, text, color, size)
            );
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    /**
     * Create toast container
     */
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse gap-2 items-center';
        document.body.appendChild(container);
        return container;
    }

    /**
     * Get toast icon by type
     */
    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * Flash damage overlay
     */
    flashDamageOverlay() {
        const overlay = document.getElementById('damage-overlay');
        if (overlay) {
            overlay.classList.add('damage-effect');
            setTimeout(() => {
                overlay.classList.remove('damage-effect');
            }, 200);
        }
    }

    /**
     * Show loot popup
     */
    showLootPopup(item) {
        const fxContainer = document.getElementById('fx-container');
        if (!fxContainer) return;

        const popup = document.createElement('div');
        popup.className = 'loot-popup absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border-2 border-yellow-500 rounded-lg px-4 py-2 text-center z-50';
        popup.innerHTML = `
            <div class="text-2xl">${item.icon || '🎁'}</div>
            <div class="text-yellow-400 font-bold">${item.name || t('loot.newItem')}</div>
        `;

        fxContainer.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 2000);
    }

    /**
     * Update active challenge HUD
     */
    updateChallengeHUD() {
        const hud = document.getElementById('active-challenge-hud');
        const nameEl = document.getElementById('challenge-name-hud');

        if (this.game.activeChallenge) {
            if (hud) hud.classList.remove('hidden');
            if (nameEl) nameEl.innerText = this.game.activeChallenge.name || '';
        } else {
            if (hud) hud.classList.add('hidden');
        }
    }

    /**
     * Update synergies HUD
     */
    updateSynergiesHUD() {
        const container = document.getElementById('synergies-hud');
        const list = document.getElementById('synergies-list');

        if (!container || !list || !this.game.synergies) return;

        const activeSynergies = this.game.synergies.getActiveSynergies();

        if (activeSynergies.length > 0) {
            container.classList.remove('hidden');
            list.innerHTML = activeSynergies.map(s => `
                <span class="bg-purple-900/50 border border-purple-500 px-2 py-1 rounded text-xs text-purple-300">
                    ${s.icon || '⚡'} ${s.name}
                </span>
            `).join('');
        } else {
            container.classList.add('hidden');
        }
    }
}
