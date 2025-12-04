/**
 * @file authSelectors.ts
 * @description Memoized selectors for authStore
 *
 * @principles
 * - Performance: ✅ Selectors prevent unnecessary re-renders
 * - SRP: ✅ Each selector has a single purpose
 * - Reusability: ✅ Selectors can be shared across components/hooks
 */

import { useAuthStore } from './authStore';

type AuthState = ReturnType<typeof useAuthStore.getState>;

// ==================== State Selectors ====================

/** Select current user */
export const selectUser = (state: AuthState) => state.user;

/** Select authentication status */
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;

/** Select loading state */
export const selectIsLoading = (state: AuthState) => state.isLoading;

/** Select error state */
export const selectError = (state: AuthState) => state.error;

/** Combined auth state for components */
export const selectAuthState = (state: AuthState) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
});

// ==================== Derived Selectors ====================

/** Select user display name */
export const selectUserDisplayName = (state: AuthState) =>
  state.user?.name ?? state.user?.email ?? 'Guest';

// ==================== Action Selectors ====================

/** Select store actions (stable references) */
export const selectAuthActions = (state: AuthState) => ({
  setUser: state.setUser,
  setAuthenticated: state.setAuthenticated,
  setLoading: state.setLoading,
  setError: state.setError,
  reset: state.reset,
});
