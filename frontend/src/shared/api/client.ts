/**
 * @file client.ts
 * @description Axios client with interceptors for token management and error handling
 * 
 * @principles
 * - SRP: ✅ Single responsibility: HTTP client configuration and interceptors
 * - CQS: ✅ Interceptors are side effects (not Commands/Queries)
 * - DIP: ✅ Exports both raw client and ApiClient wrapper (abstraction)
 * - Composition: ✅ Composes SecureStore for token persistence
 * 
 * @functions
 * - processQueue(error, token) - Process queued requests after token refresh (internal)
 * 
 * @interceptors
 * - Request: Injects Authorization header from SecureStore
 * - Response: Handles 401 errors, refreshes token, retries requests
 * 
 * @exports
 * - default (client) - Raw Axios instance
 * - apiClient - ApiClient wrapper instance
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { CONFIG, STORAGE_KEYS } from '../constants/config';
import { ApiResponse } from '../types/api.types';
import { getItem, setItem, deleteItem } from '../utils/storage';

// Extend InternalAxiosRequestConfig to include retry flag
interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Token refresh state management
let isRefreshing = false;
type PendingRequest = {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
};
let failedQueue: PendingRequest[] = [];

/**
 * Process all queued requests after token refresh
 */
const processQueue = (error: unknown = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Create Axios Instance
const client = axios.create({
  baseURL: CONFIG.API_URL,
  timeout: CONFIG.TIMEOUT,
  headers: CONFIG.HEADERS.COMMON,
});

// Request Interceptor: Inject Token and ngrok header
client.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (config.headers) {
        // Always ensure ngrok header is set (bypasses browser warning page)
        config.headers['ngrok-skip-browser-warning'] = 'true';
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      // Debug logging
      console.log('[Axios Request]', config.method?.toUpperCase(), config.url);
      console.log('[Axios Headers]', JSON.stringify(config.headers));
    } catch (error) {
      console.error('Error reading token:', error);
    }
    return config;
  },
  (error) => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors (401, etc.)
client.interceptors.response.use(
  (response) => {
    // Debug logging
    console.log('[Axios Response]', response.status, response.config.url);
    // Unpack "data" if the backend returns { success: true, data: ... } structure consistently
    // But Axios returns { data: { success: true, ... }, status: 200 }
    // We return the full response data to be handled by api modules
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    // Debug error details
    console.error('[Axios Error]', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      responseData: error.response?.data,
    });

    const originalRequest = error.config as RetryableAxiosRequestConfig;

    // Handle 401 Unauthorized - Token Refresh Logic
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark this request as retried to prevent infinite loop
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token from secure storage
        const refreshToken = await getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint directly (avoid circular dependency with authApi)
        const response = await axios.post<ApiResponse<{ token: string }>>(
          `${CONFIG.API_URL}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = response.data.data?.token;

        if (!newAccessToken) {
          throw new Error('Failed to refresh token');
        }

        // Update access token in secure storage
        await setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

        // Update authorization header for the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Process all queued requests with the new token
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry the original request
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and reject all queued requests
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear tokens from secure storage
        await deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
        await deleteItem(STORAGE_KEYS.REFRESH_TOKEN);

        console.error('Token refresh failed:', refreshError);

        // Reject with original error
        return Promise.reject(refreshError);
      }
    }

    // Standardize Error Message
    const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown Error';

    // Return a rejected promise with a cleaner error object if needed
    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

// Export raw Axios client for backward compatibility
export default client;

// Export new ApiClient wrapper for refactored code
import { ApiClient } from './core/ApiClient';
export const apiClient = new ApiClient(client);

