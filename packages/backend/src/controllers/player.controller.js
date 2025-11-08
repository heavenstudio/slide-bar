/**
 * Player Controller
 * Handles public player API requests (no authentication required)
 */
export class PlayerController {
  constructor(uploadService) {
    this.uploadService = uploadService;
  }

  /**
   * Get images for player display
   * Public endpoint - no authentication required
   */
  getImages = async (req, res, next) => {
    try {
      // For now, we'll get all images from the first organization
      // In the future, this could be filtered by organization ID from query params
      let organizationId = req.query.org;

      // If no org specified, use the first organization in the database
      if (!organizationId) {
        const firstOrg = await this.uploadService.prisma.organization.findFirst();
        if (!firstOrg) {
          // No organizations exist yet
          return res.json({ images: [], count: 0 });
        }
        organizationId = firstOrg.id;
      }

      const images = await this.uploadService.getImagesByOrganization(organizationId);

      // Return images with full URLs
      const imagesWithUrls = images.map((img) => ({
        id: img.id,
        filename: img.filename,
        url: `/uploads/${img.filename}`,
        createdAt: img.createdAt,
      }));

      res.json({
        images: imagesWithUrls,
        count: imagesWithUrls.length,
      });
    } catch (error) {
      next(error);
    }
  };
}
