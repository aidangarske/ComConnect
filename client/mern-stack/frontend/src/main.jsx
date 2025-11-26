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

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);

    // If the backend says "Unauthorized" (401) or "Forbidden" (403/Banned)
    if (response.status === 401 || response.status === 403) {
      console.warn("Global fetch interceptor: User is unauthorized or banned.");
      
      // 1. Clear local storage to remove the bad token
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 2. Force redirect to login if we aren't already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return response;
  } catch (error) {
    // Network errors (server down, etc.) pass through here
    throw error;
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <App />
      </RoleProvider>
    </BrowserRouter>
  </StrictMode>,
)
