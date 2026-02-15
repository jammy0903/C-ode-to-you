import { HttpClient } from '../utils/http';
import { ChatHistory, ChatRequest, ChatResponse, CodeReviewResponse, ValidateKeyResponse } from '../types';

export class AiModule {
  constructor(private http: HttpClient) {}

  /**
   * Get chat history for a problem
   */
  async getChatHistory(problemId: string): Promise<ChatHistory> {
    return this.http.get<ChatHistory>(`/api/ai/chat/${problemId}/history`);
  }

  /**
   * Send a chat message and get AI response
   */
  async chat(problemId: string, request: ChatRequest): Promise<ChatResponse> {
    return this.http.post<ChatResponse>(`/api/ai/chat/${problemId}`, request);
  }

  /**
   * Request AI code review
   */
  async review(problemId: string, request: { code: string }): Promise<CodeReviewResponse> {
    return this.http.post<CodeReviewResponse>(`/api/ai/review/${problemId}`, request);
  }

  /**
   * Validate an Anthropic API key
   */
  async validateKey(apiKey: string): Promise<ValidateKeyResponse> {
    return this.http.post<ValidateKeyResponse>('/api/ai/validate-key', { apiKey });
  }
}
