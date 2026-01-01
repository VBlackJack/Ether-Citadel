/*
 * Copyright 2025 Julien Bombled
 * Input Manager - Handles all keyboard and mouse interactions
 */

import { SKILL } from '../../constants/skillIds.js';
import { MathUtils } from '../../config.js';
import { NOTATIONS, BigNumService } from '../../services/BigNumService.js';
import { CloudSaveService } from '../../services/CloudSaveService.js';
import { t } from '../../i18n.js';

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
        // Toggle checkboxes
        const toggleBindings = [
            { id: 'toggle-damage', prop: 'showDamageText', type: 'settings' },
            { id: 'toggle-range', prop: 'showRange', type: 'settings' },
            { id: 'toggle-buy', prop: 'autoBuyEnabled', type: 'game' }
        ];

        toggleBindings.forEach(bind => {
            const el = document.getElementById(bind.id);
            if (el) {
                el.addEventListener('change', (e) => {
                    if (bind.type === 'settings') {
                        this.game.settings[bind.prop] = e.target.checked;
                    } else {
                        this.game[bind.prop] = e.target.checked;
                    }
                });
            }
        });

        // Skill buttons
        const skillBindings = [
            { id: 'skill-overdrive', skill: SKILL.OVERDRIVE },
            { id: 'skill-nuke', skill: SKILL.NUKE },
            { id: 'skill-blackhole', skill: SKILL.BLACKHOLE }
        ];

        skillBindings.forEach(bind => {
            const btn = document.getElementById(bind.id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.game.activateSkill(bind.skill);
                });
            }
        });

        // Notation selector
        this.initNotationSelector();

        // Cloud save modal
        this.initCloudModal();
    }

    initNotationSelector() {
        const notationSelect = document.getElementById('setting-notation');
        if (!notationSelect) return;

        // Clear and populate options
        notationSelect.innerHTML = '';
        const options = [NOTATIONS.STANDARD, NOTATIONS.SCIENTIFIC, NOTATIONS.ENGINEERING, NOTATIONS.LETTERS];

        options.forEach(type => {
            const opt = document.createElement('option');
            opt.value = type;
            opt.textContent = t(`settings.notation.${type}`);
            notationSelect.appendChild(opt);
        });

        // Set initial value from current setting
        notationSelect.value = BigNumService.getNotation();

        // Bind change event
        notationSelect.addEventListener('change', (e) => {
            const newVal = e.target.value;
            BigNumService.setNotation(newVal);

            // Update game settings and save
            if (this.game?.settings) {
                this.game.settings.notation = newVal;
                this.game.save();
            }

            // Force UI refresh to show new format
            this.game.updateGoldUI?.();
            this.game.updateEtherUI?.();
            this.game.updateCrystalsUI?.();
        });
    }

    initCloudModal() {
        const btnCloud = document.getElementById('btn-cloud');
        const modal = document.getElementById('modal-cloud');
        const loginView = document.getElementById('cloud-login-view');
        const dashboardView = document.getElementById('cloud-dashboard-view');
        const btnLogin = document.getElementById('cloud-btn-login');
        const btnLogout = document.getElementById('cloud-btn-logout');
        const btnSave = document.getElementById('cloud-btn-save');
        const btnLoad = document.getElementById('cloud-btn-load');
        const usernameInput = document.getElementById('cloud-username');
        const passwordInput = document.getElementById('cloud-password');
        const loginError = document.getElementById('cloud-login-error');
        const statusText = document.getElementById('cloud-status-text');
        const lastSyncEl = document.getElementById('cloud-last-sync');
        const messageEl = document.getElementById('cloud-message');

        if (!btnCloud || !modal) return;

        // Update cloud button style based on login state
        const updateButtonStyle = () => {
            if (CloudSaveService.isLoggedIn) {
                btnCloud.classList.add('cloud-logged-in');
            } else {
                btnCloud.classList.remove('cloud-logged-in');
            }
        };

        // Switch between login and dashboard views
        const updateView = () => {
            if (CloudSaveService.isLoggedIn) {
                loginView?.classList.add('hidden');
                dashboardView?.classList.remove('hidden');
                if (statusText) {
                    statusText.textContent = t('cloud.status.online').replace('{name}', CloudSaveService.username);
                }
                if (lastSyncEl) {
                    lastSyncEl.textContent = CloudSaveService.getLastSyncFormatted();
                }
            } else {
                loginView?.classList.remove('hidden');
                dashboardView?.classList.add('hidden');
            }
            updateButtonStyle();
        };

        // Show temporary message
        const showMessage = (msg, isError = false) => {
            if (!messageEl) return;
            messageEl.textContent = msg;
            messageEl.className = isError ? 'cloud-error' : 'cloud-success';
            messageEl.classList.remove('hidden');
            setTimeout(() => messageEl.classList.add('hidden'), 3000);
        };

        // Open modal
        btnCloud.addEventListener('click', () => {
            modal.classList.remove('hidden');
            updateView();
            if (loginError) loginError.classList.add('hidden');
        });

        // Login button
        btnLogin?.addEventListener('click', async () => {
            const username = usernameInput?.value?.trim() || '';
            const password = passwordInput?.value || '';

            btnLogin.disabled = true;
            btnLogin.textContent = '...';

            const result = await CloudSaveService.login(username, password);

            btnLogin.disabled = false;
            btnLogin.textContent = t('cloud.login');

            if (result.success) {
                if (usernameInput) usernameInput.value = '';
                if (passwordInput) passwordInput.value = '';
                updateView();
            } else {
                if (loginError) {
                    loginError.textContent = t('cloud.messages.loginFailed');
                    loginError.classList.remove('hidden');
                }
            }
        });

        // Logout button
        btnLogout?.addEventListener('click', async () => {
            btnLogout.disabled = true;
            await CloudSaveService.logout();
            btnLogout.disabled = false;
            updateView();
        });

        // Force Save button
        btnSave?.addEventListener('click', async () => {
            btnSave.disabled = true;
            const saveData = this.game.getSaveDataString?.() || JSON.stringify(this.game.getSaveData?.() || {});
            const result = await CloudSaveService.save(saveData);
            btnSave.disabled = false;

            if (result.success) {
                showMessage(t('cloud.messages.saveSuccess'));
                if (lastSyncEl) {
                    lastSyncEl.textContent = CloudSaveService.getLastSyncFormatted();
                }
            } else {
                showMessage(t('cloud.messages.saveFailed'), true);
            }
        });

        // Force Load button
        btnLoad?.addEventListener('click', async () => {
            btnLoad.disabled = true;
            const result = await CloudSaveService.load();
            btnLoad.disabled = false;

            if (result.success && result.data) {
                try {
                    const saveData = JSON.parse(result.data);
                    this.game.loadSaveData?.(saveData);
                    showMessage(t('cloud.messages.loadSuccess'));
                    if (lastSyncEl) {
                        lastSyncEl.textContent = CloudSaveService.getLastSyncFormatted();
                    }
                } catch (e) {
                    showMessage(t('cloud.messages.loadFailed'), true);
                }
            } else {
                showMessage(result.error === 'no_cloud_save'
                    ? t('cloud.messages.noCloudSave')
                    : t('cloud.messages.loadFailed'), true);
            }
        });

        // Initial button style
        updateButtonStyle();
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
