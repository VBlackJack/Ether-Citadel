# Ether Citadel

A browser-based idle tower defense game with deep progression systems.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange?logo=html5)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-Apache%202.0-blue)

## Play Now

**[Play Ether Citadel](https://vblackjack.github.io/Ether-Citadel/)**

## About

Defend your citadel against endless waves of enemies in this incremental tower defense game. Upgrade your castle, unlock powerful turrets, research new technologies, and prestige to become stronger with each run.

## Features

### Core Gameplay
- **Castle Defense** - Protect your citadel from waves of increasingly powerful enemies
- **Manual & Idle Combat** - Click to shoot or let your turrets handle it
- **Boss Waves** - Face challenging bosses every 10 waves

### Progression Systems
- **Turret Slots** - Place unlocked turrets around your castle for passive bonuses and active fire
- **Prestige System** - Reset progress for Ether, a permanent currency for powerful upgrades
- **Research Tree** - Spend crystals to unlock permanent bonuses
- **Mining & Forging** - Gather resources and craft powerful relics

### Advanced Features
- **Town Levels** - Unlock new game mechanics as your town grows
- **School System** - Train and upgrade 8 unique turret types
- **Office Boosts** - Purchase temporary and permanent productivity bonuses
- **Awakening** - Unlock ultimate bonuses for endgame progression
- **Dread Mode** - Hardcore difficulty modifier for veteran players

### Quality of Life
- **Auto-Retry** - Automatically restart after game over
- **Auto-Buy** - Automatically purchase affordable upgrades
- **Daily Quests** - Complete objectives for bonus rewards
- **Achievements** - Track your progress with unlockable achievements
- **Cloud Save** - Export/import your save data anytime

## Technologies

- **Vanilla JavaScript (ES6+)** - No frameworks, pure JS
- **HTML5 Canvas** - 2D rendering for smooth gameplay
- **Tailwind CSS** - Utility-first styling
- **i18n** - Full internationalization support (English & French)

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
├── index.html          # Main game page
├── css/
│   └── styles.css      # Custom styles & animations
├── js/
│   ├── main.js         # Game engine & all classes
│   ├── data.js         # Game data (upgrades, enemies, etc.)
│   ├── config.js       # Configuration constants
│   └── i18n.js         # Internationalization system
└── locales/
    ├── en.json         # English translations
    └── fr.json         # French translations
```

## Controls

| Action | Control |
|--------|---------|
| Shoot | Left Click on canvas |
| Rush Wave | Click "RUSH" button (+25% gold) |
| Speed Toggle | Click speed button (x1 / x2 / x3) |
| Place Turret | Click empty turret slot |

## Game Tips

1. **Early Game** - Focus on damage and fire rate upgrades
2. **Mid Game** - Unlock turret slots and place turrets for passive DPS
3. **Late Game** - Prestige when progress slows to gain Ether
4. **Endgame** - Complete research tree and unlock awakening bonuses

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Author

**Julien Bombled**

---

*Ether Citadel - Defend. Upgrade. Prestige. Repeat.*
