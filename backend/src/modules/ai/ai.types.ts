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
  conversationId: string;
  response: string;
  timestamp: Date;
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
 * Ollama API request
 */
export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  system?: string;
  context?: number[];
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}

/**
 * Ollama API response
 */
export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  eval_duration?: number;
}
