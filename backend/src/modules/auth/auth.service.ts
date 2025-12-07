/**
 * @file auth.service.ts
 * @description OAuth authentication service (Kakao, Google)
 *
 * @principles
 * - SRP: ✅ Handles only OAuth authentication and JWT token generation
 * - DIP: ⚠️ Directly instantiates UserRepository
 * - Security: Uses JWT with refresh tokens, OAuth 2.0 flow
 *
 * @functions
 * - kakaoLogin(code): Promise<AuthResponse> - Authenticate with Kakao OAuth
 * - googleLogin(code): Promise<AuthResponse> - Authenticate with Google OAuth
 * - handleOAuthUser(userInfo): Promise<AuthResponse> - Upsert user and generate tokens (private)
 * - refreshAccessToken(refreshToken): Promise<{token}> - Generate new access token from refresh token
 * - logout(userId): Promise<void> - Logout (currently client-side only)
 *
 * @dependencies
 * - UserRepository: User upsert and lookup
 * - JWT config: Token generation and verification
 * - env: OAuth client credentials
 *
 * @oauthFlow
 * 1. Exchange authorization code for access token
 * 2. Fetch user info from provider
 * 3. Upsert user in database
 * 4. Generate JWT tokens
 *
 * @duplicateLogic
 * - ✅ OAuth flow consolidated - uses executeOAuthFlow() with provider-specific configs
 */

import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { UserRepository } from '../../database/repositories/user.repository';
import { generateTokenPair, verifyRefreshToken } from '../../config/jwt';
import { env } from '../../config/env';
import { AppError } from '../../types/common.types';
import {
  OAuthUserInfo,
  AuthResponse,
  KakaoTokenResponse,
  KakaoUserInfo,
  GoogleTokenResponse,
  GoogleUserInfo,
} from './auth.types';
import logger from '../../utils/logger';

/**
 * OAuth provider configuration for generic flow
 */
interface OAuthConfig<TokenResponse, UserInfoResponse> {
  name: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  getTokenParams: (code: string) => Record<string, string> | URLSearchParams;
  getTokenHeaders?: () => Record<string, string>;
  extractUserInfo: (userInfoData: UserInfoResponse) => OAuthUserInfo;
}

export class AuthService {
  private userRepo: UserRepository;
  private googleClient: OAuth2Client;

  constructor() {
    this.userRepo = new UserRepository();
    this.googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }

