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

import { i18n, t, formatDate } from './i18n.js';
import { CONFIG, SOUND_DB, MathUtils, formatNumber, BigNumService } from './config.js';
import {
    CHALLENGES,
    DARK_MATTER_UPGRADES,
    RELIC_DB,
    ACHIEVEMENTS_DB,
    ENEMY_TYPES,
    RUNE_TYPES,
    MASTERIES,
    MINING_RESOURCES,
    FORGE_RECIPES,
    RESEARCH_TREE,
    TURRET_TIERS,
    DREAD_LEVELS,
    PRODUCTION_BUILDINGS,
    AURA_TYPES,
    CHIP_TYPES,
    DAILY_QUEST_TYPES,
    PRESTIGE_UPGRADES,
    PASSIVES,
    getAllPassives,
    getPassiveById,
    GAME_SPEEDS,
    TOWN_LEVELS,
    SCHOOL_TURRETS,
    OFFICE_BOOSTS,
    AWAKENING_BONUSES,
    TURRET_SLOTS,
    WEATHER_TYPES,
    TALENT_TREES,
    RANDOM_EVENTS,
    ASCENSION_PERKS,
    COMBO_TIERS,
    BOSS_MECHANICS,
    BOSS_ABILITIES,
    TURRET_SYNERGIES,
    GAME_MODES,
    SEASONAL_EVENTS,
    CAMPAIGN_MISSIONS,
    VISUAL_EFFECTS,
    MUSIC_TRACKS,
    SOUND_EFFECTS,
    BUILD_PRESET_SLOTS,
    LEADERBOARD_CATEGORIES,
    createUpgrades,
    createMetaUpgrades,
    getName,
    getDesc
} from './data.js';
import { PassiveManager } from './systems/progression/PassiveManager.js';
import { SurrenderSystem } from './systems/progression/SurrenderSystem.js';
import { PrestigeManager } from './systems/progression/PrestigeManager.js';
import { MetaUpgradeManager } from './systems/progression/MetaUpgradeManager.js';
import { ResearchManager } from './systems/progression/ResearchManager.js';
import { ForgeManager } from './systems/economy/ForgeManager.js';
import { MiningManager } from './systems/economy/MiningManager.js';
import { UpgradeManager } from './systems/economy/UpgradeManager.js';
import { ProductionManager } from './systems/economy/ProductionManager.js';
import { AuraManager } from './systems/economy/AuraManager.js';
import { ChipManager } from './systems/economy/ChipManager.js';
import { AutoSkillManager } from './systems/combat/AutoSkillManager.js';
import { ProjectileSystem, ProjectileType } from './systems/combat/ProjectileSystem.js';
import { getEventDelegation } from './ui/EventDelegation.js';
import { getErrorHandler, logError } from './utils/ErrorHandler.js';
import { ConfigRegistry } from './services/ConfigRegistry.js';
import { SaveService } from './services/SaveService.js';
import { StatsBreakdown } from './ui/StatsBreakdown.js';
import { escapeHtml, sanitizeColor, calculateChecksum, verifyChecksum, sanitizeJsonObject } from './utils/HtmlSanitizer.js';
import { Enemy, Castle, FloatingText, Particle, Rune, Projectile, Turret, Drone } from './entities/index.js';
import { SkillManager, ChallengeManager, GameModeManager, CampaignManager, StatsManager, DailyQuestManager, TurretSlotManager, WeatherManager, EventManager, SeasonalEventManager, BuildPresetManager } from './systems/gameplay/index.js';
import { TownManager, SchoolManager, OfficeManager } from './systems/town/index.js';
import { AwakeningManager, TalentManager, AscensionManager } from './systems/meta/index.js';
import { ComboManager, SynergyManager, BossMechanicsManager } from './systems/combat/index.js';
import { COLORS, getCastleTierColor } from './constants/colors.js';
import { SKILL, RUNE, UPGRADE, PRESTIGE_RESET_UPGRADES } from './constants/skillIds.js';
import { TutorialManager, StatisticsManager, LeaderboardManager, VisualEffectsManager } from './systems/ui/index.js';
import { SoundManager, MusicManager } from './systems/audio/index.js';
import { InputManager } from './systems/input/InputManager.js';
import { RenderSystem } from './systems/graphics/RenderSystem.js';
import { GameLoop } from './game/GameLoop.js';

class Game {
    constructor() {
        window.game = this;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.renderSystem = new RenderSystem(this);
        this.gameLoop = new GameLoop(this);
        this.gameTime = 0;
        this.speedMultiplier = 1;
        this.ether = BigNumService.create(0);
        this.activeTab = 0;
        this.buyMode = '1';
        this._intervals = [];
        this._boundEventHandlers = {};
        this.showDebugPanel = false;
        this.devClickCount = 0;
        this.config = ConfigRegistry;
        this.sound = new SoundManager();
        this.metaUpgrades = new MetaUpgradeManager(this);
        this.skills = new SkillManager(this);
        this.autoSkills = new AutoSkillManager(this);
        this.projectileSystem = new ProjectileSystem(this);
        this.stats = new StatsManager();
        this.statsBreakdown = new StatsBreakdown(this);
        this.challenges = new ChallengeManager();
        this.tutorial = new TutorialManager();
        this.activeChallenge = null;

        this.relics = [];
        this.relicMults = { damage: 0, gold: 0, speed: 0, critChance: 0, health: 0, cooldown: 0, mining: 0, leech: 0, dreadReward: 0, critDamage: 0, revive: false, autoSkill: false };
        this.crystals = BigNumService.create(0);
        this.miningResources = {};
        this.researchEffects = {};
        this.mining = new MiningManager(this);
        this.forge = new ForgeManager(this);
        this.research = new ResearchManager(this);
        this.production = new ProductionManager(this);
        this.auras = new AuraManager(this);
        this.chips = new ChipManager(this);
        this.dailyQuests = new DailyQuestManager(this);
        this.prestige = new PrestigeManager(this);
        this.surrender = new SurrenderSystem(this);
        this.passives = new PassiveManager(this);
        this.town = new TownManager(this);
        this.school = new SchoolManager(this);
        this.office = new OfficeManager(this);
        this.awakening = new AwakeningManager(this);
        this.turretSlots = new TurretSlotManager(this);
        this.weather = new WeatherManager(this);
        this.combo = new ComboManager(this);
        this.events = new EventManager(this);
        this.talents = new TalentManager(this);
        this.statistics = new StatisticsManager(this);
        this.ascensionMgr = new AscensionManager(this);
        this.synergies = new SynergyManager(this);
        this.gameModes = new GameModeManager(this);
        this.seasonalEvents = new SeasonalEventManager(this);
        this.campaign = new CampaignManager(this);
        this.leaderboards = new LeaderboardManager(this);
        this.buildPresets = new BuildPresetManager(this);
        this.visualEffects = new VisualEffectsManager(this);
        this.music = new MusicManager(this);
        this.bossMechanics = new BossMechanicsManager(this);

        // Initialize SaveService and register subsystems
        SaveService.init(CONFIG.saveKey);
        this._registerSaveSubsystems();

        this.dreadLevel = 0;
        this.speedIndex = 0;
        this.selectedForgeRelic = null;
        this.autoRetryEnabled = false;
        this.autoAdvanceEnabled = false;
        this.autoBuyEnabled = false;
        this.isGameOver = false;
        this.retryTimeoutId = null;
        this.retryIntervalId = null;
        this.gold = BigNumService.create(0);
        this.wave = 1;
        this.lastSaveTime = Date.now();
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.floatingTexts = [];
        this.turrets = [];
        this.runes = [];
        this.activeBuffs = { rage: 0, midas: 0 };
        this.castle = new Castle(this);
        this.upgrades = new UpgradeManager(this);
        this.drone = null;
        this.lastShotTime = 0;
        this.spawnTimer = 0;
        this.waveInProgress = false;
        this.enemiesToSpawn = 0;
        this.currentEffects = { ice: false, poison: false };
        this.currentProps = { bounce: 0, blast: 0, leech: 0, stasis: 0, orbital: 0 };
        this.settings = { showDamageText: true, showRange: true, autoUpgradeTurrets: false };
        this.isDirty = false;  // Track if save is needed
        this.isRushBonus = false;
        this.orbitalTimer = 0;
        this.isPaused = false;
        this.devClickCount = 0;

        this.dev = {
            addGold: (amt) => { this.addGold(amt); },
            addEther: (amt) => { this.ether = BigNumService.add(this.ether, amt); this.updateEtherUI(); },
            skipWaves: (amt) => { this.wave += amt; this.checkEvolution(); this.save(); },
            resetCooldowns: () => { for (let k in this.skills.skills) this.skills.skills[k].cdTime = 0; }
        };

        // Initialize input manager (handles resize, keyboard, mouse events)
        this.input = new InputManager(this);
        this.input.init();

        this.load();
        this.recalcRelicBonuses();
        this.updateDroneStatus();
        this.checkOfflineEarnings();
        if (this.wave === 1 && BigNumService.isZero(this.gold)) this.gold = BigNumService.create(this.metaUpgrades.getEffectValue('startGold'));
        if (this.wave === 1) this.tutorial.check(BigNumService.toNumber(this.gold));

        // Restore UI state from localStorage
        try {
            const savedTab = localStorage.getItem('aegis_ui_tab');
            if (savedTab !== null) {
                const tabId = parseInt(savedTab, 10);
                if (!isNaN(tabId) && tabId >= 0 && tabId <= 2) {
                    this.activeTab = tabId;
                }
            }
            const savedBuyMode = localStorage.getItem('aegis_ui_buyMode');
            if (savedBuyMode === '1' || savedBuyMode === 'MAX') {
                this.buyMode = savedBuyMode;
            }
        } catch (e) { /* localStorage disabled */ }

        this.updateStats();
        this.switchTab(this.activeTab);
        this.updateTierUI();
        this.updateEtherUI();
        this.updateCrystalsUI();
        this.updateAutomationUI();
        this.renderRelicGrid();
        this.stats.render();
        this.challenges.render();

        const langSelect = document.getElementById('language-select');
        if (langSelect) {
            langSelect.value = i18n.getLocale();
        }

        i18n.onLocaleChange(() => {
            this.upgrades.render(this.activeTab);
            this.stats.render();
            this.challenges.render();
            this.metaUpgrades.render();
            this.renderRelicGrid();
            this.renderMiningUI();
        });

        // Initialize event delegation for UI buttons
        this.eventDelegation = getEventDelegation(this);

        this._intervals.push(setInterval(() => {
            const miningModal = document.getElementById('mining-modal');
            if (miningModal && !miningModal.classList.contains('hidden')) {
                this.renderMiningUI();
            }
            this.updateSynergiesHUD();
            this.updateSeasonalBanner();
            this.updateSuggestedAction();
            this.updateMenuUnlocks();
        }, 500));

        if (!this.waveInProgress && document.getElementById('game-over-screen').classList.contains('hidden')) {
            this.startWave();
        }
        this.gameLoop.start();

        this._intervals.push(setInterval(() => {
            const autoStatus = document.getElementById('auto-status');
            if (this.autoBuyEnabled && !this.isPaused && !this.isGameOver && this.metaUpgrades.getEffectValue('unlockAI')) {
                this.performAutoBuy();
                autoStatus?.classList.remove('hidden');
            } else {
                autoStatus?.classList.add('hidden');
            }
        }, 500));

        // Auto-save with toast notification
        this._intervals.push(setInterval(() => {
            if (this.isDirty || Date.now() - this.lastSaveTime > CONFIG.saveIntervalMs) {
                this.save();
                this.ui?.showToast(t('notifications.autoSaved') || 'Game saved', 'success', { duration: 1500 });
            }
        }, CONFIG.saveIntervalMs || 30000));
    }

    cleanup() {
        this._intervals.forEach(id => clearInterval(id));
        this._intervals = [];

        if (this.input) this.input.cleanup();
    }

    async changeLanguage(locale) {
        // Show loading state
        const select = document.getElementById('language-select');
        if (select) select.disabled = true;
        document.body.style.cursor = 'wait';
        try {
            await i18n.setLocale(locale);
        } finally {
            if (select) select.disabled = false;
            document.body.style.cursor = '';
        }
    }

