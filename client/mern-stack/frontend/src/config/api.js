/**
 * Centralized API Configuration
 * Uses environment variable in production, localhost in development
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';

export { API_URL, SOCKET_URL };

