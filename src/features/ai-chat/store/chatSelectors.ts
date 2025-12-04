/**
 * @file chatSelectors.ts
 * @description Memoized selectors for chatStore
 *
 * @principles
 * - Performance: ✅ Selectors prevent unnecessary re-renders
 * - SRP: ✅ Each selector has a single purpose
 * - Reusability: ✅ Selectors can be shared across components/hooks
 */

import { useChatStore } from './chatStore';

type ChatState = ReturnType<typeof useChatStore.getState>;

// ==================== State Selectors ====================

/** Select chat messages */
export const selectMessages = (state: ChatState) => state.messages;

/** Select loading state (loading history) */
export const selectIsLoading = (state: ChatState) => state.isLoading;

/** Select sending state */
export const selectIsSending = (state: ChatState) => state.isSending;

/** Select error state */
export const selectError = (state: ChatState) => state.error;

/** Combined chat state for components */
export const selectChatState = (state: ChatState) => ({
  messages: state.messages,
  isLoading: state.isLoading,
  isSending: state.isSending,
  error: state.error,
});

// ==================== Derived Selectors ====================

/** Select message count */
export const selectMessageCount = (state: ChatState) => state.messages.length;

/** Select last message */
export const selectLastMessage = (state: ChatState) =>
  state.messages.length > 0 ? state.messages[state.messages.length - 1] : null;

/** Check if chat has messages */
export const selectHasMessages = (state: ChatState) => state.messages.length > 0;

// ==================== Action Selectors ====================

/** Select store actions (stable references) */
export const selectChatActions = (state: ChatState) => ({
  addMessage: state.addMessage,
  setMessages: state.setMessages,
  setLoading: state.setLoading,
  setSending: state.setSending,
  setError: state.setError,
  clearError: state.clearError,
  clearChat: state.clearChat,
});
