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
 * SkillCardManager - Handles collectible skill card system
 */

import { SKILL_CARDS, CARD_RARITIES, CARD_PACKS } from '../../data.js';
import { BigNumService } from '../../config.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';

export class SkillCardManager {
    constructor(game) {
        this.game = game;
        this.collection = {};
        this.equipped = [];
        this.maxEquipped = 5;
        this.dust = 0;

        // Initialize collection
        for (const card of SKILL_CARDS) {
            this.collection[card.id] = 0;
        }
    }

    /**
     * Open a card pack
     */
    openPack(packId) {
        const pack = CARD_PACKS.find(p => p.id === packId);
        if (!pack) return null;

        // Check cost
        if (pack.cost.crystals && BigNumService.lt(this.game.crystals, pack.cost.crystals)) {
            return { success: false, reason: 'notEnoughCrystals' };
        }
        if (pack.cost.ether && BigNumService.lt(this.game.ether, pack.cost.ether)) {
            return { success: false, reason: 'notEnoughEther' };
        }

        // Deduct cost
        if (pack.cost.crystals) this.game.crystals = BigNumService.sub(this.game.crystals, pack.cost.crystals);
        if (pack.cost.ether) this.game.ether = BigNumService.sub(this.game.ether, pack.cost.ether);

        // Generate cards
        const cards = [];
        for (let i = 0; i < pack.cards; i++) {
            // Guarantee one card of specific rarity if applicable
            const guaranteedRarity = (i === 0 && pack.guaranteedRarity) ?
                pack.guaranteedRarity : null;
            const card = this.rollCard(guaranteedRarity);
            cards.push(card);
            this.addCard(card.id);
        }

        this.game.sound?.play('chest');
        this.game.save();

        return { success: true, cards };
    }

    /**
     * Roll a random card
     */
    rollCard(guaranteedRarity = null) {
        let rarity;

        if (guaranteedRarity) {
            rarity = guaranteedRarity;
        } else {
            // Roll for rarity
            const totalWeight = Object.values(CARD_RARITIES)
                .reduce((sum, r) => sum + r.weight, 0);
            let roll = Math.random() * totalWeight;

            for (const [rarityName, rarityData] of Object.entries(CARD_RARITIES)) {
                roll -= rarityData.weight;
                if (roll <= 0) {
                    rarity = rarityName;
                    break;
                }
            }
        }

        // Get cards of this rarity
        const cardsOfRarity = SKILL_CARDS.filter(c => c.rarity === rarity);
        const card = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];

