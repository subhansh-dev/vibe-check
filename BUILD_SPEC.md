# VIBE CHECK — Build Specification
## Chrome Extension for Vibe Coding Prompt Enhancement

Read this ENTIRE file before writing a single line of code. Every detail matters.

---

## WHAT THIS IS

A Chrome browser extension that helps people write better prompts for AI coding tools
(v0, Bolt, Lovable, Cursor, Replit, Claude, ChatGPT, etc.). It's like Grammarly but
specifically for vibe coding prompts.

The user opens the extension popup, types or pastes their prompt, and gets:
- An enhanced version of their prompt
- A quality score out of 100
- Stack-specific tips based on what site they're on
- Token efficiency analysis
- Access to templates and history

## WHAT THIS IS NOT

- This is NOT a ChatGPT wrapper
- This does NOT send prompts to any AI by default
- This does NOT require the user to sign up or log in
- All core features work OFFLINE with rule-based logic
- Optional AI enhancement is available if the user provides their own API key

---

## TECH STACK (DO NOT DEVIATE)

- **Manifest Version:** 3 (MV3) — Chrome's current standard
- **Languages:** Vanilla JavaScript, HTML5, CSS3
- **No frameworks.** No React, no Vue, no build tools, no npm, no webpack.
  The extension runs directly — open folder in chrome://extensions with Developer Mode.
- **Storage:** chrome.storage.local for history and settings
- **Styling:** Pure CSS with CSS custom properties (variables)
- **Icons:** SVG inline or simple PNG icons (create placeholder SVGs)

---

## PROJECT FILE STRUCTURE

```
vibe-check/
├── manifest.json              # Extension manifest (MV3)
├── BUILD_SPEC.md              # This file
├── FEATURE_SPEC.md            # Detailed feature specifications
├── UI_SPEC.md                 # Visual design and layout spec
├── icons/
│   ├── icon16.png             # Toolbar icon 16x16
│   ├── icon48.png             # Extension icon 48x48
│   ├── icon128.png            # Extension icon 128x128
│   └── icon.svg               # Source SVG icon
├── popup/
│   ├── popup.html             # Main popup HTML
│   ├── popup.css              # All popup styles
│   └── popup.js               # Main popup logic
├── content/
│   └── content.js             # Content script (detects current site)
├── background/
│   └── service-worker.js      # Background service worker
├── lib/
│   ├── enhancer.js            # Core prompt enhancement engine (RULE-BASED)
│   ├── scorer.js              # Prompt scoring engine
│   ├── templates.js           # Prompt templates data
│   ├── history.js             # History manager (chrome.storage)
│   ├── settings.js            # Settings manager
│   └── stack-detector.js      # Stack/site detection logic
└── assets/
    └── fonts/                 # (optional — use system fonts if easier)
```

DO NOT create extra files. DO NOT merge files that should be separate.
Each file has ONE job described in FEATURE_SPEC.md.

---

## DESIGN LANGUAGE (MANDATORY — DO NOT CHANGE)

### Color Palette (Dark Theme — Pure Black)
```css
:root {
  --bg-primary: #000000;        /* Pure black background */
  --bg-secondary: #0A0A0A;      /* Slightly lighter black for cards */
  --bg-tertiary: #111111;       /* Input fields, code blocks */
  --bg-hover: #1A1A1A;          /* Hover states */

  --accent-primary: #00E5FF;    /* Cyan — main accent, buttons, highlights */
  --accent-secondary: #B388FF;  /* Violet — secondary accent, scores, badges */
  --accent-amber: #FFD740;      /* Amber — warnings, data, scores */
  --accent-crimson: #FF1744;    /* Red — errors, low scores */

  --text-primary: #FFFFFF;      /* Main text */
  --text-secondary: #B0B0B0;    /* Subdued text */
  --text-muted: #666666;        /* Disabled/hint text */

  --border: #222222;            /* Borders */
  --glass-bg: rgba(10, 10, 10, 0.85);  /* Glass effect background */
  --glass-border: rgba(255, 255, 255, 0.06); /* Glass border */
  --glass-blur: 20px;           /* Backdrop blur */
}
```

### Typography
- Font: system-ui, -apple-system, "Segoe UI", sans-serif
- Monospace: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace
- Sizes: 13px body, 11px small, 15px headings, 24px score numbers
- Weight: 400 normal, 600 semibold, 700 bold

### Design Rules
1. PURE BLACK backgrounds. NEVER grey, NEVER #1a1a1a for main bg.
2. Glass effect on cards: `background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur)); border: 1px solid var(--glass-border);`
3. Border radius: 8px for cards, 6px for buttons, 12px for large containers
4. All transitions: `transition: all 0.2s ease;`
5. NO emojis in the UI. Use simple text symbols or CSS shapes.
6. Popup width: 420px fixed. Height: up to 600px with scroll.
7. Subtle glow effects on interactive elements:
   `box-shadow: 0 0 20px rgba(0, 229, 255, 0.1);`

### Icon Style
The extension icon should be a simple design:
- A chat bubble with a lightning bolt or spark inside
- Cyan (#00E5FF) on transparent background
- Clean, minimal, recognizable at 16px

---

## CHROME EXTENSION PERMISSIONS

In manifest.json, request ONLY these permissions:
```json
{
  "permissions": ["storage", "activeTab", "tabs"],
  "host_permissions": []
}
```

- `storage` — for saving history and settings
- `activeTab` — to detect which site the user is on
- `tabs` — to read the current tab URL for stack detection

DO NOT request broad host permissions. DO NOT request "scripting" unless absolutely
necessary. Keep permissions minimal.

---

## SUBMISSION REQUIREMENTS (for Stardance)

The final product must demonstrate 3 clear major QoL improvements:
1. **One-Click Prompt Enhance** — rewrites vague prompts into specific ones
2. **Stack-Aware Context** — detects what AI coding site you're on and adapts
3. **Prompt Scoring** — scores prompts out of 100 with specific feedback

Plus these bonus features (all must work):
4. Prompt Templates with fill-in-the-blank
5. Token Efficiency Meter
6. Before/After Split View
7. Prompt History with scores
8. Keyboard shortcuts
9. Settings panel
10. Export/Import data

---

## CRITICAL RULES FOR THE BUILD AGENT

1. READ FEATURE_SPEC.md and UI_SPEC.md completely before coding ANY feature.
2. Every function must have a JSDoc comment explaining what it does.
3. Every file must have a header comment explaining its purpose.
4. Test each feature in isolation before moving to the next.
5. The popup must load and display correctly with ZERO external dependencies.
6. The enhancer must work 100% offline with rule-based logic.
7. Error handling on EVERY chrome.storage call, EVERY API call, EVERY DOM operation.
8. The extension must survive: empty history, no settings, invalid API key, network failure.
9. DO NOT use async/await where it's not needed.
10. DO NOT add any analytics, tracking, or external service calls except the optional AI API.
