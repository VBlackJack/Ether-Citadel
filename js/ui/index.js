/*
 * Copyright 2025 Julien Bombled
 * UI Systems Index
 */

export {
    ModalManager,
    DialogHelper,
    getModalManager,
    getDialogHelper,
    cleanupModals,
    MODAL_COLORS,
    DIALOG_I18N_KEYS
} from './Modal.js';

export {
    ToastManager,
    getToastManager,
    cleanupToasts
} from './Toast.js';

export {
    HelpTooltipManager,
    getHelpTooltipManager,
    cleanupHelpTooltips
} from './HelpTooltip.js';

export {
    EventDelegationManager,
    getEventDelegation,
    cleanupEventDelegation
} from './EventDelegation.js';

import { cleanupModals } from './Modal.js';
import { cleanupToasts } from './Toast.js';
import { cleanupHelpTooltips } from './HelpTooltip.js';
import { cleanupEventDelegation } from './EventDelegation.js';

/**
 * Cleanup all UI resources
 */
export function cleanupAllUI() {
    cleanupModals();
    cleanupToasts();
    cleanupHelpTooltips();
    cleanupEventDelegation();
}
