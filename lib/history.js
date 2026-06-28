/**
 * HISTORY.JS — Prompt history manager using chrome.storage.local
 * 
 * EXPORTED:
 *   saveHistory(entry) → Promise
 *   getHistory(filters) → Promise
 *   getHistoryById(id) → Promise
 *   toggleFavorite(id) → Promise
 *   deleteHistoryEntry(id) → Promise
 *   clearHistory() → Promise
 *   searchHistory(query) → Promise
 */

const STORAGE_KEY = 'vibe_check_history';
const MAX_ENTRIES = 100;

/**
 * Generates a unique history entry ID.
 * @returns {string}
 */
function generateId() {
  return 'hist_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

/**
 * Saves a new entry to history. Preprends, auto-cleans on overflow.
 * @param {object} entry - History entry object
 * @returns {Promise<void>}
 */
async function saveHistory(entry) {
  try {
    entry.id = entry.id || generateId();
    entry.timestamp = entry.timestamp || Date.now();
    entry.favorite = entry.favorite || false;
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    let history = result[STORAGE_KEY] || [];
    history.unshift(entry);
    if (history.length > MAX_ENTRIES) {
      // Collect IDs of non-favorite entries sorted oldest-first
      const nonFavIds = history
        .filter(e => !e.favorite)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(e => e.id);
      // Remove oldest non-favorites by ID (avoids index-shifting bug)
      let removed = 0;
      const toRemove = Math.min(nonFavIds.length, history.length - MAX_ENTRIES);
      const removeSet = new Set(nonFavIds.slice(0, toRemove));
      history = history.filter(e => !removeSet.has(e.id));
      // If still over limit (all favorites), trim the tail
      if (history.length > MAX_ENTRIES) {
        history = history.slice(0, MAX_ENTRIES);
      }
    }
    await chrome.storage.local.set({ [STORAGE_KEY]: history });
  } catch (error) {
    console.error('Storage error (saveHistory):', error);
  }
}

/**
 * Retrieves all history entries, optionally filtered.
 * @param {object} filters - { favoritesOnly: boolean, stack: string }
 * @returns {Promise<array>}
 */
async function getHistory(filters) {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    let history = result[STORAGE_KEY] || [];
    if (filters) {
      if (filters.favoritesOnly) {
        history = history.filter(e => e.favorite);
      }
      if (filters.stack) {
        history = history.filter(e => e.stack === filters.stack);
      }
    }
    return history;
  } catch (error) {
    console.error('Storage error (getHistory):', error);
    return [];
  }
}

/**
 * Gets a single history entry by ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function getHistoryById(id) {
  try {
    const history = await getHistory();
    return history.find(e => e.id === id) || null;
  } catch (error) {
    console.error('Storage error (getHistoryById):', error);
    return null;
  }
}

/**
 * Toggles the favorite flag on an entry.
 * @param {string} id
 * @returns {Promise<void>}
 */
async function toggleFavorite(id) {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    const history = result[STORAGE_KEY] || [];
    const entry = history.find(e => e.id === id);
    if (entry) {
      entry.favorite = !entry.favorite;
      await chrome.storage.local.set({ [STORAGE_KEY]: history });
    }
  } catch (error) {
    console.error('Storage error (toggleFavorite):', error);
  }
}

/**
 * Deletes a single history entry by ID.
 * @param {string} id
 * @returns {Promise<void>}
 */
async function deleteHistoryEntry(id) {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    let history = result[STORAGE_KEY] || [];
    history = history.filter(e => e.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEY]: history });
  } catch (error) {
    console.error('Storage error (deleteHistoryEntry):', error);
  }
}

/**
 * Clears all history entries.
 * @returns {Promise<void>}
 */
async function clearHistory() {
  try {
    await chrome.storage.local.remove([STORAGE_KEY]);
  } catch (error) {
    console.error('Storage error (clearHistory):', error);
  }
}

/**
 * Searches history by text content (case-insensitive).
 * @param {string} query
 * @returns {Promise<array>}
 */
async function searchHistory(query) {
  try {
    const history = await getHistory();
    if (!query || query.trim() === '') return history;
    const q = query.toLowerCase();
    return history.filter(e =>
      (e.original && e.original.toLowerCase().includes(q)) ||
      (e.enhanced && e.enhanced.toLowerCase().includes(q))
    );
  } catch (error) {
    console.error('Storage error (searchHistory):', error);
    return [];
  }
}
