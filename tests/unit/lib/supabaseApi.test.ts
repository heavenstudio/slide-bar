/**
 * Supabase API Integration Tests
 * Tests for the Supabase-based API layer using real Supabase instance
 *
 * These are integration tests that connect to a local Supabase instance
 * running at http://127.0.0.1:54321 (configured in vitest.config.ts)
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

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  demoLogin,
  getSession,
  signOut,
  getImages,
  uploadImage,
  deleteImage,
  getOrganizationSettings,
  updateOrganizationSettings,
} from '../../../src/lib/supabaseApi';
import { setupSupabaseCleanup, cleanDatabase, createMockImageFile } from '../../helpers/supabase';
import { createMockStorageData } from '../../helpers/fixtures';

// Setup automatic database cleanup after each test
setupSupabaseCleanup();

describe('Supabase API - Authentication', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      const { supabase } = await import('../../../src/lib/supabase');

      // Use vi.spyOn for cleaner mocking
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid credentials',
          name: 'AuthError',
          status: 401,
        } as any,
      });

      await expect(demoLogin()).rejects.toThrow('Invalid credentials');
    });

    it('should throw error when no session is created', async () => {
      const { supabase } = await import('../../../src/lib/supabase');

      // Use vi.spyOn for cleaner mocking
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      } as any);

      await expect(demoLogin()).rejects.toThrow('Login failed: No session created');
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
      const { supabase } = await import('../../../src/lib/supabase');
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
      const { supabase } = await import('../../../src/lib/supabase');

      // Use vi.spyOn for cleaner mocking
      vi.spyOn(supabase.auth, 'signOut').mockResolvedValue({
        error: {
          message: 'Sign out failed',
          name: 'AuthError',
          status: 500,
        } as any,
      });

      await expect(signOut()).rejects.toThrow('Sign out failed');
    });
  });
});

describe('Supabase API - Images', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      const { supabase } = await import('../../../src/lib/supabase');

      // Use vi.spyOn for cleaner mocking (auto-restored by vi.clearAllMocks)
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } })),
        })),
      } as any);

      await expect(getImages()).rejects.toThrow('Database error');
    });
  });
});

describe('Supabase API - Image Operations', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      const { supabase } = await import('../../../src/lib/supabase');

      // Ensure user is signed out
      await supabase.auth.signOut();

      const mockFile = createMockImageFile('test.jpg');

      await expect(uploadImage(mockFile)).rejects.toThrow();
    });

    it('should throw error when storage upload fails', async () => {
      await demoLogin();

      const { supabase } = await import('../../../src/lib/supabase');

      // Use vi.spyOn for storage mock (auto-restored by vi.clearAllMocks)
      vi.spyOn(supabase.storage, 'from').mockReturnValue({
        upload: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'Storage upload failed' } }),
      } as any);

      const mockFile = createMockImageFile('test.jpg');

      await expect(uploadImage(mockFile)).rejects.toThrow('Storage upload failed');
    });

    it('should throw error when user data fetch fails', async () => {
      await demoLogin();

      const { supabase } = await import('../../../src/lib/supabase');

      // Mock successful storage upload
      const mockStorageData = createMockStorageData();
      vi.spyOn(supabase.storage, 'from').mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: mockStorageData, error: null }),
        getPublicUrl: vi
          .fn()
          .mockReturnValue({ data: { publicUrl: 'http://example.com/test.jpg' } }),
      } as any);

      // Mock failed user data fetch
      const originalFrom = supabase.from.bind(supabase);
      vi.spyOn(supabase, 'from').mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi
                  .fn()
                  .mockResolvedValue({ data: null, error: { message: 'User fetch failed' } }),
              })),
            })),
          } as any;
        }
        // For other tables, use original
        return originalFrom(table);
      });

      const mockFile = createMockImageFile('test.jpg');

      await expect(uploadImage(mockFile)).rejects.toThrow('Failed to get user organization');
    });

    it('should throw error when database insert fails', async () => {
      await demoLogin();

      const { supabase } = await import('../../../src/lib/supabase');

      // Mock successful storage upload
      const mockStorageData = createMockStorageData();
      vi.spyOn(supabase.storage, 'from').mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: mockStorageData, error: null }),
        getPublicUrl: vi
          .fn()
          .mockReturnValue({ data: { publicUrl: 'http://example.com/test.jpg' } }),
      } as any);

      // Mock database operations
      const originalFrom = supabase.from.bind(supabase);
      vi.spyOn(supabase, 'from').mockImplementation((table) => {
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
          } as any;
        } else if (table === 'images') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi
                  .fn()
                  .mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
              })),
            })),
          } as any;
        }
        return originalFrom(table);
      });

      const mockFile = createMockImageFile('test.jpg');

      await expect(uploadImage(mockFile)).rejects.toThrow('Insert failed');
    });
  });
});

describe('Supabase API - Image Deletion', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

      const { supabase } = await import('../../../src/lib/supabase');

      // Use vi.spyOn for storage mock (auto-restored by vi.clearAllMocks)
      vi.spyOn(supabase.storage, 'from').mockReturnValue({
        remove: vi.fn().mockResolvedValue({ error: { message: 'Storage delete failed' } }),
      } as any);

      await expect(deleteImage(uploadedImage.id)).rejects.toThrow('Storage delete failed');
    });

    it('should throw error when database deletion fails', async () => {
      await demoLogin();

      // Upload an image first
      const mockFile = createMockImageFile('test.jpg');
      const uploadedImage = await uploadImage(mockFile);

      const { supabase } = await import('../../../src/lib/supabase');

      // Mock storage delete to succeed
      vi.spyOn(supabase.storage, 'from').mockReturnValue({
        remove: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      // Mock database operations
      let callCount = 0;
      vi.spyOn(supabase, 'from').mockImplementation(() => {
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
          } as any;
        } else {
          // Second call: delete - fail
          return {
            delete: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: { message: 'Database delete failed' } }),
            })),
          } as any;
        }
      });

      await expect(deleteImage(uploadedImage.id)).rejects.toThrow('Database delete failed');
    });
  });

  describe('Organization Settings', () => {
    it('should get organization settings successfully', async () => {
      await demoLogin();

      // First, create settings
      await updateOrganizationSettings(7500);

      // Then retrieve them
      const settings = await getOrganizationSettings();

      expect(settings).toBeDefined();
      expect(settings?.default_slide_duration).toBe(7500);
      expect(settings?.organization_id).toBeDefined();
    });

    it('should return null when no organization settings exist', async () => {
      await demoLogin();

      const settings = await getOrganizationSettings();

      // Should be null since we haven't created any settings yet
      expect(settings).toBeNull();
    });

    it('should update organization settings successfully (insert)', async () => {
      await demoLogin();

      const result = await updateOrganizationSettings(6000);

      expect(result.success).toBe(true);

      // Verify settings were saved
      const settings = await getOrganizationSettings();
      expect(settings?.default_slide_duration).toBe(6000);
    });

    it('should update organization settings successfully (upsert)', async () => {
      await demoLogin();

      // Create initial settings
      await updateOrganizationSettings(5000);

      // Update them
      const result = await updateOrganizationSettings(8000);

      expect(result.success).toBe(true);

      // Verify settings were updated
      const settings = await getOrganizationSettings();
      expect(settings?.default_slide_duration).toBe(8000);
    });

    it('should throw error when user is not authenticated (getOrganizationSettings)', async () => {
      const { supabase } = await import('../../../src/lib/supabase');

      // Mock auth.getUser to return no user
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      await expect(getOrganizationSettings()).rejects.toThrow('User not authenticated');
    });

    it('should throw error when user is not authenticated (updateOrganizationSettings)', async () => {
      const { supabase } = await import('../../../src/lib/supabase');

      // Mock auth.getUser to return no user
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      await expect(updateOrganizationSettings(5000)).rejects.toThrow('User not authenticated');
    });

    it('should throw error when user organization fetch fails (getOrganizationSettings)', async () => {
      await demoLogin();

      const { supabase } = await import('../../../src/lib/supabase');

      // Mock user data fetch failure
      vi.spyOn(supabase, 'from').mockImplementation(
        () =>
          ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi
                  .fn()
                  .mockResolvedValue({ data: null, error: { message: 'User fetch failed' } }),
              })),
            })),
          }) as any
      );

      await expect(getOrganizationSettings()).rejects.toThrow('Failed to get user organization');
    });

    it('should throw error when user organization not found (getOrganizationSettings)', async () => {
      await demoLogin();

      const { supabase } = await import('../../../src/lib/supabase');

      // Mock user data fetch returning null
      vi.spyOn(supabase, 'from').mockImplementation(
        () =>
          ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              })),
            })),
          }) as any
      );

      await expect(getOrganizationSettings()).rejects.toThrow('User organization not found');
    });

    it('should throw error when settings fetch fails', async () => {
      await demoLogin();

      const { supabase } = await import('../../../src/lib/supabase');

      let callCount = 0;
      vi.spyOn(supabase, 'from').mockImplementation((_table) => {
        callCount++;
        if (callCount === 1) {
          // First call: users table - succeed
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { organization_id: 'test-org-id' },
                  error: null,
                }),
              })),
            })),
          } as any;
        } else {
          // Second call: organization_settings table - fail
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi
                  .fn()
                  .mockResolvedValue({ data: null, error: { message: 'Settings fetch failed' } }),
              })),
            })),
          } as any;
        }
      });

      await expect(getOrganizationSettings()).rejects.toThrow('Settings fetch failed');
    });

    it('should throw error when settings upsert fails', async () => {
      await demoLogin();

      const { supabase } = await import('../../../src/lib/supabase');

      let callCount = 0;
      vi.spyOn(supabase, 'from').mockImplementation((_table) => {
        callCount++;
        if (callCount === 1) {
          // First call: users table - succeed
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { organization_id: 'test-org-id' },
                  error: null,
                }),
              })),
            })),
          } as any;
        } else {
          // Second call: organization_settings upsert - fail
          return {
            upsert: vi.fn().mockResolvedValue({ error: { message: 'Upsert failed' } }),
          } as any;
        }
      });

      await expect(updateOrganizationSettings(5000)).rejects.toThrow('Upsert failed');
    });
  });
});
