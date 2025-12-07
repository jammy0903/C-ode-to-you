/**
 * @file solvedac.service.ts
 * @description solved.ac API client service
 *
 * @principles
 * - SRP: ✅ Single responsibility - solved.ac API integration only
 * - Rate Limit: 15분당 256회 준수
 * - Error Handling: API 에러를 AppError로 변환
 *
 * @apiReference
 * - Base URL: https://solved.ac/api/v3
 * - Rate Limit: 256 requests per 15 minutes
 * - CORS: Backend only (not accessible from browser)
 *
 * @endpoints
 * - GET /problem/show?problemId={id} - Problem detail
 * - GET /search/problem?query={query}&page={page} - Search problems
 */

import axios, { AxiosInstance } from 'axios';
import {
  SolvedacProblem,
  SolvedacSearchResult,
  TierQuery,
  DifficultyTier,
  TierName,
  TierLevel,
} from './solvedac.types';
import logger from '../../utils/logger';
import { AppError } from '../../types/common.types';

export class SolvedacService {
  private readonly client: AxiosInstance;
  private readonly BASE_URL = 'https://solved.ac/api/v3';

  constructor() {
    this.client = axios.create({
      baseURL: this.BASE_URL,
      timeout: 10000, // 10 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('Solved.ac API error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });

        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          throw new AppError(
            'solved.ac API에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
            503,
            'SOLVEDAC_UNAVAILABLE'
          );
        }

        if (error.response?.status === 429) {
          throw new AppError(
            'API 요청 한도를 초과했습니다. 15분 후 다시 시도해주세요.',
            429,
            'RATE_LIMIT_EXCEEDED'
          );
        }

        if (error.response?.status === 404) {
          throw new AppError(
            '문제를 찾을 수 없습니다.',
            404,
            'PROBLEM_NOT_FOUND'
          );
        }

        throw new AppError(
          'solved.ac API 요청 중 오류가 발생했습니다.',
          500,
          'SOLVEDAC_API_ERROR'
        );
      }
    );
  }

  /**
   * Get problem detail by problemId
   *
   * @param problemId Baekjoon problem number
   * @returns Problem detail with tags, level, stats
   *
   * @example
   * const problem = await solvedacService.getProblem(1000);
   * console.log(problem.titleKo); // "A+B"
   * console.log(problem.level); // 1 (bronze_5)
   */
  async getProblem(problemId: number): Promise<SolvedacProblem> {
    try {
      const response = await this.client.get<SolvedacProblem>('/problem/show', {
        params: { problemId },
      });

      logger.info(`Fetched problem ${problemId}: ${response.data.titleKo}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch problem ${problemId}:`, error);
      throw error;
    }
  }

  /**
   * Search problems with query and pagination
   *
   * @param query Search query (tier, tag, title, etc.)
   * @param page Page number (default: 1, 40 items per page)
   * @returns Search result with count and items
   *
   * @example
   * // Search Bronze 5 problems
   * const result = await solvedacService.searchProblems('tier:b5', 1);
   * console.log(result.count); // Total count
   * console.log(result.items.length); // 40 (or less)
   *
   * // Search by tag
   * const result = await solvedacService.searchProblems('tag:implementation', 1);
   */
  async searchProblems(query: string, page: number = 1): Promise<SolvedacSearchResult> {
    try {
      const response = await this.client.get<SolvedacSearchResult>('/search/problem', {
        params: { query, page },
      });

      logger.info(`Search "${query}" page ${page}: ${response.data.count} total, ${response.data.items.length} items`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to search problems with query "${query}":`, error);
      throw error;
    }
  }

  /**
   * Get problems by tier (difficulty level)
   *
   * @param tier Tier query string ('b5', 's1', 'g3', etc.)
   * @param page Page number (default: 1)
   * @returns Search result filtered by tier
   *
   * @example
   * const problems = await solvedacService.getProblemsByTier('b5', 1);
   */
  async getProblemsByTier(tier: TierQuery, page: number = 1): Promise<SolvedacSearchResult> {
    const query = `tier:${tier}`;
    return this.searchProblems(query, page);
  }

  /**
   * Get problems by tag
   *
   * @param tag Tag key (e.g., 'implementation', 'math', 'dp')
   * @param page Page number (default: 1)
   * @returns Search result filtered by tag
   *
   * @example
   * const problems = await solvedacService.getProblemsByTag('math', 1);
   */
  async getProblemsByTag(tag: string, page: number = 1): Promise<SolvedacSearchResult> {
    const query = `tag:${tag}`;
    return this.searchProblems(query, page);
  }

  /**
   * Convert solved.ac level (1-30) to difficulty tier string
   *
   * @param level solved.ac level (1-30, 0 for unrated)
   * @returns Difficulty tier string (e.g., 'bronze_5', 'silver_1')
   *
   * @example
   * levelToTier(1)  // 'bronze_5'
   * levelToTier(5)  // 'bronze_1'
   * levelToTier(6)  // 'silver_5'
   * levelToTier(10) // 'silver_1'
   * levelToTier(0)  // 'unrated'
   */
  static levelToTier(level: number): DifficultyTier {
    if (level === 0) return 'unrated';

    const tiers: TierName[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'ruby'];
    const tierIndex = Math.floor((level - 1) / 5);
    const subLevel = (5 - ((level - 1) % 5)).toString() as TierLevel;

    return `${tiers[tierIndex]}_${subLevel}`;
  }

  /**
   * Convert difficulty tier string to solved.ac level
   *
   * @param tier Difficulty tier string (e.g., 'bronze_5', 'silver_1')
   * @returns solved.ac level (1-30, 0 for unrated)
   *
   * @example
   * tierToLevel('bronze_5')  // 1
   * tierToLevel('bronze_1')  // 5
   * tierToLevel('silver_5')  // 6
   * tierToLevel('unrated')   // 0
   */
  static tierToLevel(tier: DifficultyTier): number {
    if (tier === 'unrated') return 0;

    const [tierName, tierLevel] = tier.split('_') as [TierName, TierLevel];
    const tiers: TierName[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'ruby'];
    const tierIndex = tiers.indexOf(tierName);

    if (tierIndex === -1) {
      throw new Error(`Invalid tier name: ${tierName}`);
    }

    const level = tierIndex * 5 + (6 - parseInt(tierLevel));
    return level;
  }

  /**
   * Generate Baekjoon problem URL
   *
   * @param problemNumber Baekjoon problem number
   * @returns Baekjoon problem URL
   *
   * @example
   * getBaekjoonUrl(1000) // 'https://www.acmicpc.net/problem/1000'
   */
  static getBaekjoonUrl(problemNumber: number): string {
    return `https://www.acmicpc.net/problem/${problemNumber}`;
  }
}
