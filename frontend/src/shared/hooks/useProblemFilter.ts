/**
 * useProblemFilter Hook
 *
 * Orchestrates problem filtering and fetching workflow:
 * 1. Update filters
 * 2. Validate filters
 * 3. Fetch problems with new filters via ProblemService
 *
 * Design Principles:
 * - Command-Query Separation: Separate filter updates from fetching
 * - Composition: Uses FilterService + ValidationService + ProblemService + Store
 * - No side effects in Store: All orchestration in Hook
 *
 * Architecture (Phase 2.2):
 * Hook → ProblemService (business logic) + problemStore (state)
 */

import { useMemo, useCallback } from 'react';
import { useProblemStore } from '../../features/problems/store/problemStore';
import { ProblemService } from '../../features/problems/services/ProblemService';
import { ProblemFilterService, ValidationService, FilterState } from '../services';
import { repositories } from '../repositories';
import { getErrorMessage } from '../utils/error';

export function useProblemFilter() {
  const store = useProblemStore();

  // Create ProblemService instance (memoized)
  const problemService = useMemo(() => new ProblemService(repositories.problem), []);

  // Convert store filters (GetProblemsParams) to FilterState
  const currentFilters = ProblemFilterService.fromApiParams(store.filters);

  /**
   * Fetch problems with current filters
   */
  const fetchProblems = useCallback(
    async (page: number, isRefresh = false) => {
      if (isRefresh) {
        store.setListRefreshing(true);
      } else {
        store.setListLoading(true);
      }

      try {
        const result = await problemService.fetchProblems({
          ...store.filters,
          page,
        });
        store.setProblems(result.items, result.pagination, page > 1 && !isRefresh);
      } catch (error) {
        store.setListError(getErrorMessage(error, 'Failed to load problems'));
      }
    },
    [problemService, store]
  );

  /**
   * Update filters and automatically fetch with validation
   */
  const updateFilters = async (newFilters: Partial<FilterState>): Promise<void> => {
    const updatedFilters = ProblemFilterService.mergeFilters(currentFilters, newFilters);

    // Validate before applying
    const validation = ProblemFilterService.validate(updatedFilters);
    if (!validation.valid) {
      console.error('Filter validation failed:', ValidationService.formatErrors(validation.errors));
      return;
    }

    // Convert back to API params and update store
    const apiParams = ProblemFilterService.toApiParams(updatedFilters);
    store.setFilters(apiParams);

    // Fetch with new filters (side effect in Hook, not Store - CQS compliant)
    await fetchProblems(1, true);
  };

  /**
   * Clear all filters and refresh
   */
  const clearAllFilters = async (): Promise<void> => {
    const clearedFilters = ProblemFilterService.clearFilters(currentFilters);
    const apiParams = ProblemFilterService.toApiParams(clearedFilters);
    store.setFilters(apiParams);
    await fetchProblems(1, true);
  };

  /**
   * Toggle a tag filter
   */
  const toggleTag = async (tag: string): Promise<void> => {
    const updatedFilters = ProblemFilterService.toggleTag(currentFilters, tag);
    const apiParams = ProblemFilterService.toApiParams(updatedFilters);
    store.setFilters(apiParams);
    await fetchProblems(1, true);
  };

  /**
   * Set difficulty filter
   */
  const setDifficulty = async (difficulty: 'easy' | 'medium' | 'hard' | undefined): Promise<void> => {
    const updatedFilters = ProblemFilterService.setDifficulty(currentFilters, difficulty);
    const apiParams = ProblemFilterService.toApiParams(updatedFilters);
    store.setFilters(apiParams);
    await fetchProblems(1, true);
  };

  /**
   * Set status filter
   */
  const setStatus = async (status: 'solved' | 'attempted' | 'unsolved' | undefined): Promise<void> => {
    const updatedFilters = ProblemFilterService.setStatus(currentFilters, status);
    const apiParams = ProblemFilterService.toApiParams(updatedFilters);
    store.setFilters(apiParams);
    await fetchProblems(1, true);
  };

  /**
   * Search problems with validation
   */
  const search = async (query: string): Promise<void> => {
    // Validate search query
    const validation = ValidationService.validateSearchQuery(query);
    if (!validation.valid) {
      console.error('Search validation failed:', ValidationService.formatErrors(validation.errors));
      return;
    }

    store.setListLoading(true);
    try {
      const result = await problemService.searchProblems(query);
      store.setProblems(result.items, result.pagination);
    } catch (error) {
      store.setListError(getErrorMessage(error, 'Failed to search problems'));
    }
  };

  /**
   * Get filter summary for display
   */
  const getFilterSummary = (): string[] => {
    return ProblemFilterService.getSummary(currentFilters);
  };

  /**
   * Count active filters
   */
  const getActiveFilterCount = (): number => {
    return ProblemFilterService.countActiveFilters(currentFilters);
  };

  /**
   * Fetch next page
   */
  const fetchNextPage = async (): Promise<void> => {
    const currentPage = store.list.pagination?.currentPage || 0;
    await fetchProblems(currentPage + 1, false);
  };

  return {
    // State (from store.list)
    filters: currentFilters,
    problems: store.list.data,
    pagination: store.list.pagination,
    isLoading: store.list.isLoading,
    isRefreshing: store.list.isRefreshing,
    error: store.list.error,

    // Actions with orchestration
    updateFilters,
    clearAllFilters,
    toggleTag,
    setDifficulty,
    setStatus,
    search,

    // Fetch actions
    fetchProblems,
    fetchNextPage,

    // Utilities
    getFilterSummary,
    getActiveFilterCount,

    // Simple actions
    clearError: store.clearError,
  };
}
