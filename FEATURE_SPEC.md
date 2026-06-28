# FEATURE SPECIFICATION — VIBE CHECK
## Every feature, in excruciating detail

---

## FEATURE 1: ONE-CLICK PROMPT ENHANCE

### What it does
Takes the user's raw prompt and produces an enhanced version with better structure,
specificity, and context. Works OFFLINE using rule-based transformations.

### Input
- Text from the prompt textarea in the popup (max 5000 characters)

### Processing Logic (enhancer.js — `enhancePrompt(text, detectedStack)`)

The enhancer applies these transformations IN ORDER:

**Step 1 — Detect prompt type:**
Analyze the input to classify what the user is asking for:
- "build" keywords (create, build, make, generate, design) → BUILD type
- "fix" keywords (fix, debug, error, broken, not working) → FIX type
- "add" keywords (add, implement, include, integrate) → FEATURE type
- "explain" keywords (explain, how, why, what does) → EXPLAIN type
- Default if no match → BUILD type

**Step 2 — Check for missing elements:**
Score whether the prompt includes each of these (boolean yes/no):
- Has a clear subject (what they want built) — check if it mentions a specific thing
- Has a tech stack mentioned (React, Next.js, Vue, Python, etc.)
- Has UI/style description (dark theme, minimal, responsive, etc.)
- Has specific features listed (not just "a website" but "a dashboard with 3 charts")
- Has constraints (size, performance, accessibility, etc.)
- Has output format (component, page, full app, API endpoint, etc.)
- Is longer than 20 words (vague prompts are usually short)
- Has code context (mentions existing code, file names, frameworks they're using)

**Step 3 — Generate enhancements:**
For each missing element, add a suggestion line. Format the enhanced prompt as:

```
[Original prompt, cleaned up]

**Tech Stack:** [detected or suggested]
**Requirements:**
- [Requirement 1 from the prompt]
- [Requirement 2 inferred]
- [More as needed]

**Style/Design:**
- [Style preferences detected or default suggestions]

**Constraints:**
- [Any constraints mentioned or common defaults]
```

**Step 4 — Stack-specific tips:**
If a stack is detected (either from the prompt text or from stack-detector.js),
append a tip section. Example:
- If v0 detected: "Tip: Mention shadcn/ui component names explicitly. Use 'modern' and 'minimal' for better results."
- If Bolt detected: "Tip: Describe the full file structure you want. Specify 'responsive' for mobile support."
- If Cursor detected: "Tip: Reference specific file names. Use @codebase for context-aware generation."

**Step 5 — Return object:**
```javascript
{
  original: "the user's raw text",
  enhanced: "the improved text",
  score: 45,  // from scorer.js
  improvements: ["Added tech stack", "Added structure", "Added constraints"],
  detectedType: "build",
  detectedStack: "v0"
}
```

### The enhance button
- Cyan (#00E5FF) button, full width, says "⚡ Enhance Prompt"
- While processing (even if instant), show a brief pulse animation (150ms)
- After enhancement, the result area slides in from below (200ms ease-out)
- The enhanced text is in a code-block styled area (monospace font, bg-tertiary bg)
- A "Copy" button appears in the top-right of the enhanced area

### AI-Powered Enhancement (Optional — requires API key)
If the user has configured an API key in Settings, there's a toggle next to the
enhance button: "AI" / "Local"

When "AI" is selected, the prompt is sent to the configured API:
- Support OpenAI-compatible APIs (works with OpenAI, Anthropic via proxy, local LLMs)
- Endpoint and key configurable in Settings
- System prompt for AI enhancement:
  ```
  You are a prompt engineering assistant for AI coding tools.
  Take this prompt and make it more specific, structured, and effective.
  Add missing context: tech stack, design requirements, constraints, and expected output format.
  Keep the original intent. Do not change what they want to build.
  Return ONLY the enhanced prompt, no explanation.
  ```
- Show a loading spinner while waiting
- Gracefully fall back to local enhancement on error with a message: "AI unavailable — using local enhancement"

---

## FEATURE 2: STACK-AWARE SITE DETECTION

### What it does
Detects which AI coding platform the user is currently on by reading the tab URL.

### Detection Logic (stack-detector.js — `detectStack(url)`)

```javascript
const STACK_MAP = {
  'v0.dev': { name: 'v0 by Vercel', category: 'ui-builder', tips: [...] },
  'bolt.new': { name: 'Bolt', category: 'fullstack-builder', tips: [...] },
  'lovable.dev': { name: 'Lovable', category: 'fullstack-builder', tips: [...] },
  'cursor.sh': { name: 'Cursor', category: 'ide', tips: [...] },
  'replit.com': { name: 'Replit', category: 'ide', tips: [...] },
  'claude.ai': { name: 'Claude', category: 'chat', tips: [...] },
  'chat.openai.com': { name: 'ChatGPT', category: 'chat', tips: [...] },
  'chatgpt.com': { name: 'ChatGPT', category: 'chat', tips: [...] },
  'codeium.com': { name: 'Windsurf', category: 'ide', tips: [...] },
  'aistudio.google.com': { name: 'AI Studio', category: 'chat', tips: [...] },
  'github.com/copilot': { name: 'Copilot', category: 'ide', tips: [...] },
  'codesandbox.io': { name: 'CodeSandbox', category: 'ide', tips: [...] },
  'stackblitz.com': { name: 'StackBlitz', category: 'ide', tips: [...] },
};
```

For each platform, store 3-5 specific tips in the tips array. These tips are:
- What the platform is good at
- What to include in prompts for that platform
- Common mistakes people make on that platform
- Optimal prompt length/structure for that platform

### How it's used
1. content.js runs on all tabs and sends the current URL to the service worker
2. When popup opens, it queries the service worker for the current tab URL
3. stack-detector.js parses the URL and returns the detected stack
4. The UI shows a small badge at the top: "Currently on: v0 by Vercel"
5. The tips are shown in a collapsible section below the enhance button
6. The enhancer uses the stack info to tailor suggestions

### Content Script (content.js)
Minimal — does NOT modify any page. Only exists to send URL info.
```javascript
// content.js — runs on every page, sends URL to service worker
// Only sends the hostname, never the full URL (privacy)
// Does NOT inject any DOM elements
// Does NOT modify the page in any way
```

### Service Worker (service-worker.js)
- Listens for messages from content script and popup
- Stores the current tab's detected stack
- When popup asks for stack info, returns it
- Also handles the AI API calls (from popup request) since content scripts can't do CORS

---

## FEATURE 3: PROMPT SCORING ENGINE

### What it does
Analyzes a prompt and gives it a score from 0-100 with specific feedback on what's
missing or could be improved.

### Scoring Logic (scorer.js — `scorePrompt(text, detectedStack)`)

**Categories (each scored 0-20, total = sum):**

1. **Clarity (0-20):**
   - 20: Single clear objective, unambiguous
   - 15: Clear but could be more specific
   - 10: Somewhat vague, multiple possible interpretations
   - 5: Very vague, hard to understand intent
   - 0: No clear request

   Scoring logic:
   - Has a clear verb (build, create, fix, add, etc.) → +8
   - Mentions a specific thing (dashboard, form, API, etc.) → +7
   - Is at least 15 words → +5
   - Penalty: if it's just "make a website" → cap at 5

2. **Specificity (0-20):**
   - 20: Tech stack, framework, library all specified
   - 15: Tech stack mentioned but missing details
   - 10: General category (web app) but no stack
   - 5: No technology mentioned at all
   - 0: Completely generic

   Scoring logic:
   - Mentions a specific framework (React, Vue, Next.js, etc.) → +8
   - Mentions specific libraries (Tailwind, shadcn, etc.) → +5
   - Mentions language (TypeScript, Python, etc.) → +4
   - Mentions version or specific config → +3

3. **Completeness (0-20):**
   - 20: Has requirements, constraints, style, and output format
   - 15: Has 3 of 4
   - 10: Has 2 of 4
   - 5: Has 1 of 4
   - 0: Has none

   Scoring logic:
   Check for presence of:
   - Requirements/features (keywords: need, should, must, include, with) → +5
   - Style/design (keywords: dark, light, minimal, modern, responsive) → +5
   - Constraints (keywords: mobile, fast, accessible, small, large) → +5
   - Output format (keywords: component, page, function, API, full app) → +5

4. **Structure (0-20):**
   - 20: Organized with sections, lists, or clear paragraphs
   - 15: Some organization, mostly clear
   - 10: Wall of text but understandable
   - 5: Disorganized, hard to parse
   - 0: Gibberish or empty

   Scoring logic:
   - Has bullet points or numbered lists → +7
   - Has line breaks separating concerns → +5
   - Has headers or labels (##, **bold**) → +4
   - Is under 2000 chars (not bloated) → +4
   - Penalty: single block of text over 500 chars → -5

5. **Effectiveness (0-20):**
   - 20: Prompt is optimized for the detected platform
   - 15: Good general prompt, would work on most platforms
   - 10: Would get okay results but not optimal
   - 5: Would likely get generic/bad results
   - 0: Would confuse the AI

   Scoring logic:
   - If stack detected and prompt uses stack-specific terms → +10
   - Mentions "responsive", "accessible", or "performant" → +5
   - Has specific color/design mentions → +3
   - Mentions existing code or context → +2

### Score Display
- Large number in the center: the score (font-size: 48px, font-weight: 700)
- Color coded:
  - 80-100: Cyan (#00E5FF) — "Excellent"
  - 60-79: Violet (#B388FF) — "Good"
  - 40-59: Amber (#FFD740) — "Okay"
  - 20-39: Orange (#FF9100) — "Needs Work"
  - 0-19: Crimson (#FF1744) — "Rewrite This"
- Below the score: category breakdown as horizontal bars
- Each category bar is colored based on its individual score
- Below bars: specific feedback lines like:
  - "+ Add your tech stack for +8 points"
  - "+ Add style/design preferences for +5 points"
  - "+ Structure your prompt with bullet points for +7 points"

### Score Animation
When score appears, the number counts up from 0 to the actual value over 500ms.
The bars fill in with a 300ms delay between each category.

---

## FEATURE 4: PROMPT TEMPLATES

### What it does
Pre-built prompt templates for common vibe coding tasks. User picks one, fills in
blanks, and gets a well-structured prompt instantly.

### Template Data (templates.js)

At minimum 15 templates across these categories:

**UI Components (5 templates):**
1. Dashboard — "Build a [type] dashboard with [number] [chart types] showing [data]. Use [framework] with [styling]. Include [features]."
2. Form — "Create a [type] form with [fields]. Include [validation type] validation. Style it [style]. On submit, [action]."
3. Landing Page — "Design a landing page for [product/service]. Sections: [hero, features, pricing, testimonials, CTA]. Style: [style]. Color scheme: [colors]."
4. Navigation — "Build a [type] navigation bar with [items]. Include [features like search, auth, notifications]. Responsive: [yes/no]."
5. Card Grid — "Create a [responsive] grid of [card type] cards. Each card shows [fields]. Include [filtering/sorting/pagination]."

**Full Apps (5 templates):**
6. Todo App — "Build a todo app with [features]. Tech: [stack]. Include [auth, categories, due dates, etc.]. Style: [style]."
7. Chat App — "Create a [real-time] chat application with [features]. Tech: [stack]. Include [message types, rooms, search]."
8. E-commerce — "Build an e-commerce [storefront/admin] with [features]. Tech: [stack]. Include [cart, checkout, product pages]."
9. Blog/CMS — "Create a [blog/portfolio/CMS] with [features]. Tech: [stack]. Include [categories, search, pagination, markdown support]."
10. Auth System — "Implement [auth type] authentication. Tech: [stack]. Include [login, signup, forgot password, social login, etc.]."

**Bug Fixes & Features (5 templates):**
11. Fix Bug — "I have a [framework] [component/page] that [expected behavior] but instead [actual behavior]. Here's the relevant code: [paste code]. Fix the issue while maintaining [constraints]."
12. Add Feature — "Add [feature] to my existing [type] app. Tech stack: [stack]. The feature should [description]. Integrate with [existing systems]."
13. Refactor — "Refactor this [code type] to improve [performance/readability/maintainability]. Keep the same behavior. Current code: [paste code]."
14. API Endpoint — "Create a [method] API endpoint at [path] that [description]. Accept [params]. Return [response format]. Include [validation, error handling, auth]."
15. Database Schema — "Design a database schema for [use case]. Tables: [list]. Include [relationships, indexes, constraints]. Database: [PostgreSQL/MySQL/MongoDB]."

### Template UI
- Dropdown or tab bar to select category
- Cards for each template showing name and preview
- Clicking a template fills the textarea with the template
- Blank fields are highlighted with [brackets] and a subtle background color
- User can tab between bracket fields to fill them in quickly
- "Use Template" button applies it to the main textarea

---

## FEATURE 5: TOKEN EFFICIENCY METER

### What it does
Analyzes how much of the user's prompt is useful signal vs filler/waste.

### Logic (in scorer.js — `analyzeTokenEfficiency(text)`)

**Categories of "waste" to detect:**
1. **Filler phrases** — "please help me", "I want you to", "can you", "I need",
   "I would like", "it would be great if", "if possible"
2. **Politeness overhead** — "thank you", "thanks in advance", "I really appreciate",
   "you're the best"
3. **Hedging language** — "maybe", "perhaps", "kind of", "sort of", "I think",
   "if that makes sense"
4. **Redundant words** — "really really", "very very", "a lot of lots of"
5. **Empty filler** — "basically", "actually", "just", "so basically", "honestly"
6. **Self-deprecation** — "I'm not sure if this makes sense", "sorry if this is confusing",
   "I'm bad at explaining"

**Output:**
```javascript
{
  totalWords: 87,
  usefulWords: 54,
  fillerWords: 33,
  efficiency: 62,  // percentage of useful words
  fillerBreakdown: [
    { phrase: "please help me", category: "filler" },
    { phrase: "I would like", category: "filler" },
    { phrase: "kind of", category: "hedging" }
  ],
  strippedPrompt: "The prompt with all filler removed"
}
```

### Display
- Circular progress ring (CSS only, no library) showing efficiency percentage
- Color: green (>70%), amber (40-70%), red (<40%)
- Below the ring: "33 words of filler detected"
- Expandable list showing each filler phrase highlighted in the original text
- "Strip Filler" button removes all filler and shows the cleaned version

---

## FEATURE 6: BEFORE/AFTER SPLIT VIEW

### What it does
Shows the original prompt side-by-side with the enhanced version for comparison.

### UI
- Two columns: "Before" (left) and "After" (right)
- Both use the same monospace font and styling
- Differences are highlighted:
  - Added text: subtle cyan background
  - Removed text: strikethrough with crimson background
  - Unchanged text: normal
- Each column has a "Copy" button in its header
- Below both columns: a list of what was improved in plain English
  - "Added: Tech stack specification"
  - "Added: Design requirements section"
  - "Added: 3 specific constraints"
  - "Removed: Filler phrases (12 words)"

### Implementation
- Use a simple diff algorithm (not a library — implement basic LCS or line-diff)
- Show line-by-line comparison, not character-by-character
- If the enhanced version is much longer, the "After" column gets a scroll

---

## FEATURE 7: PROMPT HISTORY

### What it does
Saves every prompt the user enhances so they can revisit and learn from past prompts.

### Storage (history.js)
```javascript
{
  id: "hist_1718567890_abc123",  // timestamp + random
  timestamp: 1718567890000,       // Date.now()
  original: "the raw prompt",
  enhanced: "the enhanced version",
  score: 45,
  stack: "v0",
  type: "build",
  favorite: false
}
```

### Storage Details
- Use chrome.storage.local (NOT chrome.storage.sync — sync has a 100KB limit)
- Max 100 entries. When limit reached, delete oldest non-favorite entry.
- Each entry is roughly 1-5KB, so 100 entries = 100-500KB (well within 5MB limit)

### History UI
- List of entries sorted by timestamp (newest first)
- Each entry shows:
  - Score badge (colored circle with number)
  - First 80 characters of the original prompt
  - Stack badge if detected
  - Timestamp as relative ("2 hours ago", "yesterday")
  - Star button to favorite/unfavorite
- Clicking an entry expands it to show full before/after
- Search bar at the top to filter by text content
- "Clear All" button with confirmation dialog
- Favorites are never auto-deleted

---

## FEATURE 8: SETTINGS PANEL

### What it does
Lets users configure the extension behavior.

### Settings (settings.js)
```javascript
{
  // AI Enhancement
  aiEnabled: false,
  apiEndpoint: "https://api.openai.com/v1/chat/completions",
  apiKey: "",
  model: "gpt-4o-mini",
  
  // Behavior
  defaultMode: "local",  // "local" or "ai"
  autoDetectStack: true,
  showTokenEfficiency: true,
  showBeforeAfter: true,
  
  // Appearance
  compactMode: false,
  
  // Data
  maxHistoryEntries: 100,
  exportFormat: "json"  // "json" or "markdown"
}
```

### Settings UI
- Toggles for boolean settings
- Text inputs for API endpoint and key (key field is type="password" with show/hide)
- Dropdown for model selection
- Buttons: "Export Data", "Import Data", "Clear All Data"
- "Reset to Defaults" button
- API key is stored locally only, never sent anywhere except the configured endpoint

### Export/Import
- Export: downloads a JSON file with all history + settings
- Import: file picker for JSON, validates structure before importing
- Clear confirmation: "This will delete all history and reset settings. This cannot be undone."

---

## FEATURE 9: KEYBOARD SHORTCUTS

### Shortcuts
| Action | Shortcut |
|--------|----------|
| Enhance prompt | Ctrl+Enter (when textarea focused) |
| Copy enhanced prompt | Ctrl+Shift+C |
| Switch to next tab | Ctrl+Tab or Ctrl+Right |
| Switch to previous tab | Ctrl+Shift+Tab or Ctrl+Left |
| Focus textarea | / (when not in input field) |
| Toggle AI/Local mode | Ctrl+M |

### Implementation
- Listen for keydown events on the popup document
- Show a small "?" icon that reveals the shortcut list on hover
- Shortcuts only work when the popup is focused (not interfering with the page)

---

## FEATURE 10: ADDITIONAL QoL FEATURES

### 10a. Live Character/Word Count
- Below the textarea: "142 words · 847 characters"
- Updates in real-time as user types
- Color changes if approaching limits (yellow at 4000 chars, red at 4800)

### 10b. Smart Paste Detection
- When user pastes text, detect if it looks like a prompt (vs random text)
- If it looks like a prompt, auto-suggest: "Looks like a prompt. Enhance it?"
- Detection: has verbs like build/create/make, or is >30 words, or mentions code terms

### 10c. Prompt Tips Carousel
- At the bottom of the main tab, rotate through quick tips:
  - "Tip: Specify your framework and version for better results"
  - "Tip: Include responsive design requirements in every UI prompt"
  - "Tip: Use bullet points to list features — AIs parse lists better"
  - "Tip: Mention the exact component library you want (shadcn, MUI, etc.)"
  - "Tip: Describe your color scheme — 'dark theme' isn't specific enough"
- Auto-rotates every 10 seconds
- Can click arrows to navigate manually

### 10d. Quick Copy Buttons
- Every piece of generated text has a copy button
- Copy button shows a checkmark animation for 1.5 seconds after copying
- Copies plain text, no formatting

### 10e. Prompt Complexity Indicator
- Simple badge showing prompt complexity: "Simple" / "Moderate" / "Detailed"
- Based on word count + technical terms + structure
- Helps users understand if they're over or under-explaining

### 10f. Undo/Redo for Enhancement
- After enhancing, user can click "Undo" to go back to their original text
- Redo brings the enhancement back
- History of edits within the current session (not persisted)

### 10g. Dark/Light Theme Toggle
- Default: dark (as specified in design language)
- Light theme: invert the palette (white bg, dark text, same accent colors)
- Toggle in the header or settings
- Persist preference in chrome.storage.local

---

## CONTENT SCRIPT DETAILS (content.js)

### Purpose
ONLY to detect what site the user is on. Nothing else.

### Behavior
```javascript
// 1. Get the current hostname
// 2. Send it to the service worker via chrome.runtime.sendMessage
// 3. That's it. No DOM manipulation. No injection. No modification.
// 4. Send on page load AND on URL change (for SPAs)
//    Use a MutationObserver or setInterval to detect SPA navigation
```

### Privacy
- Only sends the hostname (e.g., "v0.dev"), NOT the full URL
- No query parameters, no path, no fragments
- No user data is collected or transmitted

---

## SERVICE WORKER DETAILS (service-worker.js)

### Responsibilities
1. Store the current tab's detected stack
2. Handle AI API calls (proxy for the popup to avoid CORS issues)
3. Handle messages from content script and popup

### Message Protocol
```javascript
// From content script → service worker:
{ type: "STACK_DETECTED", hostname: "v0.dev" }

// From popup → service worker:
{ type: "GET_STACK" }
// Response: { stack: { name: "v0 by Vercel", category: "ui-builder", tips: [...] } }

// From popup → service worker (AI enhancement):
{ type: "AI_ENHANCE", prompt: "...", endpoint: "...", apiKey: "...", model: "..." }
// Response: { enhanced: "..." } or { error: "..." }
```

### AI API Call Implementation
```javascript
async function callAI(prompt, endpoint, apiKey, model) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

---

## ERROR HANDLING REQUIREMENTS

Every function that interacts with chrome.storage must:
```javascript
try {
  const result = await chrome.storage.local.get(['key']);
  // use result
} catch (error) {
  console.error('Storage error:', error);
  // show user-friendly message, don't crash
}
```

Every DOM operation must:
```javascript
const element = document.getElementById('myElement');
if (!element) {
  console.warn('Element not found: myElement');
  return; // graceful exit, don't throw
}
```

The popup must handle:
- Empty state (no history yet) → show friendly empty state message
- Error state (storage failed) → show retry button
- Loading state (AI call in progress) → show spinner
- Success state → show result

---

## PERFORMANCE REQUIREMENTS

- Popup must open in < 100ms (no heavy initialization)
- Local enhancement must complete in < 50ms
- Scoring must complete in < 20ms
- History must load in < 200ms even with 100 entries
- AI enhancement timeout: 30 seconds max
- No memory leaks — clean up event listeners on popup close
