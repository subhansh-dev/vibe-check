# UI SPECIFICATION — VIBE CHECK
## Every pixel, every state, every animation

---

## POPUP LAYOUT

The popup is a fixed 420px wide, max 600px tall container.
It has 4 main sections stacked vertically.

```
┌──────────────────────────────────────────┐
│  HEADER (fixed, always visible)          │
│  Logo · Tabs · Settings gear             │
├──────────────────────────────────────────┤
│                                          │
│  TAB CONTENT (scrollable area)           │
│                                          │
│  Changes based on selected tab           │
│                                          │
├──────────────────────────────────────────┤
│  TIP CAROUSEL (fixed, always visible)    │
│  ← Tip text →                           │
└──────────────────────────────────────────┘
```

---

## HEADER

### Layout
```
[⚡ VIBE CHECK]   [Enhance] [Templates] [History]   [⚙]
  logo/title        tab buttons                        settings
```

### Details
- Height: 48px
- Background: var(--bg-primary) with bottom border (1px solid var(--border))
- Logo: "VIBE CHECK" in 15px bold, with ⚡ symbol in cyan
- Tab buttons: 13px, padding 6px 12px, rounded 6px
  - Active tab: bg var(--accent-primary) at 15% opacity, text cyan
  - Inactive: text var(--text-secondary), hover shows bg-hover
- Settings gear: 18px, text-muted, hover turns text-primary
- Use SVG icons for the gear, not emoji

---

## TAB 1: ENHANCE (Default Tab)

### Layout Top to Bottom:

**1. Stack Detection Badge** (if a stack is detected)
```
┌─────────────────────────────────────┐
│ 🌐 Currently on: v0 by Vercel      │
└─────────────────────────────────────┘
```
- Small pill-shaped badge, 13px
- Background: var(--bg-tertiary)
- Text: var(--text-secondary)
- "Currently on:" in secondary, stack name in primary
- Only shows when a stack is detected
- Clicking it expands/collapses the tips for that stack

**2. Stack Tips** (expandable, collapsed by default)
```
┌─────────────────────────────────────┐
│ Tips for v0:                        │
│ • Mention shadcn/ui component names │
│ • Specify "responsive" explicitly   │
│ • Use "modern" for better styling   │
│ • Describe layout with sections     │
└─────────────────────────────────────┘
```
- Background: var(--bg-secondary)
- 12px text, bullet points
- Each tip has a small cyan dot before it
- Max height: 120px with scroll if more tips

**3. Prompt Textarea**
```
┌─────────────────────────────────────┐
│ Type or paste your prompt here...   │
│                                     │
│                                     │
│                                     │
│ 142 words · 847 characters          │
└─────────────────────────────────────┘
```
- Height: 140px, resizable vertically
- Background: var(--bg-tertiary)
- Border: 1px solid var(--border), focus: 1px solid var(--accent-primary)
- Font: system-ui, 13px, line-height 1.5
- Placeholder: "Type or paste your prompt here..." in var(--text-muted)
- Word/char count below, right-aligned, 11px, text-muted
- No scrollbar until content exceeds height, then thin custom scrollbar

**4. Action Row**
```
[⚡ Enhance Prompt]  [AI/Local toggle]  [Undo]
```
- Enhance button:
  - Full width minus toggle width
  - Background: var(--accent-primary)
  - Text: #000000 (black on cyan)
  - Font: 14px semibold
  - Height: 40px, border-radius 8px
  - Hover: brightness 1.1, box-shadow glow
  - Active: scale(0.98)
  - Disabled (empty textarea): opacity 0.4, cursor not-allowed

- AI/Local toggle:
  - Small pill toggle, 60px wide
  - Two states: "Local" (default) and "AI"
  - Local: bg var(--bg-tertiary), text secondary
  - AI: bg accent-secondary (violet), text white
  - Only clickable if API key is configured in settings
  - If no API key and user clicks, show tooltip: "Add API key in Settings"

- Undo button:
  - Only visible after an enhancement has been done
  - Small icon button, 32x32, text-muted
  - Hover: text-primary

**5. Score Display** (appears after enhancement)
```
┌─────────────────────────────────────┐
│           72 / 100                  │
│            Good                     │
│                                     │
│ Clarity      ████████░░  16/20     │
│ Specificity  ██████░░░░  12/20     │
│ Completeness ████████░░  16/20     │
│ Structure    ██████████  20/20     │
│ Effectiveness████████░░  16/20     │
│                                     │
│ + Add specific constraints (+5)     │
│ + Mention component library (+5)    │
└─────────────────────────────────────┘
```
- Score number: 48px font-size, bold
- Label below: 16px
- Color follows score color coding (see FEATURE_SPEC.md)
- Category bars:
  - Label: 12px, left-aligned, var(--text-secondary)
  - Bar: height 6px, border-radius 3px
  - Bar bg: var(--bg-tertiary)
  - Bar fill: color matches score range
  - Score numbers: 12px, right-aligned
- Feedback lines:
  - 12px, var(--accent-amber) text
  - Each starts with "+ " prefix
  - Max 4 feedback lines shown