    triggerDevSecret() {
        this.devClickCount++;
        if (this.devClickCount >= 5) {
            this.devClickCount = 0;
            const btn = document.getElementById('btn-dev-menu');
            btn.classList.remove('hidden');
            this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2, t('notifications.devModeActivated'), COLORS.ERROR, 40));
        }
    }

    toggleBulk() {
        this.buyMode = this.buyMode === '1' ? 'MAX' : '1';
        this.upgrades.render(this.activeTab);
        // Persist UI state
        try {
            localStorage.setItem('aegis_ui_buyMode', this.buyMode);
        } catch (e) { /* Storage quota exceeded or disabled */ }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('btn-pause');
        if (this.isPaused) {
            btn.classList.add('bg-yellow-600');
        } else {
            btn.classList.remove('bg-yellow-600');
        }
    }

    toggleDebugPanel() {
        this.showDebugPanel = !this.showDebugPanel;
        const panel = document.getElementById('debug-panel');
        if (panel) {
            panel.classList.toggle('hidden', !this.showDebugPanel);
        } else if (this.showDebugPanel) {
            this.createDebugPanel();
        }
    }

    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.className = 'fixed top-2 left-2 bg-black/80 text-green-400 text-xs font-mono p-2 rounded z-50 min-w-[180px]';
        panel.innerHTML = `
            <div class="font-bold mb-1 text-green-300">Debug Stats</div>
            <div id="debug-fps">FPS: --</div>
            <div id="debug-frame-time">Frame: -- ms</div>
            <div id="debug-update-time">Update: -- ms</div>
            <div id="debug-render-time">Render: -- ms</div>
            <div class="border-t border-green-800 my-1 pt-1">Entities</div>
            <div id="debug-enemies">Enemies: --</div>
            <div id="debug-projectiles">Projectiles: --</div>
            <div id="debug-particles">Particles: --</div>
            <div id="debug-turrets">Turrets: --</div>
            <div id="debug-memory" class="border-t border-green-800 mt-1 pt-1">Memory: --</div>
        `;
        document.body.appendChild(panel);
        this.startDebugUpdates();
    }

    startDebugUpdates() {
        this._intervals.push(setInterval(() => {
            if (!this.showDebugPanel || !this.gameLoop) return;
            const stats = this.gameLoop.debugStats;
            const counts = stats.entityCounts;

            const fpsEl = document.getElementById('debug-fps');
            const frameEl = document.getElementById('debug-frame-time');
            const updateEl = document.getElementById('debug-update-time');
            const renderEl = document.getElementById('debug-render-time');
            const enemiesEl = document.getElementById('debug-enemies');
            const projEl = document.getElementById('debug-projectiles');
            const partEl = document.getElementById('debug-particles');
            const turretEl = document.getElementById('debug-turrets');
            const memEl = document.getElementById('debug-memory');

            if (fpsEl) fpsEl.textContent = `FPS: ${stats.fps}`;
            if (frameEl) frameEl.textContent = `Frame: ${stats.frameTime.toFixed(1)} ms`;
            if (updateEl) updateEl.textContent = `Update: ${stats.updateTime.toFixed(2)} ms`;
            if (renderEl) renderEl.textContent = `Render: ${stats.renderTime.toFixed(2)} ms`;
            if (enemiesEl) enemiesEl.textContent = `Enemies: ${counts.enemies || 0}`;
            if (projEl) projEl.textContent = `Projectiles: ${counts.projectiles || 0}`;
            if (partEl) partEl.textContent = `Particles: ${counts.particles || 0}`;
            if (turretEl) turretEl.textContent = `Turrets: ${counts.turrets || 0}`;

            if (memEl && performance.memory) {
                const mb = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
                memEl.textContent = `Memory: ${mb} MB`;
            }
        }, 200));
    }

    toggleSpeed() {
        this.speedIndex = (this.speedIndex + 1) % GAME_SPEEDS.length;
        this.speedMultiplier = GAME_SPEEDS[this.speedIndex].mult;
        document.getElementById('ui-speed').innerText = 'x' + this.speedMultiplier;
    }

    setSpeed(mult) {
        this.speedMultiplier = mult;
        this.speedIndex = GAME_SPEEDS.findIndex(s => s.mult === mult) || 0;
        const speedEl = document.getElementById('ui-speed');
        if (speedEl) speedEl.innerText = 'x' + mult;

        // Update all speed buttons
        document.querySelectorAll('[data-speed]').forEach(btn => {
            const btnSpeed = parseInt(btn.dataset.speed);
            if (btnSpeed === mult) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    toggleAutoAdvance() {
        this.autoAdvanceEnabled = !this.autoAdvanceEnabled;
        // Sync both checkboxes
        const labCheck = document.getElementById('lab-auto-advance');
        if (labCheck) labCheck.checked = this.autoAdvanceEnabled;
    }

    toggleAutoRetry() {
        this.autoRetryEnabled = !this.autoRetryEnabled;
        const labCheck = document.getElementById('lab-auto-retry');
        if (labCheck) labCheck.checked = this.autoRetryEnabled;
    }

    activateSkill(id) {
        this.skills.activate(id);
        this.tutorial.check(0);
    }

    addGold(amount) {
        this.gold = BigNumService.add(this.gold, amount);
        this.stats.registerGold(BigNumService.toNumber(amount));
        this.upgrades.render(this.activeTab);
        this.tutorial.check(BigNumService.toNumber(this.gold));
    }

    createFloatingText(x, y, text, color, size = 20) {
        return FloatingText.create(x, y, text, color, size);
    }

    createRune(x, y) {
        return new Rune(x, y, this);
    }

    createParticle(x, y, color) {
        return new Particle(x, y, color);
    }

    // Stat getter methods for UI rendering
    getDamage() {
        return this.currentDamage || 10;
    }

    getCritMult() {
        return this.currentCrit?.mult || 1.5;
    }

    getCritChance() {
        return this.currentCrit?.chance || 5;
    }

    getFireRate() {
        return this.currentFireRate || 1000;
    }

    getRange() {
        return this.currentRange || 150;
    }

    getBlastRadius() {
        return this.currentBlast || 0;
    }

    getMiningSpeedMult() {
        return this.miningSpeedMult || 1;
    }

    getMaxHealth() {
        return this.castle?.maxHp || 100;
    }

    getCurrentDPS() {
        const damage = this.getDamage();
        const fireRate = this.getFireRate();
        const turretCount = this.turrets?.length || 1;
        return (damage * turretCount * 1000) / fireRate;
    }

    getArmor() {
        return this.currentArmor || 0;
    }

    getRegen() {
        return this.currentRegen || 0;
    }

    switchTab(id) {
        this.activeTab = id;
        document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
            if (idx === id) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        this.upgrades.render(this.activeTab);
        // Persist UI state
        try {
            localStorage.setItem('aegis_ui_tab', String(id));
        } catch (e) { /* Storage quota exceeded or disabled */ }
    }

    switchLabTab(tabId) {
        // Hide all content
        document.querySelectorAll('.lab-content').forEach(c => c.classList.add('hidden'));
        // Show selected
        const content = document.getElementById(`lab-content-${tabId}`);
        if (content) content.classList.remove('hidden');
        // Update tab states
        document.querySelectorAll('.lab-primary-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        // Render content
        if (tabId === 'stats') this.renderLabStatsUI();
        if (tabId === 'passives') this.renderLabPassivesUI();
        if (tabId === 'tech') this.renderLabTechUI();
        if (tabId === 'upgrades') this.upgrades.render(this.activeTab);
    }

    switchLabPassiveTab(tab) {
        this.activeLabPassiveTab = tab;
        document.querySelectorAll('.lab-passive-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        this.renderLabPassivesUI(tab);
    }

    selectTechSpecial(type) {
        this.selectedTechSpecial = type;
        // Update button states
        ['sentry', 'rocket', 'laser', 'hallow'].forEach(t => {
            const btn = document.getElementById(`lab-tech-${t}`);
            if (btn) {
                if (t === type) {
                    btn.classList.add('bg-cyan-900/50', 'border-cyan-700', 'text-cyan-400');
                    btn.classList.remove('bg-slate-700/50', 'border-slate-600', 'text-slate-400');
                } else {
                    btn.classList.remove('bg-cyan-900/50', 'border-cyan-700', 'text-cyan-400');
                    btn.classList.add('bg-slate-700/50', 'border-slate-600', 'text-slate-400');
                }
            }
        });
        this.renderLabTechUI();
    }

    updateChallengeUI() {
        this.challenges.render();
    }

    updateDroneStatus() {
        if (this.metaUpgrades.getEffectValue('unlockDrone') && !this.drone) {
            this.drone = new Drone(this);
            this.drone.canCollect = true;
        }
    }

    activateRune(rune) {
        if (rune.type.instant) {
            if (rune.type.id === 'heal') this.castle.heal(this.castle.maxHp * 0.25);
        } else {
            this.activeBuffs[rune.type.id] = rune.type.duration;
        }
        this.floatingTexts.push(FloatingText.create(rune.x, rune.y - 20, t(rune.type.nameKey) + '!', rune.type.color, 24));
        this.sound.play('coin');
    }

    checkOfflineEarnings() {
        const now = Date.now();
        const diffMs = now - this.lastSaveTime;
        const diffSec = diffMs / 1000;
        const cappedDiffSec = Math.min(diffSec, CONFIG.maxOfflineHours * 3600);

        if (cappedDiffSec > 60) {
            // Base gold from wave progress
            const baseGold = this.wave * 10;

            // Multipliers (stacking)
            const goldMult = this.metaUpgrades.getEffectValue('goldMult');
            const relicMult = 1 + (this.relicMults.gold || 0);
            const prestigeMult = this.prestige?.getEffectValue('prestige_gold') || 1;
            const totalMult = goldMult * relicMult * prestigeMult;

            // Production building earnings
            let productionEarnings = 0;
            if (this.production) {
                PRODUCTION_BUILDINGS.forEach(b => {
                    const rate = this.production.getProductionRate(b.id);
                    if (b.resource === 'gold') {
                        productionEarnings += rate * cappedDiffSec;
                    }
                });
            }

            const earned = Math.floor((baseGold * (cappedDiffSec / 60) * totalMult) + productionEarnings);

            if (earned > 0) {
                this.gold = BigNumService.add(this.gold, earned);
                this.stats.registerGold(earned);
                document.getElementById('offline-gold').innerText = formatNumber(earned);

                // Show offline time and rate
                const hours = Math.floor(cappedDiffSec / 3600);
                const mins = Math.floor((cappedDiffSec % 3600) / 60);
                const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                const offlineTimeEl = document.getElementById('offline-time');
                if (offlineTimeEl) offlineTimeEl.innerText = timeStr;

                const offlineRateEl = document.getElementById('offline-rate');
                if (offlineRateEl) {
                    const ratePerMin = Math.floor(earned / (cappedDiffSec / 60));
                    offlineRateEl.innerText = formatNumber(ratePerMin);
                }

                // Show bonus if applicable
                const bonusPercent = Math.round((totalMult - 1) * 100);
                const offlineBonusEl = document.getElementById('offline-bonus');
                const offlineBonusValueEl = document.getElementById('offline-bonus-value');
                if (offlineBonusEl && offlineBonusValueEl && bonusPercent > 0) {
                    offlineBonusValueEl.innerText = `+${bonusPercent}%`;
                    offlineBonusEl.classList.remove('hidden');
                } else if (offlineBonusEl) {
                    offlineBonusEl.classList.add('hidden');
                }

                document.getElementById('offline-modal').classList.remove('hidden');
            }
        }
    }

    tryDropRelic() {
        if (Math.random() < 0.25) {
            const uncollected = RELIC_DB.filter(r => !this.relics.includes(r.id));
            if (uncollected.length > 0) {
                const drop = uncollected[Math.floor(Math.random() * uncollected.length)];
                this.relics.push(drop.id);
                this.recalcRelicBonuses();
                this.updateStats();
                this.renderRelicGrid();
                this.showLootPopup(drop);
                this.save();
                this.sound.play('levelup');
            }
        }
    }

    recalcRelicBonuses() {
        this.relicMults = { damage: 0, gold: 0, speed: 0, critChance: 0, health: 0, cooldown: 0, mining: 0, leech: 0, dreadReward: 0, critDamage: 0, revive: false, autoSkill: false };
        this.relics.forEach(id => {
            const r = RELIC_DB.find(db => db.id === id);
            if (r) r.effect(this);
        });
    }

    onBossKill() {
        const baseCrystals = Math.floor(this.wave / CONFIG.crystalWaveDivisor) + 1;
        const dreadBonus = 1 + (this.dreadLevel * CONFIG.dreadBonusPerLevel);
        const crystalAffinity = 1 + (this.researchEffects.crystalGain || 0);
        const crystalsEarned = Math.floor(baseCrystals * dreadBonus * crystalAffinity);
        this.crystals = BigNumService.add(this.crystals, crystalsEarned);
        this.updateCrystalsUI();
        this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 3, `+${crystalsEarned} ${t('currency.crystals')}`, COLORS.CRYSTAL, 28));

        if (this.town.hasUnlock('office') && Math.random() < 0.3) {
            const gemsEarned = Math.floor((this.wave / 20) + 1);
            this.office.addGems(gemsEarned);
            this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 3 + 40, `+${gemsEarned} 💠`, COLORS.GEM, 24));
        }
    }

    setDreadLevel(level) {
        const oldLevel = this.dreadLevel;
        this.dreadLevel = Math.max(0, Math.min(10, level));

        // Visual feedback for dread change
        if (oldLevel !== this.dreadLevel) {
            const dread = DREAD_LEVELS[this.dreadLevel];
            const direction = this.dreadLevel > oldLevel ? '⬆️' : '⬇️';

            // Show toast notification
            if (this.ui?.showToast) {
                this.ui.showToast(
                    `${direction} ${t('dread.level')} ${this.dreadLevel}: ${t(dread.nameKey)}`,
                    this.dreadLevel > 5 ? 'warning' : 'info'
                );
            }

            // Screen flash effect
            this.showDreadFlash(dread.color);

            // Floating text at center
            this.floatingTexts.push(FloatingText.create(
                this.width / 2,
                this.height / 2,
                `${t('dread.level')} ${this.dreadLevel}`,
                dread.color,
                32
            ));
        }

        this.updateDreadUI();
        this.isDirty = true;
        this.save();
    }

    /**
     * Show screen flash effect for dread level change
     */
    showDreadFlash(color) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${color};
            opacity: 0.3;
            pointer-events: none;
            z-index: 9999;
            transition: opacity 0.5s ease-out;
        `;
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 500);
        });
    }

    updateDreadUI() {
        const el = document.getElementById('dread-level');
        if (el) el.innerText = this.dreadLevel;

        const dreadDisplay = document.getElementById('ui-dread-display');
        if (dreadDisplay) {
            if (this.dreadLevel > 0) {
                dreadDisplay.classList.remove('hidden');
            } else {
                dreadDisplay.classList.add('hidden');
            }
        }

        this.renderDreadSelector();
    }

    renderDreadSelector() {
        const container = document.getElementById('dread-selector');
        if (!container) return;

        const maxUnlocked = Math.min(CONFIG.dread.maxUnlockedLevels, Math.floor(this.stats.maxWave / CONFIG.dread.wavesPerUnlock));

        container.innerHTML = '';
        DREAD_LEVELS.forEach(dread => {
            const isUnlocked = dread.level <= maxUnlocked;
            const isSelected = dread.level === this.dreadLevel;

            const btn = document.createElement('button');
            btn.className = `dread-level ${isUnlocked ? '' : 'locked'} ${isSelected ? 'active' : ''}`;
            btn.dataset.level = dread.level;
            btn.innerHTML = `${dread.level}`;
            btn.style.color = dread.color;

            if (isUnlocked) {
                btn.onclick = () => {
                    this.setDreadLevel(dread.level);
                };
            }

            container.appendChild(btn);
        });

        const infoTitle = document.getElementById('dread-info-title');
        const infoBonus = document.getElementById('dread-info-bonus');
        const infoDifficulty = document.getElementById('dread-info-difficulty');

        const currentDread = DREAD_LEVELS[this.dreadLevel];
        if (currentDread && infoTitle && infoBonus && infoDifficulty) {
            infoTitle.innerText = t(currentDread.nameKey);
            const mult = this.getDreadMultipliers();
            infoBonus.innerHTML = `${t('dread.bonus')}: +${Math.floor((mult.crystalBonus - 1) * 100)}% ${t('currency.crystals')}, +${Math.floor((mult.etherBonus - 1) * 100)}% Ether`;
            infoDifficulty.innerHTML = `${t('dread.difficulty')}: HP x${mult.enemyHp.toFixed(1)}, DMG x${mult.enemyDamage.toFixed(1)}, SPD x${mult.enemySpeed.toFixed(1)}`;
        }
    }

    getDreadMultipliers() {
        const level = this.dreadLevel;
        return {
            enemyHp: 1 + (level * 0.5),
            enemyDamage: 1 + (level * 0.3),
            enemySpeed: 1 + (level * 0.1),
            crystalBonus: 1 + (level * 0.25),
            etherBonus: 1 + (level * 0.2)
        };
    }

    canSurrender() {
        return this.wave >= 5 && !this.isGameOver;
    }

    strategicSurrender() {
        if (!this.canSurrender()) return;

        const surrenderBonus = 1.5;
        const dreadMult = this.getDreadMultipliers();

        const bonusEther = Math.floor(this.wave * surrenderBonus * dreadMult.etherBonus);
        const bonusGold = BigNumService.floor(BigNumService.mul(this.gold, 0.1));

        this.ether = BigNumService.add(this.ether, bonusEther);
        this.gold = BigNumService.add(this.gold, bonusGold);

        this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2 - 50, t('surrender.bonus'), COLORS.SUCCESS, 32));
        this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2, `+${bonusEther} 🔮`, COLORS.ETHER, 28));
        this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2 + 40, `+${formatNumber(bonusGold)} ${t('game.gold')}`, COLORS.GOLD, 24));

        this.sound.play('levelup');
        this.gameOver();
    }

    updateSurrenderButton() {
        const btn = document.getElementById('btn-surrender');
        if (btn) {
            if (this.canSurrender()) {
                btn.classList.remove('hidden');
            } else {
                btn.classList.add('hidden');
            }
        }
    }

    updateWavePreview() {
        const previewContent = document.getElementById('wave-preview-content');
        if (!previewContent) return;

        const nextWave = this.wave + 1;
        const isBoss = nextWave % 10 === 0;

        let html = '';
        if (isBoss) {
            html = `<div class="text-red-400 font-bold">⚠️ ${t('game.boss')} ⚠️</div>`;
        } else {
            // Calculate approximate enemies for next wave
            const baseCount = Math.ceil(nextWave * 1.5) + 3;
            const enemyTypes = [];

            if (nextWave >= 1) enemyTypes.push({ icon: '👾', name: 'Basic' });
            if (nextWave >= 5) enemyTypes.push({ icon: '🏃', name: 'Fast' });
            if (nextWave >= 10) enemyTypes.push({ icon: '🛡️', name: 'Tank' });
            if (nextWave >= 15) enemyTypes.push({ icon: '✨', name: 'Shielded' });
            if (nextWave >= 20) enemyTypes.push({ icon: '💀', name: 'Elite' });

            html = `<div>~${baseCount} ${t('game.enemies').toLowerCase()}</div>`;
            html += `<div class="flex gap-1 mt-1">${enemyTypes.map(e => `<span title="${e.name}">${e.icon}</span>`).join('')}</div>`;
        }
        previewContent.innerHTML = html;
    }

    t(key) {
        return t(key);
    }

    updateCrystalsUI() {
        const el = document.getElementById('ui-crystals');
        if (el) el.innerText = formatNumber(this.crystals);
    }

    renderMiningUI() {
        const grid = document.getElementById('mining-grid');
        if (!grid) return;

        grid.innerHTML = '';

        MINING_RESOURCES.forEach(resource => {
            const amount = this.miningResources[resource.id] || 0;
            const isMining = this.mining.isMining(resource.id);
            const progress = this.mining.getProgress(resource.id);

            const div = document.createElement('div');
            div.className = 'bg-slate-700 p-3 rounded border border-slate-600 flex flex-col gap-2';

            div.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">${escapeHtml(resource.icon)}</span>
                        <span class="font-bold" style="color: ${sanitizeColor(resource.color)}">${t(resource.nameKey)}</span>
                    </div>
                    <span class="text-white font-mono">${formatNumber(amount)}</span>
                </div>
                <div class="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div class="h-full transition-all duration-200" style="width: ${isMining ? progress * 100 : 0}%; background: ${sanitizeColor(resource.color)}"></div>
                </div>
                <button class="mining-btn text-xs py-1 px-2 rounded font-bold ${isMining ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-600 hover:bg-cyan-500'} text-white" data-resource="${resource.id}">
                    ${isMining ? t('mining.stop') : t('mining.start')}
                </button>
            `;

            grid.appendChild(div);
        });

        grid.querySelectorAll('.mining-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resourceId = e.target.dataset.resource;
                if (this.mining.isMining(resourceId)) {
                    this.mining.stopMining(resourceId);
                } else {
                    this.mining.startMining(resourceId);
                }
            });
        });

        const slotsEl = document.getElementById('mining-slots');
        if (slotsEl) {
            slotsEl.innerText = `${this.mining.activeMiners.length}/${this.mining.maxMiners}`;
        }
    }

    renderForgeUI() {
        const grid = document.getElementById('forge-recipes');
        if (!grid) return;

        grid.innerHTML = '';

        FORGE_RECIPES.forEach(recipe => {
            const canAfford = this.forge.canAfford(recipe);
            const needsRelic = recipe.type === 'upgrade' || recipe.type === 'reroll';

            const costHtml = Object.entries(recipe.cost).map(([res, amt]) => {
                const resource = MINING_RESOURCES.find(r => r.id === res);
                const owned = this.miningResources[res] || 0;
                const color = owned >= amt ? 'text-green-400' : 'text-red-400';
                return `<span class="${color}">${resource?.icon || res} ${owned}/${amt}</span>`;
            }).join(' ');

            const div = document.createElement('div');
            div.className = `bg-slate-700 p-4 rounded border ${canAfford ? 'border-yellow-600' : 'border-slate-600'} flex flex-col gap-2`;

            div.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="font-bold text-yellow-400">${t(recipe.nameKey)}</span>
                    <span class="text-xs text-slate-400">${Math.floor(recipe.successRate * 100)}%</span>
                </div>
                <div class="text-xs text-slate-300">${t(recipe.descKey)}</div>
                <div class="text-xs">${costHtml}</div>
                ${needsRelic ? `
                <select class="forge-relic-select bg-slate-800 text-white text-xs p-1 rounded border border-slate-600" data-recipe="${recipe.id}">
                    <option value="">${t('forge.selectRelic')}</option>
                    ${this.relics.map(id => {
                        const r = RELIC_DB.find(db => db.id === id);
                        return r ? `<option value="${id}">${r.icon} ${t(r.nameKey)} (T${r.tier})</option>` : '';
                    }).join('')}
                </select>
                ` : ''}
                <button class="forge-btn text-xs py-2 px-3 rounded font-bold ${canAfford ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-slate-600 cursor-not-allowed'} text-white"
                    data-recipe="${recipe.id}" ${!canAfford ? 'disabled' : ''}>
                    ${t('forge.craft')}
                </button>
            `;

            grid.appendChild(div);
        });

        grid.querySelectorAll('.forge-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recipeId = e.target.dataset.recipe;
                const recipe = FORGE_RECIPES.find(r => r.id === recipeId);
                const needsRelic = recipe.type === 'upgrade' || recipe.type === 'reroll';

                let relicId = null;
                if (needsRelic) {
                    const select = grid.querySelector(`.forge-relic-select[data-recipe="${recipeId}"]`);
                    relicId = select?.value;
                    if (!relicId) {
                        this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2, t('forge.selectRelic'), COLORS.ERROR, 24));
                        return;
                    }
                }

                const result = this.forge.execute(recipeId, relicId);

                if (result.success) {
                    this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2, t('forge.success'), COLORS.SUCCESS, 32));
                    if (result.result) {
                        this.showLootPopup(result.result);
                    }
                    this.sound.play('levelup');
                } else if (result.reason === 'failed') {
                    this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2, t('forge.failed'), COLORS.ERROR, 32));
                    this.sound.play('gameover');
                } else if (result.reason === 'cost') {
                    this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2, t('forge.notEnough'), COLORS.ERROR, 24));
                }

                this.renderForgeUI();
                this.renderMiningUI();
            });
        });
    }

    renderResearchUI() {
        const container = document.getElementById('research-branches');
        if (!container) return;

        const crystalsEl = document.getElementById('research-crystals');
        if (crystalsEl) crystalsEl.innerText = formatNumber(this.crystals);

        container.innerHTML = '';

        RESEARCH_TREE.forEach(branch => {
            const branchDiv = document.createElement('div');
            branchDiv.className = 'bg-slate-700 p-4 rounded border border-slate-600';

            const headerColor = branch.id === 'offense' ? 'text-red-400' : (branch.id === 'defense' ? 'text-blue-400' : 'text-green-400');

            branchDiv.innerHTML = `
                <h3 class="font-bold ${headerColor} text-lg mb-3">${t(branch.nameKey)}</h3>
                <div class="research-nodes space-y-2">
                    ${branch.nodes.map(node => {
                        const purchased = this.research.purchased[node.id];
                        const canBuy = this.research.canPurchase(node);
                        const bgColor = purchased ? 'bg-green-900/50 border-green-500' : (canBuy ? 'bg-slate-800 border-yellow-500' : 'bg-slate-900 border-slate-600');

                        return `
                            <div class="p-3 rounded border ${bgColor}">
                                <div class="flex justify-between items-center">
                                    <span class="font-bold text-white">${t(node.nameKey)}</span>
                                    <span class="text-xs text-cyan-400">💎 ${node.cost}</span>
                                </div>
                                <div class="text-xs text-slate-300 mt-1">${t(node.descKey)}</div>
                                ${!purchased ? `
                                    <button class="research-btn mt-2 text-xs py-1 px-3 rounded font-bold ${canBuy ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-slate-600 cursor-not-allowed'} text-white"
                                        data-node="${node.id}" ${!canBuy ? 'disabled' : ''}>
                                        ${purchased ? t('research.purchased') : t('research.purchase')}
                                    </button>
                                ` : `<span class="text-xs text-green-400 mt-2 block">${t('research.purchased')}</span>`}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            container.appendChild(branchDiv);
        });

        container.querySelectorAll('.research-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nodeId = e.target.dataset.node;
                const result = this.research.purchase(nodeId);

                if (result.success) {
                    this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2, t('research.unlocked'), COLORS.SUCCESS, 32));
                    this.sound.play('levelup');
                } else {
                    this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2, t('research.cannotPurchase'), COLORS.ERROR, 24));
                }

                this.renderResearchUI();
            });
        });
    }

    showLootPopup(relic) {
        const div = document.createElement('div');
        div.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black font-bold p-4 rounded-xl border-4 border-white shadow-2xl z-40 loot-popup';
        div.innerHTML = `<div>🏆 ${t('notifications.relicObtained')}</div><div class="text-2xl mt-1">${escapeHtml(relic.icon)} ${t(relic.nameKey)}</div><div class="text-xs font-normal">${t(relic.descKey)}</div>`;
        document.getElementById('loot-container').appendChild(div);
        setTimeout(() => div.remove(), 2000);
    }

    renderProductionUI() {
        const container = document.getElementById('production-grid');
        const summaryContainer = document.getElementById('production-summary');
        if (!container) return;

        // Render production summary
        if (summaryContainer) {
            const totals = {};
            PRODUCTION_BUILDINGS.forEach(building => {
                const rate = this.production.getProductionRate(building.id);
                if (!totals[building.resource]) totals[building.resource] = 0;
                totals[building.resource] += rate;
            });

            const resourceIcons = { gold: '💰', crystal: '💎', ether: '🔮', void_shard: '🌑' };
            summaryContainer.innerHTML = Object.entries(totals).map(([resource, rate]) =>
                `<div class="bg-slate-800 p-2 rounded">
                    <div class="text-lg">${resourceIcons[resource] || '?'}</div>
                    <div class="text-green-400 font-bold">+${rate.toFixed(2)}/${t('units.second')}</div>
                </div>`
            ).join('');
        }

        container.innerHTML = '';

        PRODUCTION_BUILDINGS.forEach(building => {
            const data = this.production.buildings[building.id];
            const level = data?.level || 0;
            const cost = this.production.getBuildingCost(building.id);
            const rate = this.production.getProductionRate(building.id);
            const canAfford = BigNumService.gte(this.gold, cost);
            const isMaxed = level >= building.maxLevel;

            const div = document.createElement('div');
            div.className = `p-4 rounded-xl border-2 transition-all ${isMaxed ? 'bg-slate-700 border-slate-600 opacity-75' : canAfford ? 'bg-orange-900/40 border-orange-500 hover:bg-orange-800/60 cursor-pointer' : 'bg-slate-800 border-slate-700 opacity-60'}`;

            div.innerHTML = `
                <div class="flex items-center gap-3 mb-2">
                    <span class="text-3xl">${building.icon}</span>
                    <div>
                        <div class="font-bold text-white">${t(building.nameKey)}</div>
                        <div class="text-xs text-slate-400">${t(building.descKey)}</div>
                    </div>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-orange-300">${t('production.level')}: ${level}/${building.maxLevel}</span>
                    <span class="text-green-400">${rate > 0 ? `+${rate.toFixed(2)}/${t('units.second')}` : '-'}</span>
                </div>
                ${!isMaxed ? `
                    <button class="production-btn mt-2 w-full py-2 rounded font-bold text-white ${canAfford ? 'bg-orange-600 hover:bg-orange-500' : 'bg-slate-600 cursor-not-allowed'}"
                        data-building="${building.id}" ${!canAfford ? 'disabled' : ''}>
                        ${t('production.upgrade')} - ${formatNumber(cost)} 💰
                    </button>
                ` : `<div class="text-center text-yellow-400 text-sm mt-2">${t('lab.max')}</div>`}
            `;

            container.appendChild(div);
        });

        container.querySelectorAll('.production-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const buildingId = e.target.dataset.building;
                if (this.production.upgrade(buildingId)) {
                    this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2, t('production.upgraded'), COLORS.SUCCESS, 24));
                    this.sound.play('levelup');
                }
                this.renderProductionUI();
            });
        });
    }

    renderDailyQuestsUI() {
        const container = document.getElementById('quests-grid');
        const timerEl = document.getElementById('quests-timer');
        if (!container) return;

        this.dailyQuests.generateQuests();

        const timeLeft = this.dailyQuests.getTimeUntilReset();
        const hours = Math.floor(timeLeft / 3600000);
        const minutes = Math.floor((timeLeft % 3600000) / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        if (timerEl) timerEl.innerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        container.innerHTML = '';

        if (this.dailyQuests.quests.length === 0) {
            container.innerHTML = `<div class="text-slate-500 text-center py-8">${t('quests.noQuests')}</div>`;
            return;
        }

        this.dailyQuests.quests.forEach(quest => {
            const progress = this.dailyQuests.progress[quest.id] || 0;
            const percent = Math.min(100, (progress / quest.target) * 100);

            const div = document.createElement('div');
            div.className = `p-4 rounded-xl border-2 transition-all ${quest.completed ? 'bg-emerald-900/40 border-emerald-500' : 'bg-slate-800 border-slate-600'}`;

            const rewardIcon = quest.rewardType === 'gold' ? '💰' : (quest.rewardType === 'crystals' ? '💎' : '🔮');

            div.innerHTML = `
                <div class="flex items-center gap-3 mb-2">
                    <span class="text-3xl">${quest.icon}</span>
                    <div class="flex-1">
                        <div class="font-bold text-white">${t(quest.nameKey)}</div>
                        <div class="text-xs text-slate-400">${t(quest.descKey)}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-emerald-400 font-bold">+${quest.reward} ${rewardIcon}</div>
                    </div>
                </div>
                <div class="relative h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div class="absolute inset-0 h-full bg-emerald-500 transition-all" style="width: ${percent}%"></div>
                    <div class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        ${progress}/${quest.target} ${quest.completed ? `✓ ${t('quests.completed')}` : ''}
                    </div>
                </div>
            `;

            container.appendChild(div);
        });
    }

    renderPrestigeUI() {
        const pointsEl = document.getElementById('prestige-points');
        const potentialEl = document.getElementById('prestige-potential');
        const totalEl = document.getElementById('prestige-total');
        const btnEl = document.getElementById('btn-prestige');
        const container = document.getElementById('prestige-upgrades-grid');
        const waveSkipEl = document.getElementById('prestige-wave-skip');
        const autoPrestigeToggle = document.getElementById('toggle-auto-prestige');
        const autoPrestigeWaveInput = document.getElementById('auto-prestige-wave');

        if (pointsEl) pointsEl.innerText = this.prestige.prestigePoints;
        if (potentialEl) potentialEl.innerText = this.prestige.calculatePrestigePoints();
        if (totalEl) totalEl.innerText = this.prestige.totalPrestiges;
        if (btnEl) btnEl.disabled = !this.prestige.canPrestige();

        // Wave skip display
        const waveSkip = this.prestige.getWaveSkipAmount();
        if (waveSkipEl) {
            if (waveSkip > 0) {
                waveSkipEl.innerText = `+${waveSkip}`;
                waveSkipEl.parentElement.classList.remove('hidden');
            } else {
                waveSkipEl.parentElement.classList.add('hidden');
            }
        }

        // Auto-prestige controls
        if (autoPrestigeToggle) {
            autoPrestigeToggle.checked = this.prestige.autoPrestige;
            autoPrestigeToggle.onchange = (e) => {
                this.prestige.autoPrestige = e.target.checked;
                this.save();
            };
        }
        if (autoPrestigeWaveInput) {
            autoPrestigeWaveInput.value = this.prestige.autoPrestigeWave;
            autoPrestigeWaveInput.onchange = (e) => {
                this.prestige.autoPrestigeWave = Math.max(25, parseInt(e.target.value) || 30);
                this.save();
            };
        }

        if (!container) return;
        container.innerHTML = '';

        PRESTIGE_UPGRADES.forEach(upgrade => {
            const level = this.prestige.upgrades[upgrade.id] || 0;
            const cost = this.prestige.getUpgradeCost(upgrade.id);
            const canAfford = this.prestige.prestigePoints >= cost;
            const isMaxed = level >= upgrade.maxLevel;
            const effectValue = upgrade.effect(level);
            const nextValue = upgrade.effect(level + 1);

            const div = document.createElement('div');
            div.className = `p-4 rounded-xl border-2 transition-all ${isMaxed ? 'bg-slate-700 border-slate-600 opacity-75' : canAfford ? 'bg-amber-900/40 border-amber-500 hover:bg-amber-800/60 cursor-pointer' : 'bg-slate-800 border-slate-700 opacity-60'}`;

            div.innerHTML = `
                <div class="flex items-center gap-3 mb-2">
                    <span class="text-3xl">${upgrade.icon}</span>
                    <div class="flex-1">
                        <div class="font-bold text-white">${t(upgrade.nameKey)}</div>
                        <div class="text-xs text-slate-400">${t(upgrade.descKey)}</div>
                    </div>
                </div>
                <div class="flex justify-between items-center text-sm mb-2">
                    <span class="text-amber-300">${t('lab.level')} ${level}/${upgrade.maxLevel}</span>
                    <span class="text-green-400">${typeof effectValue === 'number' ? (effectValue % 1 === 0 ? effectValue : effectValue.toFixed(2)) : effectValue}</span>
                </div>
                ${!isMaxed ? `
                    <button class="prestige-btn mt-2 w-full py-2 rounded font-bold text-white ${canAfford ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-600 cursor-not-allowed'}"
                        data-upgrade="${upgrade.id}" ${!canAfford ? 'disabled' : ''}>
                        ${t('prestige.buy')} - ${cost} 👑
                    </button>
                ` : `<div class="text-center text-yellow-400 text-sm">${t('lab.max')}</div>`}
            `;

            container.appendChild(div);
        });

        container.querySelectorAll('.prestige-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgradeId = e.target.dataset.upgrade;
                if (this.prestige.buyUpgrade(upgradeId)) {
                    this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2, t('prestige.upgraded'), COLORS.GOLD, 24));
                    this.sound.play('levelup');
                }
                this.renderPrestigeUI();
            });
        });
    }

    renderChipsUI() {
        const inventoryContainer = document.getElementById('chips-inventory');
        const equippedContainer = document.getElementById('chips-equipped');

        if (!inventoryContainer || !equippedContainer) return;

        inventoryContainer.innerHTML = '';
        equippedContainer.innerHTML = '';

        const rarityColors = { 1: 'border-slate-500', 2: 'border-blue-500', 3: 'border-purple-500', 4: 'border-yellow-500' };
        const rarityBgs = { 1: 'bg-slate-800', 2: 'bg-blue-900/30', 3: 'bg-purple-900/30', 4: 'bg-yellow-900/30' };

        if (this.chips.inventory.length === 0) {
            inventoryContainer.innerHTML = `<div class="col-span-4 text-slate-500 text-center py-4">${t('chips.empty')}</div>`;
        } else {
            this.chips.inventory.forEach(chip => {
                const div = document.createElement('div');
                div.className = `p-3 rounded border-2 ${rarityColors[chip.rarity]} ${rarityBgs[chip.rarity]} cursor-pointer hover:opacity-80 transition`;
                div.innerHTML = `
                    <div class="text-2xl text-center">${chip.icon}</div>
                    <div class="text-xs text-center font-bold text-white mt-1">${t(chip.nameKey)}</div>
                `;
                div.title = t(chip.descKey);
                inventoryContainer.appendChild(div);
            });
        }

        this.turrets.forEach((turret, idx) => {
            const chips = this.chips.turretChips[idx] || [];
            const div = document.createElement('div');
            div.className = 'bg-slate-700 p-3 rounded border border-slate-600';
            div.innerHTML = `
                <div class="font-bold text-pink-400 mb-2">${t('chips.turret')} ${idx + 1}</div>
                <div class="flex gap-2">
                    ${[0, 1, 2].map(slotIdx => {
                        const chip = chips[slotIdx];
                        if (chip) {
                            return `<div class="w-12 h-12 rounded border-2 ${rarityColors[chip.rarity]} ${rarityBgs[chip.rarity]} flex items-center justify-center text-xl" title="${t(chip.nameKey)}">${chip.icon}</div>`;
                        } else {
                            return `<div class="w-12 h-12 rounded border-2 border-dashed border-slate-500 flex items-center justify-center text-slate-500">+</div>`;
                        }
                    }).join('')}
                </div>
            `;
            equippedContainer.appendChild(div);
        });
    }

    renderTownUI() {
        const levelEl = document.getElementById('town-level');
        const levelIconEl = document.getElementById('town-level-icon');
        const xpEl = document.getElementById('town-xp');
        const nextXpEl = document.getElementById('town-next-xp');
        const progressEl = document.getElementById('town-progress');
        const unlocksGrid = document.getElementById('town-unlocks-grid');

        if (!levelEl || !unlocksGrid) return;

        const current = this.town.getCurrentLevel();
        const next = this.town.getNextLevel();

        levelEl.innerText = this.town.level;
        levelIconEl.innerText = current.icon;
        xpEl.innerText = formatNumber(this.town.xp);
        nextXpEl.innerText = next ? formatNumber(next.xpRequired) : t('town.maxLevel');
        progressEl.style.width = `${this.town.getXPProgress()}%`;

        unlocksGrid.innerHTML = '';
        TOWN_LEVELS.forEach(lvl => {
            const unlocked = this.town.level >= lvl.level;
            const div = document.createElement('div');
            div.className = `p-3 rounded border ${unlocked ? 'border-teal-500 bg-teal-900/30' : 'border-slate-600 bg-slate-800 opacity-50'}`;
            div.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">${lvl.icon}</span>
                    <span class="font-bold ${unlocked ? 'text-teal-400' : 'text-slate-500'}">${t(lvl.nameKey)}</span>
                </div>
                <div class="text-xs text-slate-400">${t('town.requires')} ${formatNumber(lvl.xpRequired)} ${t('units.xp')}</div>
                <div class="text-xs text-slate-300 mt-1">${lvl.unlocks.map(u => t(`town.unlock.${u}`)).join(', ')}</div>
            `;
            unlocksGrid.appendChild(div);
        });

        const schoolBtn = document.getElementById('btn-school');
        const officeBtn = document.getElementById('btn-office');
        const awakeningBtn = document.getElementById('btn-awakening');
        if (schoolBtn) schoolBtn.classList.toggle('hidden', !this.town.hasUnlock('school'));
        if (officeBtn) officeBtn.classList.toggle('hidden', !this.town.hasUnlock('office'));
        if (awakeningBtn) awakeningBtn.classList.toggle('hidden', !this.town.hasUnlock('awakening'));
    }

    renderSchoolUI() {
        const crystalsEl = document.getElementById('school-crystals');
        const grid = document.getElementById('school-turrets-grid');

        if (!crystalsEl || !grid) return;

        crystalsEl.innerText = formatNumber(this.crystals);
        grid.innerHTML = '';

        SCHOOL_TURRETS.forEach(turret => {
            const unlocked = this.school.isUnlocked(turret.id);
            const level = this.school.getLevel(turret.id);
            const maxed = level >= turret.maxLevel;

            const div = document.createElement('div');
            div.className = `p-3 rounded border ${unlocked ? 'border-indigo-500 bg-indigo-900/30' : 'border-slate-600 bg-slate-800'}`;
            div.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">${escapeHtml(turret.icon)}</span>
                    <div>
                        <div class="font-bold ${unlocked ? 'text-indigo-400' : 'text-slate-400'}">${t(turret.nameKey)}</div>
                        ${unlocked ? `<div class="text-xs text-slate-300">${t('school.level')} ${level}/${turret.maxLevel}</div>` : ''}
                    </div>
                </div>
                <div class="text-xs text-slate-400 mb-2">${t(turret.descKey)}</div>
                ${!unlocked ? `
                    <button data-action="school.unlock" data-id="${turret.id}" class="w-full px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded ${BigNumService.gte(this.crystals, turret.unlockCost) ? '' : 'opacity-50 cursor-not-allowed'}">
                        ${t('school.unlock')} (${turret.unlockCost} 💎)
                    </button>
                ` : maxed ? `
                    <div class="text-center text-xs text-yellow-400">${t('school.maxed')}</div>
                ` : `
                    <button data-action="school.levelUp" data-id="${turret.id}" class="w-full px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded ${BigNumService.gte(this.crystals, this.school.getLevelUpCost(turret.id)) ? '' : 'opacity-50 cursor-not-allowed'}">
                        ${t('school.upgrade')} (${this.school.getLevelUpCost(turret.id)} 💎)
                    </button>
                `}
            `;
            grid.appendChild(div);
        });
    }

    renderOfficeUI() {
        const gemsEl = document.getElementById('office-gems');
        const activeContainer = document.getElementById('office-active-boosts');
        const grid = document.getElementById('office-boosts-grid');

        if (!gemsEl || !grid) return;

        gemsEl.innerText = formatNumber(this.office.gems);

        activeContainer.innerHTML = '';
        const activeBoosts = this.office.getActiveBoosts();
        if (activeBoosts.length === 0) {
            activeContainer.innerHTML = `<div class="text-slate-500 text-center py-2">${t('office.noActive')}</div>`;
        } else {
            activeBoosts.forEach(ab => {
                const div = document.createElement('div');
                div.className = 'flex items-center justify-between bg-lime-900/30 p-2 rounded border border-lime-700';
                div.innerHTML = `
                    <span>${ab.boost.icon} ${t(ab.boost.nameKey)}</span>
                    <span class="text-lime-400">${Math.ceil(ab.remaining)}s</span>
                `;
                activeContainer.appendChild(div);
            });
        }

        grid.innerHTML = '';
        OFFICE_BOOSTS.forEach(boost => {
            const active = this.office.hasActiveBoost(boost.id);
            const canAfford = this.office.gems >= boost.baseCost;

            const div = document.createElement('div');
            div.className = `p-3 rounded border ${active ? 'border-lime-400 bg-lime-900/50' : 'border-slate-600 bg-slate-800'}`;
            div.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">${boost.icon}</span>
                    <div>
                        <div class="font-bold text-lime-400">${t(boost.nameKey)}</div>
                        <div class="text-xs text-slate-300">${boost.mult}x - ${boost.duration}s</div>
                    </div>
                </div>
                <div class="text-xs text-slate-400 mb-2">${t(boost.descKey)}</div>
                <button data-action="office.activate" data-id="${boost.id}"
                    class="w-full px-3 py-1 bg-lime-600 hover:bg-lime-500 text-white text-sm rounded ${canAfford && !active ? '' : 'opacity-50 cursor-not-allowed'}"
                    ${active || !canAfford ? 'disabled' : ''}>
                    ${active ? t('office.active') : `${t('office.activate')} (${boost.baseCost} 💠)`}
                </button>
            `;
            grid.appendChild(div);
        });
    }

    renderAwakeningUI() {
        const statusEl = document.getElementById('awakening-status');
        const requirementEl = document.getElementById('awakening-requirement');
        const awakenBtn = document.getElementById('btn-awaken');
        const grid = document.getElementById('awakening-bonuses-grid');

        if (!statusEl || !grid) return;

        if (this.awakening.isAwakened) {
            statusEl.innerText = t('awakening.awakened');
            statusEl.className = 'text-xl font-bold text-fuchsia-400 mb-2';
            requirementEl.innerText = `${t('awakening.level')} ${this.awakening.awakeningLevel}`;
            awakenBtn.classList.add('hidden');
        } else {
            statusEl.innerText = t('awakening.notAwakened');
            statusEl.className = 'text-xl font-bold text-slate-400 mb-2';
            requirementEl.innerText = `${t('awakening.requirement')} (${t('dread.level')} 6+)`;
            if (this.awakening.canAwaken()) {
                awakenBtn.classList.remove('hidden');
            } else {
                awakenBtn.classList.add('hidden');
            }
        }

        grid.innerHTML = '';
        AWAKENING_BONUSES.forEach(bonus => {
            const unlocked = this.awakening.unlockedBonuses.includes(bonus.id);
            const div = document.createElement('div');
            div.className = `p-3 rounded border ${unlocked ? 'border-fuchsia-500 bg-fuchsia-900/30' : 'border-slate-600 bg-slate-800 opacity-50'}`;
            div.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">${bonus.icon}</span>
                    <div class="font-bold ${unlocked ? 'text-fuchsia-400' : 'text-slate-500'}">${t(bonus.nameKey)}</div>
                </div>
                <div class="text-xs text-slate-400">${t(bonus.descKey)}</div>
                ${unlocked ? `<div class="text-xs text-fuchsia-400 mt-1">✓ ${t('awakening.active')}</div>` : ''}
            `;
            grid.appendChild(div);
        });
    }

    /** Defender Idle 2 Style - Stats Panel */
    renderStatsUI() {
        const grid = document.getElementById('stats-grid');
        const summary = document.getElementById('stats-summary');
        const spEl = document.getElementById('stats-sp');
        const tierEl = document.getElementById('stats-tier');
        if (!grid) return;

        // Calculate stat points available (5 per level)
        const statPoints = (this.level || 1) * 5;
        const usedPoints = this.statPointsUsed || 0;
        const availablePoints = Math.max(0, statPoints - usedPoints);

        if (spEl) spEl.innerText = availablePoints;
        if (tierEl) tierEl.innerText = this.castle?.tier || 1;

        // Stats to display (Defender Idle 2 style)
        const stats = [
            { id: 'damage', name: t('stats.damage') || 'DAMAGE', icon: '⚔️', getValue: () => Math.floor(this.getDamage()), format: (v) => `${v}` },
            { id: 'critDamage', name: t('stats.critDamage') || 'CRITICAL DAMAGE', icon: '💥', getValue: () => this.getCritMult().toFixed(2), format: (v) => `x${v}` },
            { id: 'fireRate', name: t('stats.fireRate') || 'FIRE RATE', icon: '🔥', getValue: () => (1000 / this.getFireRate()).toFixed(1), format: (v) => `${v}/s` },
            { id: 'range', name: t('stats.range') || 'RANGE', icon: '🎯', getValue: () => Math.floor(this.getRange()), format: (v) => `${v}` },
            { id: 'aoe', name: t('stats.aoe') || 'AREA OF EFFECT', icon: '💫', getValue: () => this.getBlastRadius(), format: (v) => `${v}` },
            { id: 'mining', name: t('stats.mining') || 'MINING', icon: '⛏️', getValue: () => ((this.getMiningSpeedMult() - 1) * 100).toFixed(0), format: (v) => `+${v}%` },
            { id: 'totalHealth', name: t('stats.totalHealth') || 'TOTAL HEALTH', icon: '❤️', getValue: () => Math.floor(this.getMaxHealth()), format: (v) => `${v}` }
        ];

        grid.innerHTML = '';
        stats.forEach(stat => {
            const level = this.statLevels?.[stat.id] || 0;
            const maxLevel = 100;
            const value = stat.getValue();

            const div = document.createElement('div');
            div.className = 'stat-row';
            div.innerHTML = `
                <span class="text-xl">${stat.icon}</span>
                <span class="stat-name">${stat.name}</span>
                <div class="stat-bar">${stat.format(value)}</div>
                <span class="text-amber-300 font-bold text-sm">${level}/${maxLevel}</span>
                <button data-action="stat.upgrade" data-id="${stat.id}" class="stat-btn" ${availablePoints <= 0 || level >= maxLevel ? 'disabled' : ''}>+</button>
            `;
            grid.appendChild(div);
        });

        // Summary
        if (summary) {
            summary.innerHTML = `
                <div class="stat-summary-item"><span>DPS:</span> <span class="stat-summary-value">${formatNumber(this.getCurrentDPS())}</span></div>
                <div class="stat-summary-item"><span>${t('stats.crit') || 'Crit'}:</span> <span class="stat-summary-value">${this.getCritChance()}%</span></div>
                <div class="stat-summary-item"><span>${t('stats.armor') || 'Armor'}:</span> <span class="stat-summary-value">${(this.getArmor() * 100).toFixed(0)}%</span></div>
                <div class="stat-summary-item"><span>${t('stats.regen') || 'Regen'}:</span> <span class="stat-summary-value">${this.getRegen()}/s</span></div>
            `;
        }
    }

    upgradeStat(statId) {
        const statPoints = (this.level || 1) * 5;
        const usedPoints = this.statPointsUsed || 0;
        const availablePoints = statPoints - usedPoints;

        if (availablePoints <= 0) {
            this.ui?.showToast(t('feedback.noStatPoints') || 'No stat points available', 'warning');
            return false;
        }
        if (!this.statLevels) this.statLevels = {};
        if (!this.statLevels[statId]) this.statLevels[statId] = 0;
        if (this.statLevels[statId] >= 100) {
            this.ui?.showToast(t('feedback.maxLevel') || 'Already at max level', 'warning');
            return false;
        }

        this.statLevels[statId]++;
        this.statPointsUsed = (this.statPointsUsed || 0) + 1;
        this.sound?.play('click');
        this.renderStatsUI();
        return true;
    }

    /** Redirect to Lab Passives UI (modal removed, now integrated in Lab panel) */
    renderPassivesUI(tab = 'offense') {
        this.renderLabPassivesUI(tab);
    }

    switchPassiveTab(tab) {
        this.renderLabPassivesUI(tab);
    }

    refundPassives() {
        this.passives?.refundAll();
        this.renderLabPassivesUI();
        this.renderStatsUI();
    }

    /** Defender Idle 2 Style - Technology Tree Visual by Tier */
    renderTechTreeUI() {
        const container = document.getElementById('tech-tree-container');
        if (!container) return;

        // Get unlock status from school
        const isUnlocked = (id) => this.school?.isUnlocked(id) || id === 'sentry';
        const getLevel = (id) => this.school?.getLevel(id) || 0;
        const getMaxLevel = (id) => {
            const turret = SCHOOL_TURRETS.find(t => t.id === id);
            return turret?.maxLevel || 10;
        };
        const isMastered = (id) => getLevel(id) >= getMaxLevel(id);

        // Turrets organized by tiers (like Defender Idle 2)
        const turretTiers = [
            { tier: 1, label: 'TIER I', turrets: ['sentry', 'blaster'] },
            { tier: 2, label: 'TIER II', turrets: ['laser', 'solidifier', 'swamper'] },
            { tier: 3, label: 'TIER III', turrets: ['rocket', 'sniper'] },
            { tier: 4, label: 'TIER IV', turrets: ['inferno'] }
        ];

        // Turret display names and icons
        const turretInfo = {
            sentry: { name: 'SENTRY', icon: '🔫' },
            blaster: { name: 'BLASTER', icon: '🧨' },
            laser: { name: 'LASER', icon: '📍' },
            solidifier: { name: 'SOLIDIFIER', icon: '❄️' },
            swamper: { name: 'SWAMPER', icon: '💧' },
            rocket: { name: 'ROCKET', icon: '🚀' },
            sniper: { name: 'SNIPER', icon: '🔭' },
            inferno: { name: 'INFERNO', icon: '🌋' }
        };

        container.innerHTML = '';

        turretTiers.forEach((tierData, tierIndex) => {
            // Tier header
            const tierHeader = document.createElement('div');
            tierHeader.className = 'tech-tier-header';
            tierHeader.innerHTML = `<span class="tech-tier-label">${tierData.label}</span>`;
            container.appendChild(tierHeader);

            // Turret columns for this tier
            const tierRow = document.createElement('div');
            tierRow.className = 'tech-tier-row';

            tierData.turrets.forEach(turretId => {
                const info = turretInfo[turretId];
                const unlocked = isUnlocked(turretId);
                const level = getLevel(turretId);
                const maxLevel = getMaxLevel(turretId);
                const mastered = isMastered(turretId);

                // Calculate progression stages
                const stages = [
                    { id: `${turretId}_unlock`, name: info.name, type: 'unlock', done: unlocked },
                    { id: `${turretId}_adv1`, name: 'ADV I', type: 'advancement', done: unlocked && level >= 3, requires: unlocked },
                    { id: `${turretId}_mastery`, name: 'MASTERY', type: 'mastery', done: mastered, requires: unlocked && level >= 3 },
                    { id: `${turretId}_adv2`, name: 'ADV II', type: 'advancement', done: mastered && level >= maxLevel, requires: mastered },
                    { id: `${turretId}_special`, name: 'SPECIAL', type: 'special', done: false, requires: mastered }
                ];

                const turretColumn = document.createElement('div');
                turretColumn.className = 'tech-turret-column';

                // Turret icon header
                const iconHeader = document.createElement('div');
                iconHeader.className = `tech-turret-icon ${unlocked ? 'unlocked' : 'locked'}`;
                iconHeader.innerHTML = `<span class="text-2xl">${escapeHtml(info.icon)}</span>`;
                turretColumn.appendChild(iconHeader);

                // Stages
                stages.forEach((stage, stageIndex) => {
                    // Arrow between stages
                    if (stageIndex > 0) {
                        const arrow = document.createElement('div');
                        arrow.className = `tech-stage-arrow ${stage.done ? 'active' : ''}`;
                        arrow.innerHTML = '↓';
                        turretColumn.appendChild(arrow);
                    }

                    const stageNode = document.createElement('div');
                    const canUnlock = stage.requires !== false && stage.requires !== undefined ? stage.requires : true;
                    stageNode.className = `tech-stage-node ${stage.done ? 'done' : canUnlock && !stage.done ? 'available' : 'locked'}`;
                    stageNode.innerHTML = `
                        <span class="tech-stage-name">${stage.name}</span>
                        ${!stage.done && !canUnlock ? '<span class="tech-stage-lock">🔒</span>' : ''}
                        ${stage.done ? '<span class="tech-stage-check">✓</span>' : ''}
                    `;
                    stageNode.onclick = () => this.onTechStageClick(turretId, stage);
                    turretColumn.appendChild(stageNode);
                });

                // Level indicator
                if (unlocked) {
                    const levelIndicator = document.createElement('div');
                    levelIndicator.className = 'tech-level-indicator';
                    levelIndicator.innerHTML = `<span>${t('lab.level')} ${level}/${maxLevel}</span>`;
                    turretColumn.appendChild(levelIndicator);
                }

                tierRow.appendChild(turretColumn);
            });

            container.appendChild(tierRow);

            // Arrow to next tier
            if (tierIndex < turretTiers.length - 1) {
                const tierArrow = document.createElement('div');
                tierArrow.className = 'tech-tier-arrow';
                tierArrow.innerHTML = '⬇';
                container.appendChild(tierArrow);
            }
        });
    }

    onTechStageClick(turretId, stage) {
        if (stage.done) return;
        if (stage.type === 'unlock') {
            // Open school modal to unlock this turret
            this.renderSchoolUI();
            document.getElementById('school-modal').classList.remove('hidden');
        }
        console.log('Tech stage clicked:', turretId, stage.id);
    }

    onTechNodeClick(node) {
        if (node.unlocked) return;
        // Handle unlock logic
        console.log('Tech node clicked:', node.id);
    }

    /** Lab Panel - Compact Stats UI */
    renderLabStatsUI() {
        const grid = document.getElementById('lab-stats-grid');
        const summary = document.getElementById('lab-stats-summary');
        const spEl = document.getElementById('lab-stats-sp');
        const tierEl = document.getElementById('lab-stats-tier');
        if (!grid) return;

        const statPoints = (this.level || 1) * 5;
        const usedPoints = this.statPointsUsed || 0;
        const availablePoints = Math.max(0, statPoints - usedPoints);

        if (spEl) spEl.innerText = availablePoints;
        if (tierEl) tierEl.innerText = this.castle?.tier || 1;

        const stats = [
            { id: 'damage', name: 'DMG', icon: '⚔️', getValue: () => Math.floor(this.getDamage()), format: (v) => `${v}` },
            { id: 'critDamage', name: 'CRIT', icon: '💥', getValue: () => this.getCritMult().toFixed(2), format: (v) => `x${v}` },
            { id: 'fireRate', name: 'RATE', icon: '🔥', getValue: () => (1000 / this.getFireRate()).toFixed(1), format: (v) => `${v}/s` },
            { id: 'range', name: 'RNG', icon: '🎯', getValue: () => Math.floor(this.getRange()), format: (v) => `${v}` },
            { id: 'aoe', name: 'AOE', icon: '💫', getValue: () => this.getBlastRadius(), format: (v) => `${v}` },
            { id: 'mining', name: 'MINE', icon: '⛏️', getValue: () => ((this.getMiningSpeedMult() - 1) * 100).toFixed(0), format: (v) => `+${v}%` },
            { id: 'totalHealth', name: 'HP', icon: '❤️', getValue: () => Math.floor(this.getMaxHealth()), format: (v) => `${v}` }
        ];

        grid.innerHTML = '';
        stats.forEach(stat => {
            const level = this.statLevels?.[stat.id] || 0;
            const value = stat.getValue();

            const div = document.createElement('div');
            div.className = 'lab-stat-card';
            div.innerHTML = `
                <div class="flex items-center gap-2">
                    <span>${stat.icon}</span>
                    <span class="text-xs text-slate-400">${stat.name}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-white">${stat.format(value)}</span>
                    <span class="text-xs text-amber-400">${level}/100</span>
                    <button data-upgrade-stat="${stat.id}" class="w-5 h-5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded stat-upgrade-btn" ${availablePoints <= 0 || level >= 100 ? 'disabled style="opacity:0.5"' : ''}>+</button>
                </div>
            `;
            grid.appendChild(div);
        });

        if (summary) {
            summary.innerHTML = `
                <div class="flex justify-between"><span class="text-slate-500">DPS</span><span class="text-cyan-400">${formatNumber(this.getCurrentDPS())}</span></div>
                <div class="flex justify-between"><span class="text-slate-500">Crit</span><span class="text-cyan-400">${this.getCritChance()}%</span></div>
                <div class="flex justify-between"><span class="text-slate-500">Armor</span><span class="text-cyan-400">${(this.getArmor() * 100).toFixed(0)}%</span></div>
                <div class="flex justify-between"><span class="text-slate-500">Regen</span><span class="text-cyan-400">${this.getRegen()}/s</span></div>
            `;
        }
    }

    /** Lab Panel - Compact Passives UI (Defender Idle 2 style) */
    renderLabPassivesUI(tab = null) {
        tab = tab || this.activeLabPassiveTab || 'offense';
        this.activeLabPassiveTab = tab;

        const grid = document.getElementById('lab-passives-grid');
        const crystalDisplay = document.getElementById('lab-passives-crystals');
        if (!grid) return;

        document.querySelectorAll('.lab-passive-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        if (crystalDisplay) {
            crystalDisplay.textContent = formatNumber(this.crystals);
        }

        const passives = PASSIVES[tab] || PASSIVES.offense;
        grid.innerHTML = '';

        passives.forEach(passive => {
            const level = this.passives.getLevel(passive.id);
            const isMaxed = level >= passive.maxLevel;
            const isUnlocked = this.passives.isUnlocked(passive.id);
            const cost = this.passives.getCost(passive.id);
            const canAfford = BigNumService.gte(this.crystals, cost) && !isMaxed && isUnlocked;

            const div = document.createElement('div');

            if (!isUnlocked) {
                const req = this.passives.getUnlockReq(passive.id);
                div.className = 'lab-passive-card lab-passive-locked';
                div.innerHTML = `
                    <div class="flex items-center gap-1">
                        <span class="text-lg">${passive.icon}</span>
                        <span class="text-xs text-slate-500">${t(passive.nameKey)}</span>
                    </div>
                    <div class="text-xs text-slate-600">
                        <span>🔒</span> ${req.passiveName} Lv${req.level}
                    </div>
                `;
            } else {
                div.className = `lab-passive-card ${canAfford ? 'lab-passive-affordable' : ''} ${isMaxed ? 'lab-passive-maxed' : ''}`;
                div.innerHTML = `
                    <div class="flex items-center gap-1 mb-1">
                        <span class="text-lg">${passive.icon}</span>
                        <span class="text-xs text-slate-300 flex-grow">${t(passive.nameKey)}</span>
                        <span class="text-xs font-bold ${isMaxed ? 'text-yellow-400' : 'text-amber-400'}">${level}/${passive.maxLevel}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-slate-500">${t(passive.descKey)}</span>
                        ${!isMaxed ? `
                            <button
                                class="w-12 h-5 ${canAfford ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-slate-700'} text-white text-xs font-bold rounded flex items-center justify-center gap-0.5"
                                data-action="passive.upgrade"
                                data-id="${passive.id}"
                                ${!canAfford ? 'disabled style="opacity:0.5"' : ''}>
                                ${formatNumber(cost)}💎
                            </button>
                        ` : `<span class="text-xs text-yellow-400">${t('lab.max')}</span>`}
                    </div>
                `;
            }
            grid.appendChild(div);
        });
    }

    /** Lab Panel - Compact Tech Tree UI */
    renderLabTechUI() {
        const container = document.getElementById('lab-tech-tree');
        if (!container) return;

        const isUnlocked = (id) => this.school?.isUnlocked(id) || id === 'sentry';
        const getLevel = (id) => this.school?.getLevel(id) || 0;
        const getMaxLevel = (id) => {
            const turret = SCHOOL_TURRETS.find(t => t.id === id);
            return turret?.maxLevel || 10;
        };

        const turretTiers = [
            { tier: 1, label: 'TIER I', turrets: ['sentry', 'blaster'] },
            { tier: 2, label: 'TIER II', turrets: ['laser', 'solidifier', 'swamper'] },
            { tier: 3, label: 'TIER III', turrets: ['rocket', 'sniper'] },
            { tier: 4, label: 'TIER IV', turrets: ['inferno'] }
        ];

        const turretInfo = {
            sentry: { name: 'SENTRY', icon: '🔫' },
            blaster: { name: 'BLASTER', icon: '🧨' },
            laser: { name: 'LASER', icon: '📍' },
            solidifier: { name: 'SOLID', icon: '❄️' },
            swamper: { name: 'SWAMP', icon: '💧' },
            rocket: { name: 'ROCKET', icon: '🚀' },
            sniper: { name: 'SNIPER', icon: '🔭' },
            inferno: { name: 'INFERNO', icon: '🌋' }
        };

        container.innerHTML = '';

        turretTiers.forEach(tierData => {
            const tierDiv = document.createElement('div');
            tierDiv.className = 'lab-tech-tier';

            const header = document.createElement('div');
            header.className = 'lab-tech-tier-header';
            header.textContent = tierData.label;
            tierDiv.appendChild(header);

            const items = document.createElement('div');
            items.className = 'lab-tech-tier-items';

            tierData.turrets.forEach(turretId => {
                const info = turretInfo[turretId];
                const unlocked = isUnlocked(turretId);
                const level = getLevel(turretId);
                const maxLevel = getMaxLevel(turretId);

                const item = document.createElement('div');
                item.className = `lab-tech-item ${unlocked ? 'unlocked' : 'locked'}`;
                item.innerHTML = `
                    <div class="text-lg">${info.icon}</div>
                    <div class="text-xs font-bold ${unlocked ? 'text-white' : 'text-slate-500'}">${info.name}</div>
                    ${unlocked ? `<div class="text-xs text-cyan-400">${level}/${maxLevel}</div>` : '<div class="text-xs">🔒</div>'}
                `;
                item.onclick = () => {
                    if (!unlocked) {
                        this.renderSchoolUI();
                        document.getElementById('school-modal')?.classList.remove('hidden');
                    }
                };
                items.appendChild(item);
            });

            tierDiv.appendChild(items);
            container.appendChild(tierDiv);
        });
    }

    renderGameModesUI() {
        const currentModeEl = document.getElementById('current-mode-display');
        const grid = document.getElementById('modes-grid');
        if (!grid) return;

        const currentMode = this.gameModes.getCurrentMode();
        currentModeEl.innerText = `${currentMode.icon} ${t(currentMode.nameKey)}`;

        grid.innerHTML = '';
        GAME_MODES.forEach(mode => {
            const isActive = this.gameModes.currentMode === mode.id;
            const isUnlocked = this.gameModes.isUnlocked(mode.id);

            const div = document.createElement('div');
            div.className = `p-4 rounded border ${isActive ? 'border-violet-400 bg-violet-900/50' : isUnlocked ? 'border-slate-600 bg-slate-800 hover:border-violet-500' : 'border-slate-700 bg-slate-900 opacity-50'}`;
            div.innerHTML = `
                <div class="flex items-center gap-3 mb-2">
                    <span class="text-3xl">${mode.icon}</span>
                    <div>
                        <div class="font-bold ${isActive ? 'text-violet-400' : 'text-white'}">${t(mode.nameKey)}</div>
                        ${mode.scaling ? `<div class="text-xs text-slate-400">HP x${mode.scaling.hpMult} | Speed x${mode.scaling.speedMult}</div>` : ''}
                    </div>
                </div>
                <div class="text-xs text-slate-300 mb-3">${t(mode.descKey)}</div>
                ${isUnlocked ? `
                    <button data-action="gameMode.set" data-id="${mode.id}"
                        class="w-full px-3 py-2 ${isActive ? 'bg-violet-600' : 'bg-slate-600 hover:bg-violet-600'} text-white text-sm rounded font-bold transition"
                        ${isActive ? 'disabled' : ''}>
                        ${isActive ? t('status.active') : t('modes.select') || 'Select'}
                    </button>
                ` : `<div class="text-center text-xs text-red-400">${t('slots.locked')}</div>`}
            `;
            grid.appendChild(div);
        });
    }

    renderCampaignUI() {
        const container = document.getElementById('campaign-chapters');
        if (!container) return;

        container.innerHTML = '';

        const chapters = {};
        CAMPAIGN_MISSIONS.forEach(mission => {
            if (!chapters[mission.chapter]) chapters[mission.chapter] = [];
            chapters[mission.chapter].push(mission);
        });

        Object.keys(chapters).sort((a, b) => a - b).forEach(chapterNum => {
            const chapterDiv = document.createElement('div');
            chapterDiv.className = 'bg-slate-900/50 rounded-lg border border-rose-900/50 overflow-hidden';

            const chapterTitle = t(`campaign.chapters.${chapterNum}`) || `${t('campaign.chapter')} ${chapterNum}`;

            chapterDiv.innerHTML = `
                <div class="bg-rose-900/30 px-4 py-2 border-b border-rose-800">
                    <h3 class="text-lg font-bold text-rose-400">${t('campaign.chapter')} ${chapterNum}: ${chapterTitle}</h3>
                </div>
                <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3" id="chapter-${chapterNum}-missions"></div>
            `;
            container.appendChild(chapterDiv);

            const missionsGrid = chapterDiv.querySelector(`#chapter-${chapterNum}-missions`);

            chapters[chapterNum].forEach(mission => {
                const isCompleted = this.campaign.isCompleted(mission.id);
                const canAttempt = this.campaign.canAttemptMission(mission.id);

                const missionDiv = document.createElement('div');
                missionDiv.className = `p-3 rounded border ${isCompleted ? 'border-green-500 bg-green-900/30' : canAttempt ? 'border-slate-600 bg-slate-800' : 'border-slate-700 bg-slate-900 opacity-50'}`;

                const objectiveText = `${t(`campaign.objectives.${mission.objective.type}`)} ${mission.objective.target}`;

                missionDiv.innerHTML = `
                    <div class="flex items-center justify-between mb-2">
                        <div class="font-bold ${isCompleted ? 'text-green-400' : 'text-white'}">${t(`campaign.missions.${mission.id}`) || mission.id}</div>
                        ${isCompleted ? '<span class="text-green-400 text-xl">✓</span>' : ''}
                    </div>
                    <div class="text-xs text-slate-400 mb-2">${objectiveText}</div>
                    <div class="text-xs text-yellow-400">
                        ${t('game.gold')}: +${formatNumber(mission.reward.gold)} |
                        ${t('currency.crystals')}: +${mission.reward.crystals}
                    </div>
                    ${!isCompleted && canAttempt ? `
                        <button data-action="campaign.start" data-id="${mission.id}"
                            class="mt-2 w-full px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-sm rounded">
                            ${t('modes.select') || 'Start'}
                        </button>
                    ` : ''}
                `;
                missionsGrid.appendChild(missionDiv);
            });
        });
    }

    renderLeaderboardUI() {
        const categorySelect = document.getElementById('leaderboard-category');
        const listContainer = document.getElementById('leaderboard-list');
        if (!categorySelect || !listContainer) return;

        if (categorySelect.options.length === 0) {
            LEADERBOARD_CATEGORIES.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = t(cat.nameKey);
                categorySelect.appendChild(option);
            });
        }

        const selectedCategory = categorySelect.value || LEADERBOARD_CATEGORIES[0].id;
        const entries = this.leaderboards.getTopScores(selectedCategory, 10);

        listContainer.innerHTML = '';

        if (entries.length === 0) {
            listContainer.innerHTML = `<div class="text-slate-500 text-center py-8">${t('leaderboard.empty')}</div>`;
            return;
        }

        entries.forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = `flex items-center justify-between p-3 rounded ${index === 0 ? 'bg-yellow-900/30 border border-yellow-600' : index === 1 ? 'bg-slate-700/50 border border-slate-500' : index === 2 ? 'bg-orange-900/20 border border-orange-700' : 'bg-slate-800 border border-slate-700'}`;

            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
            const date = new Date(entry.date).toLocaleDateString();

            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-xl w-8 text-center">${medal}</span>
                    <div>
                        <div class="font-bold text-sky-400">${formatNumber(entry.score)}</div>
                        <div class="text-xs text-slate-400">${date}</div>
                    </div>
                </div>
            `;
            listContainer.appendChild(div);
        });
    }

    renderStatisticsUI() {
        const grid = document.getElementById('statistics-grid');
        if (!grid) return;

        const stats = this.statistics.stats;
        const formatTime = (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            return h > 0 ? `${h}h ${m}m` : `${m}m`;
        };

        const statsList = [
            { key: 'totalPlayTime', i18n: 'totalPlayTime', icon: '⏱️', format: v => formatTime(v) },
            { key: 'totalKills', i18n: 'totalKills', icon: '💀', format: v => formatNumber(v) },
            { key: 'totalBosses', i18n: 'totalBosses', icon: '👑', format: v => formatNumber(v) },
            { key: 'totalGoldEarned', i18n: 'totalGold', icon: '💰', format: v => formatNumber(v) },
            { key: 'totalDamageDealt', i18n: 'totalDamage', icon: '⚔️', format: v => formatNumber(v) },
            { key: 'highestWave', i18n: 'highestWave', icon: '🌊', format: v => v },
            { key: 'highestCombo', i18n: 'highestCombo', icon: '🔥', format: v => v },
            { key: 'totalPrestiges', i18n: 'totalPrestiges', icon: '👑', format: v => v },
            { key: 'totalAscensions', i18n: 'totalAscensions', icon: '✨', format: v => v },
            { key: 'criticalHits', i18n: 'criticalHits', icon: '💥', format: v => formatNumber(v) },
            { key: 'projectilesFired', i18n: 'projectilesFired', icon: '🎯', format: v => formatNumber(v) },
            { key: 'skillsUsed', i18n: 'skillsUsed', icon: '⚡', format: v => formatNumber(v) },
            { key: 'relicsFound', i18n: 'relicsFound', icon: '🎒', format: v => v }
        ];

        grid.innerHTML = statsList.map(stat => `
            <div class="flex items-center justify-between p-3 bg-slate-700/50 rounded border border-slate-600">
                <span class="flex items-center gap-2">
                    <span class="text-xl">${stat.icon}</span>
                    <span class="text-slate-300">${t('statistics.' + stat.i18n)}</span>
                </span>
                <span class="font-bold text-white">${stat.format(stats[stat.key] || 0)}</span>
            </div>
        `).join('');
    }

    renderPresetsUI() {
        const grid = document.getElementById('presets-grid');
        if (!grid) return;

        grid.innerHTML = '';

        BUILD_PRESET_SLOTS.forEach(slot => {
            const preset = this.buildPresets.presets[slot.id];
            const hasData = preset && preset.turrets && preset.turrets.length > 0;

            const div = document.createElement('div');
            div.className = 'p-4 rounded border border-slate-600 bg-slate-800';

            div.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <span class="text-xl">${slot.icon}</span>
                        <span class="font-bold text-white">${t(`presets.slots.${slot.id}`) || slot.name}</span>
                    </div>
                    ${hasData ? `<span class="text-xs text-green-400">${preset.turrets.length} ${t('chips.turret') || 'turrets'}</span>` : `<span class="text-xs text-slate-500">${t('presets.empty')}</span>`}
                </div>
                <div class="flex gap-2">
                    <button data-action="preset.save" data-id="${slot.id}"
                        class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded font-bold">
                        ${t('presets.save')}
                    </button>
                    ${hasData ? `
                        <button data-action="preset.load" data-id="${slot.id}"
                            class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded font-bold">
                            ${t('presets.load')}
                        </button>
                        <button data-action="preset.delete" data-id="${slot.id}"
                            class="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded">
                            🗑️
                        </button>
                    ` : ''}
                </div>
            `;
            grid.appendChild(div);
        });
    }

    updateSynergiesHUD() {
        const container = document.getElementById('synergies-hud');
        const list = document.getElementById('synergies-list');
        if (!container || !list) return;

        const activeSynergies = this.synergies.getActiveSynergies();

        if (activeSynergies.length === 0) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        list.innerHTML = '';

        activeSynergies.forEach(synergy => {
            const span = document.createElement('span');
            span.className = 'px-2 py-1 rounded text-xs font-bold pointer-events-auto';
            span.style.backgroundColor = synergy.color + '40';
            span.style.borderColor = synergy.color;
            span.style.border = '1px solid';
            span.style.color = synergy.color;
            span.textContent = t(synergy.nameKey);
            span.title = t(synergy.descKey);
            list.appendChild(span);
        });
    }

    updateSeasonalBanner() {
        const banner = document.getElementById('seasonal-banner');
        const iconEl = document.getElementById('seasonal-icon');
        const nameEl = document.getElementById('seasonal-name');
        const bonusEl = document.getElementById('seasonal-bonus');

        if (!banner) return;

        const activeEvent = this.seasonalEvents.getActiveEvent();

        if (!activeEvent) {
            banner.classList.add('hidden');
            return;
        }

        banner.classList.remove('hidden');
        iconEl.textContent = activeEvent.icon;
        nameEl.textContent = t(activeEvent.nameKey);

        const bonuses = [];
        if (activeEvent.bonuses.goldMult) bonuses.push(`${t('game.gold')} x${activeEvent.bonuses.goldMult}`);
        if (activeEvent.bonuses.xpMult) bonuses.push(`XP x${activeEvent.bonuses.xpMult}`);
        if (activeEvent.bonuses.dropMult) bonuses.push(`${t('relics.drop') || 'Drops'} x${activeEvent.bonuses.dropMult}`);

        bonusEl.textContent = bonuses.join(' | ');
    }

    // ===== UX IMPROVEMENTS =====

    toggleMenuGroup(groupId) {
        if (groupId === 'all') {
            const menuGroups = document.getElementById('menu-groups');
            const toggleBtn = document.getElementById('btn-toggle-menu');
            const isCollapsed = menuGroups.classList.toggle('collapsed');
            if (toggleBtn) toggleBtn.textContent = isCollapsed ? '☰' : '✕';
            return;
        }

        const content = document.getElementById(`menu-${groupId}`);
        const header = content?.previousElementSibling;

        if (content) {
            const isOpening = content.classList.contains('hidden');

            // Accordion: close all other groups first
            document.querySelectorAll('.menu-group-content').forEach(c => {
                if (c.id !== `menu-${groupId}`) {
                    c.classList.add('hidden');
                    const otherHeader = c.previousElementSibling;
                    if (otherHeader) {
                        otherHeader.classList.remove('open');
                        otherHeader.setAttribute('aria-expanded', 'false');
                    }
                }
            });

            content.classList.toggle('hidden');
            header?.classList.toggle('open');
            header?.setAttribute('aria-expanded', isOpening ? 'true' : 'false');
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    showFeatureIntro(featureId) {
        const introKey = `seen_intro_${featureId}`;
        if (localStorage.getItem(introKey)) return;

        const features = {
            mining: { icon: '⛏️', titleKey: 'mining.title', descKey: 'help.mining.text' },
            forge: { icon: '🔥', titleKey: 'forge.title', descKey: 'help.forge.text' },
            research: { icon: '🔬', titleKey: 'research.title', descKey: 'help.research.text' },
            prestige: { icon: '👑', titleKey: 'prestige.title', descKey: 'help.prestige.text' },
            production: { icon: '🏭', titleKey: 'production.title', descKey: 'help.production.text' },
            chips: { icon: '🔧', titleKey: 'chips.title', descKey: 'help.chips.text' },
            town: { icon: '🏰', titleKey: 'town.title', descKey: 'help.town.text' },
            school: { icon: '🎓', titleKey: 'school.title', descKey: 'help.school.text' },
            office: { icon: '🏢', titleKey: 'office.title', descKey: 'help.office.text' },
            awakening: { icon: '✨', titleKey: 'awakening.title', descKey: 'help.awakening.text' },
            modes: { icon: '🎮', titleKey: 'modes.title', descKey: 'ux.intro.modes' },
            campaign: { icon: '📜', titleKey: 'campaign.title', descKey: 'ux.intro.campaign' },
            leaderboard: { icon: '🏅', titleKey: 'leaderboard.title', descKey: 'ux.intro.leaderboard' }
        };

        const feature = features[featureId];
        if (!feature) return;

        const iconEl = document.getElementById('feature-intro-icon');
        const titleEl = document.getElementById('feature-intro-title');
        const descEl = document.getElementById('feature-intro-desc');
        const tipsEl = document.getElementById('feature-intro-tips');
        const modalEl = document.getElementById('feature-intro-modal');

        if (iconEl) iconEl.textContent = feature.icon;
        if (titleEl) titleEl.textContent = t(feature.titleKey);
        if (descEl) descEl.textContent = t(feature.descKey);
        if (tipsEl) tipsEl.innerHTML = '';
        if (modalEl) modalEl.classList.remove('hidden');

        localStorage.setItem(introKey, 'true');
    }

    closeFeatureIntro() {
        document.getElementById('feature-intro-modal')?.classList.add('hidden');
    }

    updateSuggestedAction() {
        const banner = document.getElementById('suggested-action');
        const textEl = document.getElementById('suggested-action-text');
        if (!banner || !textEl) return;

        const suggestion = this.getSuggestedAction();
        if (suggestion) {
            banner.classList.remove('hidden');
            textEl.textContent = suggestion.text;
            this.currentSuggestion = suggestion;
        } else {
            banner.classList.add('hidden');
            this.currentSuggestion = null;
        }
    }

    getSuggestedAction() {
        // Don't show suggestions if a modal is open
        const anyModalOpen = document.querySelector('.modal-backdrop:not(.hidden)');
        if (anyModalOpen) return null;

        // Priority-based suggestions
        if (this.dailyQuests && this.dailyQuests.hasIncompleteQuests() && !localStorage.getItem('seen_quests_today_' + new Date().toDateString())) {
            return { text: t('ux.suggestion.checkQuests') || 'Check Daily Quests', action: () => {
                this.renderDailyQuestsUI();
                document.getElementById('quests-modal').classList.remove('hidden');
                localStorage.setItem('seen_quests_today_' + new Date().toDateString(), 'true');
            }};
        }

        if (BigNumService.gte(this.gold, 100) && this.upgrades.canAffordAny()) {
            return { text: t('ux.suggestion.buyUpgrade') || 'Buy an upgrade', action: () => {
                const labPanel = document.getElementById('lab-panel');
                if (labPanel) labPanel.scrollTop = 0;
            }};
        }

        if (this.wave >= 5 && !localStorage.getItem('seen_intro_mining')) {
            return { text: t('ux.suggestion.tryMining') || 'Try Mining', action: () => {
                this.renderMiningUI();
                document.getElementById('mining-modal').classList.remove('hidden');
            }};
        }

        if (this.wave >= 10 && !localStorage.getItem('seen_intro_research')) {
            return { text: t('ux.suggestion.checkResearch') || 'Check Research', action: () => {
                this.renderResearchUI();
                document.getElementById('research-modal').classList.remove('hidden');
            }};
        }

        return null;
    }

    executeSuggestedAction() {
        if (this.currentSuggestion?.action) {
            this.currentSuggestion.action();
        }
    }

    updateMenuUnlocks() {
        const unlocks = {
            school: this.town.level >= 3,
            office: this.town.level >= 4,
            awakening: this.dreadLevel >= 6
        };

        Object.entries(unlocks).forEach(([feature, isUnlocked]) => {
            const menuItem = document.querySelector(`[data-unlock="${feature}"]`);
            if (menuItem) {
                if (isUnlocked) {
                    menuItem.classList.remove('menu-locked');
                    menuItem.classList.add('menu-unlocked');
                    if (!localStorage.getItem(`unlock_seen_${feature}`)) {
                        menuItem.classList.add('newly-unlocked');
                        // Mark as seen only when clicked
                        if (!menuItem.dataset.unlockListenerAdded) {
                            menuItem.dataset.unlockListenerAdded = 'true';
                            menuItem.addEventListener('click', () => {
                                localStorage.setItem(`unlock_seen_${feature}`, 'true');
                                menuItem.classList.remove('newly-unlocked');
                            }, { once: true });
                        }
                    }
                } else {
                    menuItem.classList.add('menu-locked');
                    menuItem.classList.remove('menu-unlocked');
                    menuItem.classList.remove('newly-unlocked');
                }
            }
        });
    }

    handleSlotClick(slot) {
        if (!slot.purchased) {
            const pos = this.turretSlots.getSlotPosition(slot.id);
            if (!pos) return;

            if (this.turretSlots.canPurchaseSlot(slot.id)) {
                const costText = t('slots.confirmBuy') || 'Buy slot for {{cost}}?';
                gameConfirm(costText.replace('{{cost}}', formatNumber(slot.cost)), () => {
                    this.turretSlots.purchaseSlot(slot.id);
                    this.floatingTexts.push(FloatingText.create(
                        pos.x, pos.y,
                        t('slots.purchased'),
                        COLORS.CRYSTAL,
                        24
                    ));
                });
            } else {
                this.floatingTexts.push(FloatingText.create(
                    pos.x, pos.y,
                    t('slots.notEnoughGold'),
                    COLORS.ERROR,
                    18
                ));
            }
        } else {
            this.turretSlots.selectedSlot = slot.id;
            this.renderTurretSlotsUI();
            document.getElementById('slots-modal')?.classList.remove('hidden');
        }
    }

    renderTurretSlotsUI() {
        const grid = document.getElementById('slots-turrets-grid');
        const currentEl = document.getElementById('slots-current-turret');
        if (!grid || !currentEl) return;

        const slotIndex = this.turretSlots.selectedSlot;
        if (slotIndex < 0 || slotIndex >= this.turretSlots.slots.length) return;

        const selectedSlot = this.turretSlots.slots[slotIndex];
        if (!selectedSlot) return;

        if (selectedSlot.turretId) {
            const turret = SCHOOL_TURRETS.find(t => t.id === selectedSlot.turretId);
            currentEl.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${turret?.icon || '?'}</span>
                    <div>
                        <div class="font-bold text-cyan-400">${t(turret?.nameKey || 'slots.empty')}</div>
                        <div class="text-xs text-slate-400">${t('school.level')} ${this.school.getLevel(selectedSlot.turretId)}</div>
                    </div>
                </div>
                <button data-action="turretSlot.remove" data-id="${selectedSlot.id}"
                    class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm">
                    ${t('slots.remove')}
                </button>
            `;
        } else {
            currentEl.innerHTML = `<span class="text-slate-500">${t('slots.empty')}</span>`;
        }

        grid.innerHTML = '';
        SCHOOL_TURRETS.forEach(turret => {
            const unlocked = this.school.isUnlocked(turret.id);
            const level = this.school.getLevel(turret.id);
            const isEquipped = selectedSlot.turretId === turret.id;

            const div = document.createElement('div');
            div.className = `p-3 rounded border cursor-pointer transition ${
                isEquipped ? 'border-cyan-400 bg-cyan-900/50' :
                unlocked ? 'border-slate-600 bg-slate-800 hover:border-cyan-600' :
                'border-slate-700 bg-slate-900 opacity-50 cursor-not-allowed'
            }`;
            div.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-2xl">${escapeHtml(turret.icon)}</span>
                    <div>
                        <div class="font-bold ${unlocked ? 'text-white' : 'text-slate-500'}">${t(turret.nameKey)}</div>
                        ${unlocked ? `<div class="text-xs text-slate-400">${t('school.level')} ${level}</div>` : `<div class="text-xs text-red-400">${t('slots.locked')}</div>`}
                    </div>
                </div>
            `;

            if (unlocked && !isEquipped) {
                div.onclick = () => {
                    this.turretSlots.placeTurret(selectedSlot.id, turret.id);
                    this.renderTurretSlotsUI();
                };
            }

            grid.appendChild(div);
        });
    }

    renderRelicGrid() {
        const container = document.getElementById('ui-relic-count');
        if (container) container.innerText = this.relics.length;
        const container2 = document.getElementById('ui-relic-count-2');
        if (container2) container2.innerText = this.relics.length;
        const grid = document.getElementById('relic-grid');
        grid.innerHTML = '';
        if (this.relics.length === 0) {
            grid.innerHTML = `<div class="text-slate-500 col-span-3 text-center py-8">${t('modals.collection.empty')}</div>`;
            return;
        }
        this.relics.forEach(id => {
            const r = RELIC_DB.find(db => db.id === id);
            if (r) {
                const div = document.createElement('div');
                div.className = 'bg-slate-700 p-2 rounded border border-yellow-700 flex flex-col items-center text-center';
                div.innerHTML = `<div class="text-3xl mb-1">${escapeHtml(r.icon)}</div><div class="font-bold text-sm text-yellow-400 leading-tight">${t(r.nameKey)}</div><div class="text-[10px] text-slate-300 mt-1">${t(r.descKey)}</div>`;
                grid.appendChild(div);
            }
        });
    }

    updateStats() {
        const tierMult = Math.pow(CONFIG.evolutionMultiplier, Math.min(3, this.castle.tier) - 1 + Math.max(0, this.castle.tier - 3) * 0.5);

        // Multiplicative stacking for damage (meta × relic × prestige × research × passive)
        const metaDmgMult = this.metaUpgrades.getEffectValue('damageMult');
        const relicDmgMult = 1 + (this.relicMults.damage || 0);
        const prestigeDmgMult = this.prestige?.getEffectValue('prestige_damage') || 1;
        const researchDmgMult = 1 + (this.researchEffects?.damageMult || 0);
        const passiveDmgMult = this.passives?.getEffect('damage') || 1;
        const slotBonuses = this.turretSlots?.getPassiveBonuses() || { damage: 0, speed: 0, range: 0 };
        const slotDmgMult = 1 + slotBonuses.damage;
        const totalDmgMult = metaDmgMult * relicDmgMult * prestigeDmgMult * researchDmgMult * passiveDmgMult * slotDmgMult;

        // Multiplicative stacking for health (meta × relic × prestige × research × passive)
        const metaHpMult = this.metaUpgrades.getEffectValue('healthMult');
        const relicHpMult = 1 + (this.relicMults.health || 0);
        const prestigeHpMult = this.prestige?.getEffectValue('prestige_health') || 1;
        const researchHpMult = 1 + (this.researchEffects?.healthMult || 0);
        const passiveHpMult = this.passives?.getEffect('health') || 1;
        const totalHpMult = metaHpMult * relicHpMult * prestigeHpMult * researchHpMult * passiveHpMult;

        // Use O(1) Map lookup via getById() instead of O(n) find()
        const dmgBase = this.upgrades.getById('damage');
        this.currentDamage = Math.floor(dmgBase.getValue(dmgBase.level) * tierMult * totalDmgMult);

        const spdBase = this.upgrades.getById('speed');
        const prestigeSkillCd = this.prestige?.getEffectValue('prestige_skill_cd') || 1;
        const slotSpeedMult = 1 + slotBonuses.speed;
        this.currentFireRate = (spdBase.getValue(spdBase.level) / (1 + this.relicMults.speed) * prestigeSkillCd) / slotSpeedMult;

        const critUpg = this.upgrades.getById('crit');
        const critStat = critUpg.getValue(critUpg.level);
        const researchCritChance = this.researchEffects?.critChance || 0;
        const researchCritDmg = this.researchEffects?.critDamage || 0;
        const passiveCritChance = this.passives?.getEffect('critChance') || 0;
        const passiveCritDamage = this.passives?.getEffect('critDamage') || 0;
        this.critChance = critStat.chance + this.relicMults.critChance + researchCritChance + passiveCritChance;
        this.critMult = critStat.mult + (this.stats.mastery['crit_dmg'] || 0) * 0.1 + (this.relicMults.critDamage || 0) + researchCritDmg + passiveCritDamage;

        const hpBase = this.upgrades.getById('health');
        const hpMod = this.activeChallenge && this.activeChallenge.id === 'glass' ? 0.1 : 1;
        this.castle.maxHp = Math.floor(hpBase.getValue(hpBase.level) * tierMult * totalHpMult * hpMod);

        const regBase = this.upgrades.getById('regen');
        const researchRegenMult = 1 + (this.researchEffects?.regenMult || 0);
        const passiveRegenBonus = this.passives?.getEffect('regen') || 0;
        this.castle.regen = regBase.getValue(regBase.level) * tierMult * researchRegenMult + passiveRegenBonus;

        // Armor from upgrades + passives
        const armorUpg = this.upgrades.getById('armor');
        const upgradeArmor = armorUpg ? armorUpg.getValue(armorUpg.level) : 0;
        const passiveArmor = this.passives?.getEffect('armor') || 0;
        const researchArmor = this.researchEffects?.armorFlat || 0;
        this.castle.armor = Math.min(0.9, upgradeArmor + passiveArmor + researchArmor);

        const rangeUpg = this.upgrades.getById('range');
        this.currentRange = rangeUpg.getValue(rangeUpg.level);
        const multishotUpg = this.upgrades.getById('multishot');
        this.multiShotChance = multishotUpg.getValue(multishotUpg.level);

        const iceUpg = this.upgrades.getById('ice');
        const poisonUpg = this.upgrades.getById('poison');
        this.currentEffects = {
            ice: iceUpg.getValue(iceUpg.level),
            poison: poisonUpg.getValue(poisonUpg.level)
        };

        const bounceUpg = this.upgrades.getById('bounce');
        const blastUpg = this.upgrades.getById('blast');
        const leechUpg = this.upgrades.getById('leech');
        const stasisUpg = this.upgrades.getById('stasis');
        const orbitalUpg = this.upgrades.getById('orbital');
        this.currentProps = {
            bounce: bounceUpg.getValue(bounceUpg.level),
            blast: blastUpg.getValue(blastUpg.level),
            leech: leechUpg.getValue(leechUpg.level),
            stasis: stasisUpg.getValue(stasisUpg.level),
            orbital: orbitalUpg.getValue(orbitalUpg.level)
        };
        const shieldUpg = this.upgrades.getById('shield');
        this.castle.maxShield = shieldUpg.getValue(shieldUpg.level);

        const turretPositions = [{ x: -40, y: -60 }, { x: 40, y: -60 }, { x: -40, y: 60 }, { x: 40, y: 60 }];
        const turretUpg = this.upgrades.getById('turret');
        const turretCount = turretUpg.level;
        const specialTypes = ['artillery', 'rocket', 'tesla'];

        this.turrets = [];
        for (const type of specialTypes) {
            const upg = this.upgrades.getById(type);
            if (upg && upg.level > 0) {
                const posIndex = this.turrets.length % turretPositions.length;
                this.turrets.push(new Turret(this.turrets.length, turretPositions[posIndex], 0, type.toUpperCase()));
            }
        }

        for (let i = 0; i < turretCount; i++) {
            const posIndex = this.turrets.length % turretPositions.length;
            this.turrets.push(new Turret(this.turrets.length, turretPositions[posIndex], 0, 'NORMAL'));
        }
    }

    checkEvolution() {
        const newTier = 1 + Math.floor((this.wave - 1) / CONFIG.evolutionInterval);
        if (newTier > this.castle.tier) {
            this.castle.tier = newTier;
            this.updateStats();
            this.upgrades.render(this.activeTab);
            this.updateTierUI();
            const notif = document.getElementById('evo-notification');
            notif.classList.remove('hidden');
            notif.style.opacity = '1';
            setTimeout(() => {
                notif.style.opacity = '0';
                setTimeout(() => notif.classList.add('hidden'), 1000);
            }, 3000);
            for (let i = 0; i < 30; i++) this.particles.push(new Particle(100, this.height / 2, COLORS.ETHER));
            this.sound.play('levelup');
        }
        if (this.castle.tier >= 4) {
            const hue = (Date.now() / 50) % 360;
            document.body.style.backgroundColor = `hsl(${hue}, 20%, 10%)`;
        } else {
            const colors = COLORS.WAVE_EFFECTS;
            document.body.style.backgroundColor = colors[(newTier - 1) % colors.length];
        }
    }

    /**
     * Automatically upgrade turrets when crystals are available
     */
    autoUpgradeTurrets() {
        let upgraded = false;
        for (const turret of this.turrets) {
            if (turret.upgradeTier(this)) {
                upgraded = true;
            }
        }
        if (upgraded) {
            this.updateCrystalsUI();
        }
    }

    updateTierUI() {
        const el = document.getElementById('ui-tier');
        if (el) el.innerText = this.castle.tier;
        if (this.castle.tier > 1) document.getElementById('ui-tier-display').classList.remove('hidden');
    }

    updateEtherUI() {
        document.getElementById('ui-ether-hud').innerText = formatNumber(this.ether);
        document.getElementById('shop-ether-total').innerText = formatNumber(this.ether);
    }

    updateAutomationUI() {
        // Auto controls now integrated in Lab panel header
    }

    rushWave() {
        if (this.isBossWave) return;
        this.isRushBonus = true;
        for (let i = 0; i < 5; i++) this.spawnEnemy();
        this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2 - 100, t('notifications.waveRush'), COLORS.ERROR, 40));
        this.enemiesToSpawn = 0;
        this.waveInProgress = false;
        this.wave++;
        this.enemiesToSpawn += (5 + Math.floor(this.wave * 1.5));
        this.floatingTexts.push(FloatingText.create(this.width / 2, this.height / 2, `${t('game.wave')} ${this.wave}`, COLORS.WHITE, 40));
        this.checkEvolution();
        this.save();
    }

    startWave() {
        this.waveInProgress = true;
        this.stats.registerWave(this.wave);
        this.isBossWave = (this.wave % 10 === 0);
        this.isRushBonus = false;
        this.enemiesToSpawn = this.isBossWave ? 1 : (5 + Math.floor(this.wave * 1.5));
        this.spawnTimer = 0;
        if (this.activeChallenge && this.activeChallenge.id === 'horde') this.enemiesToSpawn *= 3;
        if (this.isBossWave) {
            const notif = document.getElementById('boss-notification');
            notif.classList.remove('hidden');
            setTimeout(() => notif.classList.add('hidden'), 3000);
        }
        this.checkEvolution();
        this.floatingTexts.push(FloatingText.create(
            this.width / 2,
            this.height / 2,
            this.isBossWave ? `${t('notifications.bossWarning')} - ${t('game.wave')} ${this.wave}` : `${t('game.wave')} ${this.wave}`,
            this.isBossWave ? COLORS.ERROR : COLORS.WHITE,
            40
        ));
    }

    spawnEnemy(forcedType = null, forcedX = null, forcedY = null) {
        const startX = forcedX !== null ? forcedX : this.width + 50;
        const startY = forcedY !== null ? forcedY : MathUtils.randomRange(this.height * 0.1, this.height * 0.9);

        if (forcedType) {
            this.enemies.push(new Enemy(this, this.wave, forcedType, startX, startY));
        } else if (this.isBossWave) {
            this.enemies.push(new Enemy(this, this.wave, 'BOSS', startX, startY));
        } else {
            const rand = Math.random();
            let type = 'NORMAL';
            if (this.wave > 5 && rand < 0.2) type = 'SPEEDY';
            if (this.wave > 15 && rand > 0.8) type = 'TANK';
            if (this.wave > 20 && rand > 0.9 && rand < 0.95) type = 'HEALER';
            if (this.wave > 25 && rand > 0.95) type = 'SPLITTER';
            if (this.wave > 10 && rand > 0.3 && rand < 0.35) type = 'THIEF';
            if (this.wave > 30 && rand > 0.4 && rand < 0.45) type = 'PHANTOM';
            this.enemies.push(new Enemy(this, this.wave, type, startX, startY));
        }
    }

    /**
     * Get spawn interval in milliseconds
     * Decreases with wave progression for faster spawns
     */
    getSpawnInterval() {
        const baseInterval = CONFIG.enemySpawnRate / (1 + this.wave * 0.05);
        // After wave 50, spawn rate accelerates further
        if (this.wave > 50) {
            const lateGameFactor = Math.pow(0.98, this.wave - 50); // -2% per wave
            return Math.max(200, baseInterval * lateGameFactor); // Min 200ms between spawns
        }
        return baseInterval;
    }

    /**
     * Get number of enemies to spawn per burst
     * Increases after wave 50 for more simultaneous enemies
     */
    getSpawnBurst() {
        if (this.isBossWave) return 1;
        if (this.wave <= 75) return 1;
        // +1 enemy per burst every 25 waves after 75
        // Wave 100: 2, Wave 125: 3, etc. (slower scaling)
        return 1 + Math.floor((this.wave - 75) / 25);
    }

    findTarget(sourceX, sourceY, range) {
        let nearest = null;
        let minDist = Infinity;
        for (const enemy of this.enemies) {
            const d = MathUtils.dist(sourceX, sourceY, enemy.x, enemy.y);
            if (d < range && d < minDist) {
                minDist = d;
                nearest = enemy;
            }
        }
        return nearest;
    }

    shoot(target) {
        if (!target) return;
        let color = getCastleTierColor(this.castle.tier) || COLORS.PROJECTILE_BASE;
        let isCrit = false;
        let isSuperCrit = false;
        let dmg = this.currentDamage;
        if (this.critChance > 100) {
            isCrit = true;
            if (Math.random() * 100 < (this.critChance - 100)) {
                isSuperCrit = true;
                dmg = Math.floor(dmg * this.critMult * 2.5);
            } else {
                dmg = Math.floor(dmg * this.critMult);
            }
        } else {
            if (Math.random() * 100 < this.critChance) {
                isCrit = true;
                dmg = Math.floor(dmg * this.critMult);
            }
        }
        const finalColor = isSuperCrit ? COLORS.SUPER_CRIT : (isCrit ? COLORS.GOLD : color);
        this.projectiles.push(Projectile.create(100, this.height / 2, target, dmg, 15, finalColor, this.castle.tier, false, isCrit, isSuperCrit, this.currentEffects, this.currentProps));
        this.sound.play('shoot');
        if (Math.random() * 100 < this.multiShotChance) {
            setTimeout(() => {
                if (target && target.hp > 0) {
                    this.projectiles.push(Projectile.create(100, this.height / 2, target, Math.floor(dmg * 0.5), 15, COLORS.WHITE, this.castle.tier, true, isCrit, isSuperCrit, this.currentEffects, this.currentProps));
                }
            }, 100 / this.speedMultiplier);
        }
    }

    fireOrbital() {
        let target = null;
        let maxHp = -1;
        this.enemies.forEach(e => {
            if (e.hp > maxHp) {
                maxHp = e.hp;
                target = e;
            }
        });
        if (target) {
            const dmg = this.currentDamage * 5;
            target.takeDamage(dmg, true, true);
            const div = document.createElement('div');
            div.className = 'orbital-laser';
            div.style.left = (target.x) + 'px';
            div.style.top = '0px';
            div.style.height = (target.y) + 'px';
            document.getElementById('fx-container').appendChild(div);
            setTimeout(() => div.remove(), 500);
            this.floatingTexts.push(FloatingText.create(target.x, target.y - 60, t('notifications.orbital'), COLORS.ORBITAL, 36));
        }
    }

    update(dt) {
        this.mining.update();
        this.production.update();
        this.office.update(dt);
        this.turretSlots.update(dt);
        this.weather.update(dt);
        this.combo.update(dt);
        this.events.update(dt);
        this.statistics.update(dt);
        this.synergies.update();
        this.gameModes.update(dt);
        this.seasonalEvents.update();
        this.campaign.update(dt);
        this.visualEffects.update(dt);
        this.bossMechanics.update(dt);
        if (this.isGameOver) return;
        this.skills.update(dt);
        this.autoSkills.update();
        if (this.drone) this.drone.update(dt, this.gameTime);
        if (this.currentProps.orbital > 0) {
            this.orbitalTimer += dt;
            if (this.orbitalTimer >= this.currentProps.orbital) {
                this.fireOrbital();
                this.orbitalTimer = 0;
            }
        }

        for (let k in this.activeBuffs) {
            if (this.activeBuffs[k] > 0) this.activeBuffs[k] -= dt;
        }
        const buffContainer = document.getElementById('buff-container');
        if (buffContainer) {
            buffContainer.innerHTML = '';
            for (let k in this.activeBuffs) {
                if (this.activeBuffs[k] > 0) {
                    const runeType = RUNE_TYPES.find(r => r.id === k);
                    if (runeType) {
                        const d = document.createElement('div');
                        d.className = 'text-xs bg-black/50 px-2 py-1 rounded text-white border';
                        d.style.borderColor = runeType.color;
                        d.innerText = `${runeType.icon} ${(this.activeBuffs[k] / 1000).toFixed(1)}s`;
                        buffContainer.appendChild(d);
                    }
                }
            }
        }

        // Enemy spawning with burst support
        if (this.waveInProgress && this.enemiesToSpawn > 0) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                const burst = this.getSpawnBurst();
                const toSpawn = Math.min(burst, this.enemiesToSpawn);
                for (let i = 0; i < toSpawn; i++) {
                    this.spawnEnemy();
                    this.enemiesToSpawn--;
                }
                this.spawnTimer = this.getSpawnInterval();
            }
        }

        // Wave completion check
        if (this.enemiesToSpawn <= 0 && this.enemies.length === 0 && this.waveInProgress) {
            this.waveInProgress = false;
            this.wave++;
            // Repair all turrets at wave end
            this.turrets.forEach(t => t.repair?.());
            // Auto-upgrade turrets if enabled
            if (this.settings.autoUpgradeTurrets) {
                this.autoUpgradeTurrets();
            }
            this.isDirty = true;
            this.save();
            setTimeout(() => this.startWave(), 2000 / this.speedMultiplier);
        }

        this.castle.update(dt);
        this.turrets.forEach(t => t.update(dt, this.gameTime, this));
        this.runes.forEach(r => r.update(dt));
        this.runes = this.runes.filter(r => r.life > 0);

        if (this.particles.length > 50) this.particles.shift();
        if (this.floatingTexts.length > 20) this.floatingTexts.shift();

        const fireRate = (this.skills.isActive(SKILL.OVERDRIVE) || this.activeBuffs[RUNE.RAGE] > 0) ? this.currentFireRate / 3 : this.currentFireRate;
        if (this.gameTime - this.lastShotTime > fireRate) {
            const target = this.findTarget(this.castle.x, this.castle.y, this.currentRange);
            if (target) {
                this.shoot(target);
                this.lastShotTime = this.gameTime;
            }
        }

        this.enemies.forEach(e => e.update(dt));
        this.projectiles.forEach(p => p.update(dt));
        this.particles.forEach(p => p.update(dt));
        this.floatingTexts.forEach(t => t.update(dt));
        this.enemies = this.enemies.filter(e => e.hp > 0);
        this.projectiles = this.projectiles.filter(p => p.active && !p.dead);
        this.particles = this.particles.filter(p => p.life > 0);
        // Release dead floating texts back to pool and filter in single pass
        this.floatingTexts = this.floatingTexts.filter(t => {
            if (t.life <= 0) {
                t.release?.();
                return false;
            }
            return true;
        });

        const elGold = document.getElementById('ui-gold');
        if (elGold) elGold.innerText = formatNumber(this.gold);
        const elWave = document.getElementById('ui-wave');
        if (elWave) elWave.innerText = this.wave;
        this.updateWavePreview();
        this.updateSurrenderButton();
        const elEnemies = document.getElementById('ui-enemies');
        if (elEnemies) elEnemies.innerText = this.enemies.length + this.enemiesToSpawn;
        const hpPct = Math.max(0, Math.ceil((this.castle.hp / this.castle.maxHp) * 100));
        const elHealthBar = document.getElementById('ui-health-bar');
        if (elHealthBar) elHealthBar.style.width = `${hpPct}%`;
        const elHpText = document.getElementById('ui-hp-text');
        if (elHpText) elHpText.innerText = `${formatNumber(Math.ceil(this.castle.hp))}/${formatNumber(this.castle.maxHp)}`;
        const shPct = Math.max(0, Math.min(100, Math.ceil((this.castle.shield / this.castle.maxShield) * 100)));
        const elShieldBar = document.getElementById('ui-shield-bar');
        if (elShieldBar) elShieldBar.style.width = `${shPct}%`;
        const dmDisplay = document.getElementById('ui-dm-amount');
        if (dmDisplay) {
            dmDisplay.innerText = this.challenges.darkMatter;
            if (this.challenges.darkMatter > 0) document.getElementById('ui-dark-matter').classList.remove('hidden');
        }
        this.stats.render();
    }

    draw() {
        if (this.renderSystem) {
            this.renderSystem.draw();
        }
    }

    gameOver() {
        this.isGameOver = true;
        const dreadMult = this.getDreadMultipliers();
        const earnedEther = Math.max(1, Math.floor(this.wave / 1.5)) * (1 + (this.stats.mastery['ether_gain'] || 0) * 0.05) * dreadMult.etherBonus;
        this.ether = BigNumService.add(this.ether, earnedEther);
        if (this.activeChallenge) {
            const rewardDM = Math.floor(this.wave / 5) * this.activeChallenge.diff;
            this.challenges.darkMatter += rewardDM;
            document.getElementById('go-dm-gain').innerText = rewardDM;
            document.getElementById('go-dm-gain-box').classList.remove('hidden');
        } else {
            document.getElementById('go-dm-gain-box').classList.add('hidden');
        }
        this.save();
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('go-wave').innerText = this.wave;
        document.getElementById('go-ether-gain').innerText = formatNumber(Math.floor(earnedEther));
        this.updateEtherUI();
        this.metaUpgrades.render();
        this.sound.play('gameover');

        const timerEl = document.getElementById('auto-retry-timer');
        const countdownEl = document.getElementById('retry-countdown');

        // Check auto-prestige first (priority over auto-retry)
        if (this.prestige?.autoPrestige && this.prestige.canPrestige() && this.wave >= this.prestige.autoPrestigeWave) {
            if (timerEl) timerEl.classList.remove('hidden');
            if (countdownEl) countdownEl.innerText = t('prestige.pending');
            this.clearRetryTimers();
            this.retryTimeoutId = setTimeout(() => {
                this.prestige.doPrestige();
            }, 1500);
            return;
        }

        if (this.autoRetryEnabled && this.metaUpgrades.getEffectValue('unlockAuto')) {
            if (timerEl) timerEl.classList.remove('hidden');
            let countdown = 3;
            if (countdownEl) countdownEl.innerText = countdown;
            this.clearRetryTimers();
            this.retryIntervalId = setInterval(() => {
                countdown--;
                if (countdownEl) countdownEl.innerText = countdown;
                if (countdown <= 0) {
                    this.clearRetryTimers();
                    this.restart(true);
                }
            }, 1000);
        } else {
            if (timerEl) timerEl.classList.add('hidden');
        }
    }

    clearRetryTimers() {
        if (this.retryTimeoutId) {
            clearTimeout(this.retryTimeoutId);
            this.retryTimeoutId = null;
        }
        if (this.retryIntervalId) {
            clearInterval(this.retryIntervalId);
            this.retryIntervalId = null;
        }
    }

    manualRestart() {
        this.clearRetryTimers();
        this.restart(false);
    }

    restart(isAuto) {
        this.isGameOver = false;
        this.wave = 1;
        this.castle.hp = this.castle.maxHp;
        this.castle.tier = 1;
        this.castle.shield = this.castle.maxShield;
        this.enemies = [];
        this.projectiles = [];
        this.runes = [];
        this.activeBuffs = { rage: 0, midas: 0 };
        this.upgrades.upgrades.forEach(u => {
            u.level = PRESTIGE_RESET_UPGRADES.includes(u.id) ? 0 : 1;
        });
        this.gold = BigNumService.create(this.metaUpgrades.getEffectValue('startGold'));
        const autoStatusEl = document.getElementById('auto-status');
        if (isAuto && this.autoBuyEnabled && this.metaUpgrades.getEffectValue('unlockAI')) {
            autoStatusEl?.classList.remove('hidden');
        } else {
            autoStatusEl?.classList.add('hidden');
        }
        this.updateStats();
        this.upgrades.render(this.activeTab);
        this.updateTierUI();
        this.updateEtherUI();
        this.updateChallengeUI();
        document.getElementById('game-over-screen').classList.add('hidden');
        this.startWave();
        this.tutorial.check(this.gold);
    }

    performAutoBuy() {
        let bought = false;
        this.upgrades.upgrades.forEach(u => {
            if (this.upgrades.buy(u.id, true)) bought = true;
        });
        if (bought) this.save();
    }

    confirmReset() {
        const message = t('modals.settings.confirmReset') || 'Are you sure you want to reset all progress?';
        gameConfirm(message, () => {
            // 1. Stop the game loop and all intervals immediately
            this.isPaused = true;
            this._intervals.forEach(id => clearInterval(id));
            this._intervals = [];
            this.clearRetryTimers();

            // 2. Set the global flag to prevent 'beforeunload' from saving
            window._isResetting = true;

            // 3. Explicitly remove all save-related keys
            try {
                const saveKey = CONFIG.saveKey;
                localStorage.removeItem(saveKey);

                // Remove backups
                for (let i = 1; i <= 3; i++) {
                    localStorage.removeItem(`${saveKey}_backup_${i}`);
                }

                // Remove UI preferences
                localStorage.removeItem('aegis_ui_tab');
                localStorage.removeItem('aegis_ui_buyMode');
                localStorage.removeItem('aegis_tutorial_complete');
                localStorage.removeItem('ether_citadel_save'); // Legacy key

                console.log('[Reset] Save data wiped successfully.');
            } catch (e) {
                console.error('[Reset] Error during reset:', e);
            }

            // 4. Reload the page
            location.reload();
        });
    }

    exportSave() {
        const saved = localStorage.getItem(CONFIG.saveKey);
        if (!saved) {
            this.ui.showToast(t('notifications.noSaveFound') || 'No save found', 'error');
            return;
        }
        const str = btoa(encodeURIComponent(saved));
        document.getElementById('save-string').value = str;
        navigator.clipboard.writeText(str)
            .then(() => {
                this.ui.showToast(t('notifications.saveCopied') || 'Save copied to clipboard', 'success');
            })
            .catch(err => {
                logError(err, 'Clipboard.write');
                this.ui.showToast(t('notifications.clipboardError') || 'Copy failed', 'error');
            });
    }

    importSave() {
        const str = prompt(t('notifications.pasteSave'));
        if (!str || typeof str !== 'string' || str.trim().length === 0) return;

        try {
            // Validate base64 format
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
            if (!base64Regex.test(str.trim())) {
                this.ui.showToast(t('notifications.invalidSaveFormat') || 'Invalid save format', 'error');
                return;
            }

            const decoded = decodeURIComponent(atob(str.trim()));

            // Validate it's valid JSON before saving
            const parsed = JSON.parse(decoded);
            if (!parsed || typeof parsed !== 'object') {
                this.ui.showToast(t('notifications.invalidSaveData') || 'Invalid save data', 'error');
                return;
            }

            // Sanitize to prevent prototype pollution attacks
            const sanitized = sanitizeJsonObject(parsed);
            const sanitizedJson = JSON.stringify(sanitized);

            localStorage.setItem(CONFIG.saveKey, sanitizedJson);
            location.reload();
        } catch (e) {
            getErrorHandler().handleImportError(e);
            this.ui.showToast(t('notifications.importFailed') || 'Import failed', 'error');
        }
    }

    /**
     * Register all subsystems with SaveService for automatic save/load
     */
    _registerSaveSubsystems() {
        const subsystems = {
            mining: this.mining,
            research: this.research,
            production: this.production,
            auras: this.auras,
            chips: this.chips,
            dailyQuests: this.dailyQuests,
            prestige: this.prestige,
            passives: this.passives,
            town: this.town,
            school: this.school,
            office: this.office,
            awakening: this.awakening,
            turretSlots: this.turretSlots,
            weather: this.weather,
            combo: this.combo,
            events: this.events,
            talents: this.talents,
            statistics: this.statistics,
            ascensionMgr: this.ascensionMgr,
            synergies: this.synergies,
            gameModes: this.gameModes,
            seasonalEvents: this.seasonalEvents,
            campaign: this.campaign,
            leaderboards: this.leaderboards,
            buildPresets: this.buildPresets,
            music: this.music
        };

        for (const [name, handler] of Object.entries(subsystems)) {
            if (handler && typeof handler.getSaveData === 'function' && typeof handler.loadSaveData === 'function') {
                SaveService.registerSubsystem(name, handler);
            }
        }
    }

    save() {
        // Core data (not managed by registered subsystems)
        const coreData = {
            gold: this.gold,
            wave: this.wave,
            tier: this.castle.tier,
            ether: this.ether,
            crystals: this.crystals,
            dreadLevel: this.dreadLevel,
            speedIndex: this.speedIndex,
            autoRetry: this.autoRetryEnabled,
            autoBuy: this.autoBuyEnabled,
            lastSaveTime: Date.now(),
            settings: this.settings,
            locale: i18n.getLocale(),
            tutorialStep: this.tutorial?.step || 0,

            // Legacy data structures (not yet migrated to subsystems)
            upgrades: this.upgrades.upgrades.map(u => ({ id: u.id, level: u.level })),
            metaUpgrades: this.metaUpgrades.upgrades.map(u => ({ id: u.id, level: u.level })),
            miningResources: this.miningResources,
            miningActiveMiners: this.mining.getSaveData(),
            researchPurchased: this.research.getSaveData(),
            researchEffects: this.researchEffects,
            relics: this.relics,
            stats: {
                kills: this.stats.kills,
                bosses: this.stats.bosses,
                totalGold: this.stats.totalGold,
                maxWave: this.stats.maxWave,
                achievements: this.stats.unlockedAchievements,
                xp: this.stats.xp,
                level: this.stats.level,
                masteryPoints: this.stats.masteryPoints,
                mastery: this.stats.mastery,
                seenEnemies: this.stats.seenEnemies
            },
            challenges: { dm: this.challenges.darkMatter, tech: this.challenges.dmTech }
        };

        // Create backup before saving
        SaveService.createBackup(1);

        // Delegate save to SaveService (handles subsystems, checksum, storage)
        const success = SaveService.save(coreData);

        if (success) {
            this.isDirty = false;
            this.lastSaveTime = Date.now();

            // Update export string UI
            const saveStringEl = document.getElementById('save-string');
            if (saveStringEl) {
                saveStringEl.value = SaveService.exportSave();
            }
        }
    }

    /**
     * Restore from backup slot (1-3) - delegates to SaveService
     */
    restoreFromBackup(slot) {
        const result = SaveService.restoreBackup(slot);
        if (result.success) {
            this._loadFromData(result.data);
            this.ui.showToast(t('notifications.backupRestored') || 'Backup restored!', 'success');
            return true;
        }
        this.ui.showToast(t('notifications.noBackup') || 'No backup found', 'error');
        return false;
    }

    /**
     * Get available backups info - delegates to SaveService
     */
    getBackupsInfo() {
        return SaveService.getBackupsInfo();
    }

    /**
     * Load game state from SaveService
     */
    load() {
        const result = SaveService.load();

        if (!result.success && result.error) {
            this.ui?.showToast(t('notifications.saveCorruptedBlocked') || 'Save corrupted - use Settings > Restore Backup', 'error');
            return false;
        }

        if (!result.data) {
            // No save data, start fresh
            this.dailyQuests.generateQuests();
            return true;
        }

        // Checksum warning (non-blocking)
        if (result.error === 'checksum_mismatch') {
            logError('Save data checksum mismatch - data may be corrupted', 'Game.load');
        }

        this._loadFromData(result.data);
        return true;
    }

    /**
     * Load game state from data object
     * @param {object} data - Save data
     */
    _loadFromData(data) {
        try {
            // Core data
            this.gold = data.gold || 0;
            this.wave = data.wave || 1;
            this.castle.tier = data.tier || 1;
            this.ether = data.ether || 0;
            this.crystals = data.crystals || 0;
            this.dreadLevel = data.dreadLevel || 0;
            this.lastSaveTime = data.lastSaveTime || Date.now();
            this.autoRetryEnabled = data.autoRetry || false;
            this.autoBuyEnabled = data.autoBuy || false;

            // Speed settings
            if (data.speedIndex !== undefined) {
                this.speedIndex = data.speedIndex;
                this.speedMultiplier = GAME_SPEEDS[this.speedIndex]?.mult || 1;
            }

            // Settings with defaults
            this.settings = data.settings || { showDamageText: true, showRange: true, autoUpgradeTurrets: false };
            if (this.settings.autoUpgradeTurrets === undefined) {
                this.settings.autoUpgradeTurrets = false;
            }

            // Legacy data structures (not handled by subsystems)
            this.miningResources = data.miningResources || {};
            this.researchEffects = data.researchEffects || {};
            this.relics = data.relics || [];
            this.mining.loadSaveData(data.miningActiveMiners);
            this.research.loadSaveData(data.researchPurchased);

            // Upgrades
            if (data.upgrades) {
                data.upgrades.forEach(s => {
                    const u = this.upgrades.upgrades.find(m => m.id === s.id);
                    if (u) u.level = s.level;
                });
            }
            if (data.metaUpgrades) {
                data.metaUpgrades.forEach(s => {
                    const u = this.metaUpgrades.upgrades.find(m => m.id === s.id);
                    if (u) u.level = s.level;
                });
            }

            // Stats
            if (data.stats) {
                this.stats.kills = data.stats.kills || 0;
                this.stats.bosses = data.stats.bosses || 0;
                this.stats.totalGold = data.stats.totalGold || 0;
                this.stats.maxWave = data.stats.maxWave || 0;
                this.stats.unlockedAchievements = data.stats.achievements || [];
                this.stats.xp = data.stats.xp || 0;
                this.stats.level = data.stats.level || 1;
                this.stats.masteryPoints = data.stats.masteryPoints || 0;
                this.stats.mastery = data.stats.mastery || {};
                this.stats.seenEnemies = data.stats.seenEnemies || [];
            }

            // Challenges
            if (data.challenges) {
                this.challenges.darkMatter = data.challenges.dm || 0;
                this.challenges.dmTech = data.challenges.tech || {};
            }

            // Tutorial
            if (data.tutorialStep !== undefined && this.tutorial) {
                this.tutorial.step = data.tutorialStep;
            }

            // Locale
            if (data.locale) {
                i18n.setLocale(data.locale);
            }

            // Sync UI toggles
            const toggleDamage = document.getElementById('toggle-damage');
            const toggleRange = document.getElementById('toggle-range');
            const toggleAutoTurret = document.getElementById('toggle-auto-turret');
            const labAutoRetry = document.getElementById('lab-auto-retry');

            if (toggleDamage) toggleDamage.checked = this.settings.showDamageText;
            if (toggleRange) toggleRange.checked = this.settings.showRange;
            if (toggleAutoTurret) toggleAutoTurret.checked = this.settings.autoUpgradeTurrets;
            if (labAutoRetry) labAutoRetry.checked = this.autoRetryEnabled;

            // Note: Registered subsystems (production, auras, chips, etc.) are loaded
            // automatically by SaveService.load() via their loadSaveData() methods

        } catch (e) {
            getErrorHandler().handleLoadError(e);
        }

        this.dailyQuests.generateQuests();
    }
}

