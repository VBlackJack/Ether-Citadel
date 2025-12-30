/*
 * Copyright 2025 Julien Bombled
 * Help Tooltip System
 */

/**
 * Help Tooltip Manager
 * Manages help icons and their tooltips throughout the UI
 */
export class HelpTooltipManager {
    constructor(game) {
        this.game = game;
        this.activeTooltip = null;
        this.tooltips = new Map();
        this._boundHover = null;
        this._boundMouseOut = null;
        this._boundClick = null;
        this.init();
    }

    init() {
        this._boundHover = (e) => this.handleHover(e);
        this._boundMouseOut = (e) => this.handleMouseOut(e);
        this._boundClick = (e) => this.handleClick(e);

        document.addEventListener('mouseover', this._boundHover);
        document.addEventListener('mouseout', this._boundMouseOut);
        document.addEventListener('click', this._boundClick);
    }

    /**
     * Cleanup all event listeners
     */
    cleanup() {
        if (this._boundHover) {
            document.removeEventListener('mouseover', this._boundHover);
            this._boundHover = null;
        }
        if (this._boundMouseOut) {
            document.removeEventListener('mouseout', this._boundMouseOut);
            this._boundMouseOut = null;
        }
        if (this._boundClick) {
            document.removeEventListener('click', this._boundClick);
            this._boundClick = null;
        }

        this.hideTooltip();
        this.tooltips.clear();
    }

    /**
     * Register tooltip content
     */
    register(key, config) {
        this.tooltips.set(key, {
            title: config.title || '',
            titleKey: config.titleKey || null,
            icon: config.icon || '?',
            content: config.content || '',
            contentKey: config.contentKey || null,
            tips: config.tips || []
        });
    }

    /**
     * Register multiple tooltips
     */
    registerAll(tooltips) {
        for (const [key, config] of Object.entries(tooltips)) {
            this.register(key, config);
        }
    }

    handleHover(e) {
        const helpIcon = e.target.closest('.help-icon[data-help]');
        if (!helpIcon) return;

        const key = helpIcon.dataset.help;
        this.showTooltip(key, helpIcon);
    }

    handleMouseOut(e) {
        const helpIcon = e.target.closest('.help-icon[data-help]');
        if (helpIcon && this.activeTooltip) {
            this.hideTooltip();
        }
    }

    handleClick(e) {
        if (this.activeTooltip && !e.target.closest('.help-tooltip') && !e.target.closest('.help-icon')) {
            this.hideTooltip();
        }
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

    showTooltip(key, anchor) {
        const config = this.tooltips.get(key);
        if (!config) return;

        this.hideTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'help-tooltip';

        const title = config.titleKey && this.game?.t
            ? this.game.t(config.titleKey)
            : config.title;

        const content = config.contentKey && this.game?.t
            ? this.game.t(config.contentKey)
            : config.content;

        let tipsHtml = '';
        if (config.tips.length > 0) {
            const tipsItems = config.tips.map(tip => {
                const tipText = tip.key && this.game?.t ? this.game.t(tip.key) : tip.text;
                return `<div class="help-tooltip-tip"><span class="help-tooltip-tip-icon">💡</span>${this.escapeHtml(tipText)}</div>`;
            }).join('');

            tipsHtml = `<div class="help-tooltip-tips">${tipsItems}</div>`;
        }

        tooltip.innerHTML = `
            <div class="help-tooltip-title">
                <span class="help-tooltip-title-icon">${this.escapeHtml(config.icon)}</span>
                ${this.escapeHtml(title)}
            </div>
            <div class="help-tooltip-content">${this.escapeHtml(content)}</div>
            ${tipsHtml}
        `;

        document.body.appendChild(tooltip);
        this.activeTooltip = tooltip;

        this.positionTooltip(tooltip, anchor);
    }

    positionTooltip(tooltip, anchor) {
        const rect = anchor.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let top = rect.bottom + 8;

        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = rect.top - tooltipRect.height - 8;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    hideTooltip() {
        if (this.activeTooltip) {
            this.activeTooltip.remove();
            this.activeTooltip = null;
        }
    }

    /**
     * Get default help tooltips configuration
     */
    static getDefaultTooltips() {
        return {
            production: {
                title: 'Production Buildings',
                titleKey: 'help.production.title',
                icon: '🏭',
                content: 'Production buildings generate resources passively over time, even when the game is closed.',
                contentKey: 'help.production.content',
                tips: [
                    { text: 'Higher levels produce more resources', key: 'help.production.tip1' },
                    { text: 'Upgrade buildings to increase output', key: 'help.production.tip2' }
                ]
            },
            quests: {
                title: 'Daily Quests',
                titleKey: 'help.quests.title',
                icon: '📋',
                content: 'Complete daily quests to earn bonus rewards. Quests reset every 24 hours.',
                contentKey: 'help.quests.content',
                tips: [
                    { text: 'Complete all quests for bonus rewards', key: 'help.quests.tip1' }
                ]
            },
            prestige: {
                title: 'Prestige System',
                titleKey: 'help.prestige.title',
                icon: '👑',
                content: 'Prestige resets your progress but grants permanent bonuses. Requires reaching wave 25.',
                contentKey: 'help.prestige.content',
                tips: [
                    { text: 'Higher waves = more prestige points', key: 'help.prestige.tip1' },
                    { text: 'Prestige upgrades are permanent', key: 'help.prestige.tip2' }
                ]
            },
            mining: {
                title: 'Mining System',
                titleKey: 'help.mining.title',
                icon: '⛏️',
                content: 'Assign miners to gather resources. Each miner takes time to complete their work.',
                contentKey: 'help.mining.content',
                tips: [
                    { text: 'Different resources have different rarities', key: 'help.mining.tip1' }
                ]
            },
            forge: {
                title: 'Forge',
                titleKey: 'help.forge.title',
                icon: '🔥',
                content: 'Combine resources and relics to create powerful items and upgrades.',
                contentKey: 'help.forge.content',
                tips: [
                    { text: 'Some recipes have a chance to fail', key: 'help.forge.tip1' }
                ]
            },
            research: {
                title: 'Research Tree',
                titleKey: 'help.research.title',
                icon: '🔬',
                content: 'Unlock permanent upgrades using Ether. Research persists through prestiges.',
                contentKey: 'help.research.content',
                tips: [
                    { text: 'Plan your research path carefully', key: 'help.research.tip1' }
                ]
            },
            chips: {
                title: 'Chip System',
                titleKey: 'help.chips.title',
                icon: '🔧',
                content: 'Equip chips to turrets to enhance their abilities. Higher rarity = stronger effects.',
                contentKey: 'help.chips.content',
                tips: [
                    { text: 'Match chip types to turret roles', key: 'help.chips.tip1' }
                ]
            }
        };
    }
}

// Singleton instance
let helpTooltipInstance = null;

export function getHelpTooltipManager(game) {
    if (!helpTooltipInstance) {
        helpTooltipInstance = new HelpTooltipManager(game);
        helpTooltipInstance.registerAll(HelpTooltipManager.getDefaultTooltips());
    }
    return helpTooltipInstance;
}

/**
 * Cleanup help tooltip resources
 */
export function cleanupHelpTooltips() {
    if (helpTooltipInstance) {
        helpTooltipInstance.cleanup();
        helpTooltipInstance = null;
    }
}
