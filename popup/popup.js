/**
 * POPUP.JS — Main popup controller for Vibe Check extension
 * 
 * This is the LAST script loaded. It orchestrates all other modules.
 * 
 * REQUIRED ELEMENT IDS (popup.html must have these):
 * #tab-enhance, #tab-templates, #tab-history — tab buttons
 * #panel-enhance, #panel-templates, #panel-engineer, #panel-history — tab content panels
 * #prompt-input — main textarea
 * #word-count — word/char count display
 * #btn-enhance — enhance button
 * #ai-toggle — AI/Local toggle pill
 * #btn-undo — undo button
 * #stack-badge — stack detection badge
 * #stack-tips — expandable tips container
 * #score-display — score section (hidden by default)
 * #score-number — the big score number
 * #score-label — "Good", "Excellent", etc.
 * #score-bars — category breakdown container
 * #score-feedback — feedback lines container
 * #enhanced-area — enhanced text display (hidden by default)
 * #enhanced-text — the actual enhanced text element
 * #btn-copy-enhanced — copy button for enhanced text
 * #improvements-list — list of improvements made
 * #before-after — before/after split view container
 * #before-text — original text in before/after
 * #after-text — enhanced text in before/after
 * #btn-copy-before — copy before button
 * #btn-copy-after — copy after button
 * #changes-list — list of changes in before/after
 * #token-efficiency — token efficiency section
 * #efficiency-ring — circular progress ring
 * #efficiency-pct — percentage text
 * #filler-list — list of filler phrases
 * #btn-strip-filler — strip filler button
 * #templates-category-tabs — category tab container
 * #templates-grid — template cards container
 * #history-search — search input
 * #history-list — history entries container
 * #btn-clear-history — clear all button
 * #settings-btn — settings gear button
 * #settings-modal — settings overlay
 * #settings-close — settings close button
 * #toast-container — toast notification container
 * #tip-text — tip carousel text
 * #tip-prev, #tip-next — tip arrow buttons
 */

