/**
 * @file users.service.ts
 * @description User-related business logic service
 *
 * @principles
 * - SRP: ✅ Handles only user-related features (statistics, activity, settings)
 * - DIP: ⚠️ Directly instantiates UserRepository
 * - Thin Layer: Simple delegation to repository (consider if service layer is needed)
 *
 * @functions
 * - getUserStatistics(userId): Promise<UserStatistics> - Get user problem-solving statistics
 * - getUserActivity(userId, days?): Promise<UserActivity> - Get user activity for N days (default: 7)
 * - getUserSettings(userId): Promise<UserSettings> - Get user preferences
 * - updateUserSettings(userId, settings): Promise<void> - Update user preferences
 *
 * @dependencies
 * - UserRepository: All data access delegated to repository
 *
 * @duplicateLogic
 * - ✅ No duplication - pure delegation layer
 *
 * @notes
 * - Currently very thin - mostly pass-through to repository
 * - Consider merging into UserRepository or adding business logic if service grows
 */

import { UserRepository } from '../../database/repositories/user.repository';
import { UserStatistics, UserActivity, UserSettings, UpdateSettingsRequest } from './users.types';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId: string): Promise<UserStatistics> {
    return this.userRepo.getUserStatistics(userId);
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId: string, days: number = 7): Promise<UserActivity> {
    const activity = await this.userRepo.getUserActivity(userId, days);
    return { activity };
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    return this.userRepo.getUserSettings(userId);
  }

  /**
   * Update user settings
   */
  async updateUserSettings(
    userId: string,
    settings: UpdateSettingsRequest
  ): Promise<void> {
    await this.userRepo.updateUserSettings(userId, settings);
  }
}
