/**
 * CHROME-POLYFILL.JS — Seamless chrome API polyfill for browser preview
 * Loaded FIRST — detects if we're in a real extension or plain browser
 */
(function() {
  var isExtension = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local && typeof chrome.storage.local.get === 'function' && !chrome.storage.local.get.toString().includes('Promise'));

  if (isExtension) return;

  var _store = {};
  var _loaded = false;

  function _loadAll() {
    if (_loaded) return;
    try {
      var raw = localStorage.getItem('vibe_check_storage');
      if (raw) _store = JSON.parse(raw);
    } catch(e) { _store = {}; }
    _loaded = true;
  }

  function _saveAll() {
    try { localStorage.setItem('vibe_check_storage', JSON.stringify(_store)); } catch(e) {}
  }

  window.chrome = window.chrome || {};
  window.chrome.storage = window.chrome.storage || {};
  window.chrome.storage.local = {
    get: function(keys) {
      return new Promise(function(resolve) {
        _loadAll();
        var result = {};
        if (Array.isArray(keys)) {
          keys.forEach(function(k) { if (k in _store) result[k] = _store[k]; });
        } else if (typeof keys === 'string') {
          if (keys in _store) result[keys] = _store[keys];
        } else if (keys && typeof keys === 'object') {
          Object.keys(keys).forEach(function(k) {
            result[k] = (k in _store) ? _store[k] : keys[k];
          });
        } else {
          result = JSON.parse(JSON.stringify(_store));
        }
        resolve(result);
      });
    },
    set: function(items) {
      return new Promise(function(resolve) {
        _loadAll();
        Object.assign(_store, items);
        _saveAll();
        resolve();
      });
    },
    remove: function(keys) {
      return new Promise(function(resolve) {
        _loadAll();
        var arr = Array.isArray(keys) ? keys : [keys];
        arr.forEach(function(k) { delete _store[k]; });
        _saveAll();
        resolve();
      });
    },
    clear: function() {
      return new Promise(function(resolve) { _store = {}; _saveAll(); resolve(); });
    }
  };

  window.chrome.runtime = window.chrome.runtime || {};
  window.chrome.runtime.lastError = null;
  window.chrome.runtime.sendMessage = function(msg, callback) {
    if (msg && msg.type === 'GET_STACK') {
      if (callback) callback({ hostname: window.location.hostname });
      return;
    }
    if (msg && msg.type === 'AI_ENHANCE') {
      // Try to read API key from polyfilled storage and call OpenRouter directly
      _loadAll();
      var settings = _store['vibe_check_settings'] || {};
      if (!settings.apiKey) {
        if (callback) callback({ error: 'No API key — add one in Settings' });
        return;
      }
      fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + settings.apiKey
        },
        body: JSON.stringify({
          model: 'gpt-oss-120b',
          messages: [
            { role: 'system', content: 'You are a prompt engineering assistant for AI coding tools. Take this prompt and make it more specific, structured, and effective. Add missing context: tech stack, design requirements, constraints, and expected output format. Keep the original intent. Return ONLY the enhanced prompt, no explanation, no markdown code blocks.' },
            { role: 'user', content: msg.prompt }
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
        if (callback) callback({ enhanced: enhanced.trim(), score: 50, improvements: ['AI-enhanced prompt'] });
      }).catch(function(err) {
        if (callback) callback({ error: err.message });
      });
      return;
    }
    if (callback) callback({});
  };

  // Mark body as browser-preview so CSS can go full-width
  if (document.body) {
    document.body.classList.add('browser-preview');
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      document.body.classList.add('browser-preview');
    });
  }

  console.log('[Vibe Check] Running in browser preview mode');
})();