async function init() {
    // Initialize services
    BigNumService.init();

    // Load config files (optional - falls back to data.js if unavailable)
    await ConfigRegistry.loadAll().catch(e => {
        console.warn('ConfigRegistry: Using fallback data.js configs');
    });

    await i18n.init();
    i18n.translatePage();
    new Game();

    // Save and cleanup on window unload
    window.addEventListener('beforeunload', () => {
        // Skip save if resetting (localStorage.clear was called)
        if (window._isResetting) return;
        if (window.game) {
            window.game.save();
            window.game.cleanup();
        }
    });

    // Pause game when tab loses focus
    document.addEventListener('visibilitychange', () => {
        if (!window.game) return;
        if (document.hidden && !window.game.isPaused) {
            window.game._wasPausedBeforeBlur = false;
            window.game.togglePause();
        } else if (!document.hidden && window.game.isPaused && window.game._wasPausedBeforeBlur === false) {
            window.game.togglePause();
            delete window.game._wasPausedBeforeBlur;
        }
    });

    // Quest timer auto-update
    setInterval(() => {
        if (window.game && !document.getElementById('quests-modal').classList.contains('hidden')) {
            const timerEl = document.getElementById('quests-timer');
            if (timerEl && game.dailyQuests) {
                const timeLeft = game.dailyQuests.getTimeUntilReset();
                const hours = Math.floor(timeLeft / 3600000);
                const minutes = Math.floor((timeLeft % 3600000) / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                timerEl.innerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }, 1000);

    // UI badge updates
    setInterval(() => {
        if (!window.game) return;

        // Quest badge - show only if there are incomplete quests
        const questBadge = document.getElementById('quest-badge');
        if (questBadge && game.dailyQuests) {
            const hasIncomplete = game.dailyQuests.quests.length > 0 && game.dailyQuests.quests.some(q => !q.completed);
            questBadge.classList.toggle('hidden', !hasIncomplete);
        }

        // Prestige button glow
        const prestigeBtn = document.getElementById('btn-prestige-menu');
        if (prestigeBtn && game.prestige) {
            prestigeBtn.classList.toggle('prestige-ready', game.prestige.canPrestige());
        }
    }, 2000);

    // Initialize help tooltips
    initHelpTooltips();

    // Auto-expand first menu group (Economy) for better discoverability
    setTimeout(() => {
        const firstMenuContent = document.getElementById('menu-economy');
        const firstMenuHeader = firstMenuContent?.previousElementSibling;
        if (firstMenuContent && firstMenuHeader) {
            firstMenuContent.classList.remove('hidden');
            firstMenuHeader.classList.add('open');
        }
    }, 100);

    // Hide loading screen when game is ready
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => loadingScreen.remove(), 500);
    }
}

function initHelpTooltips() {
    let activeTooltip = null;

    // Use event delegation for dynamic elements
    document.addEventListener('mouseover', (e) => {
        if (!e.target || !e.target.closest) return;
        const icon = e.target.closest('.help-icon[data-help]');
        if (!icon) return;

        const helpKey = icon.getAttribute('data-help');
        const titleKey = `help.${helpKey}.title`;
        const textKey = `help.${helpKey}.text`;

        const title = t(titleKey);
        const text = t(textKey);

        if (!title || title === titleKey) return;

        if (activeTooltip) {
            activeTooltip.remove();
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'help-tooltip';
        tooltip.innerHTML = `
            <div class="help-tooltip-title">${escapeHtml(title)}</div>
            <div class="help-tooltip-text">${escapeHtml(text)}</div>
        `;
        document.body.appendChild(tooltip);

        const rect = icon.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let top = rect.bottom + 10;

        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = rect.top - tooltipRect.height - 10;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;

        activeTooltip = tooltip;
    }, true);

    document.addEventListener('mouseout', (e) => {
        const icon = e.target.closest('.help-icon[data-help]');
        if (!icon) return;

        if (activeTooltip) {
            activeTooltip.remove();
            activeTooltip = null;
        }
    }, true);
}

// Modal Focus Management for Accessibility
(function initModalFocusManagement() {
    let previousActiveElement = null;

    // Observer to detect when modals are shown
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('modal-backdrop')) {
                    if (!target.classList.contains('hidden')) {
                        // Modal opened - store previous focus and focus first focusable element
                        previousActiveElement = document.activeElement;
                        const focusable = target.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                        if (focusable) {
                            setTimeout(() => focusable.focus(), 100);
                        }
                    } else if (previousActiveElement) {
                        // Modal closed - restore focus
                        previousActiveElement.focus();
                        previousActiveElement = null;
                    }
                }
            }
        });
    });

    // Observe all existing modals
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
        observer.observe(modal, { attributes: true });
    });

    // Handle Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal-backdrop:not(.hidden)');
            if (openModal) {
                openModal.classList.add('hidden');
                if (previousActiveElement) {
                    previousActiveElement.focus();
                    previousActiveElement = null;
                }
            }
        }
    });
})();

