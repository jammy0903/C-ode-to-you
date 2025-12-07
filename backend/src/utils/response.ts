/**
 * @file response.ts
 * @description Standardized API response helpers
 * @layer Utility - Consistent response formatting across all endpoints
 *
 * @functions
 * - sendSuccess: Standard success response with optional message
 * - sendError: Standard error response with code and message
 * - sendValidationError: Structured validation error with field details
 * - errors: Pre-configured common error responses (unauthorized, forbidden, notFound, etc.)
 *
 * @responseFormat
 * Success: { success: true, data: T, message?: string }
 * Error: { success: false, error: { code: string, message: string, details?: [] } }
 *
 * @duplicateLogic
 * - ✅ No duplication - reusable helpers with consistent structure
 */

import { Response } from 'express';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: ValidationErrorDetail[];
  };
  message?: string;
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400
): Response => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response with structured field details
 */
export const sendValidationError = (
  res: Response,
  details: ValidationErrorDetail[],
  statusCode: number = 400
): Response => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details,
    },
  };

  return res.status(statusCode).json(response);
};

/**
 * Common error responses
 */
export const errors = {
  unauthorized: (res: Response, message = 'Unauthorized') =>
    sendError(res, 'UNAUTHORIZED', message, 401),

  forbidden: (res: Response, message = 'Forbidden') =>
    sendError(res, 'FORBIDDEN', message, 403),

  notFound: (res: Response, message = 'Resource not found') =>
    sendError(res, 'NOT_FOUND', message, 404),

  validation: (res: Response, message = 'Validation error') =>
    sendError(res, 'VALIDATION_ERROR', message, 400),

  conflict: (res: Response, message = 'Resource already exists') =>
    sendError(res, 'CONFLICT', message, 409),

  internal: (res: Response, message = 'Internal server error') =>
    sendError(res, 'INTERNAL_ERROR', message, 500),

  badRequest: (res: Response, message = 'Bad request') =>
    sendError(res, 'BAD_REQUEST', message, 400),

  tooManyRequests: (res: Response, message = 'Too many requests') =>
    sendError(res, 'TOO_MANY_REQUESTS', message, 429),
};
