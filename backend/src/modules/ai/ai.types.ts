/**
 * AI message role
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Chat message
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: Date;
}

/**
 * Chat request
 */
export interface ChatRequest {
  message: string;
  code?: string;
  conversationId?: string;
}

/**
 * Chat response
 */
export interface ChatResponse {
  id: string;
  role: 'assistant';
  content: string;
  createdAt: string;
}

/**
 * Chat history response
 */
export interface ChatHistoryResponse {
  conversationId: string;
  messages: ChatMessage[];
}

/**
 * Code review request
 */
export interface CodeReviewRequest {
  code: string;
}

/**
 * Code review issue
 */
export interface CodeReviewIssue {
  severity: 'minor' | 'major' | 'critical';
  line?: number;
  message: string;
  suggestion?: string;
}

/**
 * Code review response
 */
export interface CodeReviewResponse {
  summary: string;
  strengths: string[];
  issues: CodeReviewIssue[];
  suggestions: string[];
}

/**
 * Claude API generation options
 */
export interface ClaudeGenerateOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}
