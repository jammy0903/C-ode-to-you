import { z } from 'zod';

/**
 * Get chat history schema
 */
export const getChatHistorySchema = z.object({
  params: z.object({
    problemId: z.string().uuid('Invalid problem ID'),
  }),
});

/**
 * Send chat message schema
 */
export const sendChatMessageSchema = z.object({
  params: z.object({
    problemId: z.string().uuid('Invalid problem ID'),
  }),
  body: z.object({
    message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
    code: z.string().max(10000, 'Code too long').optional(),
    conversationId: z.string().uuid('Invalid conversation ID').optional(),
  }),
});

/**
 * Code review schema
 */
export const codeReviewSchema = z.object({
  params: z.object({
    problemId: z.string().uuid('Invalid problem ID'),
  }),
  body: z.object({
    code: z.string().min(1, 'Code is required').max(10000, 'Code too long'),
  }),
});
