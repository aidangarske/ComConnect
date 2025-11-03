import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { RoleProvider } from './components/RoleContext'
import './index.css'
import App from './App.jsx'

// Set dark mode before rendering
if (typeof window !== 'undefined') {
  document.documentElement.setAttribute('data-theme', 'dark')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <App />
      </RoleProvider>
    </BrowserRouter>
  </StrictMode>,
)
