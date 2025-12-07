/**
 * @file ai.controller.ts
 * @description HTTP request handlers for AI chat/review endpoints
 * @layer Controller - Request/Response handling only, delegates to Service
 *
 * @endpoints (3 total)
 * 1. GET /api/ai/chat/:problemId/history - Get chat conversation history
 * 2. POST /api/ai/chat/:problemId - Send chat message, get AI response
 * 3. POST /api/ai/review/:problemId - Request code review from AI
 *
 * @patterns
 * - All methods use asyncHandler wrapper
 * - Required auth: userId from req.userId!
 * - Request body passed directly to service (ChatRequest, CodeReviewRequest types)
 *
 * @requestParsing
 * - URL params: problemId (extracted from route)
 * - Body: Direct pass-through (chatRequest, reviewRequest)
 *
 * @duplicateLogic
 * - ✅ No duplication - minimal controller logic
 */

import { Request, Response } from 'express';
import { AIService } from './ai.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/async-handler';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * GET /api/ai/chat/:problemId/history
   * Get chat history for a problem
   */
  getChatHistory = asyncHandler(async (req: Request, res: Response) => {
    const { problemId } = req.params;
    const userId = req.userId!;

    const history = await this.aiService.getChatHistory(userId, problemId);

    return sendSuccess(res, history);
  });

  /**
   * POST /api/ai/chat/:problemId
   * Send chat message and get AI response
   */
  sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
    const { problemId } = req.params;
    const userId = req.userId!;
    const chatRequest = req.body;

    const response = await this.aiService.sendChatMessage(userId, problemId, chatRequest);

    return sendSuccess(res, response);
  });

  /**
   * POST /api/ai/review/:problemId
   * Request code review
   */
  requestCodeReview = asyncHandler(async (req: Request, res: Response) => {
    const { problemId } = req.params;
    const userId = req.userId!;
    const reviewRequest = req.body;

    const review = await this.aiService.requestCodeReview(userId, problemId, reviewRequest);

    return sendSuccess(res, { review });
  });
}
