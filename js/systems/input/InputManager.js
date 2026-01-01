/*
 * Copyright 2025 Julien Bombled
 * Input Manager - Handles all keyboard and mouse interactions
 */

import { SKILL } from '../../constants/skillIds.js';
import { MathUtils } from '../../config.js';

export class InputManager {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;

        // Bindings to keep 'this' context
        this._boundResize = this.handleResize.bind(this);
        this._boundKeydown = this.handleKeydown.bind(this);
        this._boundMousedown = this.handleMousedown.bind(this);

        // Input state
        this.keys = {};
    }

    init() {
        window.addEventListener('resize', this._boundResize);
        window.addEventListener('keydown', this._boundKeydown);
        this.canvas.addEventListener('mousedown', this._boundMousedown);

        // Initialize UI listeners (checkboxes etc)
        this.initUIListeners();

        // Initial resize call
        this.handleResize();
    }

    cleanup() {
        window.removeEventListener('resize', this._boundResize);
        window.removeEventListener('keydown', this._boundKeydown);
        this.canvas.removeEventListener('mousedown', this._boundMousedown);

        // Cleanup UI listeners if needed (optional for checkboxes usually)
    }

    initUIListeners() {
        const bindings = [
            { id: 'toggle-damage', prop: 'showDamageText', type: 'settings' },
            { id: 'toggle-range', prop: 'showRange', type: 'settings' },
            { id: 'toggle-buy', prop: 'autoBuyEnabled', type: 'game' }
        ];

        bindings.forEach(bind => {
            const el = document.getElementById(bind.id);
            if (el) {
                // Remove old listeners to be safe (cloning node is a quick hack, but simple addEventListener is fine here as we initialize once)
                el.addEventListener('change', (e) => {
                    if (bind.type === 'settings') {
                        this.game.settings[bind.prop] = e.target.checked;
                    } else {
                        this.game[bind.prop] = e.target.checked;
                    }
                });
            }
        });
    }

    handleResize() {
        const container = document.getElementById('game-container');
        if (!container) return;

        this.game.canvas.width = container.clientWidth;
        this.game.canvas.height = container.clientHeight;
        this.game.width = this.game.canvas.width;
        this.game.height = this.game.canvas.height;
    }

    handleKeydown(e) {
        const key = e.key.toLowerCase();

        // Skills (Mapped via SKILL constants)
        if (key === 'q') this.game.activateSkill(SKILL.OVERDRIVE);
        if (key === 'w') this.game.activateSkill(SKILL.NUKE);
        if (key === 'e') this.game.activateSkill(SKILL.BLACKHOLE);

        // Game Controls
        if (key === 'p') this.game.togglePause();

        // Speed Controls (1-6)
        if (['1', '2', '3', '4', '5', '6'].includes(key)) {
            const speedMap = { '1': 1, '2': 2, '3': 3, '4': 5, '5': 10, '6': 20 };
            this.game.setSpeed(speedMap[key]);
        }

        // Debug Panel
        if (e.key === 'F3') {
            e.preventDefault();
            this.game.toggleDebugPanel();
        }
    }

    handleMousedown(e) {
        if (this.game.isPaused) return;

        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // 1. Turret Slots Interaction
        if (this.game.turretSlots) {
            for (const slot of this.game.turretSlots.slots) {
                const pos = this.game.turretSlots.getSlotPosition(slot.id);
                if (pos && MathUtils.dist(clickX, clickY, pos.x, pos.y) < 25) {
                    this.game.handleSlotClick(slot);
                    return; // Stop propagation
                }
            }
        }

        // 2. Runes Interaction (Buffs)
        // Use filter to handle in-place removal
        this.game.runes = this.game.runes.filter(r => {
            if (MathUtils.dist(clickX, clickY, r.x, r.y) < 30) {
                this.game.activateRune(r);
                return false; // Remove rune
            }
            return true;
        });
    }
}
