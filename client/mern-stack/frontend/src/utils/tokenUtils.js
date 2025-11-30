const getTabId = () => {
  let tabId = sessionStorage.getItem('tabId');
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tabId', tabId);
  }
  return tabId;
};

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

export const removeToken = () => {
  const tabId = getTabId();
  sessionStorage.removeItem(`token_${tabId}`);
  localStorage.removeItem('token');
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`http://localhost:8080/api${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
     removeToken(); 
     window.location.href = '/login'; 
  }

  return response;
};

