/**
 * GitHub Integration Types
 */

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

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

/**
 * Request/Response Types
 */

export interface ConnectGitHubRequest {
  code: string;
  redirectUri: string;
}

export interface ConnectGitHubResponse {
  success: boolean;
  repository?: GitHubRepository;
  message: string;
}

export interface GitHubStatusResponse {
  connected: boolean;
  repository?: GitHubRepository;
  lastSync?: string;
}

export interface CreateCommitRequest {
  submissionId: string;
}

export interface CreateCommitResponse {
  success: boolean;
  commit?: GitHubCommit;
  message: string;
}

export interface SyncHistoryRequest {
  startDate?: string;
  endDate?: string;
}

export interface SyncHistoryResponse {
  success: boolean;
  syncedCount: number;
  commits: GitHubCommit[];
}
