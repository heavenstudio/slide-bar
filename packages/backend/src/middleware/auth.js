import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 */
export const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Attach user to request
    req.user = {
      id: decoded.userId,
      organizationId: decoded.organizationId,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Generate JWT token for a user
 * @param {string} userId - User ID
 * @param {string} organizationId - Organization ID
 * @returns {string} JWT token
 */
export const generateToken = (userId, organizationId) => {
  return jwt.sign({ userId, organizationId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};
