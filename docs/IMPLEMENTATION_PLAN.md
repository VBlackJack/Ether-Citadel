# Ether Citadel - Implementation Plan

## Document Info
- **Version**: 2.0
- **Date**: December 31, 2025
- **Status**: Active Development

---

## 1. CURRENT STATE AUDIT

### 1.1 Project Overview

Ether Citadel is a mature idle tower defense game with **~11,000 lines of JavaScript** implementing a comprehensive progression system. The codebase demonstrates excellent data-driven architecture with 44 manager classes.

### 1.2 Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                      CURRENT ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│  main.js (7,810 lines)                                          │
│  ├── Game class (central hub)                                   │
│  ├── 44 Manager classes (inline)                                │
│  ├── Combat logic                                               │
│  ├── Wave spawning                                              │
│  └── All render functions                                       │
├─────────────────────────────────────────────────────────────────┤
│  js/game/          js/entities/       js/systems/               │
│  ├── GameLoop      ├── Castle         ├── audio/SoundManager    │
│  ├── GameState     ├── Enemy          ├── combat/SkillManager   │
│  └── GameUI        ├── Turret         ├── economy/MiningManager │
│                    ├── Projectile     └── progression/          │
│                    └── Drone              ├── PassiveManager    │
│                                           └── PrestigeManager   │
├─────────────────────────────────────────────────────────────────┤
│  data.js (837 lines) - Game database                            │
│  config.js (116 lines) - Constants & utilities                  │
│  i18n.js (262 lines) - Internationalization                     │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Implemented Systems (44 Total)

| Category | Systems | Status |
|----------|---------|--------|
| **Combat** | Turrets, Enemies, Projectiles, Skills, Boss Mechanics | COMPLETE |
| **Economy** | Gold, Ether, Crystals, Dark Matter, Mining, Forge, Production | COMPLETE |
| **Progression** | Upgrades, Meta Upgrades, Prestige, Research, Passives | COMPLETE |
| **Content** | Relics, Chips, Achievements, Challenges, Daily Quests | COMPLETE |
| **Advanced** | Dread Mode, Awakening, Talents, Synergies, Combos | COMPLETE |
| **Meta** | Town, School, Office, Ascension, Campaign, Game Modes | COMPLETE |
| **QoL** | Auto-advance, Auto-retry, Speed controls, Tutorials | COMPLETE |
| **Infrastructure** | Save/Load, i18n (EN/FR), Error handling, UI components | COMPLETE |

### 1.4 Technical Debt & Issues

| Issue | Severity | Impact | Solution |
|-------|----------|--------|----------|
| Monolithic main.js (7,810 lines) | HIGH | Maintainability | Modularize into separate files |
| No BigNum library | MEDIUM | Scaling limits at 1e15 | Add break_infinity.js |
| No JSON Schema validation | MEDIUM | Config errors | Add Ajv validation |
| Base64 save encoding | LOW | Not secure | Add encryption layer |
| No unit tests | MEDIUM | Regression risk | Add Jest/Vitest |
| No TypeScript | LOW | Type safety | Add JSDoc types |

### 1.5 Strengths

- Zero hardcoding of game values (all in data.js)
- Complete i18n support (EN/FR)
- Robust save/load with offline earnings
- Modular entity classes
- Event delegation for UI
- No external dependencies

---

## 2. TARGET ARCHITECTURE

### 2.1 Directory Structure (Proposed)

