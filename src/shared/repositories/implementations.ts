/**
 * @file implementations.ts
 * @description Repository implementations - concrete API-based implementations
 * 
 * @principles
 * - SRP: ✅ Each class implements a single repository interface
 * - CQS: ✅ All methods are Commands (async, return Promises)
 * - DIP: ✅ Implements interfaces, depends on API clients (can be swapped)
 * - Composition: ✅ Composes API clients (problemsApi, submissionsApi, etc.)
 * 
 * @classes
 * - ApiProblemRepository - Implements IProblemRepository using problemsApi
 * - ApiSubmissionRepository - Implements ISubmissionRepository using submissionsApi
 * - ApiUserRepository - Implements IUserRepository using usersApi
 * - ApiAIRepository - Implements IAIRepository using aiApi
 * - ApiGitHubRepository - Implements IGitHubRepository using githubApi
 * - ApiAuthRepository - Implements IAuthRepository using authApi
 * 
 * @exports
 * - repositories - Singleton repository instances
 * - createRepositories(overrides?) - Factory for dependency injection in tests
 */

import {
  IProblemRepository,
  ISubmissionRepository,
  IUserRepository,
  IAIRepository,
  IGitHubRepository,
  IAuthRepository,
  ProblemListResult,
} from './interfaces';
import { problemsApi, GetProblemsParams } from '../api/endpoints/problems.api';
import { submissionsApi, SubmitCodePayload, SaveDraftPayload } from '../api/endpoints/submissions.api';
import { usersApi } from '../api/endpoints/users.api';
import { aiApi, SendMessagePayload } from '../api/endpoints/ai.api';
import { githubApi } from '../api/endpoints/github.api';
import { authApi } from '../api/endpoints/auth.api';
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

// ==================== Problem Repository ====================

export class ApiProblemRepository implements IProblemRepository {
  async getProblems(params?: GetProblemsParams): Promise<ProblemListResult> {
    return await problemsApi.getProblems(params);
  }

  async getProblemDetail(id: string): Promise<Problem> {
    return await problemsApi.getProblemDetail(id);
  }

  async searchProblems(query: string): Promise<ProblemListResult> {
    return await problemsApi.searchProblems(query);
  }

  async getProblemStats(): Promise<{
    totalProblems: number;
    solvedByUser: number;
    attemptedByUser: number;
    unsolvedByUser: number;
  }> {
    return await problemsApi.getProblemStats();
  }
}

// ==================== Submission Repository ====================

export class ApiSubmissionRepository implements ISubmissionRepository {
  async submitCode(problemId: string, payload: SubmitCodePayload): Promise<Submission> {
    return await submissionsApi.submitCode(problemId, payload);
  }

  async getSubmissionStatus(submissionId: string): Promise<Submission> {
    return await submissionsApi.getSubmissionStatus(submissionId);
  }

  async getSubmissionDetail(submissionId: string): Promise<Submission> {
    return await submissionsApi.getSubmissionDetail(submissionId);
  }

  async getProblemAttempts(problemId: string): Promise<Submission[]> {
    return await submissionsApi.getProblemAttempts(problemId);
  }

  async getMySubmissions(params?: { page?: number; limit?: number }): Promise<{
    items: Submission[];
    pagination: PaginationMeta;
  }> {
    return await submissionsApi.getMySubmissions(params);
  }

  async saveDraft(problemId: string, payload: SaveDraftPayload): Promise<void> {
    await submissionsApi.saveDraft(problemId, payload);
  }

  async getDraft(problemId: string): Promise<SaveDraftPayload | null> {
    return await submissionsApi.getDraft(problemId);
  }

  async deleteDraft(problemId: string): Promise<void> {
    await submissionsApi.deleteDraft(problemId);
  }
}

// ==================== User Repository ====================

export class ApiUserRepository implements IUserRepository {
  async getMyStats(): Promise<UserStats> {
    return await usersApi.getMyStats();
  }

  async getMyActivity(year?: number): Promise<UserActivity[]> {
    return await usersApi.getMyActivity(year);
  }

  async getMySettings(): Promise<UserSettings> {
    return await usersApi.getMySettings();
  }

  async updateMySettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return await usersApi.updateMySettings(settings);
  }
}

// ==================== AI Repository ====================

export class ApiAIRepository implements IAIRepository {
  async getChatHistory(problemId: string): Promise<ChatMessage[]> {
    return await aiApi.getChatHistory(problemId);
  }

  async sendChatMessage(problemId: string, payload: SendMessagePayload): Promise<ChatMessage> {
    return await aiApi.sendChatMessage(problemId, payload);
  }

  async requestCodeReview(problemId: string, code: string): Promise<ChatMessage> {
    return await aiApi.requestCodeReview(problemId, code);
  }
}

// ==================== GitHub Repository ====================

export class ApiGitHubRepository implements IGitHubRepository {
  async connectGitHub(code: string, redirectUri: string) {
    return await githubApi.connectGitHub(code, redirectUri);
  }

  async getGitHubStatus() {
    return await githubApi.getGitHubStatus();
  }

  async disconnectGitHub(): Promise<void> {
    await githubApi.disconnectGitHub();
  }

  async createCommit(submissionId: string) {
    return await githubApi.createCommit(submissionId);
  }

  async syncHistory(startDate?: string, endDate?: string) {
    return await githubApi.syncHistory(startDate, endDate);
  }
}

// ==================== Auth Repository ====================

/**
 * API-based authentication repository implementation
 * Handles OAuth login flows (Kakao, Google) via backend API
 */
export class ApiAuthRepository implements IAuthRepository {
  /**
   * Login with Kakao OAuth
   * @param code - Kakao OAuth authorization code
   */
  async loginWithKakao(code: string): Promise<AuthResponse> {
    return await authApi.loginWithKakao(code);
  }

  /**
   * Login with Google OAuth
   * @param accessToken - Google OAuth access token (for Expo Go) or authorization code (for native builds)
   */
  async loginWithGoogle(accessToken: string): Promise<AuthResponse> {
    return await authApi.loginWithGoogle(accessToken);
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return await authApi.refreshToken(refreshToken);
  }

  async logout(): Promise<void> {
    await authApi.logout();
  }
}

// ==================== Repository Factory ====================

/**
 * Repository instances (singletons)
 * Can be easily swapped for testing or different implementations
 */
export const repositories = {
  problem: new ApiProblemRepository(),
  submission: new ApiSubmissionRepository(),
  user: new ApiUserRepository(),
  ai: new ApiAIRepository(),
  github: new ApiGitHubRepository(),
  auth: new ApiAuthRepository(),
} as const;

/**
 * For dependency injection in tests
 */
export function createRepositories(overrides?: Partial<typeof repositories>) {
  return {
    ...repositories,
    ...overrides,
  };
}
