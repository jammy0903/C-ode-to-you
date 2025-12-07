/**
 * @file validation.middleware.ts
 * @description Zod-based request validation middleware
 * @layer Middleware - Schema validation for request body/query/params
 *
 * @functions
 * - validate: Validate body + query + params combined
 * - validateBody: Validate only request body
 * - validateQuery: Validate only query parameters
 * - validateParams: Validate only URL parameters
 *
 * @duplicateLogic
 * - ✅ ZodError handling consolidated - uses handleZodError() helper
 */

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendValidationError } from '../utils/response';

/**
 * Helper: Handle ZodError and send validation error response
 * Eliminates duplicate error handling logic
 */
function handleZodError(error: unknown, res: Response, next: NextFunction): boolean {
  if (error instanceof ZodError) {
    const details = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    sendValidationError(res, details, 400);
    return true; // Error handled
  }
  return false; // Error not handled
}

/**
 * Validate request data against Zod schema
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (handleZodError(error, res, next)) return;
      next(error);
    }
  };
};

/**
 * Validate only body
 */
export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (handleZodError(error, res, next)) return;
      next(error);
    }
  };
};

/**
 * Validate only query params
 */
export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (handleZodError(error, res, next)) return;
      next(error);
    }
  };
};

/**
 * Validate only params
 */
export const validateParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (handleZodError(error, res, next)) return;
      next(error);
    }
  };
};