```
Ether-Citadel/
├── src/
│   ├── domain/                    # Pure game rules (no DOM)
│   │   ├── formulas/
│   │   │   ├── damage.js          # Damage calculations
│   │   │   ├── costs.js           # Cost scaling formulas
│   │   │   ├── prestige.js        # Prestige point calculations
│   │   │   └── index.js
│   │   ├── models/
│   │   │   ├── Currency.js        # Currency BigNum wrapper
│   │   │   ├── Upgrade.js         # Upgrade model
│   │   │   └── index.js
│   │   └── index.js
│   │
│   ├── engine/                    # Simulation & tick loop
│   │   ├── core/
│   │   │   ├── GameLoop.js        # Main update loop
│   │   │   ├── EntityManager.js   # Entity lifecycle
│   │   │   └── index.js
│   │   ├── combat/
│   │   │   ├── TargetingSystem.js
│   │   │   ├── DamageSystem.js
│   │   │   ├── ProjectileSystem.js
│   │   │   └── index.js
│   │   └── index.js
│   │
│   ├── data/                      # Config loading & validation
│   │   ├── schemas/               # JSON Schema definitions
│   │   │   ├── enemies.schema.json
│   │   │   ├── turrets.schema.json
│   │   │   └── ...
│   │   ├── ConfigLoader.js        # Load + validate configs
│   │   ├── ConfigRegistry.js      # Access by ID
│   │   └── index.js
│   │
│   ├── services/                  # Cross-cutting concerns
│   │   ├── SaveService.js         # Versioned save/load
│   │   ├── BigNumService.js       # Number formatting
│   │   ├── AudioService.js        # Sound management
│   │   ├── I18nService.js         # Translations
│   │   └── index.js
│   │
│   └── ui/                        # DOM interactions
│       ├── renderers/
│       │   ├── UpgradeRenderer.js
│       │   ├── ResearchRenderer.js
│       │   └── ...
│       ├── components/
│       │   ├── Modal.js
│       │   ├── Toast.js
│       │   └── ...
│       └── index.js
│
├── configs/                       # JSON tuning files
│   ├── enemies.json
│   ├── turrets.json
│   ├── waves.json
│   ├── upgrades_run.json
│   ├── upgrades_meta.json
│   ├── research_tree.json
│   ├── prestige.json
│   ├── passives.json
│   ├── chips.json
│   ├── relics.json
│   ├── loot_tables.json
│   ├── dread_modes.json
│   └── constants.json
│
├── locales/                       # Translations
│   ├── en.json
│   └── fr.json
│
├── tests/                         # Unit tests
│   ├── domain/
│   │   ├── formulas.test.js
│   │   └── ...
│   ├── services/
│   │   ├── save.test.js
│   │   └── ...
│   └── setup.js
│
├── docs/
│   ├── IMPLEMENTATION_PLAN.md     # This document
│   ├── ARCHITECTURE.md            # Architecture guide
│   └── API.md                     # API documentation
│
└── js/                            # Legacy (migrate gradually)
    ├── main.js                    # Current monolith
    ├── data.js                    # Current data
    └── ...
```

### 2.2 Migration Strategy

**Principle**: Encapsulate, don't rewrite. Keep existing code working while extracting modules.

1. **Phase 1**: Add new structure alongside existing code
2. **Phase 2**: Extract pure functions to `src/domain/`
3. **Phase 3**: Move managers to separate files
4. **Phase 4**: Remove dead code from main.js
5. **Phase 5**: Full refactor with new architecture

---

## 3. IMPLEMENTATION ROADMAP

### Phase 1: Infrastructure (Week 1-2)

#### Task 1.1: BigNum Service
**Priority**: HIGH | **Effort**: 4h

- [ ] Add break_infinity.js as dependency
- [ ] Create `src/services/BigNumService.js`
- [ ] Wrap all currency operations
- [ ] Add formatting options (scientific, engineering, letters)
- [ ] Update formatNumber() in config.js

**Acceptance Criteria**:
- Numbers > 1e308 display correctly
- Settings option for notation style
- No breaking changes to existing code

#### Task 1.2: Config Loader with Validation
**Priority**: HIGH | **Effort**: 8h

- [ ] Add Ajv for JSON Schema validation
- [ ] Create `configs/` directory with JSON files
- [ ] Create JSON Schemas in `src/data/schemas/`
- [ ] Create `ConfigLoader.js` with validation
- [ ] Create `ConfigRegistry.js` for ID lookup
- [ ] Migrate data.js constants to JSON

**Acceptance Criteria**:
- All game configs in JSON files
- Schema validation on load
- Hot-reload in dev mode (optional)
- Clear error messages for invalid configs

#### Task 1.3: Enhanced Save Service
**Priority**: HIGH | **Effort**: 6h

- [ ] Add schema version tracking
- [ ] Create migration system (v1 -> v2 -> v3)
- [ ] Add data integrity verification (checksum)
- [ ] Add encryption layer (optional)
- [ ] Add export/import with compression (LZ-string)

**Acceptance Criteria**:
- Save files are versioned
- Old saves migrate automatically
- Export produces compressed string
- Import validates before loading

