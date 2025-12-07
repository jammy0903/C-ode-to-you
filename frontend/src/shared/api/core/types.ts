/**
 * Core API Types
 * Central type definitions for API client abstraction
 */

import { AxiosError } from 'axios';
import { ApiResponse } from '../../types/api.types';

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

export interface RequestConfig<TData = unknown, TParams extends Record<string, unknown> = Record<string, unknown>> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: TData;
  params?: TParams;
  headers?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/**
 * Type-safe error for API requests
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromAxiosError(error: AxiosError<ApiResponse>): ApiError {
    const statusCode = error.response?.status;
    const apiError = error.response?.data?.error;

    return new ApiError(
      apiError?.message || error.message || 'Unknown API error',
      statusCode,
      apiError?.code,
      apiError?.details
    );
  }
}
