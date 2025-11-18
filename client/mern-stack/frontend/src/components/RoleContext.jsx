import { createContext, useState, useContext, useEffect } from 'react'

const RoleContext = createContext()

export function RoleProvider({ children }) {
  // Initialize role from localStorage, or default to 'provider' if not set
  const [role, setRole] = useState(() => {
    try {
      const savedRole = localStorage.getItem('userRole')
      return savedRole || 'provider'
    } catch (e) {
      return 'provider'
    }
  })

  // Persist role to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('userRole', role)
    } catch (e) {
      console.error('Failed to save role to localStorage:', e)
    }
  }, [role])

  return (
    <RoleContext.Provider value={{ role, setRole }}>
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
