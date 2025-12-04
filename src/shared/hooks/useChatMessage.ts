/**
 * useChatMessage Hook
 *
 * Orchestrates the complex chat message workflow:
 * 1. Validate message content
 * 2. Optimistic update (add user message immediately)
 * 3. Send to server via ChatService
 * 4. Add AI response on success
 * 5. Rollback on failure
 *
 * Design Principles:
 * - Single Responsibility: Only handles chat message workflow
 * - Composition: Uses ValidationService + ChatService + Store
 * - Optimistic UI: Immediate feedback to user
 * - Error Recovery: Rollback on failure
 *
 * Architecture (Phase 2.2):
 * Hook → ChatService (business logic) + chatStore (state)
 */

import { useMemo } from 'react';
import { useChatStore } from '../../features/ai-chat/store/chatStore';
import { ChatService } from '../../features/ai-chat/services/ChatService';
import { ValidationService } from '../services';
import { ChatMessage } from '../types/api.types';
import { SendMessagePayload } from '../api/endpoints/ai.api';
import { repositories } from '../repositories';
import { getErrorMessage } from '../utils/error';

export interface SendMessageOptions {
  onSuccess?: (aiMessage: ChatMessage) => void;
  onError?: (error: Error) => void;
}

export function useChatMessage() {
  const store = useChatStore();

  // Create ChatService instance (memoized)
  const chatService = useMemo(() => new ChatService(repositories.ai), []);

  /**
   * Send a chat message with validation and optimistic updates
   */
  const sendMessage = async (
    problemId: string,
    content: string,
    context?: SendMessagePayload['context'],
    options: SendMessageOptions = {}
  ): Promise<void> => {
    const { onSuccess, onError } = options;

    // Step 1: Validate message
    const validation = ValidationService.validateChatMessage(content);
    if (!validation.valid) {
      const errorMessage = ValidationService.formatErrors(validation.errors);
      const error = new Error(errorMessage);
      onError?.(error);
      store.setError(errorMessage);
      throw error;
    }

    // Step 2: Store previous messages for rollback
    const previousMessages = [...store.messages];

    // Step 3: Optimistic update - add user message immediately
    const optimisticUserMessage = chatService.createUserMessage(content);
    store.addMessage(optimisticUserMessage);
    store.setSending(true);

    try {
      // Step 4: Send to server and get AI response
      const aiMessage = await chatService.sendMessage(problemId, content, context);

      // Step 5: Add AI response
      store.addMessage(aiMessage);
      store.setSending(false);

      // Success callback
      onSuccess?.(aiMessage);
    } catch (error) {
      // Step 6: Rollback on failure
      store.setMessages(previousMessages);
      store.setSending(false);
      store.setError(getErrorMessage(error, 'Failed to send message'));

      // Error callback
      if (error instanceof Error) {
        onError?.(error);
      }
      throw error;
    }
  };

  /**
   * Request code review with validation
   */
  const requestReview = async (
    problemId: string,
    code: string,
    options: SendMessageOptions = {}
  ): Promise<void> => {
    const { onSuccess, onError } = options;

    try {
      // Validate code
      const validation = ValidationService.validateDraft(code);
      if (!validation.valid) {
        const errorMessage = ValidationService.formatErrors(validation.errors);
        const error = new Error(errorMessage);
        onError?.(error);
        store.setError(errorMessage);
        throw error;
      }

      // Optimistic update
      const userMessage = chatService.createUserMessage(`[코드 리뷰 요청]\n\`\`\`\n${code}\n\`\`\``);
      store.addMessage(userMessage);
      store.setSending(true);

      // Request review via service
      const reviewMessage = await chatService.requestReview(problemId, code);
      store.addMessage(reviewMessage);
      store.setSending(false);

      onSuccess?.(reviewMessage);
    } catch (error) {
      store.setSending(false);
      store.setError(getErrorMessage(error, 'Failed to request review'));

      if (error instanceof Error) {
        onError?.(error);
      }
      throw error;
    }
  };

  /**
   * Load chat history for a problem
   */
  const loadHistory = async (problemId: string): Promise<void> => {
    store.setLoading(true);
    store.clearError();

    try {
      const history = await chatService.loadHistory(problemId);
      store.setMessages(history);
    } catch (error) {
      store.setError(getErrorMessage(error, 'Failed to load chat history'));
    } finally {
      store.setLoading(false);
    }
  };

  return {
    // State
    messages: store.messages,
    isLoading: store.isLoading,
    isSending: store.isSending,
    error: store.error,

    // Actions with orchestration
    sendMessage,
    requestReview,
    loadHistory,

    // Simple actions
    clearChat: store.clearChat,
    clearError: store.clearError,
  };
}
