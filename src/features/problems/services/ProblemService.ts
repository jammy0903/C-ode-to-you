/**
 * @file ProblemService.ts
 * @description Problem business logic service with caching
 *
 * @principles
 * - SRP: ✅ Single responsibility: problem data operations
 * - CQS: ✅ Commands (fetch operations) return data, Queries (getCached) return cached data
 * - DIP: ✅ Depends on IProblemRepository interface
 * - Composition: ✅ Encapsulates caching and fetch logic
 *
 * @responsibilities
 * - Fetch problem list with pagination
 * - Fetch problem detail with caching
 * - Search problems
 * - Cache management for problem details
 *
 * @usage
 * ```typescript
 * const problemService = new ProblemService(repositories.problem);
 * const list = await problemService.fetchProblems({ page: 1, limit: 20 });
 * const detail = await problemService.fetchProblemDetail('problem-123');
 * ```
 */

import { IProblemRepository, ProblemListResult } from '../../../shared/repositories/interfaces';
import { Problem } from '../../../shared/types/api.types';
import { GetProblemsParams } from '../../../shared/api/endpoints/problems.api';

interface CacheEntry {
  data: Problem;
  timestamp: number;
}

export interface IProblemService {
  fetchProblems(params?: GetProblemsParams): Promise<ProblemListResult>;
  fetchProblemDetail(problemId: string, forceRefresh?: boolean): Promise<Problem>;
  searchProblems(query: string): Promise<ProblemListResult>;
  getCachedDetail(problemId: string): Problem | null;
  invalidateCache(problemId?: string): void;
}

export class ProblemService implements IProblemService {
  private problemRepository: IProblemRepository;
  private detailCache = new Map<string, CacheEntry>();
  private cacheMaxAge = 5 * 60 * 1000; // 5 minutes

  constructor(problemRepository: IProblemRepository) {
    this.problemRepository = problemRepository;
  }

  /**
   * Fetch paginated problem list
   *
   * @param params - Query parameters (page, limit, filters)
   * @returns Paginated problem list
   */
  async fetchProblems(params?: GetProblemsParams): Promise<ProblemListResult> {
    try {
      return await this.problemRepository.getProblems(params);
    } catch (error) {
      console.error('[ProblemService] Failed to fetch problems:', error);
      throw error;
    }
  }

  /**
   * Fetch problem detail with caching
   *
   * @param problemId - Problem identifier
   * @param forceRefresh - Skip cache and fetch fresh data
   * @returns Problem detail
   */
  async fetchProblemDetail(problemId: string, forceRefresh = false): Promise<Problem> {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = this.getCachedDetail(problemId);
      if (cached && this.isFullDetail(cached)) {
        return cached;
      }
    }

    try {
      const problem = await this.problemRepository.getProblemDetail(problemId);

      // Update cache
      this.detailCache.set(problemId, {
        data: problem,
        timestamp: Date.now(),
      });

      return problem;
    } catch (error) {
      console.error('[ProblemService] Failed to fetch problem detail:', error);
      throw error;
    }
  }

  /**
   * Search problems by query
   *
   * @param query - Search query
   * @returns Search results
   */
  async searchProblems(query: string): Promise<ProblemListResult> {
    try {
      return await this.problemRepository.searchProblems(query);
    } catch (error) {
      console.error('[ProblemService] Failed to search problems:', error);
      throw error;
    }
  }

  /**
   * Get cached problem detail if valid
   *
   * @param problemId - Problem identifier
   * @returns Cached problem or null
   */
  getCachedDetail(problemId: string): Problem | null {
    const entry = this.detailCache.get(problemId);

    if (!entry) return null;

    // Check if cache is expired
    if (Date.now() - entry.timestamp > this.cacheMaxAge) {
      this.detailCache.delete(problemId);
      return null;
    }

    return entry.data;
  }

  /**
   * Invalidate cache for specific problem or all problems
   *
   * @param problemId - Problem to invalidate (all if not specified)
   */
  invalidateCache(problemId?: string): void {
    if (problemId) {
      this.detailCache.delete(problemId);
    } else {
      this.detailCache.clear();
    }
  }

  /**
   * Check if problem has full detail (description loaded)
   *
   * @private
   * @param problem - Problem to check
   * @returns true if problem has full detail
   */
  private isFullDetail(problem: Problem): boolean {
    return !!problem.description;
  }
}
