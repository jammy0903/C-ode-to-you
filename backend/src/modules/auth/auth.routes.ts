import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rate-limit.middleware';
import {
  kakaoLoginSchema,
  googleLoginSchema,
  refreshTokenSchema,
} from './auth.validation';

const router = Router();
const controller = new AuthController();

// Apply rate limiting to auth routes
router.use(authLimiter);

/**
 * POST /api/auth/kakao
 * Kakao OAuth login
 */
router.post('/kakao', validate(kakaoLoginSchema), controller.kakaoLogin);

/**
 * POST /api/auth/google
 * Google OAuth login
 */
router.post('/google', validate(googleLoginSchema), controller.googleLogin);

/**
 * GET /api/auth/google/callback
 * Google OAuth callback (receives code from Google redirect)
 */
router.get('/google/callback', controller.googleCallback);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', validate(refreshTokenSchema), controller.refreshToken);

/**
 * POST /api/auth/logout
 * Logout user (requires authentication)
 */
router.post('/logout', authenticate, controller.logout);

export default router;
