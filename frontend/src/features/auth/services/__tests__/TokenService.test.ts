/**
 * @file TokenService.test.ts
 * @description Unit tests for TokenService
 *
 * @test-coverage
 * - ✅ Save tokens successfully
 * - ✅ Get access token successfully
 * - ✅ Get refresh token successfully
 * - ✅ Clear tokens successfully
 * - ✅ Check valid token exists
 * - ✅ Check no valid token
 * - ✅ Handle storage errors gracefully
 */

import { TokenService } from '../TokenService';
import * as storage from '../../../../shared/utils/storage';

// Mock storage utilities
jest.mock('../../../../shared/utils/storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  deleteItem: jest.fn(),
}));

const mockStorage = storage as jest.Mocked<typeof storage>;

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeEach(() => {
    tokenService = new TokenService();
    jest.clearAllMocks();
  });

  describe('saveTokens', () => {
    it('should save both tokens successfully', async () => {
      mockStorage.setItem.mockResolvedValue(undefined);

      await tokenService.saveTokens('access-token-123', 'refresh-token-456');

      expect(mockStorage.setItem).toHaveBeenCalledTimes(2);
      expect(mockStorage.setItem).toHaveBeenCalledWith('accessToken', 'access-token-123');
      expect(mockStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token-456');
    });

    it('should throw error if storage fails', async () => {
      mockStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(tokenService.saveTokens('access', 'refresh')).rejects.toThrow('Storage error');
    });
  });

  describe('getAccessToken', () => {
    it('should return access token when exists', async () => {
      mockStorage.getItem.mockResolvedValue('access-token-123');

      const result = await tokenService.getAccessToken();

      expect(result).toBe('access-token-123');
      expect(mockStorage.getItem).toHaveBeenCalledWith('accessToken');
    });

    it('should return null when token does not exist', async () => {
      mockStorage.getItem.mockResolvedValue(null);

      const result = await tokenService.getAccessToken();

      expect(result).toBeNull();
    });

    it('should return null on storage error', async () => {
      mockStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await tokenService.getAccessToken();

      expect(result).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token when exists', async () => {
      mockStorage.getItem.mockResolvedValue('refresh-token-456');

      const result = await tokenService.getRefreshToken();

      expect(result).toBe('refresh-token-456');
      expect(mockStorage.getItem).toHaveBeenCalledWith('refreshToken');
    });

    it('should return null when token does not exist', async () => {
      mockStorage.getItem.mockResolvedValue(null);

      const result = await tokenService.getRefreshToken();

      expect(result).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should clear both tokens', async () => {
      mockStorage.deleteItem.mockResolvedValue(undefined);

      await tokenService.clearTokens();

      expect(mockStorage.deleteItem).toHaveBeenCalledTimes(2);
      expect(mockStorage.deleteItem).toHaveBeenCalledWith('accessToken');
      expect(mockStorage.deleteItem).toHaveBeenCalledWith('refreshToken');
    });

    it('should not throw on storage error (best-effort)', async () => {
      mockStorage.deleteItem.mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(tokenService.clearTokens()).resolves.toBeUndefined();
    });
  });

  describe('hasValidToken', () => {
    it('should return true when access token exists', async () => {
      mockStorage.getItem.mockResolvedValue('valid-token');

      const result = await tokenService.hasValidToken();

      expect(result).toBe(true);
    });

    it('should return false when no access token', async () => {
      mockStorage.getItem.mockResolvedValue(null);

      const result = await tokenService.hasValidToken();

      expect(result).toBe(false);
    });

    it('should return false on empty string token', async () => {
      mockStorage.getItem.mockResolvedValue('');

      const result = await tokenService.hasValidToken();

      expect(result).toBe(false);
    });
  });
});
