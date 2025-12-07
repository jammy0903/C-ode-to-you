import { apiClient } from '../client';
import { AuthResponse } from '../../types/api.types';

interface RefreshTokenResponse {
  token: string;
}

/**
 * Auth API endpoints
 * Refactored to use ApiClient for consistent response handling
 */
export const authApi = {
  /**
   * Login with Kakao
   * POST /api/auth/kakao
   */
  loginWithKakao: async (code: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/kakao', { code });
  },

  /**
   * Login with Google
   * POST /api/auth/google
   * Uses idToken for secure authentication (Google recommended)
   */
  loginWithGoogle: async (idToken: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/google', { idToken });
  },

  /**
   * Refresh Token
   * POST /api/auth/refresh
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
  },

  /**
   * Logout
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post<void>('/auth/logout');
  },
};

