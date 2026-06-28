/**
 * ENHANCER.JS — Core prompt enhancement engine (RULE-BASED, offline)
 * 
 * EXPORTED:
 *   enhancePrompt(text, detectedStack) → object
 */

const TECH_STACKS = ['react', 'vue', 'svelte', 'next.js', 'nuxt', 'angular', 'sveltekit', 'remix', 'gatsby', 'node.js', 'express', 'django', 'flask', 'fastapi', 'rails', 'laravel', 'spring', 'tailwind', 'bootstrap', 'shadcn', 'mui', 'ant', 'chakra', 'typescript', 'javascript', 'python', 'rust', 'go', 'ruby'];

const UI_WORDS = ['dark', 'light', 'minimal', 'modern', 'clean', 'responsive', 'sleek', 'elegant', 'futuristic', 'neon', 'glassmorphism', 'neumorphism', 'bento', 'brutalist', 'retro', 'gradient'];

const CONSTRAINT_WORDS = ['mobile', 'fast', 'accessible', 'performant', 'secure', 'scalable', 'offline', 'pwa', 'seo', 'lightweight', 'production'];

const OUTPUT_WORDS = ['component', 'page', 'screen', 'view', 'function', 'api', 'endpoint', 'route', 'hook', 'util', 'library', 'package', 'app', 'application', 'module', 'plugin'];

const FEATURE_WORDS = ['dashboard', 'form', 'table', 'chart', 'graph', 'list', 'grid', 'card', 'modal', 'dialog', 'sidebar', 'header', 'footer', 'navbar', 'menu', 'carousel', 'accordion', 'tabs', 'pagination', 'search', 'filter', 'auth', 'login', 'signup', 'payment', 'checkout', 'cart', 'notification', 'toast', 'tooltip', 'dropdown', 'drawer'];

/**
 * Detects what type of prompt this is.
 * @param {string} text
 * @returns {string} "build" | "fix" | "feature" | "explain"
 */
function detectPromptType(text) {
  const t = text.toLowerCase();
  const fixWords = /\b(fix|debug|error|broken|not working|crash|bug|issue|problem|incorrect|wrong|faulty)\b/;
  const addWords = /\b(add|implement|include|integrate|feature|introduce|attach)\b/;
  const explainWords = /\b(explain|how|why|what does|what is|describe|clarify|difference between)\b/;
  const buildWords = /\b(build|create|make|generate|design|develop|construct|write|code)\b/;
  if (fixWords.test(t)) return 'fix';
  if (addWords.test(t)) return 'feature';
  if (explainWords.test(t)) return 'explain';
  if (buildWords.test(t)) return 'build';
  return 'build';
}

/**
 * Checks which elements are present/missing in the prompt.
 * @param {string} text
 * @returns {object} Boolean flags for each element
 */
