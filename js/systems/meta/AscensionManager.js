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
 * AscensionManager - Handles ascension perks with BigNum support
 * Ascension is the "prestige of prestige" layer
 */

import { ASCENSION_PERKS } from '../../data.js';
import { t } from '../../i18n.js';
import { BigNumService, formatNumber } from '../../config.js';

export class AscensionManager {
    constructor(game) {
        this.game = game;
        this.ascensionPoints = BigNumService.create(0);
        this.totalAscensions = 0;
        this.perkLevels = {};

        // Initialize perk levels
        ASCENSION_PERKS.forEach(perk => {
            this.perkLevels[perk.id] = 0;
        });
    }

    /**
     * Check if player can ascend (requires 1000 ether)
     */
    canAscend() {
        const ether = this.game.ether || BigNumService.create(0);
        return BigNumService.gte(ether, 1000);
    }

    /**
     * Calculate ascension points gain from current ether
     * Formula: floor(sqrt(ether / 100))
     */
    getAscensionGain() {
        const ether = this.game.ether || BigNumService.create(0);
        return BigNumService.floor(BigNumService.sqrt(BigNumService.div(ether, 100)));
    }

    /**
     * Perform ascension - reset ether, gain AP
     */
    doAscend() {
        if (!this.canAscend()) return false;

        const gain = this.getAscensionGain();
        this.ascensionPoints = BigNumService.add(this.ascensionPoints, gain);
        this.totalAscensions++;
        this.game.statistics?.increment('totalAscensions');

        // Full reset including prestige
        this.game.ether = BigNumService.create(0);
        this.game.prestige?.fullReset();
        this.game.restart();
        this.game.save();

        return true;
    }

    /**
     * Get perk definition by ID
     */
    getPerk(perkId) {
        return ASCENSION_PERKS.find(p => p.id === perkId);
    }

    /**
     * Get current level of a perk
     */
    getPerkLevel(perkId) {
        return this.perkLevels[perkId] || 0;
    }

    /**
     * Calculate cost for next level of a perk
     * Formula: costBase * (costFactor ^ currentLevel)
     */
    getPerkCost(perkId) {
        const perk = this.getPerk(perkId);
        if (!perk) return BigNumService.create(Infinity);

        const level = this.getPerkLevel(perkId);
        const base = BigNumService.create(perk.costBase);
        const factor = BigNumService.create(perk.costFactor);

        return BigNumService.floor(BigNumService.mul(base, BigNumService.pow(factor, level)));
    }

    /**
     * Check if perk requirement is met
     */
    meetsRequirement(perkId) {
        const perk = this.getPerk(perkId);
        if (!perk) return false;
        if (!perk.req) return true;

        return this.getPerkLevel(perk.req) >= 1;
    }

    /**
     * Check if perk is at max level (0 = infinite)
     */
    isMaxed(perkId) {
        const perk = this.getPerk(perkId);
        if (!perk) return true;
        if (perk.maxLevel === 0) return false; // Infinite

        return this.getPerkLevel(perkId) >= perk.maxLevel;
    }

    /**
     * Check if player can afford a perk
     */
    canAfford(perkId) {
        if (!this.meetsRequirement(perkId)) return false;
        if (this.isMaxed(perkId)) return false;

        const cost = this.getPerkCost(perkId);
        return BigNumService.gte(this.ascensionPoints, cost);
    }

    /**
     * Purchase a perk level
     */
    purchasePerk(perkId) {
        if (!this.canAfford(perkId)) return false;

        const cost = this.getPerkCost(perkId);
        this.ascensionPoints = BigNumService.sub(this.ascensionPoints, cost);
        this.perkLevels[perkId] = (this.perkLevels[perkId] || 0) + 1;

        this.game.sound?.play('upgrade');
        this.game.save();

        return true;
    }

    /**
     * Get total effect value for a perk
     * Formula: level * effectBase
     */
    getPerkEffect(perkId) {
        const perk = this.getPerk(perkId);
        if (!perk) return 0;

        const level = this.getPerkLevel(perkId);
        return level * perk.effectBase;
    }

    /**
     * Get all active effects as an object
     */
    getTotalEffects() {
        const effects = {
            damage: 0,
            miningSpeed: 0,
            etherGain: 0,
            startWave: 0,
            critPower: 0,
            prestigeMult: 0,
            dreadResist: 0,
            skillPower: 0,
            offlineBonus: 0,
            consistencyBonus: 0
        };

        effects.damage = this.getPerkEffect('ap_starter_damage');
        effects.miningSpeed = this.getPerkEffect('ap_mining_speed');
        effects.etherGain = this.getPerkEffect('ap_ether_boost');
        effects.startWave = Math.floor(this.getPerkEffect('ap_start_wave'));
        effects.critPower = this.getPerkEffect('ap_crit_power');
        effects.prestigeMult = this.getPerkEffect('ap_prestige_mult');
        effects.dreadResist = this.getPerkEffect('ap_dread_resist');
        effects.skillPower = this.getPerkEffect('ap_skill_power');
        effects.offlineBonus = this.getPerkEffect('ap_offline_bonus');
        effects.consistencyBonus = this.getPerkEffect('ap_consistency_bonus');

        return effects;
    }

