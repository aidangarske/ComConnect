import { createContext, useState, useContext, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode';

const RoleContext = createContext()

export function RoleProvider({ children }) {
  // Initialize role from localStorage, or default to 'provider' if not set
  const [role, setRoleState] = useState(null);
  const [user, setUserState] = useState(null);
  // Persist role to localStorage whenever it changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token); // Decodes the user object from the token
        
        // Check if token is expired
        if (decodedUser.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setRoleState(null);
          setUserState(null);
        } else {
          setRoleState(decodedUser.role);
          setUserState(decodedUser); // Set the full user (e.g., { id: '...', role: '...', ... })
        }
      } catch (e) {
        console.error('Invalid token:', e);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const setRole = (newRole, newUser) => {
    setRoleState(newRole);
    setUserState(newUser);
    // The token is already in localStorage from the Login page
  };

  const logout = () => {
    localStorage.removeItem('token');
    setRoleState(null);
    setUserState(null);
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
