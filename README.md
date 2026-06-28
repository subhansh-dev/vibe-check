# vibe-check

**AI Prompt Engineering Web App — for people who actually build things with AI.**

Stop writing garbage prompts and getting garbage results. vibe-check takes whatever half-baked idea you type into a textarea and turns it into something an AI coding tool can actually work with.

---

## What this is

A web app that lives at [vibe-check-vert-theta.vercel.app](https://vibe-check-vert-theta.vercel.app). Paste a prompt — "make a dashboard" or "fix the login bug" — and vibe-check:

1. **Enhances it** — rewrites vague nonsense into structured, specific instructions
2. **Scores it** — tells you exactly why your prompt sucks and how to fix it (/100)
3. **Checks your token efficiency** — because 40% of your tokens are probably filler words
4. **Gives you stack-specific tips** — works with v0, Bolt, Cursor, ChatGPT, Claude, and more

Built for the **Stardance QOL Mission**.

---

## Features

**Prompt Enhance** — turns vague prompts into structured ones with tech stack context, requirements, and specific constraints. Works locally with rule-based logic. Optional AI-powered enhancement if you bring your own API key.

**Prompt Scoring** — 5-category scoring engine (Clarity, Specificity, Completeness, Structure, Effectiveness). Each category gives exact points and actionable feedback. No "your prompt could be better" fluff.

**Token Efficiency** — detects filler phrases, hedging language, politeness overhead, redundant words. Shows your efficiency percentage and lets you strip filler in one click.

**Stack-Aware Tips** — knows v0, Bolt, Lovable, Cursor, Replit, Claude, ChatGPT, Windsurf, Gemini, Copilot, CodeSandbox, StackBlitz, Phind. Shows platform-specific prompt tips.

**Before/After** — side-by-side diff view showing exactly what changed.

**Templates** — 15+ pre-built prompt templates across UI components, full apps, bug fixes, API endpoints, schemas.

**History** — saves every enhanced prompt with score, timestamp, and stack. Search, favorite, export, import.

**Engineer Tab** — quality checklist, technique combos, variant generation (3 versions per prompt), version history, and Credit Saver (English → Chinese transform for ~60% token savings on any provider).

**Settings** — configure AI endpoint, toggle features, export/import data. No signup, no account, no tracking.

---

## Works With

v0 · Bolt · Lovable · Cursor · Replit · Claude · ChatGPT · Gemini · Perplexity · DeepSeek · Windsurf · GitHub Copilot · CodeSandbox · StackBlitz · Phind

---

## Tech Stack

- **Vanilla JS / HTML / CSS** — zero frameworks, zero dependencies, zero build step
- **Vercel** — serverless API deployment
- **CSS Custom Properties** — dark glass theme with pure black backgrounds and gold accents

---

## Stardance QOL Mission

Three pillars:
1. **One-Click Enhance** — stop rewriting prompts by hand
2. **Stack-Aware Context** — tips tuned to whatever coding AI you're using
3. **Prompt Scoring** — instant, specific feedback with point values

Bonus features: token efficiency, diff view, templates, history, keyboard shortcuts, Credit Saver.

---

## Quick Start

Open [vibe-check-vert-theta.vercel.app](https://vibe-check-vert-theta.vercel.app). Type a prompt. Hit Enhance.

---

## License

MIT

---

*Built by a 17-year-old who got tired of rewriting prompts.*