    /**
     * Check if player has at least 1 level in a perk
     */
    hasPerk(perkId) {
        return this.getPerkLevel(perkId) >= 1;
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            points: BigNumService.serialize(this.ascensionPoints),
            total: this.totalAscensions,
            levels: { ...this.perkLevels }
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;

        this.ascensionPoints = BigNumService.deserialize(data.points) || BigNumService.create(0);
        this.totalAscensions = data.total || 0;

        // Load perk levels
        if (data.levels) {
            Object.assign(this.perkLevels, data.levels);
        }

        // Legacy support: convert old purchasedPerks to levels
        if (data.perks && !data.levels) {
            for (const [perkId, purchased] of Object.entries(data.perks)) {
                if (purchased) {
                    this.perkLevels[perkId] = 1;
                }
            }
        }

        // Legacy support: convert old number points to BigNum
        if (typeof data.points === 'number') {
            this.ascensionPoints = BigNumService.create(data.points);
        }
    }

    // ============ UI Methods ============

    /**
     * Initialize UI elements and event listeners
     */
    initUI() {
        this.modal = document.getElementById('ascension-modal');
        this.treeContainer = document.getElementById('ascension-tree');
        this.pointsDisplay = document.getElementById('ascension-points-display');
        this.openBtn = document.getElementById('btn-open-ascension');

        if (this.openBtn) {
            this.openBtn.addEventListener('click', () => this.openModal());
        }

        // Show button if player has ascended at least once
        this.updateButtonVisibility();
    }

    /**
     * Show/hide the ascension button based on progress
     */
    updateButtonVisibility() {
        if (!this.openBtn) return;

        // Show if player has any AP or has ascended before
        const hasAP = BigNumService.gt(this.ascensionPoints, 0);
        const hasAscended = this.totalAscensions > 0;

        if (hasAP || hasAscended) {
            this.openBtn.classList.remove('hidden');
        }
    }

    /**
     * Open the ascension modal
     */
    openModal() {
        if (!this.modal) return;
        this.modal.classList.remove('hidden');
        this.renderTree();
        this.updateUI();
    }

    /**
     * Close the ascension modal
     */
    closeModal() {
        if (!this.modal) return;
        this.modal.classList.add('hidden');
    }

    /**
     * Render the perk tree
     */
    renderTree() {
        if (!this.treeContainer) return;

        this.treeContainer.innerHTML = '';

        ASCENSION_PERKS.forEach(perk => {
            const card = this.createPerkCard(perk);
            this.treeContainer.appendChild(card);
        });
    }

    /**
     * Create a perk card element
     */
    createPerkCard(perk) {
        const div = document.createElement('div');
        div.className = 'perk-card';
        div.dataset.perkId = perk.id;

        const level = this.getPerkLevel(perk.id);
        const cost = this.getPerkCost(perk.id);
        const isLocked = !this.meetsRequirement(perk.id);
        const isMaxed = this.isMaxed(perk.id);
        const canAfford = this.canAfford(perk.id);

        // Apply state classes
        if (isLocked) {
            div.classList.add('locked');
        } else if (isMaxed) {
            div.classList.add('maxed');
        } else if (canAfford) {
            div.classList.add('can-afford');
        } else {
            div.classList.add('unlocked');
        }

        // Build level text
        let levelText = `${t('ascension.level')} ${level}`;
        if (perk.maxLevel > 0) {
            levelText += ` / ${perk.maxLevel}`;
        }

        // Build cost text
        let costText = '';
        if (isMaxed) {
            costText = `<span class="text-green-400">${t('ascension.maxed')}</span>`;
        } else if (isLocked) {
            const reqPerk = this.getPerk(perk.req);
            costText = `<span class="perk-locked-msg">${t('ascension.locked')}</span>`;
            if (reqPerk) {
                costText += `<div class="perk-req">${t('ascension.requires')} ${t(reqPerk.nameKey + '.name')}</div>`;
            }
        } else {
            costText = `${formatNumber(cost)} AP`;
        }

        div.innerHTML = `
            <div class="perk-icon">${perk.icon}</div>
            <div class="perk-name">${t(perk.nameKey + '.name')}</div>
            <div class="perk-desc">${t(perk.descKey + '.desc')}</div>
            <div class="perk-level"><span class="perk-level-value">${levelText}</span></div>
            <div class="perk-cost">${costText}</div>
        `;

        // Add click handler
        if (!isLocked && !isMaxed) {
            div.addEventListener('click', () => {
                if (this.purchasePerk(perk.id)) {
                    this.renderTree();
                    this.updateUI();
                }
            });
        }

        return div;
    }

    /**
     * Update UI displays
     */
    updateUI() {
        if (this.pointsDisplay) {
            this.pointsDisplay.textContent = formatNumber(this.ascensionPoints);
        }

        this.updateButtonVisibility();
    }
}
