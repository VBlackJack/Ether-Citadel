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
 * ResearchManager - Handles the research tree system
 * Players spend crystals to unlock permanent bonuses
 */

import { RESEARCH_TREE } from '../../data.js';

export class ResearchManager {
    /**
     * @param {object} game - Game instance reference
     */
    constructor(game) {
        this.game = game;
        this.purchased = {};
    }

    /**
     * Check if a research node can be purchased
     * @param {object} node - Research node
     * @returns {boolean}
     */
    canPurchase(node) {
        if (this.purchased[node.id]) return false;
        if (this.game.crystals < node.cost) return false;

        if (node.requires) {
            for (const reqId of node.requires) {
                if (!this.purchased[reqId]) return false;
            }
        }
        return true;
    }

    /**
     * Purchase a research node
     * @param {string} nodeId - Node ID
     * @returns {{ success: boolean, reason?: string }}
     */
    purchase(nodeId) {
        const node = this.findNode(nodeId);
        if (!node) return { success: false, reason: 'not_found' };
        if (!this.canPurchase(node)) return { success: false, reason: 'cannot_purchase' };

        this.game.crystals -= node.cost;
        this.purchased[nodeId] = true;

        this.applyEffects();
        this.game.updateCrystalsUI?.();
        this.game.updateStats?.();
        this.game.save();

        return { success: true };
    }

    /**
     * Find a research node by ID
     * @param {string} nodeId
     * @returns {object|null}
     */
    findNode(nodeId) {
        for (const branch of RESEARCH_TREE) {
            const node = branch.nodes.find(n => n.id === nodeId);
            if (node) return node;
        }
        return null;
    }

    /**
     * Apply all purchased research effects to game state
     */
    applyEffects() {
        this.game.researchEffects = {};
        for (const [nodeId, owned] of Object.entries(this.purchased)) {
            if (!owned) continue;
            const node = this.findNode(nodeId);
            if (node?.effect) {
                for (const [key, value] of Object.entries(node.effect)) {
                    this.game.researchEffects[key] = (this.game.researchEffects[key] || 0) + value;
                }
            }
        }
    }

    /**
     * Get total purchased count
     * @returns {number}
     */
    getPurchasedCount() {
        return Object.values(this.purchased).filter(Boolean).length;
    }

    /**
     * Get purchased count for a specific branch
     * @param {string} branchId
     * @returns {number}
     */
    getBranchProgress(branchId) {
        const branch = RESEARCH_TREE.find(b => b.id === branchId);
        if (!branch) return 0;
        return branch.nodes.filter(n => this.purchased[n.id]).length;
    }

    /**
     * Check if a branch is complete
     * @param {string} branchId
     * @returns {boolean}
     */
    isBranchComplete(branchId) {
        const branch = RESEARCH_TREE.find(b => b.id === branchId);
        if (!branch) return false;
        return branch.nodes.every(n => this.purchased[n.id]);
    }

    /**
     * Get save data
     * @returns {object}
     */
    getSaveData() {
        return this.purchased;
    }

    /**
     * Load save data
     * @param {object} data
     */
    loadSaveData(data) {
        this.purchased = data || {};
        this.applyEffects();
    }
}
