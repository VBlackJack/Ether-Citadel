/*
 * Copyright 2025 Julien Bombled
 * GameState Unit Tests
 */

describe('INITIAL_STATE', () => {
    it('should have correct default values', async () => {
        const { INITIAL_STATE } = await import('../js/game/GameState.js');

        expect(INITIAL_STATE.gold).toBe(0);
        expect(INITIAL_STATE.wave).toBe(1);
        expect(INITIAL_STATE.ether).toBe(0);
        expect(INITIAL_STATE.crystals).toBe(0);
        expect(INITIAL_STATE.dreadLevel).toBe(0);
        expect(INITIAL_STATE.isPaused).toBe(false);
        expect(INITIAL_STATE.isGameOver).toBe(false);
    });

    it('should have settings object with defaults', async () => {
        const { INITIAL_STATE } = await import('../js/game/GameState.js');

        expect(INITIAL_STATE.settings).toBeDefined();
        expect(INITIAL_STATE.settings.showDamageText).toBe(true);
        expect(INITIAL_STATE.settings.showRange).toBe(true);
    });
});

describe('Game Formulas', () => {
    describe('Upgrade Cost Formula', () => {
        const calculateCost = (baseCost, costMult, level) => {
            return Math.floor(baseCost * Math.pow(costMult, level));
        };

        it('should return base cost at level 0', () => {
            expect(calculateCost(10, 1.15, 0)).toBe(10);
        });

        it('should scale exponentially', () => {
            expect(calculateCost(10, 1.15, 1)).toBe(11);
            expect(calculateCost(10, 1.15, 10)).toBe(40);
        });

        it('should remain constant with multiplier 1.0', () => {
            for (let level = 0; level < 10; level++) {
                expect(calculateCost(100, 1.0, level)).toBe(100);
            }
        });
    });

    describe('Damage Formula', () => {
        const calculateDamage = (baseDamage, evolutionMult, tier) => {
            return baseDamage * Math.pow(evolutionMult, tier - 1);
        };

        it('should return base damage at tier 1', () => {
            expect(calculateDamage(10, 1.5, 1)).toBe(10);
        });

        it('should scale with tier', () => {
            expect(calculateDamage(10, 1.5, 2)).toBeCloseTo(15, 2);
            expect(calculateDamage(10, 1.5, 3)).toBeCloseTo(22.5, 2);
        });

        it('should apply critical hit multiplier', () => {
            const baseDamage = 100;
            const critMult = 2.0;
            expect(baseDamage * critMult).toBe(200);
        });
    });

    describe('Enemy HP Scaling', () => {
        const calculateEnemyHp = (baseHp, wave, evolutionInterval, evolutionMult, dreadMult = 1) => {
            const evolutions = Math.floor(wave / evolutionInterval);
            return Math.floor(baseHp * Math.pow(evolutionMult, evolutions) * dreadMult);
        };

        it('should scale with wave', () => {
            expect(calculateEnemyHp(10, 10, 10, 1.5)).toBe(15);
        });

        it('should apply dread multiplier', () => {
            expect(calculateEnemyHp(100, 1, 10, 1.5, 2.0)).toBe(200);
        });
    });

    describe('Offline Earnings', () => {
        const calculateOfflineEarnings = (goldPerSecond, offlineSeconds, offlineMult, maxOfflineHours) => {
            const cappedSeconds = Math.min(offlineSeconds, maxOfflineHours * 3600);
            return Math.floor(goldPerSecond * cappedSeconds * offlineMult);
        };

        it('should calculate earnings correctly', () => {
            expect(calculateOfflineEarnings(10, 3600, 0.75, 24)).toBe(27000);
        });

        it('should cap at max offline hours', () => {
            // 100 hours requested, capped at 24
            const earnings100h = calculateOfflineEarnings(10, 100 * 3600, 0.75, 24);
            const earnings24h = calculateOfflineEarnings(10, 24 * 3600, 0.75, 24);
            expect(earnings100h).toBe(earnings24h);
        });
    });
});

describe('Checksum', () => {
    const computeChecksum = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    };

    it('should be consistent for same input', () => {
        const data = '{"gold":1000,"wave":50}';
        expect(computeChecksum(data)).toBe(computeChecksum(data));
    });

    it('should detect changes', () => {
        const data1 = '{"gold":1000}';
        const data2 = '{"gold":1001}';
        expect(computeChecksum(data1)).not.toBe(computeChecksum(data2));
    });
});
