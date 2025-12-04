/**
 * @file TokenService.ts
 * @description Token management service - handles secure token storage operations
 *
 * @principles
 * - SRP: ✅ Single responsibility: token storage operations
 * - CQS: ✅ Commands (saveTokens, clearTokens) mutate storage, Queries (getAccessToken) return data
 * - DIP: ✅ Abstracts storage implementation (uses storage utility)
 * - Platform Agnostic: ✅ Works on both native and web via storage utility
 *
 * @responsibilities
 * - Save/retrieve/clear access and refresh tokens
 * - Check authentication status (token existence)
 * - Provide token for API requests
 *
 * @usage
 * ```typescript
 * const tokenService = new TokenService();
 * await tokenService.saveTokens('access-token', 'refresh-token');
 * const token = await tokenService.getAccessToken();
 * const isAuth = await tokenService.hasValidToken();
 * await tokenService.clearTokens();
 * ```
 */

import { getItem, setItem, deleteItem } from '../../../shared/utils/storage';
import { STORAGE_KEYS } from '../../../shared/constants/config';

export interface ITokenService {
  saveTokens(accessToken: string, refreshToken: string): Promise<void>;
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  clearTokens(): Promise<void>;
  hasValidToken(): Promise<boolean>;
}

export class TokenService implements ITokenService {
  /**
   * Save both access and refresh tokens to secure storage
   *
   * @param accessToken - JWT access token
   * @param refreshToken - JWT refresh token
   */
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await Promise.all([
        setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      ]);
    } catch (error) {
      console.error('[TokenService] Failed to save tokens:', error);
      throw error;
    }
  }

  /**
   * Get access token from secure storage
   *
   * @returns Access token or null if not found
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('[TokenService] Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token from secure storage
   *
   * @returns Refresh token or null if not found
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('[TokenService] Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Clear all tokens from secure storage
   */
  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        deleteItem(STORAGE_KEYS.ACCESS_TOKEN),
        deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      console.error('[TokenService] Failed to clear tokens:', error);
      // Don't throw - clearing should be best-effort
    }
  }

  /**
   * Check if a valid token exists
   *
   * @returns true if access token exists
   */
  async hasValidToken(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}

// Singleton instance for convenience
export const tokenService = new TokenService();
