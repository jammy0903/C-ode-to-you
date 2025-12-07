/**
 * @file rate-limit.middleware.ts
 * @description Rate limiting middleware for API endpoints
 * @layer Middleware - DDoS protection and abuse prevention
 *
 * @limiters
 * - generalLimiter: Configurable via env (default: flexible)
 * - authLimiter: 5 requests per 15 min (strict)
 * - aiLimiter: 20 requests per 15 min (moderate)
 * - submissionLimiter: 50 requests per 15 min (lenient for coding practice)
 *
 * @duplicateLogic
 * - ✅ Rate limiter config consolidated - uses createLimiter() factory
 */

import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Factory: Create rate limiter with consistent config
 * Eliminates duplicate rate limiter configuration
 */
function createLimiter(max: number, windowMs: number, message: string) {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message,
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/**
 * General rate limiter
 */
export const generalLimiter = createLimiter(
  env.RATE_LIMIT_MAX_REQUESTS,
  env.RATE_LIMIT_WINDOW_MS,
  'Too many requests, please try again later'
);

/**
 * Auth endpoints rate limiter (stricter)
 */
export const authLimiter = createLimiter(
  5, // 5 requests per 15 minutes
  15 * 60 * 1000, // 15 minutes
  'Too many login attempts, please try again later'
);

/**
 * AI endpoints rate limiter
 */
export const aiLimiter = createLimiter(
  20, // 20 requests per 15 minutes
  15 * 60 * 1000, // 15 minutes
  'Too many AI requests, please try again later'
);

/**
 * Submission endpoints rate limiter
 */
export const submissionLimiter = createLimiter(
  50, // 50 submissions per 15 minutes
  15 * 60 * 1000, // 15 minutes
  'Too many submissions, please try again later'
);
