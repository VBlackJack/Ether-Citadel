/*
 * Copyright 2025 Julien Bombled
 * Upgrade System Data
 */

import { t } from '../i18n.js';

/**
 * Upgrade definitions factory
 * @returns {Array}
 */
export function createUpgrades() {
    return [
        { id: 'damage', nameKey: 'upgrades.damage.name', descKey: 'upgrades.damage.desc', category: 0, baseCost: 10, costMult: 1.5, level: 1, getValue: (lvl) => Math.floor(7 * Math.pow(1.2, lvl - 1)), icon: '\u2694\ufe0f' },
        { id: 'speed', nameKey: 'upgrades.speed.name', descKey: 'upgrades.speed.desc', category: 0, baseCost: 25, costMult: 1.6, level: 1, getValue: (lvl) => 1000 * Math.pow(0.88, lvl - 1), icon: '\u26a1' },
        { id: 'crit', nameKey: 'upgrades.crit.name', descKey: 'upgrades.crit.desc', category: 0, baseCost: 100, costMult: 1.8, level: 0, getValue: (lvl) => ({ chance: Math.min(150, lvl * 2), mult: 2 + (lvl * 0.1) }), icon: '\ud83d\udca5' },
        { id: 'range', nameKey: 'upgrades.range.name', descKey: 'upgrades.range.desc', category: 0, baseCost: 30, costMult: 1.5, level: 1, getValue: (lvl) => 300 + (lvl * 60), icon: '\ud83c\udfaf' },
        { id: 'multishot', nameKey: 'upgrades.multishot.name', descKey: 'upgrades.multishot.desc', category: 0, baseCost: 200, costMult: 2.2, level: 0, getValue: (lvl) => Math.min(60, lvl * 6), icon: '\ud83c\udff9' },
        { id: 'health', nameKey: 'upgrades.health.name', descKey: 'upgrades.health.desc', category: 1, baseCost: 15, costMult: 1.4, level: 1, getValue: (lvl) => Math.floor(100 * Math.pow(1.25, lvl - 1)), icon: '\u2764\ufe0f' },
        { id: 'regen', nameKey: 'upgrades.regen.name', descKey: 'upgrades.regen.desc', category: 1, baseCost: 50, costMult: 1.8, level: 0, getValue: (lvl) => lvl === 0 ? 0 : Math.floor(2 * Math.pow(1.4, lvl - 1)), icon: '\ud83d\udd27' },
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
        { id: 'goldMult', nameKey: 'metaUpgrades.goldMult.name', descKey: 'metaUpgrades.goldMult.desc', baseCost: 5, costMult: 2, level: 0, maxLevel: 10, getEffect: (lvl) => 1 + (lvl * 0.1), format: (v) => `x${v.toFixed(1)}`, icon: '\ud83e\udd11' },
        { id: 'damageMult', nameKey: 'metaUpgrades.damageMult.name', descKey: 'metaUpgrades.damageMult.desc', baseCost: 3, costMult: 1.8, level: 0, maxLevel: 50, getEffect: (lvl) => 1 + (lvl * 0.1), format: (v) => `x${v.toFixed(1)}`, icon: '\ud83d\udcaa' },
        { id: 'healthMult', nameKey: 'metaUpgrades.healthMult.name', descKey: 'metaUpgrades.healthMult.desc', baseCost: 2, costMult: 1.5, level: 0, maxLevel: 50, getEffect: (lvl) => 1 + (lvl * 0.1), format: (v) => `x${v.toFixed(1)}`, icon: '\ud83c\udff0' },
        { id: 'unlockAuto', nameKey: 'metaUpgrades.unlockAuto.name', descKey: 'metaUpgrades.unlockAuto.desc', baseCost: 10, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '\ud83d\udd04' },
        { id: 'unlockAI', nameKey: 'metaUpgrades.unlockAI.name', descKey: 'metaUpgrades.unlockAI.desc', baseCost: 25, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '\ud83e\udd16' },
        { id: 'unlockDrone', nameKey: 'metaUpgrades.unlockDrone.name', descKey: 'metaUpgrades.unlockDrone.desc', baseCost: 50, costMult: 100, level: 0, maxLevel: 1, getEffect: (lvl) => lvl > 0, format: (v) => v ? t('status.on') : t('status.off'), icon: '\ud83d\udef8' }
    ];
}

/**
 * Game speed options
 */
export const GAME_SPEEDS = [
    { id: 'x1', mult: 1, nameKey: 'speeds.x1' },
    { id: 'x2', mult: 2, nameKey: 'speeds.x2' },
    { id: 'x4', mult: 4, nameKey: 'speeds.x4' },
    { id: 'x8', mult: 8, nameKey: 'speeds.x8' },
    { id: 'x16', mult: 16, nameKey: 'speeds.x16' }
];
