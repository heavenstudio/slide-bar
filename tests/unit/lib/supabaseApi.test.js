/**
 * Supabase API Integration Tests
 * Tests for the Supabase-based API layer using real Supabase instance
 *
 * These are integration tests that connect to a local Supabase instance
 * running at http://127.0.0.1:54321 (configured in vitest.config.js)
 *
 * Testing approach: TDD (Test-Driven Development)
 * Coverage target: 95%+
 *
 * Test categories:
 * 1. Authentication (demoLogin, getSession, signOut)
 * 2. Image retrieval (getImages)
 * 3. Image upload (uploadImage with success and error cases)
 * 4. Image deletion (deleteImage with success and error cases)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  demoLogin,
  getSession,
  signOut,
  getImages,
  uploadImage,
  deleteImage,
} from '../../../src/lib/supabaseApi.js';
import {
  setupSupabaseCleanup,
  cleanDatabase,
  createMockImageFile,
} from '../../helpers/supabase.js';

// Setup automatic database cleanup after each test
setupSupabaseCleanup();

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

    it('should throw error when login fails (invalid credentials)', async () => {
      // Mock the supabase auth to simulate login failure
      const { supabase } = await import('../../../src/lib/supabase.js');
      const originalSignIn = supabase.auth.signInWithPassword;

      // Temporarily mock the signIn to return an error
      supabase.auth.signInWithPassword = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Invalid credentials' } });

      await expect(demoLogin()).rejects.toThrow('Invalid credentials');

      // Restore original
      supabase.auth.signInWithPassword = originalSignIn;
    });

    it('should throw error when no session is created', async () => {
      const { supabase } = await import('../../../src/lib/supabase.js');
      const originalSignIn = supabase.auth.signInWithPassword;

      // Mock to return data but no session
      supabase.auth.signInWithPassword = vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null });

      await expect(demoLogin()).rejects.toThrow('Login failed: No session created');

      // Restore
      supabase.auth.signInWithPassword = originalSignIn;
    });
  });

  describe('getSession', () => {
    it('should return current session when logged in', async () => {
      await demoLogin();

      const session = await getSession();

      expect(session).toBeTruthy();
      expect(session).toHaveProperty('access_token');
      expect(session).toHaveProperty('user');
    });

    it('should return null when not logged in', async () => {
      const { supabase } = await import('../../../src/lib/supabase.js');
      await supabase.auth.signOut();

      const session = await getSession();

      expect(session).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should successfully sign out user', async () => {
      await demoLogin();

      // Verify we're logged in
      let session = await getSession();
      expect(session).toBeTruthy();

      // Sign out
      await signOut();

      // Verify we're logged out
      session = await getSession();
      expect(session).toBeNull();
    });

    it('should throw error when sign out fails', async () => {
      const { supabase } = await import('../../../src/lib/supabase.js');
      const originalSignOut = supabase.auth.signOut;

      // Mock signOut to fail
      supabase.auth.signOut = vi.fn().mockResolvedValue({ error: { message: 'Sign out failed' } });

      await expect(signOut()).rejects.toThrow('Sign out failed');

      // Restore
      supabase.auth.signOut = originalSignOut;
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

    it('should throw error when database query fails', async () => {
      const { supabase } = await import('../../../src/lib/supabase.js');
      const originalFrom = supabase.from;

      // Mock the from method to simulate database error
      supabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } })),
        })),
      }));

      await expect(getImages()).rejects.toThrow('Database error');

      // Restore
      supabase.from = originalFrom;
    });
  });
});

describe('Supabase API - Image Operations', () => {
  beforeEach(async () => {
    await cleanDatabase();
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
      const { supabase } = await import('../../../src/lib/supabase.js');

      // Ensure user is signed out
      await supabase.auth.signOut();

      const mockFile = createMockImageFile('test.jpg');

      await expect(uploadImage(mockFile)).rejects.toThrow();
    });

    it('should throw error when storage upload fails', async () => {
      await demoLogin();

      const { supabase } = await import('../../../src/lib/supabase.js');
      const originalStorage = supabase.storage;

      // Mock storage to fail
      supabase.storage = {
        from: vi.fn(() => ({
          upload: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'Storage upload failed' } }),
        })),
      };

      const mockFile = createMockImageFile('test.jpg');

      await expect(uploadImage(mockFile)).rejects.toThrow('Storage upload failed');

      // Restore
      supabase.storage = originalStorage;
    });

    it('should throw error when user data fetch fails', async () => {
      await demoLogin();

      const { supabase } = await import('../../../src/lib/supabase.js');
      const originalFrom = supabase.from;
      const originalStorage = supabase.storage;

      // Mock successful storage upload
      const mockStorageData = { path: 'test-id/test.jpg' };
      supabase.storage = {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ data: mockStorageData, error: null }),
          getPublicUrl: vi
            .fn()
            .mockReturnValue({ data: { publicUrl: 'http://example.com/test.jpg' } }),
        })),
      };

      // Mock failed user data fetch
      let _callCount = 0;
      supabase.from = vi.fn((table) => {
        _callCount++;
        if (table === 'users') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi
                  .fn()
                  .mockResolvedValue({ data: null, error: { message: 'User fetch failed' } }),
              })),
            })),
          };
        }
        // For other tables, use original
        return originalFrom(table);
      });

      const mockFile = createMockImageFile('test.jpg');

      await expect(uploadImage(mockFile)).rejects.toThrow('Failed to get user organization');

      // Restore
      supabase.from = originalFrom;
      supabase.storage = originalStorage;
    });

    it('should throw error when database insert fails', async () => {
      await demoLogin();

      const { supabase } = await import('../../../src/lib/supabase.js');
      const originalFrom = supabase.from;
      const originalStorage = supabase.storage;

      // Mock successful storage upload
      const mockStorageData = { path: 'test-id/test.jpg' };
      supabase.storage = {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ data: mockStorageData, error: null }),
          getPublicUrl: vi
            .fn()
            .mockReturnValue({ data: { publicUrl: 'http://example.com/test.jpg' } }),
        })),
      };

      // Mock database operations
      let _callCount = 0;
      supabase.from = vi.fn((table) => {
        _callCount++;
        if (table === 'users') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { organization_id: 'org-123' },
                  error: null,
                }),
              })),
            })),
          };
        } else if (table === 'images') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi
                  .fn()
                  .mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
              })),
            })),
          };
        }
        return originalFrom(table);
      });

      const mockFile = createMockImageFile('test.jpg');

      await expect(uploadImage(mockFile)).rejects.toThrow('Insert failed');

      // Restore
      supabase.from = originalFrom;
      supabase.storage = originalStorage;
    });
  });
});

describe('Supabase API - Image Deletion', () => {
  beforeEach(async () => {
    await cleanDatabase();
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

    it('should throw error when storage deletion fails', async () => {
      await demoLogin();

      // Upload an image first
      const mockFile = createMockImageFile('test.jpg');
      const uploadedImage = await uploadImage(mockFile);

      const { supabase } = await import('../../../src/lib/supabase.js');
      const originalStorage = supabase.storage;

      // Mock storage delete to fail
      supabase.storage = {
        from: vi.fn(() => ({
          remove: vi.fn().mockResolvedValue({ error: { message: 'Storage delete failed' } }),
        })),
      };

      await expect(deleteImage(uploadedImage.id)).rejects.toThrow('Storage delete failed');

      // Restore
      supabase.storage = originalStorage;
    });

    it('should throw error when database deletion fails', async () => {
      await demoLogin();

      // Upload an image first
      const mockFile = createMockImageFile('test.jpg');
      const uploadedImage = await uploadImage(mockFile);

      const { supabase } = await import('../../../src/lib/supabase.js');
      const originalFrom = supabase.from;
      const originalStorage = supabase.storage;

      // Mock storage delete to succeed
      supabase.storage = {
        from: vi.fn(() => ({
          remove: vi.fn().mockResolvedValue({ error: null }),
        })),
      };

      // Mock database operations
      let callCount = 0;
      supabase.from = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          // First call: select (fetch image) - succeed
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: uploadedImage.id, path: 'test-path' },
                  error: null,
                }),
              })),
            })),
          };
        } else {
          // Second call: delete - fail
          return {
            delete: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: { message: 'Database delete failed' } }),
            })),
          };
        }
      });

      await expect(deleteImage(uploadedImage.id)).rejects.toThrow('Database delete failed');

      // Restore
      supabase.from = originalFrom;
      supabase.storage = originalStorage;
    });
  });
});
