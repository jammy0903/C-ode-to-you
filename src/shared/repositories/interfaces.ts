/**
 * @file interfaces.ts
 * @description Repository interfaces - domain-driven data access abstractions
 * 
 * @principles
 * - SRP: ✅ Each interface represents a single domain (Problem, Submission, User, AI, GitHub, Auth)
 * - CQS: ✅ All methods are Commands (async, mutate state) - return Promises
 * - DIP: ✅ Defines abstractions that implementations must follow
 * - Composition: ✅ Interfaces are composable (can be combined in stores)
 * 
 * @interfaces
 * - IProblemRepository - Problem data access (getProblems, getProblemDetail, searchProblems, getProblemStats)
 * - ISubmissionRepository - Submission data access (submitCode, getSubmissionStatus, saveDraft, etc.)
 * - IUserRepository - User data access (getMyStats, getMyActivity, getMySettings, updateMySettings)
 * - IAIRepository - AI chat data access (getChatHistory, sendChatMessage, requestCodeReview)
 * - IGitHubRepository - GitHub integration (connectGitHub, getGitHubStatus, createCommit, syncHistory)
 * - IAuthRepository - Authentication (loginWithKakao(code), loginWithGoogle(accessToken), refreshToken, logout)
 * 
 * @types
 * - ProblemListResult - Paginated problem list result
 * - GitHubRepository - GitHub repository info
 * - GitHubCommit - GitHub commit info
 */

import {
  Problem,
  PaginationMeta,
  Submission,
  UserStats,
  UserActivity,
  UserSettings,
  ChatMessage,
  AuthResponse,
} from '../types/api.types';
import { GetProblemsParams } from '../api/endpoints/problems.api';
import { SubmitCodePayload, SaveDraftPayload } from '../api/endpoints/submissions.api';
import { SendMessagePayload } from '../api/endpoints/ai.api';

// ==================== Problem Repository ====================

export interface ProblemListResult {
  items: Problem[];
  pagination: PaginationMeta;
}

export interface IProblemRepository {
  /**
   * Get paginated list of problems
   */
  getProblems(params?: GetProblemsParams): Promise<ProblemListResult>;

  /**
   * Get single problem detail
   */
  getProblemDetail(id: string): Promise<Problem>;

  /**
   * Search problems by query
   */
  searchProblems(query: string): Promise<ProblemListResult>;

  /**
   * Get problem statistics
   */
  getProblemStats(): Promise<{
    totalProblems: number;
    solvedByUser: number;
    attemptedByUser: number;
    unsolvedByUser: number;
  }>;
}

// ==================== Submission Repository ====================

export interface ISubmissionRepository {
  /**
   * Submit code for a problem
   */
  submitCode(problemId: string, payload: SubmitCodePayload): Promise<Submission>;

  /**
   * Get submission status (for polling)
   */
  getSubmissionStatus(submissionId: string): Promise<Submission>;

  /**
   * Get submission detail
   */
  getSubmissionDetail(submissionId: string): Promise<Submission>;

  /**
   * Get all attempts for a problem
   */
  getProblemAttempts(problemId: string): Promise<Submission[]>;

  /**
   * Get user's submission history
   */
  getMySubmissions(params?: { page?: number; limit?: number }): Promise<{
    items: Submission[];
    pagination: PaginationMeta;
  }>;

  /**
   * Save draft code
   */
  saveDraft(problemId: string, payload: SaveDraftPayload): Promise<void>;

  /**
   * Get draft code (returns null if not found)
   */
  getDraft(problemId: string): Promise<SaveDraftPayload | null>;

  /**
   * Delete draft
   */
  deleteDraft(problemId: string): Promise<void>;
}

// ==================== User Repository ====================

export interface IUserRepository {
  /**
   * Get current user's statistics
   */
  getMyStats(): Promise<UserStats>;

  /**
   * Get user activity (streak data)
   */
  getMyActivity(year?: number): Promise<UserActivity[]>;

  /**
   * Get user settings
   */
  getMySettings(): Promise<UserSettings>;

  /**
   * Update user settings
   */
  updateMySettings(settings: Partial<UserSettings>): Promise<UserSettings>;
}

// ==================== AI Repository ====================

export interface IAIRepository {
  /**
   * Get chat history for a problem
   */
  getChatHistory(problemId: string): Promise<ChatMessage[]>;

  /**
   * Send chat message
   */
  sendChatMessage(problemId: string, payload: SendMessagePayload): Promise<ChatMessage>;

  /**
   * Request code review
   */
  requestCodeReview(problemId: string, code: string): Promise<ChatMessage>;
}

// ==================== GitHub Repository ====================

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  html_url: string;
}

export interface IGitHubRepository {
  /**
   * Connect GitHub account
   */
  connectGitHub(code: string, redirectUri: string): Promise<{
    success: boolean;
    repository?: GitHubRepository;
    message: string;
  }>;

  /**
   * Get GitHub connection status
   */
  getGitHubStatus(): Promise<{
    connected: boolean;
    repository?: GitHubRepository;
    lastSync?: string;
  }>;

  /**
   * Disconnect GitHub
   */
  disconnectGitHub(): Promise<void>;

  /**
   * Create commit for submission
   */
  createCommit(submissionId: string): Promise<{
    success: boolean;
    commit?: GitHubCommit;
    message: string;
  }>;

  /**
   * Sync submission history to GitHub
   */
  syncHistory(startDate?: string, endDate?: string): Promise<{
    success: boolean;
    syncedCount: number;
    commits: GitHubCommit[];
  }>;
}

// ==================== Auth Repository ====================

export interface IAuthRepository {
  /**
   * Login with Kakao
   */
  loginWithKakao(code: string): Promise<AuthResponse>;

  /**
   * Login with Google
   * @param idToken - Google OAuth ID token (JWT from Google Sign-In)
   */
  loginWithGoogle(idToken: string): Promise<AuthResponse>;

  /**
   * Refresh access token
   */
  refreshToken(refreshToken: string): Promise<{ token: string }>;

  /**
   * Logout
   */
  logout(): Promise<void>;
}
