/**
 * SERVICE-WORKER.JS — Background service worker for Vibe Check
 *
 * RESPONSIBILITIES:
 * 1. Store current tab's detected hostname from content script
 * 2. Proxy AI API calls via Vercel serverless function
 * 3. Handle INLINE_ENHANCE from content script (local + AI)
 * 4. Handle messages from popup
 */

// Import enhancer and scorer for local enhancement
importScripts(chrome.runtime.getURL('lib/enhancer.js'), chrome.runtime.getURL('lib/scorer.js'), chrome.runtime.getURL('lib/stack-detector.js'));

let currentHostname = null;

/**
 * Enhances a prompt locally using the rule-based enhancer.
 * @param {string} prompt
 * @returns {{ enhanced: string, score: number }}
 */
function enhanceLocally(prompt) {
  var stack = currentHostname ? detectStack(currentHostname) : null;
  var result = enhancePrompt(prompt, stack);
  var scoreResult = scorePrompt(prompt, stack);
  return {
    enhanced: result.enhanced,
    score: scoreResult.total,
    improvements: result.improvements
  };
}

/**
 * Sanitize AI response to prevent injection of malicious content.
 * @param {string} text
 * @returns {string}
 */
function sanitizeResponse(text) {
  if (typeof text !== 'string') return '';
  // Strip any HTML tags that might have snuck in
  text = text.replace(/<[^>]*>/g, '');
  // Cap length to prevent abuse
  if (text.length > 5000) text = text.slice(0, 5000);
  return text.trim();
}

/**
 * Makes an AI API call to enhance a prompt via Vercel serverless proxy.
 * @param {string} prompt
 * @returns {Promise<{enhanced: string, score: number, improvements: string[]}>}
 */
async function callAI(prompt) {
  // Validate prompt length before sending
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
    throw new Error('Prompt too short');
  }
  if (prompt.length > 4000) {
    throw new Error('Prompt too long (max 4000 characters)');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch('https://vibe-check-vert-theta.vercel.app/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt.trim() }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (response.status === 429) throw new Error('Rate limit — try again in a minute');
      throw new Error(errData.error || 'API error: ' + response.status);
    }
    const data = await response.json();
    // Sanitize the enhanced text
    if (data.enhanced) {
      data.enhanced = sanitizeResponse(data.enhanced);
    }
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error('Request timed out');
    throw error;
  }
}

/**
 * Handles inline enhancement from content script.
 * Tries AI first (if configured), falls back to local.
 */
async function handleInlineEnhance(prompt) {
  // Try AI via Vercel proxy
  try {
    const aiResult = await callAI(prompt);
    return { enhanced: aiResult.enhanced, score: aiResult.score };
  } catch (err) {
    // AI failed — fall back to local
    var local = enhanceLocally(prompt);
    return { enhanced: local.enhanced, score: local.score, fallback: true };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STACK_DETECTED') {
    currentHostname = message.hostname;
    sendResponse({ success: true });
    return false;
  }

  if (message.type === 'GET_STACK') {
    sendResponse({ hostname: currentHostname });
    return false;
  }

  if (message.type === 'AI_ENHANCE') {
    callAI(message.prompt)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  if (message.type === 'INLINE_ENHANCE') {
    handleInlineEnhance(message.prompt)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  return false;
});
