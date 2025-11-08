import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UploadService } from '../../src/services/upload.service.js';

// Mock Prisma client
const mockPrisma = {
  image: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
};

describe('UploadService', () => {
  let uploadService;
  const mockOrganizationId = 'org-123';

  beforeEach(() => {
    uploadService = new UploadService(mockPrisma);
    vi.clearAllMocks();
  });

  describe('saveImageMetadata', () => {
    it('should save image metadata to database', async () => {
      const fileData = {
        filename: 'image-123.jpg',
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg',
        size: 50000,
        path: '/uploads/image-123.jpg',
      };

      const expectedImage = {
        id: 'img-1',
        filename: fileData.filename,
        originalName: fileData.originalname,
        mimeType: fileData.mimetype,
        size: fileData.size,
        path: fileData.path,
        url: `/uploads/${fileData.filename}`,
        organizationId: mockOrganizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.image.create.mockResolvedValue(expectedImage);

      const result = await uploadService.saveImageMetadata(fileData, mockOrganizationId);

      expect(mockPrisma.image.create).toHaveBeenCalledWith({
        data: {
          filename: fileData.filename,
          originalName: fileData.originalname,
          mimeType: fileData.mimetype,
          size: fileData.size,
          path: fileData.path,
          url: `/uploads/${fileData.filename}`,
          organizationId: mockOrganizationId,
        },
      });

      expect(result).toEqual(expectedImage);
    });

    it('should throw error if organizationId is missing', async () => {
      const fileData = {
        filename: 'image-123.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 50000,
        path: '/uploads/image-123.jpg',
      };

      await expect(uploadService.saveImageMetadata(fileData, null)).rejects.toThrow(
        'Organization ID is required'
      );
    });
  });

  describe('getImagesByOrganization', () => {
    it('should return all images for an organization', async () => {
      const mockImages = [
        {
          id: 'img-1',
          filename: 'image-1.jpg',
          originalName: 'test1.jpg',
          url: '/uploads/image-1.jpg',
          createdAt: new Date(),
        },
        {
          id: 'img-2',
          filename: 'image-2.png',
          originalName: 'test2.png',
          url: '/uploads/image-2.png',
          createdAt: new Date(),
        },
      ];

      mockPrisma.image.findMany.mockResolvedValue(mockImages);

      const result = await uploadService.getImagesByOrganization(mockOrganizationId);

      expect(mockPrisma.image.findMany).toHaveBeenCalledWith({
        where: { organizationId: mockOrganizationId },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(mockImages);
    });

    it('should return empty array if no images found', async () => {
      mockPrisma.image.findMany.mockResolvedValue([]);

      const result = await uploadService.getImagesByOrganization(mockOrganizationId);

      expect(result).toEqual([]);
    });
  });

  describe('deleteImage', () => {
    it('should delete an image if it belongs to the organization', async () => {
      const imageId = 'img-1';
      const mockImage = {
        id: imageId,
        organizationId: mockOrganizationId,
        path: '/uploads/image-1.jpg',
      };

      mockPrisma.image.findUnique.mockResolvedValue(mockImage);
      mockPrisma.image.delete.mockResolvedValue(mockImage);

      const result = await uploadService.deleteImage(imageId, mockOrganizationId);

      expect(mockPrisma.image.findUnique).toHaveBeenCalledWith({
        where: { id: imageId },
      });

      expect(mockPrisma.image.delete).toHaveBeenCalledWith({
        where: { id: imageId },
      });

      expect(result).toEqual(mockImage);
    });

    it('should throw error if image not found', async () => {
      const imageId = 'non-existent';

      mockPrisma.image.findUnique.mockResolvedValue(null);

      await expect(uploadService.deleteImage(imageId, mockOrganizationId)).rejects.toThrow(
        'Image not found'
      );
    });

    it('should throw error if image belongs to different organization', async () => {
      const imageId = 'img-1';
      const mockImage = {
        id: imageId,
        organizationId: 'different-org',
      };

      mockPrisma.image.findUnique.mockResolvedValue(mockImage);

      await expect(uploadService.deleteImage(imageId, mockOrganizationId)).rejects.toThrow(
        'Unauthorized to delete this image'
      );
    });
  });
});