// Global action handler for data-action buttons with visual feedback
(function initActionHandler() {
    document.addEventListener('click', (e) => {
        // Handle stat upgrade buttons (data-upgrade-stat)
        const statBtn = e.target.closest('[data-upgrade-stat]');
        if (statBtn && !statBtn.disabled && window.game) {
            const statId = statBtn.dataset.upgradeStat;
            if (game.upgradeStat(statId)) {
                const card = statBtn.closest('.lab-stat-card');
                if (card) {
                    card.classList.add('upgrade-success-anim');
                    setTimeout(() => card.classList.remove('upgrade-success-anim'), 400);
                }
            }
            return;
        }

        const btn = e.target.closest('[data-action]');
        if (!btn || btn.disabled) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;

        // Handle different actions
        if (action === 'stat.upgrade' && window.game) {
            if (game.upgradeStat(id)) {
                // Success animation
                const row = btn.closest('.stat-row');
                if (row) {
                    row.classList.add('upgrade-success-anim');
                    setTimeout(() => row.classList.remove('upgrade-success-anim'), 400);
                }
            }
        } else if (action === 'passive.upgrade' && window.game) {
            // Handle passive upgrades
            btn.classList.add('upgrade-success-anim');
            setTimeout(() => btn.classList.remove('upgrade-success-anim'), 400);
        } else if (action === 'turretSlot.remove' && window.game) {
            const slotId = parseInt(id);
            game.turretSlots.removeTurret(slotId);
            game.renderTurretSlotsUI();
        }
    });
})();

