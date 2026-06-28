/**
 * TEMPLATES.JS — Prompt template data and logic
 * 
 * EXPORTED:
 *   TEMPLATES: object — all templates organized by category
 *   getTemplatesByCategory(category) → array
 *   getTemplateById(id) → object|null
 *   fillTemplate(templateId, values) → string
 */

const TEMPLATES = {
  'ui-components': [
    {
      id: 'dashboard',
      name: 'Dashboard',
      category: 'ui-components',
      preview: 'Build a dashboard with charts and data display',
      template: 'Build a [LAYOUT] dashboard with [NUMBER] [CHART_TYPE] charts showing [DATA_TYPE]. Use [FRAMEWORK] with [STYLING]. Include [FEATURES]. Make it [STYLE].',
      fields: ['LAYOUT', 'NUMBER', 'CHART_TYPE', 'DATA_TYPE', 'FRAMEWORK', 'STYLING', 'FEATURES', 'STYLE']
    },
    {
      id: 'form',
      name: 'Form',
      category: 'ui-components',
      preview: 'Create a form with validation and submission',
      template: 'Create a [FORM_TYPE] form with fields: [FIELDS]. Include [VALIDATION] validation. Style: [STYLE]. On submit: [ACTION]. Add [EXTRAS].',
      fields: ['FORM_TYPE', 'FIELDS', 'VALIDATION', 'STYLE', 'ACTION', 'EXTRAS']
    },
    {
      id: 'landing-page',
      name: 'Landing Page',
      category: 'ui-components',
      preview: 'Design a high-converting landing page',
      template: 'Design a [PURPOSE] landing page. Sections: [SECTIONS]. Style: [STYLE]. Color scheme: [COLORS]. Include [FEATURES]. Target audience: [AUDIENCE].',
      fields: ['PURPOSE', 'SECTIONS', 'STYLE', 'COLORS', 'FEATURES', 'AUDIENCE']
    },
    {
      id: 'navigation',
      name: 'Navigation',
      category: 'ui-components',
      preview: 'Build a navigation bar or menu system',
      template: 'Build a [NAV_TYPE] navigation bar with items: [ITEMS]. Include [FEATURES]. Responsive: [YES/NO]. Style: [STYLE]. Brand: [BRAND_NAME].',
      fields: ['NAV_TYPE', 'ITEMS', 'FEATURES', 'YES/NO', 'STYLE', 'BRAND_NAME']
    },
    {
      id: 'card-grid',
      name: 'Card Grid',
      category: 'ui-components',
      preview: 'Create a responsive grid of cards',
      template: 'Create a responsive grid of [CARD_TYPE] cards. Each card shows [FIELDS]. Include [INTERACTIONS]. Grid: [COLUMNS] columns. Style: [STYLE].',
      fields: ['CARD_TYPE', 'FIELDS', 'INTERACTIONS', 'COLUMNS', 'STYLE']
    },
    {
      id: 'modal-dialog',
      name: 'Modal / Dialog',
      category: 'ui-components',
      preview: 'Build an accessible modal dialog component',
      template: 'Build a [MODAL_TYPE] modal dialog with [CONTENT_TYPE] content. Include [FEATURES]. Animation: [ANIMATION]. Backdrop: [BACKDROP]. Style: [STYLE]. Accessibility: [A11Y].',
      fields: ['MODAL_TYPE', 'CONTENT_TYPE', 'FEATURES', 'ANIMATION', 'BACKDROP', 'STYLE', 'A11Y']
    },
    {
      id: 'data-table',
      name: 'Data Table',
      category: 'ui-components',
      preview: 'Create a sortable, filterable data table',
      template: 'Create a [TABLE_TYPE] data table displaying [DATA_TYPE]. Features: [FEATURES]. Columns: [COLUMNS]. Include [INTERACTIONS]. Pagination: [YES/NO]. Style: [STYLE].',
      fields: ['TABLE_TYPE', 'DATA_TYPE', 'FEATURES', 'COLUMNS', 'INTERACTIONS', 'YES/NO', 'STYLE']
    },
    {
      id: 'sidebar',
      name: 'Sidebar',
      category: 'ui-components',
      preview: 'Build a collapsible sidebar navigation',
      template: 'Build a [SIDEBAR_TYPE] sidebar with sections: [SECTIONS]. Include [FEATURES]. Collapse: [YES/NO]. Width: [WIDTH]. Style: [STYLE]. Active indicator: [INDICATOR].',
      fields: ['SIDEBAR_TYPE', 'SECTIONS', 'FEATURES', 'YES/NO', 'WIDTH', 'STYLE', 'INDICATOR']
    },
    {
      id: 'notification-center',
      name: 'Notifications',
      category: 'ui-components',
      preview: 'Build a notification/toast system',
      template: 'Build a [NOTIF_TYPE] notification system with [POSITION] positioning. Types: [TYPES]. Features: [FEATURES]. Animation: [ANIMATION]. Auto-dismiss: [DURATION]. Style: [STYLE].',
      fields: ['NOTIF_TYPE', 'POSITION', 'TYPES', 'FEATURES', 'ANIMATION', 'DURATION', 'STYLE']
    },
    {
      id: 'pricing-table',
      name: 'Pricing Table',
      category: 'ui-components',
      preview: 'Design a pricing comparison table',
      template: 'Design a [LAYOUT] pricing table with [NUMBER] tiers: [TIER_NAMES]. Highlight: [FEATURED_TIER]. Include [FEATURES]. Style: [STYLE]. CTA text: [CTA].',
      fields: ['LAYOUT', 'NUMBER', 'TIER_NAMES', 'FEATURED_TIER', 'FEATURES', 'STYLE', 'CTA']
    }
  ],
  'full-apps': [
    {
      id: 'todo-app',
      name: 'Todo App',
      category: 'full-apps',
      preview: 'Build a complete todo application',
      template: 'Build a [COMPLEXITY] todo app with features: [FEATURES]. Tech: [STACK]. Include [EXTRAS]. Style: [STYLE]. Storage: [STORAGE_TYPE].',
      fields: ['COMPLEXITY', 'FEATURES', 'STACK', 'EXTRAS', 'STYLE', 'STORAGE_TYPE']
    },
    {
      id: 'chat-app',
      name: 'Chat App',
      category: 'full-apps',
      preview: 'Create a real-time chat application',
      template: 'Create a [TYPE] chat application. Features: [FEATURES]. Tech: [STACK]. Include [EXTRAS]. Support [MESSAGE_TYPES]. Style: [STYLE].',
      fields: ['TYPE', 'FEATURES', 'STACK', 'EXTRAS', 'MESSAGE_TYPES', 'STYLE']
    },
    {
      id: 'ecommerce',
      name: 'E-Commerce',
      category: 'full-apps',
      preview: 'Build an e-commerce platform',
      template: 'Build an e-commerce [SECTION] with features: [FEATURES]. Tech: [STACK]. Include [EXTRAS]. Products: [PRODUCT_TYPE]. Style: [STYLE].',
      fields: ['SECTION', 'FEATURES', 'STACK', 'EXTRAS', 'PRODUCT_TYPE', 'STYLE']
    },
    {
      id: 'blog',
      name: 'Blog / CMS',
      category: 'full-apps',
      preview: 'Create a blog or content management system',
      template: 'Create a [TYPE] with features: [FEATURES]. Tech: [STACK]. Include [EXTRAS]. Content: [CONTENT_TYPE]. Style: [STYLE].',
      fields: ['TYPE', 'FEATURES', 'STACK', 'EXTRAS', 'CONTENT_TYPE', 'STYLE']
    },
    {
      id: 'auth',
      name: 'Auth System',
      category: 'full-apps',
      preview: 'Implement authentication and user management',
      template: 'Implement [AUTH_TYPE] authentication. Tech: [STACK]. Include: [FEATURES]. Storage: [USER_STORE]. Add [EXTRAS].',
      fields: ['AUTH_TYPE', 'STACK', 'FEATURES', 'USER_STORE', 'EXTRAS']
    },
    {
      id: 'saas-dashboard',
      name: 'SaaS Dashboard',
      category: 'full-apps',
      preview: 'Build a full SaaS admin dashboard',
      template: 'Build a SaaS admin dashboard for [USE_CASE]. Tech: [STACK]. Sections: [SECTIONS]. Include [FEATURES]. Auth: [AUTH_TYPE]. Billing: [BILLING]. Style: [STYLE].',
      fields: ['USE_CASE', 'STACK', 'SECTIONS', 'FEATURES', 'AUTH_TYPE', 'BILLING', 'STYLE']
    },
    {
      id: 'portfolio',
      name: 'Portfolio Site',
      category: 'full-apps',
      preview: 'Create a developer portfolio website',
      template: 'Create a [TYPE] portfolio site. Sections: [SECTIONS]. Tech: [STACK]. Include [FEATURES]. Projects: [NUMBER] showcased. Style: [STYLE]. Animations: [ANIMATIONS].',
      fields: ['TYPE', 'SECTIONS', 'STACK', 'FEATURES', 'NUMBER', 'STYLE', 'ANIMATIONS']
    },
    {
      id: 'file-manager',
      name: 'File Manager',
      category: 'full-apps',
      preview: 'Build a file management interface',
      template: 'Build a [TYPE] file manager. Features: [FEATURES]. Tech: [STACK]. Views: [VIEWS]. Include [EXTRAS]. Storage: [STORAGE]. Style: [STYLE].',
      fields: ['TYPE', 'FEATURES', 'STACK', 'VIEWS', 'EXTRAS', 'STORAGE', 'STYLE']
    },
    {
      id: 'kanban',
      name: 'Kanban Board',
      category: 'full-apps',
      preview: 'Create a drag-and-drop kanban board',
      template: 'Create a [TYPE] kanban board with columns: [COLUMNS]. Features: [FEATURES]. Tech: [STACK]. Drag library: [DRAG_LIB]. Include [EXTRAS]. Style: [STYLE].',
      fields: ['TYPE', 'COLUMNS', 'FEATURES', 'STACK', 'DRAG_LIB', 'EXTRAS', 'STYLE']
    },
    {
      id: 'ai-chatbot',
      name: 'AI Chatbot UI',
      category: 'full-apps',
      preview: 'Build a ChatGPT-style chatbot interface',
      template: 'Build a [TYPE] AI chatbot UI. Features: [FEATURES]. Tech: [STACK]. Streaming: [YES/NO]. Support [MESSAGE_TYPES]. Include [EXTRAS]. Style: [STYLE].',
      fields: ['TYPE', 'FEATURES', 'STACK', 'YES/NO', 'MESSAGE_TYPES', 'EXTRAS', 'STYLE']
    }
  ],
  'fixes': [
    {
      id: 'fix-bug',
      name: 'Fix Bug',
      category: 'fixes',
      preview: 'Debug and fix an issue in your code',
      template: 'I have a [FRAMEWORK] [COMPONENT_TYPE] that should [EXPECTED] but instead [ACTUAL]. Tech stack: [STACK]. Here\'s the code: [CODE_CONTEXT]. Fix while maintaining [CONSTRAINTS].',
      fields: ['FRAMEWORK', 'COMPONENT_TYPE', 'EXPECTED', 'ACTUAL', 'STACK', 'CODE_CONTEXT', 'CONSTRAINTS']
    },
    {
      id: 'add-feature',
      name: 'Add Feature',
      category: 'fixes',
      preview: 'Add a new feature to an existing app',
      template: 'Add [FEATURE] to my [APP_TYPE]. Tech: [STACK]. The feature should [DESCRIPTION]. Integrate with [EXISTING_SYSTEMS]. Style: [STYLE].',
      fields: ['FEATURE', 'APP_TYPE', 'STACK', 'DESCRIPTION', 'EXISTING_SYSTEMS', 'STYLE']
    },
    {
      id: 'refactor',
      name: 'Refactor',
      category: 'fixes',
      preview: 'Refactor code for better quality',
      template: 'Refactor this [CODE_TYPE] to improve [GOAL]. Current code: [CODE]. Constraints: [CONSTRAINTS]. Maintain same behavior. Tech: [STACK].',
      fields: ['CODE_TYPE', 'GOAL', 'CODE', 'CONSTRAINTS', 'STACK']
    },
    {
      id: 'api-endpoint',
      name: 'API Endpoint',
      category: 'fixes',
      preview: 'Create a REST or GraphQL API endpoint',
      template: 'Create a [METHOD] API endpoint at [PATH] that [DESCRIPTION]. Params: [PARAMS]. Returns: [RESPONSE]. Include [FEATURES]. Tech: [STACK].',
      fields: ['METHOD', 'PATH', 'DESCRIPTION', 'PARAMS', 'RESPONSE', 'FEATURES', 'STACK']
    },
    {
      id: 'db-schema',
      name: 'DB Schema',
      category: 'fixes',
      preview: 'Design a database schema',
      template: 'Design a database schema for [USE_CASE]. Tables: [TABLES]. Relationships: [RELATIONS]. Include [FEATURES]. Database: [DB_TYPE].',
      fields: ['USE_CASE', 'TABLES', 'RELATIONS', 'FEATURES', 'DB_TYPE']
    },
    {
      id: 'perf-optimization',
      name: 'Performance Fix',
      category: 'fixes',
      preview: 'Optimize slow code or page load',
      template: 'Optimize this [COMPONENT_TYPE] for performance. Current issue: [ISSUE]. Tech: [STACK]. Target: [TARGET_METRIC]. Constraints: [CONSTRAINTS].',
      fields: ['COMPONENT_TYPE', 'ISSUE', 'STACK', 'TARGET_METRIC', 'CONSTRAINTS']
    },
    {
      id: 'responsive-fix',
      name: 'Responsive Fix',
      category: 'fixes',
      preview: 'Fix layout issues on mobile/tablet',
      template: 'Fix responsive layout issues in [COMPONENT]. Breakpoints: [BREAKPOINTS]. Issue: [ISSUE]. Tech: [STACK]. Target devices: [DEVICES].',
      fields: ['COMPONENT', 'BREAKPOINTS', 'ISSUE', 'STACK', 'DEVICES']
    }
  ],
  'api-backend': [
    {
      id: 'rest-api',
      name: 'REST API',
      category: 'api-backend',
      preview: 'Create a full REST API with CRUD operations',
      template: 'Create a REST API for [RESOURCE] with endpoints: [ENDPOINTS]. Tech: [STACK]. Database: [DB]. Auth: [AUTH]. Include [FEATURES]. Validation: [VALIDATION].',
      fields: ['RESOURCE', 'ENDPOINTS', 'STACK', 'DB', 'AUTH', 'FEATURES', 'VALIDATION']
    },
    {
      id: 'graphql',
      name: 'GraphQL API',
      category: 'api-backend',
      preview: 'Build a GraphQL schema and resolvers',
      template: 'Build a GraphQL API for [DOMAIN]. Types: [TYPES]. Queries: [QUERIES]. Mutations: [MUTATIONS]. Tech: [STACK]. Include [FEATURES].',
      fields: ['DOMAIN', 'TYPES', 'QUERIES', 'MUTATIONS', 'STACK', 'FEATURES']
    },
    {
      id: 'webhook-handler',
      name: 'Webhook Handler',
      category: 'api-backend',
      preview: 'Create a webhook endpoint to process events',
      template: 'Create a webhook handler for [SERVICE] events. Events: [EVENTS]. Processing: [PROCESSING]. Tech: [STACK]. Include [FEATURES]. Retry: [RETRY_STRATEGY].',
      fields: ['SERVICE', 'EVENTS', 'PROCESSING', 'STACK', 'FEATURES', 'RETRY_STRATEGY']
    },
    {
      id: 'auth-middleware',
      name: 'Auth Middleware',
      category: 'api-backend',
      preview: 'Build authentication middleware',
      template: 'Build [AUTH_TYPE] auth middleware for [FRAMEWORK]. Features: [FEATURES]. Token: [TOKEN_TYPE]. Storage: [SESSION_STORE]. Include [EXTRAS].',
      fields: ['AUTH_TYPE', 'FRAMEWORK', 'FEATURES', 'TOKEN_TYPE', 'SESSION_STORE', 'EXTRAS']
    },
    {
      id: 'cron-job',
      name: 'Cron / Scheduled Job',
      category: 'api-backend',
      preview: 'Create a scheduled background task',
      template: 'Create a scheduled job that runs [SCHEDULE]. Task: [TASK_DESCRIPTION]. Tech: [STACK]. Include [FEATURES]. Error handling: [ERROR_STRATEGY]. Logging: [YES/NO].',
      fields: ['SCHEDULE', 'TASK_DESCRIPTION', 'STACK', 'FEATURES', 'ERROR_STRATEGY', 'YES/NO']
    },
    {
      id: 'websocket',
      name: 'WebSocket Server',
      category: 'api-backend',
      preview: 'Build a real-time WebSocket server',
      template: 'Build a WebSocket server for [USE_CASE]. Events: [EVENTS]. Tech: [STACK]. Rooms: [YES/NO]. Auth: [AUTH]. Include [FEATURES]. Scaling: [STRATEGY].',
      fields: ['USE_CASE', 'EVENTS', 'STACK', 'YES/NO', 'AUTH', 'FEATURES', 'STRATEGY']
    },
    {
      id: 'microservice',
      name: 'Microservice',
      category: 'api-backend',
      preview: 'Design a microservice architecture',
      template: 'Design a [DOMAIN] microservice. Tech: [STACK]. Endpoints: [ENDPOINTS]. Database: [DB]. Communication: [COMM_TYPE]. Include [FEATURES]. Deploy: [DEPLOY_TARGET].',
      fields: ['DOMAIN', 'STACK', 'ENDPOINTS', 'DB', 'COMM_TYPE', 'FEATURES', 'DEPLOY_TARGET']
    },
    {
      id: 'serverless-fn',
      name: 'Serverless Function',
      category: 'api-backend',
      preview: 'Create a serverless cloud function',
      template: 'Create a serverless function for [USE_CASE]. Platform: [PLATFORM]. Trigger: [TRIGGER]. Runtime: [RUNTIME]. Include [FEATURES]. Env vars: [ENV_VARS].',
      fields: ['USE_CASE', 'PLATFORM', 'TRIGGER', 'RUNTIME', 'FEATURES', 'ENV_VARS']
    }
  ],
  'ai-prompts': [
    {
      id: 'code-reviewer',
      name: 'Code Reviewer',
      category: 'ai-prompts',
      preview: 'AI prompt for thorough code review',
      template: 'You are a senior code reviewer. Review this [LANGUAGE] code for: [CRITERIA]. Code: [CODE]. Focus on [FOCUS_AREAS]. Severity levels: critical, warning, suggestion. Format as a numbered list.',
      fields: ['LANGUAGE', 'CRITERIA', 'CODE', 'FOCUS_AREAS']
    },
    {
      id: 'doc-generator',
      name: 'Documentation Writer',
      category: 'ai-prompts',
      preview: 'Generate documentation for code or APIs',
      template: 'Generate [DOC_TYPE] documentation for this [CODE_TYPE]. Code: [CODE]. Include [SECTIONS]. Audience: [AUDIENCE]. Format: [FORMAT]. Style: [TONE].',
      fields: ['DOC_TYPE', 'CODE_TYPE', 'CODE', 'SECTIONS', 'AUDIENCE', 'FORMAT', 'TONE']
    },
    {
      id: 'test-writer',
      name: 'Test Generator',
      category: 'ai-prompts',
      preview: 'Generate unit/integration tests',
      template: 'Write [TEST_TYPE] tests for this [COMPONENT_TYPE]. Code: [CODE]. Framework: [TEST_FRAMEWORK]. Cover: [SCENARIOS]. Include [EXTRAS]. Style: [STYLE].',
      fields: ['TEST_TYPE', 'COMPONENT_TYPE', 'CODE', 'TEST_FRAMEWORK', 'SCENARIOS', 'EXTRAS', 'STYLE']
    },
    {
      id: 'debug-helper',
      name: 'Debug Assistant',
      category: 'ai-prompts',
      preview: 'Structured debugging prompt',
      template: 'Help me debug this [LANGUAGE] issue. Error: [ERROR_MESSAGE]. Code: [CODE]. Expected: [EXPECTED]. Actual: [ACTUAL]. Environment: [ENV]. I have tried: [ATTEMPTS].',
      fields: ['LANGUAGE', 'ERROR_MESSAGE', 'CODE', 'EXPECTED', 'ACTUAL', 'ENV', 'ATTEMPTS']
    },
    {
      id: 'architecture-advisor',
      name: 'Architecture Advisor',
      category: 'ai-prompts',
      preview: 'Get architecture recommendations',
      template: 'Recommend an architecture for [PROJECT_DESCRIPTION]. Requirements: [REQUIREMENTS]. Scale: [SCALE]. Team size: [TEAM_SIZE]. Budget: [BUDGET]. Constraints: [CONSTRAINTS].',
      fields: ['PROJECT_DESCRIPTION', 'REQUIREMENTS', 'SCALE', 'TEAM_SIZE', 'BUDGET', 'CONSTRAINTS']
    },
    {
      id: 'regex-builder',
      name: 'Regex Builder',
      category: 'ai-prompts',
      preview: 'Build and explain regular expressions',
      template: 'Write a regex for [LANGUAGE] that matches [PATTERN_DESCRIPTION]. Examples that should match: [MATCHES]. Examples that should NOT match: [NON_MATCHES]. Explain each part.',
      fields: ['LANGUAGE', 'PATTERN_DESCRIPTION', 'MATCHES', 'NON_MATCHES']
    },
    {
      id: 'migration-planner',
      name: 'Migration Planner',
      category: 'ai-prompts',
      preview: 'Plan a codebase migration',
      template: 'Plan a migration from [FROM_TECH] to [TO_TECH]. Codebase: [CODEBASE_DESC]. Size: [SIZE]. Timeline: [TIMELINE]. Risks: [RISKS]. Provide step-by-step plan with rollback strategy.',
      fields: ['FROM_TECH', 'TO_TECH', 'CODEBASE_DESC', 'SIZE', 'TIMELINE', 'RISKS']
    },
    {
      id: 'refactoring-guide',
      name: 'Refactoring Guide',
      category: 'ai-prompts',
      preview: 'Get structured refactoring advice',
      template: 'Refactor this [CODE_TYPE] code. Current code: [CODE]. Goals: [GOALS]. Patterns to apply: [PATTERNS]. Constraints: [CONSTRAINTS]. Show before/after with explanations.',
      fields: ['CODE_TYPE', 'CODE', 'GOALS', 'PATTERNS', 'CONSTRAINTS']
    }
  ]
};

/**
 * Gets all templates in a category.
 * @param {string} category - "ui-components" | "full-apps" | "fixes"
 * @returns {array} Array of template objects
 */
function getTemplatesByCategory(category) {
  return TEMPLATES[category] || [];
}

/**
 * Gets a template by its ID.
 * @param {string} id - Template id string
 * @returns {object|null} Template object or null if not found
 */
function getTemplateById(id) {
  for (const cat in TEMPLATES) {
    const found = TEMPLATES[cat].find(t => t.id === id);
    if (found) return found;
  }
  return null;
}

/**
 * Fills a template's placeholder fields with provided values.
 * @param {string} templateId - Template id
 * @param {object} values - Object mapping field names to values
 * @returns {string} Filled template string (or original template if not found)
 */
function fillTemplate(templateId, values) {
  const tmpl = getTemplateById(templateId);
  if (!tmpl) return '';
  let result = tmpl.template;
  for (const field of tmpl.fields) {
    if (values[field]) {
      result = result.split('[' + field + ']').join(values[field]);
    }
  }
  return result;
}
