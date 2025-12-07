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
import { useChatStore } from '../store/chatStore';
import { ChatService } from '../services/ChatService';
import { repositories } from '../../../shared/repositories';
import { SendMessagePayload } from '../../../shared/api/endpoints/ai.api';
import { getErrorMessage } from '../../../shared/utils/error';

export const useAIChat = (problemId: string) => {
  // Direct store access for stability
  const messages = useChatStore((state) => state.messages) ?? [];
  const isLoading = useChatStore((state) => state.isLoading) ?? false;
  const isSending = useChatStore((state) => state.isSending) ?? false;
  const error = useChatStore((state) => state.error) ?? null;

  const addMessage = useChatStore((state) => state.addMessage);
  const setMessages = useChatStore((state) => state.setMessages);
  const setLoading = useChatStore((state) => state.setLoading);
  const setSending = useChatStore((state) => state.setSending);
  const setError = useChatStore((state) => state.setError);
  const clearError = useChatStore((state) => state.clearError);
  const clearChat = useChatStore((state) => state.clearChat);

  const initialized = useRef(false);

  // Create ChatService instance (memoized)
  const chatService = useMemo(() => new ChatService(repositories.ai), []);

  // Load history on mount (only once per problemId)
  useEffect(() => {
    if (!problemId || initialized.current) return;

    const loadHistory = async () => {
      setLoading(true);
      clearError();

      try {
        const history = await chatService.loadHistory(problemId);
        setMessages(history);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load chat history'));
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
    initialized.current = true;

    // Cleanup when leaving problem
    return () => {
      initialized.current = false;
    };
  }, [problemId, chatService, setLoading, clearError, setMessages, setError]);

  // Send message with optimistic update
  const sendMessageFn = async (content: string, context?: SendMessagePayload['context']) => {
    if (!content.trim()) return;

    // Optimistic update: add user message immediately
    const userMessage = chatService.createUserMessage(content);
    addMessage(userMessage);
    setSending(true);
    clearError();

    try {
      const aiResponse = await chatService.sendMessage(problemId, content, context);
      addMessage(aiResponse);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send message'));
    } finally {
      setSending(false);
    }
  };

  // Request code review
  const requestReviewFn = async (code: string) => {
    if (!code.trim()) return;

    // Add user's review request message
    const userMessage = chatService.createUserMessage(`[코드 리뷰 요청]\n\`\`\`\n${code}\n\`\`\``);
    addMessage(userMessage);
    setSending(true);
    clearError();

    try {
      const reviewResponse = await chatService.requestReview(problemId, code);
      addMessage(reviewResponse);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to request code review'));
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage: sendMessageFn,
    requestReview: requestReviewFn,
    clearChat,
  };
};