        return {
            ...card,
            name: t(card.nameKey),
            desc: t(card.descKey)
        };
    }

    /**
     * Add a card to collection
     */
    addCard(cardId) {
        if (this.collection[cardId] === undefined) {
            this.collection[cardId] = 0;
        }
        this.collection[cardId]++;
    }

    /**
     * Get card count
     */
    getCardCount(cardId) {
        return this.collection[cardId] || 0;
    }

    /**
     * Equip a card
     */
    equipCard(cardId) {
        if (this.equipped.length >= this.maxEquipped) {
            return { success: false, reason: 'maxEquipped' };
        }

        if (this.equipped.includes(cardId)) {
            return { success: false, reason: 'alreadyEquipped' };
        }

        if ((this.collection[cardId] || 0) <= 0) {
            return { success: false, reason: 'notOwned' };
        }

        this.equipped.push(cardId);
        this.recalculateBonuses();

        this.game.sound?.play('equip');
        this.game.save();

        return { success: true };
    }

    /**
     * Unequip a card
     */
    unequipCard(cardId) {
        const index = this.equipped.indexOf(cardId);
        if (index === -1) return false;

        this.equipped.splice(index, 1);
        this.recalculateBonuses();

        this.game.save();
        return true;
    }

    /**
     * Disenchant duplicate cards for dust
     */
    disenchant(cardId, count = 1) {
        const available = (this.collection[cardId] || 0) -
            (this.equipped.includes(cardId) ? 1 : 0);

        if (available < count) return false;

        const card = SKILL_CARDS.find(c => c.id === cardId);
        if (!card) return false;

        const dustValue = CARD_RARITIES[card.rarity]?.dustValue || 5;

        this.collection[cardId] -= count;
        this.dust += dustValue * count;

        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `+${dustValue * count} ${t('cards.dust')}`,
                '#a855f7',
                24
            ));
        }

        this.game.save();
        return true;
    }

    /**
     * Craft a card using dust
     */
    craftCard(cardId) {
        const card = SKILL_CARDS.find(c => c.id === cardId);
        if (!card) return false;

        const dustCost = (CARD_RARITIES[card.rarity]?.dustValue || 5) * 4;
        if (this.dust < dustCost) return false;

        this.dust -= dustCost;
        this.addCard(cardId);

        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${card.icon} ${t('cards.crafted')}!`,
                CARD_RARITIES[card.rarity].color,
                28
            ));
        }

        this.game.sound?.play('craft');
        this.game.save();
        return true;
    }

    /**
     * Recalculate bonuses from equipped cards
     */
    recalculateBonuses() {
        if (!this.game.cardMults) {
            this.game.cardMults = {};
        }

        // Reset
        for (const key of Object.keys(this.game.cardMults)) {
            this.game.cardMults[key] = 0;
        }

        // Apply equipped card effects
        for (const cardId of this.equipped) {
            const card = SKILL_CARDS.find(c => c.id === cardId);
            if (card?.effect) {
                for (const [stat, value] of Object.entries(card.effect)) {
                    this.game.cardMults[stat] = (this.game.cardMults[stat] || 0) + value;
                }
            }
        }
    }

    /**
     * Get bonuses from equipped cards
     */
    getCardBonuses() {
        return this.game.cardMults || {};
    }

    /**
     * Get all cards with ownership info
     */
    getAllCards() {
        return SKILL_CARDS.map(card => ({
            ...card,
            name: t(card.nameKey),
            desc: t(card.descKey),
            owned: this.collection[card.id] || 0,
            equipped: this.equipped.includes(card.id),
            color: CARD_RARITIES[card.rarity].color
        }));
    }

    /**
     * Get equipped cards
     */
    getEquippedCards() {
        return this.equipped.map(cardId => {
            const card = SKILL_CARDS.find(c => c.id === cardId);
            return card ? {
                ...card,
                name: t(card.nameKey),
                desc: t(card.descKey),
                color: CARD_RARITIES[card.rarity].color
            } : null;
        }).filter(Boolean);
    }

    /**
     * Get cards by category
     */
    getCardsByCategory(category) {
        return this.getAllCards().filter(c => c.category === category);
    }

    /**
     * Get card packs
     */
    getCardPacks() {
        return CARD_PACKS.map(pack => ({
            ...pack,
            name: t(pack.nameKey),
            canAfford: this.canAffordPack(pack.id)
        }));
    }

    /**
     * Check if player can afford a pack
     */
    canAffordPack(packId) {
        const pack = CARD_PACKS.find(p => p.id === packId);
        if (!pack) return false;

        if (pack.cost.crystals && BigNumService.lt(this.game.crystals, pack.cost.crystals)) {
            return false;
        }
        if (pack.cost.ether && BigNumService.lt(this.game.ether, pack.cost.ether)) {
            return false;
        }
        return true;
    }

    /**
     * Get total unique cards owned
     */
    getTotalUniqueCards() {
        return Object.values(this.collection).filter(c => c > 0).length;
    }

    /**
     * Get total cards owned
     */
    getTotalCards() {
        return Object.values(this.collection).reduce((a, b) => a + b, 0);
    }

    /**
     * Drop card from boss
     */
    dropFromBoss(tier = 1) {
        // Higher tier = better rarity odds
        const rarityBoost = { common: 0, uncommon: tier * 5, rare: tier * 2, legendary: tier };

        // Modify weights temporarily
        let roll = Math.random() * 100;
        for (const [rarity, data] of Object.entries(CARD_RARITIES)) {
            const adjustedWeight = data.weight + (rarityBoost[rarity] || 0);
            roll -= adjustedWeight;
            if (roll <= 0) {
                const cardsOfRarity = SKILL_CARDS.filter(c => c.rarity === rarity);
                const card = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
                if (card) {
                    this.addCard(card.id);

                    if (this.game.floatingTexts) {
                        this.game.floatingTexts.push(FloatingText.create(
                            this.game.width / 2,
                            this.game.height / 2,
                            `${card.icon} ${t(card.nameKey)}`,
                            CARD_RARITIES[rarity].color,
                            28
                        ));
                    }

                    return card;
                }
                break;
            }
        }
        return null;
    }

    /**
     * Get save data
     */
    getSaveData() {
        return {
            collection: { ...this.collection },
            equipped: [...this.equipped],
            dust: this.dust
        };
    }

    /**
     * Load save data
     */
    loadSaveData(data) {
        if (!data) return;

        this.collection = data.collection || {};
        this.equipped = data.equipped || [];
        this.dust = data.dust || 0;

        // Ensure all cards exist in collection
        for (const card of SKILL_CARDS) {
            if (this.collection[card.id] === undefined) {
                this.collection[card.id] = 0;
            }
        }

        this.recalculateBonuses();
    }
}
