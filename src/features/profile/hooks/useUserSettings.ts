/**
 * @file useUserSettings.ts
 * @description User settings hook - uses TanStack Query for server state management
 *
 * @principles
 * - SRP: ✅ Single responsibility: user settings fetching and updating
 * - CQS: ✅ Queries via useQuery, Commands via useMutation
 * - DIP: ✅ Depends on repository abstraction
 * - Composition: ✅ Composes TanStack Query + Repository
 *
 * @returns
 * - settings: UserSettings | null - User settings
 * - isLoading: boolean - Loading state
 * - error: string | null - Error message
 * - updateSettings: (settings: Partial<UserSettings>) => Promise<void> - Update settings
 * - isUpdating: boolean - Update in progress
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositories } from '../../../shared/repositories';
import { getErrorMessage } from '../../../shared/utils/error';
import { UserSettings } from '../../../shared/types/api.types';
import { userKeys } from './useUserStats';

export const useUserSettings = () => {
  const queryClient = useQueryClient();

  // Settings query
  const settingsQuery = useQuery({
    queryKey: userKeys.settings(),
    queryFn: () => repositories.user.getMySettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (newSettings: Partial<UserSettings>) =>
      repositories.user.updateMySettings(newSettings),
    onSuccess: (updatedSettings) => {
      // Update cache with new settings
      queryClient.setQueryData(userKeys.settings(), updatedSettings);
    },
  });

  return {
    settings: settingsQuery.data ?? null,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error
      ? getErrorMessage(settingsQuery.error, 'Failed to load settings')
      : updateMutation.error
        ? getErrorMessage(updateMutation.error, 'Failed to update settings')
        : null,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    refetch: settingsQuery.refetch,
  };
};
