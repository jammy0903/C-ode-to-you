/**
 * @file useUserStats.ts
 * @description User statistics hook - composes userStore with auto-fetch
 * 
 * @principles
 * - SRP: ✅ Single responsibility: user stats state access
 * - CQS: ✅ Queries (stats, activity) return data, Commands (refresh) mutate
 * - DIP: ✅ Depends on userStore abstraction
 * - Composition: ✅ Composes userStore + useEffect for auto-fetch
 * 
 * @functions
 * - useUserStats(): UserStatsHookReturn - Hook that returns user stats state and actions
 * 
 * @returns
 * - stats: UserStats | null - User statistics
 * - activity: UserActivity[] - User activity
 * - isLoading: boolean - Loading state
 * - error: string | null - Error message
 * - refresh(): void - Refresh stats and activity
 */

import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';

export const useUserStats = () => {
  const store = useUserStore();

  useEffect(() => {
    // Initial fetch if empty
    if (!store.stats) {
      store.fetchStats();
    }
    if (store.activity.length === 0) {
      store.fetchActivity();
    }
  }, []);

  return {
    stats: store.stats,
    activity: store.activity,
    isLoading: store.isLoading,
    error: store.error,
    refresh: () => {
      store.fetchStats();
      store.fetchActivity();
    },
  };
};
