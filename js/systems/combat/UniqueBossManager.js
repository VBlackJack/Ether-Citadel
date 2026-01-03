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
 * UniqueBossManager - Handles unique boss encounters with distinct mechanics
 */

import { UNIQUE_BOSSES } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';
import { BigNumService } from '../../config.js';

export class UniqueBossManager {
    constructor(game) {
        this.game = game;
        this.activeBoss = null;
        this.currentPhase = 0;
        this.abilityCooldowns = {};
        this.defeatedBosses = [];
        this.bossWarningShown = false;
    }

    /**
     * Check if a unique boss should spawn at current wave
     */
    shouldSpawnBoss(wave) {
        for (const [key, boss] of Object.entries(UNIQUE_BOSSES)) {
            if (boss.wave === wave && !this.defeatedBosses.includes(key)) {
                return key;
            }
        }
        return null;
    }

    /**
     * Spawn a unique boss
     */
    spawnBoss(bossKey) {
        const bossData = UNIQUE_BOSSES[bossKey];
        if (!bossData) return null;

        this.activeBoss = {
            key: bossKey,
            data: bossData,
            hp: 0,
            maxHp: 0,
            phase: 0,
            x: this.game.width + 100,
            y: this.game.height / 2,
            targetX: this.game.width / 2 + 100,
            enraged: false
        };

        // Calculate HP based on wave and dread
        const baseHp = 1000 * bossData.hpMult;
        const waveMult = 1 + (this.game.wave * 0.1);
        const dreadMult = 1 + (this.game.dreadLevel || 0) * 0.5;
        this.activeBoss.maxHp = BigNumService.create(Math.floor(baseHp * waveMult * dreadMult));
        this.activeBoss.hp = BigNumService.create(this.activeBoss.maxHp);

        // Initialize ability cooldowns
        this.abilityCooldowns = {};
        for (const abilityKey of Object.keys(bossData.abilities || {})) {
            this.abilityCooldowns[abilityKey] = 0;
        }

        // Show boss intro
        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 3,
                `${bossData.icon} ${t(bossData.nameKey)}`,
                bossData.color,
                40
            ));
        }

        this.game.sound?.play('boss');
        return this.activeBoss;
    }

    /**
     * Show boss warning before spawn
     */
    showBossWarning(bossKey) {
        if (this.bossWarningShown) return;

        const bossData = UNIQUE_BOSSES[bossKey];
        if (!bossData) return;

        this.bossWarningShown = true;

        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `⚠️ ${t('bosses.warning')} ⚠️`,
                '#ef4444',
                32
            ));
        }

        // Reset warning after spawn
        setTimeout(() => {
            this.bossWarningShown = false;
        }, 5000);
    }

    /**
     * Update boss logic
     */
    update(dt) {
        if (!this.activeBoss) return;

        const boss = this.activeBoss;
        const data = boss.data;

        // Move boss to target position
        if (boss.x > boss.targetX) {
            boss.x -= data.speedMult * dt * 0.05;
        }

        // Update ability cooldowns
        for (const key of Object.keys(this.abilityCooldowns)) {
            if (this.abilityCooldowns[key] > 0) {
                this.abilityCooldowns[key] -= dt;
            }
        }

        // Check phase transitions
        this.updatePhase();

        // Execute abilities
        this.executeAbilities(dt);
    }

    /**
     * Update boss phase based on HP
     */
    updatePhase() {
        const boss = this.activeBoss;
        if (!boss) return;

        const hpPercent = BigNumService.toNumber(boss.hp) / BigNumService.toNumber(boss.maxHp);
        const phases = boss.data.phases;

        for (let i = phases.length - 1; i >= 0; i--) {
            if (hpPercent <= phases[i].hpThreshold && boss.phase < i) {
                boss.phase = i;

                // Phase transition effect
                if (this.game.floatingTexts) {
                    this.game.floatingTexts.push(FloatingText.create(
                        this.game.width / 2,
                        this.game.height / 2,
                        `${t('bosses.phase')} ${i + 1}`,
                        phases[i].color,
                        28
                    ));
                }

                // Screen shake on phase change
                document.body.classList.add('shake');
                setTimeout(() => document.body.classList.remove('shake'), 300);

                this.game.sound?.play('boss_phase');
                break;
            }
        }
    }

    /**
     * Execute boss abilities based on current phase
     */
    executeAbilities(dt) {
        const boss = this.activeBoss;
        if (!boss) return;

        const phase = boss.data.phases[boss.phase];
        if (!phase) return;

        for (const abilityKey of phase.abilities) {
            const ability = boss.data.abilities[abilityKey];
            if (!ability) continue;

            // Check cooldown
            if (this.abilityCooldowns[abilityKey] > 0) continue;

            // Execute ability
            this.executeAbility(abilityKey, ability);

            // Set cooldown
            this.abilityCooldowns[abilityKey] = ability.cooldown || 5000;
        }
    }

    /**
     * Execute a specific ability
     */
    executeAbility(key, ability) {
        const boss = this.activeBoss;
        if (!boss) return;

        switch (key) {
            case 'spin_attack':
                // Area damage around boss
                this.game.castle?.takeDamage(ability.damage);
                document.body.classList.add('shake');
                setTimeout(() => document.body.classList.remove('shake'), ability.duration / 2);
                break;

            case 'summon_goblins':
            case 'summon_drakes':
                // Spawn minions
                for (let i = 0; i < ability.count; i++) {
                    this.game.spawnEnemy?.(ability.type);
                }
                break;

            case 'crystal_shield':
            case 'crystal_prison':
                // Boss becomes immune
                boss.immune = true;
                setTimeout(() => {
                    if (this.activeBoss) this.activeBoss.immune = false;
                }, ability.immuneDuration || ability.duration);
                break;

            case 'shard_burst':
                // Projectile attack
                this.game.castle?.takeDamage(ability.damage * ability.count);
                break;

            case 'fire_breath':
            case 'void_orbs':
            case 'cosmic_beam':
                // Cone/beam damage
                this.game.castle?.takeDamage(ability.damage);
                break;

            case 'wing_gust':
            case 'gravity_well':
                // Push/pull effect (visual only for now)
                break;

            case 'meteor_rain':
            case 'star_collapse':
                // AoE damage with warning
                if (this.game.floatingTexts) {
                    this.game.floatingTexts.push(FloatingText.create(
                        this.game.width / 2,
                        this.game.height / 2,
                        '⚠️',
                        '#ef4444',
                        40
                    ));
                }
                setTimeout(() => {
                    this.game.castle?.takeDamage(ability.damage * (ability.count || 1));
                    document.body.classList.add('shake');
                    setTimeout(() => document.body.classList.remove('shake'), 500);
                }, ability.warningTime || 1000);
                break;

            case 'enrage':
                boss.enraged = true;
                break;

            case 'mind_control':
                // Disable some turrets temporarily
                const turretsToDisable = ability.disableTurrets || 2;
                // Implementation would disable random turrets
                break;

            case 'void_explosion':
            case 'dimensional_rift':
                // Major damage ability
                if (this.game.floatingTexts) {
                    this.game.floatingTexts.push(FloatingText.create(
                        boss.x,
                        boss.y,
                        '💥',
                        '#a855f7',
                        48
                    ));
                }
                setTimeout(() => {
                    this.game.castle?.takeDamage(ability.damage);
                }, ability.chargeTime || 1000);
                break;

            case 'time_stop':
                // Stop turrets temporarily
                this.game.timeStopActive = true;
                setTimeout(() => {
                    this.game.timeStopActive = false;
                }, ability.duration);
                break;

            case 'reality_warp':
                // Shuffle turrets (visual confusion)
                break;
        }

        // Show ability notification
        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                boss.x,
                boss.y - 50,
                t(`bossAbility.${key}`) || key,
                boss.data.color,
                20
            ));
        }
    }

    /**
     * Deal damage to boss
     */
    damageBoss(amount) {
        if (!this.activeBoss || this.activeBoss.immune) return 0;

        const boss = this.activeBoss;
        const damage = BigNumService.create(amount);

        boss.hp = BigNumService.sub(boss.hp, damage);

        // Check if defeated
        if (BigNumService.lte(boss.hp, 0)) {
            this.defeatBoss();
        }

        return BigNumService.toNumber(damage);
    }

    /**
     * Handle boss defeat
     */
    defeatBoss() {
        if (!this.activeBoss) return;

        const boss = this.activeBoss;
        const data = boss.data;

        // Add to defeated list
        this.defeatedBosses.push(boss.key);

        // Grant loot
        const loot = data.loot;
        if (loot.ether) {
            this.game.ether = BigNumService.add(this.game.ether, loot.ether);
            this.game.updateEtherUI?.();
        }
        if (loot.crystals) {
            this.game.crystals = BigNumService.add(this.game.crystals, loot.crystals);
            this.game.updateCrystalsUI?.();
        }
        if (loot.ascensionPoints && this.game.ascension) {
            this.game.ascension.points = BigNumService.add(
                this.game.ascension.points,
                loot.ascensionPoints
            );
        }
        if (loot.relicChance && Math.random() < loot.relicChance) {
            this.game.spawnRandomRelic?.(loot.relicTier || 2);
        }

        // Victory notification
        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${data.icon} ${t('bosses.defeated')}!`,
                '#22c55e',
                36
            ));
        }

        this.game.sound?.play('boss_defeat');
        this.activeBoss = null;
        this.game.save();
    }

    /**
     * Check if boss is active
     */
    isActive() {
        return this.activeBoss !== null;
    }

    /**
     * Get boss for rendering
     */
    getBossForRender() {
        if (!this.activeBoss) return null;

        const boss = this.activeBoss;
        return {
            x: boss.x,
            y: boss.y,
            scale: boss.data.scale,
            color: boss.data.phases[boss.phase]?.color || boss.data.color,
            hp: BigNumService.toNumber(boss.hp),
            maxHp: BigNumService.toNumber(boss.maxHp),
            icon: boss.data.icon,
            name: t(boss.data.nameKey),
            phase: boss.phase + 1,
            totalPhases: boss.data.phases.length,
            enraged: boss.enraged,
            immune: boss.immune
        };
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            defeatedBosses: [...this.defeatedBosses]
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;
        this.defeatedBosses = data.defeatedBosses || [];
    }
}
