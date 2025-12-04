/**
 * Validation Error Detail
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Common API Response Wrapper
 * Backend `docs/api-spec.md`의 Common Response Format 준수
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: ValidationErrorDetail[];
  };
}

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Paginated Response Data Wrapper
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * User Type
 */
export interface User {
  id: string;
  email: string;
  name: string;
  provider: 'kakao' | 'google';
  createdAt: string;
}

/**
 * Auth Response
 */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

/**
 * Problem Type
 */
export interface Problem {
  id: string;
  number: number;
  title: string;
  difficulty: string; // e.g., 'silver_5'
  tags: string[];
  acceptedCount: number;
  submissionCount: number;
  userStatus?: 'solved' | 'attempted' | 'unsolved';
  userAttempts?: number;
  lastAttemptAt?: string;
  // Detail fields (optional in list view)
  description?: string;
  inputFormat?: string;
  outputFormat?: string;
  timeLimit?: number;
  memoryLimit?: number;
  examples?: Array<{ input: string; output: string }>;
}

/**
 * Submission Type
 */
export interface Submission {
  id: string;
  problemId: string;
  userId: string;
  code: string;
  language: string;
  status: 'pending' | 'judging' | 'accepted' | 'wrong_answer' | 'compile_error' | 'runtime_error' | 'time_limit' | 'memory_limit';
  executionTime?: number;
  memoryUsage?: number;
  createdAt: string;
  verdict?: string;
}

/**
 * AI Chat Message
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

/**
 * User Statistics
 */
export interface UserStats {
  solvedCount: number;
  submitCount: number;
  rank: number;
  tier: string; // e.g. 'gold_1'
  streak: number;
  exp: number;
}

/**
 * User Activity
 */
export interface UserActivity {
  date: string;
  count: number;
}

/**
 * User Settings
 */
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  codeFontSize: number;
  language: string;
  notifications: boolean;
}

/**
 * GitHub Info (Placeholder)
 */
export interface GitHubInfo {
  isConnected: boolean;
  username?: string;
  lastSyncedAt?: string;
}

