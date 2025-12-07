/**
 * @file useProblems.ts
 * @description Problem list hook - uses TanStack Query for server state management
 *
 * @principles
 * - SRP: ✅ Single responsibility: problem list fetching and caching
 * - CQS: ✅ Queries via TanStack Query, filters via local state
 * - DIP: ✅ Depends on repository abstraction
 * - Composition: ✅ Composes TanStack Query + Repository + useState
 *
 * @architecture
 * Hook → TanStack Query (server state) + useState (filters)
 *      → Repository → API
 *
 * @returns
 * - problems: Problem[] - Problem list
 * - isLoading: boolean - Loading state
 * - isRefreshing: boolean - Refreshing state
 * - error: string | null - Error message
 * - pagination: PaginationMeta | null - Pagination metadata
 * - filters: GetProblemsParams - Current filters
 * - setFilters(filters: Partial<GetProblemsParams>): void - Update filters
 * - searchProblems(query: string): Promise<void> - Search problems
 * - loadMore(): void - Load next page
 * - refresh(): void - Refresh first page
 */

import { useState, useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { repositories } from '../../../shared/repositories';
import { GetProblemsParams } from '../../../shared/api/endpoints/problems.api';
import { getErrorMessage } from '../../../shared/utils/error';
import { problemKeys } from './useProblemDetail';

// Extended query keys for problem list
export const problemListKeys = {
  ...problemKeys,
  list: (filters: GetProblemsParams) => ['problems', 'list', filters] as const,
  search: (query: string) => ['problems', 'search', query] as const,
};

const DEFAULT_FILTERS: GetProblemsParams = {
  page: 1,
  limit: 20,
};

export const useProblems = () => {
  const queryClient = useQueryClient();
  const [filters, setFiltersState] = useState<GetProblemsParams>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  // Infinite query for paginated problem list
  const problemsQuery = useInfiniteQuery({
    queryKey: problemListKeys.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      repositories.problem.getProblems({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !searchQuery, // Disable when searching
  });

  // Search query (separate from list query)
  const searchQueryResult = useInfiniteQuery({
    queryKey: problemListKeys.search(searchQuery || ''),
    queryFn: ({ pageParam = 1 }) =>
      repositories.problem.searchProblems(searchQuery || ''),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!searchQuery,
  });

  // Use search results when searching, otherwise use list
  const activeQuery = searchQuery ? searchQueryResult : problemsQuery;

  // Flatten all pages into single array
  const problems = activeQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const lastPage = activeQuery.data?.pages[activeQuery.data.pages.length - 1];
  const pagination = lastPage?.pagination ?? null;

  // Set filters (resets to page 1)
  const setFilters = useCallback((newFilters: Partial<GetProblemsParams>) => {
    setSearchQuery(null); // Clear search when filters change
    setFiltersState((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // Search problems
  const searchProblems = useCallback(async (query: string) => {
    if (query.trim()) {
      setSearchQuery(query.trim());
    } else {
      setSearchQuery(null);
    }
  }, []);

  // Load more (next page)
  const loadMore = useCallback(() => {
    if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
      activeQuery.fetchNextPage();
    }
  }, [activeQuery]);

  // Refresh (refetch first page)
  const refresh = useCallback(() => {
    activeQuery.refetch();
  }, [activeQuery]);

  return {
    problems,
    isLoading: activeQuery.isLoading,
    isRefreshing: activeQuery.isRefetching && !activeQuery.isFetchingNextPage,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
    error: activeQuery.error
      ? getErrorMessage(activeQuery.error, 'Failed to load problems')
      : null,
    pagination,
    hasMore: activeQuery.hasNextPage ?? false,
    filters,
    setFilters,
    searchProblems,
    loadMore,
    refresh,
  };
};
