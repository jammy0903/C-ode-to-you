import { apiClient } from '../client';

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

export interface GitHubStatusResponse {
  connected: boolean;
  repository?: GitHubRepository;
  lastSync?: string;
}

export interface ConnectGitHubResponse {
  success: boolean;
  repository?: GitHubRepository;
  message: string;
}

export interface CreateCommitResponse {
  success: boolean;
  commit?: GitHubCommit;
  message: string;
}

export interface SyncHistoryResponse {
  success: boolean;
  syncedCount: number;
  commits: GitHubCommit[];
}

/**
 * GitHub API endpoints
 * Refactored to use ApiClient for consistent response handling
 */
export const githubApi = {
  /**
   * Connect GitHub
   * POST /api/github/connect
   */
  connectGitHub: async (code: string, redirectUri: string): Promise<ConnectGitHubResponse> => {
    return apiClient.post<ConnectGitHubResponse>('/github/connect', { code, redirectUri });
  },

  /**
   * Get GitHub Status
   * GET /api/github/status
   */
  getGitHubStatus: async (): Promise<GitHubStatusResponse> => {
    return apiClient.get<GitHubStatusResponse>('/github/status');
  },

  /**
   * Disconnect GitHub
   * DELETE /api/github/disconnect
   */
  disconnectGitHub: async (): Promise<void> => {
    await apiClient.delete<void>('/github/disconnect');
  },

  /**
   * Create Commit
   * POST /api/github/commit
   */
  createCommit: async (submissionId: string): Promise<CreateCommitResponse> => {
    return apiClient.post<CreateCommitResponse>('/github/commit', { submissionId });
  },

  /**
   * Sync History
   * POST /api/github/sync
   */
  syncHistory: async (startDate?: string, endDate?: string): Promise<SyncHistoryResponse> => {
    return apiClient.post<SyncHistoryResponse>('/github/sync', { startDate, endDate });
  },
};

