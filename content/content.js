/**
 * CONTENT.JS — Content script for site detection + inline prompt enhancement
 * 
 * RESPONSIBILITIES:
 * 1. Detect which AI coding platform the user is on
 * 2. Inject a floating "⚡ Enhance" button near prompt inputs on supported sites
 * 3. When clicked: read text → enhance → replace inline
 * 4. Fall back gracefully when injection isn't possible
 */

(function() {
  'use strict';

  // ============================================================
  // PLATFORM SELECTORS — how to find the prompt input on each site
  // ============================================================

  var PLATFORM_SELECTORS = {
    // === VIBE CODING / UI BUILDERS ===
    'v0.dev': [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]',
      '.cm-content'
    ],
    'bolt.new': [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]'
    ],
    'bolt.diy': [
      'textarea[placeholder]',
      'textarea'
    ],
    'lovable.dev': [
      'textarea',
      '[contenteditable="true"]',
      'textarea[placeholder]'
    ],
    'create.xyz': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'tempolabs.ai': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'roocode.com': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'same.dev': [
      'textarea',
      '[contenteditable="true"]'
    ],

    // === IDES / CODE EDITORS ===
    'cursor.sh': [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]'
    ],
    'codeium.com': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'windsurf.com': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'stackblitz.com': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'codesandbox.io': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'firebase.google.com': [
      'textarea',
      '[contenteditable="true"]'
    ],

    // === AI AGENTS ===
    'manus.im': [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]'
    ],
    'devin.ai': [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]'
    ],
    'replit.com': [
      'textarea',
      '[contenteditable="true"]'
    ],

    // === AI CHAT ===
    'chatgpt.com': [
      '#prompt-textarea',
      '[contenteditable="true"][data-placeholder]',
      '[contenteditable="true"]',
      'textarea'
    ],
    'chat.openai.com': [
      '#prompt-textarea',
      '[contenteditable="true"][data-placeholder]',
      '[contenteditable="true"]',
      'textarea'
    ],
    'claude.ai': [
      '[contenteditable="true"].ProseMirror',
      'div[contenteditable="true"]',
      'textarea'
    ],
    'gemini.google.com': [
      '.ql-editor[contenteditable="true"]',
      'rich-textarea [contenteditable="true"]',
      '[contenteditable="true"]',
      'textarea'
    ],
    'aistudio.google.com': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'grok.com': [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]'
    ],
    'x.com': [
      'textarea[data-testid="GrokInput"]',
      'textarea[placeholder*="Ask Grok"]',
      '[contenteditable="true"]'
    ],
    'perplexity.ai': [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]'
    ],
    'chat.deepseek.com': [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]'
    ],
    'chat.mistral.ai': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'huggingface.co': [
      'textarea[placeholder]',
      'textarea'
    ],
    'phind.com': [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]'
    ],
    'you.com': [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]'
    ],
    't3.chat': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'copilot.microsoft.com': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'github.com': [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]'
    ],
    'chat.qwenlm.ai': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'kimi.ai': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'chatglm.cn': [
      'textarea',
      '[contenteditable="true"]'
    ],
    'poe.com': [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]'
    ]
  };

  // ============================================================
  // STATE
  // ============================================================

  var currentHostname = null;
  var activeInput = null;
  var enhanceBtn = null;
  var statusEl = null;
  var isEnhancing = false;
  var observerActive = false;

  // ============================================================
  // UTILITY
  // ============================================================

  function debounce(fn, delay) {
    var timer = null;
    return function() {
      var args = arguments;
      var ctx = this;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function() {
        timer = null;
        fn.apply(ctx, args);
      }, delay);
    };
  }

  function sendHostname() {
    try {
      var hostname = window.location.hostname.replace(/^www\./, '');
      if (hostname !== currentHostname) {
        currentHostname = hostname;
        chrome.runtime.sendMessage({
          type: 'STACK_DETECTED',
          hostname: hostname
        });
        // Try to inject on supported platforms
        setTimeout(function() { tryInject(); }, 1500);
      }
    } catch (e) {
      // Extension context invalidated — ignore
    }
  }

  // ============================================================
  // INPUT DETECTION — find the prompt input on the current page
  // ============================================================

  function findPromptInput() {
    var hostname = window.location.hostname.replace(/^www\./, '');
    var selectors = PLATFORM_SELECTORS[hostname];
    if (!selectors) {
      // Generic fallback — any textarea or contenteditable on AI coding sites
      selectors = [
        'textarea[placeholder*="prompt" i]',
        'textarea[placeholder*="describe" i]',
        'textarea[placeholder*="ask" i]',
        'textarea[placeholder*="type" i]',
        'textarea',
        '[contenteditable="true"]'
      ];
    }
    for (var i = 0; i < selectors.length; i++) {
      var elements = document.querySelectorAll(selectors[i]);
      for (var j = 0; j < elements.length; j++) {
        var el = elements[j];
        // Skip tiny textareas (likely not the main prompt input)
        if (el.tagName === 'TEXTAREA') {
          var rect = el.getBoundingClientRect();
          if (rect.height < 30 || rect.width < 200) continue;
        }
        // Skip if hidden
        if (el.offsetParent === null && el.tagName !== 'BODY') continue;
        return el;
      }
    }
    return null;
  }

  function readInputText(el) {
    if (!el) return '';
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      return el.value || '';
    }
    if (el.contentEditable === 'true') {
      return el.innerText || el.textContent || '';
    }
    return '';
  }

  function sanitizeText(text) {
    if (typeof text !== 'string') return '';
    // Strip HTML tags
    text = text.replace(/<[^>]*>/g, '');
    // Cap length
    if (text.length > 5000) text = text.slice(0, 5000);
    return text;
  }

  function writeInputText(el, text) {
    if (!el) return false;
    // Sanitize before writing to prevent any injection
    text = sanitizeText(text);
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    if (el.contentEditable === 'true') {
      el.innerText = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    return false;
  }

  // ============================================================
  // INJECTION — floating enhance button
  // ============================================================

  function createEnhanceButton() {
    if (enhanceBtn) return;

    // Inject styles
    var style = document.createElement('style');
    style.textContent = '#vibe-check-enhance-btn{display:none;position:fixed;z-index:2147483647;background:linear-gradient(135deg,#C4A265,#8B7355);color:#000;border:none;border-radius:8px;padding:8px 14px;font-family:system-ui,-apple-system,sans-serif;font-size:12px;font-weight:600;cursor:pointer;gap:6px;align-items:center;box-shadow:0 2px 12px rgba(196,162,101,0.3);transition:all .2s ease;user-select:none;-webkit-user-select:none;}#vibe-check-enhance-btn:hover{box-shadow:0 4px 20px rgba(196,162,101,0.4);transform:translateY(-1px);}#vibe-check-enhance-btn:active{transform:scale(0.97);}#vibe-check-enhance-btn.loading{opacity:0.7;pointer-events:none;}#vibe-check-enhance-btn.loading .vc-btn-text{margin-left:4px;}#vibe-check-enhance-btn.loading::after{content:"";width:12px;height:12px;border:2px solid rgba(0,0,0,0.2);border-top-color:#000;border-radius:50%;animation:vc-spin .6s linear infinite;}@keyframes vc-spin{to{transform:rotate(360deg);}}';
    document.head.appendChild(style);

    enhanceBtn = document.createElement('div');
    enhanceBtn.id = 'vibe-check-enhance-btn';
    // Build DOM safely instead of innerHTML (XSS prevention)
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '13,2 3,14 12,14 11,22 21,10 12,10');
    polygon.setAttribute('fill', '#000');
    svg.appendChild(polygon);
    var span = document.createElement('span');
    span.className = 'vc-btn-text';
    span.textContent = 'Enhance';
    enhanceBtn.appendChild(svg);
    enhanceBtn.appendChild(span);

    // Status indicator
    statusEl = document.createElement('div');
    statusEl.id = 'vibe-check-status';
    statusEl.style.cssText = 'display:none;position:fixed;bottom:52px;right:20px;background:#0A0A0A;color:#B0B0B0;padding:6px 12px;border-radius:6px;font-size:11px;font-family:system-ui,sans-serif;z-index:2147483646;border:1px solid #222;white-space:nowrap;';

    document.body.appendChild(enhanceBtn);
    document.body.appendChild(statusEl);

    enhanceBtn.addEventListener('click', handleEnhanceClick);
  }

  function showStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    if (type === 'success') statusEl.style.color = '#C4A265';
    else if (type === 'error') statusEl.style.color = '#B85450';
    else statusEl.style.color = '#C4A265';
    setTimeout(function() {
      if (statusEl) statusEl.style.display = 'none';
    }, 2500);
  }

  function positionButton(input) {
    if (!enhanceBtn) return;
    var rect = input.getBoundingClientRect();
    // Position to the right of the input, vertically centered
    // Fixed positioning uses viewport coords, so NO scrollY offset
    var right = Math.max(20, window.innerWidth - rect.right - 8);
    var top = rect.top + (rect.height / 2) - 18;
    // Clamp to viewport so button doesn't go offscreen
    top = Math.max(8, Math.min(top, window.innerHeight - 44));
    enhanceBtn.style.right = right + 'px';
    enhanceBtn.style.top = top + 'px';
  }

  function tryInject() {
    var input = findPromptInput();
    if (!input) return;
    activeInput = input;

    createEnhanceButton();
    positionButton(input);
    enhanceBtn.style.display = 'flex';

    // Re-position on scroll and resize
    window.addEventListener('scroll', debounce(function() { positionButton(input); }, 200));
    window.addEventListener('resize', debounce(function() { positionButton(input); }, 200));

    // Watch for SPA navigation that might change the input
    if (!observerActive) {
      observeInputChanges();
    }
  }

  function observeInputChanges() {
    observerActive = true;
    // Periodically check if the input still exists and re-find if needed
    setInterval(function() {
      var input = findPromptInput();
      if (input && input !== activeInput) {
        activeInput = input;
        positionButton(input);
      }
      if (enhanceBtn && !input) {
        enhanceBtn.style.display = 'none';
      }
    }, 2000);
  }

  // ============================================================
  // ENHANCE HANDLER — the main action
  // ============================================================

  function handleEnhanceClick() {
    if (isEnhancing) return;
    if (!activeInput) {
      showStatus('No input found', 'error');
      return;
    }

    var text = readInputText(activeInput);
    if (!text || text.trim().length < 5) {
      showStatus('Type a prompt first', 'error');
      return;
    }

    isEnhancing = true;
    enhanceBtn.classList.add('loading');
    showStatus('Enhancing...', 'loading');

    try {
      chrome.runtime.sendMessage({
        type: 'INLINE_ENHANCE',
        prompt: text
      }, function(response) {
        isEnhancing = false;
        enhanceBtn.classList.remove('loading');

        if (chrome.runtime.lastError) {
          showStatus('Extension error', 'error');
          return;
        }

        if (response && response.enhanced) {
          var success = writeInputText(activeInput, response.enhanced);
          if (success) {
            showStatus('Enhanced! (' + (response.score || '?') + '/100)', 'success');
          } else {
            // Couldn't write inline — offer copy
            fallbackCopy(response.enhanced, response.score);
          }
        } else if (response && response.error) {
          showStatus(response.error, 'error');
        } else {
          showStatus('Enhancement failed', 'error');
        }
      });
    } catch (e) {
      isEnhancing = false;
      if (enhanceBtn) enhanceBtn.classList.remove('loading');
      showStatus('Extension context lost — reload page', 'error');
    }
  }

  function fallbackCopy(text, score) {
    try {
      navigator.clipboard.writeText(text).then(function() {
        showStatus('Copied! Paste it in (' + (score || '?') + '/100)', 'success');
      }).catch(function() {
        showStatus('Enhanced but couldn\'t copy — use popup', 'error');
      });
    } catch (e) {
      showStatus('Enhanced — use the popup to copy', 'error');
    }
  }

  // ============================================================
  // SITE DETECTION — send hostname to service worker
  // ============================================================

  var debouncedSend = debounce(sendHostname, 500);

  // Method 1: popstate event
  window.addEventListener('popstate', debouncedSend);

  // Method 2: Override history.pushState and replaceState
  (function() {
    var origPush = history.pushState;
    var origReplace = history.replaceState;
    history.pushState = function() {
      origPush.apply(this, arguments);
      debouncedSend();
    };
    history.replaceState = function() {
      origReplace.apply(this, arguments);
      debouncedSend();
    };
  })();

  // Method 3: Watch document.title changes
  var lastTitle = document.title;
  var titleObserver = new MutationObserver(function() {
    if (document.title !== lastTitle) {
      lastTitle = document.title;
      debouncedSend();
    }
  });
  titleObserver.observe(document.querySelector('title') || document.head || document.documentElement, {
    subtree: true,
    characterData: true,
    childList: true
  });

  // Initial send
  sendHostname();

})();
