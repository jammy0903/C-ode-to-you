/**
 * @file github.service.ts
 * @description GitHub integration service for automatic code commits
 *
 * @principles
 * - SRP: ✅ Handles only GitHub integration (OAuth, repository management, commits)
 * - DIP: ⚠️ Directly instantiates ProblemRepository
 * - Idempotency: Upsert operations for connections, file updates
 *
 * @functions
 * - connectGitHub(userId, code, redirectUri): Promise<ConnectGitHubResponse> - Connect GitHub account via OAuth
 * - getStatus(userId): Promise<GitHubStatusResponse> - Get GitHub connection status
 * - disconnectGitHub(userId): Promise<void> - Disconnect GitHub account
 * - createCommit(userId, submissionId): Promise<CreateCommitResponse> - Create commit with solution code
 * - syncHistory(userId, startDate?, endDate?): Promise<SyncHistoryResponse> - Sync accepted submissions to GitHub
 * - exchangeCodeForToken(code, redirectUri): Promise<string> - Exchange OAuth code for access token (private)
 * - getGitHubUser(accessToken): Promise<GitHubUser> - Fetch GitHub user info (private)
 * - ensureRepository(accessToken, repoName?): Promise<GitHubRepository> - Create or get repository (private)
 *
 * @dependencies
 * - Prisma: GitHubConnection and Submission persistence
 * - ProblemRepository: Problem lookup (not used in current code - potential cleanup)
 * - GitHub REST API v3
 *
 * @gitHubFlow
 * 1. OAuth: code → access_token → user info → save connection
 * 2. Commit: submission → problem info → create/update file → track commit
 * 3. Sync: fetch accepted submissions → create commits in sequence
 *
 * @fileStructure
 * - Repository: {username}/baekjoon-solutions
 * - File path: problems/{number}-{title}.c
 * - Commit message: "Solved: [BOJ #{number}] {title}"
 *
 * @duplicateLogic
 * - ✅ No significant duplication - well-structured with private helpers
 */

import axios from 'axios';
import { prisma } from '../../config/database';
import { ProblemRepository } from '../../database/repositories/problem.repository';
import { ApiError } from '../../utils/response';
import logger from '../../utils/logger';
import {
  GitHubUser,
  GitHubRepository,
  GitHubCommit,
  ConnectGitHubResponse,
  GitHubStatusResponse,
  CreateCommitResponse,
  SyncHistoryResponse,
} from './github.types';

export class GitHubService {
  private readonly GITHUB_API_URL = 'https://api.github.com';
  private readonly GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  private readonly GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  private problemRepo: ProblemRepository;

  constructor() {
    this.problemRepo = new ProblemRepository();
  }

