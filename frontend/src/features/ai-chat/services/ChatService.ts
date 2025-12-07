/**
 * @file ChatService.ts
 * @description AI chat business logic service
 *
 * @principles
 * - SRP: ✅ Single responsibility: AI chat operations
 * - CQS: ✅ Commands (sendMessage, requestReview) perform operations, Queries (loadHistory) return data
 * - DIP: ✅ Depends on IAIRepository interface
 * - Composition: ✅ Encapsulates AI communication logic
 *
 * @responsibilities
 * - Send messages to AI
 * - Request code reviews
 * - Load chat history
 * - Create optimistic user messages
 *
 * @usage
 * ```typescript
 * const chatService = new ChatService(repositories.ai);
 * const history = await chatService.loadHistory('problem-123');
 * const aiResponse = await chatService.sendMessage('problem-123', 'Hello');
 * const review = await chatService.requestReview('problem-123', 'code');
 * ```
 */

import { IAIRepository } from '../../../shared/repositories/interfaces';
import { ChatMessage } from '../../../shared/types/api.types';
import { SendMessagePayload } from '../../../shared/api/endpoints/ai.api';

export interface IChatService {
  loadHistory(problemId: string): Promise<ChatMessage[]>;
  sendMessage(
    problemId: string,
    content: string,
    context?: SendMessagePayload['context']
  ): Promise<ChatMessage>;
  requestReview(problemId: string, code: string): Promise<ChatMessage>;
  createUserMessage(content: string): ChatMessage;
}

export class ChatService implements IChatService {
  private aiRepository: IAIRepository;
  private messageCounter = 0;

  constructor(aiRepository: IAIRepository) {
    this.aiRepository = aiRepository;
  }

  /**
   * Load chat history for a problem
   *
   * @param problemId - Problem identifier
   * @returns Array of chat messages
   */
  async loadHistory(problemId: string): Promise<ChatMessage[]> {
    try {
      return await this.aiRepository.getChatHistory(problemId);
    } catch (error) {
      console.error('[ChatService] Failed to load history:', error);
      throw error;
    }
  }

  /**
   * Send a message to the AI
   *
   * @param problemId - Problem identifier
   * @param content - Message content
   * @param context - Optional context (code, language, etc.)
   * @returns AI response message
   */
  async sendMessage(
    problemId: string,
    content: string,
    context?: SendMessagePayload['context']
  ): Promise<ChatMessage> {
    try {
      return await this.aiRepository.sendChatMessage(problemId, {
        message: content,
        context,
      });
    } catch (error) {
      console.error('[ChatService] Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Request a code review from the AI
   *
   * @param problemId - Problem identifier
   * @param code - Code to review
   * @returns AI review message
   */
  async requestReview(problemId: string, code: string): Promise<ChatMessage> {
    try {
      return await this.aiRepository.requestCodeReview(problemId, code);
    } catch (error) {
      console.error('[ChatService] Failed to request review:', error);
      throw error;
    }
  }

  /**
   * Create an optimistic user message for UI display
   *
   * @param content - Message content
   * @returns User message object
   */
  createUserMessage(content: string): ChatMessage {
    return {
      id: `temp-${Date.now()}-${++this.messageCounter}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
  }
}
