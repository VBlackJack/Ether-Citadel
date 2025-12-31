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
        for (let key in this.skills) {
            const s = this.skills[key];
            const skillEl = document.getElementById('skill-' + key);

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
            const btn = document.getElementById(`cd-${key}`);
            const maxCd = s.cooldown * (1 - (this.game.relicMults?.cooldown || 0));
            if (btn) btn.style.height = `${Math.max(0, s.cdTime / maxCd) * 100}%`;

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