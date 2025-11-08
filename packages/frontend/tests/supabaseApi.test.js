/**
 * Supabase API Integration Tests
 * Tests for the Supabase-based API layer using real Supabase instance
 *
 * These are integration tests that connect to a local Supabase instance
 * running at http://127.0.0.1:54321 (configured in vitest.config.js)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { demoLogin, getImages, uploadImage, deleteImage } from '../src/lib/supabaseApi.js';
import {
  useSupabaseCleanup,
  cleanDatabase,
  createMockImageFile,
} from './helpers/supabase.js';

// Setup automatic database cleanup after each test
useSupabaseCleanup();

describe('Supabase API - Authentication', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('demoLogin', () => {
    it('should successfully login with demo credentials', async () => {
      const result = await demoLogin();

      // Verify we got a token and user back
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.token).toBeTruthy();
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
    });
  });
});

describe('Supabase API - Images', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('getImages', () => {
    it('should return empty array when no images exist', async () => {
      const result = await getImages();

      expect(result).toHaveProperty('images');
      expect(result.images).toEqual([]);
    });

    it('should fetch images after uploading', async () => {
      // Login first
      await demoLogin();

      // Create a test image file
      const mockFile = createMockImageFile('test.jpg');

      // Upload an image
      await uploadImage(mockFile);

      // Fetch images
      const result = await getImages();

      expect(result).toHaveProperty('images');
      expect(result.images).toHaveLength(1);
      expect(result.images[0]).toHaveProperty('id');
      expect(result.images[0]).toHaveProperty('url');
      expect(result.images[0]).toHaveProperty('filename');
    });
  });

  describe('uploadImage', () => {
    it('should upload image to Supabase Storage and create database record', async () => {
      // Login first
      await demoLogin();

      // Create a test image file
      const mockFile = createMockImageFile('test.jpg', 'test content');

      const result = await uploadImage(mockFile);

      // Verify the upload result
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('original_name', 'test.jpg');
      expect(result).toHaveProperty('mime_type', 'image/jpeg');
      expect(result).toHaveProperty('size');
    });

    it('should throw error when not authenticated', async () => {
      // Import supabase client to sign out
      const { supabase } = await import('../src/lib/supabase.js');

      // Ensure user is signed out
      await supabase.auth.signOut();

      const mockFile = createMockImageFile('test.jpg');

      await expect(uploadImage(mockFile)).rejects.toThrow();
    });
  });

  describe('deleteImage', () => {
    it('should delete image from database and storage', async () => {
      // Login first
      await demoLogin();

      // Create and upload a test image
      const mockFile = createMockImageFile('test.jpg');
      const uploadedImage = await uploadImage(mockFile);

      // Delete the image
      const result = await deleteImage(uploadedImage.id);

      expect(result).toHaveProperty('success', true);

      // Verify image is gone
      const images = await getImages();
      expect(images.images).toHaveLength(0);
    });

    it('should throw error when image not found', async () => {
      await expect(deleteImage('non-existent-id')).rejects.toThrow();
    });
  });
});
