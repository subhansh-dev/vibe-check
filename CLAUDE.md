# vibe-check — Chrome Extension

## MANDATORY: Load Design Skills Before ANY UI Work

**BEFORE editing popup.css, popup.html, or ANY visual file, you MUST run these skills in order:**

1. `skill:taste-skill` — Design taste and aesthetic judgment. ALWAYS load first.
2. `skill:ui-ux-pro-max` — Advanced UI/UX patterns and component design.
3. `skill:design-skill` — Core design patterns and visual systems.
4. `skill:mrgoonie-ui-ux-pro-max` — Pro-max UI/UX refinements.
5. `skill:mrgoonie-design` — Design patterns and best practices.
6. `skill:mrgoonie-ui-styling` — CSS styling patterns and techniques.
7. `skill:mrgoonie-design-system` — Design system architecture.
8. `skill:theme-factory` — Theme generation and management.
9. `skill:colorize` — Color palette generation and harmony.
10. `skill:frontend-design` — Frontend-specific design patterns.
11. `skill:delight` — Micro-interactions and delightful details.
12. `skill:polish` — Final polish pass on UI.
13. `skill:bolder` — Make design bolder and more impactful.
14. `skill:zajno-motion` — Zajno-style motion design.
15. `skill:framer-motion` — Animation patterns (port to CSS for vanilla).
16. `skill:canvas-design` — Canvas/WebGL visual effects.
17. `skill:redesign-skill` — Redesign existing UIs.
18. `skill:critique` — Design critique checklist.
19. `skill:21st-dev-magic` — Pull 21st.dev components via MCP.

**If any skill fails to load, SKIP it and continue with the rest. Never skip the design phase.**

## Project Context

- **Type:** Chrome Extension (Manifest V3)
- **Location:** `C:\Users\Admin\Desktop\vibe-check`
- **Purpose:** AI prompt enhancer — scores, enhances, templates, history
- **Stack:** Vanilla HTML/CSS/JS (no React, no build step)
- **Theme:** Dark glass aesthetic — pure black, cyan (#00E5FF) + violet (#B388FF) accents
- **Font:** Inter + JetBrains Mono

## Design System

### Colors (CSS Custom Properties)
```css
--bg-primary: #06060a;        /* Deep black, NOT grey */
--bg-secondary: #0c0c12;      /* Slightly lighter */
--bg-tertiary: #12121a;       /* Card/panel backgrounds */
--accent-primary: #00E5FF;    /* Cyan — primary action */
--accent-secondary: #B388FF;  /* Violet — secondary */
--accent-amber: #FFD740;      /* Warnings, highlights */
--accent-crimson: #FF1744;    /* Errors, danger */
--accent-green: #00E676;      /* Success */
```

### Glass Panel Pattern
All panels/sections should use the 3-layer glass system:
1. Element: `background: linear-gradient(135deg, rgba(8,10,18,0.85), rgba(4,5,10,0.9))` + `backdrop-filter: blur(20px) saturate(1.3)`
2. `::before` — shimmer sweep animation (8s ease-in-out infinite)
3. `::after` — chrome inner rim (`inset 2px 2px 1px rgba(255,255,255,0.18)`)

### Anti-Slop Rules
- NO emojis anywhere — use inline SVG icons
- NO grey/matte backgrounds — deep black with bright specular edges
- NO generic gradients — use restrained accent colors
- NO Inter for everything — JetBrains Mono for code, Inter for UI
- Borders: `rgba(255,255,255,0.12)` NOT `rgba(255,255,255,0.04)`

## File Structure
- `popup/popup.html` — Main UI markup
- `popup/popup.css` — All styles (619 lines)
- `popup/popup.js` — Main controller (1302 lines)
- `lib/` — Core modules (scorer, enhancer, templates, history, settings)
- `background/service-worker.js` — Background processing
- `content/content.js` — Content script
- `manifest.json` — Extension manifest
- `preview.html` — Browser preview mode

## When Editing CSS
- Always grep for duplicate selectors after 5+ patches
- Use CSS custom properties, never hardcode hex
- Test in both dark (default) and light themes
- Browser preview mode: add `?preview` to preview.html URL
