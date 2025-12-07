import { apiClient } from '../client';
import { PaginatedData, Problem } from '../../types/api.types';

export interface GetProblemsParams {
  page?: number;
  limit?: number;
  tags?: string; // comma separated
  difficulty?: string; // comma separated
  status?: 'unsolved' | 'attempted' | 'solved';
  q?: string;
  refresh?: boolean;
}

interface ProblemListResponse {
  problems: Problem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface FunctionApproach {
  name: string;
  description: string;
  functions: Array<{
    name: string;
    header: string;
    description: string;
    example: string;
  }>;
}

interface RecommendedFunctionsResponse {
  approaches: FunctionApproach[];
}

interface ProblemStatsResponse {
  totalProblems: number;
  solvedByUser: number;
  attemptedByUser: number;
  unsolvedByUser: number;
}

/**
 * Problems API endpoints
 * Refactored to use ApiClient for consistent response handling
 */
export const problemsApi = {
  /**
   * Get Problem List
   * GET /api/problems
   */
  getProblems: async (params?: GetProblemsParams): Promise<PaginatedData<Problem>> => {
    const data = await apiClient.get<ProblemListResponse>('/problems', params as Record<string, unknown>);
    return {
      items: data.problems,
      pagination: data.pagination,
    };
  },

  /**
   * Search Problems
   * GET /api/problems/search
   */
  searchProblems: async (query: string): Promise<PaginatedData<Problem>> => {
    const data = await apiClient.get<ProblemListResponse>('/problems/search', { q: query });
    return {
      items: data.problems,
      pagination: data.pagination,
    };
  },

  /**
   * Get Problem Stats
   * GET /api/problems/stats
   */
  getProblemStats: async (): Promise<ProblemStatsResponse> => {
    return apiClient.get<ProblemStatsResponse>('/problems/stats');
  },

  /**
   * Get Problem Detail
   * GET /api/problems/:id
   */
  getProblemDetail: async (problemId: string): Promise<Problem> => {
    return apiClient.get<Problem>(`/problems/${problemId}`);
  },

  /**
   * Get Recommended Functions
   * GET /api/problems/:id/functions
   */
  getRecommendedFunctions: async (problemId: string): Promise<FunctionApproach[]> => {
    const data = await apiClient.get<RecommendedFunctionsResponse>(`/problems/${problemId}/functions`);
    return data.approaches;
  },
};

