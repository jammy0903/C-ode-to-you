/**
 * @file chatStore.ts
 * @description AI chat state management store
 *
 * @principles
 * - SRP: ✅ Manages ONLY chat state (messages, loading, sending, error)
 * - CQS: ✅ Commands (setters) mutate state, Queries (getters) return data
 * - DIP: ✅ No dependencies - pure state management
 * - Composition: ✅ Used by hooks that compose with ChatService
 *
 * @functions
 * - addMessage(message: ChatMessage): void - Add a message to the list (pure state mutation)
 * - setMessages(messages: ChatMessage[]): void - Replace all messages (pure state mutation)
 * - setLoading(isLoading: boolean): void - Update loading state (pure state mutation)
 * - setSending(isSending: boolean): void - Update sending state (pure state mutation)
 * - setError(error: string | null): void - Update error state (pure state mutation)
 * - clearError(): void - Clear error state (pure state mutation)
 * - clearChat(): void - Clear all messages and error (pure state mutation)
 *
 * @state
 * - messages: ChatMessage[] - Chat message history
 * - isLoading: boolean - Loading chat history
 * - isSending: boolean - Sending message in progress
 * - error: string | null - Error message
 *
 * @note
 * All business logic (API calls, message creation) has been moved to ChatService.
 * This store only manages state - Hook layer orchestrates Service + Store.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ChatMessage } from '../../../shared/types/api.types';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

interface ChatActions {
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setLoading: (isLoading: boolean) => void;
  setSending: (isSending: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearChat: () => void;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
};

export const useChatStore = create<ChatState & ChatActions>()(
  immer((set) => ({
    // State
    ...initialState,

    // Actions - Pure state mutations only
    addMessage: (message) => {
      set((state) => {
        state.messages.push(message);
      });
    },

    setMessages: (messages) => {
      set({ messages });
    },

    setLoading: (isLoading) => {
      set({ isLoading });
    },

    setSending: (isSending) => {
      set({ isSending });
    },

    setError: (error) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },

    clearChat: () => {
      set(initialState);
    },
  }))
);
