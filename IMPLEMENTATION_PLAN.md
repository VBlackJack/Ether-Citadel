# Aegis Nexus - Implementation Plan
## Defender Idle 2 Features Integration

---

## Current Status

### Completed
- [x] i18n system (FR/EN with auto-detection)
- [x] Modular file structure (js/css/locales)
- [x] Data structures in `data.js`:
  - `TURRET_TIERS` (T1-T6)
  - `DREAD_LEVELS` (0-10)
  - `MINING_RESOURCES` (6 types)
  - `FORGE_RECIPES` (4 recipes)
  - `RESEARCH_TREE` (3 branches)
  - `RELIC_DB` expanded (16 relics, 4 tiers)

### In Progress
- [ ] Turret Tier system integration in game logic

---

## Implementation Tasks

### 1. Turret Tier System (T1-T6)
**Files:** `main.js`, `index.html`, `fr.json`, `en.json`

**Logic Changes (`main.js`):**
```javascript
// Add to Game class state
this.turretTiers = { main: 'T1', turrets: ['T1', 'T1', 'T1', 'T1'] };

// Modify Turret class constructor
constructor(game, index, tier = 'T1') {
    this.tier = tier;
    this.tierData = TURRET_TIERS[tier];
}

// Add tier upgrade method
upgradeTurretTier(index) {
    const tiers = Object.keys(TURRET_TIERS);
    const currentIdx = tiers.indexOf(this.turretTiers.turrets[index]);
    if (currentIdx < tiers.length - 1) {
        const nextTier = tiers[currentIdx + 1];
        const tierData = TURRET_TIERS[nextTier];
        // Check wave unlock requirement
        if (this.wave >= tierData.unlockWave) {
            // Deduct crystals cost
            this.turretTiers.turrets[index] = nextTier;
        }
    }
}
```

**UI Changes (`index.html`):**
- Add tier indicator on turret buttons
- Add upgrade tier button in turret context menu

**Translations:**
```json
"turretTiers": {
    "T1": { "name": "Basic" },
    "T2": { "name": "Enhanced" },
    "T3": { "name": "Advanced" },
    "T4": { "name": "Elite" },
    "T5": { "name": "Legendary" },
    "T6": { "name": "Mythic" }
}
```

---

### 2. Dread/Chaos Mode
**Files:** `main.js`, `index.html`, `fr.json`, `en.json`

**Logic Changes (`main.js`):**
```javascript
// Add to Game class state
this.currentDread = 0;
this.maxDreadUnlocked = 0;

// Modify enemy spawn to apply dread multipliers
spawnEnemy() {
    const dreadData = DREAD_LEVELS[this.currentDread];
    const hp = baseHp * dreadData.enemyMult;
    // ...
}

// Modify reward calculation
calculateReward(enemy) {
    const dreadData = DREAD_LEVELS[this.currentDread];
    return baseReward * dreadData.rewardMult;
}

// Unlock higher dread on wave completion
onWaveComplete() {
    if (this.wave >= 10 * (this.maxDreadUnlocked + 1)) {
        this.maxDreadUnlocked = Math.min(10, this.maxDreadUnlocked + 1);
    }
}
```

**UI Changes (`index.html`):**
- Add Dread selector in challenge modal
- Display current Dread level in HUD
- Color-coded difficulty indicator

**Translations:**
```json
"dread": {
    "title": "Dread Level",
    "level0": "Normal",
    "level1": "Unrest",
    "level2": "Turmoil",
    "level3": "Chaos",
    "level4": "Mayhem",
    "level5": "Nightmare",
    "level6": "Inferno",
    "level7": "Apocalypse",
    "level8": "Cataclysm",
    "level9": "Oblivion",
    "level10": "Void"
}
```

---

### 3. Strategic Surrender
**Files:** `main.js`, `index.html`, `fr.json`, `en.json`

**Logic Changes (`main.js`):**
```javascript
// Add surrender method
strategicSurrender() {
    if (this.wave >= 5) { // Minimum wave requirement
        const etherBonus = Math.floor(this.wave * 0.5);
        const keepPercentage = 0.25; // Keep 25% of current gold as starting gold next run

        this.pendingEther += etherBonus;
        this.surrenderGoldBonus = Math.floor(this.gold * keepPercentage);
        this.gameOver(true); // true = voluntary surrender
    }
}
```

**UI Changes (`index.html`):**
- Add "Surrender" button in game HUD (disabled before wave 5)
- Confirmation modal with bonus preview

**Translations:**
```json
"surrender": {
    "button": "Strategic Retreat",
    "confirm": "Retreat now?",
    "bonus": "You will receive:",
    "etherBonus": "+{{value}} Ether",
    "goldBonus": "{{value}} starting Gold next run",
    "minWave": "Available from wave 5"
}
```

