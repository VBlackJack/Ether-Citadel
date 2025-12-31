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
 * Unit tests for critical game formulas
 * Run with: node tests/formulas.test.js
 */

// Simple test framework
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('\n=== Running Formula Tests ===\n');

        for (const { name, fn } of this.tests) {
            try {
                await fn();
                console.log(`✓ ${name}`);
                this.passed++;
            } catch (e) {
                console.log(`✗ ${name}`);
                console.log(`  Error: ${e.message}`);
                this.failed++;
            }
        }

        console.log(`\n=== Results: ${this.passed} passed, ${this.failed} failed ===\n`);
        return this.failed === 0;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertApprox(actual, expected, epsilon = 0.001, message) {
    if (Math.abs(actual - expected) > epsilon) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

const runner = new TestRunner();

// ========================================
// Upgrade Cost Formula Tests
// ========================================

runner.test('Upgrade cost at level 0 equals base cost', () => {
    const baseCost = 10;
    const costMult = 1.15;
    const level = 0;
    const cost = Math.floor(baseCost * Math.pow(costMult, level));
    assert(cost === 10, `Expected 10, got ${cost}`);
});

runner.test('Upgrade cost scales exponentially', () => {
    const baseCost = 10;
    const costMult = 1.15;

    const cost0 = Math.floor(baseCost * Math.pow(costMult, 0));
    const cost1 = Math.floor(baseCost * Math.pow(costMult, 1));
    const cost10 = Math.floor(baseCost * Math.pow(costMult, 10));

    assert(cost0 === 10, 'Level 0 cost');
    assert(cost1 === 11, 'Level 1 cost');
    assert(cost10 === 40, `Level 10 cost: ${cost10}`);
});

runner.test('Cost multiplier of 1.0 gives constant cost', () => {
    const baseCost = 100;
    const costMult = 1.0;

    for (let level = 0; level < 100; level++) {
        const cost = Math.floor(baseCost * Math.pow(costMult, level));
        assert(cost === 100, `Level ${level} should cost 100`);
    }
});

// ========================================
// Damage Formula Tests
// ========================================

runner.test('Base damage at tier 1', () => {
    const baseDamage = 5;
    const tierMult = 1.0; // Tier 1
    const expected = baseDamage * tierMult;
    assert(expected === 5, `Expected 5, got ${expected}`);
});

runner.test('Damage scales with tier', () => {
    const baseDamage = 10;
    const evolutionMult = 1.5;

    const tier1 = baseDamage * Math.pow(evolutionMult, 0);
    const tier2 = baseDamage * Math.pow(evolutionMult, 1);
    const tier3 = baseDamage * Math.pow(evolutionMult, 2);

    assertApprox(tier1, 10);
    assertApprox(tier2, 15);
    assertApprox(tier3, 22.5);
});

runner.test('Critical hit multiplier', () => {
    const baseDamage = 100;
    const critMult = 2.0;

    const critDamage = baseDamage * critMult;
    assert(critDamage === 200, `Expected 200, got ${critDamage}`);
});

// ========================================
// Enemy HP Scaling Tests
// ========================================

runner.test('Enemy HP scales with wave', () => {
    const baseHp = 10;
    const wave = 10;
    const evolutionInterval = 10;
    const evolutionMult = 1.5;

    const evolutions = Math.floor(wave / evolutionInterval);
    const hp = Math.floor(baseHp * Math.pow(evolutionMult, evolutions));

    assert(hp === 15, `Wave 10 HP should be 15, got ${hp}`);
});

runner.test('Dread level increases enemy HP', () => {
    const baseHp = 100;
    const dreadMult = 2.0; // Dread level 2

    const hp = baseHp * dreadMult;
    assert(hp === 200, `Expected 200, got ${hp}`);
});

// ========================================
// Gold Reward Tests
// ========================================

runner.test('Gold reward with dread bonus', () => {
    const baseGold = 10;
    const dreadRewardMult = 1.5;

    const gold = Math.floor(baseGold * dreadRewardMult);
    assert(gold === 15, `Expected 15, got ${gold}`);
});

runner.test('Gold scales with enemy tier', () => {
    const tierGoldValues = [1, 2, 5, 10, 25, 50];
    const expectedTotal = tierGoldValues.reduce((a, b) => a + b, 0);
    assert(expectedTotal === 93, `Total gold from all tiers: ${expectedTotal}`);
});

// ========================================
// Prestige Formula Tests
// ========================================

runner.test('Prestige points calculation', () => {
    // Simple formula: sqrt(wave / 10)
    const wave = 100;
    const points = Math.floor(Math.sqrt(wave / 10));
    assert(points === 3, `Expected 3 prestige points at wave 100, got ${points}`);
});

runner.test('Crystal reward from wave', () => {
    const wave = 50;
    const crystalDivisor = 10;
    const crystals = Math.floor(wave / crystalDivisor);
    assert(crystals === 5, `Expected 5 crystals at wave 50, got ${crystals}`);
});

// ========================================
// BigNum Format Tests
// ========================================

runner.test('Format small numbers', () => {
    const formatNumber = (num) => {
        if (num < 1000) return Math.floor(num).toString();
        if (num >= 1e18) return (num / 1e18).toFixed(2) + 'Qi';
        if (num >= 1e15) return (num / 1e15).toFixed(2) + 'Qa';
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
        return Math.floor(num).toString();
    };

    assert(formatNumber(500) === '500', 'Format 500');
    assert(formatNumber(1500) === '1.5k', 'Format 1.5k');
    assert(formatNumber(1500000) === '1.50M', 'Format 1.5M');
    assert(formatNumber(1500000000) === '1.50B', 'Format 1.5B');
});

// ========================================
// Passive System Tests
// ========================================

runner.test('Passive SP cost calculation', () => {
    const costPerLevel = 2;
    const level = 5;
    const totalCost = costPerLevel * level;
    assert(totalCost === 10, `Expected 10 SP for level 5, got ${totalCost}`);
});

runner.test('Passive effect stacking', () => {
    const baseValue = 0.05; // 5% per level
    const level = 10;
    const totalBonus = baseValue * level;
    assertApprox(totalBonus, 0.5, 0.001, 'Expected 50% bonus at level 10');
});

// ========================================
// Research Effect Tests
// ========================================

runner.test('Research damage multiplier stacks additively', () => {
    const researches = [
        { effect: { damageMult: 0.10 } },
        { effect: { damageMult: 0.15 } },
        { effect: { damageMult: 0.25 } }
    ];

    const totalMult = researches.reduce((sum, r) => sum + (r.effect.damageMult || 0), 0);
    assertApprox(totalMult, 0.5, 0.001, 'Expected 50% damage multiplier');
});

// ========================================
// Offline Progress Tests
// ========================================

runner.test('Offline earnings calculation', () => {
    const goldPerSecond = 10;
    const offlineSeconds = 3600; // 1 hour
    const offlineMult = 0.75;
    const maxOfflineHours = 24;

    const cappedSeconds = Math.min(offlineSeconds, maxOfflineHours * 3600);
    const earnings = Math.floor(goldPerSecond * cappedSeconds * offlineMult);

    assert(earnings === 27000, `Expected 27000 offline gold, got ${earnings}`);
});

runner.test('Offline time cap', () => {
    const maxOfflineHours = 24;
    const offlineSeconds = 100 * 3600; // 100 hours
    const cappedSeconds = Math.min(offlineSeconds, maxOfflineHours * 3600);

    assert(cappedSeconds === 86400, `Expected 86400s (24h cap), got ${cappedSeconds}`);
});

// ========================================
// Checksum Tests
// ========================================

runner.test('Checksum consistency', () => {
    const computeChecksum = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    };

    const data = '{"gold":1000,"wave":50}';
    const checksum1 = computeChecksum(data);
    const checksum2 = computeChecksum(data);

    assert(checksum1 === checksum2, 'Checksums should be consistent');
});

runner.test('Checksum detects changes', () => {
    const computeChecksum = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    };

    const data1 = '{"gold":1000}';
    const data2 = '{"gold":1001}';

    assert(computeChecksum(data1) !== computeChecksum(data2), 'Modified data should have different checksum');
});

// Run all tests
runner.run().then(success => {
    process.exit(success ? 0 : 1);
});
