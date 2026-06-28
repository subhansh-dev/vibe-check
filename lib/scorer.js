/**
 * SCORER.JS — Prompt scoring engine
 * 
 * EXPORTED:
 *   scorePrompt(text, detectedStack) → object
 *   analyzeTokenEfficiency(text) → object
 */

const ACTION_VERBS = /\b(build|create|make|generate|design|develop|construct|write|code|fix|debug|add|implement|explain|refactor|setup|configure|deploy|migrate)\b/;
const SPECIFIC_SUBJECTS = /\b(dashboard|form|table|chart|graph|list|grid|card|modal|dialog|sidebar|header|footer|navbar|menu|carousel|accordion|tabs|pagination|search|filter|auth|login|signup|payment|checkout|cart|notification|toast|tooltip|dropdown|drawer|landing|page|website|app|api|endpoint|function|component|hook|util|service|platform|portal|editor|player|viewer|builder)\b/;

const FRAMEWORKS = /\b(React|Vue|Svelte|Next\.js|Nuxt|Angular|SvelteKit|Remix|Gatsby|Solid|Qwik)\b/i;
const LIBRARIES = /\b(Tailwind|shadcn|MUI|Chakra|Bootstrap|Prisma|Drizzle|Zustand|Redux|Jotai|React Query|SWR|Framer Motion|GSAP|Three\.js|D3)\b/i;
const LANGUAGES = /\b(TypeScript|JavaScript|Python|Rust|Go|Ruby|Java|Kotlin|Swift|C\+\+|C#)\b/i;
const VERSIONS = /\b(v?\d+\.\d+|App Router|Pages Router|Composition API|Options API)\b/i;

const REQ_WORDS = /\b(need|should|must|include|with|want|require|support|allow|enable|has|have)\b/i;
const STYLE_WORDS = /\b(dark|light|minimal|modern|clean|responsive|sleek|elegant|futuristic|neon|glassmorphism|neumorphism|bento|brutalist|retro|gradient|flat|material|rounded|sharp|colorful|monochrome)\b/i;
const CONSTRAINT_WORDS = /\b(mobile|fast|accessible|performant|secure|scalable|offline|pwa|seo|lightweight|production|cross-platform|realtime)\b/i;
const OUTPUT_WORDS = /\b(component|page|screen|view|function|api|endpoint|route|hook|util|library|package|app|application|module|plugin|middleware|service)\b/i;

const BULLET_REGEX = /[•\-*]\s|\d+\.\s/;
const HEADER_REGEX = /\*{2}.+\*{2}|##|##/;
const LINEBREAK_REGEX = /\n\s*\n/;

const FILLER_PHRASES = [
  { pattern: /please help me/gi, category: 'filler' },
  { pattern: /I want you to/gi, category: 'filler' },
  { pattern: /can you/gi, category: 'filler' },
  { pattern: /I would like/gi, category: 'filler' },
  { pattern: /it would be great if/gi, category: 'filler' },
  { pattern: /if possible/gi, category: 'filler' },
  { pattern: /thank you|thanks (in advance|so much)/gi, category: 'politeness' },
  { pattern: /I (really )?appreciate/gi, category: 'politeness' },
  { pattern: /maybe|perhaps/gi, category: 'hedging' },
  { pattern: /kind of|sort of/gi, category: 'hedging' },
  { pattern: /I think/gi, category: 'hedging' },
  { pattern: /really really|very very/gi, category: 'redundant' },
  { pattern: /basically|actually|honestly/gi, category: 'empty' },
  { pattern: /just/gi, category: 'empty' },
  { pattern: /I('m not sure| don't know) if/gi, category: 'self-deprecation' },
  { pattern: /sorry if (this is |that sounds )?(confusing|dumb|stupid)/gi, category: 'self-deprecation' }
];

const EFFECTIVENESS_TERMS = /\b(responsive|accessible|performant|modern|minimal|clean|dark mode|light mode)\b/i;
const COLOR_TERMS = /\b(color|colour|#([0-9a-f]{3}){1,2}\b|rgb|hsl|palette|scheme|hex)/i;
const CONTEXT_TERMS = /\b(code|file|component|function|class|import|export|project|repo|repository|existing|current|my)\b/i;

/**
 * Gets score label and color based on numeric score.
 * @param {number} score - 0-100
 * @returns {{label: string, color: string}}
 */
function getScoreLabel(score) {
  if (score >= 80) return { label: 'Excellent', color: '#C4A265' };
  if (score >= 60) return { label: 'Good', color: '#8B7355' };
  if (score >= 40) return { label: 'Okay', color: '#C4A265' };
  if (score >= 20) return { label: 'Needs Work', color: '#9A7A50' };
  return { label: 'Rewrite This', color: '#B85450' };
}

/**
 * Scores the Clarity category (0-20).
 * @param {string} text
 * @returns {{score: number, feedback: string}}
 */
function scoreClarity(text) {
  let score = 0;
  const words = text.split(/\s+/).filter(Boolean);
  if (ACTION_VERBS.test(text)) score += 8;
  if (SPECIFIC_SUBJECTS.test(text)) score += 7;
  if (words.length >= 15) score += 5;
  const genericPattern = /^(make|build|create)\s+(a|an|the)\s+(website|app|site|page|thing|something|tool)\s*$/i;
  if (genericPattern.test(text.trim())) score = Math.min(score, 5);
  let feedback = '';
  if (score >= 16) feedback = 'Clear and specific request';
  else if (score >= 10) feedback = 'Good start, but could be more specific about what you want';
  else feedback = 'Too vague \u2014 what specifically do you want built?';
  return { score: Math.min(score, 20), feedback: feedback };
}

/**
 * Scores the Specificity category (0-20).
 * @param {string} text
 * @returns {{score: number, feedback: string}}
 */
function scoreSpecificity(text) {
  let score = 0;
  if (FRAMEWORKS.test(text)) score += 8;
  if (LIBRARIES.test(text)) score += 5;
  if (LANGUAGES.test(text)) score += 4;
  if (VERSIONS.test(text)) score += 3;
  let feedback = '';
  if (score >= 16) feedback = 'Excellent tech stack detail';
  else if (score >= 10) feedback = 'Framework mentioned but missing libraries';
  else feedback = 'No tech stack specified \u2014 add your framework and tools';
  return { score: Math.min(score, 20), feedback: feedback };
}

/**
 * Scores the Completeness category (0-20).
 * @param {string} text
 * @returns {{score: number, feedback: string}}
 */
function scoreCompleteness(text) {
  let score = 0;
  const missing = [];
  if (REQ_WORDS.test(text)) score += 5;
  else missing.push('requirements');
  if (STYLE_WORDS.test(text)) score += 5;
  else missing.push('style/design preferences');
  if (CONSTRAINT_WORDS.test(text)) score += 5;
  else missing.push('constraints');
  if (OUTPUT_WORDS.test(text)) score += 5;
  else missing.push('output format');
  let feedback = '';
  if (score >= 16) feedback = 'All key areas covered';
  else if (missing.length > 0) feedback = 'Missing: ' + missing.join(', ');
  return { score: Math.min(score, 20), feedback: feedback };
}

/**
 * Scores the Structure category (0-20).
 * @param {string} text
 * @returns {{score: number, feedback: string}}
 */
function scoreStructure(text) {
  let score = 0;
  if (BULLET_REGEX.test(text)) score += 7;
  if (LINEBREAK_REGEX.test(text)) score += 5;
  if (HEADER_REGEX.test(text)) score += 4;
  if (text.length <= 2000) score += 4;
  if (text.length > 500 && !LINEBREAK_REGEX.test(text) && !BULLET_REGEX.test(text)) score -= 5;
  let feedback = '';
  if (score >= 16) feedback = 'Well-organized with clear sections';
  else if (score >= 10) feedback = 'Consider using bullet points to list requirements';
  else feedback = 'Break this into sections for better AI comprehension';
  return { score: Math.max(0, Math.min(score, 20)), feedback: feedback };
}

/**
 * Scores the Effectiveness category (0-20).
 * @param {string} text
 * @param {object|null} detectedStack
 * @returns {{score: number, feedback: string}}
 */
function scoreEffectiveness(text, detectedStack) {
  let score = 0;
  if (detectedStack) {
    const stackName = detectedStack.name.toLowerCase();
    if (text.toLowerCase().includes(stackName)) score += 10;
  }
  if (EFFECTIVENESS_TERMS.test(text)) score += 5;
  if (COLOR_TERMS.test(text)) score += 3;
  if (CONTEXT_TERMS.test(text)) score += 2;
  let feedback = '';
  if (score >= 16) feedback = 'Optimized for your platform';
  else if (score >= 10) feedback = 'Would work on most platforms';
  else feedback = 'Generic \u2014 tailor to your specific platform for better results';
  return { score: Math.min(score, 20), feedback: feedback };
}

/**
 * Generates actionable suggestions based on missing elements.
 * @param {object} clarity
 * @param {object} specificity
 * @param {object} completeness
 * @param {object} structure
 * @param {object} effectiveness
 * @returns {string[]}
 */
function generateSuggestions(clarity, specificity, completeness, structure, effectiveness) {
  const suggestions = [];
  if (clarity.score < 16) suggestions.push('Be more specific about what you want the AI to build');
  if (specificity.score < 10) suggestions.push('Add your tech stack for +' + (20 - specificity.score) + ' points');
  if (completeness.score < 10) suggestions.push('Add style/design preferences for +5 points');
  if (completeness.score < 15) {
    if (!completeness.feedback.includes('constraints')) suggestions.push('Add specific constraints for +5 points');
  }
  if (structure.score < 10) suggestions.push('Structure your prompt with bullet points for +7 points');
  if (structure.score < 15 && structure.score >= 10) suggestions.push('Use line breaks to separate different sections');
  if (effectiveness.score < 10) suggestions.push('Tailor your prompt to your specific coding platform');
  if (effectiveness.score < 16) suggestions.push('Mention "responsive" or "accessible" for +5 points');
  return suggestions.slice(0, 4);
}

/**
 * Scores a prompt from 0-100 with category breakdown.
 * @param {string} text - The prompt text
 * @param {object|null} detectedStack - Stack info from stack-detector
 * @returns {object} Score result with categories and suggestions
 */
function scorePrompt(text, detectedStack) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      total: 0,
      label: 'Rewrite This',
      color: '#FF1744',
      categories: {
        clarity: { score: 0, max: 20, feedback: 'No text provided' },
        specificity: { score: 0, max: 20, feedback: 'No text provided' },
        completeness: { score: 0, max: 20, feedback: 'No text provided' },
        structure: { score: 0, max: 20, feedback: 'No text provided' },
        effectiveness: { score: 0, max: 20, feedback: 'No text provided' }
      },
      suggestions: ['Start by typing a prompt to enhance']
    };
  }
  const clarity = scoreClarity(text);
  const specificity = scoreSpecificity(text);
  const completeness = scoreCompleteness(text);
  const structure = scoreStructure(text);
  const effectiveness = scoreEffectiveness(text, detectedStack);
  const total = clarity.score + specificity.score + completeness.score + structure.score + effectiveness.score;
  const labelInfo = getScoreLabel(total);
  const suggestions = generateSuggestions(clarity, specificity, completeness, structure, effectiveness);
  return {
    total: total,
    label: labelInfo.label,
    color: labelInfo.color,
    categories: {
      clarity: { score: clarity.score, max: 20, feedback: clarity.feedback },
      specificity: { score: specificity.score, max: 20, feedback: specificity.feedback },
      completeness: { score: completeness.score, max: 20, feedback: completeness.feedback },
      structure: { score: structure.score, max: 20, feedback: structure.feedback },
      effectiveness: { score: effectiveness.score, max: 20, feedback: effectiveness.feedback }
    },
    suggestions: suggestions
  };
}

