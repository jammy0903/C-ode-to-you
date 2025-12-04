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
   * Supports both code flow (native) and accessToken flow (Expo Go)
   */
  loginWithGoogle: async (accessToken: string): Promise<AuthResponse> => {
    // In Expo Go, we use token flow
    // In native builds, this would be an authorization code
    return apiClient.post<AuthResponse>('/auth/google', { accessToken });
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