**6. Enhanced Prompt Area** (appears after enhancement)
```
┌─────────────────────────────────────┐  [📋 Copy]
│ Build a responsive dashboard using  │
│ Next.js 14 with TypeScript and      │
│ shadcn/ui components.              │
│                                     │
│ **Tech Stack:** Next.js 14, TS...   │
│ **Requirements:**                   │
│ • 3 charts showing revenue data     │
│ • Responsive layout                │
│ **Style:** Dark theme, minimal...   │
└─────────────────────────────────────┘

Improvements made:
  ✓ Added tech stack specification
  ✓ Added structure with sections
  ✓ Added design requirements
```
- Background: var(--bg-tertiary)
- Border-left: 3px solid var(--accent-primary)
- Font: monospace, 13px
- Copy button: top-right corner, small, text-muted → text-primary on hover
  - After copy: shows checkmark for 1.5s, text turns cyan
- Improvements list below:
  - Each item has a cyan checkmark
  - 12px text, var(--text-secondary)
  - Slide in with 100ms delay between each item

**7. Token Efficiency** (appears after enhancement, collapsible)
```
┌─────────────────────────────────────┐
│ Token Efficiency  [62% efficient]   │
│ ┌──────┐                            │
│ │      │  33 words of filler        │
│ │ 62%  │  "please help me"          │
│ │      │  "I would like to"         │
│ └──────┘  [Strip Filler]            │
└─────────────────────────────────────┘
```
- Circular ring: 60px diameter, 4px stroke
- Color: green/amber/red based on efficiency
- Percentage inside the ring
- Filler items listed below as small chips
- "Strip Filler" button: secondary style (outline)

---

## TAB 2: TEMPLATES

### Layout
```
┌──────────────────────────────────────┐
│  [UI Components] [Full Apps] [Fixes] │  ← category tabs
├──────────────────────────────────────┤
│                                      │
│  ┌────────────┐  ┌────────────┐     │
│  │ Dashboard  │  │ Form       │     │
│  │ Build a... │  │ Create a.. │     │
│  └────────────┘  └────────────┘     │
│                                      │
│  ┌────────────┐  ┌────────────┐     │
│  │ Landing    │  │ Nav Bar    │     │
│  │ Design a.. │  │ Build a... │     │
│  └────────────┘  └────────────┘     │
│                                      │
└──────────────────────────────────────┘
```

- Category tabs: horizontal scrollable pills
- Template cards: 2 columns, equal width
- Card: bg-secondary, 8px radius, 12px padding
  - Name: 14px semibold
  - Preview: 12px text-muted, max 2 lines with ellipsis
  - Hover: border turns cyan, slight glow
- Clicking a card:
  - Fills the textarea in the Enhance tab
  - Switches to Enhance tab automatically
  - Blank fields [like this] get highlighted with a yellow/amber background
  - Cursor positions at the first blank field

---

## TAB 3: HISTORY

### Layout
```
┌──────────────────────────────────────┐
│  [🔍 Search prompts...]             │
├──────────────────────────────────────┤
│                                      │
│  [72] Build a responsive dash... ★   │  2h ago · v0
│  [45] make a website                │  yesterday
│  [91] Fix the login form validation │  3 days ago ★
│                                      │
│  ─── End of history ───              │
│  [Clear All History]                 │
└──────────────────────────────────────┘
```

- Search bar: bg-tertiary, 13px, magnifying glass icon
- Each history item:
  - Score badge: small colored circle (24x24) with number
  - Prompt preview: first 80 chars, 13px
  - Star: clickable, fills with amber when favorited
  - Meta: timestamp + stack badge, 11px text-muted
  - Hover: bg-hover
  - Click: expands to show full before/after (same as Before/After view)
- Empty state:
  ```
  No prompts yet.
  Enhance your first prompt to start building history.
  ```
  Centered, text-muted, 14px
- Clear All: small red text button at bottom, requires confirmation

---

## BEFORE/AFTER VIEW (appears after enhancement, below the enhanced area)

```
┌──── Before ────┐  ┌──── After ─────┐
│ make me a      │  │ Build a modern │
│ website that   │  │ responsive     │
│ looks cool     │  │ portfolio      │
│                │  │ website using  │
│                │  │ Next.js 14...  │
│           [📋] │  │           [📋] │
└────────────────┘  └────────────────┘

Changes:
  → Restructured with clear sections
  → Added tech stack (Next.js 14)
  → Added specific requirements
  → Removed filler words
```

- Two columns, equal width, gap 8px
- Each column: bg-tertiary, monospace 12px, max-height 200px with scroll
- Diff highlights:
  - Added text: background rgba(0, 229, 255, 0.15)
  - Removed text: text-decoration line-through, background rgba(255, 23, 68, 0.15)
- Copy button per column
- Changes list below: arrow prefix, 12px text-secondary

---

## SETTINGS PANEL (modal or second view)

