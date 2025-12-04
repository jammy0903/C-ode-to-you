/**
 * @file AuthService.test.ts
 * @description Unit tests for AuthService
 *
 * @test-coverage
 * - ✅ Kakao login success
 * - ✅ Kakao login failure
 * - ✅ Google login success
 * - ✅ Google login failure
 * - ✅ Logout with server success
 * - ✅ Logout with server failure (still clears tokens)
 * - ✅ Check session with valid token
 * - ✅ Check session without token
 */

import { AuthService } from '../AuthService';
import { IAuthRepository } from '../../../../shared/repositories/interfaces';
import { ITokenService } from '../TokenService';
import { User, AuthResponse } from '../../../../shared/types/api.types';

// Mock user data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'testuser',
  provider: 'kakao',
  createdAt: '2024-01-01T00:00:00Z',
};

// Mock auth response
const mockAuthResponse: AuthResponse = {
  token: 'access-token-123',
  refreshToken: 'refresh-token-456',
  user: mockUser,
};

// Create mock repositories
const createMockAuthRepository = (): jest.Mocked<IAuthRepository> => ({
  loginWithKakao: jest.fn(),
  loginWithGoogle: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
});

const createMockTokenService = (): jest.Mocked<ITokenService> => ({
  saveTokens: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  clearTokens: jest.fn(),
  hasValidToken: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let mockAuthRepo: jest.Mocked<IAuthRepository>;
  let mockTokenService: jest.Mocked<ITokenService>;

  beforeEach(() => {
    mockAuthRepo = createMockAuthRepository();
    mockTokenService = createMockTokenService();
    authService = new AuthService(mockAuthRepo, mockTokenService);
    jest.clearAllMocks();
  });

  describe('loginWithKakao', () => {
    it('should login successfully and save tokens', async () => {
      mockAuthRepo.loginWithKakao.mockResolvedValue(mockAuthResponse);
      mockTokenService.saveTokens.mockResolvedValue(undefined);

      const result = await authService.loginWithKakao('kakao-auth-code');

      expect(mockAuthRepo.loginWithKakao).toHaveBeenCalledWith('kakao-auth-code');
      expect(mockTokenService.saveTokens).toHaveBeenCalledWith('access-token-123', 'refresh-token-456');
      expect(result).toEqual({
        user: mockUser,
        isAuthenticated: true,
      });
    });

    it('should throw error on login failure', async () => {
      mockAuthRepo.loginWithKakao.mockRejectedValue(new Error('Invalid code'));

      await expect(authService.loginWithKakao('invalid-code')).rejects.toThrow('Invalid code');
      expect(mockTokenService.saveTokens).not.toHaveBeenCalled();
    });

    it('should throw error on token save failure', async () => {
      mockAuthRepo.loginWithKakao.mockResolvedValue(mockAuthResponse);
      mockTokenService.saveTokens.mockRejectedValue(new Error('Storage error'));

      await expect(authService.loginWithKakao('valid-code')).rejects.toThrow('Storage error');
    });
  });

  describe('loginWithGoogle', () => {
    it('should login successfully and save tokens', async () => {
      const googleResponse: AuthResponse = { ...mockAuthResponse, user: { ...mockUser, provider: 'google' as const } };
      mockAuthRepo.loginWithGoogle.mockResolvedValue(googleResponse);
      mockTokenService.saveTokens.mockResolvedValue(undefined);

      const result = await authService.loginWithGoogle('google-auth-code');

      expect(mockAuthRepo.loginWithGoogle).toHaveBeenCalledWith('google-auth-code');
      expect(mockTokenService.saveTokens).toHaveBeenCalledWith('access-token-123', 'refresh-token-456');
      expect(result.isAuthenticated).toBe(true);
    });

    it('should throw error on login failure', async () => {
      mockAuthRepo.loginWithGoogle.mockRejectedValue(new Error('Google auth failed'));

      await expect(authService.loginWithGoogle('invalid-code')).rejects.toThrow('Google auth failed');
    });
  });

  describe('logout', () => {
    it('should logout and clear tokens on server success', async () => {
      mockAuthRepo.logout.mockResolvedValue(undefined);
      mockTokenService.clearTokens.mockResolvedValue(undefined);

      await authService.logout();

      expect(mockAuthRepo.logout).toHaveBeenCalled();
      expect(mockTokenService.clearTokens).toHaveBeenCalled();
    });

    it('should still clear tokens on server failure', async () => {
      mockAuthRepo.logout.mockRejectedValue(new Error('Server error'));
      mockTokenService.clearTokens.mockResolvedValue(undefined);

      // Should not throw
      await expect(authService.logout()).resolves.toBeUndefined();
      expect(mockTokenService.clearTokens).toHaveBeenCalled();
    });

    it('should attempt to clear tokens even if first clear fails', async () => {
      mockAuthRepo.logout.mockResolvedValue(undefined);
      mockTokenService.clearTokens
        .mockRejectedValueOnce(new Error('Clear error'))
        .mockResolvedValueOnce(undefined);

      await authService.logout();

      // Should be called twice (once in try, once in catch fallback)
      expect(mockTokenService.clearTokens).toHaveBeenCalledTimes(2);
    });
  });

  describe('checkSession', () => {
    it('should return authenticated true when token exists', async () => {
      mockTokenService.hasValidToken.mockResolvedValue(true);

      const result = await authService.checkSession();

      expect(result).toEqual({ isAuthenticated: true });
      expect(mockTokenService.hasValidToken).toHaveBeenCalled();
    });

    it('should return authenticated false when no token', async () => {
      mockTokenService.hasValidToken.mockResolvedValue(false);

      const result = await authService.checkSession();

      expect(result).toEqual({ isAuthenticated: false });
    });
  });
});