  /**
   * Generic OAuth login flow
   * Eliminates duplication between provider-specific login methods
   */
  private async executeOAuthFlow<TokenResponse extends { access_token: string }, UserInfoResponse>(
    code: string,
    config: OAuthConfig<TokenResponse, UserInfoResponse>
  ): Promise<AuthResponse> {
    try {
      // 1. Exchange code for access token
      const tokenParams = config.getTokenParams(code);
      const tokenRequestData = tokenParams instanceof URLSearchParams
        ? tokenParams
        : new URLSearchParams(tokenParams);

      const tokenResponse = await axios.post<TokenResponse>(
        config.tokenEndpoint,
        tokenRequestData,
        {
          headers: config.getTokenHeaders?.() || {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // 2. Get user info from provider
      const userInfoResponse = await axios.get<UserInfoResponse>(
        config.userInfoEndpoint,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // 3. Extract user info using provider-specific mapper
      const userInfo = config.extractUserInfo(userInfoResponse.data);

      // 4. Create or update user
      return this.handleOAuthUser(userInfo);
    } catch (error: any) {
      logger.error(`${config.name} OAuth error:`, error.response?.data || error.message);
      throw new AppError(
        `${config.name} authentication failed`,
        401,
        `${config.name.toUpperCase()}_AUTH_FAILED`
      );
    }
  }

  /**
   * Kakao OAuth Login
   */
  async kakaoLogin(code: string): Promise<AuthResponse> {
    return this.executeOAuthFlow<KakaoTokenResponse, KakaoUserInfo>(code, {
      name: 'Kakao',
      tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
      userInfoEndpoint: 'https://kapi.kakao.com/v2/user/me',
      getTokenParams: (code) => new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: env.KAKAO_CLIENT_ID,
        client_secret: env.KAKAO_CLIENT_SECRET,
        redirect_uri: env.KAKAO_CALLBACK_URL,
        code,
      }),
      extractUserInfo: (kakaoUser) => ({
        provider: 'kakao',
        providerId: kakaoUser.id.toString(),
        email: kakaoUser.kakao_account.email || `kakao_${kakaoUser.id}@placeholder.com`,
        name: kakaoUser.kakao_account.profile?.nickname || 'Kakao User',
      }),
    });
  }

  /**
   * Google OAuth Login (Code flow)
   */
  async googleLogin(code: string): Promise<AuthResponse> {
    return this.executeOAuthFlow<GoogleTokenResponse, GoogleUserInfo>(code, {
      name: 'Google',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
      getTokenParams: (code) => ({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
      extractUserInfo: (googleUser) => ({
        provider: 'google',
        providerId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
      }),
    });
  }

  /**
   * Google OAuth Login with Access Token (Token flow - for Expo Go)
   */
  async googleLoginWithToken(accessToken: string): Promise<AuthResponse> {
    try {
      logger.info('[GoogleAuth] Starting token login with accessToken:', accessToken.substring(0, 20) + '...');

      // Get user info from Google using access token
      const userInfoResponse = await axios.get<GoogleUserInfo>(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const googleUser = userInfoResponse.data;
      logger.info('[GoogleAuth] Google user info received:', JSON.stringify(googleUser));

      // Extract user info (v2 API uses 'id' instead of 'sub')
      const userInfo: OAuthUserInfo = {
        provider: 'google',
        providerId: (googleUser as any).id || googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
      };

      logger.info('[GoogleAuth] Extracted user info:', JSON.stringify(userInfo));

      // Create or update user
      return this.handleOAuthUser(userInfo);
    } catch (error: any) {
      logger.error('[GoogleAuth] Token login error:', error.response?.data || error.message);
      logger.error('[GoogleAuth] Full error:', error);
      throw new AppError(
        'Google authentication with token failed',
        401,
        'GOOGLE_TOKEN_AUTH_FAILED'
      );
    }
  }

  /**
   * Google OAuth Login with ID Token (JWT - Google recommended)
   * Uses google-auth-library for secure token verification
   */
  async googleLoginWithIdToken(idToken: string): Promise<AuthResponse> {
    try {
      logger.info('[GoogleAuth] Verifying idToken with Google...');

      // Verify the idToken using Google's official library
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      logger.info('[GoogleAuth] Token verified! User:', payload.email);

      // Extract user info from verified payload
      const userInfo: OAuthUserInfo = {
        provider: 'google',
        providerId: payload.sub,
        email: payload.email!,
        name: payload.name || payload.email!,
      };

      // Create or update user
      return this.handleOAuthUser(userInfo);
    } catch (error: any) {
      logger.error('[GoogleAuth] idToken verification failed:', error.message);
      throw new AppError(
        'Google authentication failed: ' + error.message,
        401,
        'GOOGLE_AUTH_FAILED'
      );
    }
  }

  /**
   * Handle OAuth user (create or update)
   */
  private async handleOAuthUser(userInfo: OAuthUserInfo): Promise<AuthResponse> {
    // Upsert user in database
    const user = await this.userRepo.upsert({
      provider: userInfo.provider,
      providerId: userInfo.providerId,
      email: userInfo.email,
      name: userInfo.name,
    });

    // Generate JWT tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ token: string }> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Check if user exists
      const user = await this.userRepo.findById(payload.userId);

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Generate new access token
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      return {
        token: tokens.accessToken,
      };
    } catch (error: any) {
      logger.error('Token refresh error:', error.message);
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * Logout (optional - can be handled client-side)
   */
  async logout(userId: string): Promise<void> {
    // In a production app, you might want to:
    // - Invalidate refresh tokens in database
    // - Add tokens to a blacklist
    // For now, logout is handled client-side by removing tokens
    logger.info(`User ${userId} logged out`);
  }
}