(function() {
  'use strict';

  const TIPS = [
    'Tip: Specify your framework and version for better results',
    'Tip: Include responsive design requirements in every UI prompt',
    'Tip: Use bullet points to list features \u2014 AIs parse lists better',
    'Tip: Mention the exact component library you want (shadcn, MUI, etc.)',
    'Tip: Describe your color scheme \u2014 "dark theme" is not specific enough',
    'Tip: Include error-prone edge cases in your requirements',
    'Tip: Specify the output format (component, page, full app, API)',
    'Tip: Mention TypeScript for type-safe code generation',
    'Tip: Include performance and accessibility requirements',
    'Tip: Reference existing code or files for context-aware results',
    'Tip: Use "modern" and "clean" for better styling results',
    'Tip: Break complex prompts into smaller sequential requests'
  ];

  let currentStack = null;
  let lastResult = null;
  let undoStack = [];
  let redoStack = [];
  let tipInterval = null;
  let currentTipIndex = 0;
  let settings = {};

  const $ = function(id) { return document.getElementById(id); };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    loadSettings();
    initTabs();
    initTextarea();
    initEnhanceButton();
    initUndoButton();
    initCopyButtons();
    initStripFiller();
    initTemplateCategories();
    initEngineer();
    initHistory();
    initSettings();
    initTipCarousel();
    initKeyboardShortcuts();
    initStackDetection();
    initPasteDetection();
    initEfficiencyToggle();
  }

  async function loadSettings() {
    try {
      settings = await getSettings();
    } catch (e) {
      settings = {};
    }
  }

  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
        var panel = $('panel-' + btn.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  function initTextarea() {
    var input = $('prompt-input');
    if (!input) return;
    input.addEventListener('input', function() {
      updateWordCount();
      updateComplexityBadge();
      var val = input.value.trim();
      $('btn-enhance').disabled = val.length === 0;
    });
    // Tab between template bracket fields [LIKE_THIS]
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Tab' && !e.ctrlKey) {
        var text = input.value;
        var pos = input.selectionStart;
        // Find next bracket field after cursor
        var nextOpen = text.indexOf('[', pos);
        if (nextOpen === -1) nextOpen = text.indexOf('[', 0); // wrap around
        if (nextOpen >= 0) {
          var nextClose = text.indexOf(']', nextOpen);
          if (nextClose >= 0) {
            e.preventDefault();
            input.setSelectionRange(nextOpen + 1, nextClose);
            input.focus();
          }
        }
      }
    });
  }

  function updateWordCount() {
    var input = $('prompt-input');
    var count = $('word-count');
    if (!input || !count) return;
    var text = input.value;
    var words = text.trim() ? text.trim().split(/\s+/).length : 0;
    var chars = text.length;
    count.textContent = words + ' words \u00B7 ' + chars + ' characters';
    if (chars > 4800) count.style.color = 'var(--accent-crimson)';
    else if (chars > 4000) count.style.color = 'var(--accent-amber)';
    else count.style.color = '';
  }

  function updateComplexityBadge() {
    var input = $('prompt-input');
    var badge = $('complexity-badge');
    if (!input || !badge) return;
    var text = input.value.trim();
    if (!text) { badge.classList.add('hidden'); return; }
    var words = text.split(/\s+/).length;
    var hasTech = FRAMEWORKS && FRAMEWORKS.test(text);
    var hasBullets = /[•\-*]\s|\d+\.\s/.test(text);
    var hasSections = /\n\s*\n/.test(text);
    var score = 0;
    if (words > 50) score += 2;
    else if (words > 20) score += 1;
    if (hasTech) score += 1;
    if (hasBullets) score += 1;
    if (hasSections) score += 1;
    badge.className = 'complexity-badge';
    if (score >= 4) { badge.textContent = 'Detailed'; badge.classList.add('detailed'); }
    else if (score >= 2) { badge.textContent = 'Moderate'; badge.classList.add('moderate'); }
    else { badge.textContent = 'Simple'; badge.classList.add('simple'); }
    badge.classList.remove('hidden');
  }

  function initEnhanceButton() {
    var btn = $('btn-enhance');
    if (!btn) return;
    btn.addEventListener('click', doEnhance);
  }

  async function doEnhance() {
    var input = $('prompt-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    var btn = $('btn-enhance');
    btn.classList.add('loading');
    btn.disabled = true;
    var enhancedText = text;
    var improvements = [];
    var detectedType = 'build';
    try {
      // Try AI enhancement first
      try {
        var aiResult = await callAIEnhance(text);
        enhancedText = aiResult.enhanced || text;
        improvements = ['AI-enhanced prompt'];
        detectedType = detectPromptType(text);
      } catch (aiErr) {
        // AI failed — fall back to local
        if (typeof enhancePrompt === 'function') {
          var localResult = enhancePrompt(text, currentStack);
          enhancedText = localResult.enhanced || text;
          improvements = localResult.improvements || [];
          detectedType = localResult.detectedType || 'build';
        }
      }
      // Always score
      var scoreResult = typeof scorePrompt === 'function' ? scorePrompt(text, currentStack) : { total: 50, label: 'Okay', color: '#C4A265', categories: {}, suggestions: [] };
      lastResult = {
        original: text,
        enhanced: enhancedText,
        score: scoreResult.total,
        improvements: improvements,
        detectedType: detectedType
      };
      undoStack.push(text);
      redoStack = [];
      displayResult(text, enhancedText, scoreResult);
      saveToHistory(text, enhancedText, scoreResult.total, { type: detectedType, stack: currentStack ? currentStack.id : null });
    } catch (err) {
      showToast('Error: ' + err.message, 'crimson');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  function callAIEnhance(prompt) {
    // Always try the Vercel serverless proxy first (works in browser & extension)
    var vercelUrl = 'https://vibe-check-vert-theta.vercel.app/api/enhance';
    return fetch(vercelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt })
    }).then(function(res) {
      if (!res.ok) throw new Error('API error: ' + res.status);
      return res.json();
    }).catch(function(vercelErr) {
      // Vercel failed — try Cerebras direct if API key exists
      if (settings.apiKey) {
        return fetch('https://api.cerebras.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + settings.apiKey
          },
          body: JSON.stringify({
            model: 'gpt-oss-120b',
            messages: [
              { role: 'system', content: 'You are a prompt engineering assistant for AI coding tools. Take this prompt and make it more specific, structured, and effective. Add missing context: tech stack, design requirements, constraints, and expected output format. Keep the original intent. Return ONLY the enhanced prompt, no explanation.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7
          })
        }).then(function(res) {
          if (!res.ok) throw new Error('API error: ' + res.status);
          return res.json();
        }).then(function(data) {
          var enhanced = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
          if (!enhanced) throw new Error('Empty response');
          return { enhanced: enhanced.trim(), score: 50, improvements: ['AI-enhanced prompt'] };
        });
      }
      // No fallback available
      return Promise.reject(vercelErr);
    });
  }

  function displayResult(original, enhanced, scoreResult) {
    displayScore(scoreResult);
    displayEnhanced(original, enhanced);
    if (settings.showBeforeAfter !== false) displayBeforeAfter(original, enhanced);
    if (settings.showTokenEfficiency !== false) displayTokenEfficiency(original);
    updateRedoVisibility();
    showToast('Prompt enhanced', 'cyan');
  }

  function displayScore(score) {
    var display = $('score-display');
    var num = $('score-number');
    var label = $('score-label');
    var bars = $('score-bars');
    var feedback = $('score-feedback');
    if (!display || !num || !label || !bars || !feedback) return;
    display.classList.remove('hidden');
    num.style.color = score.color;
    label.textContent = score.label;
    label.style.color = score.color;
    bars.innerHTML = '';
    feedback.innerHTML = '';
    var catKeys = ['clarity', 'specificity', 'completeness', 'structure', 'effectiveness'];
    var catLabels = ['Clarity', 'Specificity', 'Completeness', 'Structure', 'Effectiveness'];
    catKeys.forEach(function(key, i) {
      var cat = score.categories[key];
      if (!cat) return;
      var pct = (cat.score / 20) * 100;
      var barColor = pct >= 80 ? '#C4A265' : pct >= 60 ? '#8B7355' : pct >= 40 ? '#C4A265' : pct >= 20 ? '#9A7A50' : '#B85450';
      var row = document.createElement('div');
      row.className = 'score-bar-row';
      row.innerHTML = '<span class="score-bar-label">' + catLabels[i] + '</span>' +
        '<div class="score-bar-track"><div class="score-bar-fill" style="background:' + barColor + '"></div></div>' +
        '<span class="score-bar-value">' + cat.score + '/20</span>';
      bars.appendChild(row);
      setTimeout(function() {
        var fill = row.querySelector('.score-bar-fill');
        if (fill) fill.style.width = pct + '%';
      }, 100 + i * 100);
    });
    var targetScore = score.total;
    animateNumber(num, 0, targetScore, 500);
    (score.suggestions || []).forEach(function(s) {
      var item = document.createElement('div');
      item.className = 'score-feedback-item';
      item.textContent = '+ ' + s;
      feedback.appendChild(item);
    });
  }

  function animateNumber(el, from, to, duration) {
    var start = performance.now();
    function step(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function displayEnhanced(original, enhanced) {
    var area = $('enhanced-area');
    var text = $('enhanced-text');
    var improvements = $('improvements-list');
    if (!area || !text || !improvements) return;
    area.classList.remove('hidden');
    text.textContent = enhanced;
    improvements.innerHTML = '';
    var imps = lastResult ? lastResult.improvements : [];
    imps.forEach(function(imp, i) {
      var item = document.createElement('div');
      item.className = 'improvement-item';
      item.textContent = imp;
      improvements.appendChild(item);
      setTimeout(function() {
        item.classList.add('visible');
      }, 100 + i * 100);
    });
  }

  function displayBeforeAfter(original, enhanced) {
    var container = $('before-after');
    var before = $('before-text');
    var after = $('after-text');
    var changes = $('changes-list');
    if (!container || !before || !after || !changes) return;
    container.classList.remove('hidden');
    before.textContent = original;
    after.textContent = enhanced;
    changes.innerHTML = '';
    var imps = lastResult ? lastResult.improvements : [];
    imps.forEach(function(imp) {
      var item = document.createElement('div');
      item.className = 'change-item';
      item.textContent = imp;
      changes.appendChild(item);
    });
  }

  function displayTokenEfficiency(text) {
    var section = $('token-efficiency');
    var pct = $('efficiency-pct');
    var ring = $('efficiency-ring');
    var ringPct = $('ring-percent');
    var fillerCount = $('filler-count');
    var fillerList = $('filler-list');
    if (!section || !pct || !ring || !ringPct || !fillerCount || !fillerList) return;
    var analysis = analyzeTokenEfficiency(text);
    section.classList.remove('hidden');
    pct.textContent = '[' + analysis.efficiency + '% efficient]';
    ringPct.textContent = analysis.efficiency + '%';
    var offset = 163.36 - (163.36 * analysis.efficiency / 100);
    ring.style.strokeDashoffset = offset;
    var color = analysis.efficiency > 70 ? '#C4A265' : analysis.efficiency > 40 ? '#C4A265' : '#B85450';
    ring.style.stroke = color;
    ringPct.style.color = color;
    fillerCount.textContent = analysis.fillerWords + ' words of filler detected';
    fillerList.innerHTML = '';
    analysis.fillerBreakdown.forEach(function(item) {
      var li = document.createElement('li');
      li.textContent = '"' + item.phrase + '"';
      fillerList.appendChild(li);
    });
  }

  function initUndoButton() {
    var btn = $('btn-undo');
    if (btn) {
      btn.addEventListener('click', doUndo);
    }
    var redoBtn = $('btn-redo');
    if (redoBtn) {
      redoBtn.addEventListener('click', doRedo);
    }
  }

  function doUndo() {
    if (undoStack.length > 0) {
      var input = $('prompt-input');
      var current = input.value;
      redoStack.push(current);
      input.value = undoStack.pop();
      updateWordCount();
      updateComplexityBadge();
      $('btn-enhance').disabled = input.value.trim().length === 0;
      updateRedoVisibility();
      showToast('Undone', 'cyan');
    }
  }

  function doRedo() {
    if (redoStack.length > 0) {
      var input = $('prompt-input');
      var current = input.value;
      undoStack.push(current);
      input.value = redoStack.pop();
      updateWordCount();
      updateComplexityBadge();
      $('btn-enhance').disabled = input.value.trim().length === 0;
      updateRedoVisibility();
      showToast('Redone', 'cyan');
    }
  }

  function updateRedoVisibility() {
    var redoBtn = $('btn-redo');
    if (redoBtn) {
      if (redoStack.length > 0) redoBtn.classList.remove('hidden');
      else redoBtn.classList.add('hidden');
    }
    var undoBtn = $('btn-undo');
    if (undoBtn) {
      if (undoStack.length > 0) undoBtn.classList.remove('hidden');
      else undoBtn.classList.add('hidden');
    }
  }

  function initCopyButtons() {
    var btns = document.querySelectorAll('.btn-copy, .btn-copy-sm');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var target = btn.dataset.target || btn.closest('.split-col') || btn.closest('.enhanced-area');
        var textEl = target ? target.querySelector('.split-text, .enhanced-text') : null;
        var text = '';
        if (btn.id === 'btn-copy-enhanced') text = $('enhanced-text') ? $('enhanced-text').textContent : '';
        else if (btn.id === 'btn-copy-before') text = $('before-text') ? $('before-text').textContent : '';
        else if (btn.id === 'btn-copy-after') text = $('after-text') ? $('after-text').textContent : '';
        if (text) copyToClipboard(text, btn);
      });
    });
  }

  function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('Copied to clipboard', 'cyan');
      if (btn) {
        var orig = btn.innerHTML;
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.classList.add('copied');
        setTimeout(function() {
          btn.innerHTML = orig;
          btn.classList.remove('copied');
        }, 1500);
      }
    }).catch(function() {
      showToast('Failed to copy', 'crimson');
    });
  }

  function initStripFiller() {
    var btn = $('btn-strip-filler');
    if (!btn) return;
    btn.addEventListener('click', function() {
      var input = $('prompt-input');
      if (!input) return;
      var analysis = analyzeTokenEfficiency(input.value);
      if (analysis.strippedPrompt) {
        input.value = analysis.strippedPrompt;
        updateWordCount();
        showToast('Filler stripped', 'cyan');
      }
    });
  }

  function initTemplateCategories() {
    var container = $('templates-category-tabs');
    if (!container) return;
    container.addEventListener('click', function(e) {
      var btn = e.target.closest('.template-cat-btn');
      if (!btn) return;
      container.querySelectorAll('.template-cat-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderTemplates(btn.dataset.category);
    });
    renderTemplates('ui-components');

    // Template search
    var searchInput = $('template-search');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        var query = this.value.trim().toLowerCase();
        var activeBtn = container.querySelector('.template-cat-btn.active');
        var category = activeBtn ? activeBtn.dataset.category : 'ui-components';
        renderTemplates(category, query);
      });
    }
  }

  function renderTemplates(category, searchQuery) {
    var grid = $('templates-grid');
    if (!grid) return;
    grid.innerHTML = '';
    var templates = getTemplatesByCategory(category);
    if (searchQuery) {
      templates = templates.filter(function(t) {
        return t.name.toLowerCase().includes(searchQuery) || t.preview.toLowerCase().includes(searchQuery) || t.template.toLowerCase().includes(searchQuery);
      });
    }
    if (templates.length === 0) {
      grid.innerHTML = '<div class="empty-state small" style="grid-column:1/-1"><p>No templates match your search</p></div>';
      return;
    }
    templates.forEach(function(t) {
      var card = document.createElement('div');
      card.className = 'template-card';
      var tagMap = {'ui-components': 'UI', 'full-apps': 'APP', 'fixes': 'FIX', 'api-backend': 'API', 'ai-prompts': 'AI'};
      var tag = tagMap[t.category] || '';
      card.innerHTML = '<div class="template-card-name">' + t.name + '</div><div class="template-card-preview">' + t.preview + '</div>' + (tag ? '<span class="template-card-tag">' + tag + '</span>' : '');
      card.addEventListener('click', function() {
        var input = $('prompt-input');
        if (input) input.value = t.template;
        updateWordCount();
        updateComplexityBadge();
        document.querySelector('.tab-btn[data-tab="enhance"]').click();
        if (input) {
          input.focus();
          // Find first bracket field and select it for easy editing
          var firstBracket = input.value.indexOf('[');
          if (firstBracket >= 0) {
            var closeBracket = input.value.indexOf(']', firstBracket);
            if (closeBracket >= 0) {
              input.setSelectionRange(firstBracket + 1, closeBracket);
            } else {
              input.setSelectionRange(firstBracket + 1, firstBracket + 1);
            }
          }
        }
        var fieldCount = (t.template.match(/\[[A-Z_/]+\]/g) || []).length;
        showToast('Template loaded — fill in ' + fieldCount + ' fields (Tab between them)', 'cyan');
      });
      grid.appendChild(card);
    });
  }

  // ============================================================
  // ENGINEER TAB
  // ============================================================

  function initEngineer() {
    var input = $('engineer-input');
    if (input) {
      input.addEventListener('input', function() {
        updateEngineerWordCount();
        renderChecklist();
      });
    }

    var fromEnhance = $('btn-engineer-from-enhance');
    if (fromEnhance) {
      fromEnhance.addEventListener('click', function() {
        if (lastResult && lastResult.enhanced) {
          var inp = $('engineer-input');
          if (inp) {
            inp.value = lastResult.enhanced;
            updateEngineerWordCount();
            renderChecklist();
            renderTechniques();
            showToast('Loaded last enhanced prompt', 'cyan');
          }
        } else {
          showToast('No enhanced prompt yet — enhance one first', 'amber');
        }
      });
    }

    var applyBtn = $('btn-apply-techniques');
    if (applyBtn) {
      applyBtn.addEventListener('click', handleApplyTechniques);
    }

    var variantBtn = $('btn-generate-variants');
    if (variantBtn) {
      variantBtn.addEventListener('click', handleGenerateVariants);
    }

    var saveBtn = $('btn-save-version');
    if (saveBtn) {
      saveBtn.addEventListener('click', handleSaveVersion);
    }

    var clearBtn = $('btn-clear-versions');
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        if (confirm('Clear all versions?')) {
          clearVersions();
          saveEngineerVersions();
          renderVersions();
          showToast('Versions cleared', 'amber');
        }
      });
    }

    renderTechniques();
    loadEngineerVersions().then(function() {
      renderVersions();
    });
  }

  function updateEngineerWordCount() {
    var input = $('engineer-input');
    var count = $('engineer-word-count');
    if (!input || !count) return;
    var text = input.value;
    var words = text.trim() ? text.trim().split(/\s+/).length : 0;
    var chars = text.length;
    count.textContent = words + ' words \u00B7 ' + chars + ' characters';
    if (chars > 4800) count.style.color = 'var(--accent-crimson)';
    else if (chars > 4000) count.style.color = 'var(--accent-amber)';
    else count.style.color = '';
  }

  function renderChecklist() {
    var input = $('engineer-input');
    var grid = $('checklist-grid');
    var scoreEl = $('checklist-score');
    if (!input || !grid) return;
    var text = input.value.trim();
    if (!text) {
      grid.innerHTML = '<div class="empty-state small"><p>Type a prompt to run the quality check</p></div>';
      if (scoreEl) scoreEl.textContent = '';
      return;
    }
    var results = runChecklist(text);
    var passed = results.filter(function(r) { return r.passed; }).length;
    var total = results.length;
    if (scoreEl) {
      scoreEl.textContent = passed + '/' + total + ' passed';
      scoreEl.style.color = passed >= total * 0.8 ? 'var(--accent-primary)' : passed >= total * 0.5 ? 'var(--accent-amber)' : 'var(--accent-crimson)';
    }
    grid.innerHTML = '';
    results.forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'checklist-item ' + (item.passed ? 'passed' : 'failed');
      el.innerHTML = '<span class="checklist-icon">' + (item.passed ? '\u2713' : '\u2717') + '</span>' +
        '<span class="checklist-label">' + item.label + '</span>' +
        (item.passed ? '' : '<span class="checklist-fix" title="' + escapeHtml(item.fix) + '">' + item.fix + '</span>');
      grid.appendChild(el);
    });
  }

  function renderTechniques() {
    var grid = $('techniques-grid');
    if (!grid) return;
    grid.innerHTML = '';
    var techs = getTechniques();
    techs.forEach(function(tech) {
      var card = document.createElement('div');
      card.className = 'technique-card';
      card.dataset.id = tech.id;
      card.innerHTML = '<div class="technique-check"></div>' +
        '<div class="technique-info">' +
          '<div class="technique-name">' + tech.name + '</div>' +
          '<div class="technique-desc">' + tech.description + '</div>' +
          '<div class="technique-preview">+ ' + tech.preview('...').split('\n').slice(0, 3).join('\n+ ') + '</div>' +
        '</div>';
      card.addEventListener('click', function() {
        card.classList.toggle('selected');
      });
      grid.appendChild(card);
    });
  }

  // Persist engineer versions to chrome.storage.local
  async function loadEngineerVersions() {
    try {
      var result = await chrome.storage.local.get(['vibe_check_versions']);
      if (result['vibe_check_versions']) {
        var data = result['vibe_check_versions'];
        // Restore into the prompt-engineer module's state
        if (data.versions && Array.isArray(data.versions)) {
          clearVersions();
          data.versions.forEach(function(v) {
            createVersion(v.prompt, v.label);
          });
        }
      }
    } catch (e) {
      // silent
    }
  }

  async function saveEngineerVersions() {
    try {
      var tree = getVersionsTree();
      await chrome.storage.local.set({ 'vibe_check_versions': tree });
    } catch (e) {
      // silent
    }
  }

  function handleApplyTechniques() {
    var input = $('engineer-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) {
      showToast('Type a prompt first', 'amber');
      return;
    }
    var selected = [];
    document.querySelectorAll('.technique-card.selected').forEach(function(card) {
      selected.push(card.dataset.id);
    });
    if (selected.length === 0) {
      showToast('Select at least one technique', 'amber');
      return;
    }
    var result = applyTechniques(text, selected);
    input.value = result;
    updateEngineerWordCount();
    renderChecklist();
    // Deselect all
    document.querySelectorAll('.technique-card.selected').forEach(function(card) {
      card.classList.remove('selected');
    });
    showToast(selected.length + ' technique' + (selected.length > 1 ? 's' : '') + ' applied', 'cyan');
  }

  function handleGenerateVariants() {
    var input = $('engineer-input');
    var container = $('variants-container');
    if (!input || !container) return;
    var text = input.value.trim();
    if (!text) {
      showToast('Type a prompt first', 'amber');
      return;
    }
    var variants = generateVariants(text);
    container.innerHTML = '';
    ['concise', 'detailed', 'creative'].forEach(function(type) {
      var variant = variants[type];
      var card = document.createElement('div');
      card.className = 'variant-card';
      var label = type.charAt(0).toUpperCase() + type.slice(1);
      var desc = type === 'concise' ? 'Stripped to essentials' : type === 'detailed' ? 'Added structure and specs' : 'Added context and suggestions';
      card.innerHTML = '<div class="variant-header">' +
          '<span class="variant-label">' + label + '</span>' +
          '<span class="variant-badge ' + type + '">' + desc + '</span>' +
        '</div>' +
        '<pre class="variant-text">' + escapeHtml(variant) + '</pre>' +
        '<div class="variant-actions">' +
          '<button class="btn-outline btn-small" data-action="use">Use This</button>' +
          '<button class="btn-outline btn-small" data-action="copy">Copy</button>' +
          '<button class="btn-outline btn-small" data-action="enhance">Enhance It</button>' +
        '</div>';
      // Wire up buttons
      card.querySelector('[data-action="use"]').addEventListener('click', function() {
        input.value = variant;
        updateEngineerWordCount();
        renderChecklist();
        showToast('Applied ' + label + ' variant', 'cyan');
      });
      card.querySelector('[data-action="copy"]').addEventListener('click', function() {
        copyToClipboard(variant, this);
      });
      card.querySelector('[data-action="enhance"]').addEventListener('click', function() {
        // Switch to enhance tab with this text
        var enhanceInput = $('prompt-input');
        if (enhanceInput) {
          enhanceInput.value = variant;
          updateWordCount();
          document.querySelector('.tab-btn[data-tab="enhance"]').click();
          showToast('Switched to Enhance — hit the button!', 'cyan');
        }
      });
      container.appendChild(card);
    });
    showToast('3 variants generated', 'cyan');
  }

  function handleSaveVersion() {
    var input = $('engineer-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) {
      showToast('Nothing to save', 'amber');
      return;
    }
    var label = 'Version ' + (getVersions().length + 1);
    var v = createVersion(text, label);
    saveEngineerVersions();
    renderVersions();
    showToast('Saved ' + label, 'cyan');
  }

  function renderVersions() {
    var list = $('versions-list');
    if (!list) return;
    var tree = getVersionsTree();
    if (tree.versions.length === 0) {
      list.innerHTML = '<div class="empty-state small"><p>No versions saved yet</p></div>';
      return;
    }
    list.innerHTML = '';
    tree.versions.forEach(function(v, i) {
      var item = document.createElement('div');
      item.className = 'version-item' + (v.id === tree.currentId ? ' active' : '');
      var preview = v.prompt.substring(0, 60) + (v.prompt.length > 60 ? '...' : '');
      var timeAgo = getTimeAgo(v.timestamp);
      item.innerHTML = '<div class="version-num">' + (i + 1) + '</div>' +
        '<div class="version-info">' +
          '<div class="version-label">' + v.label + '</div>' +
          '<div class="version-meta">' + v.wordCount + ' words · ' + timeAgo + '</div>' +
        '</div>' +
        '<div class="version-preview">' + escapeHtml(preview) + '</div>';
      item.addEventListener('click', function() {
        restoreVersion(v.id);
        var input = $('engineer-input');
        if (input) {
          input.value = v.prompt;
          updateEngineerWordCount();
          renderChecklist();
        }
        renderVersions();
        showToast('Restored ' + v.label, 'cyan');
      });
      list.appendChild(item);
    });
  }

  function initHistory() {
    var search = $('history-search');
    if (search) {
      search.addEventListener('input', function() {
        renderHistory(this.value);
      });
    }
    var clear = $('btn-clear-history');
    if (clear) {
      clear.addEventListener('click', function() {
        if (confirm('Clear all history? This cannot be undone.')) {
          clearHistory().then(function() {
            renderHistory();
            showToast('History cleared', 'amber');
          });
        }
      });
    }
    renderHistory();
  }

  async function renderHistory(query) {
    var list = $('history-list');
    var empty = $('history-empty');
    if (!list) return;
    try {
      var entries = [];
      if (query && query.trim()) {
        entries = await searchHistory(query);
      } else {
        entries = await getHistory();
      }
      list.innerHTML = '';
      if (entries.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>No prompts yet.</p><p class="empty-sub">Enhance your first prompt to build your history.</p></div>';
        return;
      }
      entries.forEach(function(entry) {
        var item = document.createElement('div');
        item.className = 'history-item';
        var scoreColor = entry.score >= 80 ? '#C4A265' : entry.score >= 60 ? '#8B7355' : entry.score >= 40 ? '#C4A265' : entry.score >= 20 ? '#9A7A50' : '#B85450';
        var preview = (entry.original || '').substring(0, 80);
        if ((entry.original || '').length > 80) preview += '...';
        var timeAgo = getTimeAgo(entry.timestamp);
        var stackBadge = entry.stack ? '<span class="history-stack-badge">' + entry.stack + '</span>' : '';
        item.innerHTML = '<div class="history-score" style="background:' + scoreColor + '">' + entry.score + '</div>' +
          '<div class="history-preview">' + escapeHtml(preview) + '</div>' +
          '<div class="history-meta">' +
            '<span>' + timeAgo + '</span>' +
            stackBadge +
            '<button class="history-star' + (entry.favorite ? ' favorited' : '') + '" data-id="' + entry.id + '">' + (entry.favorite ? '\u2605' : '\u2606') + '</button>' +
          '</div>' +
          '<div class="history-detail">' +
            '<div class="history-detail-header"><span class="history-detail-label">Original</span>' +
            '<button class="btn-copy-sm history-copy-btn" data-copy="original" title="Copy original"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button></div>' +
            '<div class="history-detail-text">' + escapeHtml(entry.original || '') + '</div>' +
            '<div class="history-detail-header"><span class="history-detail-label">Enhanced</span>' +
            '<button class="btn-copy-sm history-copy-btn" data-copy="enhanced" title="Copy enhanced"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button></div>' +
            '<div class="history-detail-text">' + escapeHtml(entry.enhanced || '') + '</div>' +
          '</div>';
        item.addEventListener('click', function(e) {
          if (e.target.closest('.history-star') || e.target.closest('.history-copy-btn')) return;
          item.classList.toggle('expanded');
        });
        // Wire up copy buttons
        item.querySelectorAll('.history-copy-btn').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var textToCopy = btn.dataset.copy === 'original' ? (entry.original || '') : (entry.enhanced || '');
            copyToClipboard(textToCopy, btn);
          });
        });
        var star = item.querySelector('.history-star');
        star.addEventListener('click', async function(e) {
          e.stopPropagation();
          await toggleFavorite(entry.id);
          renderHistory(query);
        });
        list.appendChild(item);
      });
    } catch (e) {
      // silent
    }
  }

  function getTimeAgo(ts) {
    if (!ts) return '';
    var diff = Date.now() - ts;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h ago';
    var days = Math.floor(hours / 24);
    if (days < 7) return days + 'd ago';
    var weeks = Math.floor(days / 7);
    if (weeks < 4) return weeks + 'w ago';
    return '>1mo ago';
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function initSettings() {
    var btn = $('settings-btn');
    var modal = $('settings-modal');
    var close = $('settings-close');
    var backdrop = $('settings-backdrop');
    if (!btn || !modal || !close) return;
    btn.addEventListener('click', function() { openSettings(); });
    close.addEventListener('click', function() { closeSettings(); });
    if (backdrop) backdrop.addEventListener('click', function() { closeSettings(); });
    $('setting-api-key').addEventListener('change', function() {
      settings.apiKey = this.value;
      updateSettings({ apiKey: this.value });
    });
    $('setting-auto-stack').addEventListener('change', saveSettingFromToggle);
    $('setting-token-eff').addEventListener('change', saveSettingFromToggle);
    $('setting-before-after').addEventListener('change', saveSettingFromToggle);
    $('setting-theme').addEventListener('change', function() {
      saveSettingFromToggle.call(this);
      applyTheme();
    });
    $('btn-export').addEventListener('click', doExport);
    $('btn-import').addEventListener('click', function() { $('import-file-input').click(); });
    $('import-file-input').addEventListener('change', doImport);
    $('btn-clear-data').addEventListener('click', doClearData);
    $('btn-reset-settings').addEventListener('click', doResetSettings);
  }

  async function openSettings() {
    var s = await getSettings();
    settings = s;
    $('setting-api-key').value = s.apiKey || '';
    $('setting-auto-stack').checked = s.autoDetectStack !== false;
    $('setting-token-eff').checked = s.showTokenEfficiency !== false;
    $('setting-before-after').checked = s.showBeforeAfter !== false;
    $('setting-theme').checked = s.theme === 'light';
    $('settings-modal').classList.remove('hidden');
  }

  function closeSettings() {
    $('settings-modal').classList.add('hidden');
  }

  async function saveSettingFromToggle() {
    var id = this.id;
    var key = id.replace('setting-', '');
    key = key.replace(/-/g, '_');
    var map = {
      ai_enabled: 'aiEnabled',
      auto_stack: 'autoDetectStack',
      token_eff: 'showTokenEfficiency',
      before_after: 'showBeforeAfter',
      theme: 'theme'
    };
    var actualKey = map[key] || key;
    var val = this.checked;
    if (actualKey === 'theme') val = this.checked ? 'light' : 'dark';
    var updated = await updateSettings({ [actualKey]: val });
    settings = updated;
  }

  async function saveSettingFromInput() {
    var id = this.id;
    var key = id.replace('setting-', '');
    var map = {
      'endpoint': 'apiEndpoint',
      'api-key': 'apiKey',
      'model': 'model'
    };
    var actualKey = map[key] || key;
    var updated = await updateSettings({ [actualKey]: this.value });
    settings = updated;
  }

  function applyTheme() {
    if (settings.theme === 'light') document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
  }

  async function doExport() {
    try {
      var data = await exportData();
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'vibe-check-export.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported', 'cyan');
    } catch (e) {
      showToast('Export failed: ' + e.message, 'crimson');
    }
  }

  async function doImport(e) {
    var file = e.target.files[0];
    if (!file) return;
    try {
      var text = await file.text();
      var data = JSON.parse(text);
      await importData(data);
      showToast('Data imported', 'cyan');
      loadSettings();
      renderHistory();
      closeSettings();
    } catch (err) {
      showToast('Import failed: ' + err.message, 'crimson');
    }
    e.target.value = '';
  }

  async function doClearData() {
    if (confirm('This will delete all history and reset settings. This cannot be undone.')) {
      await clearAllData();
      showToast('All data cleared', 'amber');
      loadSettings();
      renderHistory();
      closeSettings();
    }
  }

  async function doResetSettings() {
    await resetSettings();
    settings = await getSettings();
    showToast('Settings reset to defaults', 'cyan');
    closeSettings();
  }

  function initTipCarousel() {
    showTip(0);
    tipInterval = setInterval(function() {
      currentTipIndex = (currentTipIndex + 1) % TIPS.length;
      showTip(currentTipIndex);
    }, 10000);
    var prev = $('tip-prev');
    var next = $('tip-next');
    if (prev) prev.addEventListener('click', function() {
      currentTipIndex = (currentTipIndex - 1 + TIPS.length) % TIPS.length;
      showTip(currentTipIndex);
      resetTipInterval();
    });
    if (next) next.addEventListener('click', function() {
      currentTipIndex = (currentTipIndex + 1) % TIPS.length;
      showTip(currentTipIndex);
      resetTipInterval();
    });
  }

  function showTip(index) {
    var el = $('tip-text');
    if (el) {
      el.style.opacity = 0;
      setTimeout(function() {
        el.textContent = TIPS[index];
        el.style.opacity = 1;
      }, 150);
    }
  }

  function resetTipInterval() {
    if (tipInterval) clearInterval(tipInterval);
    tipInterval = setInterval(function() {
      currentTipIndex = (currentTipIndex + 1) % TIPS.length;
      showTip(currentTipIndex);
    }, 10000);
  }

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      // Ctrl+Enter — enhance
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        doEnhance();
      }
      // Ctrl+Shift+C — copy enhanced
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        var el = $('enhanced-text');
        if (el && el.textContent) copyToClipboard(el.textContent, $('btn-copy-enhanced'));
      }
      // Ctrl+Tab — next tab
      if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        cycleTab(1);
      }
      // Ctrl+Shift+Tab — previous tab
      if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        cycleTab(-1);
      }
      // Ctrl+Z — undo
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
        var tag = e.target && e.target.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          doUndo();
        }
      }
      // Ctrl+Y or Ctrl+Shift+Z — redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
        var tag2 = e.target && e.target.tagName;
        if (tag2 !== 'INPUT' && tag2 !== 'TEXTAREA') {
          e.preventDefault();
          doRedo();
        }
      }
      // / — focus textarea
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        var tag3 = e.target && e.target.tagName;
        if (tag3 !== 'INPUT' && tag3 !== 'TEXTAREA') {
          e.preventDefault();
          var input = $('prompt-input');
          if (input) input.focus();
        }
      }
    });
  }

  function cycleTab(dir) {
    var tabs = document.querySelectorAll('.tab-btn');
    var active = document.querySelector('.tab-btn.active');
    var idx = Array.from(tabs).indexOf(active);
    var next = (idx + dir + tabs.length) % tabs.length;
    tabs[next].click();
  }

  function initStackDetection() {
    chrome.runtime.sendMessage({ type: 'GET_STACK' }, function(response) {
      if (response && response.hostname) {
        currentStack = detectStack(response.hostname);
        if (currentStack) {
          var badge = $('stack-badge');
          var name = $('stack-name');
          if (badge && name) {
            name.textContent = currentStack.name;
            badge.classList.remove('hidden');
            badge.addEventListener('click', function() {
              var tips = $('stack-tips');
              tips.classList.toggle('hidden');
            });
          }
          var tipsContainer = $('stack-tips');
          var tipsName = $('tips-stack-name');
          var tipsList = $('tips-list');
          if (tipsContainer && tipsName && tipsList) {
            tipsName.textContent = currentStack.name;
            tipsList.innerHTML = '';
            (currentStack.tips || []).forEach(function(tip) {
              var li = document.createElement('li');
              li.textContent = tip;
              tipsList.appendChild(li);
            });
          }
        }
      }
    });
  }

  function initPasteDetection() {
    var input = $('prompt-input');
    if (!input) return;
    input.addEventListener('paste', function() {
      setTimeout(function() {
        var text = input.value.trim();
        if (text.length > 30) {
          var hasVerbs = /\b(build|create|make|fix|add|implement|generate|design|develop)\b/i.test(text);
          var hasTech = /\b(react|vue|next|tailwind|typescript|python|node)\b/i.test(text);
          if (hasVerbs || hasTech) {
            showToast('Looks like a prompt. Enhance it?', 'cyan');
          }
        }
      }, 50);
    });
  }

  function initEfficiencyToggle() {
    var header = $('efficiency-toggle');
    if (!header) return;
    header.addEventListener('click', function() {
      var body = $('efficiency-body');
      var chevron = header.querySelector('.chevron');
      if (body) body.classList.toggle('hidden');
      if (chevron) chevron.classList.toggle('open');
    });
  }

  function showToast(message, type) {
    var container = $('toast-container');
    if (!container) return;
    // Limit to 3 visible toasts
    var existing = container.querySelectorAll('.toast');
    if (existing.length >= 3) {
      var oldest = existing[0];
      oldest.style.opacity = 0;
      oldest.style.transition = 'opacity 0.15s ease';
      setTimeout(function() {
        if (oldest.parentNode) oldest.parentNode.removeChild(oldest);
      }, 150);
    }
    var toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'cyan');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = 0;
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  }

  async function saveToHistory(original, enhanced, score, extra) {
    try {
      await saveHistory({
        original: original,
        enhanced: enhanced,
        score: score,
        stack: currentStack ? currentStack.id : null,
        type: extra && extra.type ? extra.type : 'build',
        favorite: false
      });
    } catch (e) {
      // silent
    }
  }

})();
