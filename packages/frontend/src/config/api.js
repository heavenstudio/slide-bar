/**
 * API Configuration
 *
 * Supports both development and production environments:
 * - Development: Uses Vite proxy (/api -> http://localhost:3000)
 * - Production: Uses environment variable or same-origin
 */

// In production, VITE_API_URL can be set to the backend URL
// e.g., https://slidebar-api.onrender.com
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get the full API URL for a given endpoint
 * @param {string} path - API path (e.g., '/api/auth/demo-login')
 * @returns {string} Full URL
 */
export function getApiUrl(path) {
  // If path starts with http:// or https://, it's already absolute
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // If API_BASE_URL is set, use it (production)
  // Otherwise, use relative path (development with proxy)
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}

/**
 * Fetch wrapper that automatically uses the correct API URL
 * @param {string} path - API path
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const url = getApiUrl(path);
  return fetch(url, options);
}

export default {
  getApiUrl,
  apiFetch,
};
