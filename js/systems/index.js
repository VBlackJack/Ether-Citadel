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
 * Systems Module Index
 * Exports all game system managers
 */

// Audio Systems
export { SoundManager } from './audio/SoundManager.js';

// Combat Systems
export { SkillManager } from './combat/SkillManager.js';
export { DamageSystem } from './combat/DamageSystem.js';
export { TargetingSystem, TargetingMode } from './combat/TargetingSystem.js';
export { AutoSkillManager } from './combat/AutoSkillManager.js';
export { ProjectileSystem, Projectile, ProjectileType } from './combat/ProjectileSystem.js';

// Economy Systems
export { MiningManager } from './economy/MiningManager.js';
export { UpgradeManager } from './economy/UpgradeManager.js';
export { ProductionManager } from './economy/ProductionManager.js';
export { ForgeManager } from './economy/ForgeManager.js';

// Progression Systems
export { PrestigeManager } from './progression/PrestigeManager.js';
export { PassiveManager } from './progression/PassiveManager.js';
export { MetaUpgradeManager } from './progression/MetaUpgradeManager.js';
export { ResearchManager } from './progression/ResearchManager.js';
export { SurrenderSystem } from './progression/SurrenderSystem.js';

// UI Systems
export { TutorialManager } from './ui/TutorialManager.js';
