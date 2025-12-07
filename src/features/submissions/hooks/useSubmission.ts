/**
 * @file useSubmission.ts
 * @description Submission hook - uses TanStack Query for mutations with polling
 *
 * @principles
 * - SRP: ✅ Single responsibility: orchestrates submission workflow
 * - CQS: ✅ Queries via useQuery, Commands via useMutation
 * - DIP: ✅ Depends on repository abstraction
 * - Composition: ✅ Composes TanStack Query + PollingService
 *
 * @returns
 * - submitCode(code: string, language: string): Promise<void> - Submit code
 * - currentSubmission: Submission | null - Current submission
 * - isSubmitting: boolean - Submission in progress
 * - error: string | null - Error message
 * - history: Submission[] - Submission history
 * - reset(): void - Reset current submission
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositories } from '../../../shared/repositories';
import { getErrorMessage } from '../../../shared/utils/error';
import { Submission } from '../../../shared/types/api.types';
import { SubmissionPollingService } from '../../../shared/services';

// Query keys for submission-related queries
export const submissionKeys = {
  all: ['submissions'] as const,
  history: (problemId: string) => ['submissions', 'history', problemId] as const,
  detail: (id: string) => ['submissions', 'detail', id] as const,
};

export const useSubmission = (problemId: string) => {
  const queryClient = useQueryClient();
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingServiceRef = useRef<SubmissionPollingService | null>(null);

  // Initialize polling service
  useEffect(() => {
    pollingServiceRef.current = new SubmissionPollingService(repositories.submission);
    return () => {
      pollingServiceRef.current?.stopPolling();
    };
  }, []);

  // Submission history query
  const historyQuery = useQuery({
    queryKey: submissionKeys.history(problemId),
    queryFn: () => repositories.submission.getProblemAttempts(problemId),
    enabled: !!problemId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Submit code mutation
  const submitMutation = useMutation({
    mutationFn: async ({ code, language }: { code: string; language: string }) => {
      return repositories.submission.submitCode(problemId, { code, language });
    },
    onSuccess: (submission) => {
      setCurrentSubmission(submission);
      startPolling(submission.id);
    },
  });

  // Start polling for submission status
  const startPolling = useCallback((submissionId: string) => {
    if (!pollingServiceRef.current) return;

    setIsPolling(true);
    pollingServiceRef.current.startPolling(submissionId, {
      intervalMs: 2000,
      onStatusUpdate: (submission) => {
        setCurrentSubmission(submission);
      },
      onComplete: (submission) => {
        setCurrentSubmission(submission);
        setIsPolling(false);
        // Invalidate history to show new submission
        queryClient.invalidateQueries({ queryKey: submissionKeys.history(problemId) });
      },
      onError: (error) => {
        console.error('Polling error:', error);
        // Don't stop polling on temporary errors
      },
    });
  }, [problemId, queryClient]);

  // Stop polling
  const stopPolling = useCallback(() => {
    pollingServiceRef.current?.stopPolling();
    setIsPolling(false);
  }, []);

  // Submit code wrapper
  const submitCode = useCallback(
    async (code: string, language: string) => {
      const submission = await submitMutation.mutateAsync({ code, language });
      return submission.id;
    },
    [submitMutation]
  );

  // Reset current submission
  const reset = useCallback(() => {
    stopPolling();
    setCurrentSubmission(null);
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    submitCode,
    currentSubmission,
    isSubmitting: submitMutation.isPending || isPolling,
    error: submitMutation.error
      ? getErrorMessage(submitMutation.error, 'Failed to submit code')
      : null,
    history: historyQuery.data ?? [],
    isLoadingHistory: historyQuery.isLoading,
    refetchHistory: historyQuery.refetch,
    reset,
  };
};
