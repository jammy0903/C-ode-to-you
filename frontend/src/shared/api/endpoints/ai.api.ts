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

// Backend response types (different from frontend ChatMessage)
interface BackendChatResponse {
  conversationId: string;
  response: string;
  timestamp: string;
}

interface BackendReviewResponse {
  review: string;
}

// Transform backend response to frontend ChatMessage
const toAIChatMessage = (response: BackendChatResponse): ChatMessage => ({
  id: `ai-${response.conversationId}-${Date.now()}`,
  role: 'assistant',
  content: response.response,
  createdAt: response.timestamp,
});

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
    const response = await apiClient.post<BackendChatResponse>(`/ai/chat/${problemId}`, payload);
    return toAIChatMessage(response);
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

