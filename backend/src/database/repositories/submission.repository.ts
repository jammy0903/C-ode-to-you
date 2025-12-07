/**
 * @file submission.repository.ts
 * @description Submission data access layer (Repository pattern)
 *
 * @principles
 * - SRP: ✅ Data access only - no business logic
 * - Repository Pattern: Abstracts Prisma operations
 * - Raw SQL: Uses $queryRaw for complex aggregate queries
 *
 * @functions (9 total)
 * - create(data): Promise<Submission> - Create new submission with judge results
 * - findById(id): Promise<Submission> - Get submission with problem and GitHub commit info
 * - findLastByUserAndProblem(userId, problemId): Promise<Submission> - Get most recent submission
 * - findAllByUserAndProblem(userId, problemId): Promise<Submission[]> - Get all attempts
 * - findWrongByUser(userId, page, limit): Promise<{problems, total}> - Problems with no accepted solution (raw SQL)
 * - findHistoryByUser(userId, page, limit): Promise<{submissions, total}> - Submission history with pagination
 * - saveDraft(userId, problemId, code): Promise<Draft> - Upsert draft code
 * - getDraft(userId, problemId): Promise<Draft> - Get saved draft
 * - updateProblemStats(problemId, accepted): Promise<void> - Increment problem counters
 *
 * @rawSqlQueries
 * - findWrongByUser (lines 115-147): Complex query with window functions
 *   - Uses DISTINCT ON, COUNT OVER, MAX OVER for aggregation
 *   - Subquery with NOT EXISTS to exclude solved problems
 *   - PostgreSQL-specific syntax (may not work on other databases)
 *   - Returns: problem info + last verdict + attempt count + last attempt date
 *
 * @upsertPattern
 * - saveDraft (lines 207-224): Uses Prisma upsert
 *   - Compound unique key: userId_problemId
 *   - Update: Refreshes code + savedAt timestamp
 *   - Create: New draft with current timestamp
 *
 * @includes
 * - findById: Includes problem (number, title) + githubCommit
 * - findHistoryByUser: Includes problem + githubCommit.commitUrl
 *
 * @duplicateLogic
 * - ✅ No duplication - well-structured queries
 */

import { prisma } from '../../config/database';
import { Verdict } from '@prisma/client';

export class SubmissionRepository {
  /**
   * Create submission
   */
  async create(data: {
    userId: string;
    problemId: string;
    code: string;
    language: string;
    verdict: Verdict;
    executionTime?: number;
    memoryUsage?: number;
    testResults?: any;
  }) {
    return prisma.submission.create({
      data: {
        ...data,
        judgedAt: new Date(),
      },
    });
  }

  /**
   * Find submission by ID
   */
  async findById(id: string) {
    return prisma.submission.findUnique({
      where: { id },
      include: {
        problem: {
          select: {
            number: true,
            title: true,
          },
        },
        githubCommit: true,
      },
    });
  }

  /**
   * Get user's last submission for a problem
   */
  async findLastByUserAndProblem(userId: string, problemId: string) {
    return prisma.submission.findFirst({
      where: {
        userId,
        problemId,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  /**
   * Get all user's attempts for a problem
   */
  async findAllByUserAndProblem(userId: string, problemId: string) {
    return prisma.submission.findMany({
      where: {
        userId,
        problemId,
      },
      orderBy: {
        submittedAt: 'desc',
      },
      select: {
        id: true,
        verdict: true,
        submittedAt: true,
        executionTime: true,
      },
    });
  }

  /**
   * Get user's wrong submissions
   */
  async findWrongByUser(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Get problems with wrong submissions (no accepted submission)
    const wrongProblems = await prisma.$queryRaw<
      Array<{
        problem_id: string;
        number: number;
        title: string;
        difficulty: string;
        last_verdict: string;
        attempts: bigint;
        last_attempt_at: Date;
      }>
    >`
      SELECT DISTINCT ON (s.problem_id)
        s.problem_id,
        p.number,
        p.title,
        p.difficulty,
        s.verdict as last_verdict,
        COUNT(*) OVER (PARTITION BY s.problem_id) as attempts,
        MAX(s.submitted_at) OVER (PARTITION BY s.problem_id) as last_attempt_at
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = ${userId}::uuid
        AND s.verdict != 'accepted'
        AND NOT EXISTS (
          SELECT 1 FROM submissions s2
          WHERE s2.user_id = s.user_id
            AND s2.problem_id = s.problem_id
            AND s2.verdict = 'accepted'
        )
      ORDER BY s.problem_id, s.submitted_at DESC
      LIMIT ${limit}
      OFFSET ${skip}
    `;

    const total = await prisma.submission.count({
      where: {
        userId,
        verdict: { not: 'accepted' },
      },
      distinct: ['problemId'],
    });

    return {
      problems: wrongProblems.map((p) => ({
        problemId: p.problem_id,
        number: p.number,
        title: p.title,
        difficulty: p.difficulty,
        lastVerdict: p.last_verdict,
        attempts: Number(p.attempts),
        lastAttemptAt: p.last_attempt_at,
      })),
      total,
    };
  }

  /**
   * Get user's submission history
   */
  async findHistoryByUser(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          problem: {
            select: {
              number: true,
              title: true,
            },
          },
          githubCommit: {
            select: {
              commitUrl: true,
            },
          },
        },
      }),
      prisma.submission.count({ where: { userId } }),
    ]);

    return { submissions, total };
  }

  /**
   * Save draft code
   */
  async saveDraft(userId: string, problemId: string, code: string) {
    return prisma.draft.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
      update: {
        code,
        savedAt: new Date(),
      },
      create: {
        userId,
        problemId,
        code,
      },
    });
  }

  /**
   * Get draft code
   */
  async getDraft(userId: string, problemId: string) {
    return prisma.draft.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
    });
  }

  /**
   * Update problem stats after submission
   */
  async updateProblemStats(problemId: string, isAccepted: boolean) {
    await prisma.problem.update({
      where: { id: problemId },
      data: {
        submissionCount: { increment: 1 },
        ...(isAccepted && { acceptedCount: { increment: 1 } }),
      },
    });
  }
}
