/**
 * @file useAIChat.ts
 * @description AI chat hook - orchestrates ChatService + chatStore
 *
 * @principles
 * - SRP: ✅ Single responsibility: orchestrate chat state + service
 * - CQS: ✅ Queries (messages) return data, Commands (sendMessage, requestReview) mutate
 * - DIP: ✅ Depends on ChatService and chatStore abstractions
 * - Composition: ✅ Composes Store (state) + Service (logic) + useEffect for auto-load
 *
 * @architecture
 * Hook → ChatService (business logic) + chatStore (state)
 *
 * @functions
 * - useAIChat(problemId: string): AIChatHookReturn - Hook that returns chat state and actions
 *
 * @returns
 * - messages: ChatMessage[] - Chat messages
 * - isLoading: boolean - Loading history
 * - isSending: boolean - Sending message
 * - error: string | null - Error message
 * - sendMessage(content: string, context?: any): Promise<void> - Send message with optimistic update
 * - requestReview(code: string): Promise<void> - Request code review
 * - clearChat(): void - Clear chat messages
 *
 * @note
 * This hook demonstrates Phase 2.2 architecture:
 * - Store: Pure state management (chatStore)
 * - Service: Business logic (ChatService)
 * - Hook: Orchestration layer (this file)
 */

import { useEffect, useRef, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useChatStore } from '../store/chatStore';
import { ChatService } from '../services/ChatService';
import { repositories } from '../../../shared/repositories';
import { SendMessagePayload } from '../../../shared/api/endpoints/ai.api';
import { getErrorMessage } from '../../../shared/utils/error';
import {
  selectChatState,
  selectChatActions,
} from '../store/chatSelectors';

export const useAIChat = (problemId: string) => {
  // Use selectors for optimal re-rendering
  const state = useChatStore(useShallow(selectChatState));
  const actions = useChatStore(useShallow(selectChatActions));
  const initialized = useRef(false);

  // Create ChatService instance (memoized)
  const chatService = useMemo(() => new ChatService(repositories.ai), []);

  // Load history on mount (only once per problemId)
  useEffect(() => {
    if (!problemId || initialized.current) return;

    const loadHistory = async () => {
      actions.setLoading(true);
      actions.clearError();

      try {
        const history = await chatService.loadHistory(problemId);
        actions.setMessages(history);
      } catch (error) {
        actions.setError(getErrorMessage(error, 'Failed to load chat history'));
      } finally {
        actions.setLoading(false);
      }
    };

    loadHistory();
    initialized.current = true;

    // Cleanup when leaving problem
    return () => {
      initialized.current = false;
    };
  }, [problemId, chatService, actions]);

  // Send message with optimistic update
  const sendMessage = async (content: string, context?: SendMessagePayload['context']) => {
    if (!content.trim()) return;

    // Optimistic update: add user message immediately
    const userMessage = chatService.createUserMessage(content);
    actions.addMessage(userMessage);
    actions.setSending(true);
    actions.clearError();

    try {
      const aiResponse = await chatService.sendMessage(problemId, content, context);
      actions.addMessage(aiResponse);
    } catch (error) {
      actions.setError(getErrorMessage(error, 'Failed to send message'));
    } finally {
      actions.setSending(false);
    }
  };

  // Request code review
  const requestReview = async (code: string) => {
    if (!code.trim()) return;

    // Add user's review request message
    const userMessage = chatService.createUserMessage(`[코드 리뷰 요청]\n\`\`\`\n${code}\n\`\`\``);
    actions.addMessage(userMessage);
    actions.setSending(true);
    actions.clearError();

    try {
      const reviewResponse = await chatService.requestReview(problemId, code);
      actions.addMessage(reviewResponse);
    } catch (error) {
      actions.setError(getErrorMessage(error, 'Failed to request code review'));
    } finally {
      actions.setSending(false);
    }
  };

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    isSending: state.isSending,
    error: state.error,
    sendMessage,
    requestReview,
    clearChat: actions.clearChat,
  };
};
