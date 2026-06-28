/**
 * STACK-DETECTOR.JS — Stack/site detection logic
 * 
 * EXPORTED:
 *   detectStack(hostname) → object|null
 *   getAllStacks() → object
 *   getStackTips(stackId) → string[]
 */

const STACK_MAP = {
  'v0.dev': {
    id: 'v0',
    name: 'v0 by Vercel',
    category: 'ui-builder',
    tips: [
      'Mention shadcn/ui component names explicitly (Button, Card, Dialog)',
      'Use words like "modern", "minimal", "clean" for better styling',
      'Describe the layout: "with a sidebar", "in a grid", "as a modal"',
      'Specify "responsive" for mobile-friendly output',
      'Mention "dark mode" or "light mode" for theme preference'
    ]
  },
  'bolt.new': {
    id: 'bolt',
    name: 'Bolt',
    category: 'fullstack-builder',
    tips: [
      'Describe the full file structure (pages, components, API routes)',
      'Specify "TypeScript" if you want type safety',
      'Mention database and ORM (e.g., "with Prisma" or "Supabase")',
      'Include "responsive" for mobile support',
      'Describe state management needs (React Context, Zustand)'
    ]
  },
  'lovable.dev': {
    id: 'lovable',
    name: 'Lovable',
    category: 'fullstack-builder',
    tips: [
      'Be specific about the tech stack (React, Next.js, Vue)',
      'Mention Supabase for backend features (auth, database)',
      'Describe the visual style: colors, fonts, spacing',
      'List features as bullet points for better parsing',
      'Include "mobile-first" or "responsive" for adaptive layouts'
    ]
  },
  'cursor.sh': {
    id: 'cursor',
    name: 'Cursor',
    category: 'ide',
    tips: [
      'Reference specific file names with @filename for context',
      'Use @codebase to include your entire project context',
      'Be precise about which function/component to modify',
      'Include expected behavior AND current behavior for fixes',
      'Mention the testing framework if you want tests generated'
    ]
  },
  'replit.com': {
    id: 'replit',
    name: 'Replit',
    category: 'ide',
    tips: [
      'Specify the language/runtime in your prompt',
      'Mention "include a README" for documentation',
      'Describe the full project structure for multi-file generation',
      'Include deployment requirements if hosting on Replit',
      'Ask for error handling explicitly'
    ]
  },
  'claude.ai': {
    id: 'claude',
    name: 'Claude',
    category: 'chat',
    tips: [
      'Use XML tags to structure complex prompts (<context>, <task>)',
      'Include "think step by step" for complex logic',
      'Specify the output format: code, explanation, or both',
      'Mention the framework and version for accurate code',
      'Ask for TypeScript types/interfaces explicitly'
    ]
  },
  'chatgpt.com': {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'chat',
    tips: [
      'Be explicit about framework version (e.g., Next.js 14 App Router)',
      'Ask for "complete, working code" to avoid snippets',
      'Specify "no placeholders" for real implementations',
      'Include "explain briefly" to avoid overwhelming text',
      'Mention "use modern syntax" to avoid outdated patterns'
    ]
  },
  'chat.openai.com': {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'chat',
    tips: [
      'Be explicit about framework version (e.g., Next.js 14 App Router)',
      'Ask for "complete, working code" to avoid snippets',
      'Specify "no placeholders" for real implementations',
      'Include "explain briefly" to avoid overwhelming text',
      'Mention "use modern syntax" to avoid outdated patterns'
    ]
  },
  'codeium.com': {
    id: 'windsurf',
    name: 'Windsurf',
    category: 'ide',
    tips: [
      'Use natural language in comments to guide generation',
      'Reference existing code patterns in your project',
      'Be specific about function signatures and return types',
      'Include error handling requirements',
      'Mention testing patterns if you want tests'
    ]
  },
  'aistudio.google.com': {
    id: 'ai-studio',
    name: 'AI Studio',
    category: 'chat',
    tips: [
      'Specify the model temperature preference',
      'Include "structured output" if you need JSON responses',
      'Mention the target platform (web, mobile, server)',
      'Be explicit about Google-specific APIs if relevant'
    ]
  },
  'github.com': {
    id: 'copilot',
    name: 'Copilot',
    category: 'ide',
    tips: [
      'Write descriptive comments above code you want generated',
      'Include type annotations for better suggestions',
      'Use descriptive function and variable names',
      'Write the function signature first, then let Copilot fill body',
      'Include test cases as comments for better generation'
    ]
  },
  'codesandbox.io': {
    id: 'codesandbox',
    name: 'CodeSandbox',
    category: 'ide',
    tips: [
      'Specify the template (React, Vue, Vanilla, etc.)',
      'Describe the project structure you want',
      'Mention npm packages explicitly',
      'Include "sandbox-ready" for self-contained examples'
    ]
  },
  'stackblitz.com': {
    id: 'stackblitz',
    name: 'StackBlitz',
    category: 'ide',
    tips: [
      'Mention the framework template to start with',
      'Specify Node.js version if relevant',
      'Include environment variables if needed',
      'Describe the dev server setup'
    ]
  },
  'windsurf.com': {
    id: 'windsurf',
    name: 'Windsurf',
    category: 'ide',
    tips: [
      'Use natural language in comments to guide generation',
      'Reference existing code patterns in your project',
      'Be specific about function signatures and return types',
      'Include error handling requirements',
      'Mention testing patterns if you want tests'
    ]
  },
  'manus.im': {
    id: 'manus',
    name: 'Manus AI',
    category: 'agent',
    tips: [
      'Describe the end goal clearly — Manus plans its own steps',
      'Include file formats and output structure you expect',
      'Mention specific tools or APIs you want it to use',
      'Be explicit about quality standards and constraints',
      'Provide examples of the desired output format'
    ]
  },
  'devin.ai': {
    id: 'devin',
    name: 'Devin',
    category: 'agent',
    tips: [
      'Point to a specific repo or codebase for context',
      'Describe the task as a clear engineering ticket',
      'Include acceptance criteria for the expected result',
      'Mention testing requirements (unit, integration, e2e)',
      'Specify the branch strategy and PR conventions'
    ]
  },
  'gemini.google.com': {
    id: 'gemini',
    name: 'Gemini',
    category: 'chat',
    tips: [
      'Use structured prompts with clear sections',
      'Mention the framework and version explicitly',
      'Ask for complete, runnable code without placeholders',
      'Specify TypeScript for type-safe output',
      'Include "use modern syntax" for up-to-date patterns'
    ]
  },
  'grok.com': {
    id: 'grok',
    name: 'Grok',
    category: 'chat',
    tips: [
      'Be direct and specific — Grok responds well to concise prompts',
      'Include the tech stack and version numbers',
      'Ask for production-ready code, not snippets',
      'Specify the output format (component, API, full page)',
      'Mention edge cases and error handling needs'
    ]
  },
  'perplexity.ai': {
    id: 'perplexity',
    name: 'Perplexity',
    category: 'research',
    tips: [
      'Great for researching APIs and libraries before coding',
      'Ask it to find the latest version of packages',
      'Use it to compare implementation approaches',
      'Ask for documentation links and code examples',
      'Follow up with specific implementation questions'
    ]
  },
  'chat.deepseek.com': {
    id: 'deepseek',
    name: 'DeepSeek',
    category: 'chat',
    tips: [
      'DeepSeek excels at reasoning — ask it to explain its approach',
      'Provide detailed context about your project structure',
      'Ask for TypeScript with strict type annotations',
      'Include performance requirements in your prompt',
      'Use "think step by step" for complex logic'
    ]
  },
  'phind.com': {
    id: 'phind',
    name: 'Phind',
    category: 'chat',
    tips: [
      'Phind searches the web — reference specific docs or APIs',
      'Ask for code that matches the latest documentation',
      'Include your project\'s tech stack for contextual answers',
      'Use it to debug by pasting error messages with context',
      'Ask for alternatives when the first approach has issues'
    ]
  },
  'poe.com': {
    id: 'poe',
    name: 'Poe',
    category: 'chat',
    tips: [
      'Specify which model you want to use for best results',
      'Include the full tech stack in your prompt',
      'Ask for complete implementations, not partial code',
      'Mention the target platform (web, mobile, server)',
      'Include style and design requirements for UI work'
    ]
  },
  'you.com': {
    id: 'you',
    name: 'You.com',
    category: 'chat',
    tips: [
      'Use the code mode for programming-specific answers',
      'Include your framework and version for accurate code',
      'Ask for explanations alongside the code',
      'Reference specific documentation when available',
      'Specify the output format and structure you need'
    ]
  }
};

/**
 * Detects which AI coding platform the user is on based on hostname.
 * @param {string} hostname - The hostname to check (e.g., "v0.dev")
 * @returns {object|null} Stack object or null if unrecognized
 */
function detectStack(hostname) {
  if (!hostname || typeof hostname !== 'string') return null;
  const h = hostname.toLowerCase().replace(/^www\./, '');
  if (STACK_MAP[h]) return STACK_MAP[h];
  for (const key in STACK_MAP) {
    if (h.endsWith('.' + key) || h === key) return STACK_MAP[key];
  }
  return null;
}

/**
 * Returns all stacks in the database.
 * @returns {object} All stacks keyed by hostname
 */
function getAllStacks() {
  return STACK_MAP;
}

/**
 * Gets tips for a specific stack by its id.
 * @param {string} stackId - The stack id (e.g., "v0", "bolt")
 * @returns {string[]} Array of tip strings
 */
function getStackTips(stackId) {
  for (const key in STACK_MAP) {
    if (STACK_MAP[key].id === stackId) return STACK_MAP[key].tips;
  }
  return [];
}
