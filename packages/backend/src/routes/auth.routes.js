import { Router } from 'express';
import { generateToken } from '../middleware/auth.js';

/**
 * Auth Routes
 * Handles authentication endpoints
 * Note: This is a simplified MVP implementation
 * In production, add proper password hashing, user validation, etc.
 */
export function createAuthRouter(prisma) {
  const router = Router();

  /**
   * Demo/Development login endpoint
   * Creates demo user and organization if they don't exist
   * Returns a valid JWT token
   */
  router.post('/demo-login', async (req, res, next) => {
    try {
      // Use upsert to atomically find or create demo organization
      // This prevents race conditions when multiple requests arrive simultaneously
      const organization = await prisma.organization.upsert({
        where: { name: 'Demo Organization' },
        update: {}, // No updates needed if it exists
        create: { name: 'Demo Organization' },
      });

      // Use upsert to atomically find or create demo user
      // This prevents unique constraint violations from concurrent requests
      const user = await prisma.user.upsert({
        where: { email: 'demo@slidebar.com' },
        update: {}, // No updates needed if it exists
        create: {
          email: 'demo@slidebar.com',
          password: 'hashed-password-placeholder', // Not used in MVP
          name: 'Demo User',
          organizationId: organization.id,
        },
      });

      // Generate JWT token
      const token = generateToken(user.id, organization.id);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          organizationId: organization.id,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
