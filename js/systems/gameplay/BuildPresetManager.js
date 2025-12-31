/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { BUILD_PRESET_SLOTS } from '../../data.js';
import { t } from '../../i18n.js';

export class BuildPresetManager {
    constructor(game) {
        this.game = game;
        this.presets = [];
        for (let i = 0; i < BUILD_PRESET_SLOTS; i++) {
            this.presets.push({ name: `${t('presets.slot')} ${i + 1}`, data: null });
        }
    }

    savePreset(slotIndex, name) {
        if (slotIndex < 0 || slotIndex >= BUILD_PRESET_SLOTS) return false;
        this.presets[slotIndex] = {
            name: name || `${t('presets.slot')} ${slotIndex + 1}`,
            data: {
                turrets: this.game.turretSlots?.getSaveData(),
                upgrades: this.game.upgrades?.map(u => ({ id: u.id, level: u.level }))
            }
        };
        this.game.save();
        return true;
    }

    loadPreset(slotIndex) {
        if (slotIndex < 0 || slotIndex >= BUILD_PRESET_SLOTS) return false;
        const preset = this.presets[slotIndex];
        if (!preset?.data) return false;

        if (preset.data.turrets && this.game.turretSlots) {
            this.game.turretSlots.loadSaveData(preset.data.turrets);
        }
        return true;
    }

    deletePreset(slotIndex) {
        if (slotIndex < 0 || slotIndex >= BUILD_PRESET_SLOTS) return false;
        this.presets[slotIndex] = { name: `${t('presets.slot')} ${slotIndex + 1}`, data: null };
        this.game.save();
        return true;
    }

    getSaveData() { return { presets: this.presets }; }
    loadSaveData(data) { if (data) this.presets = data.presets || this.presets; }
}