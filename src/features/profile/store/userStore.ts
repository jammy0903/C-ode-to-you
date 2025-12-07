/**
 * @file userStore.ts
 * @description User profile client-side state management store
 *
 * @principles
 * - SRP: ✅ Manages ONLY client-side UI state (no server state)
 * - CQS: ✅ Commands (setters) mutate state, Queries (getters) return data
 * - DIP: ✅ No dependencies - pure state management
 * - Composition: ✅ Used by hooks that compose with TanStack Query
 *
 * @note
 * Server state (stats, activity, settings) is now managed by TanStack Query:
 * - useUserStats() - User statistics and activity
 * - useUserSettings() - User settings
 *
 * This store only manages client-side UI preferences that don't need to be synced with server.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UserUIState {
  // Client-side UI preferences
  selectedYear: number;
  activeTab: 'stats' | 'activity' | 'settings';
}

interface UserUIActions {
  setSelectedYear: (year: number) => void;
  setActiveTab: (tab: 'stats' | 'activity' | 'settings') => void;
  reset: () => void;
}

const initialState: UserUIState = {
  selectedYear: new Date().getFullYear(),
  activeTab: 'stats',
};

export const useUserStore = create<UserUIState & UserUIActions>()(
  immer((set) => ({
    ...initialState,

    setSelectedYear: (year) => {
      set({ selectedYear: year });
    },

    setActiveTab: (tab) => {
      set({ activeTab: tab });
    },

    reset: () => {
      set(initialState);
    },
  }))
);
