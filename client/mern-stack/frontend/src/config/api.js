/**
 * Centralized API Configuration
 * Uses environment variable in production, localhost in development
 */
const isDevelopment = import.meta.env.DEV;
const API_URL = isDevelopment 
  ? 'http://localhost:8080/api'
  : (import.meta.env.VITE_API_URL || 'https://comconnect-backend-xzwk.onrender.com/api');
const SOCKET_URL = isDevelopment
  ? 'http://localhost:8080'
  : (import.meta.env.VITE_SOCKET_URL || 'https://comconnect-backend-xzwk.onrender.com');

export { API_URL, SOCKET_URL };

