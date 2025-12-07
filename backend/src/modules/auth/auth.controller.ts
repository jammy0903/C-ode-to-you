/**
 * @file auth.controller.ts
 * @description HTTP request handlers for authentication endpoints (OAuth)
 * @layer Controller - Request/Response handling only, delegates to Service
 *
 * @endpoints
 * - POST /api/auth/kakao - Kakao OAuth login
 * - POST /api/auth/google - Google OAuth login (code or accessToken)
 * - GET /api/auth/google/callback - Google OAuth callback
 * - POST /api/auth/refresh - Refresh access token
 * - POST /api/auth/logout - Logout user
 */

import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/async-handler';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  /**
   * POST /api/auth/kakao
   * Kakao OAuth login
   */
  kakaoLogin = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    const result = await this.service.kakaoLogin(code);

    sendSuccess(res, result, 'Kakao login successful');
  });

  /**
   * POST /api/auth/google
   * Google OAuth login with idToken (Google recommended)
   */
  googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body;

    console.log('[GoogleLogin] Request received, hasIdToken:', !!idToken);

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_ID_TOKEN',
          message: 'idToken is required',
        },
      });
    }

    const result = await this.service.googleLoginWithIdToken(idToken);
    console.log('[GoogleLogin] SUCCESS! User:', result.user.email);
    sendSuccess(res, result, 'Google login successful');
  });

  /**
   * GET /api/auth/google/callback
   * Google OAuth callback handler
   * Receives authorization code from Google and processes login
   */
  googleCallback = asyncHandler(async (req: Request, res: Response) => {
    const { code, error } = req.query;

    // Handle OAuth error
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'OAUTH_ERROR',
          message: `OAuth error: ${error}`,
        },
      });
    }

    // Validate code
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CODE',
          message: 'Authorization code is required',
        },
      });
    }

    // Process login
    const result = await this.service.googleLogin(code);

    // Return success response
    sendSuccess(res, result, 'Google login successful');
  });

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await this.service.refreshAccessToken(refreshToken);

    sendSuccess(res, result, 'Token refreshed successfully');
  });

  /**
   * POST /api/auth/logout
   * Logout user
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!; // From auth middleware

    await this.service.logout(userId);

    sendSuccess(res, null, 'Logged out successfully');
  });
}
