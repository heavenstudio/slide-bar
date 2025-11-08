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
      // Find or create demo organization
      let organization = await prisma.organization.findFirst({
        where: { name: 'Demo Organization' },
      });

      if (!organization) {
        organization = await prisma.organization.create({
          data: { name: 'Demo Organization' },
        });
      }

      // Find or create demo user
      let user = await prisma.user.findFirst({
        where: { email: 'demo@slidebar.com' },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'demo@slidebar.com',
            password: 'hashed-password-placeholder', // Not used in MVP
            name: 'Demo User',
            organizationId: organization.id,
          },
        });
      }

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
