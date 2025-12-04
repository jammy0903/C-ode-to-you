/**
 * @file submissionStore.ts
 * @description Submission state management store
 * 
 * @principles
 * - SRP: ✅ Manages only submission state (current, history)
 * - CQS: ✅ Commands (submitCode, startPolling) return void/ID, Queries (currentSubmission) return data
 * - DIP: ✅ Uses ISubmissionRepository interface (via repositories.submission)
 * - Composition: ✅ Composes SubmissionPollingService for polling logic
 * 
 * @functions
 * - submitCode(problemId, code, language): Promise<string> - Submit code and return submissionId
 * - startPolling(submissionId: string): void - Start polling submission status
 * - stopPolling(): void - Stop polling
 * - fetchHistory(problemId: string): Promise<void> - Fetch submission history for problem
 * - resetCurrentSubmission(): void - Reset current submission state
 * 
 * @state
 * - currentSubmission: Submission | null - Currently active submission
 * - isSubmitting: boolean - Submission in progress
 * - error: string | null - Error message
 * - history: Submission[] - Recent submission history
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Submission } from '../../../shared/types/api.types';
import { repositories } from '../../../shared/repositories';
import { createAsyncAction } from '../../../shared/stores/core/asyncState';
import { SubmissionPollingService } from '../../../shared/services';

interface SubmissionState {
  currentSubmission: Submission | null;
  isSubmitting: boolean;
  error: string | null;
  history: Submission[]; // Recent submission history
}

interface SubmissionActions {
  submitCode: (problemId: string, code: string, language: string) => Promise<string>; // returns submissionId
  startPolling: (submissionId: string) => void;
  stopPolling: () => void;
  fetchHistory: (problemId: string) => Promise<void>;
  resetCurrentSubmission: () => void;
}

// Create polling service instance
const pollingService = new SubmissionPollingService(repositories.submission);

export const useSubmissionStore = create<SubmissionState & SubmissionActions>()(
  immer((set, get) => ({
    currentSubmission: null,
    isSubmitting: false,
    error: null,
    history: [],

    submitCode: async (problemId, code, language) => {
      // Pure submission - no validation (handled by hook layer)
      let submissionId = '';

      set({ isSubmitting: true, error: null, currentSubmission: null });

      await createAsyncAction(
        set,
        async () => {
          const submission = await repositories.submission.submitCode(problemId, { code, language });
          submissionId = submission.id;
          return submission;
        },
        {
          onSuccess: (state, submission) => {
            state.currentSubmission = submission;
          },
          onError: (state, error) => {
            state.error = error;
            state.isSubmitting = false;
          },
        },
        { throwOnError: true }
      );

      return submissionId;
    },

    startPolling: (submissionId) => {
      // Stop any existing polling
      pollingService.stopPolling();

      // Start new polling
      pollingService.startPolling(submissionId, {
        intervalMs: 2000,
        onStatusUpdate: (submission) => {
          set({ currentSubmission: submission });
        },
        onComplete: (submission) => {
          set({ currentSubmission: submission, isSubmitting: false });
        },
        onError: (error) => {
          console.error('Polling error:', error);
          // Don't stop polling on error - might be temporary
        },
      });
    },

    stopPolling: () => {
      pollingService.stopPolling();
      set({ isSubmitting: false });
    },

    fetchHistory: async (problemId) => {
      await createAsyncAction(
        set,
        () => repositories.submission.getProblemAttempts(problemId),
        {
          onSuccess: (state, history) => {
            state.history = history;
          },
        },
        { logError: true }
      );
    },

    resetCurrentSubmission: () => {
      pollingService.stopPolling();
      set({ currentSubmission: null, isSubmitting: false, error: null });
    },
  }))
);

