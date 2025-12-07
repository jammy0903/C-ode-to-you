/**
 * @file useAIChat.ts
 * @description AI chat hook using TanStack Query
 *
 * @principles
 * - SRP: ✅ Single responsibility: orchestrate chat state and actions
 * - CQS: ✅ Queries (history) separated from Commands (sendMessage mutation)
 * - DIP: ✅ Depends on ChatService interface
 *
 * @architecture
 * Hook → TanStack Query (server state) + ChatService (business logic)
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService } from '../services/ChatService';
import { repositories } from '../../../shared/repositories';
import { ChatMessage } from '../../../shared/types/api.types';
import { SendMessagePayload } from '../../../shared/api/endpoints/ai.api';
import { getErrorMessage } from '../../../shared/utils/error';

// Query keys
export const chatKeys = {
  all: ['chat'] as const,
  history: (problemId: string) => [...chatKeys.all, 'history', problemId] as const,
};

export const useAIChat = (problemId: string) => {
  const queryClient = useQueryClient();

  // Local state for optimistic messages (before server confirms)
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  // Create ChatService instance (memoized)
  const chatService = useMemo(() => new ChatService(repositories.ai), []);

  // Load chat history
  const historyQuery = useQuery({
    queryKey: chatKeys.history(problemId),
    queryFn: () => chatService.loadHistory(problemId),
    enabled: !!problemId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialData: [],
  });

  // Combine server messages with local optimistic messages
  const messages = useMemo(() => {
    const serverMessages = historyQuery.data ?? [];
    return [...serverMessages, ...localMessages];
  }, [historyQuery.data, localMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, context }: { content: string; context?: SendMessagePayload['context'] }) => {
      return chatService.sendMessage(problemId, content, context);
    },
    onMutate: async ({ content }) => {
      // Optimistic update: add user message immediately
      const userMessage = chatService.createUserMessage(content);
      setLocalMessages((prev) => [...prev, userMessage]);
      return { userMessage };
    },
    onSuccess: (aiResponse, _, context) => {
      // Move optimistic message to server cache and add AI response
      setLocalMessages([]);
      queryClient.setQueryData<ChatMessage[]>(
        chatKeys.history(problemId),
        (old = []) => [...old, context?.userMessage!, aiResponse]
      );
    },
    onError: (error, _, context) => {
      // Remove failed optimistic message
      if (context?.userMessage) {
        setLocalMessages((prev) =>
          prev.filter((msg) => msg.id !== context.userMessage.id)
        );
      }
      console.error('[useAIChat] Send message failed:', error);
    },
  });

  // Request code review mutation
  const requestReviewMutation = useMutation({
    mutationFn: async (code: string) => {
      return chatService.requestReview(problemId, code);
    },
    onMutate: async (code) => {
      // Optimistic update: add review request message
      const userMessage = chatService.createUserMessage(`[코드 리뷰 요청]\n\`\`\`\n${code}\n\`\`\``);
      setLocalMessages((prev) => [...prev, userMessage]);
      return { userMessage };
    },
    onSuccess: (reviewResponse, _, context) => {
      // Move to server cache
      setLocalMessages([]);
      queryClient.setQueryData<ChatMessage[]>(
        chatKeys.history(problemId),
        (old = []) => [...old, context?.userMessage!, reviewResponse]
      );
    },
    onError: (error, _, context) => {
      if (context?.userMessage) {
        setLocalMessages((prev) =>
          prev.filter((msg) => msg.id !== context.userMessage.id)
        );
      }
      console.error('[useAIChat] Request review failed:', error);
    },
  });

  // Wrapper functions
  const sendMessage = useCallback(
    async (content: string, context?: SendMessagePayload['context']) => {
      if (!content.trim()) return;
      await sendMessageMutation.mutateAsync({ content, context });
    },
    [sendMessageMutation]
  );

  const requestReview = useCallback(
    async (code: string) => {
      if (!code.trim()) return;
      await requestReviewMutation.mutateAsync(code);
    },
    [requestReviewMutation]
  );

  const clearChat = useCallback(() => {
    setLocalMessages([]);
    queryClient.setQueryData(chatKeys.history(problemId), []);
  }, [queryClient, problemId]);

  // Combined error
  const error = historyQuery.error
    ? getErrorMessage(historyQuery.error, 'Failed to load chat history')
    : sendMessageMutation.error
    ? getErrorMessage(sendMessageMutation.error, 'Failed to send message')
    : requestReviewMutation.error
    ? getErrorMessage(requestReviewMutation.error, 'Failed to request review')
    : null;

  return {
    messages,
    isLoading: historyQuery.isLoading,
    isSending: sendMessageMutation.isPending || requestReviewMutation.isPending,
    error,
    sendMessage,
    requestReview,
    clearChat,
  };
};
