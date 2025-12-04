/**
 * @file userStore.ts
 * @description User profile state management store
 * 
 * @principles
 * - SRP: ✅ Manages only user profile state (stats, activity, settings)
 * - CQS: ✅ Commands (fetchStats, updateSettings) mutate state, Queries (stats, activity) return data
 * - DIP: ✅ Uses IUserRepository interface (via repositories.user)
 * - Composition: ✅ Uses createAsyncAction for async state management
 * 
 * @functions
 * - fetchStats(): Promise<void> - Fetch user statistics
 * - fetchActivity(year?: number): Promise<void> - Fetch user activity (streak data)
 * - fetchSettings(): Promise<void> - Fetch user settings
 * - updateSettings(newSettings: Partial<UserSettings>): Promise<void> - Update user settings
 * 
 * @state
 * - stats: UserStats | null - User statistics
 * - activity: UserActivity[] - User activity history
 * - settings: UserSettings | null - User settings
 * - isLoading: boolean - Loading state
 * - error: string | null - Error message
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { UserStats, UserActivity, UserSettings } from '../../../shared/types/api.types';
import { repositories } from '../../../shared/repositories';
import { createAsyncAction } from '../../../shared/stores/core/asyncState';

interface UserState {
  stats: UserStats | null;
  activity: UserActivity[];
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  fetchStats: () => Promise<void>;
  fetchActivity: (year?: number) => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

export const useUserStore = create<UserState & UserActions>()(
  immer((set, get) => ({
    stats: null,
    activity: [],
    settings: null,
    isLoading: false,
    error: null,

    fetchStats: async () => {
      await createAsyncAction(
        set,
        () => repositories.user.getMyStats(),
        {
          onStart: (state) => {
            state.isLoading = true;
            state.error = null;
          },
          onSuccess: (state, stats) => {
            state.stats = stats;
          },
          onError: (state, error) => {
            state.error = error;
          },
          onFinally: (state) => {
            state.isLoading = false;
          },
        }
      );
    },

    fetchActivity: async (year) => {
      // Don't set global loading for activity to avoid blocking UI
      await createAsyncAction(
        set,
        () => repositories.user.getMyActivity(year),
        {
          onSuccess: (state, activity) => {
            state.activity = activity;
          },
          onError: (state, error) => {
            state.error = error;
          },
        },
        { logError: true }
      );
    },

    fetchSettings: async () => {
      await createAsyncAction(
        set,
        () => repositories.user.getMySettings(),
        {
          onSuccess: (state, settings) => {
            state.settings = settings;
          },
          onError: (state, error) => {
            state.error = error;
          },
        },
        { logError: true }
      );
    },

    updateSettings: async (newSettings) => {
      await createAsyncAction(
        set,
        () => repositories.user.updateMySettings(newSettings),
        {
          onSuccess: (state, updated) => {
            state.settings = updated;
          },
          onError: (state, error) => {
            state.error = error;
          },
        },
        { throwOnError: true }
      );
    },
  }))
);

