/**
 * Upload Controller
 * Handles HTTP requests for image uploads
 */
export class UploadController {
  constructor(uploadService) {
    this.uploadService = uploadService;
  }

  /**
   * Upload a new image
   */
  uploadImage = async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const organizationId = req.user.organizationId;
      const image = await this.uploadService.saveImageMetadata(req.file, organizationId);

      res.status(201).json({
        message: 'Image uploaded successfully',
        image,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all images for the authenticated user's organization
   */
  getImages = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationId;
      const images = await this.uploadService.getImagesByOrganization(organizationId);

      res.status(200).json({
        images,
        count: images.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete an image
   */
  deleteImage = async (req, res, next) => {
    try {
      const { id } = req.params;
      const organizationId = req.user.organizationId;

      await this.uploadService.deleteImage(id, organizationId);

      res.status(200).json({
        message: 'Image deleted successfully',
      });
    } catch (error) {
      if (error.message === 'Image not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Unauthorized to delete this image') {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  };
}
