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
   */
  sendChatMessage: async (problemId: string, payload: SendMessagePayload): Promise<ChatMessage> => {
    return apiClient.post<ChatMessage>(`/ai/chat/${problemId}`, payload);
  },

  /**
   * Request Code Review
   * POST /api/ai/review/:problemId
   */
  requestCodeReview: async (problemId: string, code: string): Promise<ChatMessage> => {
    return apiClient.post<ChatMessage>(`/ai/review/${problemId}`, { code });
  },
};

