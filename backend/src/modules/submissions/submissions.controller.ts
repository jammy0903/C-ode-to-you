/**
 * @file submissions.controller.ts
 * @description HTTP request handlers for submission-related endpoints
 * @layer Controller - Request/Response handling only, delegates to Service
 *
 * @endpoints (9 total)
 * 1. POST /api/submissions/:problemId/submit - Submit code for judging
 * 2. GET /api/submissions/:submissionId/status - Get submission result
 * 3. GET /api/submissions/:problemId/my-last - Get user's last submission for problem
 * 4. GET /api/submissions/:problemId/attempts - Get all user attempts for problem
 * 5. POST /api/submissions/:problemId/draft - Save draft code
 * 6. GET /api/submissions/:problemId/draft - Get saved draft
 * 7. GET /api/submissions/wrong - Get wrong submissions (paginated)
 * 8. GET /api/submissions/history - Get submission history (paginated)
 * 9. POST /api/submissions/validate - Quick compilation check (no auth required)
 *
 * @patterns
 * - All methods use asyncHandler wrapper
 * - Required auth: userId from req.userId! (non-null assertion)
 * - Pagination: parseInt with || fallback (page || 1, limit || 20)
 * - Status code 201 for creation (submitCode)
 *
 * @requestParsing
 * - URL params: problemId, submissionId (direct extraction)
 * - Body params: code, language (with default language='c')
 * - Query params: page, limit (with defaults)
 *
 * @duplicateLogic
 * - ✅ No duplication - clean delegation pattern
 */

import { Request, Response } from 'express';
import { SubmissionService } from './submissions.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/async-handler';

export class SubmissionController {
  private submissionService: SubmissionService;

  constructor() {
    this.submissionService = new SubmissionService();
  }

  /**
   * POST /api/submissions/:problemId/submit
   * Submit code for judging
   */
  submitCode = asyncHandler(async (req: Request, res: Response) => {
    const { problemId } = req.params;
    const { code, language = 'c' } = req.body;
    const userId = req.userId!;

    const submission = await this.submissionService.submitCode(
      userId,
      problemId,
      code,
      language
    );

    return sendSuccess(res, submission, 'Code submitted successfully', 201);
  });

  /**
   * GET /api/submissions/:submissionId/status
   * Get submission status and result
   */
  getSubmissionStatus = asyncHandler(async (req: Request, res: Response) => {
    const { submissionId } = req.params;
    const userId = req.userId!;

    const submission = await this.submissionService.getSubmissionById(submissionId, userId);

    return sendSuccess(res, submission);
  });

  /**
   * GET /api/submissions/:problemId/my-last
   * Get user's last submission for a problem
   */
  getLastSubmission = asyncHandler(async (req: Request, res: Response) => {
    const { problemId } = req.params;
    const userId = req.userId!;

    const submission = await this.submissionService.getLastSubmission(userId, problemId);

    return sendSuccess(res, submission);
  });

  /**
   * GET /api/submissions/:problemId/attempts
   * Get all user's attempts for a problem
   */
  getUserAttempts = asyncHandler(async (req: Request, res: Response) => {
    const { problemId } = req.params;
    const userId = req.userId!;

    const attempts = await this.submissionService.getUserAttempts(userId, problemId);

    return sendSuccess(res, attempts);
  });

  /**
   * POST /api/submissions/:problemId/draft
   * Save draft code
   */
  saveDraft = asyncHandler(async (req: Request, res: Response) => {
    const { problemId } = req.params;
    const { code } = req.body;
    const userId = req.userId!;

    const draft = await this.submissionService.saveDraft(userId, problemId, code);

    return sendSuccess(res, draft, 'Draft saved successfully');
  });

  /**
   * GET /api/submissions/:problemId/draft
   * Get draft code
   */
  getDraft = asyncHandler(async (req: Request, res: Response) => {
    const { problemId } = req.params;
    const userId = req.userId!;

    const draft = await this.submissionService.getDraft(userId, problemId);

    return sendSuccess(res, draft);
  });

  /**
   * GET /api/submissions/wrong
   * Get user's wrong submissions list
   */
  getWrongSubmissions = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.submissionService.getWrongSubmissions(userId, page, limit);

    return sendSuccess(res, result);
  });

  /**
   * GET /api/submissions/history
   * Get user's submission history
   */
  getSubmissionHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.submissionService.getSubmissionHistory(userId, page, limit);

    return sendSuccess(res, result);
  });

  /**
   * POST /api/submissions/validate
   * Quick validation - check if code compiles
   */
  validateCode = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;

    const result = await this.submissionService.validateCode(code);

    return sendSuccess(res, result);
  });
}
