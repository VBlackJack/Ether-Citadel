# Modularization Guide

## Current State

`main.js` contains 42 classes (~7,800 lines). Several modular files exist in `js/systems/` but only `PassiveManager` is currently imported.

## Target Structure

```
js/
├── main.js                 # Game class + initialization only (~500 lines)
├── entities/
│   ├── Castle.js           ✓ exists
│   ├── Turret.js           ✓ exists
│   ├── Enemy.js            ✓ exists
│   ├── Projectile.js       ✓ exists
│   ├── Drone.js            ✓ exists
│   ├── Particle.js         (in main.js)
│   ├── FloatingText.js     (in main.js)
│   └── Rune.js             (in main.js)
├── systems/
│   ├── combat/
│   │   ├── SkillManager.js       ✓ exists (not imported)
│   │   ├── BossMechanicsManager.js
│   │   └── ComboManager.js
│   ├── economy/
│   │   ├── MiningManager.js      ✓ exists (not imported)
│   │   ├── ForgeManager.js
│   │   ├── ProductionManager.js
│   │   └── UpgradeManager.js
│   ├── progression/
│   │   ├── PrestigeManager.js    ✓ exists (not imported)
│   │   ├── PassiveManager.js     ✓ imported
│   │   ├── StatsManager.js
│   │   ├── ResearchManager.js
│   │   └── ChallengeManager.js
│   ├── meta/
│   │   ├── AscensionManager.js
│   │   ├── TalentManager.js
│   │   └── AwakeningManager.js
│   ├── world/
│   │   ├── TownManager.js
│   │   ├── SchoolManager.js
│   │   ├── OfficeManager.js
│   │   ├── WeatherManager.js
│   │   └── CampaignManager.js
│   ├── items/
│   │   ├── ChipManager.js
│   │   ├── AuraManager.js
│   │   └── TurretSlotManager.js
│   ├── social/
│   │   ├── LeaderboardManager.js
│   │   └── DailyQuestManager.js
│   ├── ui/
│   │   ├── TutorialManager.js    ✓ exists (not imported)
│   │   └── VisualEffectsManager.js
│   └── audio/
│       ├── SoundManager.js       ✓ exists (not imported)
│       └── MusicManager.js
└── services/
    ├── BigNumService.js    ✓ new
    ├── SaveService.js      ✓ new
    └── ConfigLoader.js     ✓ new
```

## Extraction Pattern

### Step 1: Create the module file

```javascript
// js/systems/economy/UpgradeManager.js
import { t } from '../../i18n.js';
import { formatNumber } from '../../config.js';
import { createUpgrades } from '../../data.js';

export class UpgradeManager {
    constructor(game) {
        this.game = game;  // Store reference instead of using window.game
        this.upgrades = createUpgrades();
    }

    // ... methods using this.game instead of window.game
}
```

### Step 2: Import in main.js

```javascript
import { UpgradeManager } from './systems/economy/UpgradeManager.js';
```

### Step 3: Remove class from main.js

Delete the class definition from main.js.

### Step 4: Update instantiation

```javascript
// In Game constructor
this.upgrades = new UpgradeManager(this);
```

## Key Refactoring Pattern

Replace all `window.game` or global `game` references with `this.game`:

```javascript
// Before (in main.js)
if (game.gold >= cost) {
    game.gold -= cost;
    game.save();
}

// After (in module)
if (this.game.gold >= cost) {
    this.game.gold -= cost;
    this.game.save();
}
```

## Priority Order

Extract in this order to minimize breaking changes:

1. **Entities** (no game state dependencies)
   - Particle, FloatingText, Rune

2. **Standalone managers** (minimal cross-references)
   - StatsManager
   - MetaUpgradeManager
   - BuildPresetManager

3. **Feature managers** (moderate dependencies)
   - MiningManager, ForgeManager, ProductionManager
   - ChipManager, AuraManager
   - DailyQuestManager

4. **Core managers** (heavy dependencies)
   - UpgradeManager
   - ChallengeManager
   - PrestigeManager

5. **Integration managers** (last)
   - SynergyManager
   - GameModeManager
   - SeasonalEventManager

## Testing Each Extraction

After extracting each class:

1. Start the game and verify no console errors
2. Test the specific feature (e.g., buying upgrades)
3. Verify save/load still works
4. Check for undefined references

## Common Issues

### Circular Dependencies
If module A imports B and B imports A:
- Move shared types to a separate file
- Use late binding (pass game instance)

### Missing Exports
```javascript
// Ensure all dependencies are exported from data.js
export { createUpgrades, TURRET_TIERS, ... };
```

### Window.game References
The pattern `if (!window.game) return;` becomes:
```javascript
if (!this.game) return;
```

## Estimated Effort

| Category | Classes | Lines | Effort |
|----------|---------|-------|--------|
| Entities | 6 | ~600 | Low |
| Combat | 4 | ~500 | Medium |
| Economy | 4 | ~600 | Medium |
| Progression | 5 | ~800 | Medium |
| Meta | 3 | ~400 | Low |
| World | 5 | ~500 | Medium |
| Items | 3 | ~400 | Low |
| Social | 2 | ~200 | Low |
| UI | 2 | ~200 | Low |
| Audio | 2 | ~300 | Low |
| **Total** | **36** | **~4,500** | **~8-12 hours** |

The remaining ~3,300 lines are the Game class and utility code.
