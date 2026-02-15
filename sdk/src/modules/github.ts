import { HttpClient } from '../utils/http';
import { GithubConnection, GithubCommit } from '../types';

export class GithubModule {
  constructor(private http: HttpClient) {}

  /**
   * Get current GitHub connection status
   */
  async getConnection(): Promise<GithubConnection | null> {
    return this.http.get<GithubConnection | null>('/api/github/status');
  }

  /**
   * Connect GitHub account (initiate OAuth flow)
   */
  async connect(): Promise<{ authUrl: string }> {
    return this.http.get<{ authUrl: string }>('/api/github/connect');
  }

  /**
   * Disconnect GitHub account
   */
  async disconnect(): Promise<void> {
    await this.http.delete('/api/github/disconnect');
  }

  /**
   * Get GitHub commit history
   */
  async getCommits(): Promise<GithubCommit[]> {
    return this.http.get<GithubCommit[]>('/api/github/commits');
  }
}
