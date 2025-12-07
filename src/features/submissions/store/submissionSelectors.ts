/**
 * @file submissionSelectors.ts
 * @description Memoized selectors for submissionStore (client-side UI state only)
 *
 * @principles
 * - Performance: Selectors prevent unnecessary re-renders
 * - SRP: Each selector has a single purpose
 * - Reusability: Selectors can be shared across components/hooks
 *
 * @note
 * Server state selectors have been removed. Use TanStack Query hooks instead:
 * - useSubmission() - Submission operations and history
 * - useSubmitCode() - Submission with validation
 */

import { useSubmissionStore } from './submissionStore';

type SubmissionUIState = ReturnType<typeof useSubmissionStore.getState>;

// ==================== UI State Selectors ====================

/** Select show history flag */
export const selectShowHistory = (state: SubmissionUIState) => state.showHistory;

/** Select active tab */
export const selectSelectedTab = (state: SubmissionUIState) => state.selectedTab;

/** Combined UI state for components */
export const selectSubmissionUIState = (state: SubmissionUIState) => ({
  showHistory: state.showHistory,
  selectedTab: state.selectedTab,
});

// ==================== Action Selectors ====================

/** Select store actions (stable references) */
export const selectSubmissionUIActions = (state: SubmissionUIState) => ({
  setShowHistory: state.setShowHistory,
  setSelectedTab: state.setSelectedTab,
  reset: state.reset,
});
