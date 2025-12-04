/**
 * Async State Management Helpers
 *
 * Provides utilities for managing asynchronous operations in Zustand stores
 * with consistent loading/error states and DRY principles.
 */

import { ApiError } from '../../api/core/types';

/**
 * Standard async state shape for any data type T
 */
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Create initial async state
 */
export function createAsyncState<T>(initialData: T | null = null): AsyncState<T> {
  return {
    data: initialData,
    isLoading: false,
    error: null,
  };
}

/**
 * Update function type for Zustand's immer middleware
 */
type SetState<TState> = (updater: (state: TState) => void) => void;

/**
 * Options for async action execution
 */
export interface AsyncActionOptions {
  /**
   * Whether to throw the error after catching it
   * Useful when caller needs to handle the error
   */
  throwOnError?: boolean;

  /**
   * Custom error message prefix
   */
  errorPrefix?: string;

  /**
   * Whether to log errors to console
   */
  logError?: boolean;
}

/**
 * State updater interface for async operations
 * Used to update specific parts of the store during async operations
 */
export interface AsyncStateUpdater<TState, TData> {
  /**
   * Called before the async operation starts
   */
  onStart?: (state: TState) => void;

  /**
   * Called when the async operation succeeds
   * @param data The data returned from the async operation
   */
  onSuccess: (state: TState, data: TData) => void;

  /**
   * Called when the async operation fails
   * @param error The error message
   */
  onError?: (state: TState, error: string) => void;

  /**
   * Called after the operation completes (success or failure)
   */
  onFinally?: (state: TState) => void;
}

/**
 * Creates a wrapper for async actions with automatic loading/error state management
 *
 * @example
 * ```typescript
 * // In a Zustand store
 * fetchProblems: async () => {
 *   await createAsyncAction(
 *     set,
 *     async () => {
 *       const data = await problemsApi.getProblems();
 *       return data;
 *     },
 *     {
 *       onStart: (state) => {
 *         state.isLoading = true;
 *         state.error = null;
 *       },
 *       onSuccess: (state, data) => {
 *         state.problems = data.items;
 *       },
 *       onError: (state, error) => {
 *         state.error = error;
 *       },
 *       onFinally: (state) => {
 *         state.isLoading = false;
 *       }
 *     }
 *   );
 * }
 * ```
 */
export async function createAsyncAction<TState, TData>(
  set: SetState<TState>,
  asyncFn: () => Promise<TData>,
  updater: AsyncStateUpdater<TState, TData>,
  options: AsyncActionOptions = {}
): Promise<void> {
  const { throwOnError = false, errorPrefix = '', logError = false } = options;

  // Start
  if (updater.onStart) {
    set((state) => {
      updater.onStart?.(state);
    });
  }

  try {
    // Execute async operation
    const data = await asyncFn();

    // Success
    set((state) => {
      updater.onSuccess(state, data);
    });
  } catch (error) {
    // Extract error message
    let errorMessage: string;
    if (error instanceof ApiError) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = 'Unknown error occurred';
    }

    // Add prefix if provided
    if (errorPrefix) {
      errorMessage = `${errorPrefix}: ${errorMessage}`;
    }

    // Log if requested
    if (logError) {
      console.error(errorMessage, error);
    }

    // Error callback
    if (updater.onError) {
      set((state) => {
        updater.onError?.(state, errorMessage);
      });
    }

    // Optionally rethrow
    if (throwOnError) {
      throw error;
    }
  } finally {
    // Cleanup
    if (updater.onFinally) {
      set((state) => {
        updater.onFinally?.(state);
      });
    }
  }
}

/**
 * Simplified version for simple data fetching patterns
 * Automatically handles common case of isLoading + error + data
 *
 * @example
 * ```typescript
 * // In a Zustand store with AsyncState
 * interface MyState {
 *   problems: AsyncState<Problem[]>;
 * }
 *
 * fetchProblems: async () => {
 *   await simpleAsyncAction(
 *     set,
 *     () => problemsApi.getProblems(),
 *     (state, data) => {
 *       state.problems.data = data.items;
 *     },
 *     'problems'
 *   );
 * }
 * ```
 */
export async function simpleAsyncAction<TState, TData>(
  set: SetState<TState>,
  asyncFn: () => Promise<TData>,
  onSuccess: (state: TState, data: TData) => void,
  stateKey: keyof TState
): Promise<void> {
  set((state) => {
    (state[stateKey] as unknown as AsyncState<TData>).isLoading = true;
    (state[stateKey] as unknown as AsyncState<TData>).error = null;
  });

  try {
    const data = await asyncFn();
    set((state) => {
      onSuccess(state, data);
      (state[stateKey] as unknown as AsyncState<TData>).isLoading = false;
    });
  } catch (error) {
    let errorMessage: string;
    if (error instanceof ApiError) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = 'Unknown error occurred';
    }

    set((state) => {
      (state[stateKey] as unknown as AsyncState<TData>).error = errorMessage;
      (state[stateKey] as unknown as AsyncState<TData>).isLoading = false;
    });
  }
}