/**
 * Detects filler phrases in text and returns matches.
 * @param {string} text
 * @returns {Array<{phrase: string, category: string}>}
 */
function detectFillerPhrases(text) {
  const matches = [];
  const seen = new Set();
  for (const entry of FILLER_PHRASES) {
    entry.pattern.lastIndex = 0;
    let m;
    while ((m = entry.pattern.exec(text)) !== null) {
      const phrase = m[0].trim();
      if (!seen.has(phrase.toLowerCase())) {
        seen.add(phrase.toLowerCase());
        matches.push({ phrase: phrase, category: entry.category });
      }
    }
  }
  return matches;
}

/**
 * Analyzes token efficiency of a prompt.
 * @param {string} text
 * @returns {object} Efficiency analysis
 */
function analyzeTokenEfficiency(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      totalWords: 0,
      usefulWords: 0,
      fillerWords: 0,
      efficiency: 100,
      fillerBreakdown: [],
      strippedPrompt: ''
    };
  }
  const words = text.split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  const fillerBreakdown = detectFillerPhrases(text);
  let strippedText = text;
  let fillerWords = 0;
  for (const item of fillerBreakdown) {
    const phraseWords = item.phrase.split(/\s+/).length;
    fillerWords += phraseWords;
    // Case-insensitive replace (detection is case-insensitive, so replacement must be too)
    var escapedPhrase = item.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    strippedText = strippedText.replace(new RegExp(escapedPhrase, 'gi'), '');
  }
  strippedText = strippedText.replace(/\s+/g, ' ').trim();
  const usefulWords = totalWords - fillerWords;
  const efficiency = totalWords > 0 ? Math.round((usefulWords / totalWords) * 100) : 100;
  return {
    totalWords: totalWords,
    usefulWords: usefulWords,
    fillerWords: fillerWords,
    efficiency: efficiency,
    fillerBreakdown: fillerBreakdown,
    strippedPrompt: strippedText
  };
}
