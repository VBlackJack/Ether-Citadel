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

/**
 * SkillManager - Handles active skills (Overdrive, Nuke, Blackhole)
 */

export class SkillManager {
    constructor(game) {
        this.game = game;
        this.skills = {
            overdrive: { duration: 5000, cooldown: 30000, activeTime: 0, cdTime: 0 },
            nuke: { duration: 0, cooldown: 60000, activeTime: 0, cdTime: 0 },
            blackhole: { duration: 4000, cooldown: 45000, activeTime: 0, cdTime: 0 }
        };
        this.autoSkills = {
            overdrive: false,
            nuke: false,
            blackhole: false
        };
        this.pendingTimers = [];
        // Cache DOM element references to avoid repeated lookups
        this._domCache = null;
    }

    /**
     * Initialize or refresh DOM element cache
     * Call this after DOM is ready or after dynamic UI changes
     */
    initDomCache() {
        this._domCache = {
            skillElements: {},
            cdElements: {},
            autoButtons: {}
        };
        for (const key of Object.keys(this.skills)) {
            this._domCache.skillElements[key] = document.getElementById('skill-' + key);
            this._domCache.cdElements[key] = document.getElementById('cd-' + key);
            this._domCache.autoButtons[key] = document.getElementById('auto-' + key);
        }
    }

    /**
     * Get cached DOM element, with lazy initialization
     * @param {string} type - 'skill', 'cd', or 'auto'
     * @param {string} key - skill key
     * @returns {HTMLElement|null}
     */
    _getElement(type, key) {
        if (!this._domCache) {
            this.initDomCache();
        }
        const cacheKey = type === 'skill' ? 'skillElements' : type === 'cd' ? 'cdElements' : 'autoButtons';
        let el = this._domCache[cacheKey][key];
        // Fallback if element not in cache (DOM may have changed)
        if (!el) {
            const id = type === 'skill' ? 'skill-' + key : type === 'cd' ? 'cd-' + key : 'auto-' + key;
            el = document.getElementById(id);
            this._domCache[cacheKey][key] = el;
        }
        return el;
    }

    /**
     * Clear all pending timers (call on game reset/cleanup)
     */
    cleanup() {
        this.pendingTimers.forEach(id => clearTimeout(id));
        this.pendingTimers = [];
    }

    toggleAutoSkill(id) {
        this.autoSkills[id] = !this.autoSkills[id];
        this.updateAutoSkillUI();
    }

    updateAutoSkillUI() {
        for (const key of Object.keys(this.autoSkills)) {
            const btn = this._getElement('auto', key);
            if (btn) {
                if (this.autoSkills[key]) {
                    btn.classList.add('bg-green-600');
                    btn.classList.remove('bg-slate-600');
                } else {
                    btn.classList.remove('bg-green-600');
                    btn.classList.add('bg-slate-600');
                }
            }
        }
    }

    canUseAutoSkill() {
        return this.game && (this.game.relicMults?.autoSkill || this.game.metaUpgrades?.getEffectValue('autoSkillQ') || this.game.metaUpgrades?.getEffectValue('autoSkillW') || this.game.metaUpgrades?.getEffectValue('autoSkillE'));
    }

    activate(id) {
        if (!this.game || this.game.isGameOver) return;
        const s = this.skills[id];
        const maxCd = s.cooldown * (1 - (this.game.relicMults?.cooldown || 0));
        if (s.cdTime <= 0) {
            s.activeTime = s.duration;
            s.cdTime = maxCd;
            if (id === 'nuke') {
                this.game.enemies.forEach(e => {
                    if (e.typeKey !== 'BOSS') e.takeDamage(e.maxHp * 20, false, false, true);
                    else e.takeDamage(this.game.currentDamage * 50, false, false, true);
                });
                document.body.classList.add('shake');
                const timerId = setTimeout(() => {
                    document.body.classList.remove('shake');
                    this.pendingTimers = this.pendingTimers.filter(id => id !== timerId);
                }, 500);
                this.pendingTimers.push(timerId);
            }
            if (this.game.dailyQuests) {
                this.game.dailyQuests.updateProgress('use_skills', 1);
            }
        }
    }

    isActive(id) {
        return this.skills[id].activeTime > 0;
    }

    update(dt) {
        for (const key of Object.keys(this.skills)) {
            const s = this.skills[key];
            const skillEl = this._getElement('skill', key);

            if (s.activeTime > 0) {
                s.activeTime -= dt;
                if (skillEl) skillEl.classList.add('skill-active');
            } else {
                if (skillEl) skillEl.classList.remove('skill-active');
            }

            if (s.cdTime > 0) {
                s.cdTime -= dt;
                if (s.cdTime <= 0) {
                    if (skillEl) {
                        skillEl.classList.add('skill-ready-anim');
                        const timerId = setTimeout(() => {
                            skillEl.classList.remove('skill-ready-anim');
                            this.pendingTimers = this.pendingTimers.filter(id => id !== timerId);
                        }, 500);
                        this.pendingTimers.push(timerId);
                    }
                }
            }
            const cdEl = this._getElement('cd', key);
            const maxCd = s.cooldown * (1 - (this.game.relicMults?.cooldown || 0));
            if (cdEl) {
                cdEl.style.height = `${Math.max(0, s.cdTime / maxCd) * 100}%`;
                // Show remaining cooldown time in seconds
                if (s.cdTime > 0) {
                    cdEl.setAttribute('data-cooldown', Math.ceil(s.cdTime / 1000) + 's');
                } else {
                    cdEl.removeAttribute('data-cooldown');
                }
            }

            // Update aria-label with cooldown state for accessibility
            if (skillEl) {
                const skillNames = { overdrive: 'Overdrive', nuke: 'Meteor', blackhole: 'Black Hole' };
                const hotkeys = { overdrive: 'Q', nuke: 'W', blackhole: 'E' };
                const baseName = skillNames[key] || key;
                const hotkey = hotkeys[key];

                if (s.cdTime > 0) {
                    const remainingSecs = Math.ceil(s.cdTime / 1000);
                    skillEl.setAttribute('aria-label', `${baseName} skill (Press ${hotkey}) - Cooldown: ${remainingSecs} seconds remaining`);
                    skillEl.setAttribute('aria-disabled', 'true');
                } else if (s.activeTime > 0) {
                    skillEl.setAttribute('aria-label', `${baseName} skill (Press ${hotkey}) - Active`);
                    skillEl.setAttribute('aria-disabled', 'true');
                } else {
                    skillEl.setAttribute('aria-label', `${baseName} skill (Press ${hotkey}) - Ready`);
                    skillEl.removeAttribute('aria-disabled');
                }
            }

            if (this.autoSkills[key] && s.cdTime <= 0 && this.game.enemies?.length > 0 && !this.game.isGameOver) {
                const canAuto = (key === 'overdrive' && this.game.metaUpgrades?.getEffectValue('autoSkillQ')) ||
                               (key === 'nuke' && this.game.metaUpgrades?.getEffectValue('autoSkillW')) ||
                               (key === 'blackhole' && this.game.metaUpgrades?.getEffectValue('autoSkillE')) ||
                               this.game.relicMults?.autoSkill;
                if (canAuto) {
                    this.activate(key);
                }
            }
        }
    }
}