import { Router } from 'express';
import { PlayerController } from '../controllers/player.controller.js';

/**
 * Create player router
 * Public routes - no authentication required
 * @param {Object} uploadService - Upload service instance
 * @returns {Router} Express router
 */
export function createPlayerRouter(uploadService) {
  const router = Router();
  const controller = new PlayerController(uploadService);

  // Public route - no auth middleware
  router.get('/images', controller.getImages);

  return router;
}
