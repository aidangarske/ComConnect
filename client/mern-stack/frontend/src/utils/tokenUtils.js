/**
 * Token Utilities
 * Handles token retrieval with tab isolation support
 */

// Get the current tab ID
const getTabId = () => {
  let tabId = sessionStorage.getItem('tabId');
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tabId', tabId);
  }
  return tabId;
};

/**
 * Get the authentication token for the current tab
 * Checks sessionStorage first (tab-specific), then falls back to localStorage
 */
export const getToken = () => {
  const tabId = getTabId();
  // Check sessionStorage first (tab-specific token)
  const sessionToken = sessionStorage.getItem(`token_${tabId}`);
  if (sessionToken) {
    return sessionToken;
  }
  // Fall back to localStorage
  return localStorage.getItem('token');
};

/**
 * Set the authentication token for the current tab
 * Stores in both sessionStorage (tab-specific) and localStorage (persistence)
 */
export const setToken = (token) => {
  const tabId = getTabId();
  if (token) {
    sessionStorage.setItem(`token_${tabId}`, token);
    localStorage.setItem('token', token);
  } else {
    sessionStorage.removeItem(`token_${tabId}`);
    localStorage.removeItem('token');
  }
};

/**
 * Remove the authentication token for the current tab
 */
export const removeToken = () => {
  const tabId = getTabId();
  sessionStorage.removeItem(`token_${tabId}`);
  localStorage.removeItem('token');
};

