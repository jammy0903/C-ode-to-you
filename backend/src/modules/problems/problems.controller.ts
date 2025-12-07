/**
 * @file problems.controller.ts
 * @description HTTP request handlers for problem-related endpoints
 * @layer Controller - Request/Response handling only, delegates to Service
 *
 * @endpoints (5 total)
 * 1. GET /api/problems - List problems with filters (page, limit, tags, difficulty, status)
 * 2. GET /api/problems/search - Search by title/number (query param: q)
 * 3. GET /api/problems/stats - Problem statistics (requires optional auth)
 * 4. GET /api/problems/:problemId - Problem detail with functions
 * 5. GET /api/problems/:problemId/functions - Recommended C functions for problem
 *
 * @patterns
 * - All methods use asyncHandler wrapper for error handling
 * - All methods use sendSuccess for response formatting
 * - Query param parsing: parseInt with defaults (page=1, limit=20)
 * - Optional authentication: userId from req.userId (can be undefined)
 *
 * @requestParsing
 * - Filter extraction from query params (lines 24-31)
 * - Type coercion: parseInt for page/limit, direct cast for strings
 *
 * @duplicateLogic
 * - ✅ No duplication - clean thin controller
 */

import { Request, Response } from 'express';
import { ProblemsService } from './problems.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/async-handler';

export class ProblemsController {
  private service: ProblemsService;

  constructor() {
    this.service = new ProblemsService();
  }

  /**
   * GET /api/problems
   * Get problem list with pagination and filters
   */
  getProblemList = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      tags: req.query.tags as string | undefined,
      // Baekjoon tier string (e.g. bronze_5, silver_3). Validation is handled by Zod schema.
      difficulty: req.query.difficulty as string | undefined,
      status: req.query.status as 'unsolved' | 'attempted' | 'solved' | undefined,
    };

    const userId = req.userId; // From auth middleware (optional)
    const result = await this.service.getProblemList(filters, userId);

    sendSuccess(res, result);
  });

  /**
   * GET /api/problems/search
   * Search problems
   */
  searchProblems = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const problems = await this.service.searchProblems(query);

    sendSuccess(res, { problems });
  });

  /**
   * GET /api/problems/stats
   * Get problem statistics
   */
  getProblemStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId; // From auth middleware (optional)
    const stats = await this.service.getProblemStats(userId);

    sendSuccess(res, stats);
  });

  /**
   * GET /api/problems/:problemId
   * Get problem detail
   */
  getProblemDetail = asyncHandler(async (req: Request, res: Response) => {
    const { problemId } = req.params;
    const userId = req.userId; // From auth middleware (optional)

    const problem = await this.service.getProblemById(problemId, userId);

    sendSuccess(res, problem);
  });

  /**
   * GET /api/problems/:problemId/functions
   * Get recommended functions for a problem
   */
  getRecommendedFunctions = asyncHandler(async (req: Request, res: Response) => {
    const { problemId } = req.params;
    const result = await this.service.getRecommendedFunctions(problemId);

    sendSuccess(res, result);
  });
}
