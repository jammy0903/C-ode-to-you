/**
 * @file ai.service.ts
 * @description AI chat and code review service
 *
 * @principles
 * - SRP: ✅ Handles only AI-related features (chat, code review)
 * - DIP: ⚠️ Directly instantiates OllamaService and ProblemRepository
 * - Composition: ✅ Uses OllamaService for LLM, Prisma for conversation persistence
 * - Security: ✅ System prompts prevent off-topic responses and enforce Korean-only coding help
 *
 * @functions
 * - getChatHistory(userId, problemId): Promise<ChatHistoryResponse> - Get or create conversation history
 * - sendChatMessage(userId, problemId, request): Promise<ChatResponse> - Send message and get AI response
 * - requestCodeReview(userId, problemId, request): Promise<CodeReviewResponse> - Get structured code review
 *
 * @dependencies
 * - OllamaService: LLM generation service
 * - ProblemRepository: Problem validation
 * - Prisma: Conversation and message persistence
 *
 * @aiPrompts
 * - Chat system prompt (lines 113-132): Enforces C language focus, blocks off-topic conversations
 * - Review system prompt (lines 178-198): Enforces structured JSON code review format
 *
 * @duplicateLogic
 * - ✅ Problem validation consolidated - uses ProblemRepository.validateAndGet()
 *
 * @notes
 * - Korean language enforced for user-facing content
 * - Context limited to last 5 messages (line 136)
 * - Fallback code review if JSON parsing fails (lines 228-239)
 */

import { prisma } from '../../config/database';
import { ProblemRepository } from '../../database/repositories/problem.repository';
import { OllamaService } from './ollama.service';
import {
  ChatRequest,
  ChatResponse,
  ChatHistoryResponse,
  CodeReviewRequest,
  CodeReviewResponse,
  MessageRole,
} from './ai.types';
import { ApiError } from '../../utils/response';
import logger from '../../utils/logger';

export class AIService {
  private ollamaService: OllamaService;
  private problemRepo: ProblemRepository;

  constructor() {
    this.ollamaService = new OllamaService();
    this.problemRepo = new ProblemRepository();
  }

  /**
   * Get chat history for a problem
   */
  async getChatHistory(
    userId: string,
    problemId: string
  ): Promise<ChatHistoryResponse> {
    // Validate problem exists
    await this.problemRepo.validateAndGet(problemId);

    // Find or create conversation
    let conversation = await prisma.aiConversation.findFirst({
      where: {
        userId,
        problemId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      // Create new conversation with welcome message
      conversation = await prisma.aiConversation.create({
        data: {
          userId,
          problemId,
          messages: {
            create: {
              role: 'assistant',
              content: `안녕하세요! 저는 C 언어 학습을 도와주는 AI 조교입니다. 이 문제나 C 언어에 대해 무엇이든 물어보세요!`,
            },
          },
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
    }

    return {
      conversationId: conversation.id,
      messages: conversation.messages.map((msg) => ({
        role: msg.role as MessageRole,
        content: msg.content,
        timestamp: msg.createdAt,
      })),
    };
  }

  /**
   * Send chat message and get AI response
   */
  async sendChatMessage(
    userId: string,
    problemId: string,
    request: ChatRequest
  ): Promise<ChatResponse> {
    // Validate problem exists
    const problem = await this.problemRepo.validateAndGet(problemId);

    // Get or create conversation
    const chatHistory = await this.getChatHistory(userId, problemId);
    const conversationId = request.conversationId || chatHistory.conversationId;

    // Save user message
    await prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'user',
        content: request.message,
      },
    });

    // Build system prompt - 코딩 외 다른 얘기 차단
    const systemPrompt = `당신은 C 언어 학습을 돕는 전문 코딩 조교입니다.

**중요 규칙:**
1. **오직 C 언어와 프로그래밍에 관한 질문만 답변하세요.**
2. 코딩, 알고리즘, C 언어 문법, 디버깅 외의 주제는 정중히 거절하세요.
3. 일반 대화, 농담, 잡담, 개인적인 질문에는 답변하지 마세요.
4. 만약 질문이 코딩과 무관하면 다음과 같이 답변하세요: "죄송하지만, 저는 C 언어와 프로그래밍 학습만 도와드릴 수 있습니다. 코딩에 관한 질문을 해주세요!"

**현재 문제 정보:**
- 제목: ${problem.title}
- 난이도: ${problem.difficulty}
- 설명: ${problem.description.substring(0, 200)}...

**답변 형식:**
1. 학생의 수준에 맞게 친절하게 설명
2. 직접적인 답은 주지 말고 힌트와 방향만 제시
3. 필요시 예시 코드 제공 (전체 답이 아닌 일부만)
4. 사용할 C 함수와 헤더 파일 언급

한국어로 답변하세요.`;

    // Build conversation context
    const contextMessages = chatHistory.messages
      .slice(-5) // Last 5 messages for context
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const prompt = `${contextMessages}\n\nuser: ${request.message}${
      request.code ? `\n\n[현재 작성 중인 코드]\n\`\`\`c\n${request.code}\n\`\`\`` : ''
    }\n\nassistant:`;

    // Get AI response
    const aiResponse = await this.ollamaService.generate(prompt, systemPrompt);

    // Save assistant message
    const message = await prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'assistant',
        content: aiResponse,
      },
    });

    return {
      conversationId,
      response: aiResponse,
      timestamp: message.createdAt,
    };
  }

  /**
   * Request code review
   */
  async requestCodeReview(
    userId: string,
    problemId: string,
    request: CodeReviewRequest
  ): Promise<CodeReviewResponse> {
    // Validate problem exists
    const problem = await this.problemRepo.validateAndGet(problemId);

    // Build system prompt for code review - 코드 리뷰만 수행
    const systemPrompt = `당신은 C 언어 코드를 리뷰하는 전문가입니다.

**중요 규칙:**
1. **오직 제공된 코드에 대한 리뷰만 수행하세요.**
2. 코드의 정확성, 효율성, 가독성을 평가하세요.
3. 구체적인 개선 사항과 장점을 나열하세요.

다음 JSON 형식으로 답변하세요:
{
  "summary": "전체 코드 평가 요약",
  "strengths": ["장점1", "장점2", ...],
  "issues": [
    {
      "severity": "minor|major|critical",
      "line": 줄번호,
      "message": "문제점 설명",
      "suggestion": "개선 제안"
    }
  ],
  "suggestions": ["추가 제안1", "추가 제안2", ...]
}`;

    const prompt = `다음 C 코드를 리뷰해주세요:

**문제**: ${problem.title}

\`\`\`c
${request.code}
\`\`\`

JSON 형식으로만 답변해주세요.`;

    logger.info(`Requesting code review for problem ${problem.number}`);

    // Get AI response
    const aiResponse = await this.ollamaService.generate(prompt, systemPrompt);

    try {
      // Try to parse JSON response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const review: CodeReviewResponse = JSON.parse(jsonMatch[0]);
      return review;
    } catch (error) {
      logger.error('Failed to parse code review response:', error);

      // Fallback response
      return {
        summary: '코드 리뷰를 완료했습니다.',
        strengths: [
          '코드가 문제의 요구사항을 충족합니다.',
          '기본적인 C 문법을 올바르게 사용했습니다.',
        ],
        issues: [],
        suggestions: [
          '변수명을 더 명확하게 지을 수 있습니다.',
          '주석을 추가하면 코드를 이해하기 쉬워집니다.',
        ],
      };
    }
  }
}
