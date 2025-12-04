/**
 * @file useSubmission.ts
 * @description Submission hook - composes submissionStore with polling logic
 *
 * @principles
 * - SRP: ✅ Single responsibility: orchestrates submission workflow
 * - CQS: ✅ Queries (currentSubmission, history) return data, Commands (submitCode) mutate
 * - DIP: ✅ Depends on submissionStore abstraction
 * - Composition: ✅ Uses store's polling service
 *
 * @functions
 * - useSubmission(problemId: string): SubmissionHookReturn - Hook that returns submission state and actions
 *
 * @returns
 * - submitCode(code: string, language: string): Promise<void> - Submit code
 * - currentSubmission: Submission | null - Current submission
 * - isSubmitting: boolean - Submission in progress
 * - error: string | null - Error message
 * - history: Submission[] - Submission history
 * - fetchHistory(): Promise<void> - Fetch history
 * - reset(): void - Reset current submission
 */

import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSubmissionStore } from '../store/submissionStore';
import {
  selectSubmissionState,
  selectSubmissionActions,
} from '../store/submissionSelectors';

export const useSubmission = (problemId: string) => {
  // Use selectors for optimal re-rendering
  const state = useSubmissionStore(useShallow(selectSubmissionState));
  const actions = useSubmissionStore(useShallow(selectSubmissionActions));

  // Start polling when submission is in progress
  useEffect(() => {
    if (state.isSubmitting && state.currentSubmission?.id) {
      actions.startPolling(state.currentSubmission.id);
    }

    // Cleanup: stop polling on unmount or when submission completes
    return () => {
      actions.stopPolling();
    };
  }, [state.isSubmitting, state.currentSubmission?.id, actions]);

  const submitCode = async (code: string, language: string) => {
    const submissionId = await actions.submitCode(problemId, code, language);
    // Polling is started automatically via the useEffect above
    return submissionId;
  };

  return {
    submitCode,
    currentSubmission: state.currentSubmission,
    isSubmitting: state.isSubmitting,
    error: state.error,
    history: state.history,
    fetchHistory: () => actions.fetchHistory(problemId),
    reset: actions.resetCurrentSubmission,
  };
};
