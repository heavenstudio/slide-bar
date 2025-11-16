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
  updateImageDuration,
  getOrganizationSettings,
  updateOrganizationSettings,
  type LoginResponse,
  type ImagesResponse,
  type DeletionResponse,
  type UpdateResponse,
  type OrganizationSettings,
  type FileUpload,
} from './supabaseApi';
