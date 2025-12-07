/**
 * @file error.middleware.ts
 * @description Global error handling middleware for Express
 * @layer Middleware - Centralized error handling and formatting
 *
 * @functions
 * - errorHandler: Global error handler - catches all errors from routes/middleware
 * - handlePrismaError: Prisma-specific error translator (private)
 * - notFoundHandler: 404 handler for undefined routes
 *
 * @errorTypes
 * - AppError: Custom application errors (business logic)
 * - ZodError: Request validation errors
 * - PrismaClientKnownRequestError: Database errors (P2002, P2025, P2003, P2014)
 * - JsonWebTokenError / TokenExpiredError: JWT errors
 *
 * @duplicateLogic
 * - ✅ No duplication - well-structured error handling
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../types/common.types';
import { sendError, sendValidationError } from '../utils/response';
import logger from '../utils/logger';
import { isDevelopment } from '../config/env';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known errors
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendValidationError(res, details, 400);
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(err, res);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'UNAUTHORIZED', 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'UNAUTHORIZED', 'Token expired', 401);
    return;
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = isDevelopment ? err.message : 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  sendError(res, code, message, statusCode);
};

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError, res: Response): void => {
  switch (err.code) {
    case 'P2002': {
      // Unique constraint violation
      const field = (err.meta?.target as string[])?.join(', ') || 'field';
      sendError(res, 'CONFLICT', `${field} already exists`, 409);
      break;
    }

    case 'P2025': {
      // Record not found
      sendError(res, 'NOT_FOUND', 'Record not found', 404);
      break;
    }

    case 'P2003': {
      // Foreign key constraint violation
      sendError(res, 'BAD_REQUEST', 'Invalid reference', 400);
      break;
    }

    case 'P2014': {
      // Invalid relation
      sendError(res, 'BAD_REQUEST', 'Invalid relation', 400);
      break;
    }

    default: {
      logger.error('Unhandled Prisma error:', err);
      sendError(res, 'INTERNAL_ERROR', 'Database error', 500);
    }
  }
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, 'NOT_FOUND', `Cannot ${req.method} ${req.path}`, 404);
};
