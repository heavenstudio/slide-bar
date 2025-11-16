/**
 * Supabase API Service
 * Handles all backend communication through Supabase
 */

import { supabase } from './supabase';
import { Image } from '../types/database';

/**
 * Demo login credentials
 * TODO: These should be environment variables
 */
const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'demo-password-123';

/**
 * Login response type
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string | undefined;
  };
}

/**
 * Images response type
 */
export interface ImagesResponse {
  images: Image[];
}

/**
 * Deletion response type
 */
export interface DeletionResponse {
  success: boolean;
}

/**
 * File-like object interface (supports both File and mock objects in tests)
 */
export interface FileUpload {
  name?: string;
  type?: string;
  size?: number;
}

/**
 * Perform demo login using Supabase Auth
 */
export const demoLogin = async (): Promise<LoginResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session) {
    throw new Error('Login failed: No session created');
  }

  return {
    token: data.session.access_token,
    user: {
      id: data.session.user.id,
      email: data.session.user.email,
    },
  };
};

/**
 * Get current session
 */
export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Get all images from Supabase
 */
export const getImages = async (): Promise<ImagesResponse> => {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return { images: data || [] };
};

/**
 * Upload an image to Supabase Storage and create database record
 */
export const uploadImage = async (file: FileUpload): Promise<Image> => {
  // Generate unique filename
  // Support both File and Blob objects (Blob used in tests to work around jsdom limitations)
  const fileName = file.name || 'image.jpg';
  const fileId = crypto.randomUUID();
  const filePath = `${fileId}/${fileName}`;

  // Upload to Supabase Storage
  // Explicitly pass contentType to work around jsdom File API limitations in tests
  const { data: storageData, error: storageError } = await supabase.storage
    .from('images')
    .upload(filePath, file as File, {
      contentType: file.type || 'image/jpeg',
    });

  if (storageError) {
    throw new Error(storageError.message);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('images').getPublicUrl(filePath);

  // Get current user's organization_id
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();

  if (userError) {
    throw new Error(`Failed to get user organization: ${userError.message}`);
  }

  if (!userData) {
    throw new Error('User organization not found');
  }

  // Get organization settings for default duration
  const { data: orgSettings } = await supabase
    .from('organization_settings')
    .select('default_slide_duration')
    .eq('organization_id', userData.organization_id)
    .maybeSingle();

  const displayDuration = orgSettings?.default_slide_duration || 5000;

  // Create database record
  const { data: imageData, error: dbError } = await supabase
    .from('images')
    .insert({
      filename: fileName,
      original_name: fileName,
      mime_type: file.type || 'image/jpeg',
      size: file.size || 0,
      path: storageData.path,
      url: publicUrl,
      organization_id: userData.organization_id,
      display_duration: displayDuration,
    })
    .select()
    .single();

  if (dbError) {
    throw new Error(dbError.message);
  }

  return imageData;
};

/**
 * Delete an image from Supabase Storage and database
 */
export const deleteImage = async (imageId: string): Promise<DeletionResponse> => {
  // First, get the image to find its storage path
  const { data: image, error: fetchError } = await supabase
    .from('images')
    .select('*')
    .eq('id', imageId)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage.from('images').remove([image.path]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  // Delete from database
  const { error: dbError } = await supabase.from('images').delete().eq('id', imageId);

  if (dbError) {
    throw new Error(dbError.message);
  }

  return { success: true };
};

/**
 * Update response type
 */
export interface UpdateResponse {
  success: boolean;
}

/**
 * Update an image's display duration
 */
export const updateImageDuration = async (
  imageId: string,
  durationMs: number
): Promise<UpdateResponse> => {
  const { error } = await supabase
    .from('images')
    .update({ display_duration: durationMs })
    .eq('id', imageId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
};

/**
 * Organization settings type
 */
export interface OrganizationSettings {
  id: string;
  organization_id: string;
  default_slide_duration: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get organization settings for the current user's organization
 */
export const getOrganizationSettings = async (): Promise<OrganizationSettings | null> => {
  // Get current user's organization_id
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();

  if (userError) {
    throw new Error(`Failed to get user organization: ${userError.message}`);
  }

  if (!userData) {
    throw new Error('User organization not found');
  }

  // Get organization settings
  const { data, error } = await supabase
    .from('organization_settings')
    .select('*')
    .eq('organization_id', userData.organization_id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Update organization settings (creates if doesn't exist)
 */
export const updateOrganizationSettings = async (
  defaultSlideDuration: number
): Promise<UpdateResponse> => {
  // Get current user's organization_id
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();

  if (userError) {
    throw new Error(`Failed to get user organization: ${userError.message}`);
  }

  if (!userData) {
    throw new Error('User organization not found');
  }

  // Upsert organization settings
  const { error } = await supabase.from('organization_settings').upsert(
    {
      organization_id: userData.organization_id,
      default_slide_duration: defaultSlideDuration,
    },
    {
      onConflict: 'organization_id',
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
};
