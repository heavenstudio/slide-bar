/**
 * API Service
 * Handles communication with Supabase backend
 *
 * This service delegates all API calls to the Supabase API layer.
 * Express backend has been removed.
 */

export {
  demoLogin,
  getSession,
  signOut,
  getImages,
  uploadImage,
  deleteImage,
} from './supabaseApi.js';
