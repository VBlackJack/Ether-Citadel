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
 * ForgeManager - Handles relic crafting, upgrading, and fusion
 * Uses mining resources to enhance relics
 */

import { FORGE_RECIPES, RELIC_DB } from '../../data.js';
import { t } from '../../i18n.js';

export class ForgeManager {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
        // Build Map for O(1) RELIC_DB lookups
        this._relicMap = new Map();
        for (const r of RELIC_DB) {
            this._relicMap.set(r.id, r);
        }
    }

    /**
     * Get relic by ID - O(1) lookup
     * @param {string} id
     * @returns {object|undefined}
     */
    getRelicById(id) {
        return this._relicMap.get(id);
    }

    /**
     * Check if player can afford a recipe
     * @param {object} recipe - Recipe object
     * @returns {boolean}
     */
    canAfford(recipe) {
        for (const [resource, amount] of Object.entries(recipe.cost)) {
            if ((this.game.miningResources?.[resource] || 0) < amount) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get recipe by ID
     * @param {string} recipeId
     * @returns {object|null}
     */
    getRecipe(recipeId) {
        return FORGE_RECIPES.find(r => r.id === recipeId) || null;
    }

    /**
     * Execute a forge recipe
     * @param {string} recipeId - Recipe ID
     * @param {string|null} relicId - Optional relic ID for upgrade/reroll
     * @returns {{ success: boolean, reason?: string, result?: object }}
     */
    execute(recipeId, relicId = null) {
        const recipe = this.getRecipe(recipeId);
        if (!recipe) {
            return { success: false, reason: 'not_found' };
        }

        if (!this.canAfford(recipe)) {
            return { success: false, reason: 'cost' };
        }

        // Deduct resources
        for (const [resource, amount] of Object.entries(recipe.cost)) {
            this.game.miningResources[resource] -= amount;
        }

        // Calculate success chance with research bonus
        const bonusRate = this.game.researchEffects?.forgeSuccess || 0;
        const finalRate = Math.min(1, recipe.successRate + bonusRate);

        if (Math.random() < finalRate) {
            return this.applyRecipe(recipe, relicId);
        } else {
            this.game.save?.();
            return { success: false, reason: 'failed' };
        }
    }

    /**
     * Apply recipe effect
     * @param {object} recipe
     * @param {string|null} relicId
     * @returns {{ success: boolean, reason?: string, result?: object }}
     */
    applyRecipe(recipe, relicId) {
        let result;

        switch (recipe.type) {
            case 'upgrade':
                result = this.upgradeRelic(relicId);
                break;
            case 'reroll':
                result = this.rerollRelic(relicId);
                break;
            case 'fuse':
                result = this.fuseRelics();
                break;
            case 'legendary':
                result = this.forgeLegendary();
                break;
            default:
                result = { success: false, reason: 'unknown_type' };
        }

        if (result.success) {
            this.game.recalcRelicBonuses?.();
            this.game.updateStats?.();
            this.game.renderRelicGrid?.();
            this.game.save?.();
        }

        return result;
    }

    /**
     * Upgrade a relic to higher tier
     * @param {string} relicId
     * @returns {{ success: boolean, reason?: string, result?: object }}
     */
    upgradeRelic(relicId) {
        if (!this.game.relics) {
            return { success: false, reason: 'no_relics' };
        }

        const relicIdx = this.game.relics.indexOf(relicId);
        if (relicIdx === -1) {
            return { success: false, reason: 'not_found' };
        }

        const relic = this.getRelicById(relicId);
        if (!relic) {
            return { success: false, reason: 'not_found' };
        }

        if (relic.tier >= 4) {
            return { success: false, reason: 'max_tier' };
        }

        const higherTierRelics = RELIC_DB.filter(r => r.tier === relic.tier + 1);
        if (higherTierRelics.length === 0) {
            return { success: false, reason: 'no_upgrade' };
        }

        const upgraded = higherTierRelics[Math.floor(Math.random() * higherTierRelics.length)];
        this.game.relics[relicIdx] = upgraded.id;

        return { success: true, result: upgraded };
    }

    /**
     * Reroll a relic to another of the same tier
     * @param {string} relicId
     * @returns {{ success: boolean, reason?: string, result?: object }}
     */
    rerollRelic(relicId) {
        if (!this.game.relics) {
            return { success: false, reason: 'no_relics' };
        }

        const relicIdx = this.game.relics.indexOf(relicId);
        if (relicIdx === -1) {
            return { success: false, reason: 'not_found' };
        }

        const oldRelic = this.getRelicById(relicId);
        if (!oldRelic) {
            return { success: false, reason: 'not_found' };
        }

        const sameTier = RELIC_DB.filter(r => r.tier === oldRelic.tier && r.id !== oldRelic.id);
        if (sameTier.length === 0) {
            return { success: false, reason: 'no_options' };
        }

        const newRelic = sameTier[Math.floor(Math.random() * sameTier.length)];
        this.game.relics[relicIdx] = newRelic.id;

        return { success: true, result: newRelic };
    }

    /**
     * Fuse two relics into one higher tier
     * @returns {{ success: boolean, reason?: string, result?: object }}
     */
    fuseRelics() {
        if (!this.game.relics || this.game.relics.length < 2) {
            return { success: false, reason: 'not_enough_relics' };
        }

        const relicObjects = this.game.relics
            .map(id => this.getRelicById(id))
            .filter(Boolean);

        const maxTier = Math.max(...relicObjects.map(r => r.tier));
        const targetTier = Math.min(4, maxTier + 1);

        const higherTier = RELIC_DB.filter(r => r.tier === targetTier);
        if (higherTier.length === 0) {
            return { success: false, reason: 'no_higher_tier' };
        }

        // Remove first two relics
        this.game.relics.splice(0, 2);

        const result = higherTier[Math.floor(Math.random() * higherTier.length)];
        this.game.relics.push(result.id);

        return { success: true, result };
    }

    /**
     * Forge a random legendary relic
     * @returns {{ success: boolean, reason?: string, result?: object }}
     */
    forgeLegendary() {
        const legendaries = RELIC_DB.filter(r => r.tier === 4);
        if (legendaries.length === 0) {
            return { success: false, reason: 'no_legendaries' };
        }

        const result = legendaries[Math.floor(Math.random() * legendaries.length)];

        if (!this.game.relics) {
            this.game.relics = [];
        }
        this.game.relics.push(result.id);

        return { success: true, result };
    }

    /**
     * Get available recipes with affordability info
     * @returns {Array}
     */
    getAvailableRecipes() {
        return FORGE_RECIPES.map(recipe => ({
            ...recipe,
            canAfford: this.canAfford(recipe),
            nameKey: `forge.${recipe.id}.name`,
            descKey: `forge.${recipe.id}.desc`
        }));
    }

    /**
     * Render forge UI
     */
    render() {
        const container = document.getElementById('forge-recipes');
        if (!container) return;

        container.innerHTML = '';

        const recipes = this.getAvailableRecipes();

        recipes.forEach(recipe => {
            const div = document.createElement('div');
            div.className = `forge-recipe p-3 rounded-lg border-2 transition-all ${
                recipe.canAfford
                    ? 'bg-amber-900/30 border-amber-500 hover:bg-amber-800/40 cursor-pointer'
                    : 'bg-slate-800 border-slate-600 opacity-50'
            }`;

            if (recipe.canAfford) {
                div.onclick = () => this.showRecipeDialog(recipe);
            }

            const costHtml = Object.entries(recipe.cost)
                .map(([res, amt]) => `${amt} ${t(`mining.${res}.name`) || res}`)
                .join(', ');

            div.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">${recipe.icon || '🔨'}</span>
                    <div>
                        <div class="font-bold text-white">${t(recipe.nameKey) || recipe.id}</div>
                        <div class="text-xs text-amber-300">${t(recipe.descKey) || ''}</div>
                    </div>
                </div>
                <div class="text-xs text-slate-400">
                    ${t('forge.cost') || 'Cost'}: ${costHtml}
                </div>
                <div class="text-xs text-slate-500 mt-1">
                    ${Math.round(recipe.successRate * 100)}% ${t('forge.success') || 'success rate'}
                </div>
            `;

            container.appendChild(div);
        });
    }

    /**
     * Show recipe dialog for relic selection
     * @param {object} recipe
     */
    showRecipeDialog(recipe) {
        if (recipe.type === 'upgrade' || recipe.type === 'reroll') {
            // Need relic selection
            this.showRelicSelectionDialog(recipe);
        } else {
            // Direct execution
            const result = this.execute(recipe.id);
            this.handleResult(result);
        }
    }

    /**
     * Show relic selection dialog
     * @param {object} recipe
     */
    showRelicSelectionDialog(recipe) {
        // Simple implementation - use first available relic
        if (this.game.relics && this.game.relics.length > 0) {
            const result = this.execute(recipe.id, this.game.relics[0]);
            this.handleResult(result);
        } else {
            this.game.ui?.showToast?.(t('forge.notEnough') || 'No relics available', 'warning');
        }
    }

    /**
     * Handle forge result
     * @param {{ success: boolean, reason?: string, result?: object }} result
     */
    handleResult(result) {
        if (result.success) {
            this.game.ui?.showToast?.(
                `${t('forge.success') || 'Success!'} ${result.result?.icon || ''} ${t(result.result?.nameKey) || ''}`,
                'success'
            );
        } else {
            const reasonMap = {
                'cost': t('forge.notEnough') || 'Not enough resources',
                'failed': t('forge.failed') || 'Forge failed!',
                'not_found': t('forge.notFound') || 'Not found',
                'max_tier': t('forge.maxTier') || 'Already max tier',
                'not_enough_relics': t('forge.needRelics') || 'Need at least 2 relics'
            };
            this.game.ui?.showToast?.(reasonMap[result.reason] || 'Failed', 'error');
        }

        this.render();
    }
}