function checkMissingElements(text) {
  const t = text.toLowerCase();
  return {
    hasSubject: FEATURE_WORDS.some(w => t.includes(w)) || /\b(website|app|system|tool|platform|service|site|page)\b/.test(t),
    hasTechStack: TECH_STACKS.some(w => t.includes(w)),
    hasUiStyle: UI_WORDS.some(w => t.includes(w)),
    hasFeatures: /\b(should|must|need|include|featur|allow|enable|has|have|support)\b/i.test(t) && FEATURE_WORDS.some(w => t.includes(w)) || /[•\-*]\s/.test(t),
    hasConstraints: CONSTRAINT_WORDS.some(w => t.includes(w)),
    hasOutputFormat: OUTPUT_WORDS.some(w => t.includes(w)),
    isLongEnough: text.split(/\s+/).filter(Boolean).length > 20,
    hasCodeContext: /\b(code|file|component|function|class|import|export|const|let|var)\b/.test(t) || /`[^`]+`/.test(t)
  };
}

/**
 * Extracts tech stacks mentioned in the prompt.
 * @param {string} text
 * @returns {string[]}
 */
function extractTechStacks(text) {
  const t = text.toLowerCase();
  return TECH_STACKS.filter(s => t.includes(s));
}

/**
 * Extracts UI/style words from the prompt.
 * @param {string} text
 * @returns {string[]}
 */
function extractUiStyle(text) {
  const t = text.toLowerCase();
  return UI_WORDS.filter(w => t.includes(w));
}

/**
 * Cleans up the original text slightly (trims, normalizes whitespace).
 * @param {string} text
 * @returns {string}
 */
function cleanUpOriginal(text) {
  return text.trim().replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n');
}

/**
 * Builds enhanced prompt for BUILD type.
 */
function buildBuildPrompt(original, missing, stacks, styles) {
  let parts = [];
  parts.push(cleanUpOriginal(original));
  parts.push('');
  let tech = stacks.length > 0 ? stacks.join(', ') : 'React with Tailwind CSS (default)';
  if (stacks.length === 0) tech += ' — specify your preferred stack';
  parts.push('**Tech Stack:** ' + tech);
  parts.push('**Requirements:**');
  if (missing.hasFeatures) {
    parts.push('- ' + original.split(/[,.]/).filter(s => s.trim().length > 5).map(s => s.trim()).join('\n- '));
  } else {
    parts.push('- Core functionality as described');
    parts.push('- User-friendly interface');
  }
  parts.push('');
  parts.push('**Style/Design:**');
  if (missing.hasUiStyle) {
    parts.push('- ' + styles.join(', '));
  } else {
    parts.push('- Modern, clean design');
    if (!missing.hasUiStyle) parts.push('- Specify your preferred style (dark/light, minimal, etc.)');
  }
  parts.push('');
  parts.push('**Constraints:**');
  if (missing.hasConstraints) {
    parts.push('- Responsive design');
  } else {
    parts.push('- Responsive design');
    parts.push('- Cross-browser compatibility');
    if (!missing.hasConstraints) parts.push('- Add performance or accessibility constraints if needed');
  }
  return parts.join('\n');
}

/**
 * Builds enhanced prompt for FIX type.
 */
function buildFixPrompt(original, missing, stacks) {
  let parts = [];
  parts.push(cleanUpOriginal(original));
  parts.push('');
  let tech = stacks.length > 0 ? stacks.join(', ') : 'your tech stack';
  parts.push('**Expected Behavior:** [What should happen]');
  parts.push('**Actual Behavior:** [What is currently happening]');
  parts.push('**Tech Stack:** ' + tech);
  parts.push('**Relevant Code:**');
  parts.push('[Paste the relevant code here]');
  parts.push('');
  parts.push('**Error Messages:**');
  parts.push('[Include any error logs if available]');
  return parts.join('\n');
}

/**
 * Builds enhanced prompt for FEATURE type.
 */
function buildFeaturePrompt(original, missing, stacks) {
  let parts = [];
  parts.push(cleanUpOriginal(original));
  parts.push('');
  let tech = stacks.length > 0 ? stacks.join(', ') : 'React with Tailwind CSS (default)';
  if (stacks.length === 0) tech += ' — specify your preferred stack';
  parts.push('**Feature Description:** ' + cleanUpOriginal(original));
  parts.push('**Tech Stack:** ' + tech);
  parts.push('**Integration:** [What existing system does this integrate with?]');
  parts.push('**Requirements:**');
  parts.push('- [Requirement 1]');
  parts.push('- [Requirement 2]');
  parts.push('- [Add more as needed]');
  return parts.join('\n');
}

/**
 * Builds enhanced prompt for EXPLAIN type.
 */
function buildExplainPrompt(original, missing, stacks) {
  let parts = [];
  parts.push(cleanUpOriginal(original));
  parts.push('');
  let tech = stacks.length > 0 ? stacks.join(', ') : 'general';
  parts.push('**Context:** ' + tech);
  parts.push('**Level:** [beginner / intermediate / advanced]');
  parts.push('**Format:** [explanation with examples / comparison / deep dive]');
  parts.push('**Specific Points to Cover:**');
  parts.push('- [Point 1]');
  parts.push('- [Point 2]');
  return parts.join('\n');
}

/**
 * Generates improvement descriptions based on what was missing.
 * @param {object} missing
 * @returns {string[]}
 */
function generateImprovements(missing) {
  const imps = [];
  if (!missing.hasTechStack) imps.push('Added tech stack specification');
  if (!missing.hasUiStyle) imps.push('Added design/style requirements');
  if (!missing.hasFeatures) imps.push('Added structured requirements section');
  if (!missing.hasConstraints) imps.push('Added constraints section');
  if (!missing.hasOutputFormat) imps.push('Added output format suggestion');
  if (!missing.isLongEnough) imps.push('Expanded prompt with more detail');
  if (!missing.hasCodeContext) imps.push('Added context sections for clarity');
  if (!missing.hasSubject) imps.push('Clarified the subject of the request');
  if (imps.length === 0) imps.push('Minor formatting improvements');
  return imps;
}

/**
 * Enhances a prompt using rule-based transformations.
 * @param {string} text - The raw prompt text
 * @param {object|null} detectedStack - Stack info from stack-detector
 * @returns {object} Enhanced prompt result
 */
function enhancePrompt(text, detectedStack) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      original: text || '',
      enhanced: text || '',
      improvements: [],
      detectedType: 'build'
    };
  }
  const type = detectPromptType(text);
  const missing = checkMissingElements(text);
  const stacks = extractTechStacks(text);
  const styles = extractUiStyle(text);
  let enhanced = '';
  switch (type) {
    case 'fix':
      enhanced = buildFixPrompt(text, missing, stacks);
      break;
    case 'feature':
      enhanced = buildFeaturePrompt(text, missing, stacks);
      break;
    case 'explain':
      enhanced = buildExplainPrompt(text, missing, stacks);
      break;
    default:
      enhanced = buildBuildPrompt(text, missing, stacks, styles);
      break;
  }
  if (detectedStack && detectedStack.tips && detectedStack.tips.length > 0) {
    enhanced += '\n\n---\n**Tip for ' + detectedStack.name + ':**\n- ' + detectedStack.tips.slice(0, 2).join('\n- ');
  }
  const improvements = generateImprovements(missing);
  return {
    original: text,
    enhanced: enhanced,
    improvements: improvements,
    detectedType: type
  };
}
