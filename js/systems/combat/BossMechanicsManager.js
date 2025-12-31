/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { BOSS_MECHANICS, BOSS_ABILITIES } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';

export class BossMechanicsManager {
    constructor(game) {
        this.game = game;
        this.activeBoss = null;
        this.currentPhase = 0;
        this.abilityCooldowns = {};
        this.phaseTransitioning = false;
    }

    setBoss(enemy) {
        const mechanics = BOSS_MECHANICS[enemy.type];
        if (!mechanics) return;
        this.activeBoss = enemy;
        this.currentPhase = 0;
        this.abilityCooldowns = {};
        this.phaseTransitioning = false;
    }

    update(dt) {
        if (!this.activeBoss || this.activeBoss.hp <= 0) {
            this.activeBoss = null;
            return;
        }

        const mechanics = BOSS_MECHANICS[this.activeBoss.type];
        if (!mechanics) return;

        // Check phase transitions
        const hpPercent = this.activeBoss.hp / this.activeBoss.maxHp;
        for (let i = mechanics.phases.length - 1; i >= 0; i--) {
            if (hpPercent <= mechanics.phases[i].hpThreshold && i > this.currentPhase) {
                this.transitionToPhase(i);
                break;
            }
        }

        // Update ability cooldowns
        for (const ability in this.abilityCooldowns) {
            if (this.abilityCooldowns[ability] > 0) {
                this.abilityCooldowns[ability] -= dt / 1000;
            }
        }

        // Execute phase abilities
        this.executeAbilities(mechanics.phases[this.currentPhase], dt);
    }

    transitionToPhase(phaseIndex) {
        const mechanics = BOSS_MECHANICS[this.activeBoss.type];
        this.currentPhase = phaseIndex;
        this.phaseTransitioning = true;

        // Visual feedback
        this.game.visualEffects?.triggerScreenShake(10);
        this.game.floatingTexts.push(FloatingText.create(
            this.activeBoss.x, this.activeBoss.y - 50,
            t(mechanics.phases[phaseIndex].nameKey),
            mechanics.phases[phaseIndex].color, 28
        ));

        setTimeout(() => { this.phaseTransitioning = false; }, 1000);
    }

    executeAbilities(phase, dt) {
        if (!phase || this.phaseTransitioning) return;

        for (const abilityId of phase.abilities) {
            const ability = BOSS_ABILITIES[abilityId];
            if (!ability) continue;

            if (this.abilityCooldowns[abilityId] > 0) continue;

            // Execute ability
            switch (abilityId) {
                case 'summon_minions':
                case 'summon_elites':
                    for (let i = 0; i < ability.count; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const dist = 50 + Math.random() * 30;
                        const x = this.activeBoss.x + Math.cos(angle) * dist;
                        const y = this.activeBoss.y + Math.sin(angle) * dist;
                        this.game.spawnEnemy(ability.type, x, y);
                    }
                    this.abilityCooldowns[abilityId] = ability.cooldown;
                    break;

                case 'enrage':
                    this.activeBoss.enraged = true;
                    this.activeBoss.speedMult = (this.activeBoss.speedMult || 1) * ability.speedMult;
                    break;

                case 'heal':
                    this.activeBoss.hp = Math.min(this.activeBoss.maxHp,
                        this.activeBoss.hp + this.activeBoss.maxHp * ability.amount);
                    this.abilityCooldowns[abilityId] = ability.cooldown;
                    break;

                case 'barrier':
                    this.activeBoss.immune = true;
                    setTimeout(() => { if (this.activeBoss) this.activeBoss.immune = false; },
                        ability.immuneDuration * 1000);
                    this.abilityCooldowns[abilityId] = ability.cooldown;
                    break;
            }
        }
    }

    getCurrentPhaseColor() {
        if (!this.activeBoss) return null;
        const mechanics = BOSS_MECHANICS[this.activeBoss.type];
        return mechanics?.phases[this.currentPhase]?.color;
    }

    draw(ctx) {
        if (!this.activeBoss) return;
        const mechanics = BOSS_MECHANICS[this.activeBoss.type];
        if (!mechanics) return;

        // Draw phase indicator
        ctx.save();
        const phase = mechanics.phases[this.currentPhase];
        ctx.fillStyle = phase.color;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(t(phase.nameKey), this.activeBoss.x, this.activeBoss.y - 60);

        // Draw HP bar with phase markers
        const barWidth = 100;
        const barHeight = 8;
        const barX = this.activeBoss.x - barWidth / 2;
        const barY = this.activeBoss.y - 75;

        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const hpPercent = this.activeBoss.hp / this.activeBoss.maxHp;
        ctx.fillStyle = phase.color;
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

        // Phase markers
        for (const p of mechanics.phases) {
            if (p.hpThreshold < 1) {
                ctx.fillStyle = '#fff';
                ctx.fillRect(barX + barWidth * p.hpThreshold - 1, barY - 2, 2, barHeight + 4);
            }
        }
        ctx.restore();
    }

    getSaveData() { return {}; }
    loadSaveData(data) { }
}