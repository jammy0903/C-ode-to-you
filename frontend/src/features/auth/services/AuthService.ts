/**
 * @file AuthService.ts
 * @description Authentication business logic service
 *
 * @principles
 * - SRP: ✅ Single responsibility: authentication operations
 * - CQS: ✅ Commands (login, logout) perform auth operations, Queries (checkSession) return state
 * - DIP: ✅ Depends on IAuthRepository and ITokenService interfaces
 * - Composition: ✅ Composes TokenService + AuthRepository
 *
 * @responsibilities
 * - OAuth login flow (Kakao, Google)
 * - Token management via TokenService
 * - Session restoration
 * - Logout with cleanup
 *
 * @usage
 * ```typescript
 * const authService = new AuthService(repositories.auth, tokenService);
 * const user = await authService.loginWithKakao('kakao-oauth-code');
 * const user = await authService.loginWithGoogle('google-id-token');
 * const isAuth = await authService.checkSession();
 * await authService.logout();
 * ```
 */

import { IAuthRepository } from '../../../shared/repositories/interfaces';
import { ITokenService } from './TokenService';
import { User } from '../../../shared/types/api.types';

export interface LoginResult {
  user: User;
  isAuthenticated: true;
}

export interface IAuthService {
  loginWithKakao(code: string): Promise<LoginResult>;
  loginWithGoogle(idToken: string): Promise<LoginResult>;
  logout(): Promise<void>;
  checkSession(): Promise<{ isAuthenticated: boolean }>;
}

export class AuthService implements IAuthService {
  private authRepository: IAuthRepository;
  private tokenService: ITokenService;

  constructor(authRepository: IAuthRepository, tokenService: ITokenService) {
    this.authRepository = authRepository;
    this.tokenService = tokenService;
  }

  /**
   * Login with Kakao OAuth
   *
   * @param code - OAuth authorization code
   * @returns Login result with user data
   */
  async loginWithKakao(code: string): Promise<LoginResult> {
    try {
      const { token, refreshToken, user } = await this.authRepository.loginWithKakao(code);

      await this.tokenService.saveTokens(token, refreshToken);

      return { user, isAuthenticated: true };
    } catch (error) {
      console.error('[AuthService] Kakao login failed:', error);
      throw error;
    }
  }

  /**
   * Login with Google OAuth
   *
   * @param idToken - Google OAuth ID token (JWT from Google Sign-In)
   * @returns Login result with user data
   */
  async loginWithGoogle(idToken: string): Promise<LoginResult> {
    try {
      const { token, refreshToken, user } = await this.authRepository.loginWithGoogle(idToken);

      await this.tokenService.saveTokens(token, refreshToken);

      return { user, isAuthenticated: true };
    } catch (error) {
      console.error('[AuthService] Google login failed:', error);
      throw error;
    }
  }

  /**
   * Logout and clear all tokens
   */
  async logout(): Promise<void> {
    try {
      // Attempt server logout (best-effort, don't block on failure)
      await this.authRepository.logout().catch((error) => {
        console.warn('[AuthService] Server logout failed (continuing with local cleanup):', error);
      });

      // Always clear local tokens
      await this.tokenService.clearTokens();
    } catch (error) {
      console.error('[AuthService] Logout cleanup failed:', error);
      // Still try to clear tokens even if something failed
      await this.tokenService.clearTokens();
    }
  }

  /**
   * Check if user has a valid session
   *
   * @returns Session state with isAuthenticated flag
   */
  async checkSession(): Promise<{ isAuthenticated: boolean }> {
    const hasToken = await this.tokenService.hasValidToken();
    return { isAuthenticated: hasToken };
  }
}
