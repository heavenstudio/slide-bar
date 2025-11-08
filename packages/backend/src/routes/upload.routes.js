import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { UploadController } from '../controllers/upload.controller.js';

/**
 * Create upload router
 * @param {Object} uploadService - Upload service instance
 * @param {Function} authMiddleware - Authentication middleware
 * @returns {Router} Express router
 */
export function createUploadRouter(uploadService, authMiddleware) {
  const router = Router();
  const controller = new UploadController(uploadService);

  // Auth middleware is required for all routes
  if (!authMiddleware) {
    throw new Error('Authentication middleware is required for upload routes');
  }

  router.use(authMiddleware);

  // Routes
  router.post('/', upload.single('image'), controller.uploadImage);
  router.get('/', controller.getImages);
  router.delete('/:id', controller.deleteImage);

  return router;
}
