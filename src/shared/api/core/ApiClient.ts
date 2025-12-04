/**
 * @file ApiClient.ts
 * @description Type-safe HTTP client wrapper for Axios
 * 
 * @principles
 * - SRP: ✅ Single responsibility: HTTP request/response handling and unwrapping
 * - CQS: ✅ All methods are Commands (async, return Promises)
 * - DIP: ✅ Depends on AxiosInstance abstraction (can be swapped)
 * - Composition: ✅ Composes AxiosInstance for actual HTTP calls
 * 
 * @functions
 * - request<TResponse>(config): Promise<TResponse> - Core request method (private)
 * - get<TResponse>(url, params?): Promise<TResponse> - GET request
 * - post<TResponse, TData>(url, data?): Promise<TResponse> - POST request
 * - put<TResponse, TData>(url, data?): Promise<TResponse> - PUT request
 * - delete<TResponse>(url): Promise<TResponse> - DELETE request
 * - patch<TResponse, TData>(url, data?): Promise<TResponse> - PATCH request
 * 
 * @features
 * - Automatic response unwrapping (response.data.data -> data)
 * - Consistent error handling (converts to ApiError)
 * - Type safety without null assertions
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '../../types/api.types';
import { RequestConfig, ApiError } from './types';

export class ApiClient {
  constructor(private axiosInstance: AxiosInstance) {}

  /**
   * Core request method with response unwrapping and error handling
   */
  private async request<
    TResponse,
    TData = unknown,
    TParams extends Record<string, unknown> = Record<string, unknown>
  >(config: RequestConfig<TData, TParams>): Promise<TResponse> {
    try {
      const response: AxiosResponse<ApiResponse<TResponse>> = await this.axiosInstance.request(config);

      // Validate response structure
      if (!response.data) {
        throw new ApiError('Invalid API response: missing data', response.status);
      }

      if (!response.data.success) {
        throw new ApiError(
          response.data.error?.message || 'API request failed',
          response.status,
          response.data.error?.code,
          response.data.error?.details
        );
      }

      // Return unwrapped data
      const data = response.data.data;
      if (data === null || data === undefined) {
        throw new ApiError('Invalid API response: data is null or undefined', response.status);
      }

      return data;
    } catch (error) {
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }

      // Convert Axios errors to ApiError
      if (axios.isAxiosError(error)) {
        throw ApiError.fromAxiosError(error);
      }

      // Unknown error
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  /**
   * GET request
   * @example
   * const problem = await apiClient.get<Problem>('/problems/123');
   */
  async get<TResponse, TParams extends Record<string, unknown> = Record<string, unknown>>(
    url: string,
    params?: TParams
  ): Promise<TResponse> {
    return this.request<TResponse>({
      method: 'GET',
      url,
      params,
    });
  }

  /**
   * POST request
   * @example
   * const submission = await apiClient.post<Submission>('/submissions/123/submit', { code, language });
   */
  async post<
    TResponse,
    TData = unknown,
    TParams extends Record<string, unknown> = Record<string, unknown>
  >(url: string, data?: TData, params?: TParams): Promise<TResponse> {
    return this.request<TResponse>({
      method: 'POST',
      url,
      data,
      params,
    });
  }

  /**
   * PUT request
   * @example
   * const settings = await apiClient.put<UserSettings>('/users/me/settings', newSettings);
   */
  async put<
    TResponse,
    TData = unknown,
    TParams extends Record<string, unknown> = Record<string, unknown>
  >(url: string, data?: TData, params?: TParams): Promise<TResponse> {
    return this.request<TResponse>({
      method: 'PUT',
      url,
      data,
      params,
    });
  }

  /**
   * DELETE request
   * @example
   * await apiClient.delete<void>('/github/disconnect');
   */
  async delete<TResponse = void>(url: string): Promise<TResponse> {
    return this.request<TResponse>({
      method: 'DELETE',
      url,
    });
  }

  /**
   * PATCH request
   * @example
   * const updated = await apiClient.patch<User>('/users/me', { name: 'New Name' });
   */
  async patch<
    TResponse,
    TData = unknown,
    TParams extends Record<string, unknown> = Record<string, unknown>
  >(url: string, data?: TData, params?: TParams): Promise<TResponse> {
    return this.request<TResponse>({
      method: 'PATCH',
      url,
      data,
      params,
    });
  }
}