---

### 4. Relic Forge
**Files:** `main.js`, `index.html`, `fr.json`, `en.json`

**New Class (`main.js`):**
```javascript
class ForgeManager {
    constructor(game) {
        this.game = game;
    }

    canAfford(recipe) {
        for (const [resource, amount] of Object.entries(recipe.cost)) {
            if ((this.game.miningResources[resource] || 0) < amount) return false;
        }
        return true;
    }

    execute(recipeId, relicId = null) {
        const recipe = FORGE_RECIPES.find(r => r.id === recipeId);
        if (!this.canAfford(recipe)) return { success: false, reason: 'cost' };

        // Deduct resources
        for (const [resource, amount] of Object.entries(recipe.cost)) {
            this.game.miningResources[resource] -= amount;
        }

        // Apply research bonus to success rate
        const bonusRate = this.game.researchEffects.forgeSuccess || 0;
        const finalRate = Math.min(1, recipe.successRate + bonusRate);

        if (Math.random() < finalRate) {
            return this.applyRecipe(recipe, relicId);
        } else {
            return { success: false, reason: 'failed' };
        }
    }

    applyRecipe(recipe, relicId) {
        switch (recipe.type) {
            case 'upgrade':
                return this.upgradeRelic(relicId);
            case 'reroll':
                return this.rerollRelic(relicId);
            case 'fuse':
                return this.fuseRelics();
            case 'legendary':
                return this.forgeLegendary();
        }
    }

    upgradeRelic(relicId) {
        // Increase relic tier (T1->T2, etc.)
        const relic = this.game.relics.find(r => r.id === relicId);
        if (relic && relic.tier < 4) {
            // Find same relic at higher tier
            const upgraded = RELIC_DB.find(r => r.tier === relic.tier + 1);
            if (upgraded) {
                const idx = this.game.relics.indexOf(relic);
                this.game.relics[idx] = { ...upgraded };
                return { success: true, result: upgraded };
            }
        }
        return { success: false, reason: 'max_tier' };
    }

    rerollRelic(relicId) {
        const idx = this.game.relics.findIndex(r => r.id === relicId);
        const oldRelic = this.game.relics[idx];
        const sameTier = RELIC_DB.filter(r => r.tier === oldRelic.tier && r.id !== oldRelic.id);
        const newRelic = sameTier[Math.floor(Math.random() * sameTier.length)];
        this.game.relics[idx] = { ...newRelic };
        return { success: true, result: newRelic };
    }

    fuseRelics() {
        // Combine 2 random relics into 1 higher tier
        if (this.game.relics.length >= 2) {
            const tier = Math.max(...this.game.relics.map(r => r.tier));
            const higherTier = RELIC_DB.filter(r => r.tier === Math.min(4, tier + 1));
            const result = higherTier[Math.floor(Math.random() * higherTier.length)];
            this.game.relics.splice(0, 2); // Remove 2 relics
            this.game.relics.push({ ...result });
            return { success: true, result };
        }
        return { success: false, reason: 'not_enough_relics' };
    }

    forgeLegendary() {
        const legendaries = RELIC_DB.filter(r => r.tier === 4);
        const result = legendaries[Math.floor(Math.random() * legendaries.length)];
        this.game.relics.push({ ...result });
        return { success: true, result };
    }
}
```

**UI Changes (`index.html`):**
- Add Forge modal with recipe cards
- Relic selection interface for upgrade/reroll
- Success/failure animation

**Translations:**
```json
"forge": {
    "title": "Relic Forge",
    "upgrade": { "name": "Enhance", "desc": "Upgrade relic to next tier (60% success)" },
    "reroll": { "name": "Transmute", "desc": "Reroll relic into another of same tier" },
    "fuse": { "name": "Fusion", "desc": "Combine 2 relics into 1 higher tier (40%)" },
    "legendary": { "name": "Legendary Forge", "desc": "Craft a legendary relic (20%)" },
    "success": "Success!",
    "failed": "Failed...",
    "selectRelic": "Select a relic"
}
```

---

### 5. Mining System
**Files:** `main.js`, `index.html`, `fr.json`, `en.json`

