/**
 * @file useProblemDetail.ts
 * @description Problem detail hook - uses TanStack Query for server state management
 *
 * @principles
 * - SRP: ✅ Single responsibility: problem detail fetching and caching
 * - CQS: ✅ Queries return data via TanStack Query
 * - DIP: ✅ Depends on repository abstraction
 * - Composition: ✅ Composes TanStack Query + Repository
 *
 * @architecture
 * Hook → TanStack Query → Repository → API
 *
 * @functions
 * - useProblemDetail(problemId: string): ProblemDetailHookReturn - Hook that returns problem detail
 *
 * @returns
 * - problem: Problem | null - Problem detail
 * - isLoading: boolean - Loading state
 * - error: string | null - Error message
 * - refetch: () => void - Refetch function
 */

import { useQuery } from '@tanstack/react-query';
import { repositories } from '../../../shared/repositories';
import { getErrorMessage } from '../../../shared/utils/error';

// Query keys for problem-related queries
export const problemKeys = {
  all: ['problems'] as const,
  detail: (id: string) => ['problems', 'detail', id] as const,
};

export const useProblemDetail = (problemId: string) => {
  const query = useQuery({
    queryKey: problemKeys.detail(problemId),
    queryFn: () => repositories.problem.getProblemDetail(problemId),
    enabled: !!problemId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    problem: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? getErrorMessage(query.error, 'Failed to load problem') : null,
    refetch: query.refetch,
  };
};
