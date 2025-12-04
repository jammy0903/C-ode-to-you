/**
 * useSubmitCode Hook
 *
 * Orchestrates the complex submission workflow:
 * 1. Validate code
 * 2. Submit to server
 * 3. Start polling for results
 *
 * Design Principles:
 * - Single Responsibility: Only handles submission workflow
 * - Composition: Uses ValidationService + Store + PollingService
 * - No duplication: Reusable across components
 */

import { useSubmissionStore } from '../../features/submissions/store/submissionStore';
import { ValidationService } from '../services';

export interface SubmitCodeOptions {
  /**
   * Auto-start polling after submission
   * @default true
   */
  autoStartPolling?: boolean;

  /**
   * Callback when submission succeeds
   */
  onSuccess?: (submissionId: string) => void;

  /**
   * Callback when submission fails
   */
  onError?: (error: Error) => void;
}

export function useSubmitCode() {
  const store = useSubmissionStore();

  /**
   * Submit code with validation and automatic polling
   */
  const submit = async (
    problemId: string,
    code: string,
    language: string,
    options: SubmitCodeOptions = {}
  ): Promise<string> => {
    const { autoStartPolling = true, onSuccess, onError } = options;

    try {
      // Step 1: Validate
      const validation = ValidationService.validateSubmissionCode(code, language);
      if (!validation.valid) {
        const errorMessage = ValidationService.formatErrors(validation.errors);
        const error = new Error(errorMessage);
        onError?.(error);
        throw error;
      }

      // Step 2: Submit
      const submissionId = await store.submitCode(problemId, code, language);

      // Step 3: Start polling (if enabled)
      if (autoStartPolling) {
        store.startPolling(submissionId);
      }

      // Success callback
      onSuccess?.(submissionId);

      return submissionId;
    } catch (error) {
      // Error callback
      if (error instanceof Error) {
        onError?.(error);
      }
      throw error;
    }
  };

  return {
    submit,
    isSubmitting: store.isSubmitting,
    currentSubmission: store.currentSubmission,
    error: store.error,
    stopPolling: store.stopPolling,
    resetSubmission: store.resetCurrentSubmission,
  };
}
