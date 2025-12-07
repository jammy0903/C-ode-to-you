/**
 * @file problems.service.ts
 * @description Problem-related business logic service
 *
 * @principles
 * - SRP: ✅ Handles only problem-related business logic (list, detail, search, stats, functions)
 * - DIP: ⚠️ Directly instantiates ProblemRepository (could use DI but acceptable for current size)
 * - Composition: ✅ Uses ProblemRepository for data access
 *
 * @functions
 * - getProblemList(filters, userId?): Promise<{problems, pagination}> - Get paginated problem list with filters
 * - getProblemById(id, userId?): Promise<Problem> - Get problem detail by ID
 * - searchProblems(query): Promise<Problem[]> - Search problems by query string
 * - getProblemStats(userId?): Promise<Stats> - Get problem statistics
 * - getRecommendedFunctions(problemId): Promise<{approaches}> - Get recommended C functions for problem
 *
 * @dependencies
 * - ProblemRepository: Data access layer for problems
 *
 * @duplicateLogic
 * - ⚠️ Tags array normalization repeated in lines 22-24, 46-47, 66-68 (consider extracting to helper)
 */

import { ProblemRepository } from '../../database/repositories/problem.repository';
import { ProblemFilters, FunctionApproach } from './problems.types';
import { AppError } from '../../types/common.types';

export class ProblemsService {
  private problemRepo: ProblemRepository;

  constructor() {
    this.problemRepo = new ProblemRepository();
  }

  /**
   * Get paginated problem list
   */
  async getProblemList(filters: ProblemFilters, userId?: string) {
    const result = await this.problemRepo.findAll(filters, userId);

    const { problems, total, page, limit } = result;

    return {
      problems: problems.map((p) => ({
        ...p,
        tags: Array.isArray(p.tags) ? p.tags : [],
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Get problem detail by ID
   */
  async getProblemById(id: string, userId?: string) {
    const problem = await this.problemRepo.findById(id);

    if (!problem) {
      throw new AppError('Problem not found', 404, 'NOT_FOUND');
    }

    return {
      ...problem,
      tags: Array.isArray(problem.tags) ? problem.tags : [],
      examples: Array.isArray(problem.examples) ? problem.examples : [],
      // TODO: Add user stats when submissions are implemented
      userStats: userId
        ? {
            attempts: 0,
            status: 'unsolved',
            lastAttemptAt: null,
          }
        : undefined,
    };
  }

  /**
   * Search problems
   */
  async searchProblems(query: string) {
    const problems = await this.problemRepo.search(query);

    return problems.map((p) => ({
      ...p,
      tags: Array.isArray(p.tags) ? p.tags : [],
    }));
  }

  /**
   * Get problem statistics
   */
  async getProblemStats(userId?: string) {
    return await this.problemRepo.getStats(userId);
  }

  /**
   * Get recommended functions for a problem
   */
  async getRecommendedFunctions(problemId: string): Promise<{ approaches: FunctionApproach[] }> {
    const problem = await this.problemRepo.findById(problemId);

    if (!problem) {
      throw new AppError('Problem not found', 404, 'NOT_FOUND');
    }

    const functions = await this.problemRepo.getFunctions(problemId);

    // Group functions by category
    const grouped = functions.reduce((acc, func) => {
      if (!acc[func.category]) {
        acc[func.category] = [];
      }
      acc[func.category].push({
        name: func.functionName,
        header: func.headerFile,
        description: func.description,
        example: func.example,
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Convert to approaches format
    const approaches: FunctionApproach[] = Object.entries(grouped).map(([category, funcs]) => ({
      name: category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      description: `Functions for ${category.replace(/_/g, ' ')}`,
      functions: funcs,
    }));

    return { approaches };
  }
}
