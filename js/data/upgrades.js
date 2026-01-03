/*
 * Copyright 2025 Julien Bombled
 * Licensed under the Apache License, Version 2.0
 */

import { t } from '../i18n.js';

/**
 * Dark Matter upgrade definitions
 * @type {Array<{id: string, nameKey: string, descKey: string, max: number, cost: number}>}
 */
export const DARK_MATTER_UPGRADES = [
    { id: 'berserk', nameKey: 'darkMatter.berserk.name', descKey: 'darkMatter.berserk.desc', max: 1, cost: 5 },
    { id: 'siphon', nameKey: 'darkMatter.siphon.name', descKey: 'darkMatter.siphon.desc', max: 10, cost: 8, effectPerLevel: 0.5 },
    { id: 'overlord', nameKey: 'darkMatter.overlord.name', descKey: 'darkMatter.overlord.desc', max: 3, cost: 8 },
    { id: 'etherSurge', nameKey: 'darkMatter.etherSurge.name', descKey: 'darkMatter.etherSurge.desc', max: 5, cost: 15, effectPerLevel: 0.1 },
    { id: 'voidAffinity', nameKey: 'darkMatter.voidAffinity.name', descKey: 'darkMatter.voidAffinity.desc', max: 3, cost: 25, effectPerLevel: 0.15 }
];

/**
 * Research tree definitions
 */
export const RESEARCH_TREE = [
    {
        id: 'offense',
        nameKey: 'research.offense.name',
        icon: '⚔️',
        color: '#ef4444',
        nodes: [
            { id: 'dmg_1', nameKey: 'research.dmg_1.name', descKey: 'research.dmg_1.desc', cost: 5, effect: { damageMult: 0.1 }, requires: [] },
            { id: 'dmg_2', nameKey: 'research.dmg_2.name', descKey: 'research.dmg_2.desc', cost: 15, effect: { damageMult: 0.15 }, requires: ['dmg_1'] },
            { id: 'dmg_3', nameKey: 'research.dmg_3.name', descKey: 'research.dmg_3.desc', cost: 50, effect: { damageMult: 0.25 }, requires: ['dmg_2'] },
            { id: 'crit_1', nameKey: 'research.crit_1.name', descKey: 'research.crit_1.desc', cost: 10, effect: { critChance: 5 }, requires: ['dmg_1'] },
            { id: 'crit_2', nameKey: 'research.crit_2.name', descKey: 'research.crit_2.desc', cost: 30, effect: { critDamage: 0.5 }, requires: ['crit_1'] },
            { id: 'speed_1', nameKey: 'research.speed_1.name', descKey: 'research.speed_1.desc', cost: 20, effect: { fireRateMult: 0.1 }, requires: ['dmg_1'] },
            { id: 'speed_2', nameKey: 'research.speed_2.name', descKey: 'research.speed_2.desc', cost: 60, effect: { fireRateMult: 0.15 }, requires: ['speed_1'] }
        ]
    },
    {
        id: 'defense',
        nameKey: 'research.defense.name',
        icon: '🛡️',
        color: '#3b82f6',
        nodes: [
            { id: 'hp_1', nameKey: 'research.hp_1.name', descKey: 'research.hp_1.desc', cost: 5, effect: { healthMult: 0.1 }, requires: [] },
            { id: 'hp_2', nameKey: 'research.hp_2.name', descKey: 'research.hp_2.desc', cost: 15, effect: { healthMult: 0.15 }, requires: ['hp_1'] },
            { id: 'hp_3', nameKey: 'research.hp_3.name', descKey: 'research.hp_3.desc', cost: 50, effect: { healthMult: 0.25 }, requires: ['hp_2'] },
            { id: 'regen_1', nameKey: 'research.regen_1.name', descKey: 'research.regen_1.desc', cost: 10, effect: { regenMult: 0.2 }, requires: ['hp_1'] },
            { id: 'shield_1', nameKey: 'research.shield_1.name', descKey: 'research.shield_1.desc', cost: 25, effect: { shieldMult: 0.2 }, requires: ['hp_2'] },
            { id: 'armor_1', nameKey: 'research.armor_1.name', descKey: 'research.armor_1.desc', cost: 40, effect: { armorFlat: 0.05 }, requires: ['shield_1'] }
        ]
    },
    {
        id: 'utility',
        nameKey: 'research.utility.name',
        icon: '⚙️',
        color: '#22d3ee',
        nodes: [
            { id: 'gold_1', nameKey: 'research.gold_1.name', descKey: 'research.gold_1.desc', cost: 5, effect: { goldMult: 0.1 }, requires: [] },
            { id: 'gold_2', nameKey: 'research.gold_2.name', descKey: 'research.gold_2.desc', cost: 20, effect: { goldMult: 0.15 }, requires: ['gold_1'] },
            { id: 'xp_1', nameKey: 'research.xp_1.name', descKey: 'research.xp_1.desc', cost: 15, effect: { xpMult: 0.2 }, requires: ['gold_1'] },
            { id: 'mining_1', nameKey: 'research.mining_1.name', descKey: 'research.mining_1.desc', cost: 10, effect: { miningSpeed: 0.25 }, requires: [] },
            { id: 'mining_2', nameKey: 'research.mining_2.name', descKey: 'research.mining_2.desc', cost: 35, effect: { miningSpeed: 0.5 }, requires: ['mining_1'] },
            { id: 'forge_1', nameKey: 'research.forge_1.name', descKey: 'research.forge_1.desc', cost: 50, effect: { forgeSuccess: 0.1 }, requires: ['mining_2'] }
        ]
    }
];

