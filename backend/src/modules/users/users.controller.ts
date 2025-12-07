/**
 * @file users.controller.ts
 * @description HTTP request handlers for user-related endpoints
 * @layer Controller - Request/Response handling only, delegates to Service
 *
 * @endpoints (4 total)
 * 1. GET /api/users/me/stats - User problem-solving statistics
 * 2. GET /api/users/me/activity - User activity for N days (query: days, default=7)
 * 3. GET /api/users/me/settings - User preferences (editor, AI, GitHub, notifications)
 * 4. PUT /api/users/me/settings - Update user preferences
 *
 * @patterns
 * - All methods use asyncHandler wrapper
 * - Required auth: userId from req.userId!
 * - All endpoints are /me routes (user-specific, no admin routes)
 *
 * @requestParsing
 * - Query params: days (with parseInt and default=7)
 * - Body: settings object for update (partial updates supported)
 *
 * @duplicateLogic
 * - ✅ No duplication - clean user-scoped endpoints
 */

import { Request, Response } from 'express';
import { UserService } from './users.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/async-handler';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * GET /api/users/me/stats
   * Get user statistics
   */
  getUserStatistics = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    const stats = await this.userService.getUserStatistics(userId);

    return sendSuccess(res, stats);
  });

  /**
   * GET /api/users/me/activity
   * Get user activity
   */
  getUserActivity = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const days = parseInt(req.query.days as string) || 7;

    const activity = await this.userService.getUserActivity(userId, days);

    return sendSuccess(res, activity);
  });

  /**
   * GET /api/users/me/settings
   * Get user settings
   */
  getUserSettings = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    const settings = await this.userService.getUserSettings(userId);

    return sendSuccess(res, settings);
  });

  /**
   * PUT /api/users/me/settings
   * Update user settings
   */
  updateUserSettings = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const settings = req.body;

    await this.userService.updateUserSettings(userId, settings);

    return sendSuccess(res, null, 'Settings updated successfully');
  });
}
