/*
 * Copyright 2025 Julien Bombled
 * Apache-2.0 License
 */

import { t } from '../../i18n.js';

export class TutorialManager {
    constructor() {
        this.step = 0;
    }

    check(gold) {
        const overlay = document.getElementById('tutorial-overlay');
        if (!overlay) return;
        const title = document.getElementById('tuto-title');
        const text = document.getElementById('tuto-text');
        const arrow = document.getElementById('tuto-arrow');

        if (this.step === 0) {
            overlay.classList.remove('hidden');
            title.innerText = t('tutorial.welcome.title');
            text.innerText = t('tutorial.welcome.text');
            arrow.classList.add('hidden');
        } else if (this.step === 1 && gold >= 10) {
            overlay.classList.remove('hidden');
            overlay.style.top = '60%';
            overlay.style.left = '80%';
            title.innerText = t('tutorial.upgrade.title');
            text.innerText = t('tutorial.upgrade.text');
            arrow.classList.remove('hidden');
            arrow.style.transform = 'rotate(90deg)';
            arrow.style.right = '-40px';
        }
    }

    next() {
        this.step++;
        document.getElementById('tutorial-overlay').classList.add('hidden');
    }
}