/**
 * Upgrade definitions factory
 * @returns {Array}
 */
export function createUpgrades() {
    return [
        { id: 'damage', nameKey: 'upgrades.damage.name', descKey: 'upgrades.damage.desc', category: 0, baseCost: 10, costMult: 1.25, level: 1, getValue: (lvl) => Math.floor(4 * Math.pow(1.08, lvl - 1)), icon: '\u2694\ufe0f' },
        { id: 'speed', nameKey: 'upgrades.speed.name', descKey: 'upgrades.speed.desc', category: 0, baseCost: 30, costMult: 1.30, level: 1, getValue: (lvl) => Math.max(80, 1000 * Math.pow(0.96, lvl - 1)), icon: '\u26a1' },
        { id: 'crit', nameKey: 'upgrades.crit.name', descKey: 'upgrades.crit.desc', category: 0, baseCost: 50, costMult: 1.7, level: 0, getValue: (lvl) => ({ chance: Math.min(150, lvl * 2), mult: 2 + (lvl * 0.1) }), icon: '\ud83d\udca5' },
        { id: 'range', nameKey: 'upgrades.range.name', descKey: 'upgrades.range.desc', category: 0, baseCost: 30, costMult: 1.5, level: 1, getValue: (lvl) => 300 + (lvl * 60), icon: '\ud83c\udfaf' },
        { id: 'multishot', nameKey: 'upgrades.multishot.name', descKey: 'upgrades.multishot.desc', category: 0, baseCost: 100, costMult: 2.0, level: 0, getValue: (lvl) => Math.min(60, lvl * 6), icon: '\ud83c\udff9' },
        { id: 'health', nameKey: 'upgrades.health.name', descKey: 'upgrades.health.desc', category: 1, baseCost: 15, costMult: 1.5, level: 1, getValue: (lvl) => Math.floor(80 * Math.pow(1.18, lvl - 1)), icon: '\u2764\ufe0f' },
        { id: 'regen', nameKey: 'upgrades.regen.name', descKey: 'upgrades.regen.desc', category: 1, baseCost: 50, costMult: 2.0, level: 0, getValue: (lvl) => lvl === 0 ? 0 : 3 * lvl, icon: '\ud83d\udd27' },
        { id: 'leech', nameKey: 'upgrades.leech.name', descKey: 'upgrades.leech.desc', category: 1, baseCost: 2000, costMult: 2.5, level: 0, getValue: (lvl) => lvl * 2, icon: '\ud83e\ude78' },
        { id: 'shield', nameKey: 'upgrades.shield.name', descKey: 'upgrades.shield.desc', category: 1, baseCost: 1500, costMult: 1.6, level: 0, getValue: (lvl) => lvl * 50, icon: '\ud83d\udee1\ufe0f' },
        { id: 'armor', nameKey: 'upgrades.armor.name', descKey: 'upgrades.armor.desc', category: 1, baseCost: 3000, costMult: 2.0, level: 0, maxLevel: 50, getValue: (lvl) => Math.min(0.75, lvl * 0.015), icon: '\ud83e\uddf1' },
        { id: 'turret', nameKey: 'upgrades.turret.name', descKey: 'upgrades.turret.desc', category: 2, baseCost: 300, costMult: 2.5, level: 0, maxLevel: 4, getValue: (lvl) => lvl, icon: '\ud83d\udd2b' },
        { id: 'artillery', nameKey: 'upgrades.artillery.name', descKey: 'upgrades.artillery.desc', category: 2, baseCost: 4000, costMult: 2.5, level: 0, maxLevel: 1, getValue: (lvl) => lvl, icon: '\ud83d\udca3' },
        { id: 'rocket', nameKey: 'upgrades.rocket.name', descKey: 'upgrades.rocket.desc', category: 2, baseCost: 6000, costMult: 2.5, level: 0, maxLevel: 1, getValue: (lvl) => lvl, icon: '\ud83d\ude80' },
        { id: 'tesla', nameKey: 'upgrades.tesla.name', descKey: 'upgrades.tesla.desc', category: 2, baseCost: 8000, costMult: 2.5, level: 0, maxLevel: 1, getValue: (lvl) => lvl, icon: '\u26a1' },
        { id: 'orbital', nameKey: 'upgrades.orbital.name', descKey: 'upgrades.orbital.desc', category: 2, baseCost: 3000, costMult: 1.8, level: 0, maxLevel: 10, getValue: (lvl) => lvl > 0 ? (5000 - lvl * 300) : 0, icon: '\ud83d\udef0\ufe0f' },
        { id: 'ice', nameKey: 'upgrades.ice.name', descKey: 'upgrades.ice.desc', category: 2, baseCost: 500, costMult: 2.0, level: 0, maxLevel: 1, getValue: (lvl) => lvl > 0, icon: '\u2744\ufe0f' },
        { id: 'poison', nameKey: 'upgrades.poison.name', descKey: 'upgrades.poison.desc', category: 2, baseCost: 600, costMult: 2.0, level: 0, maxLevel: 1, getValue: (lvl) => lvl > 0, icon: '\u2620\ufe0f' },
        { id: 'stasis', nameKey: 'upgrades.stasis.name', descKey: 'upgrades.stasis.desc', category: 2, baseCost: 1500, costMult: 2.0, level: 0, maxLevel: 5, getValue: (lvl) => lvl * 5, icon: '\u23f3' },
        { id: 'bounce', nameKey: 'upgrades.bounce.name', descKey: 'upgrades.bounce.desc', category: 2, baseCost: 1200, costMult: 2.5, level: 0, maxLevel: 3, getValue: (lvl) => lvl, icon: '\u2934\ufe0f' },
        { id: 'blast', nameKey: 'upgrades.blast.name', descKey: 'upgrades.blast.desc', category: 2, baseCost: 1500, costMult: 2.5, level: 0, maxLevel: 5, getValue: (lvl) => lvl * 30, icon: '\ud83d\udca3' }
    ];
}

