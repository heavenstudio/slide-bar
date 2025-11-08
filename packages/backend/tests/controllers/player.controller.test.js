import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlayerController } from '../../src/controllers/player.controller.js';

describe('PlayerController', () => {
  let controller;
  let mockUploadService;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    // Mock upload service
    mockUploadService = {
      getImagesByOrganization: vi.fn(),
    };

    controller = new PlayerController(mockUploadService);

    // Mock Express request/response
    mockRequest = {
      query: {},
    };

    mockResponse = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe('getImages', () => {
    it('should return images with full URLs', async () => {
      const mockImages = [
        {
          id: 1,
          filename: 'test1.jpg',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          filename: 'test2.png',
          createdAt: new Date('2024-01-02'),
        },
      ];

      mockUploadService.getImagesByOrganization.mockResolvedValue(mockImages);

      await controller.getImages(mockRequest, mockResponse, mockNext);

      expect(mockUploadService.getImagesByOrganization).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        images: [
          {
            id: 1,
            filename: 'test1.jpg',
            url: '/uploads/test1.jpg',
            createdAt: mockImages[0].createdAt,
          },
          {
            id: 2,
            filename: 'test2.png',
            url: '/uploads/test2.png',
            createdAt: mockImages[1].createdAt,
          },
        ],
        count: 2,
      });
    });

    it('should use organization ID from query parameter', async () => {
      mockRequest.query.org = '5';
      mockUploadService.getImagesByOrganization.mockResolvedValue([]);

      await controller.getImages(mockRequest, mockResponse, mockNext);

      expect(mockUploadService.getImagesByOrganization).toHaveBeenCalledWith('5');
    });

    it('should default to organization 1 if no org parameter provided', async () => {
      mockUploadService.getImagesByOrganization.mockResolvedValue([]);

      await controller.getImages(mockRequest, mockResponse, mockNext);

      expect(mockUploadService.getImagesByOrganization).toHaveBeenCalledWith(1);
    });

    it('should return empty array when no images exist', async () => {
      mockUploadService.getImagesByOrganization.mockResolvedValue([]);

      await controller.getImages(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        images: [],
        count: 0,
      });
    });

    it('should call next with error on service failure', async () => {
      const error = new Error('Database error');
      mockUploadService.getImagesByOrganization.mockRejectedValue(error);

      await controller.getImages(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
