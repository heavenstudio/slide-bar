import fs from 'fs/promises';
import path from 'path';

/**
 * Sanitize filename to prevent security issues
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  return filename.replace(/[/\\]/g, '').replace(/\0/g, '').replace(/\.\./g, '').trim();
}

/**
 * Upload Service
 * Handles business logic for image uploads
 */
export class UploadService {
  constructor(prismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * Save image metadata to database
   * @param {Object} fileData - File data from multer
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Object>} Created image record
   */
  async saveImageMetadata(fileData, organizationId) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    // Sanitize the original filename before storing
    const sanitizedOriginalName = sanitizeFilename(fileData.originalname);
    // Ensure the filename has a valid extension
    const basename = path.basename(sanitizedOriginalName, path.extname(sanitizedOriginalName));
    const ext = path.extname(sanitizedOriginalName);
    const safeName = basename || 'image';

    const imageData = {
      filename: fileData.filename,
      originalName: safeName + ext,
      mimeType: fileData.mimetype,
      size: fileData.size,
      path: fileData.path,
      url: `/uploads/${fileData.filename}`,
      organizationId,
    };

    return await this.prisma.image.create({
      data: imageData,
    });
  }

  /**
   * Get all images for an organization
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Array>} List of images
   */
  async getImagesByOrganization(organizationId) {
    return await this.prisma.image.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete an image
   * @param {string} imageId - Image ID
   * @param {string} organizationId - Organization ID for authorization
   * @returns {Promise<Object>} Deleted image record
   */
  async deleteImage(imageId, organizationId) {
    // Check if image exists
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // Check authorization
    if (image.organizationId !== organizationId) {
      throw new Error('Unauthorized to delete this image');
    }

    // Delete physical file first
    try {
      await fs.unlink(image.path);
    } catch (err) {
      // Only log in non-test environments
      if (process.env.NODE_ENV !== 'test') {
        console.error('Failed to delete file from disk:', err);
      }
      // Continue with database deletion even if file deletion fails
      // The file might have been manually deleted already
    }

    // Delete from database
    return await this.prisma.image.delete({
      where: { id: imageId },
    });
  }
}