  /**
   * Exchange code for access token
   */
  private async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: this.GITHUB_CLIENT_ID,
          client_secret: this.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error_description || response.data.error);
      }

      return response.data.access_token;
    } catch (error: any) {
      logger.error('GitHub token exchange error:', error.message);
      throw new ApiError('Failed to authenticate with GitHub', 401);
    }
  }

  /**
   * Get GitHub user info
   */
  private async getGitHubUser(accessToken: string): Promise<GitHubUser> {
    try {
      const response = await axios.get<GitHubUser>(`${this.GITHUB_API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      return response.data;
    } catch (error: any) {
      logger.error('GitHub user fetch error:', error.message);
      throw new ApiError('Failed to fetch GitHub user', 500);
    }
  }

  /**
   * Create or get repository
   */
  private async ensureRepository(
    accessToken: string,
    repoName: string = 'baekjoon-solutions'
  ): Promise<GitHubRepository> {
    try {
      // Try to get existing repository
      const user = await this.getGitHubUser(accessToken);
      const fullRepoName = `${user.login}/${repoName}`;

      try {
        const response = await axios.get<GitHubRepository>(
          `${this.GITHUB_API_URL}/repos/${fullRepoName}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );
        return response.data;
      } catch (error: any) {
        if (error.response?.status !== 404) {
          throw error;
        }
      }

      // Create new repository
      const response = await axios.post<GitHubRepository>(
        `${this.GITHUB_API_URL}/user/repos`,
        {
          name: repoName,
          description: 'Baekjoon problem solutions (C language)',
          private: false,
          auto_init: true,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('GitHub repository creation error:', error.message);
      throw new ApiError('Failed to create GitHub repository', 500);
    }
  }

  /**
   * Connect GitHub account
   */
  async connectGitHub(
    userId: string,
    code: string,
    redirectUri: string
  ): Promise<ConnectGitHubResponse> {
    try {
      // Exchange code for token
      const accessToken = await this.exchangeCodeForToken(code, redirectUri);

      // Get user info
      const githubUser = await this.getGitHubUser(accessToken);

      // Ensure repository exists
      const repository = await this.ensureRepository(accessToken);

      // Save GitHub connection
      await prisma.githubConnection.upsert({
        where: {
          userId,
        },
        update: {
          githubUserId: githubUser.id.toString(),
          username: githubUser.login,
          accessToken,
          repositoryName: repository.name,
          repositoryUrl: repository.html_url,
        },
        create: {
          userId,
          githubUserId: githubUser.id.toString(),
          username: githubUser.login,
          accessToken,
          repositoryName: repository.name,
          repositoryUrl: repository.html_url,
        },
      });

      logger.info(`GitHub connected for user ${userId}: ${githubUser.login}`);

      return {
        success: true,
        repository,
        message: 'GitHub account connected successfully',
      };
    } catch (error: any) {
      logger.error('GitHub connection error:', error.message);
      throw error;
    }
  }

  /**
   * Get GitHub connection status
   */
  async getStatus(userId: string): Promise<GitHubStatusResponse> {
    const integration = await prisma.githubConnection.findUnique({
      where: { userId },
    });

    if (!integration) {
      return {
        connected: false,
      };
    }

    return {
      connected: true,
      repository: {
        id: 0,
        name: integration.repositoryName,
        full_name: `${integration.username}/${integration.repositoryName}`,
        private: false,
        html_url: integration.repositoryUrl,
        description: 'Baekjoon problem solutions',
      },
      lastSync: integration.lastSyncAt?.toISOString(),
    };
  }

  /**
   * Disconnect GitHub account
   */
  async disconnectGitHub(userId: string): Promise<void> {
    await prisma.githubConnection.delete({
      where: { userId },
    });

    logger.info(`GitHub disconnected for user ${userId}`);
  }

  /**
   * Create commit with solution
   */
  async createCommit(
    userId: string,
    submissionId: string
  ): Promise<CreateCommitResponse> {
    // Get GitHub integration
    const integration = await prisma.githubConnection.findUnique({
      where: { userId },
    });

    if (!integration) {
      throw new ApiError('GitHub not connected', 400);
    }

    // Get submission details
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        problem: true,
      },
    });

    if (!submission) {
      throw new ApiError('Submission not found', 404);
    }

    if (submission.userId !== userId) {
      throw new ApiError('Unauthorized', 403);
    }

    const problem = submission.problem;
    const code = submission.code;

    try {
      // Create file path: problems/{number}-{title}.c
      const fileName = `${problem.number}-${problem.title.replace(/\s+/g, '-')}.c`;
      const filePath = `problems/${fileName}`;

      // Commit message
      const message = `Solved: [BOJ #${problem.number}] ${problem.title}`;

      // Get current file SHA if exists
      let currentSha: string | undefined;
      try {
        const getFileResponse = await axios.get(
          `${this.GITHUB_API_URL}/repos/${integration.username}/${integration.repositoryName}/contents/${filePath}`,
          {
            headers: {
              Authorization: `Bearer ${integration.accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );
        currentSha = getFileResponse.data.sha;
      } catch (error: any) {
        // File doesn't exist, which is fine
        if (error.response?.status !== 404) {
          throw error;
        }
      }

      // Create or update file
      const content = Buffer.from(code).toString('base64');
      const response = await axios.put(
        `${this.GITHUB_API_URL}/repos/${integration.username}/${integration.repositoryName}/contents/${filePath}`,
        {
          message,
          content,
          sha: currentSha,
        },
        {
          headers: {
            Authorization: `Bearer ${integration.accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      const commit: GitHubCommit = {
        sha: response.data.commit.sha,
        message: response.data.commit.message,
        author: response.data.commit.author,
        html_url: response.data.commit.html_url,
      };

      // Update last sync time
      await prisma.githubConnection.update({
        where: { userId },
        data: { lastSyncAt: new Date() },
      });

      logger.info(
        `Created GitHub commit for user ${userId}: ${problem.number} - ${problem.title}`
      );

      return {
        success: true,
        commit,
        message: 'Code committed to GitHub successfully',
      };
    } catch (error: any) {
      logger.error('GitHub commit error:', error.message);
      throw new ApiError('Failed to create GitHub commit', 500);
    }
  }

  /**
   * Sync submission history to GitHub
   */
  async syncHistory(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SyncHistoryResponse> {
    // Get GitHub integration
    const integration = await prisma.githubConnection.findUnique({
      where: { userId },
    });

    if (!integration) {
      throw new ApiError('GitHub not connected', 400);
    }

    // Get accepted submissions
    const submissions = await prisma.submission.findMany({
      where: {
        userId,
        status: 'accepted',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        problem: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const commits: GitHubCommit[] = [];

    for (const submission of submissions) {
      try {
        const result = await this.createCommit(
          userId,
          submission.id
        );

        if (result.commit) {
          commits.push(result.commit);
        }
      } catch (error: any) {
        logger.error(
          `Failed to sync submission ${submission.id}: ${error.message}`
        );
        // Continue with other submissions
      }
    }

    logger.info(
      `Synced ${commits.length} submissions to GitHub for user ${userId}`
    );

    return {
      success: true,
      syncedCount: commits.length,
      commits,
    };
  }
}
