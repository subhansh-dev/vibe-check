/**
 * PROMPT-ENGINEER.JS — Prompt engineering toolkit (no LLM required)
 * 
 * EXPORTED:
 *   applyTechnique(prompt, techniqueId) → string
 *   applyTechniques(prompt, techniqueIds[]) → string
 *   generateVariants(prompt) → { concise, detailed, creative }
 *   runChecklist(prompt) → [{ id, label, passed, fix }]
 *   getTechniques() → array
 *   getTechniqueById(id) → object
 *   createVersion(prompt, label) → object
 *   getVersions() → array
 *   getVersionsTree() → object
 *   clearVersions() → void
 *   undoLastVersion() → object|null
 */

// ============================================================
// TECHNIQUES — Each modifies the prompt in a specific way
// ============================================================

const TECHNIQUES = [
  {
    id: 'chain-of-thought',
    name: 'Chain of Thought',
    icon: '🔗',
    description: 'Ask the AI to reason step by step before answering',
    category: 'reasoning',
    apply: function(prompt) {
      if (/step by step|think through|reasoning/i.test(prompt)) return prompt;
      return prompt + '\n\nThink through this step by step before providing your final answer.';
    },
    preview: function(prompt) {
      return prompt + '\n\nThink through this step by step before providing your final answer.';
    }
  },
  {
    id: 'role-assignment',
    name: 'Role Assignment',
    icon: '👤',
    description: 'Assign an expert role to the AI for domain-specific responses',
    category: 'context',
    apply: function(prompt) {
      if (/you are a|act as|assume the role/i.test(prompt)) return prompt;
      var role = detectDomainRole(prompt);
      return 'You are ' + role + '.\n\n' + prompt;
    },
    preview: function(prompt) {
      var role = detectDomainRole(prompt);
      return 'You are ' + role + '.\n\n' + prompt;
    }
  },
  {
    id: 'output-format',
    name: 'Output Format',
    icon: '📋',
    description: 'Force a specific output structure (markdown, JSON, code blocks)',
    category: 'structure',
    apply: function(prompt) {
      if (/format.*response|respond.*format|output.*format|return.*json|use markdown/i.test(prompt)) return prompt;
      return prompt + '\n\nFormat your response with:\n- Clear headings for each section\n- Code blocks for any code\n- Bullet points for lists';
    },
    preview: function(prompt) {
      return prompt + '\n\nFormat your response with:\n- Clear headings for each section\n- Code blocks for any code\n- Bullet points for lists';
    }
  },
  {
    id: 'constraint-stacking',
    name: 'Constraint Stacking',
    icon: '🔒',
    description: 'Add specific limitations to narrow the AI\'s output',
    category: 'control',
    apply: function(prompt) {
      if (/constraint|limitation|must not|do not|only/i.test(prompt)) return prompt;
      return prompt + '\n\nConstraints:\n- Do not use placeholder code or comments like "// add more here"\n- Keep the solution production-ready\n- Avoid deprecated APIs or patterns';
    },
    preview: function(prompt) {
      return prompt + '\n\nConstraints:\n- Do not use placeholder code or comments like "// add more here"\n- Keep the solution production-ready\n- Avoid deprecated APIs or patterns';
    }
  },
  {
    id: 'few-shot',
    name: 'Few-Shot Examples',
    icon: '📝',
    description: 'Add input/output examples to guide the AI\'s behavior',
    category: 'context',
    apply: function(prompt) {
      if (/example|for instance|e\.g\.|input:|output:/i.test(prompt)) return prompt;
      return prompt + '\n\nExamples:\nInput: [describe a typical input]\nOutput: [show the expected result]\n\nInput: [describe an edge case]\nOutput: [show how to handle it]';
    },
    preview: function(prompt) {
      return prompt + '\n\nExamples:\nInput: [describe a typical input]\nOutput: [show the expected result]\n\nInput: [describe an edge case]\nOutput: [show how to handle it]';
    }
  },
  {
    id: 'self-reflection',
    name: 'Self-Reflection',
    icon: '🪞',
    description: 'Ask the AI to review and improve its own output',
    category: 'quality',
    apply: function(prompt) {
      if (/review|check your|verify|double.?check|refine/i.test(prompt)) return prompt;
      return prompt + '\n\nAfter generating your response, review it for:\n- Correctness and accuracy\n- Edge cases that might break\n- Performance implications\nThen provide the improved version.';
    },
    preview: function(prompt) {
      return prompt + '\n\nAfter generating your response, review it for:\n- Correctness and accuracy\n- Edge cases that might break\n- Performance implications\nThen provide the improved version.';
    }
  },
  {
    id: 'negative-prompting',
    name: 'Negative Prompting',
    icon: '🚫',
    description: 'Tell the AI what NOT to do to avoid common mistakes',
    category: 'control',
    apply: function(prompt) {
      if (/avoid|do not|don't|never|without/i.test(prompt)) return prompt;
      return prompt + '\n\nDo NOT:\n- Use any npm packages not explicitly mentioned\n- Include TypeScript "any" types\n- Add comments that just restate the code';
    },
    preview: function(prompt) {
      return prompt + '\n\nDo NOT:\n- Use any npm packages not explicitly mentioned\n- Include TypeScript "any" types\n- Add comments that just restate the code';
    }
  },
  {
    id: 'specificity-boost',
    name: 'Specificity Boost',
    icon: '🎯',
    description: 'Add concrete numbers, versions, and technical details',
    category: 'quality',
    apply: function(prompt) {
      var additions = [];
      if (!/\b(v?\d+\.\d+|version)\b/i.test(prompt)) {
        additions.push('- Specify exact versions of frameworks and libraries');
      }
      if (!/\b(px|rem|em|%|grid|flexbox)\b/i.test(prompt)) {
        additions.push('- Define specific measurements, breakpoints, or layouts');
      }
      if (!/\b(performance|speed|load time|latency)\b/i.test(prompt)) {
        additions.push('- Set performance targets (load time, bundle size)');
      }
      if (additions.length === 0) return prompt;
      return prompt + '\n\nBe specific about:\n' + additions.join('\n');
    },
    preview: function(prompt) {
      return prompt + '\n\nBe specific about:\n- Exact versions of frameworks\n- Measurements and breakpoints\n- Performance targets';
    }
  },
  {
    id: 'context-window',
    name: 'Context Window',
    icon: '🪟',
    description: 'Add surrounding context about the project, codebase, or environment',
    category: 'context',
    apply: function(prompt) {
      if (/project|codebase|existing|currently|my app|my site/i.test(prompt)) return prompt;
      return prompt + '\n\nProject context:\n- Framework: [your framework]\n- Existing codebase: [describe what exists]\n- Integration points: [what this connects to]';
    },
    preview: function(prompt) {
      return prompt + '\n\nProject context:\n- Framework: [your framework]\n- Existing codebase: [describe what exists]\n- Integration points: [what this connects to]';
    }
  },
  {
    id: 'success-criteria',
    name: 'Success Criteria',
    icon: '✅',
    description: 'Define what a "good" answer looks like for the AI',
    category: 'quality',
    apply: function(prompt) {
      if (/success|criteria|should look like|done when|complete when/i.test(prompt)) return prompt;
      return prompt + '\n\nSuccess criteria:\n- [What the final result should look like]\n- [What functionality must work]\n- [What edge cases must be handled]\n- [Quality standards to meet]';
    },
    preview: function(prompt) {
      return prompt + '\n\nSuccess criteria:\n- [What the final result should look like]\n- [What functionality must work]\n- [What edge cases must be handled]\n- [Quality standards to meet]';
    }
  },
  {
    id: 'temperature-guide',
    name: 'Temperature Hint',
    icon: '🌡️',
    description: 'Suggest the desired creativity level (strict vs creative)',
    category: 'control',
    apply: function(prompt) {
      if (/temperature|creative|strict|exact|precise|exact/i.test(prompt)) return prompt;
      return prompt + '\n\nResponse style: Be precise and follow the requirements exactly. Do not improvise or add features not requested.';
    },
    preview: function(prompt) {
      return prompt + '\n\nResponse style: Be precise and follow the requirements exactly. Do not improvise or add features not requested.';
    }
  },
  {
    id: 'chunking',
    name: 'Task Chunking',
    icon: '🧩',
    description: 'Break a complex request into numbered subtasks',
    category: 'structure',
    apply: function(prompt) {
      if (/step \d|first.*then|phase \d|numbered/i.test(prompt)) return prompt;
      var words = prompt.split(/\s+/).length;
      if (words < 30) return prompt; // only chunk complex prompts
      return prompt + '\n\nBreak your response into these ordered steps:\n1. [First component to build]\n2. [Second component]\n3. [Integration/testing]\n4. [Final polish]';
    },
    preview: function(prompt) {
      var words = prompt.split(/\s+/).length;
      if (words < 30) return prompt + '\n\n[Prompt too short for chunking — use for complex tasks]';
      return prompt + '\n\nBreak your response into these ordered steps:\n1. [First component]\n2. [Second component]\n3. [Integration]\n4. [Final polish]';
    }
  }
];

// ============================================================
// TECHNIQUE HELPERS
// ============================================================

function detectDomainRole(prompt) {
  var p = prompt.toLowerCase();
  if (/\b(react|next\.?js|vue|svelte|angular|frontend|component|jsx|tsx)\b/.test(p))
    return 'a senior frontend developer specializing in React and modern web frameworks';
  if (/\b(node|express|api|endpoint|backend|server|rest|graphql)\b/.test(p))
    return 'a senior backend developer with expertise in Node.js and API design';
  if (/\b(python|django|flask|fastapi|data|ml|machine learning)\b/.test(p))
    return 'a senior Python developer with expertise in web frameworks and data processing';
  if (/\b(database|sql|postgres|mongo|schema|migration)\b/.test(p))
    return 'a database architect with expertise in schema design and query optimization';
  if (/\b(css|style|design|ui|ux|layout|responsive|animation)\b/.test(p))
    return 'a UI/UX engineer with expertise in modern CSS and responsive design';
  if (/\b(test|jest|cypress|playwright|e2e|unit test)\b/.test(p))
    return 'a QA engineer with expertise in automated testing and test-driven development';
  if (/\b(devops|deploy|docker|ci\/cd|aws|cloud|infrastructure)\b/.test(p))
    return 'a DevOps engineer with expertise in cloud infrastructure and CI/CD pipelines';
  if (/\b(security|auth|authentication|encryption|vulnerability)\b/.test(p))
    return 'a security engineer with expertise in authentication systems and secure coding practices';
  return 'a senior full-stack developer with 10+ years of experience building production applications';
}

function getTechniques() {
  return TECHNIQUES;
}

function getTechniqueById(id) {
  return TECHNIQUES.find(function(t) { return t.id === id; }) || null;
}

function applyTechnique(prompt, techniqueId) {
  var tech = getTechniqueById(techniqueId);
  if (!tech) return prompt;
  return tech.apply(prompt);
}

function applyTechniques(prompt, techniqueIds) {
  var result = prompt;
  techniqueIds.forEach(function(id) {
    result = applyTechnique(result, id);
  });
  return result;
}

// ============================================================
// VARIANT GENERATION — 3 rule-based variations
// ============================================================

function generateVariants(prompt) {
  return {
    concise: generateConcise(prompt),
    detailed: generateDetailed(prompt),
    creative: generateCreative(prompt)
  };
}

function generateConcise(prompt) {
  var lines = prompt.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
  var core = [];
  var seenSections = {};
  lines.forEach(function(line) {
    // Keep action lines
    if (/^(build|create|make|fix|add|implement|design|generate)/i.test(line)) {
      core.push(line);
      return;
    }
    // Keep bullet points (they're specific requirements)
    if (/^[•\-*]\s|^\d+\.\s/.test(line)) {
      core.push(line);
      return;
    }
    // Keep section headers
    if (/^\*\*.*\*\*$/.test(line) || /^#{1,3}\s/.test(line)) {
      var section = line.replace(/[*#]/g, '').trim().toLowerCase();
      if (!seenSections[section]) {
        seenSections[section] = true;
        core.push(line);
      }
      return;
    }
    // Keep short specific lines
    if (line.length < 60 && /\b(specific|exact|must|should|include)\b/i.test(line)) {
      core.push(line);
    }
  });
  if (core.length < 2) {
    // Too aggressive stripping — just remove filler
    return prompt
      .replace(/\b(please|kindly|I would like|I want you to|can you|if possible|it would be great)\b/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  return core.join('\n');
}

function generateDetailed(prompt) {
  var sections = [];
  var hasStack = /\b(react|vue|next|tailwind|typescript|python|node)\b/i.test(prompt);
  var hasStyle = /\b(dark|light|minimal|modern|clean|responsive)\b/i.test(prompt);
  var hasConstraints = /\b(fast|accessible|mobile|performant|secure)\b/i.test(prompt);
  var hasFormat = /\b(component|page|function|api|app)\b/i.test(prompt);
  
  sections.push(prompt);
  
  if (!hasStack) {
    sections.push('\n**Technical Requirements:**');
    sections.push('- Framework: [specify your framework and version]');
    sections.push('- Language: [TypeScript / JavaScript]');
    sections.push('- Styling: [Tailwind / CSS Modules / styled-components]');
  }
  if (!hasStyle) {
    sections.push('\n**Design Specifications:**');
    sections.push('- Visual style: modern, clean interface');
    sections.push('- Color scheme: [dark/light] theme with [accent color]');
    sections.push('- Typography: system fonts or [specific font]');
    sections.push('- Spacing: consistent padding and margins');
  }
  if (!hasConstraints) {
    sections.push('\n**Requirements:**');
    sections.push('- Responsive: works on mobile, tablet, and desktop');
    sections.push('- Accessible: proper ARIA labels and keyboard navigation');
    sections.push('- Performance: fast initial load, no layout shifts');
  }
  if (!hasFormat) {
    sections.push('\n**Expected Output:**');
    sections.push('- Complete, working code (no placeholders)');
    sections.push('- File structure clearly organized');
    sections.push('- Brief explanation of key decisions');
  }
  
  return sections.join('\n');
}

function generateCreative(prompt) {
  var parts = [];
  
  // Add a creative framing
  parts.push(prompt);
  parts.push('');
  parts.push('**Additional context to consider:**');
  parts.push('- The end user may not be technical — prioritize intuitive UX');
  parts.push('- Consider edge cases: empty states, loading states, error states');
  parts.push('- Think about progressive enhancement — core features work without JS');
  parts.push('- Include subtle micro-interactions where they improve the experience');
  
  // If it mentions a specific feature, suggest related features
  if (/dashboard/i.test(prompt)) {
    parts.push('- Consider adding: data export, date range filters, chart tooltips');
  }
  if (/form/i.test(prompt)) {
    parts.push('- Consider adding: field validation feedback, loading spinner on submit, success toast');
  }
  if (/landing/i.test(prompt)) {
    parts.push('- Consider adding: social proof section, FAQ accordion, email capture');
  }
  if (/auth|login|signup/i.test(prompt)) {
    parts.push('- Consider adding: social login, password strength meter, "remember me"');
  }
  if (/chat|messaging/i.test(prompt)) {
    parts.push('- Consider adding: typing indicators, read receipts, message reactions');
  }
  
  return parts.join('\n');
}

// ============================================================
// QUALITY CHECKLIST — Scans for anti-patterns
// ============================================================

function runChecklist(prompt) {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return [];
  }
  
  var checks = [
    {
      id: 'has-role',
      label: 'Role or persona defined',
      test: function(p) { return /\b(you are|act as|assume|role|persona)\b/i.test(p); },
      fix: 'Add a role: "You are a senior [language] developer..."'
    },
    {
      id: 'has-task',
      label: 'Clear task or objective',
      test: function(p) { return /\b(build|create|make|fix|add|implement|design|write|generate|refactor)\b/i.test(p); },
      fix: 'Start with a clear verb: "Build a...", "Fix the...", "Create a..."'
    },
    {
      id: 'has-tech-stack',
      label: 'Tech stack specified',
      test: function(p) { return /\b(react|vue|next|svelte|angular|tailwind|typescript|python|node|express|django)\b/i.test(p); },
      fix: 'Mention your framework: "Using React 18 with TypeScript and Tailwind CSS"'
    },
    {
      id: 'has-output-format',
      label: 'Output format defined',
      test: function(p) { return /\b(component|page|function|api|module|file|class|hook|service)\b/i.test(p); },
      fix: 'Specify the output: "as a reusable React component", "as an API endpoint"'
    },
    {
      id: 'has-constraints',
      label: 'Constraints or requirements listed',
      test: function(p) { return /\b(must|should|need|require|constraint|limitation|responsive|accessible|performant)\b/i.test(p); },
      fix: 'Add constraints: "Must be responsive", "Should handle empty states"'
    },
    {
      id: 'has-structure',
      label: 'Structured with sections or bullets',
      test: function(p) { return /(\n\s*[-•*]\s|\n\s*\d+\.\s|\n\s*\*\*|\n\s*#{1,3}\s)/.test(p); },
      fix: 'Use bullet points or numbered lists to organize requirements'
    },
    {
      id: 'no-vague-words',
      label: 'Free of vague language',
      test: function(p) { return !/\b(something|stuff|things|nice|cool|good|better|appropriate|suitable)\b/i.test(p); },
      fix: 'Replace vague words: "nice" → "modern with 8px border-radius", "cool" → "glassmorphism effect"'
    },
    {
      id: 'no-filler',
      label: 'No filler or politeness overhead',
      test: function(p) { return !/\b(please help|I would like|can you|if possible|thank you|I really appreciate)\b/i.test(p); },
      fix: 'Remove filler: "Please help me build" → "Build"'
    },
    {
      id: 'has-edge-cases',
      label: 'Edge cases mentioned',
      test: function(p) { return /\b(edge case|empty state|loading|error|fallback|default|placeholder|validation|invalid)\b/i.test(p); },
      fix: 'Add edge cases: "Handle empty states", "Show loading indicators", "Validate input"'
    },
    {
      id: 'has-scope',
      label: 'Scope is bounded (not open-ended)',
      test: function(p) {
        var words = p.split(/\s+/).length;
        return words < 500; // extremely long prompts are usually unfocused
      },
      fix: 'Keep it focused — if over 500 words, consider splitting into multiple prompts'
    },
    {
      id: 'no-contradictions',
      label: 'No contradictions detected',
      test: function(p) {
        var lower = p.toLowerCase();
        // Check for common contradictions
        if (/\bminim/i.test(lower) && /\bdetail/i.test(lower) && !/minimal.*detail|detail.*minimal/i.test(lower)) return false;
        if (/\bsimple\b/i.test(lower) && /\bcomplex\b/i.test(lower)) return false;
        return true;
      },
      fix: 'Resolve contradictions: "minimal" and "detailed" conflict — pick one direction'
    },
    {
      id: 'has-version',
      label: 'Framework version specified',
      test: function(p) { return /\b(v?\d+\.\d+|version|latest|stable)\b/i.test(p) || !/\b(react|vue|next|angular|svelte)\b/i.test(p); },
      fix: 'Specify versions: "Next.js 14 with App Router", "React 18.3"'
    }
  ];
  
  return checks.map(function(check) {
    return {
      id: check.id,
      label: check.label,
      passed: check.test(prompt),
      fix: check.fix
    };
  });
}

// ============================================================
// ITERATIVE VERSION HISTORY
// ============================================================

var _versions = [];
var _currentBranchId = null;

function createVersion(prompt, label) {
  var version = {
    id: 'v_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    prompt: prompt,
    label: label || 'Version ' + (_versions.length + 1),
    timestamp: Date.now(),
    parentId: _currentBranchId,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
    charCount: prompt.length
  };
  _versions.push(version);
  _currentBranchId = version.id;
  return version;
}

function getVersions() {
  return _versions.slice();
}

function getVersionsTree() {
  return {
    versions: _versions.slice(),
    currentId: _currentBranchId,
    count: _versions.length
  };
}

function clearVersions() {
  _versions = [];
  _currentBranchId = null;
}

function undoLastVersion() {
  if (_versions.length === 0) return null;
  var removed = _versions.pop();
  _currentBranchId = _versions.length > 0 ? _versions[_versions.length - 1].id : null;
  return removed;
}

function restoreVersion(versionId) {
  var v = _versions.find(function(ver) { return ver.id === versionId; });
  if (v) _currentBranchId = v.id;
  return v || null;
}
