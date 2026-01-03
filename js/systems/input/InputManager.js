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

        // AbortController for bulk cleanup of UI listeners
        this._uiAbortController = null;

        // Input state
        this.keys = {};
    }

    init() {
        window.addEventListener('resize', this._boundResize);
        window.addEventListener('keydown', this._boundKeydown);
        this.canvas.addEventListener('mousedown', this._boundMousedown);

        // Touch events for mobile support
        this._boundTouchstart = this.handleTouchstart.bind(this);
        this._boundTouchend = this.handleTouchend.bind(this);
        this.canvas.addEventListener('touchstart', this._boundTouchstart, { passive: false });
        this.canvas.addEventListener('touchend', this._boundTouchend, { passive: false });

        // Initialize UI listeners (checkboxes etc)
        this.initUIListeners();

        // Initial resize call
        this.handleResize();
    }

    cleanup() {
        window.removeEventListener('resize', this._boundResize);
        window.removeEventListener('keydown', this._boundKeydown);
        this.canvas.removeEventListener('mousedown', this._boundMousedown);
        this.canvas.removeEventListener('touchstart', this._boundTouchstart);
        this.canvas.removeEventListener('touchend', this._boundTouchend);

        // Cleanup all UI listeners via AbortController
        if (this._uiAbortController) {
            this._uiAbortController.abort();
            this._uiAbortController = null;
        }
    }

    initUIListeners() {
        // Cleanup previous listeners if re-initializing
        if (this._uiAbortController) {
            this._uiAbortController.abort();
        }
        this._uiAbortController = new AbortController();
        const signal = this._uiAbortController.signal;

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
                }, { signal });
            }
        });

        // Skill buttons with touch support
        const skillBindings = [
            { id: 'skill-overdrive', skill: SKILL.OVERDRIVE },
            { id: 'skill-nuke', skill: SKILL.NUKE },
            { id: 'skill-blackhole', skill: SKILL.BLACKHOLE }
        ];

        skillBindings.forEach(bind => {
            const btn = document.getElementById(bind.id);
            if (btn) {
                // Click event for desktop
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.game.activateSkill(bind.skill);
                }, { signal });
                // Touch event for mobile (faster response, no 300ms delay)
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.game.activateSkill(bind.skill);
                }, { passive: false, signal });
            }
        });

        // Global event delegation for data-action buttons
        this.initEventDelegation(signal);

        // Notation selector
        this.initNotationSelector(signal);

        // Cloud save modal
        this.initCloudModal(signal);
    }

    /**
     * Initialize event delegation for buttons with data-action attributes
     * This reduces the number of inline onclick handlers and improves performance
     */
    initEventDelegation(signal) {
        document.body.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const params = { ...target.dataset };
            delete params.action;

            // Handle common actions
            switch (action) {
                case 'setSpeed':
                    this.game.setSpeed(parseInt(params.speed, 10));
                    break;
                case 'togglePause':
                    this.game.togglePause();
                    break;
                case 'toggleSound':
                    this.game.sound.toggle();
                    break;
                case 'toggleStats':
                    this.game.statsBreakdown?.toggle();
                    break;
                case 'rushWave':
                    this.game.rushWave();
                    break;
                case 'openModal':
                    const modal = document.getElementById(params.modal);
                    if (modal) {
                        // Call render function if specified
                        if (params.render && this.game[params.render]) {
                            this.game[params.render]();
                        }
                        modal.classList.remove('hidden');
                    }
                    break;
                case 'closeModal':
                    const closeModal = e.target.closest('.modal-backdrop');
                    if (closeModal) {
                        closeModal.classList.add('hidden');
                    }
                    break;
                case 'toggleMenuGroup':
                    this.game.toggleMenuGroup(params.group);
                    break;
                case 'surrender':
                    if (this.game.canSurrender()) {
                        window.gameConfirm(this.game.t('surrender.confirm'), () => this.game.strategicSurrender());
                    }
                    break;
                default:
                    // Check if action is a game method
                    if (typeof this.game[action] === 'function') {
                        this.game[action]();
                    }
            }
        }, { signal });
    }

    initNotationSelector(signal) {
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
        }, { signal });
    }

    initCloudModal(signal) {
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
        }, { signal });

        // Handle cloud load (reusable)
        const handleCloudLoad = async () => {
            const result = await CloudSaveService.load();
            if (result.success && result.data) {
                try {
                    const saveData = JSON.parse(result.data);
                    this.game.loadSaveData?.(saveData);
                    showMessage(t('cloud.messages.loadSuccess'));
                    if (lastSyncEl) {
                        lastSyncEl.textContent = CloudSaveService.getLastSyncFormatted();
                    }
                    return true;
                } catch (e) {
                    showMessage(t('cloud.messages.loadFailed'), true);
                }
            }
            return false;
        };

        // Smart sync after login - check for conflicts
        const performSmartSync = async () => {
            showMessage(t('cloud.status.checking'));

            const localTimestamp = this.game.lastSaveTime || 0;
            const conflictState = await CloudSaveService.checkConflict(localTimestamp);

            if (conflictState === 'cloud_newer') {
                // Cloud is newer - ask user via confirm dialog with i18n text
                const msg = t('cloud.conflict.cloudNewer');
                if (confirm(msg)) {
                    await handleCloudLoad();
                }
            } else if (conflictState === 'local_newer') {
                // Local is newer - inform user
                this.game.ui?.showToast?.(t('cloud.status.localNewer'), 'info')
                    || showMessage(t('cloud.status.localNewer'));
            } else if (conflictState === 'no_cloud') {
                // No cloud save exists
                showMessage(t('cloud.messages.noCloudSave'));
            } else {
                // Synced
                this.game.ui?.showToast?.(t('cloud.status.synced'), 'success')
                    || showMessage(t('cloud.status.synced'));
            }

            // Refresh dashboard UI
            updateView();
        };

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

                // Perform smart sync after successful login
                await performSmartSync();
            } else {
                if (loginError) {
                    loginError.textContent = t('cloud.messages.loginFailed');
                    loginError.classList.remove('hidden');
                }
            }
        }, { signal });

        // Logout button
        btnLogout?.addEventListener('click', async () => {
            btnLogout.disabled = true;
            await CloudSaveService.logout();
            btnLogout.disabled = false;
            updateView();
        }, { signal });

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
        }, { signal });

        // Force Load button
        btnLoad?.addEventListener('click', async () => {
            btnLoad.disabled = true;
            const success = await handleCloudLoad();
            btnLoad.disabled = false;

            if (!success) {
                showMessage(t('cloud.messages.noCloudSave'), true);
            }
        }, { signal });

        // Initial button style
        updateButtonStyle();
    }

    handleResize() {
        // Cache container element for performance
        if (!this._gameContainer) {
            this._gameContainer = document.getElementById('game-container');
        }
        const container = this._gameContainer;
        if (!container) return;

        // High-DPI (Retina) scaling support
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = container.clientWidth;
        const displayHeight = container.clientHeight;

        // Set canvas internal resolution to match device pixels
        this.game.canvas.width = Math.floor(displayWidth * dpr);
        this.game.canvas.height = Math.floor(displayHeight * dpr);

        // Scale canvas back to CSS pixels for display
        this.game.canvas.style.width = displayWidth + 'px';
        this.game.canvas.style.height = displayHeight + 'px';

        // Scale context to handle high-DPI drawing
        this.game.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Store logical dimensions (CSS pixels) for game calculations
        this.game.width = displayWidth;
        this.game.height = displayHeight;
        this.game.dpr = dpr;
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

        this._processCanvasInteraction(clickX, clickY);
    }

    handleTouchstart(e) {
        // Prevent default to avoid 300ms delay and double-tap zoom
        e.preventDefault();

        // Store touch start position for tap detection
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this._touchStart = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now()
            };
        }
    }

    handleTouchend(e) {
        e.preventDefault();
        if (this.game.isPaused) return;

        // Only process if we have a valid touch start
        if (!this._touchStart) return;

        const touch = e.changedTouches[0];
        const rect = this.canvas.getBoundingClientRect();

        // Calculate movement to detect tap vs drag
        const dx = touch.clientX - this._touchStart.x;
        const dy = touch.clientY - this._touchStart.y;
        const timeDiff = Date.now() - this._touchStart.time;

        // Tap: small movement (<20px) and quick (<300ms)
        if (Math.abs(dx) < 20 && Math.abs(dy) < 20 && timeDiff < 300) {
            const tapX = touch.clientX - rect.left;
            const tapY = touch.clientY - rect.top;
            this._processCanvasInteraction(tapX, tapY);
        }

        this._touchStart = null;
    }

    _processCanvasInteraction(x, y) {
        // Touch devices get larger hit areas for better UX
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const slotRadius = isTouchDevice ? 40 : 25;
        const runeRadius = isTouchDevice ? 45 : 30;

        // 1. Turret Slots Interaction
        if (this.game.turretSlots) {
            for (const slot of this.game.turretSlots.slots) {
                const pos = this.game.turretSlots.getSlotPosition(slot.id);
                if (pos && MathUtils.dist(x, y, pos.x, pos.y) < slotRadius) {
                    this.game.handleSlotClick(slot);
                    return; // Stop propagation
                }
            }
        }

        // 2. Runes Interaction (Buffs)
        // Use filter to handle in-place removal
        this.game.runes = this.game.runes.filter(r => {
            if (MathUtils.dist(x, y, r.x, r.y) < runeRadius) {
                this.game.activateRune(r);
                return false; // Remove rune
            }
            return true;
        });
    }
}
