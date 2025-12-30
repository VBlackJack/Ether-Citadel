/*
 * Copyright 2025 Julien Bombled
 * Event Delegation System
 */

/**
 * Event Delegation Manager
 * Centralizes UI event handling to avoid inline onclick handlers
 */
/**
 * Safely parse integer with validation
 */
function safeParseInt(value, defaultValue = 0) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : defaultValue;
}

export class EventDelegationManager {
    constructor(game) {
        this.game = game;
        this.actions = new Map();
        this._boundClickHandler = null;
        this.init();
    }

    init() {
        this.registerDefaultActions();
        this._boundClickHandler = (e) => this.handleClick(e);
        document.addEventListener('click', this._boundClickHandler);
    }

    /**
     * Register all default UI actions
     */
    registerDefaultActions() {
        // Challenge actions
        this.register('challenge.start', (params) => {
            this.game.challenges.startChallenge(params.id);
        });

        // School actions
        this.register('school.unlock', (params) => {
            this.game.school.unlock(params.id);
            this.game.renderSchoolUI();
        });

        this.register('school.levelUp', (params) => {
            this.game.school.levelUp(params.id);
            this.game.renderSchoolUI();
        });

        // Office actions
        this.register('office.activate', (params) => {
            this.game.office.activateBoost(params.id);
            this.game.renderOfficeUI();
        });

        // Game modes actions
        this.register('gameMode.set', (params) => {
            this.game.gameModes.setMode(params.id);
            this.game.renderGameModesUI();
        });

        // Campaign actions
        this.register('campaign.start', (params) => {
            this.game.campaign.startMission(params.id);
            const modal = document.getElementById('campaign-modal');
            if (modal) modal.classList.add('hidden');
        });

        // Preset actions
        this.register('preset.save', (params) => {
            this.game.buildPresets.savePreset(safeParseInt(params.id));
            this.game.renderPresetsUI();
        });

        this.register('preset.load', (params) => {
            this.game.buildPresets.loadPreset(safeParseInt(params.id));
            this.game.renderPresetsUI();
        });

        this.register('preset.delete', (params) => {
            this.game.buildPresets.deletePreset(safeParseInt(params.id));
            this.game.renderPresetsUI();
        });

        // Turret slots actions
        this.register('turretSlot.remove', (params) => {
            this.game.turretSlots.removeTurret(safeParseInt(params.id));
            this.game.renderTurretSlotsUI();
        });

        this.register('turretSlot.equip', (params) => {
            this.game.turretSlots.equipTurret(params.id);
            this.game.renderTurretSlotsUI();
        });

        // Dread level actions
        this.register('dread.setLevel', (params) => {
            this.game.prestige.setDreadLevel(safeParseInt(params.level));
        });

        // Awakening actions
        this.register('awakening.awaken', () => {
            this.game.awakening.awaken();
            this.game.renderAwakeningUI();
        });

        // Production actions
        this.register('production.buy', (params) => {
            this.game.production.buy(params.id);
        });

        this.register('production.upgrade', (params) => {
            this.game.production.upgrade(params.id);
        });

        // Mining actions
        this.register('mining.start', (params) => {
            this.game.mining.startMining(params.id);
        });

        // Forge actions
        this.register('forge.craft', (params) => {
            this.game.forge.craft(params.id);
        });

        // Research actions
        this.register('research.unlock', (params) => {
            this.game.research.unlock(params.id);
        });

        // Chip actions
        this.register('chip.equip', (params) => {
            this.game.chips.equip(params.chipId, params.turretId);
        });

        this.register('chip.unequip', (params) => {
            this.game.chips.unequip(params.chipId);
        });

        // Town actions
        this.register('town.upgrade', (params) => {
            this.game.town.upgrade(params.id);
            this.game.renderTownUI();
        });

        // Talent actions
        this.register('talent.unlock', (params) => {
            this.game.talents.unlock(params.id);
        });

        // Relic actions
        this.register('relic.equip', (params) => {
            this.game.equipRelic(params.id);
        });

        this.register('relic.unequip', (params) => {
            this.game.unequipRelic(params.id);
        });

        // Daily quest actions
        this.register('quest.claim', (params) => {
            this.game.dailyQuests.claimReward(params.id);
        });

        // Prestige actions
        this.register('prestige.do', () => {
            this.game.prestige.doPrestige();
        });

        // Ascension actions
        this.register('ascension.do', () => {
            this.game.ascensionMgr.doAscension();
        });
    }

    /**
     * Register an action handler
     */
    register(action, handler) {
        this.actions.set(action, handler);
    }

    /**
     * Handle click events
     */
    handleClick(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        if (!action) return;

        const handler = this.actions.get(action);
        if (!handler) {
            console.warn(`EventDelegation: No handler for action "${action}"`);
            return;
        }

        // Parse parameters from data attributes
        const params = {};
        for (const [key, value] of Object.entries(target.dataset)) {
            if (key !== 'action') {
                params[key] = value;
            }
        }

        // Check if button is disabled
        if (target.disabled || target.classList.contains('cursor-not-allowed')) {
            return;
        }

        e.preventDefault();
        handler(params);
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this._boundClickHandler) {
            document.removeEventListener('click', this._boundClickHandler);
            this._boundClickHandler = null;
        }
        this.actions.clear();
    }
}

// Singleton instance
let eventDelegationInstance = null;

export function getEventDelegation(game) {
    if (!eventDelegationInstance) {
        eventDelegationInstance = new EventDelegationManager(game);
    }
    return eventDelegationInstance;
}

export function cleanupEventDelegation() {
    if (eventDelegationInstance) {
        eventDelegationInstance.cleanup();
        eventDelegationInstance = null;
    }
}
