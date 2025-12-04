/**
 * @file problemSelectors.ts
 * @description Memoized selectors for problemStore
 *
 * @principles
 * - Performance: ✅ Selectors prevent unnecessary re-renders
 * - SRP: ✅ Each selector has a single purpose
 * - Reusability: ✅ Selectors can be shared across components/hooks
 *
 * @usage
 * ```typescript
 * // In component - only re-renders when problems change
 * const problems = useProblemStore(selectProblems);
 *
 * // Multiple values with shallow comparison
 * const { problems, isLoading } = useProblemStore(selectProblemListState, shallow);
 * ```
 */

import { useProblemStore } from './problemStore';

type ProblemState = ReturnType<typeof useProblemStore.getState>;

// ==================== List Selectors ====================

/** Select problem list data */
export const selectProblems = (state: ProblemState) => state.list.data;

/** Select problem list loading state */
export const selectProblemsLoading = (state: ProblemState) => state.list.isLoading;

/** Select problem list refreshing state */
export const selectProblemsRefreshing = (state: ProblemState) => state.list.isRefreshing;

/** Select problem list error */
export const selectProblemsError = (state: ProblemState) => state.list.error;

/** Select pagination metadata */
export const selectPagination = (state: ProblemState) => state.list.pagination;

/** Select current filters */
export const selectFilters = (state: ProblemState) => state.filters;

/** Combined list state for components that need multiple values */
export const selectProblemListState = (state: ProblemState) => ({
  problems: state.list.data,
  isLoading: state.list.isLoading,
  isRefreshing: state.list.isRefreshing,
  error: state.list.error,
  pagination: state.list.pagination,
});

// ==================== Detail Selectors ====================

/** Select problem detail by ID (factory function) */
export const selectProblemDetail = (id: string) => (state: ProblemState) =>
  state.detailMap[id]?.data ?? null;

/** Select problem detail loading state by ID */
export const selectProblemDetailLoading = (id: string) => (state: ProblemState) =>
  state.detailMap[id]?.isLoading ?? false;

/** Select problem detail error by ID */
export const selectProblemDetailError = (id: string) => (state: ProblemState) =>
  state.detailMap[id]?.error ?? null;

/** Combined detail state by ID */
export const selectProblemDetailState = (id: string) => (state: ProblemState) => ({
  problem: state.detailMap[id]?.data ?? null,
  isLoading: state.detailMap[id]?.isLoading ?? false,
  error: state.detailMap[id]?.error ?? null,
});

// ==================== Derived Selectors ====================

/** Select total problem count */
export const selectTotalProblems = (state: ProblemState) =>
  state.list.pagination?.totalItems ?? 0;

/** Check if there are more pages to load */
export const selectHasMorePages = (state: ProblemState) => {
  const { pagination } = state.list;
  if (!pagination) return false;
  return pagination.currentPage < pagination.totalPages;
};

/** Select current page number */
export const selectCurrentPage = (state: ProblemState) =>
  state.list.pagination?.currentPage ?? 1;

// ==================== Action Selectors ====================

/** Select store actions (stable references) */
export const selectProblemActions = (state: ProblemState) => ({
  setProblems: state.setProblems,
  setProblemDetail: state.setProblemDetail,
  setFilters: state.setFilters,
  setListLoading: state.setListLoading,
  setListRefreshing: state.setListRefreshing,
  setListError: state.setListError,
  setDetailLoading: state.setDetailLoading,
  setDetailError: state.setDetailError,
  clearError: state.clearError,
});
