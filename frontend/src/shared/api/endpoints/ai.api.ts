import { apiClient } from '../client';
import { ChatMessage } from '../../types/api.types';

export interface SendMessagePayload {
  message: string;
  context?: {
    code?: string;
    language?: string;
    currentLine?: number;
  };
}

interface BackendReviewResponse {
  review: string;
}

/**
 * AI API endpoints
 * Refactored to use ApiClient for consistent response handling
 */
export const aiApi = {
  /**
   * Get Chat History
   * GET /api/ai/chat/:problemId/history
   */
  getChatHistory: async (problemId: string): Promise<ChatMessage[]> => {
    return apiClient.get<ChatMessage[]>(`/ai/chat/${problemId}/history`);
  },

  /**
   * Send Chat Message
   * POST /api/ai/chat/:problemId
   * Backend now returns ChatMessage format directly
   */
  sendChatMessage: async (problemId: string, payload: SendMessagePayload): Promise<ChatMessage> => {
    console.log('[aiApi] sendChatMessage called, problemId:', problemId);
    const response = await apiClient.post<ChatMessage>(`/ai/chat/${problemId}`, payload);
    console.log('[aiApi] Response:', JSON.stringify(response));
    return response;
  },

  /**
   * Request Code Review
   * POST /api/ai/review/:problemId
   */
  requestCodeReview: async (problemId: string, code: string): Promise<ChatMessage> => {
    const response = await apiClient.post<BackendReviewResponse>(`/ai/review/${problemId}`, { code });
    return {
      id: `review-${Date.now()}`,
      role: 'assistant',
      content: response.review,
      createdAt: new Date().toISOString(),
    };
  },
};

