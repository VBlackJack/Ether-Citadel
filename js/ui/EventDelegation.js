/*
 * Copyright 2025 Julien Bombled
 * Event Delegation System
 */

import { logError, ErrorSeverity } from '../utils/ErrorHandler.js';

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
        this._boundKeydownHandler = null;
        this.init();
    }

    init() {
        this.registerDefaultActions();
        this._boundClickHandler = (e) => this.handleClick(e);
        this._boundKeydownHandler = (e) => this.handleKeydown(e);
        this._boundModalBackdropHandler = (e) => this.handleModalBackdropClick(e);
        document.addEventListener('click', this._boundClickHandler);
        document.addEventListener('keydown', this._boundKeydownHandler);
        // Handle modal backdrop clicks (close on outside click)
        document.addEventListener('click', this._boundModalBackdropHandler);
    }

    /**
     * Handle Enter key on data-action elements for keyboard accessibility
     */
    handleKeydown(e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;

        const target = e.target;
        const actionEl = target.closest('[data-action]');

        if (actionEl && !actionEl.disabled) {
            // Prevent space from scrolling
            if (e.key === ' ') e.preventDefault();
            // Trigger the same handler as click
            this.handleClick({ target: actionEl, preventDefault: () => {} });
        }
    }

    /**
     * Register all default UI actions
     */
    registerDefaultActions() {
        // Modal actions - generic open/close
        this.register('modal.open', (params) => {
            const modal = document.getElementById(params.id);
            if (modal) {
                modal.classList.remove('hidden');
                // Call optional render function
                if (params.render && this.game[params.render]) {
                    this.game[params.render]();
                }
            }
        });

        this.register('modal.close', (params) => {
            const modal = document.getElementById(params.id);
            if (modal) modal.classList.add('hidden');
        });

        this.register('modal.toggle', (params) => {
            const modal = document.getElementById(params.id);
            if (modal) modal.classList.toggle('hidden');
        });

        // Menu group toggle
        this.register('menu.toggle', (params) => {
            this.game.toggleMenuGroup(params.group);
        });

        // Tutorial actions
        this.register('tutorial.next', () => {
            this.game.tutorial?.next();
        });

        this.register('tutorial.skip', () => {
            this.game.tutorial?.skip();
        });

        // Sound toggle
        this.register('sound.toggle', () => {
            this.game.sound?.toggle();
        });

        // Speed control
        this.register('speed.cycle', () => {
            this.game.cycleSpeed?.();
        });

        // Pause toggle
        this.register('togglePause', () => {
            this.game.togglePause?.();
        });

        // Hold wave toggle
        this.register('toggleHoldWave', () => {
            this.game.toggleHoldWave?.();
        });

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

        this.register('turretSlot.upgrade', (params) => {
            const slotId = safeParseInt(params.slot);
            const stat = params.stat;
            if (this.game.turretSlots.upgradeSlot(slotId, stat)) {
                this.game.renderTurretUpgradeUI(slotId);
            }
        });

        this.register('turretSlot.openUpgrade', (params) => {
            const slotId = safeParseInt(params.id);
            this.game.renderTurretUpgradeUI(slotId);
            const modal = document.getElementById('turret-upgrade-modal');
            if (modal) modal.classList.remove('hidden');
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

        // Stats actions (Defender Idle 2 style)
        this.register('stat.upgrade', (params) => {
            this.game.upgradeStat(params.id);
        });

        // Passive actions (Defender Idle 2 style)
        this.register('passive.upgrade', (params) => {
            if (this.game.passives.buy(params.id)) {
                this.game.renderLabPassivesUI();
            }
        });

        // Speed control (with specific speed value)
        this.register('speed.set', (params) => {
            this.game.setSpeed(safeParseInt(params.value, 1));
        });

        // Lab tab switching
        this.register('lab.switchTab', (params) => {
            this.game.switchLabTab(params.tab);
        });

        this.register('lab.switchUpgradeTab', (params) => {
            this.game.switchTab(safeParseInt(params.tab));
        });

        this.register('lab.switchPassiveTab', (params) => {
            this.game.switchLabPassiveTab(params.tab);
        });

        this.register('lab.selectTech', (params) => {
            this.game.selectTechSpecial(params.id);
        });

        this.register('lab.toggleBulk', () => {
            this.game.toggleBulk();
        });

        this.register('lab.refundPassives', () => {
            this.game.passives?.refundAll();
            this.game.renderLabPassivesUI();
        });

        // Goals and suggestions
        this.register('goal.dismiss', () => {
            this.game.goals?.dismissCurrent();
        });

        this.register('suggestion.dismiss', () => {
            this.game.dismissSuggestion?.();
        });

        // Settings actions
        this.register('settings.export', () => {
            this.game.exportSave();
        });

        this.register('settings.confirmReset', () => {
            this.game.confirmReset();
        });

        this.register('settings.restartTutorial', () => {
            this.game.tutorial?.reset();
            this.game.save();
            this.game.tutorial?.check();
            const modal = document.getElementById('settings-modal');
            if (modal) modal.classList.add('hidden');
        });

        // Import modal
        this.register('import.confirm', () => {
            this.game.importSaveFromModal();
        });

        // Game over
        this.register('game.restart', () => {
            this.game.manualRestart();
        });

        // Feature intro
        this.register('feature.closeIntro', () => {
            this.game.closeFeatureIntro();
        });

        // Offline modal
        this.register('offline.collect', () => {
            // Just close the modal - rewards already calculated
        });

        // Challenge cancel
        this.register('challenge.cancel', () => {
            this.game.challenges.cancelChallenge();
        });

        // Prestige confirm
        this.register('prestige.confirm', () => {
            if (this.game.prestige.canPrestige()) {
                this.game.gameConfirm(this.game.t('prestige.confirmReset'), () => this.game.prestige.doPrestige());
            }
        });

        // Dev secret trigger
        this.register('dev.triggerSecret', () => {
            this.game.triggerDevSecret();
        });

        // Awakening
        this.register('awakening.activate', () => {
            this.game.awakening.awaken();
            this.game.renderAwakeningUI();
        });
    }

    /**
     * Handle modal backdrop clicks (close on outside click)
     */
    handleModalBackdropClick(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            e.target.classList.add('hidden');
        }
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
            logError(`No handler for action "${action}"`, 'EventDelegation.handleClick', ErrorSeverity.WARNING);
            return;
        }

        // Parse parameters from data attributes
        const params = {};
        for (const [key, value] of Object.entries(target.dataset)) {
            if (key !== 'action') {
                params[key] = value;
            }
        }

        // Check if button is disabled (only check disabled attribute, not CSS classes)
        if (target.disabled) {
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
        if (this._boundKeydownHandler) {
            document.removeEventListener('keydown', this._boundKeydownHandler);
            this._boundKeydownHandler = null;
        }
        if (this._boundModalBackdropHandler) {
            document.removeEventListener('click', this._boundModalBackdropHandler);
            this._boundModalBackdropHandler = null;
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
