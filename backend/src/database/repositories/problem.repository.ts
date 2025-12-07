/**
 * @file problem.repository.ts
 * @description Problem data access layer (Repository pattern)
 *
 * @principles
 * - SRP: ✅ Data access only - no business logic
 * - Repository Pattern: Abstracts Prisma operations
 * - Complex Queries: Handles filtering, pagination, user stats enrichment
 *
 * @functions (6 total)
 * - findAll(filters, userId?): Promise<{problems, total, page, limit}> - Paginated list with optional user stats
 * - findById(id): Promise<Problem> - Get problem by ID with functions
 * - findByNumber(number): Promise<Problem> - Get problem by Baekjoon number
 * - search(query): Promise<Problem[]> - Full-text search by title/number (limit 20)
 * - getStats(userId?): Promise<Statistics> - Problem statistics (total, by difficulty)
 * - getFunctions(problemId): Promise<Function[]> - Get recommended C functions for problem
 * - validateAndGet(problemId): Promise<Problem> - Validate and return (throws if not found)
 *
 * @complexity
 * - findAll: Most complex method (270 lines total, 138 lines implementation)
 *   - Uses Promise.all for parallel queries (line 52)
 *   - Conditional user stats enrichment (lines 72-130)
 *   - Algorithm: Fetch submissions → Group by problemId → Enhance with userStatus
 *   - Performance: O(n) where n = problems on page (not total problems)
 *
 * @userStatsEnrichment (lines 72-130)
 * - Fetches user submissions for current page problems only (not all problems)
 * - Groups submissions by problemId using reduce()
 * - Calculates userStatus: 'solved' | 'attempted' | 'unsolved'
 * - Adds: userStatus, userAttempts, lastAttemptAt fields
 * - Post-filters by status if requested (client-side filter for user-specific data)
 *
 * @queryPatterns
 * - Filtering: where clause with difficulty + tags (array_contains)
 * - Pagination: skip/take pattern with count
 * - Search: OR query (number exact match OR title contains)
 * - Relations: include functions for detail queries
 *
 * @duplicateLogic
 * - ✅ No duplication - helper method added for validation
 */

import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { ProblemFilters } from '../../modules/problems/problems.types';

export class ProblemRepository {
  /**
   * Find all problems with pagination and filters
   */
  async findAll(filters: ProblemFilters, userId?: string) {
    const { page = 1, limit = 20, tags, difficulty, status } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProblemWhereInput = {};

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      where.tags = {
        array_contains: tagArray,
      };
    }

    // Get problems
    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { number: 'asc' },
        select: {
          id: true,
          number: true,
          title: true,
          difficulty: true,
          tags: true,
          acceptedCount: true,
          submissionCount: true,
        },
      }),
      prisma.problem.count({ where }),
    ]);

    // Add user-specific stats if userId is provided
    if (userId) {
      const problemIds = problems.map((p) => p.id);

      // Get user submissions for these problems
      const submissions = await prisma.submission.findMany({
        where: {
          userId,
          problemId: { in: problemIds },
        },
        select: {
          problemId: true,
          verdict: true,
          submittedAt: true,
        },
        orderBy: {
          submittedAt: 'desc',
        },
      });

      // Group submissions by problemId
      const submissionsByProblem = submissions.reduce((acc, sub) => {
        if (!acc[sub.problemId]) {
          acc[sub.problemId] = [];
        }
        acc[sub.problemId].push(sub);
        return acc;
      }, {} as Record<string, typeof submissions>);

      // Enhance problems with user stats
      const enhancedProblems = problems.map((problem) => {
        const userSubmissions = submissionsByProblem[problem.id] || [];
        const hasAccepted = userSubmissions.some((s) => s.verdict === 'accepted');
        const userStatus = hasAccepted
          ? 'solved'
          : userSubmissions.length > 0
          ? 'attempted'
          : 'unsolved';

        return {
          ...problem,
          userStatus,
          userAttempts: userSubmissions.length,
          lastAttemptAt: userSubmissions[0]?.submittedAt,
        };
      });

      // Filter by status if requested
      let filteredProblems = enhancedProblems;
      if (status) {
        filteredProblems = enhancedProblems.filter((p) => p.userStatus === status);
      }

      return {
        problems: filteredProblems,
        total: status ? filteredProblems.length : total,
        page,
        limit,
      };
    }

    return {
      problems,
      total,
      page,
      limit,
    };
  }

  /**
   * Find problem by ID with functions
   */
  async findById(id: string) {
    return prisma.problem.findUnique({
      where: { id },
      include: {
        functions: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Find problem by number
   */
  async findByNumber(number: number) {
    return prisma.problem.findUnique({
      where: { number },
      include: {
        functions: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Search problems by title or number
   */
  async search(query: string) {
    const numberQuery = parseInt(query);

    const where: Prisma.ProblemWhereInput = isNaN(numberQuery)
      ? {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        }
      : {
          OR: [
            { number: numberQuery },
            {
              title: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        };

    return prisma.problem.findMany({
      where,
      take: 20,
      orderBy: { number: 'asc' },
      select: {
        id: true,
        number: true,
        title: true,
        difficulty: true,
        tags: true,
        acceptedCount: true,
        submissionCount: true,
      },
    });
  }

  /**
   * Get problem statistics
   */
  async getStats(userId?: string) {
    const total = await prisma.problem.count();

    if (!userId) {
      return {
        totalProblems: total,
        solvedByUser: 0,
        attemptedByUser: 0,
        unsolvedByUser: total,
      };
    }

    // Get user's solved and attempted problems
    const userSubmissions = await prisma.submission.findMany({
      where: { userId },
      distinct: ['problemId'],
      select: {
        problemId: true,
        verdict: true,
      },
    });

    const solvedProblems = new Set<string>();
    const attemptedProblems = new Set<string>();

    for (const submission of userSubmissions) {
      if (submission.verdict === 'accepted') {
        solvedProblems.add(submission.problemId);
      } else {
        attemptedProblems.add(submission.problemId);
      }
    }

    // Remove solved problems from attempted
    attemptedProblems.forEach((pid) => {
      if (solvedProblems.has(pid)) {
        attemptedProblems.delete(pid);
      }
    });

    return {
      totalProblems: total,
      solvedByUser: solvedProblems.size,
      attemptedByUser: attemptedProblems.size,
      unsolvedByUser: total - solvedProblems.size - attemptedProblems.size,
    };
  }

  /**
   * Get functions for a problem
   */
  async getFunctions(problemId: string) {
    return prisma.problemFunction.findMany({
      where: { problemId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Validate problem exists and return it (throws ApiError if not found)
   * Helper to eliminate duplicate validation logic across services
   */
  async validateAndGet(problemId: string) {
    const problem = await this.findById(problemId);
    if (!problem) {
      // Import ApiError locally to avoid circular dependency
      const { ApiError } = require('../../utils/response');
      throw new ApiError('Problem not found', 404);
    }
    return problem;
  }
}