### Phase 2: Data-Driven Configs (Week 2-3)

#### Task 2.1: Enemy Config
**Priority**: MEDIUM | **Effort**: 4h

```json
// configs/enemies.json
{
  "basic": {
    "id": "basic",
    "nameKey": "ENEMY_BASIC_NAME",
    "baseHp": 10,
    "hpScaling": 1.15,
    "baseDamage": 5,
    "speed": 1.0,
    "goldReward": { "base": 5, "scaling": 1.1 },
    "spawnWeight": 100
  },
  "fast": { ... },
  "armored": { ... },
  "boss": { ... }
}
```

#### Task 2.2: Turret Config
**Priority**: MEDIUM | **Effort**: 4h

```json
// configs/turrets.json
{
  "sentry": {
    "id": "sentry",
    "nameKey": "TURRET_SENTRY_NAME",
    "baseDamage": 10,
    "baseFireRate": 1.0,
    "baseRange": 150,
    "projectileSpeed": 500,
    "targeting": "nearest",
    "unlockWave": 1
  },
  "laser": { ... },
  "rocket": { ... }
}
```

#### Task 2.3: Wave Config
**Priority**: MEDIUM | **Effort**: 6h

```json
// configs/waves.json
{
  "generator": {
    "baseEnemyCount": 5,
    "countScaling": 1.05,
    "bossInterval": 10,
    "eliteChance": { "base": 0.05, "perWave": 0.001 }
  },
  "compositions": {
    "early": { "basic": 100 },
    "mid": { "basic": 60, "fast": 30, "armored": 10 },
    "late": { "basic": 40, "fast": 30, "armored": 20, "elite": 10 }
  }
}
```

#### Task 2.4: Upgrade Configs
**Priority**: MEDIUM | **Effort**: 4h

```json
// configs/upgrades_run.json
{
  "damage": {
    "id": "damage",
    "nameKey": "UPG_RUN_DAMAGE_NAME",
    "descKey": "UPG_RUN_DAMAGE_DESC",
    "baseCost": 10,
    "costGrowth": 1.15,
    "maxLevel": -1,
    "effect": { "type": "multiply", "stat": "damage", "base": 1.1 }
  }
}
```

### Phase 3: Combat Engine Normalization (Week 3-4)

#### Task 3.1: Entity Models
**Priority**: MEDIUM | **Effort**: 8h

- [ ] Create `EnemyInstance` class
- [ ] Create `TurretInstance` class
- [ ] Create `ProjectileInstance` class
- [ ] Create `StatusEffect` class
- [ ] Standardize entity interfaces

#### Task 3.2: Combat Systems
**Priority**: MEDIUM | **Effort**: 12h

- [ ] Extract `TargetingSystem.js`
- [ ] Extract `DamageSystem.js`
- [ ] Extract `ProjectileSystem.js`
- [ ] Extract `StatusEffectSystem.js`
- [ ] Create combat multiplier breakdown

**Acceptance Criteria**:
- All combat calculations traceable
- DPS breakdown panel shows all multipliers
- Status effects properly stack/refresh

### Phase 4: Meta Systems Integration (Week 4-5)

#### Task 4.1: Prestige System Cleanup
**Priority**: MEDIUM | **Effort**: 4h

- [ ] Verify prestige point formula
- [ ] Ensure wave skip works correctly
- [ ] Add auto-prestige option
- [ ] Test reset state preservation

#### Task 4.2: Research Tree
**Priority**: MEDIUM | **Effort**: 4h

- [ ] Move research nodes to JSON
- [ ] Verify all effects apply correctly
- [ ] Add visual tree rendering (SVG)

#### Task 4.3: Chips & Relics
**Priority**: MEDIUM | **Effort**: 6h

- [ ] Verify chip stat application
- [ ] Verify relic bonus stacking
- [ ] Add breakdown panel for equipped items

#### Task 4.4: Dread Mode & Mining
**Priority**: LOW | **Effort**: 4h

- [ ] Verify dread multipliers
- [ ] Verify mining offline earnings
- [ ] Verify production scaling

### Phase 5: UI & i18n Polish (Week 5-6)

#### Task 5.1: Stats Breakdown Panel
**Priority**: MEDIUM | **Effort**: 8h

