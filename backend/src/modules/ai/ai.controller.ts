import { Request, Response } from 'express';
import { AIService } from './ai.service';
import { sendSuccess, sendError } from '../../utils/response';
import { asyncHandler } from '../../middleware/async-handler';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * GET /api/ai/chat/:problemId/history
   */
  getChatHistory = asyncHandler(async (req: Request, res: Response) => {
    const problemId = req.params.problemId as string;
    const userId = req.userId!;

    const history = await this.aiService.getChatHistory(userId, problemId);

    return sendSuccess(res, history);
  });

  /**
   * POST /api/ai/chat/:problemId
   */
  sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
    const problemId = req.params.problemId as string;
    const userId = req.userId!;
    const chatRequest = req.body;

    const response = await this.aiService.sendChatMessage(userId, problemId, chatRequest);

    return sendSuccess(res, response);
  });

  /**
   * POST /api/ai/review/:problemId
   */
  requestCodeReview = asyncHandler(async (req: Request, res: Response) => {
    const problemId = req.params.problemId as string;
    const userId = req.userId!;
    const reviewRequest = req.body;

    const review = await this.aiService.requestCodeReview(userId, problemId, reviewRequest);

    return sendSuccess(res, { review });
  });

  /**
   * POST /api/ai/validate-key
   * Validate an Anthropic API key
   */
  validateApiKey = asyncHandler(async (req: Request, res: Response) => {
    const { apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string') {
      return sendError(res, 'VALIDATION_ERROR', 'API key is required', 400);
    }

    const isValid = await this.aiService.validateApiKey(apiKey);

    return sendSuccess(res, { valid: isValid });
  });
}
