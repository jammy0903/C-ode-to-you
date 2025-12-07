/**
 * @file problemStore.ts
 * @description Problem list and detail state management store
 *
 * @principles
 * - SRP: ✅ Manages ONLY problem-related state (list, detail, filters)
 * - CQS: ✅ Commands (setters) mutate state, Queries (getters) return data
 * - DIP: ✅ No dependencies - pure state management
 * - Composition: ✅ Used by hooks that compose with ProblemService
 *
 * @functions
 * - setProblems(problems: Problem[], pagination: PaginationMeta, append?: boolean): void - Update problem list
 * - setProblemDetail(id: string, problem: Problem): void - Update problem detail cache
 * - setFilters(filters: Partial<GetProblemsParams>): void - Update filters (NO auto-fetch!)
 * - setListLoading(isLoading: boolean): void - Update list loading state
 * - setListRefreshing(isRefreshing: boolean): void - Update list refreshing state
 * - setListError(error: string | null): void - Update list error state
 * - setDetailLoading(id: string, isLoading: boolean): void - Update detail loading state
 * - setDetailError(id: string, error: string | null): void - Update detail error state
 * - clearError(): void - Clear all errors
 *
 * @state
 * - list: ProblemListState - List state (data, pagination, loading, error)
 * - filters: GetProblemsParams - Current filter parameters
 * - detailMap: Record<string, ProblemDetailState> - Cached problem details by ID
 *
 * @note
 * All business logic (API calls, caching) has been moved to ProblemService.
 * This store only manages state - Hook layer orchestrates Service + Store.
 * IMPORTANT: setFilters() no longer auto-fetches! Hook handles this via useEffect.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Problem, PaginationMeta } from '../../../shared/types/api.types';
import { GetProblemsParams } from '../../../shared/api/endpoints/problems.api';

interface ProblemListState {
  data: Problem[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface ProblemDetailState {
  data: Problem | null;
  isLoading: boolean;
  error: string | null;
}

interface ProblemState {
  list: ProblemListState;
  filters: GetProblemsParams;
  detailMap: Record<string, ProblemDetailState>;
}

interface ProblemActions {
  setProblems: (problems: Problem[], pagination: PaginationMeta, append?: boolean) => void;
  setProblemDetail: (id: string, problem: Problem) => void;
  setFilters: (filters: Partial<GetProblemsParams>) => void;
  setListLoading: (isLoading: boolean) => void;
  setListRefreshing: (isRefreshing: boolean) => void;
  setListError: (error: string | null) => void;
  setDetailLoading: (id: string, isLoading: boolean) => void;
  setDetailError: (id: string, error: string | null) => void;
  clearError: () => void;
}

const INITIAL_FILTERS: GetProblemsParams = {
  page: 1,
  limit: 20,
  tags: undefined,
  difficulty: undefined,
  status: undefined,
};

const initialListState: ProblemListState = {
  data: [],
  pagination: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
};

export const useProblemStore = create<ProblemState & ProblemActions>()(
  immer((set) => ({
    // State
    list: initialListState,
    filters: INITIAL_FILTERS,
    detailMap: {},

    // Actions - Pure state mutations only

    setProblems: (problems, pagination, append = false) => {
      set((state) => {
        state.list.data = append ? [...state.list.data, ...problems] : problems;
        state.list.pagination = pagination;
        state.list.isLoading = false;
        state.list.isRefreshing = false;
      });
    },

    setProblemDetail: (id, problem) => {
      set((state) => {
        state.detailMap[id] = {
          data: problem,
          isLoading: false,
          error: null,
        };
      });
    },

    // NOTE: This no longer auto-fetches! Hook handles fetch via useEffect
    setFilters: (filters) => {
      set((state) => {
        state.filters = { ...state.filters, ...filters, page: 1 };
      });
    },

    setListLoading: (isLoading) => {
      set((state) => {
        state.list.isLoading = isLoading;
      });
    },

    setListRefreshing: (isRefreshing) => {
      set((state) => {
        state.list.isRefreshing = isRefreshing;
      });
    },

    setListError: (error) => {
      set((state) => {
        state.list.error = error;
        state.list.isLoading = false;
        state.list.isRefreshing = false;
      });
    },

    setDetailLoading: (id, isLoading) => {
      set((state) => {
        if (!state.detailMap[id]) {
          state.detailMap[id] = { data: null, isLoading, error: null };
        } else {
          state.detailMap[id].isLoading = isLoading;
        }
      });
    },

    setDetailError: (id, error) => {
      set((state) => {
        if (!state.detailMap[id]) {
          state.detailMap[id] = { data: null, isLoading: false, error };
        } else {
          state.detailMap[id].error = error;
          state.detailMap[id].isLoading = false;
        }
      });
    },

    clearError: () => {
      set((state) => {
        state.list.error = null;
        Object.values(state.detailMap).forEach((detail) => {
          detail.error = null;
        });
      });
    },
  }))
);
