import { createContext, useState, useContext, useEffect, useRef } from 'react'
import { jwtDecode } from 'jwt-decode';
import { getToken, setToken, removeToken } from '../utils/tokenUtils';

const RoleContext = createContext()

// Generate a unique tab ID for this window/tab
const getTabId = () => {
  let tabId = sessionStorage.getItem('tabId');
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tabId', tabId);
  }
  return tabId;
};

export function RoleProvider({ children }) {
  // Initialize role from localStorage, or default to 'provider' if not set
  const [role, setRoleState] = useState(null);
  const [user, setUserState] = useState(null);
  const tabIdRef = useRef(getTabId());
  const currentUserIdRef = useRef(null); // Track which user this tab is logged in as

  // Function to update role and user from token
  const updateFromToken = (forceUpdate = false, source = 'local') => {
    // Use the token utility to get tab-specific token
    let token = getToken();
    
    if (token) {
      try {
        const decodedUser = jwtDecode(token); // Decodes the user object from the token
        
        // Check if token is expired
        if (decodedUser.exp * 1000 < Date.now()) {
          removeToken();
          setRoleState(null);
          setUserState(null);
          currentUserIdRef.current = null;
          return;
        }

        // Check if this is a different user than what this tab was logged in as
        const isDifferentUser = currentUserIdRef.current !== null && 
                                currentUserIdRef.current !== decodedUser.id;

        // Only update if:
        // 1. Force update is requested (same tab login/logout)
        // 2. This tab doesn't have a user set yet (initial load)
        // 3. It's the same user (normal update)
        // DON'T update if it's a different user from another tab (unless forced)
        if (forceUpdate || currentUserIdRef.current === null || currentUserIdRef.current === decodedUser.id) {
          // Only update if the role/user actually changed to avoid unnecessary re-renders
          if (decodedUser.role !== role || decodedUser.id !== user?.id) {
            setRoleState(decodedUser.role);
            setUserState(decodedUser);
            currentUserIdRef.current = decodedUser.id;
            // Store token using utility (stores in both sessionStorage and localStorage)
            setToken(token);
          }
        } else if (isDifferentUser && source === 'storage') {
          // Another tab logged in with a different user - ignore it
          console.log(`Tab ${tabIdRef.current}: Ignoring token change from another tab (different user: ${decodedUser.id} vs ${currentUserIdRef.current})`);
        }
      } catch (e) {
        console.error('Invalid token:', e);
        removeToken();
        setRoleState(null);
        setUserState(null);
        currentUserIdRef.current = null;
      }
    } else {
      // Token was removed - only clear if this tab was logged in
      if (currentUserIdRef.current !== null || forceUpdate) {
        setRoleState(null);
        setUserState(null);
        currentUserIdRef.current = null;
        removeToken();
      }
    }
  };

  // Initialize role from token on mount
  useEffect(() => {
    updateFromToken(true); // Force update on initial load
  }, []);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        // Token was changed in another tab/window
        // Only update if it's the same user or this tab doesn't have a user yet
        const newToken = e.newValue;
        if (newToken) {
          try {
            const decodedUser = jwtDecode(newToken);
            // Only update if it's the same user or this tab has no user
            if (currentUserIdRef.current === null || currentUserIdRef.current === decodedUser.id) {
              updateFromToken(false, 'storage');
            }
          } catch (e) {
            // Invalid token, ignore
          }
        } else {
          // Token was removed in another tab - check if our tab-specific token still exists
          const currentToken = getToken();
          if (!currentToken && currentUserIdRef.current !== null) {
            // Our token is gone, clear state
            setRoleState(null);
            setUserState(null);
            currentUserIdRef.current = null;
          }
        }
      }
    };

    // Listen for storage events (changes from other tabs)
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (changes in same tab)
    const handleCustomStorageChange = () => {
      updateFromToken(true); // Force update for same-tab changes
    };
    window.addEventListener('tokenChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenChanged', handleCustomStorageChange);
    };
  }, []);

  const setRole = (newRole, newUser) => {
    setRoleState(newRole);
    setUserState(newUser);
    if (newUser?.id) {
      currentUserIdRef.current = newUser.id;
      // Store token using utility (stores in both sessionStorage and localStorage)
      const token = getToken();
      if (token) {
        setToken(token);
      }
    }
    // The token is already in localStorage from the Login page
    // Dispatch custom event to notify other components in same tab
    window.dispatchEvent(new Event('tokenChanged'));
  };

  const logout = () => {
    // Clear token using utility
    removeToken();
    setRoleState(null);
    setUserState(null);
    currentUserIdRef.current = null;
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('tokenChanged'));
  };

  return (
    <RoleContext.Provider value={{ role, user, logout, setRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole must be used within RoleProvider')
  }
  return context
}