### Layout
```
┌──────────────────────────────────────┐
│  Settings                     [✕]    │
├──────────────────────────────────────┤
│                                      │
│  AI Enhancement                      │
│  ┌──────────────────────────────┐   │
│  │ Enable AI Enhancement    [○] │   │
│  │ API Endpoint: [__________]   │   │
│  │ API Key:      [__________]   │   │
│  │ Model:        [gpt-4o-mini▾]│   │
│  └──────────────────────────────┘   │
│                                      │
│  Behavior                            │
│  ┌──────────────────────────────┐   │
│  │ Auto-detect stack        [●] │   │
│  │ Show token efficiency    [●] │   │
│  │ Show before/after        [●] │   │
│  └──────────────────────────────┘   │
│                                      │
│  Data                                │
│  ┌──────────────────────────────┐   │
│  │ [Export All Data]            │   │
│  │ [Import Data]                │   │
│  │ [Clear All Data]             │   │
│  └──────────────────────────────┘   │
│                                      │
│  [Reset to Defaults]                 │
└──────────────────────────────────────┘
```

- Opens as an overlay/modal on top of the main content
- Semi-transparent backdrop (rgba(0,0,0,0.7))
- Sections with section headers (13px bold, accent-primary)
- Toggles: custom CSS toggle switches (not browser defaults)
  - On: accent-primary
  - Off: var(--bg-tertiary)
- Text inputs: bg-tertiary, border, 13px
- API key field: type="password" with an eye icon to toggle visibility
- Buttons: outlined style (border + text, no fill bg)

---

## TIP CAROUSEL (bottom of popup, always visible)

```
┌──────────────────────────────────────┐
│  ←  Tip: Specify your framework     │
│      and version for better results  →│
└──────────────────────────────────────┘
```
- Height: 40px
- Background: var(--bg-secondary)
- Text: 12px, var(--text-secondary)
- Arrow buttons: small, text-muted, hover text-primary
- Auto-rotates every 10 seconds
- Transition: 300ms fade
- At least 10 tips in rotation

---

## ANIMATIONS (ALL must be CSS-only, no JS animation libraries)

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Tab switch | Fade + slight slide up | 200ms | ease-out |
| Score appearance | Count up from 0 | 500ms | ease-out |
| Score bars | Fill from left | 300ms | ease-out |
| Score bars stagger | Each bar delays 100ms | — | — |
| Enhanced area | Slide down + fade in | 200ms | ease-out |
| Improvements list | Each item slides in with 100ms delay | 150ms | ease-out |
| Copy confirmation | Checkmark scale in | 150ms | ease-out |
| Button hover | Glow + brightness | 200ms | ease |
| Card hover | Border color change | 200ms | ease |
| Settings modal | Scale from 0.95 + fade | 200ms | ease-out |
| Toast notifications | Slide down from top | 300ms | ease-out |
| Enhance button pulse | Scale 1 → 1.02 → 1 | 150ms | ease |

---

## TOAST NOTIFICATIONS

Small notifications that appear at the top of the popup:
- "Copied to clipboard" — cyan
- "Prompt enhanced" — cyan
- "History cleared" — amber
- "Error: API key invalid" — crimson
- Position: top of popup, centered
- Auto-dismiss: 3 seconds
- Slide down animation, fade out

---

## EMPTY STATES

Every section that can be empty needs a friendly empty state:

**No history:**
```
No prompts yet.
Enhance your first prompt to build your history.
```

**No stack detected:**
```
Navigate to a coding platform (v0, Bolt, Cursor...)
to get stack-specific tips.
```

**No AI key configured (when trying to use AI mode):**
```
Add an API key in Settings to enable AI enhancement.
Works with OpenAI, Anthropic, and compatible APIs.
```

Each empty state:
- Centered text
- 14px, var(--text-muted)
- Subtle icon above (optional, simple SVG)
- No buttons or CTAs unless it makes sense

---

## RESPONSIVE BEHAVIOR

The popup is fixed at 420px wide — it does NOT resize.
But it does handle:
- Long text in any element: text-overflow: ellipsis with tooltip on hover
- Many history items: scroll within the history area
- Long enhanced prompts: scroll within the enhanced area
- Overflowing content: the main tab content area scrolls, header and tip bar stay fixed

---

## CUSTOM SCROLLBAR STYLING

```css
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
```

---

## FOCUS STATES

All interactive elements must have visible focus states:
- Textareas/inputs: border color changes to accent-primary
- Buttons: outline 2px solid accent-primary with 2px offset
- Toggles: same outline
- Tab buttons: same outline

This is for accessibility. Do not use `outline: none` without replacement.

---

## TOOLTIP STYLE

For truncated text and info icons:
- Background: var(--bg-tertiary)
- Border: 1px solid var(--border)
- Text: 12px, var(--text-primary)
- Padding: 4px 8px
- Border-radius: 4px
- Appears on hover with 300ms delay
- Positioned above the element

---

## Z-INDEX LAYERING

```
Base content:     z-index: 1
Dropdowns:        z-index: 10
Tooltips:         z-index: 20
Toast messages:   z-index: 30
Settings modal:   z-index: 40
Modal backdrop:   z-index: 39
```
