import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createUploadRouter } from '../../src/routes/upload.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock upload service
const mockUploadService = {
  saveImageMetadata: vi.fn(),
  getImagesByOrganization: vi.fn(),
  deleteImage: vi.fn(),
};

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = {
    id: 'user-123',
    organizationId: 'org-123',
  };
  next();
};

describe('Upload Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/upload', createUploadRouter(mockUploadService, mockAuthMiddleware));
    vi.clearAllMocks();
  });

  describe('POST /api/upload', () => {
    it('should upload image successfully', async () => {
      const mockImage = {
        id: 'img-1',
        filename: 'image-123.jpg',
        originalName: 'test.jpg',
        url: '/uploads/image-123.jpg',
        size: 50000,
        mimeType: 'image/jpeg',
      };

      mockUploadService.saveImageMetadata.mockResolvedValue(mockImage);

      const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');

      const response = await request(app).post('/api/upload').attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        message: 'Image uploaded successfully',
        image: expect.objectContaining({
          id: 'img-1',
          url: '/uploads/image-123.jpg',
        }),
      });
    });

    it('should return 400 if no file is uploaded', async () => {
      const response = await request(app).post('/api/upload');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'No file uploaded',
      });
    });

    it('should throw error if no auth middleware is provided', () => {
      // Creating router without auth middleware should throw
      expect(() => {
        createUploadRouter(mockUploadService, null);
      }).toThrow('Authentication middleware is required for upload routes');
    });
  });

  describe('GET /api/upload', () => {
    it('should return all images for organization', async () => {
      const mockImages = [
        {
          id: 'img-1',
          filename: 'image-1.jpg',
          url: '/uploads/image-1.jpg',
        },
        {
          id: 'img-2',
          filename: 'image-2.png',
          url: '/uploads/image-2.png',
        },
      ];

      mockUploadService.getImagesByOrganization.mockResolvedValue(mockImages);

      const response = await request(app).get('/api/upload');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        images: mockImages,
        count: 2,
      });

      expect(mockUploadService.getImagesByOrganization).toHaveBeenCalledWith('org-123');
    });

    it('should return empty array if no images found', async () => {
      mockUploadService.getImagesByOrganization.mockResolvedValue([]);

      const response = await request(app).get('/api/upload');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        images: [],
        count: 0,
      });
    });
  });

  describe('DELETE /api/upload/:id', () => {
    it('should delete image successfully', async () => {
      const mockDeletedImage = {
        id: 'img-1',
        filename: 'image-1.jpg',
      };

      mockUploadService.deleteImage.mockResolvedValue(mockDeletedImage);

      const response = await request(app).delete('/api/upload/img-1');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Image deleted successfully',
      });

      expect(mockUploadService.deleteImage).toHaveBeenCalledWith('img-1', 'org-123');
    });

    it('should return 404 if image not found', async () => {
      mockUploadService.deleteImage.mockRejectedValue(new Error('Image not found'));

      const response = await request(app).delete('/api/upload/non-existent');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: 'Image not found',
      });
    });

    it('should return 403 if unauthorized', async () => {
      mockUploadService.deleteImage.mockRejectedValue(
        new Error('Unauthorized to delete this image')
      );

      const response = await request(app).delete('/api/upload/img-1');

      expect(response.status).toBe(403);
    });
  });
});
