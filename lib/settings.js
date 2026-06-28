/**
 * SETTINGS.JS — Settings manager using chrome.storage.local
 * 
 * EXPORTED:
 *   getSettings() → Promise
 *   updateSettings(partial) → Promise
 *   resetSettings() → Promise
 *   exportData() → Promise
 *   importData(data) → Promise
 *   clearAllData() → Promise
 */

const SETTINGS_KEY = 'vibe_check_settings';

const DEFAULT_SETTINGS = {
  aiEnabled: true,
  apiEndpoint: '',
  apiKey: 'csk-6m2krnyfn34t4n9ct6f2ck5x2vj9p32f8tv9c2yky9myyc6m',
  model: 'gpt-oss-120b',
  defaultMode: 'ai',
  autoDetectStack: true,
  showTokenEfficiency: true,
  showBeforeAfter: true,
  compactMode: false,
  maxHistoryEntries: 100,
  exportFormat: 'json',
  theme: 'dark'
};

/**
 * Merges stored settings with defaults (handles missing keys gracefully).
 * @param {object} stored
 * @returns {object}
 */
function mergeSettings(stored) {
  if (!stored || typeof stored !== 'object') return { ...DEFAULT_SETTINGS };
  const merged = { ...DEFAULT_SETTINGS };
  for (const key in merged) {
    if (key in stored) merged[key] = stored[key];
  }
  return merged;
}

/**
 * Gets all settings, merged with defaults.
 * @returns {Promise<object>}
 */
async function getSettings() {
  try {
    const result = await chrome.storage.local.get([SETTINGS_KEY]);
    return mergeSettings(result[SETTINGS_KEY]);
  } catch (error) {
    console.error('Storage error (getSettings):', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Updates settings with a partial object. Merges with existing.
 * @param {object} partial - Partial settings object
 * @returns {Promise<object>} The merged settings after update
 */
async function updateSettings(partial) {
  try {
    const current = await getSettings();
    const updated = { ...current, ...partial };
    await chrome.storage.local.set({ [SETTINGS_KEY]: updated });
    return updated;
  } catch (error) {
    console.error('Storage error (updateSettings):', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Resets all settings to defaults.
 * @returns {Promise<void>}
 */
async function resetSettings() {
  try {
    await chrome.storage.local.set({ [SETTINGS_KEY]: { ...DEFAULT_SETTINGS } });
  } catch (error) {
    console.error('Storage error (resetSettings):', error);
  }
}

/**
 * Exports all data (settings + history) as a JSON object.
 * @returns {Promise<object>}
 */
async function exportData() {
  try {
    const settings = await getSettings();
    const result = await chrome.storage.local.get(['vibe_check_history']);
    const history = result['vibe_check_history'] || [];
    return {
      version: '1.0',
      exportedAt: Date.now(),
      settings: settings,
      history: history
    };
  } catch (error) {
    console.error('Storage error (exportData):', error);
    throw new Error('Failed to export data');
  }
}

/**
 * Validates and imports data.
 * @param {object} data - The imported data object
 * @returns {Promise<void>}
 */
async function importData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid import file: must be a JSON object');
  }
  if (!data.version) {
    throw new Error('Invalid import file: missing version field');
  }
  if (!data.settings || typeof data.settings !== 'object') {
    throw new Error('Invalid import file: missing or invalid settings');
  }
  if (!Array.isArray(data.history)) {
    throw new Error('Invalid import file: history must be an array');
  }
  try {
    await chrome.storage.local.set({
      [SETTINGS_KEY]: data.settings,
      ['vibe_check_history']: data.history
    });
  } catch (error) {
    console.error('Storage error (importData):', error);
    throw new Error('Failed to import data');
  }
}

/**
 * Clears all data (settings + history).
 * @returns {Promise<void>}
 */
async function clearAllData() {
  try {
    await chrome.storage.local.remove([SETTINGS_KEY, 'vibe_check_history']);
  } catch (error) {
    console.error('Storage error (clearAllData):', error);
  }
}
