/**
 * Supabase API Tests
 * Tests for the new Supabase-based API layer
 *
 * Following TDD: These tests should FAIL initially (RED phase)
 * Then we implement the functions to make them pass (GREEN phase)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '../src/lib/supabase.js';

// Mock Supabase client
vi.mock('../src/lib/supabase.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

// Import after mocking
import { demoLogin, getImages, uploadImage, deleteImage } from '../src/lib/supabaseApi.js';

describe('Supabase API - Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('demoLogin', () => {
    it('should successfully login with demo credentials', async () => {
      const mockSession = {
        access_token: 'mock-token-123',
        user: {
          id: 'user-uuid-123',
          email: 'demo@example.com',
        },
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await demoLogin();

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: expect.any(String),
        password: expect.any(String),
      });

      expect(result).toEqual({
        token: 'mock-token-123',
        user: {
          id: 'user-uuid-123',
          email: 'demo@example.com',
        },
      });
    });

    it('should throw error when login fails', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid credentials' },
      });

      await expect(demoLogin()).rejects.toThrow('Invalid credentials');
    });
  });
});

describe('Supabase API - Images', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getImages', () => {
    it('should fetch all images for authenticated user', async () => {
      const mockImages = [
        {
          id: 'img-1',
          filename: 'test1.jpg',
          original_name: 'test1.jpg',
          url: 'https://example.com/test1.jpg',
          created_at: '2025-11-08T10:00:00Z',
        },
        {
          id: 'img-2',
          filename: 'test2.jpg',
          original_name: 'test2.jpg',
          url: 'https://example.com/test2.jpg',
          created_at: '2025-11-08T11:00:00Z',
        },
      ];

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockImages,
          error: null,
        }),
      };

      supabase.from.mockReturnValue(mockFrom);

      const result = await getImages();

      expect(supabase.from).toHaveBeenCalledWith('images');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
      expect(result).toEqual(mockImages);
    });

    it('should return empty array when no images exist', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      supabase.from.mockReturnValue(mockFrom);

      const result = await getImages();

      expect(result).toEqual([]);
    });

    it('should throw error when fetch fails', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      supabase.from.mockReturnValue(mockFrom);

      await expect(getImages()).rejects.toThrow('Database error');
    });
  });

  describe('uploadImage', () => {
    it('should upload image to Supabase Storage and create database record', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockFileId = 'file-uuid-123';
      const mockPublicUrl = 'https://example.com/storage/test.jpg';

      // Mock storage upload
      const mockStorageBucket = {
        upload: vi.fn().mockResolvedValue({
          data: { path: `${mockFileId}/test.jpg` },
          error: null,
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: mockPublicUrl },
        }),
      };

      supabase.storage.from.mockReturnValue(mockStorageBucket);

      // Mock database insert
      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'img-uuid-123',
            filename: 'test.jpg',
            original_name: 'test.jpg',
            url: mockPublicUrl,
            mime_type: 'image/jpeg',
            size: 4,
          },
          error: null,
        }),
      };

      supabase.from.mockReturnValue(mockFrom);

      const result = await uploadImage(mockFile);

      expect(supabase.storage.from).toHaveBeenCalledWith('images');
      expect(mockStorageBucket.upload).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('images');
      expect(mockFrom.insert).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('url', mockPublicUrl);
    });

    it('should throw error when storage upload fails', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const mockStorageBucket = {
        upload: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Storage error' },
        }),
      };

      supabase.storage.from.mockReturnValue(mockStorageBucket);

      await expect(uploadImage(mockFile)).rejects.toThrow('Storage error');
    });

    it('should throw error when database insert fails', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockFileId = 'file-uuid-123';
      const mockPublicUrl = 'https://example.com/storage/test.jpg';

      // Mock successful storage upload
      const mockStorageBucket = {
        upload: vi.fn().mockResolvedValue({
          data: { path: `${mockFileId}/test.jpg` },
          error: null,
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: mockPublicUrl },
        }),
      };

      supabase.storage.from.mockReturnValue(mockStorageBucket);

      // Mock failed database insert
      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database insert error' },
        }),
      };

      supabase.from.mockReturnValue(mockFrom);

      await expect(uploadImage(mockFile)).rejects.toThrow('Database insert error');
    });
  });

  describe('deleteImage', () => {
    it('should delete image from database and storage', async () => {
      const imageId = 'img-uuid-123';

      // Mock database fetch to get image path
      const mockFromSelect = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: imageId,
            path: 'file-uuid-123/test.jpg',
          },
          error: null,
        }),
      };

      // Mock database delete
      const mockFromDelete = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: {},
          error: null,
        }),
      };

      supabase.from.mockReturnValueOnce(mockFromSelect);
      supabase.from.mockReturnValueOnce(mockFromDelete);

      // Mock storage delete
      const mockStorageBucket = {
        remove: vi.fn().mockResolvedValue({
          data: {},
          error: null,
        }),
      };

      supabase.storage.from.mockReturnValue(mockStorageBucket);

      const result = await deleteImage(imageId);

      expect(supabase.from).toHaveBeenCalledWith('images');
      expect(mockFromSelect.eq).toHaveBeenCalledWith('id', imageId);
      expect(mockStorageBucket.remove).toHaveBeenCalledWith(['file-uuid-123/test.jpg']);
      expect(mockFromDelete.delete).toHaveBeenCalled();
      expect(result).toHaveProperty('success', true);
    });

    it('should throw error when image not found', async () => {
      const imageId = 'non-existent-id';

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Image not found' },
        }),
      };

      supabase.from.mockReturnValue(mockFrom);

      await expect(deleteImage(imageId)).rejects.toThrow('Image not found');
    });

    it('should throw error when storage delete fails', async () => {
      const imageId = 'img-uuid-123';

      const mockFromSelect = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: imageId,
            path: 'file-uuid-123/test.jpg',
          },
          error: null,
        }),
      };

      supabase.from.mockReturnValue(mockFromSelect);

      const mockStorageBucket = {
        remove: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Storage delete error' },
        }),
      };

      supabase.storage.from.mockReturnValue(mockStorageBucket);

      await expect(deleteImage(imageId)).rejects.toThrow('Storage delete error');
    });
  });
});
