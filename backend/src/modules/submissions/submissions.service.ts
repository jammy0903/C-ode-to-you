/**
 * @file submissions.service.ts
 * @description Submission-related business logic service
 *
 * @principles
 * - SRP: ✅ Handles only submission-related business logic (submit, judge, history, drafts)
 * - DIP: ⚠️ Directly instantiates repositories (could use DI but acceptable for current size)
 * - Composition: ✅ Uses JudgeService for code evaluation, repositories for data access
 *
 * @functions
 * - submitCode(userId, problemId, code, language): Promise<SubmissionResponse> - Submit and judge code
 * - getSubmissionById(submissionId, userId): Promise<SubmissionResponse> - Get submission by ID with auth check
 * - getLastSubmission(userId, problemId): Promise<SubmissionResponse | null> - Get user's last submission for problem
 * - getUserAttempts(userId, problemId): Promise<Submission[]> - Get all user attempts for problem
 * - saveDraft(userId, problemId, code): Promise<Draft> - Save draft code
 * - getDraft(userId, problemId): Promise<Draft | null> - Get saved draft
 * - getWrongSubmissions(userId, page, limit): Promise<{submissions, pagination}> - Get user's wrong submissions
 * - getSubmissionHistory(userId, page, limit): Promise<{submissions, pagination}> - Get user's submission history
 * - validateCode(code): Promise<{valid, error?}> - Quick compilation check only
 *
 * @dependencies
 * - JudgeService: Code compilation and execution
 * - SubmissionRepository: Data access for submissions
 * - ProblemRepository: Problem validation
 *
 * @duplicateLogic
 * - ✅ Problem validation consolidated - uses ProblemRepository.validateAndGet()
 */

import { JudgeService } from './judge.service';
import { SubmissionRepository } from '../../database/repositories/submission.repository';
import { ProblemRepository } from '../../database/repositories/problem.repository';
import { ApiError } from '../../utils/response';
import { JudgeResult, SubmissionResponse, SubmissionListItem } from './submissions.types';
import logger from '../../utils/logger';

export class SubmissionService {
  private judgeService: JudgeService;
  private submissionRepo: SubmissionRepository;
  private problemRepo: ProblemRepository;

  constructor() {
    this.judgeService = new JudgeService();
    this.submissionRepo = new SubmissionRepository();
    this.problemRepo = new ProblemRepository();
  }

  /**
   * Submit code for judging
   */
  async submitCode(
    userId: string,
    problemId: string,
    code: string,
    language: string
  ): Promise<SubmissionResponse> {
    // 1. Validate problem exists
    const problem = await this.problemRepo.validateAndGet(problemId);

    // 2. Validate language (currently only C supported)
    if (language !== 'c') {
      throw new ApiError('Only C language is supported', 400);
    }

    // 3. Check if problem has test cases
    if (!Array.isArray(problem.examples) || problem.examples.length === 0) {
      throw new ApiError('Problem has no test cases', 400);
    }

    // 4. Judge the code
    logger.info(`Judging submission for problem ${problem.number} by user ${userId}`);
    const judgeResult: JudgeResult = await this.judgeService.judgeCode(
      code,
      problem.examples as Array<{ input: string; output: string }>
    );

    // 5. Create submission record
    const submission = await this.submissionRepo.create({
      userId,
      problemId,
      code,
      language,
      verdict: judgeResult.verdict,
      executionTime: judgeResult.executionTime,
      memoryUsage: judgeResult.memoryUsage,
      testResults: judgeResult.testResults,
    });

    // 6. Update problem statistics
    const isAccepted = judgeResult.verdict === 'accepted';
    await this.submissionRepo.updateProblemStats(problemId, isAccepted);

    logger.info(
      `Submission ${submission.id} created with verdict: ${judgeResult.verdict}`
    );

    return submission;
  }

  /**
   * Get submission by ID
   */
  async getSubmissionById(submissionId: string, userId: string): Promise<SubmissionResponse> {
    const submission = await this.submissionRepo.findById(submissionId);

    if (!submission) {
      throw new ApiError('Submission not found', 404);
    }

    // Check if user owns this submission
    if (submission.userId !== userId) {
      throw new ApiError('Forbidden', 403);
    }

    return submission;
  }

  /**
   * Get user's last submission for a problem
   */
  async getLastSubmission(
    userId: string,
    problemId: string
  ): Promise<SubmissionResponse | null> {
    // Validate problem exists
    await this.problemRepo.validateAndGet(problemId);

    return this.submissionRepo.findLastByUserAndProblem(userId, problemId);
  }

  /**
   * Get all user's attempts for a problem
   */
  async getUserAttempts(userId: string, problemId: string) {
    // Validate problem exists
    await this.problemRepo.validateAndGet(problemId);

    return this.submissionRepo.findAllByUserAndProblem(userId, problemId);
  }

  /**
   * Save draft code
   */
  async saveDraft(userId: string, problemId: string, code: string) {
    // Validate problem exists
    await this.problemRepo.validateAndGet(problemId);

    return this.submissionRepo.saveDraft(userId, problemId, code);
  }

  /**
   * Get draft code
   */
  async getDraft(userId: string, problemId: string) {
    // Validate problem exists
    await this.problemRepo.validateAndGet(problemId);

    const draft = await this.submissionRepo.getDraft(userId, problemId);
    return draft || null;
  }

  /**
   * Get user's wrong submissions
   */
  async getWrongSubmissions(userId: string, page: number = 1, limit: number = 20) {
    return this.submissionRepo.findWrongByUser(userId, page, limit);
  }

  /**
   * Get user's submission history
   */
  async getSubmissionHistory(userId: string, page: number = 1, limit: number = 20) {
    const result = await this.submissionRepo.findHistoryByUser(userId, page, limit);

    // Transform to list format
    const submissions: SubmissionListItem[] = result.submissions.map((s) => ({
      submissionId: s.id,
      problemNumber: s.problem?.number || 0,
      problemTitle: s.problem?.title || '',
      verdict: s.verdict,
      executionTime: s.executionTime || undefined,
      submittedAt: s.submittedAt,
      githubCommitUrl: s.githubCommit?.commitUrl,
    }));

    return {
      submissions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        totalItems: result.total,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Quick code validation (compilation check only)
   */
  async validateCode(code: string): Promise<{ valid: boolean; error?: string }> {
    return this.judgeService.validateCode(code);
  }
}
