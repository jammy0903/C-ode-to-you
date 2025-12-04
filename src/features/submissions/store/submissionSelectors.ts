/**
 * @file submissionSelectors.ts
 * @description Memoized selectors for submissionStore
 *
 * @principles
 * - Performance: ✅ Selectors prevent unnecessary re-renders
 * - SRP: ✅ Each selector has a single purpose
 * - Reusability: ✅ Selectors can be shared across components/hooks
 */

import { useSubmissionStore } from './submissionStore';

type SubmissionState = ReturnType<typeof useSubmissionStore.getState>;

// ==================== State Selectors ====================

/** Select current submission */
export const selectCurrentSubmission = (state: SubmissionState) => state.currentSubmission;

/** Select submitting state */
export const selectIsSubmitting = (state: SubmissionState) => state.isSubmitting;

/** Select error state */
export const selectError = (state: SubmissionState) => state.error;

/** Select submission history */
export const selectHistory = (state: SubmissionState) => state.history;

/** Combined submission state for components */
export const selectSubmissionState = (state: SubmissionState) => ({
  currentSubmission: state.currentSubmission,
  isSubmitting: state.isSubmitting,
  error: state.error,
  history: state.history,
});

// ==================== Derived Selectors ====================

/** Select current submission status */
export const selectSubmissionStatus = (state: SubmissionState) =>
  state.currentSubmission?.status ?? null;

/** Select current submission verdict */
export const selectSubmissionVerdict = (state: SubmissionState) =>
  state.currentSubmission?.verdict ?? null;

/** Check if submission is pending (waiting for judgment) */
export const selectIsPending = (state: SubmissionState) =>
  state.currentSubmission?.status === 'pending' ||
  state.currentSubmission?.status === 'judging';

/** Check if submission is complete (judged) */
export const selectIsComplete = (state: SubmissionState) =>
  state.currentSubmission?.status !== 'pending' &&
  state.currentSubmission?.status !== 'judging';

/** Check if submission was accepted */
export const selectIsAccepted = (state: SubmissionState) =>
  state.currentSubmission?.verdict === 'accepted';

/** Select history count */
export const selectHistoryCount = (state: SubmissionState) => state.history.length;

// ==================== Action Selectors ====================

/** Select store actions (stable references) */
export const selectSubmissionActions = (state: SubmissionState) => ({
  submitCode: state.submitCode,
  startPolling: state.startPolling,
  stopPolling: state.stopPolling,
  fetchHistory: state.fetchHistory,
  resetCurrentSubmission: state.resetCurrentSubmission,
});
