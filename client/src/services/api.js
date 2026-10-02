/**
 * =========================================================================
 * API Service Client (services/api.js)
 * =========================================================================
 * Centralized HTTP client wrapper using browser standard `fetch` API.
 * 
 * VIVA EXPLANATION:
 * - Automatically attaches 'Authorization: Bearer <token>' to every outgoing
 *   request if a JWT token is stored in localStorage.
 * - Handles JSON serialization and parses server error responses cleanly.
 * - Provides modular methods: api.get(), api.post(), api.put(), api.delete().
 */

const API_BASE_URL = '/api';

/**
 * Universal request handler
 * @param {string} endpoint - API route (e.g. '/tasks' or '/auth/login')
 * @param {object} options - fetch options (method, headers, body)
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('wad_todo_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If token expired or unauthorized, we can trigger custom event or message
      if (response.status === 401 && token) {
        console.warn('Session expired or unauthorized request.');
      }
      throw new Error(data.message || `HTTP Error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
};

export default api;
