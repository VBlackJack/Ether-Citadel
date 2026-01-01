# Ether Citadel

A browser-based idle tower defense game with deep progression systems and die & retry mechanics.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange?logo=html5)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-Apache%202.0-blue)

## Play Now

**[Play Ether Citadel](https://vblackjack.github.io/Ether-Citadel/)**

## About

Defend your citadel against endless waves of enemies in this incremental tower defense game. Each death makes you stronger through permanent upgrades, creating an addictive "one more run" loop.

### Die & Retry Philosophy

- **Death is progress** - Each run earns Prestige Points for permanent upgrades
- **Strategic resets** - Know when to prestige for maximum efficiency
- **Scaling challenge** - Enemies grow faster than you, forcing smart progression
- **Cumulative power** - Multiple upgrade layers compound over many runs

## Features

### Core Gameplay
- **Castle Defense** - Protect your citadel from waves of increasingly powerful enemies
- **Manual & Idle Combat** - Click to shoot or let your turrets handle it
- **Boss Waves** - Face challenging bosses every 10 waves with unique mechanics
- **Dread Mode** - Increase difficulty for better rewards

### Progression Systems

| System | Currency | Persists | Purpose |
|--------|----------|----------|---------|
| **Upgrades** | Gold | Per run | In-game power (damage, speed, health) |
| **Prestige** | Prestige Points | Forever | Permanent stat multipliers |
| **Meta Upgrades** | Ether | Forever | Global bonuses & automation unlocks |
| **Passives** | Prestige Points | Forever | Deep skill tree (offense, defense, utility) |
| **Research** | Crystals | Forever | Tech tree unlocks |
| **Relics** | Drops/Forge | Per run | Powerful random bonuses |

### Advanced Features
- **Production Buildings** - Passive gold, crystal, and ether generation
- **Mining & Forging** - Gather resources and craft powerful relics
- **Town Levels** - Unlock new mechanics as your town grows
- **School System** - Train and upgrade 8 unique turret types
- **Awakening** - Ultimate bonuses for endgame (requires Dread 6)
- **Combo System** - Chain kills for damage multipliers

### Quality of Life
- **Auto-Retry** - Automatically restart after game over
- **Auto-Buy** - Automatically purchase affordable upgrades
- **Auto-Prestige** - Prestige automatically at target wave
- **Offline Earnings** - Earn resources while away (up to 24h)
- **Daily Quests** - Complete objectives for bonus rewards
- **Cloud Save** - Export/import your save data anytime
- **i18n Support** - English & French languages

## Technologies

- **Vanilla JavaScript (ES6+)** - No frameworks, modular architecture
- **HTML5 Canvas** - 2D rendering for smooth gameplay
- **Tailwind CSS** - Utility-first styling
- **break_infinity.js** - Big number support for late game

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/VBlackJack/Ether-Citadel.git
cd Ether-Citadel
```

2. Start a local server:
```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve
```

3. Open `http://localhost:8080` in your browser

## Project Structure

```
Ether-Citadel/
├── index.html              # Main game page
├── css/
│   └── styles.css          # Custom styles & animations
├── js/
│   ├── main.js             # Game engine & initialization
│   ├── config.js           # Configuration constants
│   ├── data.js             # Game data definitions
│   ├── i18n.js             # Internationalization
│   ├── constants/          # Balance & color constants
│   ├── entities/           # Game entities
│   │   ├── Castle.js       # Player castle
│   │   ├── Enemy.js        # Enemy types & behaviors
│   │   ├── Turret.js       # Turret system
│   │   └── Projectile.js   # Projectile physics
│   ├── systems/
│   │   ├── combat/         # Damage, skills, targeting
│   │   ├── economy/        # Upgrades, production, forge
│   │   ├── progression/    # Prestige, meta upgrades
│   │   ├── audio/          # Sound & music
│   │   └── ui/             # UI components
│   ├── services/           # Save, config, big numbers
│   └── utils/              # Helpers & sanitization
└── locales/
    ├── en.json             # English translations
    └── fr.json             # French translations
```

## Controls

| Action | Control |
|--------|---------|
| Shoot | Left Click on canvas |
| Rush Wave | Click "RUSH" button (+25% gold) |
| Speed Toggle | Click speed button (x1 / x2 / x3) |
| Place Turret | Click empty turret slot |

## Progression Guide

### Early Game (Waves 1-25)
- Focus on **Damage** and **Attack Speed** upgrades
- Unlock your first **Turret Slot**
- Die around wave 25-40 on first run - this is normal!

### Mid Game (Waves 25-75)
- **Prestige** when progress slows (aim for 10+ PP per prestige)
- Prioritize **Gold Gain** and **Damage** prestige upgrades
- Unlock **Meta Upgrades** with Ether for permanent bonuses

### Late Game (Waves 75-150)
- Stack multiple prestige upgrades (damage, gold, start wave)
- Use **Dread Mode** for better rewards (higher risk)
- Build **Production** for passive income

### Endgame (Waves 150+)
- Complete **Research Tree** for final bonuses
- Reach **Dread 6** to unlock **Awakening**
- Optimize prestige timing for maximum PP/hour

## Balance Philosophy

The game is balanced around the die & retry loop:

- **First run**: Expected death around wave 40-60
- **Each prestige**: +10-20 waves of progress
- **Soft walls**: Force strategic decisions, not grinding
- **No infinite scaling**: Enemy HP accelerates after wave 50

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Author

**Julien Bombled**

---

*Ether Citadel - Die. Upgrade. Retry. Conquer.*
