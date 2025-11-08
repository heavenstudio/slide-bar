/**
 * API Service
 * Handles communication with backend API
 *
 * Feature Flag: VITE_USE_SUPABASE
 * - false (default): Use Express backend API
 * - true: Use Supabase directly
 */

import * as supabaseApi from './supabaseApi.js';

const API_BASE_URL = '/api';
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

/**
 * Perform demo login and get JWT token
 * @returns {Promise<Object>} User data and token
 */
export const demoLogin = async () => {
  // Use Supabase if feature flag is enabled
  if (USE_SUPABASE) {
    return supabaseApi.demoLogin();
  }

  // Otherwise use Express backend
  const response = await fetch(`${API_BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();

  // Automatically save token
  setAuthToken(data.token);

  return data;
};

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Set auth token in localStorage
 */
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

/**
 * Clear auth token
 */
export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Upload an image
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} Uploaded image data
 */
export const uploadImage = async (file) => {
  // Use Supabase if feature flag is enabled
  if (USE_SUPABASE) {
    return supabaseApi.uploadImage(file);
  }

  // Otherwise use Express backend
  const formData = new FormData();
  formData.append('image', file);

  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return await response.json();
};

/**
 * Get all images
 * @returns {Promise<Array>} List of images
 */
export const getImages = async () => {
  // Use Supabase if feature flag is enabled
  if (USE_SUPABASE) {
    return supabaseApi.getImages();
  }

  // Otherwise use Express backend
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/upload`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch images');
  }

  return await response.json();
};

/**
 * Delete an image
 * @param {string} imageId - Image ID to delete
 * @returns {Promise<Object>} Deletion response
 */
export const deleteImage = async (imageId) => {
  // Use Supabase if feature flag is enabled
  if (USE_SUPABASE) {
    return supabaseApi.deleteImage(imageId);
  }

  // Otherwise use Express backend
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/upload/${imageId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete image');
  }

  return await response.json();
};
