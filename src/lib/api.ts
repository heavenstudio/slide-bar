/**
 * API Service
 * Delegates all API calls to the Supabase API layer
 */

export {
  demoLogin,
  getSession,
  signOut,
  getImages,
  uploadImage,
  deleteImage,
  type LoginResponse,
  type ImagesResponse,
  type DeletionResponse,
  type FileUpload,
} from './supabaseApi';
