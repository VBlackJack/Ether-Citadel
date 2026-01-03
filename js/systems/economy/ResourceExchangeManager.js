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
 * ResourceExchangeManager - Handles resource conversion between currencies
 */

import { EXCHANGE_RATES } from '../../data.js';
import { t } from '../../i18n.js';
import { FloatingText } from '../../entities/FloatingText.js';
import { BigNumService, formatNumber } from '../../config.js';

export class ResourceExchangeManager {
    constructor(game) {
        this.game = game;
    }

    /**
     * Get available exchange options
     */
    getAvailableExchanges() {
        const exchanges = [];

        for (const [id, config] of Object.entries(EXCHANGE_RATES)) {
            const available = this.canExchange(id);
            const fromAmount = this.getResourceAmount(config.from);

            exchanges.push({
                id,
                ...config,
                available,
                currentAmount: fromAmount,
                maxExchanges: Math.floor(BigNumService.toNumber(fromAmount) / config.rate)
            });
        }

        return exchanges;
    }

    /**
     * Check if exchange is available
     */
    canExchange(exchangeId, amount = 1) {
        const config = EXCHANGE_RATES[exchangeId];
        if (!config) return false;

        // Check unlock requirements
        if (config.unlockAscensions) {
            const ascensions = this.game.ascension?.totalAscensions || 0;
            if (ascensions < config.unlockAscensions) return false;
        }

        // Check resource amount
        const fromAmount = this.getResourceAmount(config.from);
        const required = config.rate * amount;
        return BigNumService.gte(fromAmount, required);
    }

    /**
     * Get amount of a resource
     */
    getResourceAmount(resource) {
        switch (resource) {
            case 'gold':
                return this.game.gold || BigNumService.create(0);
            case 'crystals':
                return this.game.crystals || BigNumService.create(0);
            case 'ether':
                return this.game.ether || BigNumService.create(0);
            case 'ascensionPoints':
                return this.game.ascension?.points || BigNumService.create(0);
            default:
                return BigNumService.create(0);
        }
    }

    /**
     * Set amount of a resource
     */
    setResourceAmount(resource, amount) {
        switch (resource) {
            case 'gold':
                this.game.gold = amount;
                break;
            case 'crystals':
                this.game.crystals = amount;
                this.game.updateCrystalsUI?.();
                break;
            case 'ether':
                this.game.ether = amount;
                this.game.updateEtherUI?.();
                break;
            case 'ascensionPoints':
                if (this.game.ascension) {
                    this.game.ascension.points = amount;
                }
                break;
        }
    }

    /**
     * Execute resource exchange
     */
    exchange(exchangeId, amount = 1) {
        if (!this.canExchange(exchangeId, amount)) return false;

        const config = EXCHANGE_RATES[exchangeId];
        const cost = config.rate * amount;

        // Deduct from source
        const fromAmount = this.getResourceAmount(config.from);
        this.setResourceAmount(config.from, BigNumService.sub(fromAmount, cost));

        // Add to destination
        const toAmount = this.getResourceAmount(config.to);
        this.setResourceAmount(config.to, BigNumService.add(toAmount, amount));

        // Show notification
        if (this.game.floatingTexts) {
            this.game.floatingTexts.push(FloatingText.create(
                this.game.width / 2,
                this.game.height / 2,
                `${t('exchange.success')} +${formatNumber(amount)}`,
                '#22c55e',
                24
            ));
        }

        this.game.sound?.play('coin');
        this.game.save();
        return true;
    }

    /**
     * Get exchange rate display text
     */
    getExchangeRateText(exchangeId) {
        const config = EXCHANGE_RATES[exchangeId];
        if (!config) return '';
        return `${formatNumber(config.rate)} ${t(`resources.${config.from}.name`)} → 1 ${t(`resources.${config.to}.name`)}`;
    }
}
