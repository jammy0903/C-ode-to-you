import { apiClient } from '../client';
import { UserStats, UserActivity, UserSettings } from '../../types/api.types';

/**
 * Users API endpoints
 * Refactored to use ApiClient for consistent response handling
 */
export const usersApi = {
  /**
   * Get My Stats
   * GET /api/users/me/stats
   */
  getMyStats: async (): Promise<UserStats> => {
    return apiClient.get<UserStats>('/users/me/stats');
  },

  /**
   * Get My Activity (Streak)
   * GET /api/users/me/activity
   */
  getMyActivity: async (year?: number): Promise<UserActivity[]> => {
    const params = year ? { year } : undefined;
    return apiClient.get<UserActivity[]>('/users/me/activity', params);
  },

  /**
   * Get My Settings
   * GET /api/users/me/settings
   */
  getMySettings: async (): Promise<UserSettings> => {
    return apiClient.get<UserSettings>('/users/me/settings');
  },

  /**
   * Update My Settings
   * PUT /api/users/me/settings
   */
  updateMySettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    return apiClient.put<UserSettings>('/users/me/settings', settings as unknown as undefined);
  },
};

