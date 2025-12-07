/**
 * @file auth.middleware.ts
 * @description JWT authentication middleware
 * @layer Middleware - Token verification and user attachment to request
 *
 * @functions
 * - authenticate: Required authentication - fails if no valid token
 * - optionalAuthenticate: Optional authentication - continues without token
 *
 * @duplicateLogic
 * - ✅ Token verification consolidated - uses verifyTokenAndAttachUser() helper
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { prisma } from '../config/database';
import { errors } from '../utils/response';
import logger from '../utils/logger';

/**
 * Helper: Verify token and attach user to request
 * Eliminates duplicate verification logic
 */
async function verifyTokenAndAttachUser(req: Request, token: string): Promise<boolean> {
  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (user) {
      req.user = user;
      req.userId = user.id;
      return true;
    }
    return false;
  } catch (error) {
    throw error;
  }
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errors.unauthorized(res, 'No token provided');
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token and attach user
    try {
      const userFound = await verifyTokenAndAttachUser(req, token);
      if (!userFound) {
        errors.unauthorized(res, 'User not found');
        return;
      }
    } catch (error: any) {
      errors.unauthorized(res, error.message);
      return;
    }

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    errors.internal(res, 'Authentication failed');
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        await verifyTokenAndAttachUser(req, token);
      } catch (error) {
        // Ignore token errors in optional auth
        logger.debug('Optional auth failed:', error);
      }
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    next();
  }
};
