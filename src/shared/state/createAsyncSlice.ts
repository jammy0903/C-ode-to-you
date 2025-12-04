/**
 * @file createAsyncSlice.ts
 * @description Helper for creating async actions in Zustand stores
 * 
 * @principles
 * - SRP: ✅ Single responsibility: async action creation helper
 * - CQS: ✅ createAsyncAction returns a Command function (mutates state)
 * - DIP: ✅ Generic, works with any state shape
 * - Composition: ✅ Composable with Zustand stores
 * 
 * @functions
 * - createAsyncAction<T, Args>(options): AsyncActionFunction - Create async action with callbacks
 * 
 * @options
 * - name: string - Action name (for error messages)
 * - action: (...args: Args) => Promise<T> - Async function to execute
 * - onStart?: (state, ...args) => void - Called before action
 * - onSuccess?: (state, result, ...args) => void - Called on success
 * - onError?: (state, error, message, ...args) => void - Called on error
 */

import { getErrorMessage } from '../utils/error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoreState = Record<string, any>;
type SetState<TState> = (updater: (state: TState) => void) => void;
type GetState<TState> = () => TState;

export interface AsyncActionOptions<
  T,
  Args extends unknown[],
  TState extends StoreState = StoreState
> {
  name: string;
  action: (...args: Args) => Promise<T>;
  onStart?: (state: TState, ...args: Args) => void;
  onSuccess?: (state: TState, result: T, ...args: Args) => void;
  onError?: (state: TState, error: Error, message: string, ...args: Args) => void;
}

export function createAsyncAction<
  T,
  Args extends unknown[],
  TState extends StoreState = StoreState
>(options: AsyncActionOptions<T, Args, TState>) {
  return async (set: SetState<TState>, get: GetState<TState>, ...args: Args): Promise<T> => {
    try {
      set((state) => {
        options.onStart?.(state, ...args);
      });

      const result = await options.action(...args);

      set((state) => {
        options.onSuccess?.(state, result, ...args);
      });

      return result;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error('Unknown error occurred');
      const message = getErrorMessage(typedError, `Failed to ${options.name}`);
      set((state) => {
        options.onError?.(state, typedError, message, ...args);
      });
      throw error;
    }
  };
}
