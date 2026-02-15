// ============================================
// Client Options
// ============================================

export interface CodToYouClientOptions {
  baseUrl: string;
  token?: string;
}

// ============================================
// Common
// ============================================

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ============================================
// Auth
// ============================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// ============================================
// Problems
// ============================================

export interface Problem {
  id: string;
  number: number;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  difficulty: string;
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  examples: Array<{ input: string; output: string }>;
  acceptedCount: number;
  submissionCount: number;
  solvedacLevel?: number;
  baekjoonUrl?: string;
}

export interface ProblemListParams {
  page?: number;
  limit?: number;
  difficulty?: string;
  tags?: string;
  status?: string;
}

export interface ProblemFunction {
  id: string;
  category: string;
  functionName: string;
  headerFile?: string;
  description: string;
  example?: string;
}

// ============================================
// Submissions
// ============================================

export interface Submission {
  id: string;
  problemId: string;
  code: string;
  language: string;
  verdict: string;
  executionTime?: number;
  memoryUsage?: number;
  testResults: unknown[];
  submittedAt: string;
  judgedAt?: string;
}

export interface SubmitCodeRequest {
  code: string;
  language?: string;
}

// ============================================
// AI
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatHistory {
  conversationId: string;
  messages: ChatMessage[];
}

export interface ChatRequest {
  message: string;
  code?: string;
  conversationId?: string;
}

export interface ChatResponse {
  id: string;
  role: 'assistant';
  content: string;
  createdAt: string;
}

export interface CodeReviewIssue {
  severity: 'minor' | 'major' | 'critical';
  line?: number;
  message: string;
  suggestion?: string;
}

export interface CodeReviewResponse {
  review: {
    summary: string;
    strengths: string[];
    issues: CodeReviewIssue[];
    suggestions: string[];
  };
}

export interface ValidateKeyResponse {
  valid: boolean;
}

// ============================================
// Users
// ============================================

export interface UserStatistics {
  totalSolved: number;
  totalAttempts: number;
  successRate: number;
  byDifficulty: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  recentActivity: Array<{
    date: string;
    solved: number;
    attempted: number;
  }>;
}

export interface UserActivity {
  activity: Array<{
    date: string;
    submissions: number;
    solved: number;
    problems: number[];
  }>;
}

export interface UserSettings {
  editor: {
    fontSize: number;
    theme: 'light' | 'dark';
    tabSize: number;
  };
  ai: {
    hintLevel: 'beginner' | 'intermediate' | 'advanced';
    apiKey?: string;
    model?: string;
    provider?: string;
  };
  github: {
    autoCommit: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface UpdateSettingsRequest {
  editor?: Partial<UserSettings['editor']>;
  ai?: Partial<UserSettings['ai']>;
  github?: Partial<UserSettings['github']>;
  notifications?: Partial<UserSettings['notifications']>;
}

// ============================================
// GitHub
// ============================================

export interface GithubConnection {
  id: string;
  githubUserId: string;
  username: string;
  repositoryName: string;
  repositoryUrl: string;
  lastSyncAt?: string;
  connectedAt: string;
}

export interface GithubCommit {
  id: string;
  submissionId: string;
  commitSha: string;
  commitUrl: string;
  commitMessage: string;
  committedAt: string;
}
