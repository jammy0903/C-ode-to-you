/**
 * @file github.controller.ts
 * @description HTTP request handlers for GitHub integration endpoints
 * @layer Controller - Request/Response handling only, delegates to Service
 *
 * @endpoints (5 total)
 * 1. POST /api/github/connect - Connect GitHub account (OAuth code exchange)
 * 2. GET /api/github/status - Get GitHub connection status
 * 3. DELETE /api/github/disconnect - Disconnect GitHub account
 * 4. POST /api/github/commit - Create commit with submission code
 * 5. POST /api/github/sync - Sync submission history to GitHub
 *
 * @patterns
 * - ⚠️ DIFFERENT PATTERN: Uses try-catch instead of asyncHandler wrapper
 * - Uses successResponse() instead of sendSuccess()
 * - Uses AuthRequest type (has req.user instead of req.userId)
 * - Manual error handling with next(error)
 *
 * @requestParsing
 * - Body params: code, redirectUri, submissionId
 * - Query params: startDate, endDate (with Date() conversion)
 * - User from: req.user!.id (not req.userId)
 *
 * @notes
 * - Inconsistent with other controllers (should use asyncHandler + sendSuccess)
 * - TODO: Refactor to match other controller patterns for consistency
 *
 * @duplicateLogic
 * - ⚠️ Try-catch pattern repeated 5 times - could use asyncHandler like others
 */

import { Request, Response, NextFunction } from 'express';
import { GitHubService } from './github.service';
import { AuthRequest } from '../../types/express';
import { successResponse } from '../../utils/response';

export class GitHubController {
  private githubService: GitHubService;

  constructor() {
    this.githubService = new GitHubService();
  }

  /**
   * Connect GitHub account
   * POST /api/github/connect
   */
  connectGitHub = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { code, redirectUri } = req.body;
      const userId = req.user!.id;

      const result = await this.githubService.connectGitHub(
        userId,
        code,
        redirectUri
      );

      res.json(successResponse(result, 'GitHub connected successfully'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get GitHub connection status
   * GET /api/github/status
   */
  getStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const status = await this.githubService.getStatus(userId);

      res.json(successResponse(status));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Disconnect GitHub account
   * DELETE /api/github/disconnect
   */
  disconnectGitHub = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      await this.githubService.disconnectGitHub(userId);

      res.json(successResponse(null, 'GitHub disconnected successfully'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create commit with solution
   * POST /api/github/commit
   */
  createCommit = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { submissionId } = req.body;
      const userId = req.user!.id;

      const result = await this.githubService.createCommit(
        userId,
        submissionId
      );

      res.json(successResponse(result, 'Code committed to GitHub'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Sync submission history to GitHub
   * POST /api/github/sync
   */
  syncHistory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.user!.id;

      const result = await this.githubService.syncHistory(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(successResponse(result, 'History synced to GitHub'));
    } catch (error) {
      next(error);
    }
  };
}
