/**
 * Centralized API Configuration
 * Uses environment variable in production, localhost in development
 */
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' 
  ? 'http://localhost:8080/api'
  : 'https://comconnect-backend-xzwk.onrender.com/api');

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.MODE === 'development'
  ? 'http://localhost:8080'
  : 'https://comconnect-backend-xzwk.onrender.com');

export { API_URL, SOCKET_URL };

