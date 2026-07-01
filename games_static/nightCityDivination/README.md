# ARCANA — Night City Tarot

A cyberpunk-themed Major Arcana tarot experience built as a zero-dependency static web application. Inspired by the *Cyberpunk 2077* character Misty Olszewski and her role as a tarot reader for V, the project merges traditional tarot symbolism with a Night City aesthetic: neon glow, rain, scan lines, Japanese typography, and corpo iconography.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Card Assets](#card-assets)
- [Architecture](#architecture)
  - [Data Layer](#data-layer)
  - [Rendering](#rendering)
  - [Animation System](#animation-system)
  - [Game Logic](#game-logic)
- [Design System](#design-system)
- [Browser Support](#browser-support)
- [Extending the Project](#extending-the-project)

---

## Overview

ARCANA is a client-side-only tarot reading application. There is no build step, no package manager, and no runtime dependencies. It runs from a single HTML entry point with a linked stylesheet and script file. All 22 Major Arcana cards are defined in a structured JavaScript data array with per-card oracle text, upright/reversed interpretations, thematic keywords, path classification, and a per-card neon glow color.

---

## Features

**Visual & Atmospheric**
- Full-viewport animated rain system (80 dynamically generated DOM elements with randomised velocity, opacity, and delay)
- Canvas-based floating particle field (60 particles, two-tone gold/purple colorway, wrapping boundary logic, `requestAnimationFrame` loop)
- CSS noise overlay using inline SVG `feTurbulence` filter, animated with `steps()` timing for authentic CRT grain
- Repeating scan-line overlay simulating phosphor display degradation
- Radial vignette with three independently drifting ambient orbs
- Mouse-driven parallax on hero card showcase (normalized `[-1, 1]` cursor coordinates mapped to transform offsets)
- Stochastic glitch effect on hero title (random RGB channel offset at ~8% probability per 2-second interval)
- Typewriter hero subtitle with randomised per-character delay (20–35ms)
- `IntersectionObserver`-powered scroll reveal on lore and section header elements

**UI & Interaction**
- Hero 3-card showcase with CSS `transform-style: preserve-3d` flip animation cycling every 8 seconds
- Proximity-based image saturation boost on arcana grid (distance computed from cursor to card center, threshold 200px)
- Staggered card grid entrance animations with `animation-delay` scaled per index
- Path filter system (All / Light Path / Shadow Path / Power) that rebuilds the DOM grid on selection

**Game Modes**
- **Single Draw** — randomly selects one of the 22 cards and opens the reading modal
- **Browse & Select** — full scrollable grid of all cards; clicking any card opens its reading modal directly
- **Three-Card Spread** — sequentially reveals Past, Present, and Future cards with staggered 400ms slot animations, followed by a synthesised reading summary

**Reading Modal**
- Per-card data displayed: card image, roman numeral, name, archetype tagline, oracle passage, upright meaning, reversed meaning, keyword tags
- Per-card neon glow color applied dynamically to the card frame backdrop
- CSS flip animation replayed on each new card open via forced reflow (`void el.offsetWidth`)
- Backdrop blur + scroll lock on `<body>` while modal is active

---

## Project Structure

```
/
├── index.html          # Application shell and all section markup
├── styles.css          # Complete design system, layout, and animation definitions
├── game.js             # Card data, DOM construction, game logic, event bindings
└── cards/              # Card image assets (not included — see Card Assets)
    ├── The Fool.png
    ├── The Magician.png
    ├── The High Priestess.png
    ├── The Empress.png
    ├── The Emperor.png
    ├── The Hierophant.png
    ├── The Lovers.png
    ├── The Chariot.png
    ├── Strength.png
    ├── The Hermit.png
    ├── Wheel of Fortune.png
    ├── Justice.png
    ├── The Hanged Man.png
    ├── Death.png
    ├── Temperance.png
    ├── The Devil.png
    ├── The Tower.png
    ├── The Star.png
    ├── The Moon.png
    ├── The Sun.png
    ├── Judgement.png
    └── The World.png
```

---

## Getting Started

No build tools or dependencies are required.

**Option 1 — Direct file open**

Place the three source files and the `cards/` folder in the same directory and open `index.html` in a browser. Note that some browsers restrict local file loading of images when opened via `file://`; if images do not appear, use a local server instead.

**Option 2 — Local development server**

Any static file server will work:

```bash
# Python 3
python -m http.server 8080

# Node (npx, no install required)
npx serve .

# VS Code
# Use the Live Server extension
```

Then open `http://localhost:8080` in your browser.

**Option 3 — Static hosting**

The project deploys as-is to any static hosting platform (GitHub Pages, Netlify, Vercel, Cloudflare Pages). No build configuration is needed — point the platform at the repository root.

---

## Card Assets

Card images are not bundled with the source code. Place your own artwork in a `cards/` directory at the project root. Filenames must match the following list exactly, including spaces and casing:

| Filename | Arcana Number |
|---|---|
| `The Fool.png` | 0 |
| `The Magician.png` | I |
| `The High Priestess.png` | II |
| `The Empress.png` | III |
| `The Emperor.png` | IV |
| `The Hierophant.png` | V |
| `The Lovers.png` | VI |
| `The Chariot.png` | VII |
| `Strength.png` | VIII |
| `The Hermit.png` | IX |
| `Wheel of Fortune.png` | X |
| `Justice.png` | XI |
| `The Hanged Man.png` | XII |
| `Death.png` | XIII |
| `Temperance.png` | XIV |
| `The Devil.png` | XV |
| `The Tower.png` | XVI |
| `The Star.png` | XVII |
| `The Moon.png` | XVIII |
| `The Sun.png` | XIX |
| `Judgement.png` | XX |
| `The World.png` | XXI |

The application expects a portrait aspect ratio of approximately **3:5** (width:height). Images that deviate significantly from this ratio will render with distortion in the grid and modal layouts. Other formats (`.jpg`, `.webp`) can be used by updating the `src` path construction in `game.js`.

---

## Architecture

### Data Layer

All card data is defined in a single `ARCANA` constant in `game.js` — an array of 22 objects with the following schema:

```js
{
  id: Number,          // 0–21, canonical Major Arcana index
  name: String,        // Display name, also used as the image filename key
  roman: String,       // Roman numeral for display ("0", "I" … "XXI")
  path: String,        // Filter category: "light" | "shadow" | "power"
  archetype: String,   // One-line cyberpunk archetype descriptor
  glow: String,        // CSS rgba() color applied to the card's neon glow backdrop
  oracle: String,      // Long-form oracle reading in Night City voice
  upright: String,     // Traditional upright interpretation
  reversed: String,    // Traditional reversed interpretation
  keywords: String[]   // 5 thematic keyword tags
}
```

The `PATH_FILTERS` object maps each filter key to a predicate function, keeping filter logic decoupled from grid rendering:

```js
const PATH_FILTERS = {
  all:    () => true,
  light:  c => c.path === "light",
  shadow: c => c.path === "shadow",
  power:  c => c.path === "power"
};
```

### Rendering

The arcana grid is built entirely via JavaScript DOM construction in `buildArcanaGrid()`. This function reads the `currentFilter` state, filters the `ARCANA` array, and renders each card as a dynamically created `div` tree with inline animation delay staggering. The grid is fully rebuilt on each filter change rather than hiding/showing elements, which keeps the DOM minimal and re-triggers entrance animations on filter switch.

The reading modal is pre-rendered in HTML with empty placeholder elements; `openReading(card)` populates those elements directly via `textContent` and `style` assignments. This avoids innerHTML injection for the primary content, limiting dynamic HTML to the keywords tag strip and spread reading summary where the data is fully controlled.

### Animation System

Animations are split across two layers:

**CSS animations** handle everything that runs continuously or is triggered by state class changes: scan lines, noise overlay, ambient orb drift, particle glow pulses, card floating in the hero showcase, the hero card flip, scroll-hint bounce, button star rotation, status indicator blink, and all entrance transitions (hero content, reading modal, oracle reveal, title slide-in).

**JavaScript animations** handle everything that requires runtime data or cursor input: the canvas particle loop (`requestAnimationFrame`), rain DOM generation, mouse parallax on hero showcase cards, proximity-based grid saturation boost, the stochastic glitch effect on the hero title, the typewriter effect on the hero subtitle, and the `IntersectionObserver` scroll reveal.

The card flip animation in the reading modal is re-triggered on each open using a forced reflow pattern:

```js
wrap.style.animation = "none";
void wrap.offsetWidth;   // forces reflow, clearing the animation state
wrap.style.animation = "reading-card-enter 0.8s cubic-bezier(0.34,1.56,0.64,1)";
```

### Game Logic

**Single draw** — `drawRandom()` selects a card at random from the full `ARCANA` array using `Math.floor(Math.random() * 22)` and delegates to `openReading()`.

**Spread** — `drawSpread()` creates a shuffled copy of `ARCANA` via `[...ARCANA].sort(() => Math.random() - 0.5)` and takes the first three entries. Cards are revealed into their slots with staggered `setTimeout` calls at 400ms intervals. After 1600ms (accounting for all three reveals), `showSpreadReading()` constructs and injects the synthesised summary.

**Modal lifecycle** — both reading and spread modes follow the same open/close contract: set `display: flex` on the section, set `display: block` on the shared `modal-overlay`, lock `document.body` scroll. Close reverses all three. The overlay element itself is a click target for dismissal, handled by a single listener that calls both close functions defensively.

---

## Design System

All design tokens are defined as CSS custom properties on `:root`:

```css
--gold / --gold-light / --gold-dark   /* Primary accent — card borders, buttons, headings */
--neon-red                            /* Emperor / power path accent */
--neon-purple                         /* Fool / oracle / High Priestess accent */
--neon-blue                           /* High Priestess secondary */
--neon-pink                           /* Empress accent */
--neon-cyan                           /* Status indicator */
--dark-0 through --dark-4             /* Background depth scale */
--text-primary / --text-secondary / --text-dim  /* Type opacity scale */
```

**Typography** is loaded from Google Fonts and assigned by role:

| Font | Role |
|---|---|
| Cinzel Decorative | Display headings, card names, hero title |
| Cinzel | Subheadings, roman numerals, metadata |
| Orbitron | UI labels, navigation, buttons, tags |
| Rajdhani | Body text, oracle passages, descriptions |
| Noto Serif JP | Japanese decorative text elements |

**Button rendering** uses a `::before` pseudo-element at `z-index: -1` for the gold fill, ensuring text nodes and child elements always stack above the background regardless of whether they are wrapped in an element or exist as bare text nodes. The hover glow uses a second layer at `z-index: -2` with `filter: blur()` for the bloom effect.

**Clip-path** is used on buttons and the reading modal container to produce the angled-corner aesthetic without border-image or SVG masking:

```css
clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
```

---

## Browser Support

The application targets modern evergreen browsers. The following APIs are used without polyfills:

- `Canvas 2D` — particle system
- `IntersectionObserver` — scroll reveal
- `CSS custom properties` — design tokens throughout
- `CSS clip-path` — button and container shaping
- `CSS transform-style: preserve-3d` — hero card flip
- `CSS backdrop-filter` — modal overlay blur (requires hardware acceleration; falls back gracefully to solid background on unsupported browsers)
- `requestAnimationFrame` — particle animation loop

Internet Explorer is not supported.

---

## Extending the Project

**Adding or editing card data** — all 22 cards are defined in the `ARCANA` array at the top of `game.js`. Each object is self-contained; modifying oracle text, keywords, upright/reversed meanings, or glow color requires only editing the relevant object.

**Changing card image format** — image paths are constructed as `` `cards/${card.name}.png` `` throughout `game.js`. A find-and-replace of `.png` to `.webp` (or any other format) is sufficient to switch formats globally.

**Adding new spread types** — the current three-card spread is implemented in `drawSpread()` and `showSpreadReading()`. Additional spread layouts (Celtic Cross, five-card, etc.) can follow the same pattern: shuffle `ARCANA`, slice the required number of cards, reveal them sequentially with `setTimeout`, then render a synthesised summary.

**Theming** — the full color palette is controlled by the `:root` CSS custom properties block. Reassigning the neon accent variables changes the atmospheric color of the entire interface.
