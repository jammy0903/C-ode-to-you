/**
 * @file useProblems.ts
 * @description Problem list hook - orchestrates ProblemService + problemStore
 *
 * @principles
 * - SRP: ✅ Single responsibility: orchestrate problem list state + service
 * - CQS: ✅ Queries (problems, pagination) return data, Commands (setFilters, loadMore) mutate
 * - DIP: ✅ Depends on ProblemService and problemStore abstractions
 * - Composition: ✅ Composes Store (state) + Service (logic) + useEffect for auto-fetch
 *
 * @architecture
 * Hook → ProblemService (business logic) + problemStore (state)
 *
 * @functions
 * - useProblems(): ProblemsHookReturn - Hook that returns problem list state and actions
 *
 * @returns
 * - problems: Problem[] - Problem list
 * - isLoading: boolean - Loading state
 * - isRefreshing: boolean - Refreshing state
 * - error: string | null - Error message
 * - pagination: PaginationMeta | null - Pagination metadata
 * - filters: GetProblemsParams - Current filters
 * - setFilters(filters: Partial<GetProblemsParams>): void - Update filters (triggers fetch)
 * - searchProblems(query: string): Promise<void> - Search problems
 * - loadMore(): void - Load next page
 * - refresh(): void - Refresh first page
 *
 * @note
 * This hook demonstrates Phase 2.2 architecture:
 * - Store: Pure state management (problemStore)
 * - Service: Business logic (ProblemService)
 * - Hook: Orchestration layer (this file)
 * IMPORTANT: setFilters now triggers fetch via useEffect (CQS compliant)
 */

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useProblemStore } from '../store/problemStore';
import { ProblemService } from '../services/ProblemService';
import { repositories } from '../../../shared/repositories';
import { GetProblemsParams } from '../../../shared/api/endpoints/problems.api';
import { getErrorMessage } from '../../../shared/utils/error';
import {
  selectProblemListState,
  selectFilters,
  selectHasMorePages,
  selectProblemActions,
} from '../store/problemSelectors';

export const useProblems = () => {
  // Use selectors for optimal re-rendering
  const listState = useProblemStore(useShallow(selectProblemListState));
  const filters = useProblemStore(selectFilters);
  const hasMore = useProblemStore(selectHasMorePages);
  const actions = useProblemStore(useShallow(selectProblemActions));

  const initialFetchDone = useRef(false);

  // Create ProblemService instance (memoized)
  const problemService = useMemo(() => new ProblemService(repositories.problem), []);

  // Fetch problems with current filters
  const fetchProblems = useCallback(
    async (page: number, isRefresh = false) => {
      if (isRefresh) {
        actions.setListRefreshing(true);
      } else {
        actions.setListLoading(true);
      }

      try {
        const result = await problemService.fetchProblems({
          ...filters,
          page,
        });
        actions.setProblems(result.items, result.pagination, page > 1 && !isRefresh);
      } catch (error) {
        actions.setListError(getErrorMessage(error, 'Failed to load problems'));
      }
    },
    [problemService, filters, actions]
  );

  // Initial fetch on mount
  useEffect(() => {
    if (!initialFetchDone.current && listState.problems.length === 0) {
      fetchProblems(1);
      initialFetchDone.current = true;
    }
  }, [fetchProblems, listState.problems.length]);

  // Re-fetch when filters change (CQS compliant - side effect in Hook, not Store)
  const filtersRef = useRef(filters);
  useEffect(() => {
    // Skip initial render
    if (filtersRef.current === filters) return;

    filtersRef.current = filters;
    fetchProblems(1, true);
  }, [filters, fetchProblems]);

  // Load more (next page)
  const loadMore = useCallback(() => {
    if (!listState.isLoading && hasMore && listState.pagination) {
      fetchProblems(listState.pagination.currentPage + 1);
    }
  }, [listState.pagination, listState.isLoading, hasMore, fetchProblems]);

  // Refresh (first page)
  const refresh = useCallback(() => {
    fetchProblems(1, true);
  }, [fetchProblems]);

  // Search problems
  const searchProblems = useCallback(
    async (query: string) => {
      actions.setListLoading(true);

      try {
        const result = await problemService.searchProblems(query);
        actions.setProblems(result.items, result.pagination);
      } catch (error) {
        actions.setListError(getErrorMessage(error, 'Failed to search problems'));
      }
    },
    [problemService, actions]
  );

  return {
    problems: listState.problems,
    isLoading: listState.isLoading,
    isRefreshing: listState.isRefreshing,
    error: listState.error,
    pagination: listState.pagination,
    filters,
    setFilters: actions.setFilters,
    searchProblems,
    loadMore,
    refresh,
  };
};
