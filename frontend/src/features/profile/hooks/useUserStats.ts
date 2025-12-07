/**
 * @file useUserStats.ts
 * @description User statistics hook - uses TanStack Query for server state management
 *
 * @principles
 * - SRP: ✅ Single responsibility: user stats fetching and caching
 * - CQS: ✅ Queries via TanStack Query
 * - DIP: ✅ Depends on repository abstraction
 * - Composition: ✅ Composes TanStack Query + Repository
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

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { repositories } from '../../../shared/repositories';
import { getErrorMessage } from '../../../shared/utils/error';

// Query keys for user-related queries
export const userKeys = {
  all: ['user'] as const,
  stats: () => ['user', 'stats'] as const,
  activity: (year?: number) => ['user', 'activity', year] as const,
  settings: () => ['user', 'settings'] as const,
};

export const useUserStats = (year?: number) => {
  const queryClient = useQueryClient();

  // Stats query
  const statsQuery = useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => repositories.user.getMyStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Activity query
  const activityQuery = useQuery({
    queryKey: userKeys.activity(year),
    queryFn: () => repositories.user.getMyActivity(year),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Combined loading state
  const isLoading = statsQuery.isLoading || activityQuery.isLoading;

  // Combined error
  const error =
    statsQuery.error || activityQuery.error
      ? getErrorMessage(
          statsQuery.error || activityQuery.error,
          'Failed to load user data'
        )
      : null;

  // Refresh both queries
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    queryClient.invalidateQueries({ queryKey: userKeys.activity(year) });
  };

  return {
    stats: statsQuery.data ?? null,
    activity: activityQuery.data ?? [],
    isLoading,
    error,
    refresh,
  };
};
