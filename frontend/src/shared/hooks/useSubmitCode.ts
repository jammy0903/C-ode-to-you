/**
 * useSubmitCode Hook
 *
 * Orchestrates the complex submission workflow:
 * 1. Validate code
 * 2. Submit to server (via useSubmission)
 * 3. Start polling for results
 *
 * Design Principles:
 * - Single Responsibility: Only handles submission workflow with validation
 * - Composition: Uses ValidationService + useSubmission hook
 * - No duplication: Reusable across components
 *
 * @note
 * This hook wraps useSubmission with validation logic.
 * For direct submission without validation, use useSubmission directly.
 */

import { useCallback } from 'react';
import { useSubmission } from '../../features/submissions/hooks/useSubmission';
import { ValidationService } from '../services';

export interface SubmitCodeOptions {
  /**
   * Callback when submission succeeds
   */
  onSuccess?: (submissionId: string) => void;

  /**
   * Callback when submission fails
   */
  onError?: (error: Error) => void;
}

export function useSubmitCode(problemId: string) {
  const submission = useSubmission(problemId);

  /**
   * Submit code with validation
   */
  const submit = useCallback(
    async (
      code: string,
      language: string,
      options: SubmitCodeOptions = {}
    ): Promise<string> => {
      const { onSuccess, onError } = options;

      try {
        // Step 1: Validate
        const validation = ValidationService.validateSubmissionCode(code, language);
        if (!validation.valid) {
          const errorMessage = ValidationService.formatErrors(validation.errors);
          const error = new Error(errorMessage);
          onError?.(error);
          throw error;
        }

        // Step 2: Submit (polling is handled internally by useSubmission)
        const submissionId = await submission.submitCode(code, language);

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
    },
    [submission]
  );

  return {
    submit,
    isSubmitting: submission.isSubmitting,
    currentSubmission: submission.currentSubmission,
    error: submission.error,
    resetSubmission: submission.reset,
  };
}
