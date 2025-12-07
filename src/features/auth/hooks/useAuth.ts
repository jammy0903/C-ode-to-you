/**
 * @file useAuth.ts
 * @description Authentication hook - orchestrates AuthService + TanStack Query
 *
 * @principles
 * - SRP: ✅ Single responsibility: orchestrate auth state and actions
 * - CQS: ✅ Queries (session check) separated from Commands (login/logout mutations)
 * - DIP: ✅ Depends on AuthService and TokenService interfaces
 * - Composition: ✅ Composes TanStack Query + AuthService + TokenService
 *
 * @architecture
 * Hook → AuthService (business logic) + TokenService (token management)
 *      → TanStack Query (server state)
 *
 * @hooks
 * - useAuth(): AuthHookReturn - Main auth hook with session state and auth actions
 *
 * @returns
 * - isAuthenticated: boolean - Whether user is authenticated (token exists)
 * - isLoading: boolean - Session query loading state
 * - error: string | null - Combined error from session/login queries
 * - loginWithKakao: (code: string) => Promise<User> - Kakao OAuth login
 * - loginWithGoogle: (accessToken: string) => Promise<User> - Google OAuth login
 * - logout: () => Promise<void> - Clear tokens and session
 * - isLoggingIn: boolean - Login mutation pending state
 * - isLoggingOut: boolean - Logout mutation pending state
 *
 * @queryKeys
 * - authKeys.session: ['auth', 'session'] - Session state query key
 *
 * @note
 * This hook demonstrates Phase 2.2 architecture:
 * - Service: Business logic (AuthService, TokenService)
 * - TanStack Query: Server state management
 * - Hook: Orchestration layer (this file)
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositories } from '../../../shared/repositories';
import { AuthService } from '../services/AuthService';
import { tokenService } from '../services/TokenService';

// Query keys
export const authKeys = {
  session: ['auth', 'session'] as const,
};

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Create AuthService instance (memoized)
  const authService = useMemo(
    () => new AuthService(repositories.auth, tokenService),
    []
  );

  // Session state query - delegates to AuthService
  const sessionQuery = useQuery({
    queryKey: authKeys.session,
    queryFn: () => authService.checkSession(),
    staleTime: Infinity, // Manual refresh only
    gcTime: Infinity,
  });

  // Kakao login - delegates to AuthService
  const loginWithKakao = useMutation({
    mutationFn: async (code: string) => {
      const result = await authService.loginWithKakao(code);
      return result.user;
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, { isAuthenticated: true });
    },
  });

  // Google login - delegates to AuthService
  const loginWithGoogle = useMutation({
    mutationFn: async (accessToken: string) => {
      const result = await authService.loginWithGoogle(accessToken);
      return result.user;
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, { isAuthenticated: true });
    },
  });

  // Logout - delegates to AuthService
  const logout = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, { isAuthenticated: false });
      queryClient.clear(); // Clear all cache
    },
  });

  return {
    isAuthenticated: sessionQuery.data?.isAuthenticated ?? false,
    isLoading: sessionQuery.isLoading,
    error:
      sessionQuery.error?.message ??
      loginWithKakao.error?.message ??
      loginWithGoogle.error?.message ??
      null,
    loginWithKakao: loginWithKakao.mutateAsync,
    loginWithGoogle: loginWithGoogle.mutateAsync,
    logout: logout.mutateAsync,
    isLoggingIn: loginWithKakao.isPending || loginWithGoogle.isPending,
    isLoggingOut: logout.isPending,
  };
};
