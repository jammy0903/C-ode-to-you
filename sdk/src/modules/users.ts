import { HttpClient } from '../utils/http';
import { UserStatistics, UserActivity, UserSettings, UpdateSettingsRequest } from '../types';

export class UsersModule {
  constructor(private http: HttpClient) {}

  /**
   * Get user problem-solving statistics
   */
  async getStatistics(): Promise<UserStatistics> {
    return this.http.get<UserStatistics>('/api/users/me/stats');
  }

  /**
   * Get user activity for the last N days
   */
  async getActivity(days?: number): Promise<UserActivity> {
    const query: Record<string, string> = {};
    if (days) query.days = String(days);

    return this.http.get<UserActivity>('/api/users/me/activity', query);
  }

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    return this.http.get<UserSettings>('/api/users/me/settings');
  }

  /**
   * Update user settings (partial update)
   */
  async updateSettings(settings: UpdateSettingsRequest): Promise<void> {
    await this.http.put('/api/users/me/settings', settings);
  }
}
