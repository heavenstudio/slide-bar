import { describe, it, expect, beforeEach } from 'vitest';
import { UploadService } from '../../src/services/upload.service.js';
import { getPrismaClient, createTestOrganization } from '../helpers/database.js';

// eslint-disable-next-line max-lines-per-function -- Test suite with multiple nested describe blocks
describe('UploadService', () => {
  let uploadService;
  let testOrganization;
  const prisma = getPrismaClient();

  beforeEach(async () => {
    // Database is automatically truncated by setup.js
    // Create a test organization for each test
    testOrganization = await createTestOrganization();
    uploadService = new UploadService(prisma);
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

      const result = await uploadService.saveImageMetadata(fileData, testOrganization.id);

      // Verify the result has expected properties
      expect(result).toMatchObject({
        filename: fileData.filename,
        originalName: fileData.originalname,
        mimeType: fileData.mimetype,
        size: fileData.size,
        path: fileData.path,
        url: `/uploads/${fileData.filename}`,
        organizationId: testOrganization.id,
      });

      // Verify it was actually saved to the database
      const savedImage = await prisma.image.findUnique({
        where: { id: result.id },
      });

      expect(savedImage).toBeTruthy();
      expect(savedImage.filename).toBe(fileData.filename);
      expect(savedImage.organizationId).toBe(testOrganization.id);
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
      // Create some test images
      const image1 = await prisma.image.create({
        data: {
          filename: 'image-1.jpg',
          originalName: 'test1.jpg',
          mimeType: 'image/jpeg',
          size: 50000,
          path: '/uploads/image-1.jpg',
          url: '/uploads/image-1.jpg',
          organizationId: testOrganization.id,
        },
      });

      // Small delay to ensure different timestamps for createdAt ordering
      await new Promise((resolve) => setTimeout(resolve, 10));

      const image2 = await prisma.image.create({
        data: {
          filename: 'image-2.png',
          originalName: 'test2.png',
          mimeType: 'image/png',
          size: 60000,
          path: '/uploads/image-2.png',
          url: '/uploads/image-2.png',
          organizationId: testOrganization.id,
        },
      });

      const result = await uploadService.getImagesByOrganization(testOrganization.id);

      expect(result).toHaveLength(2);
      // Images should be ordered by createdAt desc, so most recent first
      expect(result[0].id).toBe(image2.id);
      expect(result[1].id).toBe(image1.id);
    });

    it('should return empty array if no images found', async () => {
      const result = await uploadService.getImagesByOrganization(testOrganization.id);

      expect(result).toEqual([]);
    });

    it('should only return images for the specified organization', async () => {
      // Create another organization with its own image
      const otherOrg = await createTestOrganization('Other Organization');
      await prisma.image.create({
        data: {
          filename: 'other-org-image.jpg',
          originalName: 'other.jpg',
          mimeType: 'image/jpeg',
          size: 40000,
          path: '/uploads/other.jpg',
          url: '/uploads/other.jpg',
          organizationId: otherOrg.id,
        },
      });

      // Create image for test organization
      await prisma.image.create({
        data: {
          filename: 'test-org-image.jpg',
          originalName: 'test.jpg',
          mimeType: 'image/jpeg',
          size: 50000,
          path: '/uploads/test.jpg',
          url: '/uploads/test.jpg',
          organizationId: testOrganization.id,
        },
      });

      const result = await uploadService.getImagesByOrganization(testOrganization.id);

      expect(result).toHaveLength(1);
      expect(result[0].organizationId).toBe(testOrganization.id);
      expect(result[0].filename).toBe('test-org-image.jpg');
    });
  });

  describe('deleteImage', () => {
    it('should delete an image if it belongs to the organization', async () => {
      // Create a test image
      const testImage = await prisma.image.create({
        data: {
          filename: 'test-delete.jpg',
          originalName: 'test.jpg',
          mimeType: 'image/jpeg',
          size: 50000,
          path: '/uploads/test-delete.jpg',
          url: '/uploads/test-delete.jpg',
          organizationId: testOrganization.id,
        },
      });

      const result = await uploadService.deleteImage(testImage.id, testOrganization.id);

      expect(result).toBeTruthy();
      expect(result.id).toBe(testImage.id);

      // Verify it was actually deleted from the database
      const deletedImage = await prisma.image.findUnique({
        where: { id: testImage.id },
      });

      expect(deletedImage).toBeNull();
    });

    it('should throw error if image not found', async () => {
      const nonExistentId = 'non-existent-id';

      await expect(uploadService.deleteImage(nonExistentId, testOrganization.id)).rejects.toThrow(
        'Image not found'
      );
    });

    it('should throw error if image belongs to different organization', async () => {
      // Create another organization
      const otherOrg = await createTestOrganization('Other Organization');

      // Create an image for the other organization
      const otherOrgImage = await prisma.image.create({
        data: {
          filename: 'other-org.jpg',
          originalName: 'other.jpg',
          mimeType: 'image/jpeg',
          size: 50000,
          path: '/uploads/other-org.jpg',
          url: '/uploads/other-org.jpg',
          organizationId: otherOrg.id,
        },
      });

      // Try to delete it using testOrganization's ID (should fail)
      await expect(
        uploadService.deleteImage(otherOrgImage.id, testOrganization.id)
      ).rejects.toThrow('Unauthorized to delete this image');

      // Verify the image still exists in the database
      const stillExists = await prisma.image.findUnique({
        where: { id: otherOrgImage.id },
      });

      expect(stillExists).toBeTruthy();
    });
  });
});
