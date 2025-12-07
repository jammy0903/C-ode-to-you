import { ApiResponse, ValidationErrorDetail } from '../types/api.types';

type AxiosResponseLike = {
  response?: {
    data?: ApiResponse;
  };
};

const hasResponseData = (value: unknown): value is AxiosResponseLike => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { response } = value as AxiosResponseLike;
  return typeof response === 'object' && response !== null;
};

const getApiErrorData = (error: unknown): ApiResponse | undefined => {
  if (!hasResponseData(error)) {
    return undefined;
  }
  return error.response?.data;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: unknown): boolean => {
  const apiData = getApiErrorData(error);
  return apiData?.error?.code === 'VALIDATION_ERROR';
};

/**
 * Extract validation error details from API error
 */
export const getValidationErrors = (error: unknown): ValidationErrorDetail[] => {
  const apiData = getApiErrorData(error);
  return apiData?.error?.details || [];
};

/**
 * Get validation error for a specific field
 */
export const getFieldError = (errors: ValidationErrorDetail[], field: string): string | null => {
  const fieldError = errors.find((err) => err.field === field || err.field.endsWith(`.${field}`));
  return fieldError?.message || null;
};

/**
 * Format validation errors into a single user-friendly message
 */
export const formatValidationErrors = (errors: ValidationErrorDetail[]): string => {
  if (errors.length === 0) {
    return 'Validation failed';
  }

  if (errors.length === 1) {
    return errors[0].message;
  }

  return errors.map((err) => `${err.field}: ${err.message}`).join('\n');
};

/**
 * Get error message from API error
 * Handles both validation errors and general errors
 */
export const getErrorMessage = (error: unknown, defaultMessage: string = 'An error occurred'): string => {
  // If it's a validation error with details, format them
  if (isValidationError(error)) {
    const details = getValidationErrors(error);
    if (details.length > 0) {
      return formatValidationErrors(details);
    }
  }

  // Otherwise, try to extract the error message
  const apiData = getApiErrorData(error);
  return (
    apiData?.error?.message ||
    apiData?.message ||
    (error instanceof Error ? error.message : undefined) ||
    defaultMessage
  );
};

/**
 * Map field name from backend format (e.g., "body.email") to frontend format (e.g., "email")
 */
export const normalizeFieldName = (field: string): string => {
  const parts = field.split('.');
  return parts[parts.length - 1];
};