**New Class (`main.js`):**
```javascript
class MiningManager {
    constructor(game) {
        this.game = game;
        this.activeMiners = []; // { resourceId, startTime, duration }
        this.maxMiners = 3;
    }

    startMining(resourceId) {
        if (this.activeMiners.length >= this.maxMiners) return false;

        const resource = MINING_RESOURCES.find(r => r.id === resourceId);
        const duration = 60000 / resource.baseRate; // Base 1 minute per unit
        const speedMult = 1 + (this.game.researchEffects.miningSpeed || 0);

        this.activeMiners.push({
            resourceId,
            startTime: Date.now(),
            duration: duration / speedMult
        });
        return true;
    }

    update() {
        const now = Date.now();
        const completed = [];

        for (const miner of this.activeMiners) {
            if (now - miner.startTime >= miner.duration) {
                completed.push(miner);
            }
        }

        for (const miner of completed) {
            const resource = MINING_RESOURCES.find(r => r.id === miner.resourceId);
            const relicBonus = 1 + (this.game.relicMults.mining || 0);
            const amount = Math.floor(1 * relicBonus);

            this.game.miningResources[miner.resourceId] =
                (this.game.miningResources[miner.resourceId] || 0) + amount;

            // Auto-restart mining
            const idx = this.activeMiners.indexOf(miner);
            this.activeMiners[idx].startTime = now;
        }
    }

    getProgress(minerId) {
        const miner = this.activeMiners[minerId];
        if (!miner) return 0;
        const elapsed = Date.now() - miner.startTime;
        return Math.min(1, elapsed / miner.duration);
    }
}
```

**UI Changes (`index.html`):**
- Add Mining tab in main panel or separate modal
- Resource display with icons
- Miner slots with progress bars
- Resource selection dropdown

**Translations:**
```json
"mining": {
    "title": "Mining",
    "copper": { "name": "Copper" },
    "iron": { "name": "Iron" },
    "crystal": { "name": "Crystal" },
    "gold_ore": { "name": "Gold Ore" },
    "void_shard": { "name": "Void Shard" },
    "starlight": { "name": "Starlight" },
    "startMining": "Start Mining",
    "slots": "Miner Slots",
    "progress": "Progress"
}
```

---

### 6. Crystals Currency
**Files:** `main.js`, `index.html`, `fr.json`, `en.json`

**Logic Changes (`main.js`):**
```javascript
// Add to Game class state
this.crystals = 0;

// Crystal sources:
// - Boss kills (scaling with wave)
// - Dread mode bonus
// - Mining (crystal resource)
// - Achievements

onBossKill(boss) {
    const baseCrystals = Math.floor(this.wave / 10) + 1;
    const dreadBonus = DREAD_LEVELS[this.currentDread].rewardMult;
    this.crystals += Math.floor(baseCrystals * dreadBonus);
}

// Crystal uses:
// - Turret tier upgrades
// - Special meta upgrades
// - Forge recipes (converted from mining crystals)
```

**UI Changes (`index.html`):**
- Add crystal display in HUD (next to gold/ether)
- Crystal icon: 💎

**Translations:**
```json
"currency": {
    "crystals": "Crystals"
}
```

---

### 7. Auto-Skill Toggle
**Files:** `main.js`, `index.html`, `fr.json`, `en.json`

**Logic Changes (`main.js`):**
```javascript
// Add to Game class state
this.autoSkills = { Q: false, W: false, E: false };

// Add meta upgrade
{
    id: 'autoSkillQ',
    nameKey: 'metaUpgrades.autoSkillQ.name',
    descKey: 'metaUpgrades.autoSkillQ.desc',
    baseCost: 15, costMult: 100, level: 0, maxLevel: 1,
    getEffect: (lvl) => lvl > 0,
    format: (v) => v ? t('status.on') : t('status.off'),
    icon: '🔴'
},
// Same for W and E

// Auto-cast logic in update loop
updateAutoSkills() {
    if (this.autoSkills.Q && this.skillCooldowns.Q <= 0) {
        this.useSkill('Q');
    }
    // Same for W and E
}
```

**UI Changes (`index.html`):**
- Add toggle checkboxes on skill buttons
- Visual indicator when auto is active

**Translations:**
```json
"metaUpgrades": {
    "autoSkillQ": { "name": "Auto Overdrive", "desc": "Auto-cast Q skill" },
    "autoSkillW": { "name": "Auto Meteor", "desc": "Auto-cast W skill" },
    "autoSkillE": { "name": "Auto Black Hole", "desc": "Auto-cast E skill" }
}
```

---

### 8. Visual Research Tree
**Files:** `main.js`, `index.html`, `css/styles.css`, `fr.json`, `en.json`

