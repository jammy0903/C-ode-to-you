/**
 * @file asyncState.ts
 * @description AsyncState interface and factory for consistent async state management
 * 
 * @principles
 * - SRP: ✅ Single responsibility: async state shape definition
 * - CQS: ✅ createAsyncState is a Query (returns state), asyncStateReset is a Command (mutates)
 * - DIP: ✅ Generic interface, no dependencies
 * - Composition: ✅ Composable with any async operation
 * 
 * @functions
 * - createAsyncState<T>(initialData?): AsyncState<T> - Create initial async state (Query)
 * - asyncStateReset<T>(state, data?): void - Reset async state (Command)
 * 
 * @interface
 * - AsyncState<T> - Standard async state shape (data, isLoading, isRefreshing, error)
 */

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

export const createAsyncState = <T>(initialData: T | null = null): AsyncState<T> => ({
  data: initialData,
  isLoading: false,
  isRefreshing: false,
  error: null,
});

export const asyncStateReset = <T>(state: AsyncState<T>, data: T | null = null) => {
  state.data = data;
  state.isLoading = false;
  state.isRefreshing = false;
  state.error = null;
};