/**
 * Meta upgrade definitions factory
 * @returns {Array}
 */
export function createMetaUpgrades() {
    return [
        { id: 'startGold', nameKey: 'metaUpgrades.startGold.name', descKey: 'metaUpgrades.startGold.desc', baseCost: 1, costMult: 1.5, level: 0, maxLevel: 20, getEffect: (lvl) => lvl * 50, format: (v) => `+${v} ${t('game.gold')}`, icon: '\ud83d\udcb0' },
        { id: 'goldMult', nameKey: 'metaUpgrades.goldMult.name', descKey: 'metaUpgrades.goldMult.desc', baseCost: 5, costMult: 2, level: 0, maxLevel: 6, getEffect: (lvl) => 1 + (lvl * 0.1), format: (v) => `x${v.toFixed(1)}`, icon: '\ud83e\udd11' },
        { id: 'damageMult', nameKey: 'metaUpgrades.damageMult.name', descKey: 'metaUpgrades.damageMult.desc', baseCost: 3, costMult: 1.8, level: 0, maxLevel: 20, getEffect: (lvl) => 1 + (lvl * 0.1), format: (v) => `x${v.toFixed(1)}`, icon: '\ud83d\udcaa' },
        { id: 'healthMult', nameKey: 'metaUpgrades.healthMult.name', descKey: 'metaUpgrades.healthMult.desc', baseCost: 2, costMult: 1.5, level: 0, maxLevel: 20, getEffect: (lvl) => 1 + (lvl * 0.1), format: (v) => `x${v.toFixed(1)}`, icon: '\ud83c\udff0' },
        { id: 'unlockAuto', nameKey: 'metaUpgrades.unlockAuto.name', descKey: 'metaUpgrades.unlockAuto.desc', baseCost: 10, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '\ud83d\udd04' },
        { id: 'unlockAI', nameKey: 'metaUpgrades.unlockAI.name', descKey: 'metaUpgrades.unlockAI.desc', baseCost: 25, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '\ud83e\udd16' },
        { id: 'unlockDrone', nameKey: 'metaUpgrades.unlockDrone.name', descKey: 'metaUpgrades.unlockDrone.desc', baseCost: 50, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '\ud83d\udef8' },
        // Infinite scaling upgrades for late game (diminishing returns)
        { id: 'infiniteDamage', nameKey: 'metaUpgrades.infiniteDamage.name', descKey: 'metaUpgrades.infiniteDamage.desc', baseCost: 100, costMult: 1.15, level: 0, maxLevel: 0, getEffect: (lvl) => 1 + (lvl * 0.02), format: (v) => `x${v.toFixed(2)}`, icon: '🗡️' },
        { id: 'infiniteHealth', nameKey: 'metaUpgrades.infiniteHealth.name', descKey: 'metaUpgrades.infiniteHealth.desc', baseCost: 100, costMult: 1.15, level: 0, maxLevel: 0, getEffect: (lvl) => 1 + (lvl * 0.02), format: (v) => `x${v.toFixed(2)}`, icon: '💖' },
        { id: 'infiniteGold', nameKey: 'metaUpgrades.infiniteGold.name', descKey: 'metaUpgrades.infiniteGold.desc', baseCost: 150, costMult: 1.2, level: 0, maxLevel: 0, getEffect: (lvl) => 1 + (lvl * 0.03), format: (v) => `x${v.toFixed(2)}`, icon: '💎' },
        { id: 'autoSkillQ', nameKey: 'metaUpgrades.autoSkillQ.name', descKey: 'metaUpgrades.autoSkillQ.desc', baseCost: 75, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '⚡' },
        { id: 'autoSkillW', nameKey: 'metaUpgrades.autoSkillW.name', descKey: 'metaUpgrades.autoSkillW.desc', baseCost: 100, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '☄️' },
        { id: 'autoSkillE', nameKey: 'metaUpgrades.autoSkillE.name', descKey: 'metaUpgrades.autoSkillE.desc', baseCost: 125, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '🌀' }
    ];
}