**New Class (`main.js`):**
```javascript
class ResearchManager {
    constructor(game) {
        this.game = game;
        this.unlockedNodes = new Set();
    }

    canUnlock(nodeId) {
        const branch = this.findBranch(nodeId);
        const node = branch.nodes.find(n => n.id === nodeId);

        // Check prerequisites
        for (const req of node.requires) {
            if (!this.unlockedNodes.has(req)) return false;
        }

        // Check cost (uses Ether)
        return this.game.ether >= node.cost;
    }

    unlock(nodeId) {
        if (!this.canUnlock(nodeId)) return false;

        const branch = this.findBranch(nodeId);
        const node = branch.nodes.find(n => n.id === nodeId);

        this.game.ether -= node.cost;
        this.unlockedNodes.add(nodeId);
        this.applyEffect(node.effect);
        return true;
    }

    applyEffect(effect) {
        for (const [key, value] of Object.entries(effect)) {
            this.game.researchEffects[key] =
                (this.game.researchEffects[key] || 0) + value;
        }
    }

    findBranch(nodeId) {
        for (const branch of Object.values(RESEARCH_TREE)) {
            if (branch.nodes.some(n => n.id === nodeId)) return branch;
        }
        return null;
    }
}
```

**UI Changes (`index.html`):**
- Add Research modal with visual tree
- SVG-based node connections
- Three branches (Offense/Defense/Utility)
- Locked/unlocked/available states

**CSS (`styles.css`):**
```css
.research-tree {
    display: flex;
    gap: 2rem;
    padding: 1rem;
}

.research-branch {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.research-node {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 3px solid #334155;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
}

.research-node.locked {
    opacity: 0.4;
    cursor: not-allowed;
}

.research-node.available {
    border-color: #fbbf24;
    animation: pulse-glow 2s infinite;
}

.research-node.unlocked {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.2);
}

.research-connection {
    width: 2px;
    height: 30px;
    background: #334155;
}

.research-connection.active {
    background: #22c55e;
}
```

**Translations:**
```json
"research": {
    "title": "Research Tree",
    "offense": { "name": "Offense" },
    "defense": { "name": "Defense" },
    "utility": { "name": "Utility" },
    "dmg_1": { "name": "Sharp I", "desc": "+10% Damage" },
    "dmg_2": { "name": "Sharp II", "desc": "+15% Damage" },
    "dmg_3": { "name": "Sharp III", "desc": "+25% Damage" },
    "crit_1": { "name": "Precision I", "desc": "+5% Crit Chance" },
    "crit_2": { "name": "Lethality", "desc": "+50% Crit Damage" },
    "speed_1": { "name": "Rapid I", "desc": "+10% Fire Rate" },
    "speed_2": { "name": "Rapid II", "desc": "+15% Fire Rate" },
    "hp_1": { "name": "Fortify I", "desc": "+10% Health" },
    "hp_2": { "name": "Fortify II", "desc": "+15% Health" },
    "hp_3": { "name": "Fortify III", "desc": "+25% Health" },
    "regen_1": { "name": "Recovery", "desc": "+20% Regen" },
    "shield_1": { "name": "Barrier", "desc": "+20% Shield" },
    "armor_1": { "name": "Plating", "desc": "+5% Armor" },
    "gold_1": { "name": "Prosperity I", "desc": "+10% Gold" },
    "gold_2": { "name": "Prosperity II", "desc": "+15% Gold" },
    "xp_1": { "name": "Wisdom", "desc": "+20% XP" },
    "mining_1": { "name": "Excavation I", "desc": "+25% Mining" },
    "mining_2": { "name": "Excavation II", "desc": "+50% Mining" },
    "forge_1": { "name": "Smithing", "desc": "+10% Forge Success" },
    "cost": "Cost",
    "requires": "Requires"
}
```

---

## File Modification Summary

| File | Changes |
|------|---------|
| `js/main.js` | Add MiningManager, ForgeManager, ResearchManager classes. Modify Game class for new state (dread, crystals, autoSkills, turretTiers). Add update loops for mining and auto-skills. |
| `js/data.js` | Add meta upgrades for auto-skills. Already has tier/dread/mining/forge/research data. |
| `index.html` | Add modals: Mining, Forge, Research, Dread selector. Add UI elements: crystal display, surrender button, tier indicators. |
| `css/styles.css` | Add styles for research tree, forge UI, mining progress bars. |
| `locales/fr.json` | Add all new translation keys (turretTiers, dread, mining, forge, research, surrender, currency). |
| `locales/en.json` | Add all new translation keys (same as fr.json). |

---

## Recommended Implementation Order

1. **Crystals Currency** - Foundation for other systems
2. **Mining System** - Provides resources for Forge
3. **Relic Forge** - Uses mining resources
4. **Research Tree** - Enhances all systems
5. **Turret Tiers** - Uses crystals
6. **Dread Mode** - End-game scaling
7. **Auto-Skills** - Quality of life
8. **Strategic Surrender** - Alternative progression

---

## Testing Checklist

- [ ] All new systems save/load correctly
- [ ] Translations complete for FR and EN
- [ ] UI responsive on mobile
- [ ] No performance regression
- [ ] Balance testing for dread scaling
- [ ] Forge success rates feel fair
- [ ] Mining rates balanced with gameplay pace
