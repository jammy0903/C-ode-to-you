/**
 * @file authStore.ts
 * @description Authentication state management store
 *
 * @principles
 * - SRP: ✅ Manages ONLY authentication state (user, isAuthenticated, loading, error)
 * - CQS: ✅ Commands (setters) mutate state, Queries (getters) return data
 * - DIP: ✅ No dependencies - pure state management
 * - Composition: ✅ Used by hooks that compose with AuthService
 *
 * @functions
 * - setUser(user: User | null): void - Update user state (pure state mutation)
 * - setAuthenticated(isAuthenticated: boolean): void - Update auth status (pure state mutation)
 * - setLoading(isLoading: boolean): void - Update loading state (pure state mutation)
 * - setError(error: string | null): void - Update error state (pure state mutation)
 * - reset(): void - Reset all auth state (pure state mutation)
 *
 * @state
 * - user: User | null - Current authenticated user
 * - isAuthenticated: boolean - Authentication status
 * - isLoading: boolean - Loading state for async operations
 * - error: string | null - Error message
 *
 * @note
 * All business logic (OAuth flow, token management, API calls) has been moved to AuthService.
 * This store only manages state - Hook layer orchestrates Service + Store.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { User } from '../../../shared/types/api.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  immer((set) => ({
    // State
    ...initialState,

    // Actions - Pure state mutations only
    setUser: (user) => {
      set({ user });
    },

    setAuthenticated: (isAuthenticated) => {
      set({ isAuthenticated });
    },

    setLoading: (isLoading) => {
      set({ isLoading });
    },

    setError: (error) => {
      set({ error });
    },

    reset: () => {
      set(initialState);
    },
  }))
);
