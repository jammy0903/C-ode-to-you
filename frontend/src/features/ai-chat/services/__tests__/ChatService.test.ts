/**
 * @file ChatService.test.ts
 * @description Unit tests for ChatService
 *
 * @test-coverage
 * - ✅ Load history successfully
 * - ✅ Load history failure
 * - ✅ Send message successfully
 * - ✅ Send message with context
 * - ✅ Send message failure
 * - ✅ Request review successfully
 * - ✅ Request review failure
 * - ✅ Create user message
 */

import { ChatService } from '../ChatService';
import { IAIRepository } from '../../../../shared/repositories/interfaces';
import { ChatMessage } from '../../../../shared/types/api.types';

// Mock chat messages
const mockUserMessage: ChatMessage = {
  id: 'msg-1',
  role: 'user',
  content: 'Hello, AI!',
  createdAt: '2024-01-01T10:00:00Z',
};

const mockAiMessage: ChatMessage = {
  id: 'msg-2',
  role: 'assistant',
  content: 'Hello! How can I help you?',
  createdAt: '2024-01-01T10:00:01Z',
};

const mockReviewMessage: ChatMessage = {
  id: 'msg-3',
  role: 'assistant',
  content: 'Code review: Your code looks good!',
  createdAt: '2024-01-01T10:00:02Z',
};

// Create mock repository
const createMockAIRepository = (): jest.Mocked<IAIRepository> => ({
  getChatHistory: jest.fn(),
  sendChatMessage: jest.fn(),
  requestCodeReview: jest.fn(),
});

describe('ChatService', () => {
  let chatService: ChatService;
  let mockAIRepo: jest.Mocked<IAIRepository>;

  beforeEach(() => {
    mockAIRepo = createMockAIRepository();
    chatService = new ChatService(mockAIRepo);
    jest.clearAllMocks();
  });

  describe('loadHistory', () => {
    it('should load chat history successfully', async () => {
      const mockHistory = [mockUserMessage, mockAiMessage];
      mockAIRepo.getChatHistory.mockResolvedValue(mockHistory);

      const result = await chatService.loadHistory('problem-123');

      expect(mockAIRepo.getChatHistory).toHaveBeenCalledWith('problem-123');
      expect(result).toEqual(mockHistory);
    });

    it('should return empty array when no history', async () => {
      mockAIRepo.getChatHistory.mockResolvedValue([]);

      const result = await chatService.loadHistory('problem-123');

      expect(result).toEqual([]);
    });

    it('should throw error on failure', async () => {
      mockAIRepo.getChatHistory.mockRejectedValue(new Error('Network error'));

      await expect(chatService.loadHistory('problem-123')).rejects.toThrow('Network error');
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      mockAIRepo.sendChatMessage.mockResolvedValue(mockAiMessage);

      const result = await chatService.sendMessage('problem-123', 'Hello, AI!');

      expect(mockAIRepo.sendChatMessage).toHaveBeenCalledWith('problem-123', {
        message: 'Hello, AI!',
        context: undefined,
      });
      expect(result).toEqual(mockAiMessage);
    });

    it('should send message with context', async () => {
      const context = { code: 'int main() {}', language: 'c' };
      mockAIRepo.sendChatMessage.mockResolvedValue(mockAiMessage);

      await chatService.sendMessage('problem-123', 'Review this', context);

      expect(mockAIRepo.sendChatMessage).toHaveBeenCalledWith('problem-123', {
        message: 'Review this',
        context,
      });
    });

    it('should throw error on failure', async () => {
      mockAIRepo.sendChatMessage.mockRejectedValue(new Error('AI unavailable'));

      await expect(chatService.sendMessage('problem-123', 'Hello')).rejects.toThrow('AI unavailable');
    });
  });

  describe('requestReview', () => {
    it('should request code review successfully', async () => {
      mockAIRepo.requestCodeReview.mockResolvedValue(mockReviewMessage);

      const result = await chatService.requestReview('problem-123', 'int main() { return 0; }');

      expect(mockAIRepo.requestCodeReview).toHaveBeenCalledWith(
        'problem-123',
        'int main() { return 0; }'
      );
      expect(result).toEqual(mockReviewMessage);
    });

    it('should throw error on failure', async () => {
      mockAIRepo.requestCodeReview.mockRejectedValue(new Error('Review failed'));

      await expect(chatService.requestReview('problem-123', 'code')).rejects.toThrow('Review failed');
    });
  });

  describe('createUserMessage', () => {
    it('should create user message with correct structure', () => {
      const beforeTime = Date.now();
      const message = chatService.createUserMessage('Test message');
      const afterTime = Date.now();

      expect(message.role).toBe('user');
      expect(message.content).toBe('Test message');
      expect(message.id).toMatch(/^temp-\d+-\d+$/);

      // Verify timestamp is within expected range
      const messageTime = new Date(message.createdAt).getTime();
      expect(messageTime).toBeGreaterThanOrEqual(beforeTime);
      expect(messageTime).toBeLessThanOrEqual(afterTime + 1); // Allow 1ms tolerance
    });

    it('should create unique message IDs', () => {
      const message1 = chatService.createUserMessage('Message 1');
      const message2 = chatService.createUserMessage('Message 2');

      expect(message1.id).not.toBe(message2.id);
    });
  });
});
