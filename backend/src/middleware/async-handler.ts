/**
 * @file async-handler.ts
 * @description Async error handling wrapper for Express route handlers
 * @layer Middleware - Wraps async handlers to catch Promise rejections
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper for async route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
