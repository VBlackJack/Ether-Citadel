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
 * Skill Manager - Handles player skills and cooldowns
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
        this._cachedElements = {};
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        for (const key in this.skills) {
            this._cachedElements[`skill-${key}`] = document.getElementById(`skill-${key}`);
            this._cachedElements[`cd-${key}`] = document.getElementById(`cd-${key}`);
        }
    }

    /**
     * Get cached element or query if not cached
     */
    getElement(id) {
        if (!this._cachedElements[id]) {
            this._cachedElements[id] = document.getElementById(id);
        }
        return this._cachedElements[id];
    }

    toggleAutoSkill(id) {
        this.autoSkills[id] = !this.autoSkills[id];
        this.updateAutoSkillUI();
    }

    updateAutoSkillUI() {
        for (let key in this.autoSkills) {
            const btn = document.getElementById(`auto-${key}`);
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
        const game = this.game;
        if (!game) return false;
        const hasRelicAutoSkill = game.relicMults?.autoSkill || false;
        const hasAutoQ = game.metaUpgrades?.getEffectValue?.('autoSkillQ') || false;
        const hasAutoW = game.metaUpgrades?.getEffectValue?.('autoSkillW') || false;
        const hasAutoE = game.metaUpgrades?.getEffectValue?.('autoSkillE') || false;
        return hasRelicAutoSkill || hasAutoQ || hasAutoW || hasAutoE;
    }

    activate(id) {
        const game = this.game;
        if (!game || game.isGameOver) return;
        const s = this.skills[id];
        const maxCd = s.cooldown * (1 - (game.relicMults?.cooldown || 0));
        if (s.cdTime <= 0) {
            s.activeTime = s.duration;
            s.cdTime = maxCd;
            if (id === 'nuke') {
                game.enemies.forEach(e => {
                    if (e.typeKey !== 'BOSS') e.takeDamage(e.maxHp * 20, false, false, true);
                    else e.takeDamage(game.currentDamage * 50, false, false, true);
                });
                document.body.classList.add('shake');
                setTimeout(() => document.body.classList.remove('shake'), 500);
            }
            if (game.dailyQuests) {
                game.dailyQuests.updateProgress('use_skills', 1);
            }
        }
    }

    isActive(id) {
        return this.skills[id].activeTime > 0;
    }

    update(dt) {
        const game = this.game;
        for (let key in this.skills) {
            const s = this.skills[key];
            const skillEl = this.getElement(`skill-${key}`);

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
                        setTimeout(() => skillEl.classList.remove('skill-ready-anim'), 500);
                    }
                }
            }
            const btn = this.getElement(`cd-${key}`);
            const maxCd = s.cooldown * (1 - (game.relicMults?.cooldown || 0));
            if (btn) {
                const cdPercent = Math.max(0, s.cdTime / maxCd) * 100;
                btn.style.height = `${cdPercent}%`;
                // Show cooldown percentage for better UX
                if (cdPercent > 0) {
                    const secondsLeft = Math.ceil(s.cdTime / 1000);
                    btn.dataset.cooldown = `${secondsLeft}s`;
                } else {
                    btn.dataset.cooldown = '';
                }
            }

            if (this.autoSkills[key] && s.cdTime <= 0 && game.enemies.length > 0 && !game.isGameOver) {
                const canAuto = (key === 'overdrive' && game.metaUpgrades?.getEffectValue?.('autoSkillQ')) ||
                               (key === 'nuke' && game.metaUpgrades?.getEffectValue?.('autoSkillW')) ||
                               (key === 'blackhole' && game.metaUpgrades?.getEffectValue?.('autoSkillE')) ||
                               (game.relicMults?.autoSkill || false);
                if (canAuto) {
                    this.activate(key);
                }
            }
        }
    }
}