// Touch-friendly tooltips for mobile devices
(function initTouchTooltips() {
    let activeTooltip = null;
    let tooltipElement = null;

    function createTooltipElement() {
        if (!tooltipElement) {
            tooltipElement = document.createElement('div');
            tooltipElement.className = 'touch-tooltip';
            document.body.appendChild(tooltipElement);
        }
        return tooltipElement;
    }

    function showTooltip(target, text) {
        const tooltip = createTooltipElement();
        tooltip.textContent = text;
        tooltip.classList.add('visible');

        const rect = target.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;
        tooltip.style.transform = 'translate(-50%, -100%)';

        activeTooltip = target;
    }

    function hideTooltip() {
        if (tooltipElement) {
            tooltipElement.classList.remove('visible');
        }
        activeTooltip = null;
    }

    // Touch handler for elements with title attribute
    document.addEventListener('touchstart', (e) => {
        const target = e.target.closest('[title]');
        if (target && target.title) {
            e.preventDefault();
            if (activeTooltip === target) {
                hideTooltip();
            } else {
                showTooltip(target, target.title);
            }
        } else {
            hideTooltip();
        }
    }, { passive: false });

    // Hide on scroll
    document.addEventListener('scroll', hideTooltip, { passive: true });
})();

// Custom confirm modal to replace native confirm()
window.gameConfirm = function(message, onConfirm, onCancel) {
    const modal = document.getElementById('confirm-modal');
    const messageEl = document.getElementById('confirm-message');
    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');

    if (!modal || !messageEl || !okBtn || !cancelBtn) {
        // Fallback to native confirm if modal not found
        if (confirm(message)) {
            onConfirm && onConfirm();
        } else {
            onCancel && onCancel();
        }
        return;
    }

    messageEl.textContent = message;
    modal.classList.remove('hidden');

    // Clean up previous listeners
    const newOkBtn = okBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newOkBtn.onclick = () => {
        modal.classList.add('hidden');
        onConfirm && onConfirm();
    };

    newCancelBtn.onclick = () => {
        modal.classList.add('hidden');
        onCancel && onCancel();
    };

    // Focus the cancel button for safety
    newCancelBtn.focus();
};

init();
