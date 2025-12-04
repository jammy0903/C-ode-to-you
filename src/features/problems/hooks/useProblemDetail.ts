/**
 * @file useProblemDetail.ts
 * @description Problem detail hook - orchestrates ProblemService + problemStore
 *
 * @principles
 * - SRP: ✅ Single responsibility: problem detail state + fetching
 * - CQS: ✅ Queries (problem) return data, Commands (fetch) mutate
 * - DIP: ✅ Depends on ProblemService and problemStore abstractions
 * - Composition: ✅ Composes Store (state) + Service (logic) + useEffect for auto-fetch
 *
 * @architecture
 * Hook → ProblemService (business logic) + problemStore (state)
 *
 * @functions
 * - useProblemDetail(problemId: string): ProblemDetailHookReturn - Hook that returns problem detail
 *
 * @returns
 * - problem: Problem | null - Problem detail
 * - isLoading: boolean - Loading state
 * - error: string | null - Error message
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useProblemStore } from '../store/problemStore';
import { ProblemService } from '../services/ProblemService';
import { repositories } from '../../../shared/repositories';
import { getErrorMessage } from '../../../shared/utils/error';

export const useProblemDetail = (problemId: string) => {
  const store = useProblemStore();
  const detailState = store.detailMap[problemId];

  // Create ProblemService instance (memoized)
  const problemService = useMemo(() => new ProblemService(repositories.problem), []);

  // Fetch problem detail via service
  const fetchDetail = useCallback(async () => {
    if (!problemId) return;

    store.setDetailLoading(problemId, true);

    try {
      const problem = await problemService.fetchProblemDetail(problemId);
      store.setProblemDetail(problemId, problem);
    } catch (error) {
      store.setDetailError(problemId, getErrorMessage(error, 'Failed to load problem'));
    }
  }, [problemId, problemService, store]);

  useEffect(() => {
    if (problemId && !detailState?.data) {
      fetchDetail();
    }
  }, [problemId, detailState?.data, fetchDetail]);

  return {
    problem: detailState?.data ?? null,
    isLoading: detailState?.isLoading ?? false,
    error: detailState?.error ?? null,
    refetch: fetchDetail,
  };
};
