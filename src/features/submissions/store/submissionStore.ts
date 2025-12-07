/**
 * @file submissionStore.ts
 * @description Submission client-side UI state management store
 *
 * @principles
 * - SRP: ✅ Manages ONLY client-side UI state (no server state)
 * - CQS: ✅ Commands (setters) mutate state, Queries (getters) return data
 * - DIP: ✅ No dependencies - pure state management
 * - Composition: ✅ Used by hooks that compose with TanStack Query
 *
 * @note
 * Server state (submissions, history) is now managed by TanStack Query:
 * - useSubmission() - Submission operations and polling
 * - useSubmitCode() - Submission with validation
 *
 * This store only manages client-side UI preferences that don't need to be synced with server.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface SubmissionUIState {
  // Client-side UI preferences
  showHistory: boolean;
  selectedTab: 'result' | 'history';
}

interface SubmissionUIActions {
  setShowHistory: (show: boolean) => void;
  setSelectedTab: (tab: 'result' | 'history') => void;
  reset: () => void;
}

const initialState: SubmissionUIState = {
  showHistory: false,
  selectedTab: 'result',
};

export const useSubmissionStore = create<SubmissionUIState & SubmissionUIActions>()(
  immer((set) => ({
    ...initialState,

    setShowHistory: (show) => {
      set({ showHistory: show });
    },

    setSelectedTab: (tab) => {
      set({ selectedTab: tab });
    },

    reset: () => {
      set(initialState);
    },
  }))
);
