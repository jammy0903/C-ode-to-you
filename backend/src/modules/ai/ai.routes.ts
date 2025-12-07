import { Router } from 'express';
import { AIController } from './ai.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { aiLimiter } from '../../middleware/rate-limit.middleware';
import {
  getChatHistorySchema,
  sendChatMessageSchema,
  codeReviewSchema,
} from './ai.validation';

const router = Router();
const aiController = new AIController();

// All routes require authentication
router.use(authenticate);

// Apply AI-specific rate limiting
router.use(aiLimiter);

/**
 * @route   GET /api/ai/chat/:problemId/history
 * @desc    Get chat history for a problem
 * @access  Private
 */
router.get(
  '/chat/:problemId/history',
  validate(getChatHistorySchema),
  aiController.getChatHistory
);

/**
 * @route   POST /api/ai/chat/:problemId
 * @desc    Send chat message and get AI response
 * @access  Private
 */
router.post(
  '/chat/:problemId',
  validate(sendChatMessageSchema),
  aiController.sendChatMessage
);

/**
 * @route   POST /api/ai/review/:problemId
 * @desc    Request code review
 * @access  Private
 */
router.post(
  '/review/:problemId',
  validate(codeReviewSchema),
  aiController.requestCodeReview
);

export default router;
