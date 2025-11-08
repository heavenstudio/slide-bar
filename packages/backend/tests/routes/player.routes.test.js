import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createPlayerRouter } from '../../src/routes/player.routes.js';

describe('Player Routes', () => {
  let app;
  let mockUploadService;

  beforeEach(() => {
    // Create Express app
    app = express();
    app.use(express.json());

    // Mock upload service
    mockUploadService = {
      getImagesByOrganization: vi.fn(),
    };

    // Mount router
    app.use('/api/player', createPlayerRouter(mockUploadService));
  });

  describe('GET /api/player/images', () => {
    it('should return images without requiring authentication', async () => {
      const mockImages = [
        {
          id: 1,
          filename: 'test.jpg',
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockUploadService.getImagesByOrganization.mockResolvedValue(mockImages);

      const response = await request(app).get('/api/player/images').expect(200);

      expect(response.body).toHaveProperty('images');
      expect(response.body).toHaveProperty('count');
      expect(response.body.images).toHaveLength(1);
    });

    it('should accept organization query parameter', async () => {
      mockUploadService.getImagesByOrganization.mockResolvedValue([]);

      await request(app).get('/api/player/images?org=5').expect(200);

      expect(mockUploadService.getImagesByOrganization).toHaveBeenCalledWith('5');
    });

    it('should work without any authentication headers', async () => {
      mockUploadService.getImagesByOrganization.mockResolvedValue([]);

      // No Authorization header - should still work (public route)
      const response = await request(app).get('/api/player/images').expect(200);

      expect(response.body.images).toEqual([]);
    });
  });
});
