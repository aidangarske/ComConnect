import { createContext, useState, useContext } from 'react'

const RoleContext = createContext()

export function RoleProvider({ children }) {
  const [role, setRole] = useState('provider') // default to provider

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
