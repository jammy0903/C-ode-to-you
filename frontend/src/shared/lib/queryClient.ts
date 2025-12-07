/**
 * @file queryClient.ts
 * @description TanStack Query client configuration
 *
 * @principles
 * - SRP: ✅ Single responsibility: query client configuration only
 * - DRY: ✅ Centralized query defaults for entire app
 *
 * @exports
 * - queryClient: QueryClient - Pre-configured TanStack Query client instance
 *
 * @configuration
 * - staleTime: 5 minutes - data considered fresh
 * - gcTime: 30 minutes - unused data garbage collected
 * - retry: queries 1, mutations 0
 * - refetchOnWindowFocus: disabled
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 30, // 30분 (구 cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
