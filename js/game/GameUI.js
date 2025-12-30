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
            'btn-pause', 'btn-surrender', 'btn-speed', 'quest-badge',
            'damage-overlay', 'fx-container', 'toast-container',
            'active-challenge-hud', 'challenge-name-hud',
            'synergies-hud', 'synergies-list'
        ];

        for (const id of ids) {
            this.elements[id] = document.getElementById(id);
        }
    }

    /**
     * Refresh cached element (useful after DOM changes)
     */
    refreshElement(id) {
        this.elements[id] = document.getElementById(id);
        return this.elements[id];
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
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
        if (el) {
            const enemyCount = (this.game.enemies?.length || 0) + (this.game.enemiesToSpawn || 0);
            el.innerText = enemyCount;
        }
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
            const maxHp = this.game.castle.maxHp || 1;
            const percent = Math.max(0, Math.min(100, (this.game.castle.hp / maxHp) * 100));
            el.style.width = `${percent}%`;
        }
    }

    /**
     * Update shield bar
     */
    updateShieldBar() {
        const el = this.elements['ui-shield-bar'];
        if (el && this.game.castle) {
            const maxShield = this.game.castle.maxShield || 0;
            const percent = maxShield > 0
                ? Math.max(0, Math.min(100, (this.game.castle.shield / maxShield) * 100))
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
            const hasReady = this.game.dailyQuests.hasReadyQuests?.() || false;
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
        if (el) {
            el.innerText = this.game.stats?.masteryPoints || 0;
        }
    }

    /**
     * Update relic count
     */
    updateRelicCount() {
        const el = this.elements['ui-relic-count'];
        if (el) el.innerText = this.game.relics?.length || 0;
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
        if (this.game.FloatingText && this.game.floatingTexts) {
            this.game.floatingTexts.push(
                new this.game.FloatingText(x, y, text, color, size)
            );
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        let container = this.elements['toast-container'];
        if (!container) {
            container = this.createToastContainer();
            this.elements['toast-container'] = container;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${this.escapeHtml(type)}`;

        const iconSpan = document.createElement('span');
        iconSpan.className = 'toast-icon';
        iconSpan.textContent = this.getToastIcon(type);

        const messageSpan = document.createElement('span');
        messageSpan.className = 'toast-message';
        messageSpan.textContent = message;

        toast.appendChild(iconSpan);
        toast.appendChild(messageSpan);
        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
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
        const overlay = this.elements['damage-overlay'];
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
        const fxContainer = this.elements['fx-container'];
        if (!fxContainer) return;

        const popup = document.createElement('div');
        popup.className = 'loot-popup absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border-2 border-yellow-500 rounded-lg px-4 py-2 text-center z-50';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'text-2xl';
        iconDiv.textContent = item?.icon || '🎁';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'text-yellow-400 font-bold';
        nameDiv.textContent = item?.name || t('loot.newItem');

        popup.appendChild(iconDiv);
        popup.appendChild(nameDiv);
        fxContainer.appendChild(popup);

        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 2000);
    }

    /**
     * Update active challenge HUD
     */
    updateChallengeHUD() {
        const hud = this.elements['active-challenge-hud'];
        const nameEl = this.elements['challenge-name-hud'];

        if (this.game.activeChallenge) {
            if (hud) hud.classList.remove('hidden');
            if (nameEl) nameEl.textContent = this.game.activeChallenge.name || '';
        } else {
            if (hud) hud.classList.add('hidden');
        }
    }

    /**
     * Update synergies HUD
     */
    updateSynergiesHUD() {
        const container = this.elements['synergies-hud'];
        const list = this.elements['synergies-list'];

        if (!container || !list || !this.game.synergies) return;

        const activeSynergies = this.game.synergies.getActiveSynergies?.() || [];

        if (activeSynergies.length > 0) {
            container.classList.remove('hidden');
            list.innerHTML = '';

            for (const s of activeSynergies) {
                const span = document.createElement('span');
                span.className = 'bg-purple-900/50 border border-purple-500 px-2 py-1 rounded text-xs text-purple-300';
                span.textContent = `${s.icon || '⚡'} ${s.name || ''}`;
                list.appendChild(span);
            }
        } else {
            container.classList.add('hidden');
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.elements = {};
    }
}
