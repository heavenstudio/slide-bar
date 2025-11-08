/**
 * Supabase API Service
 * Handles communication with Supabase directly (no Express backend)
 *
 * This is the new implementation that will replace the Express-based API
 */

import { supabase } from './supabase.js';

/**
 * Demo login credentials
 * TODO: These should be environment variables
 */
const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'demo-password-123';

/**
 * Perform demo login using Supabase Auth
 * @returns {Promise<Object>} User data and token
 */
export const demoLogin = async () => {
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
 * @returns {Promise<Object|null>} Current session or null
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
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Get all images from Supabase
 * @returns {Promise<Object>} Object with images array
 */
export const getImages = async () => {
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
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} Uploaded image data
 */
export const uploadImage = async (file) => {
  // Generate unique filename
  // Support both File and Blob objects (Blob used in tests to work around jsdom limitations)
  const fileName = file.name || 'image.jpg';
  const fileId = crypto.randomUUID();
  const fileExt = fileName.split('.').pop();
  const filePath = `${fileId}/${fileName}`;

  // Upload to Supabase Storage
  // Explicitly pass contentType to work around jsdom File API limitations in tests
  const { data: storageData, error: storageError } = await supabase.storage
    .from('images')
    .upload(filePath, file, {
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
 * @param {string} imageId - Image ID to delete
 * @returns {Promise<Object>} Deletion response
 */
export const deleteImage = async (imageId) => {
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