- [ ] Create DPS breakdown component
- [ ] Show all damage multiplier sources
- [ ] Show gold gain multiplier sources
- [ ] Make toggleable (debug/advanced mode)

#### Task 5.2: i18n Completion
**Priority**: MEDIUM | **Effort**: 4h

- [ ] Audit all visible text
- [ ] Add missing keys to locales
- [ ] Verify interpolation works
- [ ] Add error logging for missing keys

#### Task 5.3: Accessibility
**Priority**: LOW | **Effort**: 4h

- [ ] Add aria-labels
- [ ] Ensure keyboard navigation
- [ ] Test screen reader compatibility

### Phase 6: Testing & Quality (Week 6-7)

#### Task 6.1: Unit Tests
**Priority**: MEDIUM | **Effort**: 12h

- [ ] Setup Jest/Vitest
- [ ] Test cost formulas
- [ ] Test damage calculations
- [ ] Test prestige point formula
- [ ] Test save/load serialization
- [ ] Test BigNum operations

#### Task 6.2: Smoke Test Documentation
**Priority**: LOW | **Effort**: 2h

- [ ] Document manual test checklist
- [ ] Add to README.md
- [ ] Create test save files

---

## 4. ACCEPTANCE CRITERIA

### Definition of Done

- [ ] Game starts without errors
- [ ] Waves progress, enemies spawn, bosses appear every 10 waves
- [ ] Upgrades modify combat stats (verifiable in breakdown)
- [ ] Prestige resets run state, preserves meta state
- [ ] Research/Chips/Relics apply bonuses correctly
- [ ] Save persists across reload
- [ ] Import/Export works
- [ ] Configs can be modified without code changes
- [ ] No hardcoded UI text (all i18n)
- [ ] Numbers format correctly at all scales
- [ ] No console errors in normal gameplay

---

## 5. TECHNICAL SPECIFICATIONS

### BigNum Format Suffixes

```javascript
const SUFFIXES = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
  'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', ...
];
```

### Save Format v2

```javascript
{
  schemaVersion: 2,
  timestamp: number,
  checksum: string,
  data: {
    currencies: { gold: string, ether: string, crystals: string, ... },
    progression: { wave: number, prestige: number, ... },
    upgrades: { ... },
    meta: { ... },
    inventory: { relics: [], chips: [] },
    settings: { ... }
  }
}
```

### Config Schema Example

```json
// schemas/enemies.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "additionalProperties": {
    "type": "object",
    "required": ["id", "nameKey", "baseHp", "baseDamage"],
    "properties": {
      "id": { "type": "string" },
      "nameKey": { "type": "string" },
      "baseHp": { "type": "number", "minimum": 1 },
      "baseDamage": { "type": "number", "minimum": 0 },
      "speed": { "type": "number", "default": 1.0 }
    }
  }
}
```

---

## 6. RISK ASSESSMENT

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing saves | MEDIUM | HIGH | Version migrations, backup before load |
| Performance regression | LOW | MEDIUM | Profile before/after, keep FPS target |
| Scope creep | HIGH | MEDIUM | Strict phase adherence, timeboxing |
| BigNum precision issues | LOW | MEDIUM | Extensive testing at edge cases |
| i18n missing keys | MEDIUM | LOW | Fallback to key name, log warnings |

---

## 7. DEPENDENCIES

### New Dependencies (Minimal)

| Package | Purpose | Size |
|---------|---------|------|
| break_infinity.js | BigNum math | ~20KB |
| ajv | JSON Schema validation | ~150KB |
| lz-string | Save compression | ~8KB |

### Dev Dependencies

| Package | Purpose |
|---------|---------|
| vitest | Unit testing |
| eslint | Code linting |
| prettier | Code formatting |

---

## 8. CHANGELOG

### v2.0 (December 31, 2025)
- Complete codebase audit
- Revised architecture proposal
- Detailed task breakdown
- Added acceptance criteria

### v1.0 (Previous)
- Initial implementation plan
- Feature list definition

---

## 9. NEXT STEPS

1. **Review this plan** with stakeholders
2. **Create branches** for each phase
3. **Start Phase 1** (BigNum, Config Loader, Save Service)
4. **Weekly check-ins** to assess progress
5. **Iterate** based on findings

---

*Document maintained by: Development Team*
*Last updated: December 31, 2025*
