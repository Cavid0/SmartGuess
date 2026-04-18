# Mini Games Hub

A polished collection of four browser mini-games — Code Breaker, Number Guess, Snake, and Tic-Tac-Toe — built with pure HTML, CSS, and vanilla JavaScript. Zero dependencies, zero build step.

**Play live:** [cavid0.github.io/MiniGamesHub](https://cavid0.github.io/MiniGamesHub/)

---

## Games

| Game | Description | Attempts / Mode |
| --- | --- | --- |
| **Code Breaker** | Decrypt a 4-digit secure sequence using position + existence hints. | 6 attempts |
| **Number Guess** | Find the hidden number between 1 and 100 with smart boundary hints. | 5 attempts |
| **Snake** | Classic snake with bonus food, escalating levels, and local high score. | Endless |
| **Tic-Tac-Toe** | Two-player local PvP with persistent scoreboard and custom names. | Best of ∞ |

---

## Features

- Modern neon-styled UI with glassmorphism and smooth animations
- Fully responsive across desktop, tablet, and mobile
- Mobile touch support (Snake swipe controls, tap-to-play cards)
- Keyboard shortcuts on the hub (`1`–`4` to launch games)
- Persistent scores via `localStorage` (Snake high score, Tic-Tac-Toe names)
- Accessibility: semantic landmarks, ARIA labels, reduced-motion friendly

## Client-side Protection

The hub includes a lightweight protection layer that discourages casual tampering:

- Blocks **F12**, **Ctrl+Shift+I/J/C/K**, **Ctrl+U** (view source), **Ctrl+S** (save)
- Disables the right-click context menu
- Detects DevTools via window-size heuristics and `console.log` toString traps
- Blurs and overlays the page when DevTools is opened
- Suppresses `console.*` output and discourages iframe embedding
- Game scripts are wrapped in IIFEs and secrets are XOR-encoded in memory, so values don't appear plainly in the debugger

## Getting Started

No installation or build required.

```bash
# Clone
git clone https://github.com/Cavid0/MiniGamesHub.git
cd MiniGamesHub

# Open in a browser
open index.html     # macOS
start index.html    # Windows
xdg-open index.html # Linux
```

Or serve locally with any static server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Project Structure

```
MiniGamesHub/
├── index.html              # Hub / landing page
├── assets/
│   ├── favicon.svg
│   ├── css/
│   │   ├── style.css       # Hub styles
│   │   └── security.css    # Protection overlay + toast
│   └── js/
│       ├── main.js         # Hub interactions
│       └── security.js     # Client protection module
└── games/
    ├── codebreaker/
    ├── numberguess/
    ├── snake/
    └── tictactoe/
```

## Tech Stack

- HTML5 semantic markup
- CSS3 — custom properties, flex/grid, animations, backdrop-filter
- Vanilla JavaScript (ES2020+), no frameworks
- Google Fonts — Outfit, JetBrains Mono

## Browser Support

Tested on the latest versions of Chrome, Edge, Firefox, and Safari. Requires a browser with `backdrop-filter`, `localStorage`, and ES2020 support.

## License

MIT © 2025
